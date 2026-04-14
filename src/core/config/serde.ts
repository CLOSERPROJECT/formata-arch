import Result from 'true-myth/result';
import { parse, stringify } from 'yaml';

import type { Config } from './types.js';

import { validate } from './validation.js';

/**
 * Serialize AttestaConfig to a YAML string.
 */
export function serialize(config: Config): Result<string, Error> {
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
export function deserialize(str: string): Result<Config, Error> {
	try {
		const data = parse(str) as unknown;
		return validate(data).mapErr(
			(errors) => new Error('Validation failed:\n' + errors.map((e) => e.message).join('\n'))
		);
	} catch (e) {
		return Result.err(e instanceof Error ? e : new Error(String(e)));
	}
}
