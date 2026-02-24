<script lang="ts">
	import {
		ArrowDown,
		ArrowUp,
		ChevronDown,
		ChevronRight,
		Folder,
		FolderPlusIcon,
		Plus
	} from '@lucide/svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import { flip } from 'svelte/animate';

	import type { Tree } from './tree.svelte.js';
	import type { Node, Path } from './types.js';

	import TreeButton from './tree-button.svelte';

	interface Props {
		self: Tree;
	}

	let { self }: Props = $props();

	let expanded = $state<Set<string>>(new Set());

	function pathKey(path: Path): string {
		return path.join(',');
	}

	/** Expansion key stable across moves (node identity, not position). */
	function expandKey(path: Path, node: Node): string | null {
		return node.type === 'branch' ? (node.key ?? pathKey(path)) : null;
	}

	function toggleExpanded(key: string) {
		const next = new Set(expanded);
		if (next.has(key)) next.delete(key);
		else next.add(key);
		expanded = next;
	}

	function isExpandedByKey(key: string): boolean {
		return expanded.has(key);
	}

	function pathEquals(a: Path, b: Path): boolean {
		return a.length === b.length && a.every((v, i) => v === b[i]);
	}

	function isSelected(path: Path, type: 'branch' | 'leaf'): boolean {
		const s = self.selection;
		return s.state === 'selected' && pathEquals(s.path, path) && s.type === type;
	}

	function isAddingAt(path: Path): boolean {
		const s = self.selection;
		return s.state === 'adding' && pathEquals(s.path, path);
	}

	function renderRow(depth: number, path: Path, node: Node) {
		const type = node.type;
		const isBranch = type === 'branch';
		// Add branch = sibling at same depth; add leaf = child at depth+1
		const showAddBranch = isBranch && self.showAddBranchAtDepth(depth + 1);
		const showAddLeaf = isBranch && self.showAddLeafAtDepth(depth + 1);
		const selected = isSelected(path, type);
		const adding = isAddingAt(path);
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
				if (node.type === 'branch' && expanded.has(node.key ?? pathKey(path))) {
					walk(node.children, depth + 1, path);
				}
			});
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
				'flex min-h-8 items-center gap-1 rounded-sm px-1 transition-colors',
				'ring-primary',
				!selected && !adding && 'hover:ring-1',
				selected && 'ring-2',
				adding && 'ring-2 ring-blue-600!'
			]}
			style="padding-left: {depth * 1.25 + 0.25}rem"
			animate:flip={{ duration: 500 }}
			onclick={() => self.select(path, node.type)}
			onkeydown={(e) => e.key === 'Enter' && self.select(path, node.type)}
		>
			<!-- Chevron (branch only) -->
			{#if isBranch && expandKey}
				<TreeButton
					onclick={() => toggleExpanded(expandKey)}
					icon={isExpandedByKey(expandKey) ? ChevronDown : ChevronRight}
					aria-label={isExpandedByKey(expandKey) ? 'Collapse' : 'Expand'}
				/>
			{:else}
				<span class="w-5 shrink-0" aria-hidden="true"></span>
			{/if}

			<!-- Icon + label -->
			<span class="flex shrink-0 items-center gap-1.5">
				<span>{node.label}</span>
			</span>

			<!-- Spacer -->
			<span class="min-w-2 flex-1"></span>

			<!-- Actions: move, delete, add (branch only for add) -->
			<div class="flex shrink-0 items-center gap-0.5">
				<TreeButton
					onclick={() => self.handleMoveUp(path)}
					icon={ArrowUp}
					aria-label="Move up"
					disabled={!canUp}
				/>
				<TreeButton
					onclick={() => self.handleMoveDown(path)}
					aria-label="Move down"
					icon={ArrowDown}
					disabled={!canDown}
				/>

				<!-- <TreeButton onclick={() => self.handleDelete(path)} icon={Trash2} aria-label="Delete" /> -->

				{#if isBranch}
					{#if showAddBranch}
						<TreeButton
							onclick={() => self.handleAddBranch(path)}
							icon={FolderPlusIcon}
							aria-label="Add step"
						/>
					{/if}
					{#if showAddLeaf}
						<TreeButton
							onclick={() => self.handleAddLeaf(path)}
							icon={Plus}
							aria-label="Add substep"
						/>
					{/if}
				{/if}
			</div>
		</div>
	{/each}

	<!-- Add branch at root (depth 0) -->
	{#if self.showAddBranchAtDepth(0)}
		<div class="flex min-h-8 items-center rounded-sm px-1" style="padding-left: 0.25rem">
			<span class="w-5 shrink-0" aria-hidden="true"></span>
			<Button
				variant="ghost"
				size="sm"
				class="h-8 gap-1.5 text-muted-foreground hover:text-foreground"
				onclick={() => self.handleAddBranch(self.structure.length > 0 ? [-1] : [])}
			>
				<Folder class="size-4" />
				<Plus class="size-3.5" />
				Add step
			</Button>
		</div>
	{/if}
</div>
