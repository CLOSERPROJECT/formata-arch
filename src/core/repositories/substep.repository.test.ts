import { Config } from '$core';
import { describe, expect, it } from 'vitest';

import { SubstepRepository, type SubstepWithStepId } from './substep.repository.js';

//

function createTestConfig(): Config.Config {
	const config = Config.createTestSample();
	config.workflow.steps = [
		{
			id: 's1',
			title: 'Step 1',
			order: 0,
			substeps: [substep1]
		}
	];
	return config;
}

const substep1 = {
	id: 'sub1',
	title: 'Sub 1',
	order: 0,
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
		it('returns all substeps with __stepId', () => {
			const config = createTestConfig();
			const repo = new SubstepRepository(config);
			const list = repo.list();
			expect(list).toHaveLength(1);
			expect(list[0]).toMatchObject(substep1);
			expect((list[0] as SubstepWithStepId).__stepId).toBe('s1');
		});

		it('returns empty array when no substeps', () => {
			const config = createTestConfig();
			config.workflow.steps[0].substeps = [];
			const repo = new SubstepRepository(config);
			expect(repo.list()).toEqual([]);
		});
	});

	describe('getOne', () => {
		it('returns Ok(substep) when key is stepId:substepId', () => {
			const config = createTestConfig();
			const repo = new SubstepRepository(config);
			const result = repo.getOne('s1:sub1');
			expect(result.isOk).toBe(true);
			if (result.isOk) {
				expect(result.value).toMatchObject(substep1);
				expect(result.value.__stepId).toBe('s1');
			}
		});

		it('returns Err when key not found', () => {
			const config = createTestConfig();
			const repo = new SubstepRepository(config);
			const result = repo.getOne('s1:missing');
			expect(result.isErr).toBe(true);
		});
	});

	describe('create', () => {
		it('adds substep to step and returns Ok(data)', () => {
			const config = createTestConfig();
			const repo = new SubstepRepository(config);
			const newSub: SubstepWithStepId = {
				...substep1,
				id: 'sub2',
				title: 'Sub 2',
				__stepId: 's1',
				schema: {}
			};
			const result = repo.create(newSub);
			expect(result.isOk).toBe(true);
			expect(config.workflow.steps[0].substeps).toHaveLength(2);
			expect(config.workflow.steps[0].substeps.some((s) => s.id === 'sub2')).toBe(true);
		});

		it('returns Err when substep id already exists in step', () => {
			const config = createTestConfig();
			const repo = new SubstepRepository(config);
			const result = repo.create({ ...substep1, __stepId: 's1', schema: {} });
			expect(result.isErr).toBe(true);
			if (result.isErr) {
				expect(result.error.message).toBe('Substep already exists: sub1');
			}
		});
	});

	describe('update', () => {
		it('updates substep when key is stepId:substepId', () => {
			const config = createTestConfig();
			const repo = new SubstepRepository(config);
			const updated: SubstepWithStepId = {
				...substep1,
				title: 'Updated',
				__stepId: 's1',
				schema: {}
			};
			const result = repo.update('s1:sub1', updated);
			expect(result.isOk).toBe(true);
			expect(config.workflow.steps[0].substeps[0].title).toBe('Updated');
		});

		it('returns Err when key not found', () => {
			const config = createTestConfig();
			const repo = new SubstepRepository(config);
			const result = repo.update('s1:missing', { ...substep1, __stepId: 's1', schema: {} });
			expect(result.isErr).toBe(true);
		});
	});

	describe('delete', () => {
		it('removes substep and returns Ok(undefined)', () => {
			const config = createTestConfig();
			const repo = new SubstepRepository(config);
			const result = repo.delete('s1:sub1');
			expect(result.isOk).toBe(true);
			expect(config.workflow.steps[0].substeps).toHaveLength(0);
		});

		it('returns Err when substep does not exist', () => {
			const config = createTestConfig();
			const repo = new SubstepRepository(config);
			const result = repo.delete('s1:missing');
			expect(result.isErr).toBe(true);
		});
	});
});
