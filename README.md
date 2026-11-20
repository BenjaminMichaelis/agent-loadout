# agent-loadout

A portable loadout of AI agent skills that works across GitHub Copilot, Claude
Code, Cursor, and OpenCode. Each skill is a standard
[Agent Skill](https://agentskills.io), and the repository root is an
[Agent Plugins](https://agent-plugins.org) package with a generated Claude Code
manifest. GitHub Copilot, Claude Code, and Cursor install it as a native plugin.
OpenCode and other harnesses install the same skill folders with the
[`skills`](https://github.com/vercel-labs/skills) CLI. There are no per-harness
copies to keep in sync.

## Skills

| Skill | Use it to |
|---|---|
| [conventional-commits](skills/conventional-commits/SKILL.md) | Write commit messages and PR titles that follow Conventional Commits |

## Install

### GitHub Copilot CLI

```sh
copilot plugin marketplace add BenjaminMichaelis/agent-loadout
copilot plugin install agent-loadout@agent-loadout
```

Update with `copilot plugin update agent-loadout`.

### Claude Code

```text
/plugin install agent-loadout --marketplace BenjaminMichaelis/agent-loadout
```

On versions older than 2.1.275, run `/plugin marketplace add BenjaminMichaelis/agent-loadout`
first, then `/plugin install agent-loadout@agent-loadout`.

### Cursor

Clone into Cursor's local plugin folder, then update with `git pull`:

```sh
git clone https://github.com/BenjaminMichaelis/agent-loadout ~/.cursor/plugins/local/agent-loadout
```

### OpenCode, VS Code, and other harnesses

Use the [`skills`](https://github.com/vercel-labs/skills) CLI, which installs into
the right skills folder for each harness:

```sh
npx skills add BenjaminMichaelis/agent-loadout
npx skills update
```

Or copy a folder from `skills/` into your project's `.agents/skills/` or
`.claude/skills/` directory.

### GitHub Copilot cloud agent

The cloud agent loads skills from the repository it works in. Copy the skills you
want into that repository's `.github/skills/`, or enable the plugin in its
`.github/copilot/settings.json`:

```json
{
  "extraKnownMarketplaces": {
    "agent-loadout": { "source": { "source": "github", "repo": "BenjaminMichaelis/agent-loadout" } }
  },
  "enabledPlugins": { "agent-loadout@agent-loadout": true }
}
```

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). Design decisions are in
[docs/decisions.md](docs/decisions.md).

## License

[MIT](LICENSE)
