import { svelte } from '@sveltejs/vite-plugin-svelte';
import tailwindcss from '@tailwindcss/vite';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import Icons from 'unplugin-icons/vite';
import { defineConfig } from 'vite';
import 'vitest/config';

//

export default defineConfig({
	base: '/formata-arch/',
	build: {
		outDir: 'docs'
	},
	plugins: [tailwindcss(), svelte(), Icons({ compiler: 'svelte' })],
	resolve: {
		alias: {
			$lib: resolve('./src/lib'),
			$apps: fileURLToPath(new URL('..', import.meta.url)),
			$core: resolve('./src/core'),
			$builder: resolve('./src/builder')
		}
	},
	optimizeDeps: {
		exclude: ['@jis3r/icons'],
		include: ['@svar-ui/svelte-core', 'svelte-sonner']
	},
	test: {
		include: ['src/**/*.test.ts'],
		environment: 'node'
	}
});
