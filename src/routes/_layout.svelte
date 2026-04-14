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
	import { AlertTriangleIcon, Loader } from '@lucide/svelte';
	import { app } from '$core/app/index.js';
	import * as AlertDialog from '$lib/components/ui/alert-dialog/index.js';
	import * as Alert from '$lib/components/ui/alert/index.js';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import { type Snippet } from 'svelte';

	import AppSidebar from './_sidebar.svelte';

	//

	type Props = {
		children: Snippet;
	};

	let { children }: Props = $props();
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

<AlertDialog.Root open={app.isLoading}>
	<AlertDialog.Content class="flex flex-col items-center justify-center gap-4">
		<div class="flex items-center gap-2">
			{#if app.state.type === 'loading-error'}
				<AlertTriangleIcon />
				<p>Failed to load app</p>
			{:else}
				<Loader class="animate-spin" />
				<p>Loading...</p>
			{/if}
		</div>
		{#if app.state.type === 'loading-error'}
			<Alert.Root variant="destructive">
				<Alert.Description class="whitespace-pre">
					{app.state.error.message}
				</Alert.Description>
			</Alert.Root>
		{/if}
	</AlertDialog.Content>
</AlertDialog.Root>
