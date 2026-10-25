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
  await expect(page.locator('#mapScreen .map-landscape-viewport')).toHaveAttribute('role', 'group');
  await page.locator('#mountainGrid .mountain').first().click();
  await expect(page.locator('#gameScreen')).toBeVisible();
  await expect(page.locator('#field .tile')).toHaveCount(18 * 14);
});

test('portrait map has vertical-only scrolling, jump navigation, and reachable late peaks', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => {
    localStorage.setItem('gray-sentinel-mountain-unlocked-v1', '10');
    localStorage.setItem('gray-sentinel-mountain-cleared-v1', '9');
  });
  await page.reload();
  await page.locator('#homeScreen button').filter({ hasText: 'Mountain Map' }).click();
  const map = page.locator('#mapScreen .map-landscape');
  await expect(map).toBeVisible();
  const measurements = await map.evaluate(el => ({
    width: el.getBoundingClientRect().width,
    height: el.getBoundingClientRect().height,
    containerWidth: el.parentElement.clientWidth,
    containerScrollWidth: el.parentElement.scrollWidth,
    documentWidth: document.documentElement.scrollWidth,
    windowWidth: window.innerWidth,
    documentHeight: document.documentElement.scrollHeight,
    windowHeight: window.innerHeight
  }));
  expect(measurements.width).toBeLessThanOrEqual(measurements.containerWidth + 1);
  expect(measurements.containerScrollWidth).toBeLessThanOrEqual(measurements.containerWidth + 1);
  expect(measurements.documentWidth).toBeLessThanOrEqual(measurements.windowWidth + 2);
  expect(measurements.documentHeight).toBeGreaterThan(measurements.windowHeight);
  expect(measurements.height).toBeGreaterThan(1800);
  await page.locator('.map-jump').filter({hasText:'Latest unlocked'}).click();
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(800);
  await page.locator('#mountainGrid .mountain').nth(9).click();
  await expect(page.locator('#gameScreen')).toBeVisible();
  await expect(page.locator('#field .tile')).toHaveCount(252);
  await page.locator('#gameScreen button').filter({ hasText: 'Mountain Map' }).first().click();
  await expect(page.locator('#mapScreen')).toBeVisible();
  expect(await page.evaluate(() => window.scrollY)).toBeGreaterThan(800);
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

test('50 coyote facts reveal the bonus village as an extra playable peak', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('gray-coyote-mountains-facts-v1', JSON.stringify(Array.from({length:50},(_,i)=>i)));
  });
  await page.goto('/');
  await page.locator('#homeScreen button').filter({ hasText: 'Mountain Map' }).click();
  await expect(page.locator('#mountainGrid .mountain')).toHaveCount(11);
  const village = page.locator('#mountainGrid .mountain').last();
  await expect(village.locator('.peak-name')).toHaveText('The Lunch Snatch Village');
  await expect(village.locator('.peak-status')).toHaveText('🌟 Bonus unlocked');
  await village.click();
  await expect(page.locator('#gameScreen')).toBeVisible();
  await expect(page.locator('#field .tile')).toHaveCount(252);
});

test('portrait mountain labels follow progression from top to bottom', async ({ page }) => {
  await page.goto('/');
  await page.locator('#homeScreen button').filter({ hasText: 'Mountain Map' }).click();
  const firstY=await page.locator('#mountainGrid .mountain').first().evaluate(el => el.getBoundingClientRect().top + window.scrollY);
  const lastY=await page.locator('#mountainGrid .mountain').nth(9).evaluate(el => el.getBoundingClientRect().top + window.scrollY);
  expect(lastY).toBeGreaterThan(firstY + 900);
  expect(await page.locator('#mapScreen .map-swipe-hint').textContent()).not.toMatch(/swipe left|swipe right/i);
});
