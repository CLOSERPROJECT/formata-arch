<script lang="ts">
	import { Toaster } from '$lib/components/ui/sonner/index.js';
	import { setShadcnThemeContext } from '$lib/sjsf/theme.shadcn.js';
	import { themeManager } from './theme.svelte.js';
	import { Router } from 'sv-router';
	import './routes/_index.js';

	setShadcnThemeContext();
</script>

<Router base="formata-arch" />

<Toaster richColors theme={themeManager.theme} />
