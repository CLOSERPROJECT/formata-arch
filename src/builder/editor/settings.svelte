<script lang="ts">
	import CircleX from '@lucide/svelte/icons/circle-x';
	import CircleAlert from '@lucide/svelte/icons/circle-alert';

	import { isCustomizableNode } from '$lib/builder/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import { Checkbox } from '$lib/components/ui/checkbox/index.js';

	import { getBuilderContext } from '../context.svelte.js';
	import Container from '../container.svelte';
	import NodeSettings from './node-settings.svelte';

	const ctx = getBuilderContext();
	const uniqueId = $props.id();
	const selected = $derived(ctx.selectedNode);
</script>

<Container class="mb-4 flex flex-col gap-4 p-3">
	<div class="text-md py-2 font-medium">Form options</div>
	<div class="flex items-center gap-2">
		<Checkbox id={`${uniqueId}-live`} bind:checked={ctx.livePreview} />
		<Label class="text-base" for={`${uniqueId}-live`}>Live preview</Label>
	</div>
	<div class="flex items-center gap-2">
		<Checkbox id={`${uniqueId}-ignore`} bind:checked={ctx.ignoreWarnings} />
		<Label class="text-base" for={`${uniqueId}-ignore`}>Ignore warnings</Label>
	</div>
	{#if ctx.errorsCount || ctx.warningsCount}
		<div class="flex flex-wrap items-center justify-start gap-4">
			{#if ctx.errorsCount}
				<div class="flex items-center gap-2">
					<CircleX class="text-destructive" />
					{ctx.errorsCount} error{ctx.errorsCount > 1 ? 's' : ''}
				</div>
			{/if}
			{#if ctx.warningsCount}
				<div class="flex items-center gap-2">
					<CircleAlert class="text-chart-3" />
					{ctx.warningsCount} warning{ctx.warningsCount > 1 ? 's' : ''}
				</div>
			{/if}
		</div>
	{/if}
</Container>

{#if selected && isCustomizableNode(selected)}
	<Container class="p-3">
		<NodeSettings bind:node={() => selected, (n) => ctx.updateSelectedNode(n)} />
	</Container>
{/if}
