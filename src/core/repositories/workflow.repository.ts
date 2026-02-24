import type { Schema, UiSchema } from '@sjsf/form';

import { Config } from '$core';
import HiddenObjectField from '$core/form/hidden-object-field.svelte';
import Result from 'true-myth/result';

import type { Repository } from './_types.js';

import FormataConfigField from './components/formata-config-field.svelte';
import SelectDepartment from './components/select-department.svelte';

//

const WORKFLOW_KEY = 'workflow';

export type Workflow = Config.Config['workflow'];

export class WorkflowRepository implements Repository<Workflow> {
	constructor(private readonly config: Config.Config) {}

	getEntityName(): string {
		return 'Workflow';
	}

	getSchema(): Schema {
		return Config.getEntitySchema('Workflow');
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
							},
							uiSchema: {
								'ui:components': {
									objectField: HiddenObjectField
								}
							},
							schema: {
								'ui:components': {
									objectField: FormataConfigField
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
