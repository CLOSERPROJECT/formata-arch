import { Config } from '$core';

export const DEFAULT_CONFIG: Config.Config = {
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
