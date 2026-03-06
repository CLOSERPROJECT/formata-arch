<script lang="ts">
	import type { Substep } from '$core/config/types.js';

	import { Input } from '$lib/components/ui/input/index.js';
	import * as Select from '$lib/components/ui/select/index.js';
	import { Textarea } from '$lib/components/ui/textarea/index.js';

	import FieldWrapper from './components/field-wrapper.svelte';
	import SubstepFormata from './components/substep-formata.svelte';
	import { getAvailableRoleOptions } from './state.svelte.js';

	//

	interface Props {
		substep: Substep;
	}

	let { substep = $bindable() }: Props = $props();

	//

	const availableRoles = $derived(getAvailableRoleOptions());

	const triggerContent = $derived.by(() => {
		if (substep.roles.length === 0) {
			return 'Select roles';
		}
		return substep.roles
			.map((role) => availableRoles.find((r) => r.slug === role)?.name)
			.filter(Boolean)
			.join(', ');
	});
</script>

<div class="space-y-6">
	<FieldWrapper label="Title">
		<Input bind:value={substep.title} placeholder="Enter substep title" />
	</FieldWrapper>

	<FieldWrapper label="Description">
		<Textarea bind:value={substep.inputKey} />
	</FieldWrapper>

	<FieldWrapper label="Roles">
		<Select.Root type="multiple" name="favoriteFruit" bind:value={substep.roles}>
			<Select.Trigger class="w-full">
				{triggerContent}
			</Select.Trigger>
			<Select.Content>
				<Select.Group>
					{#each availableRoles as role (role.slug)}
						<Select.Item value={role.slug} label={role.name}>
							{role.name}
						</Select.Item>
					{/each}
				</Select.Group>
			</Select.Content>
		</Select.Root>
	</FieldWrapper>

	<FieldWrapper label="Data input form">
		<SubstepFormata bind:substep />
	</FieldWrapper>
</div>
