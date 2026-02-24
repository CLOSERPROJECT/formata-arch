import type { Schema } from '@sjsf/form';
import type { FromSchema } from 'json-schema-to-ts';

import { Config } from '$core';
import Result from 'true-myth/result';

import type { Repository } from './_types.js';

//

const DPP_KEY = 'dpp';

export type Dpp = FromSchema<Config.Schema['$defs']['Dpp']>;

export class DppRepository implements Repository<Dpp> {
	constructor(private readonly config: Config.Config) {}

	getSchema(): Schema {
		return Config.getEntitySchema('Dpp');
	}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	getKey(_: Dpp): string {
		return DPP_KEY;
	}

	list(): Dpp[] {
		return [this.config.dpp];
	}

	getOne(key: string): Result<Dpp, Error> {
		if (key !== DPP_KEY) {
			return Result.err(new Error(`Dpp not found: ${key}`));
		}
		return Result.ok(this.config.dpp);
	}

	create(data: Dpp): Result<Dpp, Error> {
		Object.assign(this.config.dpp, data);
		return Result.ok(this.config.dpp);
	}

	update(key: string, data: Dpp): Result<Dpp, Error> {
		if (key !== DPP_KEY) {
			return Result.err(new Error(`Dpp not found: ${key}`));
		}
		Object.assign(this.config.dpp, data);
		return Result.ok(this.config.dpp);
	}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	delete(_key: string): Result<void, Error> {
		return Result.err(new Error('Cannot delete dpp'));
	}
}
