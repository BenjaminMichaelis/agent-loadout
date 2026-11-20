# Contributing

## Setup

Requires Node.js 22.18 or later. Python 3.10+ is optional for the DocFX helper
tests, and [uv](https://docs.astral.sh/uv/) is used for the `skills-ref` spec check.
CI runs both separately from `npm run check`.

```sh
npm ci
npm run check
```

## Add or change a skill

1. Run `npm run new:skill -- <name>` and replace every `TODO`.
2. Write evals in `evals/<name>/eval.yaml` with prompts that should and should not
   trigger the skill.
3. Run `npm run check`.

[`AGENTS.md`](AGENTS.md) has the full rules. The `create-skill` maintenance skill
in `.claude/skills/` walks an agent through the process.

## Change plugin metadata

Edit `plugin.json`, then run `npm run generate`. Files in `.claude-plugin/` are
generated, and CI fails if they drift.

## Commits and pull requests

Use [Conventional Commits](https://www.conventionalcommits.org/) for commit
messages and PR titles. Add user-visible changes to `CHANGELOG.md` under
`Unreleased`.

## Checks

| Check | Local command | CI workflow |
|---|---|---|
| Skills, evals, manifests, drift | `npm run validate` | `ci.yml` |
| Script tests (Linux and Windows) | `npm test` | `ci.yml` |
| DocFX helper tests (Linux and Windows) | `python -B -m unittest discover -s skills/docfx-github-pages/scripts -p test_check_docs.py` | `ci.yml` |
| Types | `npm run typecheck` | `ci.yml` |
| Vally skill and eval lint | `npm run lint:skills` | `ci.yml` |
| Agent Skills reference validator | `npm run lint:skills-ref` | `ci.yml` |
| Claude plugin validator | `npm run lint:claude` | `ci.yml` |
| Markdown | `npm run lint:md` | `ci.yml` |
| Workflows | `actionlint`, `zizmor` | `workflows.yml` |
