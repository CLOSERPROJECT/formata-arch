import type {
	ComponentProps,
	ComponentType,
	FieldCommonProps,
	Theme as SJSFTheme,
	UiOptions,
	UiSchema
} from '@sjsf/form';
import type { WidgetCommonProps } from '@sjsf/form/fields/widgets';

import '@sjsf/form/fields/extra/aggregated-include';
import '@sjsf/form/fields/extra/boolean-select-include';
import '@sjsf/form/fields/extra/enum-include';
import '@sjsf/form/fields/extra/file-include';
import '@sjsf/form/fields/extra/multi-enum-include';
import '@sjsf/form/fields/extra/unknown-native-file-include';
import '@sjsf/form/fields/extra/array-native-files-include';
import '@sjsf/form/fields/extra/array-files-include';
import '@sjsf/form/fields/extra/array-tags-include';

import { theme as basic } from '@sjsf/basic-theme';
import basicStyles from '@sjsf/basic-theme/css/basic.css?raw';
import picoStyles from '@picocss/pico/css/pico.css?raw';
import picoAdapterStyles from '@sjsf/basic-theme/css/pico.css?raw';
import '@sjsf/basic-theme/extra-widgets/checkboxes-include';
import '@sjsf/basic-theme/extra-widgets/date-picker-include';
import '@sjsf/basic-theme/extra-widgets/file-include';
import '@sjsf/basic-theme/extra-widgets/multi-select-include';
import '@sjsf/basic-theme/extra-widgets/radio-include';
import '@sjsf/basic-theme/extra-widgets/range-include';
import '@sjsf/basic-theme/extra-widgets/textarea-include';


import { theme as shadcn4 } from '@sjsf/shadcn4-theme';
import shadcn4Styles from '@sjsf/shadcn4-theme/styles.css?raw';
import '@sjsf/shadcn4-theme/extra-widgets/checkboxes-include';
import '@sjsf/shadcn4-theme/extra-widgets/combobox-include';
import '@sjsf/shadcn4-theme/extra-widgets/date-picker-include';
import '@sjsf/shadcn4-theme/extra-widgets/date-range-picker-include';
import '@sjsf/shadcn4-theme/extra-widgets/file-include';
import '@sjsf/shadcn4-theme/extra-widgets/multi-select-include';
import '@sjsf/shadcn4-theme/extra-widgets/radio-buttons-include';
import '@sjsf/shadcn4-theme/extra-widgets/radio-include';
import '@sjsf/shadcn4-theme/extra-widgets/range-include';
import '@sjsf/shadcn4-theme/extra-widgets/range-slider-include';
import '@sjsf/shadcn4-theme/extra-widgets/switch-include';
import '@sjsf/shadcn4-theme/extra-widgets/textarea-include';



export type FieldType = {
	[T in ComponentType]: ComponentProps[T] extends FieldCommonProps<any> ? T : never;
}[ComponentType];

export type WidgetType = {
	[T in ComponentType]: ComponentProps[T] extends WidgetCommonProps<any> ? T : never;
}[ComponentType];

export enum ActualTheme {
	Shadcn4 = 'shadcn4'
}

const ACTUAL_THEMES = Object.values(ActualTheme);


export type Theme = ActualTheme;

export const THEMES = [...ACTUAL_THEMES];

interface MergeArraysOptions<T> {
	merge?: (l: T, r: T) => T;
	/**
	 * @default false
	 */
	unique?: boolean;
}

function mergeArrays<T>(left: T[], right: T[], { merge, unique }: MergeArraysOptions<T> = {}) {
	let merged: T[];
	if (merge) {
		const [minArr, maxArr] = left.length <= right.length ? [left, right] : [right, left];
		merged = new Array(maxArr.length);
		for (let i = 0; i < minArr.length; i++) {
			merged[i] = merge(left[i]!, right[i]!);
		}
		for (let i = minArr.length; i < maxArr.length; i++) {
			merged[i] = maxArr[i]!;
		}
	} else {
		merged = left.concat(right);
	}
	return unique ? Array.from(new Set(merged)) : merged;
}

function mergeUiSchemaItems(
	lItems: NonNullable<UiSchema['items']>,
	rItems: NonNullable<UiSchema['items']>
): UiSchema['items'] {
	const isRArray = Array.isArray(rItems);
	if (Array.isArray(lItems) !== isRArray) {
		return rItems;
	}
	if (isRArray) {
		return mergeArrays(lItems as UiSchema[], rItems as UiSchema[], {
			merge: mergeUiSchemas
		});
	}
	return mergeUiSchemas(lItems as UiSchema, rItems as UiSchema);
}

const COMMON_NESTED_KEYS = ['layouts', 'buttons'] as const satisfies (keyof UiOptions)[];

export function mergeUiSchemas(left: UiSchema, right: UiSchema): UiSchema {
	const merged = Object.assign({}, left, right);
	const commonKeys = new Set(Object.keys(left)).intersection(new Set(Object.keys(right)));
	for (const key of commonKeys) {
		const l = left[key];
		const r = right[key];
		if (key === 'ui:options' || key === 'ui:components' || key === 'ui:globalOptions') {
			//@ts-expect-error
			merged[key] = Object.assign({}, l, r);
			for (const k of COMMON_NESTED_KEYS) {
				if (l && r && k in l && k in r) {
					//@ts-expect-error
					merged[key][k] = Object.assign({}, l[k], r[k]);
				}
			}
		} else if (key === 'items') {
			merged['items'] = mergeUiSchemaItems(l as UiSchema[], r as UiSchema[]);
		} else if (key === 'anyOf' || key === 'oneOf') {
			merged[key] = mergeArrays(l as UiSchema[], r as UiSchema[], {
				merge: mergeUiSchemas
			});
		} else {
			merged[key] = mergeUiSchemas(l as UiSchema, r as UiSchema);
		}
	}
	return merged;
}
