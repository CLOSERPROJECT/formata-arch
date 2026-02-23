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

<style lang="postcss">
	@reference "../app.css";

	:global([data-layout='array-item']) {
		@apply relative rounded-md border bg-gray-100 p-4;
	}

	:global([data-layout='array-item'] [data-layout='array-item']) {
		@apply bg-gray-200;
	}

	:global([data-layout='array-item-controls']) {
		@apply absolute top-2 right-2;
	}

	:global([data-layout='field']) {
		@apply gap-1;
	}

	:global([data-layout='object-properties']) {
		@apply gap-5;
	}

	:global([data-slot='select-trigger']) {
		@apply bg-background;
	}
</style>
