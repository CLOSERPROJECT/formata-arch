<script lang="ts" generics="T extends object">
	import type { Repository } from './repositories/index.js';
	import type { Schema } from '@sjsf/form';
	import Form from './form.svelte';
	import * as Sheet from '$lib/components/ui/sheet/index.js';
	import * as AlertDialog from '$lib/components/ui/alert-dialog/index.js';
	import * as Table from '$lib/components/ui/table/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { toast } from 'svelte-sonner';

	// Defer toast to next tick to avoid svelte-sonner race (Toast.svelte reads heights[].toastId)
	function showToast(fn: () => void) {
		queueMicrotask(fn);
	}

	interface Props {
		repository: Repository<T>;
	}

	let { repository }: Props = $props();

	const schema = $derived(repository.getSchema());
	const records = $derived(repository.list());

	const entityName = $derived(
		(typeof schema.$ref === 'string' ? schema.$ref.replace('#/$defs/', '') : '') || ''
	);
	const def = $derived(schema.$defs?.[entityName as keyof typeof schema.$defs]);
	const columns = $derived(
		def && typeof def === 'object' && 'properties' in def && def.properties
			? (Object.keys(def.properties as object) as string[]).filter((k) => k !== '__stepId')
			: []
	);

	let sheetOpen = $state(false);
	let editingRecord = $state<T | null>(null);
	let deleteDialogOpen = $state(false);
	let recordToDelete = $state<T | null>(null);

	function getKey(record: T): string {
		return repository.getKey?.(record) ?? (record as { id?: string }).id ?? '';
	}

	function openCreate() {
		editingRecord = null;
		sheetOpen = true;
	}

	function openEdit(record: T) {
		editingRecord = record;
		sheetOpen = true;
	}

	function openDelete(record: T) {
		recordToDelete = record;
		deleteDialogOpen = true;
	}

	function handleSubmit(value: T) {
		if (editingRecord != null) {
			const key = getKey(editingRecord);
			const result = repository.update(key, value);
			if (result.isOk) {
				showToast(() => toast.success('Record updated'));
				sheetOpen = false;
				editingRecord = null;
			} else {
				showToast(() => toast.error(result.error.message));
			}
		} else {
			const result = repository.create(value);
			if (result.isOk) {
				showToast(() => toast.success('Record created'));
				sheetOpen = false;
			} else {
				showToast(() => toast.error(result.error.message));
			}
		}
	}

	function confirmDelete() {
		if (recordToDelete == null) return;
		const key = getKey(recordToDelete);
		const result = repository.delete(key);
		if (result.isOk) {
			showToast(() => toast.success('Record deleted'));
			deleteDialogOpen = false;
			recordToDelete = null;
		} else {
			showToast(() => toast.error(result.error.message));
		}
	}

	function displayValue(value: unknown): string {
		if (value == null) return '';
		if (typeof value === 'object') return JSON.stringify(value);
		return String(value);
	}
</script>

<div class="flex flex-col gap-4 p-4">
	<div class="flex items-center justify-between">
		<Button onclick={openCreate}>Create</Button>
	</div>

	<div class="rounded-md border">
		<Table.Root>
			<Table.Header>
				<Table.Row>
					{#each columns as col}
						<Table.Head>{col}</Table.Head>
					{/each}
					<Table.Head class="w-[120px]">Actions</Table.Head>
				</Table.Row>
			</Table.Header>
			<Table.Body>
				{#each records as record (getKey(record))}
					<Table.Row>
						{#each columns as col}
							<Table.Cell>{displayValue((record as Record<string, unknown>)[col])}</Table.Cell>
						{/each}
						<Table.Cell>
							<div class="flex gap-2">
								<Button variant="outline" size="sm" onclick={() => openEdit(record)}>Edit</Button>
								<Button variant="destructive" size="sm" onclick={() => openDelete(record)}>Delete</Button>
							</div>
						</Table.Cell>
					</Table.Row>
				{/each}
			</Table.Body>
		</Table.Root>
	</div>
</div>

<Sheet.Root bind:open={sheetOpen}>
	<Sheet.Content>
		<Sheet.Header>
			<Sheet.Title>{editingRecord != null ? 'Edit' : 'Create'}</Sheet.Title>
		</Sheet.Header>
		<div class="p-4">
			<Form
				schema={schema}
				initialValue={editingRecord ?? undefined}
				onSubmit={handleSubmit}
			/>
		</div>
		<Sheet.Footer>
			<Button variant="outline" onclick={() => (sheetOpen = false)}>Cancel</Button>
		</Sheet.Footer>
	</Sheet.Content>
</Sheet.Root>

<AlertDialog.Root bind:open={deleteDialogOpen}>
	<AlertDialog.Content>
		<AlertDialog.Header>
			<AlertDialog.Title>Delete record</AlertDialog.Title>
			<AlertDialog.Description>
				This action cannot be undone.
			</AlertDialog.Description>
		</AlertDialog.Header>
		<AlertDialog.Footer>
			<AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
			<AlertDialog.Action onclick={confirmDelete}>Delete</AlertDialog.Action>
		</AlertDialog.Footer>
	</AlertDialog.Content>
</AlertDialog.Root>
