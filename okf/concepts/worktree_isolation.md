---
type: Concept
title: Worktree isolation
description: Every fix is built and tested in its own git worktree off the main ref, under a git-ignored directory, so the primary checkout is never disturbed.
resource: commands/issue_autofix.md
tags: [git-worktree, isolation, branch, cwd-independent]
timestamp: 2026-06-28
---

# Worktree isolation

Each fix runs in a dedicated git worktree, never by switching the primary
checkout's branch. The primary checkout is left untouched — it need not be clean,
and a human can keep working in it while the resolver runs.

## Creation

```bash
primary=$(git worktree list --porcelain | sed -n 's/^worktree //p' | head -1)
slug="<number>-<slug>"
worktree="${primary}/.issue_autofix/worktrees/${slug}"
git worktree add -b "issue_autofix/${slug}" "$worktree" main
cd "$worktree"
```

- `<slug>` is a short kebab-case form of the issue title.
- The branch is `issue_autofix/<number>-<slug>` — the prefix the [conflict
  check](conflict_free_invariant.md) keys on.
- Branching from the `main` **ref** (not the working tree) means the primary
  checkout's state is irrelevant and there is no clash with the primary checkout
  already being on `main`.
- The worktree lives under `.issue_autofix/worktrees/`, which is **git-ignored**,
  so it never shows up as untracked changes in the primary checkout. `git worktree
  add` creates the intermediate directories itself.

## cwd-independent paths

Shell state does not persist between separate command invocations, so the `cd`
above does not stick. Every later step recomputes the paths the same way:

- the **primary checkout** is always the first `git worktree list` entry;
- **this issue's worktree** is always
  `<primary>/.issue_autofix/worktrees/<number>-<slug>`.

All work — edits, install, checks, commit, push — happens inside the worktree;
only worktree **removal** runs from the primary checkout, because you cannot remove
the worktree you are standing in.

## Removal

The worktree is **always** removed before the run exits — on success, failure,
deferral, and provisioning problem — which also frees its installed dependencies
and copied config:

```bash
cd "$primary"
git worktree remove --force "${primary}/.issue_autofix/worktrees/<number>-<slug>"
git worktree prune
```

On success the branch is kept (the pushed copy backs the pull request); on
deferral or failure the branch is also deleted with `git branch -D`. A fresh
worktree contains only tracked files, so it must be provisioned before its checks
are trusted — see the [check gate](check_gate.md).

# Citations

- [../../commands/issue_autofix.md](../../commands/issue_autofix.md) — steps 2, 4, 5, and 6: worktree creation, the cwd-independent path rule, and removal.
- [../../README.md](../../README.md) — "Isolated, runnable worktree".
