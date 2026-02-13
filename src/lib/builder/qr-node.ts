import type { FromSchema } from 'json-schema-to-ts';
import type { Schema } from '@sjsf/form';

import type { AbstractCustomizableNode, NodeType } from './node-base.js';

export const QR_NODE_OPTIONS_SCHEMA = {
	type: 'object',
	title: 'QR code options',
	properties: {
		widget: {
			title: 'Widget',
			type: 'string',
			default: 'textWidget'
		},
		placeholder: {
			title: 'Placeholder',
			type: 'string'
		},
		help: {
			title: 'Help',
			type: 'string'
		},
		default: {
			title: 'Default value',
			type: 'string'
		}
	},
	required: ['widget']
} as const satisfies Schema;

export type QrNodeOptions = FromSchema<typeof QR_NODE_OPTIONS_SCHEMA>;

export interface QrNode extends AbstractCustomizableNode<NodeType.QrCode, QrNodeOptions> {}
