import { readFile } from 'node:fs/promises';
import { relative } from 'node:path';
import fg from 'fast-glob';
import { DEFAULT_IGNORE } from './constants';
import { type EnvKeyMap, extractFromCode } from './extract';

function looksLikeCandidate(content: string): boolean {
	return (
		content.includes('process.env') ||
		content.includes('import.meta.env') ||
		/\bprocess\s*\.\s*env\s*\[/.test(content) ||
		/\bconst\s+{\s*\w+\s*}\s*=\s*process\.env/.test(content)
	);
}

export async function scanProject(
	directoryToScan: string,
	ignorePatterns: string[] = DEFAULT_IGNORE,
): Promise<EnvKeyMap> {
	const map: EnvKeyMap = new Map();
	const patterns = ['**/*.{js,ts,jsx,tsx,mjs,cjs}'];
	const foundedFiles = await fg(patterns, {
		cwd: directoryToScan,
		absolute: true,
		ignore: ignorePatterns,
		followSymbolicLinks: true,
		dot: true,
	});

	for (const file of foundedFiles) {
		let content: string | undefined;
		if (file.endsWith('.d.ts')) continue;
		try {
			content = await readFile(file, 'utf-8');
		} catch (error) {
			console.error(`Error reading file ${file}:`, error);
			continue;
		}
		if (!looksLikeCandidate(content)) continue;
		extractFromCode(content, relative(directoryToScan, file), map);
	}

	return map;
}
