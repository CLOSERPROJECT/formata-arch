import type { Config } from './config.js';

//

export type Step = Config['workflow']['steps'][number];
export type Substep = Step['substeps'][number];
export type Dpp = Config['dpp'];
