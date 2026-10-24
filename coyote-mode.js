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
 const CUB_START=[{x:15,y:11},{x:8,y:3}];
 const elem=id=>document.getElementById(id);
 const key=(x,y)=>x+','+y;
 const manhattan=(a,b)=>Math.abs(a.x-b.x)+Math.abs(a.y-b.y);
 const inside=(x,y)=>x>=0&&y>=0&&x<WIDTH&&y<HEIGHT;
 const controls={ArrowUp:[0,-1],ArrowDown:[0,1],ArrowLeft:[-1,0],ArrowRight:[1,0],w:[0,-1],a:[-1,0],s:[0,1],d:[1,0]};
 let state=null,interval=null,remainingMs=DURATION,deadline=0;
 let wins=0;
 try{wins=Math.max(0,Number(localStorage.getItem(WIN_KEY))||0);}catch(error){}
 function createMarkup(){
  const btn=document.createElement('button');
  btn.id='coyoteModeBtn';btn.className='btn primary';
  btn.type='button';btn.textContent='🐺 Play as the Coyote';
  btn.addEventListener('click',start);
  const home=elem('homeScreen').querySelector('.hero-buttons');
  home.append(btn);
  const section=document.createElement('section');
  section.id='coyoteScreen';section.className='screen';
  section.setAttribute('aria-label','Play as the Coyote mode');
  section.innerHTML=[
   '<div class="shell">',
   '<div class="topbar"><button class="btn secondary small" id="coyoteHome" type="button">← Home</button><div class="brand">🐺 COYOTE MODE</div></div>',
   '<div class="coyote-title"><div class="eyebrow">A new point of view</div><h2>Play as the Coyote</h2>',
   '<p>Escape the curious cubs, playfully startle all three park rangers and visitors with your YIP, then reach your den! Avoid being tagged. You have 3 hearts and 2:30.</p></div>',
   '<div class="coyote-stats" aria-live="polite"><span id="coyoteLife">❤️❤️❤️</span><span id="coyotePeople">👣 0/3 startled</span><span id="coyoteTime">⏱️ 2:30</span><span id="coyoteMoves">👟 0</span><span id="coyoteWins">🏆 0 wins</span></div>',
   '<div class="coyote-layout"><div class="coyote-board-panel">',
   '<div class="coyote-board-viewport"><div id="coyoteField" role="img" aria-label="Coyote mode game board, 18 columns by 14 rows. Move with arrow keys or the touch controls."></div></div>',
   '<p id="coyoteMessage" role="status" aria-live="polite">Follow the trail!</p>',
   '</div><div class="coyote-side">',
   '<div class="coyote-legend"><strong>Trail guide</strong><p>🐺 You · 🐾 Curious cubs · 🧑‍✈️ Ranger · 🚶 Visitors · 🕳️ Den</p><p>YIP scares nearby people away and briefly distracts cubs. The den opens after three playful scares.</p></div>',
   '<div class="coyote-controls" aria-label="Coyote movement controls">',
   '<button class="btn" type="button" data-dx="0" data-dy="-1" aria-label="Coyote move up">⬆️</button><div>',
   '<button class="btn" type="button" data-dx="-1" data-dy="0" aria-label="Coyote move left">⬅️</button>',
   '<button class="btn primary" type="button" id="coyoteYip">🐺 YIP!</button>',
   '<button class="btn" type="button" data-dx="1" data-dy="0" aria-label="Coyote move right">➡️</button></div>',
   '<button class="btn" type="button" data-dx="0" data-dy="1" aria-label="Coyote move down">⬇️</button>',
   '</div>',
   '<div id="coyoteResult" role="status" aria-live="polite" hidden><strong id="coyoteResultTitle"></strong><p id="coyoteResultBody"></p></div>',
   '<button class="btn secondary" type="button" id="coyoteRetry">↻ Try again</button>',
   '<p class="coyote-education">🌿 Wildlife fact: Real California coyotes usually avoid people. Never approach, feed, or encourage wild animals to chase visitors. This is a make-believe role reversal!</p>',
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
   '#coyoteScreen .coyote-tile.coyote-rock{background:#88847b}',
   '#coyoteScreen .coyote-tile.coyote-den{background:#e0c583}',
   '#coyoteScreen .coyote-tile.coyote-den-ready{background:#f0d46d;box-shadow:inset 0 0 0 2px #fff1a3}',
   '#coyoteScreen .coyote-tile.coyote-player{background:#f4cf75;box-shadow:inset 0 0 0 2px #fbefbd}',
   '#coyoteScreen .coyote-tile.coyote-cub{background:#dabd96}',
   '#coyoteScreen .coyote-tile.coyote-person{background:#abcfd1}',
   '#coyoteScreen .coyote-side{background:#203d35;border:1px solid #789179;border-radius:16px;padding:12px;display:flex;flex-direction:column;gap:12px}',
   '#coyoteScreen .coyote-legend p{margin:6px 0 0;font-size:.86rem;color:#e5e9cf}',
   '#coyoteScreen .coyote-controls{text-align:center;white-space:nowrap}',
   '#coyoteScreen .coyote-controls .btn{min-width:46px;min-height:44px;padding:8px;margin:2px}',
   '#coyoteScreen #coyoteYip{min-width:92px}',
   '#coyoteScreen #coyoteMessage{min-height:46px;margin:10px 3px;text-align:center;color:#f6d59a;font-weight:750}',
   '#coyoteScreen #coyoteResult{padding:10px;border:1px solid #e9c57c;border-radius:12px;background:#2c5541}',
   '#coyoteScreen #coyoteResult strong{color:#fbe4a2}',
   '#coyoteScreen #coyoteResult p{margin:4px 0 0;font-size:.86rem}',
   '#coyoteScreen .coyote-education{color:#bed3c0;font-size:.78rem;line-height:1.4;margin:0}',
   '@media(max-width:850px){#coyoteScreen .coyote-layout{grid-template-columns:minmax(0,1fr)}#coyoteScreen .coyote-side{max-width:100%}#coyoteScreen .coyote-controls .btn{min-width:54px}}',
   '@media(max-width:500px){#coyoteScreen .coyote-tile{font-size:clamp(10px,3vw,15px)}#coyoteScreen .coyote-board-viewport{padding:3px}#coyoteScreen #coyoteField{gap:1px}#coyoteScreen .coyote-title h2{font-size:1.85rem}}'
  ].join('');
  document.head.append(style);
  elem('coyoteHome').addEventListener('click',leave);
  elem('coyoteRetry').addEventListener('click',start);
  elem('coyoteYip').addEventListener('click',yip);
  section.querySelectorAll('[data-dx]').forEach(button=>button.addEventListener('click',()=>move(Number(button.dataset.dx),Number(button.dataset.dy))));
 }
 function buildTerrain(){
  const blocked=new Map(), protectedPoints=[START,DEN].concat(PEOPLE,CUB_START);
  let seed=912384;
  const random=()=>{seed=(Math.imul(1664525,seed)+1013904223)>>>0;return seed/4294967296;};
  for(let y=0;y<HEIGHT;y++)for(let x=0;x<WIDTH;x++){
   if(x===1||x===8||x===16||y===1||y===12)continue;
   if(protectedPoints.some(p=>manhattan(p,{x,y})<=2))continue;
   if(random()<.23)blocked.set(key(x,y),random()<.67?'tree':'rock');
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
  if(remainingMs<=0){finish(false,'⏳ Time is up! The cubs found your trail.');return;}
  updateHud();
 }
 function start(){
  pause();
  // Make sure the original game timer and sounds obey the existing home-screen transition.
  showScreen('home');
  state={
   phase:'playing',position:{...START},obstacles:buildTerrain(),
   people:PEOPLE.map(p=>({...p,active:true})),
   cubs:CUB_START.map(p=>({...p,flee:0})),
   hearts:3,moves:0,yipCooldown:0,scared:0
  };
  remainingMs=DURATION;
  elem('homeScreen').classList.remove('active');
  elem('coyoteScreen').classList.add('active');
  screen='coyote';
  elem('coyoteResult').hidden=true;
  message('🐺 Your adventure begins! The cubs are curious. YIP to startle park visitors, then reach your den.');
  draw();
  resume();
  try{window.scrollTo(0,0);}catch(error){}
 }
 function leave(){
  pause();
  elem('coyoteScreen').classList.remove('active');
  showScreen('home');
 }
 function open(x,y){return inside(x,y)&&!state.obstacles.has(key(x,y));}
 function adjacent(point){
  return [[1,0],[0,1],[-1,0],[0,-1]]
   .map(([dx,dy])=>({x:point.x+dx,y:point.y+dy}))
   .filter(p=>open(p.x,p.y));
 }
 function nextStep(from,target){
  const queue=[{...from}],seen=new Set([key(from.x,from.y)]),parents=new Map();
  for(let n=0;n<queue.length;n++){
   const current=queue[n];
   if(current.x===target.x&&current.y===target.y)break;
   for(const p of adjacent(current)){
    const k=key(p.x,p.y);if(seen.has(k))continue;
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
  state.cubs.forEach(cub=>{
   if(cub.flee>0){
    cub.flee--;
    const safe=adjacent(cub).sort((a,b)=>manhattan(b,state.position)-manhattan(a,state.position));
    if(safe.length)Object.assign(cub,safe[0]);
   } else {
    Object.assign(cub,nextStep(cub,state.position));
   }
  });
 }
 function tagged(){
  state.hearts--;
  if(state.hearts===0){finish(false,'🐾 The curious cubs caught up! Try another coyote run.');return;}
  state.position={...START};
  state.cubs=CUB_START.map(p=>({...p,flee:0}));
  state.yipCooldown=0;
  message('🐾 A cub tagged you! You lost a heart and returned to the trailhead.');
 }
 function collision(){return state.cubs.some(c=>manhattan(c,state.position)===0);}
 function move(dx,dy){
  if(!state||state.phase!=='playing'||screen!=='coyote')return;
  tick();if(state.phase!=='playing')return;
  const nx=state.position.x+dx,ny=state.position.y+dy;
  if(!open(nx,ny)){message('🌲 A rock or tree blocks the trail. Find another path.');return;}
  state.position={x:nx,y:ny};state.moves++;
  state.yipCooldown=Math.max(0,state.yipCooldown-1);
  if(manhattan(state.position,DEN)===0 && state.scared===PEOPLE.length){
   finish(true,'🏡 You returned safely to your den after three playful YIPs!');return;
  }
  if(manhattan(state.position,DEN)===0){
   message('🕳️ Your den is here! Startle all three people with YIP before you can finish.');
  } else message('🌿 Stay ahead of the curious cubs. YIP when a visitor is nearby!');
  if(collision()){tagged();draw();return;}
  updateCubs();
  if(state.phase==='playing'&&collision())tagged();
  draw();
 }
 function yip(){
  if(!state||state.phase!=='playing'||screen!=='coyote')return;
  tick();if(state.phase!=='playing')return;
  if(state.yipCooldown>0){message('🐺 Your YIP needs '+state.yipCooldown+' more move(s) to recharge.');return;}
  let count=0;
  state.people.forEach(person=>{
   if(person.active&&manhattan(person,state.position)<=4){
    person.active=false;state.scared++;count++;
   }
  });
  // Even if no visitor is nearby, the yip momentarily distracts close cubs.
  state.cubs.forEach(cub=>{if(manhattan(cub,state.position)<=5)cub.flee=2;});
  state.yipCooldown=4;
  if(typeof playCoyote==='function')try{playCoyote(true);}catch(error){}
  if(count)message('🐺 YIP! '+count+' person'+(count===1?' is':' are')+' startled and heads safely away. '+state.scared+'/3!');
  else message('🐺 YIP! Your call echoes through the Baylands. Find the ranger and visitors!');
  draw();
 }
 function finish(won,reason){
  state.phase=won?'won':'lost';pause();
  if(won){
   wins++;
   try{localStorage.setItem(WIN_KEY,String(wins));}catch(error){}
  }
  elem('coyoteResult').hidden=false;
  elem('coyoteResultTitle').textContent=won?'🏆 COYOTE MADE IT HOME!':'🐾 COYOTE RUN OVER!';
  elem('coyoteResultBody').textContent=reason;
  message(reason);
  draw();
 }
 function message(text){elem('coyoteMessage').textContent=text;}
 function updateHud(){
  elem('coyoteLife').textContent='❤️'.repeat(state.hearts)||'💔';
  elem('coyotePeople').textContent='👣 '+state.scared+'/'+PEOPLE.length+' startled';
  const seconds=Math.ceil(remainingMs/1000);
  elem('coyoteTime').textContent='⏱️ '+Math.floor(seconds/60)+':'+String(seconds%60).padStart(2,'0');
  elem('coyoteMoves').textContent='👟 '+state.moves;
  elem('coyoteWins').textContent='🏆 '+wins+' wins';
  const button=elem('coyoteYip');
  button.disabled=state.phase!=='playing'||state.yipCooldown>0;
  button.textContent=state.yipCooldown?'🐺 YIP '+state.yipCooldown:'🐺 YIP!';
 }
 function draw(){
  if(!state)return;
  const fragment=document.createDocumentFragment();
  for(let y=0;y<HEIGHT;y++)for(let x=0;x<WIDTH;x++){
   const tile=document.createElement('div');
   tile.className='coyote-tile';
   const terrain=state.obstacles.get(key(x,y));
   if(terrain){tile.classList.add('coyote-'+terrain);tile.textContent=terrain==='tree'?'🌲':'🪨';}
   else if(y===1||y===12||x===8){tile.classList.add('coyote-path');}
   if(x===DEN.x&&y===DEN.y){
    tile.classList.add('coyote-den'+(state.scared===PEOPLE.length?'-ready':''));
    tile.textContent='🕳️';
   }
   const visitor=state.people.find(p=>p.active&&p.x===x&&p.y===y);
   if(visitor){tile.classList.add('coyote-person');tile.textContent=visitor.icon;}
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
  else if(event.key==='Escape'){event.preventDefault();leave();}
  else if(event.key==='Enter'&&state&&state.phase!=='playing'){event.preventDefault();start();}
 });
 document.addEventListener('visibilitychange',()=>{if(document.hidden)pause();else resume();});
 // A read-only snapshot makes regression tests possible without editing live state.
 window.coyoteModeSnapshot=()=>state?{
  phase:state.phase,hearts:state.hearts,moves:state.moves,
  scared:state.scared,yipCooldown:state.yipCooldown,position:{...state.position},
  people:state.people.map(p=>({x:p.x,y:p.y,active:p.active})),
  cubs:state.cubs.map(p=>({x:p.x,y:p.y})),
  wins
 }:null;
 createMarkup();
})();
