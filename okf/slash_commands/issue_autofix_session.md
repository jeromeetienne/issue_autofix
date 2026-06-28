---
type: CLI Command
title: /issue_autofix_session
description: Run the single-issue resolver across the whole autofix queue in one overnight pass, skipping rather than halting on failures and conflicts, then print a per-issue summary.
resource: commands/issue_autofix_session.md
tags: [slash-command, session, overnight, loop, github]
timestamp: 2026-06-28
---

# /issue_autofix_session

Drives one night of autofixing. It hands the oldest eligible issue to
[/issue_autofix](issue_autofix.md), records the outcome, and moves
on until the queue is exhausted, then summarises. A failure or a conflict **never
halts the run** — it is recorded and skipped.

Nothing is ever merged. It acts fully autonomously and **never asks the user a
question** — not at the start, mid-run, or end. An ambiguous issue is recorded as
failed and skipped, never raised.

## Front matter

| Field | Value |
| --- | --- |
| `description` | One-line summary of the command. |
| `allowed-tools` | `Bash, Read, Skill` |

## Steps

1. **Preconditions** — the primary checkout need not be clean (each fix runs in
   its own worktree). Confirm `gh auth status` is authenticated and a push remote
   exists.
2. **Loop the resolver** — keep an in-memory `deferred` set, then repeat:
   - List eligible issues oldest-first (`--limit 30`) and pick the first not in
     `deferred`. If none remain, the queue is exhausted — leave the loop.
   - Run `/issue_autofix <number>`.
   - Record the reported outcome and continue:
     - `autofixed #N` / `failed #N` → the issue is now labelled.
     - `deferred #N` → add `N` to `deferred` so it is not retried tonight.
     - `could-not-provision #N` → add `N` to `deferred` too, so a broken
       environment cannot spin the loop.
3. **End-of-night summary** — one line per issue, grouped by outcome
   (`fixed` / `deferred` / `failed` / `skipped`), with totals and the reminder
   that nothing was merged.

## Termination guarantee

Every iteration removes one issue from consideration — it is either labelled
(`autofixed` / `autofix-failed`) or added to `deferred` — so the eligible set
always shrinks and the loop is guaranteed to terminate. Tracking `deferred` for
the whole night is what stops the loop spinning on the same conflict. See the
[label lifecycle](../concepts/label_lifecycle.md).

## Invariants

- Validation is optional: the session tries every queued `autofix` issue except
  ones parked as `autofix-needs-info`.
- Skip, never halt: one stuck or conflicting issue must not end the session.
- The primary checkout is never modified.
- Never merge and never close issues; never ask the user a question.

# Citations

- [../../commands/issue_autofix_session.md](../../commands/issue_autofix_session.md) — the command definition.
