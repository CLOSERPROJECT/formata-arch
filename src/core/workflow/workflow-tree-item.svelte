<script lang="ts">
	import {
		ArrowDown,
		ArrowUp,
		ChevronDown,
		ChevronRight,
		Plus,
		Trash2,
		TriangleAlert
	} from '@lucide/svelte';

	import TreeButton from './tree-button.svelte';

	//

	interface Props {
		isSelected: boolean;
		onSelect: () => void;
		index: string | number;
		label: string;
		expandable?: boolean;
		expanded?: boolean;
		toggleExpanded?: () => void;
		showIndex: boolean;
		canMoveUp: boolean;
		canMoveDown: boolean;
		onMoveUp: () => void;
		onMoveDown: () => void;
		onRemove: () => void;
		onAdd?: () => void;
		indent?: number;
		hasErrors?: boolean;
	}

	let { indent = 0, hasErrors = false, ..._ }: Props = $props();
</script>

<button
	tabindex="0"
	class={[
		'flex min-h-8 items-center gap-1.5 rounded-sm p-1 transition-colors',
		!_.isSelected && 'hover:bg-primary/10',
		_.isSelected && 'bg-primary/10',
		'group hover:cursor-pointer',
		'w-full text-sm'
	]}
	onclick={_.onSelect}
	style="padding-left: {indent * 0.5 + 0.25}rem"
	onkeydown={(e) => e.key === 'Enter' && _.onSelect()}
>
	{#if _.expandable}
		<TreeButton
			onclick={_.toggleExpanded}
			icon={_.expanded ? ChevronDown : ChevronRight}
			aria-label={_.expanded ? 'Collapse' : 'Expand'}
		/>
	{:else}
		<div class="w-6 shrink-0" aria-hidden="true"></div>
	{/if}

	{#if _.showIndex}
		<p class="shrink-0 text-muted-foreground tabular-nums">{_.index}</p>
	{/if}

	<p class="min-w-0 grow truncate text-left">
		{_.label}
	</p>

	<div class="flex shrink-0 items-center gap-0.5">
		{#if _.canMoveUp}
			<TreeButton
				onclick={_.onMoveUp}
				icon={ArrowUp}
				aria-label="Move up"
				class="hidden group-hover:flex"
			/>
		{/if}
		{#if _.canMoveDown}
			<TreeButton
				onclick={_.onMoveDown}
				icon={ArrowDown}
				aria-label="Move down"
				class="hidden group-hover:flex"
			/>
		{/if}

		<TreeButton
			onclick={_.onRemove}
			icon={Trash2}
			aria-label="Remove step"
			class="hidden group-hover:flex"
		/>

		{#if hasErrors}
			<div class="flex size-6 items-center justify-center">
				<TriangleAlert size={12} class="text-yellow-600 dark:text-yellow-400" />
			</div>
		{/if}

		{#if _.onAdd}
			<TreeButton
				onclick={_.onAdd}
				icon={Plus}
				aria-label="Add substep"
				class="font-semibold text-primary hover:bg-primary/10"
				iconClass="stroke-3"
			/>
		{/if}
	</div>
</button>
