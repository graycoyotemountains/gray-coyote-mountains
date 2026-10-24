# Changelog

All notable changes to Gray Coyote Mountains are recorded here. This is a
human-readable release log; Git commit history is the authoritative version
history and enables rollback of individual changes.

## [1.8.1] - 2026-10-24

### Changed
- Winning The Hollow Mountain now **automatically** travels along the
  non-optional secret trail to **Mistveil Lagoon** (bonus Expedition 1),
  immediately starting its playable level.
- The victory still saves as completed and awards its Adventure coyote
  growth; Mistveil Lagoon and Echo Fern Forest become unlocked first,
  including when replaying Hollow Mountain.
- Removed the optional "Hollow Mountain → Skyfire Summit" shortcut banner,
  win-screen button, and early Skyfire unlock condition. Skyfire is now
  reached through the ordinary mountain climb.
- Old shortcut save flags are read but no longer unlock Skyfire. Anyone who
  **already won Skyfire** using the previous shortcut can still replay their
  completed mountain without losing that victory.
- Other secret doors retain their optional bonus/secret destination choices;
  Coyote Mode, the paraglider, facts, Challenge and all other paths unchanged.
- Added tests for mandatory entry, old saved victories, absence of Skyfire
  skip, and continued play in Mistveil.

### Rollback
- Stable v1.8.0 commit: `ff9f9222994a6c8fb8327061fa9697bfae067c4f`.
  Reverting this patch restores the earlier optional shortcut.

## [1.8.0] - 2026-10-24

### Added
- Five playable bonus mountains: Mistveil Lagoon, Echo Fern Forest, Crystal
  Icefall, Moonshadow Caverns, and Starfall Observatory (19 Adventure levels
  including the 50-fact village).
- Win The Hollow Mountain to unlock Mistveil Lagoon and Echo Fern Forest;
  win The Whispering Woods to unlock Crystal Icefall and Moonshadow Caverns;
  win The Phantom Crater to unlock Starfall Observatory.
- Existing secret victories unlock their corresponding bonus worlds
  automatically, even for returning players with older save data.
- Secret doors in all three secret worlds and the five new bonus worlds
  now open a destination dialog. Choose an unlocked bonus mountain or an
  alternate existing secret world; the original secret-world chain remains.
- Five new routes live in their own accessible, vertically scrolling
  "Secret Expeditions" section beneath the illustrated Adventure map;
  no overlapping peak markers or horizontal mobile scrolling.
- Each bonus level has distinct terrain and three collectible chests
  including a Coyote Field Guide fact.
- Separate persistent completion/unlock records and tests for branching,
  retroactive unlocks, saved victories, and the existing power-ups.

### Compatibility and rollback
- Main Adventure levels, 50-fact village, original secret tools, paraglider
  carry duration, and Coyote Mode are unchanged.
- Previous stable main: `bbb26f6f5bd9387c32391b48b60d60e3957e8723`.
  Revert the release merge to restore version 1.7.0 without changing the
  existing Adventure progress keys.

## [1.7.0] - 2026-10-24

### Fixed
- Corrected the paraglider power-up carry logic. The glider was mistakenly
  discarded by any level transition, even immediately after collecting it.
- Like the bicycle, the paraglider now persists throughout its origin secret
  level **and one following level**, entered either through a secret door or
  by selecting another unlocked level. It expires on the next different level.
- Preserved the one-square-per-move glider controls and obstacle landing.
  Carry state remains saved across browser reloads.

### Changed
- Replaced Coyote Mode's grid of six separate mountain cards with a continuous,
  hand-illustrated San Francisco Bay/Baylands shoreline level-select map.
  Six large accessible markers follow an illustrated marsh/levee trail,
  top to bottom, without requiring horizontal scrolling on phones.
- Preserved Coyote Mode mountain names, unlocks, victories and saved progress;
  the only change to Coyote Mode is its level-selection presentation.
- Added regression checks for glider persistence and bay map mobile usability.

### Rollback
- The previous release is available at Git commit
  `386b56849f399b1ad95915efb8133907c3503702` (v1.6.0).
  Revert this release's squash-merge to restore it.

## [1.6.0] - 2026-10-24

### Changed
- Park rangers and visitors now move just like coyotes in Adventure Mode:
  one unobstructed grid square per patrol turn, pathfinding toward the
  player within an alert radius, and random wandering outside that radius.
- Humans move every 2 or 3 player steps depending on the mountain, reflecting
  the progression of coyote speeds and alert ranges in regular Adventure.
- A YIP no longer removes people from the board. Nearby humans retreat up
  to two squares immediately, then flee for three patrol turns before
  resuming their normal movement.
- Both cubs must still remain calm; moving people can now get close enough
  to startle them. Adjusted final-mountain visitor placement to avoid
  immediately trapping cubs near the starting square.
- Added automated desktop Chrome, iPhone Safari and iPad Safari tests
  for human pursuit, patrol movement, retreat behavior, and viable routes.

### Compatibility and rollback
- No changes to Adventure/Challenge movement, collectibles, existing
  saved progress, map selection, or Coyote Mode unlocks.
- Previous stable commit: `96d1c7b0de46adcb3cf086f9226a837ad4d1a385`
  (v1.5.0). Revert the release merge to restore stationary humans.

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
