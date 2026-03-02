import type { Schema as JSONSchema } from '@sjsf/form';
import type { FromSchema } from 'json-schema-to-ts';

//

export const Schema = {
	$id: 'formata-arch/config',
	$ref: '#/$defs/Config',
	$defs: {
		Config: {
			type: 'object',
			required: ['workflow', 'organizations', 'roles', 'dpp'],
			additionalProperties: false,
			properties: {
				workflow: { $ref: '#/$defs/Workflow' },
				organizations: {
					type: 'array',
					items: { $ref: '#/$defs/Organization' }
				},
				roles: {
					type: 'array',
					items: { $ref: '#/$defs/Role' }
				},
				dpp: { $ref: '#/$defs/Dpp' }
			}
		},
		Workflow: {
			type: 'object',
			required: ['name', 'steps'],
			additionalProperties: false,
			properties: {
				name: { type: 'string' },
				steps: {
					type: 'array',
					items: { $ref: '#/$defs/Step' }
				}
			}
		},
		Step: {
			type: 'object',
			required: ['id', 'title', 'order', 'substeps'],
			additionalProperties: false,
			properties: {
				id: { type: 'string', default: 'id' },
				title: { type: 'string' },
				order: { type: 'integer', default: 0 },
				substeps: {
					type: 'array',
					items: { $ref: '#/$defs/Substep' },
					default: []
				}
			}
		},
		Substep: {
			type: 'object',
			required: ['id', 'title', 'order', 'role', 'inputKey', 'inputType', 'schema'],
			additionalProperties: false,
			properties: {
				id: { type: 'string', default: 'id' },
				order: { type: 'integer', default: 0 },
				title: { type: 'string' },
				inputKey: { type: 'string', title: 'Subtitle' },
				role: { type: 'string' },
				inputType: {
					type: 'string',
					enum: ['number', 'string', 'file', 'formata'],
					default: 'formata'
				},
				schema: {
					type: 'object',
					title: 'Data input form',
					additionalProperties: true,
					minProperties: 1
				},
				uiSchema: {
					type: 'object',
					description: 'UI schema overrides',
					additionalProperties: true
				}
			}
		},
		Organization: {
			type: 'object',
			required: ['slug', 'name', 'color', 'border'],
			additionalProperties: false,
			properties: {
				slug: { type: 'string' },
				name: { type: 'string' },
				color: { type: 'string' },
				border: { type: 'string' }
			}
		},
		Role: {
			type: 'object',
			required: ['id', 'name', 'slug', 'orgSlug', 'color', 'border'],
			additionalProperties: false,
			properties: {
				id: { type: 'string' },
				name: { type: 'string' },
				slug: { type: 'string' },
				orgSlug: { type: 'string' },
				color: { type: 'string' },
				border: { type: 'string' }
			}
		},
		Dpp: {
			type: 'object',
			required: [
				'enabled',
				'gtin',
				'lotInputKey',
				'lotDefault',
				'serialInputKey',
				'serialStrategy',
				'productName',
				'productDescription',
				'ownerName'
			],
			additionalProperties: false,
			properties: {
				enabled: { type: 'boolean' },
				gtin: { type: 'string' },
				lotInputKey: { type: 'string' },
				lotDefault: { type: 'string' },
				serialInputKey: { type: 'string' },
				serialStrategy: { type: 'string' },
				productName: { type: 'string' },
				productDescription: { type: 'string' },
				ownerName: { type: 'string' }
			}
		}
	}
} as const satisfies JSONSchema;

export type Schema = typeof Schema;

export type Config = FromSchema<Schema>;
