'use strict';
/* Gray Coyote Mountains: Secret Expeditions & Field Guide expansion.
   Loaded after the original game so pre-existing saves and challenge rules survive. */
const FACT_KEY='gray-coyote-mountains-facts-v1';
const POWER_KEY='gray-coyote-mountains-powers-v1';
const VILLAGE_KEY='gray-coyote-mountains-village-v1';
const VILLAGE_INDEX=13;
const BONUS_START=14;
const BONUS_KEY='gray-coyote-mountains-branch-expeditions-v1';
const BONUS_BY_SECRET={10:[14,15],11:[16,17],12:[18]};
// Five extra paths branch from normal Mountains 2, 4, 6, 8 and 10,
// complementing the first five secret-victory expeditions.
const BONUS_BY_MOUNTAIN={1:19,3:20,5:21,7:22,9:23};
const SECOND_BONUS_START=19;
const BONUS_PARENT={14:10,15:10,16:11,17:11,18:12,19:1,20:3,21:5,22:7,23:9};
const BONUS_CONFIGS=[
 {name:'Mistveil Lagoon',trees:23,rocks:15,alert:5,speed:3,sky1:'#8ed0d4',sky2:'#e6e4b3',peak:'#689c96',shade:'#386e72',snow:'#f5efcf',icon:'🦆',desc:'Mist rolls across the hidden lagoon'},
 {name:'Echo Fern Forest',trees:39,rocks:12,alert:6,speed:3,sky1:'#a4cfb8',sky2:'#d0daa5',peak:'#528771',shade:'#2b6451',snow:'#e8e9cc',icon:'🌿',desc:'Secret fern groves echo through the trees'},
 {name:'Crystal Icefall',trees:17,rocks:33,alert:7,speed:2,sky1:'#9ac0e0',sky2:'#d4e3f7',peak:'#7c9ab7',shade:'#486b91',snow:'#fbfcfc',icon:'🧊',desc:'A frozen trail above glittering icefalls'},
 {name:'Moonshadow Caverns',trees:24,rocks:37,alert:7,speed:2,sky1:'#41496c',sky2:'#8f7baf',peak:'#655d89',shade:'#303657',snow:'#c8c9ee',icon:'🦇',desc:'Dark passages and shimmering stone'},
 {name:'Starfall Observatory',trees:24,rocks:28,alert:8,speed:2,sky1:'#394c7c',sky2:'#8d83bb',peak:'#6b719c',shade:'#394672',snow:'#f4ecff',icon:'🌠',desc:'The final hidden peak beneath the stars'},
 {name:'Tidepool Terrace',trees:21,rocks:29,alert:5,speed:3,sky1:'#99d7dc',sky2:'#d9e5ae',peak:'#79ada5',shade:'#447f7e',snow:'#e8f4da',icon:'🦀',desc:'A hidden shoreline among tidepools'},
 {name:'Redwood Ravine',trees:47,rocks:12,alert:6,speed:3,sky1:'#90c4b0',sky2:'#d0dc9c',peak:'#568870',shade:'#245845',snow:'#dde4b9',icon:'🌲',desc:'Giant trees shade a twisting canyon'},
 {name:'Thunderstone Pass',trees:19,rocks:41,alert:7,speed:2,sky1:'#788ba7',sky2:'#d4c8a8',peak:'#7b7d86',shade:'#485b70',snow:'#f1e7d1',icon:'⛈️',desc:'Rumbling clouds above ancient boulders'},
 {name:'Sunflower Bluff',trees:32,rocks:20,alert:7,speed:2,sky1:'#add7c3',sky2:'#f8e09a',peak:'#a7ae64',shade:'#6b8954',snow:'#fff0b5',icon:'🌻',desc:'Sunny hills hide a flowered ledge'},
 {name:'Aurora Crown',trees:28,rocks:38,alert:8,speed:2,sky1:'#586db0',sky2:'#a1b4d9',peak:'#747faf',shade:'#464f84',snow:'#f2f6ff',icon:'🌌',desc:'A secret summit glowing after dusk'}
];
let bonusUnlocked=new Set(),bonusCleared=new Set();
try{
 const bonus=JSON.parse(localStorage.getItem(BONUS_KEY)||'{}');
 if(Array.isArray(bonus.unlocked))bonusUnlocked=new Set(bonus.unlocked.filter(i=>Number.isInteger(i)&&i>=BONUS_START&&i<BONUS_START+BONUS_CONFIGS.length));
 if(Array.isArray(bonus.cleared))bonusCleared=new Set(bonus.cleared.filter(i=>Number.isInteger(i)&&i>=BONUS_START&&i<BONUS_START+BONUS_CONFIGS.length));
}catch(error){console.warn('Unable to restore bonus expeditions',error);}
let collectedFacts=new Set(),equipment=null,ranger=null;
let secretItem=null,secretChainDoor=null,normalBonusDoor=null,bonusTunnel=null,villageFlag={x:3,y:3},villageGuards=new Set(),villageCleared=false;
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
// Existing secret victories also count: returning players need not replay
// a level they have already won to unlock the new bonus expeditions.
if(secretCleared)for(const i of BONUS_BY_SECRET[10])bonusUnlocked.add(i);
if(extraCleared[0])for(const i of BONUS_BY_SECRET[11])bonusUnlocked.add(i);
if(extraCleared[1])for(const i of BONUS_BY_SECRET[12])bonusUnlocked.add(i);
for(const i of bonusCleared)bonusUnlocked.add(i);
for(let n=0;n<BONUS_CONFIGS.length;n++){
 extraUnlocked[3+n]=bonusUnlocked.has(BONUS_START+n);
 extraCleared[3+n]=bonusCleared.has(BONUS_START+n);
}
LEVELS.push({
 name:'The Lunch Snatch Village',trees:22,rocks:14,alert:8,speed:2,
 sky1:'#b7d6b7',sky2:'#f4d89d',peak:'#859762',shade:'#416a4c',snow:'#ecedc8',
 icon:'🏘️',desc:'The villagers and coyotes team up!'
});
LEVELS.push(...BONUS_CONFIGS);
(function installExpansion(){
 const baseSave=saveProgress,baseRenderMap=renderMap,baseRenderChallenge=renderChallengePicker;
 const baseLoad=loadLevel,baseDraw=draw,baseMove=move,baseMoveCoyotes=moveCoyotes;
 const baseGoal=activeGoal,baseChests=createChestsAndPortals,baseCollect=collectChest,baseShout=shout,baseTag=tagged;
 const baseBlocked=blocked;
 // The bonus levels share the existing Adventure collision and timer rules.
 // Their unlocks are stored separately from the legacy secret-world save.
 const bonusPanel=document.createElement('section');
 bonusPanel.id='bonusExpeditionPanel';bonusPanel.className='bonus-expedition-panel';
 bonusPanel.setAttribute('aria-label','Ten extra mountains on the illustrated Adventure map');
 bonusPanel.innerHTML='<div class="bonus-map-heading"><h3>⛰️ Tunnel Mountains</h3><p>Ten regular mountains continue below. Reach them through tunnels from the three original secret levels and from regular Mountains 2, 4, 6, 8 and 10.</p></div><div id="bonusExpeditionGrid" class="bonus-expedition-grid" aria-label="Ten extra mountain locations"></div><p id="bonusExpeditionProgress" class="bonus-expedition-progress" aria-live="polite"></p>';
 // Place the new peaks IN the Adventure map, continuing its vertical scenery.
 document.querySelector('#mapScreen .map-scene .map-swipe-hint').before(bonusPanel);
 const branchDialog=document.createElement('dialog');
 branchDialog.id='secretBranchDialog';
 branchDialog.setAttribute('aria-label','Choose a secret door destination');
 branchDialog.innerHTML='<div class="branch-dialog-head"><h2>🚪 Original Secret Passage</h2><p id="secretBranchIntro"></p></div><div class="branch-option"><strong>🔮 Continue to another secret level</strong><div id="secretExistingChoices"></div></div><button type="button" class="btn secondary" id="cancelSecretBranch">Keep exploring</button>';
 document.body.append(branchDialog);
 document.getElementById('cancelSecretBranch').addEventListener('click',()=>branchDialog.close());
 branchDialog.addEventListener('click',event=>{if(event.target===branchDialog)branchDialog.close();});
 const tunnelDialog=document.createElement('dialog');
 tunnelDialog.id='regularTunnelDialog';tunnelDialog.setAttribute('aria-label','Choose mountain tunnel');
 tunnelDialog.innerHTML='<h2>🕳️ Mountain Tunnel</h2><p id="regularTunnelIntro"></p><div id="regularTunnelChoices"></div><button type="button" class="btn secondary" id="cancelRegularTunnel">Keep exploring</button>';
 document.body.append(tunnelDialog);
 document.getElementById('cancelRegularTunnel').addEventListener('click',()=>tunnelDialog.close());
 tunnelDialog.addEventListener('click',event=>{if(event.target===tunnelDialog)tunnelDialog.close();});
 const tunnelStyles=document.createElement('style');
 tunnelStyles.textContent='#regularTunnelDialog{width:min(550px,94vw);max-height:90dvh;overflow:auto;background:#243f36;color:#f9ebcf;border:3px solid #d1ae78;border-radius:17px;padding:20px;box-shadow:0 20px 55px #071a16}#regularTunnelDialog::backdrop{background:#061a1dcc}#regularTunnelDialog h2{color:#f9d995;margin:0 0 8px}#regularTunnelChoices{display:flex;flex-wrap:wrap;gap:9px;margin:13px 0}#regularTunnelChoices button{white-space:normal;min-height:48px}.tunnel-marker{background:#cfb88c!important;border-radius:4px!important;box-shadow:inset 0 0 0 2px #775d43}';
 document.head.append(tunnelStyles);
 const routeStyles=document.createElement('style');
 routeStyles.textContent=`
 .bonus-expedition-panel{max-width:100%;margin:22px auto;padding:19px 17px;background:linear-gradient(145deg,#22483d,#234d59);border:2px solid #b19a6e;border-radius:20px}
 .bonus-expedition-panel h3{font-size:1.55rem;color:#f8d89b;margin:0 0 6px}
 .bonus-expedition-panel>p{color:#e2ead2;line-height:1.4;margin:5px 0 14px}
 .bonus-expedition-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,245px),1fr));gap:11px}
 .bonus-expedition-route{font:inherit;display:flex;text-align:left;align-items:center;gap:12px;min-width:0;width:100%;min-height:108px;border:2px solid #c4b18b;border-radius:14px;background:linear-gradient(#fff0cc,#dacfae);color:#213c37;padding:12px;box-shadow:0 4px 0 #152f2b83}
 .bonus-expedition-route:disabled{background:linear-gradient(#d4d8d0,#9fb3ad);color:#354b46;opacity:.85}
 .bonus-expedition-route:not(:disabled):hover{background:#ffedbb;transform:translateY(-2px)}
 .bonus-expedition-icon{font-size:2.5rem;flex:none}
 .bonus-expedition-info{display:flex;flex-direction:column;min-width:0;gap:2px}
 .bonus-expedition-info strong{font-size:1.05rem;line-height:1.15}
 .bonus-expedition-info small{font-size:.77rem;line-height:1.24}
 .bonus-expedition-status{font-size:.82rem;font-weight:850;color:#30694f}
 .bonus-expedition-progress{font-weight:800}
 #secretBranchDialog{width:min(600px,94vw);max-height:90dvh;overflow:auto;padding:21px;background:#1b3c37;color:#f9efd9;border:2px solid #c8ad71;border-radius:20px;box-shadow:0 20px 70px #041813}
 #secretBranchDialog::backdrop{background:#061a1dcc}
 #secretBranchDialog h2{font-size:1.5rem;margin:0 0 9px;color:#f8d89e}
 #secretBranchIntro{color:#d5e7d2;margin:0 0 12px}
 #secretBranchDialog .branch-option{padding:12px;border:1px solid #739078;border-radius:14px;margin:12px 0;background:#2d5348}
 #secretBranchDialog .branch-option strong{display:block;margin-bottom:7px}
 #secretBonusChoices,#secretExistingChoices{display:flex;gap:9px;flex-wrap:wrap}
 #secretBranchDialog .btn{white-space:normal;min-height:43px;text-align:center}
 #secretBranchDialog .bonus-lock-hint{margin:4px;color:#e3d9b7;font-size:.9rem}
 @media(max-width:600px){.bonus-expedition-grid{grid-template-columns:1fr}.bonus-expedition-panel{padding:13px}.bonus-expedition-route{min-height:90px}}
 `;
 document.head.append(routeStyles);
 // Extend the same illustrated vertical mountain map instead of displaying
 // ten disconnected cards. Buttons remain native touch/keyboard controls.
 const trailStyles=document.createElement('style');
 trailStyles.textContent=`
 #mapScreen .bonus-expedition-panel{width:100%;max-width:none;margin:0;padding:0;border:0;border-radius:0;box-shadow:none;background:#83a8a0;overflow:visible}
 #mapScreen .bonus-map-heading{padding:19px 14px 13px;text-align:center;background:linear-gradient(160deg,#284f47,#365d6b);border-top:3px solid #c6ab79;border-bottom:3px solid #c6ab79}
 #mapScreen .bonus-expedition-panel h3{margin:0 0 7px;color:#f7d995;font-size:clamp(1.3rem,4.3vw,2rem)}
 #mapScreen .bonus-expedition-panel .bonus-map-heading p{max-width:620px;margin:0 auto;color:#d9e7db;font-size:.88rem}
 #mapScreen .bonus-expedition-grid{position:relative;display:block;width:100%;height:2550px;min-width:0;max-width:none;margin:0;overflow:hidden;border:0;border-radius:0;background:#789e9e url("assets/ten-hidden-peaks.svg") center top / 100% 100% no-repeat}
 #mapScreen .bonus-expedition-route{position:absolute;z-index:2;left:var(--trail-x);top:var(--trail-y);transform:translate(-50%,-50%);width:clamp(122px,38%,230px);min-width:0;min-height:135px;max-height:180px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;padding:8px 7px;text-align:center;border:3px solid #775738;border-radius:16px;background:linear-gradient(160deg,#fff2d4,#ddc38f);color:#283e37;box-shadow:0 4px 0 #74563c,0 9px 13px #193a386b}
 #mapScreen .bonus-expedition-route:not(:disabled):hover{transform:translate(-50%,calc(-50% - 3px));background:#ffefbd}
 #mapScreen .bonus-expedition-route:disabled{opacity:.9;background:linear-gradient(160deg,#e0e0d4,#afb9b4);filter:saturate(.65)}
 #mapScreen .bonus-expedition-route:focus-visible{outline:4px solid #fff0a9;outline-offset:3px}
 #mapScreen .bonus-expedition-icon{font-size:clamp(1.45rem,4.2vw,2rem);line-height:1.05}
 #mapScreen .bonus-expedition-info{display:flex;align-items:center;gap:3px;min-width:0;max-width:100%}
 #mapScreen .bonus-expedition-info strong{font-size:clamp(.76rem,2.2vw,1rem);line-height:1.15;overflow-wrap:break-word}
 #mapScreen .bonus-expedition-info small{font-size:clamp(.63rem,1.7vw,.76rem);line-height:1.2}
 #mapScreen .bonus-expedition-status{font-size:clamp(.7rem,2vw,.82rem);font-weight:900;color:#22533d}
 #mapScreen .bonus-expedition-progress{display:block;margin:0;padding:15px 8px;text-align:center;color:#fae6b7;background:#29453d;font-weight:800}
 @media(max-width:420px){
  #mapScreen .bonus-expedition-route{width:42%;min-height:139px;max-height:195px;padding:7px 4px;border-width:2px;border-radius:12px}
  #mapScreen .bonus-expedition-info small{font-size:.64rem}
  #mapScreen .bonus-expedition-info strong{font-size:.77rem}
 }
 @media(prefers-reduced-motion:reduce){#mapScreen .bonus-expedition-route{transition:none}}
 `;
 document.head.append(trailStyles);
 // The original SVG atlas has 13 silhouettes. Reuse a mountain landscape for the bonus village.
 const originalMountainSVG=mountainSVG;
 mountainSVG=function(i){return originalMountainSVG(i===VILLAGE_INDEX?1:i>=BONUS_START?(i-BONUS_START+4)%MAIN_MOUNTAINS:i);};
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
 styles.textContent += `
/* Gray village pavement and single-square houses; original obstacle sets
   still block coyotes and unequipped players. */
.game-frame.village-zone #field{background:#747779;border-color:#aaa8a2}
/* Secret worlds use more specific :not selectors; keep pavement gray in the village. */
.game-frame.village-zone.secret-zone .tile:not(.tree):not(.rock):not(.runner):not(.coyote):not(.exit){background:#989d9f}
.game-frame.village-zone.secret-zone .tile:not(.tree):not(.rock):not(.runner):not(.coyote):not(.exit):nth-child(4n){background:#a7abae}
.game-frame.village-zone .tile{background:#989d9f}
.game-frame.village-zone .tile:nth-child(4n){background:#a7abae}
.game-frame.village-zone .tile.house{background:#bd9a80;box-shadow:inset 0 0 0 2px #e6c4a0;font-size:clamp(12px,2.5vw,25px)}
.game-frame.village-zone .tile.runner{background:#c5dea9}
.game-frame.village-zone .tile.coyote{background:#c99a73}
.game-frame.village-zone .tile.exit{background:#e7ce83}
.game-frame.village-zone .tile.chest{background:#dcae61}
.game-frame.village-zone .tile.village-guard{background:#d7b294!important}
`;
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
   localStorage.setItem(BONUS_KEY,JSON.stringify({unlocked:[...bonusUnlocked].sort((a,b)=>a-b),cleared:[...bonusCleared].sort((a,b)=>a-b)}));
  }catch(error){console.warn('Expansion save unavailable',error);}
 }
 saveProgress=function(){
  // Legacy save format stores only two additional secret-world flags.
  // Keep all five bonus expedition flags and the village in memory while
  // the base saver writes its historical two-flag schema.
  const tailUnlocked=extraUnlocked.slice(2),tailCleared=extraCleared.slice(2);
  extraUnlocked.length=2;extraCleared.length=2;
  try{baseSave();}finally{
   extraUnlocked.push(...tailUnlocked);extraCleared.push(...tailCleared);
  }
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

 function bonusUnlockedAt(i){return bonusUnlocked.has(i);}
 function markBonusUnlocked(i){
  if(i<BONUS_START||i>=BONUS_START+BONUS_CONFIGS.length)return;
  bonusUnlocked.add(i);extraUnlocked[i-SECRET_LEVEL-1]=true;
 }
 function markSecretVictory(i){
  for(const n of BONUS_BY_SECRET[i]||[])markBonusUnlocked(n);
 }
 function renderBonusPanel(){
  const grid=document.getElementById('bonusExpeditionGrid');
  grid.replaceChildren();
  const stops=[[29,10],[71,19],[29,28],[71,37],[29,46],[71,59],[29,68],[71,77],[29,86],[71,95]];
  BONUS_CONFIGS.forEach((cfg,j)=>{
   const i=BONUS_START+j,source=BONUS_PARENT[i];
   const sourceIsNormal=source<MAIN_MOUNTAINS;
   const sourceName=sourceIsNormal?'Mountain '+(source+1):LEVELS[source].name;
   const unlocked=bonusUnlockedAt(i),done=bonusCleared.has(i);
   const button=document.createElement('button');
   const [x,y]=stops[j];
   button.type='button';button.className='bonus-expedition-route';
   button.style.setProperty('--trail-x',x+'%');
   button.style.setProperty('--trail-y',y+'%');
   button.disabled=!unlocked;
   button.dataset.bonusLevel=String(i);
   button.setAttribute('aria-label','Regular tunnel mountain '+(j+11)+' of 20: '+cfg.name+', '+(done?'completed':unlocked?'available':'locked')+'. '+(sourceIsNormal?'Find a tunnel on ':'Win ')+sourceName+' to unlock.');
   button.innerHTML='<span class="bonus-expedition-icon">'+cfg.icon+'</span><span class="bonus-expedition-info"><strong>Mountain '+(j+11)+' · '+cfg.name+'</strong><small>'+cfg.desc+'</small><small>🕳️ '+(sourceIsNormal?'Tunnel: ':'After winning: ')+sourceName+'</small><span class="bonus-expedition-status">'+(done?'🏁 Cleared':unlocked?'🔓 Play':sourceIsNormal?'🔒 Find tunnel':'🔒 Win secret')+'</span></span>';
   if(unlocked)button.addEventListener('click',()=>loadLevel(i));
   grid.append(button);
  });
  document.getElementById('bonusExpeditionProgress').textContent='🏆 '+bonusCleared.size+'/10 completed · 🔓 '+bonusUnlocked.size+'/10 unlocked';
 }
 function enterBranch(i){
  if(!Number.isInteger(i)||i<10||i>=LEVELS.length)return;
  branchDialog.close();
  // Preserve the original secret chain unlock behavior.
  if(i>=10&&i<=12)grantSecretAccess(i);
  loadLevel(i);
  if(levelIndex===i)say('🚪 SECRET TRAIL! Welcome to '+LEVELS[i].name+'!');
 }
 function openBranchChoices(){
  // Legacy secret doors lead only to other secret worlds. New regular
  // mountain levels are reached through a physically separate tunnel.
  if(challengeMode||levelIndex<SECRET_LEVEL||levelIndex>=VILLAGE_INDEX)return;
  const next=nextSecret(levelIndex);
  document.getElementById('secretBranchIntro').textContent='The secret passage leads to '+LEVELS[next].name+'.';
  const choices=document.getElementById('secretExistingChoices');
  choices.replaceChildren();
  const button=document.createElement('button');button.type='button';button.className='btn primary';
  button.textContent='🚪 '+LEVELS[next].name;
  button.addEventListener('click',()=>enterBranch(next));choices.append(button);
  if(!branchDialog.open)branchDialog.showModal();
 }
 function openTunnelChoices(){
  if(challengeMode||!bonusTunnel)return;
  const choices=document.getElementById('regularTunnelChoices');
  choices.replaceChildren();
  const targets=levelIndex>=BONUS_START?[BONUS_PARENT[levelIndex]]:(BONUS_BY_SECRET[levelIndex]||[]).filter(i=>bonusUnlockedAt(i));
  document.getElementById('regularTunnelIntro').textContent=targets.length?'Choose a mountain at the other end of the tunnel.':'Reach this secret level’s flag first to unlock the regular mountain tunnels.';
  for(const target of targets){
   const button=document.createElement('button');button.type='button';button.className='btn primary';
   button.textContent=LEVELS[target].icon+' '+LEVELS[target].name;
   button.addEventListener('click',()=>{tunnelDialog.close();loadLevel(target);if(levelIndex===target)say('🕳️ TUNNEL EXIT! Welcome to '+LEVELS[target].name+'!');});
   choices.append(button);
  }
  if(!tunnelDialog.open)tunnelDialog.showModal();
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
  // Radio is a one-map pickup. Like the bicycle, the paraglider stays
  // equipped on the first following level (including after a secret door),
  // then expires when the player enters a different level again.
  if(power.type==='radio')return null;
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
  normalBonusDoor=null;
  baseChests();
  if(challengeMode)return;
  // The original secret portals on Mountains 5, 7 and 9 are unchanged.
  // Five OTHER normal mountains have a separate discoverable extra door.
  if(Object.hasOwn(BONUS_BY_MOUNTAIN,levelIndex)){
   normalBonusDoor=findSpot([START,GOAL,extraDoor,SECRET_DOOR,...SPAWNS]);
   if(normalBonusDoor&&!connected(START,normalBonusDoor))normalBonusDoor=null;
  }
  if(levelIndex>=SECRET_LEVEL&&levelIndex<VILLAGE_INDEX){
   const p=findSpot([]);
   if(p)chests.set(key(p.x,p.y),'fact');
  }
  if(levelIndex>=BONUS_START){
   // Three rewards in each hidden route: a fact and two treasures.
   for(let n=0;n<3;n++){
    const spot=findSpot([]);
    if(spot)chests.set(key(spot.x,spot.y),n===0?'fact':TREASURES[(levelIndex+n)%TREASURES.length].id);
   }
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
  // Keep the portrait Adventure map limited to its original 14 positions.
  // The five new levels render as a separate, accessible branching section.
  const extras=LEVELS.splice(BONUS_START);
  try{baseRenderMap();}finally{LEVELS.push(...extras);}
  renderBonusPanel();
  const secretsFound=Number(secretUnlocked)+Number(Boolean(extraUnlocked[0]))+Number(Boolean(extraUnlocked[1]));
  el('progress').textContent='⛰️ '+cleared+'/10 cleared · 🧰 '+totalTreasures()+' treasures · 🐺 '+coyoteCount()+' coyotes · 💎 '+secretsFound+'/3 secrets · 🌟 '+bonusUnlocked.size+'/10 bonus trails · 📖 '+collectedFacts.size+'/50 facts';
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
  if(branchDialog.open)branchDialog.close();
  if(tunnelDialog.open)tunnelDialog.close();
  if(i>=BONUS_START&&challengeMode)return;
  if(i===VILLAGE_INDEX&&(challengeMode||collectedFacts.size!==50))return;
  if(!Number.isInteger(i)||i<0||i>=LEVELS.length)return;
  // Do not consume carried equipment on a forbidden map selection.
  if(!challengeMode&&i>=MAIN_MOUNTAINS&&i!==VILLAGE_INDEX&&!(i===SECRET_LEVEL?secretUnlocked:extraUnlocked[i-SECRET_LEVEL-1]))return;
  if(!challengeMode&&i<MAIN_MOUNTAINS&&i>=unlocked&&!(i===MAIN_MOUNTAINS-1&&summitShortcutCleared))return;
  if(!challengeMode){equipment=adjustPowerForLevel(equipment,i);adjustRangerForLevel(i);}
  baseLoad(i);
  if(screen!=='game'||levelIndex!==i)return;
  secretChainDoor=null;secretItem=null;bonusTunnel=null;villageGuards.clear();
  if(!challengeMode&&i>=SECRET_LEVEL&&i<VILLAGE_INDEX){
   secretChainDoor=findSpot([]);bonusTunnel=findSpot([secretChainDoor]);
   secretItem=findSpot([secretChainDoor,bonusTunnel]);
   if(secretItem)secretItem={...secretItem,type:i===10?'bike':i===11?'glider':'radio'};
  }else if(!challengeMode&&i>=BONUS_START){
   bonusTunnel=findSpot([]);
  }
  if(!challengeMode&&i===VILLAGE_INDEX){chooseVillageFlag();}
  if(ranger&&!challengeMode){Object.assign(ranger,initialRangerSpot());repelCoyotes();}
  saveExtras();
  if(!challengeMode){
   if(i===VILLAGE_INDEX)el('gameHint').textContent='🏘️ Villagers relocate the flag every five steps. Avoid their ambushes and the coyotes!';
   else if(i>=BONUS_START)el('gameHint').textContent='⛰️ Regular mountain! Collect three chests, reach the flag, or use the tunnel to return.';
   else if(i>=MAIN_MOUNTAINS)el('gameHint').textContent='✨ Find the special tool and hidden door. Win this secret level to unlock new bonus mountains, then choose your path at the door!';
   else if(Object.hasOwn(BONUS_BY_MOUNTAIN,i))el('gameHint').textContent='🕳️ Find the tunnel to '+LEVELS[BONUS_BY_MOUNTAIN[i]].name+' on this mountain!';
  }
  draw();
 };
 draw=function(){
  baseDraw();
  if(!challengeMode&&levelIndex===VILLAGE_INDEX){
   el('mountainLabel').textContent='🏘️ BONUS VILLAGE LEVEL';
   el('levelStat').textContent='🏘️ Village';
   el('treasureStat').textContent='🧰 '+chestsOpened+'/3 · 🎒 '+totalTreasures()+' · 📖 '+collectedFacts.size+'/50';
  }else if(!challengeMode&&levelIndex>=BONUS_START){
   el('mountainLabel').textContent='⛰️ EXTRA MOUNTAIN '+(levelIndex-BONUS_START+11)+'/20';
   el('levelStat').textContent='⛰️ Mountain '+(levelIndex-BONUS_START+11);
   el('treasureStat').textContent='🧰 '+chestsOpened+'/3 · 🌟 '+(bonusCleared.has(levelIndex)?'Cleared':'Find the flag')+' · 📖 '+collectedFacts.size+'/50';
  }else if(!challengeMode&&levelIndex>=MAIN_MOUNTAINS){
   el('treasureStat').textContent='✨ '+(secretItem?'Find the hidden tool':'Tool found')+' · 🚪 Secret passage';
  }else if(!challengeMode){
   el('treasureStat').textContent='🧰 '+chestsOpened+'/3 · 🎒 '+totalTreasures()+' · 📖 '+collectedFacts.size+'/50';
  }
  if(!challengeMode){
   const sh=el('shout');
   if(equipment?.type==='bike'){sh.textContent=cooldown?'🔔 Bell in '+cooldown:'🔔 BIKE BELL';sh.disabled=mode!=='playing'||cooldown>0;}
   else if(equipment?.type==='radio'){sh.textContent='📻 CALL RANGER';sh.disabled=mode!=='playing';}
   if(levelIndex>=BONUS_START&&mode==='won'){
    el('resultTitle').textContent='🏁 MOUNTAIN CLEARED!';
    el('resultBody').textContent='You beat '+LEVELS[levelIndex].name+' like a regular Adventure mountain! Progress is saved.';
   }
   if(levelIndex===VILLAGE_INDEX&&mode==='won'){
    el('resultTitle').textContent='🏘️ VILLAGE ESCAPED!';
    el('resultBody').textContent='All 50 coyote facts collected, and you outsmarted the villagers and coyotes!';
   }
  }
  const tiles=el('field').children;
  const village=!challengeMode&&levelIndex===VILLAGE_INDEX;
  el('gameFrame').classList.toggle('village-zone',village);
  if(village)for(const tile of tiles){
   // One house per solid obstacle square; no multi-square buildings.
   if(tile.classList.contains('tree')||tile.classList.contains('rock')){
    tile.textContent='🏠';tile.classList.add('house');
   }else if(tile.textContent==='🌾')tile.textContent='';
  }
  function setAt(p,emoji,cls){
   if(!p||!inside(p.x,p.y)||same(runner,p))return;
   const tile=tiles[p.y*W+p.x];
   if(!tile||tile.classList.contains('tree')||tile.classList.contains('rock')||tile.classList.contains('coyote'))return;
   tile.textContent=emoji;tile.classList.add(cls);
  }
  if(!challengeMode){
   if(secretChainDoor&&distance(runner,secretChainDoor)<=3)setAt(secretChainDoor,'🚪','secret-chain');
   if(bonusTunnel)setAt(bonusTunnel,'🕳️','tunnel-marker');
   if(normalBonusDoor)setAt(normalBonusDoor,'🕳️','tunnel-marker');
   if(secretItem)setAt(secretItem,secretItem.type==='bike'?'🚲':secretItem.type==='glider'?'🪂':'📻','special-item');
   if(ranger)setAt(ranger,'👮','ranger');
   for(const k of villageGuards){const a=k.split(',').map(Number);setAt({x:a[0],y:a[1]},'🧑‍🌾','village-guard');}
   const runnerTile=tiles[runner.y*W+runner.x];
   // Overlay the glider on a solid obstacle so the player never disappears.
   if(equipment?.type==='glider'&&runnerTile&&
     (runnerTile.classList.contains('tree')||runnerTile.classList.contains('rock'))){
    runnerTile.classList.add('runner','glider-hover');
   }
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
  else if(type==='glider')say('🪂 PARAGLIDER FOUND! Fly ONE square at a time, even onto trees and rocks. Keep it in the next level!');
  else say('📻 RADIO FOUND! Press CALL RANGER to summon a ranger who protects you for this and the next map!');
  note(620,0,.12,{end:920,volume:.09});saveProgress();return true;
 }
 move=function(dx,dy){
  if(branchDialog.open||tunnelDialog.open)return;
  if(!canTakeAction())return;
  if(Math.abs(dx)+Math.abs(dy)!==1)return;
  const gliding=!challengeMode&&equipment?.type==='glider';
  const count=1; // All equipment uses the standard one-square move.
  for(let n=0;n<count;n++){
   const target={x:runner.x+dx,y:runner.y+dy};
   if(!inside(target.x,target.y)||(blocked(target.x,target.y)&&!gliding)){
    say('🚧 Blocked! Go around.');break;
   }
   if(!challengeMode&&secretChainDoor&&same(target,secretChainDoor)){
    openBranchChoices();
    break;
   }
   if(!challengeMode&&bonusTunnel&&same(target,bonusTunnel)){
    openTunnelChoices();
    break;
   }
   if(!challengeMode&&normalBonusDoor&&same(target,normalBonusDoor)){
    const bonus=BONUS_BY_MOUNTAIN[levelIndex];
    markBonusUnlocked(bonus);
    saveProgress();
    note(420,0,.18,{end:610,type:'triangle',volume:.1});
    loadLevel(bonus);
    if(levelIndex===bonus)say('🕳️ MOUNTAIN TUNNEL! '+LEVELS[bonus].name+' unlocked from Mountain '+(BONUS_PARENT[bonus]+1)+'!');
    break;
   }
   const previous={...runner},beforeLives=lives,beforeLevel=levelIndex;
   baseMove(dx,dy,gliding);
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
 // Secret victories unlock their associated branches, while bonus victories
 // record their own completion. Neither changes the original levels' progress.
 const normalMove=move;
 move=function(dx,dy){
  const oldMode=mode,oldLevel=levelIndex;
  normalMove(dx,dy);
  if(challengeMode||oldMode!=='playing'||mode!=='won')return;
  if(oldLevel>=SECRET_LEVEL&&oldLevel<VILLAGE_INDEX){
   markSecretVictory(oldLevel);
   saveProgress();
   if(oldLevel===SECRET_LEVEL){
    // The Hollow victory trail is mandatory. Save the victory first, then
    // enter the first new bonus mountain automatically without a choice.
    loadLevel(BONUS_START);
    if(levelIndex===BONUS_START){
     say('🕳️ MANDATORY TUNNEL! Hollow Mountain leads to regular Mountain 11: Mistveil Lagoon. Find the flag!');
     draw();
    }
   }else{
    draw();
    say('🌟 SECRET VICTORY! '+BONUS_BY_SECRET[oldLevel].map(i=>LEVELS[i].name).join(' and ')+' unlocked!');
   }
  }else if(oldLevel>=BONUS_START){
   bonusCleared.add(oldLevel);extraCleared[oldLevel-SECRET_LEVEL-1]=true;
   saveProgress();draw();
  }else if(oldLevel===VILLAGE_INDEX){
   villageCleared=true;extraCleared[2]=true;saveProgress();draw();
  }
 };
 updateGuide();
 renderMap();
})();
