import type { Schema, UiSchema } from '@sjsf/form';
import type Result from 'true-myth/result';

//

export type Repository<T> = {
	getEntityName: () => string;
	getSchema: () => Schema;
	getUiSchema?: () => UiSchema;
	list(): T[];
	getOne(key: string): Result<T, Error>;
	getKey(record: T): string;
	create: (data: T) => Result<T, Error>;
	update: (key: string, data: T) => Result<T, Error>;
	delete: (key: string) => Result<void, Error>;
};
