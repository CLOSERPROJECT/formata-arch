<script lang="ts">
	import { type ComponentProps } from '@sjsf/form';

	let { value = $bindable() }: ComponentProps['objectField'] = $props();

	function hideParent(el: HTMLElement) {
		if (!el.parentElement || !el.parentElement.parentElement) return;
		el.parentElement.parentElement.style.display = 'none';
	}
</script>

<div {@attach hideParent}></div>
