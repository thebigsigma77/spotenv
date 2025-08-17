import { join } from 'node:path';

export const DEFAULT_IGNORE = [
	'**/node_modules/**',
	'**/dist/**',
	'**/build/**',
	'**/.next/**',
	'**/.turbo/**',
	'**/.vercel/**',
	'**/out/**',
];

export const DEFAULT_TARGET_ENV_EXAMPLE_FILE = join(
	process.cwd(),
	'.env.example',
);
