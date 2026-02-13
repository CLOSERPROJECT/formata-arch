import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import Icons from 'unplugin-icons/vite';

export default defineConfig({
	base: '/formata-arch/',
	build: {
		outDir: 'docs'
	},
	plugins: [tailwindcss(), svelte(), Icons({ compiler: 'svelte' })],
	resolve: {
		alias: {
			$lib: resolve('./src/lib'),
			$apps: fileURLToPath(new URL('..', import.meta.url))
		}
	},
	optimizeDeps: {
		exclude: ['@jis3r/icons'],
		include: ['@svar-ui/svelte-core', 'svelte-sonner']
	}
});