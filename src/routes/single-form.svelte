<script lang="ts">
	import type { UiSchema } from '@sjsf/form';
	import type { BuilderContext } from '$builder/context.svelte.js';

	import { LoaderIcon, SaveIcon, TriangleAlertIcon } from '@lucide/svelte';
	import BuilderStandalone from '$builder/builder-standalone.svelte';
	import * as Alert from '$lib/components/ui/alert/index.js';
	import Button from '$lib/components/ui/button/button.svelte';
	import Input from '$lib/components/ui/input/input.svelte';
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
	let changeReason = $state('');
	let baselineFormSnapshot = $state.raw<string>();
	const trimmedChangeReason = $derived(changeReason.trim());
	const hasChangeReason = $derived(trimmedChangeReason.length > 0);
	const hasFormChanged = $derived.by(() => {
		if (!builder || baselineFormSnapshot === undefined) return false;
		return createFormSnapshot(builder) !== baselineFormSnapshot;
	});
	const canSave = $derived(Boolean(builder) && !saving && hasChangeReason && hasFormChanged);

	function createFormSnapshot(ctx: BuilderContext): string {
		return JSON.stringify($state.snapshot({ rootNode: ctx.rootNode }));
	}

	function handleBuilderInit(ctx: BuilderContext) {
		builder = ctx;
		ctx.validate();
		baselineFormSnapshot = createFormSnapshot(ctx);
	}

	async function handleSave() {
		if (!builder || !canSave) return;
		if (!builder.validate()) {
			toast.error('Fix builder errors and warnings before saving.');
			return;
		}
		builder.build();
		const data = {
			schema: builder.schema,
			uiSchema: builder.uiSchema as UiSchema,
			changeReason: trimmedChangeReason
		};
		saving = true;
		try {
			if (saveUrl) {
				await saveSingleFormConfig(saveUrl, data);
			}
			window.parent?.postMessage({ type: 'formata:schema-saved', ...data }, targetOrigin);
			toast.success('Schema saved');
			baselineFormSnapshot = createFormSnapshot(builder);
			changeReason = '';
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
	<header class="flex min-h-[53px] items-center justify-between gap-4 border-b px-4 py-2">
		<div>
			<p class="font-medium">Single-form builder</p>
			<p class="text-xs text-muted-foreground">
				Edit one JSON Schema and uiSchema pair without workflow storage.
			</p>
		</div>
		<div class="flex flex-wrap items-center justify-end gap-2">
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
			<Input
				aria-label="Change reason"
				class="w-72 max-w-[45vw]"
				disabled={!builder || saving}
				placeholder="Reason for change"
				bind:value={changeReason}
			/>
			<Button onclick={handleSave} disabled={!canSave}>
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
		<section class="grow overflow-auto p-4">
			<BuilderStandalone initialData={loadState.data} onInit={handleBuilderInit} />
		</section>
	{/if}
</main>
