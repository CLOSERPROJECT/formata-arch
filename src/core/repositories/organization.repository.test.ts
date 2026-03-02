import { Config } from '$core';
import { describe, expect, it } from 'vitest';

import { OrganizationRepository, type Organization } from './organization.repository.js';

//

function createTestConfig(organizations: Organization[] = []): Config.Config {
	const config = Config.createTestSample();
	config.organizations = organizations;
	return config;
}

describe('OrganizationRepository', () => {
	describe('getSchema', () => {
		it('returns schema with $ref to Organization', () => {
			const config = createTestConfig();
			const repo = new OrganizationRepository(config);
			const schema = repo.getSchema();
			expect(schema.$ref).toBe('#/$defs/Organization');
		});
	});

	describe('list', () => {
		it('returns all organizations', () => {
			const org = { slug: 'd1', name: 'Dept', color: '#000', border: '#000' };
			const config = createTestConfig([org]);
			const repo = new OrganizationRepository(config);
			expect(repo.list()).toEqual([org]);
			expect(repo.list()).toHaveLength(1);
		});

		it('returns empty array when no organizations', () => {
			const config = createTestConfig();
			const repo = new OrganizationRepository(config);
			expect(repo.list()).toEqual([]);
		});
	});

	describe('getOne', () => {
		it('returns Ok(organization) when organization exists', () => {
			const org = { slug: 'd1', name: 'Dept', color: '#000', border: '#000' };
			const config = createTestConfig([org]);
			const repo = new OrganizationRepository(config);
			const result = repo.getOne('d1');
			expect(result.isOk).toBe(true);
			if (result.isOk) {
				expect(result.value).toEqual(org);
			}
		});

		it('returns Err when organization does not exist', () => {
			const config = createTestConfig();
			const repo = new OrganizationRepository(config);
			const result = repo.getOne('missing');
			expect(result.isErr).toBe(true);
			if (result.isErr) {
				expect(result.error.message).toBe('Organization not found: missing');
			}
		});
	});

	describe('create', () => {
		it('adds organization and returns Ok(data)', () => {
			const config = createTestConfig();
			const repo = new OrganizationRepository(config);
			const newOrg = { slug: 'd1', name: 'Sales', color: '#f00', border: '#f00' };
			const result = repo.create(newOrg);
			expect(result.isOk).toBe(true);
			if (result.isOk) {
				expect(result.value).toEqual(newOrg);
			}
			expect(config.organizations).toHaveLength(1);
			expect(config.organizations[0]).toEqual(newOrg);
		});

		it('returns Err when organization slug already exists', () => {
			const existing = { slug: 'd1', name: 'Dept', color: '#000', border: '#000' };
			const config = createTestConfig([existing]);
			const repo = new OrganizationRepository(config);
			const result = repo.create({ slug: 'd1', name: 'Other', color: '#fff', border: '#fff' });
			expect(result.isErr).toBe(true);
			if (result.isErr) {
				expect(result.error.message).toBe('Organization already exists: d1');
			}
			expect(config.organizations).toHaveLength(1);
			expect(config.organizations[0]).toEqual(existing);
		});
	});

	describe('update', () => {
		it('replaces organization and returns Ok(data)', () => {
			const org = { slug: 'd1', name: 'Dept', color: '#000', border: '#000' };
			const config = createTestConfig([org]);
			const repo = new OrganizationRepository(config);
			const updated = { slug: 'd1', name: 'Dept Updated', color: '#111', border: '#111' };
			const result = repo.update('d1', updated);
			expect(result.isOk).toBe(true);
			if (result.isOk) {
				expect(result.value).toEqual(updated);
			}
			expect(config.organizations).toHaveLength(1);
			expect(config.organizations[0]).toEqual(updated);
		});

		it('returns Err when organization does not exist', () => {
			const config = createTestConfig();
			const repo = new OrganizationRepository(config);
			const result = repo.update('missing', {
				slug: 'missing',
				name: 'X',
				color: '#000',
				border: '#000'
			});
			expect(result.isErr).toBe(true);
			if (result.isErr) {
				expect(result.error.message).toBe('Organization not found: missing');
			}
		});

		it('returns Err when updating organization slug to a slug that already exists', () => {
			const config = createTestConfig([
				{ slug: 'd1', name: 'Dept 1', color: '#000', border: '#000' },
				{ slug: 'd2', name: 'Dept 2', color: '#111', border: '#111' }
			]);
			const repo = new OrganizationRepository(config);
			const result = repo.update('d1', {
				slug: 'd2',
				name: 'Dept 1 Renamed',
				color: '#222',
				border: '#222'
			});
			expect(result.isErr).toBe(true);
			if (result.isErr) {
				expect(result.error.message).toBe('Organization already exists: d2');
			}
			expect(config.organizations).toHaveLength(2);
			expect(config.organizations[0].slug).toBe('d1');
			expect(config.organizations[1].slug).toBe('d2');
		});

		it('updates roles and workflow substep roles when organization slug changes', () => {
			const config = Config.createTestSample();
			config.organizations = [
				{ slug: 'd1', name: 'Dept 1', color: '#000', border: '#000' },
				{ slug: 'd2', name: 'Dept 2', color: '#111', border: '#111' }
			];
			config.roles = [
				{ id: 'u1', name: 'Alice', slug: 'alice', orgSlug: 'd1', color: '', border: '' },
				{ id: 'u2', name: 'Bob', slug: 'bob', orgSlug: 'd2', color: '', border: '' }
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
			const repo = new OrganizationRepository(config);
			const updated = {
				slug: 'd1-renamed',
				name: 'Dept 1 Renamed',
				color: '#222',
				border: '#222'
			};
			const result = repo.update('d1', updated);
			expect(result.isOk).toBe(true);
			expect(config.organizations.find((o) => o.slug === 'd1-renamed')).toEqual(updated);
			expect(config.roles.find((r) => r.id === 'u1')?.orgSlug).toBe('d1-renamed');
			expect(config.roles.find((r) => r.id === 'u2')?.orgSlug).toBe('d2');
			expect(config.workflow.steps[0].substeps[0].role).toBe('d1-renamed');
			expect(config.workflow.steps[0].substeps[1].role).toBe('d2');
		});
	});

	describe('delete', () => {
		it('removes organization and returns Ok(undefined)', () => {
			const org = { slug: 'd1', name: 'Dept', color: '#000', border: '#000' };
			const config = createTestConfig([org]);
			const repo = new OrganizationRepository(config);
			const result = repo.delete('d1');
			expect(result.isOk).toBe(true);
			expect(config.organizations).toHaveLength(0);
		});

		it('returns Err when organization does not exist', () => {
			const config = createTestConfig();
			const repo = new OrganizationRepository(config);
			const result = repo.delete('missing');
			expect(result.isErr).toBe(true);
			if (result.isErr) {
				expect(result.error.message).toBe('Organization not found: missing');
			}
		});
	});
});
