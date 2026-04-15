import * as Result from 'true-myth/result';
import * as Task from 'true-myth/task';
import z from 'zod';

import { ValidationError } from './validation-error.js';

export { ValidationError };

//

export type Fetcher = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;

export class FetchError extends Error {
	constructor(cause: unknown) {
		super('Request failed', { cause });
	}
}

export class JsonParseError extends Error {
	constructor(cause: unknown) {
		super('Failed to parse JSON response', { cause });
	}
}

export class ResponseError extends Error {
	readonly status?: number;
	readonly statusText?: string;
	readonly url?: string;

	constructor(public readonly response: Response) {
		super(`Error ${response.status}: ${response.statusText}`, { cause: response });
		this.status = response.status;
		this.statusText = response.statusText;
		this.url = response.url;
	}
}

type Validator<T> = (payload: unknown) => Result.Result<T, ValidationError>;

export function fetchTask(
	input: RequestInfo | URL,
	init?: RequestInit,
	fetcher: Fetcher = fetch
): Task.Task<Response, FetchError | ResponseError> {
	return Task.tryOrElse(
		(err) => new FetchError(err),
		() => fetcher(input, init)
	).andThen((response) => {
		if (!response.ok) return Task.reject(new ResponseError(response));
		else return Task.resolve(response);
	});
}

export function fetchJsonTask<T>(
	input: RequestInfo | URL,
	validate: Validator<T>,
	init?: RequestInit,
	fetcher: Fetcher = fetch
): Task.Task<T, FetchError | ResponseError | ValidationError | JsonParseError> {
	return fetchTask(input, init, fetcher)
		.andThen((response) =>
			Task.tryOrElse(
				(err) => new JsonParseError(err),
				() => response.json()
			)
		)
		.andThen((payload) => {
			try {
				return Task.fromResult(validate(payload));
			} catch {
				return Task.reject(new ValidationError('Validation failed', []));
			}
		});
}

//

export function zod<T>(schema: z.ZodType<T>): Validator<T> {
	return (payload) => {
		const result = schema.safeParse(payload);
		if (result.success) {
			return Result.ok(result.data);
		} else {
			return Result.err(ValidationError.fromZod(result.error));
		}
	};
}

export function createDevAwareFetcher(mockData: () => unknown): Fetcher {
	return (input, init) => {
		if (import.meta.env.DEV) {
			return Promise.resolve(new Response(JSON.stringify(mockData())));
		}
		return fetch(input, init);
	};
}
