import {test,expect} from '@playwright/test';
const secretSaves=()=>{
 localStorage.setItem('gray-coyote-mountains-secret-found-v1','true');
 localStorage.setItem('gray-coyote-mountains-extra-secrets-v1',JSON.stringify({unlocked:[true,true],cleared:[false,false]}));
};
const winSecret=async(page,i)=>{
 return page.evaluate(i=>{
  loadLevel(i);
  if(levelIndex!==i)throw Error('Secret not reachable: '+i);
  coyotes=[];runner={x:1,y:0};draw();
  move(-1,0);
  return {
   won:i===10?secretCleared:mode==='won',
   mode,levelIndex,unlocked:[...bonusUnlocked].sort((a,b)=>a-b)
  };
 },i);
};
const useDoor=async(page)=>{
 await page.evaluate(()=>{
  if(!secretChainDoor)throw Error('Door missing');
  const from=neighbors(secretChainDoor)[0];
  if(!from)throw Error('Door is inaccessible');
  runner={...from};coyotes=[];draw();
  move(secretChainDoor.x-from.x,secretChainDoor.y-from.y);
 });
 await expect(page.locator('#secretBranchDialog')).toBeVisible();
};
test('Five new bonus levels are individually locked and portrait map stays phone-friendly',async({page})=>{
 await page.goto('/');
 expect(await page.evaluate(()=>LEVELS.length)).toBe(19);
 await page.locator('#homeScreen button').filter({hasText:'Mountain Map'}).click();
 const cards=page.locator('#bonusExpeditionGrid .bonus-expedition-route');
 await expect(cards).toHaveCount(5);
 for(let i=0;i<5;i++)await expect(cards.nth(i)).toBeDisabled();
 await expect(page.locator('#bonusExpeditionProgress')).toContainText('0/5 unlocked');
 const data=await page.evaluate(()=>({
  width:document.documentElement.scrollWidth,screen:innerWidth,
  mapCards:document.querySelectorAll('#mountainGrid .mountain').length,
  labels:[...document.querySelectorAll('#bonusExpeditionGrid strong')].map(x=>x.textContent)
 }));
 expect(data.width).toBeLessThanOrEqual(data.screen+2);
 expect(data.mapCards).toBe(10);
 expect(new Set(data.labels).size).toBe(5);
});
test('Winning Hollow Mountain unlocks two new levels, persisted after reload',async({page})=>{
 await page.addInitScript(secretSaves);
 await page.goto('/');
 await page.locator('#playBtn').click();
 const state=await winSecret(page,10);
 expect(state.won).toBe(true);
 expect(state.levelIndex).toBe(14); // Immediate mandatory Hollow exit
 expect(state.mode).toBe('playing');
 expect(state.unlocked).toEqual([14,15]);
 expect(await page.evaluate(()=>JSON.parse(localStorage.getItem(BONUS_KEY)).unlocked)).toEqual([14,15]);
 await page.reload();
 await page.locator('#homeScreen button').filter({hasText:'Mountain Map'}).click();
 const cards=page.locator('#bonusExpeditionGrid .bonus-expedition-route');
 for(let i=0;i<2;i++)await expect(cards.nth(i)).toBeEnabled();
 for(let i=2;i<5;i++)await expect(cards.nth(i)).toBeDisabled();
 await expect(page.locator('#bonusExpeditionProgress')).toContainText('2/5 unlocked');
 await cards.first().click();
 expect(await page.evaluate(()=>levelIndex)).toBe(14);
 await expect(page.locator('#field .tile')).toHaveCount(252);
});
test('Winning all three secret worlds reveals exactly five new adventures',async({page})=>{
 await page.addInitScript(secretSaves);
 await page.goto('/');
 await page.locator('#playBtn').click();
 for(const i of [10,11,12])expect((await winSecret(page,i)).won).toBe(true);
 expect([...await page.evaluate(()=>[...bonusUnlocked].sort((a,b)=>a-b))]).toEqual([14,15,16,17,18]);
 await page.reload();
 await page.locator('#homeScreen button').filter({hasText:'Mountain Map'}).click();
 const buttons=page.locator('#bonusExpeditionGrid .bonus-expedition-route');
 await expect(buttons).toHaveCount(5);
 for(let i=0;i<5;i++)await expect(buttons.nth(i)).toBeEnabled();
 await expect(page.locator('#bonusExpeditionProgress')).toContainText('5/5 unlocked');
});
test('Previous secret victories automatically unlock their bonus branches',async({page})=>{
 await page.addInitScript(()=>{
  localStorage.setItem('gray-coyote-mountains-secret-found-v1','true');
  localStorage.setItem('gray-coyote-mountains-secret-cleared-v1','true');
  localStorage.setItem('gray-coyote-mountains-extra-secrets-v1',JSON.stringify({unlocked:[true,true],cleared:[true,true]}));
 });
 await page.goto('/');
 const unlocked=await page.evaluate(()=>[...bonusUnlocked].sort((a,b)=>a-b));
 expect(unlocked).toEqual([14,15,16,17,18]);
 await page.locator('#homeScreen button').filter({hasText:'Mountain Map'}).click();
 for(const b of await page.locator('#bonusExpeditionGrid button').all())await expect(b).toBeEnabled();
});
test('Before victory a secret door offers the existing level but locks bonus routes',async({page})=>{
 await page.addInitScript(secretSaves);
 await page.goto('/');await page.locator('#playBtn').click();
 await page.evaluate(()=>loadLevel(10));
 await useDoor(page);
 await expect(page.locator('#secretBonusChoices button')).toHaveCount(0);
 await expect(page.locator('#secretBonusChoices')).toContainText('Reach this secret level');
 await page.locator('#secretExistingChoices button').click();
 expect(await page.evaluate(()=>levelIndex)).toBe(11);
 await expect(page.locator('#secretBranchDialog')).not.toBeVisible();
});
test('Branching secret door offers two unlocked bonus levels and a different secret level',async({page})=>{
 await page.addInitScript(secretSaves);
 await page.goto('/');await page.locator('#playBtn').click();
 await winSecret(page,10);
 await page.evaluate(()=>loadLevel(10));
 await useDoor(page);
 await expect(page.locator('#secretBonusChoices button')).toHaveCount(2);
 await expect(page.locator('#secretExistingChoices button')).toContainText('Whispering');
 await page.locator('#secretBonusChoices button').nth(1).click();
 expect(await page.evaluate(()=>levelIndex)).toBe(15);
 await expect(page.locator('#field .tile')).toHaveCount(252);
 expect(await page.evaluate(()=>Boolean(secretChainDoor))).toBe(true);
 expect(await page.evaluate(()=>chests.size)).toBe(3);
 await useDoor(page);
 await expect(page.locator('#secretBonusChoices button')).toHaveCount(1);
 await page.locator('#secretBonusChoices button').first().click();
 expect(await page.evaluate(()=>levelIndex)).toBe(14);
});
test('Each bonus level is playable, reachable and includes three chests and a branch door',async({page})=>{
 await page.addInitScript(secretSaves);
 await page.goto('/');await page.locator('#playBtn').click();
 for(const i of [10,11,12])await winSecret(page,i);
 const data=await page.evaluate(()=>{
  const all=[];
  for(let i=14;i<=18;i++){
   loadLevel(i);
   all.push({level:levelIndex,playing:mode==='playing',cells:document.querySelectorAll('#field .tile').length,
    route:connected(START,GOAL),door:Boolean(secretChainDoor),chests:chests.size,
    fact:[...chests.values()].includes('fact'),name:LEVELS[i].name});
  }
  return all;
 });
 expect(data).toHaveLength(5);
 for(let n=0;n<5;n++){
  expect(data[n].level).toBe(14+n);
  expect(data[n].playing).toBe(true);
  expect(data[n].cells).toBe(252);
  expect(data[n].route).toBe(true);
  expect(data[n].door).toBe(true);
  expect(data[n].chests).toBe(3);
  expect(data[n].fact).toBe(true);
 }
 expect(new Set(data.map(x=>x.name)).size).toBe(5);
});
test('Bonus-level victory saves completion and original Challenge remains unchanged',async({page})=>{
 await page.addInitScript(secretSaves);
 await page.goto('/');await page.locator('#playBtn').click();
 await winSecret(page,10);
 await page.evaluate(()=>{
  loadLevel(14);coyotes=[];runner={x:1,y:0};draw();move(-1,0);
 });
 expect(await page.evaluate(()=>mode)).toBe('won');
 expect(await page.evaluate(()=>bonusCleared.has(14))).toBe(true);
 await expect(page.locator('#resultTitle')).toContainText('SECRET EXPEDITION');
 await page.reload();
 await page.locator('#homeScreen button').filter({hasText:'Mountain Map'}).click();
 await expect(page.locator('#bonusExpeditionGrid button').first()).toContainText('Cleared');
 await page.locator('#mapScreen .topbar button').first().click();
 await page.locator('#challengeBtn').click();
 await expect(page.locator('#challengeGrid .mountain')).toHaveCount(13);
});
