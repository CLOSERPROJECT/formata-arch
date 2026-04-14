import type { Schema as JSONSchema } from '@sjsf/form';

import { Ajv, type ErrorObject } from 'ajv';
import { cloneDeep } from 'lodash';
import { Result } from 'true-myth/result';

import type { Config, Entity, EntityName } from './types.js';

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

export function getEntitySchema(entity: EntityName): JSONSchema {
	const schema = cloneDeep({ ...Schema });
	// @ts-expect-error - It's a valid reference
	schema.$ref = `#/$defs/${entity}`;
	return schema;
}

export function validateEntity<E extends EntityName>(
	entity: E,
	data: unknown
): Result<Entity<E>, ErrorObject[]> {
	const schema = getEntitySchema(entity);
	const valid = ajv.validate(schema, data);
	if (!valid) {
		return Result.err(ajv.errors ?? []);
	} else {
		return Result.ok(data as Entity<E>);
	}
}
