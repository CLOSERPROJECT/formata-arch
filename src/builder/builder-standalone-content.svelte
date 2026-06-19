<script lang="ts">
	import type { Schema, SchemaValue, UiSchema } from '@sjsf/form';

	import { isSchemaValueDeepEqual } from '@sjsf/form/core';
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
		onChange?: (ctx: BuilderContext) => void;
		onInit?: (ctx: BuilderContext) => void;
	};
	const { ctx, initialSchema, initialUiSchema, onChange, onInit }: Props = $props();

	setBuilderContext(ctx);

	let initialized = false;
	let lastFormSnapshot: SchemaValue | undefined;
	$effect(() => {
		const formSnapshot = $state.snapshot({ rootNode: ctx.rootNode });
		if (!initialized) {
			initialized = true;
			if (initialSchema !== undefined) {
				ctx.loadFromSchema(initialSchema, initialUiSchema);
				lastFormSnapshot = $state.snapshot({ rootNode: ctx.rootNode });
			} else {
				lastFormSnapshot = formSnapshot;
			}
			onInit?.(ctx);
			return;
		}
		if (isSchemaValueDeepEqual(lastFormSnapshot, formSnapshot)) {
			return;
		}
		lastFormSnapshot = formSnapshot;
		onChange?.(ctx);
	});

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

<div class={['relative mx-auto grid gap-6', 'grid-cols-[1fr_3fr_2fr_3fr]']}>
	<div bind:this={rootElements[0]} class="sticky top-0">
		{@render label('Available fields')}
		<Controls />
	</div>

	<div bind:this={rootElements[1]} class="sticky top-0">
		{@render label('Form structure')}
		<Content />
	</div>

	<div bind:this={rootElements[2]} class="sticky top-0">
		{@render label('Field settings')}
		<Settings />
	</div>

	<div class="sticky top-0 overflow-x-hidden">
		{@render label('Form preview')}
		<Form />
	</div>
</div>

{#snippet label(text: string)}
	<p class="mb-2 text-sm font-medium text-muted-foreground">{text}</p>
{/snippet}
