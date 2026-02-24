import { Config } from '$core';
import { describe, expect, it } from 'vitest';

import { DppRepository } from './dpp.repository.js';

//

describe('DppRepository', () => {
	describe('getSchema', () => {
		it('returns schema with $ref to Dpp', () => {
			const config = Config.createTestSample();
			const repo = new DppRepository(config);
			const schema = repo.getSchema();
			expect(schema.$ref).toBe('#/$defs/Dpp');
		});
	});

	describe('list', () => {
		it('returns array with single dpp', () => {
			const config = Config.createTestSample();
			const repo = new DppRepository(config);
			const list = repo.list();
			expect(list).toHaveLength(1);
			expect(list[0]).toBe(config.dpp);
		});
	});

	describe('getOne', () => {
		it("returns Ok(dpp) when key is 'dpp'", () => {
			const config = Config.createTestSample();
			const repo = new DppRepository(config);
			const result = repo.getOne('dpp');
			expect(result.isOk).toBe(true);
			if (result.isOk) {
				expect(result.value).toBe(config.dpp);
			}
		});

		it("returns Err when key is not 'dpp'", () => {
			const config = Config.createTestSample();
			const repo = new DppRepository(config);
			const result = repo.getOne('other');
			expect(result.isErr).toBe(true);
			if (result.isErr) {
				expect(result.error.message).toBe('Dpp not found: other');
			}
		});
	});

	describe('create', () => {
		it('assigns into dpp and returns Ok(dpp)', () => {
			const config = Config.createTestSample();
			const repo = new DppRepository(config);
			const updates = { productName: 'My Product', enabled: true };
			const result = repo.create({
				...config.dpp,
				...updates
			});
			expect(result.isOk).toBe(true);
			expect(config.dpp.productName).toBe('My Product');
			expect(config.dpp.enabled).toBe(true);
		});
	});

	describe('update', () => {
		it("updates dpp when key is 'dpp'", () => {
			const config = Config.createTestSample();
			const repo = new DppRepository(config);
			const updated = { ...config.dpp, productName: 'Updated' };
			const result = repo.update('dpp', updated);
			expect(result.isOk).toBe(true);
			expect(config.dpp.productName).toBe('Updated');
		});

		it("returns Err when key is not 'dpp'", () => {
			const config = Config.createTestSample();
			const repo = new DppRepository(config);
			const result = repo.update('other', config.dpp);
			expect(result.isErr).toBe(true);
		});
	});

	describe('delete', () => {
		it('returns Err (cannot delete dpp)', () => {
			const config = Config.createTestSample();
			const repo = new DppRepository(config);
			const result = repo.delete('dpp');
			expect(result.isErr).toBe(true);
			if (result.isErr) {
				expect(result.error.message).toBe('Cannot delete dpp');
			}
		});
	});
});
