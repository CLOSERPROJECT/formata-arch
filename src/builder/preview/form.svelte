<script lang="ts">
	import { isRecordEmpty } from '@sjsf/form/lib/object';

	import { getBuilderContext } from '../context.svelte.js';

	//

	const ctx = getBuilderContext();

	const schema = $derived(ctx.schema);
	const uiSchema = $derived(ctx.uiSchema ?? {});
	const hasUiSchema = $derived(uiSchema && !isRecordEmpty(uiSchema));

	//

	type FormataFormElement = HTMLElement & { schema?: object; uiSchema?: object };
	let formataEl = $state<FormataFormElement>();

	$effect(() => {
		if (!formataEl) return;
		formataEl.schema = schema;
		formataEl.uiSchema = hasUiSchema ? uiSchema : undefined;
	});

	//

	const key = $derived(JSON.stringify({ ...schema, ...uiSchema }));
</script>

{#key key}
	<div class="flex flex-col gap-2">
		<div class="rounded-md border border-(--global-border) p-4">
			<formata-form bind:this={formataEl}></formata-form>
		</div>
	</div>
{/key}
