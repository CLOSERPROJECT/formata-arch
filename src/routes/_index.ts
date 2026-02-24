import { createRouter } from 'sv-router';

import layout from './_layout.svelte';

//

export const { p, navigate, isActive, route } = createRouter({
	layout,
	'/': () => import('./home.svelte'),
	'/departments': () => import('./departments.svelte'),
	'/users': () => import('./users.svelte'),
	'/dpp': () => import('./dpp.svelte'),
	'/workflow': () => import('./workflow.svelte')
});
