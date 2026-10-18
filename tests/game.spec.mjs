import { test, expect } from '@playwright/test';

const map = async page => {
  await page.locator('#homeScreen button').filter({hasText:'Mountain Map'}).click();
  await expect(page.locator('#mapScreen')).toBeVisible();
};

test('Start Adventure starts on Mountain 1 with working movement', async ({page}) => {
  const errors=[];
  page.on('pageerror', error=>errors.push(error.message));
  await page.goto('/');
  await expect(page.locator('#homeScreen')).toBeVisible();
  await page.locator('#playBtn').click();
  await expect(page.locator('#subtitle')).toHaveText('Amphitheater Ridge');
  await expect(page.locator('#field .tile')).toHaveCount(252);
  await expect(page.locator('#coyoteStat')).toContainText('1');
  await page.getByRole('button',{name:'Move up'}).click();
  await expect(page.locator('#stepStat')).toContainText('1');
  expect(errors).toEqual([]);
});

test('Map has ten regular mountains and nine start locked', async ({page}) => {
  await page.goto('/');
  await map(page);
  await expect(page.locator('.mountain')).toHaveCount(10);
  await expect(page.locator('.mountain:disabled')).toHaveCount(9);
  await expect(page.locator('#progress')).toContainText('0/10');
  await page.locator('.mountain:not(:disabled)').click();
  await expect(page.locator('#gameScreen')).toBeVisible();
});

test('A coyote catches the player and eats their lunch', async ({page}) => {
  await page.goto('/');
  await page.locator('#playBtn').click();
  await page.evaluate(()=>{coyotes=[{x:17,y:12,scared:0}];draw();});
  await page.getByRole('button',{name:'Move up'}).click();
  await expect(page.locator('#message')).toContainText('The coyote ate your lunch.');
  await expect(page.locator('#lifeStat')).toContainText('❤️❤️');
});

test('Mountain 5 flag unlocks Mountain 6 without unlocking the secret', async ({page}) => {
  await page.addInitScript(()=>{
    localStorage.setItem('gray-sentinel-mountain-unlocked-v1','5');
    localStorage.setItem('gray-sentinel-mountain-cleared-v1','4');
  });
  await page.goto('/');
  await page.locator('#playBtn').click();
  await expect(page.locator('#subtitle')).toHaveText('The Gray Sentinel');
  await page.evaluate(()=>{runner={x:1,y:0};draw();});
  await page.getByRole('button',{name:'Move left'}).click();
  await expect(page.locator('#resultTitle')).toContainText('MOUNTAIN 5 CLEARED');
  await expect(page.locator('#message')).toContainText('MOUNTAIN 6 UNLOCKED');
  await expect(page.locator('#next')).toBeVisible();
  await page.locator('#next').click();
  await expect(page.locator('#subtitle')).toHaveText('Dawnmist Valley');
  await page.locator('#gameScreen button').filter({hasText:'Mountain Map'}).first().click();
  await expect(page.locator('.mountain')).toHaveCount(10);
  await expect(page.locator('.mountain:not(:disabled)')).toHaveCount(6);
  await expect(page.locator('#progress')).toContainText('5/10');
  await expect(page.evaluate(()=>localStorage.getItem('gray-coyote-mountains-secret-found-v1'))).resolves.toBeNull();
});

test('Mountain 5 door unlocks the secret level without unlocking Mountain 6', async ({page}) => {
  await page.addInitScript(()=>{
    localStorage.setItem('gray-sentinel-mountain-unlocked-v1','5');
    localStorage.setItem('gray-sentinel-mountain-cleared-v1','4');
  });
  await page.goto('/');
  await page.locator('#playBtn').click();
  const direction=await page.evaluate(()=>{
    const from=neighbors(SECRET_DOOR)[0];
    runner={...from};
    draw();
    const dx=SECRET_DOOR.x-from.x,dy=SECRET_DOOR.y-from.y;
    return dx===1?'Move right':dx===-1?'Move left':dy===1?'Move down':'Move up';
  });
  await page.getByRole('button',{name:direction}).click();
  await expect(page.locator('#subtitle')).toHaveText('The Hollow Mountain');
  await expect(page.locator('#mountainLabel')).toContainText('SECRET LEVEL');
  await expect(page.locator('#message')).toContainText('SECRET DOOR OPENED');
  await expect(page.evaluate(()=>localStorage.getItem('gray-coyote-mountains-secret-found-v1'))).resolves.toBe('true');
  await page.locator('#gameScreen button').filter({hasText:'Mountain Map'}).first().click();
  await expect(page.locator('.mountain')).toHaveCount(11);
  await expect(page.locator('.mountain:not(:disabled)')).toHaveCount(6);
  await expect(page.locator('.mountain').nth(5)).toBeDisabled();
  await expect(page.locator('.mountain').last()).toBeEnabled();
});

test('Existing players who finished the original five mountains resume at Mountain 6', async ({page}) => {
  await page.addInitScript(()=>{
    localStorage.setItem('gray-sentinel-mountain-unlocked-v1','5');
    localStorage.setItem('gray-sentinel-mountain-cleared-v1','5');
  });
  await page.goto('/');
  await page.locator('#playBtn').click();
  await expect(page.locator('#subtitle')).toHaveText('Dawnmist Valley');
  await expect(page.locator('#coyoteStat')).toContainText('6');
});

test('Later new mountain levels are accessible with saved progress', async ({page}) => {
  await page.addInitScript(()=>{
    localStorage.setItem('gray-sentinel-mountain-unlocked-v1','10');
    localStorage.setItem('gray-sentinel-mountain-cleared-v1','9');
  });
  await page.goto('/');
  await map(page);
  await expect(page.locator('.mountain')).toHaveCount(10);
  await expect(page.locator('.mountain:not(:disabled)')).toHaveCount(10);
  await page.locator('.mountain').nth(9).click();
  await expect(page.locator('#subtitle')).toHaveText('Skyfire Summit');
  await expect(page.locator('#field .tile')).toHaveCount(252);
  await expect(page.locator('#coyoteStat')).toContainText('10');
});

test('Finishing Mountain 10 shows the ten-peak victory without exposing the secret', async ({page}) => {
  await page.addInitScript(()=>{
    localStorage.setItem('gray-sentinel-mountain-unlocked-v1','10');
    localStorage.setItem('gray-sentinel-mountain-cleared-v1','9');
  });
  await page.goto('/');
  await page.locator('#playBtn').click();
  await page.evaluate(()=>{runner={x:1,y:0};draw();});
  await page.getByRole('button',{name:'Move left'}).click();
  await expect(page.locator('#resultTitle')).toContainText('ALL TEN PEAKS CONQUERED');
  await expect(page.locator('#next')).toBeHidden();
  await expect(page.evaluate(()=>localStorage.getItem('gray-sentinel-mountain-cleared-v1'))).resolves.toBe('10');
});
