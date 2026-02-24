import { Config } from '$core';
import { describe, expect, it } from 'vitest';

import { UserRepository, type User } from './user.repository.js';

//

function createTestConfig(users: User[] = []): Config.Config {
	const config = Config.createTestSample();
	config.users = users;
	return config;
}

describe('UserRepository', () => {
	describe('getSchema', () => {
		it('returns schema with $ref to User', () => {
			const config = createTestConfig();
			const repo = new UserRepository(config);
			const schema = repo.getSchema();
			expect(schema.$ref).toBe('#/$defs/User');
		});
	});

	describe('list', () => {
		it('returns all users', () => {
			const user = { id: 'u1', name: 'Alice', departmentId: 'd1' };
			const config = createTestConfig([user]);
			const repo = new UserRepository(config);
			expect(repo.list()).toEqual([user]);
			expect(repo.list()).toHaveLength(1);
		});

		it('returns empty array when no users', () => {
			const config = createTestConfig();
			const repo = new UserRepository(config);
			expect(repo.list()).toEqual([]);
		});
	});

	describe('getOne', () => {
		it('returns Ok(user) when user exists', () => {
			const user = { id: 'u1', name: 'Alice', departmentId: 'd1' };
			const config = createTestConfig([user]);
			const repo = new UserRepository(config);
			const result = repo.getOne('u1');
			expect(result.isOk).toBe(true);
			if (result.isOk) {
				expect(result.value).toEqual(user);
			}
		});

		it('returns Err when user does not exist', () => {
			const config = createTestConfig();
			const repo = new UserRepository(config);
			const result = repo.getOne('missing');
			expect(result.isErr).toBe(true);
			if (result.isErr) {
				expect(result.error.message).toBe('User not found: missing');
			}
		});
	});

	describe('create', () => {
		it('adds user and returns Ok(data)', () => {
			const config = createTestConfig();
			const repo = new UserRepository(config);
			const newUser = { id: 'u1', name: 'Bob', departmentId: 'd1' };
			const result = repo.create(newUser);
			expect(result.isOk).toBe(true);
			if (result.isOk) {
				expect(result.value).toEqual(newUser);
			}
			expect(config.users).toHaveLength(1);
			expect(config.users[0]).toEqual(newUser);
		});

		it('returns Err when user id already exists', () => {
			const existing = { id: 'u1', name: 'Alice', departmentId: 'd1' };
			const config = createTestConfig([existing]);
			const repo = new UserRepository(config);
			const result = repo.create({ id: 'u1', name: 'Bob', departmentId: 'd1' });
			expect(result.isErr).toBe(true);
			if (result.isErr) {
				expect(result.error.message).toBe('User already exists: u1');
			}
			expect(config.users).toHaveLength(1);
			expect(config.users[0]).toEqual(existing);
		});
	});

	describe('update', () => {
		it('replaces user and returns Ok(data)', () => {
			const user = { id: 'u1', name: 'Alice', departmentId: 'd1' };
			const config = createTestConfig([user]);
			const repo = new UserRepository(config);
			const updated = { id: 'u1', name: 'Alice Updated', departmentId: 'd1' };
			const result = repo.update('u1', updated);
			expect(result.isOk).toBe(true);
			if (result.isOk) {
				expect(result.value).toEqual(updated);
			}
			expect(config.users).toHaveLength(1);
			expect(config.users[0]).toEqual(updated);
		});

		it('returns Err when user does not exist', () => {
			const config = createTestConfig();
			const repo = new UserRepository(config);
			const result = repo.update('missing', {
				id: 'missing',
				name: 'X',
				departmentId: 'd1'
			});
			expect(result.isErr).toBe(true);
			if (result.isErr) {
				expect(result.error.message).toBe('User not found: missing');
			}
		});
	});

	describe('delete', () => {
		it('removes user and returns Ok(undefined)', () => {
			const user = { id: 'u1', name: 'Alice', departmentId: 'd1' };
			const config = createTestConfig([user]);
			const repo = new UserRepository(config);
			const result = repo.delete('u1');
			expect(result.isOk).toBe(true);
			expect(config.users).toHaveLength(0);
		});

		it('returns Err when user does not exist', () => {
			const config = createTestConfig();
			const repo = new UserRepository(config);
			const result = repo.delete('missing');
			expect(result.isErr).toBe(true);
			if (result.isErr) {
				expect(result.error.message).toBe('User not found: missing');
			}
		});
	});
});
