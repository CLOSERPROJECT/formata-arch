<script lang="ts">
	import { RotateCcw, SaveIcon } from '@lucide/svelte';
	import { app } from '$core/app/index.js';
	import * as Alert from '$lib/components/ui/alert/index.js';
	import Button from '$lib/components/ui/button/button.svelte';
	import { highlight, highlighterPromise } from '$lib/shiki.js';

	import { setTopbar } from './_layout.svelte';

	//

	setTopbar({ title: 'Save stream', right: topbarRight });

	const serialized = app.getSerialized();
</script>

{#snippet topbarRight()}
	<div class="flex items-center gap-2">
		{#if app.hasChanges}
			<Button variant="outline" onclick={() => app.discardChanges()} disabled={app.isLoading}>
				<RotateCcw />
				Discard changes
			</Button>
		{/if}
		<Button onclick={() => app.save()} disabled={!app.canSave}>
			<SaveIcon />
			Save
		</Button>
	</div>
{/snippet}

<div class="flex min-h-0 grow flex-col gap-4 p-4">
	{#if app.errors}
		<Alert.Root variant="destructive">
			<Alert.Title>Config validation failed.</Alert.Title>
			<Alert.Description>
				<p>Please fix the following validation errors before exporting:</p>
				<ul class="mt-2 list-inside list-disc space-y-1">
					{#each app.errors as err, i (i)}
						<li>{err.instancePath}: {err.message}</li>
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
