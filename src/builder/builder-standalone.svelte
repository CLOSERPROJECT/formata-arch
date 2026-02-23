<script lang="ts">
	import { TooltipProvider } from '$lib/components/ui/tooltip/index.js';
	import { highlighterPromise } from '$lib/shiki.js';

	import BuilderStandaloneContent from './builder-standalone-content.svelte';
	import { BuilderContext } from './context.svelte.js';

	//

	type Props = {
		onInit?: (ctx: BuilderContext) => void;
	};
	const { onInit }: Props = $props();

	const promises = Promise.all([highlighterPromise]);
</script>

<TooltipProvider delayDuration={0}>
	<div class="min-h-screen bg-background dark:scheme-dark">
		{#await promises}
			<p>Loading...</p>
		{:then [highlighter]}
			{@const builder = new BuilderContext(highlighter)}
			<BuilderStandaloneContent ctx={builder} {onInit} />
		{/await}
	</div>
</TooltipProvider>
