<script lang="ts">
	import type { Component } from 'svelte';

	import { Toaster } from '$lib/components/ui/sonner/index.js';
	import { setShadcnThemeContext } from '$lib/sjsf/theme.shadcn.js';
	import { ModeWatcher } from 'mode-watcher';
	import { onMount } from 'svelte';

	import SingleFormRoute from './routes/single-form.svelte';
	import { isSingleFormPath } from './routes/single-form-contract.js';
	import { themeManager } from './theme.svelte.js';

	setShadcnThemeContext();

	let RouteComponent = $state<Component>();
	let singleFormMode = $state(false);

	async function updateRouteMode() {
		singleFormMode = isSingleFormPath(window.location.hash);
		if (!singleFormMode && !RouteComponent) {
			RouteComponent = (await import('./routes/router.svelte')).default;
		}
	}

	onMount(() => {
		updateRouteMode();
		window.addEventListener('hashchange', updateRouteMode);
		return () => window.removeEventListener('hashchange', updateRouteMode);
	});
</script>

<ModeWatcher />

{#if singleFormMode}
	<SingleFormRoute />
{:else if RouteComponent}
	<RouteComponent />
{:else}
	<p>Loading...</p>
{/if}

<Toaster richColors theme={themeManager.theme} />
