import type { CategoryTree } from '../catalog/schema.js';
import Ajv2019, { type ErrorObject } from 'ajv/dist/2019.js';
import { Result } from 'true-myth/result';

import type { Config } from './types.js';

import { Schema } from './schema.js';

//

export type ValidateOptions = {
	categories?: CategoryTree[];
};

const ajv = new Ajv2019({ allErrors: true });
ajv.addSchema(Schema);

export function isConfig(data: unknown): data is Config {
	return ajv.validate(Schema.$id, data);
}

function taxonomyError(
	message: string,
	reason: 'both-absent' | 'one-sided' | 'unknown-path'
): ErrorObject {
	return {
		keyword: 'taxonomy',
		instancePath: '/workflow',
		schemaPath: '#/properties/workflow/taxonomy',
		params: { reason },
		message
	};
}

function hasDependentRequiredError(errors: ErrorObject[]): boolean {
	return errors.some((e) => e.keyword === 'dependentRequired');
}

function isKnownTaxonomyPath(
	categories: CategoryTree[],
	categorySlug: string,
	subCategorySlug: string
): boolean {
	const category = categories.find((c) => c.slug === categorySlug);
	if (!category) return false;
	return category.subCategories.some((sub) => sub.slug === subCategorySlug);
}

function validateTaxonomy(data: Config, categories: CategoryTree[]): ErrorObject[] {
	const workflow = data.workflow;
	const categorySlug = workflow.categorySlug;
	const subCategorySlug = workflow.subCategorySlug;
	const hasCategory = typeof categorySlug === 'string' && categorySlug.length > 0;
	const hasSubCategory = typeof subCategorySlug === 'string' && subCategorySlug.length > 0;

	if (!hasCategory && !hasSubCategory) {
		return [taxonomyError('Category and sub-category are required', 'both-absent')];
	}

	if (hasCategory !== hasSubCategory) {
		return [taxonomyError('Category and sub-category must both be set', 'one-sided')];
	}

	if (!isKnownTaxonomyPath(categories, categorySlug!, subCategorySlug!)) {
		return [taxonomyError('Unknown category and sub-category', 'unknown-path')];
	}

	return [];
}

function hasWorkflowObject(data: unknown): data is Config {
	return (
		typeof data === 'object' &&
		data !== null &&
		typeof (data as Config).workflow === 'object' &&
		(data as Config).workflow !== null
	);
}

export function validate(data: unknown, options?: ValidateOptions): Result<Config, ErrorObject[]> {
	const valid = isConfig(data);
	const errors = [...(ajv.errors ?? [])];

	// Always merge taxonomy when categories are provided — even if AJV already
	// failed — so missing category shows up in the same errors list as schema issues.
	if (options?.categories !== undefined && hasWorkflowObject(data)) {
		const taxonomyErrors = validateTaxonomy(data, options.categories);
		const filteredTaxonomyErrors = taxonomyErrors.filter((err) => {
			if (err.params?.reason !== 'one-sided') return true;
			return !hasDependentRequiredError(errors);
		});
		errors.push(...filteredTaxonomyErrors);
	}

	if (!valid || errors.length > 0) {
		return Result.err(errors);
	}

	return Result.ok(data as Config);
}
