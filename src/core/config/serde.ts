import type { Organization, OrganizationData, Role } from '$core/api/index.js';

import { Ajv } from 'ajv';
import { uniq } from 'lodash';
import Result from 'true-myth/result';
import { parse, stringify } from 'yaml';

import * as Config from './config.js';

//

const ajv = new Ajv();
ajv.addSchema(Config.Schema);

/**
 * Serialize AttestaConfig to a YAML string.
 */
export function serialize(
	config: Config.Config,
	organizationData: OrganizationData
): Result<string, Error> {
	try {
		const baseData = config.workflow.steps.map((step) => ({
			organization: step.organization,
			roles: uniq(step.substeps.flatMap((substep) => substep.roles))
		}));

		const selectedOrganizations: Organization[] = [];
		const selectedRoles: Role[] = [];

		for (const data of baseData) {
			const organization = organizationData.organizations.find(
				(org) => org.slug === data.organization
			);
			if (organization) selectedOrganizations.push(organization);
			for (const role of data.roles) {
				const foundRole = organizationData.roles.find(
					(r) => r.slug === role && r.orgSlug === data.organization
				);
				if (foundRole) selectedRoles.push(foundRole);
			}
		}

		return Result.ok(
			stringify({
				...config,
				organizations: uniq(selectedOrganizations),
				roles: uniq(selectedRoles)
			})
		);
	} catch (e) {
		return Result.err(e instanceof Error ? e : new Error(String(e)));
	}
}

/**
 * Deserialize a YAML string to AttestaConfig.
 * Validates the parsed result with AJV; returns Err on parse or validation failure.
 */
export function deserialize(str: string): Result<Config.Config, Error> {
	try {
		const data = parse(str) as unknown;
		const valid = ajv.validate(Config.Schema.$id, data);
		if (!valid) {
			const msg =
				ajv.errors?.map((e) => `${e.instancePath}: ${e.message}`).join('; ') ?? 'validation failed';
			return Result.err(new Error(msg));
		}
		return Result.ok(data as Config.Config);
	} catch (e) {
		return Result.err(e instanceof Error ? e : new Error(String(e)));
	}
}
