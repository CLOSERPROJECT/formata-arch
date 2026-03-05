<script lang="ts">
	import type { Step } from '$core/repositories/step.repository.js';

	import { appState } from '$core/state.svelte.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import * as Select from '$lib/components/ui/select/index.js';

	//

	interface Props {
		step: Step;
	}

	let { step = $bindable() }: Props = $props();

	//

	const organizations = $derived(appState.organizations);

	const triggerContent = $derived(
		organizations.find((org) => org.slug === step.organization)?.name ?? 'Select organization'
	);
</script>

<div>
	<Input bind:value={step.title} />

	<Select.Root type="single" name="organization" bind:value={step.organization}>
		<Select.Trigger class="w-[180px]">
			{triggerContent}
		</Select.Trigger>
		<Select.Content>
			<Select.Group>
				{#each organizations as org (org.slug)}
					<Select.Item value={org.slug} label={org.name}>
						{org.name}
					</Select.Item>
				{/each}
			</Select.Group>
		</Select.Content>
	</Select.Root>
</div>
