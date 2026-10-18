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

test('Approaching the door plays the spooky whisper once, opening it plays the full haunting effect', async ({page}) => {
 await page.addInitScript(()=>{
  localStorage.setItem('gray-sentinel-mountain-unlocked-v1','5');
  localStorage.setItem('gray-sentinel-mountain-cleared-v1','4');
 });
 await page.goto('/');
 await page.locator('#playBtn').click();
 await page.evaluate(()=>{
   window.__secretSounds=[];
   playSecret=(full=false)=>window.__secretSounds.push(full?'open':'near');
   // Make a safe step into discovery range, without reaching the door.
   const spots=neighbors(SECRET_DOOR);
   const one=spots.find(p=>neighbors(p).some(q=>distance(q,SECRET_DOOR)===2));
   const from=neighbors(one).find(q=>distance(q,SECRET_DOOR)===2);
   const dx=one.x-from.x,dy=one.y-from.y;
   runner={...from};
   window.__doorStep={dx,dy};
   draw();
 });
 const step=await page.evaluate(()=>window.__doorStep);
 await page.evaluate(([dx,dy])=>move(dx,dy),[step.dx,step.dy]);
 await expect.poll(()=>page.evaluate(()=>window.__secretSounds.length)).toBe(1);
 expect(await page.evaluate(()=>window.__secretSounds)).toEqual(['near']);
 // Entering the door triggers the more dramatic effect.
 await page.evaluate(()=>{
   const p=neighbors(SECRET_DOOR)[0];
   runner={...p};
   const dx=SECRET_DOOR.x-p.x,dy=SECRET_DOOR.y-p.y;
   move(dx,dy);
 });
 await expect(page.locator('#subtitle')).toHaveText('The Hollow Mountain');
 expect(await page.evaluate(()=>window.__secretSounds)).toEqual(['near','open']);
});

test('SHOUT plays a shout on tap even with no coyotes nearby, once per cooldown', async ({page}) => {
 await page.goto('/');
 await page.locator('#playBtn').click();
 await page.evaluate(()=>{
   window.__shouts=0;
   playShout=()=>window.__shouts++;
   coyotes=[];draw();
 });
 await page.locator('#shout').click();
 expect(await page.evaluate(()=>window.__shouts)).toBe(1);
 await expect(page.locator('#shout')).toBeDisabled();
 await page.evaluate(()=>shout());
 expect(await page.evaluate(()=>window.__shouts)).toBe(1);
});

test('Spacebar SHOUT also plays the yell and still scares nearby coyotes', async ({page}) => {
 await page.goto('/');
 await page.locator('#playBtn').click();
 await page.evaluate(()=>{
   window.__shouts=0; playShout=()=>window.__shouts++;
   coyotes=[{x:17,y:10,scared:0}];
   draw();
 });
 await page.keyboard.press('Space');
 expect(await page.evaluate(()=>window.__shouts)).toBe(1);
 await expect(page.locator('#message')).toContainText('HEY COYOTES');
 await expect(page.locator('#shout')).toBeDisabled();
});

test('Spooky and shouting cues use Web Audio and gracefully respect mute', async ({page}) => {
 await page.goto('/');
 const sounds=await page.evaluate(()=>{
   const events=[];
   const originalNote=note,originalNoise=effectNoise;
   note=(...args)=>events.push(['note',args[0]]);
   effectNoise=(...args)=>events.push(['noise',args[0]]);
   // A real audio context exists in browser environments after user tap.
   playSecret(false);
   const eerie=events.splice(0);
   playSecret(true);
   const doorway=events.splice(0);
   playShout();
   const yell=events.splice(0);
   note=originalNote;effectNoise=originalNoise;
   return {eerie,doorway,yell};
 });
 expect(sounds.eerie.some(s=>s[0]==='noise')).toBe(true);
 expect(sounds.eerie.some(s=>s[0]==='note')).toBe(true);
 expect(sounds.doorway.length).toBeGreaterThan(sounds.eerie.length);
 expect(sounds.yell.filter(s=>s[0]==='noise').length).toBeGreaterThanOrEqual(2);
 // Muting the game should prevent new cue scheduling, including a shout.
 await page.locator('#homeScreen .sound-toggle').click();
 expect(await page.evaluate(()=>{
   const calls=[];
   note=(...args)=>calls.push('note');
   effectNoise=(...args)=>calls.push('noise');
   playSecret(true);playShout();
   return calls;
 })).toEqual([]);
});

test('Clock starts at five minutes and counts down during gameplay',async({page})=>{
 await page.goto('/');
 await page.locator('#playBtn').click();
 await expect(page.locator('#timerStat')).toHaveText('⏱️ 5:00');
 await expect(page.locator('#timerTrack')).toHaveAttribute('aria-valuemax','300');
 await expect(page.locator('#timerTrack')).toHaveAttribute('aria-valuenow',/29[8-9]|300/);
 await page.evaluate(()=>{timerDeadline=Date.now()+184000;tickTimer();});
 await expect(page.locator('#timerStat')).toHaveText('⏱️ 3:04');
});

test('Clock expires at zero and freezes movement until retry resets it',async({page})=>{
 await page.goto('/');
 await page.locator('#playBtn').click();
 await page.evaluate(()=>{timerDeadline=Date.now()-10;tickTimer();});
 await expect(page.locator('#timerStat')).toHaveText('⏱️ 0:00');
 await expect(page.locator('#resultTitle')).toContainText('TIME IS UP');
 await expect(page.locator('#message')).toContainText('Time is up');
 await expect(page.locator('#shout')).toBeDisabled();
 const steps=await page.locator('#stepStat').textContent();
 await page.getByRole('button',{name:'Move up'}).click();
 await expect(page.locator('#stepStat')).toHaveText(steps);
 await page.locator('#retry').click();
 await expect(page.locator('#result')).toBeHidden();
 await expect(page.locator('#timerStat')).toHaveText('⏱️ 5:00');
 await page.getByRole('button',{name:'Move up'}).click();
 await expect(page.locator('#stepStat')).toContainText('1');
});

test('The timer pauses on the map and resumes when game is shown again',async({page})=>{
 await page.goto('/');
 await page.locator('#playBtn').click();
 await page.evaluate(()=>{timerDeadline=Date.now()+152000;tickTimer();});
 await page.locator('#gameScreen button').filter({hasText:'Mountain Map'}).first().click();
 const paused=await page.evaluate(()=>({running:timerRunning,remaining:timeRemainingMs}));
 expect(paused.running).toBe(false);
 await page.waitForTimeout(250);
 expect(await page.evaluate(()=>timeRemainingMs)).toBe(paused.remaining);
 await page.evaluate(()=>showScreen('game'));
 await expect.poll(()=>page.evaluate(()=>timerRunning)).toBe(true);
 await expect(page.locator('#timerStat')).toContainText('2:');
});

test('A victory stops the timer and does not erase saved progress',async({page})=>{
 await page.goto('/');
 await page.locator('#playBtn').click();
 await page.evaluate(()=>{runner={x:1,y:0};draw();});
 await page.getByRole('button',{name:'Move left'}).click();
 await expect(page.locator('#resultTitle')).toContainText('MOUNTAIN CLEARED');
 expect(await page.evaluate(()=>timerRunning)).toBe(false);
 const remaining=await page.locator('#timerStat').textContent();
 await page.waitForTimeout(300);
 await expect(page.locator('#timerStat')).toHaveText(remaining);
 await expect(page.evaluate(()=>localStorage.getItem('gray-sentinel-mountain-cleared-v1'))).resolves.toBe('1');
 await page.locator('#next').click();
 await expect(page.locator('#subtitle')).toHaveText('Sycamore Crossing');
 await expect(page.locator('#timerStat')).toHaveText('⏱️ 5:00');
});

test('Thirty-second warning is visible, with accessible progress and reduced time',async({page})=>{
 await page.goto('/');
 await page.locator('#playBtn').click();
 await page.evaluate(()=>{timerDeadline=Date.now()+29500;tickTimer();});
 await expect(page.locator('#timerStat')).toContainText('0:30');
 await expect(page.locator('#timerStat')).toHaveClass(/urgent/);
 await expect(page.locator('#message')).toContainText('30 seconds');
 await expect(page.locator('#timerTrack')).toHaveAttribute('aria-valuenow',/2[89]|30/);
});
