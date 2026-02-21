import type { Schema, UiSchema } from '@sjsf/form';
import type Result from 'true-myth/result';
import type { Entities } from './utils.js';
import type { AttestaConfig } from '$core/schema.js';
import { ConfigRepository } from './config.repository.js';
import { DepartmentRepository } from './department.repository.js';
import { DppRepository } from './dpp.repository.js';
import { StepRepository } from './step.repository.js';
import { SubstepRepository } from './substep.repository.js';
import { UserRepository } from './user.repository.js';
import { WorkflowRepository } from './workflow.repository.js';

//

export type Repository<T> = {
	getSchema: () => Schema;
	getUiSchema?: () => UiSchema;
	list(): T[];
	getOne(key: string): Result<T, Error>;
	/** Return stable key for a record (default: (record as any).id) */
	getKey?(record: T): string;
	create: (data: T) => Result<T, Error>;
	update: (key: string, data: T) => Result<T, Error>;
	delete: (key: string) => Result<void, Error>;
};

export function getRepository(entity: Entities, config: AttestaConfig): Repository<any> {
	switch (entity) {
		case 'Config':
			return new ConfigRepository(config);
		case 'Department':
			return new DepartmentRepository(config);
		case 'Dpp':
			return new DppRepository(config);
		case 'Step':
			return new StepRepository(config);
		case 'Substep':
			return new SubstepRepository(config);
		case 'User':
			return new UserRepository(config);
		case 'Workflow':
			return new WorkflowRepository(config);
		default:
			throw new Error(`Repository for entity ${entity} not found`);
	}
}
