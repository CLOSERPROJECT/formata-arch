import type { Schema } from '@sjsf/form';

import { cloneDeep } from 'lodash';

import * as Config from './config.js';

//

export type Entity = keyof typeof Config.Schema.$defs;

export const entities = Object.keys(Config.Schema.$defs) as Entity[];

export function getEntitySchema(entity: Entity): Schema {
	const schema = cloneDeep({ ...Config.Schema });
	// @ts-expect-error - It's a valid reference
	schema.$ref = `#/$defs/${entity}`;
	return schema;
}

//

export function createTestSample(): Config.Config {
	return {
		workflow: { name: 'Test', steps: [] },
		departments: [{ id: 'd1', name: 'Dept', color: '#000', border: '#000' }],
		users: [],
		dpp: {
			enabled: false,
			gtin: '',
			lotInputKey: '',
			lotDefault: '',
			serialInputKey: '',
			serialStrategy: '',
			productName: '',
			productDescription: '',
			ownerName: ''
		}
	};
}
