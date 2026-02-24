<script lang="ts">
	import type { Schema, UiSchema } from '@sjsf/form';

	import { TooltipProvider } from '$lib/components/ui/tooltip/index.js';
	import { highlighterPromise } from '$lib/shiki.js';

	import BuilderStandaloneContent from './builder-standalone-content.svelte';
	import { BuilderContext } from './context.svelte.js';

	//

	type Props = {
		initialData?: {
			schema: Schema;
			uiSchema?: UiSchema;
		};
		onInit?: (ctx: BuilderContext) => void;
	};
	const { initialData, onInit }: Props = $props();

	const promises = Promise.all([highlighterPromise]);
</script>

<TooltipProvider delayDuration={0}>
	<div class="min-h-screen bg-background dark:scheme-dark">
		{#await promises}
			<p>Loading...</p>
		{:then [highlighter]}
			{@const builder = new BuilderContext(highlighter)}
			<BuilderStandaloneContent
				ctx={builder}
				initialSchema={initialData?.schema}
				initialUiSchema={initialData?.uiSchema}
				{onInit}
			/>
		{/await}
	</div>
</TooltipProvider>
