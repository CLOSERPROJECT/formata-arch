<script lang="ts">
	import {
		ArrowDown,
		ArrowRight,
		ArrowUp,
		ChevronDown,
		ChevronRight,
		FolderPlusIcon,
		Plus
	} from '@lucide/svelte';
	import { flip } from 'svelte/animate';

	import type { Tree } from './tree.svelte.js';
	import type { Node, Path } from './types.js';

	import TreeButton from './tree-button.svelte';

	interface Props {
		self: Tree;
		showIndices?: boolean;
	}

	let { self, showIndices = false }: Props = $props();

	function pathIndexLabel(path: Path): string {
		return path.map((i) => i + 1).join('.');
	}

	function pathKey(path: Path): string {
		return path.join(',');
	}

	/** Expansion key stable across moves (node identity, not position). */
	function expandKey(path: Path, node: Node): string | null {
		return node.type === 'branch' ? (node.key ?? pathKey(path)) : null;
	}

	function toggleExpanded(key: string, path: Path) {
		if (self.expanded.has(key)) {
			self.expanded.delete(key);
		} else {
			self.expanded.add(key);
			self.select(path, 'branch');
		}
	}

	function isExpandedByKey(key: string): boolean {
		return self.expanded.has(key);
	}

	function pathEquals(a: Path, b: Path): boolean {
		return a.length === b.length && a.every((v, i) => v === b[i]);
	}

	function isSelected(path: Path, type: 'branch' | 'leaf'): boolean {
		const s = self.selection;
		return s.state === 'selected' && pathEquals(s.path, path) && s.type === type;
	}

	function renderRow(depth: number, path: Path, node: Node) {
		const type = node.type;
		const isBranch = type === 'branch';
		// Add branch = sibling at same depth; add leaf = child at depth+1
		const showAddBranch = isBranch && self.showAddBranchAtDepth(depth + 1);
		const showAddLeaf = isBranch && self.showAddLeafAtDepth(depth + 1);
		const selected = isSelected(path, type);
		const adding = false;
		const canUp = self.canMoveUp(path);
		const canDown = self.canMoveDown(path);
		return {
			depth,
			path,
			node,
			rowKey: node.key ?? pathKey(path),
			expandKey: expandKey(path, node),
			isBranch,
			showAddBranch,
			showAddLeaf,
			selected,
			adding,
			canUp,
			canDown
		};
	}

	const rows = $derived.by(() => {
		const structure = self.structure;
		const out: ReturnType<typeof renderRow>[] = [];
		function walk(nodes: Node[], depth: number, pathPrefix: Path) {
			nodes.forEach((node, i) => {
				const path = [...pathPrefix, i];
				const row = renderRow(depth, path, node);
				out.push(row);
				if (node.type === 'branch' && self.expanded.has(node.key ?? pathKey(path))) {
					walk(node.children, depth + 1, path);
				}
			});
			if (self.selection.state === 'adding' && pathEquals(self.selection.path, pathPrefix)) {
				out.push({
					depth,
					path: pathPrefix,
					node: { type: 'leaf', label: 'New step', key: crypto.randomUUID() },
					rowKey: pathKey(pathPrefix) + crypto.randomUUID(),
					expandKey: null,
					isBranch: false,
					showAddBranch: false,
					showAddLeaf: false,
					selected: false,
					adding: true,
					canUp: false,
					canDown: false
				});
			}
		}
		walk(structure, 0, []);
		return out;
	});
</script>

<div class="flex grow flex-col gap-1 text-sm">
	{#each rows as row (row.rowKey)}
		{@const {
			depth,
			path,
			node,
			isBranch,
			showAddBranch,
			showAddLeaf,
			selected,
			adding,
			canUp,
			canDown,
			expandKey
		} = row}
		<div
			role="button"
			tabindex="0"
			class={[
				'flex min-h-8 items-center gap-1 rounded-sm p-1 transition-colors',
				'ring-primary',
				!selected && !adding && 'hover:ring-1',
				selected && 'ring-2',
				adding && 'bg-blue-100 text-blue-600',
				'group hover:cursor-pointer'
			]}
			style="padding-left: {depth * 1.25 + 0.25}rem"
			animate:flip={{ duration: 500 }}
			onclick={() => self.select(path, node.type)}
			onkeydown={(e) => e.key === 'Enter' && self.select(path, node.type)}
		>
			<!-- Chevron (branch only) -->
			{#if isBranch && expandKey}
				<TreeButton
					onclick={() => toggleExpanded(expandKey, path)}
					icon={isExpandedByKey(expandKey) ? ChevronDown : ChevronRight}
					aria-label={isExpandedByKey(expandKey) ? 'Collapse' : 'Expand'}
				/>
			{:else}
				<span class="w-5 shrink-0" aria-hidden="true"></span>
			{/if}

			{#if adding}
				<div class="flex size-[24px] items-center justify-center">
					<ArrowRight class="size-3.5" />
				</div>
			{/if}

			<!-- Icon + label -->
			<span class="flex shrink-0 items-center gap-1.5">
				{#if showIndices && !adding}
					<span class="text-muted-foreground shrink-0 tabular-nums">{pathIndexLabel(path)}</span>
				{/if}
				<span>{node.label}</span>
			</span>

			<!-- Spacer -->
			<span class="min-w-2 flex-1"></span>

			<!-- Actions: move, delete, add (branch only for add) -->
			<div class="flex shrink-0 items-center gap-0.5">
				{#if canUp}
					<TreeButton
						onclick={() => self.handleMoveUp(path)}
						icon={ArrowUp}
						aria-label="Move up"
						class="invisible group-hover:visible"
					/>
				{/if}
				{#if canDown}
					<TreeButton
						onclick={() => self.handleMoveDown(path)}
						aria-label="Move down"
						icon={ArrowDown}
						class="invisible group-hover:visible"
					/>
				{/if}

				<!-- <TreeButton onclick={() => self.handleDelete(path)} icon={Trash2} aria-label="Delete" /> -->

				{#if isBranch}
					{#if showAddBranch}
						<TreeButton
							onclick={() => self.handleAddBranch(path)}
							icon={FolderPlusIcon}
							aria-label="Add step"
							class="text-blue-600 hover:bg-blue-50"
						/>
					{/if}
					{#if showAddLeaf}
						<TreeButton
							onclick={() => self.handleAddLeaf(path)}
							icon={Plus}
							aria-label="Add substep"
							class="text-blue-600 hover:bg-blue-50"
						/>
					{/if}
				{/if}
			</div>
		</div>
	{/each}

	<!-- Add branch at root (depth 0) -->
	{#if self.showAddBranchAtDepth(0)}
		{#if self.selection.state == 'adding' && pathEquals(self.selection.path, [-1])}
			<div
				class={[
					'flex min-h-8 items-center gap-1 rounded-sm p-1 transition-colors',
					'bg-blue-50 text-blue-600'
				]}
			>
				<div class="flex size-[24px] items-center justify-center">
					<ArrowRight class="size-3.5" />
				</div>
				New step
			</div>
		{:else}
			<button
				tabindex="0"
				class={[
					'flex min-h-8 items-center gap-1 rounded-sm p-1 transition-colors',
					'text-blue-600 hover:bg-blue-50'
				]}
				onclick={() => self.handleAddBranch(self.structure.length > 0 ? [-1] : [])}
			>
				<div class="flex size-[24px] items-center justify-center">
					<Plus class="size-3.5" />
				</div>
				Add step
			</button>
		{/if}
	{/if}
</div>
