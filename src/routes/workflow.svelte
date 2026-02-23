<script lang="ts">
	import { Crud } from '$core/crud.svelte.js';
	import { WorkflowRepository } from '$core/repositories/workflow.repository.js';
	import { config } from '$core/state.svelte.js';

	const repository = new WorkflowRepository(config);
	const crud = new Crud(repository);
</script>

<crud.Component self={crud} />
