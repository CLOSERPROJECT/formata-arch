<script lang="ts" generics="T extends object">
	import { BasicForm, Content, Form } from '@sjsf/form';

	import type { Crud } from './crud.svelte.js';

	import CrudFormContext from './crud-form-context.svelte';

	//

	interface Props {
		self: Crud<T>;
		hideSubmitButton?: boolean;
	}

	let { self: crud, hideSubmitButton = false }: Props = $props();
</script>

{#if !hideSubmitButton}
	<BasicForm form={crud.form} bind:ref={crud.formElement} />
{:else}
	{#key crud.form}
		<CrudFormContext {crud}>
			<Form bind:ref={crud.formElement}>
				<Content />
			</Form>
		</CrudFormContext>
	{/key}
{/if}
