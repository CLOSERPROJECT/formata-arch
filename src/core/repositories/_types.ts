import type { Schema, UiSchema } from '@sjsf/form';
import type Result from 'true-myth/result';

//

export type Repository<T> = {
	getSchema: () => Schema;
	getUiSchema?: () => UiSchema;
	list(): T[];
	getOne(key: string): Result<T, Error>;
	getKey?(record: T): string; // Stable key for a record (default: (record as any).id)
	create: (data: T) => Result<T, Error>;
	update: (key: string, data: T) => Result<T, Error>;
	delete: (key: string) => Result<void, Error>;
};
