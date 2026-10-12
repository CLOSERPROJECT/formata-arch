<script lang="ts">
	import { ClipboardPasteIcon } from '@lucide/svelte';
	import { app } from '$core/app/index.js';
	import * as AlertDialog from '$lib/components/ui/alert-dialog/index.js';
	import * as Alert from '$lib/components/ui/alert/index.js';
	import Button from '$lib/components/ui/button/button.svelte';
	import { buttonVariants } from '$lib/components/ui/button/index.js';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { Separator } from '$lib/components/ui/separator/index.js';
	import { Textarea } from '$lib/components/ui/textarea/index.js';

	//

	type Props = {
		open?: boolean;
	};

	let { open = $bindable(false) }: Props = $props();

	let files: FileList | undefined = $state();
	let fileText: string | undefined = $state();
	let fileError: string | undefined = $state();
	let pasteText = $state('');
	let pasteError: string | undefined = $state();
	let unsavedConfirmOpen = $state(false);
	let pendingImportText: string | undefined = $state();

	const canConfirm = $derived(fileText !== undefined || pasteText.trim().length > 0);

	function emptyFileList() {
		return new DataTransfer().files;
	}

	function reset() {
		fileText = undefined;
		fileError = undefined;
		pasteText = '';
		pasteError = undefined;
		unsavedConfirmOpen = false;
		pendingImportText = undefined;
		files = emptyFileList();
	}

	function clearFile() {
		fileText = undefined;
		fileError = undefined;
		files = emptyFileList();
	}

	function clearPaste() {
		pasteText = '';
		pasteError = undefined;
	}

	function onOpenChange(next: boolean) {
		open = next;
		if (!next) reset();
	}

	function onFileChange() {
		const file = files?.[0];
		if (!file) {
			fileText = undefined;
			fileError = undefined;
			return;
		}
		clearPaste();
		const reader = new FileReader();
		reader.onload = () => {
			const text = reader.result as string;
			fileText = text;
			const result = app.parseImport(text);
			fileError = result.isErr ? result.error.message : undefined;
		};
		reader.onerror = () => {
			fileText = undefined;
			fileError = 'Failed to read file';
		};
		reader.readAsText(file, 'utf-8');
	}

	function onTextareaInput() {
		clearFile();
	}

	async function onPaste() {
		clearFile();
		try {
			const text = await navigator.clipboard.readText();
			pasteText = text;
			const result = app.parseImport(text);
			pasteError = result.isErr ? result.error.message : undefined;
		} catch {
			pasteError = 'Unable to read clipboard. Check browser permissions.';
		}
	}

	function activeSourceText(): string | undefined {
		if (fileText !== undefined) return fileText;
		if (pasteText.trim().length > 0) return pasteText;
		return undefined;
	}

	function setActiveSourceError(message: string) {
		if (fileText !== undefined) {
			fileError = message;
		} else {
			pasteError = message;
		}
	}

	function applyImport(text: string) {
		const result = app.importFromString(text);
		if (result.isOk) {
			open = false;
			reset();
		} else {
			setActiveSourceError(result.error.message);
		}
	}

	function onConfirm() {
		const text = activeSourceText();
		if (text === undefined) return;

		const parsed = app.parseImport(text);
		if (parsed.isErr) {
			setActiveSourceError(parsed.error.message);
			return;
		}

		if (app.hasChanges) {
			pendingImportText = text;
			unsavedConfirmOpen = true;
			return;
		}

		applyImport(text);
	}

	function onUnsavedContinue() {
		const text = pendingImportText;
		unsavedConfirmOpen = false;
		pendingImportText = undefined;
		if (text === undefined) return;
		applyImport(text);
	}
</script>

<Dialog.Root {open} onOpenChange={onOpenChange}>
	<Dialog.Content
		class="flex max-h-[calc(100dvh-2rem)] flex-col overflow-hidden sm:max-w-lg"
	>
		<Dialog.Header class="shrink-0">
			<Dialog.Title>Import stream</Dialog.Title>
		</Dialog.Header>

		<div class="min-h-0 flex-1 space-y-4 overflow-y-auto">
			<div class="flex flex-col gap-2">
				<label class="text-sm font-medium" for="import-stream-file">YAML file</label>
				<input
					id="import-stream-file"
					type="file"
					accept=".yaml,.yml,application/x-yaml,text/yaml"
					class="block w-full cursor-pointer rounded-md border border-transparent p-1 text-sm transition-colors hover:border-border hover:bg-accent/50 file:me-3 file:cursor-pointer file:rounded-md file:border-0 file:bg-secondary file:px-3 file:py-1.5 file:text-sm file:font-medium file:transition-colors hover:file:bg-secondary/80"
					bind:files
					onchange={onFileChange}
				/>
				{#if fileError}
					<Alert.Root variant="destructive">
						<Alert.Description class="whitespace-pre-wrap">{fileError}</Alert.Description>
					</Alert.Root>
				{/if}
			</div>

			<Separator />

			<div class="flex flex-col gap-2">
				<label class="text-sm font-medium" for="import-stream-paste">Paste YAML</label>
				<Textarea
					id="import-stream-paste"
					bind:value={pasteText}
					oninput={onTextareaInput}
					placeholder="Paste stream YAML here…"
					wrap="off"
					class="min-h-32 overflow-x-auto font-mono text-xs whitespace-pre"
				/>
				{#if pasteError}
					<Alert.Root variant="destructive">
						<Alert.Description class="whitespace-pre-wrap">{pasteError}</Alert.Description>
					</Alert.Root>
				{/if}
				<Button variant="outline" class="self-start" onclick={() => void onPaste()}>
					<ClipboardPasteIcon />
					Paste
				</Button>
			</div>
		</div>

		<Dialog.Footer class="shrink-0">
			<Dialog.Close>
				{#snippet child({ props })}
					<Button {...props} variant="outline">Cancel</Button>
				{/snippet}
			</Dialog.Close>
			<Button disabled={!canConfirm} onclick={onConfirm}>Confirm</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>

<AlertDialog.Root
	bind:open={unsavedConfirmOpen}
	onOpenChange={(next) => {
		if (!next) {
			unsavedConfirmOpen = false;
			pendingImportText = undefined;
		}
	}}
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
					onUnsavedContinue();
				}}
			>
				Continue
			</AlertDialog.Action>
		</AlertDialog.Footer>
	</AlertDialog.Content>
</AlertDialog.Root>
