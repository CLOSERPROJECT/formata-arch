import { Config } from '$core';
import {
	createDevAwareFetcher,
	fetchJsonTask,
	fetchTask,
	ValidationError,
	zod
} from '$core/utils/fetch.js';
import * as Task from 'true-myth/task';

import { CatalogSchema, type Catalog } from './catalog-schema.js';
import catalogMockData from './catalog.mock.json' with { type: 'json' };
import streamMockData from './stream.mock.json' with { type: 'json' };

//

export function parseCatalog(payload: unknown) {
	return zod(CatalogSchema)(payload);
}

export function loadCatalog(): Task.Task<Catalog, Error> {
	return fetchJsonTask(
		'/api/catalog',
		zod(CatalogSchema),
		undefined,
		createDevAwareFetcher(() => catalogMockData)
	);
}

export function loadStream(id: string): Task.Task<Config.Config, Error> {
	return fetchJsonTask(
		`/my/organization/formata-builder/stream/${id}`,
		(payload: unknown) => Config.validate(payload).mapErr(ValidationError.fromAjv),
		undefined,
		createDevAwareFetcher(() => streamMockData)
	);
}

export function saveStream(
	config: Config.Config,
	streamId?: string,
	newFlag?: boolean
): Task.Task<void, Error> {
	return Task.fromResult(Config.serialize(config))
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
