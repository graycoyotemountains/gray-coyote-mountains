# Changelog

All notable changes to Gray Coyote Mountains are recorded here. This is a
human-readable release log; Git commit history is the authoritative version
history and enables rollback of individual changes.

## [1.1.0] - 2026-10-22

### Changed
- Replaced the regular Adventure mountain-selection card grid with an illustrated,
  scrollable mountain-range panorama inspired by the original hand-drawn sketch.
- Kept the ten level buttons as real, keyboard-accessible HTML buttons, with the
  same locking, replay, victory, secret-level and saved-progress behavior.
- Added touch-friendly horizontal exploration for narrow screens and retained
  Challenge Mode's existing card picker and the untouched 18-by-14 gameplay grid.
- Added cross-device browser tests for selecting the first and last peaks,
  scrolling the level map, and preserving Challenge Mode.
- Version bumped from 1.0.1 to 1.1.0.

### Rollback
- Known-good pre-redesign `main` commit: `72ad8151f3b20321aab12f49900aff8651f5e5c8`.
- To restore the previous map without rewriting unrelated changes, revert the
  commit or merge that introduced this release using GitHub's **Revert** action,
  then let the test-and-deploy workflow publish the restored site.
- To restore the entire earlier repository state, an authorized maintainer can
  check out the above commit on a rollback branch and deploy it after testing.
- Game progress remains in the user's browser localStorage; no saved progress
  keys or formats were changed by this release.

## [1.0.1] - prior release

- Browser adventure with ten mountains, three secret levels, challenge mode,
  collectibles, coyotes and automated regression tests.
- Earlier incremental changes are available under the repository's Git
  **History** tab; no older curated changelog entries were maintained.
