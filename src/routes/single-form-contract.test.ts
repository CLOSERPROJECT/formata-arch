import { afterEach, describe, expect, it, vi } from 'vitest';

import {
	getHashSearchParams,
	isSingleFormConfig,
	isSingleFormLoadMessage,
	isSingleFormPath,
	saveSingleFormConfig
} from './single-form-contract.js';

describe('single form contract', () => {
	afterEach(() => {
		vi.unstubAllGlobals();
	});

	it('detects standalone route hashes', () => {
		expect(isSingleFormPath('#/single-form?load=/api/form-config')).toBe(true);
		expect(isSingleFormPath('#/schema-editor')).toBe(true);
		expect(isSingleFormPath('#/')).toBe(false);
	});

	it('reads query parameters from hash routes', () => {
		const params = getHashSearchParams('#/single-form?load=/api/load&save=/api/save');

		expect(params.get('load')).toBe('/api/load');
		expect(params.get('save')).toBe('/api/save');
	});

	it('validates endpoint payloads and load messages', () => {
		const config = { schema: { type: 'object' }, uiSchema: {} };

		expect(isSingleFormConfig(config)).toBe(true);
		expect(isSingleFormConfig({ uiSchema: {} })).toBe(false);
		expect(isSingleFormLoadMessage({ type: 'formata:schema-load', ...config })).toBe(true);
		expect(isSingleFormLoadMessage({ type: 'other', ...config })).toBe(false);
	});

	it('posts change reasons when saving', async () => {
		const fetchMock = vi.fn().mockResolvedValue({ ok: true });
		vi.stubGlobal('fetch', fetchMock);

		await saveSingleFormConfig('/api/save', {
			schema: { type: 'object' },
			uiSchema: {},
			changeReason: 'Add customer field'
		});

		expect(fetchMock).toHaveBeenCalledWith(
			'/api/save',
			expect.objectContaining({
				method: 'POST',
				body: JSON.stringify({
					schema: { type: 'object' },
					uiSchema: {},
					changeReason: 'Add customer field'
				})
			})
		);
	});
});
