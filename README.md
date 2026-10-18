# Gray Coyote Mountains 🐺

**Play:** https://graycoyotemountains.github.io/gray-coyote-mountains/

An adventure across **10 mountains, 3 hidden secret worlds, random treasure chests, and a coyote invasion**.

## Three-minute race

You have **3 minutes** on every mountain. The timer pauses when leaving the game screen or switching apps. At 30 seconds there is an urgent warning. If time hits zero, **25 coyotes invade**, the round ends, and you can retry with a fresh three minutes. Existing progress and treasure stay saved.

## Treasure boxes

**Three randomized 🧰 treasure boxes** appear on every regular mountain. Walk onto one to collect:
- **⌛ Time Crystal:** +20 seconds (capped at 3 minutes)
- **🍓 Heart Berry:** restore one heart (maximum 3)
- **🔔 Coyote Bell:** frighten coyotes and reset SHOUT cooldown
- **🌰 Golden Acorn:** collectible treasure

Treasure totals save in the browser across sessions. Chests regenerate in random reachable places on replay. **All secret worlds are treasure-free.**

## Three secret worlds

Hidden portals become visible when you're close. The original **Hollow Mountain** is discovered on Mountain 5, and beating it still unlocks the trail to Skyfire Summit. Two new portals lead to:
- **The Whispering Woods 🦉** through a hidden door on Mountain 7
- **The Phantom Crater 👻** through a hidden door on Mountain 9

Discoveries stay saved, and all three secret levels have continuous spooky ambience. Reach each regular mountain's flag to unlock the next mountain.

## Controls and sound

Use touch arrows, keyboard arrows or WASD to move. Press SHOUT or Space to frighten coyotes with a recording of a human yell. You can mute sound. Winning gives fanfare and confetti.

**Human shout attribution:** Sample `assets/human-shout.wav` is derived from HaelDB's [CC0 male grunt/yelling sounds](https://opengameart.org/content/male-grunt-yelling-sounds), via [ai-safety-doom](https://github.com/transitive-bullshit/ai-safety-doom/blob/main/public/game/audio/README.md).

## Publishing and testing

GitHub Actions runs Playwright tests on desktop Chrome, iPhone Safari, and iPad Safari before publishing to GitHub Pages. To run locally: `npm install`, `npx playwright install chromium webkit`, `npm test`.
