import { Ajv, type ErrorObject } from 'ajv';
import { Result } from 'true-myth/result';

import type { Config } from './types.js';

import { Schema } from './schema.js';

//

const ajv = new Ajv({ allErrors: true });
ajv.addSchema(Schema);

export function isConfig(data: unknown): data is Config {
	return ajv.validate(Schema.$id, data);
}

export function validate(data: unknown): Result<Config, ErrorObject[]> {
	const valid = isConfig(data);
	if (!valid) {
		return Result.err(ajv.errors ?? []);
	} else {
		return Result.ok(data);
	}
}
