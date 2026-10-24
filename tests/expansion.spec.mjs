import {test,expect} from '@playwright/test';
const repoProgress=()=>{
 localStorage.setItem('gray-coyote-mountains-secret-found-v1','true');
 localStorage.setItem('gray-coyote-mountains-extra-secrets-v1',JSON.stringify({unlocked:[true,true],cleared:[false,false]}));
};
const arrive=async(page,spot)=>{
 return page.evaluate(p=>{
  const from=neighbors(p)[0];
  if(!from)throw Error('Collectible does not have a reachable neighbor');
  runner={...from};coyotes=[];draw();
  move(p.x-from.x,p.y-from.y);
 },spot);
};
test('The field guide holds exactly fifty separate facts and starts locked',async({page})=>{
 await page.goto('/');
 expect(await page.evaluate(()=>COYOTE_FACTS.length)).toBe(50);
 await expect(page.locator('#fieldGuideProgress')).toContainText('0/50');
 await page.locator('#openGuide').click();
 await expect(page.locator('#guideFacts li')).toHaveCount(50);
 await expect(page.locator('#guideFacts li.locked')).toHaveCount(50);
 await page.locator('#closeGuide').click();
 await expect(page.locator('#globalStats')).toContainText('awaiting shared server connection');
});
test('A fact appears in one of the three ordinary chests and is saved on pickup',async({page})=>{
 await page.goto('/');await page.locator('#playBtn').click();
 const pos=await page.evaluate(()=>{
  if(chests.size!==3)throw Error('Expected three chests');
  const location=[...chests].find(([k,v])=>v==='fact');
  if(!location)throw Error('Fact chest missing');
  const [x,y]=location[0].split(',').map(Number);return {x,y};
 });
 await arrive(page,pos);
 await expect(page.locator('#message')).toContainText('COYOTE FACT');
 expect(await page.evaluate(()=>collectedFacts.size)).toBe(1);
 expect(await page.evaluate(()=>JSON.parse(localStorage.getItem(FACT_KEY)))).toHaveLength(1);
 await page.reload();
 await expect(page.locator('#fieldGuideProgress')).toContainText('1/50');
 await page.locator('#openGuide').click();
 await expect(page.locator('#guideFacts li:not(.locked)')).toHaveCount(1);
});
test('Each secret map contains a tool, a reachable chaining door, and one fact chest',async({page})=>{
 await page.addInitScript(repoProgress);
 await page.goto('/');await page.locator('#playBtn').click();
 const data=await page.evaluate(()=>{
  const all=[];
  for(const i of [10,11,12]){
   loadLevel(i);
   all.push({i,tool:secretItem?.type,door:!!secretChainDoor,
    nearDoor:secretChainDoor&&connected(START,secretChainDoor),
    nearTool:secretItem&&connected(START,secretItem),
    chests:chests.size,fact:[...chests.values()].includes('fact')});
  }
  return all;
 });
 expect(data.map(x=>x.tool)).toEqual(['bike','glider','radio']);
 for(const entry of data){
  expect(entry.door).toBe(true);expect(entry.nearDoor).toBe(true);
  expect(entry.nearTool).toBe(true);expect(entry.chests).toBe(1);expect(entry.fact).toBe(true);
 }
});
test('Secret doors chain Hollow to Woods to Crater and back to Hollow',async({page})=>{
 await page.addInitScript(repoProgress);
 await page.goto('/');await page.locator('#playBtn').click();
 await page.evaluate(()=>loadLevel(10));
 for(const target of [11,12,10]){
  await page.evaluate(()=>{
   const from=neighbors(secretChainDoor)[0];
   runner={...from};coyotes=[];
   move(secretChainDoor.x-from.x,secretChainDoor.y-from.y);
  });
  expect(await page.evaluate(()=>levelIndex)).toBe(target);
 }
});
test('Bicycle changes icon, gives bell every three steps, and follows into next map',async({page})=>{
 await page.addInitScript(repoProgress);
 await page.goto('/');await page.locator('#playBtn').click();
 await page.evaluate(()=>loadLevel(10));
 const spot=await page.evaluate(()=>({...secretItem}));
 await arrive(page,spot);
 expect(await page.evaluate(()=>equipment.type)).toBe('bike');
 await expect(page.locator('#field .runner')).toContainText('🚴');
 await expect(page.locator('#shout')).toContainText('BIKE BELL');
 await page.locator('#shout').click();
 await expect(page.locator('#shout')).toBeDisabled();
 expect(await page.evaluate(()=>cooldown)).toBe(3);
 await page.evaluate(()=>{runner={x:17,y:0};coyotes=[];});
 for(let i=0;i<3;i++)await page.evaluate(()=>move(-1,0));
 await expect(page.locator('#shout')).toBeEnabled();
 await page.evaluate(()=>loadLevel(11));
 expect(await page.evaluate(()=>equipment.type)).toBe('bike');
 await page.evaluate(()=>loadLevel(12));
 expect(await page.evaluate(()=>equipment)).toBeNull();
});
test('Paraglider moves one square and flies over trees and rocks without making them passable',async({page})=>{
 await page.addInitScript(repoProgress);
 await page.goto('/');await page.locator('#playBtn').click();
 await page.evaluate(()=>loadLevel(11));
 const spot=await page.evaluate(()=>({...secretItem}));
 await arrive(page,spot);
 expect(await page.evaluate(()=>equipment.type)).toBe('glider');
 await expect(page.locator('#message')).toContainText('ONE square');
 await page.evaluate(()=>{runner={x:17,y:0};coyotes=[];steps=0;draw();move(-1,0);});
 expect(await page.evaluate(()=>({...runner}))).toEqual({x:16,y:0});
 expect(await page.evaluate(()=>steps)).toBe(1);
 await expect(page.locator('#field .runner')).toContainText('🪂');
 for(const kind of ['tree','rock']){
  const result=await page.evaluate(kind=>{
   const obstacles=kind==='tree'?trees:rocks;
   const obstacle=[...obstacles].map(k=>{const [x,y]=k.split(',').map(Number);return{x,y};})
    .find(p=>neighbors(p).length>0);
   if(!obstacle)throw Error('No accessible '+kind+' square');
   const from=neighbors(obstacle)[0];
   runner={...from};steps=0;coyotes=[];draw();
   move(obstacle.x-from.x,obstacle.y-from.y);
   const tile=document.getElementById('field').children[obstacle.y*W+obstacle.x];
   return {landed:same(runner,obstacle),stillBlocked:blocked(obstacle.x,obstacle.y),
    steps,icon:tile.textContent,visible:tile.classList.contains('runner')};
  },kind);
  expect(result).toEqual({landed:true,stillBlocked:true,steps:1,icon:'🪂',visible:true});
 }
 expect(await page.evaluate(()=>{
  equipment=null;
  const obstacle=[...trees].map(k=>{const [x,y]=k.split(',').map(Number);return{x,y};})
   .find(p=>neighbors(p).length>0);
  const from=neighbors(obstacle)[0];
  runner={...from};steps=0;coyotes=[];draw();
  move(obstacle.x-from.x,obstacle.y-from.y);
  return {stayed:same(runner,from),steps};
 })).toEqual({stayed:true,steps:0});
});
test('Radio summons ranger once; ranger protects and swaps with player',async({page})=>{
 await page.addInitScript(repoProgress);
 await page.goto('/');await page.locator('#playBtn').click();
 await page.evaluate(()=>loadLevel(12));
 const spot=await page.evaluate(()=>({...secretItem}));
 await arrive(page,spot);
 await expect(page.locator('#shout')).toContainText('CALL RANGER');
 await page.evaluate(()=>{
  coyotes=[{x:runner.x,y:Math.max(0,runner.y-1),scared:0}];
  draw();
  shout();
 });
 expect(await page.evaluate(()=>Boolean(ranger?.active))).toBe(true);
 expect(await page.evaluate(()=>equipment)).toBeNull();
 await expect(page.locator('#shout')).toContainText('SHOUT');
 expect(await page.evaluate(()=>coyotes.every(c=>distance(c,ranger)>5))).toBe(true);
 await page.evaluate(()=>{
  runner={...START};ranger={...ranger,x:16,y:13};coyotes=[];
  move(-1,0);
 });
 expect(await page.evaluate(()=>({...runner}))).toEqual({x:16,y:13});
 expect(await page.evaluate(()=>({x:ranger.x,y:ranger.y}))).toEqual({x:17,y:13});
 await page.evaluate(()=>loadLevel(10));
 expect(await page.evaluate(()=>Boolean(ranger))).toBe(true);
 await page.evaluate(()=>loadLevel(11));
 expect(await page.evaluate(()=>ranger)).toBeNull();
});
test('Fiftieth fact unlocks a saved bonus village with flag moving every five turns',async({page})=>{
 await page.goto('/');await page.locator('#playBtn').click();
 const pos=await page.evaluate(()=>{
  collectedFacts=new Set(Array.from({length:49},(_,i)=>i));
  const [k]=[...chests].find(([k,v])=>v==='fact');
  const [x,y]=k.split(',').map(Number);return {x,y};
 });
 await arrive(page,pos);
 expect(await page.evaluate(()=>collectedFacts.size)).toBe(50);
 await expect(page.locator('#message')).toContainText('VILLAGE IS UNLOCKED');
 await page.evaluate(()=>showScreen('map'));
 await expect(page.locator('#mountainGrid .mountain')).toHaveCount(11);
 await page.evaluate(()=>loadLevel(VILLAGE_INDEX));
 await expect(page.locator('#subtitle')).toContainText('Lunch Snatch Village');
 const original=await page.evaluate(()=>{
  coyotes=[];villageGuards.clear();runner={x:17,y:0};draw();
  return {...villageFlag};
 });
 for(let i=0;i<5;i++)await page.evaluate(()=>move(-1,0));
 expect(await page.evaluate(()=>steps)).toBe(5);
 expect(await page.evaluate(()=>({...villageFlag}))).not.toEqual(original);
 await page.reload();
 await expect(page.locator('#fieldGuideProgress')).toContainText('50/50');
 await page.evaluate(()=>showScreen('map'));
 await expect(page.locator('#mountainGrid .mountain')).toHaveCount(11);
});

test('Village has gray pavement and individual solid house tiles',async({page})=>{
 await page.addInitScript(()=>{
  localStorage.setItem('gray-coyote-mountains-facts-v1',JSON.stringify(Array.from({length:50},(_,i)=>i)));
 });
 await page.goto('/');await page.locator('#playBtn').click();
 await page.evaluate(()=>loadLevel(VILLAGE_INDEX));
 const state=await page.evaluate(()=>{
  const tiles=[...document.querySelectorAll('#field .tile')];
  const houses=tiles.filter(t=>t.classList.contains('house'));
  const first=[...trees,...rocks][0];
  const [x,y]=first.split(',').map(Number);
  return {zone:document.getElementById('gameFrame').classList.contains('village-zone'),
   tiles:tiles.length,numberOfHouses:houses.length,obstacles:trees.size+rocks.size,
   individualHouses:houses.every(t=>t.textContent==='🏠'),
   blockedHouse:blocked(x,y),pavement:getComputedStyle(tiles[0]).backgroundColor};
 });
 expect(state).toEqual({zone:true,tiles:252,numberOfHouses:36,obstacles:36,
  individualHouses:true,blockedHouse:true,pavement:'rgb(152, 157, 159)'});
 await page.evaluate(()=>loadLevel(0));
 expect(await page.locator('#gameFrame').evaluate(e=>e.classList.contains('village-zone'))).toBe(false);
 await expect(page.locator('#field .house')).toHaveCount(0);
});

test('Paraglider survives a secret door, saved reload and one following level',async({page})=>{
 await page.addInitScript(repoProgress);
 await page.goto('/');
 await page.locator('#playBtn').click();
 await page.evaluate(()=>loadLevel(11));
 const pickup=await page.evaluate(()=>({...secretItem}));
 await arrive(page,pickup);
 expect(await page.evaluate(()=>equipment?.type)).toBe('glider');
 // Travel through the actual secret door to the next secret map.
 await page.evaluate(()=>{
  const from=neighbors(secretChainDoor)[0];
  if(!from)throw Error('No route to secret door');
  runner={...from};coyotes=[];draw();
  move(secretChainDoor.x-from.x,secretChainDoor.y-from.y);
 });
 expect(await page.evaluate(()=>levelIndex)).toBe(12);
 expect(await page.evaluate(()=>equipment?.type)).toBe('glider');
 await expect(page.locator('#field .runner')).toContainText('🪂');
 // Landing on a blocked tile still works in the following map.
 const flight=await page.evaluate(()=>{
  const obstacle=[...trees,...rocks].map(k=>{
   const [x,y]=k.split(',').map(Number);return {x,y};
  }).find(p=>neighbors(p).length>0);
  if(!obstacle)throw Error('No testable obstacle');
  const from=neighbors(obstacle)[0];
  runner={...from};coyotes=[];steps=0;draw();
  move(obstacle.x-from.x,obstacle.y-from.y);
  return {landed:same(runner,obstacle),steps,stillBlocked:blocked(obstacle.x,obstacle.y)};
 });
 expect(flight).toEqual({landed:true,steps:1,stillBlocked:true});
 expect(JSON.parse(await page.evaluate(()=>localStorage.getItem(POWER_KEY))).equipment.type).toBe('glider');
 await page.reload();
 // Returning straight to the same following map must not consume the glider.
 await page.evaluate(()=>loadLevel(12));
 expect(await page.evaluate(()=>equipment?.type)).toBe('glider');
 await expect(page.locator('#field .runner')).toContainText('🪂');
 await page.evaluate(()=>loadLevel(10));
 expect(await page.evaluate(()=>equipment)).toBeNull();
});

test('Paraglider carries into the next regular mountain and then expires',async({page})=>{
 await page.addInitScript(()=>{
  repoProgress();
  localStorage.setItem('gray-coyote-mountains-level-v1','9');
 });
 await page.goto('/');
 await page.locator('#playBtn').click();
 await page.evaluate(()=>loadLevel(11));
 await arrive(page,await page.evaluate(()=>({...secretItem})));
 expect(await page.evaluate(()=>equipment?.type)).toBe('glider');
 await page.evaluate(()=>loadLevel(7));
 expect(await page.evaluate(()=>equipment?.type)).toBe('glider');
 await expect(page.locator('#field .runner')).toContainText('🪂');
 await page.evaluate(()=>loadLevel(8));
 expect(await page.evaluate(()=>equipment)).toBeNull();
});
