import type { FromSchema } from 'json-schema-to-ts';

import type { Schema } from './schema.js';

//

export type Data = FromSchema<typeof Schema>;

export type Step = Data['workflow']['steps'][number];

export type Substep = Step['substeps'][number];

export type Dpp = Data['dpp'];

export type Organization = Data['organizations'][number];

export type Role = Data['roles'][number];
