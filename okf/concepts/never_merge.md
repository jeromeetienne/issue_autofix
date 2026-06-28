---
type: Concept
title: Never-merge guarantee
description: The system opens pull requests but never merges or closes issues; a human always reviews, and each pull request's Fixes #N closes its issue only on merge.
resource: commands/issue_autofix.md
tags: [safety, never-merge, review, fixes-keyword]
timestamp: 2026-06-28
---

# Never-merge guarantee

Every command in the set **opens** pull requests but **never merges** them and
**never closes** issues. The maintainer reviews the pull requests in the morning
and merges the ones they want; each pull request's `Fixes #<number>` line closes
its issue on merge.

## How it holds across the commands

- [/issue_autofix](/slash_commands/issue_autofix.md) — step 6 writes `Fixes
  #<number>` into the pull request body, the line that closes the issue **when the
  maintainer merges**. Step 7 adds only the `autofixed` label; it explicitly does
  not close the issue or merge the pull request.
- [/issue_autofix_session](/slash_commands/issue_autofix_session.md) — states that
  nothing is ever merged. To reject one, the maintainer closes its pull request;
  nothing else is affected, because of the
  [conflict-free invariant](/concepts/conflict_free_invariant.md).
- [/issue_autofix_validate](/slash_commands/issue_autofix_validate.md) — never even
  writes code: its only mutations are editing an issue body and adding a label.

## Why it is safe

A human is always the last step before anything lands. Combined with the
conflict-free invariant — open pull requests touch disjoint files — the maintainer
can merge, reject, or reorder pull requests in any order without side effects. The
[label lifecycle](/concepts/label_lifecycle.md) records state, but no label ever
closes an issue; only a merged `Fixes #N` does.

# Citations

- [../../commands/issue_autofix.md](../../commands/issue_autofix.md) — `Fixes #<number>` in the pull request body; "Do not close the issue and do not merge the PR".
- [../../commands/issue_autofix_session.md](../../commands/issue_autofix_session.md) — "Nothing is ever merged"; the reject-by-closing note.
- [../../README.md](../../README.md) — "It never merges and never closes issues".
