<script lang="ts">
	import { DownloadIcon } from '@lucide/svelte';
	import { Config } from '$core';
	import { config } from '$core/state.svelte.js';
	import Button from '$lib/components/ui/button/button.svelte';
	import { highlight, highlighterPromise } from '$lib/shiki.js';
	import { toast } from 'svelte-sonner';

	import { setTopbar } from './_layout.svelte';

	//

	const serialized = $derived.by(() => Config.serialize(config));

	$effect(() => {
		if (serialized.isErr) {
			setTopbar({ title: 'Export' });
		} else {
			setTopbar({ title: 'Export', right: topbarRight });
		}
	});

	function downloadConfig() {
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
	{#if serialized.isErr}
		<p class="text-destructive">{serialized.error.message}</p>
	{:else}
		{#await highlighterPromise}
			<p class="text-muted-foreground">Loading preview…</p>
		{:then highlighter}
			{@const yamlString = serialized.value}
			{@const highlighted = highlight(highlighter, 'yaml', yamlString)}
			<div class="min-h-0 flex-1 overflow-auto rounded-lg">
				<!-- eslint-disable-next-line svelte/no-at-html-tags -->
				{@html highlighted}
			</div>
		{/await}
	{/if}
</div>
