<script lang="ts">
	import type { Step } from '$core/config/types.js';
	import type { ErrorObject } from 'ajv';

	import { appState } from '$core/state.svelte.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import * as Select from '$lib/components/ui/select/index.js';
	import { Textarea } from '$lib/components/ui/textarea/index.js';
	import { Previous } from 'runed';

	import FieldWrapper from './components/field-wrapper.svelte';

	//

	interface Props {
		step: Step;
		errors?: ErrorObject[];
	}

	let { step = $bindable(), errors = [] }: Props = $props();

	//

	const organizations = $derived(appState.organizations);

	const isEmpty = $derived(!step.organization?.trim());

	const triggerContent = $derived(
		organizations.find((org) => org.slug === step.organization)?.name ?? 'Select organization'
	);

	const previousOrganization = new Previous(() => step.organization);
	$effect(() => {
		if (previousOrganization.current !== step.organization) {
			for (const substep of step.substeps) {
				substep.roles = [];
			}
		}
	});
</script>

<div class="space-y-6">
	<FieldWrapper label="Title" field="title" {errors}>
		<Input bind:value={step.title} placeholder="Enter step title" />
	</FieldWrapper>

	<FieldWrapper label="Description" field="description" {errors}>
		<Textarea bind:value={step.description} />
	</FieldWrapper>

	<FieldWrapper label="Organization" field="organization" {errors}>
		<Select.Root type="single" name="organization" bind:value={step.organization}>
			<Select.Trigger class={['w-full', isEmpty && 'text-muted-foreground']}>
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
