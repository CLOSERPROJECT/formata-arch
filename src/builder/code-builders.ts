import type { Schema, UiSchema } from '@sjsf/form';
import { isRecordEmpty } from '@sjsf/form/lib/object';

export interface FormataFormHtmlOptions {
	schema: Schema;
	uiSchema: UiSchema | undefined;
}

/** Escape for HTML attribute value (single-quoted) */
function escapeAttr(str: string): string {
	return str.replace(/'/g, '&#39;').replace(/&/g, '&amp;');
}

/** Indent each line of a multi-line string with a prefix (for nested attribute values). */
function indentAttributeValue(str: string, prefix = '\t'): string {
	return str.split('\n').map((line) => prefix + line).join('\n');
}

export function buildFormataFormHtml({ schema, uiSchema = {} }: FormataFormHtmlOptions): string {
	const schemaJson = JSON.stringify(schema, null, '\t');
	const schemaStr = escapeAttr(indentAttributeValue(schemaJson));
	const u = uiSchema ?? {};
	const uiSchemaPart =
		u && !isRecordEmpty(u)
			? `\n\tui-schema='\n${escapeAttr(indentAttributeValue(JSON.stringify(u, null, '\t')))}'`
			: '';
	return `<formata-form\n\tschema='\n${schemaStr}'${uiSchemaPart}\n></formata-form>`;
}
