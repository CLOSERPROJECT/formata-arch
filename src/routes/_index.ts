import { createRouter } from 'sv-router';

// Lazy layout import breaks circular dependency: _index → _layout → _sidebar → _index
const layout = () => import('./_layout.svelte');

//

export const { p, navigate, isActive, route } = createRouter({
	layout,
	'/departments': () => import('./departments.svelte'),
	'/users': () => import('./users.svelte'),
	'/dpp': () => import('./dpp.svelte'),
	'/': () => import('./workflow.svelte'),
	'/export': () => import('./export.svelte')
});
