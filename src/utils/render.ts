import { writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import type { EnvKeyMap } from './extract';
import { looksSensitive, outputFile } from './helpers';

export function renderEnvExample(map: EnvKeyMap) {
	const lines: string[] = [];
	lines.push('# .env.example (generated)');
	lines.push(
		'# Add real values to .env — do NOT commit secrets to source control.',
	);
	lines.push('');
	const keys = Array.from(map.values()).filter(
		(k) => k.key !== '<DYNAMIC_KEY>',
	);
	keys.sort((a, b) => a.key.localeCompare(b.key));

	for (const meta of keys) {
		const comments: string[] = [];
		const filesArr = Array.from(meta.files).slice(0, 3);
		comments.push(
			`# used in: ${filesArr.join(', ')}${
				meta.files.size > 3 ? ', ...' : ''
			}`,
		);
		if (meta.hasDefault) {
			if (looksSensitive(meta.key)) {
				comments.push(`# has default (sensitive value hidden)`);
			} else if (meta.defaultExample != null) {
				comments.push(`# default: ${meta.defaultExample}`);
			} else {
				comments.push(`# has default`);
			}
		}
		for (const c of comments) lines.push(c);
		lines.push(`${meta.key}=`);
		lines.push('');
	}

	if (map.has('<DYNAMIC_KEY>')) {
		lines.push(
			'# NOTE: dynamic keys detected (e.g. process.env[someVar]).',
		);
		lines.push(
			'# Please review code and add any dynamic env keys manually.',
		);
		lines.push('');
	}

	return lines.join('\n');
}

export async function writeEnvExample(outPath: string, content: string) {
	outputFile(resolve(outPath), content);
}
