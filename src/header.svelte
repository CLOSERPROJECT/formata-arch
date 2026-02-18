<script lang="ts">
	import OpenBook from '@lucide/svelte/icons/book-open';
	import { Moon, Sun, Hammer } from '@lucide/svelte';
	import { preventPageReload } from '@sjsf/form/prevent-page-reload.svelte';

	import Github from '$lib/components/github.svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import { CopyButton } from '$lib/components/copy-button/index.js';
	import { encodeJson } from '$lib/url.js';

	import type { ProjectsContext } from './projects/context.svelte.js';
	import type { BuilderContext } from './builder/context.svelte.js';
	import { PreviewSubRouteName, RouteName } from './builder/model.js';
	import ProjectsControls from './projects/project-controls.svelte';
	import ProjectsDialog from './projects/projects-dialog.svelte';
	import ConfirmationDialog from './projects/confirmation-dialog.svelte';
	import GenericProjectDialog from './projects/generic-project-dialog.svelte';
	import { themeManager } from './theme.svelte.js';

	const { ctx, builder }: { ctx: ProjectsContext; builder: BuilderContext } = $props();

	preventPageReload({
		get isChanged() {
			return ctx.isSaveRequired;
		}
	});

	const clearLink = new URL(location.href);
	clearLink.search = '';
	clearLink.hash = '';

	const hash = location.hash.substring(1);
	ctx.init(hash);
</script>

<div class="mx-auto flex items-center gap-2 px-8 py-3">
	<a href={clearLink.toString()} class="text-xl font-bold">Form Builder</a>
	<ProjectsDialog class="mr-auto" {ctx} />
	<div class="flex items-center gap-2">
		<Button
			variant="default"
			disabled={builder.rootNode === undefined}
			onclick={() => {
				if (builder.validate()) {
					builder.build();
					builder.route = { name: RouteName.Preview, subRoute: PreviewSubRouteName.Code };
				}
			}}
		>
			<Hammer class="size-4" />
			Build
		</Button>

		<ProjectsControls {ctx} />

		<CopyButton
			variant="outline"
			text={() => {
				const url = new URL(window.location.href);
				url.search = '';
				url.hash = encodeJson(builder.exportState());
				return url.toString();
			}}
		>
			Share
		</CopyButton>
	</div>
	<!-- <Button variant="ghost" size="icon" href="https://x0k.github.io/svelte-jsonschema-form/">
		<OpenBook class="size-6" />
	</Button>
	<Button
		target="_blank"
		href="https://github.com/x0k/svelte-jsonschema-form/"
		variant="ghost"
		size="icon"
	>
		<Github class="size-6" />
	</Button> -->
	<Button
		variant="ghost"
		size="icon"
		onclick={() => {
			themeManager.isDark = !themeManager.isDark;
		}}
	>
		{#if themeManager.isDark}
			<Moon class="size-6" />
		{:else}
			<Sun class="size-6" />
		{/if}
	</Button>
</div>
<ConfirmationDialog {...ctx.confirmationDialogOptions} bind:open={ctx.confirmationDialogOpen} />
<GenericProjectDialog
	{...ctx.genericProjectDialogOptions}
	bind:open={ctx.genericProjectDialogOpen}
/>
