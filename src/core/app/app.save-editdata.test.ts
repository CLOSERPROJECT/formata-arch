import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { Catalog } from '$core';
import * as Task from 'true-myth/task';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { deserialize } from '../stream/serde.js';
import { appData } from './app.svelte.js';
import { DEFAULT_STREAM } from './utils.js';

const SAMPLE_CATEGORIES: Catalog.Category[] = [
	{
		slug: 'materials',
		name: 'Materials',
		subCategories: [{ slug: 'metals', name: 'Metals' }]
	}
];

const streamLoad = vi.fn();
const streamSave = vi.fn();

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
	load: (...args: unknown[]) => streamLoad(...args),
	save: (...args: unknown[]) => streamSave(...args),
	PurgeConfirmRequiredError: class PurgeConfirmRequiredError extends Error {
		constructor(message: string) {
			super(message);
			this.name = 'PurgeConfirmRequiredError';
		}
	}
}));

vi.mock('svelte-sonner', () => ({
	toast: { success: vi.fn(), error: vi.fn() }
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

describe('App.save editData wiring (create vs update)', () => {
	beforeEach(() => {
		appData.config = structuredClone(DEFAULT_STREAM);
		appData.edit = undefined;
		streamLoad.mockReset();
		streamSave.mockReset();
		streamSave.mockReturnValue(Task.resolve(undefined));
		vi.resetModules();
	});

	afterEach(() => {
		vi.unstubAllGlobals();
	});

	it('edit URL (?stream=id) passes streamId and new=false to Stream.save', async () => {
		const sample = await loadSampleConfig();
		sample.workflow.categorySlug = 'materials';
		sample.workflow.subCategorySlug = 'metals';
		streamLoad.mockReturnValue(Task.resolve(sample));
		vi.stubGlobal('window', {
			location: { search: '?stream=6a6b546e563ecc4a0b4856c4', origin: 'http://localhost' }
		});

		const { App } = await import('./app.svelte.js');
		const app = new App();
		await flushMicrotasks();
		await flushMicrotasks();

		expect(streamLoad).toHaveBeenCalledWith('6a6b546e563ecc4a0b4856c4');
		expect(app.canSave).toBe(true);

		await app.save();

		expect(streamSave).toHaveBeenCalledTimes(1);
		const [, streamId, newFlag, confirmPurge] = streamSave.mock.calls[0] ?? [];
		expect(streamId).toBe('6a6b546e563ecc4a0b4856c4');
		expect(newFlag).toBe(false);
		expect(confirmPurge).toBe(false);
	});

	it('clone URL (?stream=id&new=true) passes new=true (create path — no purge)', async () => {
		const sample = await loadSampleConfig();
		sample.workflow.categorySlug = 'materials';
		sample.workflow.subCategorySlug = 'metals';
		streamLoad.mockReturnValue(Task.resolve(sample));
		vi.stubGlobal('window', {
			location: {
				search: '?stream=6a6b546e563ecc4a0b4856c4&new=true',
				origin: 'http://localhost'
			}
		});

		const { App } = await import('./app.svelte.js');
		const app = new App();
		await flushMicrotasks();
		await flushMicrotasks();

		await app.save();

		const [, streamId, newFlag] = streamSave.mock.calls[0] ?? [];
		expect(streamId).toBe('6a6b546e563ecc4a0b4856c4');
		expect(newFlag).toBe(true);
	});

	it('bare builder URL resumes persisted edit identity (regression)', async () => {
		const sample = await loadSampleConfig();
		sample.workflow.categorySlug = 'materials';
		sample.workflow.subCategorySlug = 'metals';
		streamLoad.mockReturnValue(Task.resolve(sample));
		vi.stubGlobal('window', {
			location: { search: '', origin: 'http://localhost' }
		});

		const mod = await import('./app.svelte.js');
		mod.appData.config = sample;
		mod.appData.edit = { streamId: '6a6b546e563ecc4a0b4856c4', new: false };
		const app = new mod.App();
		await flushMicrotasks();
		await flushMicrotasks();

		expect(streamLoad).toHaveBeenCalledWith('6a6b546e563ecc4a0b4856c4');
		expect(app.canSave).toBe(true);
		expect(mod.appData.edit).toEqual({
			streamId: '6a6b546e563ecc4a0b4856c4',
			new: false
		});

		await app.save();

		const [, streamId, newFlag] = streamSave.mock.calls[0] ?? [];
		expect(streamId).toBe('6a6b546e563ecc4a0b4856c4');
		expect(newFlag).toBe(false);
	});

	it('?new=true clears edit and saves without streamId', async () => {
		const sample = await loadSampleConfig();
		sample.workflow.categorySlug = 'materials';
		sample.workflow.subCategorySlug = 'metals';
		streamLoad.mockReturnValue(Task.reject(new Error('should not load')));
		vi.stubGlobal('window', {
			location: { search: '?new=true', origin: 'http://localhost' }
		});

		const mod = await import('./app.svelte.js');
		mod.appData.config = sample;
		mod.appData.edit = { streamId: '6a6b546e563ecc4a0b4856c4', new: false };
		const app = new mod.App();
		await flushMicrotasks();
		await flushMicrotasks();

		expect(streamLoad).not.toHaveBeenCalled();
		expect(mod.appData.edit).toBeUndefined();
		expect(mod.appData.config).toEqual(DEFAULT_STREAM);

		// Fresh DEFAULT_STREAM is not category-valid; seed a valid config after reset.
		mod.appData.config = sample;
		expect(app.canSave).toBe(true);

		await app.save();

		const [, streamId, newFlag] = streamSave.mock.calls[0] ?? [];
		expect(streamId).toBeUndefined();
		expect(newFlag).toBeUndefined();
	});
});

describe('App.hasChanges / discardChanges', () => {
	beforeEach(() => {
		appData.config = structuredClone(DEFAULT_STREAM);
		appData.edit = undefined;
		streamLoad.mockReset();
		streamSave.mockReset();
		streamSave.mockReturnValue(Task.resolve(undefined));
		vi.resetModules();
	});

	afterEach(() => {
		vi.unstubAllGlobals();
	});

	it('after ?stream= load: hasChanges false; mutate → true; discard restores', async () => {
		const sample = await loadSampleConfig();
		sample.workflow.categorySlug = 'materials';
		sample.workflow.subCategorySlug = 'metals';
		const originalName = sample.workflow.name;
		streamLoad.mockReturnValue(Task.resolve(structuredClone(sample)));
		vi.stubGlobal('window', {
			location: { search: '?stream=6a6b546e563ecc4a0b4856c4', origin: 'http://localhost' }
		});

		const { App, appData: data } = await import('./app.svelte.js');
		const app = new App();
		await flushMicrotasks();
		await flushMicrotasks();

		expect(app.hasChanges).toBe(false);

		data.config.workflow.name = 'Mutated workflow name';
		expect(app.hasChanges).toBe(true);

		app.discardChanges();
		expect(app.hasChanges).toBe(false);
		expect(data.config.workflow.name).toBe(originalName);
	});

	it('resume fetch failure baselines current draft so Discard stays hidden', async () => {
		const sample = await loadSampleConfig();
		sample.workflow.categorySlug = 'materials';
		sample.workflow.subCategorySlug = 'metals';
		streamLoad.mockReturnValue(Task.reject(new Error('offline')));
		vi.stubGlobal('window', {
			location: { search: '', origin: 'http://localhost' }
		});

		const mod = await import('./app.svelte.js');
		mod.appData.config = sample;
		mod.appData.edit = { streamId: '6a6b546e563ecc4a0b4856c4', new: false };
		const app = new mod.App();
		await flushMicrotasks();
		await flushMicrotasks();

		expect(streamLoad).toHaveBeenCalledWith('6a6b546e563ecc4a0b4856c4');
		expect(app.hasChanges).toBe(false);
	});

	it('successful save clears hasChanges', async () => {
		const sample = await loadSampleConfig();
		sample.workflow.categorySlug = 'materials';
		sample.workflow.subCategorySlug = 'metals';
		streamLoad.mockReturnValue(Task.resolve(structuredClone(sample)));
		vi.stubGlobal('window', {
			location: { search: '?stream=6a6b546e563ecc4a0b4856c4', origin: 'http://localhost' }
		});

		const { App, appData: data } = await import('./app.svelte.js');
		const app = new App();
		await flushMicrotasks();
		await flushMicrotasks();

		data.config.workflow.name = 'After edit';
		expect(app.hasChanges).toBe(true);

		await app.save();
		expect(app.hasChanges).toBe(false);
	});
});
