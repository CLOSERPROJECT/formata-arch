import type { Schema } from '@sjsf/form';
import type { FromSchema } from 'json-schema-to-ts';

import { Config } from '$core';
import Result from 'true-myth/result';

import type { Repository } from './_types.js';

//

export type Department = FromSchema<Config.Schema['$defs']['Department']>;

export class DepartmentRepository implements Repository<Department> {
	constructor(private readonly config: Config.Config) {}

	getEntityName(): string {
		return 'Department';
	}

	getKey(record: Department): string {
		return record.id;
	}

	getSchema(): Schema {
		return Config.getEntitySchema('Department');
	}

	list(): Department[] {
		return this.config.departments;
	}

	getOne(key: string): Result<Department, Error> {
		const dept = this.config.departments.find((d) => d.id === key);
		return dept !== undefined
			? Result.ok(dept)
			: Result.err(new Error(`Department not found: ${key}`));
	}

	create(data: Department): Result<Department, Error> {
		if (this.config.departments.some((d) => d.id === data.id)) {
			return Result.err(new Error(`Department already exists: ${data.id}`));
		}
		this.config.departments = [...this.config.departments, data];
		return Result.ok(data);
	}

	update(key: string, data: Department): Result<Department, Error> {
		const index = this.config.departments.findIndex((d) => d.id === key);
		if (index === -1) {
			return Result.err(new Error(`Department not found: ${key}`));
		}
		const newId = data.id;
		if (key !== newId) {
			if (this.config.departments.some((d) => d.id === newId)) {
				return Result.err(new Error(`Department already exists: ${newId}`));
			}
			// Update all dependents before changing the department id
			this.config.users = this.config.users.map((u) =>
				u.departmentId === key ? { ...u, departmentId: newId } : u
			);
			this.config.workflow = {
				...this.config.workflow,
				steps: this.config.workflow.steps.map((step) => ({
					...step,
					substeps: step.substeps.map((sub) =>
						sub.role === key ? { ...sub, role: newId } : sub
					)
				}))
			};
		}
		this.config.departments = this.config.departments.map((d) => (d.id === key ? data : d));
		return Result.ok(data);
	}

	delete(key: string): Result<void, Error> {
		const index = this.config.departments.findIndex((d) => d.id === key);
		if (index === -1) {
			return Result.err(new Error(`Department not found: ${key}`));
		}
		this.config.departments = this.config.departments.filter((d) => d.id !== key);
		return Result.ok(undefined);
	}
}
