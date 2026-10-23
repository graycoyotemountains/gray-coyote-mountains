# Gray Coyote Mountains 🐺

A browser adventure with **10 mountain levels, 3 secret worlds, treasure chests, and a coyote invasion**.

**Play:** https://graycoyotemountains.github.io/gray-coyote-mountains/

## Illustrated Mountain Map (v1.1.0)

- The Adventure level-selection screen is a single illustrated, interactive
  mountain panorama based on the original drawing. Select labeled mountain
  peaks to open the same existing levels and preserve unlocks.
- On iPhone or narrow screens, swipe sideways within the panorama to reach
  later mountains. The page itself does not need to scroll sideways.
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
- **🪂 Whispering Woods paraglider:** find the glider to travel two squares per direction when the route is clear.
- **📻 Phantom Crater radio:** find the radio, call a ranger once, and regain SHOUT. The ranger follows one square behind, swaps locations if the player steps onto it, and automatically keeps coyotes more than five squares away. Ranger protection continues through the next map.
- **🚪 Secret door loop:** each secret world has a randomly positioned reachable door, hidden until approached. Hollow → Whispering → Phantom → Hollow. Discovery also unlocks the next secret map.
- **🏘️ Bonus village:** collecting all fifty facts unlocks the Lunch Snatch Village. Villagers help the coyotes steal your lunch and relocate the flag every five player turns. The village victory also persists.
- **🌍 Lifetime counters:** the home screen supports worldwide unique-browser count and total level-start count, including retries and Challenge runs. The static GitHub Pages site needs the separate Cloudflare Worker/D1 stats endpoint to supply truthful shared totals. Until connected, the interface explicitly says so. See [stats-backend instructions](stats-backend/README.md). Historical visits from before installation cannot be backfilled; anonymous IDs approximate unique players, not human identity.

All existing Adventure, Challenge, coyote-reset, secret discovery, treasure and audio save keys remain compatible. Older saves are migrated to the new cumulative Adventure-win counter without erasing progress or reset history. The game includes additional Playwright coverage for the new expansion. The publishing workflow tests Desktop Chrome, iPad Safari and iPhone Safari before deploying to GitHub Pages.
