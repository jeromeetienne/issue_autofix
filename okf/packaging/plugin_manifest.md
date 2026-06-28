---
type: Package
title: Claude Code plugin manifest
description: The Claude Code plugin definition and the repository's own plugin marketplace, which together let the commands be added with the /plugin command.
resource: .claude-plugin/plugin.json
tags: [claude-code, plugin, marketplace]
timestamp: 2026-06-28
---

# Claude Code plugin manifest

The repository is itself a Claude Code plugin **and** a plugin marketplace, so the
commands can be added without npm. Both manifests live under `.claude-plugin/`.

## plugin.json

| Field | Value |
| --- | --- |
| `name` | `issue_autofix` |
| `version` | `0.1.0` |
| `description` | Autofix queued GitHub issues; branch off main, smallest correct fix, conflict-check, gate on checks, open a pull request. Never merges. |
| `license` | `MIT` |

## marketplace.json

Declares the repository as a marketplace named `issue_autofix` with a single
plugin entry:

| Field | Value |
| --- | --- |
| `name` | `issue_autofix` |
| `source` | `./` (the repository root) |
| `version` | `0.1.0` |

## Adding the plugin

```text
/plugin marketplace add jeromeetienne/issue_autofix
/plugin install issue_autofix@issue_autofix
```

A local clone works the same way with `/plugin marketplace add ./issue_autofix`.
Installing the plugin makes the three [slash commands](../slash_commands/index.md)
available; it is the alternative to the [npm installer](npm_package.md).

# Citations

- [../../.claude-plugin/plugin.json](../../.claude-plugin/plugin.json) — the plugin definition.
- [../../.claude-plugin/marketplace.json](../../.claude-plugin/marketplace.json) — the marketplace declaration.
- [../../README.md](../../README.md) — the "As a plugin" instructions.
