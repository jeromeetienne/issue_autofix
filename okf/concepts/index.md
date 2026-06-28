# concepts

The cross-cutting ideas the commands rely on. These are the invariants and
mechanisms that make the autofix loop safe to run unattended.

- [label_lifecycle](label_lifecycle.md) — the GitHub label state machine that drives selection and records every outcome.
- [conflict_free_invariant](conflict_free_invariant.md) — one pull request per issue, conflict-free by construction, so the open pull requests stay independently mergeable in any order.
- [worktree_isolation](worktree_isolation.md) — every fix is built and tested in its own git worktree off main, never disturbing the primary checkout.
- [check_gate](check_gate.md) — provision the worktree, then gate the pull request on the project's own checks; distinguish a bad fix from a broken environment.
- [never_merge](never_merge.md) — the system opens pull requests but never merges or closes; the maintainer always reviews.
