import {test,expect} from '@playwright/test';
const secretSaves=()=>{
 localStorage.setItem('gray-coyote-mountains-secret-found-v1','true');
 localStorage.setItem('gray-coyote-mountains-extra-secrets-v1',JSON.stringify({unlocked:[true,true],cleared:[false,false]}));
};
async function winSecret(page,i){
 return page.evaluate(i=>{
  loadLevel(i);if(levelIndex!==i)throw Error('Secret level '+i+' inaccessible');
  runner={x:1,y:0};coyotes=[];draw();move(-1,0);
  return {won:i===10?secretCleared:mode==='won',levelIndex,unlocked:[...bonusUnlocked].sort((a,b)=>a-b)};
 },i);
}
async function enterSecretDoor(page){
 await page.evaluate(()=>{
  if(!secretChainDoor)throw Error('Secret door unavailable');
  const next=neighbors(secretChainDoor)[0];runner={...next};coyotes=[];draw();
  move(secretChainDoor.x-next.x,secretChainDoor.y-next.y);
 });
 await expect(page.locator('#secretBranchDialog')).toBeVisible();
}
test('ten regular branch mountains start locked and appear on the illustrated map',async({page})=>{
 await page.goto('/');
 expect(await page.evaluate(()=>LEVELS.length)).toBe(24);
 await page.locator('#homeScreen button').filter({hasText:'Mountain Map'}).click();
 const cards=page.locator('#bonusExpeditionGrid button');
 await expect(cards).toHaveCount(10);
 await expect(page.locator('#bonusExpeditionGrid button:disabled')).toHaveCount(10);
 await expect(page.locator('#bonusExpeditionProgress')).toContainText('0/10 tunnels discovered');
 await expect(page.locator('#bonusExpeditionPanel')).toContainText('Mountain Tunnel Trails');
 const result=await page.evaluate(()=>({
  width:document.documentElement.scrollWidth,screen:innerWidth,
  labels:[...document.querySelectorAll('#bonusExpeditionGrid strong')].map(x=>x.textContent)
 }));
 expect(result.width).toBeLessThanOrEqual(result.screen+2);
 expect(new Set(result.labels).size).toBe(10);
});
test('Hollow victory still goes directly to Mistveil, but no longer unlocks Echo Fern',async({page})=>{
 await page.addInitScript(secretSaves);
 await page.goto('/');
 await page.locator('#playBtn').click();
 const result=await winSecret(page,10);
 expect(result.won).toBe(true);
 expect(result.levelIndex).toBe(14);
 expect(result.unlocked).toEqual([14]);
 expect(JSON.parse(await page.evaluate(()=>localStorage.getItem(BONUS_KEY))).unlocked).toEqual([14]);
 await page.reload();
 await page.locator('#homeScreen button').filter({hasText:'Mountain Map'}).click();
 const cards=page.locator('#bonusExpeditionGrid button');
 await expect(cards.first()).toBeEnabled();
 await expect(cards.nth(1)).toBeDisabled();
 await expect(page.locator('#bonusExpeditionProgress')).toContainText('1/10 tunnels discovered');
});
test('winning other secret worlds no longer automatically unlocks regular tunnel levels',async({page})=>{
 await page.addInitScript(secretSaves);
 await page.goto('/');
 await page.locator('#playBtn').click();
 for(const i of [10,11,12])expect((await winSecret(page,i)).won).toBe(true);
 expect(await page.evaluate(()=>[...bonusUnlocked].sort((a,b)=>a-b))).toEqual([14]);
 await page.reload();
 await page.locator('#homeScreen button').filter({hasText:'Mountain Map'}).click();
 const cards=page.locator('#bonusExpeditionGrid button');
 await expect(cards.first()).toBeEnabled();
 for(let i=1;i<10;i++)await expect(cards.nth(i)).toBeDisabled();
});
test('players with old secret-victory saves keep their previously earned five branches',async({page})=>{
 await page.addInitScript(()=>{
  localStorage.setItem('gray-coyote-mountains-secret-cleared-v1','true');
  localStorage.setItem('gray-coyote-mountains-extra-secrets-v1',JSON.stringify({unlocked:[true,true],cleared:[true,true]}));
 });
 await page.goto('/');
 expect(await page.evaluate(()=>[...bonusUnlocked].sort((a,b)=>a-b))).toEqual([14,15,16,17,18]);
 expect(await page.evaluate(()=>localStorage.getItem(TUNNEL_MIGRATION_KEY))).toBe('true');
 expect(JSON.parse(await page.evaluate(()=>localStorage.getItem(BONUS_KEY))).unlocked).toEqual([14,15,16,17,18]);
 await page.reload();
 await page.locator('#homeScreen button').filter({hasText:'Mountain Map'}).click();
 const cards=page.locator('#bonusExpeditionGrid button');
 for(let i=0;i<5;i++)await expect(cards.nth(i)).toBeEnabled();
 for(let i=5;i<10;i++)await expect(cards.nth(i)).toBeDisabled();
});
test('true secret doors lead only to the next true secret world, never to regular branches',async({page})=>{
 await page.addInitScript(secretSaves);
 await page.goto('/');
 await page.locator('#playBtn').click();
 await page.evaluate(()=>loadLevel(10));
 await enterSecretDoor(page);
 await expect(page.locator('#secretBonusChoices button')).toHaveCount(0);
 await expect(page.locator('#secretBonusChoices')).toContainText('Regular tunnel branches');
 await page.locator('#secretExistingChoices button').click();
 expect(await page.evaluate(()=>levelIndex)).toBe(11);
 await expect(page.locator('#secretBranchDialog')).not.toBeVisible();
 await enterSecretDoor(page);
 await page.locator('#secretExistingChoices button').click();
 expect(await page.evaluate(()=>levelIndex)).toBe(12);
});
test('all previously created regular levels retain fact chests and return tunnels',async({page})=>{
 await page.addInitScript(()=>localStorage.setItem('gray-coyote-mountains-branch-expeditions-v1',JSON.stringify({unlocked:[14,15,16,17,18],cleared:[]})));
 await page.goto('/');
 const rows=await page.evaluate(()=>{
  const all=[];
  for(let i=14;i<=18;i++){
   loadLevel(i);
   all.push({i,actual:levelIndex,route:connected(START,GOAL),tiles:document.querySelectorAll('#field .tile').length,
    returnTunnel:Boolean(returnTunnel),secret:Boolean(secretChainDoor),chests:chests.size,fact:[...chests.values()].includes('fact')});
  }
  return all;
 });
 for(const row of rows){
  expect(row.actual).toBe(row.i);
  expect(row.route).toBe(true);
  expect(row.tiles).toBe(252);
  expect(row.returnTunnel).toBe(true);
  expect(row.secret).toBe(false);
  expect(row.chests).toBe(3);
  expect(row.fact).toBe(true);
 }
});
test('a branch victory remains saved and does not alter the 13 Challenge mountains',async({page})=>{
 await page.addInitScript(()=>localStorage.setItem('gray-coyote-mountains-branch-expeditions-v1',JSON.stringify({unlocked:[14],cleared:[]})));
 await page.goto('/');await page.locator('#playBtn').click();
 await page.evaluate(()=>{loadLevel(14);runner={x:1,y:0};coyotes=[];draw();move(-1,0);});
 expect(await page.evaluate(()=>mode)).toBe('won');
 await expect(page.locator('#resultTitle')).toContainText('MOUNTAIN BRANCH');
 await page.reload();await page.locator('#homeScreen button').filter({hasText:'Mountain Map'}).click();
 await expect(page.locator('#bonusExpeditionGrid button').first()).toContainText('Cleared');
 await page.locator('#mapScreen .topbar button').first().click();
 await page.locator('#challengeBtn').click();
 await expect(page.locator('#challengeGrid .mountain')).toHaveCount(13);
});
