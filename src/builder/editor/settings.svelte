<script lang="ts">
	import { isCustomizableNode } from '$lib/builder/index.js';

	import { getBuilderContext } from '../context.svelte.js';
	import Container from '../container.svelte';
	import NodeSettings from './node-settings.svelte';

	const ctx = getBuilderContext();
	const selected = $derived(ctx.selectedNode);
</script>

{#if selected && isCustomizableNode(selected)}
	<Container class="p-3">
		<NodeSettings bind:node={() => selected, (n) => ctx.updateSelectedNode(n)} />
	</Container>
{:else}
	<div
		class={[
			'flex h-full flex-col items-center justify-center',
			'rounded-md bg-gray-100 p-4 text-center text-sm text-muted-foreground'
		]}
	>
		Field options will appear here
	</div>
{/if}
