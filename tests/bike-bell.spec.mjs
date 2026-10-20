import {test,expect} from '@playwright/test';

async function openBikeWorld(page){
 await page.addInitScript(()=>{
  localStorage.setItem('gray-coyote-mountains-secret-found-v1','true');
 });
 await page.goto('/');
 await page.locator('#playBtn').click();
 await page.evaluate(()=>{
  loadLevel(10);
  // Deterministic open terrain isolates the bell from mountains and patrol RNG.
  trees=new Set();rocks=new Set();
  runner={x:9,y:7};
  equipment={type:'bike',origin:10,currentLevel:10,nextLevel:null};
  coyotes=[
   {x:10,y:7,scared:0},
   {x:9,y:9,scared:0},
   {x:14,y:7,scared:0},
   {x:0,y:0,scared:0}
  ];
  cooldown=0;draw();
 });
}

test('Bicycle bell makes all nearby coyotes retreat instantly, but leaves distant coyotes alone',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await openBikeWorld(page);
 const before=await page.evaluate(()=>coyotes.map(c=>({...c,distance:distance(c,runner)})));
 await expect(page.locator('#shout')).toContainText('BIKE BELL');
 await page.locator('#shout').click();
 const after=await page.evaluate(()=>({
  coyotes:coyotes.map(c=>({...c,distance:distance(c,runner)})),
  cooldown,steps,message:document.querySelector('#message').textContent
 }));
 for(let i=0;i<3;i++){
  expect(after.coyotes[i].distance).toBeGreaterThan(before[i].distance);
  expect(after.coyotes[i].distance-before[i].distance).toBe(2);
  expect(after.coyotes[i].scared).toBeGreaterThanOrEqual(3);
 }
 expect(after.coyotes[3]).toEqual(before[3]);
 expect(after.cooldown).toBe(3);
 expect(after.steps).toBe(0);
 expect(after.message).toContain('RING RING!');
 expect(after.message).toContain('6 retreat steps');
 await expect(page.locator('#shout')).toBeDisabled();
 expect(errors).toEqual([]);
});

test('Bell cannot ring during cooldown and becomes available after exactly three player steps',async({page})=>{
 await openBikeWorld(page);
 await page.evaluate(()=>{window.rings=0;const original=note;note=(...args)=>{window.rings++;return original(...args);};});
 await page.locator('#shout').click();
 expect(await page.evaluate(()=>window.rings)).toBe(2);
 await page.evaluate(()=>shout());
 expect(await page.evaluate(()=>window.rings)).toBe(2);
 await page.evaluate(()=>{
   // Clear the playing field to avoid collisions; preserve the cooldown.
   coyotes=[];runner={x:17,y:0};draw();
 });
 for(let n=1;n<=3;n++){
  await page.evaluate(()=>move(-1,0));
  expect(await page.evaluate(()=>cooldown)).toBe(3-n);
  if(n<3)await expect(page.locator('#shout')).toBeDisabled();
 }
 await expect(page.locator('#shout')).toBeEnabled();
 await page.locator('#shout').click();
 expect(await page.evaluate(()=>window.rings)).toBe(4);
 expect(await page.evaluate(()=>cooldown)).toBe(3);
});

test('Bell never pushes a trapped coyote through an obstacle or into the player',async({page})=>{
 await openBikeWorld(page);
 await page.evaluate(()=>{
   runner={x:0,y:1};
   coyotes=[{x:0,y:0,scared:0}];
   trees=new Set(['1,0']);rocks=new Set();
   draw();
 });
 await page.locator('#shout').click();
 const state=await page.evaluate(()=>({coyote:{...coyotes[0]},runner:{...runner},cooldown}));
 expect(state.coyote.x).toBe(0);
 expect(state.coyote.y).toBe(0);
 expect(state.coyote.scared).toBeGreaterThanOrEqual(3);
 expect(state.cooldown).toBe(3);
 expect(state.coyote).not.toMatchObject(state.runner);
 await expect(page.locator('#message')).toContainText('0 retreat steps');
});
