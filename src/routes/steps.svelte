<script lang="ts">
	import Crud from '$core/crud.svelte';
	import { StepRepository } from '$core/repositories/step.repository.js';
	import { config } from '$core/state.svelte.js';

	const repository = new StepRepository(config);
</script>

<Crud {repository} />
