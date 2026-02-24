import type { Schema } from '@sjsf/form';

import { Config } from '$core';
import Result from 'true-myth/result';

import type { Repository } from './_types.js';

//

export type Step = Config.Config['workflow']['steps'][number];

export class StepRepository implements Repository<Step> {
	constructor(private readonly config: Config.Config) {}

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
