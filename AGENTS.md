# AGENTS.md

Context for AI agents working **on** this repository. It is not shipped to
plugin consumers.

## What this repo is

`agent-loadout` is a cross-harness package of AI customizations, mostly Agent
Skills. It installs into GitHub Copilot (CLI, VS Code, cloud agent), Claude Code,
Cursor, and OpenCode. Read [docs/decisions.md](docs/decisions.md) before changing
the structure.

## Layout

| Path | Purpose | Shipped |
|---|---|---|
| `plugin.json` | Agent Plugins manifest. The only hand-edited manifest. | yes |
| `skills/<name>/` | Shipped Agent Skills | yes |
| `.claude-plugin/` | Generated harness manifests. Do not edit. | yes |
| `evals/<name>/` | Eval specs for shipped skills | no |
| `scripts/` | Node/TypeScript tooling, run with `node` (no build step) | no |
| `schemas/` | Vendored JSON schemas used by validation | no |
| `tests/` | `node --test` tests for `scripts/` | no |
| `.claude/skills/` | Maintenance skills for this repo | no |
| `docs/` | Decisions and research claims | no |

## Commands

Requires Node 22.18 or later. Run `npm ci` once.
The bundled DocFX helper tests additionally need Python 3.10+.

| Command | Does |
|---|---|
| `npm run generate` | Regenerate harness manifests from `plugin.json` |
| `npm run validate` | Validate skills, evals, and manifests, including the drift check |
| `npm test` | Run script tests |
| `python -B -m unittest discover -s skills/docfx-github-pages/scripts -p test_check_docs.py` | Run the bundled DocFX checker tests |
| `npm run typecheck` | Type-check `scripts/` and `tests/` |
| `npm run lint:md` | Lint Markdown |
| `npm run lint:skills` | Vally lint for skills and eval specs (`--strict`) |
| `npm run lint:skills-ref` | Agent Skills reference validator (needs `uv`) |
| `npm run lint:claude` | `claude plugin validate . --strict` |
| `npm run check` | validate, typecheck, test, Markdown and Vally lint; run before committing |
| `npm run check:all` | `check` plus the skills-ref and Claude validators |
| `npm run new:skill -- <name>` | Scaffold a skill and its eval spec |

## Rules

- Edit `plugin.json`, then run `npm run generate`. Never hand-edit files under
  `.claude-plugin/`.
- Don't add a `CLAUDE.md`. Claude Code reads this file directly, and a root
  `CLAUDE.md` fails `claude plugin validate --strict`.
- A skill's `name` must equal its directory name: lowercase letters, digits, and
  single hyphens, 64 characters or fewer.
- A `description` says what the skill does **and** when to use it, in 1024
  characters or fewer. It is the only text a harness sees before activation.
- Keep `SKILL.md` under 500 lines. Move detail into `references/`, one level deep.
- Every shipped skill needs eval cases with prompts that should trigger it and
  prompts that should not.
- Shipped skills must be harness-neutral. Put harness-specific notes in a clearly
  labeled section, not in the frontmatter.
- Don't create root `agents/`, `hooks/`, or `commands/` directories without a real
  component. Claude Code auto-loads those paths.
- Hooks and MCP servers execute code on users' machines. Add them only with a
  documented reason and per-harness tests.
- Pin GitHub Actions to a full commit SHA with a version comment. Keep workflow
  `permissions` minimal.
- When a change depends on harness behavior, cite or update the claim in
  [docs/research.md](docs/research.md).

## Conventions

- Conventional Commits for commits and PR titles, for example
  `feat(skills): add dotnet-upgrade skill`.
- Default to no code comments. Comment only non-obvious constraints.
- LF line endings everywhere except Windows scripts.
