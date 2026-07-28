import type { CategorySubTree, CategoryTree } from '$core/config/validation.js';
import type { Config } from '$core/config/types.js';

export function filteredSubCategories(
	categories: CategoryTree[],
	categorySlug: string | undefined
): CategorySubTree[] {
	if (!categorySlug) return [];
	return categories.find((category) => category.slug === categorySlug)?.subCategories ?? [];
}

export function setWorkflowCategorySlug(workflow: Config['workflow'], slug: string | undefined) {
	if (slug) {
		workflow.categorySlug = slug;
	} else {
		delete workflow.categorySlug;
	}
	delete workflow.subCategorySlug;
}

export function setWorkflowSubCategorySlug(workflow: Config['workflow'], slug: string | undefined) {
	if (slug) {
		workflow.subCategorySlug = slug;
	} else {
		delete workflow.subCategorySlug;
	}
}

export function clearWorkflowCategorySlugs(workflow: Config['workflow']) {
	delete workflow.categorySlug;
	delete workflow.subCategorySlug;
}
