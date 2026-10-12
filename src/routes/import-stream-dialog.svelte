<script lang="ts">
	import { ClipboardPasteIcon, TriangleAlertIcon } from '@lucide/svelte';
	import * as AlertDialog from '$lib/components/ui/alert-dialog/index.js';
	import * as Alert from '$lib/components/ui/alert/index.js';
	import Button from '$lib/components/ui/button/button.svelte';
	import { buttonVariants } from '$lib/components/ui/button/index.js';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { Separator } from '$lib/components/ui/separator/index.js';
	import { Textarea } from '$lib/components/ui/textarea/index.js';

	import { ImportStreamDialogState } from './import-stream-dialog.svelte.js';

	//

	type Props = {
		open?: boolean;
	};

	let { open = $bindable(false) }: Props = $props();

	const s = new ImportStreamDialogState();
	const syncOpen = (v: boolean) => {
		open = v;
	};
</script>

<Dialog.Root {open} onOpenChange={(next) => s.onOpenChange(next, syncOpen)}>
	<Dialog.Content
		class="flex h-[calc(100dvh-2rem)] max-h-[calc(100dvh-2rem)] flex-col overflow-hidden sm:max-w-lg"
	>
		<Dialog.Header class="shrink-0">
			<Dialog.Title>Import stream</Dialog.Title>
		</Dialog.Header>

		<div class="flex min-h-0 flex-1 flex-col gap-4 overflow-hidden">
			<div class="flex shrink-0 flex-col gap-2">
				<label class="text-sm font-medium" for="import-stream-file">YAML file</label>
				<input
					id="import-stream-file"
					type="file"
					accept=".yaml,.yml,application/x-yaml,text/yaml"
					class="block w-full cursor-pointer rounded-md border border-transparent p-1 text-sm transition-colors hover:border-border hover:bg-accent/50 file:me-3 file:cursor-pointer file:rounded-md file:border-0 file:bg-secondary file:px-3 file:py-1.5 file:text-sm file:font-medium file:transition-colors hover:file:bg-secondary/80"
					bind:files={s.files}
					onchange={() => s.onFileChange()}
				/>
				{#if s.fileBlockingMessage}
					<Alert.Root class="max-h-28 overflow-y-auto border-destructive text-destructive">
						<TriangleAlertIcon />
						<Alert.Description class="whitespace-pre-wrap">{s.fileBlockingMessage}</Alert.Description>
					</Alert.Root>
				{:else if s.fileFixable.length > 0}
					<Alert.Root class="max-h-28 overflow-y-auto border-warning text-warning">
						<TriangleAlertIcon />
						<Alert.Description class="whitespace-pre-wrap">{s.fileFixableSummary}</Alert.Description>
					</Alert.Root>
				{/if}
			</div>

			<Separator class="shrink-0" />

			<div class="flex min-h-0 flex-1 flex-col gap-2">
				<div class="flex shrink-0 items-baseline justify-between gap-3">
					<label class="text-sm font-medium" for="import-stream-paste">YAML code</label>
					<button
						type="button"
						class="inline-flex items-center gap-1.5 text-sm font-medium text-primary underline-offset-4 hover:underline"
						onclick={() => void s.onPaste()}
					>
						<ClipboardPasteIcon class="size-3.5" />
						Paste
					</button>
				</div>
				<Textarea
					id="import-stream-paste"
					bind:value={s.pasteText}
					oninput={() => s.onTextareaInput()}
					onpaste={() => s.onTextareaPaste()}
					placeholder="Paste stream YAML here…"
					wrap="off"
					class="min-h-0 flex-1 overflow-auto font-mono text-xs field-sizing-fixed whitespace-pre"
				/>
				{#if s.pasteBlockingMessage}
					<Alert.Root
						class="max-h-28 shrink-0 overflow-y-auto border-destructive text-destructive"
					>
						<TriangleAlertIcon />
						<Alert.Description class="whitespace-pre-wrap">{s.pasteBlockingMessage}</Alert.Description>
					</Alert.Root>
				{:else if s.pasteFixable.length > 0}
					<Alert.Root class="max-h-28 shrink-0 overflow-y-auto border-warning text-warning">
						<TriangleAlertIcon />
						<Alert.Description class="whitespace-pre-wrap">{s.pasteFixableSummary}</Alert.Description>
					</Alert.Root>
				{/if}
			</div>
		</div>

		<Dialog.Footer class="shrink-0">
			<Dialog.Close>
				{#snippet child({ props })}
					<Button {...props} variant="outline">Cancel</Button>
				{/snippet}
			</Dialog.Close>
			<Button disabled={!s.canConfirm} onclick={() => s.onConfirm(syncOpen)}>Confirm</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>

<AlertDialog.Root
	bind:open={s.unsavedConfirmOpen}
	onOpenChange={(next) => s.onUnsavedOpenChange(next)}
>
	<AlertDialog.Content>
		<AlertDialog.Header>
			<AlertDialog.Title>Unsaved changes</AlertDialog.Title>
			<AlertDialog.Description>
				Importing will replace your current draft and discard unsaved changes. This cannot be undone.
			</AlertDialog.Description>
		</AlertDialog.Header>
		<AlertDialog.Footer>
			<AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
			<AlertDialog.Action
				class={buttonVariants({ variant: 'destructive' })}
				onclick={(e) => {
					e.preventDefault();
					s.onUnsavedContinue(syncOpen);
				}}
			>
				Continue
			</AlertDialog.Action>
		</AlertDialog.Footer>
	</AlertDialog.Content>
</AlertDialog.Root>
