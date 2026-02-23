<script lang="ts">
	import { Crud } from '$core/crud.svelte.js';
	import { DepartmentRepository } from '$core/repositories/department.repository.js';
	import { config } from '$core/state.svelte.js';
	import NewButton from '$lib/components/new-button.svelte';
	import { setTopbar } from '$lib/layout.js';

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

<crud.Component self={crud} />
