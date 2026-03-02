import type { Schema } from '@sjsf/form';
import type { FromSchema } from 'json-schema-to-ts';

import { Config } from '$core';
import Result from 'true-myth/result';

import type { Repository } from './_types.js';

//

export type Organization = FromSchema<Config.Schema['$defs']['Organization']>;

export class OrganizationRepository implements Repository<Organization> {
	constructor(private readonly config: Config.Config) {}

	getEntityName(): string {
		return 'Organization';
	}

	getKey(record: Organization): string {
		return record.slug;
	}

	getSchema(): Schema {
		return Config.getEntitySchema('Organization');
	}

	list(): Organization[] {
		return this.config.organizations;
	}

	getOne(key: string): Result<Organization, Error> {
		const org = this.config.organizations.find((o) => o.slug === key);
		return org !== undefined
			? Result.ok(org)
			: Result.err(new Error(`Organization not found: ${key}`));
	}

	create(data: Organization): Result<Organization, Error> {
		if (this.config.organizations.some((o) => o.slug === data.slug)) {
			return Result.err(new Error(`Organization already exists: ${data.slug}`));
		}
		this.config.organizations = [...this.config.organizations, data];
		return Result.ok(data);
	}

	update(key: string, data: Organization): Result<Organization, Error> {
		const index = this.config.organizations.findIndex((o) => o.slug === key);
		if (index === -1) {
			return Result.err(new Error(`Organization not found: ${key}`));
		}
		const newSlug = data.slug;
		if (key !== newSlug) {
			if (this.config.organizations.some((o) => o.slug === newSlug)) {
				return Result.err(new Error(`Organization already exists: ${newSlug}`));
			}
			// Update all dependents before changing the organization slug
			this.config.roles = this.config.roles.map((r) =>
				r.orgSlug === key ? { ...r, orgSlug: newSlug } : r
			);
			this.config.workflow = {
				...this.config.workflow,
				steps: this.config.workflow.steps.map((step) => ({
					...step,
					substeps: step.substeps.map((sub) =>
						sub.role === key ? { ...sub, role: newSlug } : sub
					)
				}))
			};
		}
		this.config.organizations = this.config.organizations.map((o) => (o.slug === key ? data : o));
		return Result.ok(data);
	}

	delete(key: string): Result<void, Error> {
		const index = this.config.organizations.findIndex((o) => o.slug === key);
		if (index === -1) {
			return Result.err(new Error(`Organization not found: ${key}`));
		}
		this.config.organizations = this.config.organizations.filter((o) => o.slug !== key);
		return Result.ok(undefined);
	}
}
