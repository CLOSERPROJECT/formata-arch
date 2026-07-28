import {
	createDevAwareFetcher,
	fetchJsonTask,
	zod
} from '$core/utils/fetch.js';
import * as Task from 'true-myth/task';

import { CatalogSchema, type Catalog } from './schema.js';
import catalogMockData from './catalog.mock.json' with { type: 'json' };

//

export function parse(payload: unknown) {
	return zod(CatalogSchema)(payload);
}

export function load(): Task.Task<Catalog, Error> {
	return fetchJsonTask(
		'/api/catalog',
		zod(CatalogSchema),
		undefined,
		createDevAwareFetcher(() => catalogMockData)
	);
}
