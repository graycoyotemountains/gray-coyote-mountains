import { test, expect } from '@playwright/test';

// Runs on desktop Chrome, iPad Safari and iPhone Safari via playwright.config.mjs.
test('illustrated map keeps ten native level buttons and launches the playable board', async ({ page }) => {
  await page.goto('/');
  await page.locator('#homeScreen button').filter({ hasText: 'Mountain Map' }).click();
  await expect(page.locator('#mapScreen')).toBeVisible();
  await expect(page.locator('#mountainGrid .mountain')).toHaveCount(10);
  await expect(page.locator('#mountainGrid .mountain:disabled')).toHaveCount(9);
  await expect(page.locator('#mapScreen .map-landscape')).toBeVisible();
  const background = await page.locator('#mapScreen .map-landscape').evaluate(el => getComputedStyle(el).backgroundImage);
  expect(background).toContain('mountain-map.svg');
  await expect(page.locator('#mapScreen .map-landscape-viewport')).toHaveAttribute('tabindex', '0');
  await page.locator('#mountainGrid .mountain').first().click();
  await expect(page.locator('#gameScreen')).toBeVisible();
  await expect(page.locator('#field .tile')).toHaveCount(18 * 14);
});

test('far peaks remain accessible without causing page-wide horizontal overflow', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => {
    localStorage.setItem('gray-sentinel-mountain-unlocked-v1', '10');
    localStorage.setItem('gray-sentinel-mountain-cleared-v1', '9');
  });
  await page.reload();
  await page.locator('#homeScreen button').filter({ hasText: 'Mountain Map' }).click();
  const viewport = page.locator('#mapScreen .map-landscape-viewport');
  await expect(viewport).toBeVisible();
  const dimensions = await viewport.evaluate(el => ({
    clientWidth: el.clientWidth, scrollWidth: el.scrollWidth,
    pageWidth: document.documentElement.scrollWidth, windowWidth: window.innerWidth
  }));
  expect(dimensions.pageWidth).toBeLessThanOrEqual(dimensions.windowWidth + 2);
  if (dimensions.windowWidth < 1010) expect(dimensions.scrollWidth).toBeGreaterThan(dimensions.clientWidth);
  await page.locator('#mountainGrid .mountain').nth(9).click();
  await expect(page.locator('#gameScreen')).toBeVisible();
  await expect(page.locator('#field .tile')).toHaveCount(252);
});

test('Challenge Mode retains its existing card picker and game controls', async ({ page }) => {
  await page.goto('/');
  await page.locator('#challengeBtn').click();
  await expect(page.locator('#challengeGrid .mountain')).toHaveCount(13);
  await expect(page.locator('#challengeGrid .mountain-art').first()).toBeVisible();
  await expect(page.locator('#challengeGrid .peak-button')).toHaveCount(0);
  await page.locator('#challengeGrid .mountain').first().click();
  await expect(page.locator('#gameScreen')).toBeVisible();
  await expect(page.locator('#field .tile')).toHaveCount(252);
});
