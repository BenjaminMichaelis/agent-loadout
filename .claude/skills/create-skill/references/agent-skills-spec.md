# Agent Skills specification notes

Use the [Agent Skills specification](https://agentskills.io/specification) as
the source of truth. This is a practical summary, not a replacement for it.

## Required frontmatter

- `name`: 1–64 lowercase letters, digits, or single hyphens; no leading,
  trailing, or consecutive hyphens. It must match the skill directory name.
- `description`: non-empty, at most 1024 characters, describing both the
  capability and when to activate it.

## Optional frontmatter

Add optional fields only when they help:

- `license`: a license name or bundled license-file reference.
- `compatibility`: concrete environment requirements, at most 500 characters.
- `metadata`: additional string key-value pairs; use distinctive keys.
- `allowed-tools`: a space-separated list of pre-approved tools. This field is
  experimental and support varies, so don't assume it is portable.

For cross-harness skills, confirm that any optional field is supported by the
repository's validators and target harnesses before relying on it. Do not add
compatibility requirements that are merely preferences.

## Body and resources

The Markdown body has no prescribed section format. Prefer a short procedure
with relevant examples and edge cases. Keep `SKILL.md` under 500 lines and
roughly 5,000 tokens; move substantial detail into focused files under
`references/`, and link to each from `SKILL.md` at the point where it is useful.
Use relative paths from the skill directory, with references one level deep.

Use `scripts/` for executable helpers and `assets/` for static materials such
as templates. These directories are optional.

See the
[specification](https://agentskills.io/specification) for complete constraints,
examples, and validation details.
