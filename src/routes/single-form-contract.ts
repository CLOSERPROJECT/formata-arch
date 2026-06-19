import type { Schema, UiSchema } from '@sjsf/form';

export type SingleFormConfig = {
	schema: Schema;
	uiSchema?: UiSchema;
};

export type SingleFormSavePayload = SingleFormConfig & {
	changeReason: string;
};

export type SingleFormSavedMessage = SingleFormSavePayload & {
	type: 'formata:schema-saved';
};

export type SingleFormLoadMessage = SingleFormConfig & {
	type: 'formata:schema-load';
};

export function isSingleFormPath(hash: string): boolean {
	const path = hash.replace(/^#/, '').split('?')[0];
	return path === '/single-form' || path === '/schema-editor';
}

export function getHashSearchParams(hash: string): URLSearchParams {
	const query = hash.split('?')[1] ?? '';
	return new URLSearchParams(query);
}

export function isSingleFormConfig(value: unknown): value is SingleFormConfig {
	if (value === null || typeof value !== 'object') return false;
	const config = value as Partial<SingleFormConfig>;
	return config.schema !== null && typeof config.schema === 'object';
}

export function isSingleFormLoadMessage(value: unknown): value is SingleFormLoadMessage {
	if (value === null || typeof value !== 'object') return false;
	const message = value as Partial<SingleFormLoadMessage>;
	return message.type === 'formata:schema-load' && isSingleFormConfig(message);
}

export async function loadSingleFormConfig(loadUrl: string): Promise<SingleFormConfig> {
	const response = await fetch(loadUrl, {
		credentials: 'include',
		headers: { accept: 'application/json' }
	});
	if (!response.ok) {
		throw new Error(`Failed to load schema config: ${response.status} ${response.statusText}`);
	}
	const data = await response.json();
	if (!isSingleFormConfig(data)) {
		throw new Error('Load endpoint must return { schema, uiSchema? }');
	}
	return data;
}

export async function saveSingleFormConfig(saveUrl: string, data: SingleFormSavePayload): Promise<void> {
	const response = await fetch(saveUrl, {
		method: 'POST',
		credentials: 'include',
		headers: {
			accept: 'application/json',
			'content-type': 'application/json'
		},
		body: JSON.stringify(data)
	});
	if (!response.ok) {
		throw new Error(`Failed to save schema config: ${response.status} ${response.statusText}`);
	}
}
