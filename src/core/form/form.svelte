<script lang="ts" generics="T extends object">
	import { BasicForm, Content, Form, type FormState } from '@sjsf/form';

	import ContextInner from './context-inner.svelte';

	//

	interface Props {
		form: FormState<T>;
		hideSubmitButton?: boolean;
		ref?: HTMLFormElement;
	}

	let { form, hideSubmitButton = false, ref = $bindable() }: Props = $props();
</script>

{#key form}
	<ContextInner {form}>
		{#if !hideSubmitButton}
			<BasicForm {form} bind:ref />
		{:else}
			<Form bind:ref>
				<Content />
			</Form>
		{/if}
	</ContextInner>
{/key}
