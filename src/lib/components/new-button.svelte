<script lang="ts">
	import { PlusIcon } from '@lucide/svelte';

	import { Button } from './ui/button/index.js';

	interface Props {
		onClick: () => void;
	}

	const { onClick }: Props = $props();
</script>

<Button onclick={onClick}>
	<PlusIcon />
	New
</Button>
