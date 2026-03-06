<script lang="ts">
	import type { Step } from '$core/repositories/step.repository.js';

	import { appState } from '$core/state.svelte.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import * as Select from '$lib/components/ui/select/index.js';

	import FieldWrapper from './components/field-wrapper.svelte';

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

<div class="space-y-6">
	<FieldWrapper label="Title">
		<Input bind:value={step.title} placeholder="Enter step title" />
	</FieldWrapper>

	<FieldWrapper label="Organization">
		<Select.Root type="single" name="organization" bind:value={step.organization}>
			<Select.Trigger class="w-full">
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
	</FieldWrapper>
</div>
