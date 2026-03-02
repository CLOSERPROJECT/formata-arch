<script module lang="ts">
	import type { Config } from '$core';

	import type { Step } from '../step.repository.js';

	declare module '@sjsf/form' {
		interface UiOptions {
			attestaConfig?: Config.Config;
			currentStep?: () => Step | undefined;
		}
	}
</script>

<script lang="ts">
	import { getFieldErrors, getFormContext, type ComponentProps } from '@sjsf/form';
	import Template from '@sjsf/form/templates/field.svelte';
	import * as Select from '$lib/components/ui/select/index.js';

	//

	let { value = $bindable(), uiOption, config }: ComponentProps['arrayField'] = $props();

	const attestaConfig = $derived(uiOption('attestaConfig'));

	const currentOrganization = $derived.by(() => {
		const currentStep = uiOption('currentStep')?.();
		return attestaConfig?.organizations.find((org) => org.slug === currentStep?.organization);
	});

	const roles = $derived.by(() => {
		return attestaConfig?.roles.filter((role) => role.orgSlug === currentOrganization?.slug) ?? [];
	});

	const selectedRoles = $derived.by(() => {
		return roles.filter((role) => value?.includes(role.slug));
	});

	const triggerLabel = $derived(
		selectedRoles.length === 0 ? 'Select roles' : selectedRoles.map((role) => role.name).join(', ')
	);

	const ctx = getFormContext();
	const errors = $derived(getFieldErrors(ctx, config.path));
</script>

<Template
	{errors}
	showTitle
	useLabel
	widgetType="textWidget"
	type="template"
	{value}
	{config}
	{uiOption}
>
	<Select.Root
		type="multiple"
		bind:value={() => selectedRoles.map((role) => role.slug), (v) => (value = v)}
	>
		<Select.Trigger class="w-full bg-background">
			{triggerLabel}
		</Select.Trigger>
		<Select.Content>
			{#each roles as role (role.slug)}
				<Select.Item value={role.slug}>{role.name}</Select.Item>
			{/each}
		</Select.Content>
	</Select.Root>
</Template>
