import type { ErrorObject } from 'ajv';

import { Config } from '$core';
import { loadOrganizationData, loadStream, saveStream } from '$core/api/index.js';
import { uniq } from 'lodash';
import { lsSync } from 'rune-sync/localstorage';
import { toast } from 'svelte-sonner';

import { DEFAULT_CONFIG } from './utils.js';

//

type AppState =
	| { type: 'loading' }
	| { type: 'loading-error'; error: Error }
	| { type: 'ready' }
	| { type: 'ready-edit'; streamId: string };

export class App {
	constructor() {
		this.init();
	}

	config = lsSync<Config.Config>('formata-config', DEFAULT_CONFIG);

	configErrors: ErrorObject[] | undefined = $derived.by(() => {
		const res = Config.validate(this.config);
		if (res.isOk) {
			return undefined;
		} else {
			return res.error;
		}
	});

	#availableOrganizations: Config.Organization[] = [];
	get availableOrganizations() {
		return this.#availableOrganizations;
	}

	#availableRoles: Config.Role[] = [];
	get roles() {
		return this.#availableRoles;
	}

	#state = $state.raw<AppState>({ type: 'loading' });
	get state() {
		return this.#state;
	}
	get isLoading() {
		return this.#state.type === 'loading' || this.#state.type === 'loading-error';
	}

	/**
	 * Loads the available organizations and roles from catalog
	 * and detects if the app is in edit mode.
	 */
	private async init() {
		const res = await loadOrganizationData();
		if (res.isOk) {
			this.#availableOrganizations = res.value.organizations;
			this.#availableRoles = res.value.roles;
		} else {
			this.#state = { type: 'loading-error', error: res.error };
			return;
		}

		// eslint-disable-next-line svelte/prefer-svelte-reactivity
		const params = new URLSearchParams(window.location.search);
		const streamId = params.get('stream');
		if (streamId) {
			const res = await loadStream(streamId);
			if (res.isOk) {
				this.config = res.value;
				this.#state = { type: 'ready-edit', streamId };
				return;
			} else {
				this.#state = { type: 'loading-error', error: res.error };
				return;
			}
		}

		this.#state = { type: 'ready' };
	}

	/**
	 * Packages the config with the matching organizations and roles.
	 */
	buildConfig(): Config.Config {
		const baseData = this.config.workflow.steps.map((step) => ({
			organization: step.organization,
			roles: uniq(step.substeps.flatMap((substep) => substep.roles))
		}));

		const selectedOrganizations: Config.Organization[] = [];
		const selectedRoles: Config.Role[] = [];

		for (const data of baseData) {
			const organization = this.#availableOrganizations.find(
				(org) => org.slug === data.organization
			);
			if (organization) selectedOrganizations.push(organization);
			for (const role of data.roles) {
				const foundRole = this.#availableRoles.find(
					(r) => r.slug === role && r.orgSlug === data.organization
				);
				if (foundRole) selectedRoles.push(foundRole);
			}
		}

		return {
			...$state.snapshot(this.config),
			organizations: uniq(selectedOrganizations),
			roles: uniq(selectedRoles)
		};
	}

	get canSave() {
		return !this.configErrors;
	}

	/**
	 * Saves the config to the server.
	 */
	async saveConfig() {
		if (!this.canSave) return;

		const streamId = this.#state.type === 'ready-edit' ? this.#state.streamId : undefined;
		this.#state = { type: 'loading' };

		saveStream(this.buildConfig(), streamId)
			.match({
				Resolved: () => {
					toast.success('Workflow saved successfully');
				},
				Rejected: (error) => {
					toast.error(error.message);
				}
			})
			.finally(() => {
				this.#state = { type: 'ready' };
			});
	}

	/**
	 * Imports a config from a string.
	 */
	importConfigFromString(text: string) {
		const result = Config.deserialize(text);
		if (result.isErr) {
			if (result.error instanceof Error) {
				toast.error(result.error.message);
			} else {
				toast.error('Failed to import config');
			}
		} else {
			this.config = result.value;
			toast.success('Config imported');
		}
	}

	getSerializedConfig() {
		return Config.serialize(this.buildConfig());
	}
}
