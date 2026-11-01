import { test, expect } from '@playwright/test';

test('Skyfire starts, previews voices, opens its 21-level map, and launches a mission', async ({ page }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/skyfire-squadron/', { waitUntil: 'load' });
  await expect(page.locator('#startBtn')).toBeVisible();
  await expect.poll(() => page.evaluate(() => window.__skyfireReady === true)).toBe(true);

  await page.locator('#voicePreviewBtn').click();
  await expect(page.locator('#voicePreviewInfo')).toContainText('NOW SPEAKING');

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
