<script lang="ts">
	import Crud from '$core/crud.svelte';
	import { DppRepository } from '$core/repositories/dpp.repository.js';
	import { config } from '$core/state.svelte.js';

	const repository = new DppRepository(config);
</script>

<Crud {repository} />
