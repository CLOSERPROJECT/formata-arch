import type { Role } from '$core/catalog/schema.js';
import type { Step } from '$core/config/types.js';

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

export function getAvailableRoleOptions(): Role[] {
	return roles;
}
