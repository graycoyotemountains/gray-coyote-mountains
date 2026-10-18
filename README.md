# Gray Coyote Mountains 🐺

A browser adventure with five mountains, one hidden sixth level, and an expanding coyote pack.

**Play online:** https://graycoyotemountains.github.io/gray-coyote-mountains/

On phones and tablets, use the touch arrows. On a computer, use arrow keys or WASD. SHOUT (or Space) scares away nearby coyotes. Progress saves in your browser.

## Publishing
The `.github/workflows/game.yml` workflow tests the game in desktop Chrome, iPad Safari, and iPhone Safari, then publishes to GitHub Pages.

If automatic Pages activation fails, go to [Settings → Pages](https://github.com/graycoyotemountains/gray-coyote-mountains/settings/pages), set **Source** to **GitHub Actions**, then rerun the workflow under the Actions tab.

## Features
- Clear a mountain to unlock the next and add one coyote to **every** level.
- Find the secret door in Mountain 5 to enter the sixth level.
- Avoid trees, rocks, and coyotes. You have three hearts.
- When caught, the game says: **The coyote ate your lunch.**
- All game code is in `index.html`; no build step required.

## Local browser tests
`npm install`, `npx playwright install chromium webkit`, then `npm test`.
