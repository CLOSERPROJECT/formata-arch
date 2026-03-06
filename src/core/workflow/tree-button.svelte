<script lang="ts">
	import type { Icon } from '$lib/types.js';
	import type { ComponentProps } from 'svelte';
	import type { ClassValue } from 'svelte/elements';

	import { Button } from '$lib/components/ui/button/index.js';

	//

	interface Props extends ComponentProps<typeof Button> {
		icon: Icon;
		iconClass?: ClassValue;
	}

	let { icon: IconComponent, iconClass, onclick, ...props }: Props = $props();
</script>

<Button
	variant="ghost"
	size="icon-sm"
	{...props}
	class={[props.class, 'size-6 rounded-sm p-0']}
	onclick={(e) => {
		e.stopPropagation();
		onclick?.(e as MouseEvent & { currentTarget: EventTarget & HTMLButtonElement });
	}}
>
	<IconComponent class={[iconClass, 'size-3']} />
</Button>
