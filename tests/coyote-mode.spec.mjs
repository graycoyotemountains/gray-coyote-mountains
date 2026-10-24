import { test, expect } from '@playwright/test';

test('Coyote mode is playable and independent of Adventure and Challenge', async ({page})=>{
 await page.goto('/');
 await expect(page.locator('#coyoteModeBtn')).toBeVisible();
 await page.locator('#coyoteModeBtn').click();
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
 expect((await page.evaluate(()=>window.coyoteModeSnapshot())).wins).toBeGreaterThanOrEqual(1);
});

test('A YIP next to the cubs frightens them and ends the run', async ({page})=>{
 await page.goto('/');
 await page.locator('#coyoteModeBtn').click();
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
 const measurement=await page.evaluate(()=>({
  doc:document.documentElement.scrollWidth, width:innerWidth,
  tiles:document.querySelectorAll('#coyoteField .coyote-tile').length
 }));
 expect(measurement.doc).toBeLessThanOrEqual(measurement.width+2);
 expect(measurement.tiles).toBe(252);
 await page.locator('#coyoteScreen [data-dx="1"]').click();
 expect((await page.evaluate(()=>window.coyoteModeSnapshot())).position).toEqual({x:2,y:12});
});
