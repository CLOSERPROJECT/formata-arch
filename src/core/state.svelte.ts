import { Config } from '$core';
import { Ajv, type ErrorObject } from 'ajv';
import { lsSync } from 'rune-sync/localstorage';

import type { Organization, Role } from './api/index.js';

//

type AppState = {
	organizations: Organization[];
	roles: Role[];
};

export const appState = $state<AppState>({
	organizations: [],
	roles: []
});

const isReady = $derived.by(() => appState.organizations.length > 0 && appState.roles.length > 0);

export function isAppReady() {
	return isReady;
}

//

const DEFAULT_CONFIG: Config.Config = {
	workflow: {
		name: 'Workflow',
		description: 'Workflow description',
		steps: []
	},
	organizations: [],
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

export const config = lsSync<Config.Config>('formata-config', DEFAULT_CONFIG);

//

const ajv = new Ajv({ allErrors: true });
ajv.addSchema(Config.Schema);

export function getConfigErrors(): ErrorObject[] | undefined {
	const valid = ajv.validate(Config.Schema.$id, config);
	if (valid) return undefined;
	return [...(ajv.errors ?? [])];
}
