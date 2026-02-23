import layout from '$core/layout.svelte';
import { createRouter } from 'sv-router';

export const { p, navigate, isActive, route } = createRouter({
	layout,
	'/': () => import('./home.svelte'),
	'/departments': () => import('./departments.svelte'),
	'/users': () => import('./users.svelte'),
	'/dpp': () => import('./dpp.svelte'),
	'/workflow': () => import('./workflow.svelte')
});
