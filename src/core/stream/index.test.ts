import { describe, expect, it } from 'vitest';

import streamMock from './stream.mock.json' with { type: 'json' };
import { validate } from './validation.js';

describe('stream.mock.json', () => {
	it('validates as a stream document (AJV, no taxonomy option)', () => {
		const result = validate(streamMock);
		expect(result.isOk).toBe(true);
	});
});
