#!/usr/bin/env node

import { resolve } from 'node:path';
import chalk from 'chalk';
import ora from 'ora';
import { DEFAULT_IGNORE } from './utils/constants';
import { initialProgram } from './utils/program';
import { renderEnvExample, writeEnvExample } from './utils/render';
import { scanProject } from './utils/scan';

async function main() {
	const program = initialProgram();

	const options = program.opts();
	const directoryToScan = resolve(options.dir);
	const targetEnvExampleFile = resolve(options.out);
	const watchMode = options.watch;
	const ignorePatterns = Array.isArray(options.ignore)
		? options.ignore
		: DEFAULT_IGNORE;

	const spinner = ora('Scanning project for env usage...').start();

	async function runScanAndWrite() {
		spinner.text = 'Scanning project for env usage...';
		try {
			const envMap = await scanProject(directoryToScan, ignorePatterns);
			spinner.succeed(
				`Found ${
					Array.from(envMap.keys()).filter(
						(k) => k !== '<DYNAMIC_KEY>',
					).length
				} env keys`,
			);
			const content = renderEnvExample(envMap);
			await writeEnvExample(targetEnvExampleFile, content);
			console.log(
				chalk.green(
					`.env.example written to ${resolve(targetEnvExampleFile)}`,
				),
			);
		} catch (error) {
			spinner.fail('Scan failed');
			console.error(error);
		}
	}

	await runScanAndWrite();
}

main();
