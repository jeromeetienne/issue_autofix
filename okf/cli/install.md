---
type: CLI Command
title: issue_autofix install
description: Copy the bundled issue_autofix slash command markdown files into a Claude Code agent folder's commands/ subdirectory.
resource: src/commands/install_command.ts
tags: [cli, installer, commander, node]
timestamp: 2026-06-28
---

# issue_autofix install [agent_folder]

The single subcommand of the `issue_autofix` binary. It copies every bundled
command markdown file into `<agent_folder>/commands/`. The binary is defined in
`package.json` as `issue_autofix` → `dist/cli.js`; see the
[npm package](/packaging/npm_package.md).

## Usage

```bash
npx issue_autofix install .claude     # project-level → .claude/commands/
npx issue_autofix install ~/.claude   # user-level    → ~/.claude/commands/
npx issue_autofix install             # current dir   → ./commands/
```

## Argument

| Argument | Default | Meaning |
| --- | --- | --- |
| `[agent_folder]` | `.` | Directory whose `commands/` subfolder receives the files. |

The destination is `Path.resolve(agentFolder)/commands`. The binary also exposes
`--version` (read from the package's own `package.json`).

## Behaviour

`InstallCommand.install(agentFolder)`:

1. Resolves the source directory (the package's bundled `commands/`) and the
   destination (`<resolved agent_folder>/commands`).
2. Reads every `*.md` file in the source. If there are none, throws
   `No command files found in <sourceDir>`.
3. Creates the destination directory recursively.
4. Copies each file, recording whether it `created` a new file or `updated` an
   existing one.
5. Returns `{ destinationDir, files }`.

The CLI prints one coloured line per file (`created`/`updated` and its
destination) followed by a bold total. On any error it prints `Error: <message>`
in red and exits with code 1.

## Types

```ts
type InstalledFile = {
        name: string;
        action: 'created' | 'updated';
        destination: string;
};

type InstallResult = {
        destinationDir: string;
        files: InstalledFile[];
};
```

# Citations

- [../../src/cli.ts](../../src/cli.ts) — argument parsing (Commander), version read, output formatting.
- [../../src/commands/install_command.ts](../../src/commands/install_command.ts) — the copy logic and the result types.
