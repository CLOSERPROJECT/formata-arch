<script lang="ts">
	import type { Icon } from '$lib/types.js';
	import type { ComponentProps } from 'svelte';

	import { Button } from '$lib/components/ui/button/index.js';

	//

	interface Props extends ComponentProps<typeof Button> {
		icon: Icon;
	}

	let { icon: IconComponent, onclick, ...props }: Props = $props();
</script>

<Button
	variant="ghost"
	size="icon-sm"
	class="h-7 w-7"
	{...props}
	onclick={(e) => {
		e.stopPropagation();
		onclick?.(e as MouseEvent & { currentTarget: EventTarget & HTMLButtonElement });
	}}
>
	<IconComponent class="size-3" />
</Button>
