<script lang="ts">
	import Crud from '$core/crud.svelte';
	import { UserRepository } from '$core/repositories/user.repository.js';
	import { config } from '$core/state.svelte.js';

	const repository = new UserRepository(config);
</script>

<Crud {repository} />
