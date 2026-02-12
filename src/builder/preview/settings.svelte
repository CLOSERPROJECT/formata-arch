<script lang="ts">
	import ExternalLink from '@lucide/svelte/icons/external-link';

	import { Button } from '$lib/components/ui/button/index.js';
	import { CopyButton } from '$lib/components/copy-button/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import { Checkbox } from '$lib/components/ui/checkbox/index.js';
	import { encodeJson } from '$lib/url.js';

	import { RouteName } from '../model.js';
	import { getBuilderContext } from '../context.svelte.js';
	import Container from '../container.svelte';

	const ctx = getBuilderContext();

	const uniqueId = $props.id();
</script>

<Container class="mb-4 flex flex-col gap-4 p-3">
	<div class="text-md py-2 font-medium">Form options</div>
	<div class="flex items-center gap-2">
		<Checkbox id="{uniqueId}-html5v" bind:checked={ctx.html5Validation} />
		<Label class="text-base" for="{uniqueId}-html5v">HTML5 validation</Label>
	</div>
	<Button
		onclick={() => {
			ctx.route = { name: RouteName.Editor };
		}}
	>
		Edit
	</Button>
	<div class="flex flex-col gap-2">
		<Button
			variant="ghost"
			class="flex items-center gap-2"
			onclick={() => {
				const url = `https://x0k.github.io/svelte-jsonschema-form/playground3#${encodeJson(ctx.createPlaygroundSample())}`;
				window.open(url);
			}}
			>Playground <div><ExternalLink tabindex={-1} /></div></Button
		>
		<CopyButton
			text={() => {
				const url = new URL(window.location.href);
				url.search = '';
				url.hash = encodeJson(ctx.exportState());
				return url.toString();
			}}>Share</CopyButton
		>
	</div>
</Container>
