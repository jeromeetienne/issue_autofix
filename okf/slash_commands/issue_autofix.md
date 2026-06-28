---
type: CLI Command
title: /issue_autofix
description: Fix one queued GitHub issue in an isolated worktree, gate it on the project's checks, and open one conflict-free pull request — never merging.
resource: commands/issue_autofix.md
tags: [slash-command, resolver, autofix, github, worktree]
timestamp: 2026-06-28
---

# /issue_autofix [number]

The single-issue resolver. It takes one queued issue, implements the smallest
correct fix on its own branch in an isolated git worktree, and — only if the fix
passes the project's checks and overlaps no other open autofix pull request —
opens a pull request for it.

It **never merges** and **never closes** issues, and it acts autonomously: it does
not ask the user questions mid-run. Every GitHub interaction uses the `gh` CLI.

## Front matter

| Field | Value |
| --- | --- |
| `description` | One-line summary of the command (shown in Claude Code). |
| `allowed-tools` | `Bash, Read, Edit, Write, Grep, Glob, Skill` |

## Argument

- `$ARGUMENTS` — an optional issue number. With a number, it operates on exactly
  that issue. With no argument, it selects the **oldest still-open** issue
  labelled `autofix` that has none of `autofix-needs-info`, `autofixed`, or
  `autofix-failed`.

## Steps

1. **Select the issue** — by argument, or the oldest eligible `autofix` issue via
   `gh issue list ... sort:created-asc --limit 1`. Confirm eligibility and read it
   in full. If nothing matches, report the queue is empty and stop.
2. **Create an isolated worktree off main** — `git worktree add -b
   issue_autofix/<number>-<slug> <worktree> main`, under the git-ignored
   `.issue_autofix/worktrees/` directory. The primary checkout is never touched.
   See [worktree isolation](../concepts/worktree_isolation.md).
3. **Comment the plan, then implement** — post a short plan comment on the issue
   (step 3a), then make the smallest correct fix under the worktree's absolute
   path (step 3b).
4. **Conflict avoidance** — compare the files this fix touches against the files
   every other open `issue_autofix/*` pull request touches; on overlap, **defer**
   (discard the worktree and branch, leave the issue unlabelled). See the
   [conflict-free invariant](../concepts/conflict_free_invariant.md).
5. **Provision, then gate on checks** — copy local config/secrets, install
   dependencies from the manifests, confirm the worktree is runnable, then run the
   project's discovered checks. See the [check gate](../concepts/check_gate.md).
6. **Commit, push, open the pull request** — Conventional-Commits title, a
   `Fixes #<number>` body, base `main`, then remove the worktree.
7. **Comment the result, then label** — comment the implementation with the pull
   request link (7a), then add the `autofixed` label (7b). See the
   [label lifecycle](../concepts/label_lifecycle.md).
8. **Report** — exactly one outcome (see below).

## Outcomes

| Outcome | Meaning | Label applied |
| --- | --- | --- |
| `autofixed #<number>` | A pull request is open. | `autofixed` |
| `failed #<number>` | A check ran and reported a real failure. | `autofix-failed` |
| `deferred #<number>` | The fix overlapped an open autofix pull request. | none |
| `could-not-provision #<number>` | The worktree could not be made runnable. | none |

A check that **cannot run** (missing dependency, `command not found`, install
error) is a provisioning problem, not a failed fix: it reports
`could-not-provision` and leaves the issue unlabelled — never `autofix-failed`.

## Invariants

- One issue per run; work only in the per-issue worktree; always remove the
  worktree before exiting (success, failure, deferral, or provisioning problem).
- Never open a pull request that touches a file another open autofix pull request
  touches, or whose project checks did not pass locally.
- Never merge, never close — the maintainer does both.
- Follow the repository's `CLAUDE.md` conventions for any code written.

# Citations

- [../../commands/issue_autofix.md](../../commands/issue_autofix.md) — the command definition.
