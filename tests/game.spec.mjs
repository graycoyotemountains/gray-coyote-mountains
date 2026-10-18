import { test, expect } from '@playwright/test';

test('Start Adventure works and movement updates the board', async ({ page }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/');
  await expect(page.locator('#homeScreen')).toBeVisible();
  await page.locator('#playBtn').click();
  await expect(page.locator('#gameScreen')).toBeVisible();
  await expect(page.locator('#field .tile')).toHaveCount(252);
  await expect(page.locator('#coyoteStat')).toContainText('1');
  await page.getByRole('button', {name: 'Move up'}).click();
  await expect(page.locator('#stepStat')).toContainText('1');
  expect(errors).toEqual([]);
});

test('Mountain Map has five mountains and only the first is unlocked', async ({ page }) => {
  await page.goto('/');
  await page.locator('#homeScreen button').filter({hasText: 'Mountain Map'}).click();
  await expect(page.locator('#mapScreen')).toBeVisible();
  await expect(page.locator('.mountain')).toHaveCount(5);
  await expect(page.locator('.mountain:disabled')).toHaveCount(4);
  await page.locator('.mountain:not(:disabled)').click();
  await expect(page.locator('#gameScreen')).toBeVisible();
});

test('Coyote collisions announce the eaten lunch', async ({ page }) => {
  await page.goto('/');
  await page.locator('#playBtn').click();
  await page.evaluate(() => { coyotes = [{x: 17, y: 12, scared: 0}]; draw(); });
  await page.getByRole('button', {name: 'Move up'}).click();
  await expect(page.locator('#message')).toContainText('The coyote ate your lunch.');
  await expect(page.locator('#lifeStat')).toContainText('❤️❤️');
});

test('Mountain five secret door opens the hidden level', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('gray-sentinel-mountain-unlocked-v1','5');
    localStorage.setItem('gray-sentinel-mountain-cleared-v1','4');
  });
  await page.goto('/');
  await page.locator('#playBtn').click();
  await expect(page.locator('#subtitle')).toHaveText('The Gray Sentinel');
  const direction = await page.evaluate(() => {
    const from = neighbors(SECRET_DOOR)[0];
    runner = {...from};
    draw();
    const dx = SECRET_DOOR.x-from.x, dy = SECRET_DOOR.y-from.y;
    return dx===1?'Move right':dx===-1?'Move left':dy===1?'Move down':'Move up';
  });
  await page.getByRole('button', {name: direction}).click();
  await expect(page.locator('#subtitle')).toHaveText('The Hollow Mountain');
});
