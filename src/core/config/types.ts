import type { FromSchema } from 'json-schema-to-ts';

import type { Schema } from './schema.js';

//

export type Config = FromSchema<typeof Schema>;

export type Step = Config['workflow']['steps'][number];

export type Substep = Step['substeps'][number];

export type Dpp = Config['dpp'];

export type Organization = Config['organizations'][number];

export type Role = Config['roles'][number];
