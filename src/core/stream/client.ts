import {
	createDevAwareFetcher,
	FetchError,
	fetchJsonTask,
	ResponseError,
	ValidationError
} from '$core/utils/fetch.js';
import * as Task from 'true-myth/task';

import { serialize } from './serde.js';
import type { Data } from './types.js';
import { validate } from './validation.js';
import streamMockData from './stream.mock.json' with { type: 'json' };

//

export class PurgeConfirmRequiredError extends Error {
	constructor(message: string) {
		super(message);
		this.name = 'PurgeConfirmRequiredError';
	}
}

export function load(id: string): Task.Task<Data, Error> {
	return fetchJsonTask(
		`/my/organization/formata-builder/stream/${id}`,
		(payload: unknown) => validate(payload).mapErr(ValidationError.fromAjv),
		undefined,
		createDevAwareFetcher(() => streamMockData)
	);
}

function isPurgeRequiredPayload(payload: unknown): payload is { code: string; message?: string } {
	return (
		typeof payload === 'object' &&
		payload !== null &&
		'code' in payload &&
		(payload as { code: unknown }).code === 'purge_required'
	);
}

export function save(
	data: Data,
	streamId?: string,
	newFlag?: boolean,
	confirmPurge?: boolean
): Task.Task<void, Error> {
	return Task.fromResult(serialize(data)).andThen((c) => {
		const url = new URL('/my/organization/formata-builder', window.location.origin);
		if (streamId) {
			url.searchParams.set('stream', streamId);
		}
		if (newFlag) {
			url.searchParams.set('new', 'true');
		}
		if (confirmPurge) {
			url.searchParams.set('confirmPurge', 'true');
		}
		const fetcher = createDevAwareFetcher(() => console.log(url, c));
		return Task.tryOrElse(
			(err) => (err instanceof Error ? err : new FetchError(err)),
			async () => {
				const response = await fetcher(url, { method: 'POST', body: c });
				if (response.ok) {
					return;
				}
				if (response.status === 409) {
					try {
						const payload: unknown = await response.json();
						if (isPurgeRequiredPayload(payload)) {
							throw new PurgeConfirmRequiredError(
								typeof payload.message === 'string' && payload.message.trim() !== ''
									? payload.message
									: 'Saving these changes will permanently delete all existing stream instances.'
							);
						}
					} catch (err) {
						if (err instanceof PurgeConfirmRequiredError) {
							throw err;
						}
					}
				}
				throw new ResponseError(response);
			}
		);
	});
}
