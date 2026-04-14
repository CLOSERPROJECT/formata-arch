import type { Schema as JSONSchema } from '@sjsf/form';

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
				name: { type: 'string', minLength: 3 },
				description: { type: 'string', minLength: 3 },
				steps: {
					type: 'array',
					items: { $ref: '#/$defs/Step' },
					minItems: 1
				}
			}
		},
		Step: {
			type: 'object',
			required: ['id', 'title', 'order', 'organization', 'substeps'],
			additionalProperties: false,
			properties: {
				id: { type: 'string', default: 'id', minLength: 1 },
				description: { type: 'string', minLength: 3 },
				title: { type: 'string', minLength: 3 },
				order: { type: 'integer', default: 0 },
				organization: { type: 'string' },
				substeps: {
					type: 'array',
					items: { $ref: '#/$defs/Substep' },
					default: [],
					minItems: 1
				}
			}
		},
		Substep: {
			type: 'object',
			required: ['id', 'title', 'order', 'roles', 'inputKey', 'inputType', 'schema'],
			additionalProperties: false,
			properties: {
				id: { type: 'string', default: 'id' },
				order: { type: 'integer', default: 0 },
				title: { type: 'string', minLength: 3 },
				inputKey: { type: 'string', title: 'Subtitle' },
				roles: {
					type: 'array',
					items: { type: 'string' },
					default: [],
					minItems: 1
				},
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
			required: ['slug', 'name'],
			additionalProperties: false,
			properties: {
				slug: { type: 'string' },
				name: { type: 'string' }
			}
		},
		Role: {
			type: 'object',
			required: ['name', 'slug', 'orgSlug', 'color', 'border'],
			additionalProperties: false,
			properties: {
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
