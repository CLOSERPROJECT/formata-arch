<script lang="ts">
	import type { Schema, UiSchema } from '@sjsf/form';

	import { isRecordEmpty } from '@sjsf/form/lib/object';
	import { mode } from 'mode-watcher';

	import { getBuilderContext } from '../context.svelte.js';

	//

	type Props = {
		schema?: Schema;
		uiSchema?: UiSchema;
		useBuilderContext?: boolean;
		class?: string;
	};

	let {
		schema: schemaProp,
		uiSchema: uiSchemaProp,
		useBuilderContext = true,
		class: className
	}: Props = $props();

	const schema = $derived.by(() => {
		if (useBuilderContext) {
			const ctx = getBuilderContext();
			return ctx.schema;
		} else {
			return schemaProp;
		}
	});

	const uiSchema = $derived.by(() => {
		if (useBuilderContext) {
			const ctx = getBuilderContext();
			return ctx.uiSchema;
		} else {
			return uiSchemaProp;
		}
	});

	const hasUiSchema = $derived(uiSchema && !isRecordEmpty(uiSchema));

	//

	type FormataFormElement = HTMLElement & {
		schema?: object;
		uiSchema?: object;
		darkMode?: boolean;
		preventPageReload?: boolean;
	};
	let formataEl = $state<FormataFormElement>();

	$effect(() => {
		if (!formataEl) return;
		formataEl.schema = schema;
		formataEl.uiSchema = hasUiSchema ? uiSchema : undefined;
		formataEl.darkMode = mode.current === 'dark';
		formataEl.preventPageReload = false;
	});

	//

	const key = $derived(JSON.stringify({ ...schema, ...uiSchema }));
</script>

{#key key}
	<div class="flex flex-col gap-2">
		<div class={['rounded-md border border-(--global-border) p-4', className]}>
			<formata-form bind:this={formataEl}></formata-form>
		</div>
	</div>
{/key}
