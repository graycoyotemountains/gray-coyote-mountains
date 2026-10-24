# Changelog

All notable changes to Gray Coyote Mountains are recorded here. This is a
human-readable release log; Git commit history is the authoritative version
history and enables rollback of individual changes.

## [1.5.0] - 2026-10-24

### Added
- Six coyote-family mountains with a responsive, illustrated mountain selection
  screen: Baylands Trail, Salt Marsh Lookout, Stevens Creek Pass, Coyote
  Grasslands, Sycamore Ridge and Shoreline Summit.
- Varied habitats, obstacles, visitor placement, starting directions and time
  limits. All levels retain a traversable, cub-safe path to the den.
- Sequential unlocking, completed-mountain indicators, next-mountain
  navigation and persistent coyote-campaign progress.

### Unchanged
- On every mountain, bring the coyote to its den without frightening either cub.
  YIP still moves visitors away but may scare nearby cubs. Scaring people is
  optional and is not a win condition.
- Adventure, Challenge Mode, inventory, coyote counters and their saved data.

### Rollback
- Last v1.4.0 commit: `5847de0102e616b01b95ae15fe0d0c321b3ffbc3`.
  Revert this release merge to restore the single-mountain coyote mode.
- The v1.4.0 lifetime coyote victories continue; new unlocked mountains and
  cleared mountains use separate localStorage keys.

## [1.4.0] - 2026-10-24

### Added
- An independent **Play as the Coyote** bonus mode, selectable from the home screen.
- New objective: guide a coyote to its den while keeping two following cubs calm.
  Cubs follow every two steps and can become frightened near park visitors or
  by a loud YIP within two squares. The run ends if a cub becomes frightened.
- YIP can encourage nearby park visitors and rangers to retreat when the cubs
  are a safe distance away. Scaring people is **optional**, not a victory condition.
- A separate two-and-a-half-minute clock, dedicated 18-by-14 board, mobile
  directional controls, and local coyote-mode victory counter.
- Multi-device regression tests for calm-cub victories, frightened cubs,
  optional visitor retreat, navigation, and phone layout.

### Compatibility and rollback
- Adventure progress, collected facts, secret levels, Challenge Mode and the
  existing game board were not modified.
- Before this release: `ec702b6c994de7bc9de2dd6e25f31aa6e6294c88`.
  Revert the v1.4.0 release merge to restore the prior game.
- The existing v1.3.0 gameplay is also retained on the `main` history.

## [1.3.0] - 2026-10-23

### Changed
- Paraglider movement now travels exactly one square per input and may land on
  trees or rocks, remaining visible. Coyotes and ordinary players still cannot
  enter obstacle squares.
- Village terrain now appears as gray pavement with individually rendered,
  one-square house obstacles. Existing obstacle collision and level topology
  are preserved.
- Added canonical URL, page description, social sharing metadata, and XML
  sitemap and an automated IndexNow notification on publication to help
  participating search engines discover the game.
- Added multi-device automated tests for movement and village rendering.

### Rollback
- Previous stable version: `dd2f89231102b9a4b418fcf7a556191d18d00608`
  (v1.2.0). Revert this release's changes to redeploy the previous build.
- Saved progress formats and localStorage keys were not modified.

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
