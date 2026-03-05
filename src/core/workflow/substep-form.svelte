<script lang="ts">
	import type { Substep } from '$core/repositories/substep.repository.svelte.js';

	import { Input } from '$lib/components/ui/input/index.js';
	import * as Select from '$lib/components/ui/select/index.js';
	import { Textarea } from '$lib/components/ui/textarea/index.js';

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

<div>
	<Input bind:value={substep.title} />

	<Textarea bind:value={substep.inputKey} />

	<Select.Root type="multiple" name="favoriteFruit" bind:value={substep.roles}>
		<Select.Trigger class="w-[180px]">
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

	<SubstepFormata bind:substep />
</div>
