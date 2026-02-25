import { Config } from '$core';
import { describe, expect, it } from 'vitest';

import { StepRepository, type Step } from './step.repository.js';

//

function createTestConfig(steps: Step[] = []): Config.Config {
	const config = Config.createTestSample();
	config.workflow.steps = steps;
	return config;
}

const step1 = {
	id: 's1',
	title: 'Step 1',
	order: 0,
	substeps: [
		{
			id: 'sub1',
			title: 'Sub 1',
			order: 0,
			role: 'r1',
			inputKey: 'k1',
			inputType: 'string' as const,
			schema: {}
		}
	]
};

describe('StepRepository', () => {
	describe('getSchema', () => {
		it('returns schema with $ref to Step', () => {
			const config = createTestConfig();
			const repo = new StepRepository(config);
			const schema = repo.getSchema();
			expect(schema.$ref).toBe('#/$defs/Step');
		});
	});

	describe('list', () => {
		it('returns all steps', () => {
			const config = createTestConfig([step1]);
			const repo = new StepRepository(config);
			expect(repo.list()).toEqual([step1]);
			expect(repo.list()).toHaveLength(1);
		});

		it('returns empty array when no steps', () => {
			const config = createTestConfig();
			const repo = new StepRepository(config);
			expect(repo.list()).toEqual([]);
		});
	});

	describe('getOne', () => {
		it('returns Ok(step) when step exists', () => {
			const config = createTestConfig([step1]);
			const repo = new StepRepository(config);
			const result = repo.getOne('s1');
			expect(result.isOk).toBe(true);
			if (result.isOk) {
				expect(result.value).toEqual(step1);
			}
		});

		it('returns Err when step does not exist', () => {
			const config = createTestConfig();
			const repo = new StepRepository(config);
			const result = repo.getOne('missing');
			expect(result.isErr).toBe(true);
			if (result.isErr) {
				expect(result.error.message).toBe('Step not found: missing');
			}
		});
	});

	describe('create', () => {
		it('adds step and returns Ok(step) with id and order renumbered (1-based)', () => {
			const config = createTestConfig();
			const repo = new StepRepository(config);
			const result = repo.create(step1);
			expect(result.isOk).toBe(true);
			if (result.isOk) {
				expect(result.value.id).toBe('1');
				expect(result.value.order).toBe(1);
				expect(result.value.title).toBe('Step 1');
				expect(result.value.substeps).toHaveLength(1);
				expect(result.value.substeps[0]?.id).toBe('1.1');
				expect(result.value.substeps[0]?.order).toBe(1);
			}
			expect(config.workflow.steps).toHaveLength(1);
			expect(config.workflow.steps[0]?.id).toBe('1');
			expect(config.workflow.steps[0]?.order).toBe(1);
		});
	});

	describe('update', () => {
		it('replaces step and normalizes id/order (1-based)', () => {
			const config = createTestConfig([step1]);
			const repo = new StepRepository(config);
			const updated = { ...step1, title: 'Updated' };
			const result = repo.update('s1', updated);
			expect(result.isOk).toBe(true);
			expect(config.workflow.steps[0]?.title).toBe('Updated');
			expect(config.workflow.steps[0]?.id).toBe('1');
			expect(config.workflow.steps[0]?.order).toBe(1);
		});

		it('returns Err when step does not exist', () => {
			const config = createTestConfig();
			const repo = new StepRepository(config);
			const result = repo.update('missing', step1);
			expect(result.isErr).toBe(true);
		});
	});

	describe('delete', () => {
		it('removes step and returns Ok(undefined)', () => {
			const config = createTestConfig([step1]);
			const repo = new StepRepository(config);
			const result = repo.delete('s1');
			expect(result.isOk).toBe(true);
			expect(config.workflow.steps).toHaveLength(0);
		});

		it('returns Err when step does not exist', () => {
			const config = createTestConfig();
			const repo = new StepRepository(config);
			const result = repo.delete('missing');
			expect(result.isErr).toBe(true);
		});
	});
});
