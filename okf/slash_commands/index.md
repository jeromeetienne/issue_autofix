# slash_commands

The three Claude Code slash commands that make up the product. Each is a markdown
command file under `commands/` whose body is the instruction set the agent
executes.

- [issue_autofix](/slash_commands/issue_autofix.md) — fix one queued issue in an isolated worktree, gate on the project's checks, and open one conflict-free pull request. Never merges.
- [issue_autofix_session](/slash_commands/issue_autofix_session.md) — run the resolver across the whole queue in one overnight pass, skipping rather than halting on failures and conflicts, then print a per-issue summary.
- [issue_autofix_validate](/slash_commands/issue_autofix_validate.md) — the optional, interactive pre-flight that vets each queued issue against a readiness rubric and labels it ready or parks it for clarification.
