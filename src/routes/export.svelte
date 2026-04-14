<script lang="ts">
	import { SaveIcon } from '@lucide/svelte';
	import { app } from '$core/app/index.js';
	import * as Alert from '$lib/components/ui/alert/index.js';
	import Button from '$lib/components/ui/button/button.svelte';
	import { highlight, highlighterPromise } from '$lib/shiki.js';

	import { setTopbar } from './_layout.svelte';

	//

	setTopbar({ title: 'Export', right: topbarRight });

	const serialized = app.getSerializedConfig();
</script>

{#snippet topbarRight()}
	<Button onclick={() => app.saveConfig()} disabled={!app.canSave}>
		<SaveIcon />
		Save
	</Button>
{/snippet}

<div class="flex min-h-0 grow flex-col gap-4 p-4">
	{#if app.configErrors}
		<Alert.Root variant="destructive">
			<Alert.Title>Config validation failed.</Alert.Title>
			<Alert.Description>
				<p>Please fix the following validation errors before exporting:</p>
				<ul class="mt-2 list-inside list-disc space-y-1">
					{#each app.configErrors as err, i (i)}
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
