import type { DeepPartial } from '@sjsf/form/lib/types';

import {
	createForm,
	ON_CHANGE,
	ON_INPUT,
	setFormContext,
	type FormState,
	type Schema,
	type UiSchema
} from '@sjsf/form';
import { overrideByRecord } from '@sjsf/form/lib/resolver';
import * as defaults from '$builder/editor/node-settings.js';
import { onDestroy, untrack } from 'svelte';

import AnimatedArray from './animated-array.svelte';
import { resolver } from './form.resolver.js';

//

const theme = overrideByRecord(defaults.theme, {
	arrayField: AnimatedArray
});

interface Props<T> {
	schema: Schema;
	uiSchema?: UiSchema;
	initialValue?: Partial<T>;
	onSubmit?: (value: T) => void;
}

export function make<T>(props: Props<T>): FormState<T> {
	const { schema, uiSchema, initialValue, onSubmit } = props;

	const form = createForm({
		...defaults,
		resolver,
		theme,
		// validator: (options) => {
		// 	const v = defaults.validator(options);
		// 	const validator: FormValidator<Partial<T>> = {
		// 		...v,
		// 		validateFormValue(rootSchema, formValue) {
		// 			const cleanData = omitExtraData(v, options.merger(), options.schema, formValue);
		// 			return v.validateFormValue(rootSchema, cleanData) as ValidationResult<Partial<T>>;
		// 		}
		// 	};
		// 	return validator;
		// },
		get initialValue() {
			return untrack(() => $state.snapshot(initialValue) as DeepPartial<Partial<T>>);
		},
		get schema() {
			return schema;
		},
		get uiSchema() {
			return uiSchema;
		},
		fieldsValidationMode: ON_INPUT | ON_CHANGE,
		fieldsValidationDebounceMs: 200,
		onSubmit(value, e) {
			e.preventDefault();
			onSubmit?.(value as T);
		}
	});

	return form as FormState<T>;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function setComponentContext(form: FormState<any>) {
	setFormContext(form);

	onDestroy(() => {
		form.fieldsValidation.abort();
	});
}
