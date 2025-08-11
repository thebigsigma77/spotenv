import type { PathLike } from 'node:fs';
import type { FileHandle } from 'node:fs/promises';
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import type { ParseResult } from '@babel/parser';
import { parse } from '@babel/parser';
import * as t from '@babel/types';

export function parseFileToAst(sourceCode: string): ParseResult {
	return parse(sourceCode, {
		sourceType: 'unambiguous',
		plugins: [
			'typescript',
			'jsx',
			'classProperties',
			'optionalChaining',
			'nullishCoalescingOperator',
			'dynamicImport',
			'decorators-legacy',
		],
	});
}

export function looksSensitive(key: string) {
	return /secret|token|key|pwd|password|private/i.test(key);
}

export function tryExtractDefaultFromParent(path: any): string | null {
	// look for patterns: process.env.FOO || 'bar'  or process.env.FOO ?? 'bar'
	const parent = path.parentPath?.node;
	if (!parent) return null;

	if (
		t.isLogicalExpression(parent) &&
		(parent.operator === '||' || parent.operator === '??')
	) {
		const right = parent.right;
		if (
			t.isStringLiteral(right) ||
			t.isNumericLiteral(right) ||
			t.isBooleanLiteral(right)
		) {
			return String((right as any).value);
		}
	}

	// conditional expression like process.env.FOO ? process.env.FOO : 'bar'
	if (t.isConditionalExpression(parent)) {
		const consequent = parent.consequent;
		const alternate = parent.alternate;
		if (t.isStringLiteral(alternate) || t.isNumericLiteral(alternate)) {
			return String((alternate as any).value);
		}
	}

	return null;
}

export async function outputFile(file: PathLike | FileHandle, data: string) {
	await mkdir(dirname(String(file)), { recursive: true });
	await writeFile(file, data, { encoding: 'utf-8' });
}
