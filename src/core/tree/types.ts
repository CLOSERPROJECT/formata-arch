export type Branch = { type: 'branch'; label: string; children: Node[]; key?: string };
export type Leaf = { type: 'leaf'; label: string; key?: string };
export type Node = Branch | Leaf;
export type Structure = Node[];

export type Path = number[];

export type TreeState =
	| { state: 'idle' }
	| { state: 'selected'; path: Path; type: 'branch' | 'leaf' }
	| { state: 'adding'; path: Path; type: 'branch' | 'leaf' };

export type AddTypesByDepth = Record<number, ('leaf' | 'branch')[]>;

export interface TreeOptions {
	maxBranchDepth?: number;
	addTypesByDepth?: AddTypesByDepth;
	onMoveUp?: (path: Path) => void;
	onMoveDown?: (path: Path) => void;
	onDelete?: (path: Path) => void;
	onAddBranch?: (path: Path) => void;
	onAddLeaf?: (path: Path) => void;
}
