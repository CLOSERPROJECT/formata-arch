import type { Path, Structure, TreeOptions, TreeState } from './types.js';
import { canMoveDown as pathCanMoveDown, canMoveUp as pathCanMoveUp, getNodeAt } from './path.js';
import TreeComponent from './tree.svelte';

export type { Branch, Leaf, Node, Path, Structure, TreeState, TreeOptions, AddTypesByDepth } from './types.js';
export { getNodeAt } from './path.js';

//

export class Tree {
	constructor(
		private getStructure: () => Structure,
		private options: TreeOptions = {}
	) {}

	get Tree() {
		return TreeComponent;
	}

	selection = $state<TreeState>({ state: 'idle' });

	structure = $derived.by(() => this.getStructure());

	canMoveUp(path: Path): boolean {
		return pathCanMoveUp(this.structure, path);
	}

	canMoveDown(path: Path): boolean {
		return pathCanMoveDown(this.structure, path);
	}

	select(path: Path, type: 'branch' | 'leaf') {
		this.selection = { state: 'selected', path, type };
	}

	setAdding(path: Path, type: 'branch' | 'leaf') {
		this.selection = { state: 'adding', path, type };
	}

	clearSelection() {
		this.selection = { state: 'idle' };
	}

	getNodeAt(path: Path) {
		return getNodeAt(this.structure, path);
	}

	get addTypesByDepth(): TreeOptions['addTypesByDepth'] {
		return this.options.addTypesByDepth ?? {};
	}

	get maxBranchDepth(): number {
		return this.options.maxBranchDepth ?? Infinity;
	}

	allowedAddTypesAtDepth(depth: number): ('leaf' | 'branch')[] {
		return this.options.addTypesByDepth?.[depth] ?? [];
	}

	showAddBranchAtDepth(depth: number): boolean {
		return depth < this.maxBranchDepth && this.allowedAddTypesAtDepth(depth).includes('branch');
	}

	showAddLeafAtDepth(depth: number): boolean {
		return this.allowedAddTypesAtDepth(depth).includes('leaf');
	}

	handleMoveUp(path: Path) {
		if (!this.canMoveUp(path)) return;
		const sel = this.selection;
		const wasSelected =
			sel.state === 'selected' &&
			path.length === sel.path.length &&
			path.every((v, i) => v === sel.path[i]) &&
			this.getNodeAt(path)?.type === sel.type;
		this.options.onMoveUp?.(path);
		if (wasSelected) {
			const last = path.length - 1;
			const newPath: Path = [...path.slice(0, last), path[last] - 1];
			this.select(newPath, sel.type);
		}
	}

	handleMoveDown(path: Path) {
		if (!this.canMoveDown(path)) return;
		const sel = this.selection;
		const wasSelected =
			sel.state === 'selected' &&
			path.length === sel.path.length &&
			path.every((v, i) => v === sel.path[i]) &&
			this.getNodeAt(path)?.type === sel.type;
		this.options.onMoveDown?.(path);
		if (wasSelected) {
			const last = path.length - 1;
			const newPath: Path = [...path.slice(0, last), path[last] + 1];
			this.select(newPath, sel.type);
		}
	}

	handleDelete(path: Path) {
		const node = this.getNodeAt(path);
		if (node?.type === 'branch' && node.children.length > 0) {
			const ok = window.confirm(
				'Delete this node and all its children? This action cannot be undone.'
			);
			if (!ok) return;
		}
		this.options.onDelete?.(path);
	}

	handleAddBranch(path: Path) {
		this.setAdding(path, 'branch');
		this.options.onAddBranch?.(path);
	}

	handleAddLeaf(path: Path) {
		this.setAdding(path, 'leaf');
		this.options.onAddLeaf?.(path);
	}
}
