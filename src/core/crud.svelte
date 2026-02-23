<script lang="ts" generics="T extends object">
	import { PencilIcon, TrashIcon } from '@lucide/svelte';
	import { BasicForm } from '@sjsf/form';
	import * as AlertDialog from '$lib/components/ui/alert-dialog/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Sheet from '$lib/components/ui/sheet/index.js';
	import * as Table from '$lib/components/ui/table/index.js';

	import type { Crud } from './crud.svelte.js';

	//

	interface Props {
		self: Crud<T>;
	}

	let { self: crud }: Props = $props();
</script>

<div class="flex flex-col gap-4">
	<div class="rounded-md border">
		<Table.Root>
			<Table.Header>
				<Table.Row>
					{#each crud.columns as col (col)}
						<Table.Head>{col}</Table.Head>
					{/each}
					<Table.Head class="w-[120px]">Actions</Table.Head>
				</Table.Row>
			</Table.Header>
			<Table.Body>
				{#each crud.records as record (crud.getKey(record))}
					<Table.Row>
						{#each crud.columns as col (col)}
							<Table.Cell>{crud.displayValue((record as Record<string, unknown>)[col])}</Table.Cell>
						{/each}
						<Table.Cell>
							<div class="flex gap-2">
								<Button variant="ghost" size="icon-sm" onclick={() => crud.openEdit(record)}>
									<PencilIcon />
								</Button>
								<Button variant="ghost" size="icon-sm" onclick={() => crud.openDelete(record)}>
									<TrashIcon />
								</Button>
							</div>
						</Table.Cell>
					</Table.Row>
				{/each}
			</Table.Body>
		</Table.Root>
	</div>
</div>

<Sheet.Root bind:open={crud.sheetOpen}>
	<Sheet.Content class="overflow-y-auto">
		<Sheet.Header>
			<Sheet.Title>{crud.editingRecord != null ? 'Edit' : 'Create'}</Sheet.Title>
		</Sheet.Header>
		<div class="p-4">
			<BasicForm form={crud.form} />
		</div>
		<Sheet.Footer>
			<Button variant="outline" onclick={() => (crud.sheetOpen = false)}>Cancel</Button>
		</Sheet.Footer>
	</Sheet.Content>
</Sheet.Root>

<AlertDialog.Root bind:open={crud.deleteDialogOpen}>
	<AlertDialog.Content>
		<AlertDialog.Header>
			<AlertDialog.Title>Delete record</AlertDialog.Title>
			<AlertDialog.Description>This action cannot be undone.</AlertDialog.Description>
		</AlertDialog.Header>
		<AlertDialog.Footer>
			<AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
			<AlertDialog.Action onclick={() => crud.confirmDelete()}>Delete</AlertDialog.Action>
		</AlertDialog.Footer>
	</AlertDialog.Content>
</AlertDialog.Root>
