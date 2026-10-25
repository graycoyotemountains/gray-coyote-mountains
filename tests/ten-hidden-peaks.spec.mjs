import {test,expect} from '@playwright/test';
const unlockedTen=()=>{
 localStorage.setItem('gray-sentinel-mountain-unlocked-v1','10');
 localStorage.setItem('gray-sentinel-mountain-cleared-v1','9');
};
test('all ten extra peaks are on the illustrated mountain map, accessible without horizontal scrolling',async({page})=>{
 await page.goto('/');
 await page.locator('#homeScreen button').filter({hasText:'Mountain Map'}).click();
 const map=page.locator('#bonusExpeditionGrid');
 await expect(map.locator('.bonus-expedition-route')).toHaveCount(10);
 await expect(map.locator('.bonus-expedition-route:disabled')).toHaveCount(10);
 const info=await map.evaluate(el=>{
  const cards=[...el.querySelectorAll('button')].map(b=>{const r=b.getBoundingClientRect();return {x:r.x,right:r.right,centerY:r.y+scrollY+r.height/2};});
  const r=el.getBoundingClientRect();
  return {width:r.width,height:r.height,background:getComputedStyle(el).backgroundImage,bodyWidth:document.documentElement.scrollWidth,viewport:innerWidth,cards};
 });
 expect(info.background).toContain('ten-hidden-peaks.svg');
 expect(info.height).toBeGreaterThan(2400);
 expect(info.bodyWidth).toBeLessThanOrEqual(info.viewport+2);
 expect(info.cards).toHaveLength(10);
 for(let i=0;i<info.cards.length;i++){
  expect(info.cards[i].x).toBeGreaterThanOrEqual(0);
  expect(info.cards[i].right).toBeLessThanOrEqual(info.viewport+2);
  if(i)expect(info.cards[i].centerY).toBeGreaterThan(info.cards[i-1].centerY+140);
 }
 await page.locator('button.map-jump').filter({hasText:'See 10 extra peaks'}).click();
 await expect.poll(()=>page.evaluate(()=>scrollY)).toBeGreaterThan(1700);
 await expect(page.locator('#mountainGrid .mountain')).toHaveCount(10);
});

test('five existing extras retain their unlocks; new five require doors on normal peaks',async({page})=>{
 await page.addInitScript(()=>{
  localStorage.setItem('gray-coyote-mountains-secret-found-v1','true');
  localStorage.setItem('gray-coyote-mountains-secret-cleared-v1','true');
  localStorage.setItem('gray-coyote-mountains-extra-secrets-v1',JSON.stringify({unlocked:[true,true],cleared:[true,true]}));
 });
 await page.goto('/');
 await page.locator('#homeScreen button').filter({hasText:'Mountain Map'}).click();
 const cards=page.locator('#bonusExpeditionGrid button');
 await expect(cards).toHaveCount(10);
 for(let i=0;i<5;i++)await expect(cards.nth(i)).toBeEnabled();
 for(let i=5;i<10;i++)await expect(cards.nth(i)).toBeDisabled();
 await expect(page.locator('#bonusExpeditionProgress')).toContainText('5/10 unlocked');
});

test('each new secret door launches its own bonus mountain, with persistent unlocks',async({page})=>{
 test.setTimeout(110000);
 await page.addInitScript(unlockedTen);
 await page.goto('/');
 await page.locator('#playBtn').click();
 const pairs=[[1,19],[3,20],[5,21],[7,22],[9,23]];
 for(const [normal,bonus] of pairs){
  const result=await page.evaluate(normal=>{
   loadLevel(normal);
   if(levelIndex!==normal)throw Error('Normal level not loaded');
   if(!normalBonusDoor)throw Error('Normal bonus door absent');
   const from=neighbors(normalBonusDoor)[0];
   if(!from)throw Error('Hidden door unreachable');
   runner={...from};coyotes=[];draw();
   move(normalBonusDoor.x-from.x,normalBonusDoor.y-from.y);
   return {levelIndex,bonus:[...bonusUnlocked].sort((a,b)=>a-b),door:Boolean(normalBonusDoor),mode};
  },normal);
  expect(result.levelIndex).toBe(bonus);
  expect(result.bonus).toContain(bonus);
  expect(result.mode).toBe('playing');
  await expect(page.locator('#field .tile')).toHaveCount(252);
  await expect(page.locator('#subtitle')).not.toBeEmpty();
 }
 await page.reload();
 await page.locator('#homeScreen button').filter({hasText:'Mountain Map'}).click();
 const cards=page.locator('#bonusExpeditionGrid button');
 for(let i=5;i<10;i++)await expect(cards.nth(i)).toBeEnabled();
 await expect(page.locator('#bonusExpeditionProgress')).toContainText('5/10 unlocked');
 await cards.nth(9).click();
 expect(await page.evaluate(()=>levelIndex)).toBe(23);
});

test('five new mountains each have full playable board, collectible chests and flag route',async({page})=>{
 await page.addInitScript(()=>{
  localStorage.setItem('gray-coyote-mountains-branch-expeditions-v1',JSON.stringify({unlocked:[19,20,21,22,23],cleared:[]}));
 });
 await page.goto('/');
 const info=await page.evaluate(()=>{
  const items=[];
  for(let i=19;i<24;i++){
   loadLevel(i);
   items.push({index:levelIndex,title:LEVELS[i].name,mode,connected:connected(START,GOAL),
    tiles:document.querySelectorAll('#field .tile').length,
    chests:chests.size,door:secretChainDoor!==null,
    source:BONUS_PARENT[i],bonusLabel:document.getElementById('mountainLabel').textContent});
  }
  return items;
 });
 expect(info).toHaveLength(5);
 for(let n=0;n<5;n++){
  const i=info[n];
  expect(i.index).toBe(n+19);
  expect(i.mode).toBe('playing');
  expect(i.connected).toBe(true);
  expect(i.tiles).toBe(252);
  expect(i.chests).toBe(3);
  expect(i.door).toBe(true);
  expect(i.source).toBe([1,3,5,7,9][n]);
  expect(i.bonusLabel).toContain('/10');
 }
 expect(new Set(info.map(i=>i.title)).size).toBe(5);
});

test('winning a new bonus mountain persists its completed map status',async({page})=>{
 await page.addInitScript(()=>{
  if(!localStorage.getItem('gray-coyote-mountains-branch-expeditions-v1'))
   localStorage.setItem('gray-coyote-mountains-branch-expeditions-v1',JSON.stringify({unlocked:[19],cleared:[]}));
 });
 await page.goto('/');
 await page.locator('#playBtn').click();
 await page.evaluate(()=>{loadLevel(19);coyotes=[];runner={x:1,y:0};draw();move(-1,0);});
 expect(await page.evaluate(()=>mode)).toBe('won');
 expect(await page.evaluate(()=>bonusCleared.has(19))).toBe(true);
 await page.reload();
 await page.locator('#homeScreen button').filter({hasText:'Mountain Map'}).click();
 const marker=page.locator('#bonusExpeditionGrid button').nth(5);
 await expect(marker).toBeEnabled();
 await expect(marker).toContainText('Cleared');
 await expect(page.locator('#bonusExpeditionProgress')).toContainText('1/10 completed');
});

test('new normal mountain doors do not affect existing secret doors or Challenge Mode',async({page})=>{
 await page.addInitScript(unlockedTen);
 await page.goto('/');
 await page.locator('#playBtn').click();
 await page.evaluate(()=>loadLevel(4));
 expect(await page.evaluate(()=>normalBonusDoor)).toBeNull();
 await page.evaluate(()=>loadLevel(5)); // Mountain 6: new bonus door, no old portal.
 expect(await page.evaluate(()=>Boolean(normalBonusDoor))).toBe(true);
 expect(await page.evaluate(()=>extraDoor)).toBeNull();
 await page.evaluate(()=>loadLevel(6)); // Mountain 7: old Whispering Woods portal.
 expect(await page.evaluate(()=>Boolean(extraDoor))).toBe(true);
 expect(await page.evaluate(()=>normalBonusDoor)).toBeNull();
 await page.locator('#gameScreen button').filter({hasText:'Home'}).first().click();
 await page.locator('#challengeBtn').click();
 await expect(page.locator('#challengeGrid .mountain')).toHaveCount(13);
 await page.locator('#challengeGrid .mountain').nth(1).click();
 expect(await page.evaluate(()=>normalBonusDoor)).toBeNull();
 await expect(page.locator('#field .tile')).toHaveCount(252);
});
