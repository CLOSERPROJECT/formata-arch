import { Config } from '$core';
import {
	createDevAwareFetcher,
	fetchJsonTask,
	fetchTask,
	ValidationError,
	zod
} from '$core/utils/fetch.js';
import * as Task from 'true-myth/task';
import z from 'zod';

import catalogMockData from './catalog.mock.json' with { type: 'json' };
import streamMockData from './stream.mock.json' with { type: 'json' };

//

const OrganizationSchema: z.ZodType<Config.Organization> = z.object({
	slug: z.string(),
	name: z.string()
});

const RoleSchema: z.ZodType<Config.Role> = z.object({
	orgSlug: z.string(),
	name: z.string(),
	slug: z.string(),
	color: z.string(),
	border: z.string()
});

const OrganizationDataSchema = z.object({
	organizations: z.array(OrganizationSchema),
	roles: z.array(RoleSchema)
});

type OrganizationData = z.infer<typeof OrganizationDataSchema>;

//

export function loadOrganizationData(): Task.Task<OrganizationData, Error> {
	return fetchJsonTask(
		'/api/catalog',
		zod(OrganizationDataSchema),
		undefined,
		createDevAwareFetcher(() => catalogMockData)
	);
}

export function loadStream(id: string): Task.Task<Config.Config, Error> {
	return fetchJsonTask(
		`/org-admin/formata-builder/stream/${id}`,
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
			const url = new URL('/org-admin/formata-builder', window.location.origin);
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
