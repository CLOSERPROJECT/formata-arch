import type { Schema, UiSchema } from '@sjsf/form';

import { Config } from '$core';
import HiddenFieldTemplate from '$core/form/hidden-field-template.svelte';
import Result from 'true-myth/result';

import type { Repository } from './_types.js';
import type { Step } from './step.repository.js';

import FormataConfigField from './components/formata-config-field.svelte';
import SelectDepartment from './components/select-department.svelte';

//

export type Substep = Step['substeps'][number];

/** Listed substeps include stepId for composite key (stepId:substepId) */
export type SubstepWithStepId = Substep & { __stepId: string };

function parseKey(key: string): { stepId: string; substepId: string } {
	const idx = key.indexOf(':');
	if (idx === -1) {
		return { stepId: '', substepId: key };
	}
	return { stepId: key.slice(0, idx), substepId: key.slice(idx + 1) };
}

export class SubstepRepository implements Repository<SubstepWithStepId> {
	constructor(private readonly config: Config.Config) {}

	getEntityName(): string {
		return 'Substep';
	}

	getKey(record: SubstepWithStepId): string {
		return `${record.__stepId}:${record.id}`;
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

	list(): SubstepWithStepId[] {
		return this.config.workflow.steps.flatMap((step) =>
			step.substeps.map((sub) => ({ ...sub, __stepId: step.id }))
		);
	}

	getOne(key: string): Result<SubstepWithStepId, Error> {
		const { stepId, substepId } = parseKey(key);
		const step = this.config.workflow.steps.find((s) => s.id === stepId);
		if (!step) {
			return Result.err(new Error(`Substep not found: ${key}`));
		}
		const substep = step.substeps.find((s) => s.id === substepId);
		if (!substep) {
			return Result.err(new Error(`Substep not found: ${key}`));
		}
		return Result.ok({ ...substep, __stepId: step.id });
	}

	create(data: SubstepWithStepId): Result<SubstepWithStepId, Error> {
		const stepId = data.__stepId;
		const step = this.config.workflow.steps.find((s) => s.id === stepId);
		if (!step) {
			return Result.err(new Error(`Step not found: ${stepId}`));
		}
		if (step.substeps.some((s) => s.id === data.id)) {
			return Result.err(new Error(`Substep already exists: ${data.id}`));
		}
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const { __stepId: _, ...substep } = data;
		step.substeps = [...step.substeps, substep].sort((a, b) => a.order - b.order);
		return Result.ok(data);
	}

	update(key: string, data: SubstepWithStepId): Result<SubstepWithStepId, Error> {
		console.log('UPDATE', data);
		const { stepId, substepId } = parseKey(key);
		const step = this.config.workflow.steps.find((s) => s.id === stepId);
		if (!step) {
			return Result.err(new Error(`Substep not found: ${key}`));
		}
		const index = step.substeps.findIndex((s) => s.id === substepId);
		if (index === -1) {
			return Result.err(new Error(`Substep not found: ${key}`));
		}
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const { __stepId: _, ...substep } = data;
		step.substeps = step.substeps.map((s) => (s.id === substepId ? substep : s));
		return Result.ok(data);
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
		step.substeps = step.substeps.filter((s) => s.id !== substepId);
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
		step.substeps = subs.map((s, i) => {
			if (i === substepIndex) return { ...b, order: substepIndex };
			if (i === substepIndex - 1) return { ...a, order: substepIndex - 1 };
			return s;
		});
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
		step.substeps = subs.map((s, i) => {
			if (i === substepIndex) return { ...b, order: substepIndex };
			if (i === substepIndex + 1) return { ...a, order: substepIndex + 1 };
			return s;
		});
		return Result.ok(undefined);
	}
}
