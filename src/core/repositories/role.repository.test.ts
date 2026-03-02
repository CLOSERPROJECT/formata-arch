import { Config } from '$core';
import { describe, expect, it } from 'vitest';

import { RoleRepository, type Role } from './role.repository.js';

//

function createTestConfig(roles: Role[] = []): Config.Config {
	const config = Config.createTestSample();
	config.roles = roles;
	return config;
}

describe('RoleRepository', () => {
	describe('getSchema', () => {
		it('returns schema with $ref to Role', () => {
			const config = createTestConfig();
			const repo = new RoleRepository(config);
			const schema = repo.getSchema();
			expect(schema.$ref).toBe('#/$defs/Role');
		});
	});

	describe('list', () => {
		it('returns all roles', () => {
			const role = { id: 'u1', name: 'Alice', slug: 'alice', orgSlug: 'd1', color: '', border: '' };
			const config = createTestConfig([role]);
			const repo = new RoleRepository(config);
			expect(repo.list()).toEqual([role]);
			expect(repo.list()).toHaveLength(1);
		});

		it('returns empty array when no roles', () => {
			const config = createTestConfig();
			const repo = new RoleRepository(config);
			expect(repo.list()).toEqual([]);
		});
	});

	describe('getOne', () => {
		it('returns Ok(role) when role exists', () => {
			const role = { id: 'u1', name: 'Alice', slug: 'alice', orgSlug: 'd1', color: '', border: '' };
			const config = createTestConfig([role]);
			const repo = new RoleRepository(config);
			const result = repo.getOne('u1');
			expect(result.isOk).toBe(true);
			if (result.isOk) {
				expect(result.value).toEqual(role);
			}
		});

		it('returns Err when role does not exist', () => {
			const config = createTestConfig();
			const repo = new RoleRepository(config);
			const result = repo.getOne('missing');
			expect(result.isErr).toBe(true);
			if (result.isErr) {
				expect(result.error.message).toBe('Role not found: missing');
			}
		});
	});

	describe('create', () => {
		it('adds role and returns Ok(data)', () => {
			const config = createTestConfig();
			const repo = new RoleRepository(config);
			const newRole = { id: 'u1', name: 'Bob', slug: 'bob', orgSlug: 'd1', color: '', border: '' };
			const result = repo.create(newRole);
			expect(result.isOk).toBe(true);
			if (result.isOk) {
				expect(result.value).toEqual(newRole);
			}
			expect(config.roles).toHaveLength(1);
			expect(config.roles[0]).toEqual(newRole);
		});

		it('returns Err when role id already exists', () => {
			const existing = { id: 'u1', name: 'Alice', slug: 'alice', orgSlug: 'd1', color: '', border: '' };
			const config = createTestConfig([existing]);
			const repo = new RoleRepository(config);
			const result = repo.create({ id: 'u1', name: 'Bob', slug: 'bob', orgSlug: 'd1', color: '', border: '' });
			expect(result.isErr).toBe(true);
			if (result.isErr) {
				expect(result.error.message).toBe('Role already exists: u1');
			}
			expect(config.roles).toHaveLength(1);
			expect(config.roles[0]).toEqual(existing);
		});
	});

	describe('update', () => {
		it('replaces role and returns Ok(data)', () => {
			const role = { id: 'u1', name: 'Alice', slug: 'alice', orgSlug: 'd1', color: '', border: '' };
			const config = createTestConfig([role]);
			const repo = new RoleRepository(config);
			const updated = { id: 'u1', name: 'Alice Updated', slug: 'alice', orgSlug: 'd1', color: '', border: '' };
			const result = repo.update('u1', updated);
			expect(result.isOk).toBe(true);
			if (result.isOk) {
				expect(result.value).toEqual(updated);
			}
			expect(config.roles).toHaveLength(1);
			expect(config.roles[0]).toEqual(updated);
		});

		it('returns Err when role does not exist', () => {
			const config = createTestConfig();
			const repo = new RoleRepository(config);
			const result = repo.update('missing', {
				id: 'missing',
				name: 'X',
				slug: 'x',
				orgSlug: 'd1',
				color: '',
				border: ''
			});
			expect(result.isErr).toBe(true);
			if (result.isErr) {
				expect(result.error.message).toBe('Role not found: missing');
			}
		});
	});

	describe('delete', () => {
		it('removes role and returns Ok(undefined)', () => {
			const role = { id: 'u1', name: 'Alice', slug: 'alice', orgSlug: 'd1', color: '', border: '' };
			const config = createTestConfig([role]);
			const repo = new RoleRepository(config);
			const result = repo.delete('u1');
			expect(result.isOk).toBe(true);
			expect(config.roles).toHaveLength(0);
		});

		it('returns Err when role does not exist', () => {
			const config = createTestConfig();
			const repo = new RoleRepository(config);
			const result = repo.delete('missing');
			expect(result.isErr).toBe(true);
			if (result.isErr) {
				expect(result.error.message).toBe('Role not found: missing');
			}
		});
	});
});
