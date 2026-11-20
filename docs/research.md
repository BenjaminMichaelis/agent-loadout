# Research claims

These are the facts that [decisions.md](decisions.md) relies on. Each claim records
its source and the date it was last checked. Ecosystem behavior changes quickly,
so re-verify claims before a release or when a harness ships a major update. The
`verify-research` maintenance skill automates this.

Status: `verified` (checked against the source), `assumed` (believed true but not
confirmed in docs), `stale` (needs a recheck).

| ID | Claim | Source | Checked | Status |
|---|---|---|---|---|
| R1 | Agent Skills: `skills/<name>/SKILL.md` with required `name` (1–64 chars, `a-z0-9-`, no leading, trailing, or double hyphen, equals the directory name) and `description` (1–1024 chars). Optional: `license`, `compatibility` (≤500 chars), `metadata`, `allowed-tools`. Keep `SKILL.md` under 500 lines. | [agentskills.io/specification](https://agentskills.io/specification) | 2026-11 | verified |
| R2 | Project skill locations. Copilot CLI: `.github/skills`, `.claude/skills`, `.agents/skills`. VS Code: `.github/skills` plus Claude and agents paths. Claude Code: `.claude/skills`. Cursor: `.agents/skills`, `.cursor/skills`, `.claude/skills`. OpenCode: `.opencode/skills`, `.claude/skills`, `.agents/skills`. `.claude/skills` is the only location all of them read. | [Copilot CLI](https://docs.github.com/copilot/how-tos/use-copilot-agents/use-copilot-cli), [Claude Code skills](https://code.claude.com/docs/en/skills), [Cursor skills](https://cursor.com/docs/skills), [OpenCode skills](https://opencode.ai/docs/skills) | 2026-11 | verified |
| R3 | Agent Plugins 1.0: root `plugin.json` (`$schema`, `name`, `version`, `description`, `author`, `homepage`, `repository`, `license`, `keywords`, `extensions`), fixed `skills/` and `mcp.json`. Client data goes under reverse-domain `extensions` keys or directories. Paths stay inside the plugin root. | [agent-plugins.org/specification](https://agent-plugins.org/specification) | 2026-11 | verified |
| R4 | Cursor loads Agent Plugins with a root `plugin.json`, but doesn't expand `${PLUGIN_ROOT}`; use `${CURSOR_PLUGIN_ROOT}`. `.cursor-plugin/plugin.json` adds rules, agents, commands, and hooks. | [cursor.com/docs/plugins](https://cursor.com/docs/plugins) | 2026-11 | verified |
| R5 | Copilot CLI looks for a marketplace in `marketplace.json`, `.plugin/marketplace.json`, `.github/plugin/marketplace.json`, then `.claude-plugin/marketplace.json`, so one Claude marketplace file serves both. | [Copilot CLI plugin reference](https://docs.github.com/copilot/reference/copilot-cli-reference/cli-plugin-reference) | 2026-11 | verified |
| R6 | OpenCode plugins are JS/TS packages (`@opencode/plugin`) configured in `opencode.json`. OpenCode does not read Agent Plugins `plugin.json`; requested in anomalyco/opencode#40993 and #41561. | [opencode.ai/docs/plugins](https://opencode.ai/docs/plugins/), [issue 40993](https://github.com/anomalyco/opencode/issues/40993) | 2026-11 | verified |
| R7 | `npx skills add OWNER/REPO` installs skills into many harnesses, with `check` and `update` commands and a `skills-lock.json` lockfile. It symlinks by default and has telemetry on by default. | [vercel-labs/skills](https://github.com/vercel-labs/skills) | 2026-11 | verified |
| R8 | Hook formats differ. Copilot uses `.github/hooks/*.json` with camelCase events (cloud agent: bash only, repo hooks only). Claude uses PascalCase events in `settings.json` or plugin `hooks/hooks.json`. Cursor uses `.cursor/hooks.json`. OpenCode uses JS plugins. | Harness docs (see R2) | 2026-11 | verified |
| R9 | Claude Code plugins auto-discover `skills/`, `agents/`, `commands/`, `hooks/hooks.json`, and `.mcp.json` at the plugin root. | [Claude Code plugins reference](https://code.claude.com/docs/en/plugins-reference) | 2026-11 | verified |
| R10 | Copilot cloud agent loads repository skills and hooks. Plugins are enabled through `extraKnownMarketplaces` and `enabledPlugins` in the committed `.github/copilot/settings.json`. | [Configuring cloud agent settings](https://docs.github.com/copilot/how-tos/use-copilot-agents/cloud-agent/configuring-agent-settings) | 2026-11 | verified |
| R11 | It is unclear whether Claude Code reads `.agents/skills`; its docs only list `.claude/skills`. | [Claude Code skills](https://code.claude.com/docs/en/skills) | 2026-11 | assumed |
| R12 | Copilot CLI recognizes a root `plugin.json` whose `$schema` is the Agent Plugins 1.0.0 or 1.1.0 URL and gives it precedence over `.claude-plugin/plugin.json`. It loads skills from `skills/`; Copilot-specific components go under `com.github.copilot/`. | [Copilot CLI plugin reference](https://docs.github.com/copilot/reference/copilot-cli-reference/cli-plugin-reference) | 2026-11 | verified |
| R13 | Claude Code 2.1.277+ reads `AGENTS.md` as project instructions when no `CLAUDE.md`, `.claude/CLAUDE.md`, or `CLAUDE.local.md` exists. | [Claude Code memory](https://code.claude.com/docs/en/memory#agents-md) | 2026-11 | verified |
| R14 | The Agent Skills reference validator is PyPI `skills-ref` (0.1.x, demo quality). Its executable is `agentskills`, and it validates one skill directory per call: `uvx --from skills-ref agentskills validate <dir>`. | [agentskills/agentskills](https://github.com/agentskills/agentskills/tree/main/skills-ref) | 2026-11 | verified |
| R15 | `claude plugin validate <path> [--strict]` checks plugin and marketplace manifests without auth (exit 0 pass, 1 fail). `--strict` fails on warnings, including a root `CLAUDE.md`. Directory listing checks (README length, icon) only affect the result with `--profile directory`. | `claude plugin validate --help` (Claude Code 2.1.329) | 2026-11 | verified |

## Reference repositories

| Repo | Pattern worth copying |
|---|---|
| [dotnet/skills](https://github.com/dotnet/skills) | Per-plugin manifests for each harness, version stamped from `version.json`, eval arms (baseline, isolated, plugin) with negative triggers, SHA-pinned actions |
| [microsoft/aspire-skills](https://github.com/microsoft/aspire-skills) | Single root plugin, generated OpenCode catalogs with a `catalog:check` drift test, Vally lint in CI, `CHANGELOG.md`, release tags |
| [github/awesome-copilot](https://github.com/github/awesome-copilot) | Source directories plus a generated `.github/plugin/marketplace.json`, separate validate-skills and validate-plugins workflows |
| [anthropics/skills](https://github.com/anthropics/skills) | `.claude-plugin/marketplace.json` with `"source": "./"`, `strict: false`, and explicit `skills` lists to build several bundles from one root |
| [microsoft/apm](https://github.com/microsoft/apm) | Manifest plus lockfile package manager that can pack to several harness formats |

## Open questions

- OpenCode V1 vs V2 skill catalog formats. Revisit when adding native OpenCode
  support.
- Whether Copilot loads Claude-format hooks and agents from a plugin that also
  has a root Agent Plugins manifest.
- The exact Claude Code command to update a marketplace plugin.
