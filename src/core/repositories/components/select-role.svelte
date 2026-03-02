<script module lang="ts">
	import type { Config } from '$core';

	declare module '@sjsf/form' {
		interface UiOptions {
			attestaConfig?: Config.Config;
			currentOrganization?: () => string | undefined;
		}
	}
</script>

<script lang="ts">
	import type { ComponentProps } from '@sjsf/form';

	import * as Select from '$lib/components/ui/select/index.js';

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	let { value = $bindable(), config, handlers, uiOption }: ComponentProps['textWidget'] = $props();

	const attestaConfig = $derived(uiOption('attestaConfig'));

	const currentOrganization = $derived.by(() => {
		const currentOrganization = uiOption('currentOrganization')?.();
		return attestaConfig?.organizations.find((org) => org.slug === currentOrganization);
	});

	const roles = $derived.by(() => {
		return attestaConfig?.roles.filter((role) => role.orgSlug === currentOrganization?.slug) ?? [];
	});

	const selectedRole = $derived.by(() => {
		return roles.find((role) => role.slug === value);
	});
</script>

<Select.Root type="single" bind:value>
	<Select.Trigger class="bg-background">
		{selectedRole?.name ?? 'Select a role'}
	</Select.Trigger>
	<Select.Content>
		{#each roles as role (role.slug)}
			<Select.Item value={role.slug}>{role.name}</Select.Item>
		{/each}
	</Select.Content>
</Select.Root>
