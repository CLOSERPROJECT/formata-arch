<script lang="ts">
	import { setShadcnThemeContext } from '$lib/sjsf/theme.shadcn.js';
    import Form from './form.svelte';
    import { AttestaConfigSchema } from './schema.js';
    import { Toaster } from "$lib/components/ui/sonner/index.js";
    import * as Sidebar from "$lib/components/ui/sidebar/index.js";
    import AppSidebar from './sidebar.svelte';
    import Crud from './crud.svelte';

    setShadcnThemeContext();
</script>

<Sidebar.Provider>
    <AppSidebar />
    <main>
      <Sidebar.Trigger />
      <Crud />
    </main>
  </Sidebar.Provider>
<Form schema={AttestaConfigSchema} />

<Toaster />