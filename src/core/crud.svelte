<script lang="ts" generics="T extends object">
	import type { Repository } from './repositories/index.js';

	interface Props {
		repository: Repository<T>;
	}

	let { repository }: Props = $props();
</script>
