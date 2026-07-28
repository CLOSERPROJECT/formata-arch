import { Stream } from '$core';

export const DEFAULT_STREAM: Stream.Data = {
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
