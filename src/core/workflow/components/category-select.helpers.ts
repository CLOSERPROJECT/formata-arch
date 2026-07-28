import type { CategorySubTree, CategoryTree } from '$core/config/validation.js';
import type { Config } from '$core/config/types.js';

import { appData } from '$core/app/app.svelte.js';

export function filteredSubCategories(
	categories: CategoryTree[],
	categorySlug: string | undefined
): CategorySubTree[] {
	if (!categorySlug) return [];
	return categories.find((category) => category.slug === categorySlug)?.subCategories ?? [];
}

/** Reassign workflow on appData so configErrors / UI deriveds always invalidate. */
function replaceWorkflow(patch: Partial<Config['workflow']>) {
	const { categorySlug: _c, subCategorySlug: _s, ...rest } = appData.config.workflow;
	appData.config = {
		...appData.config,
		workflow: {
			...rest,
			...patch
		}
	};
}

export function setWorkflowCategorySlug(_workflow: Config['workflow'], slug: string | undefined) {
	if (slug) {
		replaceWorkflow({ categorySlug: slug });
	} else {
		replaceWorkflow({});
	}
}

export function setWorkflowSubCategorySlug(_workflow: Config['workflow'], slug: string | undefined) {
	const categorySlug = appData.config.workflow.categorySlug;
	if (slug) {
		replaceWorkflow({
			...(categorySlug ? { categorySlug } : {}),
			subCategorySlug: slug
		});
	} else if (categorySlug) {
		replaceWorkflow({ categorySlug });
	} else {
		replaceWorkflow({});
	}
}

export function clearWorkflowCategorySlugs(_workflow: Config['workflow'] = appData.config.workflow) {
	replaceWorkflow({});
}
