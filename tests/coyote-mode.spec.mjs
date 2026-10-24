import { test, expect } from '@playwright/test';

test('Coyote mode is playable and independent of Adventure and Challenge', async ({page})=>{
 await page.goto('/');
 await expect(page.locator('#coyoteModeBtn')).toBeVisible();
 await page.locator('#coyoteModeBtn').click();
 await expect(page.locator('#coyoteMapScreen')).toBeVisible();
 await page.locator('#coyoteMountainGrid .coyote-mountain-card').first().click();
 await expect(page.locator('#coyoteScreen')).toBeVisible();
 await expect(page.locator('#coyoteField .coyote-tile')).toHaveCount(252);
 await expect(page.locator('#coyoteLife')).toHaveText('🐾 Cubs calm');
 await expect(page.locator('#coyotePeople')).toHaveText('🚶 0 visitors retreated');
 const start=await page.evaluate(()=>window.coyoteModeSnapshot());
 expect(start.phase).toBe('playing');
 expect(start.cubsCalm).toBe(true);
 expect(start.cubs).toHaveLength(2);
 await page.locator('#coyoteHome').click();
 await expect(page.locator('#coyoteMapScreen')).toBeVisible();
 await page.locator('#coyoteMapHome').click();
 await expect(page.locator('#homeScreen')).toBeVisible();
 await page.locator('#challengeBtn').click();
 await expect(page.locator('#challengeGrid .mountain')).toHaveCount(13);
 await page.locator('#challengeGrid .mountain').first().click();
 await expect(page.locator('#field .tile')).toHaveCount(252);
});

test('Reach the den without frightening either cub to win', async ({page})=>{
 await page.addInitScript(()=>{Math.random=()=>0.5;});

 await page.goto('/');
 await page.locator('#coyoteModeBtn').click();
 await expect(page.locator('#coyoteMapScreen')).toBeVisible();
 await page.locator('#coyoteMountainGrid .coyote-mountain-card').first().click();
 // Safe marked trail: row 12 from column 1 to 16, then up column 16 to the den.
 for(let i=0;i<15;i++)await page.keyboard.press('ArrowRight');
 for(let i=0;i<11;i++)await page.keyboard.press('ArrowUp');
 const result=await page.evaluate(()=>window.coyoteModeSnapshot());
 expect(result.position).toEqual({x:16,y:1});
 expect(result.cubsCalm).toBe(true);
 expect(result.scared).toBe(0); // Scaring any visitor is not a requirement.
 expect(result.phase).toBe('won');
 await expect(page.locator('#coyoteResultTitle')).toHaveText('🏆 SAFE AT THE DEN!');
 await page.reload();
 await page.locator('#coyoteModeBtn').click();
 await expect(page.locator('#coyoteMapScreen')).toBeVisible();
 await page.locator('#coyoteMountainGrid .coyote-mountain-card').first().click();
 expect((await page.evaluate(()=>window.coyoteModeSnapshot())).wins).toBeGreaterThanOrEqual(1);
});

test('A YIP next to the cubs frightens them and ends the run', async ({page})=>{
 await page.goto('/');
 await page.locator('#coyoteModeBtn').click();
 await expect(page.locator('#coyoteMapScreen')).toBeVisible();
 await page.locator('#coyoteMountainGrid .coyote-mountain-card').first().click();
 await page.locator('#coyoteYip').click();
 const s=await page.evaluate(()=>window.coyoteModeSnapshot());
 expect(s.cubsCalm).toBe(false);
 expect(s.phase).toBe('lost');
 await expect(page.locator('#coyoteResultBody')).toContainText('cub');
 await page.locator('#coyoteRetry').click();
 await expect(page.locator('#coyoteLife')).toHaveText('🐾 Cubs calm');
 expect((await page.evaluate(()=>window.coyoteModeSnapshot())).phase).toBe('playing');
});

test('A distant YIP makes a visitor flee without upsetting the cubs', async ({page})=>{
 await page.addInitScript(()=>{Math.random=()=>0.5;});

 await page.goto('/');
 await page.locator('#coyoteModeBtn').click();
 await expect(page.locator('#coyoteMapScreen')).toBeVisible();
 await page.locator('#coyoteMountainGrid .coyote-mountain-card').first().click();
 for(let i=0;i<6;i++)await page.keyboard.press('ArrowRight');
 await page.keyboard.press('ArrowUp');
 const before=await page.evaluate(()=>window.coyoteModeSnapshot());
 expect(before.position).toEqual({x:7,y:11});
 expect(before.cubsCalm).toBe(true);
 await page.locator('#coyoteYip').click();
 const after=await page.evaluate(()=>window.coyoteModeSnapshot());
 expect(after.phase).toBe('playing');
 expect(after.cubsCalm).toBe(true);
 expect(after.scared).toBe(1);
 expect(after.people.filter(p=>p.active)).toHaveLength(before.people.length);
 expect(after.people.some(p=>p.scared>0)).toBe(true);
 await expect(page.locator('#coyotePeople')).toHaveText('🚶 1 visitor retreated');
});

test('Phone mode has no horizontal overflow and uses touch movement buttons', async ({page})=>{
 await page.goto('/');
 await page.locator('#coyoteModeBtn').click();
 await expect(page.locator('#coyoteMapScreen')).toBeVisible();
 await page.locator('#coyoteMountainGrid .coyote-mountain-card').first().click();
 const measurement=await page.evaluate(()=>({
  doc:document.documentElement.scrollWidth, width:innerWidth,
  tiles:document.querySelectorAll('#coyoteField .coyote-tile').length
 }));
 expect(measurement.doc).toBeLessThanOrEqual(measurement.width+2);
 expect(measurement.tiles).toBe(252);
 await page.locator('#coyoteScreen [data-dx="1"]').click();
 expect((await page.evaluate(()=>window.coyoteModeSnapshot())).position).toEqual({x:2,y:12});
});


test('Six unique coyote mountains render in a phone-friendly selector',async({page})=>{
 await page.goto('/');
 await page.locator('#coyoteModeBtn').click();
 await expect(page.locator('#coyoteMapScreen')).toBeVisible();
 const cards=page.locator('#coyoteMountainGrid .coyote-mountain-card');
 await expect(cards).toHaveCount(6);
 await expect(cards.first()).toBeEnabled();
 await expect(cards.nth(1)).toBeDisabled();
 await expect(cards.last()).toBeDisabled();
 const levels=await page.evaluate(()=>window.coyoteMountainDefinitions());
 expect(levels).toHaveLength(6);
 expect(new Set(levels.map(level=>level.name)).size).toBe(6);
 expect(new Set(levels.map(level=>level.habitat)).size).toBe(6);
 expect(new Set(levels.map(level=>level.duration)).size).toBe(6);
 const measures=await page.evaluate(()=>({documentWidth:document.documentElement.scrollWidth,viewportWidth:window.innerWidth}));
 expect(measures.documentWidth).toBeLessThanOrEqual(measures.viewportWidth+2);
 await page.locator('#coyoteMapHome').click();
 await expect(page.locator('#homeScreen')).toBeVisible();
});

test('Completing first mountain unlocks the second and persists after reload',async({page})=>{
 await page.addInitScript(()=>{Math.random=()=>0.5;});

 await page.goto('/');
 await page.locator('#coyoteModeBtn').click();
 await page.locator('#coyoteMountainGrid .coyote-mountain-card').first().click();
 for(let i=0;i<15;i++)await page.keyboard.press('ArrowRight');
 for(let i=0;i<11;i++)await page.keyboard.press('ArrowUp');
 const first=await page.evaluate(()=>window.coyoteModeSnapshot());
 expect(first.phase).toBe('won');
 expect(first.unlockedMountain).toBe(2);
 expect(first.clearedMountains).toContain(0);
 await expect(page.locator('#coyoteNext')).toBeVisible();
 await page.locator('#coyoteHome').click();
 const cards=page.locator('#coyoteMountainGrid .coyote-mountain-card');
 await expect(cards.nth(1)).toBeEnabled();
 await expect(cards.nth(2)).toBeDisabled();
 await expect(cards.first()).toContainText('Completed');
 await page.reload();
 await page.locator('#coyoteModeBtn').click();
 await expect(cards.nth(1)).toBeEnabled();
 await cards.nth(1).click();
 const second=await page.evaluate(()=>window.coyoteModeSnapshot());
 expect(second.mountain).toBe(1);
 expect(second.position).toEqual({x:16,y:12});
 expect(second.den).toEqual({x:1,y:1});
 expect(second.habitat).toBe('marsh');
 await expect(page.locator('#coyoteField .coyote-tile')).toHaveCount(252);
 await expect(page.locator('#coyoteTime')).toContainText('⏱️ 2:');
});

test('All six mountains have safe den routes and do not modify Adventure saves',async({page})=>{
 await page.addInitScript(()=>{Math.random=()=>0.5;});

 test.setTimeout(120000);
 await page.addInitScript(()=>{
  localStorage.setItem('gray-coyote-mountains-coyote-unlocked-v1','6');
 });
 await page.goto('/');
 const before=await page.evaluate(()=>({
  adventure:localStorage.getItem('gray-sentinel-mountain-unlocked-v1'),
  coyotePack:localStorage.getItem('gray-sentinel-coyote-victories-v1')
 }));
 await page.locator('#coyoteModeBtn').click();
 const cards=page.locator('#coyoteMountainGrid .coyote-mountain-card');
 for(let index=0;index<6;index++){
  await cards.nth(index).click();
  const current=await page.evaluate(()=>window.coyoteModeSnapshot());
  // Deterministic AI makes these genuinely playable routes repeatable in CI.
  // The last three require a different trail or a carefully timed YIP.
  const direction=current.position.x===1?'ArrowRight':'ArrowLeft';
  const route=index===3||index===4?
   [...Array(11).fill('ArrowUp'),...Array(15).fill(direction)]:
   index===5?
   [...Array(8).fill(direction),...Array(11).fill('ArrowUp'),...Array(7).fill(direction)]:
   [...Array(15).fill(direction),...Array(11).fill('ArrowUp')];
  for(let step=0;step<route.length;step++){
   await page.keyboard.press(route[step]);
   if((index===4&&step===4)||(index===5&&step===6))
    await page.locator('#coyoteYip').click();
  }
  const result=await page.evaluate(()=>window.coyoteModeSnapshot());
  expect(result.phase,'Mountain '+(index+1)+' should have a safe route').toBe('won');
  expect(result.cubsCalm).toBe(true);
  expect(result.scared).toBe(0);
  await page.locator('#coyoteHome').click();
 }
 await expect(cards).toHaveCount(6);
 await expect(cards.filter({hasText:'Completed'})).toHaveCount(6);
 const after=await page.evaluate(()=>({
  adventure:localStorage.getItem('gray-sentinel-mountain-unlocked-v1'),
  coyotePack:localStorage.getItem('gray-sentinel-coyote-victories-v1')
 }));
 expect(after).toEqual(before);
});

test('A later mountain preserves its own obstacles, den and optional ranger encounters',async({page})=>{
 await page.addInitScript(()=>localStorage.setItem('gray-coyote-mountains-coyote-unlocked-v1','6'));
 await page.goto('/');
 await page.locator('#coyoteModeBtn').click();
 await page.locator('#coyoteMountainGrid .coyote-mountain-card').nth(5).click();
 const s=await page.evaluate(()=>window.coyoteModeSnapshot());
 expect(s.mountain).toBe(5);
 expect(s.people).toHaveLength(5);
 expect(s.position).toEqual({x:16,y:12});
 expect(s.den).toEqual({x:1,y:1});
 await expect(page.locator('#coyoteScreen')).toHaveAttribute('data-habitat','summit');
 await expect(page.locator('#coyoteField .coyote-tile')).toHaveCount(252);
 await page.locator('#coyoteRetry').click();
 expect((await page.evaluate(()=>window.coyoteModeSnapshot())).mountain).toBe(5);
 await page.locator('#coyoteHome').click();
 await expect(page.locator('#coyoteMapScreen')).toBeVisible();
});


test('Rangers and visitors move one obstacle-aware square every few coyote steps',async({page})=>{
 await page.addInitScript(()=>{Math.random=()=>0.5;});
 await page.goto('/');
 await page.locator('#coyoteModeBtn').click();
 await page.locator('#coyoteMountainGrid .coyote-mountain-card').first().click();
 const start=await page.evaluate(()=>window.coyoteModeSnapshot());
 const patrolSpeed=(await page.evaluate(()=>window.coyoteMountainDefinitions()))[0].speed;
 expect(patrolSpeed).toBe(3);
 for(let i=1;i<patrolSpeed;i++){
  await page.keyboard.press('ArrowRight');
  const intermediate=await page.evaluate(()=>window.coyoteModeSnapshot());
  expect(intermediate.people.map(p=>[p.x,p.y])).toEqual(start.people.map(p=>[p.x,p.y]));
 }
 await page.keyboard.press('ArrowRight');
 const after=await page.evaluate(()=>window.coyoteModeSnapshot());
 const moved=after.people.filter((p,i)=>Math.abs(p.x-start.people[i].x)+Math.abs(p.y-start.people[i].y)===1);
 expect(moved.length).toBeGreaterThan(0);
 for(let i=0;i<after.people.length;i++){
  const dist=Math.abs(after.people[i].x-start.people[i].x)+Math.abs(after.people[i].y-start.people[i].y);
  expect(dist).toBeLessThanOrEqual(1);
 }
 expect(after.phase).toBe('playing');
 const rangerBefore=start.people[0],rangerAfter=after.people[0];
 const fromDist=Math.abs(rangerBefore.x-after.position.x)+Math.abs(rangerBefore.y-after.position.y);
 const toDist=Math.abs(rangerAfter.x-after.position.x)+Math.abs(rangerAfter.y-after.position.y);
 expect(toDist).toBeLessThan(fromDist); // alert radius: ranger follows adult coyote
});

test('All six maps use the Adventure coyote movement cadence',async({page})=>{
 await page.addInitScript(()=>localStorage.setItem('gray-coyote-mountains-coyote-unlocked-v1','6'));
 await page.goto('/');
 await page.locator('#coyoteModeBtn').click();
 const defs=await page.evaluate(()=>window.coyoteMountainDefinitions());
 expect(defs.map(d=>d.speed)).toEqual([3,3,3,2,2,2]);
 expect(defs.map(d=>d.alert)).toEqual([5,5,6,6,7,7]);
 for(let i=0;i<6;i++){
  await page.locator('#coyoteMountainGrid .coyote-mountain-card').nth(i).click();
  const start=await page.evaluate(()=>window.coyoteModeSnapshot());
  const direction=start.position.x===1?'ArrowRight':'ArrowLeft';
  await page.keyboard.press(direction);
  const after=await page.evaluate(()=>window.coyoteModeSnapshot());
  // No human teleports: all remain at most one square from their initial spots.
  for(let p=0;p<start.people.length;p++){
   const travel=Math.abs(after.people[p].x-start.people[p].x)+Math.abs(after.people[p].y-start.people[p].y);
   expect(travel).toBeLessThanOrEqual(1);
  }
  await page.locator('#coyoteHome').click();
 }
});
