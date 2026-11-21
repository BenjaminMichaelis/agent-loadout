# Scripts for agents

Keep a shell command inline when it is short and reliable. Bundle a helper when
logic is reused or a command is complex enough to be easy to misinvoke. State
prerequisites, pin package versions where practical, and declare or lock
dependencies so the invocation is reproducible. Make sure the runtime and
dependency approach work in the skill's target environments.

Reference bundled files with paths relative to the skill root, and list
available scripts in `SKILL.md`. Scripts should be portable across Windows,
macOS, and Linux, or clearly state their supported platforms.

Design scripts for non-interactive, retrying agents:

- Accept inputs through arguments, environment variables, or stdin; never block
  on a prompt.
- Provide concise `--help` usage, examples, and prerequisite information.
- Validate ambiguous or invalid inputs and report what was received and how to
  correct it.
- Return machine-readable data on stdout when useful; send progress and
  diagnostics to stderr.
- Use meaningful exit codes and document them when callers need to distinguish
  failure types.
- Make safe operations idempotent. For destructive or stateful actions, use
  safeguards such as dry-run or explicit confirmation when appropriate.
- Bound default output and provide a way to narrow or paginate large results.

See [Using scripts in skills](https://agentskills.io/skill-creation/using-scripts)
for runtime-specific dependency and invocation examples.
