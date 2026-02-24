import type { Branch, Leaf, Node, Path, Structure } from './types.js';

export function getNodeAt(structure: Structure, path: Path): Branch | Leaf | undefined {
	if (path.length === 0) return undefined;
	let current: Node[] = structure;
	for (let i = 0; i < path.length; i++) {
		const index = path[i];
		if (index < 0 || index >= current.length) return undefined;
		const node = current[index];
		if (node.type === 'leaf') {
			return i === path.length - 1 ? node : undefined;
		}
		if (i === path.length - 1) return node;
		current = node.children;
	}
	return undefined;
}

export function getSiblings(structure: Structure, path: Path): Node[] | undefined {
	if (path.length === 0) return undefined;
	if (path.length === 1) return structure;
	const parent = getNodeAt(structure, path.slice(0, -1));
	if (!parent || parent.type === 'leaf') return undefined;
	return parent.children;
}

export function canMoveUp(structure: Structure, path: Path): boolean {
	if (path.length === 0) return false;
	const lastIndex = path[path.length - 1];
	return lastIndex > 0;
}

export function canMoveDown(structure: Structure, path: Path): boolean {
	if (path.length === 0) return false;
	const siblings = getSiblings(structure, path);
	if (!siblings) return false;
	const lastIndex = path[path.length - 1];
	return lastIndex < siblings.length - 1;
}
