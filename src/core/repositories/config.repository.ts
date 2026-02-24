import type { Schema } from '@sjsf/form';

import { Config } from '$core';
import Result from 'true-myth/result';

import type { Repository } from './_types.js';

//

const CONFIG_KEY = 'config';

export class ConfigRepository implements Repository<Config.Config> {
	constructor(private readonly config: Config.Config) {}

	getEntityName(): string {
		return 'Config';
	}

	getSchema(): Schema {
		return Config.getEntitySchema('Config');
	}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	getKey(_: Config.Config): string {
		return CONFIG_KEY;
	}

	list(): Config.Config[] {
		return [this.config];
	}

	getOne(key: string): Result<Config.Config, Error> {
		if (key !== CONFIG_KEY) {
			return Result.err(new Error(`Config not found: ${key}`));
		}
		return Result.ok(this.config);
	}

	create(data: Config.Config): Result<Config.Config, Error> {
		this.config.workflow = data.workflow;
		this.config.departments = data.departments;
		this.config.users = data.users;
		this.config.dpp = data.dpp;
		return Result.ok(this.config);
	}

	update(key: string, data: Config.Config): Result<Config.Config, Error> {
		if (key !== CONFIG_KEY) {
			return Result.err(new Error(`Config not found: ${key}`));
		}
		this.config.workflow = data.workflow;
		this.config.departments = data.departments;
		this.config.users = data.users;
		this.config.dpp = data.dpp;
		return Result.ok(this.config);
	}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	delete(_: string): Result<void, Error> {
		return Result.err(new Error('Cannot delete config'));
	}
}
