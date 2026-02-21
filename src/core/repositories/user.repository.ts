import type { Repository } from './index.js';
import type { AttestaConfig, AttestaConfigSchema } from '$core/schema.js';
import type { FromSchema } from 'json-schema-to-ts';
import type { Schema, UiSchema } from '@sjsf/form';
import { getEntitySchema } from './utils.js';
import Result from 'true-myth/result';
import SelectDepartment from '$core/form/select-department.svelte';

//

export type User = FromSchema<AttestaConfigSchema['$defs']['User']>;

export class UserRepository implements Repository<User> {
	constructor(private readonly config: AttestaConfig) {}

	getSchema(): Schema {
		return getEntitySchema('User');
	}

	getUiSchema(): UiSchema {
		return {
			departmentId: {
				'ui:components': {
					textWidget: SelectDepartment
				},
				'ui:options': {
					attestaConfig: this.config
				}
			}
		};
	}

	list(): User[] {
		return this.config.users;
	}

	getOne(key: string): Result<User, Error> {
		const user = this.config.users.find((u) => u.id === key);
		return user !== undefined ? Result.ok(user) : Result.err(new Error(`User not found: ${key}`));
	}

	create(data: User): Result<User, Error> {
		if (this.config.users.some((u) => u.id === data.id)) {
			return Result.err(new Error(`User already exists: ${data.id}`));
		}
		this.config.users = [...this.config.users, data];
		return Result.ok(data);
	}

	update(key: string, data: User): Result<User, Error> {
		const index = this.config.users.findIndex((u) => u.id === key);
		if (index === -1) {
			return Result.err(new Error(`User not found: ${key}`));
		}
		this.config.users = this.config.users.map((u) => (u.id === key ? data : u));
		return Result.ok(data);
	}

	delete(key: string): Result<void, Error> {
		const index = this.config.users.findIndex((u) => u.id === key);
		if (index === -1) {
			return Result.err(new Error(`User not found: ${key}`));
		}
		this.config.users = this.config.users.filter((u) => u.id !== key);
		return Result.ok(undefined);
	}
}
