import Ajv2019 from 'ajv/dist/2019.js';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

import { Schema } from './schema.js';
import { deserialize } from './serde.js';
import { validate } from './validation.js';

//

async function loadSampleConfig() {
	const url = new URL('stream.sample.yaml', import.meta.url);
	const raw = await readFile(fileURLToPath(url), 'utf-8');
	const result = deserialize(raw);
	if (!result.isOk) {
		throw new Error('failed to load stream.sample.yaml');
	}
	return result.value;
}

describe('sourceSchema', () => {
	it('compiles with AJV', () => {
		const ajv = new Ajv2019();
		const compile = () => ajv.compile(Schema);
		expect(compile).not.toThrow();
		const validate = compile();
		expect(typeof validate).toBe('function');
	});

	it('validates parsed source.yaml', async () => {
		const url = new URL('stream.sample.yaml', import.meta.url);
		const raw = await readFile(fileURLToPath(url), 'utf-8');
		const data = deserialize(raw);
		if (!data.isOk) {
			console.error(data.error.message);
		}
		expect(data.isOk).toBe(true);
	});
});

describe('workflow category slugs', () => {
	it('accepts both categorySlug and subCategorySlug', async () => {
		const config = await loadSampleConfig();
		const withCategories = {
			...config,
			workflow: {
				...config.workflow,
				categorySlug: 'materials',
				subCategorySlug: 'metals'
			}
		};
		expect(validate(withCategories).isOk).toBe(true);
	});

	it('accepts neither slug (uncategorized)', async () => {
		const config = await loadSampleConfig();
		const { categorySlug: _categorySlug, subCategorySlug: _subCategorySlug, ...workflow } =
			config.workflow;
		const uncategorized = { ...config, workflow };
		expect(validate(uncategorized).isOk).toBe(true);
		expect(uncategorized.workflow).not.toHaveProperty('categorySlug');
		expect(uncategorized.workflow).not.toHaveProperty('subCategorySlug');
	});

	it('rejects categorySlug without subCategorySlug', async () => {
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

	it('rejects subCategorySlug without categorySlug', async () => {
		const config = await loadSampleConfig();
		const { categorySlug: _categorySlug, ...workflow } = config.workflow;
		const oneSided = {
			...config,
			workflow: {
				...workflow,
				subCategorySlug: 'metals'
			}
		};
		expect(validate(oneSided).isOk).toBe(false);
	});
});
