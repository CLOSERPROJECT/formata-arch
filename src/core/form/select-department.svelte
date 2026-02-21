<script module lang="ts">
	import type { AttestaConfig } from '$core/schema.js';

	declare module '@sjsf/form' {
		interface UiOptions {
			attestaConfig?: AttestaConfig;
		}
	}
</script>

<script lang="ts">
	import type { ComponentProps } from '@sjsf/form';
	import * as Select from '$lib/components/ui/select/index.js';

	let { value = $bindable(), config, handlers, uiOption }: ComponentProps['textWidget'] = $props();

	const departments = $derived.by(() => {
		const attestaConfig = uiOption('attestaConfig');
		return attestaConfig?.departments ?? [];
	});

	const selectedDepartment = $derived.by(() => {
		return departments.find((department) => department.id === value);
	});
</script>

<Select.Root type="single" bind:value>
	<Select.Trigger>
		{selectedDepartment?.name ?? 'Select a department'}
	</Select.Trigger>
	<Select.Content>
		{#each departments as department}
			<Select.Item value={department.id}>{department.name}</Select.Item>
		{/each}
	</Select.Content>
</Select.Root>
