# Gray Coyote Mountains 🐺

A browser adventure with **10 mountain levels, 3 secret worlds, treasure chests, and a coyote invasion**.

**Play:** https://graycoyotemountains.github.io/gray-coyote-mountains/

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
