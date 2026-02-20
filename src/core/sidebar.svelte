<script lang="ts">
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import { entities } from '$core/repositories/utils.js';
	import { state } from '$core/state.svelte.js';
</script>

<Sidebar.Root>
	<Sidebar.Header />
	<Sidebar.Content>
		<Sidebar.Group>
			<Sidebar.Menu>
				{#each entities as entity}
					<Sidebar.MenuItem>
						<Sidebar.MenuButton
							isActive={state.currentCollection === entity}
							onclick={() => (state.currentCollection = entity)}
						>
							{entity}
						</Sidebar.MenuButton>
					</Sidebar.MenuItem>
				{/each}
			</Sidebar.Menu>
		</Sidebar.Group>
	</Sidebar.Content>
	<Sidebar.Footer />
</Sidebar.Root>
