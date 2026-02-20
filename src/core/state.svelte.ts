import type { AttestaConfig } from './schema.js';
import sourceYaml from './source.yaml?raw';
import { deserialize } from './serde.js';
import type { Entities } from './repositories/utils.js';
import { getRepository, type Repository } from './repositories/index.js';

//

const configResult = deserialize(sourceYaml);
if (configResult.isErr) {
	throw new Error(configResult.error.message);
}

export const config = $state<AttestaConfig>(configResult.value);

export const state = $state({
	currentCollection: 'User' as Entities
});

const currentRepository = $derived(getRepository(state.currentCollection, config));

export function getCurrentRepository(): Repository<any> {
	return currentRepository;
}
