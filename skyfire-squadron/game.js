(()=>{'use strict';
const $=id=>document.getElementById(id), canvas=$('game'),ctx=canvas.getContext('2d',{alpha:false});
const W=960,H=600,TAU=Math.PI*2;
const clamp=(x,a,b)=>Math.min(b,Math.max(a,x));
const rand=(a,b)=>a+Math.random()*(b-a);
const dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
const levels=[
 {name:'Dawn Patrol',zone:'Azure Coast',color:'#1b567b',accent:'#82f1ff',desc:'A distress beacon flickers over the western sea. Scramble your jet and clear the coast of enemy fighters.',duration:23,extra:'Pilots, this is your first flight. Stay low, fly true, and bring everyone home.'},
 {name:'Red Mesa',zone:'Scarlet Canyons',color:'#713c4f',accent:'#ffbc7b',desc:'The enemy has cut through the red canyons. Their interceptor wings are faster than anything we have seen.',duration:25,extra:'The canyon walls hide a fleet of shadow jets. Watch for incoming squadrons.'},
 {name:'Thunder Gate',zone:'Storm Frontier',color:'#37416f',accent:'#c4d9ff',desc:'A storm-bound fortress blocks the pass. Its guardian, TEMPEST WARDEN, has never lost a fight.',duration:27,boss:'TEMPEST WARDEN',extra:'Lightning coils around the gate. The first guardian is awake.'},
 {name:'Emerald Reach',zone:'Jade Wilds',color:'#206259',accent:'#90ffbf',desc:'An ancient forest shelters civilians below. Defend the skies and avoid being pinned down by enemy bombers.',duration:27,extra:'The jungle canopy hides a resistance signal. They are depending on us.'},
 {name:'The White Line',zone:'Frost Divide',color:'#547d94',accent:'#c6f8ff',desc:'Cross the frozen mountains. Supply caches contain new flight systems, but rival aces are hunting them too.',duration:29,extra:'Your instruments frost over. Below, a mountain chain stretches into the clouds.'},
 {name:'Ember Strait',zone:'Molten Crossing',color:'#8d4034',accent:'#ffb166',desc:'The volcano fleet ignites the strait. Defeat ASH HYDRA before it burns the passage shut.',duration:30,boss:'ASH HYDRA',extra:'Something enormous rises from the ash. Squadron, brace for the second guardian.'},
 {name:'Midnight City',zone:'Neon Metropolis',color:'#423c87',accent:'#fb86ee',desc:'Enemy aces patrol the sleeping city. Dash between their formations and rescue the final evacuation ships.',duration:31,extra:'The city lights blink in a secret pattern: the people below are cheering for you.'},
 {name:'Beyond the Blue',zone:'Stratosphere',color:'#29375e',accent:'#d0beff',desc:'Climb beyond the clouds. Experimental fighters protect a route to the enemy command fleet.',duration:32,extra:'The sky darkens to indigo. You can see the curve of the world.'},
 {name:'Iron Armada',zone:'High Fleet',color:'#574264',accent:'#ffc3a8',desc:'The airborne navy arrives. Its huge flagship LEVIATHAN is the final shield before the citadel.',duration:34,boss:'LEVIATHAN',extra:'A mile-long shadow crosses the horizon. The armada is here.'},
 {name:'Skyfire Citadel',zone:'Final Horizon',color:'#4d315c',accent:'#ffe49a',desc:'The last fortress opens its gates. Destroy ATLAS PRIME and return the skies to everyone.',duration:37,boss:'ATLAS PRIME',extra:'The last sunrise waits beyond this battle. All wings, with us!'},
 {name:'Shattered Dawn',zone:'Broken Sunrise',color:'#76516f',accent:'#ffb6d6',desc:'A hidden signal survives beyond the citadel. The war is not over: another command fleet has awakened. Begin the Fractured Horizon campaign.',duration:32,extra:'New transmissions split in two directions. Which route will your squadron take?'},
 {name:'Glass Reef',zone:'Prism Ocean',color:'#19718a',accent:'#a3fff3',desc:'Take the sea route through towering glass-blue clouds. Steal an energy core from the enemy resupply wing.',duration:34,extra:'Two paths lie ahead. A mirage shimmers over the water.'},
 {name:'Iron Tempest',zone:'Obsidian Peaks',color:'#6d3859',accent:'#ff9bc6',desc:'Take the mountain route and face the steel aces of the storm fleet. Victory can open a risky shortcut.',duration:35,extra:'The ridge is guarded by the feared ace squadron, the Iron Talons.'},
 {name:'Mirage Crossing',zone:'Sunfire Flats',color:'#a16b3a',accent:'#ffe69a',desc:'Follow the desert mirage to recover a lost flight recorder containing Omega’s secret weakness.',duration:35,extra:'The sky reflects a hundred impossible suns. One path is real.'},
 {name:'The Hidden Hangar',zone:'Underground Airbase',color:'#346558',accent:'#afffc4',desc:'Enter the concealed hangar to prepare for the final campaign. The sentinel IRON ORACLE protects its launch codes.',duration:37,boss:'IRON ORACLE',extra:'The old maps lead here. Behind the hangar door is the route to the final five missions.'},
 {name:'The Last Signal',zone:'Aurora Reach',color:'#275b85',accent:'#a9ecff',desc:'The final five-level campaign begins. Reassemble the alliance’s fleet before the Omega command system gains control.',duration:35,extra:'The skies are divided. A single alliance signal can reunite every squadron.'},
 {name:'Three Destinies',zone:'Crossroads of Stars',color:'#484886',accent:'#d4c6ff',desc:'Fight to the Celestial Junction and choose one of three different final air routes. Each leads to a different battle and ending.',duration:37,boss:'TRIAD SENTINEL',extra:'Three gates open: dawn, lightning, and darkness. Your choices decide how the story ends.'},
 {name:'Dawn Accord',zone:'Golden Dawn Route',color:'#91653f',accent:'#ffe5a0',desc:'ENDING A: Face NEXUS OMEGA in the dawn light and free the captive squadrons. Win a peaceful united-skies ending.',duration:36,boss:'NEXUS OMEGA · DAWN',ending:'dawn',extra:'Choose hope. End Omega’s control without destroying the skies it holds hostage.'},
 {name:'Stormbreak',zone:'Thunderstorm Route',color:'#3a5985',accent:'#b4ddff',desc:'ENDING B: Chase NEXUS OMEGA into a superstorm and defeat its storm crown to end the war with a thunderous victory.',duration:38,boss:'NEXUS OMEGA · STORM',ending:'storm',extra:'Choose courage. The storm must be broken before it can swallow the entire fleet.'},
 {name:'Black Star',zone:'Void Route',color:'#493050',accent:'#ff98d8',desc:'ENDING C: Dive into Omega’s black star fortress and challenge the strongest version of the BOSS OF BOSSES.',duration:40,boss:'NEXUS OMEGA · VOID',ending:'void',extra:'Choose the final risk. Beyond this gate waits Omega’s true form and the secret ending.'}
];
// Mission routes are directed. Completing a parent opens its child, never all later nodes.
const routes={1:[2],2:[3],3:[4],4:[5],5:[6],6:[7],7:[8],8:[9],9:[10],10:[11],11:[12,13],12:[14],13:[14,15],14:[15],15:[16],16:[17],17:[18,19,20],18:[],19:[],20:[]};
const mapPositions={
  1:[4.8,59],2:[10.3,37],3:[15.7,21],4:[21.3,37],5:[26.8,63],
  6:[32.3,78],7:[37.8,55],8:[43.2,32],9:[48.8,20],10:[54.3,39],
  11:[59.8,58],12:[65.5,33],13:[65.6,81],14:[71,32],15:[72.5,79],
  16:[79.2,58],17:[85,55],18:[93,17],19:[93,49],20:[93,82]
};
const worldTypes=['ocean','desert','storm','jungle','ice','lava','city','orbit','orbit','space','ocean','ice','storm','desert','station','orbit','space','ocean','storm','void'];
const bodyColors=[['#0a2e62','#187da0','#79e3de'],['#7d3020','#c67d48','#ffe0ac'],['#323968','#687bbb','#d8ecff'],['#0c4634','#238a74','#c1df96'],['#5687a3','#e2f5fd','#c4dcf5'],['#4a181c','#d86535','#ffc561'],['#172d54','#476ca6','#eaa1ff'],['#082e66','#2273ab','#cbeaff'],['#674f34','#b8a178','#ead9b5'],['#42365b','#ac678b','#ffdabb'],['#14477b','#49a2ce','#b1f0ee'],['#4e819b','#e2f6ff','#ffffff'],['#392c6e','#6765a5','#e2cbff'],['#87512f','#d59a62','#ffe3a2'],['#3f505c','#91a5a7','#e0eff1'],['#233e7e','#5969a2','#b9d7fa'],['#3a285a','#866cb9','#ffd8fa'],['#9d693c','#d9b97b','#fff1b0'],['#27366e','#5a85af','#d0f1ff'],['#21112d','#6e3a79','#fba2dd']];
const endingScripts={
 dawn:{title:'ENDING A · THE DAWN ACCORD',body:'Omega’s armored wings open and release their captive pilots. In the sunrise, both sides lay down their weapons. The skies belong to everyone, and a new alliance begins.',label:'THE PEACEFUL ENDING',symbol:'☀'},
 storm:{title:'ENDING B · THE STORMBREAKER',body:'The storm crown shatters in a blinding flash. All of Omega’s lightning engines go dark. Across the world, people watch the storm clouds part. The squadrons return as heroes.',label:'THE HEROIC ENDING',symbol:'⚡'},
 void:{title:'ENDING C · THE BLACK STAR SECRET',body:'Deep inside the black star, you discover Omega’s true heart: a stolen beacon designed to connect every sky. You free the beacon, and the fortress becomes a shining new star of peace.',label:'THE SECRET ENDING',symbol:'✦'}
};
const OVERLAYS={home:'homeOverlay',map:'mapOverlay',scene:'sceneOverlay',clear:'endOverlay',gameover:'endOverlay',finish:'endOverlay',pause:'endOverlay'};
let saved={unlocked:1,completed:[],bestScore:0,sound:false,endings:[]};
try{const x=JSON.parse(localStorage.getItem('skyfire_squadron_v1'));if(x&&typeof x==='object')saved={...saved,...x};}catch(e){}
saved.unlocked=clamp(Number(saved.unlocked)||1,1,10);
if(!Array.isArray(saved.completed))saved.completed=[];
if(!Array.isArray(saved.endings))saved.endings=[];
saved.completed=[...new Set(saved.completed.filter(n=>Number.isInteger(n)&&n>=1&&n<=20))];
// In the first version, the unlocked level may be ahead of the last completed one.
// Preserve that legitimate old progress when evaluating missions 1–10.
let mapChapter=saved.completed.some(n=>n>10)?1:0;
const save=()=>{try{localStorage.setItem('skyfire_squadron_v1',JSON.stringify(saved));}catch(e){}};
let screen='home',selected=0,scene=null,sceneEnd=0,endAction=null,game=null,soundOn=Boolean(saved.sound),soundCtx=null;
let vw=1,vh=1,scale=1,offsetX=0,offsetY=0,now=0,last=0,worldTime=0,flash=0,shake=0,toaster=0;
const controls={keys:new Set(),aim:null,dragging:false,touchFire:false};
const stars=Array.from({length:90},()=>({x:rand(0,W),y:rand(0,H),r:rand(.6,2.2),speed:rand(12,95),phase:rand(0,TAU)}));
const clouds=Array.from({length:18},()=>({x:rand(0,W),y:rand(0,H),r:rand(45,140),speed:rand(12,45),alpha:rand(.035,.13)}));
const terrain=Array.from({length:18},(_,i)=>({x:i*65,y:rand(0,1)}));
function audio(freq=330,dur=.07,type='sine',volume=.035,slide=1){if(!soundOn)return;try{soundCtx=soundCtx||new (window.AudioContext||window.webkitAudioContext)();if(soundCtx.state==='suspended')soundCtx.resume();const osc=soundCtx.createOscillator(),gain=soundCtx.createGain();osc.type=type;osc.frequency.setValueAtTime(freq,soundCtx.currentTime);osc.frequency.exponentialRampToValueAtTime(Math.max(30,freq*slide),soundCtx.currentTime+dur);gain.gain.setValueAtTime(volume,soundCtx.currentTime);gain.gain.exponentialRampToValueAtTime(.0001,soundCtx.currentTime+dur);osc.connect(gain);gain.connect(soundCtx.destination);osc.start();osc.stop(soundCtx.currentTime+dur);}catch(e){}}
function toast(msg){$('toast').textContent=msg;$('toast').classList.add('on');toaster=2.2;}
function setScreen(s){screen=s;for(let k of Object.keys(OVERLAYS))$(OVERLAYS[k]).classList.remove('show');if(OVERLAYS[s])$(OVERLAYS[s]).classList.add('show');$('hud').classList.toggle('visible',s==='play');$('touchControls').classList.toggle('playing',s==='play');$('orientationHint').classList.toggle('playing',s==='play');$('pauseBtn').style.display=(s==='play'||s==='pause')?'':'none';$('pauseBtn').textContent=s==='pause'?'▶ RESUME':'Ⅱ PAUSE';}
function isAvailable(mission){
  if(mission===1||saved.completed.includes(mission))return true;
  if(mission<=10&&mission<=saved.unlocked)return true; // original save support
  return Object.entries(routes).some(([from,targets])=>targets.includes(mission)&&saved.completed.includes(Number(from)));
}
function makeMap(){
  $('mapTitle').textContent='THE SOLAR SYSTEM · 20 MISSIONS';
  $('chapterTabs').style.display='none';
  $('mapHint').textContent='One star system, twenty destinations. Tap a planet to fly there. Follow glowing flight paths, and scroll or drag the map to explore the outer orbits.';
  $('endingCount').textContent=`FINALES DISCOVERED: ${saved.endings.length} / 3`;
  const positions=mapPositions,ids=Array.from({length:20},(_,i)=>i+1);
  let svg=`<defs><radialGradient id="sunGlow"><stop stop-color="#fff5c9"/><stop offset=".15" stop-color="#ffd596"/><stop offset=".4" stop-color="#ffc46d" stop-opacity=".6"/><stop offset="1" stop-color="#fda866" stop-opacity="0"/></radialGradient></defs>`;
  // Orbit rings and a small sun, all on a single connected navigable chart.
  for(const [rx,ry] of [[12,20],[25,34],[39,49],[53,64]])svg+=`<ellipse cx="49" cy="52" rx="${rx}" ry="${ry}" fill="none" stroke="#8fb4d5" stroke-width=".17" opacity=".22" stroke-dasharray=".8 1.1"/>`;
  svg+='<circle cx="49" cy="52" r="9" fill="url(#sunGlow)" opacity=".65"/><circle cx="49" cy="52" r="1.35" fill="#fff5d6" opacity=".9"/>';
  for(const n of ids){for(const target of routes[n]||[]){if(!positions[target])continue;
    const a=positions[n],b=positions[target],won=saved.completed.includes(n)&&saved.completed.includes(target),ready=isAvailable(target);
    const mx=(a[0]+b[0])/2,my=(a[1]+b[1])/2-(Math.abs(a[1]-b[1])<5?3:0);
    svg+=`<path d="M ${a[0]} ${a[1]} Q ${mx} ${my} ${b[0]} ${b[1]}" fill="none" stroke="${won?'#a2ffcf':ready?'#b2bdfa':'#4a6889'}" stroke-width=".22" stroke-dasharray=".8 .55" opacity="${ready?'.8':'.42'}" />`;
  }}
  $('routeLines').setAttribute('viewBox','0 0 100 100');$('routeLines').innerHTML=svg;
  $('mapWorld').querySelectorAll('.node').forEach(n=>n.remove());
  ids.forEach(id=>{const lev=levels[id-1],b=document.createElement('button'),available=isAvailable(id),done=saved.completed.includes(id),final=!!lev.ending;
    b.className='node solarPlanet'+(lev.boss?' boss':'')+(final?' final':'')+(done?' done':'')+(!available?' locked':'')+(available&&!done?' next':'');
    b.style.left=positions[id][0]+'%';b.style.top=positions[id][1]+'%';
    b.style.setProperty('--sphere-base',bodyColors[id-1][0]);b.style.setProperty('--sphere-mid',bodyColors[id-1][1]);b.style.setProperty('--sphere-top',bodyColors[id-1][2]);
    b.title=`Mission ${id}: ${lev.name}${lev.boss?' · BOSS':''}${lev.ending?' · FINALE':''}`;
    b.setAttribute('aria-label',b.title+(!available?' · LOCKED':''));
    b.innerHTML=`<span class="planetNumber">${done?'✓':id}</span><span class="planetLabel">${lev.name}</span>${lev.boss?'<span class="planetBoss">'+(final?'FINAL BOSS':'BOSS')+'</span>':''}`;
    b.disabled=!available;b.onclick=()=>openMission(id-1);$('mapWorld').appendChild(b);
  });
  // Start near the first orbital waypoints, but don't reset scroll on every visit.
  if(!$('mapWorld').dataset.visited){$('levelMap').scrollLeft=0;$('mapWorld').dataset.visited='true';}
}
function openMap(chapter){makeMap();setScreen('map');}
function openMission(i){if(!isAvailable(i+1))return;selected=i;const l=levels[i];showScene({title:`MISSION ${String(i+1).padStart(2,'0')} · ${l.name.toUpperCase()}`,text:l.desc+' '+l.extra,kicker:`INCOMING TRANSMISSION · ${l.zone.toUpperCase()}`,duration:6.9,next:()=>startLevel(i)});}
function showScene(s){scene=s;sceneEnd=0;setScreen('scene');$('sceneTitle').textContent=s.title;$('sceneText').textContent=s.text;$('sceneKicker').textContent=s.kicker||'CINEMATIC • WATCH ONLY';$('sceneProgress').style.width='0';}
function skipScene(){if(screen!=='scene'||!scene)return;let n=scene.next;scene=null;sceneEnd=0; if(n)n();}
function newGame(i){return{index:i,score:0,hp:100,shield:0,rapid:0,spread:0,overdrive:0,wingman:0,wingCD:0,missiles:2,elapsed:0,spawnTimer:1,pickupTimer:4,fireCD:0,boss:null,bossSpawned:false,player:{x:150,y:300,r:18,invul:1.7},enemies:[],shots:[],foeShots:[],pickups:[],particles:[],explosions:[],kills:0,combo:0,comboTimer:0,done:false,waveNum:0};}
function startLevel(i){game=newGame(i);controls.aim=null;selected=i;flash=.18;toast(`MISSION ${i+1}: ${levels[i].name.toUpperCase()}`);setScreen('play');updateHud();}
function updateHud(){if(!game)return;$('hpNum').textContent=Math.max(0,Math.ceil(game.hp))+'%';$('hpFill').style.width=clamp(game.hp,0,100)+'%';$('shieldStatus').textContent=[game.shield>0?'◆ SHIELD':'',game.rapid>0?'⚡ RAPID':'',game.spread>0?'✦ TRIPLE':'',game.overdrive>0?'🔥 OVERDRIVE':'',game.wingman>0?'✈ WINGMAN':''].filter(Boolean).slice(0,2).join(' · ');$('hudLevel').textContent=String(game.index+1).padStart(2,'0')+' / 20';$('scoreNum').textContent=game.score.toLocaleString();$('missileNum').textContent=game.missiles;$('threatNum').textContent=Math.round(Math.min(100,100*game.elapsed/levels[game.index].duration))+'%';}
function showEnd(which,title,msg,primaryLabel,action,stars='✦ ✦ ✦'){$('endKicker').textContent=which==='gameover'?'JET LOST · MISSION FAILED':which==='finish'?'CAMPAIGN COMPLETE':'MISSION REPORT';$('endTitle').textContent=title;$('endText').textContent=msg;$('endPrimary').textContent=primaryLabel;$('resultStars').textContent=stars;endAction=action;$('routeChoices').classList.remove('show');$('routeChoices').replaceChildren();setScreen(which);}
function showRouteChoices(i){
  const next=routes[i+1]||[],wrap=$('routeChoices');wrap.replaceChildren();
  if(next.length<2)return;
  const lead=document.createElement('div');lead.className='routeLead';lead.textContent=next.some(id=>levels[id-1].ending)?'CHOOSE ONE OF THREE FINAL DESTINIES':'YOUR NEXT ROUTE · CHOOSE A MISSION';wrap.append(lead);
  for(const id of next){if(!isAvailable(id))continue;const lev=levels[id-1],b=document.createElement('button');b.className='routePick'+(lev.ending?' finalPick':'');
    b.textContent=`${lev.ending?endingScripts[lev.ending].symbol:'✈'} ${String(id).padStart(2,'0')} · ${lev.name.toUpperCase()}`;
    b.onclick=()=>openMission(id-1);wrap.append(b);
  }wrap.classList.add('show');
}
function finishEnding(i){
  const ending=levels[i].ending,script=endingScripts[ending];
  showScene({title:script.title,text:script.body,kicker:'FINAL CINEMATIC · WATCH ONLY · SKIPPABLE',duration:10,
  next:()=>showEnd('finish',script.label,`The Boss of Bosses has fallen. You unlocked ${saved.endings.length} of 3 finales. Final score: ${game.score.toLocaleString()}. Replay from the mission map to discover the others.`, 'EXPLORE OTHER ENDINGS',()=>openMap(1),'★ ★ ★ ★ ★')});
}
function cleared(){
  if(!game||game.done)return;game.done=true;const i=game.index,id=i+1,lev=levels[i];
  const bonus=Math.round(game.hp)*30+game.missiles*150;game.score+=bonus;
  if(id<=10)saved.unlocked=Math.max(saved.unlocked,Math.min(10,id+1));
  if(!saved.completed.includes(id))saved.completed.push(id);
  if(lev.ending&&!saved.endings.includes(lev.ending))saved.endings.push(lev.ending);
  saved.bestScore=Math.max(saved.bestScore,game.score);save();audio(650,.22,'sine',.07,1.7);
  const nextIds=routes[id]||[];
  const next=()=>{
    if(lev.ending){finishEnding(i);return;}
    if(id===10){showScene({title:'A SIGNAL BEYOND THE SUNRISE',text:'Atlas Prime has fallen, but new transmissions reach the squadron. A hidden fleet has split the horizon into rival air routes. The next campaign begins now!',kicker:'CHAPTER II CINEMATIC · WATCH ONLY',duration:7,next:()=>openMission(10)});return;}
    if(nextIds.length>1){openMap(id>=11?1:0);return;}
    if(!nextIds.length){openMap(id>=11?1:0);return;}
    if(lev.boss){showScene({title:'THE GUARDIAN HAS FALLEN',text:`${lev.boss} is defeated. The next sky route is clear. Destination: ${levels[nextIds[0]-1].zone}.`,kicker:'VICTORY CINEMATIC · WATCH ONLY',duration:5.7,next:()=>openMission(nextIds[0]-1)});return;}
    openMission(nextIds[0]-1);
  };
  const title=lev.ending?'THE BOSS OF BOSSES FALLS':id===10?'THE STORY CONTINUES':'SKY SECURED';
  const message=`Mission ${id} cleared · ${game.kills} enemy fighters destroyed · +${bonus.toLocaleString()} survival bonus. ${lev.ending?'You reached one of the three endings!':nextIds.length>1?'New branching routes unlocked. Choose where to fly next!':id===10?'The Fractured Horizon campaign is unlocked!':'Your next mission is ready.'}`;
  showEnd('clear',title,message,lev.ending?'WATCH YOUR ENDING »':nextIds.length>1?'VIEW BRANCHING MAP »':'CONTINUE »',next,game.hp>70?'✦ ✦ ✦':game.hp>35?'✦ ✦ ☆':'✦ ☆ ☆');
  showRouteChoices(i);
}
function playerDown(){if(screen!=='play'||!game)return;const p=game.player;if(p.invul>0||game.shield>0)return;game.hp-=18+Math.min(game.index,12)*.55;p.invul=1.1;flash=.28;shake=10;audio(90,.27,'sawtooth',.11,.4);sparks(p.x,p.y,20,'#ff707b',5);if(game.hp<=0){game.hp=0;showEnd('gameover','JET DOWN',`You reached Mission ${game.index+1}. ${game.kills} enemy fighters were defeated. Give it another try.`, '↻ RETRY MISSION',()=>startLevel(game.index),'✕ ✕ ✕');}}
function sparks(x,y,n,color,speed=1){if(!game)return;for(let j=0;j<n;j++){let a=rand(0,TAU),s=rand(40,260)*speed;game.particles.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,life:rand(.2,.8),max:1,r:rand(1.5,4.3),color});}}
function boom(x,y,big=false,color='#ffb36e'){sparks(x,y,big?42:15,color,big?1.6:1);game.explosions.push({x,y,r:big?60:29,t:0,life:big?.75:.37});shake=Math.max(shake,big?9:2);audio(big?80:140,big?.48:.18,'sawtooth',big?.095:.045,.15);}
function spawnEnemy(type,yy,xx){const hp=type==='bomber'?9:type==='ace'?5:3;let e={type,x:xx||W+45,y:yy||rand(85,H-65),anchor:yy||300,r:type==='bomber'?25:type==='ace'?19:15,hp:hp+Math.floor(Math.min(game.index,15)/4),maxHp:hp+Math.floor(Math.min(game.index,15)/4),vx:type==='ace'?rand(-270,-230):type==='bomber'?rand(-115,-95):rand(-205,-152),phase:rand(0,TAU),fire:rand(.65,2.0),time:0,points:type==='bomber'?450:type==='ace'?300:150};game.enemies.push(e);}
function launchWave(){const g=game;g.waveNum++;const count=(g.waveNum%4===0?4:g.waveNum%3===0?3:2);const type=g.waveNum%5===0?'bomber':g.waveNum%3===0?'ace':'fighter';const y=rand(120,H-130);for(let i=0;i<count;i++)spawnEnemy(type,clamp(y+(i-(count-1)/2)*51,80,H-65),W+65+i*73);if(g.waveNum%4===1&&g.index>2)spawnEnemy('ace',rand(80,H-60),W+300);}
function spawnPickup(x=W+30,y=rand(100,H-90)){const types=['heal','shield','rapid','missile','spread','points'];let type=types[Math.floor(rand(0,types.length))];if(game.index>=10&&Math.random()<.24)type=['overdrive','wingman','nova'][Math.floor(rand(0,3))];if(game.hp<38&&Math.random()<.52)type='heal';game.pickups.push({x,y,type,r:17,phase:rand(0,TAU)});}
function collect(item){const g=game;switch(item.type){case 'heal':g.hp=Math.min(100,g.hp+30);toast('♥ HULL REPAIRED +30');break;case 'shield':g.shield=8;toast('◆ ENERGY SHIELD ACTIVE');break;case 'rapid':g.rapid=10;toast('⚡ RAPID FIRE UNLOCKED');break;case 'spread':g.spread=11;toast('✦ TRIPLE SHOT ACTIVE');break;case 'missile':g.missiles+=2;toast('🚀 TWO MISSILES COLLECTED');break;case 'points':g.score+=750;toast('★ BONUS 750 POINTS');break;case 'overdrive':g.overdrive=12;toast('🔥 OVERDRIVE LASERS ACTIVE');break;case 'wingman':g.wingman=12;toast('✈ ALLIED WINGMAN SUPPORT');break;case 'nova':g.foeShots=[];for(const e of g.enemies){e.hp=0;boom(e.x,e.y);}g.enemies=[];if(g.boss){g.boss.hp=Math.max(1,g.boss.hp-45);sparks(g.boss.x,g.boss.y,40,'#fff3ae',2);}g.score+=500;toast('☀ NOVA BLAST · SKY CLEARED');break;}audio(750,.2,'sine',.07,1.65);sparks(item.x,item.y,15,'#96ffe5');}
function shoot(){const g=game;if(!g)return;const p=g.player;const sy=g.spread>0?[-95,0,95]:[0];for(let vy of sy)g.shots.push({x:p.x+22,y:p.y,vx:780,vy,damage:g.overdrive>0?3.5:2.2,r:4.5,kind:'laser'});g.fireCD=g.rapid>0?.11:.185;audio(g.spread>0?620:460,.06,'triangle',.019,.6);}
function missile(){if(screen!=='play'||!game||game.missiles<1)return;game.missiles--;const p=game.player;game.shots.push({x:p.x+15,y:p.y,vx:520,vy:0,damage:22,r:9,kind:'missile',life:2.8});toast('🚀 MISSILE LAUNCHED');audio(140,.25,'sawtooth',.06,2);}
function spawnBoss(){const g=game,lev=levels[g.index];g.bossSpawned=true;g.enemies=[];g.foeShots=[];const final=!!lev.ending,bossHp=final?({dawn:260,storm:330,void:400}[lev.ending]):85+g.index*20;g.boss={name:lev.boss,x:W+130,y:H*.5,r:final?80:75,hp:bossHp,maxHp:bossHp,time:0,fire:1.15,phase:0,form:lev.ending||'standard',volley:0};showScene({title:lev.boss+' APPROACHES',text:`WARNING: Guardian-class aircraft detected. Its armor is reinforced, but your missiles can tear through it. ${lev.ending?'This is NEXUS OMEGA, the Boss of Bosses! Its chosen form determines your ending.':'This is your moment, pilot!'}`,kicker:'BOSS ENCOUNTER · WATCH ONLY',duration:3.8,next:()=>{setScreen('play');toast('⚠ BOSS BATTLE: '+lev.boss);}});audio(110,.7,'sawtooth',.07,.45);}
function killEnemy(e){let g=game;g.score+=e.points;g.kills++;g.combo++;g.comboTimer=4;boom(e.x,e.y,e.type==='bomber');if(Math.random()<.10)spawnPickup(e.x,e.y);}
function tick(dt){worldTime+=dt;flash=Math.max(0,flash-dt);shake=Math.max(0,shake-35*dt);if(toaster>0){toaster-=dt;if(toaster<=0)$('toast').classList.remove('on');}if(screen==='scene'){if(!sceneEnd)sceneEnd=performance.now();let f=(performance.now()-sceneEnd)/(scene.duration*1000);$('sceneProgress').style.width=clamp(f*100,0,100)+'%';if(f>=1)skipScene();return;}
if(screen!=='play'||!game)return;const g=game,p=g.player,l=levels[g.index];g.elapsed+=dt;p.invul=Math.max(0,p.invul-dt);g.shield=Math.max(0,g.shield-dt);g.rapid=Math.max(0,g.rapid-dt);g.spread=Math.max(0,g.spread-dt);g.overdrive=Math.max(0,g.overdrive-dt);g.wingman=Math.max(0,g.wingman-dt);g.wingCD=Math.max(0,g.wingCD-dt);g.comboTimer=Math.max(0,g.comboTimer-dt);g.fireCD=Math.max(0,g.fireCD-dt);
let my=(controls.keys.has('ArrowRight')||controls.keys.has('d')?1:0)-(controls.keys.has('ArrowLeft')||controls.keys.has('a')?1:0),mx=(controls.keys.has('ArrowUp')||controls.keys.has('w')?1:0)-(controls.keys.has('ArrowDown')||controls.keys.has('s')?1:0);const len=Math.hypot(mx,my)||1;p.x+=mx/len*380*dt;p.y+=my/len*380*dt;if(controls.aim){p.x+=(controls.aim.x-p.x)*Math.min(1,dt*10);p.y+=(controls.aim.y-p.y)*Math.min(1,dt*10);}p.x=clamp(p.x,50,630);p.y=clamp(p.y,54,H-50);
if(g.fireCD<=0)shoot();if(g.wingman>0&&g.wingCD<=0){g.shots.push({x:p.x-20,y:p.y-29,vx:780,vy:-65,damage:2.2,r:5,kind:'laser'});g.shots.push({x:p.x-20,y:p.y+29,vx:780,vy:65,damage:2.2,r:5,kind:'laser'});g.wingCD=.30;}if(controls.keys.has('x')||controls.keys.has('X')){if(!controls.missileHeld){missile();controls.missileHeld=true;}}else controls.missileHeld=false;
if(!g.bossSpawned){g.spawnTimer-=dt;g.pickupTimer-=dt;if(g.spawnTimer<=0&&g.elapsed<l.duration-1){launchWave();g.spawnTimer=Math.max(.95,2.1-g.index*.052)+rand(-.25,.45);}if(g.pickupTimer<=0){spawnPickup();g.pickupTimer=5.1+rand(0,2.5);}if(g.elapsed>l.duration){if(l.boss)spawnBoss();else {cleared();return;}}}
for(const e of g.enemies){e.time+=dt;e.x+=e.vx*dt;e.y+=Math.sin(e.time*3.4+e.phase)*28*dt+(e.type==='ace'?Math.sin(e.time*1.9+e.phase)*35*dt:0);e.fire-=dt;if(e.fire<=0&&e.x<W-30&&e.x>370){const vy=clamp((p.y-e.y)*.34,-160,160);g.foeShots.push({x:e.x-15,y:e.y,vx:-260-Math.min(g.index,14)*9,vy,r:5,damage:1});e.fire=rand(1.3,2.6);audio(230,.07,'square',.015,.6);}if(dist(e,p)<e.r+p.r&&p.invul<=0){playerDown();e.hp-=2;}}
g.enemies=g.enemies.filter(e=>e.hp>0&&e.x>-55);
const b=g.boss;if(b){b.time+=dt;b.x+=(790-b.x)*Math.min(1,dt*1.2);b.y=H/2+Math.sin(b.time*.92)*158;b.fire-=dt;if(b.fire<=0){
  b.volley++;
  const size=b.form==='void'?4:b.form==='storm'?3:2;
  const aim=Math.atan2(p.y-b.y,p.x-b.x),baseSpeed=b.form==='void'?315:b.form==='storm'?290:245;
  for(let i=-size;i<=size;i++){
    const angle=aim+i*(b.form==='storm'?.18:.15)+(b.form==='void'?Math.sin(b.volley*.6)*.1:0);
    g.foeShots.push({x:b.x-47,y:b.y+15,vx:Math.cos(angle)*(baseSpeed+g.index*3),vy:Math.sin(angle)*(baseSpeed+g.index*3),r:b.form==='void'?7:6,damage:1});
  }
  if(b.form==='void'&&b.volley%4===0){spawnEnemy('ace',rand(110,H-110),W+35);}
  if(b.form==='storm'&&b.volley%3===0){for(let k=-1;k<=1;k++)g.foeShots.push({x:b.x-60,y:b.y+k*36,vx:-270,vy:k*110,r:7,damage:1});}
  b.fire=b.form==='void'?.95:b.form==='storm'?1.07:b.form==='dawn'?1.22:g.index===9?.9:1.25;
  audio(165,.2,'square',.04,.8);
}if(dist(b,p)<b.r+p.r&&p.invul<=0)playerDown();}
for(const s of g.shots){s.x+=s.vx*dt;s.y+=s.vy*dt;if(s.kind==='missile'){s.life-=dt;const targets=[...g.enemies];if(g.boss)targets.push(g.boss);const target=targets.filter(t=>t.x>s.x-120).sort((a,b)=>dist(s,a)-dist(s,b))[0];if(target){const turn=Math.atan2(target.y-s.y,target.x-s.x);s.vx=Math.cos(turn)*540;s.vy=Math.sin(turn)*540;}}if(s.x>W+40||s.y<-40||s.y>H+40||s.life<0)s.dead=true;for(const e of g.enemies){if(!s.dead&&dist(s,e)<e.r+s.r){e.hp-=s.damage;s.dead=true;if(s.kind==='missile')boom(s.x,s.y,true);else sparks(s.x,s.y,3,'#bfffff');if(e.hp<=0)killEnemy(e);break;}}if(g.boss&&!s.dead&&dist(s,g.boss)<g.boss.r*.72+s.r){g.boss.hp-=s.damage;s.dead=true;if(s.kind==='missile')boom(s.x,s.y,true);else sparks(s.x,s.y,4,'#dffaff');if(g.boss.hp<=0){boom(g.boss.x,g.boss.y,true,'#ffcb6d');g.score+=5000;g.boss=null;cleared();return;}}}g.shots=g.shots.filter(s=>!s.dead);
for(const s of g.foeShots){s.x+=s.vx*dt;s.y+=s.vy*dt;if(dist(s,p)<s.r+p.r){s.dead=true;playerDown();}}g.foeShots=g.foeShots.filter(s=>!s.dead&&s.x>-30&&s.y>-20&&s.y<H+20);
for(const item of g.pickups){item.x-=104*dt;item.phase+=dt*3;if(dist(item,p)<item.r+p.r){item.dead=true;collect(item);}}g.pickups=g.pickups.filter(x=>!x.dead&&x.x>-30);
for(const q of g.particles){q.x+=q.vx*dt;q.y+=q.vy*dt;q.life-=dt;q.vx*=Math.max(.1,1-1.2*dt);q.vy*=Math.max(.1,1-1.2*dt);}g.particles=g.particles.filter(q=>q.life>0);for(const e of g.explosions)e.t+=dt;g.explosions=g.explosions.filter(x=>x.t<x.life);if(g.hp<=0)return;updateHud();}
function resize(){const rect=$('viewport').getBoundingClientRect();vw=rect.width;vh=rect.height;const dpr=Math.min(window.devicePixelRatio||1,2);canvas.width=Math.round(vw*dpr);canvas.height=Math.round(vh*dpr);scale=Math.min(vw/W,vh/H);offsetX=(vw-W*scale)/2;offsetY=(vh-H*scale)/2;ctx.setTransform(dpr*scale,0,0,dpr*scale,dpr*offsetX,dpr*offsetY);}
function polygon(points,fill,stroke,line=1){ctx.beginPath();ctx.moveTo(points[0][0],points[0][1]);points.slice(1).forEach(p=>ctx.lineTo(p[0],p[1]));ctx.closePath();if(fill){ctx.fillStyle=fill;ctx.fill();}if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=line;ctx.stroke();}}
function rounded(x,y,w,h,r,color){ctx.fillStyle=color;ctx.beginPath();ctx.roundRect(x,y,w,h,r);ctx.fill();}
// Procedural orbital scenery. Textures are drawn into cached small canvases for speed.
const textures=new Map();
function planetTexture(idx){if(textures.has(idx))return textures.get(idx);const n=350,off=document.createElement('canvas');off.width=n;off.height=n;
 const c=off.getContext('2d'),colors=bodyColors[idx]||bodyColors[0];
 const grad=c.createLinearGradient(0,0,0,n);grad.addColorStop(0,colors[2]);grad.addColorStop(.52,colors[1]);grad.addColorStop(1,colors[0]);c.fillStyle=grad;c.fillRect(0,0,n,n);
 // Stable seeded noise gives each planet its own surface geography.
 let seed=24613+idx*1799;const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296};
 const gas=['storm','lava','void'].includes(worldTypes[idx]);
 if(gas){for(let k=0;k<60;k++){let y=random()*n,h=1+random()*27;c.globalAlpha=.045+random()*.28;c.fillStyle=k%3===0?'#fff3da':k%2?'#190d38':'#badbff';c.beginPath();c.ellipse(n/2,y,n*.65,h,random()*.12-.06,0,TAU);c.fill()}}else{
 for(let k=0;k<290;k++){let x=random()*n,y=random()*n,w=4+random()*80,h=2+random()*22;c.globalAlpha=.05+random()*.25;c.fillStyle=k%4===0?'#fff9e0':k%3===0?'#081c33':'#bdeada';c.beginPath();c.ellipse(x,y,w,h,(random()-.5)*.6,0,TAU);c.fill()}
 for(let k=0;k<30;k++){const x=random()*n,y=random()*n,r=3+random()*12;c.strokeStyle='#f0fff5';c.globalAlpha=.04+random()*.18;c.lineWidth=random()*3+1;c.beginPath();c.arc(x,y,r,0,TAU);c.stroke();}
 }
 c.globalAlpha=1;textures.set(idx,off);return off;
}
function sphere(cx,cy,r,idx,alpha=1){const pal=bodyColors[idx]||bodyColors[0];ctx.save();ctx.globalAlpha=alpha;ctx.shadowColor=pal[2];ctx.shadowBlur=Math.min(35,r*.13);ctx.beginPath();ctx.arc(cx,cy,r,0,TAU);ctx.clip();ctx.drawImage(planetTexture(idx),cx-r,cy-r,2*r,2*r);ctx.shadowBlur=0;
 let shade=ctx.createRadialGradient(cx-r*.32,cy-r*.42,r*.12,cx+r*.22,cy+r*.25,r*1.4);shade.addColorStop(0,'#efffff4a');shade.addColorStop(.39,'#fff9ec0d');shade.addColorStop(.77,'#000f217a');shade.addColorStop(1,'#010713f8');ctx.fillStyle=shade;ctx.fillRect(cx-r,cy-r,2*r,2*r);ctx.restore();
 ctx.save();ctx.globalAlpha=alpha;ctx.strokeStyle=pal[2]+'77';ctx.shadowBlur=20;ctx.shadowColor=pal[2];ctx.lineWidth=Math.max(1,r*.008);ctx.beginPath();ctx.arc(cx,cy,r,0,TAU);ctx.stroke();ctx.restore();
 if(idx===8||idx===18){ctx.save();ctx.translate(cx,cy);ctx.rotate(-.22);ctx.strokeStyle='#d7c6a277';ctx.lineWidth=Math.max(8,r*.15);ctx.beginPath();ctx.ellipse(0,0,r*1.5,r*.34,0,0,TAU);ctx.stroke();ctx.restore()}
}
const starfield=Array.from({length:320},(_,i)=>({x:((i*479.13)%W),y:((i*331.77)%H),r:.4+(i%9)/8,twinkle:i*.77}));
function paintBG(t,level){const idx=clamp(level|0,0,19),type=worldTypes[idx],space=['space','orbit','void','station'].includes(type),col=bodyColors[idx];
 const g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,space?'#030815':'#09152a');g.addColorStop(.5,space?'#0c1330':'#254c6a');g.addColorStop(1,space?'#0a1229':'#3b7b9d');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
 // Several layers of stars move at different speeds with a vanishing point.
 for(const s of starfield){const sx=(s.x+Math.sin(t*.07+s.twinkle)*3+W)%W,sy=(s.y+t*(space?4:1.5)*(s.r+.2))%H;ctx.globalAlpha=(space?.25:.09)+.37*(.5+.5*Math.sin(t*.5+s.twinkle));ctx.fillStyle=space?'#ebf5ff':'#d3f7ff';ctx.fillRect(sx,sy,s.r*1.4,s.r*1.4)}ctx.globalAlpha=1;
 const far=idx===19?19:idx;
 if(space){sphere(idx%2?750:680,idx%3?415:475,idx===19?325:idx%3?255:315,far);sphere(137,118,idx%2?43:27,(idx+3)%20,.72);
   if(idx===16||idx===19){const halo=ctx.createRadialGradient(490,255,2,490,255,250);halo.addColorStop(0,'#a768ba34');halo.addColorStop(1,'#180a3000');ctx.fillStyle=halo;ctx.fillRect(150,0,700,550)}
 }else{
   // Giant planet occupies everything below the curved far horizon.
   sphere(510,1090,870,idx);
   const atm=ctx.createLinearGradient(0,150,0,H);atm.addColorStop(0,col[2]+'00');atm.addColorStop(.22,col[2]+'39');atm.addColorStop(1,col[0]+'18');ctx.fillStyle=atm;ctx.fillRect(0,145,W,H-145);
   // Vast floating cloud decks, perspective-compressed toward the horizon.
   for(let k=0;k<17;k++){let depth=((k*177+t*(28+k%4*7))%1200)/1200;let yy=180+depth*depth*470;let px=(((k*359+400)%1300)-180)+(depth*.3)*Math.sin(k*5)*120;let rw=35+depth*250,rh=2+depth*34;const cloud=ctx.createRadialGradient(px,yy,2,px,yy,rw);cloud.addColorStop(0,'#eaf9ff'+(depth>.3?'27':'16'));cloud.addColorStop(1,'#ffffff00');ctx.fillStyle=cloud;ctx.save();ctx.translate(px,yy);ctx.scale(1,rh/rw);ctx.beginPath();ctx.arc(0,0,rw,0,TAU);ctx.fill();ctx.restore();}
 }
 // Subtle cinematic vanishing-point streaks and central HUD reticle.
 ctx.save();ctx.globalAlpha=.11;ctx.strokeStyle=col[2];for(let k=0;k<13;k++){let x=(k-6)*110+480;ctx.beginPath();ctx.moveTo(480+(x-480)*.12,175);ctx.lineTo(480+(x-480)*1.2,H);ctx.stroke()}ctx.restore();
 ctx.strokeStyle='#b0f7ff66';ctx.lineWidth=1.2;ctx.beginPath();ctx.arc(W/2,174,13,0,TAU);ctx.moveTo(W/2-24,174);ctx.lineTo(W/2-10,174);ctx.moveTo(W/2+10,174);ctx.lineTo(W/2+24,174);ctx.stroke();
}
function project(x,y){let q=clamp((W-x+30)/(W+60),0,1),factor=.18+q*.94;return{x:W/2+(y-H/2)*factor*1.34,y:158+q*q*427,s:.18+q*1.13,depth:q};}
function drawRearJet(px,py,sc=1,enemy=false,bank=0){ctx.save();ctx.translate(px,py);ctx.rotate(bank);ctx.scale(sc,sc);
 const metal=ctx.createLinearGradient(-76,-55,72,56);metal.addColorStop(0,enemy?'#4d2639':'#152a3e');metal.addColorStop(.37,enemy?'#dd7c8a':'#86b5ca');metal.addColorStop(.65,enemy?'#873e59':'#44687e');metal.addColorStop(1,enemy?'#2a192c':'#15253e');
 ctx.shadowColor=enemy?'#ff6b9c':'#58b9f8';ctx.shadowBlur=8;
 polygon([[-8,-66],[0,-89],[8,-66],[12,11],[28,38],[11,48],[-11,48],[-28,38],[-12,11]],metal,enemy?'#ffb0ab':'#b6d9e7',1.2);
 polygon([[-12,-25],[-31,4],[-77,39],[-78,55],[-17,45],[-9,28]],metal,'#a5c6d3',1.3);polygon([[12,-25],[31,4],[77,39],[78,55],[17,45],[9,28]],metal,'#a5c6d3',1.3);
 polygon([[-14,10],[-35,40],[-37,61],[-11,43]],enemy?'#572f49':'#214761','#b0c9da',1);polygon([[14,10],[35,40],[37,61],[11,43]],enemy?'#572f49':'#214761','#b0c9da',1);
 const canopy=ctx.createLinearGradient(0,-57,0,8);canopy.addColorStop(0,enemy?'#ffa9ab':'#c4faff');canopy.addColorStop(1,enemy?'#421b3c':'#153a67');ctx.shadowBlur=0;ctx.fillStyle=canopy;ctx.beginPath();ctx.ellipse(0,-27,9,29,0,0,TAU);ctx.fill();
 for(let side of [-1,1]){let x=side*14,y=41;const flame=ctx.createRadialGradient(x,y+5,1,x,y+24,29);flame.addColorStop(0,'#ffffff');flame.addColorStop(.24,enemy?'#ffa1e1':'#70dfff');flame.addColorStop(.55,'#427ac4bb');flame.addColorStop(1,'#1e75ff00');ctx.fillStyle=flame;ctx.beginPath();ctx.ellipse(x,y+19,11,26+Math.sin(worldTime*17+side)*5,0,0,TAU);ctx.fill();}
 ctx.restore();}
function drawRearBoss(b){const p=project(b.x,b.y),s=Math.max(.55,p.s*1.45);ctx.save();ctx.translate(p.x,p.y);ctx.scale(s,s);
 const hue=b.form==='dawn'?'#ffd799':b.form==='storm'?'#9ee7ff':b.form==='void'?'#ed9aff':'#ff98ae';
 ctx.shadowBlur=26;ctx.shadowColor=hue;polygon([[-20,-100],[0,-124],[20,-100],[45,-15],[137,28],[130,62],[40,43],[25,98],[-25,98],[-40,43],[-130,62],[-137,28],[-45,-15]],'#262a43',hue,3);
 polygon([[-42,5],[-124,45],[-27,37]],'#8a566c','#ffbd9f',2);polygon([[42,5],[124,45],[27,37]],'#8a566c','#ffbd9f',2);
 const core=ctx.createRadialGradient(0,-20,4,0,-20,52);core.addColorStop(0,'#fff');core.addColorStop(.3,hue);core.addColorStop(1,'#6b274b');ctx.fillStyle=core;ctx.beginPath();ctx.ellipse(0,-20,31,48,0,0,TAU);ctx.fill();ctx.restore();
 rounded(625,107,288,16,7,'#230d2ede');rounded(629,111,280*clamp(b.hp/b.maxHp,0,1),8,5,hue);ctx.fillStyle='#fff8ed';ctx.font='900 17px system-ui';ctx.textAlign='center';ctx.fillText('⚠ '+b.name+' ⚠',769,96);ctx.textAlign='left';}
function drawJet(x,y,scaleJet=1,enemy=false,type='fighter',tilt=0){ctx.save();ctx.translate(x,y);ctx.rotate(tilt);ctx.scale(scaleJet,scaleJet);if(enemy)ctx.scale(-1,1);const body=enemy?'#f69eaa':'#a2f2ff',dark=enemy?'#7a2749':'#28679e',wing=enemy?'#e96b81':'#56b1e8';ctx.shadowBlur=enemy?11:20;ctx.shadowColor=enemy?'#f65a80':'#54c9ff';polygon([[-31,0],[-13,-7],[13,-8],[33,0],[13,8],[-13,7]],body,'#e6ffff',1);polygon([[-10,-4],[-24,-25],[3,-19],[12,-6]],wing,dark,1.2);polygon([[-10,4],[-24,25],[3,19],[12,6]],wing,dark,1.2);polygon([[-25,-5],[-36,-15],[-14,-9]],dark);polygon([[-25,5],[-36,15],[-14,9]],dark);polygon([[3,-5],[18,-3],[25,0],[18,3],[3,5]],enemy?'#47223d':'#224f78','#ecffff',.8);ctx.shadowBlur=0;ctx.fillStyle=enemy?'#ff9d44':'#51ffff';ctx.beginPath();ctx.ellipse(-32,0,rand(4,9),3.3,0,0,TAU);ctx.fill();if(type==='bomber'){ctx.fillStyle=dark;ctx.fillRect(-8,-21,12,42);}if(type==='ace'){ctx.strokeStyle='#ffe3a8';ctx.lineWidth=2;ctx.strokeRect(-6,-7,18,14);}ctx.restore();}
function drawBoss(b){ctx.save();ctx.translate(b.x,b.y);if(b.form!=='standard'){const hue=b.form==='dawn'?'#ffd88b':b.form==='storm'?'#9edaff':'#e19aff';ctx.save();ctx.rotate(b.time*(b.form==='void'?-.55:.35));ctx.strokeStyle=hue;ctx.globalAlpha=.8;ctx.shadowColor=hue;ctx.shadowBlur=17;ctx.lineWidth=3;for(let k=0;k<3;k++){ctx.beginPath();ctx.ellipse(0,0,100+k*13,49+k*11,k*.55,0,TAU);ctx.stroke();}ctx.restore();} ctx.rotate(Math.sin(b.time*1.1)*.05);ctx.shadowBlur=28;ctx.shadowColor='#f15d93';polygon([[-96,0],[-40,-27],[7,-41],[65,-29],[101,0],[65,29],[7,41],[-40,27]],'#672f53','#ffb1b4',3);polygon([[-24,-17],[-55,-86],[20,-60],[47,-24]],'#8c4568','#ffa2a7',2);polygon([[-24,17],[-55,86],[20,60],[47,24]],'#8c4568','#ffa2a7',2);polygon([[-33,0],[21,-24],[76,0],[21,24]],'#d66d84','#ffe1b2',2);ctx.shadowBlur=15;ctx.fillStyle='#e8fcff';ctx.beginPath();ctx.ellipse(39,0,24,9,0,0,TAU);ctx.fill();ctx.fillStyle='#fc5776';for(let i of [-1,1]){ctx.beginPath();ctx.ellipse(-75,i*19,12,6,0,0,TAU);ctx.fill();}ctx.restore();rounded(625,112,288,16,7,'#240f2ded');rounded(629,116,280*clamp(b.hp/b.maxHp,0,1),8,5,'#ff6e8c');ctx.fillStyle='#fff1e6';ctx.font='900 17px system-ui';ctx.textAlign='center';ctx.fillText('⚠ '+b.name+' ⚠',769,102);}
function render(dt){
 ctx.save();ctx.setTransform(canvas.width/vw,0,0,canvas.height/vh,0,0);ctx.fillStyle='#071021';ctx.fillRect(0,0,vw,vh);ctx.restore();
 ctx.save();ctx.beginPath();ctx.rect(0,0,W,H);ctx.clip();if(shake>0&&screen==='play')ctx.translate(rand(-shake,shake),rand(-shake,shake));
 let lev=game?game.index:selected;paintBG(worldTime,lev);
 if(screen==='home'||screen==='map'){drawRearJet(486,505,1.5,false,Math.sin(worldTime)*.05);}
 if(screen==='scene'){drawRearJet(486,504,1.48,false);drawRearJet(620+Math.sin(worldTime)*30,288,.42,true);drawRearJet(335,245,.32,true);ctx.fillStyle='#eaffff77';ctx.font='bold 13px monospace';ctx.fillText('◈ ORBITAL TRANSMISSION ACTIVE',28,43)}
 if(game&&['play','pause','clear','gameover','finish'].includes(screen)){
  const g=game;const objects=[];
  for(let e of g.enemies)objects.push({x:e.x,draw:()=>{let p=project(e.x,e.y);drawRearJet(p.x,p.y,Math.max(.15,p.s*.67)*(e.type==='bomber'?1.4:1),true,Math.sin(e.time*3)*.1)}});
  if(g.boss)objects.push({x:g.boss.x,draw:()=>drawRearBoss(g.boss)});
  for(let item of g.pickups)objects.push({x:item.x,draw:()=>{const p=project(item.x,item.y),r=Math.max(7,p.s*18);ctx.save();ctx.translate(p.x,p.y);ctx.rotate(worldTime*.9);ctx.shadowColor='#9fffe0';ctx.shadowBlur=19;polygon([[0,-r],[r,0],[0,r],[-r,0]],'#0c536e','#ccffe8',2);ctx.restore();ctx.fillStyle='#f1fff9';ctx.textAlign='center';ctx.font='900 '+Math.round(r*1.0)+'px system-ui';ctx.fillText({heal:'♥',shield:'◆',rapid:'⚡',missile:'✚',spread:'✦',points:'★',overdrive:'🔥',wingman:'✈',nova:'☀'}[item.type],p.x,p.y+r*.35);ctx.textAlign='left'}});
  for(let s of g.foeShots)objects.push({x:s.x,draw:()=>{const p=project(s.x,s.y),r=Math.max(3,p.s*6);ctx.save();ctx.shadowColor='#ff987e';ctx.shadowBlur=14;ctx.fillStyle='#ffb793';ctx.beginPath();ctx.arc(p.x,p.y,r,0,TAU);ctx.fill();ctx.restore()}});
  for(let s of g.shots)objects.push({x:s.x,draw:()=>{const p=project(s.x,s.y),r=Math.max(2,p.s*5);ctx.save();ctx.shadowBlur=15;ctx.shadowColor=s.kind==='missile'?'#ffc178':'#72f7ff';ctx.strokeStyle=s.kind==='missile'?'#ffd7a4':'#b5ffff';ctx.lineWidth=r*1.25;ctx.beginPath();ctx.moveTo(p.x,p.y+r*3);ctx.lineTo(p.x,p.y-r*4);ctx.stroke();ctx.restore()}});
  objects.sort((a,b)=>b.x-a.x);for(let ob of objects)ob.draw();
  for(let q of g.particles){let p=project(q.x,q.y);ctx.globalAlpha=Math.min(1,q.life*2);ctx.fillStyle=q.color;ctx.fillRect(p.x,p.y,Math.max(2,q.r*p.s),Math.max(2,q.r*p.s))}ctx.globalAlpha=1;
  for(let b of g.explosions){let p=project(b.x,b.y);ctx.strokeStyle=`rgba(255,215,160,${1-b.t/b.life})`;ctx.lineWidth=3;ctx.beginPath();ctx.arc(p.x,p.y,b.r*p.s*(.25+b.t/b.life),0,TAU);ctx.stroke()}
  const p=project(g.player.x,g.player.y),bank=(controls.keys.has('ArrowLeft')||controls.keys.has('a')?-.1:controls.keys.has('ArrowRight')||controls.keys.has('d')?.1:0);
  if(g.wingman>0){drawRearJet(p.x-100,p.y-45,.48,false,-.07);drawRearJet(p.x+100,p.y-45,.48,false,.07)}
  if(g.shield>0){ctx.strokeStyle='#92fffab5';ctx.shadowColor='#6ffcff';ctx.shadowBlur=20;ctx.lineWidth=3;ctx.beginPath();ctx.ellipse(p.x,p.y,104,85,0,0,TAU);ctx.stroke();ctx.shadowBlur=0}
  drawRearJet(p.x,p.y,Math.min(1.15,.88+p.s*.2),false,bank);
  if(p.depth>.5){ctx.fillStyle='#d5f8ff55';ctx.font='bold 11px monospace';ctx.fillText('VELOCITY  //  ' + Math.round(840+g.elapsed*14)+' KM/H',23,H-17)}
 }
 if(flash>0){ctx.fillStyle=`rgba(255,160,160,${Math.min(.3,flash*.75)})`;ctx.fillRect(0,0,W,H)}ctx.restore();
}
function frame(ms){if(!last)last=ms;const dt=Math.min(.045,(ms-last)/1000);last=ms;tick(dt);render(dt);requestAnimationFrame(frame);}
function screenPosition(event){const r=canvas.getBoundingClientRect(),sx=(event.clientX-r.left-offsetX)/scale,sy=(event.clientY-r.top-offsetY)/scale;
  const q=Math.sqrt(clamp((sy-158)/427,.02,1));const x=clamp(W+30-q*(W+60),50,630),fac=.18+q*.94;
  return{x,y:clamp(H/2+(sx-W/2)/(fac*1.34),54,H-50)};
}
canvas.addEventListener('pointerdown',e=>{if(screen!=='play')return;e.preventDefault();controls.dragging=true;controls.dragId=e.pointerId;controls.aim=screenPosition(e);canvas.setPointerCapture?.(e.pointerId);});
canvas.addEventListener('pointermove',e=>{if(screen!=='play'||!controls.dragging||controls.dragId!==e.pointerId)return;controls.aim=screenPosition(e);});
const releasePointer=e=>{if(controls.dragId===e.pointerId){controls.dragging=false;controls.aim=null;}};canvas.addEventListener('pointerup',releasePointer);canvas.addEventListener('pointercancel',releasePointer);
window.addEventListener('keydown',e=>{if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' '].includes(e.key))e.preventDefault();controls.keys.add(e.key);if(e.repeat)return;if((e.key==='p'||e.key==='P'||e.key==='Escape')&&(screen==='play'||screen==='pause'))togglePause();if(e.key==='Enter'&&screen==='scene')skipScene();if(e.key===' '&&screen==='scene')skipScene();});window.addEventListener('keyup',e=>controls.keys.delete(e.key));window.addEventListener('blur',()=>{controls.keys.clear();controls.aim=null;if(screen==='play')togglePause();});
function togglePause(){if(screen==='play'){showEnd('pause','MISSION PAUSED','Your jet is holding position. Breathe, then get back into the sky.','▶ RESUME',()=>setScreen('play'),'Ⅱ Ⅱ Ⅱ');$('endKicker').textContent='PAUSE MENU';}else if(screen==='pause')setScreen('play');}
// Drag the orbital chart to pan on both mouse and touch; buttons still select levels.
(()=>{const el=$('levelMap');let origin=null;el.addEventListener('pointerdown',e=>{if(e.target.closest('button'))return;origin={x:e.clientX,y:e.clientY,left:el.scrollLeft,top:el.scrollTop,id:e.pointerId};el.setPointerCapture?.(e.pointerId)});el.addEventListener('pointermove',e=>{if(!origin||origin.id!==e.pointerId)return;el.scrollLeft=origin.left-(e.clientX-origin.x);el.scrollTop=origin.top-(e.clientY-origin.y)});const finish=()=>{origin=null};el.addEventListener('pointerup',finish);el.addEventListener('pointercancel',finish)})();
$('startBtn').onclick=()=>openMap();$('homeMapBtn').onclick=()=>openMap();$('chapterOne').onclick=()=>openMap(0);$('chapterTwo').onclick=()=>openMap(1);$('mapHomeBtn').onclick=()=>setScreen('home');$('skipSceneBtn').onclick=skipScene;$('endPrimary').onclick=()=>endAction&&endAction();$('endMap').onclick=()=>openMap();$('pauseBtn').onclick=togglePause;$('touchMissile').onclick=missile;
$('soundBtn').onclick=()=>{soundOn=!soundOn;saved.sound=soundOn;save();$('soundBtn').textContent=soundOn?'♫ SOUND ON':'♪ SOUND OFF';audio(590,.12,'sine',.055,1.4);};$('soundBtn').textContent=soundOn?'♫ SOUND ON':'♪ SOUND OFF';
window.addEventListener('resize',resize);resize();requestAnimationFrame(frame);
})();