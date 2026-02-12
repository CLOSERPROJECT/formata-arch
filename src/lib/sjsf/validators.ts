import type { Creatable, Validator as SJSFValidator, ValidatorFactoryOptions } from '@sjsf/form';

import { createFormValidator as ajv } from '@sjsf/ajv8-validator';

export enum Validator {
	Ajv = 'ajv8'
}

export const SJSF_VALIDATORS: Record<
	Validator,
	Creatable<SJSFValidator, ValidatorFactoryOptions>
> = {
	[Validator.Ajv]: ajv
};

export const VALIDATOR_PEER_DEPS: Record<Validator, string> = {
	[Validator.Ajv]: 'ajv'
};
