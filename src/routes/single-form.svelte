<script lang="ts">
	import type { UiSchema } from '@sjsf/form';
	import type { BuilderContext, NodeIssue } from '$builder/context.svelte.js';

	import { CheckIcon, LoaderIcon, SaveIcon, TriangleAlertIcon } from '@lucide/svelte';
	import BuilderStandalone from '$builder/builder-standalone.svelte';
	import Form from '$builder/preview/form.svelte';
	import * as Alert from '$lib/components/ui/alert/index.js';
	import Button from '$lib/components/ui/button/button.svelte';
	import { onMount } from 'svelte';
	import { toast } from 'svelte-sonner';

	import {
		getHashSearchParams,
		isSingleFormLoadMessage,
		loadSingleFormConfig,
		saveSingleFormConfig,
		type SingleFormConfig
	} from './single-form-contract.js';

	type LoadState =
		| { type: 'loading' }
		| { type: 'waiting' }
		| { type: 'ready'; data: SingleFormConfig }
		| { type: 'error'; message: string };

	const params = getHashSearchParams(window.location.hash);
	const loadUrl = params.get('load');
	const saveUrl = params.get('save');
	const targetOrigin = params.get('targetOrigin') ?? window.location.origin;
	const initialLoadState: LoadState = loadUrl ? { type: 'loading' } : { type: 'waiting' };

	let loadState = $state.raw<LoadState>(initialLoadState);
	let builder = $state<BuilderContext>();
	let saving = $state(false);
	let attemptedSave = $state(false);
	let lastSavedAt = $state<Date>();

	const currentData = $derived<SingleFormConfig | undefined>(
		builder
			? { schema: builder.schema, uiSchema: builder.uiSchema as UiSchema }
			: loadState.type === 'ready'
				? loadState.data
				: undefined
	);
	const groupedErrors = $derived(flattenIssues(builder?.errors));
	const groupedWarnings = $derived(flattenIssues(builder?.warnings));

	function flattenIssues(issues: Partial<Record<string, NodeIssue[]>> | undefined): NodeIssue[] {
		return Object.values(issues ?? {}).flatMap((items) => items ?? []);
	}

	function handleBuilderInit(ctx: BuilderContext) {
		builder = ctx;
		ctx.validate();
	}

	async function handleSave() {
		if (!builder || saving) return;
		attemptedSave = true;
		if (!builder.validate()) {
			toast.error('Fix builder errors and warnings before saving.');
			return;
		}
		builder.build();
		const data = { schema: builder.schema, uiSchema: builder.uiSchema as UiSchema };
		saving = true;
		try {
			if (saveUrl) {
				await saveSingleFormConfig(saveUrl, data);
			}
			window.parent?.postMessage({ type: 'formata:schema-saved', ...data }, targetOrigin);
			lastSavedAt = new Date();
			toast.success('Schema saved');
		} catch (error) {
			toast.error(error instanceof Error ? error.message : 'Failed to save schema config');
		} finally {
			saving = false;
		}
	}

	onMount(() => {
		window.parent?.postMessage({ type: 'formata:schema-ready' }, targetOrigin);

		const onMessage = (event: MessageEvent) => {
			if (!isSingleFormLoadMessage(event.data)) return;
			loadState = { type: 'ready', data: { schema: event.data.schema, uiSchema: event.data.uiSchema } };
		};
		window.addEventListener('message', onMessage);

		if (loadUrl) {
			loadSingleFormConfig(loadUrl).then(
				(data) => (loadState = { type: 'ready', data }),
				(error) =>
					(loadState = {
						type: 'error',
						message: error instanceof Error ? error.message : 'Failed to load schema config'
					})
			);
		}

		return () => window.removeEventListener('message', onMessage);
	});
</script>

<main class="flex min-h-svh flex-col bg-background text-foreground">
	<header class="flex h-[53px] items-center justify-between gap-4 border-b px-4">
		<div>
			<p class="font-medium">Single-form builder</p>
			<p class="text-xs text-muted-foreground">
				Edit one JSON Schema and uiSchema pair without workflow storage.
			</p>
		</div>
		<div class="flex items-center gap-2">
			{#if builder}
				<span
					class={[
						'text-sm',
						builder.errorsCount ? 'text-destructive' : 'text-muted-foreground'
					]}
				>
					{builder.errorsCount} errors
				</span>
				<span
					class={[
						'text-sm',
						builder.warningsCount ? 'text-chart-3' : 'text-muted-foreground'
					]}
				>
					{builder.warningsCount} warnings
				</span>
			{/if}
			<Button onclick={handleSave} disabled={!builder || saving}>
				{#if saving}
					<LoaderIcon class="animate-spin" />
					Saving
				{:else}
					<SaveIcon />
					Save
				{/if}
			</Button>
		</div>
	</header>

	{#if loadState.type === 'loading'}
		<section class="flex grow items-center justify-center gap-2 text-muted-foreground">
			<LoaderIcon class="animate-spin" />
			Loading schema config...
		</section>
	{:else if loadState.type === 'waiting'}
		<section class="mx-auto flex w-full max-w-2xl grow flex-col justify-center p-6">
			<Alert.Root>
				<TriangleAlertIcon />
				<Alert.Title>Waiting for schema config</Alert.Title>
				<Alert.Description>
					Provide a <code>load</code> URL parameter or send
					<code>{'{ type: "formata:schema-load", schema, uiSchema }'}</code> from the parent
					window.
				</Alert.Description>
			</Alert.Root>
		</section>
	{:else if loadState.type === 'error'}
		<section class="mx-auto flex w-full max-w-2xl grow flex-col justify-center p-6">
			<Alert.Root variant="destructive">
				<TriangleAlertIcon />
				<Alert.Title>Failed to load schema config</Alert.Title>
				<Alert.Description>{loadState.message}</Alert.Description>
			</Alert.Root>
		</section>
	{:else}
		<section class="grid grow gap-4 overflow-hidden p-4 lg:grid-cols-[minmax(18rem,24rem)_1fr]">
			<aside class="flex min-h-0 flex-col gap-4">
				<div>
					<p class="mb-2 text-sm font-medium text-muted-foreground">Current form preview</p>
					{#if currentData}
						<Form
							useBuilderContext={false}
							schema={currentData.schema}
							uiSchema={currentData.uiSchema}
							class="p-3!"
						/>
					{/if}
				</div>

				{#if attemptedSave || groupedErrors.length || groupedWarnings.length}
					<Alert.Root variant={groupedErrors.length ? 'destructive' : 'default'}>
						{#if groupedErrors.length}
							<TriangleAlertIcon />
							<Alert.Title>Resolve validation errors before saving</Alert.Title>
						{:else if groupedWarnings.length}
							<TriangleAlertIcon />
							<Alert.Title>Resolve validation warnings before saving</Alert.Title>
						{:else}
							<CheckIcon />
							<Alert.Title>Builder validation passed</Alert.Title>
						{/if}
						<Alert.Description>
							{#if groupedErrors.length || groupedWarnings.length}
								<ul class="mt-2 list-inside list-disc space-y-1">
									{#each groupedErrors as issue}
										<li>{issue.message}</li>
									{/each}
									{#each groupedWarnings as issue}
										<li>{issue.message}</li>
									{/each}
								</ul>
							{:else if lastSavedAt}
								Saved at {lastSavedAt.toLocaleTimeString()}.
							{:else}
								The current schema can be saved.
							{/if}
						</Alert.Description>
					</Alert.Root>
				{/if}
			</aside>

			<div class="min-h-0 overflow-auto">
				<BuilderStandalone initialData={loadState.data} onInit={handleBuilderInit} />
			</div>
		</section>
	{/if}
</main>
