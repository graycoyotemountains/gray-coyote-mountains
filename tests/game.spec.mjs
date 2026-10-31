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

test('Winning Hollow forces a transition into Mistveil Lagoon, not Skyfire', async ({page})=>{
 await page.addInitScript(()=>{
  localStorage.setItem('gray-sentinel-mountain-unlocked-v1','5');
  localStorage.setItem('gray-sentinel-mountain-cleared-v1','4');
  localStorage.setItem('gray-coyote-mountains-secret-found-v1','true');
 });
 await page.goto('/');
 await page.locator('#playBtn').click();
 await page.evaluate(()=>loadLevel(10));
 await expect(page.locator('#subtitle')).toHaveText('The Hollow Mountain');
 const before=await page.evaluate(()=>coyoteVictories);
 await page.evaluate(()=>{runner={x:1,y:0};coyotes=[];draw();move(-1,0);});
 await expect(page.locator('#subtitle')).toHaveText('Mistveil Lagoon');
 const state=await page.evaluate(()=>({levelIndex,mode,secretCleared,coyoteVictories,unlocked,
   bonus:[...bonusUnlocked].sort((a,b)=>a-b),shortcut:summitTrailUnlocked}));
 expect(state).toMatchObject({levelIndex:14,mode:'playing',secretCleared:true,
   coyoteVictories:before+1,unlocked:5,bonus:[14],shortcut:false});
 await expect(page.locator('#message')).toContainText('MANDATORY SECRET TRAIL');
 await expect(page.locator('#secretNext')).toHaveCount(0);
 await page.locator('#gameScreen button').filter({hasText:'Mountain Map'}).first().click();
 await expect(page.locator('#secretTrail')).toHaveCount(0);
 await expect(page.locator('.mountain').nth(5)).toBeDisabled();
 await expect(page.locator('.mountain').nth(9)).toBeDisabled();
 await expect(page.locator('#bonusExpeditionGrid button').first()).toBeEnabled();
 await expect(page.locator('#progress')).toContainText('4/10');
});

test('Legacy Hollow and Skyfire shortcut saves retain progress without an optional shortcut', async ({page})=>{
 await page.addInitScript(()=>{
  localStorage.setItem('gray-sentinel-mountain-unlocked-v1','5');
  localStorage.setItem('gray-sentinel-mountain-cleared-v1','4');
  localStorage.setItem('gray-coyote-mountains-secret-cleared-v1','true');
  localStorage.setItem('gray-coyote-mountains-summit-trail-v1','true');
 });
 await page.goto('/');
 await page.locator('#homeScreen button').filter({hasText:'Mountain Map'}).click();
 await expect(page.locator('#secretTrail')).toHaveCount(0);
 await expect(page.locator('.mountain').nth(9)).toBeDisabled();
 await expect(page.locator('#bonusExpeditionGrid button').first()).toBeEnabled();
 await expect(page.locator('#bonusExpeditionGrid button').nth(1)).toBeEnabled();
 expect(await page.evaluate(()=>secretCleared)).toBe(true);
 expect(await page.evaluate(()=>summitTrailUnlocked)).toBe(true); // Historical flag kept without enabling shortcut.
});

test('Players who previously completed Skyfire through the old shortcut can still replay it',async({page})=>{
 await page.addInitScript(()=>{
  localStorage.setItem('gray-sentinel-mountain-unlocked-v1','5');
  localStorage.setItem('gray-sentinel-mountain-cleared-v1','4');
  localStorage.setItem('gray-coyote-mountains-secret-cleared-v1','true');
  localStorage.setItem('gray-coyote-mountains-summit-trail-v1','true');
  localStorage.setItem('gray-coyote-mountains-summit-shortcut-cleared-v1','true');
 });
 await page.goto('/');
 await page.locator('#homeScreen button').filter({hasText:'Mountain Map'}).click();
 await expect(page.locator('#secretTrail')).toHaveCount(0);
 await expect(page.locator('.mountain').nth(9)).toBeEnabled();
 await expect(page.locator('.mountain').nth(9)).toHaveClass(/done/);
 await expect(page.locator('.mountain').nth(5)).toBeDisabled();
 await page.locator('.mountain').nth(9).click();
 await expect(page.locator('#subtitle')).toHaveText('Skyfire Summit');
});

test('Hollow mandatory trail carries the bicycle to Mistveil for one more level',async({page})=>{
 await page.addInitScript(()=>localStorage.setItem('gray-coyote-mountains-secret-found-v1','true'));
 await page.goto('/');
 await page.locator('#playBtn').click();
 await page.evaluate(()=>{
  loadLevel(10);
  // The original secret-level bicycle is carried into one additional level.
  equipment={type:'bike',origin:10,currentLevel:10,nextLevel:null};
  coyotes=[];runner={x:1,y:0};draw();move(-1,0);
 });
 await expect(page.locator('#subtitle')).toHaveText('Mistveil Lagoon');
 expect(await page.evaluate(()=>equipment?.type)).toBe('bike');
 await expect(page.locator('#field .runner')).toContainText('🚴');
 await expect(page.locator('#shout')).toContainText('BIKE BELL');
 expect(await page.evaluate(()=>equipment?.nextLevel)).toBe(14);
 await page.evaluate(()=>{bonusUnlocked.add(15);extraUnlocked[4]=true;saveProgress();loadLevel(15);});
 expect(await page.evaluate(()=>equipment)).toBeNull();
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
   // Avoid randomized coyote spawns interfering with an audio-only cue test.
   coyotes=[];
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

test('Spooky cues use Web Audio and SHOUT plays a human recording respecting mute', async ({page}) => {
 await page.goto('/');
 await page.locator('#playBtn').click();
 await expect.poll(()=>page.evaluate(()=>Boolean(humanShoutBuffer))).toBe(true);
 const sounds=await page.evaluate(()=>{
  const events=[];
  const originalNote=note,originalNoise=effectNoise;
  note=(...args)=>events.push(['note',args[0]]);
  effectNoise=(...args)=>events.push(['noise',args[0]]);
  playSecret(false);const eerie=events.splice(0);
  playSecret(true);const doorway=events.splice(0);
  note=originalNote;effectNoise=originalNoise;
  const before=humanShoutCount;playShout();
  return {eerie,doorway,humanPlayed:humanShoutCount-before,recordingDuration:humanShoutBuffer.duration};
 });
 expect(sounds.eerie.some(s=>s[0]==='noise')).toBe(true);
 expect(sounds.eerie.some(s=>s[0]==='note')).toBe(true);
 expect(sounds.doorway.length).toBeGreaterThan(sounds.eerie.length);
 expect(sounds.humanPlayed).toBe(1);
 expect(sounds.recordingDuration).toBeGreaterThan(0.5);
 await page.evaluate(()=>showScreen('home'));
 await page.locator('#homeScreen .sound-toggle').click();
 expect(await page.evaluate(()=>{
  const before=humanShoutCount;
  playSecret(true);playShout();
  return humanShoutCount-before;
 })).toBe(0);
});

test('Clock starts at five minutes and counts down during gameplay',async({page})=>{
 await page.goto('/');
 await page.locator('#playBtn').click();
 await expect(page.locator('#timerStat')).toHaveText('⏱️ 3:00');
 await expect(page.locator('#timerTrack')).toHaveAttribute('aria-valuemax','180');
 await expect(page.locator('#timerTrack')).toHaveAttribute('aria-valuenow',/17[8-9]|180/);
 await page.evaluate(()=>{timerDeadline=Date.now()+124000;tickTimer();});
 await expect(page.locator('#timerStat')).toHaveText('⏱️ 2:04');
});

test('Clock expires at zero and freezes movement until retry resets it',async({page})=>{
 await page.goto('/');
 await page.locator('#playBtn').click();
 await page.evaluate(()=>{timerDeadline=Date.now()-10;tickTimer();});
 await expect(page.locator('#timerStat')).toHaveText('⏱️ 0:00');
 await expect(page.locator('#resultTitle')).toContainText('COYOTE INVASION');
 await expect(page.locator('#message')).toContainText('COYOTE INVASION');
 await expect(page.locator('#shout')).toBeDisabled();
 const steps=await page.locator('#stepStat').textContent();
 await page.getByRole('button',{name:'Move up'}).click();
 await expect(page.locator('#stepStat')).toHaveText(steps);
 await page.locator('#retry').click();
 await expect(page.locator('#result')).toBeHidden();
 await expect(page.locator('#timerStat')).toHaveText('⏱️ 3:00');
 await page.getByRole('button',{name:'Move up'}).click();
 await expect(page.locator('#stepStat')).toContainText('1');
});

test('The timer pauses on the map and resumes when game is shown again',async({page})=>{
 await page.goto('/');
 await page.locator('#playBtn').click();
 await page.evaluate(()=>{timerDeadline=Date.now()+122000;tickTimer();});
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
 await expect(page.locator('#timerStat')).toHaveText('⏱️ 3:00');
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

test('Secret Hollow Mountain plays a continuous haunted ambience, but regular levels do not',async({page})=>{
 await page.addInitScript(()=>{
  localStorage.setItem('gray-sentinel-mountain-unlocked-v1','5');
  localStorage.setItem('gray-sentinel-mountain-cleared-v1','4');
  localStorage.setItem('gray-coyote-mountains-secret-found-v1','true');
 });
 await page.goto('/');
 await page.locator('#playBtn').click();
 expect(await page.evaluate(()=>secretAmbience)).toBeNull();
 await page.evaluate(()=>loadLevel(SECRET_LEVEL));
 await expect(page.locator('#subtitle')).toHaveText('The Hollow Mountain');
 await expect.poll(()=>page.evaluate(()=>Boolean(secretAmbience))).toBe(true);
 const count=await page.evaluate(()=>secretAmbienceStarts);
 await page.evaluate(()=>{runner={x:17,y:12};draw();});
 expect(await page.evaluate(()=>secretAmbienceStarts)).toBe(count);
 await page.locator('#gameScreen button').filter({hasText:'Mountain Map'}).first().click();
 await expect.poll(()=>page.evaluate(()=>secretAmbience===null&&secretAmbienceInterval===null)).toBe(true);
});

test('Hollow ambience stops on mute and returns when unmuted',async({page})=>{
 await page.addInitScript(()=>{
  localStorage.setItem('gray-coyote-mountains-secret-found-v1','true');
 });
 await page.goto('/');
 await page.locator('#playBtn').click();
 await page.evaluate(()=>loadLevel(SECRET_LEVEL));
 await expect.poll(()=>page.evaluate(()=>Boolean(secretAmbience))).toBe(true);
 await page.locator('#gameScreen .sound-toggle').click();
 await expect.poll(()=>page.evaluate(()=>secretAmbience===null)).toBe(true);
 await expect(page.locator('#gameScreen .sound-toggle')).toContainText('Sound off');
 await page.locator('#gameScreen .sound-toggle').click();
 await expect.poll(()=>page.evaluate(()=>Boolean(secretAmbience))).toBe(true);
});

test('The haunted atmosphere pauses in the background and stops on victory',async({page})=>{
 await page.addInitScript(()=>localStorage.setItem('gray-coyote-mountains-secret-found-v1','true'));
 await page.goto('/');
 await page.locator('#playBtn').click();
 await page.evaluate(()=>loadLevel(SECRET_LEVEL));
 await expect.poll(()=>page.evaluate(()=>Boolean(secretAmbience))).toBe(true);
 await page.evaluate(()=>{
  Object.defineProperty(document,'hidden',{configurable:true,get:()=>true});
  document.dispatchEvent(new Event('visibilitychange'));
 });
 await expect.poll(()=>page.evaluate(()=>secretAmbience===null)).toBe(true);
 await page.evaluate(()=>{
  Object.defineProperty(document,'hidden',{configurable:true,get:()=>false});
  document.dispatchEvent(new Event('visibilitychange'));
 });
 await expect.poll(()=>page.evaluate(()=>Boolean(secretAmbience))).toBe(true);
 await page.evaluate(()=>{runner={x:1,y:0};draw();});
 await page.getByRole('button',{name:'Move left'}).click();
 await expect(page.locator('#subtitle')).toHaveText('Mistveil Lagoon');
 // Mistveil is a regular tunnel branch, so secret-world ambience must stop.
 await expect.poll(()=>page.evaluate(()=>Boolean(secretAmbience))).toBe(false);
});

test('Human shout audio is locally hosted and SHOUT triggers the recorded human voice',async({page})=>{
 await page.goto('/');
 const asset=await page.request.get('/assets/human-shout.wav');
 expect(asset.ok()).toBe(true);
 expect((await asset.body()).byteLength).toBeGreaterThan(50000);
 await page.locator('#playBtn').click();
 await expect.poll(()=>page.evaluate(()=>humanShoutBuffer?.duration||0)).toBeGreaterThan(1);
 const before=await page.evaluate(()=>humanShoutCount);
 await page.locator('#shout').click();
 expect(await page.evaluate(()=>humanShoutCount)).toBe(before+1);
 await expect(page.locator('#shout')).toBeDisabled();
});

test('Regular levels have three chests and secret worlds have a fact chest',async({page})=>{
 await page.addInitScript(()=>{
  localStorage.setItem('gray-sentinel-mountain-unlocked-v1','10');
  localStorage.setItem('gray-sentinel-mountain-cleared-v1','9');
  localStorage.setItem('gray-coyote-mountains-secret-found-v1','true');
  localStorage.setItem('gray-coyote-mountains-extra-secrets-v1',JSON.stringify({unlocked:[true,true],cleared:[false,false]}));
 });
 await page.goto('/');await page.locator('#playBtn').click();
 const report=await page.evaluate(()=>{
  return LEVELS.slice(0,13).map((cfg,i)=>{
   loadLevel(i);
   return {level:i,count:chests.size,shown:document.querySelectorAll('#field .chest').length,
    valid:[...chests].every(([position])=>{
     const [x,y]=position.split(',').map(Number);
     return !blocked(x,y)&&connected(START,{x,y})&&!SPAWNS.some(p=>p.x===x&&p.y===y);
    })};
  });
 });
 for(const r of report){
  expect(r.count).toBe(r.level<10?3:1);
  expect(r.shown).toBe(r.count);
  expect(r.valid).toBe(true);
 }
});

test('Collecting a treasure box removes it and saves a collectible',async({page})=>{
 await page.goto('/');await page.locator('#playBtn').click();
 await page.evaluate(()=>{chests=new Map([[key(17,12),'acorn']]);coyotes=[];draw();});
 await page.getByRole('button',{name:'Move up'}).click();
 await expect(page.locator('#message')).toContainText('Golden Acorn');
 await expect(page.locator('#field .chest')).toHaveCount(0);
 await expect(page.locator('#treasureStat')).toContainText('1/3');
 await expect(page.evaluate(()=>JSON.parse(localStorage.getItem(TREASURE_KEY)).acorn)).resolves.toBe(1);
 await page.reload();await page.locator('#playBtn').click();
 await expect(page.locator('#treasureStat')).toContainText('🎒 1');
});

test('Time Crystal adds twenty seconds without passing three minute maximum',async({page})=>{
 await page.goto('/');await page.locator('#playBtn').click();
 await page.evaluate(()=>{
  chests=new Map([[key(17,12),'crystal']]);coyotes=[];
  timeRemainingMs=100000;timerDeadline=Date.now()+timeRemainingMs;draw();
 });
 await page.getByRole('button',{name:'Move up'}).click();
 expect(await page.evaluate(()=>timeRemainingMs)).toBeGreaterThan(119000);
 expect(await page.evaluate(()=>timeRemainingMs)).toBeLessThanOrEqual(180000);
 await expect(page.locator('#message')).toContainText('+20 seconds');
});

test('Heart Berry heals and Coyote Bell resets shout and frightens the pack',async({page})=>{
 await page.goto('/');await page.locator('#playBtn').click();
 await page.evaluate(()=>{lives=2;chests=new Map([[key(17,12),'berry']]);coyotes=[];draw();});
 await page.getByRole('button',{name:'Move up'}).click();
 await expect(page.locator('#lifeStat')).toHaveText('❤️❤️❤️');
 await page.evaluate(()=>{
  runner={...START};cooldown=4;
  chests=new Map([[key(17,12),'bell']]);
  coyotes=[{x:10,y:10,scared:0}];draw();
 });
 await page.getByRole('button',{name:'Move up'}).click();
 await expect(page.locator('#shout')).toBeEnabled();
 expect(await page.evaluate(()=>coyotes[0].scared)).toBe(3);
});

test('Portals on mountains 7 and 9 unlock separate secret worlds and persist',async({page})=>{
 await page.addInitScript(()=>{
  localStorage.setItem('gray-sentinel-mountain-unlocked-v1','10');
  localStorage.setItem('gray-sentinel-mountain-cleared-v1','9');
 });
 await page.goto('/');await page.locator('#playBtn').click();
 for(const [mountain,world,name] of [[6,11,'The Whispering Woods'],[8,12,'The Phantom Crater']]){
  await page.evaluate(i=>loadLevel(i),mountain);
  const direction=await page.evaluate(()=>{
   const from=neighbors(extraDoor)[0];runner={...from};draw();
   return [extraDoor.x-from.x,extraDoor.y-from.y];
  });
  await page.evaluate(d=>move(...d),direction);
  await expect(page.locator('#subtitle')).toHaveText(name);
  await expect(page.locator('#field .chest')).toHaveCount(1);
 }
 await page.locator('#gameScreen button').filter({hasText:'Mountain Map'}).first().click();
 await expect(page.locator('.mountain')).toHaveCount(12);
 expect(await page.evaluate(()=>JSON.parse(localStorage.getItem(EXTRA_KEY)).unlocked)).toEqual([true,true]);
 await page.reload();
 await page.locator('#homeScreen button').filter({hasText:'Mountain Map'}).click();
 await expect(page.locator('.mountain')).toHaveCount(12);
});

test('Timeout launches 25 coyote invasion and retry clears the event',async({page})=>{
 await page.goto('/');await page.locator('#playBtn').click();
 await page.evaluate(()=>{timerDeadline=Date.now()-10;tickTimer();});
 await expect(page.locator('#resultTitle')).toContainText('COYOTE INVASION');
 await expect(page.locator('#gameFrame')).toHaveClass(/invasion-mode/);
 await expect(page.locator('#coyoteStat')).toHaveText('🐺 25');
 await expect(page.locator('#field .coyote')).toHaveCount(25);
 await page.locator('#retry').click();
 await expect(page.locator('#gameFrame')).not.toHaveClass(/invasion-mode/);
 await expect(page.locator('#timerStat')).toHaveText('⏱️ 3:00');
 await expect(page.locator('#field .chest')).toHaveCount(3);
});

test('Original Hollow Mountain, secret trail and old save files still work',async({page})=>{
 await page.addInitScript(()=>{
  localStorage.setItem('gray-sentinel-mountain-unlocked-v1','5');
  localStorage.setItem('gray-sentinel-mountain-cleared-v1','4');
  localStorage.setItem('gray-coyote-mountains-secret-found-v1','true');
 });
 await page.goto('/');await page.locator('#playBtn').click();
 await page.evaluate(()=>loadLevel(SECRET_LEVEL));
 await expect(page.locator('#field .chest')).toHaveCount(1);
 await page.evaluate(()=>{runner={x:1,y:0};draw();});
 await page.getByRole('button',{name:'Move left'}).click();
 await expect(page.locator('#subtitle')).toHaveText('Mistveil Lagoon');
 await expect(page.locator('#secretNext')).toHaveCount(0);
 await expect(page.evaluate(()=>localStorage.getItem(SECRET_CLEARED_KEY))).resolves.toBe('true');
 await expect(page.evaluate(()=>JSON.parse(localStorage.getItem(BONUS_KEY)).unlocked)).resolves.toEqual([14]);
});

test('Coyote catch plays an actual bundled human munch sound rather than synthesis',async({page})=>{
 await page.goto('/');
 const asset=await page.request.get('/assets/human-munch.wav');
 expect(asset.ok()).toBe(true);
 expect((await asset.body()).byteLength).toBeGreaterThan(100000);
 await page.locator('#playBtn').click();
 await expect.poll(()=>page.evaluate(()=>humanMunchBuffer?.duration||0)).toBeGreaterThan(.5);
 const before=await page.evaluate(()=>humanMunchCount);
 await page.evaluate(()=>{coyotes=[{x:17,y:12,scared:0}];draw();});
 await page.getByRole('button',{name:'Move up'}).click();
 await expect(page.locator('#message')).toContainText('The coyote ate your lunch.');
 expect(await page.evaluate(()=>humanMunchCount)).toBe(before+1);
});

test('Muting prevents the human munch recording on a collision',async({page})=>{
 await page.goto('/');
 await page.locator('#playBtn').click();
 await expect.poll(()=>page.evaluate(()=>Boolean(humanMunchBuffer))).toBe(true);
 await page.locator('#gameScreen .sound-toggle').click();
 const before=await page.evaluate(()=>humanMunchCount);
 await page.evaluate(()=>{coyotes=[{x:17,y:12,scared:0}];draw();});
 await page.getByRole('button',{name:'Move up'}).click();
 expect(await page.evaluate(()=>humanMunchCount)).toBe(before);
 await page.locator('#gameScreen .sound-toggle').click();
 await page.evaluate(()=>{runner={...START};coyotes=[{x:17,y:12,scared:0}];draw();});
 await page.getByRole('button',{name:'Move up'}).click();
 expect(await page.evaluate(()=>humanMunchCount)).toBe(before+1);
});

test('Secret-world ambience is louder and remains controlled by mute and leaving',async({page})=>{
 await page.addInitScript(()=>localStorage.setItem('gray-coyote-mountains-secret-found-v1','true'));
 await page.goto('/');
 await page.locator('#playBtn').click();
 await page.evaluate(()=>loadLevel(SECRET_LEVEL));
 await expect.poll(()=>page.evaluate(()=>Boolean(secretAmbience))).toBe(true);
 expect(await page.evaluate(()=>SECRET_AMBIENCE_GAIN)).toBeGreaterThan(.8);
 await page.locator('#gameScreen .sound-toggle').click();
 await expect.poll(()=>page.evaluate(()=>secretAmbience===null)).toBe(true);
 await page.locator('#gameScreen .sound-toggle').click();
 await expect.poll(()=>page.evaluate(()=>Boolean(secretAmbience))).toBe(true);
 await page.locator('#gameScreen button').filter({hasText:'Mountain Map'}).first().click();
 expect(await page.evaluate(()=>secretAmbience)).toBeNull();
});

test('Louder haunted ambience starts in both additional secret worlds',async({page})=>{
 await page.addInitScript(()=>{
  localStorage.setItem('gray-coyote-mountains-extra-secrets-v1',JSON.stringify({unlocked:[true,true],cleared:[false,false]}));
 });
 await page.goto('/');
 await page.locator('#playBtn').click();
 for(const secretIndex of [11,12]){
  await page.evaluate(i=>loadLevel(i),secretIndex);
  await expect.poll(()=>page.evaluate(()=>Boolean(secretAmbience))).toBe(true);
  expect(await page.evaluate(()=>SECRET_AMBIENCE_GAIN)).toBeGreaterThan(.8);
  await page.locator('#gameScreen button').filter({hasText:'Mountain Map'}).first().click();
  expect(await page.evaluate(()=>secretAmbience)).toBeNull();
 }
});

test('Challenge Mode offers all thirteen mountains and hidden worlds with no story unlocks',async({page})=>{
 await page.goto('/');
 await page.locator('#challengeBtn').click();
 await expect(page.locator('#challengeScreen')).toBeVisible();
 await expect(page.locator('#challengeGrid .mountain')).toHaveCount(13);
 await expect(page.locator('#challengeGrid .mountain:disabled')).toHaveCount(0);
 await page.locator('#challengeGrid .mountain').nth(12).click();
 await expect(page.locator('#gameScreen')).toBeVisible();
 await expect(page.locator('#subtitle')).toHaveText('The Phantom Crater');
 await expect(page.locator('#timerStat')).toHaveText('⏱️ 1:00');
 await expect(page.locator('#coyoteStat')).toHaveText('🐺 15');
 expect(await page.evaluate(()=>({challengeMode,levelIndex,unlocked,cleared}))).toEqual({challengeMode:true,levelIndex:12,unlocked:1,cleared:0});
});

test('Challenge flag has three immovable villagers with exactly one reachable entrance',async({page})=>{
 await page.goto('/');
 await page.locator('#challengeBtn').click();
 await page.locator('#challengeGrid .mountain').first().click();
 const data=await page.evaluate(()=>{
  const around=[
   {x:CHALLENGE_GOAL.x+1,y:CHALLENGE_GOAL.y},
   {x:CHALLENGE_GOAL.x-1,y:CHALLENGE_GOAL.y},
   {x:CHALLENGE_GOAL.x,y:CHALLENGE_GOAL.y+1},
   {x:CHALLENGE_GOAL.x,y:CHALLENGE_GOAL.y-1}
  ];
  return {villagers:villagers.size,guarded:around.filter(p=>villagers.has(key(p.x,p.y))).length,
    open:around.filter(p=>!villagers.has(key(p.x,p.y))),
    entryReachable:connected(START,challengeEntrance),flagReachable:connected(START,CHALLENGE_GOAL),
    shown:document.querySelectorAll('#field .villager').length,
    exits:document.querySelectorAll('#field .exit').length,
    guardsBlocked:[...villagers].every(k=>{const [x,y]=k.split(',').map(Number);return blocked(x,y);})};
 });
 expect(data.villagers).toBe(3);
 expect(data.guarded).toBe(3);
 expect(data.open).toHaveLength(1);
 expect(data.entryReachable).toBe(true);
 expect(data.flagReachable).toBe(true);
 expect(data.shown).toBe(3);
 expect(data.exits).toBe(1);
 expect(data.guardsBlocked).toBe(true);
});

test('Challenge spawning always provides fifteen unique reachable coyotes on all 13 levels',async({page})=>{
 await page.goto('/');
 await page.locator('#challengeBtn').click();
 await page.locator('#challengeGrid .mountain').first().click();
 const states=await page.evaluate(()=>{
  return LEVELS.slice(0,13).map((cfg,i)=>{
   loadLevel(i);
   return {count:coyotes.length,unique:new Set(coyotes.map(c=>key(c.x,c.y))).size,
     valid:coyotes.every(c=>!blocked(c.x,c.y)&&connected(START,c)&&!same(c,START)&&!same(c,activeGoal())),
     clock:timeRemainingMs,reachable:connected(START,challengeEntrance),chests:chests.size};
  });
 });
 for(const state of states){
  expect(state.count).toBe(15);
  expect(state.unique).toBe(15);
  expect(state.valid).toBe(true);
  expect(state.clock).toBeGreaterThanOrEqual(59900);
  expect(state.clock).toBeLessThanOrEqual(60000);
  expect(state.reachable).toBe(true);
  expect(state.chests).toBe(0);
 }
});

test('Villagers cannot be crossed and Challenge victory does not change campaign progress',async({page})=>{
 await page.goto('/');
 await page.locator('#challengeBtn').click();
 await page.locator('#challengeGrid .mountain').nth(9).click();
 const before=await page.evaluate(()=>({unlocked,cleared,inventory:JSON.stringify(inventory)}));
 const guard=await page.evaluate(()=>{
  const [x,y]=[...villagers][0].split(',').map(Number);
  const neighborsOfGuard=[{x:x+1,y},{x:x-1,y},{x,y:y+1},{x,y:y-1}];
  const near=neighborsOfGuard.find(p=>inside(p.x,p.y)&&!blocked(p.x,p.y));
  runner={...near};draw();
  return {before:{...near},dx:x-near.x,dy:y-near.y};
 });
 await page.evaluate(({dx,dy})=>move(dx,dy),guard);
 expect(await page.evaluate(()=>({...runner}))).toEqual(guard.before);
 await page.evaluate(()=>{
  runner={...challengeEntrance};
  coyotes=[];draw();
  move(CHALLENGE_GOAL.x-challengeEntrance.x,CHALLENGE_GOAL.y-challengeEntrance.y);
 });
 await expect(page.locator('#resultTitle')).toContainText('CHALLENGE CONQUERED');
 await expect(page.locator('#challengeChoose')).toBeVisible();
 expect(await page.evaluate(()=>({unlocked,cleared,inventory:JSON.stringify(inventory)}))).toEqual(before);
 expect(await page.evaluate(()=>challengeWins.has(9))).toBe(true);
 await page.locator('#challengeChoose').click();
 await expect(page.locator('#challengeGrid .mountain').nth(9)).toHaveClass(/done/);
 await page.reload();
 await page.locator('#challengeBtn').click();
 await expect(page.locator('#challengeGrid .mountain').nth(9)).toHaveClass(/done/);
});

test('Challenge timeout triggers coyote invasion and retry resets one-minute timer and guards',async({page})=>{
 await page.goto('/');
 await page.locator('#challengeBtn').click();
 await page.locator('#challengeGrid .mountain').first().click();
 await expect(page.locator('#timerTrack')).toHaveAttribute('aria-valuemax','60');
 await page.evaluate(()=>{timerDeadline=Date.now()-10;tickTimer();});
 await expect(page.locator('#resultTitle')).toContainText('COYOTE INVASION');
 await expect(page.locator('#resultBody')).toContainText('60 seconds');
 await page.locator('#retry').click();
 await expect(page.locator('#timerStat')).toHaveText('⏱️ 1:00');
 await expect(page.locator('#coyoteStat')).toHaveText('🐺 15');
 await expect(page.locator('#field .villager')).toHaveCount(3);
});

test('Leaving Challenge Mode restores normal Adventure timer and story map locks',async({page})=>{
 await page.goto('/');
 await page.locator('#challengeBtn').click();
 await page.locator('#challengeGrid .mountain').nth(11).click();
 await page.locator('#gameBackBtn').click();
 await expect(page.locator('#challengeScreen')).toBeVisible();
 await page.locator('#challengeScreen .topbar button').first().click();
 await expect(page.locator('#homeScreen')).toBeVisible();
 await page.locator('#playBtn').click();
 await expect(page.locator('#timerStat')).toHaveText('⏱️ 3:00');
 await expect(page.locator('#coyoteStat')).toHaveText('🐺 1');
 await expect(page.locator('#field .villager')).toHaveCount(0);
 await page.locator('#gameBackBtn').click();
 await expect(page.locator('#mapScreen')).toBeVisible();
 await expect(page.locator('.mountain:disabled')).toHaveCount(9);
});

test('Reset Coyotes from the mountain map preserves all saved Adventure progress',async({page})=>{
 await page.addInitScript(()=>{
  localStorage.setItem('gray-sentinel-mountain-unlocked-v1','7');
  localStorage.setItem('gray-sentinel-mountain-cleared-v1','6');
  localStorage.setItem('gray-coyote-mountains-secret-found-v1','true');
  localStorage.setItem('gray-coyote-mountains-treasure-v1',JSON.stringify({crystal:3,berry:2,bell:1,acorn:4}));
 });
 await page.goto('/');
 await page.locator('#homeScreen button').filter({hasText:'Mountain Map'}).click();
 await expect(page.locator('#progress')).toContainText('🐺 7 coyotes');
 await page.locator('#resetCoyotesMap').click();
 await expect(page.locator('#progress')).toContainText('🐺 1 coyotes');
 await expect(page.locator('.mountain:not(:disabled)')).toHaveCount(8);
 const state=await page.evaluate(()=>({
  coyotes:coyoteCount(),
  reset:localStorage.getItem(COYOTE_RESET_KEY),
  unlocked,cleared,secretUnlocked,inventory
 }));
 expect(state.coyotes).toBe(1);
 expect(state.reset).toBe('6');
 expect(state.unlocked).toBe(7);
 expect(state.cleared).toBe(6);
 expect(state.secretUnlocked).toBe(true);
 expect(state.inventory).toEqual({crystal:3,berry:2,bell:1,acorn:4});
 await page.reload();
 await page.locator('#homeScreen button').filter({hasText:'Mountain Map'}).click();
 await expect(page.locator('#progress')).toContainText('🐺 1 coyotes');
 await page.locator('.mountain').nth(6).click();
 await expect(page.locator('#coyoteStat')).toHaveText('🐺 1');
});

test('Reset button in an active Adventure immediately removes extra coyotes without restarting timer',async({page})=>{
 await page.addInitScript(()=>{
  localStorage.setItem('gray-sentinel-mountain-unlocked-v1','5');
  localStorage.setItem('gray-sentinel-mountain-cleared-v1','4');
 });
 await page.goto('/');
 await page.locator('#playBtn').click();
 await expect(page.locator('#coyoteStat')).toHaveText('🐺 5');
 await page.evaluate(()=>{timeRemainingMs=90000;timerDeadline=Date.now()+90000;tickTimer();});
 await page.locator('#resetCoyotesGame').click();
 await expect(page.locator('#coyoteStat')).toHaveText('🐺 1');
 await expect(page.locator('#field .coyote')).toHaveCount(1);
 await expect(page.locator('#message')).toContainText('Pack reset to ONE coyote');
 expect(await page.evaluate(()=>timeRemainingMs)).toBeGreaterThan(85000);
 expect(await page.evaluate(()=>({cleared,unlocked,lives}))).toEqual({cleared:4,unlocked:5,lives:3});
 await page.locator('#retry').click();
 await expect(page.locator('#coyoteStat')).toHaveText('🐺 1');
});

test('After coyote reset, new first-time mountain wins gradually add coyotes again',async({page})=>{
 await page.addInitScript(()=>{
  localStorage.setItem('gray-sentinel-mountain-unlocked-v1','3');
  localStorage.setItem('gray-sentinel-mountain-cleared-v1','2');
 });
 await page.goto('/');
 await page.locator('#resetCoyotesHome').click();
 await expect(page.locator('#coyoteResetNotice')).toContainText('reset to one');
 await page.locator('#playBtn').click();
 await expect(page.locator('#coyoteStat')).toHaveText('🐺 1');
 await page.evaluate(()=>{runner={x:1,y:0};draw();});
 await page.getByRole('button',{name:'Move left'}).click();
 await expect(page.locator('#resultTitle')).toContainText('MOUNTAIN CLEARED');
 await page.locator('#next').click();
 await expect(page.locator('#coyoteStat')).toHaveText('🐺 2');
 await expect(page.evaluate(()=>localStorage.getItem(COYOTE_RESET_KEY))).resolves.toBe('2');
});

test('Challenge Mode ignores coyote reset and always patrols with fifteen',async({page})=>{
 await page.addInitScript(()=>{
  localStorage.setItem('gray-sentinel-mountain-unlocked-v1','7');
  localStorage.setItem('gray-sentinel-mountain-cleared-v1','6');
 });
 await page.goto('/');
 await page.locator('#resetCoyotesHome').click();
 await page.locator('#challengeBtn').click();
 await page.locator('#challengeGrid .mountain').nth(9).click();
 await expect(page.locator('#coyoteStat')).toHaveText('🐺 15');
 await expect(page.locator('#resetCoyotesGame')).toBeHidden();
 await page.evaluate(()=>resetCoyotePack());
 await expect(page.locator('#coyoteStat')).toHaveText('🐺 15');
 await page.locator('#retry').click();
 await expect(page.locator('#coyoteStat')).toHaveText('🐺 15');
 await page.locator('#gameBackBtn').click();
 await page.locator('#challengeScreen .topbar button').first().click();
 await page.locator('#playBtn').click();
 await expect(page.locator('#coyoteStat')).toHaveText('🐺 1');
});

test('Resetting while a time-out invasion is displayed keeps the invasion until retry',async({page})=>{
 await page.addInitScript(()=>{
  localStorage.setItem('gray-sentinel-mountain-unlocked-v1','5');
  localStorage.setItem('gray-sentinel-mountain-cleared-v1','4');
 });
 await page.goto('/');
 await page.locator('#playBtn').click();
 await page.evaluate(()=>{timerDeadline=Date.now()-10;tickTimer();});
 await expect(page.locator('#resultTitle')).toContainText('COYOTE INVASION');
 await expect(page.locator('#coyoteStat')).toHaveText('🐺 25');
 await page.locator('#resetCoyotesGame').click();
 await expect(page.locator('#coyoteStat')).toHaveText('🐺 25');
 await expect(page.locator('#message')).toContainText('Retry to clear the invasion');
 await page.locator('#retry').click();
 await expect(page.locator('#coyoteStat')).toHaveText('🐺 1');
});
