<script lang="ts" generics="T extends object">
	import { onDestroy, untrack } from 'svelte';
	import {
		Content,
		SimpleForm,
		createForm,
		ON_CHANGE,
		ON_INPUT,
		setFormContext,
		validate,
		type Schema,
		type UiSchema,
		Form,
		BasicForm
	} from '@sjsf/form';
	import { omitExtraData } from '@sjsf/form/omit-extra-data';

	import * as defaults from '$builder/editor/node-settings.js';

	interface Props {
		schema: Schema;
		uiSchema?: UiSchema;
		initialValue?: Partial<T>;
		onSubmit?: (value: T) => void;
	}

	let { schema, uiSchema, initialValue, onSubmit }: Props = $props();

	const form = createForm({
		...defaults,
		validator: (options) => {
			const v = defaults.validator(options);
			return {
				...v,
				validateFormValue(rootSchema, formValue) {
					const cleanData = omitExtraData(v, options.merger(), options.schema, formValue);
					return v.validateFormValue(rootSchema, cleanData);
				}
			};
		},
		get initialValue() {
			return untrack(() => $state.snapshot(initialValue));
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
			onSubmit?.(value as T);
		}
	});

	setFormContext(form);

	onDestroy(() => {
		form.fieldsValidation.abort();
	});

	// $effect(() => {
	// 	if (form.fieldsValidation.isProcessed) {
	// 		return;
	// 	}
	// 	const { value } = validate(form);
	// 	onSubmit?.(value as T);
	// });
</script>

<BasicForm {form} />
