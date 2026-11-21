# Environment and access modes

See the [dotnetup environment documentation](https://learn.microsoft.com/dotnet/core/tools/dotnetup/concepts/environment)
and the [environment command reference](https://learn.microsoft.com/dotnet/core/tools/dotnetup/usecases/manage-environment)
before changing `PATH`, `DOTNET_ROOT`, or shell profiles.

## Modes

| Mode | Effect | Platform |
|---|---|---|
| `none` | Doesn't configure `PATH` or `DOTNET_ROOT`; use `dotnetup dotnet` | All |
| `shell` | Adds managed .NET environment settings to a shell profile | All |
| `everywhere` | Changes system `PATH` and user-level `DOTNET_ROOT` | Windows only |

`everywhere` requires elevation to change the system `PATH`, applies to all
users, and makes the dotnetup-managed root take precedence over machine-wide
.NET. Projects that depend on an SDK installed only by Visual Studio or another
machine-wide installer can fail; framework-dependent applications can fail to
launch. Don't enable it without the user's explicit agreement. If they choose
it, discuss migrating the SDKs and runtimes they need:

```text
dotnetup sdk install --migrate-from-system
dotnetup runtime install --migrate-from-system
```

Migration copies detected current-architecture requirements into the selected
dotnetup root; it doesn't remove the system installation.

## Configure and inspect

```text
dotnetup env set none
dotnetup env set shell --shell pwsh
dotnetup env show
dotnetup env set
dotnetup env clear
```

Supported shell values are `bash`, `zsh`, `fish`, and `pwsh`. `env set`
without a mode reapplies the stored configuration and fails if there isn't a
readable configuration. `env clear` is equivalent to clearing the mode and
removing dotnetup from PATH; it doesn't uninstall .NET.

The dotnetup executable is added to `PATH` by default regardless of .NET access
mode. Control this with `--dotnetup-on-path true|false`.

Environment changes affect new processes only. For the current shell:

```bash
eval "$(dotnetup env script --shell bash)"
```

```powershell
dotnetup env script --shell pwsh | Invoke-Expression
```

Generate and inspect the script without running it if the environment changes
need review first.

## Custom roots

`dotnetup dotnet` selects the default dotnetup installation root. It does not
automatically activate an arbitrary root passed to `--install-path`. To use a
custom root in the current PowerShell session:

```powershell
dotnetup env script --shell pwsh --dotnet --dotnet-install-path .\.dotnet |
  Invoke-Expression
```

Or run its `dotnet` executable directly. Shell changes don't affect an IDE
already running; launch it from an activated terminal or use an explicitly
approved Windows `everywhere` setup.
