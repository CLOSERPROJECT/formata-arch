<script lang="ts">
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

	function handleSave() {
		if (!builder) return;
		if (!builder.validate()) return;
		console.log(builder.uiSchema, builder.schema);
		// @ts-expect-error - Slight type mismatch
		value = builder.schema;
		open = false;
	}

	function handleBuilderInit(b: BuilderContext) {
		builder = b;
		const formData = getValueSnapshot(ctx);
		const fieldValue = get(formData, config.path);
		// if (fieldValue) {
		//     builder.schema = fieldValue;
		// }
		console.log(fieldValue);
		// console.log(config.path);
		// if (builder.schema) {
		// 	// // @ts-expect-error - Slight type mismatch
		// 	// value = builder.schema;
		// }
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

		<BuilderStandalone onInit={handleBuilderInit} />

		<div
			class="absolute bottom-0 flex w-full justify-end border-t bg-background/40 p-2 backdrop-blur-xl"
		>
			<Button onclick={handleSave}>Save</Button>
		</div>
	</Dialog.Content>
</Dialog.Root>
