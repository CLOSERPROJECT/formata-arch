<script lang="ts">
	import { ChevronDown, ChevronRight, File, Folder, ArrowUp, ArrowDown, Plus, Trash2 } from '@lucide/svelte';
	import { flip } from 'svelte/animate';
	import { Button } from '$lib/components/ui/button/index.js';
	import { cn } from '$lib/utils.js';
	import type { Node, Path } from './types.js';
	import type { Tree } from './tree.svelte.js';

	interface Props {
		self: Tree;
	}

	let { self }: Props = $props();

	let expanded = $state<Set<string>>(new Set());

	function pathKey(path: Path): string {
		return path.join(',');
	}

	function toggleExpanded(path: Path) {
		const key = pathKey(path);
		const next = new Set(expanded);
		if (next.has(key)) next.delete(key);
		else next.add(key);
		expanded = next;
	}

	function isExpanded(path: Path): boolean {
		return expanded.has(pathKey(path));
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
		const showAddBranch = isBranch && self.showAddBranchAtDepth(depth);
		const showAddLeaf = isBranch && self.showAddLeafAtDepth(depth);
		const selected = isSelected(path, type);
		const adding = isAddingAt(path);
		const canUp = self.canMoveUp(path);
		const canDown = self.canMoveDown(path);
		return {
			depth,
			path,
			node,
			rowKey: node.key ?? pathKey(path),
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
				if (node.type === 'branch' && expanded.has(pathKey(path))) {
					walk(node.children, depth + 1, path);
				}
			});
		}
		walk(structure, 0, []);
		return out;
	});
</script>

<div class="flex flex-col rounded-md border text-sm">
	{#each rows as row (row.rowKey)}
		{@const { depth, path, node, isBranch, showAddBranch, showAddLeaf, selected, adding, canUp, canDown } = row}
		<div
			role="button"
			tabindex="0"
			class={cn(
				'flex min-h-8 items-center gap-1 rounded-sm px-1 transition-colors',
				selected && 'bg-accent text-accent-foreground',
				adding && 'ring-1 ring-primary'
			)}
			style="padding-left: {depth * 1.25 + 0.25}rem"
			animate:flip={{ duration: 500 }}
			onclick={() => self.select(path, node.type)}
			onkeydown={(e) => e.key === 'Enter' && self.select(path, node.type)}
		>
			<!-- Chevron (branch only) -->
			{#if isBranch}
				<button
					type="button"
					class="flex shrink-0 items-center justify-center p-0.5 hover:bg-accent/50 rounded"
					onclick={(e) => { e.stopPropagation(); toggleExpanded(path); }}
					aria-label={isExpanded(path) ? 'Collapse' : 'Expand'}
				>
					{#if isExpanded(path)}
						<ChevronDown class="size-4" />
					{:else}
						<ChevronRight class="size-4" />
					{/if}
				</button>
			{:else}
				<span class="w-5 shrink-0" aria-hidden="true" />
			{/if}

			<!-- Icon + label -->
			<span class="flex shrink-0 items-center gap-1.5">
				{#if isBranch}
					<Folder class="size-4 text-muted-foreground" />
					<span>{node.label}</span>
				{:else}
					<File class="size-4 text-muted-foreground" />
					<span>{node.label}</span>
				{/if}
			</span>

			<!-- Spacer -->
			<span class="min-w-2 flex-1" />

			<!-- Actions: move, delete, add (branch only for add) -->
			<div class="flex shrink-0 items-center gap-0.5">
				<Button
					variant="ghost"
					size="icon-sm"
					class="h-7 w-7"
					disabled={!canUp}
					aria-label="Move up"
					onclick={(e) => { e.stopPropagation(); self.handleMoveUp(path); }}
				>
					<ArrowUp class="size-3.5" />
				</Button>
				<Button
					variant="ghost"
					size="icon-sm"
					class="h-7 w-7"
					disabled={!canDown}
					aria-label="Move down"
					onclick={(e) => { e.stopPropagation(); self.handleMoveDown(path); }}
				>
					<ArrowDown class="size-3.5" />
				</Button>
				<Button
					variant="ghost"
					size="icon-sm"
					class="h-7 w-7 text-muted-foreground hover:text-destructive"
					aria-label="Delete"
					onclick={(e) => { e.stopPropagation(); self.handleDelete(path); }}
				>
					<Trash2 class="size-3.5" />
				</Button>
				{#if isBranch}
					{#if showAddBranch}
						<Button
							variant="ghost"
							size="icon-sm"
							class="h-7 w-7"
							aria-label="Add folder"
							onclick={(e) => { e.stopPropagation(); self.handleAddBranch(path); }}
						>
							<Folder class="size-3.5" />
							<Plus class="size-3 ml-0.5" />
						</Button>
					{/if}
					{#if showAddLeaf}
						<Button
							variant="ghost"
							size="icon-sm"
							class="h-7 w-7"
							aria-label="Add file"
							onclick={(e) => { e.stopPropagation(); self.handleAddLeaf(path); }}
						>
							<File class="size-3.5" />
							<Plus class="size-3 ml-0.5" />
						</Button>
					{/if}
				{/if}
			</div>
		</div>
	{/each}
</div>
