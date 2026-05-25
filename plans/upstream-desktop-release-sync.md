# Upstream Desktop Release Sync

## Context

This fork publishes Windows desktop builds from `geekjapan/superset`, while the
upstream repository (`superset-sh/superset`) owns the desktop release cadence.
Manual release work has been:

1. notice a new upstream desktop release,
2. merge upstream into this fork,
3. build the desktop app,
4. publish a GitHub Release with Windows artifacts.

The desired behavior is to keep this fork aligned with upstream desktop release
tags and publish the fork's Windows release automatically when the merge and
build are clean.

## Behavior

Add a scheduled and manually runnable GitHub Actions workflow that:

1. finds the newest non-draft, non-prerelease upstream release whose tag matches
   `desktop-vX.Y.Z`,
2. skips if this fork already has that release tag, or if the legacy stripped
   `vX.Y.Z` release already exists,
3. merges the upstream release tag commit into this fork's `main`,
4. stops without publishing if the merge conflicts,
5. builds the Windows desktop app from the merged commit,
6. creates the same `desktop-vX.Y.Z` tag in this fork only after the build
   succeeds,
7. publishes a non-draft GitHub Release marked as latest with the Windows
   installer, stable installer copy, and update manifest.

Manual dispatch may provide a specific upstream tag for replay/testing. The same
skip and safety rules apply.

## Acceptance Criteria

- A new upstream `desktop-vX.Y.Z` release can be detected without manual input.
- If this fork already published `desktop-vX.Y.Z`, the workflow exits cleanly.
- If this fork already published the previous local legacy tag `vX.Y.Z`, the
  workflow exits cleanly to avoid duplicating an already-published release.
- Merge conflicts fail the workflow before any local tag or release is created.
- Build failures fail the workflow before any local tag or release is created.
- Successful builds publish the same tag as upstream, not a fork-specific branch
  or stripped version tag.
- The existing tag-push desktop release workflow remains usable for manual
  `desktop-v*` releases.

## Risks

- GitHub Actions pushes made with `GITHUB_TOKEN` do not recursively trigger a
  second workflow. The sync workflow therefore builds and publishes in the same
  run rather than relying on the tag-push release workflow.
- If upstream changes desktop artifact expectations, the build job will fail and
  no tag or release will be published.
- This workflow assumes the fork's default release branch is `main`.
