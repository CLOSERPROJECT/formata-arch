import { beforeEach, describe, expect, it } from 'vitest';

import type { CategoryTree } from '$core/api/catalog-schema.js';
import { appData } from '$core/app/app.svelte.js';
import { DEFAULT_CONFIG } from '$core/app/utils.js';

import {
	clearWorkflowCategorySlugs,
	filteredSubCategories,
	setWorkflowCategorySlug,
	setWorkflowSubCategorySlug
} from './category-select.helpers.js';

const SAMPLE_CATEGORIES: CategoryTree[] = [
	{
		slug: 'materials',
		name: 'Materials',
		subCategories: [
			{ slug: 'metals', name: 'Metals' },
			{ slug: 'recycling', name: 'Recycling' }
		]
	},
	{
		slug: 'supply-chain',
		name: 'Supply Chain',
		subCategories: [{ slug: 'procurement', name: 'Procurement' }]
	}
];

describe('category-select helpers', () => {
	beforeEach(() => {
		appData.config = structuredClone(DEFAULT_CONFIG);
	});

	it('filters sub-categories by selected category slug', () => {
		expect(filteredSubCategories(SAMPLE_CATEGORIES, 'materials')).toEqual([
			{ slug: 'metals', name: 'Metals' },
			{ slug: 'recycling', name: 'Recycling' }
		]);
		expect(filteredSubCategories(SAMPLE_CATEGORIES, 'supply-chain')).toEqual([
			{ slug: 'procurement', name: 'Procurement' }
		]);
		expect(filteredSubCategories(SAMPLE_CATEGORIES, undefined)).toEqual([]);
		expect(filteredSubCategories(SAMPLE_CATEGORIES, 'unknown')).toEqual([]);
	});

	it('sets category slug and clears sub-category', () => {
		appData.config.workflow.categorySlug = 'materials';
		appData.config.workflow.subCategorySlug = 'metals';

		setWorkflowCategorySlug('supply-chain');

		expect(appData.config.workflow.categorySlug).toBe('supply-chain');
		expect(appData.config.workflow).not.toHaveProperty('subCategorySlug');
	});

	it('sets sub-category slug without changing category', () => {
		appData.config.workflow.categorySlug = 'materials';

		setWorkflowSubCategorySlug('metals');

		expect(appData.config.workflow.categorySlug).toBe('materials');
		expect(appData.config.workflow.subCategorySlug).toBe('metals');
	});

	it('clears both category slugs', () => {
		appData.config.workflow.categorySlug = 'materials';
		appData.config.workflow.subCategorySlug = 'metals';

		clearWorkflowCategorySlugs();

		expect(appData.config.workflow).not.toHaveProperty('categorySlug');
		expect(appData.config.workflow).not.toHaveProperty('subCategorySlug');
	});
});
