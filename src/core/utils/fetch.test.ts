import { Result } from 'true-myth/result';
import { assert, describe, expect, it } from 'vitest';

import {
	FetchError,
	fetchJsonTask,
	fetchTask,
	ResponseError,
	ValidationError,
	type Fetcher
} from './fetch.js';

describe('fetchResponseTask', () => {
	it('returns response when request succeeds with ok status', async () => {
		const fetcher: Fetcher = async () =>
			new Response(JSON.stringify({ ok: true }), {
				status: 200,
				headers: { 'content-type': 'application/json' }
			});

		const result = await fetchTask('/resource', undefined, fetcher);

		expect(result.isOk).toBe(true);
		if (result.isOk) {
			expect(result.value.status).toBe(200);
		}
	});

	it('returns ResponseError when status is not ok', async () => {
		const fetcher: Fetcher = async () =>
			new Response('nope', {
				status: 500,
				statusText: 'Server Error'
			});

		const result = await fetchTask('/resource', undefined, fetcher);

		expect(result.isErr).toBe(true);
		if (result.isErr) {
			assert(result.error instanceof ResponseError);
			expect(result.error.status).toBe(500);
		}
	});

	it('returns FetchError when request throws', async () => {
		const fetcher: Fetcher = async () => {
			throw new Error('network down');
		};

		const result = await fetchTask('/resource', undefined, fetcher);

		expect(result.isErr).toBe(true);
		if (result.isErr) {
			expect(result.error).toBeInstanceOf(FetchError);
		}
	});
});

describe('fetchJsonTask', () => {
	it('validates payload with throw-based validator', async () => {
		const fetcher: Fetcher = async () =>
			new Response(JSON.stringify({ name: 'Formata' }), {
				status: 200,
				headers: { 'content-type': 'application/json' }
			});

		const result = await fetchJsonTask(
			'/resource',
			(payload) => {
				if (typeof payload !== 'object' || payload === null || !('name' in payload)) {
					return Result.err(new ValidationError('Missing name', []));
				}
				return Result.ok(payload as { name: string });
			},
			undefined,
			fetcher
		);

		expect(result.isOk).toBe(true);
		if (result.isOk) {
			expect(result.value).toEqual({ name: 'Formata' });
		}
	});

	it('validates payload with Result-based validator', async () => {
		const fetcher: Fetcher = async () =>
			new Response(JSON.stringify({ count: 3 }), {
				status: 200,
				headers: { 'content-type': 'application/json' }
			});

		const result = await fetchJsonTask(
			'/resource',
			(payload) => {
				if (typeof payload !== 'object' || payload === null || !('count' in payload)) {
					return Result.err(new ValidationError('Missing count', []));
				}
				return Result.ok((payload as { count: number }).count);
			},
			undefined,
			fetcher
		);

		expect(result.isOk).toBe(true);
		if (result.isOk) {
			expect(result.value).toBe(3);
		}
	});

	it('returns validation FetchError when validator throws', async () => {
		const fetcher: Fetcher = async () =>
			new Response(JSON.stringify({ value: 1 }), {
				status: 200,
				headers: { 'content-type': 'application/json' }
			});

		const result = await fetchJsonTask(
			'/resource',
			() => {
				throw new Error('invalid schema');
			},
			undefined,
			fetcher
		);

		expect(result.isErr).toBe(true);
		if (result.isErr) {
			assert(result.error instanceof ValidationError);
			expect(result.error.issues).toHaveLength(0);
		}
	});
});
