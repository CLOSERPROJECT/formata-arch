import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { Data } from './types.js';

const minimalData = {
	workflow: { name: 'T', description: 'd', steps: [] },
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
} as Data;

describe('Stream.save POST URL (create vs update)', () => {
	beforeEach(() => {
		vi.stubGlobal('window', { location: { origin: 'http://localhost:3000' } });
		vi.stubEnv('DEV', false);
	});

	it('includes stream and omits new when updating an existing stream', async () => {
		const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 204 }));
		vi.stubGlobal('fetch', fetchMock);

		const { save } = await import('./client.js');
		const result = await save(minimalData, '6a6b546e563ecc4a0b4856c4', false, false);
		expect(result.isOk).toBe(true);

		const url = String(fetchMock.mock.calls[0]?.[0]);
		expect(url).toContain('stream=6a6b546e563ecc4a0b4856c4');
		expect(url).not.toContain('new=true');
	});

	it('includes stream and new=true when cloning (create path — skips purge)', async () => {
		const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 204 }));
		vi.stubGlobal('fetch', fetchMock);

		const { save } = await import('./client.js');
		const result = await save(minimalData, '6a6b546e563ecc4a0b4856c4', true, false);
		expect(result.isOk).toBe(true);

		const url = String(fetchMock.mock.calls[0]?.[0]);
		expect(url).toContain('stream=6a6b546e563ecc4a0b4856c4');
		expect(url).toContain('new=true');
	});

	it('omits stream when streamId is missing (bare create — skips purge)', async () => {
		const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 204 }));
		vi.stubGlobal('fetch', fetchMock);

		const { save } = await import('./client.js');
		const result = await save(minimalData, undefined, undefined, false);
		expect(result.isOk).toBe(true);

		const url = String(fetchMock.mock.calls[0]?.[0]);
		expect(url).not.toContain('stream=');
		expect(url).not.toContain('new=true');
	});
});
