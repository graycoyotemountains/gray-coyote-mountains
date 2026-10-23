import {test,expect} from '@playwright/test';

// Completing the final step is deliberate: the game's real victory transition,
// save logic, map updates and expansion wrappers must all run.
async function winCurrentLevel(page){
 await page.evaluate(()=>{
  coyotes=[];
  runner={x:1,y:0};
  draw();
  move(-1,0);
 });
 await expect(page.locator('#resultTitle')).toContainText(/CLEARED|CONQUERED|MOUNTAINS/);
}

test('Replaying a cleared mountain grows the pack by one each time and persists',async({page})=>{
 await page.goto('/');
 await page.locator('#playBtn').click();
 await expect(page.locator('#coyoteStat')).toHaveText('🐺 1');
 await winCurrentLevel(page);
 await expect(page.locator('#coyoteStat')).toHaveText('🐺 2');
 await page.locator('#retry').click();
 await expect(page.locator('#coyoteStat')).toHaveText('🐺 2');
 await winCurrentLevel(page);
 await expect(page.locator('#coyoteStat')).toHaveText('🐺 3');
 expect(await page.evaluate(()=>({unlocked,cleared,wins:coyoteVictories}))).toEqual({unlocked:2,cleared:1,wins:2});
 await page.evaluate(()=>showScreen('map'));
 await expect(page.locator('#progress')).toContainText('🐺 3 coyotes');
 await page.reload();
 await page.locator('#playBtn').click();
 await expect(page.locator('#coyoteStat')).toHaveText('🐺 3');
 await page.evaluate(()=>showScreen('map'));
 await page.locator('#resetCoyotesMap').click();
 await expect(page.locator('#progress')).toContainText('🐺 1 coyotes');
 await page.locator('#mountainGrid .mountain').first().click();
 await expect(page.locator('#coyoteStat')).toHaveText('🐺 1');
 await winCurrentLevel(page);
 await expect(page.locator('#coyoteStat')).toHaveText('🐺 2');
 await page.locator('#retry').click();
 await expect(page.locator('#coyoteStat')).toHaveText('🐺 2');
});

test('Older reset saves migrate: a replay still adds a coyote',async({page})=>{
 await page.addInitScript(()=>{
  localStorage.setItem('gray-sentinel-mountain-unlocked-v1','7');
  localStorage.setItem('gray-sentinel-mountain-cleared-v1','6');
  localStorage.setItem('gray-coyote-mountains-reset-score-v1','6');
 });
 await page.goto('/');
 await page.locator('#playBtn').click();
 await expect(page.locator('#coyoteStat')).toHaveText('🐺 1');
 // Mountain 7 is new, so choose Mountain 1 which has already been cleared.
 await page.evaluate(()=>loadLevel(0));
 await winCurrentLevel(page);
 await expect(page.locator('#coyoteStat')).toHaveText('🐺 2');
 expect(await page.evaluate(()=>localStorage.getItem(COYOTE_WINS_KEY))).toBe('7');
 expect(await page.evaluate(()=>({cleared,unlocked,coyoteResetScore}))).toEqual({cleared:6,unlocked:7,coyoteResetScore:6});
 await page.reload();
 await page.locator('#playBtn').click();
 await expect(page.locator('#coyoteStat')).toHaveText('🐺 2');
});

test('Secret-level victories and secret replays also add one coyote',async({page})=>{
 await page.addInitScript(()=>{
  localStorage.setItem('gray-sentinel-mountain-unlocked-v1','5');
  localStorage.setItem('gray-sentinel-mountain-cleared-v1','4');
  localStorage.setItem('gray-coyote-mountains-secret-found-v1','true');
 });
 await page.goto('/');
 await page.evaluate(()=>loadLevel(SECRET_LEVEL));
 await expect(page.locator('#coyoteStat')).toHaveText('🐺 5');
 await winCurrentLevel(page);
 await expect(page.locator('#coyoteStat')).toHaveText('🐺 6');
 await page.locator('#retry').click();
 await expect(page.locator('#coyoteStat')).toHaveText('🐺 6');
 await winCurrentLevel(page);
 await expect(page.locator('#coyoteStat')).toHaveText('🐺 7');
 expect(await page.evaluate(()=>secretCleared)).toBe(true);
 await page.reload();
 await page.evaluate(()=>loadLevel(SECRET_LEVEL));
 await expect(page.locator('#coyoteStat')).toHaveText('🐺 7');
});

test('More than twelve victories create unique patrols and a high-count reset survives reload',async({page})=>{
 await page.addInitScript(()=>{
  localStorage.setItem('gray-sentinel-mountain-unlocked-v1','10');
  localStorage.setItem('gray-sentinel-mountain-cleared-v1','10');
  localStorage.setItem('gray-coyote-mountains-secret-found-v1','true');
  localStorage.setItem('gray-coyote-mountains-secret-cleared-v1','true');
 });
 await page.goto('/');
 await page.evaluate(()=>loadLevel(0));
 await expect(page.locator('#coyoteStat')).toHaveText('🐺 12');
 await winCurrentLevel(page);
 await page.locator('#retry').click();
 await expect(page.locator('#coyoteStat')).toHaveText('🐺 13');
 const positions=await page.evaluate(()=>({
  patrols:coyotes.length,
  cells:[...new Set(coyotes.map(p=>key(p.x,p.y)))].length,
  allReachable:coyotes.every(p=>!blocked(p.x,p.y)&&connected(START,p))
 }));
 expect(positions).toEqual({patrols:13,cells:13,allReachable:true});
 await winCurrentLevel(page);
 await page.locator('#retry').click();
 await expect(page.locator('#coyoteStat')).toHaveText('🐺 14');
 await page.locator('#resetCoyotesGame').click();
 await expect(page.locator('#coyoteStat')).toHaveText('🐺 1');
 expect(await page.evaluate(()=>coyoteResetScore)).toBe(13);
 await page.reload();
 await page.evaluate(()=>loadLevel(0));
 await expect(page.locator('#coyoteStat')).toHaveText('🐺 1');
 await winCurrentLevel(page);
 await expect(page.locator('#coyoteStat')).toHaveText('🐺 2');
});

test('Time-out and Challenge victories do not grow the Adventure pack',async({page})=>{
 await page.goto('/');
 await page.locator('#playBtn').click();
 await page.evaluate(()=>{timerDeadline=Date.now()-1;tickTimer();});
 expect(await page.evaluate(()=>coyoteVictories)).toBe(0);
 await page.evaluate(()=>showScreen('challenge'));
 await page.locator('#challengeGrid .mountain').first().click();
 await page.evaluate(()=>{coyotes=[];villagers.clear();runner={x:4,y:3};draw();move(-1,0);});
 expect(await page.evaluate(()=>({wins:coyoteVictories,pack:coyoteCount()}))).toEqual({wins:0,pack:1});
 // Leave Challenge Mode before selecting an Adventure mountain; the app
 // intentionally routes showScreen('map') to Challenge while that mode is active.
 await page.evaluate(()=>{challengeMode=false;showScreen('map');});
 await page.locator('#mountainGrid .mountain').first().click();
 await expect(page.locator('#coyoteStat')).toHaveText('🐺 1');
});
