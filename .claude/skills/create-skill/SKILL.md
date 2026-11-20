---
name: create-skill
description: Create or substantially revise a shipped Agent Skill in the agent-loadout repository, including its eval spec. Use when asked to add a skill, write a SKILL.md, turn a workflow or prompt into a skill, or improve a skill's description or triggering.
---

# Create a skill in agent-loadout

## 1. Decide whether it should be a skill

A skill fits when the agent needs procedural knowledge it would not otherwise
have, and a request can clearly signal when to use it. Prefer something else when:

- it is a one-line preference, which belongs in a consumer's own instructions file;
- it must run automatically on events, which makes it a hook (see `AGENTS.md`);
- it mostly wraps an external API, which makes it an MCP server.

Check `skills/` for an existing skill to extend before creating a new one.

## 2. Scaffold

```sh
npm run new:skill -- <name>
```

This creates `skills/<name>/SKILL.md` and `evals/<name>/eval.yaml` with `TODO`
markers. Validation fails until every `TODO` is replaced.

## 3. Write the description first

The description is the only text a harness reads before it decides to load the
skill. Make it:

- start with what the skill does, in the third person;
- follow with "Use when ..." and the concrete phrases, file types, or tools a user
  would mention;
- avoid harness names unless the skill is specific to one harness;
- stay under 1024 characters, aiming for 200 to 400.

## 4. Write the body

- Write instructions for an agent, not documentation for a human. Use imperative
  steps and decision tables.
- Leave out what a capable model already knows. Keep what is specific, surprising,
  or easy to get wrong.
- Stay harness-neutral. Say "run the tests", not the name of a harness tool. Put
  unavoidable differences in a short "Harness notes" section.
- Keep `SKILL.md` under 500 lines. Move long material into `references/<topic>.md`
  and link to it with a relative link, one level deep.
- Put executable helpers in `scripts/`. They must work on Windows, macOS, and Linux,
  or say clearly where they don't.
- Don't encode the maintainer's personal preferences as universal rules.

## 5. Write evals

Edit `evals/<name>/eval.yaml`:

- At least two `kind: trigger` stimuli that should activate the skill, using
  `skill-invocation` with `required`.
- At least two `kind: non-trigger` stimuli that are close in topic but should
  **not** activate it, using `skill-invocation` with `disallowed`.
- Add output graders, such as `output-matches` or `file-contains`, that verify the
  skill changed the result.
- Tag the most important stimuli `priority: p0`.

## 6. Verify

```sh
npm run check
```

Fix every reported problem. Then mention the new skill in `README.md` under
"Skills" and add a `CHANGELOG.md` entry under `Unreleased`.
