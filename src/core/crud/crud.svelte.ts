import type { Repository } from '$core/repositories/index.js';

import { Form } from '$core';
import { toast } from 'svelte-sonner';

import CrudForm from './crud-form.svelte';
import CrudFormsComponent from './crud-forms.svelte';
import CrudTableComponent from './crud-table.svelte';

//

export class Crud<T extends object> {
	constructor(private repository: Repository<T>) {}

	// Components

	get Table() {
		return CrudTableComponent;
	}
	get Form() {
		return CrudForm;
	}
	get Forms() {
		return CrudFormsComponent;
	}

	// Getters

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
		return this.repository.getEntityName();
	}
	get def() {
		return this.schema.$defs?.[this.entityName];
	}
	get columns() {
		return this.def &&
			typeof this.def === 'object' &&
			'properties' in this.def &&
			this.def.properties
			? (Object.keys(this.def.properties as object) as string[]).filter((k) => k !== '__stepId')
			: [];
	}

	// Create / Edit Form

	#form = $derived.by(() =>
		Form.make<T>({
			schema: this.schema,
			uiSchema: this.uiSchema,
			initialValue: this.editingRecord ?? this.createInitialValue ?? undefined,
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

	isFormOpen = $state(false);
	editingRecord = $state<T | null>(null);
	createInitialValue = $state<Partial<T> | null>(null);
	/** When set, handleSubmit (create path) will call this instead of repository.create, then clear it. */
	createCallback = $state<((value: T) => void) | null>(null);
	isDeleteDialogOpen = $state(false);
	recordToDelete = $state<T | null>(null);

	openCreate(initialValue?: Partial<T>) {
		this.editingRecord = null;
		this.createInitialValue = initialValue ?? null;
		this.createCallback = null;
		this.isFormOpen = true;
	}

	openCreateWithCallback(initialValue: Partial<T>, onCreate: (value: T) => void) {
		this.editingRecord = null;
		this.createInitialValue = initialValue ?? null;
		this.createCallback = onCreate;
		this.isFormOpen = true;
	}

	openEdit(record: T) {
		this.editingRecord = record;
		this.createInitialValue = null;
		this.createCallback = null;
		this.isFormOpen = true;
	}

	openDelete(record: T) {
		this.recordToDelete = record;
		this.isDeleteDialogOpen = true;
	}

	handleSubmit(value: T) {
		if (this.editingRecord != null) {
			const key = this.repository.getKey(this.editingRecord);
			const result = this.repository.update(key, value);
			if (result.isOk) {
				toast.success('Record updated');
				this.isFormOpen = false;
			} else {
				toast.error(result.error.message);
			}
		} else {
			const callback = this.createCallback;
			if (callback) {
				callback(value);
				this.createCallback = null;
				this.createInitialValue = null;
				this.isFormOpen = false;
				toast.success('Record created');
			} else {
				const result = this.repository.create(value);
				if (result.isOk) {
					toast.success('Record created');
					this.isFormOpen = false;
					this.createInitialValue = null;
				} else {
					toast.error(result.error.message);
				}
			}
		}
	}

	confirmDelete() {
		if (this.recordToDelete == null) return;
		const key = this.repository.getKey(this.recordToDelete);
		const result = this.repository.delete(key);
		if (result.isOk) {
			toast.success('Record deleted');
			this.isDeleteDialogOpen = false;
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

	getKey(record: T): string {
		return this.repository.getKey(record);
	}
}
