import type { Schema } from '@sjsf/form';

import { Config } from '$core';
import Result from 'true-myth/result';

import type { Repository } from './_types.js';

//

export type Step = Config.Config['workflow']['steps'][number];

/** Return a new step with each substep's order (1-based) and id set to stepId.position. */
export function renumberSubsteps(step: Step): Step {
	return {
		...step,
		substeps: step.substeps.map((sub, j) => ({
			...sub,
			order: j + 1,
			id: `${step.id}.${j + 1}`
		}))
	};
}

function renumberSteps(config: Config.Config): void {
	config.workflow.steps = config.workflow.steps.map((step, i) => {
		const renumbered: Step = {
			...step,
			order: i + 1,
			id: String(i + 1)
		};
		return renumberSubsteps(renumbered);
	});
}

export class StepRepository implements Repository<Step> {
	constructor(private readonly config: Config.Config) {}

	getEntityName(): string {
		return 'Step';
	}

	getKey(record: Step): string {
		return record.id;
	}

	getSchema(): Schema {
		return Config.getEntitySchema('Step');
	}

	list(): Step[] {
		return this.config.workflow.steps;
	}

	getOne(key: string): Result<Step, Error> {
		const step = this.config.workflow.steps.find((s) => s.id === key);
		return step !== undefined ? Result.ok(step) : Result.err(new Error(`Step not found: ${key}`));
	}

	create(data: Step): Result<Step, Error> {
		this.config.workflow.steps = [...this.config.workflow.steps, data];
		renumberSteps(this.config);
		const added = this.config.workflow.steps[this.config.workflow.steps.length - 1];
		return added !== undefined ? Result.ok(added) : Result.ok(data);
	}

	createAt(data: Step, index: number): Result<Step, Error> {
		const steps = [...this.config.workflow.steps];
		steps.splice(index, 0, data);
		this.config.workflow.steps = steps;
		renumberSteps(this.config);
		const added = this.config.workflow.steps[index];
		return added !== undefined ? Result.ok(added) : Result.ok(data);
	}

	moveUp(stepIndex: number): Result<void, Error> {
		if (stepIndex <= 0) return Result.ok(undefined);
		const steps = this.config.workflow.steps;
		const a = steps[stepIndex];
		const b = steps[stepIndex - 1];
		if (!a || !b) return Result.ok(undefined);
		this.config.workflow.steps = steps.map((s, i) => {
			if (i === stepIndex) return b;
			if (i === stepIndex - 1) return a;
			return s;
		});
		renumberSteps(this.config);
		return Result.ok(undefined);
	}

	moveDown(stepIndex: number): Result<void, Error> {
		const steps = this.config.workflow.steps;
		if (stepIndex >= steps.length - 1) return Result.ok(undefined);
		const a = steps[stepIndex];
		const b = steps[stepIndex + 1];
		if (!a || !b) return Result.ok(undefined);
		this.config.workflow.steps = steps.map((s, i) => {
			if (i === stepIndex) return b;
			if (i === stepIndex + 1) return a;
			return s;
		});
		renumberSteps(this.config);
		return Result.ok(undefined);
	}

	update(key: string, data: Step): Result<Step, Error> {
		const index = this.config.workflow.steps.findIndex((s) => s.id === key);
		if (index === -1) {
			return Result.err(new Error(`Step not found: ${key}`));
		}
		const normalized = renumberSubsteps({
			...data,
			id: String(index + 1),
			order: index + 1
		});
		this.config.workflow.steps = this.config.workflow.steps.map((s) =>
			s.id === key ? normalized : s
		);
		return Result.ok(normalized);
	}

	delete(key: string): Result<void, Error> {
		const index = this.config.workflow.steps.findIndex((s) => s.id === key);
		if (index === -1) {
			return Result.err(new Error(`Step not found: ${key}`));
		}
		this.config.workflow.steps = this.config.workflow.steps.filter((s) => s.id !== key);
		renumberSteps(this.config);
		return Result.ok(undefined);
	}
}
