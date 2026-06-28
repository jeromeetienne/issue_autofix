---
type: Concept
title: Check gate
description: Provision the fresh worktree to actually run, then gate the pull request on the project's own discovered checks — distinguishing a bad fix from a broken environment.
resource: commands/issue_autofix.md
tags: [checks, gate, provisioning, toolchain-detection]
timestamp: 2026-06-28
---

# Check gate

A pull request is opened only if the project's checks pass. This happens in step 5
of [/issue_autofix](/slash_commands/issue_autofix.md). Because a fresh
[worktree](/concepts/worktree_isolation.md) contains only tracked files, it must
be provisioned before any check result is trusted. The whole step is
project-agnostic — it does not assume Node.

## 5a — Copy local config and secrets

Ignored-but-present config and secrets have no manifest to regenerate from, so they
are copied (not rebuilt) into the worktree at the same relative path — for example
`.env`, `.env.local`. Large dependency and build directories are skipped.

```bash
git -C "$primary" ls-files --others --ignored --exclude-standard -- ':!.issue_autofix'
```

## 5b — Install dependencies

Dependencies are **rebuilt** from the project's manifests, never copied (a borrowed
tree can be stale or carry absolute paths — a Python `.venv` is the classic case).
A documented bootstrap (`make setup`, `script/bootstrap`, a devcontainer
`postCreateCommand`, a `package.json` `setup`/`postinstall` script) wins over
guessing; otherwise the install command is keyed off the lockfile or manifest:

| Manifest present | Install command |
| --- | --- |
| `package-lock.json` | `npm ci` |
| `pnpm-lock.yaml` | `pnpm install --frozen-lockfile` |
| `yarn.lock` | `yarn install --frozen-lockfile` |
| `bun.lockb` | `bun install` |
| `poetry.lock` / `pyproject.toml` | `poetry install` (or `uv sync`) |
| `requirements.txt` | `pip install -r requirements.txt` |
| `Gemfile.lock` | `bundle install` |
| `go.mod` | `go mod download` |
| `Cargo.toml` | `cargo fetch` |

## 5c — Confirm runnable

If the install command exits non-zero, the worktree is not provisioned — this is
**not the issue's fault**. The issue is left unlabelled, the worktree is removed,
and the outcome is `could-not-provision #<number>`.

## 5d — Gate on the project's own checks

Checks are discovered from the repository, not assumed:

1. `package.json` `typecheck` / `test` scripts → `npm run typecheck` and `npm test`.
2. Otherwise the toolchain's standard checks, for example `cargo check && cargo
   test`, `go vet ./... && go test ./...`, `ruff check . && mypy . && pytest`, or a
   `Makefile` `check` / `test` target.
3. Otherwise whatever `CLAUDE.md`, `README.md`, or `.github/workflows/` documents.

If no check command can be found, the gate is treated as **failed** — an
unverified fix is never shipped.

## Why a check failed

| Cause | Symptom | Outcome | Label |
| --- | --- | --- | --- |
| **Environment** | A check cannot even execute (missing dependency or binary, `command not found`, `Cannot find module`, install error). | `could-not-provision #<number>` | none |
| **Fix** | A check runs and reports a real failure (type error, failing test). | `failed #<number>` | `autofix-failed` |
| **Pass** | All discovered checks pass. | continue to the pull request | (later `autofixed`) |

This distinction matters for the [label
lifecycle](/concepts/label_lifecycle.md): a broken environment never earns
`autofix-failed`, so a transient setup problem does not permanently mark a
fixable issue as failed.

# Citations

- [../../commands/issue_autofix.md](../../commands/issue_autofix.md) — step 5 (5a–5d), the install table, and the environment-versus-fix distinction.
- [../../README.md](../../README.md) — "Gated on real checks".
