<script lang="ts">
	import { setShadcnThemeContext } from '$lib/sjsf/theme.shadcn.js';
    import Form from './form.svelte';
    import { AttestaConfigSchema } from './schema.js';

    setShadcnThemeContext();
</script>

<Form schema={AttestaConfigSchema} />