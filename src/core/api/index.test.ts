import { describe, expect, it } from 'vitest';

import catalogMockData from './catalog.mock.json' with { type: 'json' };
import { parseCatalog } from './index.js';

describe('parseCatalog', () => {
	it('parses catalog mock with nested categories and iconURL', () => {
		const result = parseCatalog(catalogMockData);
		expect(result.isOk).toBe(true);
		if (!result.isOk) return;

		expect(result.value.categories.length).toBeGreaterThan(0);
		const materials = result.value.categories.find((c) => c.slug === 'materials');
		expect(materials).toBeDefined();
		expect(materials?.iconURL).toMatch(/^\/static\/taxonomy\/.+\.svg$/);
		expect(materials?.subCategories.some((s) => s.slug === 'metals')).toBe(true);
	});

	it('includes Gallium stream mock taxonomy path (materials / metals)', () => {
		const result = parseCatalog(catalogMockData);
		expect(result.isOk).toBe(true);
		if (!result.isOk) return;

		const materials = result.value.categories.find((c) => c.slug === 'materials');
		const metals = materials?.subCategories.find((s) => s.slug === 'metals');
		expect(metals).toBeDefined();
		expect(metals?.iconURL).toMatch(/^\/static\/taxonomy\/.+\.svg$/);
	});

	it('rejects catalog payload missing categories', () => {
		const { categories: _categories, ...incomplete } = catalogMockData as Record<string, unknown>;
		const result = parseCatalog(incomplete);
		expect(result.isOk).toBe(false);
	});
});
