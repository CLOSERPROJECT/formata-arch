import type { Schema, UiSchema } from '@sjsf/form';

import { Config } from '$core';
import Result from 'true-myth/result';

import type { Repository } from './_types.js';

import SelectDepartment from './components/select-department.svelte';

//

export type Role = Config.Config['roles'][number];

export class RoleRepository implements Repository<Role> {
	constructor(private readonly config: Config.Config) {}

	getEntityName(): string {
		return 'Role';
	}

	getKey(record: Role): string {
		return record.id;
	}

	getSchema(): Schema {
		return Config.getEntitySchema('Role');
	}

	getUiSchema(): UiSchema {
		return {
			orgSlug: {
				'ui:components': {
					textWidget: SelectDepartment
				},
				'ui:options': {
					attestaConfig: this.config
				}
			}
		};
	}

	list(): Role[] {
		return this.config.roles;
	}

	getOne(key: string): Result<Role, Error> {
		const role = this.config.roles.find((r) => r.id === key);
		return role !== undefined ? Result.ok(role) : Result.err(new Error(`Role not found: ${key}`));
	}

	create(data: Role): Result<Role, Error> {
		if (this.config.roles.some((r) => r.id === data.id)) {
			return Result.err(new Error(`Role already exists: ${data.id}`));
		}
		this.config.roles = [...this.config.roles, data];
		return Result.ok(data);
	}

	update(key: string, data: Role): Result<Role, Error> {
		const index = this.config.roles.findIndex((r) => r.id === key);
		if (index === -1) {
			return Result.err(new Error(`Role not found: ${key}`));
		}
		this.config.roles = this.config.roles.map((r) => (r.id === key ? data : r));
		return Result.ok(data);
	}

	delete(key: string): Result<void, Error> {
		const index = this.config.roles.findIndex((r) => r.id === key);
		if (index === -1) {
			return Result.err(new Error(`Role not found: ${key}`));
		}
		this.config.roles = this.config.roles.filter((r) => r.id !== key);
		return Result.ok(undefined);
	}
}
