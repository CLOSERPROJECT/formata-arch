<script lang="ts">
	import type { Schema, UiSchema } from '@sjsf/form';

	import { on } from 'svelte/events';

	import { BuilderContext, setBuilderContext } from './context.svelte.js';
	import Content from './editor/content.svelte';
	import Controls from './editor/controls.svelte';
	import Settings from './editor/settings.svelte';
	import Form from './preview/form.svelte';

	type Props = {
		ctx: BuilderContext;
		initialSchema?: Schema;
		initialUiSchema?: UiSchema;
		onInit?: (ctx: BuilderContext) => void;
	};
	const { ctx, initialSchema, initialUiSchema, onInit }: Props = $props();

	setBuilderContext(ctx);

	let initialLoadDone = false;
	function applyInitialState(builder: BuilderContext) {
		if (initialSchema !== undefined && !initialLoadDone) {
			initialLoadDone = true;
			builder.loadFromSchema(initialSchema, initialUiSchema);
		}
		onInit?.(builder);
	}
	$effect(() => applyInitialState(ctx));

	let rootElements = $state(new Array<HTMLDivElement | null>(3));
	$effect(() =>
		on(document, 'mousedown', ({ target }) => {
			if (
				target instanceof Node &&
				rootElements.every((el) => el !== target) &&
				rootElements.some((el) => el?.contains(target))
			) {
				return;
			}
			// NOTE: `setTimeout` is required for correct operation of the conditions
			// in `settings.svelte` for the `NodeSettings` component.
			// And i can't explain why
			setTimeout(() => {
				ctx.clearSelection();
			});
		})
	);
</script>

<div class={['mx-auto grid gap-6', 'grid-cols-[1fr_3fr_2fr_3fr]']}>
	<div
		bind:this={rootElements[0]}
		class="sticky top-(--header-height) h-[calc(100vh-var(--header-height))] min-w-[150px] overflow-y-auto"
	>
		{@render label('Available fields')}
		<Controls />
	</div>

	<div bind:this={rootElements[1]}>
		{@render label('Form structure')}
		<Content />
	</div>

	<div
		bind:this={rootElements[2]}
		class="sticky top-(--header-height) h-[calc(100vh-var(--header-height))] min-w-[200px] overflow-y-auto"
	>
		{@render label('Field settings')}
		<Settings />
	</div>

	<div class="overflow-x-hidden">
		{@render label('Form preview')}
		<Form />
	</div>
</div>

{#snippet label(text: string)}
	<p class="mb-2 text-sm font-medium text-muted-foreground">{text}</p>
{/snippet}
