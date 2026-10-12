import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { Catalog } from '$core';
import * as Task from 'true-myth/task';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { deserialize } from '../stream/serde.js';
import { appData } from './app.svelte.js';
import { DEFAULT_STREAM } from './utils.js';

//

const SAMPLE_CATEGORIES: Catalog.Category[] = [
	{
		slug: 'materials',
		name: 'Materials',
		subCategories: [{ slug: 'metals', name: 'Metals' }]
	}
];

vi.mock('$core/catalog/client.js', () => ({
	load: () =>
		Task.resolve({
			organizations: [],
			roles: [],
			categories: SAMPLE_CATEGORIES
		}),
	parse: () => {
		throw new Error('unexpected Catalog.parse');
	}
}));

vi.mock('$core/stream/client.js', () => ({
	load: () => Task.reject(new Error('unexpected Stream.load')),
	save: () => Task.resolve(undefined)
}));

async function loadSampleConfig() {
	const url = new URL('../stream/stream.sample.yaml', import.meta.url);
	const raw = await readFile(fileURLToPath(url), 'utf-8');
	const result = deserialize(raw);
	if (!result.isOk) {
		throw new Error('failed to load stream.sample.yaml');
	}
	return result.value;
}

function flushMicrotasks() {
	return new Promise((resolve) => setTimeout(resolve, 0));
}

describe('App errors / canSave wiring', () => {
	beforeEach(() => {
		appData.config = structuredClone(DEFAULT_STREAM);
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

		expect(app.errors).toBeDefined();
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

		expect(app.errors).toBeDefined();
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

		expect(app.errors).toBeUndefined();
		expect(app.canSave).toBe(true);
	});
});

describe('App parseImport tiers', () => {
	beforeEach(() => {
		appData.config = structuredClone(DEFAULT_STREAM);
		vi.stubGlobal('window', { location: { search: '', origin: 'http://localhost' } });
	});

	afterEach(() => {
		vi.unstubAllGlobals();
	});

	it('returns blocking for invalid YAML', async () => {
		const { App } = await import('./app.svelte.js');
		const app = new App();
		await flushMicrotasks();

		const result = app.parseImport('workflow: [unterminated');
		expect(result.status).toBe('blocking');
		if (result.status === 'blocking') {
			expect(result.message.length).toBeGreaterThan(0);
		}
	});

	it('returns blocking when workflow object is missing', async () => {
		const { App } = await import('./app.svelte.js');
		const app = new App();
		await flushMicrotasks();

		const result = app.parseImport('organizations: []\nroles: []\n');
		expect(result).toEqual({
			status: 'blocking',
			message: 'Stream document must be an object with a workflow object'
		});
	});

	it('returns loadable with empty fixable for a valid sample', async () => {
		const { App } = await import('./app.svelte.js');
		const app = new App();
		await flushMicrotasks();

		const url = new URL('../stream/stream.sample.yaml', import.meta.url);
		const raw = await readFile(fileURLToPath(url), 'utf-8');
		const result = app.parseImport(raw);

		expect(result.status).toBe('loadable');
		if (result.status === 'loadable') {
			expect(result.fixable).toEqual([]);
			expect(result.data.workflow.name).toBeTruthy();
		}
	});

	it('returns loadable with fixable taxonomy issues', async () => {
		const { App } = await import('./app.svelte.js');
		const app = new App();
		await flushMicrotasks();

		const config = await loadSampleConfig();
		const { stringify } = await import('yaml');
		const yaml = stringify({
			...config,
			workflow: {
				...config.workflow,
				categorySlug: 'unknown-cat',
				subCategorySlug: 'metals'
			}
		});

		const result = app.parseImport(yaml);
		expect(result.status).toBe('loadable');
		if (result.status === 'loadable') {
			expect(result.fixable.length).toBeGreaterThan(0);
			expect(result.fixable.some((e) => e.keyword === 'taxonomy')).toBe(true);
			expect(result.data.workflow.categorySlug).toBe('unknown-cat');
		}
	});

	it('importFromString applies loadable data with fixable issues', async () => {
		const { App } = await import('./app.svelte.js');
		const app = new App();
		await flushMicrotasks();

		const config = await loadSampleConfig();
		const { stringify } = await import('yaml');
		const yaml = stringify({
			...config,
			workflow: {
				...config.workflow,
				categorySlug: 'unknown-cat',
				subCategorySlug: 'metals'
			}
		});

		const result = app.importFromString(yaml);
		expect(result.status).toBe('loadable');
		expect(appData.config.workflow.categorySlug).toBe('unknown-cat');
	});
});
