# Automation, custom roots, and recovery

See Microsoft's [automation guide](https://learn.microsoft.com/dotnet/core/tools/dotnetup/usecases/automation)
and [custom-root guide](https://learn.microsoft.com/dotnet/core/tools/dotnetup/usecases/manage-custom-installation-roots)
for current options.

## CI and agent usage

Use explicit commands and avoid relying on interactive onboarding or shell
profile changes:

```text
dotnetup sdk install 10.0.1xx --interactive false --no-progress
dotnetup dotnet test -- --logger trx
```

If installing dotnetup in GitHub Actions, add its executable directory to
`GITHUB_PATH`; the bootstrap script doesn't do this. On Linux, the default is:

```yaml
- name: Install dotnetup
  run: |
    curl -fsSL https://aka.ms/dotnetup/get-dotnetup.sh | bash
    echo "$HOME/.dotnetup" >> "$GITHUB_PATH"
- name: Install the .NET SDK
  run: dotnetup sdk install --interactive false --no-progress
- name: Build and test
  run: dotnetup dotnet test
```

Without an explicit channel, `dotnetup sdk install` uses the nearest
`global.json`, or `latest` if none exists. `dotnetup dotnet` sets environment
variables only for the child process; other workflow steps calling `dotnet`
directly don't use its managed installation.

For JSON state, use `dotnetup list --format json`; omit `--no-verify` when the
automation needs to validate that recorded files are present. Check command
exit codes. An update can continue after a failed requirement and return failure
at the end.

## Custom roots and manifests

`--install-path` selects an installation root; its specifications are tracked
in the selected manifest and are included in unfiltered `dotnetup update`.
`--manifest-path` isolates tracking state too and must be repeated for later
list, update, or uninstall commands.

Don't run concurrent writes to the same manifest. Use separate manifests for
independent automation jobs. Tracked installs fail if a root contains an
unmanaged .NET installation. Choose a different root or, only when another
process owns the directory, use `--untracked`. Untracked files aren't listed,
updated, or removed by dotnetup.

The default managed root is:

| OS | Path |
|---|---|
| Windows | `%LOCALAPPDATA%\dotnetup\dotnet` |
| macOS | `~/Library/Application Support/dotnetup/dotnet` |
| Linux | `$XDG_DATA_HOME/dotnetup/dotnet`, or `~/.local/share/dotnetup/dotnet` |

`DOTNET_DOTNETUP_DATA_DIR` changes the data directory. Don't edit
`dotnetup_manifest.json`, its `.sha256` file, or `dotnetup.config.json` by hand.

## Updates and removals

```text
dotnetup update
dotnetup sdk update
dotnetup runtime update
dotnetup sdk update --all
dotnetup sdk update --update-global-json
```

After changing a repository's `global.json`, run `dotnetup sdk install` from
that repository before an update. Otherwise, the first update might still
process the previous stored requirement.

Uninstall commands remove a tracked requirement, then garbage-collect unused
components throughout the selected root. Review the warnings: other
requirements can keep a requested version installed, and unrelated
unreferenced SDK/runtime installations can be removed. Use
`--non-interactive` only when intentionally accepting these warnings without
confirmation. `--source all` can remove requirements for all repositories in
the root; don't use it without explicit direction.

## Troubleshooting

| Symptom | First checks |
|---|---|
| `dotnet` resolves an unexpected SDK | Open a new terminal; run `dotnetup env show`, `dotnetup list`, then reapply with `dotnetup env set` if state drifted |
| Build/runtime fails after Windows `everywhere` setup | Check if machine-wide SDKs/runtimes were shadowed; discuss migration or switching to `shell`/`none` |
| Tracked install refuses the target folder | Select a new `--install-path`; only use `--untracked` if another tool owns the folder |
| Command waits for another dotnetup operation | Wait for that operation; retry after it finishes |
| Windows install warns that `dotnet.exe` is in use | Close .NET apps, IDEs, and build servers; retry |
| Manifest is corrupt or was manually changed | Don't edit it; consult official recovery instructions before removing state and reinstalling components |
| Download fails signature, checksum, or expiration checks | Don't bypass verification or alter the system clock; check time/network and report detailed output |
| Daily/prerelease install is blocked | Use a released build or ask the administrator; don't bypass unsigned-download policy |

For detailed diagnostics, collect `dotnetup --info`, `dotnetup list`,
`dotnetup env show`, and rerun the failing command with `--verbosity detailed`.
Consult the official
[troubleshooting guide](https://learn.microsoft.com/dotnet/core/tools/dotnetup/troubleshooting)
before repairing or deleting the manifest or installation directories.

## Updating or removing dotnetup

`dotnetup self update` updates the dotnetup executable, not installed SDKs or
runtimes. Official daily builds use a preview version label; specify
`--channel daily` to remain on daily builds. `--force` can reinstall or
downgrade; use it only at the user's request. If self-update is unavailable,
use the bootstrap script with the same quality and install-directory options.

Removing dotnetup is destructive: first list and record custom roots, clear
environment wiring, then delete each managed root, the data directory, and the
standalone executable directory. Do not remove these directories without the
user's explicit request.
