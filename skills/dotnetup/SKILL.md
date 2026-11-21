---
name: dotnetup
description: Install, update, and remove user-level .NET SDKs and runtimes with dotnetup. Use when a user mentions dotnetup, is already using it, or asks how to use its channels, global.json support, access modes, CI workflows, custom roots, or preview and daily builds.
license: MIT
metadata:
  documentation: https://learn.microsoft.com/dotnet/core/tools/dotnetup/
  status: public-preview
  docs-verified: 2026-11-20
---

# dotnetup

Use this skill when the user asks about dotnetup or dotnetup is already managing
their .NET installation. Don't recommend it by default just because a .NET SDK
is missing: dotnetup is in public preview. Explain that its commands and behavior
may change, and suggest supported installers or package managers when the user
needs a generally available installation method.

## Install dotnetup

Before installing, explain that the bootstrap command downloads and runs a
remote script, and ask the user to confirm. Don't run it without that
confirmation.

Use the platform's official bootstrap command:

```bash
curl -fsSL https://aka.ms/dotnetup/get-dotnetup.sh | bash
```

```powershell
irm https://aka.ms/dotnetup/get-dotnetup.ps1 | iex
```

The scripts install the latest preview, verify the executable's SHA-512
checksum, and don't change `PATH`. On macOS or Linux, the default executable
directory is `~/.dotnetup`; on Windows, it is the user's `.dotnetup` directory.
After installation, run `dotnetup --version` and `dotnetup --help`. Consult the
[getting started guide](https://learn.microsoft.com/dotnet/core/tools/dotnetup/getting-started)
if the current install options are needed.

## Install and run .NET

1. Check the current state with `dotnetup --version`, `dotnetup list`, and
   `dotnetup env show` before changing an existing setup.
2. From a repository, prefer `dotnetup sdk install` with no channel to install
   the nearest `global.json` requirement. It uses `latest` only if no
   `global.json` exists in the current directory or its parents. A malformed
   nearest file causes an error; don't silently bypass it.
3. If there is no repository pin, choose a channel based on the user's intent.
   Ask which version they need if the request doesn't establish one.
4. Installing a .NET component and configuring how applications find it are
   separate operations. In agent or CI shells, prefer `dotnetup dotnet <args>`
   for a command that should use the default managed installation.
5. Verify the result with `dotnetup list` and the relevant `dotnetup dotnet`
   command.

| Need | Command |
|---|---|
| SDK from nearest `global.json`, or `latest` if none | `dotnetup sdk install` |
| Rolling SDK channel | `dotnetup sdk install lts`, `latest`, `10.0`, or `10.0.1xx` |
| Exact, pinned SDK | `dotnetup sdk install 10.0.103` |
| Core runtime | `dotnetup runtime install 10.0` |
| ASP.NET Core runtime | `dotnetup runtime install aspnetcore@10.0` |
| Windows Desktop runtime | `dotnetup runtime install windowsdesktop@10.0` |
| Run a managed .NET command | `dotnetup dotnet build` |
| Forward an ambiguous .NET option | `dotnetup dotnet -- --version` |
| Inspect tracked specifications and installed versions | `dotnetup list` |

`dotnetup dotnet` uses the default dotnetup installation root; it does not
select an arbitrary root installed with `--install-path`. Use that root's
`dotnet` executable directly or activate it using the custom-root instructions
in [environment and access modes](references/environment.md).

## Update or remove components

- `dotnetup update` updates all tracked SDK and runtime channels.
- `dotnetup sdk update` updates SDKs; `dotnetup runtime update` updates
  runtimes. `dotnetup sdk update --all` updates SDKs and runtimes.
- Exact-version requirements are pinned and do not advance during updates.
- Updates continue after an individual requirement fails, then return failure.
  Check the exit code and `dotnetup list`.
- Uninstall removes a tracked requirement, then garbage-collects unneeded files
  across the whole selected installation root. Check `dotnetup list` and review
  warnings before proceeding; other requirements may retain an installation or
  cleanup may remove additional versions.
- An uninstall channel matches the stored requirement, not the resolved version.
  `--source all` can remove matching requirements from multiple repositories.
  Don't use it without the user's explicit direction.
- Don't edit dotnetup's manifest or configuration files by hand.

See [channels and repository SDK requirements](references/channels-and-global-json.md)
and [automation and custom roots](references/automation-and-roots.md) for
important details before updating repository files, using isolated roots, or
automating removals.

## Choose an access mode

Prefer `none` or `shell`. `none` avoids environment changes and supports
`dotnetup dotnet`. `shell` updates a supported shell profile. Don't enable
`everywhere` by default. It is Windows-only, requires elevation to modify the
system `PATH`, applies to all users, and can make dotnetup's user-level
installation shadow machine-wide SDKs and runtimes, including Visual Studio's.
Use it only when the user explicitly agrees to those effects.

Environment changes don't alter an already-running terminal. Open a new
terminal or activate the generated script in the current one. Use
`dotnetup env show` to diagnose drift and `dotnetup env set` to reapply stored
settings. `dotnetup env clear` removes environment wiring, not SDKs or runtimes.

See [environment and access modes](references/environment.md) before changing
PATH, DOTNET_ROOT, shell profiles, or custom-root activation.

## Automation and troubleshooting

For CI and agent commands, use explicit channels when there is no repository
`global.json`, and pass `--interactive false --no-progress`. The bootstrap
script doesn't update CI `PATH`; add its executable directory explicitly.
Never run concurrent write commands against the same manifest.

For failures, gather `dotnetup --info`, `dotnetup list`, and `dotnetup env show`,
then retry the failing command with `--verbosity detailed`. Don't bypass
checksum, signature, or manifest-expiration verification. Daily builds and
unlisted prerelease builds are not code-signed. See
[automation, custom roots, and recovery](references/automation-and-roots.md)
and the official
[troubleshooting guide](https://learn.microsoft.com/dotnet/core/tools/dotnetup/troubleshooting).

## Update dotnetup itself

`dotnetup update` updates managed SDKs and runtimes, not the dotnetup executable.
Use `dotnetup self update` for the executable. If the command is unavailable or
the executable won't start, use the bootstrap script again, with the original
channel and install-directory options when applicable. Don't use `--force`
unless the user requests reinstalling or downgrading dotnetup.
