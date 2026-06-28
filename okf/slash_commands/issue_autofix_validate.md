---
type: CLI Command
title: /issue_autofix_validate
description: Optional, interactive pre-flight that vets each queued issue against a four-point readiness rubric, interviews the user to fill gaps, rewrites the issue, and labels it ready or parks it for clarification.
resource: commands/issue_autofix_validate.md
tags: [slash-command, validation, interactive, rubric, github]
timestamp: 2026-06-28
---

# /issue_autofix_validate [number…]

Makes sure queued autofix issues are defined well enough to fix automatically
*before* the resolver runs. It reads the queue, judges each issue against a
readiness rubric, and — for any that are underspecified — interviews the user,
rewrites the issue, and labels it.

This is the **one interactive command** in the set and the only human-in-the-loop
step; run it with the user present. It **never fixes code, opens a pull request,
merges, or closes an issue** — its only effects are editing an issue's body and
adding one of two labels. Running it is **optional**: the resolver and the session
work with or without it.

## Front matter

| Field | Value |
| --- | --- |
| `description` | One-line summary of the command. |
| `allowed-tools` | `Bash, Read, Write, Grep, Glob, AskUserQuestion, Skill` |

## The readiness rubric

An issue is **autofix-ready** only if all four hold:

1. **Clear outcome** — it says what is wrong and what "fixed" looks like.
2. **Locatable in the code** — it points at where the change goes (file, function,
   type, command, route, error message, or UI label).
3. **Bounded scope** — one small, self-contained change suitable for "the smallest
   correct fix".
4. **Checkable acceptance** — a way to confirm the fix (a repro, expected output,
   or a clear test target).

## Steps

1. **Gather the queue** — by `$ARGUMENTS`, or every open `autofix` issue lacking
   `autofix-ready`, `autofix-needs-info`, `autofixed`, and `autofix-failed`.
2. **Judge each issue** against the rubric, **grounding criterion 2 in the actual
   code** with `git grep` — an issue pointing at code that does not exist is not
   ready, however confident it reads. Classify as ready or underspecified.
3. **Warn** — print the verdict for the whole queue before changing anything.
4. **Interview, one issue at a time** — use `AskUserQuestion` aimed at the failing
   criteria, drawing options from the code. Never invent scope the reporter did
   not ask for.
5. **Rewrite the clarified issues** — write the clarified definition onto the
   body, **preserving the reporter's original text** verbatim under a `## Reported`
   heading. Already-ready issues are left untouched.
6. **Label the outcomes** — `autofix-ready` for ready/clarified issues;
   `autofix-needs-info` (plus a comment naming what is missing) for ones still
   underspecified or skipped.
7. **Report** — one line per issue, grouped by outcome, with totals.

## Outcomes

| Label | Meaning | Resolver behaviour |
| --- | --- | --- |
| `autofix-ready` | Vetted; defined well enough to autofix. | Advisory — picked up the same as any queued issue. |
| `autofix-needs-info` | Too underspecified; parked for the reporter. | Skipped until clarified and re-validated. |

See the [label lifecycle](/concepts/label_lifecycle.md) for how these fit the
whole state machine.

## Invariants

- The only interactive command; the resolver and session never ask questions.
- Validation never blocks a run; only an explicit `autofix-needs-info` is skipped.
- Never fix code, open a pull request, merge, or close an issue.
- Preserve the reporter's original text whenever a body is rewritten; never
  rewrite an already-ready or about-to-be-parked body.

# Citations

- [../../commands/issue_autofix_validate.md](../../commands/issue_autofix_validate.md) — the command definition.
