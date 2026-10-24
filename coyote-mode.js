'use strict';
/* Standalone bonus mode. Never mutates Adventure, Challenge, treasures, or coyotes. */
(function installPlayAsCoyote(){
 const WIDTH=18, HEIGHT=14, DURATION=150000, WIN_KEY='gray-coyote-mountains-coyote-mode-wins-v1';
 const START={x:1,y:12}, DEN={x:16,y:1};
 const PEOPLE=[
  {x:5,y:9,type:'ranger',icon:'🧑‍✈️',name:'park ranger'},
  {x:10,y:7,type:'visitor',icon:'🚶',name:'park visitor'},
  {x:14,y:3,type:'visitor',icon:'🚶‍♀️',name:'park visitor'}
 ];
 const CUB_START=[{x:1,y:13},{x:2,y:12}];
 const UNLOCK_KEY='gray-coyote-mountains-coyote-unlocked-v1';
 const CLEARED_KEY='gray-coyote-mountains-coyote-cleared-v1';
 // All locations are playful, Shoreline/Baylands-inspired landscapes.
 // A wide obstacle-free border route remains available in each map.
 const MOUNTAINS=[
  {name:'Baylands Trail',alert:5,speed:3,icon:'🌾',habitat:'baylands',detail:'Learn to lead your cubs past the Baylands',
   start:START,den:DEN,cubs:CUB_START,people:PEOPLE,duration:150000,seed:912384,obstacles:.23,terrain:['tree','rock']},
  {name:'Salt Marsh Lookout',alert:5,speed:3,icon:'🦆',habitat:'marsh',detail:'Winding marsh channels and taller reeds',
   start:{x:16,y:12},den:{x:1,y:1},cubs:[{x:16,y:13},{x:15,y:12}],
   people:[{x:6,y:5,type:'ranger',icon:'🧑‍✈️',name:'ranger'},{x:10,y:7,type:'visitor',icon:'🚶',name:'visitor'},{x:14,y:5,type:'visitor',icon:'🚶‍♀️',name:'visitor'}],
   duration:145000,seed:728204,obstacles:.27,terrain:['brush','water','rock']},
  {name:'Stevens Creek Pass',alert:6,speed:3,icon:'💧',habitat:'creek',detail:'Rocks and creekside trees make tight turns',
   start:START,den:DEN,cubs:CUB_START,
   people:[{x:4,y:4,type:'visitor',icon:'🚶',name:'visitor'},{x:7,y:8,type:'ranger',icon:'🧑‍✈️',name:'ranger'},{x:13,y:6,type:'visitor',icon:'🚶‍♀️',name:'visitor'},{x:10,y:3,type:'visitor',icon:'🚶',name:'visitor'}],
   duration:140000,seed:822111,obstacles:.30,terrain:['tree','rock','water']},
  {name:'Coyote Grasslands',alert:6,speed:2,icon:'🌿',habitat:'grassland',detail:'Wide grassland paths with more visitors',
   start:{x:16,y:12},den:{x:1,y:1},cubs:[{x:16,y:13},{x:15,y:12}],
   people:[{x:5,y:4,type:'visitor',icon:'🚶',name:'visitor'},{x:8,y:7,type:'ranger',icon:'🧑‍✈️',name:'ranger'},{x:12,y:8,type:'visitor',icon:'🚶‍♀️',name:'visitor'},{x:14,y:3,type:'visitor',icon:'🚶',name:'visitor'}],
   duration:135000,seed:994310,obstacles:.32,terrain:['brush','rock','tree']},
  {name:'Sycamore Ridge',alert:7,speed:2,icon:'🌳',habitat:'woods',detail:'Dense tree cover and winding shortcuts',
   start:START,den:DEN,cubs:CUB_START,
   people:[{x:5,y:8,type:'visitor',icon:'🚶',name:'visitor'},{x:6,y:4,type:'ranger',icon:'🧑‍✈️',name:'ranger'},{x:11,y:6,type:'visitor',icon:'🚶‍♀️',name:'visitor'},{x:14,y:3,type:'visitor',icon:'🚶',name:'visitor'},{x:10,y:9,type:'visitor',icon:'🚶‍♀️',name:'visitor'}],
   duration:130000,seed:323331,obstacles:.35,terrain:['tree','tree','rock']},
  {name:'Shoreline Summit',alert:7,speed:2,icon:'⛰️',habitat:'summit',detail:'The final steep climb to the family den',
   start:{x:16,y:12},den:{x:1,y:1},cubs:[{x:16,y:13},{x:15,y:12}],
   people:[{x:4,y:4,type:'ranger',icon:'🧑‍✈️',name:'ranger'},{x:7,y:8,type:'visitor',icon:'🚶',name:'visitor'},{x:10,y:6,type:'ranger',icon:'🧑‍✈️',name:'ranger'},{x:11,y:7,type:'visitor',icon:'🚶‍♀️',name:'visitor'},{x:14,y:3,type:'visitor',icon:'🚶',name:'visitor'}],
   duration:125000,seed:711800,obstacles:.37,terrain:['rock','tree','brush']}
 ];
 const currentMountain=()=>MOUNTAINS[activeMountain];
 const elem=id=>document.getElementById(id);
 const key=(x,y)=>x+','+y;
 const manhattan=(a,b)=>Math.abs(a.x-b.x)+Math.abs(a.y-b.y);
 const inside=(x,y)=>x>=0&&y>=0&&x<WIDTH&&y<HEIGHT;
 const controls={ArrowUp:[0,-1],ArrowDown:[0,1],ArrowLeft:[-1,0],ArrowRight:[1,0],w:[0,-1],a:[-1,0],s:[0,1],d:[1,0]};
 let state=null,interval=null,remainingMs=DURATION,deadline=0,activeMountain=0;
 let wins=0,unlockedMountain=1,clearedMountains=new Set();
 try{
  wins=Math.max(0,Number(localStorage.getItem(WIN_KEY))||0);
  const savedUnlocked=Number(localStorage.getItem(UNLOCK_KEY));
  if(Number.isInteger(savedUnlocked))unlockedMountain=Math.max(1,Math.min(MOUNTAINS.length,savedUnlocked));
  const savedCleared=JSON.parse(localStorage.getItem(CLEARED_KEY)||'[]');
  if(Array.isArray(savedCleared))clearedMountains=new Set(savedCleared.filter(i=>Number.isInteger(i)&&i>=0&&i<MOUNTAINS.length));
  if(clearedMountains.size)unlockedMountain=Math.max(unlockedMountain,Math.min(MOUNTAINS.length,Math.max(...clearedMountains)+2));
 }catch(error){/* Storage is optional; the campaign works without it. */}
 function createMarkup(){
  const btn=document.createElement('button');
  btn.id='coyoteModeBtn';btn.className='btn primary';
  btn.type='button';btn.textContent='🐺 Play as the Coyote';
  btn.addEventListener('click',openPicker);
  const home=elem('homeScreen').querySelector('.hero-buttons');
  home.append(btn);
  const picker=document.createElement('section');
  picker.id='coyoteMapScreen';picker.className='screen';
  picker.setAttribute('aria-label','Coyote mountain selection');
  picker.innerHTML='<div class="shell"><div class="topbar"><button class="btn secondary small" type="button" id="coyoteMapHome">← Home</button><div class="brand">🐺 COYOTE FAMILY TRAIL</div></div><div class="coyote-map-intro"><div class="eyebrow">One den at a time</div><h2>Explore Coyote Bay</h2><p>Follow the Baylands shoreline through six mountain adventures. Reach each den with both cubs calm to unlock the next stop.</p><span id="coyoteMapProgress" class="progress"></span></div><div id="coyoteMountainGrid" class="coyote-mountain-grid" aria-label="Illustrated Baylands map with six selectable coyote mountains, following a winding shoreline from top to bottom"></div><p class="coyote-map-fact">🌿 Coyotes live in family groups, and real coyotes generally avoid people. Keep your distance from wildlife when visiting the Baylands.</p></div>';
  document.querySelector('main').appendChild(picker);
  elem('coyoteMapHome').addEventListener('click',leave);
  const section=document.createElement('section');
  section.id='coyoteScreen';section.className='screen';
  section.setAttribute('aria-label','Play as the Coyote mode');
  section.innerHTML=[
   '<div class="shell">',
   '<div class="topbar"><button class="btn secondary small" id="coyoteHome" type="button">← Mountain Map</button><div class="brand">🐺 COYOTE MODE</div></div>',
   '<div class="coyote-title"><div class="eyebrow" id="coyoteMountainNumber">Mountain 1 / 6</div><h2 id="coyoteMountainName">Baylands Trail</h2>',
   '<p>Lead your two cubs safely to their den. Rangers and visitors now <strong>patrol the trails, follow your coyote when nearby, and retreat from a YIP</strong>, just like coyotes in Adventure Mode. Keep both cubs calm and avoid barking too close to them!</p></div>',
   '<div class="coyote-stats" aria-live="polite"><span id="coyoteLife">🐾 Cubs calm</span><span id="coyotePeople">🚶 0 visitors retreated</span><span id="coyoteTime">⏱️ 2:30</span><span id="coyoteMoves">👟 0</span><span id="coyoteWins">🏆 0 wins</span></div>',
   '<div class="coyote-layout"><div class="coyote-board-panel">',
   '<div class="coyote-board-viewport"><div id="coyoteField" role="img" aria-label="Coyote mode game board, 18 columns by 14 rows. Move with arrow keys or the touch controls."></div></div>',
   '<p id="coyoteMessage" role="status" aria-live="polite">Follow the trail!</p>',
   '</div><div class="coyote-side">',
   '<div class="coyote-legend"><strong>Trail guide</strong><p>🐺 You · 🐾 Your two cubs · 🧑‍✈️ Ranger · 🚶 Visitors · 🕳️ Den</p><p>Cubs follow every two steps. People move one square every two or three steps, patrol freely, and approach when they spot you. YIP makes nearby people retreat for a few turns, but barking within two squares of a cub frightens it. Reach the den with both cubs calm.</p></div>',
   '<div class="coyote-controls" aria-label="Coyote movement controls">',
   '<button class="btn" type="button" data-dx="0" data-dy="-1" aria-label="Coyote move up">⬆️</button><div>',
   '<button class="btn" type="button" data-dx="-1" data-dy="0" aria-label="Coyote move left">⬅️</button>',
   '<button class="btn primary" type="button" id="coyoteYip">🐺 YIP!</button>',
   '<button class="btn" type="button" data-dx="1" data-dy="0" aria-label="Coyote move right">➡️</button></div>',
   '<button class="btn" type="button" data-dx="0" data-dy="1" aria-label="Coyote move down">⬇️</button>',
   '</div>',
   '<div id="coyoteResult" role="status" aria-live="polite" hidden><strong id="coyoteResultTitle"></strong><p id="coyoteResultBody"></p></div>',
   '<button class="btn success" type="button" id="coyoteNext" hidden>Next Mountain →</button>',
   '<button class="btn secondary" type="button" id="coyoteRetry">↻ Try again</button>',
   '<p class="coyote-education">🌿 Wildlife fact: California coyotes often live in family groups. Real coyotes generally avoid people. Give wildlife space and never feed or approach them. This adventure is make-believe.</p>',
   '</div></div></div>'
  ].join('');
  document.querySelector('main').appendChild(section);
  const style=document.createElement('style');
  style.textContent=[
   '#coyoteScreen .coyote-title{text-align:center;margin:10px auto 16px;max-width:850px}',
   '#coyoteScreen .coyote-title h2{color:#f4cf8f}',
   '#coyoteScreen .coyote-title p{margin:8px 0 0;color:#e0eacb}',
   '#coyoteScreen .coyote-stats{display:flex;justify-content:center;flex-wrap:wrap;gap:8px;margin:14px auto}',
   '#coyoteScreen .coyote-stats span{background:#24493e;border:1px solid #7a9b79;border-radius:10px;padding:7px 10px;font-weight:750}',
   '#coyoteScreen .coyote-layout{display:grid;grid-template-columns:minmax(0,1fr) 226px;gap:16px;align-items:start}',
   '#coyoteScreen .coyote-board-panel{min-width:0}',
   '#coyoteScreen .coyote-board-viewport{width:100%;overflow:hidden;border:3px solid #c3a376;border-radius:14px;padding:5px;background:#3d614f}',
   '#coyoteScreen #coyoteField{width:100%;display:grid;grid-template-columns:repeat(18,minmax(0,1fr));gap:2px}',
   '#coyoteScreen .coyote-tile{min-width:0;aspect-ratio:1;display:grid;place-items:center;font-size:clamp(10px,2vw,21px);line-height:1;background:#81a16b;border-radius:2px}',
   '#coyoteScreen .coyote-tile:nth-child(5n){background:#89a86d}',
   '#coyoteScreen .coyote-tile.coyote-path{background:#baa77f}',
   '#coyoteScreen .coyote-tile.coyote-tree{background:#4d7655}',
   '#coyoteScreen .coyote-tile.coyote-brush{background:#9ab97e}',
   '#coyoteScreen .coyote-tile.coyote-water{background:#6fa7ad}',
   '#coyoteScreen[data-habitat="marsh"] .coyote-tile{background:#85a58a}',
   '#coyoteScreen[data-habitat="marsh"] .coyote-tile:nth-child(5n){background:#78a399}',
   '#coyoteScreen[data-habitat="creek"] .coyote-tile{background:#759986}',
   '#coyoteScreen[data-habitat="grassland"] .coyote-tile{background:#b2b56b}',
   '#coyoteScreen[data-habitat="woods"] .coyote-tile{background:#668b60}',
   '#coyoteScreen[data-habitat="summit"] .coyote-tile{background:#969b87}',
   '#coyoteScreen .coyote-tile.coyote-rock{background:#88847b}',
   '#coyoteScreen .coyote-tile.coyote-den{background:#e0c583}',
   '#coyoteScreen .coyote-tile.coyote-den-ready{background:#f0d46d;box-shadow:inset 0 0 0 2px #fff1a3}',
   '#coyoteScreen .coyote-tile.coyote-player{background:#f4cf75;box-shadow:inset 0 0 0 2px #fbefbd}',
   '#coyoteScreen .coyote-tile.coyote-cub{background:#dabd96}',
   '#coyoteScreen .coyote-tile.coyote-person{background:#abcfd1}',
   '#coyoteScreen .coyote-tile.coyote-person-retreating{background:#d4c29f;box-shadow:inset 0 0 0 2px #f3dfb1}',
   '#coyoteScreen .coyote-side{background:#203d35;border:1px solid #789179;border-radius:16px;padding:12px;display:flex;flex-direction:column;gap:12px}',
   '#coyoteScreen .coyote-legend p{margin:6px 0 0;font-size:.86rem;color:#e5e9cf}',
   '#coyoteScreen .coyote-controls{text-align:center;white-space:nowrap}',
   '#coyoteScreen .coyote-controls .btn{min-width:46px;min-height:44px;padding:8px;margin:2px}',
   '#coyoteScreen #coyoteYip{min-width:92px}',
   '#coyoteScreen #coyoteMessage{min-height:46px;margin:10px 3px;text-align:center;color:#f6d59a;font-weight:750}',
   '#coyoteScreen #coyoteResult{padding:10px;border:1px solid #e9c57c;border-radius:12px;background:#2c5541}',
   '#coyoteScreen #coyoteNext[hidden]{display:none!important}',
   '#coyoteScreen #coyoteResult strong{color:#fbe4a2}',
   '#coyoteScreen #coyoteResult p{margin:4px 0 0;font-size:.86rem}',
   '#coyoteScreen .coyote-education{color:#bed3c0;font-size:.78rem;line-height:1.4;margin:0}',
   '#coyoteMapScreen .coyote-map-intro{text-align:center;margin:20px auto 26px;max-width:750px}',
   '#coyoteMapScreen .coyote-map-intro h2{font-size:clamp(1.8rem,5vw,2.9rem);margin:8px 0;color:#f4d69c}',
   '#coyoteMapScreen .coyote-map-intro p{color:#deebce}',
   '#coyoteMapScreen #coyoteMapProgress{display:inline-block;margin-top:9px}',
   '#coyoteMapScreen .coyote-mountain-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:17px;max-width:930px;margin:0 auto}',
   '#coyoteMapScreen .coyote-mountain-card{font:inherit;position:relative;min-width:0;display:flex;flex-direction:column;text-align:left;border:2px solid #d6be86;border-radius:18px;padding:0;background:#f7edcf;color:#26453a;box-shadow:0 7px 0 #152c266e;overflow:hidden;transition:transform .15s}',
   '#coyoteMapScreen .coyote-mountain-card:not(:disabled):hover{transform:translateY(-3px)}',
   '#coyoteMapScreen .coyote-mountain-card:disabled{opacity:.75;filter:saturate(.62)}',
   '#coyoteMapScreen .coyote-card-art{display:flex;align-items:center;justify-content:space-evenly;min-height:120px;padding:12px;font-size:clamp(2.2rem,6vw,3.9rem);background:linear-gradient(145deg,#acd2ce,#80a99b 52%,#4f7a5d)}',
   '#coyoteMapScreen .coyote-mountain-card[data-habitat="marsh"] .coyote-card-art{background:linear-gradient(145deg,#b2d2d7,#77b1a6,#69896f)}',
   '#coyoteMapScreen .coyote-mountain-card[data-habitat="creek"] .coyote-card-art{background:linear-gradient(145deg,#a6cadd,#85baaa,#4f807f)}',
   '#coyoteMapScreen .coyote-mountain-card[data-habitat="grassland"] .coyote-card-art{background:linear-gradient(145deg,#d7d5a5,#baa96f,#689866)}',
   '#coyoteMapScreen .coyote-mountain-card[data-habitat="woods"] .coyote-card-art{background:linear-gradient(145deg,#b2ce9f,#698f71,#345745)}',
   '#coyoteMapScreen .coyote-mountain-card[data-habitat="summit"] .coyote-card-art{background:linear-gradient(145deg,#d2c9bf,#9c9e9b,#536c74)}',
   '#coyoteMapScreen .coyote-card-text{padding:12px 16px 15px;display:flex;flex-direction:column;gap:4px}',
   '#coyoteMapScreen .coyote-card-text strong{font-size:1.12rem}',
   '#coyoteMapScreen .coyote-card-text small{color:#55675b;font-size:.81rem}',
   '#coyoteMapScreen .coyote-card-status{font-weight:900;color:#245c44}',
   '#coyoteMapScreen .coyote-map-fact{text-align:center;color:#c8d9c5;margin:23px auto;max-width:740px;font-size:.86rem}',
   '@media(max-width:600px){#coyoteMapScreen .coyote-mountain-grid{grid-template-columns:minmax(0,1fr);gap:13px}#coyoteMapScreen .coyote-card-art{min-height:84px;font-size:2.5rem}#coyoteMapScreen .coyote-card-text{padding:10px 14px 13px}}',
   '@media(max-width:850px){#coyoteScreen .coyote-layout{grid-template-columns:minmax(0,1fr)}#coyoteScreen .coyote-side{max-width:100%}#coyoteScreen .coyote-controls .btn{min-width:54px}}',
   '@media(max-width:500px){#coyoteScreen .coyote-tile{font-size:clamp(10px,3vw,15px)}#coyoteScreen .coyote-board-viewport{padding:3px}#coyoteScreen #coyoteField{gap:1px}#coyoteScreen .coyote-title h2{font-size:1.85rem}}',
   /* Coyote Bay is one continuous portrait map, like the Adventure selector.
      Native buttons float above the illustrated shoreline; no sideways scrolling. */
   '#coyoteMapScreen .coyote-mountain-grid{position:relative;display:block;width:100%;max-width:720px;min-width:0;height:1500px;margin:0 auto;border:3px solid #bba878;border-radius:22px;box-shadow:0 12px 28px #0b262550;background:#70ada7 url("assets/coyote-bay-map.svg") center top / 100% 100% no-repeat;overflow:hidden;isolation:isolate}',
   '#coyoteMapScreen .coyote-mountain-card{position:absolute;z-index:2;left:var(--bay-x);top:var(--bay-y);transform:translate(-50%,-50%);width:clamp(136px,41%,224px);min-width:0;min-height:125px;max-height:172px;display:flex;align-items:center;justify-content:center;padding:8px;border:3px solid #694d34;border-radius:15px;background:linear-gradient(160deg,#fff0cc,#ecd29a 85%);color:#284539;box-shadow:0 4px 0 #6c513d,0 8px 14px #113d3b85;text-align:center}',
   '#coyoteMapScreen .coyote-mountain-card:not(:disabled):hover{transform:translate(-50%,calc(-50% - 3px));box-shadow:0 7px 0 #6c513d,0 11px 16px #113d3b85}',
   '#coyoteMapScreen .coyote-mountain-card:disabled{opacity:.9;filter:saturate(.75);background:linear-gradient(150deg,#e7e2d4,#bfc2b2)}',
   '#coyoteMapScreen .coyote-mountain-card:focus-visible{outline:4px solid #f7d971;outline-offset:3px}',
   '#coyoteMapScreen .coyote-map-number{width:30px;height:30px;flex:none;display:grid;place-items:center;border-radius:50%;border:2px solid #6e5130;background:#4c7860;color:#fff4cb;font-size:.95rem;font-weight:950;box-shadow:0 1px 3px #20382c77}',
   '#coyoteMapScreen .coyote-card-art{display:none}',
   '#coyoteMapScreen .coyote-card-text{padding:4px;gap:3px;align-items:center;text-align:center}',
   '#coyoteMapScreen .coyote-card-text strong{font-size:clamp(.78rem,2.25vw,1rem);line-height:1.15}',
   '#coyoteMapScreen .coyote-card-text small{font-size:clamp(.64rem,1.65vw,.77rem);line-height:1.2}',
   '#coyoteMapScreen .coyote-card-status{font-size:clamp(.68rem,2vw,.8rem)}',
   '#coyoteMapScreen .coyote-map-fact{max-width:720px}',
   '@media(max-width:440px){#coyoteMapScreen .coyote-mountain-grid{border-radius:13px;border-width:2px}#coyoteMapScreen .coyote-mountain-card{min-height:125px;padding:5px 3px;border-width:2px;border-radius:12px}#coyoteMapScreen .coyote-card-text{padding:2px}#coyoteMapScreen .coyote-card-text small{font-size:.68rem}}',
   '@media(prefers-reduced-motion:reduce){#coyoteMapScreen .coyote-mountain-card{transition:none}}'
  ].join('');
  document.head.append(style);
  elem('coyoteHome').addEventListener('click',openPicker);
  elem('coyoteRetry').addEventListener('click',()=>start(activeMountain));
  elem('coyoteNext').addEventListener('click',()=>start(activeMountain+1));
  elem('coyoteYip').addEventListener('click',yip);
  section.querySelectorAll('[data-dx]').forEach(button=>button.addEventListener('click',()=>move(Number(button.dataset.dx),Number(button.dataset.dy))));
 }
 function renderPicker(){
  const grid=elem('coyoteMountainGrid');
  grid.replaceChildren();
  MOUNTAINS.forEach((level,index)=>{
   const enabled=index<unlockedMountain,done=clearedMountains.has(index);
   const card=document.createElement('button');
   card.type='button';card.className='coyote-mountain-card';card.disabled=!enabled;
   card.dataset.habitat=level.habitat;
   card.setAttribute('aria-label','Mountain '+(index+1)+': '+level.name+', '+(done?'completed':enabled?'available':'locked'));
   const status=done?'🏁 Completed':enabled?'🔓 Play':'🔒 Locked';
   // Level markers wind down a single Baylands shoreline illustration.
   const bayStop=[[28,17],[72,29],[28,42],[72,55],[28,68],[72,82]][index];
   card.style.setProperty('--bay-x',bayStop[0]+'%');
   card.style.setProperty('--bay-y',bayStop[1]+'%');
   card.innerHTML='<span class="coyote-map-number" aria-hidden="true">'+(index+1)+'</span>'+
    '<span class="coyote-card-text"><strong>'+level.icon+' '+level.name+'</strong><small>'+level.detail+'</small>'+
    '<small>⏱️ '+Math.floor(level.duration/60000)+':'+String(Math.ceil(level.duration%60000/1000)).padStart(2,'0')+
    ' · 🚶 '+level.people.length+' visitors</small><span class="coyote-card-status">'+status+'</span></span>';
   if(enabled)card.addEventListener('click',()=>start(index));
   grid.appendChild(card);
  });
  elem('coyoteMapProgress').textContent='🏁 '+clearedMountains.size+'/'+MOUNTAINS.length+' mountains completed · 🔓 '+unlockedMountain+' unlocked';
 }
 function openPicker(){
  pause();
  // The original Adventure screen handler only knows the original four screens.
  // Visit home first, then display the independent campaign selector.
  if(screen==='coyote')elem('coyoteScreen').classList.remove('active');
  if(screen==='coyote-map')elem('coyoteMapScreen').classList.remove('active');
  showScreen('home');
  elem('homeScreen').classList.remove('active');
  renderPicker();
  elem('coyoteMapScreen').classList.add('active');
  screen='coyote-map';
  try{window.scrollTo(0,0);}catch(error){}
 }
 function buildTerrain(){
  const level=currentMountain();
  const blocked=new Map();
  const protectedPoints=[level.start,level.den].concat(level.people,level.cubs);
  let seed=level.seed>>>0;
  const random=()=>{seed=(Math.imul(1664525,seed)+1013904223)>>>0;return seed/4294967296;};
  for(let y=0;y<HEIGHT;y++)for(let x=0;x<WIDTH;x++){
   // Each map guarantees a tree-free family trail: row 12 and the den column.
   // It remains possible to reach the den without frightening either cub.
   if(x===1||x===8||x===16||y===1||y===12)continue;
   if(protectedPoints.some(p=>manhattan(p,{x,y})<=2))continue;
   if(random()<level.obstacles){
    const types=level.terrain;
    blocked.set(key(x,y),types[Math.floor(random()*types.length)]);
   }
  }
  return blocked;
 }
 function pause(){
  if(interval!==null){clearInterval(interval);interval=null;}
  if(state&&state.phase==='playing')remainingMs=Math.max(0,deadline-Date.now());
 }
 function resume(){
  if(!state||state.phase!=='playing'||screen!=='coyote'||document.hidden||interval!==null)return;
  deadline=Date.now()+remainingMs;
  interval=setInterval(tick,200);
  tick();
 }
 function tick(){
  if(!state||state.phase!=='playing')return;
  if(screen!=='coyote'||document.hidden){pause();return;}
  remainingMs=Math.max(0,deadline-Date.now());
  if(remainingMs<=0){finish(false,'⏳ Time is up! You did not reach the den before sunset. The cubs are still calm.');return;}
  updateHud();
 }
 function start(index=activeMountain){
  if(!Number.isInteger(index)||index<0||index>=MOUNTAINS.length||index>=unlockedMountain)return;
  pause();
  showScreen('home');
  activeMountain=index;
  const level=currentMountain();
  state={
   phase:'playing',position:{...level.start},obstacles:buildTerrain(),
   people:level.people.map(p=>({...p,active:true,scared:0,retreated:false})),
   cubs:level.cubs.map(p=>({...p})),
   moves:0,yipCooldown:0,scared:0,cubsCalm:true
  };
  remainingMs=level.duration;
  elem('homeScreen').classList.remove('active');
  elem('coyoteMapScreen').classList.remove('active');
  elem('coyoteScreen').classList.add('active');
  elem('coyoteScreen').dataset.habitat=level.habitat;
  elem('coyoteMountainNumber').textContent='MOUNTAIN '+(index+1)+' OF '+MOUNTAINS.length;
  elem('coyoteMountainName').textContent=level.icon+' '+level.name;
  elem('coyoteResult').hidden=true;
  elem('coyoteNext').hidden=true;
  message('🐺 Find the den with BOTH cubs calm. Watch for '+level.people.length+' park visitors along the mountain.');
  screen='coyote';
  draw();
  resume();
  try{window.scrollTo(0,0);}catch(error){}
 }
 function leave(){
  pause();
  elem('coyoteScreen').classList.remove('active');
  elem('coyoteMapScreen').classList.remove('active');
  showScreen('home');
 }
 function open(x,y){return inside(x,y)&&!state.obstacles.has(key(x,y));}
 function adjacent(point){
  return [[1,0],[0,1],[-1,0],[0,-1]]
   .map(([dx,dy])=>({x:point.x+dx,y:point.y+dy}))
   .filter(p=>open(p.x,p.y));
 }
 function nextStep(from,target,occupied=new Set()){
  const queue=[{...from}],seen=new Set([key(from.x,from.y)]),parents=new Map();
  for(let n=0;n<queue.length;n++){
   const current=queue[n];
   if(current.x===target.x&&current.y===target.y)break;
   for(const p of adjacent(current)){
    const k=key(p.x,p.y);if(seen.has(k)||occupied.has(k))continue;
    seen.add(k);parents.set(k,current);queue.push(p);
   }
  }
  const dest=key(target.x,target.y);
  if(!seen.has(dest))return {...from};
  let step={...target};
  while(parents.has(key(step.x,step.y))){
   const previous=parents.get(key(step.x,step.y));
   if(previous.x===from.x&&previous.y===from.y)return step;
   step=previous;
  }
  return {...from};
 }
 function updateCubs(){
  if(state.moves%2!==0)return;
  state.cubs.forEach(cub=>Object.assign(cub,nextStep(cub,state.position)));
 }
 // Mirror Adventure coyote patrols: adjacent (one-square) movement, pathfinding
 // when alerted, random wandering otherwise, and temporary fear after a YIP.
 function peopleOptions(person){
  const occupied=new Set(state.people.filter(other=>other!==person&&other.active).map(other=>key(other.x,other.y)));
  return adjacent(person).filter(point=>!occupied.has(key(point.x,point.y)));
 }
 function movePersonAway(person,options){
  if(!options.length)return false;
  const furthest=Math.max(...options.map(p=>manhattan(p,state.position)));
  const away=options.filter(p=>manhattan(p,state.position)===furthest);
  Object.assign(person,away[Math.floor(Math.random()*away.length)]);
  return true;
 }
 function movePeople(){
  const level=currentMountain();
  if(state.moves%level.speed!==0)return;
  for(const person of state.people){
   if(!person.active)continue;
   const options=peopleOptions(person);
   if(!options.length)continue;
   let next=null;
   if(person.scared>0){
    movePersonAway(person,options);
    person.scared--;
   }else if(manhattan(person,state.position)<=level.alert){
    const occupied=new Set(state.people.filter(other=>other!==person&&other.active).map(other=>key(other.x,other.y)));
    next=nextStep(person,state.position,occupied);
   }else if(Math.random()<.65){
    next=options[Math.floor(Math.random()*options.length)];
   }
   if(next&&options.some(p=>p.x===next.x&&p.y===next.y))Object.assign(person,next);
   // A moving ranger or visitor can frighten a cub, even if the player
   // stays still. Never leave a lost run in a playing state.
   if(cubIsFrightenedByPerson())return;
  }
 }
 function cubIsFrightenedByPerson(){
  return state.cubs.some(cub=>state.people.some(person=>person.active&&manhattan(person,cub)<=1));
 }
 function cubTooCloseToYip(){
  return state.cubs.some(cub=>manhattan(cub,state.position)<=2);
 }
 function move(dx,dy){
  if(!state||state.phase!=='playing'||screen!=='coyote')return;
  tick();if(state.phase!=='playing')return;
  const nx=state.position.x+dx,ny=state.position.y+dy;
  if(!open(nx,ny)){message('🌲 A rock or tree blocks the trail. Find another path.');return;}
  state.position={x:nx,y:ny};state.moves++;
  state.yipCooldown=Math.max(0,state.yipCooldown-1);
  updateCubs();
  // Check both before and after people move. They move on the same step
  // cadence as Adventure coyotes, and cannot walk through obstacles.
  const cubsAlreadyNearPeople=cubIsFrightenedByPerson();
  if(!cubsAlreadyNearPeople)movePeople();
  if(cubsAlreadyNearPeople||cubIsFrightenedByPerson()){
   state.cubsCalm=false;
   finish(false,'🐾 A cub got too close to a park visitor and was frightened! Try a safer path.');
  }else if(manhattan(state.position,currentMountain().den)===0){
   finish(true,'🏡 You reached the den with both cubs calm! Your coyote family is safe.');
  }else if(cubTooCloseToYip()){
   message('🐾 Your cubs are close! Avoid a loud YIP right now.');
  }else{
   message('🌿 Keep going to the den. Your cubs are calm; keep them away from park visitors.');
  }
  draw();
 }
 function yip(){
  if(!state||state.phase!=='playing'||screen!=='coyote')return;
  tick();if(state.phase!=='playing')return;
  if(state.yipCooldown>0){message('🐺 Your YIP needs '+state.yipCooldown+' more move(s) to recharge.');return;}
  // Same response as shouting at coyotes: people inside the sound radius
  // move away by two squares immediately, then retreat for three patrol turns.
  // Do not make them disappear; they return to patrolling afterward.
  if(cubTooCloseToYip()){
   state.cubsCalm=false;
   finish(false,'🐾 That YIP was too close! One of your cubs got scared. Try a quieter route.');
   return;
  }
  let count=0;
  for(const person of state.people){
   if(!person.active||manhattan(person,state.position)>4)continue;
   person.scared=3;
   if(!person.retreated){person.retreated=true;state.scared++;}
   count++;
   for(let step=0;step<2;step++){
    if(!movePersonAway(person,peopleOptions(person)))break;
   }
  }
  state.yipCooldown=4;
  if(typeof playCoyote==='function')try{playCoyote(true);}catch(error){}
  if(cubIsFrightenedByPerson()){
   state.cubsCalm=false;
   finish(false,'🐾 A retreating visitor got too close to a cub. Try a different YIP position.');
   return;
  }
  if(count)message('🐺 YIP! '+count+' '+(count===1?'person retreats':'people retreat')+' along the trail. Stay ahead until they stop moving!');
  else message('🐺 YIP! Your call echoes across the hillside. No people were close enough to retreat.');
  draw();
 }
 function finish(won,reason){
  state.phase=won?'won':'lost';pause();
  if(won){
   wins++;
   clearedMountains.add(activeMountain);
   unlockedMountain=Math.max(unlockedMountain,Math.min(MOUNTAINS.length,activeMountain+2));
   try{
    localStorage.setItem(WIN_KEY,String(wins));
    localStorage.setItem(UNLOCK_KEY,String(unlockedMountain));
    localStorage.setItem(CLEARED_KEY,JSON.stringify([...clearedMountains]));
   }catch(error){}
  }
  elem('coyoteNext').hidden=!(won&&activeMountain<MOUNTAINS.length-1);
  elem('coyoteResult').hidden=false;
  elem('coyoteResultTitle').textContent=won?'🏆 SAFE AT THE DEN!':state.cubsCalm?'⏳ COYOTE RUN OVER!':'😨 THE CUBS GOT SCARED!';
  elem('coyoteResultBody').textContent=reason;
  message(reason);
  draw();
 }
 function message(text){elem('coyoteMessage').textContent=text;}
 function updateHud(){
  elem('coyoteLife').textContent=state.cubsCalm?'🐾 Cubs calm':'😨 Cub frightened';
  elem('coyotePeople').textContent='🚶 '+state.scared+' visitor'+(state.scared===1?'':'s')+' retreated';
  const seconds=Math.ceil(remainingMs/1000);
  elem('coyoteTime').textContent='⏱️ '+Math.floor(seconds/60)+':'+String(seconds%60).padStart(2,'0');
  elem('coyoteMoves').textContent='👟 '+state.moves;
  elem('coyoteWins').textContent='🏆 '+wins+' wins · 🏔️ '+(activeMountain+1)+'/'+MOUNTAINS.length;
  const button=elem('coyoteYip');
  button.disabled=state.phase!=='playing'||state.yipCooldown>0;
  button.textContent=state.yipCooldown?'🐺 YIP '+state.yipCooldown:'🐺 YIP!';
 }
 function draw(){
  if(!state)return;
  const fragment=document.createDocumentFragment(),level=currentMountain();
  for(let y=0;y<HEIGHT;y++)for(let x=0;x<WIDTH;x++){
   const tile=document.createElement('div');
   tile.className='coyote-tile';
   const terrain=state.obstacles.get(key(x,y));
   if(terrain){tile.classList.add('coyote-'+terrain);tile.textContent=({tree:'🌲',rock:'🪨',brush:'🌾',water:'🌊'})[terrain];}
   else if(y===1||y===12||x===8){tile.classList.add('coyote-path');}
   if(x===level.den.x&&y===level.den.y){
    tile.classList.add('coyote-den-ready');
    tile.textContent='🕳️';
   }
   const visitor=state.people.find(p=>p.active&&p.x===x&&p.y===y);
   if(visitor){tile.classList.add('coyote-person');if(visitor.scared>0)tile.classList.add('coyote-person-retreating');tile.textContent=visitor.icon;}
   if(state.cubs.some(p=>p.x===x&&p.y===y)){tile.classList.add('coyote-cub');tile.textContent='🐾';}
   if(state.position.x===x&&state.position.y===y){tile.classList.add('coyote-player');tile.textContent='🐺';}
   fragment.appendChild(tile);
  }
  elem('coyoteField').replaceChildren(fragment);
  updateHud();
 }
 document.addEventListener('keydown',event=>{
  if(screen!=='coyote')return;
  const direction=controls[event.key]||controls[event.key.toLowerCase()];
  if(direction){event.preventDefault();move(...direction);}
  else if(event.code==='Space'){event.preventDefault();yip();}
  else if(event.key==='Escape'){event.preventDefault();openPicker();}
  else if(event.key==='Enter'&&state&&state.phase!=='playing'){event.preventDefault();start(activeMountain);}
 });
 document.addEventListener('visibilitychange',()=>{if(document.hidden)pause();else resume();});
 // A read-only snapshot makes regression tests possible without editing live state.
 window.coyoteModeSnapshot=()=>state?{
  phase:state.phase,mountain:activeMountain,mountainCount:MOUNTAINS.length,
  unlockedMountain,clearedMountains:[...clearedMountains].sort((a,b)=>a-b),
  habitat:currentMountain().habitat,den:{...currentMountain().den},
  cubsCalm:state.cubsCalm,moves:state.moves,
  scared:state.scared,yipCooldown:state.yipCooldown,position:{...state.position},
  people:state.people.map(p=>({x:p.x,y:p.y,active:p.active,scared:p.scared,retreated:p.retreated,type:p.type})),
  cubs:state.cubs.map(p=>({x:p.x,y:p.y})),
  wins
 }:null;
 window.coyoteMountainDefinitions=()=>MOUNTAINS.map((level,index)=>({
  index,name:level.name,habitat:level.habitat,start:{...level.start},
  den:{...level.den},duration:level.duration,visitorCount:level.people.length,
  obstacleRate:level.obstacles,alert:level.alert,speed:level.speed
 }));
 createMarkup();
})();
