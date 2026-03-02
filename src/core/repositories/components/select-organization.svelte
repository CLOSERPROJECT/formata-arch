<script module lang="ts">
	import type { Config } from '$core';

	declare module '@sjsf/form' {
		interface UiOptions {
			attestaConfig?: Config.Config;
		}
	}
</script>

<script lang="ts">
	import type { ComponentProps } from '@sjsf/form';

	import * as Select from '$lib/components/ui/select/index.js';

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	let { value = $bindable(), config, handlers, uiOption }: ComponentProps['textWidget'] = $props();

	const organizations = $derived.by(() => {
		const attestaConfig = uiOption('attestaConfig');
		return attestaConfig?.organizations ?? [];
	});

	const selectedOrganization = $derived.by(() => {
		return organizations.find((organization) => organization.slug === value);
	});
</script>

<Select.Root type="single" bind:value>
	<Select.Trigger class="bg-background">
		{selectedOrganization?.name ?? 'Select an organization'}
	</Select.Trigger>
	<Select.Content>
		{#each organizations as organization (organization.slug)}
			<Select.Item value={organization.slug}>{organization.name}</Select.Item>
		{/each}
	</Select.Content>
</Select.Root>
