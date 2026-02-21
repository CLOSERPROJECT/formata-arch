import { createRouter } from 'sv-router';
import layout from '$core/layout.svelte';

export const { p, navigate, isActive, route } = createRouter({
	layout,
	'/': () => import('./home.svelte'),
	'/departments': () => import('./departments.svelte')
});
