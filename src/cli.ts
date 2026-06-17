#!/usr/bin/env node
import Fs from 'node:fs';
import Path from 'node:path';
import { Command } from 'commander';
import Chalk from 'chalk';
import { InstallCommand } from './commands/install_command.js';

/** Read this package's version from its package.json, regardless of install layout. */
function readVersion(): string {
	const packageJsonPath = Path.join(import.meta.dirname, '..', 'package.json');
	const packageJson = JSON.parse(Fs.readFileSync(packageJsonPath, 'utf-8')) as { version?: string };
	return typeof packageJson.version === 'string' ? packageJson.version : '0.0.0';
}

async function main(): Promise<void> {
	const program = new Command();
	program
		.name('issue_autofix')
		.description('Install the issue_autofix slash commands into a Claude Code agent folder')
		.version(readVersion());

	program
		.command('install')
		.description('Copy the issue_autofix commands into <agent_folder>/commands/')
		.argument('[agent_folder]', 'Target .claude directory', '.claude')
		.action(async (agentFolder: string) => {
			const result = await InstallCommand.install(agentFolder);
			for (const file of result.files) {
				console.log(`${Chalk.green(file.action)} ${file.destination}`);
			}
			console.log(Chalk.bold(`\n${result.files.length} command(s) → ${result.destinationDir}`));
		});

	await program.parseAsync(process.argv);
}

main().catch((error: unknown) => {
	const message = error instanceof Error ? error.message : String(error);
	console.error(Chalk.red(`Error: ${message}`));
	process.exit(1);
});
