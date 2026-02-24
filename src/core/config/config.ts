import type { Schema as JSONSchema } from '@sjsf/form';
import type { FromSchema } from 'json-schema-to-ts';

//

export const Schema = {
	$id: 'formata-arch/config',
	$ref: '#/$defs/Config',
	$defs: {
		Config: {
			type: 'object',
			required: ['workflow', 'departments', 'users', 'dpp'],
			additionalProperties: false,
			properties: {
				workflow: { $ref: '#/$defs/Workflow' },
				departments: {
					type: 'array',
					items: { $ref: '#/$defs/Department' }
				},
				users: {
					type: 'array',
					items: { $ref: '#/$defs/User' }
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
				id: { type: 'string' },
				title: { type: 'string' },
				order: { type: 'integer' },
				substeps: {
					type: 'array',
					items: { $ref: '#/$defs/Substep' }
				}
			}
		},
		Substep: {
			type: 'object',
			required: ['id', 'title', 'order', 'role', 'inputKey', 'inputType'],
			additionalProperties: false,
			properties: {
				id: { type: 'string' },
				title: { type: 'string' },
				order: { type: 'integer' },
				role: { type: 'string' },
				inputKey: { type: 'string' },
				inputType: {
					type: 'string',
					enum: ['number', 'string', 'file', 'formata']
				},
				schema: {
					type: 'object',
					description: 'JSON Schema for formata inputType'
				},
				uiSchema: {
					type: 'object',
					description: 'UI schema overrides'
				}
			},
			if: {
				properties: {
					inputType: { const: 'formata' }
				},
				required: ['inputType']
			},
			then: {
				required: ['schema', 'uiSchema']
			}
		},
		Department: {
			type: 'object',
			required: ['id', 'name', 'color', 'border'],
			additionalProperties: false,
			properties: {
				id: { type: 'string' },
				name: { type: 'string' },
				color: { type: 'string' },
				border: { type: 'string' }
			}
		},
		User: {
			type: 'object',
			required: ['id', 'name', 'departmentId'],
			additionalProperties: false,
			properties: {
				id: { type: 'string' },
				name: { type: 'string' },
				departmentId: { type: 'string' }
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
