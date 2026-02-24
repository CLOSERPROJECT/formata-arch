<script lang="ts" generics="T extends object">
	import { SaveIcon, Trash2Icon, XIcon } from '@lucide/svelte';
	import * as AlertDialog from '$lib/components/ui/alert-dialog/index.js';
	import { Button } from '$lib/components/ui/button/index.js';

	import type { Crud } from './crud.svelte.js';

	//

	interface Props {
		self: Crud<T>;
		hideSubmitButton?: boolean;
		/** Optional label for title, e.g. "step" → "Edit step" / "Create step" */
		formTitle?: string;
		/** Called after delete is confirmed (after confirmDelete()). */
		onConfirmDelete?: () => void;
	}

	let { self: crud, hideSubmitButton = false, formTitle, onConfirmDelete }: Props = $props();

	const formHeading = $derived(
		formTitle
			? crud.editingRecord != null
				? `Edit ${formTitle}`
				: `Create ${formTitle}`
			: crud.editingRecord != null
				? 'Edit'
				: 'Create'
	);
</script>

{#if crud.isFormOpen}
	<div class="flex flex-col gap-4">
		<div class="flex items-center justify-between gap-2">
			<div class="flex items-center gap-2">
				<h2 class="text-lg font-semibold">{formHeading}</h2>
				{#if crud.editingRecord}
					<Button
						variant="ghost"
						size="icon-sm"
						class="text-muted-foreground"
						onclick={() => crud.openDelete(crud.editingRecord as T)}
					>
						<Trash2Icon />
					</Button>
				{/if}
			</div>
			<div>
				<Button variant="outline" onclick={() => (crud.isFormOpen = false)}>
					<XIcon />
					Cancel
				</Button>
				<Button onclick={() => crud.submitForm()}>
					<SaveIcon />
					Save
				</Button>
			</div>
		</div>

		<div>
			<crud.Form self={crud} {hideSubmitButton} />
		</div>
	</div>
{/if}

<AlertDialog.Root bind:open={crud.isDeleteDialogOpen}>
	<AlertDialog.Content>
		<AlertDialog.Header>
			<AlertDialog.Title>Delete record</AlertDialog.Title>
			<AlertDialog.Description>This action cannot be undone.</AlertDialog.Description>
		</AlertDialog.Header>
		<AlertDialog.Footer>
			<AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
			<AlertDialog.Action
				onclick={() => {
					crud.confirmDelete();
					onConfirmDelete?.();
				}}
			>
				Delete
			</AlertDialog.Action>
		</AlertDialog.Footer>
	</AlertDialog.Content>
</AlertDialog.Root>
