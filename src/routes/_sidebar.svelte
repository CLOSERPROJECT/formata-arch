<script lang="ts">
	import type { Icon } from '$lib/types.js';

	import { BuildingIcon, IdCardIcon, UserIcon, WaypointsIcon } from '@lucide/svelte';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';

	import { isActive, p } from './_index.js';

	//

	type NavLink = { label: string; href: ReturnType<typeof p>; icon: Icon };

	const main: NavLink[] = [
		{ label: 'Workflow', href: p('/workflow'), icon: WaypointsIcon },
		{ label: 'DPP', href: p('/dpp'), icon: IdCardIcon }
	];

	const users: NavLink[] = [
		{ label: 'Departments', href: p('/departments'), icon: BuildingIcon },
		{ label: 'Users', href: p('/users'), icon: UserIcon }
	];
</script>

<Sidebar.Root>
	<Sidebar.Header class="h-[53px] justify-center border-b px-4">
		<p class="font-semibold tracking-tight">Attesta Composer</p>
	</Sidebar.Header>
	<Sidebar.Content>
		{@render group(main, 'Main')}
		{@render group(users, 'Access control')}
	</Sidebar.Content>
	<Sidebar.Footer />
</Sidebar.Root>

{#snippet group(links: NavLink[], title?: string)}
	<Sidebar.Group>
		{#if title}
			<Sidebar.GroupLabel>{title}</Sidebar.GroupLabel>
		{/if}
		<Sidebar.Menu>
			{#each links as link, index (index)}
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
			{/each}
		</Sidebar.Menu>
	</Sidebar.Group>
{/snippet}
