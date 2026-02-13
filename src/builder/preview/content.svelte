<script lang="ts">
	import { isRecordEmpty } from '@sjsf/form/lib/object';

	import Code, { type CodeFile } from '$lib/components/code.svelte';

	import DeviconPlainHtml from '~icons/devicon-plain/html5';
	import MdiCodeJson from '~icons/mdi/code-json';

	import { getBuilderContext } from '../context.svelte.js';
	import { buildFormataFormHtml } from '../code-builders.js';
	import { PreviewSubRouteName, type PreviewRoute } from '../model.js';
	import Form from './form.svelte';

	const { route }: { route: PreviewRoute } = $props();

	const ctx = getBuilderContext();

	const ROUTE_FILES: Record<PreviewSubRouteName, () => CodeFile[]> = {
		[PreviewSubRouteName.Code]: () => [
			{
				Icon: DeviconPlainHtml,
				title: 'index.html',
				get content() {
					return ctx.formataFormHtml;
				},
				get copyText() {
					return buildFormataFormHtml({ schema: ctx.schema, uiSchema: ctx.uiSchema });
				}
			}
		],
		[PreviewSubRouteName.Schema]: () => {
			const files = [
				{
					Icon: MdiCodeJson,
					title: 'schema.json',
					get content() {
						return ctx.highlight('json', JSON.stringify(ctx.schema, null, '\t'));
					},
					get copyText() {
						return JSON.stringify(ctx.schema, null, '\t');
					}
				}
			];
			if (ctx.uiSchema && !isRecordEmpty(ctx.uiSchema)) {
				files.push({
					Icon: MdiCodeJson,
					title: 'ui-schema.json',
					get content() {
						return ctx.highlight('json', JSON.stringify(ctx.uiSchema ?? {}, null, '\t'));
					},
					get copyText() {
						return JSON.stringify(ctx.uiSchema ?? {}, null, '\t');
					}
				});
			}
			return files;
		}
	};
</script>

{#if route.subRoute === undefined}
	<Form />
{:else}
	<Code files={ROUTE_FILES[route.subRoute]()} />
{/if}
