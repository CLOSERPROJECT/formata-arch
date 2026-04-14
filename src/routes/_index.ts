import { createRouter } from 'sv-router';

import layout from './_layout.svelte';

//

export const { p, navigate, isActive, route } = createRouter({
	layout,
	'/dpp': () => import('./dpp.svelte'),
	'/': () => import('./workflow.svelte'),
	'/save': () => import('./save.svelte')
});
