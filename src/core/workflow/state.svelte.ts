import type { Role } from '$core/api/index.js';
import type { Step } from '$core/config/types.js';

import { appState } from '$core/state.svelte.js';

//

export const workflowEditorState = $state({
	currentStep: undefined as Step | undefined
});

const currentOrganization = $derived.by(() =>
	appState.organizations.find((org) => org.slug === workflowEditorState.currentStep?.organization)
);

const roles = $derived.by(() =>
	appState.roles.filter((role) => role.orgSlug === currentOrganization?.slug)
);

export function getAvailableRoleOptions(): Role[] {
	return roles;
}
