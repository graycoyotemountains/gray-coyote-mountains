'use strict';
/* Gray Coyote Mountains: Secret Expeditions & Field Guide expansion.
   Loaded after the original game so pre-existing saves and challenge rules survive. */
const FACT_KEY='gray-coyote-mountains-facts-v1';
const POWER_KEY='gray-coyote-mountains-powers-v1';
const VILLAGE_KEY='gray-coyote-mountains-village-v1';
const VILLAGE_INDEX=13;
let collectedFacts=new Set(),equipment=null,ranger=null;
let secretItem=null,secretChainDoor=null,villageFlag={x:3,y:3},villageGuards=new Set(),villageCleared=false;
try {
 const saved=JSON.parse(localStorage.getItem(FACT_KEY)||'[]');
 if(Array.isArray(saved))for(const n of saved)if(Number.isInteger(n)&&n>=0&&n<COYOTE_FACTS.length)collectedFacts.add(n);
 const powers=JSON.parse(localStorage.getItem(POWER_KEY)||'{}');
 if(powers.equipment && ['bike','glider','radio'].includes(powers.equipment.type))equipment=powers.equipment;
 if(powers.ranger && powers.ranger.active)ranger=powers.ranger;
 villageCleared=localStorage.getItem(VILLAGE_KEY)==='true';
}catch(error){console.warn('Could not read expansion progress',error);}
extraUnlocked[2]=collectedFacts.size===50;
extraCleared[2]=villageCleared;
LEVELS.push({
 name:'The Lunch Snatch Village',trees:22,rocks:14,alert:8,speed:2,
 sky1:'#b7d6b7',sky2:'#f4d89d',peak:'#859762',shade:'#416a4c',snow:'#ecedc8',
 icon:'🏘️',desc:'The villagers and coyotes team up!'
});
(function installExpansion(){
 const baseSave=saveProgress,baseRenderMap=renderMap,baseRenderChallenge=renderChallengePicker;
 const baseLoad=loadLevel,baseDraw=draw,baseMove=move,baseMoveCoyotes=moveCoyotes;
 const baseGoal=activeGoal,baseChests=createChestsAndPortals,baseCollect=collectChest,baseShout=shout,baseTag=tagged;
 const baseBlocked=blocked;
 // The original SVG atlas has 13 silhouettes. Reuse a mountain landscape for the bonus village.
 const originalMountainSVG=mountainSVG;
 mountainSVG=function(i){return originalMountainSVG(i===VILLAGE_INDEX?1:i);};
 const gallery=document.createElement('dialog');
 gallery.id='fieldGuide';
 gallery.setAttribute('aria-label','Collected coyote facts');
 gallery.innerHTML='<div class="guide-head"><h2>📖 Coyote Field Guide</h2><button type="button" class="btn small secondary" id="closeGuide">✕ Close</button></div><p id="guideCount"></p><ol id="guideFacts"></ol><p class="guide-sources">Wildlife references: <a href="https://home.nps.gov/jeca/learn/nature/coyote-canis-latrans.htm" target="_blank" rel="noopener">National Park Service</a> · <a href="https://research.fs.usda.gov/feis/species-reviews/cala" target="_blank" rel="noopener">U.S. Forest Service</a> · <a href="https://natureworks.nhpbs.org/animals/coyote/" target="_blank" rel="noopener">NatureWorks</a></p>';
 document.body.append(gallery);
 document.getElementById('closeGuide').addEventListener('click',()=>gallery.close());
 gallery.addEventListener('click',e=>{if(e.target===gallery)gallery.close();});
 const homeGuide=document.createElement('div');
 homeGuide.id='expeditionPanel';homeGuide.className='expedition-panel';
 homeGuide.innerHTML='<div><strong>📖 Coyote Field Guide</strong><p id="fieldGuideProgress">0 / 50 facts discovered</p><p id="globalStats" aria-live="polite">🌍 Lifetime player statistics: not connected</p></div><button class="btn primary small" id="openGuide" type="button">📖 View facts</button>';
 document.querySelector('#homeScreen .quick-cards').before(homeGuide);
 const mapGuide=document.createElement('button');
 mapGuide.id='mapGuide';mapGuide.className='btn secondary small';mapGuide.textContent='📖 Facts 0/50';
 document.querySelector('#mapScreen .map-foot').prepend(mapGuide);
 document.getElementById('openGuide').addEventListener('click',openGuide);
 mapGuide.addEventListener('click',openGuide);
 const styles=document.createElement('style');
 styles.textContent='.expedition-panel{margin:18px 0;padding:16px;background:#23463d;border:1px solid #82977f;border-radius:17px;display:flex;align-items:center;justify-content:space-between;gap:13px;flex-wrap:wrap}.expedition-panel p{margin:3px 0;color:#c9ddc6;font-size:.89rem}.expedition-panel strong{color:#ffe0a1}#fieldGuide{width:min(700px,95vw);max-height:88vh;overflow:auto;background:#193c35;color:#f9f0d8;border:2px solid #a0b998;border-radius:18px;padding:22px;box-shadow:0 20px 60px #051d19}#fieldGuide::backdrop{background:#071a1bbf}.guide-head{display:flex;align-items:center;justify-content:space-between;gap:10px}.guide-head h2{font-size:1.55rem}#guideFacts{padding-left:25px;line-height:1.55}#guideFacts li{padding:5px 3px;border-bottom:1px solid #ffffff1a}#guideFacts li.locked{color:#a3b4a6}.guide-sources{font-size:.81rem}.guide-sources a{color:#f6dc91}.tile.ranger,.tile.special-item,.tile.village-guard{background:#b4d5b1!important}.tile.secret-chain{background:#996eaf!important;animation:pulse 1.5s infinite}.tile.ranger{box-shadow:inset 0 0 0 2px #f7e18a}.tile.special-item{box-shadow:inset 0 0 0 2px #eeb96e}';
 document.head.append(styles);
 function openGuide(){
  const list=document.getElementById('guideFacts');list.replaceChildren();
  COYOTE_FACTS.forEach((fact,i)=>{
   const li=document.createElement('li');
   if(collectedFacts.has(i))li.textContent=fact;
   else{li.className='locked';li.textContent='🔒 Undiscovered fact';}
   list.append(li);
  });
  document.getElementById('guideCount').textContent=collectedFacts.size+'/50 facts collected. One fact hides in a chest on every regular map. Replay mountains to find the rest!';
  gallery.showModal();
 }
 function updateGuide(){
  const progress=collectedFacts.size+'/50';
  document.getElementById('fieldGuideProgress').textContent=progress+' facts discovered'+(collectedFacts.size===50?' · 🏘️ Village unlocked!':'');
  mapGuide.textContent='📖 Facts '+progress;
 }
 function saveExtras(){
  try{
   localStorage.setItem(FACT_KEY,JSON.stringify([...collectedFacts].sort((a,b)=>a-b)));
   localStorage.setItem(POWER_KEY,JSON.stringify({equipment,ranger}));
   localStorage.setItem(VILLAGE_KEY,String(villageCleared));
  }catch(error){console.warn('Expansion save unavailable',error);}
 }
 saveProgress=function(){
  // Preserve the two-secret-world layout of the original progress key.
  const thirdU=extraUnlocked[2],thirdC=extraCleared[2];
  extraUnlocked.length=2;extraCleared.length=2;
  try{baseSave();}finally{extraUnlocked[2]=thirdU;extraCleared[2]=thirdC;}
  saveExtras();
 };
 function unlockVillage(){
  if(collectedFacts.size!==50)return;
  extraUnlocked[2]=true;
  saveProgress();renderMap();
 }
 function findSpot(avoid){
  for(let n=0;n<100;n++){
   const p=randomReachableSpot();
   if(p&&!avoid.some(q=>q&&same(q,p))&&!chests.has(key(p.x,p.y)))return p;
  }
  for(let y=1;y<H;y++)for(let x=1;x<W;x++){
   const p={x,y};
   if(!blocked(x,y)&&connected(START,p)&&!avoid.some(q=>q&&same(q,p))&&!chests.has(key(x,y)))return p;
  }
  return null;
 }
 function nextSecret(i){return i===10?11:i===11?12:10;}
 function grantSecretAccess(i){
  if(i===10)secretUnlocked=true;
  if(i===11)extraUnlocked[0]=true;
  if(i===12)extraUnlocked[1]=true;
  saveProgress();
 }
 function adjustPowerForLevel(power,i){
  if(!power)return null;
  if(i===power.currentLevel)return power;
  if(power.type==='glider'||power.type==='radio')return null;
  if(power.nextLevel===null||power.nextLevel===undefined){
   power.nextLevel=i;power.currentLevel=i;return power;
  }
  if(power.nextLevel===i){power.currentLevel=i;return power;}
  return null;
 }
 function adjustRangerForLevel(i){
  if(!ranger)return;
  if(i===ranger.currentLevel)return;
  if(ranger.nextLevel===null||ranger.nextLevel===undefined){
   ranger.nextLevel=i;ranger.currentLevel=i;return;
  }
  if(ranger.nextLevel===i){ranger.currentLevel=i;return;}
  ranger=null;
 }
 function initialRangerSpot(){
  for(const p of [{x:START.x-1,y:START.y},{x:START.x,y:START.y-1}])
   if(!blocked(p.x,p.y))return p;
  return {...START};
 }
 function repelCoyotes(){
  if(!ranger||challengeMode)return;
  const occupied=new Set();
  for(const c of coyotes){
   const current=key(c.x,c.y);
   if(distance(c,ranger)>5&&!occupied.has(current)){occupied.add(current);continue;}
   let target=null,best=Infinity;
   for(let y=0;y<H;y++)for(let x=0;x<W;x++){
    const p={x,y},k=key(x,y);
    if(blocked(x,y)||occupied.has(k)||same(p,runner)||same(p,ranger)||distance(p,ranger)<=5)continue;
    const score=distance(p,c)+Math.random()*.01;
    if(score<best){best=score;target=p;}
   }
   if(target){c.x=target.x;c.y=target.y;c.scared=Math.max(c.scared,3);occupied.add(key(c.x,c.y));}
  }
 }
 function chooseVillageFlag(){
  const options=[];
  for(let y=2;y<H-2;y++)for(let x=2;x<W-2;x++){
   const p={x,y};
   if(baseBlocked(x,y)||same(p,runner)||distance(p,runner)<4||!connected(runner,p)||coyotes.some(c=>same(c,p)))continue;
   options.push(p);
  }
  if(!options.length)return;
  const old=key(villageFlag.x,villageFlag.y);
  const different=options.filter(p=>key(p.x,p.y)!==old);
  villageFlag={...(different.length?different:options)[Math.floor(Math.random()*(different.length||options.length))]};
  villageGuards=new Set();
  const surrounding=[{x:villageFlag.x+1,y:villageFlag.y},{x:villageFlag.x-1,y:villageFlag.y},{x:villageFlag.x,y:villageFlag.y+1},{x:villageFlag.x,y:villageFlag.y-1}]
   .filter(p=>!baseBlocked(p.x,p.y)&&!same(p,runner));
  for(const p of surrounding.slice(0,Math.min(2,surrounding.length)))villageGuards.add(key(p.x,p.y));
 }
 activeGoal=function(){return !challengeMode&&levelIndex===VILLAGE_INDEX?villageFlag:baseGoal();};
 createChestsAndPortals=function(){
  baseChests();
  if(challengeMode)return;
  if(levelIndex>=SECRET_LEVEL&&levelIndex<VILLAGE_INDEX){
   const p=findSpot([]);
   if(p)chests.set(key(p.x,p.y),'fact');
  }
  if(levelIndex===VILLAGE_INDEX){
   chests.clear();chestsOpened=0;
   for(let j=0;j<3;j++){
    const p=findSpot([]);
    if(p)chests.set(key(p.x,p.y),TREASURES[j%TREASURES.length].id);
   }
  }
  if(levelIndex<MAIN_MOUNTAINS||levelIndex===VILLAGE_INDEX){
   const spots=[...chests.keys()];
   if(spots.length)chests.set(spots[Math.floor(Math.random()*spots.length)],'fact');
  }
 };
 collectChest=function(posKey){
  if(chests.get(posKey)!=='fact')return baseCollect(posKey);
  chests.delete(posKey);chestsOpened++;
  const undiscovered=COYOTE_FACTS.map((_,i)=>i).filter(i=>!collectedFacts.has(i));
  const index=undiscovered.length?undiscovered[Math.floor(Math.random()*undiscovered.length)]:Math.floor(Math.random()*COYOTE_FACTS.length);
  const isNew=!collectedFacts.has(index);
  collectedFacts.add(index);
  saveProgress();
  if(collectedFacts.size===50)unlockVillage();
  note(700,0,.11,{end:1000,volume:.07});
  note(960,.10,.19,{end:1320,volume:.08});
  updateGuide();
  return '📖 '+(isNew?'NEW COYOTE FACT '+collectedFacts.size+'/50':'COYOTE FACT')+': '+COYOTE_FACTS[index]+(collectedFacts.size===50&&isNew?' 🏘️ THE VILLAGE IS UNLOCKED!':'');
 };
 const baseChallengeLevelCount=13;
 renderChallengePicker=function(){
  baseRenderChallenge();
  const grid=el('challengeGrid');
  while(grid.children.length>baseChallengeLevelCount)grid.lastElementChild.remove();
  el('challengeProgress').textContent='🏆 '+[...challengeWins].filter(i=>i<baseChallengeLevelCount).length+'/13 challenges beaten';
 };
 renderMap=function(){
  baseRenderMap();
  const secretsFound=Number(secretUnlocked)+Number(Boolean(extraUnlocked[0]))+Number(Boolean(extraUnlocked[1]));
  el('progress').textContent='⛰️ '+cleared+'/10 cleared · 🧰 '+totalTreasures()+' treasures · 🐺 '+coyoteCount()+' coyotes · 💎 '+secretsFound+'/3 secrets found · 📖 '+collectedFacts.size+'/50 facts'+(summitTrailUnlocked?' · 🔥 Skyfire trail open':'');
  const cards=el('mountainGrid').children;
  if(extraUnlocked[2]&&cards.length){
   const card=cards[cards.length-1];
   if((card.querySelector('.peak-name')||card.querySelector('.mountain-caption strong'))?.textContent===LEVELS[VILLAGE_INDEX].name){
    card.setAttribute('aria-label','Bonus village level, '+(villageCleared?'completed':'unlocked'));
    const number=card.querySelector('.peak-number')||card.querySelector('.mountain-no');
    const status=card.querySelector('.peak-status')||card.querySelector('.mountain-badge');
    if(number)number.textContent='🏘️';
    if(status)status.textContent=villageCleared?'🏁 Cleared':'🌟 Bonus unlocked';
   }
  }
  updateGuide();
 };
 loadLevel=function(i){
  if(i===VILLAGE_INDEX&&(challengeMode||collectedFacts.size!==50))return;
  if(!Number.isInteger(i)||i<0||i>=LEVELS.length)return;
  // Do not consume carried equipment on a forbidden map selection.
  if(!challengeMode&&i>=MAIN_MOUNTAINS&&i!==VILLAGE_INDEX&&!(i===SECRET_LEVEL?secretUnlocked:extraUnlocked[i-SECRET_LEVEL-1]))return;
  if(!challengeMode&&i<MAIN_MOUNTAINS&&i>=unlocked&&!(i===MAIN_MOUNTAINS-1&&summitTrailUnlocked))return;
  if(!challengeMode){equipment=adjustPowerForLevel(equipment,i);adjustRangerForLevel(i);}
  baseLoad(i);
  if(screen!=='game'||levelIndex!==i)return;
  secretChainDoor=null;secretItem=null;villageGuards.clear();
  if(!challengeMode&&i>=SECRET_LEVEL&&i<VILLAGE_INDEX){
   secretChainDoor=findSpot([]);
   secretItem=findSpot([secretChainDoor]);
   if(secretItem)secretItem={...secretItem,type:i===10?'bike':i===11?'glider':'radio'};
  }
  if(!challengeMode&&i===VILLAGE_INDEX){chooseVillageFlag();}
  if(ranger&&!challengeMode){Object.assign(ranger,initialRangerSpot());repelCoyotes();}
  saveExtras();
  if(!challengeMode){
   if(i===VILLAGE_INDEX)el('gameHint').textContent='🏘️ Villagers relocate the flag every five steps. Avoid their ambushes and the coyotes!';
   else if(i>=MAIN_MOUNTAINS)el('gameHint').textContent='✨ Find the special tool and a hidden door to the next secret world. Phantom Crater loops back to Hollow Mountain!';
  }
  draw();
 };
 draw=function(){
  baseDraw();
  if(!challengeMode&&levelIndex===VILLAGE_INDEX){
   el('mountainLabel').textContent='🏘️ BONUS VILLAGE LEVEL';
   el('levelStat').textContent='🏘️ Village';
   el('treasureStat').textContent='🧰 '+chestsOpened+'/3 · 🎒 '+totalTreasures()+' · 📖 '+collectedFacts.size+'/50';
  }else if(!challengeMode&&levelIndex>=MAIN_MOUNTAINS){
   el('treasureStat').textContent='✨ '+(secretItem?'Find the hidden tool':'Tool found')+' · 🚪 Secret passage';
  }else if(!challengeMode){
   el('treasureStat').textContent='🧰 '+chestsOpened+'/3 · 🎒 '+totalTreasures()+' · 📖 '+collectedFacts.size+'/50';
  }
  if(!challengeMode){
   const sh=el('shout');
   if(equipment?.type==='bike'){sh.textContent=cooldown?'🔔 Bell in '+cooldown:'🔔 BIKE BELL';sh.disabled=mode!=='playing'||cooldown>0;}
   else if(equipment?.type==='radio'){sh.textContent='📻 CALL RANGER';sh.disabled=mode!=='playing';}
   if(levelIndex===VILLAGE_INDEX&&mode==='won'){
    el('resultTitle').textContent='🏘️ VILLAGE ESCAPED!';
    el('resultBody').textContent='All 50 coyote facts collected, and you outsmarted the villagers and coyotes!';
   }
  }
  const tiles=el('field').children;
  function setAt(p,emoji,cls){
   if(!p||!inside(p.x,p.y)||same(runner,p))return;
   const tile=tiles[p.y*W+p.x];
   if(!tile||tile.classList.contains('tree')||tile.classList.contains('rock')||tile.classList.contains('coyote'))return;
   tile.textContent=emoji;tile.classList.add(cls);
  }
  if(!challengeMode){
   if(secretChainDoor&&distance(runner,secretChainDoor)<=3)setAt(secretChainDoor,'🚪','secret-chain');
   if(secretItem)setAt(secretItem,secretItem.type==='bike'?'🚲':secretItem.type==='glider'?'🪂':'📻','special-item');
   if(ranger)setAt(ranger,'👮','ranger');
   for(const k of villageGuards){const a=k.split(',').map(Number);setAt({x:a[0],y:a[1]},'🧑‍🌾','village-guard');}
   const runnerTile=tiles[runner.y*W+runner.x];
   if(runnerTile?.classList.contains('runner')){
    runnerTile.textContent=equipment?.type==='bike'?'🚴':equipment?.type==='glider'?'🪂':'🏃';
   }
  }
 };
 moveCoyotes=function(){if(ranger&&!challengeMode)repelCoyotes();baseMoveCoyotes();if(ranger&&!challengeMode)repelCoyotes();};
 tagged=function(){
  baseTag();
  if(ranger&&!challengeMode){Object.assign(ranger,initialRangerSpot());repelCoyotes();}
 };
 function collectSpecial(){
  if(!secretItem||!same(runner,secretItem))return false;
  const type=secretItem.type;
  equipment={type,origin:levelIndex,currentLevel:levelIndex,nextLevel:null};
  secretItem=null;cooldown=0;
  if(type==='bike')say('🚲 BICYCLE FOUND! Ride with 🚴. Ring the bell every THREE steps. Keep your bicycle in the next level!');
  else if(type==='glider')say('🪂 PARAGLIDER FOUND! Glide TWO squares per direction. The trail is yours!');
  else say('📻 RADIO FOUND! Press CALL RANGER to summon a ranger who protects you for this and the next map!');
  note(620,0,.12,{end:920,volume:.09});saveProgress();return true;
 }
 move=function(dx,dy){
  if(!canTakeAction())return;
  if(Math.abs(dx)+Math.abs(dy)!==1)return;
  const count=!challengeMode&&equipment?.type==='glider'?2:1;
  for(let n=0;n<count;n++){
   const target={x:runner.x+dx,y:runner.y+dy};
   if(blocked(target.x,target.y)){if(n===0)say('🚧 Blocked! Go around.');break;}
   if(!challengeMode&&secretChainDoor&&same(target,secretChainDoor)){
    const next=nextSecret(levelIndex);
    grantSecretAccess(next);playSecret(true);
    loadLevel(next);say('🚪 SECRET PASSAGE! '+LEVELS[next].name+' awaits!');break;
   }
   const previous={...runner},beforeLives=lives,beforeLevel=levelIndex;
   baseMove(dx,dy);
   if(levelIndex!==beforeLevel||mode!=='playing')break;
   if(same(previous,runner)&&lives===beforeLives)break;
   if(lives<beforeLives)break;
   if(!challengeMode&&ranger){ranger.x=previous.x;ranger.y=previous.y;repelCoyotes();}
   if(!challengeMode&&levelIndex===VILLAGE_INDEX){
    if(villageGuards.has(key(runner.x,runner.y))){
     tagged();say('🧑‍🌾 A villager helped the coyotes steal your lunch!');draw();break;
    }
    if(steps>0&&steps%5===0){chooseVillageFlag();say('🧑‍🌾 The villagers just MOVED the flag!');}
   }
   const found= !challengeMode&&collectSpecial();
   draw();
   if(found)break;
  }
 };
 function ringBikeBell(){
  let count=0,retreated=0;
  for(const c of coyotes){
   if(distance(c,runner)>7)continue;
   c.scared=Math.max(3,c.scared);
   count++;
   // A bell must visibly repel coyotes NOW, not merely set their AI to flee
   // on a future patrol turn. Use the same two-square retreat as SHOUT.
   for(let step=0;step<2;step++){
    const previousDistance=distance(c,runner);
    const retreatOptions=possibleMoves(c).filter(p=>distance(p,runner)>previousDistance);
    if(!retreatOptions.length)break; // Never force a frightened coyote closer.
    const farthest=Math.max(...retreatOptions.map(p=>distance(p,runner)));
    const choices=retreatOptions.filter(p=>distance(p,runner)===farthest);
    const next=choices[Math.floor(Math.random()*choices.length)];
    c.x=next.x;c.y=next.y;
    retreated++;
   }
  }
  cooldown=3;
  note(980,0,.14,{end:1230,volume:.13});
  note(1300,.15,.19,{end:820,volume:.11});
  say('🔔 RING RING! '+count+' coyote(s) frightened, '+retreated+' retreat steps! Bell recharges in 3 steps.');
  draw();
 }
 shout=function(){
  if(!canTakeAction())return;
  if(!challengeMode&&equipment?.type==='radio'){
   equipment=null;
   ranger={active:true,origin:levelIndex,currentLevel:levelIndex,nextLevel:null,...initialRangerSpot()};
   cooldown=0;repelCoyotes();saveProgress();
   note(380,0,.13,{end:620,volume:.08});
   note(760,.18,.2,{end:540,volume:.10});
   say('📻 Ranger called! 👮 The ranger follows one square behind, scares coyotes five squares away, and stays for the next map.');
   draw();return;
  }
  if(!challengeMode&&equipment?.type==='bike'){
   if(cooldown===0)ringBikeBell();
   return;
  }
  baseShout();
 };
 const baseWinMove=move;
 // Village completion is saved when its win transition occurs.
 const normalMove=move;
 move=function(dx,dy){
  const oldMode=mode,oldLevel=levelIndex;
  normalMove(dx,dy);
  if(!challengeMode&&oldLevel===VILLAGE_INDEX&&oldMode==='playing'&&mode==='won'){
   villageCleared=true;extraCleared[2]=true;saveProgress();draw();
  }
 };
 updateGuide();
 renderMap();
})();
