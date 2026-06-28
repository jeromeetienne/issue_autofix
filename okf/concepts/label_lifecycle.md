---
type: Concept
title: Label lifecycle
description: The GitHub label state machine that selects which issue to fix next and records the outcome of every attempt.
resource: commands/issue_autofix.md
tags: [labels, state-machine, github, selection]
timestamp: 2026-06-28
---

# Label lifecycle

The label is the heart of the state machine. Selection, deferral, success, and
failure are all expressed as labels on the issue, so the queue is fully recovered
from GitHub state on every run — no external database.

## Labels

| Label | Meaning | Created by |
| --- | --- | --- |
| `autofix` | Queue this issue to be fixed. | The maintainer (by hand). |
| `autofixed` | A pull request is open and awaiting review. | [/issue_autofix](../slash_commands/issue_autofix.md) step 7. |
| `autofix-failed` | The checks ran and failed; needs a human. | [/issue_autofix](../slash_commands/issue_autofix.md) step 5d. |
| `autofix-ready` | Vetted by the validator. Advisory — not required to be picked up. | [/issue_autofix_validate](../slash_commands/issue_autofix_validate.md) step 6. |
| `autofix-needs-info` | Too underspecified; parked and skipped until clarified. | [/issue_autofix_validate](../slash_commands/issue_autofix_validate.md) step 6. |

The colours and descriptions are set on first use via
`gh label create ... 2>/dev/null || true`, so the commands are idempotent on a
repository that has never seen these labels.

## Selection query

The resolver picks the **oldest still-open** `autofix` issue that carries none of
the terminal or parked labels:

```bash
gh issue list --state open --label autofix \
  --search '-label:autofix-needs-info -label:autofixed -label:autofix-failed sort:created-asc' \
  --json number,title,createdAt --limit 1
```

The validator uses the same shape but also excludes `autofix-ready`, so it only
looks at issues not yet vetted.

## Transitions

- `autofix` → `autofixed` — a pull request was opened (success).
- `autofix` → `autofix-failed` — a check ran and reported a real failure.
- `autofix` → (no label change) — **deferred** for a [conflict](conflict_free_invariant.md), or **could-not-provision** for a broken environment. The issue stays plain `autofix` so a later night retries it cleanly.
- `autofix` → `autofix-ready` or `autofix-needs-info` — applied only by the optional validator.

Because a deferral and a provisioning failure leave no label, re-selection is by
label and never by comments; an issue that merely carries a plan comment is still
eligible. See the [never-merge guarantee](never_merge.md): no label here
ever closes an issue — only a merged pull request's `Fixes #N` does that.

# Citations

- [../../commands/issue_autofix.md](../../commands/issue_autofix.md) — selection query, `autofixed` / `autofix-failed` transitions, the no-label deferral paths.
- [../../commands/issue_autofix_validate.md](../../commands/issue_autofix_validate.md) — `autofix-ready` / `autofix-needs-info` transitions.
- [../../README.md](../../README.md) — the labels table.
