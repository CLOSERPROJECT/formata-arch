<script lang="ts" generics="T extends object">
	import type { Snippet } from 'svelte';

	import type { Crud } from './crud.svelte.js';

	import { setComponentContext } from './form.svelte.js';

	//

	type Props = {
		crud: Crud<T>;
		children: Snippet;
	};

	let { crud, children }: Props = $props();

	// svelte-ignore state_referenced_locally
	setComponentContext(crud.form);
</script>

{@render children()}
