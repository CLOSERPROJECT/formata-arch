import { createDevAwareFetcher, fetchJsonTask, zod } from '$core/utils/fetch.js';
import * as Task from 'true-myth/task';

import { Schema, type Data } from './schema.js';
import catalogMockData from './catalog.mock.json' with { type: 'json' };

//

export function parse(payload: unknown) {
	return zod(Schema)(payload);
}

export function load(): Task.Task<Data, Error> {
	return fetchJsonTask(
		'/api/catalog',
		zod(Schema),
		undefined,
		createDevAwareFetcher(() => catalogMockData)
	);
}
