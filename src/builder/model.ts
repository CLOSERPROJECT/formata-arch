import { pickSchemaType, typeOfValue } from '@sjsf/form/core';
import type { UiOptions, UiSchema } from '@sjsf/form';

import { constant } from '$lib/function.js';
import { Resolver } from '$lib/sjsf/resolver.js';
import {
	BOOLEAN_NODE_OPTIONS_SCHEMA,
	buildEnumValues,
	ENUM_OPTIONS_SCHEMA,
	FILE_NODE_OPTIONS_SCHEMA,
	MULTI_ENUM_OPTIONS_SCHEMA,
	NodeType,
	NUMBER_NODE_OPTIONS_SCHEMA,
	STRING_NODE_OPTIONS_SCHEMA,
	type AbstractNode,
	type Node,
	type TextWidgetParams,
	type WidgetNode,
	type WidgetNodeType
} from '$lib/builder/index.js';
import {
	ActualTheme,
	type Theme,
	type FieldType,
	type WidgetType
} from '$lib/sjsf/theme.js';

import type { BuilderDraggable } from './context.svelte.js';

export interface NodeProps<T extends NodeType> {
	node: Extract<Node, AbstractNode<T>>;
	draggable: BuilderDraggable;
	showRequired: boolean;
	unmount: () => void;
}

export enum RouteName {
	Editor = 'editor',
	Preview = 'preview'
}

export interface AbstractRoute<N extends RouteName> {
	name: N;
}

export interface EditorRoute extends AbstractRoute<RouteName.Editor> {}

export enum PreviewSubRouteName {
	Code = 'code',
	Schema = 'schema'
}

export interface PreviewRoute extends AbstractRoute<RouteName.Preview> {
	subRoute?: PreviewSubRouteName;
}

export type Route = EditorRoute | PreviewRoute;

function basicTextOptions(params: TextWidgetParams): UiOptions {
	return { text: { ...params } };
}

export const TEXT_WIDGET_OPTIONS: Record<Theme, (params: TextWidgetParams) => UiOptions> = {
	[ActualTheme.Shadcn4]: (params) => ({ shadcn4Text: { ...params } }),

};

export const CHECKBOXES_WIDGET_OPTIONS: Record<Theme, (inline: boolean) => UiOptions> = {
	
	[ActualTheme.Shadcn4]: (inline) =>
		inline
			? {
					layouts: {
						'field-content': {
							style: 'display: flex; gap: 1rem;'
						}
					}
				}
			: {},

};

export const RADIO_WIDGET_OPTIONS: Record<Theme, (inline: boolean) => UiOptions> = {
	...CHECKBOXES_WIDGET_OPTIONS,
	[ActualTheme.Shadcn4]: (inline) =>
		inline
			? {
					shadcn4RadioGroup: {
						style: 'grid-auto-flow: column; grid-auto-columns: max-content;'
					}
				}
			: {},

};

export const DEFAULT_COMPONENTS: Record<
	Resolver,
	{
		[T in WidgetNodeType]: (
			node: Extract<WidgetNode, AbstractNode<T>>
		) => UiSchema['ui:components'];
	}
> = {
	[Resolver.Basic]: {
		[NodeType.Enum]: (node) => {
			const items = buildEnumValues(node.valueType, node.items);
			const type = pickSchemaType(items.map(typeOfValue));
			return {
				[`${type}Field`]: 'enumField'
			} satisfies UiSchema['ui:components'];
		},
		[NodeType.MultiEnum]: constant({
			arrayField: 'multiEnumField'
		}),
		[NodeType.String]: constant(undefined),
		[NodeType.Number]: constant(undefined),
		[NodeType.Boolean]: constant(undefined),
		[NodeType.File]: (node): UiSchema['ui:components'] => {
			if (node.options.multiple) {
				return {
					arrayField: node.options.native ? 'arrayNativeFilesField' : 'arrayFilesField'
				};
			}
			return node.options.native
				? {
						unknownField: 'unknownNativeFileField'
					}
				: {
						stringField: 'fileField'
					};
		},
		[NodeType.Tags]: constant({
			arrayField: 'arrayTagsField'
		}),
		[NodeType.Range]: constant({
			objectField: 'aggregatedField'
		}),
		[NodeType.QrCode]: constant({
			stringField: 'formataQrField'
		} as unknown as UiSchema['ui:components'])
	},
	[Resolver.Compat]: {
		[NodeType.Enum]: constant(undefined),
		[NodeType.MultiEnum]: constant(undefined),
		[NodeType.String]: constant(undefined),
		[NodeType.Number]: constant(undefined),
		[NodeType.Boolean]: constant(undefined),
		[NodeType.File]: (node): UiSchema['ui:components'] => {
			if (!node.options.native) {
				return undefined;
			}
			return node.options.multiple
				? {
						arrayField: 'arrayNativeFilesField'
					}
				: {
						unknownField: 'unknownNativeFileField'
					};
		},
		[NodeType.Tags]: constant({
			arrayField: 'arrayTagsField'
		}),
		[NodeType.Range]: constant({
			objectField: 'aggregatedField'
		}),
		[NodeType.QrCode]: constant({
			stringField: 'formataQrField'
		} as unknown as UiSchema['ui:components'])
	}
};

export const DEFAULT_WIDGETS: Record<WidgetNodeType, WidgetType> = {
	[NodeType.Enum]: ENUM_OPTIONS_SCHEMA.properties.widget.default,
	[NodeType.MultiEnum]: MULTI_ENUM_OPTIONS_SCHEMA.properties.widget.default,
	[NodeType.String]: STRING_NODE_OPTIONS_SCHEMA.properties.widget.default,
	[NodeType.Number]: NUMBER_NODE_OPTIONS_SCHEMA.properties.widget.default,
	[NodeType.Boolean]: BOOLEAN_NODE_OPTIONS_SCHEMA.properties.widget.default,
	[NodeType.File]: FILE_NODE_OPTIONS_SCHEMA.properties.widget.default,
	[NodeType.Tags]: FILE_NODE_OPTIONS_SCHEMA.properties.widget.default,
	[NodeType.Range]: 'aggregatedWidget',
	[NodeType.QrCode]: 'textWidget'
};

const BASE_WIDGETS = [
	'textWidget',
	'numberWidget',
	'checkboxWidget',
	'selectWidget'
] as const satisfies WidgetType[];

export type BaseWidgetType = (typeof BASE_WIDGETS)[number];

const BASE_WIDGETS_SET = new Set<WidgetType>(BASE_WIDGETS);

export function isBaseWidget(w: WidgetType): w is BaseWidgetType {
	return BASE_WIDGETS_SET.has(w);
}

export type ExtraWidgetType = Exclude<WidgetType, BaseWidgetType>;

export type FileFieldMode = number;
export const FILE_FIELD_SINGLE_MODE = 1;
export const FILE_FIELD_MULTIPLE_MODE = FILE_FIELD_SINGLE_MODE << 1;
export const FILE_FIELD_NATIVE_SINGLE_MODE = FILE_FIELD_MULTIPLE_MODE << 1;
export const FILE_FIELD_NATIVE_MULTIPLE_MODE = FILE_FIELD_NATIVE_SINGLE_MODE << 1;

type StripFieldSuffix<T> = T extends `${infer U}Field` ? U : T;

export function fileFieldModeToFields(mode: FileFieldMode): StripFieldSuffix<FieldType>[] {
	const fields: StripFieldSuffix<FieldType>[] = [];
	if (mode & FILE_FIELD_SINGLE_MODE) {
		fields.push('file');
	}
	if (mode & FILE_FIELD_MULTIPLE_MODE) {
		fields.push('files');
	}
	if (mode & FILE_FIELD_NATIVE_SINGLE_MODE) {
		fields.push('unknownNativeFile');
	}
	if (mode & FILE_FIELD_NATIVE_MULTIPLE_MODE) {
		fields.push('arrayNativeFiles');
	}
	return fields;
}

export const WIDGET_EXTRA_FIELD: Record<WidgetType, StripFieldSuffix<FieldType> | undefined> = {
	textWidget: undefined,
	numberWidget: undefined,
	selectWidget: 'enum',
	checkboxWidget: undefined,
	fileWidget: undefined,
	checkboxesWidget: 'multiEnum',
	tagsWidget: 'tags',
	datePickerWidget: undefined,
	multiSelectWidget: 'multiEnum',
	radioWidget: 'enum',
	rangeWidget: undefined,
	textareaWidget: undefined,
	radioButtonsWidget: 'enum',
	switchWidget: undefined,
	comboboxWidget: 'enum',
	shadcn4DateRangePickerWidget: 'aggregated',
	aggregatedWidget: 'aggregated',
	dateRangePickerWidget: 'aggregated',
	rangeSliderWidget: 'aggregated'
};

export const WIDGET_NAMES: Record<WidgetType, string> = {
	textWidget: 'Text input',
	numberWidget: 'Number input',
	selectWidget: 'Select',
	checkboxWidget: 'Checkbox',
	fileWidget: 'File input',
	checkboxesWidget: 'Checkboxes',
	tagsWidget: 'Tags',
	datePickerWidget: 'Date picker',
	multiSelectWidget: 'Multi Select',
	radioWidget: 'Radio group',
	rangeWidget: 'Range',
	textareaWidget: 'Textarea',
	radioButtonsWidget: 'Radio buttons',
	switchWidget: 'Switch',
	comboboxWidget: 'Combobox',
	aggregatedWidget: 'Invalid widget',
	shadcn4DateRangePickerWidget: 'Date range picker',
	dateRangePickerWidget: 'Date range picker',
	rangeSliderWidget: 'Range slider'
};

const WIDGET_USE_LABEL: Record<WidgetType, boolean | Set<Theme>> = {
	textWidget: true,
	numberWidget: true,
	selectWidget: true,
	checkboxWidget: true,
	fileWidget: true,
	checkboxesWidget: false,
	tagsWidget: true,
	datePickerWidget: true,
	multiSelectWidget: true,
	radioWidget: false,
	rangeWidget: true,
	textareaWidget: true,
	radioButtonsWidget: false,
	switchWidget: true,
	comboboxWidget: true,
	aggregatedWidget: false,
	shadcn4DateRangePickerWidget: false,
	dateRangePickerWidget: new Set([ActualTheme.Shadcn4]),
	rangeSliderWidget: false
};

export function getUseLabel(theme: Theme, widgetType: WidgetType): boolean {
	const useLabel = WIDGET_USE_LABEL[widgetType];
	if (typeof useLabel === 'boolean') {
		return useLabel;
	}
	return useLabel.has(theme);
}

export const EXTRA_WIDGET_IMPORTS: Record<ExtraWidgetType, string> = {
	fileWidget: 'file',
	checkboxesWidget: 'checkboxes',
	tagsWidget: 'tags',
	datePickerWidget: 'date-picker',
	multiSelectWidget: 'multi-select',
	radioWidget: 'radio',
	rangeWidget: 'range',
	textareaWidget: 'textarea',
	radioButtonsWidget: 'radio-buttons',
	switchWidget: 'switch',
	comboboxWidget: 'combobox',
	shadcn4DateRangePickerWidget: 'date-range-picker',
	aggregatedWidget: 'virtual-widget-import',
	dateRangePickerWidget: 'date-range-picker',
	rangeSliderWidget: 'range-slider'
};
