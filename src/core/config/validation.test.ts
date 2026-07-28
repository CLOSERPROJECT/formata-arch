import { Catalog } from '$core';
import { describe, expect, it } from 'vitest';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

import { deserialize } from './serde.js';
import { validate } from './validation.js';

//

const SAMPLE_CATEGORIES: Catalog.Category[] = [
	{
		slug: 'materials',
		name: 'Materials',
		subCategories: [{ slug: 'metals', name: 'Metals' }]
	},
	{
		slug: 'processes',
		name: 'Processes',
		subCategories: [{ slug: 'recycling', name: 'Recycling', description: 'Recycling flows' }]
	}
];

async function loadSampleConfig() {
	const url = new URL('config.sample.yaml', import.meta.url);
	const raw = await readFile(fileURLToPath(url), 'utf-8');
	const result = deserialize(raw);
	if (!result.isOk) {
		throw new Error('failed to load config.sample.yaml');
	}
	return result.value;
}

function taxonomyErrorMessages(result: ReturnType<typeof validate>) {
	if (result.isOk) return [];
	return result.error
		.filter((e) => e.keyword === 'taxonomy')
		.map((e) => e.message ?? '');
}

describe('validate taxonomy (categories option passed)', () => {
	it('rejects both-absent when categories option is provided', async () => {
		const config = await loadSampleConfig();
		const { categorySlug: _c, subCategorySlug: _s, ...workflow } = config.workflow;
		const uncategorized = { ...config, workflow };

		expect(validate(uncategorized, { categories: SAMPLE_CATEGORIES }).isOk).toBe(false);
		expect(
			taxonomyErrorMessages(validate(uncategorized, { categories: SAMPLE_CATEGORIES }))
		).toContain('Category and sub-category are required');
	});

	it('rejects both-absent when categories is empty', async () => {
		const config = await loadSampleConfig();
		const { categorySlug: _c, subCategorySlug: _s, ...workflow } = config.workflow;
		const uncategorized = { ...config, workflow };

		expect(validate(uncategorized, { categories: [] }).isOk).toBe(false);
	});

	it('accepts a known category and sub-category path', async () => {
		const config = await loadSampleConfig();
		const withCategories = {
			...config,
			workflow: {
				...config.workflow,
				categorySlug: 'materials',
				subCategorySlug: 'metals'
			}
		};

		expect(validate(withCategories, { categories: SAMPLE_CATEGORIES }).isOk).toBe(true);
	});

	it('rejects unknown category slug', async () => {
		const config = await loadSampleConfig();
		const withUnknown = {
			...config,
			workflow: {
				...config.workflow,
				categorySlug: 'unknown-cat',
				subCategorySlug: 'metals'
			}
		};

		expect(validate(withUnknown, { categories: SAMPLE_CATEGORIES }).isOk).toBe(false);
		expect(
			taxonomyErrorMessages(validate(withUnknown, { categories: SAMPLE_CATEGORIES }))
		).toContain('Unknown category and sub-category');
	});

	it('rejects unknown sub-category slug under a valid category', async () => {
		const config = await loadSampleConfig();
		const withUnknownSub = {
			...config,
			workflow: {
				...config.workflow,
				categorySlug: 'materials',
				subCategorySlug: 'unknown-sub'
			}
		};

		expect(validate(withUnknownSub, { categories: SAMPLE_CATEGORIES }).isOk).toBe(false);
		expect(
			taxonomyErrorMessages(validate(withUnknownSub, { categories: SAMPLE_CATEGORIES }))
		).toContain('Unknown category and sub-category');
	});

	it('rejects one-sided pair when AJV did not already error', async () => {
		const config = await loadSampleConfig();
		const { subCategorySlug: _subCategorySlug, ...workflow } = config.workflow;
		const oneSided = {
			...config,
			workflow: {
				...workflow,
				categorySlug: 'materials'
			}
		};

		const result = validate(oneSided, { categories: SAMPLE_CATEGORIES });
		expect(result.isOk).toBe(false);
		expect(result.isErr && result.error.some((e) => e.keyword === 'dependentRequired')).toBe(true);
	});

	it('does not duplicate one-sided taxonomy errors when AJV already failed', async () => {
		const config = await loadSampleConfig();
		const { categorySlug: _categorySlug, ...workflow } = config.workflow;
		const oneSided = {
			...config,
			workflow: {
				...workflow,
				subCategorySlug: 'metals'
			}
		};

		const result = validate(oneSided, { categories: SAMPLE_CATEGORIES });
		expect(result.isOk).toBe(false);
		const taxonomyOneSided = result.isErr
			? result.error.filter(
					(e) =>
						e.keyword === 'taxonomy' &&
						(e.params as { reason?: string })?.reason === 'one-sided'
				)
			: [];
		expect(taxonomyOneSided).toHaveLength(0);
	});

	it('still includes both-absent taxonomy error when AJV also fails', async () => {
		const config = await loadSampleConfig();
		const { categorySlug: _c, subCategorySlug: _s, ...workflow } = config.workflow;
		const invalidAndUncategorized = {
			...config,
			workflow: { ...workflow, steps: [] }
		};

		const result = validate(invalidAndUncategorized, { categories: SAMPLE_CATEGORIES });
		expect(result.isOk).toBe(false);
		expect(taxonomyErrorMessages(result)).toContain('Category and sub-category are required');
		expect(result.isErr && result.error.some((e) => e.keyword !== 'taxonomy')).toBe(true);
	});
});

describe('validate without categories option (import / deserialize)', () => {
	it('allows uncategorized workflow (AJV-only)', async () => {
		const config = await loadSampleConfig();
		const { categorySlug: _c, subCategorySlug: _s, ...workflow } = config.workflow;
		const uncategorized = { ...config, workflow };

		expect(validate(uncategorized).isOk).toBe(true);
	});

	it('still rejects one-sided pair via AJV dependentRequired', async () => {
		const config = await loadSampleConfig();
		const { subCategorySlug: _subCategorySlug, ...workflow } = config.workflow;
		const oneSided = {
			...config,
			workflow: {
				...workflow,
				categorySlug: 'materials'
			}
		};

		expect(validate(oneSided).isOk).toBe(false);
	});
});
