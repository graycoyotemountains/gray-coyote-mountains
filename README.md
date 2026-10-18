# Gray Coyote Mountains 🐺

A browser mountain adventure with **ten regular levels and a hidden eleventh level**.

**Play online:** https://graycoyotemountains.github.io/gray-coyote-mountains/

On phones and tablets, use touch arrows. On computers, use arrow keys or WASD. SHOUT (Space) frightens nearby coyotes. Progress is saved in your browser.

## Level rules

- Reach the 🏁 flag in each mountain to unlock the next regular mountain. In particular, **the flag on Mountain 5 unlocks Mountain 6**.
- The secret level is separate: **only walking onto the 🚪 door on Mountain 5 unlocks The Hollow Mountain**. Entering it immediately opens the secret level and saves your discovery. You can later revisit the secret level from the map.
- **Secret trail:** Clearing Hollow Mountain opens a shortcut to **Skyfire Summit** (Mountain 10), visible on the map and via a button after Hollow's flag. It does **not** unlock Mountains 6–9, and finishing Skyfire via the shortcut does not mark the earlier mountains complete.
- Every newly cleared mountain adds a coyote to the entire game, including earlier mountains. You have three hearts per climb.
- **Sound effects:** Synthetic coyote calls during normal gameplay, crunching when caught, mysterious door chimes, and victory fanfare with falling confetti. Sounds use the Web Audio API and activate after user interaction. Use the Sound toggle to mute; your preference is saved.
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
