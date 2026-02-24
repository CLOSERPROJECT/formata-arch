<script lang="ts">
	import { Crud } from '$core';
	import { UserRepository } from '$core/repositories/index.js';
	import { config } from '$core/state.svelte.js';
	import NewButton from '$lib/components/new-button.svelte';

	import { setTopbar } from './_layout.svelte';

	//

	const repository = new UserRepository(config);
	const crud = new Crud(repository);

	setTopbar({
		title: 'Users',
		right: topbarRight
	});
</script>

{#snippet topbarRight()}
	<NewButton onClick={() => crud.openCreate()} />
{/snippet}

<crud.Table self={crud} />
