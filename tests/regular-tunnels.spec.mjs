import {test,expect} from '@playwright/test';
const unlocked=()=>{
 localStorage.setItem('gray-sentinel-mountain-unlocked-v1','10');
 localStorage.setItem('gray-sentinel-mountain-cleared-v1','9');
 localStorage.setItem('gray-coyote-mountains-secret-found-v1','true');
 localStorage.setItem('gray-coyote-mountains-extra-secrets-v1',JSON.stringify({unlocked:[true,true],cleared:[true,true]}));
 localStorage.setItem('gray-coyote-mountains-branch-expeditions-v1',JSON.stringify({unlocked:[14,15,16,17,18,19,20,21,22,23],cleared:[]}));
};
test('all ten extra mountains use ordinary gameplay, ordinary sound, and return tunnels',async({page})=>{
 await page.addInitScript(unlocked);
 await page.goto('/');await page.locator('#playBtn').click();
 const levels=await page.evaluate(()=>{
  const result=[];
  for(let i=14;i<24;i++){
   loadLevel(i);
   result.push({i,mode,secretDoor:secretChainDoor,
    returnTunnel:!!bonusTunnel,secretSkin:el('gameFrame').classList.contains('secret-zone'),
    ambience:Boolean(secretAmbience),chests:chests.size,board:el('field').children.length,
    title:el('mountainLabel').textContent,
    goalReachable:connected(START,GOAL)});
  }
  return result;
 });
 expect(levels).toHaveLength(10);
 for(let i=0;i<10;i++){
  expect(levels[i].i).toBe(i+14);
  expect(levels[i].mode).toBe('playing');
  expect(levels[i].secretDoor).toBeNull();
  expect(levels[i].returnTunnel).toBe(true);
  expect(levels[i].secretSkin).toBe(false);
  expect(levels[i].ambience).toBe(false);
  expect(levels[i].chests).toBe(3);
  expect(levels[i].board).toBe(252);
  expect(levels[i].title).toContain('EXTRA MOUNTAIN');
  expect(levels[i].goalReachable).toBe(true);
 }
});
test('normal Mountain 2 tunnel visibly leads to regular Mountain 16 and stays unlocked',async({page})=>{
 await page.addInitScript(()=>localStorage.setItem('gray-sentinel-mountain-unlocked-v1','2'));
 await page.goto('/');await page.locator('#playBtn').click();
 await page.evaluate(()=>loadLevel(1));
 const tunnel=await page.evaluate(()=>{
  const p={...normalBonusDoor};
  return {position:p,text:el('field').children[p.y*W+p.x].textContent,
    category:el('field').children[p.y*W+p.x].className};
 });
 expect(tunnel.text).toContain('🕳️');
 expect(tunnel.category).toContain('tunnel-marker');
 await page.evaluate(()=>{
  const from=neighbors(normalBonusDoor)[0];
  runner={...from};coyotes=[];draw();
  move(normalBonusDoor.x-from.x,normalBonusDoor.y-from.y);
 });
 expect(await page.evaluate(()=>levelIndex)).toBe(19);
 expect(await page.evaluate(()=>bonusUnlocked.has(19))).toBe(true);
 expect(await page.evaluate(()=>el('gameFrame').classList.contains('secret-zone'))).toBe(false);
 await expect(page.locator('#subtitle')).toHaveText('Tidepool Terrace');
 await page.reload();
 await page.locator('#homeScreen button').filter({hasText:'Mountain Map'}).click();
 await expect(page.locator('#bonusExpeditionGrid button').nth(5)).toBeEnabled();
});
test('first five regular mountains are accessed through tunnels separate from original secret doors',async({page})=>{
 await page.addInitScript(unlocked);
 await page.goto('/');await page.locator('#playBtn').click();
 await page.evaluate(()=>loadLevel(11));
 const locations=await page.evaluate(()=>({door:secretChainDoor,tunnel:bonusTunnel,
   tunnelIcon:el('field').children[bonusTunnel.y*W+bonusTunnel.x].textContent}));
 expect(locations.door).toBeTruthy();
 expect(locations.tunnel).toBeTruthy();
 expect(locations.door).not.toEqual(locations.tunnel);
 expect(locations.tunnelIcon).toContain('🕳️');
 await page.evaluate(()=>{
  const from=neighbors(bonusTunnel)[0];runner={...from};coyotes=[];draw();
  move(bonusTunnel.x-from.x,bonusTunnel.y-from.y);
 });
 await expect(page.locator('#regularTunnelDialog')).toBeVisible();
 await expect(page.locator('#regularTunnelChoices button')).toHaveCount(2);
 await expect(page.locator('#secretBranchDialog')).not.toBeVisible();
 await page.locator('#regularTunnelChoices button').first().click();
 expect(await page.evaluate(()=>levelIndex)).toBe(16);
 expect(await page.evaluate(()=>secretChainDoor)).toBeNull();
 expect(await page.evaluate(()=>!!bonusTunnel)).toBe(true);
});
test('tunnel in an extra mountain returns to its source, not another secret door',async({page})=>{
 await page.addInitScript(unlocked);
 await page.goto('/');await page.locator('#playBtn').click();
 await page.evaluate(()=>loadLevel(22));
 await page.evaluate(()=>{
  const from=neighbors(bonusTunnel)[0];runner={...from};coyotes=[];draw();
  move(bonusTunnel.x-from.x,bonusTunnel.y-from.y);
 });
 await expect(page.locator('#regularTunnelDialog')).toBeVisible();
 await expect(page.locator('#regularTunnelChoices button')).toHaveCount(1);
 await expect(page.locator('#regularTunnelChoices button')).toContainText('Redwood Crest');
 await page.locator('#regularTunnelChoices button').click();
 expect(await page.evaluate(()=>levelIndex)).toBe(7);
});
test('a normal extra mountain victory saves completion and increments coyote victories once',async({page})=>{
 await page.addInitScript(unlocked);
 await page.goto('/');await page.locator('#playBtn').click();
 const before=await page.evaluate(()=>coyoteVictories);
 await page.evaluate(()=>{loadLevel(23);coyotes=[];runner={x:1,y:0};draw();move(-1,0);});
 await expect(page.locator('#resultTitle')).toContainText('MOUNTAIN CLEARED');
 expect(await page.evaluate(()=>bonusCleared.has(23))).toBe(true);
 expect(await page.evaluate(()=>coyoteVictories)).toBe(before+1);
 await page.reload();
 await page.locator('#homeScreen button').filter({hasText:'Mountain Map'}).click();
 await expect(page.locator('#bonusExpeditionGrid button').last()).toContainText('Cleared');
});
