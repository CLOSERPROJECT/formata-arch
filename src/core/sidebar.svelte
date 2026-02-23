<script lang="ts">
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';

	import { isActive, p } from '../routes/_index.js';

	const links: Array<{ label: string; href: ReturnType<typeof p> }> = [
		{ label: 'Home', href: p('/') },
		{ label: 'Departments', href: p('/departments') },
		{ label: 'Users', href: p('/users') },
		{ label: 'DPP', href: p('/dpp') },
		{ label: 'Steps', href: p('/steps') },
		{ label: 'Workflow', href: p('/workflow') }
	];
</script>

<Sidebar.Root>
	<Sidebar.Header />
	<Sidebar.Content>
		<Sidebar.Group>
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
									{link.label}
								</a>
							{/snippet}
						</Sidebar.MenuButton>
					</Sidebar.MenuItem>
				{/each}
			</Sidebar.Menu>
		</Sidebar.Group>
	</Sidebar.Content>
	<Sidebar.Footer />
</Sidebar.Root>
