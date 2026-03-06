<script lang="ts">
	import { Loader, SaveIcon } from '@lucide/svelte';
	import { Config } from '$core';
	import { saveWorkflow } from '$core/api/index.js';
	import { config, getConfigErrors } from '$core/state.svelte.js';
	import * as AlertDialog from '$lib/components/ui/alert-dialog/index.js';
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

	//

	let loading = $state(false);

	function saveConfig() {
		if (configErrors.length > 0) {
			toast.error('Fix config validation errors before exporting.');
			return;
		}

		loading = true;
		saveWorkflow().then((res) => {
			if (res.isErr) {
				toast.error(res.error.message);
			} else {
				toast.success('Workflow saved successfully');
			}
			loading = false;
		});
	}
</script>

{#snippet topbarRight()}
	<Button onclick={saveConfig}>
		<SaveIcon />
		Save
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

<AlertDialog.Root open={loading}>
	<AlertDialog.Content class="flex items-center justify-center">
		<div class="flex items-center gap-2">
			<Loader class="animate-spin" />
			<p>Loading...</p>
		</div>
	</AlertDialog.Content>
</AlertDialog.Root>
