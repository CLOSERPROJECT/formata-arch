import { Config } from '$core';
import { appState, config, getConfigErrors } from '$core/state.svelte.js';
import * as Task from 'true-myth/task';
import z from 'zod';

import mockData from './mock.json' with { type: 'json' };

//

export const OrganizationSchema = z.object({
	slug: z.string(),
	name: z.string()
});
export type Organization = z.infer<typeof OrganizationSchema>;

export const RoleSchema = z.object({
	orgSlug: z.string(),
	name: z.string(),
	slug: z.string(),
	color: z.string(),
	border: z.string()
});
export type Role = z.infer<typeof RoleSchema>;

export const OrganizationDataSchema = z.object({
	organizations: z.array(OrganizationSchema),
	roles: z.array(RoleSchema)
});
export type OrganizationData = z.infer<typeof OrganizationDataSchema>;

//

export function loadOrganizationData(): Task.Task<void, Error> {
	if (import.meta.env.DEV) {
		OrganizationDataSchema.parse(mockData);
		appState.organizations = mockData.organizations;
		appState.roles = mockData.roles;
		return Task.resolve(undefined);
	}

	return Task.tryOrElse(
		(err) => new Error('Failed to fetch organization data', { cause: err }),
		() => fetch('/api/organizations')
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
		)
		.andThen((data) => {
			appState.organizations = data.organizations;
			appState.roles = data.roles;
			return Task.resolve(undefined);
		});
}

export function saveWorkflow(): Task.Task<void, Error> {
	const errors = getConfigErrors();
	if (errors.length > 0) {
		return Task.resolve(undefined);
	}

	const serialized = Config.serialize(config);
	if (serialized.isErr) {
		return Task.reject(serialized.error);
	}

	return Task.tryOrElse(
		(err) => new Error('Failed to save workflow', { cause: err }),
		() =>
			fetch('/org-admin/formata-builder', {
				method: 'POST',
				body: serialized.value
			})
	).map(() => {
		return undefined;
	});
}
