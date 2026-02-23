<script lang="ts">
	import { PlusIcon } from '@lucide/svelte';
	import { Crud } from '$core/crud.svelte.js';
	import { DepartmentRepository } from '$core/repositories/department.repository.js';
	import { config } from '$core/state.svelte.js';
	import { Button } from '$lib/components/ui/button/index.js';
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
	<Button onclick={() => crud.openCreate()}>
		<PlusIcon class="h-4 w-4" />
		New
	</Button>
{/snippet}

<crud.Component self={crud} />
