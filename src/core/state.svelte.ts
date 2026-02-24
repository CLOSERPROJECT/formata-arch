import type { AttestaConfig } from './schema.js';

import { deserialize } from './serde.js';
import sourceYaml from './source.yaml?raw';

//

const configResult = deserialize(sourceYaml);
if (configResult.isErr) {
	throw new Error(configResult.error.message);
}

export const config = $state<AttestaConfig>(configResult.value);
