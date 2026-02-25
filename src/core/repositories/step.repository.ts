import type { Schema } from '@sjsf/form';

import { Config } from '$core';
import Result from 'true-myth/result';

import type { Repository } from './_types.js';

//

export type Step = Config.Config['workflow']['steps'][number];

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
		if (this.config.workflow.steps.some((s) => s.id === data.id)) {
			return Result.err(new Error(`Step already exists: ${data.id}`));
		}
		this.config.workflow.steps = [...this.config.workflow.steps, data];
		return Result.ok(data);
	}

	createAt(data: Step, index: number): Result<Step, Error> {
		if (this.config.workflow.steps.some((s) => s.id === data.id)) {
			return Result.err(new Error(`Step already exists: ${data.id}`));
		}
		const steps = [...this.config.workflow.steps];
		const step = { ...data, order: index };
		steps.splice(index, 0, step);
		this.config.workflow.steps = steps;
		return Result.ok(step);
	}

	moveUp(stepIndex: number): Result<void, Error> {
		if (stepIndex <= 0) return Result.ok(undefined);
		const steps = this.config.workflow.steps;
		const a = steps[stepIndex];
		const b = steps[stepIndex - 1];
		if (!a || !b) return Result.ok(undefined);
		this.config.workflow.steps = steps.map((s, i) => {
			if (i === stepIndex) return { ...b, order: stepIndex };
			if (i === stepIndex - 1) return { ...a, order: stepIndex - 1 };
			return s;
		});
		return Result.ok(undefined);
	}

	moveDown(stepIndex: number): Result<void, Error> {
		const steps = this.config.workflow.steps;
		if (stepIndex >= steps.length - 1) return Result.ok(undefined);
		const a = steps[stepIndex];
		const b = steps[stepIndex + 1];
		if (!a || !b) return Result.ok(undefined);
		this.config.workflow.steps = steps.map((s, i) => {
			if (i === stepIndex) return { ...b, order: stepIndex };
			if (i === stepIndex + 1) return { ...a, order: stepIndex + 1 };
			return s;
		});
		return Result.ok(undefined);
	}

	update(key: string, data: Step): Result<Step, Error> {
		const index = this.config.workflow.steps.findIndex((s) => s.id === key);
		if (index === -1) {
			return Result.err(new Error(`Step not found: ${key}`));
		}
		this.config.workflow.steps = this.config.workflow.steps.map((s) => (s.id === key ? data : s));
		return Result.ok(data);
	}

	delete(key: string): Result<void, Error> {
		const index = this.config.workflow.steps.findIndex((s) => s.id === key);
		if (index === -1) {
			return Result.err(new Error(`Step not found: ${key}`));
		}
		this.config.workflow.steps = this.config.workflow.steps.filter((s) => s.id !== key);
		return Result.ok(undefined);
	}
}
