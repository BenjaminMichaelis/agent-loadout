# Authoring and description practices

Use these practices when creating or revising a skill; keep the skill itself
focused on the user task rather than this meta-guidance.

## Ground instructions in expertise

Start from project-specific sources: a completed task and its corrections,
existing code and configuration, internal docs, runbooks, review feedback, or
failure cases and their resolutions. Prefer precise steps and edge cases learned
from those sources over generic advice. After a real execution, refine the skill
using both successful and unsuccessful attempts; remove instructions that caused
false triggers, detours, or unnecessary work.

Design a coherent unit of work. Use procedures, examples, and clear defaults
rather than a menu of equally weighted options. Be precise where sequence or
safety matters and leave room for judgment where multiple approaches work.
Include concrete gotchas that an agent is likely to miss. Put critical gotchas
in `SKILL.md`; don't hide them in a reference the agent may not know to open.

## Calibrate the description

The description is the primary trigger signal. Describe the user's intent and
the skill's boundaries, using plausible terms and situations they may mention.
Keep it concise and do not rely on implementation details that users would not
know.

For a high-impact skill or a scope that is easy to confuse with adjacent skills:

1. Make realistic should-trigger and near-miss should-not-trigger prompts. Vary
   phrasing, explicitness, and task complexity; use near-misses that share
   vocabulary but need a different capability.
2. If the harness can expose whether the skill activated, evaluate a balanced
   set with fixed train and held-out validation prompts. Use train failures to
   revise, then choose the description that generalizes best on validation.
   Repeat runs when activation is nondeterministic.
3. If activation cannot be observed, use the prompts as a review aid rather
   than claiming that static lint verifies triggering. Add the most useful
   cases to the repository's eval spec.
4. Recheck that the description remains within the spec limit and that it
   excludes adjacent tasks the skill should not handle.

Do not tune to exact failed prompt wording; generalize the missing concept or
scope boundary instead. Consult the
[description optimization guide](https://agentskills.io/skill-creation/optimizing-descriptions)
for a more extensive evaluation procedure.

## Sources

- [Best practices for skill creators](https://agentskills.io/skill-creation/best-practices)
- [Optimizing skill descriptions](https://agentskills.io/skill-creation/optimizing-descriptions)
