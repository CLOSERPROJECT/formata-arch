import { AttestaConfigSchema } from '$core/schema.js';
import type { Schema } from '@sjsf/form';
import { cloneDeep } from 'lodash';

//

export type Entities = keyof typeof AttestaConfigSchema.$defs;

export const entities = Object.keys(AttestaConfigSchema.$defs) as Entities[];

export function getEntitySchema(entity: Entities): Schema {
	const schema = cloneDeep({ ...AttestaConfigSchema });
	// @ts-expect-error
	schema.$ref = `#/$defs/${entity}`;
	return schema;
}
