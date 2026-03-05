<script module lang="ts">
	type TopbarState = {
		title: string;
		right?: Snippet;
		left?: Snippet;
	};

	let navbarState = $state.raw<TopbarState>();

	export function setTopbar(state: TopbarState) {
		navbarState = state;
	}
</script>

<script lang="ts">
	import type { Snippet } from 'svelte';

	import { Loader } from '@lucide/svelte';
	import { loadOrganizationData } from '$core/api/index.js';
	import { isAppReady } from '$core/state.svelte.js';
	import * as AlertDialog from '$lib/components/ui/alert-dialog/index.js';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import { toast } from 'svelte-sonner';

	import AppSidebar from './_sidebar.svelte';

	//

	type Props = {
		children: Snippet;
	};

	let { children }: Props = $props();

	$effect(() => {
		if (!isAppReady()) {
			loadOrganizationData().then((res) => {
				if (res.isErr) {
					toast.error(res.error.message);
				}
			});
		}
	});
</script>

<Sidebar.Provider>
	<AppSidebar />
	<Sidebar.Inset class="overflow-x-hidden">
		<div
			class="sticky top-0 z-10 flex h-[53px] items-center justify-between gap-4 border-b bg-background p-2 pr-4"
		>
			<div class="flex grow items-center gap-2">
				<Sidebar.Trigger />
				{#if navbarState?.title}
					<p class="font-medium text-nowrap">{navbarState.title}</p>
				{/if}
				{#if navbarState?.left}
					{@render navbarState.left()}
				{/if}
			</div>
			{#if navbarState?.right}
				{@render navbarState.right()}
			{/if}
		</div>
		<div class="flex grow flex-col">
			{@render children()}
		</div>
	</Sidebar.Inset>
</Sidebar.Provider>

<AlertDialog.Root open={!isAppReady()}>
	<AlertDialog.Content class="flex items-center justify-center">
		<div class="flex items-center gap-2">
			<Loader class="animate-spin" />
			<p>Loading...</p>
		</div>
	</AlertDialog.Content>
</AlertDialog.Root>
