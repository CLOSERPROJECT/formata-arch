<script lang="ts">
	import { ArrowDown, ArrowUp, ChevronDown, ChevronRight, Plus, Trash2 } from '@lucide/svelte';

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
	}

	let { indent = 0, ..._ }: Props = $props();
</script>

<button
	tabindex="0"
	class={[
		'flex min-h-8 items-center gap-1.5 rounded-sm p-1 transition-colors',
		'ring-primary',
		!_.isSelected && 'hover:ring-1',
		_.isSelected && 'ring-2',
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
		<span class="shrink-0 text-muted-foreground tabular-nums">{_.index}</span>
	{/if}

	<span class=" min-w-0 grow truncate text-left">
		{_.label}
	</span>

	<div class="flex shrink-0 items-center gap-0.5">
		{#if _.canMoveUp}
			<TreeButton
				onclick={_.onMoveUp}
				icon={ArrowUp}
				aria-label="Move up"
				class="invisible group-hover:visible"
			/>
		{/if}
		{#if _.canMoveDown}
			<TreeButton
				onclick={_.onMoveDown}
				icon={ArrowDown}
				aria-label="Move down"
				class="invisible group-hover:visible"
			/>
		{/if}

		<TreeButton
			onclick={_.onRemove}
			icon={Trash2}
			aria-label="Remove step"
			class="invisible group-hover:visible"
		/>

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
