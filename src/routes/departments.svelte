<script lang="ts">
	import Crud from '$core/crud.svelte';
	import { DepartmentRepository } from '$core/repositories/department.repository.js';
	import { config } from '$core/state.svelte.js';

	const repository = new DepartmentRepository(config);
</script>

<Crud {repository} />
