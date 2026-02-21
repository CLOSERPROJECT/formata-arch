<script lang="ts">
	import { setShadcnThemeContext } from '$lib/sjsf/theme.shadcn.js';
	import Form from './form.svelte';
	import { AttestaConfigSchema } from './schema.js';
	import { Toaster } from '$lib/components/ui/sonner/index.js';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import AppSidebar from './sidebar.svelte';
	import Crud from './crud.svelte';
	import { getRepository } from './repositories/index.js';
	import { getCurrentRepository } from './state.svelte.js';
	import { themeManager } from '../theme.svelte.js';

	setShadcnThemeContext();

	const repository = $derived(getCurrentRepository());
</script>

<Sidebar.Provider>
	<AppSidebar />
	<main>
		<Sidebar.Trigger />
		<Crud {repository} />
	</main>
</Sidebar.Provider>
<Form schema={AttestaConfigSchema} />

<Toaster richColors theme={themeManager.theme} />
