<script lang="ts">
	import type { Icon } from '$lib/types.js';

	import { HouseIcon, IdCardIcon, SaveIcon, UploadIcon, WaypointsIcon } from '@lucide/svelte';
	import ThemeButton from '$lib/components/theme-button.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';

	import ImportStreamDialog from './import-stream-dialog.svelte';
	import { isActive, p } from './_index.js';

	//

	type NavLink = { label: string; href: ReturnType<typeof p>; icon: Icon };

	const main: NavLink[] = [
		{ label: 'Stream / Workflow', href: p('/'), icon: WaypointsIcon },
		{ label: 'DPP', href: p('/dpp'), icon: IdCardIcon }
	];

	//

	let importOpen = $state(false);
</script>

<ImportStreamDialog bind:open={importOpen} />

<Sidebar.Root>
	<Sidebar.Header class="flex h-[53px] flex-row items-center justify-between border-b px-4">
		<p class="font-semibold tracking-tight text-primary">Attesta Composer</p>
		<Button
			onclick={() => (window.location.href = `${window.origin}/my`)}
			size="icon-sm"
			variant="ghost"
			class="hover:bg-sidebar-accent"
		>
			<HouseIcon />
		</Button>
	</Sidebar.Header>
	<Sidebar.Content>
		{@render group(main, 'Main')}
		<Sidebar.Group>
			<Sidebar.GroupLabel>Data</Sidebar.GroupLabel>
			<Sidebar.Menu>
				{@render sidebarLinkButton({ label: 'Save', href: p('/save'), icon: SaveIcon })}
				<Sidebar.MenuItem>
					<Sidebar.MenuButton onclick={() => (importOpen = true)}>
						<UploadIcon />
						Import
					</Sidebar.MenuButton>
				</Sidebar.MenuItem>
			</Sidebar.Menu>
		</Sidebar.Group>
	</Sidebar.Content>
	<Sidebar.Footer>
		<ThemeButton />
	</Sidebar.Footer>
</Sidebar.Root>

{#snippet group(links: NavLink[], title?: string)}
	<Sidebar.Group>
		{#if title}
			<Sidebar.GroupLabel>{title}</Sidebar.GroupLabel>
		{/if}
		<Sidebar.Menu>
			{#each links as link, index (index)}
				{@render sidebarLinkButton(link)}
			{/each}
		</Sidebar.Menu>
	</Sidebar.Group>
{/snippet}

{#snippet sidebarLinkButton(link: NavLink)}
	<Sidebar.MenuItem>
		<Sidebar.MenuButton>
			{#snippet child({ props })}
				<a
					href={link.href}
					{...props}
					class={[
						props.class,
						isActive(link.href as '/') && 'bg-sidebar-accent text-sidebar-accent-foreground'
					]}
				>
					<link.icon />
					{link.label}
				</a>
			{/snippet}
		</Sidebar.MenuButton>
	</Sidebar.MenuItem>
{/snippet}
