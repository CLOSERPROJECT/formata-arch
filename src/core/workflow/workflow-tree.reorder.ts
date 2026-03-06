type Reorderable = { id: string };

export type ReorderResult<T> = {
	moved: boolean;
	fromIndex: number;
	toIndex: number;
	item: T | undefined;
};

export function canMoveItemUp<T extends Reorderable>(items: T[], item: T): boolean {
	return getItemIndex(items, item) > 0;
}

export function canMoveItemDown<T extends Reorderable>(items: T[], item: T): boolean {
	const index = getItemIndex(items, item);
	return index !== -1 && index < items.length - 1;
}

export function moveItemUp<T extends Reorderable>(items: T[], item: T): ReorderResult<T> {
	const fromIndex = getItemIndex(items, item);
	if (fromIndex <= 0) {
		return {
			moved: false,
			fromIndex,
			toIndex: fromIndex,
			item: fromIndex === -1 ? undefined : items[fromIndex]
		};
	}

	const toIndex = fromIndex - 1;
	[items[toIndex], items[fromIndex]] = [items[fromIndex]!, items[toIndex]!];

	return {
		moved: true,
		fromIndex,
		toIndex,
		item: items[toIndex]
	};
}

export function moveItemDown<T extends Reorderable>(items: T[], item: T): ReorderResult<T> {
	const fromIndex = getItemIndex(items, item);
	if (fromIndex === -1 || fromIndex >= items.length - 1) {
		return {
			moved: false,
			fromIndex,
			toIndex: fromIndex,
			item: fromIndex === -1 ? undefined : items[fromIndex]
		};
	}

	const toIndex = fromIndex + 1;
	[items[fromIndex], items[toIndex]] = [items[toIndex]!, items[fromIndex]!];

	return {
		moved: true,
		fromIndex,
		toIndex,
		item: items[toIndex]
	};
}

function getItemIndex<T extends Reorderable>(items: T[], item: T): number {
	return items.findIndex((candidate) => candidate.id === item.id);
}
