<script lang="ts">
	import { Crud } from '$core';
	import { OrganizationRepository } from '$core/repositories/organization.repository.js';
	import { config } from '$core/state.svelte.js';
	import NewButton from '$lib/components/new-button.svelte';

	import { setTopbar } from './_layout.svelte';

	//

	const repository = new OrganizationRepository(config);
	const crud = new Crud(repository);

	setTopbar({
		title: 'Organizations',
		right: topbarRight
	});
</script>

{#snippet topbarRight()}
	<NewButton onClick={() => crud.openCreate()} />
{/snippet}

<div class="p-4">
	<crud.Table self={crud} />
</div>
