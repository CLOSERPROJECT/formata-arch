<script lang="ts">
	import type { Icon } from '$lib/types.js';

	import {
		BuildingIcon,
		DownloadIcon,
		IdCardIcon,
		UploadIcon,
		UserIcon,
		WaypointsIcon
	} from '@lucide/svelte';
	import { Config } from '$core';
	import { config } from '$core/state.svelte.js';
	import ThemeButton from '$lib/components/theme-button.svelte';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import { toast } from 'svelte-sonner';

	import { isActive, p } from './_index.js';

	//

	type NavLink = { label: string; href: ReturnType<typeof p>; icon: Icon };

	const main: NavLink[] = [
		{ label: 'Stream / Workflow', href: p('/'), icon: WaypointsIcon },
		{ label: 'DPP', href: p('/dpp'), icon: IdCardIcon }
	];

	const users: NavLink[] = [
		{ label: 'Departments', href: p('/departments'), icon: BuildingIcon },
		{ label: 'Users', href: p('/users'), icon: UserIcon }
	];

	let importInput: HTMLInputElement | undefined = $state();

	function onImportChange(e: Event) {
		const input = e.target as HTMLInputElement;
		const file = input.files?.[0];
		input.value = '';
		if (!file) return;
		const reader = new FileReader();
		reader.onload = () => {
			const text = reader.result as string;
			const result = Config.deserialize(text);
			if (result.isErr) {
				toast.error(result.error.message);
				return;
			}
			const data = result.value;
			config.workflow = data.workflow;
			config.departments = data.departments;
			config.users = data.users;
			config.dpp = data.dpp;
			toast.success('Config imported');
		};
		reader.readAsText(file, 'utf-8');
	}

	function triggerImport() {
		importInput?.click();
	}
</script>

<input
	type="file"
	accept=".yaml,.yml,application/x-yaml,text/yaml"
	class="hidden"
	bind:this={importInput}
	onchange={onImportChange}
	aria-hidden="true"
	tabindex="-1"
/>

<Sidebar.Root>
	<Sidebar.Header class="h-[53px] justify-center border-b px-4">
		<p class="font-semibold tracking-tight text-primary">Attesta Composer</p>
	</Sidebar.Header>
	<Sidebar.Content>
		{@render group(main, 'Main')}
		{@render group(users, 'Access control')}
		<Sidebar.Group>
			<Sidebar.GroupLabel>Data</Sidebar.GroupLabel>
			<Sidebar.Menu>
				{@render sidebarLinkButton({ label: 'Export', href: p('/export'), icon: DownloadIcon })}
				<Sidebar.MenuItem>
					<Sidebar.MenuButton onclick={triggerImport}>
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
