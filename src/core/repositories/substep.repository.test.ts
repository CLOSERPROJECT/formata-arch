import { Config } from '$core';
import { describe, expect, it } from 'vitest';

import { SubstepRepository, type Substep } from './substep.repository.js';

//

function createTestConfig(): Config.Config {
	const config = Config.createTestSample();
	config.workflow.steps = [
		{
			id: '1',
			title: 'Step 1',
			order: 1,
			substeps: [substep1]
		}
	];
	return config;
}

const substep1 = {
	id: '1.1',
	title: 'Sub 1',
	order: 1,
	role: 'r1',
	inputKey: 'k1',
	inputType: 'string' as const,
	schema: {}
};

describe('SubstepRepository', () => {
	describe('getSchema', () => {
		it('returns schema with $ref to Substep', () => {
			const config = createTestConfig();
			const repo = new SubstepRepository(config);
			const schema = repo.getSchema();
			expect(schema.$ref).toBe('#/$defs/Substep');
		});
	});

	describe('list', () => {
		it('returns all substeps with composite id (stepId.substepId)', () => {
			const config = createTestConfig();
			const repo = new SubstepRepository(config);
			const list = repo.list();
			expect(list).toHaveLength(1);
			expect(list[0]).toMatchObject({ ...substep1, id: '1.1' });
		});

		it('returns empty array when no substeps', () => {
			const config = createTestConfig();
			config.workflow.steps[0].substeps = [];
			const repo = new SubstepRepository(config);
			expect(repo.list()).toEqual([]);
		});
	});

	describe('getOne', () => {
		it('returns Ok(substep) when key is stepId.substepId', () => {
			const config = createTestConfig();
			const repo = new SubstepRepository(config);
			const result = repo.getOne('1.1');
			expect(result.isOk).toBe(true);
			if (result.isOk) {
				expect(result.value).toMatchObject({ ...substep1, id: '1.1' });
			}
		});

		it('returns Err when key not found', () => {
			const config = createTestConfig();
			const repo = new SubstepRepository(config);
			const result = repo.getOne('1.2');
			expect(result.isErr).toBe(true);
		});
	});

	describe('create', () => {
		it('adds substep to step when id is stepId and returns Ok(substep) with renumbered id/order', () => {
			const config = createTestConfig();
			const repo = new SubstepRepository(config);
			const newSub: Substep = {
				...substep1,
				id: '1',
				title: 'Sub 2',
				schema: {}
			};
			const result = repo.create(newSub);
			expect(result.isOk).toBe(true);
			if (result.isOk) {
				expect(result.value.id).toBe('1.2');
				expect(result.value.order).toBe(2);
			}
			expect(config.workflow.steps[0]?.substeps).toHaveLength(2);
			expect(config.workflow.steps[0]?.substeps.some((s) => s.id === '1.2')).toBe(true);
		});

		it('returns Err when stepId is empty', () => {
			const config = createTestConfig();
			const repo = new SubstepRepository(config);
			const result = repo.create({ ...substep1, id: '', schema: {} });
			expect(result.isErr).toBe(true);
			if (result.isErr) {
				expect(result.error.message).toBe('Substep id must be stepId or stepId.substepId');
			}
		});
	});

	describe('update', () => {
		it('updates substep when key is stepId.substepId and renumbers', () => {
			const config = createTestConfig();
			const repo = new SubstepRepository(config);
			const updated: Substep = {
				...substep1,
				id: '1.1',
				title: 'Updated',
				schema: {}
			};
			const result = repo.update('1.1', updated);
			expect(result.isOk).toBe(true);
			expect(config.workflow.steps[0]?.substeps[0]?.title).toBe('Updated');
		});

		it('returns Err when key not found', () => {
			const config = createTestConfig();
			const repo = new SubstepRepository(config);
			const result = repo.update('1.2', { ...substep1, id: '1.1', schema: {} });
			expect(result.isErr).toBe(true);
		});
	});

	describe('delete', () => {
		it('removes substep and returns Ok(undefined)', () => {
			const config = createTestConfig();
			const repo = new SubstepRepository(config);
			const result = repo.delete('1.1');
			expect(result.isOk).toBe(true);
			expect(config.workflow.steps[0]?.substeps).toHaveLength(0);
		});

		it('returns Err when substep does not exist', () => {
			const config = createTestConfig();
			const repo = new SubstepRepository(config);
			const result = repo.delete('1.2');
			expect(result.isErr).toBe(true);
		});
	});
});
