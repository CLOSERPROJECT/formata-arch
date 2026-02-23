<script lang="ts" generics="T extends object">
	import { BasicForm, Content, Form } from '@sjsf/form';

	import type { Crud } from './crud.svelte.js';

	import CrudFormContext from './crud-form-context.svelte';

	//

	interface Props {
		crud: Crud<T>;
		hideSubmitButton?: boolean;
	}

	let { crud, hideSubmitButton = false }: Props = $props();
</script>

{#key crud.form}
	<CrudFormContext {crud}>
		{#if !hideSubmitButton}
			<BasicForm form={crud.form} />
		{:else}
			<Form>
				<Content />
			</Form>
		{/if}
	</CrudFormContext>
{/key}
