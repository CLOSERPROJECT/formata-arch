import type { Schema, UiSchema } from '@sjsf/form';

import { Config } from '$core';
import HiddenFieldTemplate from '$core/form/hidden-field-template.svelte';
import Result from 'true-myth/result';

import type { Repository } from './_types.js';

import FormataConfigField from './components/formata-config-field.svelte';
import SelectDepartment from './components/select-department.svelte';
import { renumberSubsteps, type Step } from './step.repository.js';

//

export type Substep = Step['substeps'][number];

/**
 * Composite key is "stepId.substepId" (e.g. "1.1").
 * For create, key can be step id only (e.g. "1") → substepId is "".
 */
function parseKey(key: string): { stepId: string; substepId: string } {
	const idx = key.indexOf('.');
	if (idx === -1) {
		return { stepId: key, substepId: '' };
	}
	return { stepId: key.slice(0, idx), substepId: key };
}

export class SubstepRepository implements Repository<Substep> {
	constructor(private readonly config: Config.Config) {}

	getEntityName(): string {
		return 'Substep';
	}

	getKey(record: Substep): string {
		return record.id;
	}

	getSchema(): Schema {
		return Config.getEntitySchema('Substep');
	}

	getUiSchema(): UiSchema {
		return {
			role: {
				'ui:components': {
					textWidget: SelectDepartment
				},
				'ui:options': {
					attestaConfig: this.config
				}
			},
			uiSchema: {
				'ui:components': {
					objectTemplate: HiddenFieldTemplate
				}
			},
			schema: {
				'ui:components': {
					objectField: FormataConfigField
				}
			}
		};
	}

	list(): Substep[] {
		return this.config.workflow.steps.flatMap((step) =>
			step.substeps.map((sub) => ({ ...sub, id: sub.id }))
		);
	}

	getOne(key: string): Result<Substep, Error> {
		const { stepId, substepId } = parseKey(key);
		const step = this.config.workflow.steps.find((s) => s.id === stepId);
		if (!step) {
			return Result.err(new Error(`Substep not found: ${key}`));
		}
		const substep = step.substeps.find((s) => s.id === substepId);
		if (!substep) {
			return Result.err(new Error(`Substep not found: ${key}`));
		}
		return Result.ok({ ...substep, id: substepId || key });
	}

	create(data: Substep): Result<Substep, Error> {
		const { stepId } = parseKey(data.id);
		if (!stepId) {
			return Result.err(new Error('Substep id must be stepId or stepId.substepId'));
		}
		const step = this.config.workflow.steps.find((s) => s.id === stepId);
		if (!step) {
			return Result.err(new Error(`Step not found: ${stepId}`));
		}
		const substep = { ...data, id: '', order: step.substeps.length + 1 };
		step.substeps = renumberSubsteps({ ...step, substeps: [...step.substeps, substep] }).substeps;
		const created = step.substeps[step.substeps.length - 1];
		return created !== undefined ? Result.ok(created) : Result.ok(data);
	}

	update(key: string, data: Substep): Result<Substep, Error> {
		const { stepId, substepId } = parseKey(key);
		const step = this.config.workflow.steps.find((s) => s.id === stepId);
		if (!step) {
			return Result.err(new Error(`Substep not found: ${key}`));
		}
		const index = step.substeps.findIndex((s) => s.id === substepId);
		if (index === -1) {
			return Result.err(new Error(`Substep not found: ${key}`));
		}
		const substep = { ...data, id: substepId };
		step.substeps = renumberSubsteps({
			...step,
			substeps: step.substeps.map((s) => (s.id === substepId ? substep : s))
		}).substeps;
		const updated = step.substeps[index];
		return updated !== undefined ? Result.ok(updated) : Result.ok({ ...data, id: key });
	}

	delete(key: string): Result<void, Error> {
		const { stepId, substepId } = parseKey(key);
		const step = this.config.workflow.steps.find((s) => s.id === stepId);
		if (!step) {
			return Result.err(new Error(`Substep not found: ${key}`));
		}
		const index = step.substeps.findIndex((s) => s.id === substepId);
		if (index === -1) {
			return Result.err(new Error(`Substep not found: ${key}`));
		}
		step.substeps = renumberSubsteps({
			...step,
			substeps: step.substeps.filter((s) => s.id !== substepId)
		}).substeps;
		return Result.ok(undefined);
	}

	moveUp(stepId: string, substepIndex: number): Result<void, Error> {
		if (substepIndex <= 0) return Result.ok(undefined);
		const step = this.config.workflow.steps.find((s) => s.id === stepId);
		if (!step) return Result.err(new Error(`Step not found: ${stepId}`));
		const subs = step.substeps;
		if (substepIndex >= subs.length) return Result.ok(undefined);
		const a = subs[substepIndex];
		const b = subs[substepIndex - 1];
		if (!a || !b) return Result.ok(undefined);
		step.substeps = renumberSubsteps({
			...step,
			substeps: subs.map((s, i) => {
				if (i === substepIndex) return b;
				if (i === substepIndex - 1) return a;
				return s;
			})
		}).substeps;
		return Result.ok(undefined);
	}

	moveDown(stepId: string, substepIndex: number): Result<void, Error> {
		const step = this.config.workflow.steps.find((s) => s.id === stepId);
		if (!step) return Result.err(new Error(`Step not found: ${stepId}`));
		const subs = step.substeps;
		if (substepIndex >= subs.length - 1) return Result.ok(undefined);
		const a = subs[substepIndex];
		const b = subs[substepIndex + 1];
		if (!a || !b) return Result.ok(undefined);
		step.substeps = renumberSubsteps({
			...step,
			substeps: subs.map((s, i) => {
				if (i === substepIndex) return b;
				if (i === substepIndex + 1) return a;
				return s;
			})
		}).substeps;
		return Result.ok(undefined);
	}
}
