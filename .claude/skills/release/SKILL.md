---
name: release
description: Prepare a versioned release of the agent-loadout plugin by bumping the version in plugin.json, regenerating harness manifests, updating CHANGELOG.md, and tagging. Use when asked to cut, prepare, or publish a release, or to bump the plugin version.
---

# Release agent-loadout

Harnesses read the version from the generated manifests, so every release must
go through `plugin.json`.

## Steps

1. Make sure the working tree is clean and up to date with `main`.
2. Read the Conventional Commits since the last tag:

   ```sh
   git log --oneline "$(git describe --tags --abbrev=0 2>/dev/null || git rev-list --max-parents=0 HEAD)"..HEAD
   ```

3. Pick the SemVer bump:
   - any `!` or `BREAKING CHANGE:` footer means **major**. While the version is
     below 1.0.0, use minor instead;
   - any `feat` means **minor**;
   - otherwise **patch**.

   Treat removing or renaming a shipped skill as a breaking change.
4. Set `version` in `plugin.json`, then run `npm run generate`.
5. In `CHANGELOG.md`, move the `Unreleased` entries under a new
   `## [X.Y.Z] - YYYY-MM-DD` heading, grouped as Added, Changed, Fixed, Removed.
   Leave an empty `Unreleased` section.
6. Run `npm run check`.
7. Commit with `chore(release): vX.Y.Z` and open a pull request.
8. After it merges, tag the merge commit and create the GitHub release:

   ```sh
   git tag vX.Y.Z <merge-sha>
   git push origin vX.Y.Z
   gh release create vX.Y.Z --title vX.Y.Z --notes-from-tag
   ```

   Ask before pushing tags or creating releases.
