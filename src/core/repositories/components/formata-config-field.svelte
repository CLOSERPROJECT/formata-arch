<script lang="ts">
	import type { Schema, UiSchema } from '@sjsf/form';
	import type { BuilderContext } from '$builder/context.svelte.js';

	import { getFormContext, getValueSnapshot, setValue, type ComponentProps } from '@sjsf/form';
	import BuilderStandalone from '$builder/builder-standalone.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { get } from 'lodash';

	//

	let { value = $bindable(), config }: ComponentProps['objectField'] = $props();
	const ctx = getFormContext();

	let open = $state(false);

	let builder: BuilderContext | undefined;

	const schemaPath = $derived(config.path);
	const uiSchemaPath = $derived(config.path.toSpliced(-1, 1, 'uiSchema'));

	function getInitialState(): { schema: Schema; uiSchema?: UiSchema } | undefined {
		const formData = getValueSnapshot(ctx);
		const schemaValue = get(formData, schemaPath);
		const uiSchemaValue = get(formData, uiSchemaPath);
		if (!schemaValue || typeof schemaValue !== 'object' || !('type' in schemaValue)) {
			return undefined;
		} else {
			return { schema: schemaValue as Schema, uiSchema: uiSchemaValue as UiSchema | undefined };
		}
	}

	function handleSave() {
		if (!builder) return;
		if (!builder.validate()) return;
		const formData = getValueSnapshot(ctx);
		const base = typeof formData === 'object' && formData !== null ? formData : {};
		setValue(ctx, {
			...base,
			schema: builder.schema,
			uiSchema: builder.uiSchema ?? get(formData, uiSchemaPath)
		} as Record<string, unknown>);
		// @ts-expect-error - Slight type mismatch between builder.schema and form value
		value = builder.schema;
		open = false;
	}

	function handleBuilderInit(b: BuilderContext) {
		builder = b;
	}
</script>

<pre>
    {JSON.stringify(getInitialState(), null, 2)}
</pre>

<Dialog.Root bind:open>
	<Dialog.Trigger>
		{#snippet child({ props })}
			<Button
				{...props}
				onclick={(e) => {
					e.preventDefault();
					open = true;
				}}
			>
				Open
			</Button>
		{/snippet}
	</Dialog.Trigger>
	<Dialog.Content
		class="h-[calc(100vh-2rem)] w-[calc(100vw-2rem)] max-w-none! p-4!"
		style="--header-height: 7rem"
	>
		<Dialog.Header class="border-b pb-2">
			<Dialog.Title>Formata Config</Dialog.Title>
		</Dialog.Header>

		<BuilderStandalone initialData={getInitialState()} onInit={handleBuilderInit} />

		<div
			class="absolute bottom-0 flex w-full justify-end border-t bg-background/40 p-2 backdrop-blur-xl"
		>
			<Button onclick={handleSave}>Save</Button>
		</div>
	</Dialog.Content>
</Dialog.Root>
