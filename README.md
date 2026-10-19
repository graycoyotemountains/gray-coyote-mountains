# Gray Coyote Mountains 🐺

A browser adventure with **10 mountain levels, 3 secret worlds, treasure chests, and a coyote invasion**.

**Play:** https://graycoyotemountains.github.io/gray-coyote-mountains/

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

## Controls and saves

Phones and tablets: touch arrows. Computer: arrow keys/WASD. SHOUT button or Space plays a human voice and scares nearby coyotes. Sound can be muted. Completed mountains, secret discoveries, and collected treasure are saved in the browser.

Spooky ambience plays throughout all secret worlds. Existing progress keys are preserved for players upgrading from earlier versions.

## Sound attribution

The human voice asset `assets/human-shout.wav` is derived from HaelDB's [Male Grunt/Yelling sounds on OpenGameArt](https://opengameart.org/content/male-grunt-yelling-sounds) under CC0, retrieved through the [ai-safety-doom audio collection](https://github.com/transitive-bullshit/ai-safety-doom/blob/main/public/game/audio/README.md).

## Development

GitHub Actions runs browser tests in Desktop Chrome, iPad Safari and iPhone Safari, then publishes to Pages. To run locally: `npm install`, `npx playwright install chromium webkit`, and `npm test`.

## Audio upgrade

When a coyote catches you, the game plays `assets/human-munch.wav`, a short **real human eating recording**, rather than electronic chewing. The recording is from [User391915396's *Eating sound effect*](https://freesound.org/people/User391915396/sounds/570336/), distributed as **CC0**, obtained from the CC0 [WilhelmSFX sound bank](https://github.com/Wh1teDuke/WilhelmSFX). Spooky door sounds and the continuing ambience in all secret worlds have also been increased in volume. Sound toggle, tab-switch pausing, and mobile support remain intact.
