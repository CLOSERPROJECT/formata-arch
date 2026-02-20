import type { Schema } from '@sjsf/form';
import type Result from 'true-myth/result';
import type { Entities } from './utils.js';
import type { AttestaConfig } from '$core/schema.js';
import { UserRepository } from './user.repository.js';

//

export type Repository<T> = {
	getSchema: () => Schema;
	getOne(key: string): Result<T, Error>;
	create: (data: T) => Result<T, Error>;
	update: (key: string, data: T) => Result<T, Error>;
	delete: (key: string) => Result<void, Error>;
};

export function getRepository(entity: Entities, config: AttestaConfig): Repository<any> {
	switch (entity) {
		case 'User':
			return new UserRepository(config);
		default:
			throw new Error(`Repository for entity ${entity} not found`);
	}
}
