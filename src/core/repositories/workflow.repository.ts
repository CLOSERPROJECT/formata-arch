import type { Schema, UiSchema } from '@sjsf/form';
import type { AttestaConfig } from '$core/schema.js';

import SelectDepartment from '$core/form/select-department.svelte';
import Result from 'true-myth/result';

import type { Repository } from './index.js';

import { getEntitySchema } from './utils.js';

//

const WORKFLOW_KEY = 'workflow';

export type Workflow = AttestaConfig['workflow'];

export class WorkflowRepository implements Repository<Workflow> {
	constructor(private readonly config: AttestaConfig) {}

	getSchema(): Schema {
		return getEntitySchema('Workflow');
	}

	getUiSchema(): UiSchema {
		return {
			steps: {
				items: {
					substeps: {
						items: {
							role: {
								'ui:components': {
									textWidget: SelectDepartment
								},
								'ui:options': {
									attestaConfig: this.config
								}
							}
						}
					}
				}
			}
		};
	}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	getKey(_: Workflow): string {
		return WORKFLOW_KEY;
	}

	list(): Workflow[] {
		return [this.config.workflow];
	}

	getOne(key: string): Result<Workflow, Error> {
		if (key !== WORKFLOW_KEY) {
			return Result.err(new Error(`Workflow not found: ${key}`));
		}
		return Result.ok(this.config.workflow);
	}

	create(data: Workflow): Result<Workflow, Error> {
		this.config.workflow = data;
		return Result.ok(this.config.workflow);
	}

	update(key: string, data: Workflow): Result<Workflow, Error> {
		if (key !== WORKFLOW_KEY) {
			return Result.err(new Error(`Workflow not found: ${key}`));
		}
		this.config.workflow = data;
		return Result.ok(this.config.workflow);
	}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	delete(_: string): Result<void, Error> {
		return Result.err(new Error('Cannot delete workflow'));
	}
}
