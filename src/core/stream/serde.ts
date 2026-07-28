import Result from 'true-myth/result';
import { parse, stringify } from 'yaml';

import type { Data } from './types.js';

import { validate } from './validation.js';

/**
 * Serialize a stream document to a YAML string.
 */
export function serialize(config: Data): Result<string, Error> {
	try {
		return Result.ok(stringify(config));
	} catch (e) {
		return Result.err(e instanceof Error ? e : new Error(String(e)));
	}
}

/**
 * Deserialize a YAML string to a stream document.
 * Validates the parsed result with AJV; returns Err on parse or validation failure.
 */
export function deserialize(str: string): Result<Data, Error> {
	try {
		const data = parse(str) as unknown;
		return validate(data).mapErr(
			(errors) => new Error('Validation failed:\n' + errors.map((e) => e.message).join('\n'))
		);
	} catch (e) {
		return Result.err(e instanceof Error ? e : new Error(String(e)));
	}
}
