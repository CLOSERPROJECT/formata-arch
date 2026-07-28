import { describe, expect, it } from 'vitest';

import type { CategoryTree } from '$core/config/validation.js';
import type { Config } from '$core/config/types.js';

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
		const workflow = {
			name: 'Test',
			steps: [],
			categorySlug: 'materials',
			subCategorySlug: 'metals'
		} as Config['workflow'];

		setWorkflowCategorySlug(workflow, 'supply-chain');

		expect(workflow.categorySlug).toBe('supply-chain');
		expect(workflow.subCategorySlug).toBeUndefined();
	});

	it('sets sub-category slug without changing category', () => {
		const workflow = {
			name: 'Test',
			steps: [],
			categorySlug: 'materials'
		} as Config['workflow'];

		setWorkflowSubCategorySlug(workflow, 'metals');

		expect(workflow.categorySlug).toBe('materials');
		expect(workflow.subCategorySlug).toBe('metals');
	});

	it('clears both category slugs', () => {
		const workflow = {
			name: 'Test',
			steps: [],
			categorySlug: 'materials',
			subCategorySlug: 'metals'
		} as Config['workflow'];

		clearWorkflowCategorySlugs(workflow);

		expect(workflow.categorySlug).toBeUndefined();
		expect(workflow.subCategorySlug).toBeUndefined();
	});
});
