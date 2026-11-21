# Implementation blueprint

Treat all paths and project content as adaptable examples. Read existing repository instructions first.

## Discover identity and tooling

Use read-only Git/GitHub operations before constructing public links:

```powershell
git status --short --branch
git remote -v
gh api repos/OWNER/REPOSITORY --jq '{full_name,html_url,default_branch,visibility}'
gh api repos/OWNER/REPOSITORY/pages --jq '{html_url,build_type,public,cname,https_enforced}'
dotnet --version
```

A Pages 404 can mean it is not enabled, but can also mean the current account cannot see it. Check repository permissions before concluding which. Do not change accounts or enable a public site as a workaround for denied access.

For a renamed repository, the API's canonical `full_name` is the input for later operations. A GitHub user/organization site can have `/` as its base path; a custom domain does not necessarily have a repository prefix. Preserve the actual returned URL.

The source README, manifests, examples, and tests establish the documentation claims. The repository description alone is not evidence that a package exists or that an API behaves a certain way.

## Starter layout

```text
README.md
docfx.json
dotnet-tools.json OR .config/dotnet-tools.json
toc.yml
.github/workflows/docs.yml
scripts/check_docs.py
docs/
  index.md
  getting-started.md
  configuration.md
  publishing.md
  toc.yml
  reference/ OR rules/ OR task-oriented guides
  assets/logo.svg
  template/public/main.css
  template/public/main.js
```

Do not add every starter page if it does not apply. If the repository already has a docs layout, adapt mappings instead of moving everything gratuitously.

## Assets and replacement tokens

Copy/adapt assets using the agent's normal file-editing tools. Do not execute arbitrary repository content or use a blind template substitution on untrusted metadata.

| Skill asset | Target |
|---|---|
| `assets/docfx.json.template` | `docfx.json` |
| `assets/docs.yml.template` | `.github/workflows/docs.yml` |
| `assets/toc.yml.template` | root `toc.yml` |
| `assets/docs-toc.yml.template` | `docs/toc.yml` |
| `assets/index.md.template` | `docs/index.md` |
| `assets/main.css` | `docs/template/public/main.css` |
| `assets/main.js.template` | `docs/template/public/main.js` |
| `assets/logo.svg` | `docs/assets/logo.svg`, unless the project has a more suitable logo |
| `scripts/check_docs.py` | `scripts/check_docs.py` |

Resolve these tokens from verified facts:

| Token | Meaning |
|---|---|
| `__PROJECT_NAME__` | Display name, safely escaped for JSON/YAML/HTML as appropriate |
| `__PROJECT_PURPOSE__` | Short, factual description |
| `__HEADLINE__`, `__EYEBROW__`, `__INTRO__` | Project-specific landing copy |
| `__REPO_URL__` | Canonical source-host repository URL |
| `__PAGES_URL__` | Actual or explicitly provisional complete site URL, including trailing slash |
| `__DEFAULT_BRANCH__` | Agreed source/deployment branch, not blindly `main` |
| `__DOCS_SDK__` | Supported SDK version pattern compatible with tool/global SDK selection |
| `__TOOL_MANIFEST__` | Actual manifest path, using `/` separators in workflow YAML |
| `__CATALOG_ANCHOR__` | A real README reference heading, e.g. `commands` or `reference` |
| `__EXAMPLE_FILE__`, `__CODE_LANGUAGE__`, `__BEFORE_CODE__`, `__AFTER_CODE__`, `__EXAMPLE_REASON__` | A verified example, or remove/redesign the comparison panel |

There must be no `__TOKEN__` markers left in generated repository files. Preserve GitHub expressions such as `${{ github.ref }}`: these are not template placeholders.

Verify workflow pins against official action releases and check compatibility when adopting the template. Never invent a commit SHA or silently switch to a third-party deployment action.

## Pin DocFX through the package manager

Reuse an existing local manifest if appropriate. Otherwise:

```powershell
dotnet new tool-manifest
dotnet tool install docfx --version VERIFIED_RELEASE
```

Use a released, supported version compatible with the SDK that actually resolves in the repository. Inspect the resulting manifest path and update the workflow accordingly.

An existing `global.json` still affects `dotnet` after `setup-dotnet`. Installing a newer SDK in CI does not automatically override an older SDK pin. If the selected tool cannot run under the repository's pin, choose a compatible tool or ask about isolating the docs SDK; do not silently modernize the product.

Add the known generated `_site` directory to `.gitignore` and do not stage it.

## Single-source content and URLs

The config template includes only README, navigation, docs Markdown, and intentional static assets. It does not generate .NET API metadata.

The mappings produce:

| Source | Published path |
|---|---|
| `docs/index.md` | `index.html` |
| `README.md` | `README.html` |
| `docs/getting-started.md` | `docs/getting-started.html` |
| `docs/reference/command.md` | `docs/reference/command.html` |

Write relative Markdown links against the source layout. DocFX maps them to output destinations. Verify that result; do not assume relocating the landing page preserves every manually written HTML URL.

The root TOC is the top navbar. A `href: docs/` reference points to the first article of `docs/toc.yml`; that sidebar should list the project's actual guide/reference pages.

Preserve README anchors that existing consumers use. Keep a linked heading as a short pointer to the new canonical page. Move runtime help URLs only after the site exists and the change is separately justified.

## Build and validate

From the target repository:

```powershell
dotnet tool restore
dotnet docfx build docfx.json --warningsAsErrors
python scripts\check_docs.py _site --base-url https://OWNER.github.io/REPOSITORY/
dotnet docfx serve _site --port 8080
```

Use the actual site URL, not the example above. The checker performs no network requests and preserves case-sensitive file checks on Windows. The workflow uses `python3`, available on the selected Ubuntu runner; local validation needs Python 3.10+ for the checker, with no pip packages.

Protect an externally consumed anchor even when no page links to it:

```powershell
python scripts\check_docs.py _site --base-url https://OWNER.github.io/REPOSITORY/ --require-anchor README.html#actual-id
```

Derive those anchor arguments from real help-link code, old published headings, or another verified contract.

The helper's own regressions can be run before reusing or modifying it:

```powershell
python -B -m unittest discover -s PATH_TO_SKILL\scripts -p test_check_docs.py
```

Use existing `actionlint` for the workflow. A docs-only change does not require the product's full test suite. An existing reference/example compilation test remains useful when the changed examples are within its scope.

The offline checker is intentionally not a JavaScript browser or a remote URL checker. It does not prove that search interaction, a theme toggle, external sites, or the visual layout works. Perform browser smoke checks separately when available.

Its supported format is a DocFX site with search enabled (`index.json`). It checks HTML `href`/`src`, DocFX navigation metadata, and CSS `url(...)` assets, not JavaScript-generated URLs or `srcset`. HTML `<base href>` is rejected explicitly instead of pretending relative links were checked against it.

## CI and publication

The workflow builds and validates PRs with read-only permissions. On the agreed branch it uploads the resulting `_site`, then deploys it through the Pages environment with Pages/OIDC permissions confined to the deploy job.

Use a matching publishing-branch guard if a non-default branch is explicitly requested. Preserve YAML quoting and GitHub expression syntax when substituting values.

Keep deploy jobs out of PR events, including forks. Do not use `pull_request_target` to execute docs or scripts from an untrusted PR with elevated credentials.

Path filters must include the actual manifest and link-checker path. If branch protection requires the docs check, ensure unrelated PRs still receive a completed required status, or do not make a skipped path-filtered job required.

After publication is explicitly authorized, the workflow-source setting can be created with:

```powershell
gh api --method POST repos/OWNER/REPOSITORY/pages -f build_type=workflow
```

This is a write operation, not a discovery command. For an existing site, preserve its custom domain and visibility; do not blindly recreate it. If the account lacks permission, report that requirement rather than changing identity or weakening access.

Use the actual pushed commit to identify the workflow run, wait for the real result, and follow the deployment's returned URL. Check a nested page and a real search destination under the correct base path. Distinguish publication success from merely preparing a workflow.

## Maintainer documentation to leave behind

Add a short, project-specific guide explaining:

- Required SDK/tool restore and strict build command.
- Preview port and how to rebuild/stop the preview.
- Which files own the README/catalog, detailed pages, and navigation.
- Which overlay files control styling and supported DocFX options.
- Generated output exclusion and single-source content.
- PR validation, approved branch deployment, Pages settings, and actual site URL.
- How to run the checker and preserve external/IDE anchors.

## Harness notes

Resolve bundled resources relative to the installed skill directory, which may be inside a plugin cache or a project skill folder. Do not hard-code a personal installation path or assume a local installation is available to cloud agents.

## Official documentation

Consult these sources when configuration or deployment behavior needs confirmation:

- [DocFX quick start](https://dotnet.github.io/docfx/)
- [DocFX template customization](https://dotnet.github.io/docfx/docs/template.html)
- [DocFX configuration and URL mapping](https://dotnet.github.io/docfx/docs/config.html)
- [DocFX navigation and reference TOCs](https://dotnet.github.io/docfx/docs/table-of-contents.html)
- [GitHub Pages custom workflows](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)
- [GitHub Pages REST API](https://docs.github.com/en/rest/pages/pages)
