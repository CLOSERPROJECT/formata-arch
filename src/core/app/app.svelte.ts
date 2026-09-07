import type { ErrorObject } from 'ajv';

import { Catalog, Stream } from '$core';
import { uniq } from 'lodash';
import { lsSync } from 'rune-sync/localstorage';
import { toast } from 'svelte-sonner';

import { DEFAULT_STREAM } from './utils.js';

//

export const appData = lsSync<{ config: Stream.Data }>('formata-config', {
	config: DEFAULT_STREAM
});

//

type AppState = { type: 'loading' } | { type: 'loading-error'; error: Error } | { type: 'ready' };

type EditData = { streamId: string; new: boolean };

const EMPTY_CATALOG: Catalog.Data = {
	organizations: [],
	roles: [],
	categories: []
};

export class App {
	constructor() {
		this.init();
	}

	catalog: Catalog.Data = $state(structuredClone(EMPTY_CATALOG));

	errors: ErrorObject[] | undefined = $derived.by(() => {
		const res = Stream.validate(appData.config, { categories: this.catalog.categories });
		if (res.isOk) {
			return undefined;
		} else {
			return res.error;
		}
	});

	#state = $state.raw<AppState>({ type: 'loading' });
	get state() {
		return this.#state;
	}
	get isLoading() {
		return this.#state.type === 'loading' || this.#state.type === 'loading-error';
	}

	#editData: EditData | undefined;

	/**
	 * Loads catalog data and detects if the app is in edit mode.
	 */
	private async init() {
		const res = await Catalog.load();
		if (res.isOk) {
			this.catalog = res.value;
		} else {
			this.#state = { type: 'loading-error', error: res.error };
			return;
		}

		// eslint-disable-next-line svelte/prefer-svelte-reactivity
		const params = new URLSearchParams(window.location.search);
		const streamId = params.get('stream');
		const newFlag = params.get('new');
		if (streamId) {
			const res = await Stream.load(streamId);
			if (!res.isOk) {
				this.#state = { type: 'loading-error', error: res.error };
				return;
			} else {
				appData.config = res.value;
				this.#editData = { streamId, new: newFlag === 'true' };
			}
		}

		this.#state = { type: 'ready' };
	}

	/**
	 * Packages the stream document with the matching organizations and roles.
	 */
	build(): Stream.Data {
		const baseData = appData.config.workflow.steps.map((step) => ({
			organization: step.organization,
			roles: uniq(step.substeps.flatMap((substep) => substep.roles))
		}));

		const selectedOrganizations: Stream.Organization[] = [];
		const selectedRoles: Stream.Role[] = [];

		for (const data of baseData) {
			const organization = this.catalog.organizations.find((org) => org.slug === data.organization);
			if (organization) selectedOrganizations.push(organization);
			for (const role of data.roles) {
				const foundRole = this.catalog.roles.find(
					(r) => r.slug === role && r.orgSlug === data.organization
				);
				if (foundRole) selectedRoles.push(foundRole);
			}
		}

		return {
			...$state.snapshot(appData.config),
			organizations: uniq(selectedOrganizations),
			roles: uniq(selectedRoles)
		};
	}

	get canSave() {
		return !this.errors;
	}

	/**
	 * Saves the stream document to the server.
	 * When the server reports that instances would be purged, asks for confirmation and retries.
	 */
	async save(confirmPurge = false) {
		if (!this.canSave) return;
		this.#state = { type: 'loading' };

		const result = await Stream.save(
			this.build(),
			this.#editData?.streamId,
			this.#editData?.new,
			confirmPurge
		);
		if (result.isOk) {
			toast.success('Workflow saved successfully');
			this.#state = { type: 'ready' };
			return;
		}
		if (result.error instanceof Stream.PurgeConfirmRequiredError) {
			this.#state = { type: 'ready' };
			if (window.confirm(result.error.message)) {
				await this.save(true);
			}
			return;
		}
		toast.error(result.error.message);
		this.#state = { type: 'ready' };
	}

	/**
	 * Imports a stream document from a YAML string.
	 */
	importFromString(text: string) {
		const result = Stream.deserialize(text);
		if (result.isErr) {
			if (result.error instanceof Error) {
				toast.error(result.error.message);
			} else {
				toast.error('Failed to import config');
			}
		} else {
			appData.config = result.value;
			toast.success('Config imported');
		}
	}

	getSerialized() {
		return Stream.serialize(this.build());
	}
}
