import { createRouter } from 'sv-router';
import layout from '$core/layout.svelte';

export const { p, navigate, isActive, route } = createRouter({
	layout,
	'/': () => import('./home.svelte'),
	'/departments': () => import('./departments.svelte'),
	'/users': () => import('./users.svelte'),
	'/dpp': () => import('./dpp.svelte'),
	'/steps': () => import('./steps.svelte'),
	'/workflow': () => import('./workflow.svelte')
});
