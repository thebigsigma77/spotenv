import { defineConfig } from 'tsup';

export default defineConfig({
	entry: ['src/*'],
	format: ['esm'], // Keep ESM format
	outDir: 'dist',
	clean: true,
	sourcemap: false,
	splitting: false,
	bundle: true,
	dts: false,
	minify: true,
	external: [
		'fs/promises',
		'path',
		'commander',
		'@babel/parser',
		'@babel/types',
		'@babel/traverse',
	],
	loader: {
		'.json': 'json', // ⬅ transforms JSON into normal ESM object
	},
	banner: {
		js: '#!/usr/bin/env node',
	},
	outExtension: () => ({ js: '.js' }), // Force .js instead of .mjs
});
