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
 await expect(page.locator('#homeScreen')).toBeVisible();
 await page.locator('#challengeBtn').click();
 await expect(page.locator('#challengeGrid .mountain')).toHaveCount(13);
 await page.locator('#challengeGrid .mountain').first().click();
 await expect(page.locator('#field .tile')).toHaveCount(252);
});

test('Reach the den without frightening either cub to win', async ({page})=>{
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

test('A distant YIP clears a visitor without upsetting the cubs', async ({page})=>{
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
  if(current.position.x===1){
   for(let i=0;i<15;i++)await page.keyboard.press('ArrowRight');
   for(let i=0;i<11;i++)await page.keyboard.press('ArrowUp');
  }else{
   for(let i=0;i<15;i++)await page.keyboard.press('ArrowLeft');
   for(let i=0;i<11;i++)await page.keyboard.press('ArrowUp');
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
