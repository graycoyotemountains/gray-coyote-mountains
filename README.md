# Gray Coyote Mountains 🐺

A browser mountain adventure with **ten regular levels and a hidden eleventh level**.

**Play online:** https://graycoyotemountains.github.io/gray-coyote-mountains/

On phones and tablets, use touch arrows. On computers, use arrow keys or WASD. SHOUT (Space) frightens nearby coyotes. Progress is saved in your browser.

## Level rules

- Reach the 🏁 flag in each mountain to unlock the next regular mountain. In particular, **the flag on Mountain 5 unlocks Mountain 6**.
- The secret level is separate: **only walking onto the 🚪 door on Mountain 5 unlocks The Hollow Mountain**. Entering it immediately opens the secret level and saves your discovery. The door randomly relocates to a different reachable square whenever you enter or retry Mountain 5, including across reloads. It is hidden again until you get within three squares, even after you have unlocked the secret level. Discoveries stay saved.
- **Secret trail:** Clearing Hollow Mountain opens a shortcut to **Skyfire Summit** (Mountain 10), visible on the map and via a button after Hollow's flag. It does **not** unlock Mountains 6–9, and finishing Skyfire via the shortcut does not mark the earlier mountains complete.
- **Time limit:** Each mountain, including the secret level, has a **5-minute real-time countdown**. A visible timer and progress bar warn you when only 30 seconds remain. If time reaches zero, the attempt ends and Retry Mountain starts a fresh five minutes. The clock pauses when you leave the game screen or the page is hidden, and stops when you win or lose. Previously cleared mountains remain unlocked.
- Every newly cleared mountain adds a coyote to the entire game, including earlier mountains. You have three hearts per climb.
- **Sound effects:** Coyote calls, crunching when caught, spooky sounds by the secret door, and **continuous haunting wind, low drones and occasional ghostly echoes** throughout Hollow Mountain. The atmosphere stops when you leave, win, lose, switch apps, or mute the game. SHOUT now plays a **real recorded human yell** (with a synthesized fallback if the file fails to load), instead of an electronic fake shout. Victory still brings fanfare and confetti. Sound only starts after user interaction, and your mute preference is saved.

### Human voice recording license
`assets/human-shout.wav` is a recording of an actual male human yelling, derived from HaelDB's [Male Grunt/Yelling sounds on OpenGameArt](https://opengameart.org/content/male-grunt-yelling-sounds). HaelDB provides the recordings under the **Creative Commons CC0 1.0** option. This copy was obtained from the [ai-safety-doom audio assets](https://github.com/transitive-bullshit/ai-safety-doom/blob/main/public/game/audio/README.md), where its source, transformation and license are documented as `player-death.wav`. The source performer is credited voluntarily. The audio is bundled locally, so it does not require third-party servers during play.

- Existing progress from the original five-level game is preserved. Players who already completed Mountain 5 continue at Mountain 6.

## Mountains

1. Amphitheater Ridge
2. Sycamore Crossing
3. Rockfall Pass
4. Moonlit Switchbacks
5. The Gray Sentinel (flag and secret door)
6. Dawnmist Valley
7. Thundercloud Ridge
8. Redwood Crest
9. Sunstone Canyon
10. Skyfire Summit

**Secret:** The Hollow Mountain 💎

## Publishing and tests

The `.github/workflows/game.yml` workflow tests the game using Playwright in desktop Chrome, iPad Safari and iPhone Safari before publishing to GitHub Pages.

If Pages ever needs to be configured, see [Settings → Pages](https://github.com/graycoyotemountains/gray-coyote-mountains/settings/pages) and set Source to GitHub Actions.

Run locally: `npm install`, `npx playwright install chromium webkit`, `npm test`.

The whole game runs from the standalone `index.html` file. No build or server APIs are needed.
