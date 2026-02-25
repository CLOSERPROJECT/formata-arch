<script lang="ts">
	import { Toaster } from '$lib/components/ui/sonner/index.js';
	import { setShadcnThemeContext } from '$lib/sjsf/theme.shadcn.js';
	import { Router } from 'sv-router';

	import './routes/_index.js';
	import { themeManager } from './theme.svelte.js';

	setShadcnThemeContext();
</script>

<Router base="#" />

<Toaster richColors theme={themeManager.theme} />
