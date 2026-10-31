import {test,expect} from '@playwright/test';
const unlockNormal=()=>{
 localStorage.setItem('gray-sentinel-mountain-unlocked-v1','10');
 localStorage.setItem('gray-sentinel-mountain-cleared-v1','9');
};
const pairs=[[0,14],[1,19],[2,15],[3,20],[4,16],[5,21],[6,17],[7,22],[8,18],[9,23]];

test('the ten regular tunnel branch mountains appear on a portrait map with no horizontal scroll',async({page})=>{
 await page.goto('/');
 await page.locator('#homeScreen button').filter({hasText:'Mountain Map'}).click();
 const map=page.locator('#bonusExpeditionGrid');
 await expect(map.locator('.bonus-expedition-route')).toHaveCount(10);
 await expect(map.locator('.bonus-expedition-route:disabled')).toHaveCount(10);
 await expect(page.locator('#bonusExpeditionPanel')).toContainText('Ten regular side mountains');
 const layout=await map.evaluate(el=>({
  image:getComputedStyle(el).backgroundImage,height:el.getBoundingClientRect().height,
  pageWidth:document.documentElement.scrollWidth,width:innerWidth,
  positions:[...el.querySelectorAll('button')].map(b=>{
   const r=b.getBoundingClientRect();return {left:r.left,right:r.right,y:r.top+scrollY+r.height/2};
  })
 }));
 expect(layout.image).toContain('ten-hidden-peaks.svg');
 expect(layout.height).toBeGreaterThan(2400);
 expect(layout.pageWidth).toBeLessThanOrEqual(layout.width+2);
 for(let j=0;j<10;j++){
  const p=layout.positions[j];
  expect(p.left).toBeGreaterThanOrEqual(0);
  expect(p.right).toBeLessThanOrEqual(layout.width+2);
  if(j)expect(p.y).toBeGreaterThan(layout.positions[j-1].y+135);
 }
 await page.locator('button.bonus-map-jump').click();
 await expect.poll(()=>page.evaluate(()=>scrollY)).toBeGreaterThan(1700);
 await expect(page.locator('#mountainGrid .mountain')).toHaveCount(10);
});

test('all ten regular Mountains have a tunnel and each tunnel unlocks the correct permanent branch',async({page})=>{
 test.setTimeout(120000);
 await page.addInitScript(unlockNormal);
 await page.goto('/');
 await page.locator('#playBtn').click();
 for(const [normal,bonus] of pairs){
  const state=await page.evaluate(normal=>{
   loadLevel(normal);
   if(levelIndex!==normal)throw Error('Mountain inaccessible');
   if(!normalBonusTunnel)throw Error('Missing regular tunnel on Mountain '+(normal+1));
   if(!connected(START,normalBonusTunnel))throw Error('Tunnel unreachable');
   const from=neighbors(normalBonusTunnel)[0];
   if(!from)throw Error('Tunnel lacks entry square');
   runner={...from};coyotes=[];draw();
   move(normalBonusTunnel.x-from.x,normalBonusTunnel.y-from.y);
   return {levelIndex,mode,unlocked:[...bonusUnlocked],returnTunnel,secretDoor:secretChainDoor,
    ambience:Boolean(secretAmbience),secretZone:document.getElementById('gameFrame').classList.contains('secret-zone'),
    hint:document.getElementById('gameHint').textContent};
  },normal);
  expect(state.levelIndex).toBe(bonus);
  expect(state.mode).toBe('playing');
  expect(state.unlocked).toContain(bonus);
  expect(state.returnTunnel).toBeTruthy();
  expect(state.secretDoor).toBeNull();
  expect(state.ambience).toBe(false);
  expect(state.secretZone).toBe(false);
  expect(state.hint).toContain('Regular branch mountain');
  await expect(page.locator('#field .tile')).toHaveCount(252);
 }
 await page.reload();
 await page.locator('#homeScreen button').filter({hasText:'Mountain Map'}).click();
 const cards=page.locator('#bonusExpeditionGrid button');
 for(let j=0;j<10;j++)await expect(cards.nth(j)).toBeEnabled();
 await expect(page.locator('#bonusExpeditionProgress')).toContainText('10/10 tunnels discovered');
});

test('branch return tunnels really bring the player back to the originating regular mountain',async({page})=>{
 await page.addInitScript(unlockNormal);
 await page.goto('/');
 await page.locator('#playBtn').click();
 for(const [normal,bonus] of [[0,14],[4,16],[9,23]]){
  const reached=await page.evaluate(([normal,bonus])=>{
   loadLevel(normal);
   const entrance=normalBonusTunnel;
   const from=neighbors(entrance)[0];runner={...from};coyotes=[];
   move(entrance.x-from.x,entrance.y-from.y);
   if(levelIndex!==bonus)throw Error('Wrong branch');
   const tunnel={...returnTunnel};
   const back=neighbors(tunnel)[0];runner={...back};coyotes=[];draw();
   move(tunnel.x-back.x,tunnel.y-back.y);
   return {levelIndex,mode,backTunnel:Boolean(normalBonusTunnel)};
  },[normal,bonus]);
  expect(reached).toMatchObject({levelIndex:normal,mode:'playing',backTunnel:true});
 }
});

test('all ten branch levels are ordinary playable levels with chests, flags and return tunnels',async({page})=>{
 await page.addInitScript(()=>{
  localStorage.setItem('gray-coyote-mountains-branch-expeditions-v1',JSON.stringify({unlocked:Array.from({length:10},(_,j)=>j+14),cleared:[]}));
 });
 await page.goto('/');
 const levels=await page.evaluate(()=>{
  const items=[];
  for(let i=14;i<24;i++){
   loadLevel(i);
   items.push({i,actual:levelIndex,mode,route:connected(START,GOAL),cells:document.querySelectorAll('#field .tile').length,
    chests:chests.size,fact:[...chests.values()].includes('fact'),returnTunnel,secretChainDoor,
    label:document.getElementById('mountainLabel').textContent,spooky:Boolean(secretAmbience)});
  }
  return items;
 });
 expect(levels).toHaveLength(10);
 for(const x of levels){
  expect(x.actual).toBe(x.i);
  expect(x.mode).toBe('playing');
  expect(x.route).toBe(true);
  expect(x.cells).toBe(252);
  expect(x.chests).toBe(3);
  expect(x.fact).toBe(true);
  expect(x.returnTunnel).toBeTruthy();
  expect(x.secretChainDoor).toBeNull();
  expect(x.label).toContain('REGULAR TUNNEL BRANCH');
  expect(x.spooky).toBe(false);
 }
});

test('branch victory saves permanent completion and the regular mountain styling',async({page})=>{
 await page.addInitScript(()=>{
  if(!localStorage.getItem('gray-coyote-mountains-branch-expeditions-v1'))
   localStorage.setItem('gray-coyote-mountains-branch-expeditions-v1',JSON.stringify({unlocked:[19],cleared:[]}));
 });
 await page.goto('/');
 await page.locator('#playBtn').click();
 await page.evaluate(()=>{loadLevel(19);coyotes=[];runner={x:1,y:0};draw();move(-1,0);});
 expect(await page.evaluate(()=>mode)).toBe('won');
 expect(await page.evaluate(()=>bonusCleared.has(19))).toBe(true);
 await expect(page.locator('#resultTitle')).toContainText('MOUNTAIN BRANCH');
 await page.reload();
 await page.locator('#homeScreen button').filter({hasText:'Mountain Map'}).click();
 await expect(page.locator('#bonusExpeditionGrid button').nth(5)).toContainText('Cleared');
 await expect(page.locator('#bonusExpeditionProgress')).toContainText('1/10 regular branches completed');
});

test('normal secret doors and Challenge Mode remain separate from the new tunnels',async({page})=>{
 await page.addInitScript(unlockNormal);
 await page.goto('/');
 await page.locator('#playBtn').click();
 for(const i of [4,6,8]){
  const state=await page.evaluate(i=>{
   loadLevel(i);
   return {tunnel:Boolean(normalBonusTunnel),secret:i===4?Boolean(SECRET_DOOR):Boolean(extraDoor)};
  },i);
  expect(state.tunnel).toBe(true);
  expect(state.secret).toBe(true);
 }
 await page.locator('#gameScreen button').filter({hasText:'Home'}).first().click();
 await page.locator('#challengeBtn').click();
 await expect(page.locator('#challengeGrid .mountain')).toHaveCount(13);
 await page.locator('#challengeGrid .mountain').nth(1).click();
 expect(await page.evaluate(()=>normalBonusTunnel)).toBeNull();
 await expect(page.locator('#field .tile')).toHaveCount(252);
});
