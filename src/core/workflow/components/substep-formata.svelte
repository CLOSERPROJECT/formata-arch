<script lang="ts">
	import type { UiSchema } from '@sjsf/form';
	import type { BuilderContext } from '$builder/context.svelte.js';
	import type { Substep } from '$core/config/types.js';

	import { PencilIcon, SaveIcon, TriangleAlert, XIcon } from '@lucide/svelte';
	import BuilderStandalone from '$builder/builder-standalone.svelte';
	import Form from '$builder/preview/form.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import * as Dialog from '$lib/components/ui/dialog/index.js';

	//

	type Props = {
		substep: Substep;
	};

	let { substep = $bindable() }: Props = $props();

	let open = $state(false);
	const hasProperties = $derived(substep?.schema && Object.keys(substep.schema).length > 0);

	//

	let builder: BuilderContext | undefined;

	function handleSave() {
		if (!builder) return;
		if (!builder.validate()) return;
		substep.schema = builder.schema as Record<string, unknown>;
		substep.uiSchema = builder.uiSchema as UiSchema;
		open = false;
	}

	function handleBuilderInit(b: BuilderContext) {
		builder = b;
	}
</script>

<div class="flex gap-2">
	<div class="grow rounded-md border bg-gray-100 p-2 text-sm dark:bg-input/30">
		{#if substep?.schema && hasProperties}
			<Form
				useBuilderContext={false}
				schema={substep.schema}
				uiSchema={substep.uiSchema as UiSchema}
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
			class="flex! h-[calc(100vh-2rem)] w-[calc(100vw-2rem)] max-w-none! flex-col! p-4!"
			showCloseButton={false}
		>
			<Dialog.Header class="border-b pb-2">
				<Dialog.Title class="flex items-center justify-between gap-2">
					<span> Form Config </span>
					<div>
						<Dialog.Close>
							{#snippet child({ props })}
								<Button {...props} variant="outline" size="sm">
									<XIcon />
									Close
								</Button>
							{/snippet}
						</Dialog.Close>
						<Button onclick={handleSave} size="sm">
							<SaveIcon />
							Save
						</Button>
					</div>
				</Dialog.Title>
			</Dialog.Header>

			<div class="relative overflow-y-auto">
				<BuilderStandalone
					initialData={{ schema: substep.schema, uiSchema: substep.uiSchema as UiSchema }}
					onInit={handleBuilderInit}
				/>
			</div>
		</Dialog.Content>
	</Dialog.Root>
{/snippet}
