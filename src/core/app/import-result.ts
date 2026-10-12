import type { ErrorObject } from 'ajv';

import type { Stream } from '$core';

export type ParseImportResult =
	| { status: 'blocking'; message: string }
	| { status: 'loadable'; data: Stream.Data; fixable: ErrorObject[] };
