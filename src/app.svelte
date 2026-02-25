<script lang="ts">
	import { Toaster } from '$lib/components/ui/sonner/index.js';
	import { setShadcnThemeContext } from '$lib/sjsf/theme.shadcn.js';
	import { ModeWatcher } from 'mode-watcher';
	import { Router } from 'sv-router';

	import './routes/_index.js';
	import { themeManager } from './theme.svelte.js';

	setShadcnThemeContext();
</script>

<ModeWatcher />

<Router base="#" />

<Toaster richColors theme={themeManager.theme} />
