<script lang="ts" generics="T extends object">
	import type { FormState } from '@sjsf/form';
	import type { Snippet } from 'svelte';

	import { setContext } from './form.svelte.js';

	//

	type Props = {
		form: FormState<T>;
		children: Snippet;
	};

	let { form, children }: Props = $props();

	// We can ignore this since this component is only used internally
	// It's used inside context.svelte
	// Where it gets destroyed every time form updates
	// svelte-ignore state_referenced_locally
	setContext(form);
</script>

{@render children()}
