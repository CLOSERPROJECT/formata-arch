import type { Schema as JSONSchema } from '@sjsf/form';

import { cloneDeep } from 'lodash';

import { Schema } from './schema.js';
import * as Config from './types.js';

//

type Entity = keyof typeof Schema.$defs;

export function getEntitySchema(entity: Entity): JSONSchema {
	const schema = cloneDeep({ ...Schema });
	// @ts-expect-error - It's a valid reference
	schema.$ref = `#/$defs/${entity}`;
	return schema;
}

//

export function createTestSample(): Config.Config {
	return {
		workflow: { name: 'Test', steps: [] },
		organizations: [{ slug: 'd1', name: 'Dept' }],
		roles: [],
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
