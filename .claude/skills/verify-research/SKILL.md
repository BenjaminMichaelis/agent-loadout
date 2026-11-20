---
name: verify-research
description: Re-verify the harness compatibility claims in docs/research.md against current official documentation and update docs/decisions.md if anything changed. Use when asked to validate or refresh the research, check whether a harness changed, before a release, or when a harness ships a major update.
---

# Verify research claims

`docs/research.md` lists the facts the repository design depends on (R1, R2, ...).
`docs/decisions.md` cites them. This skill keeps both current.

## Steps

1. Read `docs/research.md` and `docs/decisions.md`.
2. For each claim, fetch every linked source and compare it with the claim.
   Prefer official docs and specifications over blog posts. When you can, confirm
   behavior directly, for example with `copilot plugin --help`,
   `claude plugin validate .`, or by installing the plugin locally.
3. Classify each claim:
   - **unchanged**: update the `Checked` date and set the status to `verified`.
   - **changed**: rewrite the claim, update the source and date, and list every
     decision that cites it.
   - **unverifiable**: set the status to `assumed` and say why.
4. For each changed claim, decide whether the cited decisions still hold:
   - If yes, leave them alone.
   - If no, update the decision text. For a significant change, mark the old
     decision `Superseded` and add a new one instead of rewriting history.
5. Check the reference repositories table for major changes in how those repos
   package or validate skills. Add new patterns worth copying.
6. Resolve or update the "Open questions" section.
7. If the changes require code or layout updates, list them as follow-up tasks
   rather than making them in the same change.

## Output

Summarize as a table with these columns: claim ID, old status, new status, and
what changed. Commit with `docs(research): reverify harness claims`.
