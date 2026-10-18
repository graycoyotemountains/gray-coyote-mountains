# Gray Coyote Mountains 🐺

A browser adventure with **10 regular mountains, 3 hidden realms, collectible treasure, and dramatic coyote invasions**.

**Play:** https://graycoyotemountains.github.io/gray-coyote-mountains/

## The adventure

- **🎁 Treasure boxes:** Three boxes appear in random reachable spots on **every regular mountain** each time you enter. The secret realms have **no boxes**. Each box holds a random collectible: **⌛ Time Crystal** (+30 seconds, up to the 3-minute cap), **❤️ Heart Potion** (restores one heart, maximum 3), or **🦴 Coyote Charm** (frightens all coyotes). Your lifetime collection counts are saved.
- **⏱️ Three-minute time limit:** You have **3 minutes per mountain**, including the secret realms. A progress bar and clock display your remaining time, with a warning during the final 30 seconds. The clock pauses if you switch apps or leave the game screen.
- **🐺 Coyote invasion:** At 0:00 the game ends the attempt and floods the mountain with a large coyote pack, accompanied by sound and animation. Hit Retry to get a fresh 3-minute attempt. Your saved progress and treasures are retained.
- **🚪 Three secret realms:** Mountain **5** hides a door to **The Hollow Mountain**; Mountain **7** hides a door to **The Whispering Woods**; Mountain **9** hides a door to **The Eclipse Cavern**. Each hidden entrance leads to its own level. A door changes position with each visit, appears when you get close, and stays unlocked on the map once discovered.
- **🔥 Secret path:** Completing the original Hollow Mountain still opens a shortcut straight to Skyfire Summit without unlocking Mountains 6–9.
- **🔊 Sounds:** Coyotes howl, lunch crunches, secret realms have spooky ambience, SHOUT plays a recorded human yell, and victories produce fanfare and confetti. You can mute the game at any time.

## Controls

On computers: **arrow keys / WASD** to move, **Space** to SHOUT. On phones and tablets: use the on-screen controls. Get to the 🏁 flag to complete a mountain and unlock the next regular level. Trees and rocks are solid obstacles. You have 3 hearts per attempt, and completing levels grows the coyote pack across all levels.

Existing regular progress, saved secret discoveries and the Skyfire shortcut are preserved.

## Recorded voice asset

`assets/human-shout.wav` is a real male human yelling, sourced from [HaelDB's CC0 male yelling recordings](https://opengameart.org/content/male-grunt-yelling-sounds), via the [ai-safety-doom audio assets](https://github.com/transitive-bullshit/ai-safety-doom/blob/main/public/game/audio/README.md), where the derived recording is named `player-death.wav`.

## Testing and deployment

GitHub Actions tests the game in desktop Chrome, iPad Safari and iPhone Safari before publishing it to GitHub Pages. To run tests locally, run `npm install`, `npx playwright install chromium webkit`, and `npm test`. The full game runs from `index.html` and bundled local audio assets.
