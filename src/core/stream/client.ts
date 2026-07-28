import {
	createDevAwareFetcher,
	fetchJsonTask,
	fetchTask,
	ValidationError
} from '$core/utils/fetch.js';
import * as Task from 'true-myth/task';

import { serialize } from './serde.js';
import type { Data } from './types.js';
import { validate } from './validation.js';
import streamMockData from './stream.mock.json' with { type: 'json' };

//

export function load(id: string): Task.Task<Data, Error> {
	return fetchJsonTask(
		`/my/organization/formata-builder/stream/${id}`,
		(payload: unknown) => validate(payload).mapErr(ValidationError.fromAjv),
		undefined,
		createDevAwareFetcher(() => streamMockData)
	);
}

export function save(
	data: Data,
	streamId?: string,
	newFlag?: boolean
): Task.Task<void, Error> {
	return Task.fromResult(serialize(data))
		.andThen((c) => {
			const url = new URL('/my/organization/formata-builder', window.location.origin);
			if (streamId) {
				url.searchParams.set('stream', streamId);
			}
			if (newFlag) {
				url.searchParams.set('new', 'true');
			}
			return fetchTask(
				url,
				{ method: 'POST', body: c },
				createDevAwareFetcher(() => console.log(url, c))
			);
		})
		.map(() => undefined);
}
