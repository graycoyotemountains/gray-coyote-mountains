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
  await expect(page.evaluate(()=>localStorage.getItem('gray-coyote-mountains-secret-found-v1'))).resolves.toBe('false');
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

test('Sound toggle mutes sounds and saves across reloads', async ({page}) => {
  await page.goto('/');
  const sound=page.locator('#homeScreen .sound-toggle');
  await expect(sound).toHaveText('🔊 Sound on');
  await sound.click();
  await expect(sound).toHaveText('🔇 Sound off');
  await expect(sound).toHaveAttribute('aria-pressed','false');
  await expect(page.evaluate(()=>localStorage.getItem('gray-coyote-mountains-sounds-v1'))).resolves.toBe('false');
  await page.reload();
  await expect(sound).toHaveText('🔇 Sound off');
  await sound.click();
  await expect(sound).toHaveText('🔊 Sound on');
});

test('Reaching a flag launches confetti and offers normal next level', async ({page}) => {
  await page.goto('/');
  await page.locator('#playBtn').click();
  await page.evaluate(()=>{runner={x:1,y:0};draw();});
  await page.getByRole('button',{name:'Move left'}).click();
  await expect(page.locator('#resultTitle')).toContainText('MOUNTAIN CLEARED');
  await expect(page.locator('#confettiLayer .confetti-bit')).toHaveCount(72);
  await expect(page.locator('#next')).toBeVisible();
});

test('Completing Hollow opens a shortcut to Skyfire but not other locked peaks', async ({page}) => {
  await page.addInitScript(()=>{
    localStorage.setItem('gray-sentinel-mountain-unlocked-v1','5');
    localStorage.setItem('gray-sentinel-mountain-cleared-v1','4');
    localStorage.setItem('gray-coyote-mountains-secret-found-v1','true');
  });
  await page.goto('/');
  await page.locator('#homeScreen button').filter({hasText:'Mountain Map'}).click();
  await page.locator('.mountain').last().click();
  await expect(page.locator('#subtitle')).toHaveText('The Hollow Mountain');
  await expect(page.locator('#secretNext')).toBeHidden();
  await page.evaluate(()=>{runner={x:1,y:0};draw();});
  await page.getByRole('button',{name:'Move left'}).click();
  await expect(page.locator('#secretNext')).toBeVisible();
  await expect(page.locator('#resultBody')).toContainText('Skyfire Summit');
  await expect(page.evaluate(()=>localStorage.getItem('gray-coyote-mountains-summit-trail-v1'))).resolves.toBe('true');
  await page.locator('#secretNext').click();
  await expect(page.locator('#subtitle')).toHaveText('Skyfire Summit');
  await page.locator('#gameScreen button').filter({hasText:'Mountain Map'}).first().click();
  await expect(page.locator('#secretTrail')).toBeVisible();
  await expect(page.locator('.mountain').nth(5)).toBeDisabled();
  await expect(page.locator('.mountain').nth(9)).toBeEnabled();
  await expect(page.locator('#progress')).toContainText('4/10');
  await page.locator('.mountain').nth(9).click();
  await page.evaluate(()=>{runner={x:1,y:0};draw();});
  await page.getByRole('button',{name:'Move left'}).click();
  await expect(page.locator('#resultTitle')).toContainText('SKYFIRE SUMMIT CONQUERED');
  await expect(page.locator('#resultBody')).toContainText('remain locked');
  await expect(page.evaluate(()=>localStorage.getItem('gray-sentinel-mountain-cleared-v1'))).resolves.toBe('4');
  await page.locator('#gameScreen button').filter({hasText:'Mountain Map'}).first().click();
  await expect(page.locator('.mountain').nth(5)).toBeDisabled();
  await expect(page.locator('.mountain').nth(9)).toHaveClass(/done/);
});

test('Existing completed Hollow Mountain saves automatically have the Skyfire trail', async ({page}) => {
  await page.addInitScript(()=>{
    localStorage.setItem('gray-sentinel-mountain-unlocked-v1','5');
    localStorage.setItem('gray-sentinel-mountain-cleared-v1','4');
    localStorage.setItem('gray-coyote-mountains-secret-cleared-v1','true');
  });
  await page.goto('/');
  await page.locator('#homeScreen button').filter({hasText:'Mountain Map'}).click();
  await expect(page.locator('#secretTrail')).toBeVisible();
  await expect(page.locator('.mountain').nth(9)).toBeEnabled();
  await page.locator('#secretTrail button').click();
  await expect(page.locator('#subtitle')).toHaveText('Skyfire Summit');
});

test('Secret door plays its special sound and coyote collision plays munch', async ({page}) => {
  await page.addInitScript(()=>{
    localStorage.setItem('gray-sentinel-mountain-unlocked-v1','5');
    localStorage.setItem('gray-sentinel-mountain-cleared-v1','4');
  });
  await page.goto('/');
  await page.locator('#playBtn').click();
  await page.evaluate(()=>{
    window.__secretCall=0;window.__munchCall=0;
    playSecret=()=>{window.__secretCall++};
    playMunch=()=>{window.__munchCall++};
    const from=neighbors(SECRET_DOOR)[0];
    runner={...from};
    draw();
  });
  const dir=await page.evaluate(()=>{
    const dx=SECRET_DOOR.x-runner.x,dy=SECRET_DOOR.y-runner.y;
    return dx===1?'Move right':dx===-1?'Move left':dy===1?'Move down':'Move up';
  });
  await page.getByRole('button',{name:dir}).click();
  expect(await page.evaluate(()=>window.__secretCall)).toBe(1);
  await page.evaluate(()=>{
    coyotes=[{x:17,y:12,scared:0}]; runner={...START};draw();
  });
  await page.getByRole('button',{name:'Move up'}).click();
  expect(await page.evaluate(()=>window.__munchCall)).toBe(1);
});

test('Mountain 5 door relocates on every visit and retry and stays reachable', async ({page}) => {
  await page.addInitScript(()=>{
    localStorage.setItem('gray-sentinel-mountain-unlocked-v1','5');
    localStorage.setItem('gray-sentinel-mountain-cleared-v1','4');
  });
  await page.goto('/');
  await page.locator('#playBtn').click();
  const positions=[];
  for(let attempt=0;attempt<5;attempt++){
    const state=await page.evaluate(()=>({
      location:{...SECRET_DOOR},
      possible:!blocked(SECRET_DOOR.x,SECRET_DOOR.y)&&connected(START,SECRET_DOOR),
      previousSave:localStorage.getItem(DOOR_LAST_KEY),
      distanceFromStart:distance(START,SECRET_DOOR)
    }));
    expect(state.possible).toBe(true);
    expect(state.distanceFromStart).toBeGreaterThan(3);
    expect(state.previousSave).toBe(state.location.x+','+state.location.y);
    if(attempt)expect(state.location).not.toEqual(positions[attempt-1]);
    positions.push(state.location);
    await page.locator('#retry').click();
    await expect(page.locator('#subtitle')).toHaveText('The Gray Sentinel');
  }
});

test('Discovered secret door is hidden again after revisiting Mountain 5', async ({page}) => {
  await page.addInitScript(()=>{
    localStorage.setItem('gray-sentinel-mountain-unlocked-v1','5');
    localStorage.setItem('gray-sentinel-mountain-cleared-v1','4');
    localStorage.setItem('gray-coyote-mountains-secret-found-v1','true');
  });
  await page.goto('/');
  await page.locator('#playBtn').click();
  const location=await page.evaluate(()=>({...SECRET_DOOR}));
  await expect(page.locator('#field .secret-door')).toHaveCount(0);
  await expect(page.locator('#gameHint')).toContainText('hidden until you get close');
  await page.evaluate(()=>{
    // Stand beside the door and make it visible, without entering it.
    const p=neighbors(SECRET_DOOR)[0];
    runner={...p};draw();
  });
  await expect(page.locator('#field .secret-door')).toHaveCount(1);
  await page.locator('#retry').click();
  await expect(page.locator('#field .secret-door')).toHaveCount(0);
  expect(await page.evaluate(()=>({...SECRET_DOOR}))).not.toEqual(location);
  await expect(page.evaluate(()=>localStorage.getItem('gray-coyote-mountains-secret-found-v1'))).resolves.toBe('true');
});

test('Door location changes even after leaving Mountain 5 or reloading the browser', async ({page}) => {
  await page.addInitScript(()=>{
    localStorage.setItem('gray-sentinel-mountain-unlocked-v1','5');
    localStorage.setItem('gray-sentinel-mountain-cleared-v1','4');
  });
  await page.goto('/');
  await page.locator('#playBtn').click();
  const first=await page.evaluate(()=>({...SECRET_DOOR}));
  await page.locator('#gameScreen button').filter({hasText:'Mountain Map'}).first().click();
  await page.locator('.mountain').nth(4).click();
  const second=await page.evaluate(()=>({...SECRET_DOOR}));
  expect(second).not.toEqual(first);
  await page.reload();
  await page.locator('#playBtn').click();
  const third=await page.evaluate(()=>({...SECRET_DOOR}));
  expect(third).not.toEqual(second);
});
