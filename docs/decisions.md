# Decisions

This file records the design decisions for `agent-loadout` and why they were made.
Each decision rests on claims listed in [research.md](research.md). When a claim
changes, revisit the decisions that cite it.

Status values: **Accepted**, **Proposed**, **Superseded**.

## D1. Agent Skills are the canonical unit

**Status:** Accepted

Every reusable capability starts as an [Agent Skill](https://agentskills.io/specification)
in `skills/<name>/SKILL.md`. Skills are the only component that every target
harness loads natively (R1, R2).

- `name` must match the directory name.
- Use `references/`, `scripts/`, and `assets/` for progressive disclosure.
- Keep `SKILL.md` under 500 lines.

## D2. One root Agent Plugins package

**Status:** Accepted

The repository root is a single [Agent Plugins 1.0](https://agent-plugins.org/specification)
package. Root `plugin.json` is the **only hand-edited manifest** and the source of
truth for name, version, description, and metadata (R3).

- Cursor loads it directly (R4).
- Copilot CLI loads it directly and prefers it over `.claude-plugin/plugin.json`
  (R12).
- Start with one plugin. Split into bundles only when the skill count or audience
  makes a single install too heavy, or release lifecycles need to diverge.
- Keep each skill's assets, references, and helpers in its own directory. Optional
  execution tools such as DocFX and Python do not require a separate plugin.

## D3. Harness manifests are generated, never hand-edited

**Status:** Accepted

`npm run generate` writes harness-specific manifests from `plugin.json`:

| File | Consumer |
|---|---|
| `.claude-plugin/plugin.json` | Claude Code plugin |
| `.claude-plugin/marketplace.json` | Claude Code marketplace; also read by Copilot CLI (R5) |

No `.github/plugin/marketplace.json` is generated, because Copilot CLI already
finds the Claude marketplace file (R5).

CI runs `npm run generate -- --check` and fails on drift. This keeps one source of
truth without symlinks (D8).

## D4. Supported harnesses for v1

**Status:** Accepted

| Harness | Support | Mechanism |
|---|---|---|
| GitHub Copilot CLI | Native plugin | `copilot plugin marketplace add BenjaminMichaelis/agent-loadout` |
| Claude Code | Native plugin | `/plugin install agent-loadout --marketplace BenjaminMichaelis/agent-loadout` |
| Cursor | Native plugin | Agent Plugins root `plugin.json`, cloned into `~/.cursor/plugins/local` |
| VS Code (Copilot) | Skills | `npx skills add` or Copilot CLI plugin |
| GitHub Copilot cloud agent | Plugin or skills | `.github/copilot/settings.json` in the consuming repo (R10), or copy into its `.github/skills` |
| OpenCode | Skills only | `npx skills add`, or `.agents/skills` / `skills.paths` |

OpenCode "plugins" are JS/TS code packages, not Agent Plugins (R6). Native OpenCode
support is tracked in [#1](https://github.com/BenjaminMichaelis/agent-loadout/issues/1)
and should be low effort once OpenCode adopts Agent Plugins.

## D5. Layered installation

**Status:** Accepted

1. **Native plugin marketplace** (Copilot CLI, Claude Code, Cursor): preferred.
   Updates use each harness's plugin update command.
2. **`npx skills add BenjaminMichaelis/agent-loadout`** (R7): universal fallback
   for any harness that reads skill folders.
3. **Manual copy** of `skills/<name>` into a project skill directory.

No install path may require running repository code.

## D6. Hooks, agents, MCP servers, and instructions are opt-in and added on demand

**Status:** Accepted

Hooks and custom agents are not portable (R8). Add them only for a concrete use,
each with:

- shared logic in a script, plus a thin per-harness adapter;
- a test for each harness it claims to support.

Do **not** create placeholder `agents/`, `hooks/`, or `commands/` directories at the
root. Claude Code auto-discovers those paths and would treat a placeholder
`README.md` as a component (R9). Portable MCP servers go in root `mcp.json` (R3).

Shipped skills must not impose personal preferences on consumers. Opinions belong
in opt-in skills with clear descriptions.

## D7. Contributor context is separate from shipped content

**Status:** Accepted

- `AGENTS.md` holds context for working **on** this repo. It is not part of the
  plugin. There is no `CLAUDE.md`: Claude Code reads `AGENTS.md` directly when no
  `CLAUDE.md` exists (R13), and a root `CLAUDE.md` makes
  `claude plugin validate --strict` fail.
- Repository-maintenance skills live in `.claude/skills/`. Copilot CLI, VS Code,
  Claude Code, Cursor, and OpenCode all read that project location (R2). They are
  not shipped, because the plugin only exposes root `skills/`.
- Shipped skills in `skills/` are not auto-loaded while working in this repo.
  Install the plugin locally to dogfood them.

## D8. No required symlinks

**Status:** Accepted

Symlinks break on Windows without Developer Mode, and Agent Plugins rejects links
that point outside the plugin root (R3). Mirrors are generated files instead.

## D9. Node/TypeScript tooling with no build step

**Status:** Accepted

Scripts are TypeScript run directly by Node 22.18+ type stripping
(`node script.ts`). This matches the ecosystem (awesome-copilot, aspire-skills,
Vally, `npx skills`). Dependencies stay minimal, and tests use `node --test`.

## D10. Layered validation

**Status:** Accepted

| Layer | Tool | Checks |
|---|---|---|
| Spec | `skills-ref` (`agentskills validate`, R14) | Agent Skills frontmatter and structure |
| Quality | Vally (`@microsoft/vally-cli`) `--strict` | Skill lint rules and eval spec lint |
| Harness | `claude plugin validate . --strict` (R15) | Claude plugin and marketplace manifests |
| Repository | `npm run validate` | Agent Plugins schema, name/dir match, size limits, relative links, eval files |
| Drift | `npm run generate -- --check` | Generated manifests match `plugin.json` |
| Docs and CI | markdownlint-cli2, actionlint, zizmor | Markdown style, workflow correctness, workflow security |

All GitHub Actions are pinned to a commit SHA, workflows default to
`permissions: contents: read`, and Dependabot updates actions and npm.

## D11. Evals are scaffolded now and run later

**Status:** Accepted

Every shipped skill has eval cases with both trigger and non-trigger prompts.
CI lints the eval specs. Model-backed eval runs (with and without the skill) are
deferred until there is a budget and a stable runner.

## D12. Versioning and release

**Status:** Proposed

- SemVer in root `plugin.json`; generated manifests copy it.
- `CHANGELOG.md` follows Keep a Changelog and is driven by Conventional Commits.
- Releases are `vX.Y.Z` git tags with GitHub Releases. Automation (for example
  release-please) is deferred until the first real release.

## D13. Naming

**Status:** Accepted

Repository, plugin, and marketplace are all `agent-loadout`, so the install is
`agent-loadout@agent-loadout`. No harness requires plugin names to match the
GitHub owner.
