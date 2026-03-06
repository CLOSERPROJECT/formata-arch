<script lang="ts">
	import { SaveIcon } from '@lucide/svelte';
	import { Config, Form } from '$core';
	import { config } from '$core/state.svelte.js';
	import Button from '$lib/components/ui/button/button.svelte';

	import { setTopbar } from './_layout.svelte';

	//

	const form = Form.make<Config.Dpp>({
		schema: Config.getEntitySchema('Dpp'),
		initialValue: config.dpp,
		onSubmit: (value) => {
			config.dpp = value;
		}
	});

	setTopbar({
		title: 'DPP Config',
		right: topbarRight
	});

	let formRef: HTMLFormElement | undefined = $state();
</script>

{#snippet topbarRight()}
	<Button onclick={() => formRef?.requestSubmit()}>
		<SaveIcon />
		Update
	</Button>
{/snippet}

<div class="p-4">
	<Form.Component {form} hideSubmitButton bind:ref={formRef} />
</div>
