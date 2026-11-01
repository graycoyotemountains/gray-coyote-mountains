import { test, expect } from '@playwright/test';

test('Skyfire starts, previews voices, opens its 21-level map, and launches a mission', async ({ page }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/skyfire-squadron/', { waitUntil: 'load' });
  await expect(page.locator('#startBtn')).toBeVisible();
  await expect.poll(() => page.evaluate(() => window.__skyfireReady === true)).toBe(true);

  await page.locator('#voicePreviewBtn').click();
  await expect(page.locator('#voiceStudio')).toBeVisible();
  await expect(page.locator('.voiceLine')).toHaveCount(16);

  await page.locator('#startBtn').click();
  await expect(page.locator('#sceneOverlay')).toHaveClass(/show/);
  await page.locator('#skipSceneBtn').click();
  await expect(page.locator('#mapOverlay')).toHaveClass(/show/);
  expect(await page.locator('#levelMap button').count()).toBeGreaterThanOrEqual(21);

  await page.locator('#levelMap button').filter({ hasText: '01' }).first().click();
  await expect(page.locator('#sceneOverlay')).toHaveClass(/show/);
  await page.locator('#skipSceneBtn').click();
  await expect(page.locator('#hud')).toHaveClass(/visible/);
  expect(errors).toEqual([]);
});



test('Voice Studio assigns individual voices and keeps custom choices through missions', async ({ page }) => {
  await page.addInitScript(() => {
    const voices = Array.from({ length: 16 }, (_, i) => ({
      name: 'Cast Voice ' + (i + 1), lang: 'en-US',
      voiceURI: 'test-voice-' + i, localService: true
    }));
    window.__voicePlayed = [];
    const synth = {
      speaking: false, pending: false, paused: false,
      getVoices: () => voices,
      addEventListener() {},
      cancel() { this.speaking = false; },
      resume() { this.paused = false; },
      speak(utterance) {
        this.speaking = true;
        window.__voicePlayed.push({voice: utterance.voice?.name, text: utterance.text});
        utterance.onstart?.();
      }
    };
    Object.defineProperty(window, 'speechSynthesis', {configurable: true, value: synth});
    Object.defineProperty(window, 'SpeechSynthesisUtterance', {
      configurable: true,
      value: class {constructor(text) {this.text = text;}}
    });
  });
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/skyfire-squadron/', {waitUntil: 'load'});
  await page.locator('#voicePreviewBtn').click();
  await expect(page.locator('.voiceLine')).toHaveCount(16);
  const chosen = await page.evaluate(() =>
    window.SkyfireVoices.roster.map(key => window.SkyfireVoices.getAssignment(key).voice));
  expect(new Set(chosen).size).toBe(16);
  await page.locator('.voiceLine select').first().selectOption('test-voice-6');
  expect(await page.evaluate(() => window.SkyfireVoices.getAssignment('FLIGHT COMMAND').voice))
    .toBe('Cast Voice 7');
  await page.locator('.voiceLine button').first().click();
  expect((await page.evaluate(() => window.__voicePlayed)).at(-1).voice).toBe('Cast Voice 7');
  await page.locator('#voicePreviewBtn').click();
  await page.locator('#startBtn').click();
  await expect(page.locator('#sceneOverlay')).toHaveClass(/show/);
  await page.locator('#skipSceneBtn').click();
  await expect(page.locator('#mapOverlay')).toHaveClass(/show/);
  expect(errors).toEqual([]);
});
