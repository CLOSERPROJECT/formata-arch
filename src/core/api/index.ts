import { Config } from '$core';
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
	return Task.tryOrElse(
		(err) => new Error('Failed to fetch organization data', { cause: err }),
		async () => {
			if (import.meta.env.DEV) return new Response(JSON.stringify(catalogMockData));
			return fetch('/api/catalog');
		}
	)
		.andThen((res) =>
			Task.tryOrElse(
				(err) => new Error('Failed to get json response', { cause: err }),
				() => res.json()
			)
		)
		.andThen((json) =>
			Task.tryOrElse(
				(err) => new Error('Failed to parse organization data', { cause: err }),
				async () => OrganizationDataSchema.parse(json)
			)
		);
}

export function loadStream(id: string): Task.Task<Config.Config, Error> {
	return Task.tryOrElse(
		(err) => new Error('Failed to load stream', { cause: err }),
		async () => {
			if (import.meta.env.DEV) return new Response(JSON.stringify(streamMockData));
			return fetch(`/org-admin/formata-builder/stream/${id}`);
		}
	)
		.andThen((res) =>
			Task.tryOrElse(
				(err) => new Error('Failed to get json response', { cause: err }),
				() => res.json()
			)
		)
		.andThen((json) =>
			Task.fromResult(
				Config.validate(json).mapErr(
					(err) => new Error('Failed to validate stream', { cause: err })
				)
			)
		);
}

export function saveStream(config: Config.Config, streamId?: string): Task.Task<void, Error> {
	return Task.fromResult(Config.serialize(config)).andThen((c) =>
		Task.tryOrElse(
			(err) => new Error('Failed to save workflow', { cause: err }),
			async () => {
				let url = '/org-admin/formata-builder';
				if (streamId) {
					url += `?stream=${streamId}`;
				}
				if (import.meta.env.DEV) {
					console.log(url, c);
				}
				await fetch(url, {
					method: 'POST',
					body: c
				});
			}
		)
	);
}
