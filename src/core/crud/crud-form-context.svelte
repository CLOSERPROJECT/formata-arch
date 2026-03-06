<script lang="ts" generics="T extends object">
	import type { Snippet } from 'svelte';

	import { Form } from '$core';

	import type { Crud } from './crud.svelte.js';

	//

	type Props = {
		crud: Crud<T>;
		children: Snippet;
	};

	let { crud, children }: Props = $props();

	// svelte-ignore state_referenced_locally
	Form.setComponentContext(crud.form);
</script>

{@render children()}
