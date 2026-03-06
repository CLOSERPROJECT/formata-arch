<script lang="ts">
	import type { ErrorObject } from 'ajv';
	import type { Snippet } from 'svelte';

	import { TriangleAlert } from '@lucide/svelte';
	import Label from '$lib/components/ui/label/label.svelte';

	//

	interface Props {
		label: string;
		children: Snippet;
		field: string;
		errors?: ErrorObject[];
	}

	let { label, children, field, errors = [] }: Props = $props();

	const fieldErrors = $derived(errors.filter((err) => err.instancePath.endsWith(field)));
	const hasErrors = $derived(fieldErrors.length > 0);
</script>

<div class="space-y-2">
	<Label>
		{label}
	</Label>
	{@render children()}
	{#if hasErrors}
		<div class="flex items-center gap-1 text-warning">
			<TriangleAlert size={12} class="shrink-0 " />
			<div class="text-xs">
				{#each fieldErrors as error, i (i)}
					<p>{error.message}</p>
				{/each}
			</div>
		</div>
	{/if}
</div>
