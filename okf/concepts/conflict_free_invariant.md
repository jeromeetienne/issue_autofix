---
type: Concept
title: Conflict-free invariant
description: Every open autofix pull request touches a disjoint set of files, so they stay independently mergeable in any order, even if they pile up unmerged for days.
resource: commands/issue_autofix.md
tags: [conflict-avoidance, invariant, pull-request, git-diff]
timestamp: 2026-06-28
---

# Conflict-free invariant

**No two open autofix pull requests touch the same file.** This is what keeps every
autofix pull request independently mergeable in any order — the maintainer can
merge, reject, or reorder them freely.

The invariant is enforced before testing, in step 4 of
[/issue_autofix](/slash_commands/issue_autofix.md) ("Way A"). The fix is compared
against every other open pull request whose branch starts with `issue_autofix/`.

## The check

```bash
# Files this fix touches:
git add -A
git diff --cached --name-only | sort -u > /tmp/issue_autofix_mine.txt

# Files touched by every OTHER open autofix pull request:
> /tmp/issue_autofix_others.txt
for n in $(gh pr list --state open --json number,headRefName \
            --jq '.[] | select(.headRefName | startswith("issue_autofix/")) | .number'); do
  gh pr diff "$n" --name-only >> /tmp/issue_autofix_others.txt
done
sort -u -o /tmp/issue_autofix_others.txt /tmp/issue_autofix_others.txt

# Overlap:
comm -12 /tmp/issue_autofix_mine.txt /tmp/issue_autofix_others.txt
```

## On overlap — defer

If the overlap is **non-empty**, the issue conflicts with an open pull request.
The fix is **deferred**: the worktree and branch are discarded and the issue is
left **unlabelled** so a future night can pick it up once the conflicting pull
request has merged. The reported outcome is `deferred #<number>`, naming the
overlapping file(s) and the pull request they belong to.

In a session, the deferred number is held in the in-memory `deferred` set for the
rest of the night so the loop does not retry the same conflict — see
[/issue_autofix_session](/slash_commands/issue_autofix_session.md). Because a
deferral leaves no label, the issue's place in the [label
lifecycle](/concepts/label_lifecycle.md) is unchanged.

# Citations

- [../../commands/issue_autofix.md](../../commands/issue_autofix.md) — step 4, the overlap computation and the deferral path.
- [../../commands/issue_autofix_session.md](../../commands/issue_autofix_session.md) — the per-night `deferred` set.
- [../../README.md](../../README.md) — "One PR per issue, conflict-free by construction".
