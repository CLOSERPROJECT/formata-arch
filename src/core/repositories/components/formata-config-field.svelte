<script lang="ts">
	import type { Schema, UiSchema } from '@sjsf/form';
	import type { BuilderContext } from '$builder/context.svelte.js';

	import { PencilIcon, TriangleAlert } from '@lucide/svelte';
	import {
		getFieldErrors,
		getFormContext,
		getValueSnapshot,
		setValue,
		type ComponentProps
	} from '@sjsf/form';
	import Template from '@sjsf/form/templates/field.svelte';
	import BuilderStandalone from '$builder/builder-standalone.svelte';
	import Form from '$builder/preview/form.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { get } from 'lodash';

	//

	let { value = $bindable(), config, uiOption }: ComponentProps['objectField'] = $props();

	const ctx = getFormContext();
	const schemaPath = $derived(config.path);
	const uiSchemaPath = $derived(config.path.toSpliced(-1, 1, 'uiSchema'));

	//

	type FieldValue = { schema: Schema; uiSchema?: UiSchema } | undefined;

	const fieldValue: FieldValue = $derived.by(() => {
		const formData = getValueSnapshot(ctx);
		console.log(formData);
		const schemaValue = get(formData, schemaPath);
		const uiSchemaValue = get(formData, uiSchemaPath);
		if (!schemaValue || typeof schemaValue !== 'object' || !('type' in schemaValue)) {
			return undefined;
		} else {
			return { schema: schemaValue as Schema, uiSchema: uiSchemaValue as UiSchema | undefined };
		}
	});

	//

	let open = $state(false);

	let builder: BuilderContext | undefined;

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

	//

	const errors = $derived(getFieldErrors(ctx, config.path));

	const hasProperties = $derived(fieldValue?.schema && Object.keys(fieldValue.schema).length > 0);
</script>

<Template
	{errors}
	showTitle
	useLabel
	widgetType="textWidget"
	type="template"
	{value}
	{config}
	{uiOption}
>
	<div class="flex gap-2">
		<div class="grow rounded-md border bg-gray-100 p-2 text-sm dark:bg-input/30">
			{#if fieldValue?.schema && hasProperties}
				<Form
					useBuilderContext={false}
					schema={fieldValue.schema}
					uiSchema={fieldValue.uiSchema}
					class="border-none! p-2!"
				/>
			{:else}
				<div class="flex items-center gap-1 pl-1 text-sm text-muted-foreground">
					<TriangleAlert size={14} />
					<span> No properties </span>
				</div>
			{/if}
		</div>
		<div>
			{@render editDialog()}
		</div>
	</div>
</Template>

{#snippet editDialog()}
	<Dialog.Root bind:open>
		<Dialog.Trigger>
			{#snippet child({ props })}
				<Button
					{...props}
					variant="outline"
					onclick={(e) => {
						e.preventDefault();
						open = true;
					}}
				>
					<PencilIcon />
					Edit
				</Button>
			{/snippet}
		</Dialog.Trigger>
		<Dialog.Content
			class="h-[calc(100vh-2rem)] w-[calc(100vw-2rem)] max-w-none! p-4!"
			style="--header-height: 10rem"
		>
			<Dialog.Header class="border-b pb-2">
				<Dialog.Title>Formata Config</Dialog.Title>
			</Dialog.Header>

			<BuilderStandalone initialData={fieldValue} onInit={handleBuilderInit} />

			<div
				class="absolute bottom-0 flex w-full justify-end border-t bg-background/40 p-2 backdrop-blur-xl"
			>
				<Button onclick={handleSave}>Save</Button>
			</div>
		</Dialog.Content>
	</Dialog.Root>
{/snippet}
