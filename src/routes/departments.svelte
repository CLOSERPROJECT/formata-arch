<script lang="ts">
	import { Crud } from '$core';
	import { DepartmentRepository } from '$core/repositories/department.repository.js';
	import { config } from '$core/state.svelte.js';
	import NewButton from '$lib/components/new-button.svelte';

	import { setTopbar } from './_layout.svelte';

	//

	const repository = new DepartmentRepository(config);
	const crud = new Crud(repository);

	setTopbar({
		title: 'Departments',
		right: topbarRight
	});
</script>

{#snippet topbarRight()}
	<NewButton onClick={() => crud.openCreate()} />
{/snippet}

<div class="p-4">
	<crud.Table self={crud} />
</div>
