import { Config } from '$core';
import { Ajv } from 'ajv';
import { lsSync } from 'rune-sync/localstorage';

import sourceYaml from './config/config.sample.yaml?raw';

//

const configResult = Config.deserialize(sourceYaml);
if (configResult.isErr) {
	throw new Error(configResult.error.message);
}

export const config = lsSync('formata-config', configResult.value);

//

const ajv = new Ajv({ allErrors: true });
ajv.addSchema(Config.Schema);

export function getConfigErrors(configValue: typeof config): string[] {
	const valid = ajv.validate(Config.Schema.$id, configValue);
	const errorObjects = valid ? [] : [...(ajv.errors ?? [])];
	return errorObjects.map((error) => `${error.instancePath}: ${error.message}`);
}
