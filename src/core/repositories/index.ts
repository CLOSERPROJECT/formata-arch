import type { Schema } from '@sjsf/form';
import type Result from 'true-myth/result';

//

export type Repository<T> = {
	getSchema: () => Schema;
	getOne(key: string): Result<T, Error>;
	create: (data: T) => Result<T, Error>;
	update: (key: string, data: T) => Result<T, Error>;
	delete: (key: string) => Result<void, Error>;
};
