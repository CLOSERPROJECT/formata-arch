import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import * as Task from 'true-myth/task';

import type { CategoryTree } from '../api/catalog-schema.js';
import { deserialize } from '../config/serde.js';

import { appData } from './app.svelte.js';
import { DEFAULT_CONFIG } from './utils.js';

//

const SAMPLE_CATEGORIES: CategoryTree[] = [
	{
		slug: 'materials',
		name: 'Materials',
		subCategories: [{ slug: 'metals', name: 'Metals' }]
	}
];

vi.mock('$core/api/index.js', () => ({
	loadCatalog: () =>
		Task.resolve({
			organizations: [],
			roles: [],
			categories: SAMPLE_CATEGORIES
		}),
	loadStream: () => Task.reject(new Error('unexpected loadStream')),
	saveStream: () => Task.resolve(undefined)
}));

async function loadSampleConfig() {
	const url = new URL('../config/config.sample.yaml', import.meta.url);
	const raw = await readFile(fileURLToPath(url), 'utf-8');
	const result = deserialize(raw);
	if (!result.isOk) {
		throw new Error('failed to load config.sample.yaml');
	}
	return result.value;
}

function flushMicrotasks() {
	return new Promise((resolve) => setTimeout(resolve, 0));
}

describe('App configErrors / canSave wiring', () => {
	beforeEach(() => {
		appData.config = structuredClone(DEFAULT_CONFIG);
		vi.stubGlobal('window', { location: { search: '', origin: 'http://localhost' } });
	});

	afterEach(() => {
		vi.unstubAllGlobals();
	});

	it('blocks save when categories are loaded and workflow lacks a valid leaf (both-absent)', async () => {
		const { App } = await import('./app.svelte.js');
		const app = new App();
		await flushMicrotasks();

		expect(app.catalog.categories).toEqual(SAMPLE_CATEGORIES);

		const config = await loadSampleConfig();
		const { categorySlug: _c, subCategorySlug: _s, ...workflow } = config.workflow;
		appData.config = { ...config, workflow };

		await flushMicrotasks();

		expect(app.configErrors).toBeDefined();
		expect(app.canSave).toBe(false);
	});

	it('blocks save for unknown category path when categories are loaded', async () => {
		const { App } = await import('./app.svelte.js');
		const app = new App();
		await flushMicrotasks();

		const config = await loadSampleConfig();
		appData.config = {
			...config,
			workflow: {
				...config.workflow,
				categorySlug: 'unknown-cat',
				subCategorySlug: 'metals'
			}
		};

		await flushMicrotasks();

		expect(app.configErrors).toBeDefined();
		expect(app.canSave).toBe(false);
	});

	it('allows save for a valid path against loaded categories', async () => {
		const { App } = await import('./app.svelte.js');
		const app = new App();
		await flushMicrotasks();

		const config = await loadSampleConfig();
		appData.config = {
			...config,
			workflow: {
				...config.workflow,
				categorySlug: 'materials',
				subCategorySlug: 'metals'
			}
		};

		await flushMicrotasks();

		expect(app.configErrors).toBeUndefined();
		expect(app.canSave).toBe(true);
	});
});
