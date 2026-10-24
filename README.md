# Gray Coyote Mountains 🐺

A browser adventure with **10 mountain levels, 3 secret worlds, treasure chests, and a coyote invasion**.

**Play:** https://graycoyotemountains.github.io/gray-coyote-mountains/

## Six coyote-family mountains (v1.7.0)

Open **🐺 Play as the Coyote** on the home screen to choose a mountain on
an **illustrated Baylands shoreline map**. Follow the six trail stops from
top to bottom, with only vertical scrolling on narrow iPhone screens.
Complete each mountain to unlock the next. Your coyote wins, cleared mountains
and available mountains remain saved in this browser.

- 🌾 Baylands Trail: your original coyote rescue route.
- 🦆 Salt Marsh Lookout: reeds, tidal water and a reversed trail.
- 💧 Stevens Creek Pass: rock and creekside trees.
- 🌿 Coyote Grasslands: denser grass cover and more visitors.
- 🌳 Sycamore Ridge: crowded woodland paths.
- ⛰️ Shoreline Summit: the final rocky mountain.

The objective never changes: **reach your den without frightening either cub**.
Each mountain has a safe path; use keyboard arrows or the touch buttons.
Use YIP carefully to encourage people to move away when cubs are safely
outside the bark's range. No other game modes are affected.

## Play as the Coyote 🐺

Select **🐺 Play as the Coyote** from the home screen to explore a separate
Shoreline adventure as the coyote. Reach your 🕳️ den while your two 🐾 cubs
follow you. The cubs must **stay calm** throughout the trip.

- Cubs follow at half your movement pace. Avoid bringing them next to park
  visitors and rangers, or they get frightened and that run ends.
- Rangers and park visitors **move**, just like coyotes in Adventure Mode.
  They patrol one square at a time every two or three player moves, approach
  your coyote when nearby, and stay clear of trees, rocks, reeds and water.
- Your **YIP** makes humans within four squares retreat for several patrol
  turns instead of disappearing. Barking within two squares of a cub
  frightens the cub and ends your run. You do **not** have to scare anyone to win.
- You have **2 minutes 30 seconds** to reach the den. Arrow keys / WASD or
  touch buttons move one square at a time. The mode has its own victory counter.
- Adventure, challenge trophies, collected facts, secret levels, treasure,
  and existing progress are unaffected.

This is playful fiction. Real coyotes generally avoid people; never approach
or feed wild coyotes.


## Paraglider, village and search discoverability (v1.3.0)

- The paraglider now moves one square per direction and can land on tree and
  rock obstacles; coyotes still cannot cross those squares.
- The bonus village uses gray pavement and single-square 🏠 houses, in place
  of tree and rock obstacle artwork.
- Search-facing page metadata, a published [sitemap](sitemap.xml), and an IndexNow notification on each deployment make the
  game easier for search engines to discover. To request Google indexing,
  verify the game URL-prefix property in Google Search Console and submit
  `https://graycoyotemountains.github.io/gray-coyote-mountains/sitemap.xml`.
  Indexing and search-result placement are controlled by search engines.

## Illustrated Mountain Map (v1.2.0)

- The Adventure level-selection screen is a portrait illustrated trail inspired
  by the original mountain drawing. The ten mountain buttons wind from Level 1
  at the top to Level 10 below, with optional secret levels and bonus village.
- On iPhone and other narrow screens, scroll vertically to reach later mountains.
  There is no sideways map or page scrolling. "Latest unlocked" jumps to the
  farthest available main mountain, and returning to the map preserves position.
- Challenge Mode retains its original level cards. The gameplay board,
  controls, timer, collectible effects, audio and saved-progress keys are
  unchanged by this visual update.
- Automated tests cover desktop Chrome, iPad Safari and iPhone Safari.

**Versions and rollback:** See [CHANGELOG.md](CHANGELOG.md), the repository's
[commit history](https://github.com/graycoyotemountains/gray-coyote-mountains/commits/main)
and [GitHub Actions](https://github.com/graycoyotemountains/gray-coyote-mountains/actions).


## Challenge Mode 🔥

From the home screen, select **Challenge Mode** to choose **any of the 13 levels**, including all secret worlds, even before unlocking them in Adventure. Every challenge has:

- A strict **one-minute countdown** instead of the usual three minutes.
- Exactly **15 coyotes** patrolling the map.
- The 🏁 flag moved inside the board, surrounded on **three of its four sides** by immovable 🧑‍🌾 villagers. The remaining entrance is always reachable from the trailhead.
- Independent Challenge trophies saved on the device. You can retry or pick another challenge after winning or losing.

Challenge runs have **no treasure chests or secret-door shortcuts** and **never unlock Adventure mountains, secret worlds, or change your Adventure treasure**. The original campaign remains unchanged.

## What's new

- **Three-minute countdown** on every level. At zero, a pack of **25 coyotes invades** the board with sound and a red warning, ending that attempt. Retry for a new three minutes. Progress stays saved.
- **Three randomized 🧰 chests** on every regular level, with new reachable positions each attempt. No treasure chests on secret levels. Walk over chests to collect:
  - ⌛ **Time Crystal:** 20 extra seconds (up to 3 minutes)
  - 🍓 **Heart Berry:** recover one heart (maximum 3)
  - 🔔 **Coyote Bell:** frighten coyotes and recharge SHOUT
  - 🌰 **Golden Acorn:** collectible treasure
- **Secret portals** on Mountain 5 (The Hollow Mountain 💎), Mountain 7 (The Whispering Woods 🦉), and Mountain 9 (The Phantom Crater 👻). Each reveals itself when you approach. Discovered levels stay available on the map.
- **Hollow Mountain's secret trail to Skyfire Summit** remains available after clearing Hollow. It skips Mountain 6–9 without marking them complete.

## Coyote Reset 🐺

Tap **🐺 Reset Coyotes** from the home screen, Mountain Map, or while playing a regular Adventure level to bring the growing coyote pack **back to one**. The new count applies immediately to an active level, including retries, and is saved across browser reloads. Every successful Adventure completion adds exactly one coyote, including replays and secret levels. The population is saved across reloads, and winning again after a reset begins growing the pack from one. **Unlocked mountains, secrets, treasures, hearts, time remaining, and completed levels are not erased.** During a time-out invasion, reset applies to the next attempt instead of cancelling the invasion. Challenge Mode always has 15 coyotes and is unaffected.

## Controls and saves

Phones and tablets: touch arrows. Computer: arrow keys/WASD. SHOUT button or Space plays a human voice and scares nearby coyotes. Sound can be muted. Completed mountains, secret discoveries, and collected treasure are saved in the browser.

Spooky ambience plays throughout all secret worlds. Existing progress keys are preserved for players upgrading from earlier versions.

## Sound attribution

The human voice asset `assets/human-shout.wav` is derived from HaelDB's [Male Grunt/Yelling sounds on OpenGameArt](https://opengameart.org/content/male-grunt-yelling-sounds) under CC0, retrieved through the [ai-safety-doom audio collection](https://github.com/transitive-bullshit/ai-safety-doom/blob/main/public/game/audio/README.md).

## Development

GitHub Actions runs browser tests in Desktop Chrome, iPad Safari and iPhone Safari, then publishes to Pages. To run locally: `npm install`, `npx playwright install chromium webkit`, and `npm test`.

## Audio upgrade

When a coyote catches you, the game plays `assets/human-munch.wav`, a short **real human eating recording**, rather than electronic chewing. The recording is from [User391915396's *Eating sound effect*](https://freesound.org/people/User391915396/sounds/570336/), distributed as **CC0**, obtained from the CC0 [WilhelmSFX sound bank](https://github.com/Wh1teDuke/WilhelmSFX). Spooky door sounds and the continuing ambience in all secret worlds have also been increased in volume. Sound toggle, tab-switch pausing, and mobile support remain intact.

## October 2026 expansion: Field Guide, Secret Tools and Village

- **📖 Fifty science-based coyote facts.** On every mountain, one of the three random chests contains a fact. Every secret world has one fact chest alongside its special item and secret door. Facts are drawn without repeats until all fifty are found. The Field Guide shows locked and discovered entries; its progress saves in localStorage.
- **🚲 Hollow Mountain bicycle:** find the bicycle, switch to a riding icon, and replace shout with a bike bell that recharges after three movement steps. Take it into the next level.
- **🪂 Whispering Woods paraglider:** find the glider to move one square at a time, including onto tree and rock obstacles.
- **📻 Phantom Crater radio:** find the radio, call a ranger once, and regain SHOUT. The ranger follows one square behind, swaps locations if the player steps onto it, and automatically keeps coyotes more than five squares away. Ranger protection continues through the next map.
- **🚪 Secret door loop:** each secret world has a randomly positioned reachable door, hidden until approached. Hollow → Whispering → Phantom → Hollow. Discovery also unlocks the next secret map.
- **🏘️ Bonus village:** collecting all fifty facts unlocks the Lunch Snatch Village. Villagers help the coyotes steal your lunch and relocate the flag every five player turns. The village victory also persists.
- **🌍 Lifetime counters:** the home screen supports worldwide unique-browser count and total level-start count, including retries and Challenge runs. The static GitHub Pages site needs the separate Cloudflare Worker/D1 stats endpoint to supply truthful shared totals. Until connected, the interface explicitly says so. See [stats-backend instructions](stats-backend/README.md). Historical visits from before installation cannot be backfilled; anonymous IDs approximate unique players, not human identity.

All existing Adventure, Challenge, coyote-reset, secret discovery, treasure and audio save keys remain compatible. Older saves are migrated to the new cumulative Adventure-win counter without erasing progress or reset history. The game includes additional Playwright coverage for the new expansion. The publishing workflow tests Desktop Chrome, iPad Safari and iPhone Safari before deploying to GitHub Pages.

## Paraglider duration (v1.7.0)

The 🪂 paraglider found in the hidden secret level remains equipped for that
secret level **and the next level you enter** (including through a secret door).
It allows one-square movement over and onto obstacle squares. It expires when
you enter another different level afterward. Your carried equipment is saved
in the browser and retained through a reload.

## Branching Secret Expeditions (v1.8.0)

Five more Adventure levels appear in the **🌟 Secret Expeditions** section
of the regular Mountain Map. They stay locked until you win their source
secret levels:

- **The Hollow Mountain:** 🦆 Mistveil Lagoon and 🌿 Echo Fern Forest.
- **The Whispering Woods:** 🧊 Crystal Icefall and 🦇 Moonshadow Caverns.
- **The Phantom Crater:** 🌠 Starfall Observatory.

Each new mountain is a complete 18 × 14 level with its own terrain, flag,
coyotes, three treasure chests (including a collectible fact), and a
branching secret door. Previously completed secret worlds also qualify.

When you step onto a secret door, a destination picker opens. Choose an
**unlocked bonus expedition** or **a different existing secret world**. Your
original secret chain (Hollow → Whispering Woods → Phantom Crater → Hollow)
is still accessible as the alternate door route. If the bonus route is
locked, reach the secret level's flag to unlock it, then retry the door.
The five new levels, their wins and their unlocks are saved locally in
this browser, independently of Coyote Mode and the existing Adventure
progress keys. The new section scrolls vertically on phones.
