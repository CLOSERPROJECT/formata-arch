import { toast } from 'svelte-sonner';

import type { Repository } from './repositories/index.js';

import CrudComponent from './crud.svelte';
import { makeForm } from './form.svelte.js';

//

export class Crud<T extends object> {
	constructor(private repository: Repository<T>) {}

	get Component() {
		return CrudComponent;
	}

	get schema() {
		return this.repository.getSchema();
	}
	get uiSchema() {
		return this.repository.getUiSchema?.();
	}
	get records() {
		return this.repository.list();
	}
	get entityName() {
		return (
			(typeof this.schema.$ref === 'string' ? this.schema.$ref.replace('#/$defs/', '') : '') || ''
		);
	}
	get def() {
		return this.schema.$defs?.[this.entityName as keyof typeof this.schema.$defs];
	}
	get columns() {
		return this.def &&
			typeof this.def === 'object' &&
			'properties' in this.def &&
			this.def.properties
			? (Object.keys(this.def.properties as object) as string[]).filter((k) => k !== '__stepId')
			: [];
	}

	#form = $derived.by(() =>
		makeForm<T>({
			schema: this.schema,
			uiSchema: this.uiSchema,
			initialValue: this.editingRecord ?? undefined,
			onSubmit: (value) => this.handleSubmit(value)
		})
	);

	get form() {
		return this.#form;
	}

	formElement = $state<HTMLFormElement>();
	submitForm() {
		this.formElement?.requestSubmit();
	}

	sheetOpen = $state(false);
	editingRecord = $state<T | null>(null);
	deleteDialogOpen = $state(false);
	recordToDelete = $state<T | null>(null);

	getKey(record: T): string {
		return this.repository.getKey?.(record) ?? (record as { id?: string }).id ?? '';
	}

	openCreate() {
		this.editingRecord = null;
		this.sheetOpen = true;
	}

	openEdit(record: T) {
		this.editingRecord = record;
		this.sheetOpen = true;
	}

	openDelete(record: T) {
		this.recordToDelete = record;
		this.deleteDialogOpen = true;
	}

	handleSubmit(value: T) {
		if (this.editingRecord != null) {
			const key = this.getKey(this.editingRecord);
			const result = this.repository.update(key, value);
			if (result.isOk) {
				toast.success('Record updated');
				this.sheetOpen = false;
			} else {
				toast.error(result.error.message);
			}
		} else {
			const result = this.repository.create(value);
			if (result.isOk) {
				toast.success('Record created');
				this.sheetOpen = false;
			} else {
				toast.error(result.error.message);
			}
		}
	}

	confirmDelete() {
		if (this.recordToDelete == null) return;
		const key = this.getKey(this.recordToDelete);
		const result = this.repository.delete(key);
		if (result.isOk) {
			toast.success('Record deleted');
			this.deleteDialogOpen = false;
			this.recordToDelete = null;
		} else {
			toast.error(result.error.message);
		}
	}

	displayValue(value: unknown): string {
		if (value == null) return '';
		if (typeof value === 'object') return JSON.stringify(value);
		return String(value);
	}
}
