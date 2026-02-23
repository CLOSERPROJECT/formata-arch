<script lang="ts">
	import { SaveIcon } from '@lucide/svelte';
	import { Crud } from '$core/crud.svelte.js';
	import { WorkflowRepository } from '$core/repositories/workflow.repository.js';
	import { config } from '$core/state.svelte.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { setTopbar } from '$lib/layout.js';

	//

	const repository = new WorkflowRepository(config);
	const crud = new Crud(repository);
	crud.editingRecord = repository.list()[0];

	setTopbar({
		title: 'Workflow',
		right: topbarRight
	});
</script>

{#snippet topbarRight()}
	<Button onclick={() => crud.submitForm()}>
		<SaveIcon />
		Save
	</Button>
{/snippet}

<crud.Form self={crud} hideSubmitButton />
