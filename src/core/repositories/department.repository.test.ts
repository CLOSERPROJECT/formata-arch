import { Config } from '$core';
import { describe, expect, it } from 'vitest';

import { DepartmentRepository, type Department } from './department.repository.js';

//

function createTestConfig(departments: Department[] = []): Config.Config {
	const config = Config.createTestSample();
	config.departments = departments;
	return config;
}

describe('DepartmentRepository', () => {
	describe('getSchema', () => {
		it('returns schema with $ref to Department', () => {
			const config = createTestConfig();
			const repo = new DepartmentRepository(config);
			const schema = repo.getSchema();
			expect(schema.$ref).toBe('#/$defs/Department');
		});
	});

	describe('list', () => {
		it('returns all departments', () => {
			const dept = { id: 'd1', name: 'Dept', color: '#000', border: '#000' };
			const config = createTestConfig([dept]);
			const repo = new DepartmentRepository(config);
			expect(repo.list()).toEqual([dept]);
			expect(repo.list()).toHaveLength(1);
		});

		it('returns empty array when no departments', () => {
			const config = createTestConfig();
			const repo = new DepartmentRepository(config);
			expect(repo.list()).toEqual([]);
		});
	});

	describe('getOne', () => {
		it('returns Ok(department) when department exists', () => {
			const dept = { id: 'd1', name: 'Dept', color: '#000', border: '#000' };
			const config = createTestConfig([dept]);
			const repo = new DepartmentRepository(config);
			const result = repo.getOne('d1');
			expect(result.isOk).toBe(true);
			if (result.isOk) {
				expect(result.value).toEqual(dept);
			}
		});

		it('returns Err when department does not exist', () => {
			const config = createTestConfig();
			const repo = new DepartmentRepository(config);
			const result = repo.getOne('missing');
			expect(result.isErr).toBe(true);
			if (result.isErr) {
				expect(result.error.message).toBe('Department not found: missing');
			}
		});
	});

	describe('create', () => {
		it('adds department and returns Ok(data)', () => {
			const config = createTestConfig();
			const repo = new DepartmentRepository(config);
			const newDept = { id: 'd1', name: 'Sales', color: '#f00', border: '#f00' };
			const result = repo.create(newDept);
			expect(result.isOk).toBe(true);
			if (result.isOk) {
				expect(result.value).toEqual(newDept);
			}
			expect(config.departments).toHaveLength(1);
			expect(config.departments[0]).toEqual(newDept);
		});

		it('returns Err when department id already exists', () => {
			const existing = { id: 'd1', name: 'Dept', color: '#000', border: '#000' };
			const config = createTestConfig([existing]);
			const repo = new DepartmentRepository(config);
			const result = repo.create({ id: 'd1', name: 'Other', color: '#fff', border: '#fff' });
			expect(result.isErr).toBe(true);
			if (result.isErr) {
				expect(result.error.message).toBe('Department already exists: d1');
			}
			expect(config.departments).toHaveLength(1);
			expect(config.departments[0]).toEqual(existing);
		});
	});

	describe('update', () => {
		it('replaces department and returns Ok(data)', () => {
			const dept = { id: 'd1', name: 'Dept', color: '#000', border: '#000' };
			const config = createTestConfig([dept]);
			const repo = new DepartmentRepository(config);
			const updated = { id: 'd1', name: 'Dept Updated', color: '#111', border: '#111' };
			const result = repo.update('d1', updated);
			expect(result.isOk).toBe(true);
			if (result.isOk) {
				expect(result.value).toEqual(updated);
			}
			expect(config.departments).toHaveLength(1);
			expect(config.departments[0]).toEqual(updated);
		});

		it('returns Err when department does not exist', () => {
			const config = createTestConfig();
			const repo = new DepartmentRepository(config);
			const result = repo.update('missing', {
				id: 'missing',
				name: 'X',
				color: '#000',
				border: '#000'
			});
			expect(result.isErr).toBe(true);
			if (result.isErr) {
				expect(result.error.message).toBe('Department not found: missing');
			}
		});

		it('returns Err when updating department id to an id that already exists', () => {
			const config = createTestConfig([
				{ id: 'd1', name: 'Dept 1', color: '#000', border: '#000' },
				{ id: 'd2', name: 'Dept 2', color: '#111', border: '#111' }
			]);
			const repo = new DepartmentRepository(config);
			const result = repo.update('d1', {
				id: 'd2',
				name: 'Dept 1 Renamed',
				color: '#222',
				border: '#222'
			});
			expect(result.isErr).toBe(true);
			if (result.isErr) {
				expect(result.error.message).toBe('Department already exists: d2');
			}
			expect(config.departments).toHaveLength(2);
			expect(config.departments[0].id).toBe('d1');
			expect(config.departments[1].id).toBe('d2');
		});

		it('updates users and workflow substep roles when department id changes', () => {
			const config = Config.createTestSample();
			config.departments = [
				{ id: 'd1', name: 'Dept 1', color: '#000', border: '#000' },
				{ id: 'd2', name: 'Dept 2', color: '#111', border: '#111' }
			];
			config.users = [
				{ id: 'u1', name: 'Alice', departmentId: 'd1' },
				{ id: 'u2', name: 'Bob', departmentId: 'd2' }
			];
			config.workflow = {
				name: 'Test',
				steps: [
					{
						id: 's1',
						title: 'Step 1',
						order: 1,
						substeps: [
							{
								id: 's1.1',
								title: 'Sub 1',
								order: 1,
								role: 'd1',
								inputKey: 'x',
								inputType: 'string',
								schema: { type: 'object' }
							},
							{
								id: 's1.2',
								title: 'Sub 2',
								order: 2,
								role: 'd2',
								inputKey: 'y',
								inputType: 'string',
								schema: { type: 'object' }
							}
						]
					}
				]
			};
			const repo = new DepartmentRepository(config);
			const updated = { id: 'd1-renamed', name: 'Dept 1 Renamed', color: '#222', border: '#222' };
			const result = repo.update('d1', updated);
			expect(result.isOk).toBe(true);
			expect(config.departments.find((d) => d.id === 'd1-renamed')).toEqual(updated);
			expect(config.users.find((u) => u.id === 'u1')?.departmentId).toBe('d1-renamed');
			expect(config.users.find((u) => u.id === 'u2')?.departmentId).toBe('d2');
			expect(config.workflow.steps[0].substeps[0].role).toBe('d1-renamed');
			expect(config.workflow.steps[0].substeps[1].role).toBe('d2');
		});
	});

	describe('delete', () => {
		it('removes department and returns Ok(undefined)', () => {
			const dept = { id: 'd1', name: 'Dept', color: '#000', border: '#000' };
			const config = createTestConfig([dept]);
			const repo = new DepartmentRepository(config);
			const result = repo.delete('d1');
			expect(result.isOk).toBe(true);
			expect(config.departments).toHaveLength(0);
		});

		it('returns Err when department does not exist', () => {
			const config = createTestConfig();
			const repo = new DepartmentRepository(config);
			const result = repo.delete('missing');
			expect(result.isErr).toBe(true);
			if (result.isErr) {
				expect(result.error.message).toBe('Department not found: missing');
			}
		});
	});
});
