import { createContext, flushSync, onDestroy, untrack } from 'svelte';
import { isSchemaValueDeepEqual } from '@sjsf/form/core';
import type { FormValue, Schema, SchemaValue, UiSchema } from '@sjsf/form';
import { addFormComponents, createFormValidator } from '@sjsf/ajv8-validator';
import { DragDropManager, Draggable, Droppable } from '@dnd-kit/dom';
import type { HighlighterCore } from 'shiki/core';

import {
	createNode,
	NodeType,
	type Node,
	type CustomizableNode,
	type ObjectNode,
	NODE_OPTIONS_SCHEMAS,
	NODE_OPTIONS_UI_SCHEMAS,
	type NodeId,
	type OperatorNode,
	parseSchemaToRootNode,
	summarizeOperator,
	OK_STATUS,
	ERROR_STATUS,
	WARNING_STATUS,
	validateNode,
	type ValidatorRegistries,
	buildSchema,
	type SchemaBuilderRegistries,
	buildUiSchema,
	type Scope,
	type SchemaBuilderContext,
	createObjectProperty
} from '$lib/builder/index.js';
import { ActualTheme, mergeUiSchemas, type Theme, type WidgetType } from '$lib/sjsf/theme.js';
import { Validator } from '$lib/sjsf/validators.js';
import { Resolver } from '$lib/sjsf/resolver.js';
import { Icons } from '$lib/sjsf/icons.js';
import { highlight, type SupportedLanguage } from '$lib/shiki.js';
import { mergeSchemas } from '$lib/json-schema.js';
import { addBuilderFormats } from '$lib/ajv.js';

import {
	type Route,
	CHECKBOXES_WIDGET_OPTIONS,
	DEFAULT_COMPONENTS,
	DEFAULT_WIDGETS,
	RADIO_WIDGET_OPTIONS,
	RouteName,
	TEXT_WIDGET_OPTIONS,
	getUseLabel
} from './model.js';
import type { NodeContext } from './node-context.js';
import {
	THEME_CUSTOMIZABLE_NODE_TYPES,
	THEME_RANGE_VALUE_TYPES,
	THEME_SCHEMAS,
	THEME_UI_SCHEMAS
} from './theme-schemas.js';
import { buildFormataFormHtml } from './code-builders.js';

export const [getBuilderContext, setBuilderContext] = createContext<BuilderContext>();

type UniqueId = string | number;

export interface DndData {
	node: Node;
}

type Sample = {
	schema: Schema;
	uiSchema: UiSchema;
	initialValue: FormValue;
	html5Validation: boolean;
};

export interface DroppableOptions<N extends Node> {
	accept: (node: Node) => node is N;
	onDrop: (node: N) => void;
}

export interface DraggableOptions {
	node: Node;
	unmount: () => void;
}

export interface NodeRef {
	current: () => Node | undefined;
	update: (n: Node) => void;
}

export interface ReadonlyNodeRef {
	current: Node | undefined;
}

export interface NodeIssue {
	nodeId: NodeId;
	message: string;
}

export interface BuilderState1 {
	rootNode?: CustomizableNode;
	ignoreWarnings: boolean;
	html5Validation: boolean;
	route: Route;
}

export interface BuilderState2 extends BuilderState1 {
	livePreview: boolean;
}

export type BuilderState = BuilderState1 | BuilderState2;

type State = BuilderState2;

const noopNodeRef: NodeRef = {
	current() {
		return undefined;
	},
	update() {}
};
const noopReadonlyNodeRef: ReadonlyNodeRef = {
	current: undefined
};

const obj = createNode(NodeType.Object) as ObjectNode;
obj.options.title = 'Form title';
obj.properties.push(createObjectProperty(createNode(NodeType.String)));

export class BuilderContext {
	#dnd = new DragDropManager<DndData>();
	#validator = createFormValidator({
		ajvPlugins: (ajv) => addFormComponents(addBuilderFormats(ajv))
	});

	#sourceId = $state.raw<UniqueId>();
	#targetId = $state.raw<UniqueId>();

	#onDragStartHandlers = new Map<UniqueId, () => void>();
	#beforeDropHandlers = new Map<UniqueId, () => void>();
	#dropHandlers = new Map<UniqueId, (node: Node) => void>();
	#draggedNode = $state.raw<Node>();

	rootNode = $state<CustomizableNode | undefined>(obj);

	#selectedNodeRef = $state.raw(noopNodeRef);
	readonly selectedNode = $derived.by(() => {
		try {
			return this.#selectedNodeRef.current();
		} catch {
			return undefined;
		}
	});
	#showRequired = $state.raw(true);

	#affectedNodeRef = $state.raw(noopReadonlyNodeRef);
	readonly affectedNode = $derived.by(() => {
		try {
			return this.#affectedNodeRef.current;
		} catch {
			return undefined;
		}
	});

	get theme(): Theme {
		return ActualTheme.Shadcn4;
	}
	get resolver(): Resolver {
		return Resolver.Basic;
	}
	get icons(): Icons {
		return Icons.Lucide;
	}
	get validator(): Validator {
		return Validator.Ajv;
	}

	readonly availableCustomizableNodeTypes = $derived(THEME_CUSTOMIZABLE_NODE_TYPES[this.theme]);
	readonly availableRangeValueTypes = $derived(THEME_RANGE_VALUE_TYPES[this.theme]);

	get isDragged() {
		return this.#sourceId !== undefined;
	}

	selectNode(nodeRef: NodeRef, showRequired: boolean) {
		this.#selectedNodeRef = nodeRef;
		this.#showRequired = showRequired;
	}

	updateSelectedNode(node: CustomizableNode) {
		this.#selectedNodeRef.update(node);
	}

	selectAffectedNode(nodeRef: ReadonlyNodeRef) {
		this.#affectedNodeRef = nodeRef;
	}

	clearSelection() {
		this.#selectedNodeRef = noopNodeRef;
		this.#affectedNodeRef = noopReadonlyNodeRef;
	}

	ignoreWarnings = $state(false);
	livePreview = $state(true);
	html5Validation = $state(false);

	private _errorsCount = $state(0);
	get errorsCount() {
		return this._errorsCount;
	}
	private _errors = $state.raw<Partial<Record<NodeId, NodeIssue[]>>>({});
	get errors() {
		return this._errors;
	}

	private _warningsCount = $state(0);
	get warningsCount() {
		return this._warningsCount;
	}
	private _warnings = $state.raw<Partial<Record<NodeId, NodeIssue[]>>>({});
	get warnings() {
		return this._warnings;
	}

	private setIssues(key: 'errors' | 'warnings', issues: NodeIssue[]) {
		this[`_${key}Count`] = issues.length;
		this[`_${key}`] = Object.groupBy(issues, (i) => i.nodeId);
	}

	route = $state.raw<Route>({ name: RouteName.Editor });

	#buildOutput = $state.raw<
		| {
				schema: Schema;
				propertyNames: Map<NodeId, string>;
		  }
		| undefined
	>(undefined);

	readonly schema: Schema = $derived(this.#buildOutput?.schema ?? { type: 'object' });
	#uiSchemaOutput = $derived.by(() => {
		this.#buildOutput; // includes rootNode
		this.theme;
		this.resolver;
		return untrack(() => {
			const uiSchema =
				this.rootNode &&
				this.#buildOutput &&
				buildUiSchema(
					{
						propertyNames: this.#buildOutput.propertyNames,
						propertiesOrder: [],
						uiComponents: (node) => {
							const widget = node.options.widget as WidgetType;
							const components = Object.assign(
								{} satisfies UiSchema['ui:components'],
								DEFAULT_COMPONENTS[this.resolver][node.type](node as never)
							);
							const defaultWidget = DEFAULT_WIDGETS[node.type];
							if (node.options.widget !== defaultWidget) {
								//@ts-expect-error
								components[defaultWidget] = widget;
							}
							return components;
						},
						textWidgetOptions: (params) => {
							if (Object.values(params).every((v) => v === undefined)) {
								return {};
							}
							return TEXT_WIDGET_OPTIONS[this.theme](params);
						},
						checkboxesWidgetOptions: (inline) => {
							return CHECKBOXES_WIDGET_OPTIONS[this.theme](inline);
						},
						radioWidgetOptions: (inline) => {
							return RADIO_WIDGET_OPTIONS[this.theme](inline);
						},
						useLabelOptions: ({ type, options }) => {
							const widget = options.widget as WidgetType;
							const defaultWidget = DEFAULT_WIDGETS[type];
							if (defaultWidget !== widget) {
								const useLabel = getUseLabel(this.theme, widget);
								if (getUseLabel(this.theme, defaultWidget) !== useLabel) {
									return { useLabel };
								}
							}
							return {};
						}
					},
					this.rootNode
				);
			return { uiSchema };
		});
	});
	readonly uiSchema = $derived(this.#uiSchemaOutput.uiSchema);

	readonly formataFormHtml = $derived(
		this.highlight('html', buildFormataFormHtml({ schema: this.schema, uiSchema: this.uiSchema }))
	);

	constructor(private readonly highlighter: HighlighterCore) {
		onDestroy(() => {
			this.#dnd.destroy();
		});
		this.#dnd.monitor.addEventListener('beforedragstart', ({ operation: { source } }) => {
			if (source === null) {
				return;
			}
			const { id, data } = source;
			this.#sourceId = id;
			if (id !== undefined) {
				this.#onDragStartHandlers.get(id)?.();
				this.#draggedNode = data.node;
			}
		});
		this.#dnd.monitor.addEventListener('dragover', (event) => {
			this.#targetId = event.operation.target?.id;
		});
		this.#dnd.monitor.addEventListener('dragend', ({ operation: { target, source } }) => {
			this.#sourceId = undefined;
			this.#targetId = undefined;
			this.#draggedNode = undefined;
			const tId = target?.id;
			if (tId === undefined || source === null) {
				return;
			}
			const { id: sId, data } = source;
			this.#beforeDropHandlers.get(sId)?.();
			const handler = this.#dropHandlers.get(tId);
			flushSync(() => {
				handler?.(data.node);
			});
		});

		let cId: number;
		let lastSnap: SchemaValue | undefined;
		const queueTask = window.requestIdleCallback ?? setTimeout;
		//@ts-expect-error Safari
		const cancelTask = window.requestIdleCallback ? cancelIdleCallback : clearTimeout;
		$effect(() => {
			if (!this.livePreview) {
				return;
			}
			const snap = $state.snapshot({
				ignoreWarnings: this.ignoreWarnings,
				rootNode: this.rootNode
			});
			if (isSchemaValueDeepEqual(lastSnap, snap)) {
				return;
			}
			lastSnap = snap;
			cancelTask(cId);
			cId = queueTask(() => {
				if (this.validate()) {
					this.build();
				}
			});
		});
	}

	importState(data: State) {
		const { rootNode, ignoreWarnings, html5Validation, route, livePreview } = data;
		this.rootNode = rootNode;
		this.ignoreWarnings = ignoreWarnings;
		this.html5Validation = html5Validation;
		this.route = route;
		if ('livePreview' in data) {
			this.livePreview = data.livePreview;
		}
		if (this.route.name === RouteName.Preview) {
			this.build();
		}
	}

	loadFromSchema(schema: Schema, uiSchema?: UiSchema): void {
		const rootNode = parseSchemaToRootNode(schema, uiSchema);
		this.importState({
			rootNode,
			ignoreWarnings: this.ignoreWarnings,
			html5Validation: this.html5Validation,
			route: this.route,
			livePreview: this.livePreview
		});
	}

	exportState(): State {
		return $state.snapshot({
			rootNode: this.rootNode,
			livePreview: this.livePreview,
			ignoreWarnings: this.ignoreWarnings,
			route: this.route,
			html5Validation: this.html5Validation
		});
	}

	createPlaygroundSample(): Readonly<Sample> {
		return {
			schema: this.schema,
			uiSchema: this.uiSchema ?? {},
			initialValue: null,
			html5Validation: true
		};
	}

	createDroppable<N extends Node>(nodeCtx: NodeContext, options: DroppableOptions<N>) {
		const id = crypto.randomUUID();
		const droppable = new Droppable<DndData>(
			{
				id,
				accept(source) {
					return options.accept(source.data.node);
				}
			},
			this.#dnd
		);
		$effect(() => {
			droppable.disabled = nodeCtx.isDragged;
		});
		this.#dropHandlers.set(id, (node: Node) => {
			if (options.accept(node)) {
				options.onDrop(node);
			}
		});
		onDestroy(() => {
			this.#dropHandlers.delete(id);
			droppable.destroy();
		});
		const self = this;
		return {
			get isReady() {
				return self.#draggedNode === undefined || options.accept(self.#draggedNode);
			},
			get isOver() {
				return self.#targetId === id;
			},
			attach(element: HTMLElement) {
				droppable.element = element;
				return () => {
					droppable.element = undefined;
				};
			}
		};
	}

	createDraggable(options: DraggableOptions) {
		const id = crypto.randomUUID();
		let nodeSnapshot: Node;
		const draggable = new Draggable<DndData>(
			{
				data: {
					get node() {
						return nodeSnapshot;
					}
				},
				feedback: 'clone',
				id
			},
			this.#dnd
		);
		this.#onDragStartHandlers.set(id, () => {
			nodeSnapshot = $state.snapshot(options.node);
		});
		this.#beforeDropHandlers.set(id, options.unmount);
		onDestroy(() => {
			this.#onDragStartHandlers.delete(id);
			this.#beforeDropHandlers.delete(id);
			draggable.destroy();
		});
		const self = this;
		return {
			get isDragged() {
				return self.#sourceId === id;
			},
			attach(element: HTMLElement) {
				draggable.element = element;
				return () => {
					draggable.element = undefined;
				};
			},
			attachHandle(element: HTMLElement) {
				draggable.handle = element;
				return () => {
					draggable.handle = undefined;
				};
			}
		};
	}

	nodeSchema(node: CustomizableNode) {
		const original = NODE_OPTIONS_SCHEMAS[node.type];
		const augmentation = THEME_SCHEMAS[this.theme][node.type]?.(node as never);
		return augmentation ? mergeSchemas(original, augmentation) : original;
	}

	nodeUiSchema(node: CustomizableNode) {
		const next = mergeUiSchemas(NODE_OPTIONS_UI_SCHEMAS[node.type], {
			required: {
				'ui:options': {
					layouts: {
						'object-property': {
							hidden: !this.#showRequired
						}
					}
				}
			}
		});
		const augmentation = THEME_UI_SCHEMAS[this.theme][node.type]?.(node as never);
		return augmentation ? mergeUiSchemas(next, augmentation as UiSchema) : next;
	}

	summarizeOperator(operator: OperatorNode, node: Node | undefined) {
		return summarizeOperator(
			{
				operatorStatus: (operator) =>
					(this._errors[operator.id] === undefined ? OK_STATUS : ERROR_STATUS) |
					(this._warnings[operator.id] === undefined ? OK_STATUS : WARNING_STATUS)
			},
			operator,
			node
		);
	}

	validate() {
		if (this.rootNode === undefined) {
			return false;
		}
		const registries: {
			[K in keyof ValidatorRegistries]: Array<ValidatorRegistries[K]>;
		} = {
			complementary: [],
			affectedNode: [],
			enumValueType: []
		};
		const errors: NodeIssue[] = [];
		const warnings: NodeIssue[] = [];
		const self = this;
		validateNode(
			{
				validateCustomizableNodeOptions(node) {
					const schema = self.nodeSchema(node);
					const result = self.#validator.validateFormValue(schema, node.options as FormValue);
					if (result.errors) {
						errors.push({ nodeId: node.id, message: 'Invalid field options' });
						console.error(result.errors);
					}
				},
				getAvailableRangeValueTypes() {
					return self.availableRangeValueTypes;
				},
				addError(node, message) {
					//@ts-expect-error
					errors.push({ nodeId: node.id, message, node });
				},
				addWarning(node, message) {
					warnings.push({ nodeId: node.id, message });
				},
				push(registry, value) {
					registries[registry].push(value);
					return {
						[Symbol.dispose]: () => {
							registries[registry].pop();
						}
					};
				},
				peek(registry) {
					return registries[registry].at(-1);
				}
			},
			this.rootNode
		);
		this.setIssues('errors', errors);
		this.setIssues('warnings', warnings);
		return errors.length === 0 && (this.ignoreWarnings || warnings.length === 0);
	}

	build() {
		if (this.rootNode === undefined) {
			throw new Error('Root node is undefined');
		}
		const registries: {
			[K in keyof SchemaBuilderRegistries]: Array<SchemaBuilderRegistries[K]>;
		} = {
			scope: [],
			affectedNode: []
		};
		const propertyNames = new Map<NodeId, string>();
		const ctx: SchemaBuilderContext = {
			propertyNames,
			createAndPushScope() {
				const counter = new Map<string, number>();
				const scope: Scope = {
					id({ id, options: { title: str } }) {
						let count = counter.get(str) ?? 0;
						const v = count === 0 ? str : `${str}_${count}`;
						counter.set(str, count + 1);
						propertyNames.set(id, v);
						return v;
					}
				};
				return Object.assign(scope, ctx.push('scope', scope));
			},
			push(registry, value) {
				registries[registry].push(value);
				return {
					[Symbol.dispose]() {
						registries[registry].pop();
					}
				};
			},
			peek(registry) {
				return registries[registry].at(-1);
			}
		};
		const schema = buildSchema(ctx, this.rootNode);
		this.#buildOutput = {
			propertyNames,
			schema
		};
	}

	highlight(lang: SupportedLanguage, str: string) {
		return highlight(this.highlighter, lang, str);
	}
}

export type BuilderDraggable = ReturnType<BuilderContext['createDraggable']>;
export type BuilderDroppable = ReturnType<BuilderContext['createDroppable']>;
