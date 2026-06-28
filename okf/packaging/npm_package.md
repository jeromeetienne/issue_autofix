---
type: Package
title: issue_autofix npm package
description: The npm package that ships the installer binary and the bundled command files, runnable directly with npx.
resource: package.json
tags: [npm, package, bin, npx, build]
timestamp: 2026-06-28
---

# issue_autofix npm package

The npm package wraps the [installer CLI](../cli/install.md) and the bundled command
files so a project can pull the commands in with a single `npx` invocation.

## Manifest

| Field | Value |
| --- | --- |
| `name` | `issue_autofix` |
| `version` | `0.1.5` |
| `type` | `module` (ES modules) |
| `bin.issue_autofix` | `dist/cli.js` |
| `files` | `dist`, `commands`, `README.md` |
| `engines.node` | `>=20.12` |
| `license` | `MIT` |

Publishing the `commands` directory alongside the compiled `dist` is what lets the
`install` command find the bundled command markdown files relative to the binary.

## Scripts

| Script | Command |
| --- | --- |
| `dev` | `tsx src/cli.ts` |
| `build` | `tsc -p tsconfig.build.json` |
| `typecheck` | `tsc --noEmit` |
| `prepare` | `npm run build` |
| `publish:all` | `npm run build && npm version patch && npm publish` |

## Dependencies

- Runtime: `chalk` (terminal colour), `commander` (argument parsing).
- Dev: `@types/node`, `tsx`, `typescript`.

## Entry points

```bash
npx issue_autofix install .claude        # from npm
npx github:jeromeetienne/issue_autofix install .claude   # straight from GitHub
```

# Citations

- [../../package.json](../../package.json) — name, version, `bin`, `files`, `engines`, scripts, dependencies.
- [../../README.md](../../README.md) — the "Quick install (npx)" entry points.
