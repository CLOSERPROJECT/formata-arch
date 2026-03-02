<script lang="ts">
	import { DownloadIcon } from '@lucide/svelte';
	import { Config } from '$core';
	import { config, getConfigErrors } from '$core/state.svelte.js';
	import * as Alert from '$lib/components/ui/alert/index.js';
	import Button from '$lib/components/ui/button/button.svelte';
	import { highlight, highlighterPromise } from '$lib/shiki.js';
	import { toast } from 'svelte-sonner';

	import { setTopbar } from './_layout.svelte';

	//

	const configErrors = $derived(getConfigErrors());
	const serialized = $derived.by(() => Config.serialize(config));

	const canExport = $derived(configErrors.length === 0 && !serialized.isErr);

	$effect(() => {
		if (canExport) {
			setTopbar({ title: 'Export', right: topbarRight });
		} else {
			setTopbar({ title: 'Export' });
		}
	});

	function downloadConfig() {
		if (configErrors.length > 0) {
			toast.error('Fix config validation errors before exporting.');
			return;
		}
		const result = Config.serialize(config);
		if (result.isErr) {
			toast.error(result.error.message);
			return;
		}
		const blob = new Blob([result.value], { type: 'application/yaml' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = 'formata-config.yaml';
		a.click();
		URL.revokeObjectURL(url);
		toast.success('Config exported');
	}
</script>

{#snippet topbarRight()}
	<Button onclick={downloadConfig}>
		<DownloadIcon />
		Download
	</Button>
{/snippet}

<div class="flex min-h-0 grow flex-col gap-4 p-4">
	{#if configErrors.length > 0}
		<Alert.Root variant="destructive">
			<Alert.Title>Config validation failed.</Alert.Title>
			<Alert.Description>
				<p>Please fix the following validation errors before exporting:</p>
				<ul class="mt-2 list-inside list-disc space-y-1">
					{#each configErrors as err, i (i)}
						<li>{err}</li>
					{/each}
				</ul>
			</Alert.Description>
		</Alert.Root>
	{:else if serialized.isErr}
		<Alert.Root variant="destructive">
			<Alert.Title>Export failed</Alert.Title>
			<Alert.Description>{serialized.error.message}</Alert.Description>
		</Alert.Root>
	{:else}
		{#await highlighterPromise}
			<p class="text-muted-foreground">Loading preview…</p>
		{:then highlighter}
			{@const yamlString = serialized.value}
			{@const highlighted = highlight(highlighter, 'yaml', yamlString)}
			<div class="dark min-h-0 flex-1 overflow-auto rounded-lg bg-slate-900" data-code-overflow>
				<!-- eslint-disable-next-line svelte/no-at-html-tags -->
				{@html highlighted}
			</div>
		{/await}
	{/if}
</div>
