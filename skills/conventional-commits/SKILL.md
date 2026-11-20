---
name: conventional-commits
description: Write commit messages and pull request titles that follow the Conventional Commits 1.0.0 specification. Use when committing changes, writing or reviewing a commit message, naming a pull request, or when a repository uses semantic-release, release-please, or commitlint.
license: MIT
metadata:
  spec: https://www.conventionalcommits.org/en/v1.0.0/
---

# Conventional Commits

Format every commit message and pull request title as:

```text
<type>[optional scope][!]: <description>

[optional body]

[optional footer(s)]
```

## Choose the type

| Type | Use for | SemVer |
|---|---|---|
| `feat` | A new user-facing capability | minor |
| `fix` | A bug fix | patch |
| `docs` | Documentation only | none |
| `refactor` | Code change with no behavior change | none |
| `perf` | Performance improvement | patch |
| `test` | Adding or fixing tests | none |
| `build` | Build system or dependencies | none |
| `ci` | CI configuration | none |
| `chore` | Maintenance that fits nothing else | none |
| `style` | Formatting only | none |
| `revert` | Reverting a previous commit | depends |

Pick the type from the change's effect on users, not from the files touched.
A dependency bump that fixes a vulnerability is `fix(deps)`, not `build`.

## Write the header

- Scope is optional. Use a short noun for the affected area, such as
  `feat(parser):`. Follow the repository's existing scopes when it has them.
- The description is imperative, lowercase, with no trailing period:
  `fix(auth): reject expired refresh tokens`.
- Keep the header under 72 characters.

## Breaking changes

Mark a breaking change in either or both ways:

- `!` before the colon: `feat(api)!: remove v1 endpoints`
- A footer: `BREAKING CHANGE: v1 endpoints were removed; use /v2.`

A breaking change makes the next release a major version, whatever its type.

## Body and footers

- Separate the body from the header with one blank line. Explain *why*, not
  what the diff already shows.
- Footers use git trailer format: `Refs: #123`, `Reviewed-by: Name`.
- Don't add co-author or tool attribution trailers unless the repository asks
  for them.

## Before committing

1. Check for repository rules first: `commitlint.config.*`, `.commitlintrc*`,
   `CONTRIBUTING.md`, or recent `git log --oneline` history. Repository rules
   override this skill.
2. If one commit mixes unrelated types, suggest splitting it.
3. For squash merges, the pull request title becomes the commit header, so it
   must follow the same format.
