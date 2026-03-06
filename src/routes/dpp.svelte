<script lang="ts">
	import { SaveIcon } from '@lucide/svelte';
	import { Crud } from '$core';
	import { DppRepository } from '$core/repositories/index.js';
	import { config } from '$core/state.svelte.js';
	import Button from '$lib/components/ui/button/button.svelte';

	import { setTopbar } from './_layout.svelte';

	//

	const repository = new DppRepository(config);
	const crud = new Crud(repository);
	crud.editingRecord = repository.list()[0];

	setTopbar({
		title: 'DPP Config',
		right: topbarRight
	});
</script>

{#snippet topbarRight()}
	<Button onclick={() => crud.submitForm()}>
		<SaveIcon />
		Save
	</Button>
{/snippet}

<div class="p-4">
	<crud.Form self={crud} hideSubmitButton />
</div>
