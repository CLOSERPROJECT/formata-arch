import { Ajv } from 'ajv';
import Result from 'true-myth/result';
import { parse, stringify } from 'yaml';
import type { AttestaConfig } from './schema.js';
import { AttestaConfigSchema } from './schema.js';

const ajv = new Ajv();
ajv.addSchema(AttestaConfigSchema);

/**
 * Serialize AttestaConfig to a YAML string.
 */
export function serialize(config: AttestaConfig): Result<string, Error> {
	try {
		return Result.ok(stringify(config));
	} catch (e) {
		return Result.err(e instanceof Error ? e : new Error(String(e)));
	}
}

/**
 * Deserialize a YAML string to AttestaConfig.
 * Validates the parsed result with AJV; returns Err on parse or validation failure.
 */
export function deserialize(str: string): Result<AttestaConfig, Error> {
	try {
		const data = parse(str) as unknown;
		const valid = ajv.validate(AttestaConfigSchema.$id, data);
		if (!valid) {
			const msg =
				ajv.errors?.map((e) => `${e.instancePath}: ${e.message}`).join('; ') ?? 'validation failed';
			return Result.err(new Error(msg));
		}
		return Result.ok(data as AttestaConfig);
	} catch (e) {
		return Result.err(e instanceof Error ? e : new Error(String(e)));
	}
}
