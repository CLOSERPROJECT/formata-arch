import { Config } from '$core';
import { lsSync } from 'rune-sync/localstorage';

import sourceYaml from './config/config.sample.yaml?raw';

//

const configResult = Config.deserialize(sourceYaml);
if (configResult.isErr) {
	throw new Error(configResult.error.message);
}

export const config = lsSync('formata-config', configResult.value);
