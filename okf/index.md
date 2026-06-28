---
okf_version: "0.1"
type: Bundle Index
title: issue_autofix knowledge bundle
description: Knowledge bundle for issue_autofix — a Claude Code plugin that autofixes queued GitHub issues into one conflict-free pull request each, overnight, and never merges.
timestamp: 2026-06-28
---

# issue_autofix

A Claude Code plugin that fixes simple GitHub issues automatically. Queue easy
issues with a label, run the resolver overnight, and wake up to one conflict-free
pull request per issue, each gated on the project's own checks. It **never merges
and never closes issues** — the maintainer reviews the pull requests in the
morning, and each pull request's `Fixes #N` closes its issue on merge.

The system is delivered three ways: as Claude Code slash commands, as an installer
CLI that copies those commands into a project, and as a Claude Code plugin.

## Folders

- [slash_commands](/slash_commands/index.md) — the three Claude Code slash commands that do the work.
- [cli](/cli/index.md) — the npx installer that copies the commands into a project or user agent folder.
- [concepts](/concepts/index.md) — the cross-cutting ideas: the label state machine, the conflict-free invariant, worktree isolation, the check gate, and the never-merge guarantee.
- [packaging](/packaging/index.md) — how the system is distributed: the npm package and the Claude Code plugin marketplace.

## Maintenance

This bundle is derived from source. The folder-to-source mapping lives in
`.okforge.config.json` at the repository root; see [log.md](/log.md) for the
change history. Regenerate with the `okf` skill rather than hand-editing.
