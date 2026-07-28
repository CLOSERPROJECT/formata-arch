import type { Step } from '$core/config/types.js';
import type { CatalogRole } from '$core/api/catalog-schema.js';

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

export function getAvailableRoleOptions(): CatalogRole[] {
	return roles;
}
