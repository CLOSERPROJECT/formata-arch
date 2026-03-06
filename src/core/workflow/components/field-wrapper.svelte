<script lang="ts">
	import type { Snippet } from 'svelte';

	import Label from '$lib/components/ui/label/label.svelte';

	//

	interface Props {
		label: string;
		children: Snippet;
	}

	let { label, children }: Props = $props();
</script>

<div class="space-y-2">
	<Label>
		{label}
	</Label>
	{@render children()}
</div>
