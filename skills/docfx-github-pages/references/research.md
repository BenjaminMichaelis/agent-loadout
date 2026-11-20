# Research and lessons

Research snapshot: **2026-11-20**. Repository implementations, action releases, SDK support, and generator roadmaps can change. Recheck primary sources when a decision depends on their current state.

## What prompted this workflow

The goal was clearer documentation for a small Roslyn analyzer project, with a lightweight GitHub Pages site similar in function to [vs-threading's diagnostic reference](https://microsoft.github.io/vs-threading/analyzers/index.html), but a more distinctive appearance.

The most useful change was information architecture, not switching themes: separate onboarding, configuration, shared policies, and per-rule reference pages, while keeping a readable README and existing IDE help anchors.

## What IEvangelist's repositories actually do

These examples demonstrate different stacks, not one universal site generator:

| Repository | Observed implementation | Primary evidence |
|---|---|---|
| IEvangelist/Bueler | Custom HTML documentation alongside a Rust/WASM showcase. Actions builds the showcase, assembles static HTML/SVG/JSON/WASM assets, and publishes them. | [Workflow](https://github.com/IEvangelist/Bueler/blob/main/.github/workflows/deploy.yml), [documentation source](https://github.com/IEvangelist/Bueler/blob/main/examples/showcase/docs.html) |
| IEvangelist/profanity-filter | Custom Astro site with MDX and Tailwind. | [Docs package manifest](https://github.com/IEvangelist/profanity-filter/blob/main/docs/package.json) |
| IEvangelist/azure-cosmos-dotnet-repository | Astro frontend, with DocFX-generated API content, deployed through official Pages actions. | [Astro configuration](https://github.com/IEvangelist/azure-cosmos-dotnet-repository/blob/main/docs/cosmos-repo/astro.config.mjs), [deployment workflow](https://github.com/IEvangelist/azure-cosmos-dotnet-repository/blob/main/.github/workflows/docs-deploy.yml) |
| IEvangelist/blazorators | Published Blazor demo plus a generated search index; not a conventional Markdown docs site. | [Workflow](https://github.com/IEvangelist/blazorators/blob/main/.github/workflows/publish-to-gh-pages.yml) |

The reusable mechanism is **build static files, then deploy them automatically**. Public configuration does not establish how quickly the author creates sites, which private scaffolding he uses, or whether AI tools produced them. Do not claim to know those things.

## Generator tradeoffs

| Choice | Good fit | Cost or limitation |
|---|---|---|
| DocFX, modern template plus overlay | .NET-oriented reference and guides; Markdown without a separate frontend build | Some configuration and SDK/tool compatibility to manage |
| Astro Starlight | A polished docs UI with Markdown/MDX, especially in a frontend-oriented repository | Node/package-manager dependencies and frontend maintenance |
| Jekyll / Just the Docs | Straightforward Markdown-focused documentation | Ruby/Jekyll local setup is less convenient on Windows |
| Plain HTML | A small showcase, landing page, or demo | Navigation, styling, search, and repeated structure become custom maintenance |
| Existing repository generator | Most projects that already have a working docs system | Migration is not automatically worth the disruption |

Primary sources:

- [DocFX quick start and publishing](https://dotnet.github.io/docfx/)
- [DocFX template customization](https://dotnet.github.io/docfx/docs/template.html)
- [DocFX configuration and URL mapping](https://dotnet.github.io/docfx/docs/config.html)
- [DocFX navigation and reference TOCs](https://dotnet.github.io/docfx/docs/table-of-contents.html)
- [vs-threading's real DocFX configuration](https://github.com/microsoft/vs-threading/blob/main/docfx/docfx.json)
- [Starlight getting started](https://starlight.astro.build/getting-started/)
- [Just the Docs](https://just-the-docs.com/)
- [GitHub Pages and Jekyll](https://docs.github.com/en/pages/setting-up-a-github-pages-site-with-jekyll/about-github-pages-and-jekyll)

At the research date, [Material for MkDocs](https://squidfunk.github.io/mkdocs-material/) announced end of life on May 5, 2027 and identified Zensical as its successor. This is a dated observation, not an evergreen ban on MkDocs. Reverify the projects' current support status before making a new recommendation.

## Why DocFX worked here

The reference site uses the modern template and search. Its analyzer pages are Markdown, not a complex application.

For the small analyzer project, generated API metadata would primarily expose implementation classes, not help consumers understand diagnostics. The selected site therefore published Markdown only.

DocFX's supported overlay mechanism handles the distinctive look:

```json
{
  "build": {
    "template": ["default", "modern", "docs/template"]
  }
}
```

`public/main.css` changes presentation, while `public/main.js` provides supported options such as automatic theme selection and header links. There was no need to fork the upstream master template or introduce a Node build.

The starter theme in this skill is an unbranded adaptation of that overlay, not a copy of DocFX's source template. Adapt its accent colors and content instead of carrying the original project's logo or claims into another repository.

## Important implementation lessons

1. **Canonical identity beats directory names.** The checkout and Git remote still used an older repository name. GitHub accepted redirects, but returned a different canonical name and Pages URL. The sitemap and public links had to use the returned identity.
2. **Content cleanup can reveal distribution limits.** Both analyzer/fix projects were non-packable. The guide documented source references instead of inventing a NuGet installation.
3. **A README can remain a reference source.** Publishing it as `README.html` avoids a second manually maintained catalog. Keep old diagnostic headings as links to the canonical rule pages.
4. **Relocated Markdown needs generated-link checks.** `docs/index.md` was mapped to root `index.html`; its relative source links still needed to resolve to the right output URLs.
5. **Root-relative assets can fail only after deployment.** Test the repository prefix, not merely a local root URL.
6. **Tool manifest location varies.** The SDK used for this work created root `dotnet-tools.json`. Do not assume every repository has `.config/dotnet-tools.json`.
7. **Existing source links may not be site content.** Use GitHub URLs for project/source files rather than uploading arbitrary source trees as resources.
8. **Publication is a separate permission boundary.** Content work, prerequisite code commits, site publication, and repository settings were explicitly distinguished.
9. **Shared checkouts can move independently.** Another rename merge advanced remote `main` after the docs push. We verified inclusion instead of pulling, resetting, or rewriting the checkout.
10. **Search opens destinations, sometimes in another tab.** The original tab can remain in search mode even though a result opens correctly. Check the destination rather than declaring a navigation bug.
11. **Screenshot failures are not visual verification.** The native screenshot interface returned no image; successful build, DOM, HTTP, and search checks did not amount to a complete visual/accessibility audit.

## What was verified versus what was recommended

The site build ran with warnings treated as errors, and the actual GitHub build/deployment completed successfully. Checks covered generated and live internal routes/assets, HTML fragments, all six diagnostic reference pages, the search index, preserved README anchors, the redirected IDE help URL, and a real browser search-result destination. The prerequisite diagnostic-ID changes also passed the project's 198 tests.

The original site workflow included the strict DocFX build but **did not yet include** the offline link checker. Adding that checker, project-specific catalog/anchor coverage, and a separate product test workflow were recommendations.

This skill's workflow template promotes the offline checker into CI and includes its own focused regression tests. Browser accessibility and narrow-screen automation remain context-dependent additions, not claims about checks that were already run on the original project.

## Deployment and portable skill references

- [Official GitHub Pages custom workflows](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)
- [GitHub Pages REST API](https://docs.github.com/en/rest/pages/pages)
- [Copilot skill locations and supported surfaces](https://docs.github.com/en/copilot/concepts/customizations/agent-skills)
- [Agent Skills format](https://agentskills.io/specification)

The original implementation used DocFX 2.81.0 on a released .NET 11 SDK. Those are historical verified versions, not minimum requirements for every target repository. Select compatible supported versions when invoking the skill.
