<script lang="ts">
	import Crud from '$core/crud.svelte';
	import { WorkflowRepository } from '$core/repositories/workflow.repository.js';
	import { config } from '$core/state.svelte.js';

	const repository = new WorkflowRepository(config);
</script>

<Crud {repository} />
