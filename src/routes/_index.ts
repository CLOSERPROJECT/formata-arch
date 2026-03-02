import { createRouter } from 'sv-router';

import layout from './_layout.svelte';

//

export const { p, navigate, isActive, route } = createRouter({
	layout,
	'/departments': () => import('./departments.svelte'),
	'/roles': () => import('./roles.svelte'),
	'/dpp': () => import('./dpp.svelte'),
	'/': () => import('./workflow.svelte'),
	'/export': () => import('./export.svelte')
});
