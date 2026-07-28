import { Catalog } from '$core';

import { appData } from '$core/app/app.svelte.js';

export function filteredSubCategories(
	categories: Catalog.Category[],
	categorySlug: string | undefined
): Catalog.SubCategory[] {
	if (!categorySlug) return [];
	return categories.find((category) => category.slug === categorySlug)?.subCategories ?? [];
}

export function setWorkflowCategorySlug(slug: string | undefined) {
	const workflow = appData.config.workflow;
	if (slug) {
		workflow.categorySlug = slug;
	} else {
		delete workflow.categorySlug;
	}
	delete workflow.subCategorySlug;
}

export function setWorkflowSubCategorySlug(slug: string | undefined) {
	const workflow = appData.config.workflow;
	if (slug) {
		workflow.subCategorySlug = slug;
	} else {
		delete workflow.subCategorySlug;
	}
}

export function clearWorkflowCategorySlugs() {
	const workflow = appData.config.workflow;
	delete workflow.categorySlug;
	delete workflow.subCategorySlug;
}
