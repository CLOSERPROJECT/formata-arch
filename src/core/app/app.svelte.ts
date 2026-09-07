import type { ErrorObject } from 'ajv';

import { Catalog, Stream } from '$core';
import { uniq } from 'lodash';
import { lsSync } from 'rune-sync/localstorage';
import { toast } from 'svelte-sonner';

import { DEFAULT_STREAM } from './utils.js';

//

type EditData = { streamId: string; new: boolean };

export const appData = lsSync<{ config: Stream.Data; edit?: EditData }>('formata-config', {
	config: DEFAULT_STREAM
});

//

type AppState = { type: 'loading' } | { type: 'loading-error'; error: Error } | { type: 'ready' };

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

	/** Plain clone of the last known-good stream config (load / create / save / discard). */
	#baselineConfig: Stream.Data | undefined = $state.raw(undefined);

	private setBaseline(config: Stream.Data) {
		this.#baselineConfig = structuredClone($state.snapshot(config));
	}

	private serializeConfigSnapshot(config: Stream.Data) {
		return Stream.serialize($state.snapshot(config) as Stream.Data);
	}

	/**
	 * True when the draft config serializes differently from the baseline.
	 */
	get hasChanges() {
		if (this.#baselineConfig === undefined) return false;
		const current = this.serializeConfigSnapshot(appData.config);
		const baseline = this.serializeConfigSnapshot(this.#baselineConfig);
		if (current.isErr || baseline.isErr) return false;
		return current.value !== baseline.value;
	}

	/**
	 * Restores `appData.config` from the baseline clone.
	 */
	discardChanges() {
		if (this.#baselineConfig === undefined) return;
		appData.config = structuredClone(this.#baselineConfig);
		this.setBaseline(this.#baselineConfig);
		toast.success('Changes discarded');
	}

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
				appData.edit = { streamId, new: newFlag === 'true' };
				this.setBaseline(appData.config);
			}
		} else if (newFlag === 'true') {
			// Intentional fresh create: discard draft edit identity and config.
			appData.edit = undefined;
			appData.config = structuredClone(DEFAULT_STREAM);
			this.setBaseline(appData.config);
		} else if (appData.edit?.streamId) {
			// Resume — keep draft; fetch server copy for baseline only.
			const res = await Stream.load(appData.edit.streamId);
			if (res.isOk) {
				this.setBaseline(res.value);
			} else {
				this.setBaseline(appData.config);
			}
		} else {
			// Create mode (no persisted edit identity).
			appData.edit = undefined;
			this.setBaseline(appData.config);
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

	#purgeConfirmMessage: string | undefined = $state(undefined);

	get purgeConfirmOpen() {
		return this.#purgeConfirmMessage !== undefined;
	}
	set purgeConfirmOpen(v: boolean) {
		if (!v) {
			this.#purgeConfirmMessage = undefined;
		}
	}

	get purgeConfirmMessage() {
		return this.#purgeConfirmMessage ?? '';
	}

	/**
	 * Saves the stream document to the server.
	 * When the server reports that instances would be purged, opens a confirmation dialog and retries.
	 */
	async save(confirmPurge = false) {
		if (!this.canSave) return;
		this.#state = { type: 'loading' };

		const result = await Stream.save(
			this.build(),
			appData.edit?.streamId,
			appData.edit?.new,
			confirmPurge
		);
		if (result.isOk) {
			toast.success('Workflow saved successfully');
			this.setBaseline(appData.config);
			this.#state = { type: 'ready' };
			return;
		}
		if (result.error instanceof Stream.PurgeConfirmRequiredError) {
			this.#state = { type: 'ready' };
			this.#purgeConfirmMessage = result.error.message;
			return;
		}
		toast.error(result.error.message);
		this.#state = { type: 'ready' };
	}

	async confirmPurgeSave() {
		this.#purgeConfirmMessage = undefined;
		await this.save(true);
	}

	cancelPurgeSave() {
		this.#purgeConfirmMessage = undefined;
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
