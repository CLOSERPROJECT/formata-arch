import { describe, it, expect } from 'vitest';
import { Ajv } from 'ajv';
import YAML from 'yaml';
import { AttestaConfigSchema } from './schema.js';

describe('sourceSchema', () => {
	it('compiles with AJV', () => {
		const ajv = new Ajv();
		const compile = () => ajv.compile(AttestaConfigSchema);
		expect(compile).not.toThrow();
		const validate = compile();
		expect(typeof validate).toBe('function');
	});

	it('validates parsed source.yaml', async () => {
		const url = new URL('source.yaml', import.meta.url);
		const raw = await Bun.file(url).text();
		const data = YAML.parse(raw) as unknown;
		const ajv = new Ajv();
		ajv.addSchema(AttestaConfigSchema);

		const valid = ajv.validate(AttestaConfigSchema.$id, data);
		if (!valid && ajv.errors) {
			// eslint-disable-next-line no-console
			console.error(ajv.errors);
		}
		expect(valid).toBe(true);
	});
});
