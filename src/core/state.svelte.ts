import { Config } from '$core';

import sourceYaml from './config/config.sample.yaml?raw';

//

const configResult = Config.deserialize(sourceYaml);
if (configResult.isErr) {
	throw new Error(configResult.error.message);
}

export const config = $state<Config.Config>(configResult.value);
