import Fs from 'node:fs';
import Path from 'node:path';
import Url from 'node:url';

/** Outcome of copying a single command markdown file into the agent folder. */
export type InstalledFile = {
	name: string;
	action: 'created' | 'updated';
	destination: string;
};

/** Summary returned by {@link InstallCommand.install}. */
export type InstallResult = {
	destinationDir: string;
	files: InstalledFile[];
};

/** Installs the issue_autofix slash commands into a Claude Code agent folder. */
export class InstallCommand {
	/**
	 * Copy every bundled command markdown file into `<agentFolder>/commands/`.
	 * @param agentFolder Target `.claude` directory (project- or user-level).
	 * @returns The destination directory and the per-file outcome.
	 */
	static async install(agentFolder: string): Promise<InstallResult> {
		const moduleDir = Path.dirname(Url.fileURLToPath(import.meta.url));
		const sourceDir = Path.join(moduleDir, '..', '..', 'commands');
		const destinationDir = Path.join(Path.resolve(agentFolder), 'commands');
		const sourceFiles = Fs.readdirSync(sourceDir).filter((name) => name.endsWith('.md'));
		if (sourceFiles.length === 0) {
			throw new Error(`No command files found in ${sourceDir}`);
		}
		Fs.mkdirSync(destinationDir, { recursive: true });
		const files: InstalledFile[] = [];
		for (const name of sourceFiles) {
			const destination = Path.join(destinationDir, name);
			const exists = Fs.existsSync(destination);
			Fs.copyFileSync(Path.join(sourceDir, name), destination);
			files.push({ name, action: exists === true ? 'updated' : 'created', destination });
		}
		return { destinationDir, files };
	}
}
