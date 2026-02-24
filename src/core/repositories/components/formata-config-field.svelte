<script lang="ts">
	import type { Schema, UiSchema } from '@sjsf/form';
	import type { BuilderContext } from '$builder/context.svelte.js';

	import { getFormContext, getValueSnapshot, type ComponentProps } from '@sjsf/form';
	import BuilderStandalone from '$builder/builder-standalone.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { get } from 'lodash';

	//

	let { value = $bindable(), config }: ComponentProps['objectField'] = $props();
	const ctx = getFormContext();

	let open = $state(false);

	let builder: BuilderContext | undefined;

	function getInitialState(): { schema?: Schema; uiSchema?: UiSchema } {
		const formData = getValueSnapshot(ctx);
		const fieldValue = get(formData, config.path);
		if (fieldValue == null) return {};
		if (
			typeof fieldValue === 'object' &&
			'schema' in fieldValue &&
			fieldValue.schema != null &&
			typeof fieldValue.schema === 'object'
		) {
			return {
				schema: fieldValue.schema as Schema,
				uiSchema: (fieldValue as { uiSchema?: UiSchema }).uiSchema
			};
		}
		if (typeof fieldValue === 'object' && 'type' in fieldValue) {
			return { schema: fieldValue as Schema };
		}
		return {};
	}

	function handleSave() {
		if (!builder) return;
		if (!builder.validate()) return;
		// @ts-expect-error - Slight type mismatch between builder.schema and form value
		value = builder.schema;
		open = false;
	}

	function handleBuilderInit(b: BuilderContext) {
		builder = b;
	}
</script>

<pre>
    {JSON.stringify(value, null, 2)}
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

		{@const initial = getInitialState()}
		<BuilderStandalone
			initialSchema={initial.schema}
			initialUiSchema={initial.uiSchema}
			onInit={handleBuilderInit}
		/>

		<div
			class="absolute bottom-0 flex w-full justify-end border-t bg-background/40 p-2 backdrop-blur-xl"
		>
			<Button onclick={handleSave}>Save</Button>
		</div>
	</Dialog.Content>
</Dialog.Root>
