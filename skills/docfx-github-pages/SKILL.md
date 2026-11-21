---
name: docfx-github-pages
description: Creates and maintains DocFX documentation sites for GitHub Pages, including content structure, modern theming, strict builds, and offline link validation. Use when setting up DocFX, customizing a DocFX site, or adding CI and Pages deployment for DocFX documentation. Not for routine README edits or sites using another generator.
license: MIT
compatibility: DocFX builds require a compatible .NET SDK; the offline checker requires Python 3.10+.
---

# Repository documentation with DocFX and GitHub Pages

Document the target repository's verified behavior. Create or maintain its DocFX site within the requested scope.

Content-only changes do not require a new theme, tooling, CI, or deployment. For site setup, implement and verify locally. Do not commit, push, change repository settings, or publish unless the user authorizes those actions. A skill invocation does not grant those permissions.

## Resources

Load only the resources needed for the current phase:

- [Implementation blueprint](references/implementation.md): layout, placeholder meanings, commands, CI integration, publishing, and official documentation.
- [DocFX configuration](assets/docfx.json.template).
- [Pages workflow](assets/docs.yml.template), including an offline link check.
- [Top navigation](assets/toc.yml.template) and [documentation sidebar](assets/docs-toc.yml.template).
- [Landing page](assets/index.md.template), [CSS overlay](assets/main.css), [DocFX options](assets/main.js.template), and [neutral logo](assets/logo.svg).
- [Offline checker](scripts/check_docs.py) and [its regression tests](scripts/test_check_docs.py).

Resolve these resources relative to this skill's installed directory, not the current repository. When adding the checker to a target repository, copy it to `scripts/check_docs.py`; keep workflow commands and path filters aligned if adapting that location.

Templates are starting points, not ready-to-publish content. Replace every `__TOKEN__`, adapt page names and branding, and remove inapplicable starter sections. Never publish placeholder examples.

## 1. Discover the repository before writing

Read repository guidance, the working-tree status, README, existing docs, manifests, solution/project files, and workflows. Identify:

- The audience and the first task a new user should accomplish.
- Actual installation/distribution status, supported versions, configuration, and examples.
- Existing documentation tooling and publishing. Improve an existing site rather than silently replacing its generator.
- Current branch, writable remote, default/intended publishing branch, and any uncommitted changes. Preserve others' work.
- SDK selection, including `global.json`, and available local tools.

Do not fabricate a NuGet package, installation command, feature, code fix, support promise, or compatibility claim. If a project is source-only, say so and provide verified source-based instructions.

For GitHub, resolve the remote to the API's canonical `full_name` and `html_url`; aliases can continue working after a rename. Read Pages settings when available. Derive the site URL from the API, not the checkout directory or a stale remote name.

If Pages is not enabled, use the canonical repository identity to prepare the expected URL, but label it unverified until publishing. Preserve existing custom domains, deployment environments, and visibility. Do not publish private repository content publicly without an explicit user decision.

Ask only about decisions that materially change the approach or cannot be established from the repository. State assumptions otherwise.

## 2. Preserve scope and existing tooling

- For content-only requests, change the relevant pages and navigation, then validate with existing tooling.
- For a new DocFX site, use the modern template with a small overlay.
- Preserve an existing theme, layout, and publishing setup unless the request requires changing them.
- Keep another generator unless a migration is explicitly requested; do not force DocFX.

## 3. Make the content clear first

Keep the README as an approachable entry point, with a concise project purpose, real getting-started link, useful reference/catalog, and contributor entry points.

Move detail to canonical Markdown pages under the existing documentation directory:

- Getting started: prerequisites, a verified first action, expected result, and distribution limitations.
- Task/concept guides: organize around what users need to do, not internal classes.
- Configuration: defaults versus opt-in behavior, scope, examples, and failure cases.
- Reference: one page per rule, command, or public feature when it merits a page.
- Troubleshooting and intentional exceptions where the project actually needs them.

Keep detailed content in one place. A single README catalog can also be published by DocFX; do not manually maintain a second full catalog. Avoid empty boilerplate pages.

Before moving text, identify links used by IDEs, packages, external docs, and older READMEs. Preserve stable headings/anchors as short links to the new canonical pages. Do not change runtime help-link code merely to launch a docs site.

## 4. Implement a reproducible site

Use the implementation blueprint and assets, adapting to existing paths and conventions.

1. Select a released DocFX version compatible with the repository's SDK, and pin it in a local tool manifest using `dotnet` tooling.
2. Observe where the SDK creates the manifest: root `dotnet-tools.json` and `.config/dotnet-tools.json` are both encountered. Reference the actual path in CI.
3. Keep the docs SDK compatible with `global.json`. Do not upgrade the product's SDK to solve a docs-only problem without discussing that tradeoff.
4. Add a focused `docfx.json`, navigation, and ignored generated output. Include source Markdown explicitly; do not expose the whole repository as site resources.
5. Add the theme overlay, not a fork of DocFX's master layout.
6. Preserve relative Markdown links. Use source-host URLs for code/project files that will not be published.

The starter maps `docs/index.md` to the site root while keeping other docs at `docs/*.html`, and publishes the README as `README.html`. Check the generated destinations after adapting this mapping.

Generate API metadata only when public API reference is part of the requested documentation; do not expose implementation classes by default.

## 5. Customize without a frontend maintenance burden

Adapt the bundled CSS and landing page to the project's name, audience, tone, and established brand. Treat the starter's palette and layout as optional defaults.

- Use factual, project-specific copy and a real example. Remove the comparison panel if no meaningful before/after example exists.
- Keep DocFX's built-in search, highlighting, copy buttons, side navigation, and theme support.
- Check light and dark colors, code readability, focus indicators, mobile wrapping, and table overflow.
- Prefer local assets. Do not add analytics, external fonts, or third-party scripts by default.
- Do not add custom JavaScript where supported metadata or CSS suffices.

Use available browser tooling to inspect the result. If screenshots or browser tests are unavailable, say what was and was not checked; a successful HTML build is not visual or accessibility verification. Respect tool refusals rather than bypassing them.

## 6. Add focused CI

Adapt the workflow template to the real branch, manifest, SDK, paths, and existing CI:

- Pull requests restore the pinned tool, build with `--warningsAsErrors`, and check generated local links offline.
- The offline checker validates file casing, HTML fragments, CSS assets, the repository URL prefix, and DocFX search-index destinations. It requires only Python's standard library.
- For anchors with external consumers, add `--require-anchor README.html#actual-id` assertions or equivalent project tests. Derive IDs from the repository's existing links and published headings.
- Keep external URL checks separate or scheduled: third-party outages should not block ordinary docs PRs.
- Use official Pages actions with verified immutable commit pins. Check compatibility and current releases when adopting the template.
- Give PR builds read-only contents access. Grant `pages: write` and `id-token: write` only to the deploy job.
- Deploy only the intended branch, after a successful build, through the Pages environment. Do not run deployment on pull requests or commit generated HTML to a publication branch.
- Watch the checker, manifest, templates, navigation, and workflow in the path filters too.

If no product build/test CI exists, call that out separately; do not make a docs-only change silently redesign the product pipeline. Require docs checks in branch rules only when the user requests it, and avoid a path-filtered required check that stays pending on unrelated PRs.

Add browser/accessibility CI only when appropriate: a small smoke test can cover search navigation, mobile layout, keyboard focus, and light/dark mode. Do not add a large browser matrix or brittle pixel snapshots by default.

## 7. Verify the exact outcome

Run the smallest checks that cover the work:

1. The DocFX build with warnings as errors.
2. The offline checker against the generated site with the real Pages base URL, plus any required compatibility anchors.
3. Workflow linting with an existing `actionlint`, when available.
4. Browser smoke tests when supported: open the landing and a nested page, search for a real item, follow a result, and inspect navigation and narrow-screen layout.

DocFX search results may open a new tab; checking the original tab can falsely suggest navigation failed. Verify the result URL or destination tab and visible article.

Documentation-only edits do not automatically require product compilation/tests. Run them if you change product code or a real docs snippet/build test depends on them. Do not run code builds for purely editorial changes without a reason.

Do not install tooling speculatively: add the required manifest first, or establish that a needed dependency is missing. Keep temporary preview servers scoped to the check and stop them afterward unless an ongoing preview is requested.

## 8. Publish only within the authorized scope

If the user asked only for local changes, leave a reviewable diff with verified preview/build instructions.

If publication is requested:

1. Confirm the intended remote, branch, site visibility, and permissions for any Git/settings changes not already authorized.
2. If unrelated changes are mixed with the docs, stage narrowly. Ask before including prerequisite code changes. Never stash, reset, rebase, or overwrite work merely to simplify publishing.
3. Enable the repository's Pages workflow source only when authorized; never overwrite an existing domain or visibility policy.
4. Use the user's Git conventions. Do not create a branch, commit, push, or PR unless requested or required by applicable standing instructions. Do not add an unsolicited co-author.
5. Watch the actual build/deploy run and check its result. A successful push is not a successful deployment.
6. Fetch the deployed URL and representative nested pages, assets, search index, and compatibility anchors. Allow bounded first-deployment propagation retries; surface persistent failures.

Only describe the site as live after a successful deployment and HTTP verification. Otherwise report precisely what is ready and what is blocked.

## Completion

For scoped updates, leave only the requested content or configuration changes. For site setup, leave:

- Accurate, single-source Markdown and working navigation.
- A maintainable, project-specific theme and pinned docs tooling.
- CI that validates the generated output before authorized deployment.
- A short `docs/publishing.md` (or repository equivalent) explaining build, preview, source ownership, styling, and publishing.
- Existing contributor guidance updated only where this documentation workflow changes it.
- No placeholder tokens, generated HTML in Git, unintended code changes, or unrequested publication.

Summarize what changed and the verified live URL when applicable. Distinguish checks actually run from recommendations.
