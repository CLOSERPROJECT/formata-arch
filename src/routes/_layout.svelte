<script module lang="ts">
	type TopbarState = {
		title: string;
		right?: Snippet;
	};

	let navbarState = $state.raw<TopbarState>();

	export function setTopbar(state: TopbarState) {
		navbarState = state;
	}
</script>

<script lang="ts">
	import type { Snippet } from 'svelte';

	import * as Sidebar from '$lib/components/ui/sidebar/index.js';

	import AppSidebar from './_sidebar.svelte';

	//

	type Props = {
		children: Snippet;
	};

	let { children }: Props = $props();
</script>

<Sidebar.Provider>
	<AppSidebar />
	<main class="grow">
		<div
			class="sticky top-0 z-10 flex h-[53px] items-center justify-between border-b bg-background p-2 pr-4"
		>
			<div class="flex items-center gap-2">
				<Sidebar.Trigger />
				{#if navbarState?.title}
					<p class="font-medium">{navbarState.title}</p>
				{/if}
			</div>
			{#if navbarState?.right}
				{@render navbarState.right()}
			{/if}
		</div>
		<div class="p-4">
			{@render children()}
		</div>
	</main>
</Sidebar.Provider>
