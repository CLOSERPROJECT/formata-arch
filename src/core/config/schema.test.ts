import { Ajv } from 'ajv';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

import * as Config from './schema.js';
import { deserialize } from './serde.js';

//

describe('sourceSchema', () => {
	it('compiles with AJV', () => {
		const ajv = new Ajv();
		const compile = () => ajv.compile(Config.Schema);
		expect(compile).not.toThrow();
		const validate = compile();
		expect(typeof validate).toBe('function');
	});

	it('validates parsed source.yaml', async () => {
		const url = new URL('config.sample.yaml', import.meta.url);
		const raw = await readFile(fileURLToPath(url), 'utf-8');
		const data = deserialize(raw);
		if (!data.isOk) {
			console.error(data.error.message);
		}
		expect(data.isOk).toBe(true);
	});
});
