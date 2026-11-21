# Channels and `global.json`

`dotnetup` is in public preview; see the [official channel documentation](https://learn.microsoft.com/dotnet/core/tools/dotnetup/concepts/channels)
for current syntax.

## Channels

| SDK channel | Meaning |
|---|---|
| `latest` | Latest active stable SDK |
| `lts` | Latest stable SDK in an LTS support phase |
| `preview` | Latest active preview or GoLive SDK; falls back to an active release when no preview is available |
| `daily` | Latest available daily build |
| `10` | Latest SDK for major version 10 |
| `10.0` | Latest SDK for major/minor 10.0 |
| `10.0.1xx` | Latest SDK in the 10.0.1xx feature band |
| `10.0.103` | Exact, pinned SDK |

`sts` isn't a supported named channel. Exact SDK and runtime versions don't
advance during `update`. Runtime channels use runtime versions, not SDK feature
bands. Use `component@channel` for runtime components:

```text
dotnetup runtime install runtime@10.0
dotnetup runtime install aspnetcore@10.0
dotnetup runtime install windowsdesktop@10.0
```

`aspnet` and `desktop` are accepted aliases for `aspnetcore` and
`windowsdesktop`. Windows Desktop runtime is Windows-only. A runtime install
without a component name selects the core .NET runtime.

## `global.json`

With no channel, `dotnetup sdk install` searches from the current directory up
to the filesystem root and uses the nearest `global.json`. If none exists, it
uses `latest`. A malformed nearest file or a file containing comments is an
error; dotnetup doesn't skip it to search a parent directory.

For SDK version `10.0.103`, `rollForward` maps to a tracked channel as follows:

| `rollForward` | Tracked requirement |
|---|---|
| Omitted or `latestPatch` | `10.0.1xx` |
| `latestFeature` | `10.0` |
| `latestMinor` | `10` |
| `latestMajor` | `latest` |
| `disable`, `patch`, `feature`, `minor`, or `major` | Exact `10.0.103` |

`allowPrerelease` doesn't affect the derived channel.

When `sdk.paths` is present and `--install-path` isn't supplied, dotnetup uses
the first `sdk.paths` entry. Relative paths resolve from the directory
containing `global.json`. Current preview behavior treats `$host$` as a
literal path and doesn't skip empty entries. Installation-path precedence is:

1. `--install-path`
2. First `sdk.paths` entry in the nearest `global.json`
3. Default dotnetup installation root

After changing `global.json`, run `dotnetup sdk install` from that repository
before `dotnetup sdk update`; otherwise, the first update can process a stale
stored requirement. `--update-global-json` writes the resolved SDK version
back to `sdk.version` while preserving other properties and formatting.

Uninstalling a `global.json`-sourced requirement doesn't delete the file.
`dotnetup sdk uninstall <channel> --source globaljson` removes all matching
global.json-sourced requirements in the selected root, not just one repository.
