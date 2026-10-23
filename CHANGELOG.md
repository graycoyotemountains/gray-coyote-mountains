# Changelog

All notable changes to Gray Coyote Mountains are recorded here. This is a
human-readable release log; Git commit history is the authoritative version
history and enables rollback of individual changes.

## [1.2.0] - 2026-10-23

### Changed
- Replaced the horizontally scrolling level-selection panorama with a portrait,
  hand-illustrated mountain trail that scales to narrow iPhone screens without
  requiring sideways scrolling.
- Arranged regular Mountains 1–10 from top to bottom in progression order,
  with the three secret entrances alongside their originating mountains and
  the optional 50-fact bonus village at the trail's end.
- Added a "Latest unlocked" shortcut for returning players and preserved the
  previous map position when returning from a game.
- Kept native accessible level-selection buttons, progress, replay, Challenge
  Mode, all secret mechanics, treasure inventory, and the 18x14 gameplay grid.
- Extended automated Chrome and WebKit regression coverage to assert no
  horizontal overflow, vertical scrolling, and late-level access.

### Rollback
- Stable pre-release snapshot: `backup/pre-vertical-map-2026-10-23`
  (commit `59924086782f6d9a1c9ab08d715d1bf563df334e`).
- Revert this release's merge commit through GitHub if necessary. The existing
  test-and-publish workflow redeploys the reverted version after passing tests.
- No saved-progress localStorage keys or formats were changed.

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
