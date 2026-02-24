import { Ajv } from 'ajv';
import { describe, expect, it } from 'vitest';
import YAML from 'yaml';

import * as Config from './config.js';

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
		const raw = await Bun.file(url).text();
		const data = YAML.parse(raw) as unknown;
		const ajv = new Ajv();
		ajv.addSchema(Config.Schema);

		const valid = ajv.validate(Config.Schema.$id, data);
		if (!valid && ajv.errors) {
			console.error(ajv.errors);
		}
		expect(valid).toBe(true);
	});
});
