import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import { deserialize, serialize } from './serde.js';

//

describe('serde', () => {
	it('deserializes config.sample.yaml to Config shape', async () => {
		const url = new URL('config.sample.yaml', import.meta.url);
		const raw = await readFile(fileURLToPath(url), 'utf-8');
		const result = deserialize(raw);
		expect(result.isOk).toBe(true);
		if (result.isOk) {
			const config = result.value;
			expect(config).toHaveProperty('workflow');
			expect(config).toHaveProperty('organizations');
			expect(config).toHaveProperty('roles');
			expect(config).toHaveProperty('dpp');
		}
	});

	it('round-trips: deserialize(serialize(config)) equals config', async () => {
		const url = new URL('config.sample.yaml', import.meta.url);
		const raw = await readFile(fileURLToPath(url), 'utf-8');
		const parseResult = deserialize(raw);
		expect(parseResult.isOk).toBe(true);
		if (!parseResult.isOk) return;
		const config = parseResult.value;
		const strResult = serialize(config);
		expect(strResult.isOk).toBe(true);
		if (!strResult.isOk) return;
		const config2Result = deserialize(strResult.value);
		expect(config2Result.isOk).toBe(true);
		if (config2Result.isOk) {
			expect(config2Result.value).toEqual(config);
		}
	});
});
