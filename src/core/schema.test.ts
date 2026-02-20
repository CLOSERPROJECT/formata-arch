import { describe, it, expect } from 'vitest';
import {Ajv} from 'ajv';
import YAML from 'yaml';
import { sourceSchema } from './schema.js';
import sourceYamlRaw from './source.yaml?raw';

// 

describe('sourceSchema', () => {
	it('compiles with AJV', () => {
		const ajv = new Ajv();
		const compile = () => ajv.compile(sourceSchema);
		expect(compile).not.toThrow();
		const validate = compile();
		expect(typeof validate).toBe('function');
	});

	it('validates parsed source.yaml', () => {
		const data = YAML.parse(sourceYamlRaw) as unknown;
		const ajv = new Ajv();
		const validate = ajv.compile(sourceSchema);
		const valid = validate(data);
		if (!valid && validate.errors) {
			// eslint-disable-next-line no-console
			console.error(validate.errors);
		}
		expect(valid).toBe(true);
	});
});
