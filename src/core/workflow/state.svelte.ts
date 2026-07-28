import type { Step } from '$core/config/types.js';
import { Catalog } from '$core';

import { app } from '$core/app/index.js';

//

export const workflowEditorState = $state({
	currentStep: undefined as Step | undefined
});

const currentOrganization = $derived.by(() =>
	app.catalog.organizations.find(
		(org) => org.slug === workflowEditorState.currentStep?.organization
	)
);

const roles = $derived.by(() =>
	app.catalog.roles.filter((role) => role.orgSlug === currentOrganization?.slug)
);

export function getAvailableRoleOptions(): Catalog.Role[] {
	return roles;
}
