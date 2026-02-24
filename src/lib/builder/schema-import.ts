/**
 * Schema (+ optional UiSchema) to rootNode importer.
 * Inverts the buildSchema/buildUiSchema pipeline so BuilderContext can be
 * initialized from raw JSON Schema and UI Schema.
 *
 * v1 limitations (not implemented):
 * - Conditional dependencies (schema.dependencies with oneOf/predicates) → imported as plain object.
 * - Grid → only if detectable from uiSchema; otherwise plain object.
 * - Exact widget round-trip → best-effort from uiSchema; theme-specific options may be lost.
 */

import type { Schema, UiSchema } from '@sjsf/form';

import type { CustomizableNode, ObjectNode } from './node.js';

import { EnumValueType } from './enum.js';
import { NodeType, type NodeId } from './node-base.js';
import { createEnumItemNode, createNode, createObjectProperty } from './node-factories.js';
import { createRangeNode, RangeValueType } from './range-node.js';

const SCHEMA_OPTIONS_KEYS = [
	'title',
	'description',
	'minItems',
	'maxItems',
	'uniqueItems',
	'default',
	'minLength',
	'maxLength',
	'pattern',
	'minimum',
	'exclusiveMinimum',
	'maximum',
	'exclusiveMaximum',
	'multipleOf'
] as const;

type SchemaOptionsKey = (typeof SCHEMA_OPTIONS_KEYS)[number];

function pickSchemaOptions(schema: Schema): Partial<Record<SchemaOptionsKey, unknown>> {
	const out: Partial<Record<SchemaOptionsKey, unknown>> = {};
	for (const key of SCHEMA_OPTIONS_KEYS) {
		const v = schema[key];
		if (v !== undefined) {
			out[key] = v;
		}
	}
	return out;
}

function nodeId(): NodeId {
	return crypto.randomUUID() as NodeId;
}

/** Infer widget from uiSchema fragment (best-effort). */
function inferWidgetFromUiSchema(
	uiSchema: UiSchema | undefined,
	nodeType: NodeType,
	defaultWidget: string
): string {
	if (!uiSchema) return defaultWidget;
	const components = uiSchema['ui:components'];
	if (components && typeof components === 'object') {
		// Check for known component -> widget mappings used by the builder
		// @ts-expect-error - Type is missing in the library but exists in formata-form
		if (components['stringField'] === 'formataQrField') return 'textWidget';
		if (components['objectField'] === 'aggregatedField') return 'aggregatedWidget';
		if (components['arrayField'] === 'multiEnumField') return 'checkboxesWidget';
		if (components['arrayField'] === 'arrayTagsField') return 'tagsWidget';
		if (
			components['arrayField'] === 'arrayFilesField' ||
			components['arrayField'] === 'arrayNativeFilesField'
		)
			return 'fileWidget';
	}
	// ui:options might not store widget directly; theme uses shadcn4Text etc.
	return defaultWidget;
}

function applyCommonOptions(
	node: CustomizableNode,
	schema: Schema,
	uiSchema: UiSchema | undefined,
	titleFallback: string
): void {
	const opts = pickSchemaOptions(schema);
	if (opts.title !== undefined) node.options.title = String(opts.title);
	else node.options.title = titleFallback;
	if (opts.description !== undefined) node.options.description = String(opts.description);
	const schemaRequired = (schema as Schema & { required?: boolean }).required;
	if (typeof schemaRequired === 'boolean') node.options.required = schemaRequired;

	if (uiSchema?.['ui:options'] && typeof uiSchema['ui:options'] === 'object') {
		const uio = uiSchema['ui:options'] as Record<string, unknown>;
		if (typeof uio.help === 'string') node.options.help = uio.help;
	}
}

function isRangeSchema(schema: Schema): boolean {
	if (schema.type !== 'object' || !schema.properties) return false;
	const keys = Object.keys(schema.properties);
	if (keys.length !== 2 || !keys.includes('start') || !keys.includes('end')) return false;
	const startSchema = schema.properties['start'];
	const endSchema = schema.properties['end'];
	if (
		!startSchema ||
		!endSchema ||
		typeof startSchema !== 'object' ||
		typeof endSchema !== 'object'
	)
		return false;
	const startType = (startSchema as Schema).type;
	const endType = (endSchema as Schema).type;
	if (startType === 'string' && endType === 'string') return true;
	if (
		(startType === 'number' || startType === 'integer') &&
		(endType === 'number' || endType === 'integer')
	)
		return true;
	return false;
}

function getRangeValueType(schema: Schema): RangeValueType {
	const startSchema = schema.properties?.['start'];
	if (typeof startSchema !== 'object' || startSchema === null) return RangeValueType.String;
	const t = (startSchema as Schema).type;
	if (t === 'number' || t === 'integer') return RangeValueType.Number;
	return RangeValueType.String;
}

function defaultArrayValueFromSchema(schema: Schema): string[] | undefined {
	const d = schema.default;
	if (!Array.isArray(d) || d.length === 0) return undefined;
	return d.map((v) => JSON.stringify(v));
}

export type ParseSchemaContext = {
	uiSchemaRoot?: UiSchema;
};

/**
 * Parse a JSON Schema (and optional UI Schema) into a CustomizableNode tree.
 * Root must be type 'object'. Returns an ObjectNode suitable for BuilderContext.rootNode.
 */
export function parseSchemaToRootNode(schema: Schema, uiSchema?: UiSchema): ObjectNode {
	if (schema.type !== 'object') {
		throw new Error('parseSchemaToRootNode: root schema must have type "object"');
	}
	const ctx: ParseSchemaContext = { uiSchemaRoot: uiSchema };
	const root = parseObject(schema, uiSchema, ctx, schema.title ?? 'Form title');
	if (root.type !== NodeType.Object) {
		throw new Error('parseSchemaToRootNode: expected ObjectNode at root');
	}
	return root as ObjectNode;
}

function parseObject(
	schema: Schema,
	uiSchema: UiSchema | undefined,
	_ctx: ParseSchemaContext,
	titleFallback: string
): CustomizableNode {
	// Range: object with exactly { start, end } and same subschema
	if (isRangeSchema(schema)) {
		const valueType = getRangeValueType(schema);
		const node = createRangeNode(nodeId(), valueType, {
			title: (schema.title as string) ?? titleFallback,
			required: Array.isArray(schema.required) && schema.required.includes('start'),
			widget: valueType === RangeValueType.Number ? 'rangeSliderWidget' : 'dateRangePickerWidget'
		});
		applyCommonOptions(node, schema, uiSchema, titleFallback);
		return node;
	}

	const obj = createNode(NodeType.Object) as ObjectNode;
	applyCommonOptions(obj, schema, uiSchema, titleFallback);

	const properties = schema.properties;
	if (!properties || typeof properties !== 'object') return obj;

	const requiredSet = new Set(Array.isArray(schema.required) ? schema.required : []);

	for (const [key, propSchema] of Object.entries(properties)) {
		if (!propSchema || typeof propSchema !== 'object') continue;
		const propUiSchema = uiSchema?.[key] as UiSchema | undefined;
		const child = parseSchemaValue(propSchema, propUiSchema, _ctx, key);
		const propNode = createObjectProperty(child);
		(child as CustomizableNode).options.required = requiredSet.has(key);
		(child as CustomizableNode).options.title = key;
		obj.properties.push(propNode);
	}
	return obj;
}

function parseSchemaValue(
	schema: Schema,
	uiSchema: UiSchema | undefined,
	ctx: ParseSchemaContext,
	titleFallback: string
): CustomizableNode {
	const opts = pickSchemaOptions(schema);

	// enum (no type or type string) -> EnumNode
	if (schema.enum !== undefined && (schema.type === undefined || schema.type === 'string')) {
		const enumNode = createNode(NodeType.Enum) as import('./node.js').EnumNode;
		enumNode.valueType = EnumValueType.String;
		const schemaWithNames = schema as Schema & { enumNames?: string[] };
		const enumNames = schemaWithNames.enumNames;
		enumNode.items = (schema.enum as unknown[]).map((value, i) => {
			const label = enumNames?.[i] ?? String(value);
			const val = typeof value === 'string' ? value : JSON.stringify(value);
			return createEnumItemNode(label, val);
		});
		enumNode.options.title = (opts.title as string) ?? titleFallback;
		enumNode.options.required = true;
		if (opts.default !== undefined) enumNode.options.defaultValue = JSON.stringify(opts.default);
		enumNode.options.widget = inferWidgetFromUiSchema(
			uiSchema,
			NodeType.Enum,
			'radioWidget'
		) as never;
		if (uiSchema?.['ui:options'] && typeof uiSchema['ui:options'] === 'object') {
			const uio = uiSchema['ui:options'] as Record<string, unknown>;
			if (typeof uio.inline === 'boolean') enumNode.options.inline = uio.inline;
		}
		return enumNode;
	}

	// type: 'array'
	if (schema.type === 'array') {
		const items = schema.items;
		if (items && typeof items === 'object' && !Array.isArray(items)) {
			const itemsSchema = items as Schema;
			// File (multiple): array of data-url
			if (itemsSchema.type === 'string' && itemsSchema.format === 'data-url') {
				const fileNode = createNode(NodeType.File);
				applyCommonOptions(fileNode, schema, uiSchema, titleFallback);
				fileNode.options.multiple = true;
				fileNode.options.native = false;
				fileNode.options.widget = inferWidgetFromUiSchema(
					uiSchema,
					NodeType.File,
					'fileWidget'
				) as never;
				return fileNode;
			}
			// MultiEnum: items.enum + uniqueItems
			if (itemsSchema.enum !== undefined && schema.uniqueItems === true) {
				const multiNode = createNode(NodeType.MultiEnum) as import('./node.js').MultiEnumNode;
				multiNode.valueType = EnumValueType.String;
				const itemsWithNames = itemsSchema as Schema & { enumNames?: string[] };
				const enumNames = itemsWithNames.enumNames;
				multiNode.items = (itemsSchema.enum as unknown[]).map((value, i) => {
					const label = enumNames?.[i] ?? String(value);
					const val = typeof value === 'string' ? value : JSON.stringify(value);
					return createEnumItemNode(label, val);
				});
				applyCommonOptions(multiNode, schema, uiSchema, titleFallback);
				if (opts.minItems !== undefined) multiNode.options.minItems = Number(opts.minItems);
				if (opts.maxItems !== undefined) multiNode.options.maxItems = Number(opts.maxItems);
				if (opts.default !== undefined)
					multiNode.options.defaultValue = defaultArrayValueFromSchema(schema);
				multiNode.options.widget = inferWidgetFromUiSchema(
					uiSchema,
					NodeType.MultiEnum,
					'checkboxesWidget'
				) as never;
				if (uiSchema?.['ui:options'] && typeof uiSchema['ui:options'] === 'object') {
					const uio = uiSchema['ui:options'] as Record<string, unknown>;
					if (typeof uio.inline === 'boolean') multiNode.options.inline = uio.inline;
				}
				return multiNode;
			}
			// Tags: items.type string + uniqueItems
			if (itemsSchema.type === 'string' && schema.uniqueItems === true) {
				const tagsNode = createNode(NodeType.Tags);
				applyCommonOptions(tagsNode, schema, uiSchema, titleFallback);
				tagsNode.options.widget = inferWidgetFromUiSchema(
					uiSchema,
					NodeType.Tags,
					'tagsWidget'
				) as never;
				return tagsNode;
			}
		}
		// Generic array
		const arrayNode = createNode(NodeType.Array) as import('./node.js').ArrayNode;
		applyCommonOptions(arrayNode, schema, uiSchema, titleFallback);
		if (opts.default !== undefined)
			arrayNode.options.defaultValue = defaultArrayValueFromSchema(schema);
		const itemSchema: Schema =
			items && typeof items === 'object' && !Array.isArray(items)
				? (items as Schema)
				: { type: 'string' };
		const itemUi = uiSchema?.items as UiSchema | undefined;
		arrayNode.item = parseSchemaValue(itemSchema, itemUi, ctx, 'Item');
		return arrayNode;
	}

	// type: 'string'
	if (schema.type === 'string') {
		if (schema.format === 'data-url') {
			const fileNode = createNode(NodeType.File);
			applyCommonOptions(fileNode, schema, uiSchema, titleFallback);
			(fileNode.options as { multiple: boolean; native: boolean }).multiple = false;
			(fileNode.options as { multiple: boolean; native: boolean }).native = false;
			fileNode.options.widget = inferWidgetFromUiSchema(
				uiSchema,
				NodeType.File,
				'fileWidget'
			) as never;
			return fileNode;
		}
		const stringNode = createNode(NodeType.String);
		applyCommonOptions(stringNode, schema, uiSchema, titleFallback);
		if (opts.default !== undefined) stringNode.options.default = String(opts.default);
		if (opts.minLength !== undefined) stringNode.options.minLength = Number(opts.minLength);
		if (opts.maxLength !== undefined) stringNode.options.maxLength = Number(opts.maxLength);
		if (opts.pattern !== undefined) stringNode.options.pattern = String(opts.pattern);
		stringNode.options.widget = inferWidgetFromUiSchema(
			uiSchema,
			NodeType.String,
			'textWidget'
		) as never;
		if (uiSchema?.['ui:options'] && typeof uiSchema['ui:options'] === 'object') {
			const uio = uiSchema['ui:options'] as Record<string, unknown>;
			if (typeof uio.placeholder === 'string') stringNode.options.placeholder = uio.placeholder;
			// Theme may store in shadcn4Text.text.placeholder
			const textOpts = uio.text ?? (uio as Record<string, unknown>).shadcn4Text;
			if (
				textOpts &&
				typeof textOpts === 'object' &&
				(textOpts as Record<string, unknown>).placeholder
			)
				stringNode.options.placeholder = String((textOpts as Record<string, unknown>).placeholder);
		}
		return stringNode;
	}

	// type: 'number' | 'integer'
	if (schema.type === 'number' || schema.type === 'integer') {
		const numberNode = createNode(NodeType.Number);
		applyCommonOptions(numberNode, schema, uiSchema, titleFallback);
		numberNode.options.integer = schema.type === 'integer';
		if (opts.default !== undefined) numberNode.options.default = Number(opts.default);
		if (opts.minimum !== undefined) numberNode.options.minimum = Number(opts.minimum);
		if (opts.maximum !== undefined) numberNode.options.maximum = Number(opts.maximum);
		if (opts.multipleOf !== undefined) numberNode.options.multipleOf = Number(opts.multipleOf);
		numberNode.options.widget = inferWidgetFromUiSchema(
			uiSchema,
			NodeType.Number,
			'numberWidget'
		) as never;
		return numberNode;
	}

	// type: 'boolean'
	if (schema.type === 'boolean') {
		const booleanNode = createNode(NodeType.Boolean);
		applyCommonOptions(booleanNode, schema, uiSchema, titleFallback);
		if (opts.default !== undefined) booleanNode.options.default = Boolean(opts.default);
		booleanNode.options.widget = inferWidgetFromUiSchema(
			uiSchema,
			NodeType.Boolean,
			'checkboxWidget'
		) as never;
		return booleanNode;
	}

	// type: 'object' (nested)
	if (schema.type === 'object') {
		return parseObject(schema, uiSchema, ctx, titleFallback);
	}

	// Fallback: string
	const stringNode = createNode(NodeType.String);
	applyCommonOptions(stringNode, schema, uiSchema, titleFallback);
	stringNode.options.title = ((opts.title as string) ?? titleFallback) || 'Field';
	return stringNode;
}
