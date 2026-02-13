import { isObject } from '@sjsf/form/lib/object';
import type { CompatibleComponentType, Schema, UiSchemaRoot } from '@sjsf/form';

import { constant } from '$lib/function.js';
import { ActualTheme, type Theme, type WidgetType } from '$lib/sjsf/theme.js';
import {
	NodeType,
	RangeValueType,
	type AbstractNode,
	type CustomizableNodeType,
	type Node
} from '$lib/builder/index.js';

import { WIDGET_NAMES } from './model.js';

type Factory<T extends NodeType, R> = (node: Extract<Node, AbstractNode<T>>) => R;

type Factories<R> = { [T in NodeType]?: Factory<T, R> };

const basicThemeSchema: Factories<Schema> = {
	[NodeType.Enum]: constant({
		properties: {
			widget: {
				enum: ['selectWidget', 'radioWidget'] satisfies CompatibleComponentType<'selectWidget'>[]
			}
		}
	}),
	[NodeType.MultiEnum]: constant({
		properties: {
			widget: {
				enum: [
					'checkboxesWidget',
					'multiSelectWidget'
				] satisfies CompatibleComponentType<'checkboxesWidget'>[]
			}
		}
	}),
	[NodeType.String]: constant({
		properties: {
			widget: {
				enum: [
					'textWidget',
					'textareaWidget',
					'datePickerWidget'
				] satisfies CompatibleComponentType<'textWidget'>[]
			}
		}
	}),
	[NodeType.Number]: constant({
		properties: {
			widget: {
				enum: ['numberWidget', 'rangeWidget'] satisfies CompatibleComponentType<'numberWidget'>[]
			}
		}
	}),
	[NodeType.Boolean]: constant({
		properties: {
			widget: {
				enum: ['checkboxWidget'] satisfies CompatibleComponentType<'checkboxWidget'>[]
			}
		}
	}),
	[NodeType.File]: constant({
		properties: {
			widget: {
				enum: ['fileWidget'] satisfies CompatibleComponentType<'fileWidget'>[]
			}
		}
	})
};

export const THEME_SCHEMAS: Record<Theme, Factories<Schema>> = {
	[ActualTheme.Shadcn4]: {
		[NodeType.Enum]: constant({
			properties: {
				widget: {
					enum: [
						'selectWidget',
						'radioWidget',
						'comboboxWidget'
					] satisfies CompatibleComponentType<'selectWidget'>[]
				}
			}
		}),
		[NodeType.MultiEnum]: constant({
			properties: {
				widget: {
					enum: [
						'checkboxesWidget',
						'multiSelectWidget'
					] satisfies CompatibleComponentType<'checkboxesWidget'>[]
				}
			}
		}),
		[NodeType.String]: constant({
			properties: {
				widget: {
					enum: [
						'textWidget',
						'textareaWidget',
						'datePickerWidget'
					] satisfies CompatibleComponentType<'textWidget'>[]
				}
			}
		}),
		[NodeType.Number]: constant({
			properties: {
				widget: {
					enum: ['numberWidget', 'rangeWidget'] satisfies CompatibleComponentType<'numberWidget'>[]
				}
			}
		}),
		[NodeType.Boolean]: constant({
			properties: {
				widget: {
					enum: [
						'checkboxWidget',
						'switchWidget'
					] satisfies CompatibleComponentType<'checkboxWidget'>[]
				}
			}
		}),
		[NodeType.File]: constant({
			properties: {
				widget: {
					enum: ['fileWidget'] satisfies CompatibleComponentType<'fileWidget'>[]
				}
			}
		}),
		[NodeType.Range]: (node) => ({
			properties: {
				widget: {
					enum: {
						[RangeValueType.String]: [
							'dateRangePickerWidget'
						] satisfies CompatibleComponentType<'dateRangePickerWidget'>[],
						[RangeValueType.Number]: [
							'rangeSliderWidget'
						] satisfies CompatibleComponentType<'rangeSliderWidget'>[]
					}[node.valueType]
				}
			}
		})
	},
};

export const THEME_UI_SCHEMAS: Record<Theme, Factories<UiSchemaRoot | undefined>> = {
	[ActualTheme.Shadcn4]: schemasToEnumNames(THEME_SCHEMAS[ActualTheme.Shadcn4]),

};

function schemasToEnumNames(schemas: Factories<Schema>) {
	const result: Factories<UiSchemaRoot | undefined> = {};
	for (const [type, schema] of Object.entries(schemas)) {
		const uiSchema = schemaToEnumNames(schema as never);
		result[type as NodeType] = uiSchema;
	}
	return result;
}

function schemaToEnumNames<T extends NodeType>(factory: Factory<T, Schema>) {
	return (node: Extract<Node, AbstractNode<T>>): UiSchemaRoot | undefined => {
		const schema = factory(node);
		const widget = schema.properties?.widget;
		if (
			widget === undefined ||
			!isObject(widget) ||
			widget.enum === undefined ||
			widget.enum.some((v) => typeof v !== 'string' || !(v in WIDGET_NAMES))
		) {
			return undefined;
		}
		return {
			widget: {
				'ui:options': {
					enumNames: widget.enum.map((v) => WIDGET_NAMES[v as WidgetType])
				}
			}
		};
	};
}

const BASIC_THEME_CUSTOMIZABLE_NODE_TYPES = [
	NodeType.Object,
	NodeType.Grid,
	NodeType.Array,
	NodeType.Enum,
	NodeType.MultiEnum,
	NodeType.String,
	NodeType.Number,
	NodeType.Boolean,
	NodeType.File,
	NodeType.QrCode
] satisfies CustomizableNodeType[];

export const THEME_CUSTOMIZABLE_NODE_TYPES: Record<Theme, CustomizableNodeType[]> = {
	[ActualTheme.Shadcn4]: [...BASIC_THEME_CUSTOMIZABLE_NODE_TYPES, NodeType.Range],

};

export const THEME_RANGE_VALUE_TYPES: Record<Theme, RangeValueType[]> = {		
	[ActualTheme.Shadcn4]: [RangeValueType.String, RangeValueType.Number],
};
