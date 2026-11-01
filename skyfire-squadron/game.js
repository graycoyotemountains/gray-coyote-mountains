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
 {name:'Beyond the Blue',zone:'Stratosphere',color:'#29375e',accent:'#d0beff',desc:'Climb beyond the clouds. Experimental fighters protect a route to the enemy command fleet.',duration:32,extra:'METEOR FIELD: dodge or destroy drifting asteroids while climbing through orbital dust.'},
 {name:'Iron Armada',zone:'High Fleet',color:'#574264',accent:'#ffc3a8',desc:'The airborne navy arrives. Its huge flagship LEVIATHAN is the final shield before the citadel.',duration:34,boss:'LEVIATHAN',extra:'METEOR FIELD: the giant carrier hides among moving asteroids. Watch for incoming rocks.'},
 {name:'Skyfire Citadel',zone:'Final Horizon',color:'#4d315c',accent:'#ffe49a',desc:'The last fortress opens its gates. Destroy ATLAS PRIME and return the skies to everyone.',duration:37,boss:'ATLAS PRIME',extra:'METEOR FIELD: battle Atlas Prime in a dense asteroid cloud above the planet.'},
 {name:'Shattered Dawn',zone:'Broken Sunrise',color:'#76516f',accent:'#ffb6d6',desc:'A hidden signal survives beyond the citadel. The war is not over: another command fleet has awakened. Begin the Fractured Horizon campaign.',duration:32,extra:'New transmissions split in two directions. Which route will your squadron take?'},
 {name:'Glass Reef',zone:'Prism Ocean',color:'#19718a',accent:'#a3fff3',desc:'Take the sea route through towering glass-blue clouds. Steal an energy core from the enemy resupply wing.',duration:34,extra:'Two paths lie ahead. A mirage shimmers over the water.'},
 {name:'Iron Tempest',zone:'Obsidian Peaks',color:'#6d3859',accent:'#ff9bc6',desc:'Take the mountain route and face the steel aces of the storm fleet. Victory can open a risky shortcut.',duration:35,extra:'The ridge is guarded by the feared ace squadron, the Iron Talons.'},
 {name:'Mirage Crossing',zone:'Sunfire Flats',color:'#a16b3a',accent:'#ffe69a',desc:'Follow the desert mirage to recover a lost flight recorder containing Omega’s secret weakness.',duration:35,extra:'The sky reflects a hundred impossible suns. One path is real.'},
 {name:'The Hidden Hangar',zone:'Underground Airbase',color:'#346558',accent:'#afffc4',desc:'Enter the concealed hangar to prepare for the final campaign. The sentinel IRON ORACLE protects its launch codes.',duration:37,boss:'IRON ORACLE',extra:'The old maps lead here. Behind the hangar door is the route to the final five missions.'},
 {name:'The Last Signal',zone:'Aurora Reach',color:'#275b85',accent:'#a9ecff',desc:'The final five-level campaign begins. Reassemble the alliance’s fleet before the Omega command system gains control.',duration:21,extra:'METEOR FIELD: recover three beacons among asteroids, then unlock Dawn Accord and the second preparation route.'},
 {name:'Three Destinies',zone:'Crossroads of Stars',color:'#484886',accent:'#d4c6ff',desc:'Fight to the Celestial Junction and choose one of three different final air routes. Each leads to a different battle and ending.',duration:22,boss:'TRIAD SENTINEL',extra:'OBJECTIVE: Shoot down three planetary shield relays. This unlocks Stormbreak. Recover signal beacons on Mission 16 as well to access Black Star.'},
 {name:'Dawn Accord',zone:'Golden Dawn Route',color:'#91653f',accent:'#ffe5a0',desc:'ENDING A: Face NEXUS OMEGA in the dawn light and free the captive squadrons. Win a peaceful united-skies ending.',duration:23,boss:'NEXUS OMEGA · DAWN',ending:'dawn',extra:'OBJECTIVE: Rescue three escape pods before taking down Omega’s giant carrier fighter. Fly directly through the pods to save the pilots.'},
 {name:'Stormbreak',zone:'Thunderstorm Route',color:'#3a5985',accent:'#b4ddff',desc:'ENDING B: Chase NEXUS OMEGA into a superstorm and defeat its storm crown to end the war with a thunderous victory.',duration:24,boss:'NEXUS OMEGA · STORM',ending:'storm',extra:'OBJECTIVE: Destroy three lightning towers on the planet before battling Omega’s towering storm robot.'},
 {name:'Black Star',zone:'Void Route',color:'#493050',accent:'#ff98d8',desc:'ENDING C: Dive into Omega’s black star fortress and challenge the strongest version of the BOSS OF BOSSES.',duration:26,boss:'NEXUS OMEGA · VOID',ending:'void',extra:'METEOR FIELD: shatter three reactor locks while navigating the black-star debris cloud. Then defeat Omega’s ultimate robot.'}
];
// Mission routes are directed. Completing a parent opens its child, never all later nodes.
const routes={1:[2],2:[3],3:[4],4:[5],5:[6],6:[7],7:[8],8:[9],9:[10],10:[11],11:[12,13],12:[14],13:[14,15],14:[15],15:[16,17],16:[17,18,19,20],17:[16,18,19,20],18:[],19:[],20:[]};
// Five branching campaign missions. Objectives grant route keys, not merely elapsed time.
const campaignGoals={16:{kind:'beacon',label:'COLLECT SIGNAL BEACONS',target:3,unlock:'DAWN ACCORD'},17:{kind:'relay',label:'DESTROY PLANET RELAYS',target:3,unlock:'STORMBREAK'},18:{kind:'rescue',label:'RESCUE ESCAPE PODS',target:3},19:{kind:'tower',label:'DESTROY STORM TOWERS',target:3},20:{kind:'reactor',label:'BREAK REACTOR LOCKS',target:3}};
const specialTargets=new Set(['relay','tower','reactor']);
const mapPositions={
  1:[4.8,59],2:[10.3,37],3:[15.7,21],4:[21.3,37],5:[26.8,63],
  6:[32.3,78],7:[37.8,55],8:[43.2,32],9:[48.8,20],10:[54.3,39],
  11:[59.8,58],12:[65.5,33],13:[65.6,81],14:[71,32],15:[72.5,79],
  16:[79.2,58],17:[85,55],18:[93,17],19:[93,49],20:[93,82]
};
const meteorLevels=new Set([7,8,9,15,19]); // Missions 8, 9, 10, 16 and 20
const worldTypes=['ocean','desert','storm','jungle','ice','lava','city','orbit','orbit','space','ocean','ice','storm','desert','station','orbit','storm','ocean','storm','void'];
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
if(!saved.routeKeys||typeof saved.routeKeys!=='object')saved.routeKeys={};
if(!saved.checkpoints||typeof saved.checkpoints!=='object')saved.checkpoints={};
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
// Original, procedurally synthesized soundtrack. No external audio or copyrighted samples.
let musicTime=0,musicStep=0,commsTimer=0,lastRadio=-100,commsQueue=[],radioText='',radioSource='';
function makeSound(){if(!soundOn)return null;try{soundCtx=soundCtx||new(window.AudioContext||window.webkitAudioContext)();if(soundCtx.state==='suspended')soundCtx.resume().catch(()=>{});return soundCtx}catch(e){return null}}
function note(freq,duration=.12,vol=.018,type='triangle',at=null,endFreq=null){const c=makeSound();if(!c)return;const when=at??c.currentTime;try{const o=c.createOscillator(),a=c.createGain();o.type=type;o.frequency.setValueAtTime(Math.max(32,freq),when);if(endFreq)o.frequency.exponentialRampToValueAtTime(Math.max(32,endFreq),when+duration);a.gain.setValueAtTime(.0001,when);a.gain.exponentialRampToValueAtTime(vol,when+.012);a.gain.exponentialRampToValueAtTime(.0001,when+duration);o.connect(a);a.connect(c.destination);o.start(when);o.stop(when+duration+.025)}catch(e){}}
function noiseBurst(dur=.20,vol=.026,filterFreq=450){const c=makeSound();if(!c)return;try{const samples=Math.max(64,Math.floor(c.sampleRate*dur)),buf=c.createBuffer(1,samples,c.sampleRate),data=buf.getChannelData(0);for(let i=0;i<samples;i++)data[i]=(Math.random()*2-1)*(1-i/samples);const src=c.createBufferSource(),filter=c.createBiquadFilter(),gain=c.createGain();src.buffer=buf;filter.type='lowpass';filter.frequency.value=filterFreq;gain.gain.setValueAtTime(vol,c.currentTime);gain.gain.exponentialRampToValueAtTime(.0001,c.currentTime+dur);src.connect(filter);filter.connect(gain);gain.connect(c.destination);src.start();src.stop(c.currentTime+dur)}catch(e){}}
function fx(kind){if(!soundOn)return;switch(kind){
 case 'laser':note(880,.09,.013,'sawtooth',null,220);break;
 case 'missile':note(120,.39,.07,'sawtooth',null,55);noiseBurst(.43,.052,780);break;
 case 'enemy':note(270,.13,.023,'square',null,150);break;
 case 'boss':note(64,.46,.075,'sawtooth',null,35);noiseBurst(.35,.065,240);break;
 case 'allied':note(600,.12,.008,'triangle',null,380);break;
 case 'checkpoint':note(420,.18,.04,'sine');note(635,.23,.037,'triangle',makeSound()?.currentTime+.16);note(880,.24,.04,'sine',makeSound()?.currentTime+.34);break;
 case 'comms':note(890,.07,.03,'sine');note(710,.07,.02,'sine',makeSound()?.currentTime+.10);break;
 }}
const melodies={planet:[0,3,7,10,7,3,5,2],space:[0,5,7,12,10,7,3,5],boss:[0,1,5,1,7,5,3,1]};
function musicTick(){if(!soundOn||!['play','scene'].includes(screen)){musicTime=0;return}const c=makeSound();if(!c||c.state!=='running')return;const mode=game?.boss&&screen==='play'?'boss':game&&['orbit','space','void','station'].includes(worldTypes[game.index])?'space':'planet';const interval=mode==='boss'?.23:.29;if(!musicTime||musicTime<c.currentTime-.25){musicTime=c.currentTime+.045;musicStep=0}let iterations=0;while(musicTime<c.currentTime+.16&&iterations++<3){const seq=melodies[mode],n=musicStep%8,root=mode==='boss'?98:mode==='space'?110:131;const pitch=root*Math.pow(2,seq[n]/12);note(pitch*2,.16,.012,'triangle',musicTime);if(n%2===0)note(root/2,.22,.017,'sine',musicTime);if(n===0||n===4)note(root/4,.20,.028,'triangle',musicTime);musicTime+=interval;musicStep++}}
function radio(from,message,important=false){if(screen!=='play'&&!important)return;if(!important&&game&&game.elapsed-lastRadio<3)return;if(important){commsQueue=[];}else if(commsTimer>1){commsQueue.push({from,message});if(commsQueue.length>3)commsQueue.shift();return}
 radioSource=from;radioText=message;commsTimer=4.5;lastRadio=game?.elapsed||0;$('commsSource').textContent='◉ '+from.toUpperCase()+' · LIVE RADIO';$('commsText').textContent=message;$('commsBox').classList.add('visible');fx('comms');
 // Spoken radio dialogue is optional and subject to the browser's speech support.
 if(soundOn&&'speechSynthesis' in window&&typeof SpeechSynthesisUtterance!=='undefined'){try{speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(message);u.rate=1.15;u.pitch=from.includes('ENEMY')?.64:from.includes('COMMAND')?.86:1.16;u.volume=.58;speechSynthesis.speak(u)}catch(e){}}
}
function radioTick(dt){if(commsTimer<=0)return;commsTimer-=dt;if(commsTimer<=0){$('commsBox').classList.remove('visible');if(commsQueue.length&&screen==='play'){const m=commsQueue.shift();radio(m.from,m.message,true)}}}
function checkpoint(stage,force=false){if(!game||game.done||(!force&&game.checkpointStage>=stage))return;const g=game;g.checkpointStage=stage;const snapshot={index:g.index,stage,elapsed:g.elapsed,score:g.score,hp:Math.max(45,Math.round(g.hp)),missiles:Math.max(1,g.missiles),kills:g.kills,waveNum:g.waveNum,objective:g.objective?{count:g.objective.count,spawned:g.objective.spawned}:null,bossSpawned:g.bossSpawned,boss:g.boss?{...g.boss,hp:g.boss.maxHp}:null,shield:g.shield,rapid:g.rapid,spread:g.spread,overdrive:g.overdrive};saved.checkpoints[g.index+1]=snapshot;save();fx('checkpoint');toast('◈ CHECKPOINT '+stage+' SAVED');radio('FLIGHT COMMAND','Checkpoint '+stage+' secured. Your mission progress is saved.',true);updateHud()}
function resumeCheckpoint(g){const s=saved.checkpoints[g.index+1];if(!s||s.index!==g.index||!Number.isFinite(s.elapsed)||s.stage<1)return false;
 g.elapsed=clamp(s.elapsed,0,levels[g.index].duration+1);g.score=s.score||0;g.hp=clamp(s.hp||60,45,100);g.missiles=Math.max(1,s.missiles||1);g.kills=s.kills||0;g.waveNum=s.waveNum||0;g.spawnTimer=1.7;g.pickupTimer=2.5;g.checkpointStage=s.stage;g.shield=s.shield||0;g.rapid=s.rapid||0;g.spread=s.spread||0;g.overdrive=s.overdrive||0;g.player.invul=2.5;
 if(g.objective&&s.objective){g.objective.count=clamp(s.objective.count||0,0,g.objective.target);g.objective.spawned=s.objective.spawned||g.objective.count;g.objective.spawnCD=1.2}
 if(s.bossSpawned&&s.boss){g.bossSpawned=true;g.boss={...s.boss,time:0,fire:1.5};g.elapsed=Math.max(g.elapsed,levels[g.index].duration+.1)}
 return true}

function toast(msg){$('toast').textContent=msg;$('toast').classList.add('on');toaster=2.2;}
function setScreen(s){screen=s;for(let k of Object.keys(OVERLAYS))$(OVERLAYS[k]).classList.remove('show');if(OVERLAYS[s])$(OVERLAYS[s]).classList.add('show');$('hud').classList.toggle('visible',s==='play');$('touchControls').classList.toggle('playing',s==='play');$('orientationHint').classList.toggle('playing',s==='play');$('pauseBtn').style.display=(s==='play'||s==='pause')?'':'none';$('pauseBtn').textContent=s==='pause'?'▶ RESUME':'Ⅱ PAUSE';$('objectiveHud').style.display=(s==='play'&&game?.objective)?'block':'none';if(s!=='play')$('commsBox').classList.remove('visible');else if(commsTimer>0)$('commsBox').classList.add('visible');if(s==='scene')$('toast').classList.remove('on');}
function isAvailable(mission){
  if(mission===1||saved.completed.includes(mission))return true;
  if(mission===18)return Boolean(saved.routeKeys.beacon);
  if(mission===19)return Boolean(saved.routeKeys.relay);
  if(mission===20)return Boolean(saved.routeKeys.beacon&&saved.routeKeys.relay);
  if(mission===16||mission===17)return saved.completed.includes(15)||saved.completed.includes(mission===16?17:16);
  if(mission<=10&&mission<=saved.unlocked)return true; // original save support
  return Object.entries(routes).some(([from,targets])=>targets.includes(mission)&&saved.completed.includes(Number(from)));
}
function makeMap(){
  $('mapTitle').textContent='THE SOLAR SYSTEM · 20 MISSIONS';
  $('chapterTabs').style.display='none';
  $('mapHint').textContent='FINAL CAMPAIGN: 16 collect 3 beacons → unlock Dawn. 17 destroy 3 relays → unlock Storm. Complete both → unlock secret Black Star. Each finale has its own objective and giant boss. Tap or drag the chart.';
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
    const goal=campaignGoals[id];
    b.title=`Mission ${id}: ${lev.name}${goal?' · '+goal.label+' (0/'+goal.target+')':''}${lev.boss?' · GIANT BOSS':''}${!available&&id>=18?' · NEED ROUTE OBJECTIVES':''}`;
    b.setAttribute('aria-label',b.title+(!available?' · LOCKED':''));
    b.innerHTML=`<span class="planetNumber">${done?'✓':id}</span><span class="planetLabel">${lev.name}</span>${id>=16?'<span class="planetBoss">'+(id===16?'3 BEACONS':id===17?'3 RELAYS':id===18?'3 RESCUES':id===19?'3 TOWERS':'3 LOCKS')+'</span>':lev.boss?'<span class="planetBoss">BOSS</span>':''}`;
    b.disabled=!available;b.onclick=()=>openMission(id-1);$('mapWorld').appendChild(b);
  });
  // Start near the first orbital waypoints, but don't reset scroll on every visit.
  if(!$('mapWorld').dataset.visited){$('levelMap').scrollLeft=0;$('mapWorld').dataset.visited='true';}
}
function openMap(chapter){makeMap();setScreen('map');}
function openMission(i){
 if(!isAvailable(i+1))return;selected=i;const l=levels[i];
 showScene({kind:'approach',mission:i, title:`MISSION ${String(i+1).padStart(2,'0')} · ${l.name.toUpperCase()}`,
  text:l.desc+' '+l.extra, kicker:`FLIGHT APPROACH · ${l.zone.toUpperCase()}`,
  beats:['The squadron approaches '+l.zone+'.','Wing pilots break formation and scout ahead.','Your fighter dives toward the mission zone.'],
  duration:7.2,next:()=>startLevel(i)});
}
function showScene(s){
 scene={kind:'approach',mission:selected,duration:6.5,elapsed:0,...s};sceneEnd=0;
 setScreen('scene');$('sceneTitle').textContent=scene.title;
 $('sceneText').textContent=scene.text;$('sceneKicker').textContent=scene.kicker||'CINEMATIC • WATCH ONLY';
 $('sceneProgress').style.width='0';
 audio(scene.kind==='bossWake'?100:scene.kind==='bossBreak'?185:440,.25,'triangle',.06,.6);
}
function skipScene(){if(screen!=='scene'||!scene)return;let n=scene.next;scene=null;sceneEnd=0; if(n)n();}
function newGame(i){return{objective:campaignGoals[i+1]?{...campaignGoals[i+1],count:0,spawnCD:3,spawned:0}:null,groundTargets:[],index:i,score:0,hp:100,shield:0,rapid:0,spread:0,overdrive:0,wingman:0,wingCD:0,allies:[{id:'ALPHA-2',x:80,y:245,hp:7,fire:0.4},{id:'ALPHA-3',x:90,y:355,hp:7,fire:1.0}],fleetCD:0,checkpointStage:0,missiles:2,meteors:[],meteorTimer:1.8,elapsed:0,spawnTimer:1,pickupTimer:4,fireCD:0,boss:null,bossSpawned:false,player:{x:150,y:300,r:18,invul:1.7},enemies:[],shots:[],foeShots:[],pickups:[],particles:[],explosions:[],kills:0,combo:0,comboTimer:0,done:false,waveNum:0};}
function startLevel(i,restartFresh=false){game=newGame(i);controls.aim=null;selected=i;flash=.18;const resumed=!restartFresh&&resumeCheckpoint(game);toast(resumed?'◈ RESUMING CHECKPOINT '+game.checkpointStage:meteorLevels.has(i)?'☄ METEOR FIELD · DODGE OR DESTROY':'MISSION '+(i+1)+': '+levels[i].name.toUpperCase());setScreen('play');updateHud();radio('FLIGHT COMMAND',resumed?'Welcome back, pilot. Rejoining from your last checkpoint.':'Skyfire One, launch authorized. Friendly Alpha squadron is flying with you.',true);}
function updateHud(){if(!game)return;
 const ob=$('objectiveHud'),g=game.objective;
 ob.style.display=g?'block':'none';if(g)$('objectiveText').textContent=g.label+'  '+g.count+'/'+g.target+(g.count===g.target?'  ✓ COMPLETE':'');$('hpNum').textContent=Math.max(0,Math.ceil(game.hp))+'%';$('hpFill').style.width=clamp(game.hp,0,100)+'%';$('shieldStatus').textContent=[game.shield>0?'◆ SHIELD':'',game.rapid>0?'⚡ RAPID':'',game.spread>0?'✦ TRIPLE':'',game.overdrive>0?'🔥 OVERDRIVE':'',game.wingman>0?'✈ WINGMAN':''].filter(Boolean).slice(0,2).join(' · ');$('hudLevel').textContent=String(game.index+1).padStart(2,'0')+' / 20';$('scoreNum').textContent=game.score.toLocaleString();$('missileNum').textContent=game.missiles;$('threatNum').textContent=Math.round(Math.min(100,100*game.elapsed/levels[game.index].duration))+'%';$('checkpointTag').textContent=game.checkpointStage?'◈ CHECKPOINT '+game.checkpointStage+' SAVED':'◇ NEXT CHECKPOINT '+Math.round(levels[game.index].duration*.38)+'s';}
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
  showScene({kind:'ending',mission:i,title:script.title,text:script.body,kicker:'FINAL CINEMATIC · WATCH ONLY · SKIPPABLE',duration:10,
  next:()=>showEnd('finish',script.label,`The Boss of Bosses has fallen. You unlocked ${saved.endings.length} of 3 finales. Final score: ${game.score.toLocaleString()}. Replay from the mission map to discover the others.`, 'EXPLORE OTHER ENDINGS',()=>openMap(1),'★ ★ ★ ★ ★')});
}
function cleared(){
  if(!game||game.done)return;if(game.objective&&game.objective.count<game.objective.target)return;game.done=true;const i=game.index,id=i+1,lev=levels[i];
  const bonus=Math.round(game.hp)*30+game.missiles*150;game.score+=bonus;
  if(id<=10)saved.unlocked=Math.max(saved.unlocked,Math.min(10,id+1));
  if(game.objective&&game.objective.count<game.objective.target)return;
  if(!saved.completed.includes(id))saved.completed.push(id);
  if(id===16)saved.routeKeys.beacon=true;
  if(id===17)saved.routeKeys.relay=true;
  if(lev.ending&&!saved.endings.includes(lev.ending))saved.endings.push(lev.ending);
  delete saved.checkpoints[id];saved.bestScore=Math.max(saved.bestScore,game.score);save();audio(650,.22,'sine',.07,1.7);
  const nextIds=routes[id]||[];
  const next=()=>{
    if(lev.ending){finishEnding(i);return;}
    if(id===10){showScene({kind:'chapter',mission:i,title:'A SIGNAL BEYOND THE SUNRISE',
 text:'Atlas Prime has fallen, but a hidden fleet has split the horizon into rival air routes.',
 beats:['Your formation leaves the ruined fortress.','A mysterious signal reveals ten undiscovered worlds.','The new campaign opens. Choose your next destination.'],
 kicker:'NEW CHAPTER · WATCH ONLY',duration:7.2,next:()=>openMission(10)});return;}
    if(nextIds.length>1){
 const options=nextIds.filter(isAvailable);
 showScene({kind:'branch',mission:i,options,title:'NEW FLIGHT PATHS UNLOCKED',
 text:'The orbital navigation computer projects new routes. Choose your next mission.',
 beats:['Your pilots reach a fork in the star routes.','The navigation officer illuminates earned destinations.','Choose a highlighted planet on the mission map.'],
 kicker:'BRANCHING STORY · WATCH ONLY',duration:6.5,next:()=>openMap()});return;
}
    if(!nextIds.length){openMap(id>=11?1:0);return;}
    if(lev.boss){
 showScene({kind:'departure',mission:i,title:'THE GUARDIAN HAS FALLEN',
 text:`${lev.boss} has been defeated. Your wingmen regroup and set course for ${levels[nextIds[0]-1].zone}.`,
 beats:['The wreckage fades behind the squadron.','Your wingmen sweep in to join formation.','A new planet appears on the horizon.'],
 kicker:'AFTER THE BATTLE · WATCH ONLY',duration:5.2,next:()=>openMission(nextIds[0]-1)});return;
}
    showScene({kind:'departure',mission:i,title:'MISSION SECURED · NEXT DESTINATION',
 text:`Your squadron departs ${lev.zone} for ${levels[nextIds[0]-1].zone}.`,
 beats:['Your fighter climbs away from the cleared battlefield.','Wingmen join your formation.','The next planet comes into view.'],
 kicker:'BETWEEN MISSIONS · WATCH ONLY',duration:4.7,next:()=>openMission(nextIds[0]-1)});
  };
  const title=lev.ending?'THE BOSS OF BOSSES FALLS':id===10?'THE STORY CONTINUES':'SKY SECURED';
  const message=`Mission ${id} cleared · ${game.objective?'Objective '+game.objective.count+'/'+game.objective.target+' completed · ':''}${game.kills} enemy fighters destroyed · +${bonus.toLocaleString()} survival bonus. ${lev.ending?'You reached one of the three endings!':nextIds.length>1?'New branching routes unlocked. Choose where to fly next!':id===10?'The Fractured Horizon campaign is unlocked!':'Your next mission is ready.'}`;
  showEnd('clear',title,message,lev.ending?'WATCH YOUR ENDING »':nextIds.length>1?'VIEW BRANCHING MAP »':'CONTINUE »',next,game.hp>70?'✦ ✦ ✦':game.hp>35?'✦ ✦ ☆':'✦ ☆ ☆');
  showRouteChoices(i);
}
function playerDown(){if(screen!=='play'||!game)return;const p=game.player;if(p.invul>0||game.shield>0)return;game.hp-=18+Math.min(game.index,12)*.55;p.invul=1.1;flash=.28;shake=10;audio(90,.27,'sawtooth',.11,.4);sparks(p.x,p.y,20,'#ff707b',5);if(game.hp<=0){game.hp=0;showEnd('gameover','JET DOWN',`You reached Mission ${game.index+1}. ${game.kills} enemy fighters were defeated. Give it another try.`, saved.checkpoints[game.index+1]?'↻ RETURN TO CHECKPOINT':'↻ RETRY MISSION',()=>startLevel(game.index),'✕ ✕ ✕');if(saved.checkpoints[game.index+1]){const wrap=$('routeChoices');const b=document.createElement('button');b.className='routePick';b.textContent='↻ RESTART WHOLE MISSION';b.onclick=()=>{delete saved.checkpoints[game.index+1];save();startLevel(game.index,true)};wrap.append(b);wrap.classList.add('show')}}}
function sparks(x,y,n,color,speed=1){if(!game)return;for(let j=0;j<n;j++){let a=rand(0,TAU),s=rand(40,260)*speed;game.particles.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,life:rand(.2,.8),max:1,r:rand(1.5,4.3),color});}}
function boom(x,y,big=false,color='#ffb36e'){sparks(x,y,big?42:15,color,big?1.6:1);game.explosions.push({x,y,r:big?60:29,t:0,life:big?.75:.37});shake=Math.max(shake,big?9:2);audio(big?80:140,big?.48:.18,'sawtooth',big?.095:.045,.15);}
function spawnEnemy(type,yy,xx){const hp=type==='bomber'?9:type==='ace'?5:3;let e={type,x:xx||W+45,y:yy||rand(85,H-65),anchor:yy||300,r:type==='bomber'?25:type==='ace'?19:15,hp:hp+Math.floor(Math.min(game.index,15)/4),maxHp:hp+Math.floor(Math.min(game.index,15)/4),vx:type==='ace'?rand(-270,-230):type==='bomber'?rand(-115,-95):rand(-205,-152),phase:rand(0,TAU),fire:rand(.65,2.0),time:0,points:type==='bomber'?450:type==='ace'?300:150};game.enemies.push(e);}
function launchWave(){const g=game;g.waveNum++;const count=(g.waveNum%4===0?4:g.waveNum%3===0?3:2);const type=g.waveNum%5===0?'bomber':g.waveNum%3===0?'ace':'fighter';const y=rand(120,H-130);for(let i=0;i<count;i++)spawnEnemy(type,clamp(y+(i-(count-1)/2)*51,80,H-65),W+65+i*73);if(g.waveNum%4===1&&g.index>2)spawnEnemy('ace',rand(80,H-60),W+300);if(g.waveNum%4===1)radio('FLIGHT COMMAND','Enemy fighters approaching from ahead. Alpha squadron, engage!');}
function spawnPickup(x=W+30,y=rand(100,H-90)){const types=['heal','shield','rapid','missile','spread','points'];let type=types[Math.floor(rand(0,types.length))];if(game.index>=10&&Math.random()<.24)type=['overdrive','wingman','nova'][Math.floor(rand(0,3))];if(game.hp<38&&Math.random()<.52)type='heal';game.pickups.push({x,y,type,r:17,phase:rand(0,TAU)});}
function collect(item){const g=game;
 if(['beacon','rescue'].includes(item.type)&&g.objective?.kind===item.type){
   g.objective.count=Math.min(g.objective.target,g.objective.count+1);g.score+=850;
   radio('ALPHA-2',item.type==='rescue'?'Rescue confirmed. Pod secured!':'Beacon data uploaded to the fleet.',true);toast(item.type==='rescue'?'✚ PILOT RESCUED! '+g.objective.count+'/3':'📡 SIGNAL BEACON '+g.objective.count+'/3');audio(850,.2,'sine',.06,1.6);sparks(item.x,item.y,18,'#a9ffd6');updateHud();return;
 }
 switch(item.type){case 'heal':g.hp=Math.min(100,g.hp+30);toast('♥ HULL REPAIRED +30');break;case 'shield':g.shield=8;toast('◆ ENERGY SHIELD ACTIVE');break;case 'rapid':g.rapid=10;toast('⚡ RAPID FIRE UNLOCKED');break;case 'spread':g.spread=11;toast('✦ TRIPLE SHOT ACTIVE');break;case 'missile':g.missiles+=2;toast('🚀 TWO MISSILES COLLECTED');break;case 'points':g.score+=750;toast('★ BONUS 750 POINTS');break;case 'overdrive':g.overdrive=12;toast('🔥 OVERDRIVE LASERS ACTIVE');break;case 'wingman':g.wingman=12;toast('✈ ALLIED WINGMAN SUPPORT');break;case 'nova':g.foeShots=[];for(const e of g.enemies){e.hp=0;boom(e.x,e.y);}g.enemies=[];if(g.boss){g.boss.hp=Math.max(1,g.boss.hp-45);sparks(g.boss.x,g.boss.y,40,'#fff3ae',2);}g.score+=500;toast('☀ NOVA BLAST · SKY CLEARED');break;}audio(750,.2,'sine',.07,1.65);sparks(item.x,item.y,15,'#96ffe5');}
function shoot(){const g=game;if(!g)return;const p=g.player;const sy=g.spread>0?[-95,0,95]:[0];for(let vy of sy)g.shots.push({x:p.x+22,y:p.y,vx:780,vy,damage:g.overdrive>0?3.5:2.2,r:4.5,kind:'laser'});g.fireCD=g.rapid>0?.11:.185;fx('laser');}
function missile(){if(screen!=='play'||!game||game.missiles<1)return;game.missiles--;const p=game.player;game.shots.push({x:p.x+15,y:p.y,vx:520,vy:0,damage:22,r:9,kind:'missile',life:2.8});toast('🚀 MISSILE LAUNCHED');fx('missile');radio('ALPHA-2','Missile away! Tracking hostile target.');}
function spawnBoss(){const g=game,lev=levels[g.index];g.bossSpawned=true;g.enemies=[];g.foeShots=[];const final=!!lev.ending,bossHp=final?({dawn:260,storm:330,void:400}[lev.ending]):85+g.index*20;g.boss={name:lev.boss,x:W+130,y:H*.5,r:final?80:75,hp:bossHp,maxHp:bossHp,time:0,fire:1.15,phase:0,form:lev.ending||'standard',type:[14,16,18,19].includes(g.index)?'planetRobot':'carrier',volley:0};checkpoint(3,true);fx('boss');radio('FLIGHT COMMAND','Critical threat! Giant enemy boss powering up!',true);showScene({kind:'bossWake',mission:g.index,boss:{...g.boss},title:lev.boss+' AWAKENS',
 text:`WARNING: ${g.boss.type==='planetRobot'?'Planetary war robot':'Giant carrier fighter'} powering up.`,
 beats:['A giant silhouette rises from the darkness.','Armor plates unfold. Its core begins to glow.','The boss locks onto your fighter. Prepare to fight!'],
 kicker:'BOSS AWAKENING · WATCH ONLY',duration:6.2,
 next:()=>{setScreen('play');toast('⚠ BOSS BATTLE: '+lev.boss);radio('ENEMY COMMANDER','You will not pass through our sector, Skyfire!',true);}});audio(110,.7,'sawtooth',.07,.45);}
function killEnemy(e){let g=game;g.score+=e.points;g.kills++;g.combo++;g.comboTimer=4;boom(e.x,e.y,e.type==='bomber');if(Math.random()<.10)spawnPickup(e.x,e.y);if(g.kills===3)radio('ALPHA-3','Three hostiles down. We have your six!');}
function spawnObjective(){
 const g=game,o=g?.objective;if(!o||o.count>=o.target)return;
 if(['beacon','rescue'].includes(o.kind)){
   if(g.pickups.some(p=>p.type===o.kind))return;
   const y=clamp(g.player.y+rand(-140,140),80,H-75);
   g.pickups.push({x:790,y,type:o.kind,r:29,phase:0,goal:true});
 }else{
   if(g.groundTargets.length)return;
   const type=o.kind;
   g.groundTargets.push({type,x:835,y:clamp(g.player.y+rand(-55,55),110,H-100),r:44,hp:type==='reactor'?19:13,maxHp:type==='reactor'?19:13,fire:1.7,phase:0});
 }
 o.spawned++;
}
function completeObjectiveTarget(t){
 if(!game?.objective||t.dead)return;
 t.dead=true;game.objective.count=Math.min(game.objective.target,game.objective.count+1);game.score+=900;
 boom(t.x,t.y,true,t.type==='tower'?'#97ebff':'#ffb17e');toast('⚙ '+game.objective.label+'  '+game.objective.count+'/3');radio('FLIGHT COMMAND','Target neutralized. Objective '+game.objective.count+' of three complete.',true);updateHud();
}
function tick(dt){musicTick();radioTick(dt);worldTime+=dt;flash=Math.max(0,flash-dt);shake=Math.max(0,shake-35*dt);if(toaster>0){toaster-=dt;if(toaster<=0)$('toast').classList.remove('on');}if(screen==='scene'){
 if(!scene)return;scene.elapsed+=dt;let f=clamp(scene.elapsed/scene.duration,0,1);
 $('sceneProgress').style.width=(f*100).toFixed(1)+'%';
 if(scene.beats?.length){const stage=Math.min(scene.beats.length-1,Math.floor(f*scene.beats.length));
  if(scene.lastBeat!==stage){scene.lastBeat=stage;$('sceneText').textContent=scene.beats[stage];}}
 if(f>=1)skipScene();return;
}
if(screen!=='play'||!game)return;const g=game,p=g.player,l=levels[g.index];g.elapsed+=dt;if(!g.bossSpawned){if(g.elapsed>=l.duration*.38&&g.checkpointStage<1)checkpoint(1);if(g.elapsed>=l.duration*.74&&g.checkpointStage<2)checkpoint(2);}p.invul=Math.max(0,p.invul-dt);g.shield=Math.max(0,g.shield-dt);g.rapid=Math.max(0,g.rapid-dt);g.spread=Math.max(0,g.spread-dt);g.overdrive=Math.max(0,g.overdrive-dt);g.wingman=Math.max(0,g.wingman-dt);g.wingCD=Math.max(0,g.wingCD-dt);g.comboTimer=Math.max(0,g.comboTimer-dt);g.fireCD=Math.max(0,g.fireCD-dt);
let my=(controls.keys.has('ArrowRight')||controls.keys.has('d')?1:0)-(controls.keys.has('ArrowLeft')||controls.keys.has('a')?1:0),mx=(controls.keys.has('ArrowUp')||controls.keys.has('w')?1:0)-(controls.keys.has('ArrowDown')||controls.keys.has('s')?1:0);const len=Math.hypot(mx,my)||1;p.x+=mx/len*380*dt;p.y+=my/len*380*dt;if(controls.aim){p.x+=(controls.aim.x-p.x)*Math.min(1,dt*10);p.y+=(controls.aim.y-p.y)*Math.min(1,dt*10);}p.x=clamp(p.x,50,630);p.y=clamp(p.y,54,H-50);
if(g.fireCD<=0)shoot();
// Friendly fleet fights alongside the player and can intercept enemy fire.
for(let j=0;j<g.allies.length;j++){const a=g.allies[j];if(a.hp<=0)continue;const tx=clamp(p.x-47-j*25,50,590),ty=clamp(p.y+(j===0?-100:100)+Math.sin(g.elapsed*1.9+j)*18,54,H-50);a.x+=(tx-a.x)*Math.min(1,dt*3.2);a.y+=(ty-a.y)*Math.min(1,dt*3.2);a.fire-=dt;if(a.fire<=0){g.shots.push({x:a.x+17,y:a.y,vx:730,vy:0,damage:1.5,r:4,kind:'ally'});a.fire=1.05+j*.17;fx('allied')}}
if(g.wingman>0&&g.wingCD<=0){g.shots.push({x:p.x-20,y:p.y-29,vx:780,vy:-65,damage:2.2,r:5,kind:'laser'});g.shots.push({x:p.x-20,y:p.y+29,vx:780,vy:65,damage:2.2,r:5,kind:'laser'});g.wingCD=.30;}if(controls.keys.has('x')||controls.keys.has('X')){if(!controls.missileHeld){missile();controls.missileHeld=true;}}else controls.missileHeld=false;
if(meteorLevels.has(g.index)){
 g.meteorTimer-=dt;
 if(g.meteorTimer<=0&&!g.boss){const y=rand(70,H-70);g.meteors.push({x:W+rand(10,130),y,r:rand(17,34),hp:6,vx:-rand(130,225),rotation:rand(0,TAU),spin:rand(-1.3,1.3),seed:Math.floor(rand(0,1000))});g.meteorTimer=rand(1.3,2.8);}
 for(const a of g.meteors){a.x+=a.vx*dt;a.rotation+=a.spin*dt;if(dist(a,p)<a.r*.74+p.r&&p.invul<=0){a.dead=true;boom(a.x,a.y,false,'#edc4aa');playerDown();}}
 g.meteors=g.meteors.filter(a=>!a.dead&&a.x>-60);
}
if(g.objective&&g.objective.count<g.objective.target){g.objective.spawnCD-=dt;if(g.objective.spawnCD<=0){spawnObjective();g.objective.spawnCD=4.2;}}
if(!g.bossSpawned){g.spawnTimer-=dt;g.pickupTimer-=dt;if(g.spawnTimer<=0&&g.elapsed<l.duration-1){launchWave();g.spawnTimer=Math.max(.95,2.1-g.index*.052)+rand(-.25,.45);}if(g.pickupTimer<=0){spawnPickup();g.pickupTimer=5.1+rand(0,2.5);}if(g.elapsed>l.duration&&(!g.objective||g.objective.count>=g.objective.target)){if(l.boss)spawnBoss();else {cleared();return;}}}
for(const e of g.enemies){e.time+=dt;e.x+=e.vx*dt;e.y+=Math.sin(e.time*3.4+e.phase)*28*dt+(e.type==='ace'?Math.sin(e.time*1.9+e.phase)*35*dt:0);e.fire-=dt;if(e.fire<=0&&e.x<W-30&&e.x>370){const vy=clamp((p.y-e.y)*.34,-160,160);g.foeShots.push({x:e.x-15,y:e.y,vx:-260-Math.min(g.index,14)*9,vy,r:5,damage:1});e.fire=rand(1.3,2.6);fx('enemy');}if(dist(e,p)<e.r+p.r&&p.invul<=0){playerDown();e.hp-=2;}}
g.enemies=g.enemies.filter(e=>e.hp>0&&e.x>-55);
for(const t of g.groundTargets){t.x-=52*dt;t.phase+=dt;t.fire-=dt;if(t.fire<=0&&t.x<W-50){g.foeShots.push({x:t.x-30,y:t.y,vx:-220,vy:clamp((p.y-t.y)*.26,-110,110),r:6,damage:1});t.fire=2.2;}if(t.x<100)t.dead=true;}
g.groundTargets=g.groundTargets.filter(t=>!t.dead);
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
  fx('boss');if(b.volley===2)radio('ENEMY BOSS','You cannot outrun our weapons.');
}if(dist(b,p)<b.r+p.r&&p.invul<=0)playerDown();}
for(const s of g.shots){s.x+=s.vx*dt;s.y+=s.vy*dt;if(s.kind==='missile'){s.life-=dt;const targets=[...g.enemies,...g.groundTargets];if(g.boss)targets.push(g.boss);const target=targets.filter(t=>t.x>s.x-120).sort((a,b)=>dist(s,a)-dist(s,b))[0];if(target){const turn=Math.atan2(target.y-s.y,target.x-s.x);s.vx=Math.cos(turn)*540;s.vy=Math.sin(turn)*540;}}if(s.x>W+40||s.y<-40||s.y>H+40||s.life<0)s.dead=true;for(const e of g.enemies){if(!s.dead&&dist(s,e)<e.r+s.r){e.hp-=s.damage;s.dead=true;if(s.kind==='missile')boom(s.x,s.y,true);else sparks(s.x,s.y,3,'#bfffff');if(e.hp<=0)killEnemy(e);break;}}for(const rock of g.meteors){if(!s.dead&&!rock.dead&&dist(s,rock)<rock.r+s.r){rock.hp-=s.damage;s.dead=true;if(rock.hp<=0){rock.dead=true;g.score+=110;boom(rock.x,rock.y,false,'#f6cfb0')}else sparks(rock.x,rock.y,5,'#ffd1aa');break;}}
for(const o of g.groundTargets){if(!s.dead&&!o.dead&&dist(s,o)<o.r+s.r){o.hp-=s.damage;s.dead=true;if(s.kind==='missile')boom(s.x,s.y,true);else sparks(s.x,s.y,4,'#9fffe8');if(o.hp<=0)completeObjectiveTarget(o);break;}}
if(g.boss&&!s.dead&&dist(s,g.boss)<g.boss.r*.72+s.r){g.boss.hp-=s.damage;s.dead=true;if(s.kind==='missile')boom(s.x,s.y,true);else sparks(s.x,s.y,4,'#dffaff');if(g.boss.hp<=0){
 const fallen={...g.boss};boom(g.boss.x,g.boss.y,true,'#ffcb6d');g.score+=5000;g.boss=null;
 showScene({kind:'bossBreak',mission:g.index,boss:fallen,title:fallen.name+' BREAKS APART',
  text:'The giant enemy has been defeated. Its armor collapses and its engines break apart.',
  beats:['Your final strike cracks the armored shell.','Its reactor erupts; wings and armor plates fly apart.','The wreck falls away, and the squadron flies through.'],
  kicker:'BOSS DEFEATED · WATCH ONLY',duration:6.3,next:()=>cleared()});return;}}}g.groundTargets=g.groundTargets.filter(t=>!t.dead);g.meteors=g.meteors.filter(t=>!t.dead);g.shots=g.shots.filter(s=>!s.dead);
for(const s of g.foeShots){s.x+=s.vx*dt;s.y+=s.vy*dt;for(const a of g.allies){if(a.hp>0&&!s.dead&&dist(s,a)<s.r+15){s.dead=true;a.hp-=1;sparks(a.x,a.y,5,'#8af6ff');if(a.hp<=0){boom(a.x,a.y,false,'#76d9ff');radio('FLIGHT COMMAND',a.id+' disabled. Continue mission, Skyfire One!',true)}}}if(!s.dead&&dist(s,p)<s.r+p.r){s.dead=true;playerDown();}}g.foeShots=g.foeShots.filter(s=>!s.dead&&s.x>-30&&s.y>-20&&s.y<H+20);
for(const item of g.pickups){item.x-=(item.goal?145:104)*dt;item.phase+=dt*3;if(dist(item,p)<item.r+p.r+(item.goal?7:0)){item.dead=true;collect(item);}}g.pickups=g.pickups.filter(x=>!x.dead&&x.x>-30);
for(const q of g.particles){q.x+=q.vx*dt;q.y+=q.vy*dt;q.life-=dt;q.vx*=Math.max(.1,1-1.2*dt);q.vy*=Math.max(.1,1-1.2*dt);}g.particles=g.particles.filter(q=>q.life>0);for(const e of g.explosions)e.t+=dt;g.explosions=g.explosions.filter(x=>x.t<x.life);if(g.hp<=0)return;updateHud();}
function resize(){const rect=$('viewport').getBoundingClientRect();vw=rect.width;vh=rect.height;const dpr=Math.min(window.devicePixelRatio||1,2);canvas.width=Math.round(vw*dpr);canvas.height=Math.round(vh*dpr);scale=Math.min(vw/W,vh/H);offsetX=(vw-W*scale)/2;offsetY=(vh-H*scale)/2;ctx.setTransform(dpr*scale,0,0,dpr*scale,dpr*offsetX,dpr*offsetY);}
function polygon(points,fill,stroke,line=1){ctx.beginPath();ctx.moveTo(points[0][0],points[0][1]);points.slice(1).forEach(p=>ctx.lineTo(p[0],p[1]));ctx.closePath();if(fill){ctx.fillStyle=fill;ctx.fill();}if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=line;ctx.stroke();}}
function rounded(x,y,w,h,r,color){ctx.fillStyle=color;ctx.beginPath();ctx.roundRect(x,y,w,h,r);ctx.fill();}
// Deterministic multi-scale terrain: tiles are cached so mobile devices do not recalculate every frame.
const terrainCache=new Map(),spaceCloudCache=new Map(),rockArt=new Map();
const hash=(x,y,seed)=>{let n=Math.imul(x,374761393)+Math.imul(y,668265263)+Math.imul(seed,1442695041);n=Math.imul(n^(n>>>13),1274126177);return ((n^(n>>>16))>>>0)/4294967295;};
function noise(x,y,seed){const ix=Math.floor(x),iy=Math.floor(y),fx=x-ix,fy=y-iy,u=fx*fx*(3-2*fx),v=fy*fy*(3-2*fy);const a=hash(ix,iy,seed),b=hash(ix+1,iy,seed),c=hash(ix,iy+1,seed),d=hash(ix+1,iy+1,seed);return (a+(b-a)*u)*(1-v)+(c+(d-c)*u)*v;}
function fbm(x,y,seed,oct=4){let z=0,amp=.56,sum=0;for(let j=0;j<oct;j++){z+=noise(x,y,seed+j*53)*amp;sum+=amp;x*=2.07;y*=2.07;amp*=.52}return z/sum;}
const mix=(a,b,f)=>a+(b-a)*f;
function makeTerrain(idx){if(terrainCache.has(idx))return terrainCache.get(idx);const width=384,height=960,off=document.createElement('canvas');off.width=width;off.height=height;const c=off.getContext('2d'),im=c.createImageData(width,height),d=im.data,type=worldTypes[idx],seed=idx*431+19;
 const ocean=type==='ocean',dry=type==='desert',cold=type==='ice',lush=type==='jungle',lava=type==='lava',urban=type==='city'||type==='station',storm=type==='storm',seaLevel=ocean?.55:dry?.2:lava?.12:urban?.33:cold?.27:.38;
 const oceanDark=[8,38,74],oceanBright=[22,111,149];let palette=dry?[130,79,47]:cold?[154,184,192]:lush?[32,93,65]:lava?[75,50,48]:urban?[74,94,104]:storm?[74,101,108]:[65,114,96];
 for(let y=0;y<height;y++)for(let x=0;x<width;x++){
   const X=x/width,Y=y/height,continental=fbm(X*5.4+1.5,Y*4.8,seed,4),fine=fbm(X*37,Y*27,seed+100,3),ridge=Math.abs(fbm(X*12,Y*11,seed+56,3)-.5)*2;
   const coastline=continental+.08*Math.sin(X*17+Math.sin(Y*7))+.05*Math.sin(Y*15+X*4),inSea=coastline<seaLevel;
   let r,g,b,light=(fine-.5)*62+(ridge-.45)*34;
   if(inSea){const shoal=clamp((seaLevel-coastline)*9,0,1),waves=(Math.sin(X*201+Y*50)+Math.sin(X*77-Y*129))*.5;r=mix(oceanBright[0],oceanDark[0],shoal)+light*.35+waves*3;g=mix(oceanBright[1],oceanDark[1],shoal)+light*.35+waves*4;b=mix(oceanBright[2],oceanDark[2],shoal)+light*.5+waves*5;
   }else{let high=clamp((coastline-seaLevel)*4,0,1);r=palette[0]+light+high*(dry?41:cold?62:0);g=palette[1]+light+high*(cold?55:dry?27:0);b=palette[2]+light+high*(cold?47:dry?13:0);
    if(coastline-seaLevel<.036&&!cold&&!lava){let f=(.036-(coastline-seaLevel))/.036;r=mix(r,193,f*.8);g=mix(g,172,f*.75);b=mix(b,125,f*.75);}
    if(lush){const canopies=Math.sin(X*550+Y*220)*Math.sin(Y*380-X*120);r-=canopies*12;g+=canopies*9;}
    if(lava){const crack=Math.abs(fine-.5);if(crack<.049&&ridge>.36){r=240;g=78+fine*89;b=16;}else{r+=fine*22;g-=22;b-=16;}}
    if(urban){const blocks=Math.sin(x*.65)*Math.sin(y*.27);if(blocks>.58){r+=52;g+=57;b+=52;}if(x%37<2||y%47<2){r=33;g=50;b=62;}}
    if(dry){const dune=Math.sin(Y*110+X*24)*15;r+=dune;g+=dune*.6;}
    if(storm){g+=8;b+=14;}
   }
   const k=(y*width+x)*4;d[k]=clamp(r,0,255);d[k+1]=clamp(g,0,255);d[k+2]=clamp(b,0,255);d[k+3]=255;
 }c.putImageData(im,0,0);terrainCache.set(idx,off);return off;
}
function makeNebula(idx){const key=idx%3;if(spaceCloudCache.has(key))return spaceCloudCache.get(key);const w=512,h=320,off=document.createElement('canvas');off.width=w;off.height=h;const c=off.getContext('2d'),im=c.createImageData(w,h),d=im.data;
 const pal=key===0?[42,113,167]:key===1?[139,64,133]:[116,88,72];
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){
  const X=x/w,Y=y/h,swirl=Math.sin(Y*9+X*4)*.35+.4,n=fbm(X*6+swirl,Y*5,777+key*121,4),filament=1-Math.abs(fbm(X*14,Y*10,951+key*30,3)-.5)*2;
  const a=clamp((n-.37)*1.65,0,.48)*(filament*.65+.35),k=(y*w+x)*4;
  d[k]=pal[0]+n*38;d[k+1]=pal[1]+n*52;d[k+2]=pal[2]+n*56;d[k+3]=Math.round(a*255);
 }c.putImageData(im,0,0);spaceCloudCache.set(key,off);return off;
}
function makeCloudSprite(){const off=document.createElement('canvas');off.width=320;off.height=128;const c=off.getContext('2d');for(let k=0;k<9;k++){const x=40+k*29,y=56+Math.sin(k*2.1)*15,r=29+(k%3)*8;const g=c.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,'#faffffac');g.addColorStop(.52,'#e4f1f579');g.addColorStop(1,'#e6f2ff00');c.fillStyle=g;c.fillRect(x-r,y-r,r*2,r*2)}return off;}
const cloudSprite=makeCloudSprite();
function planetTexture(idx){return makeTerrain(idx)}
function sphere(cx,cy,r,idx,alpha=1){const pal=bodyColors[idx]||bodyColors[0];ctx.save();ctx.globalAlpha=alpha;ctx.shadowColor=pal[2];ctx.shadowBlur=Math.min(28,r*.12);ctx.beginPath();ctx.arc(cx,cy,r,0,TAU);ctx.clip();ctx.drawImage(planetTexture(idx),cx-r,cy-r,2*r,2*r);ctx.shadowBlur=0;
 const shade=ctx.createRadialGradient(cx-r*.30,cy-r*.39,r*.1,cx+r*.24,cy+r*.29,r*1.34);shade.addColorStop(0,'#f5ffff2c');shade.addColorStop(.44,'#fff9ec10');shade.addColorStop(.78,'#00112285');shade.addColorStop(1,'#00050ff0');ctx.fillStyle=shade;ctx.fillRect(cx-r,cy-r,2*r,2*r);ctx.restore();
 ctx.save();ctx.globalAlpha=alpha;ctx.strokeStyle=pal[2]+'66';ctx.shadowBlur=23;ctx.shadowColor=pal[2];ctx.lineWidth=Math.max(1.3,r*.006);ctx.beginPath();ctx.arc(cx,cy,r,0,TAU);ctx.stroke();ctx.restore();
 if(idx===8||idx===18){ctx.save();ctx.translate(cx,cy);ctx.rotate(-.22);ctx.strokeStyle='#d7c6a277';ctx.lineWidth=Math.max(8,r*.13);ctx.beginPath();ctx.ellipse(0,0,r*1.5,r*.34,0,0,TAU);ctx.stroke();ctx.restore()}
}
const starfield=Array.from({length:280},(_,i)=>({x:(i*479.13)%W,y:(i*331.77)%H,r:.35+(i%8)/10,twinkle:i*.77}));
const driftDust=Array.from({length:185},(_,i)=>({x:hash(i,1,3),y:hash(i,2,7),z:hash(i,3,11),v:.24+hash(i,4,13)*.65,w:hash(i,5,19)}));
function paintBG(t,level){const idx=clamp(level|0,0,19),type=worldTypes[idx],space=['space','orbit','void','station'].includes(type),col=bodyColors[idx];
 const grad=ctx.createLinearGradient(0,0,0,H);grad.addColorStop(0,space?'#020513':'#0a1934');grad.addColorStop(.38,space?'#070b20':type==='storm'?'#3f536b':'#316a93');grad.addColorStop(1,space?'#081020':'#9fc5cc');ctx.fillStyle=grad;ctx.fillRect(0,0,W,H);
 if(space){ctx.save();ctx.globalAlpha=.88;ctx.drawImage(makeNebula(idx),-100+Math.sin(t*.014)*25,-95,W+200,H+140);ctx.restore();}
 for(const st of starfield){const sx=st.x,sy=(st.y+t*(space?2.3:.33)*(st.r+.3))%H;ctx.globalAlpha=(space?.30:.06)+.48*(.5+.5*Math.sin(t*.33+st.twinkle));ctx.fillStyle=space?'#eff7ff':'#c9eafb';ctx.fillRect(sx,sy,st.r*1.5,st.r*1.5)}ctx.globalAlpha=1;
 if(space){sphere(idx%2?790:735,idx%3?395:460,idx===19?275:idx%3?215:282,idx);sphere(117,124,idx%2?39:26,(idx+3)%20,.78);
 // Dust particles grow from a distant vanishing point, creating real flight depth.
 for(const d of driftDust){const z=(d.z+t*.024*d.v)%1.0,s=.15+z*2.2,x=480+(d.x-.5)*W*s*1.5,y=205+(d.y-.5)*H*s*1.5;if(x<0||x>W||y<0||y>H)continue;ctx.fillStyle=d.w>.5?'#b9ddff':'#e6c6e9';ctx.globalAlpha=.06+z*.35;ctx.beginPath();ctx.ellipse(x,y,.4+z*2,1+z*(meteorLevels.has(idx)?9:4),0,0,TAU);ctx.fill();}ctx.globalAlpha=1;
 if(meteorLevels.has(idx)){ctx.save();ctx.globalAlpha=.14;const dust=ctx.createRadialGradient(440,300,15,440,300,500);dust.addColorStop(0,'#a6a0b580');dust.addColorStop(.7,'#685f8060');dust.addColorStop(1,'#b7b0a400');ctx.fillStyle=dust;ctx.fillRect(0,0,W,H);ctx.restore();}
 }else{
 const land=makeTerrain(idx),horizon=210,center=land.width/2;
 // Perspective texture strips provide continuous motion above actual coastlines, seas and mountain surfaces.
 for(let y=horizon;y<H;y+=4){const depth=(y-horizon+4)/(H-horizon),sw=land.width*(1-.57*Math.pow(depth,.78)),srcX=center-sw/2+Math.sin(t*.12)*7;
  const srcY=((t*34+115/(depth+.09)+idx*19)%land.height+land.height)%land.height;
  ctx.globalAlpha=.3+.7*Math.pow(depth,.42);ctx.drawImage(land,srcX,srcY,sw,3,0,y,W,4.2);
 }ctx.globalAlpha=1;
 // Distant blue-air scattering and luminous horizon, stronger above ocean or icy terrain.
 const mist=ctx.createLinearGradient(0,181,0,H);mist.addColorStop(0,col[2]+'ca');mist.addColorStop(.13,col[2]+'83');mist.addColorStop(.42,col[2]+'1f');mist.addColorStop(1,col[2]+'00');ctx.fillStyle=mist;ctx.fillRect(0,181,W,H-181);
 const haze=ctx.createLinearGradient(0,175,0,235);haze.addColorStop(0,'#e7fbff00');haze.addColorStop(.57,'#ecffff92');haze.addColorStop(1,'#dbffff00');ctx.fillStyle=haze;ctx.fillRect(0,175,W,60);
 // Soft cloud banks, rising from the ocean / plateau in a stable perspective field.
 for(let i=0;i<23;i++){const d=((i*.135+t*(.0035+i%5*.0013))%1),x=((i*263+83)%1400)-180+Math.sin(i*9)*50;const y=194+d*d*450,w=44+d*275,h=13+d*91;
  ctx.globalAlpha=(type==='storm'?.38:.23)+d*.4;ctx.drawImage(cloudSprite,x-w/2,y-h/2,w,h);}
 ctx.globalAlpha=1;
 }
 // A restrained flight reticle, never hiding the rendered world.
 ctx.strokeStyle='#d1f9ff66';ctx.lineWidth=1.2;ctx.beginPath();ctx.arc(W/2,174,14,0,TAU);ctx.moveTo(W/2-26,174);ctx.lineTo(W/2-11,174);ctx.moveTo(W/2+11,174);ctx.lineTo(W/2+26,174);ctx.stroke();
}
function asteroidSprite(seed){const key=seed%11;if(rockArt.has(key))return rockArt.get(key);const off=document.createElement('canvas');off.width=120;off.height=120;const c=off.getContext('2d');c.translate(60,60);
 const pts=Array.from({length:13},(_,i)=>{const a=i*TAU/13,rr=42+(hash(i,key,5)-.5)*20;return[Math.cos(a)*rr,Math.sin(a)*rr]});
 c.beginPath();c.moveTo(pts[0][0],pts[0][1]);for(let i=1;i<pts.length;i++)c.lineTo(...pts[i]);c.closePath();const gr=c.createLinearGradient(-40,-50,39,44);gr.addColorStop(0,'#d3c3ae');gr.addColorStop(.32,'#8f837c');gr.addColorStop(.7,'#564d51');gr.addColorStop(1,'#242736');c.fillStyle=gr;c.fill();c.strokeStyle='#b0a59a';c.lineWidth=1.7;c.stroke();
 for(let i=0;i<14;i++){const a=hash(i,key,3)*TAU,r=hash(i,key,4)*31,x=Math.cos(a)*r,y=Math.sin(a)*r,cr=3+hash(i,key,5)*9;c.fillStyle='#24283385';c.beginPath();c.ellipse(x+2,y+3,cr,cr*.72,0,0,TAU);c.fill();c.strokeStyle='#cfbdad70';c.lineWidth=1.1;c.stroke()}
 rockArt.set(key,off);return off;}
function drawMeteor(m){const p=project(m.x,m.y),r=Math.max(10,m.r*p.s*1.8);ctx.save();ctx.translate(p.x,p.y);ctx.rotate(m.rotation);ctx.shadowColor='#b3a5a0';ctx.shadowBlur=8;ctx.drawImage(asteroidSprite(m.seed),-r,-r,r*2,r*2);ctx.restore();}
function project(x,y){let q=clamp((W-x+30)/(W+60),0,1),factor=.18+q*.94;return{x:W/2+(y-H/2)*factor*1.34,y:158+q*q*427,s:.18+q*1.13,depth:q};}
function drawRearJet(px,py,sc=1,enemy=false,bank=0){ctx.save();ctx.translate(px,py);ctx.rotate(bank);ctx.scale(sc,sc);
 const body=enemy?'#7d5460':'#496479',outline=enemy?'#d7a0a3':'#a8b6c0';
 // Forward-swept depth shadow and two angular horizontal stabilizers.
 ctx.shadowBlur=18;ctx.shadowColor='#000a1e88';
 polygon([[-17,25],[-46,60],[-48,76],[-13,54],[13,54],[48,76],[46,60],[17,25]],'#1b2938');
 polygon([[-13,-3],[-39,13],[-105,49],[-110,64],[-50,56],[-14,39],[14,39],[50,56],[110,64],[105,49],[39,13],[13,-3]],'#22374a',outline,2);
 // Faceted swept wings catch sunlight along the leading edges.
 const wing=ctx.createLinearGradient(-100,10,110,73);wing.addColorStop(0,enemy?'#a75f72':'#708ba0');wing.addColorStop(.48,enemy?'#5b3547':'#344d63');wing.addColorStop(1,enemy?'#bb7882':'#839bad');
 polygon([[-13,-6],[-47,18],[-109,51],[-101,60],[-38,47],[-13,40]],wing,outline,1.6);
 polygon([[13,-6],[47,18],[109,51],[101,60],[38,47],[13,40]],wing,outline,1.6);
 polygon([[-19,-88],[0,-121],[19,-88],[23,37],[15,69],[-15,69],[-23,37]],'#283b50',outline,1.8);
 const fus=ctx.createLinearGradient(-24,0,23,0);fus.addColorStop(0,enemy?'#502c39':'#233849');fus.addColorStop(.27,enemy?'#af6d7c':'#7899aa');fus.addColorStop(.52,enemy?'#d9a2a0':'#9bb5be');fus.addColorStop(.76,enemy?'#704351':'#446073');fus.addColorStop(1,enemy?'#382532':'#1b2c3b');
 polygon([[-16,-86],[0,-116],[16,-86],[23,25],[15,73],[-15,73],[-23,25]],fus,'#dae8ebaa',1.4);
 // Topside panel sections and amber canopy, sculpted as a curved cockpit.
 const glass=ctx.createLinearGradient(0,-94,0,-15);glass.addColorStop(0,'#c8f6ff');glass.addColorStop(.4,enemy?'#6e353d':'#345f7c');glass.addColorStop(1,'#101c2e');ctx.fillStyle=glass;ctx.beginPath();ctx.moveTo(0,-92);ctx.bezierCurveTo(-11,-84,-16,-53,-10,-24);ctx.quadraticCurveTo(0,-10,10,-24);ctx.bezierCurveTo(16,-53,11,-84,0,-92);ctx.fill();ctx.strokeStyle='#d4e9f1aa';ctx.lineWidth=1.4;ctx.stroke();
 // Jet-engine intakes, twin thrust nozzles and rear stabilizers.
 for(const side of [-1,1]){
   polygon([[side*22,0],[side*30,-18],[side*36,0],[side*28,35]],'#202d39','#94a6b1',1.2);
   polygon([[side*13,29],[side*29,55],[side*30,75],[side*16,58]],'#25394b',outline,1.2);
   ctx.fillStyle='#101820';ctx.beginPath();ctx.ellipse(side*13,66,12,6,0,0,TAU);ctx.fill();
   const thrust=ctx.createRadialGradient(side*13,74,2,side*13,89,33);thrust.addColorStop(0,'#fffde0');thrust.addColorStop(.18,'#d4f9ff');thrust.addColorStop(.45,enemy?'#ff8e50':'#56b8e5');thrust.addColorStop(1,'#2c92ff00');ctx.fillStyle=thrust;ctx.beginPath();ctx.ellipse(side*13,87,12,20+Math.sin(worldTime*18+side)*4,0,0,TAU);ctx.fill();
 }
 ctx.shadowBlur=0;ctx.strokeStyle='#ebf6ff66';ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(-21,21);ctx.lineTo(-90,51);ctx.moveTo(21,21);ctx.lineTo(90,51);ctx.moveTo(-17,40);ctx.lineTo(-17,56);ctx.moveTo(17,40);ctx.lineTo(17,56);ctx.stroke();
 for(const side of [-1,1]){ctx.fillStyle=side<0?'#ef8e93':'#a3e6ce';ctx.beginPath();ctx.arc(side*103,57,2.4,0,TAU);ctx.fill()}
 ctx.restore();}
function drawGroundRobot(t){const p=project(t.x,t.y),s=Math.max(.24,p.s*1.1);ctx.save();ctx.translate(p.x,p.y);ctx.scale(s,s);
ctx.shadowColor=t.type==='tower'?'#82dbff':'#f986b1';ctx.shadowBlur=12;
const body=t.type==='tower'?'#416d98':t.type==='reactor'?'#76456d':'#626b86';
polygon([[-45,62],[-29,12],[-14,-9],[14,-9],[29,12],[45,62],[29,75],[16,39],[-16,39],[-29,75]],body,'#c4dae5',4);
polygon([[-57,-15],[-25,-23],[0,-41],[25,-23],[57,-15],[39,37],[-39,37]],body,'#e6bfce',4);
ctx.fillStyle='#ff9db2';ctx.fillRect(-22,-15,44,12);ctx.fillStyle='#b6fcff';ctx.beginPath();ctx.arc(0,14,13,0,TAU);ctx.fill();
if(t.type!=='relay'){ctx.strokeStyle='#8bd9ff';ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(0,-42);ctx.lineTo(0,-105);ctx.stroke();}
ctx.restore();}
function drawPlanetRobotBoss(b,p,s,cinematic=false,awake=1){ctx.save();ctx.translate(p.x,p.y+83);ctx.scale(s*.89,s*.89);const w=b.form==='storm'?'#85d9ff':b.form==='void'?'#e9a2ff':'#ffb78b';ctx.shadowColor=w;ctx.shadowBlur=24;
// Two enormous piston legs, articulated arms and a luminous reactor core.
for(const side of [-1,1]){polygon([[side*26,12],[side*62,42],[side*73,134],[side*43,149],[side*24,72]],'#46506c',w,4);polygon([[side*48,-70],[side*90,-66],[side*130,-8],[side*106,45],[side*78,24],[side*86,-17]],'#59627c',w,4);}
polygon([[-80,-112],[0,-142],[80,-112],[70,35],[0,66],[-70,35]],'#343b58',w,5);
polygon([[-44,-156],[0,-189],[44,-156],[37,-121],[-37,-121]],'#5b6d86',w,4);ctx.fillStyle=w;ctx.globalAlpha=.08+awake*.92;ctx.fillRect(-27,-150,54,12);ctx.globalAlpha=1;
const core=ctx.createRadialGradient(0,-41,4,0,-41,47);core.addColorStop(0,'#fff');core.addColorStop(.35,w);core.addColorStop(1,'#17223f');ctx.fillStyle=core;ctx.globalAlpha=.12+awake*.88;ctx.beginPath();ctx.arc(0,-41,40,0,TAU);ctx.fill();ctx.globalAlpha=1;ctx.restore();
if(cinematic)return;
rounded(625,107,288,16,7,'#230d2ede');rounded(629,111,280*clamp(b.hp/b.maxHp,0,1),8,5,w);ctx.fillStyle='#fff8ed';ctx.font='900 17px system-ui';ctx.textAlign='center';ctx.fillText('⚠ '+b.name+' · WAR ROBOT ⚠',769,96);ctx.textAlign='left';}
function drawRearBoss(b,cinematic=false,awake=1){const p=project(b.x,b.y),s=Math.max(.8,p.s*1.8);if(b.type==='planetRobot')return drawPlanetRobotBoss(b,p,s,cinematic,awake);ctx.save();ctx.translate(p.x,p.y);ctx.scale(s,s);
 const hue=b.form==='dawn'?'#ffd799':b.form==='storm'?'#9ee7ff':b.form==='void'?'#ed9aff':'#ff98ae';
 ctx.shadowBlur=26;ctx.shadowColor=hue;polygon([[-20,-100],[0,-124],[20,-100],[45,-15],[137,28],[130,62],[40,43],[25,98],[-25,98],[-40,43],[-130,62],[-137,28],[-45,-15]],'#262a43',hue,3);
 polygon([[-42,5],[-124,45],[-27,37]],'#8a566c','#ffbd9f',2);polygon([[42,5],[124,45],[27,37]],'#8a566c','#ffbd9f',2);
 const core=ctx.createRadialGradient(0,-20,4,0,-20,52);core.addColorStop(0,'#fff');core.addColorStop(.3,hue);core.addColorStop(1,'#6b274b');ctx.fillStyle=core;ctx.globalAlpha=.15+.85*awake;ctx.beginPath();ctx.ellipse(0,-20,31,48,0,0,TAU);ctx.fill();ctx.globalAlpha=1;ctx.restore();
 if(cinematic)return;
 rounded(625,107,288,16,7,'#230d2ede');rounded(629,111,280*clamp(b.hp/b.maxHp,0,1),8,5,hue);ctx.fillStyle='#fff8ed';ctx.font='900 17px system-ui';ctx.textAlign='center';ctx.fillText('⚠ '+b.name+' ⚠',769,96);ctx.textAlign='left';}
function drawJet(x,y,scaleJet=1,enemy=false,type='fighter',tilt=0){ctx.save();ctx.translate(x,y);ctx.rotate(tilt);ctx.scale(scaleJet,scaleJet);if(enemy)ctx.scale(-1,1);const body=enemy?'#f69eaa':'#a2f2ff',dark=enemy?'#7a2749':'#28679e',wing=enemy?'#e96b81':'#56b1e8';ctx.shadowBlur=enemy?11:20;ctx.shadowColor=enemy?'#f65a80':'#54c9ff';polygon([[-31,0],[-13,-7],[13,-8],[33,0],[13,8],[-13,7]],body,'#e6ffff',1);polygon([[-10,-4],[-24,-25],[3,-19],[12,-6]],wing,dark,1.2);polygon([[-10,4],[-24,25],[3,19],[12,6]],wing,dark,1.2);polygon([[-25,-5],[-36,-15],[-14,-9]],dark);polygon([[-25,5],[-36,15],[-14,9]],dark);polygon([[3,-5],[18,-3],[25,0],[18,3],[3,5]],enemy?'#47223d':'#224f78','#ecffff',.8);ctx.shadowBlur=0;ctx.fillStyle=enemy?'#ff9d44':'#51ffff';ctx.beginPath();ctx.ellipse(-32,0,rand(4,9),3.3,0,0,TAU);ctx.fill();if(type==='bomber'){ctx.fillStyle=dark;ctx.fillRect(-8,-21,12,42);}if(type==='ace'){ctx.strokeStyle='#ffe3a8';ctx.lineWidth=2;ctx.strokeRect(-6,-7,18,14);}ctx.restore();}
function drawBoss(b){ctx.save();ctx.translate(b.x,b.y);if(b.form!=='standard'){const hue=b.form==='dawn'?'#ffd88b':b.form==='storm'?'#9edaff':'#e19aff';ctx.save();ctx.rotate(b.time*(b.form==='void'?-.55:.35));ctx.strokeStyle=hue;ctx.globalAlpha=.8;ctx.shadowColor=hue;ctx.shadowBlur=17;ctx.lineWidth=3;for(let k=0;k<3;k++){ctx.beginPath();ctx.ellipse(0,0,100+k*13,49+k*11,k*.55,0,TAU);ctx.stroke();}ctx.restore();} ctx.rotate(Math.sin(b.time*1.1)*.05);ctx.shadowBlur=28;ctx.shadowColor='#f15d93';polygon([[-96,0],[-40,-27],[7,-41],[65,-29],[101,0],[65,29],[7,41],[-40,27]],'#672f53','#ffb1b4',3);polygon([[-24,-17],[-55,-86],[20,-60],[47,-24]],'#8c4568','#ffa2a7',2);polygon([[-24,17],[-55,86],[20,60],[47,24]],'#8c4568','#ffa2a7',2);polygon([[-33,0],[21,-24],[76,0],[21,24]],'#d66d84','#ffe1b2',2);ctx.shadowBlur=15;ctx.fillStyle='#e8fcff';ctx.beginPath();ctx.ellipse(39,0,24,9,0,0,TAU);ctx.fill();ctx.fillStyle='#fc5776';for(let i of [-1,1]){ctx.beginPath();ctx.ellipse(-75,i*19,12,6,0,0,TAU);ctx.fill();}ctx.restore();rounded(625,112,288,16,7,'#240f2ded');rounded(629,116,280*clamp(b.hp/b.maxHp,0,1),8,5,'#ff6e8c');ctx.fillStyle='#fff1e6';ctx.font='900 17px system-ui';ctx.textAlign='center';ctx.fillText('⚠ '+b.name+' ⚠',769,102);}
// Storyboard engine: every cinematic shows moving on-screen actors, never static gameplay.
function drawCinematic(){
 if(!scene)return;
 const s=scene,k=s.kind||'approach',t=s.elapsed,d=s.duration,p=clamp(t/d,0,1);
 const smooth=x=>{x=clamp(x,0,1);return x*x*(3-2*x)};
 const fly=(x,y,z,enemy=false,bank=0)=>drawRearJet(x,y,z,enemy,bank);
 const glow=(x,y,r,color,a=1)=>{ctx.save();ctx.globalAlpha=a;let g=ctx.createRadialGradient(x,y,2,x,y,r);g.addColorStop(0,color);g.addColorStop(1,'#00000000');ctx.fillStyle=g;ctx.fillRect(x-r,y-r,r*2,r*2);ctx.restore()};
 const beam=(x,y,tx,ty,c,w=3)=>{ctx.save();ctx.strokeStyle=c;ctx.lineWidth=w;ctx.shadowColor=c;ctx.shadowBlur=12;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(tx,ty);ctx.stroke();ctx.restore()};
 const tag=(str,x,y,color='#c7f6ff')=>{ctx.save();ctx.font='900 14px ui-monospace,monospace';ctx.textAlign='center';ctx.fillStyle='#02182adb';ctx.fillRect(x-82,y-17,164,28);ctx.strokeStyle='#7ad7f777';ctx.strokeRect(x-82,y-17,164,28);ctx.fillStyle=color;ctx.fillText(str,x,y+2);ctx.restore()};
 if(k==='approach'){
   // Actor 1: the player leaves formation, accelerating and banking down toward the surface.
   let step=smooth(p),jitter=Math.sin(t*3)*3;
   for(let side of [-1,1]){
     let breakAway=smooth((p-.31)/.42),bx=480+side*(70+breakAway*330),by=215+breakAway*120;
     fly(bx,by,Math.max(.2,.52-breakAway*.22),false,side*breakAway*.26);
     if(p<.8){beam(bx-3,by+27,bx-3-side*10,by+35+breakAway*65,'#7ae6ff7a',2)}
   }
   fly(480+Math.sin(t*2)*12,280+step*166+jitter,.35+step*.77,false,Math.sin(t*1.4)*.045);
   if(p>.46){for(let a=0;a<5;a++){let z=((p-.46)*3+a*.19)%1;ctx.strokeStyle=`rgba(183,238,255,${.09+z*.3})`;ctx.lineWidth=1+z*2;ctx.beginPath();ctx.moveTo(480+(a-2)*35*z,180+z*310);ctx.lineTo(480+(a-2)*49*z,210+z*320);ctx.stroke();}}
   tag(p<.35?'SQUADRON FORMATION':p<.7?'BREAKING FORMATION':'APPROACHING SURFACE',480,66);
   // Actor 2: opposing fighters race past as the squadron intercepts.
   if(p>.18&&p<.64){let z=(p-.18)/.46;fly(850-500*z,220+110*z,.24+z*.24,true,-.12);fly(130+530*z,255+45*z,.16+z*.18,true,.12)}
 }else if(k==='bossWake'){
   const b=s.boss||{name:'UNKNOWN',type:'carrier',form:'standard',hp:1,maxHp:1},rise=smooth(p/.58),awake=smooth((p-.27)/.58),turn=Math.sin(t*1.2)*.035;
   ctx.save();ctx.translate(0,(1-rise)*160);
   if(b.type==='planetRobot'){
     ctx.save();ctx.translate(480,326);ctx.rotate(turn*awake);ctx.translate(-480,-326);
     const actor={...b,form:b.form||'standard',hp:1,maxHp:1};drawPlanetRobotBoss(actor,{x:480,y:205},1.0,true,awake);
     ctx.restore();
     for(let side of [-1,1]){
       const xx=480+side*145,yy=169-(1-awake)*23;
       beam(xx,yy,xx+side*(18+awake*34),yy-24-awake*45,`rgba(255,128,171,${.12+awake*.84})`,2+awake*3);
     }
   }else{
     let fake={...b,x:480,y:300,hp:1,maxHp:1};
     drawRearBoss(fake,true,awake);
     for(let side of [-1,1]){glow(480+side*(70+awake*68),334,40+awake*45,awake>.7?'#ff9baaff':'#495765ff',awake*.7);}
   }ctx.restore();
   if(p>.42){glow(480,284,64+Math.sin(t*9)*22,'#faacc0',awake*.55);if(p>.79){for(let j=0;j<15;j++){let a=j*TAU/15+t*.6;beam(480+Math.cos(a)*55,284+Math.sin(a)*55,480+Math.cos(a)*83,284+Math.sin(a)*83,'#ffc4d05e',2)}}}
   if(p>.62){fly(480+Math.sin(t*2)*20,512,.51,false,.07);}
   tag(p<.32?'BOSS SIGNAL DETECTED':p<.7?'REACTOR ACTIVATING':'WEAPON SYSTEMS ONLINE',480,66,p>.7?'#ffc4a5':'#c7f6ff');
 }else if(k==='bossBreak'){
   const b=s.boss||{name:'UNKNOWN',type:'carrier',form:'standard',hp:1,maxHp:1},hurt=smooth(p/.45),fall=smooth((p-.42)/.55);
   ctx.save();ctx.translate(0,fall*440);ctx.translate(480,320);ctx.rotate((fall*.18+Math.sin(t*6)*.018)*hurt);ctx.translate(-480,-320);
   if(b.type==='planetRobot')drawPlanetRobotBoss(b,{x:480,y:190},1.0,true,Math.max(0,1-hurt));
   else drawRearBoss({...b,x:480,y:300},true,Math.max(0,1-hurt));
   // Successive armor break-up: shards move outward, rotating and tumbling into the horizon.
   for(let j=0;j<22;j++){
     let angle=j*2.399;let travel=Math.max(0,p-.12)*((j%5)*19+110);
     let x=480+Math.cos(angle)*travel, y=294+Math.sin(angle)*travel+(p*p)*160;
     ctx.save();ctx.translate(x,y);ctx.rotate(angle+t*(j%2?2.1:-2.4));ctx.globalAlpha=Math.max(0,1-p*.9);
     polygon([[0,-7-j%5],[6+j%5,5],[-5,8]],j%3?'#d2bac1':'#efb783','#ffe1c6',1.5);ctx.restore();
   }
   ctx.restore();
   for(let j=0;j<7;j++){
     let start=(j*.116+.13),tt=(p-start)*2.8;
     if(tt>0&&tt<1.6){let x=480+Math.sin(j*5)*100,y=300+Math.cos(j*9)*83+tt*90;
      glow(x,y,25+tt*80,'#ffad65',Math.min(.85,tt*1.8)*(1-tt/1.6));
      ctx.strokeStyle=`rgba(255,216,156,${Math.max(0,1-tt*.65)})`;ctx.lineWidth=4;ctx.beginPath();ctx.arc(x,y,tt*83,0,TAU);ctx.stroke();}
   }
   if(p>.56)fly(480,430-(p-.56)*50,.48+(p-.56)*.39,false,-.04);
   tag(p<.32?'ARMOR FAILURE':p<.7?'REACTOR RUPTURE':'TARGET DESTROYED',480,67,'#ffdbac');
 }else if(k==='branch'||k==='chapter'){
   // Navigation officer's animated holographic route planner. Ships actively choose trajectories.
   ctx.save();ctx.fillStyle='#050d20a8';ctx.fillRect(0,22,W,435);
   const opts=k==='chapter'?[11,12,13]:((s.options||[]).length?(s.options||[]).slice(0,4):[16,17]);
   const cx=475,cy=375,n=opts.length;
   glow(cx,cy,95,'#66ffff',.6);ctx.strokeStyle='#73ccee88';ctx.lineWidth=2;ctx.beginPath();ctx.arc(cx,cy,46,0,TAU);ctx.stroke();
   ctx.font='900 12px ui-monospace,monospace';ctx.textAlign='center';ctx.fillStyle='#bffaff';ctx.fillText('NAVIGATION',cx,cy-11);ctx.fillText('COMPUTER',cx,cy+9);
   for(let j=0;j<n;j++){
     const xx=190+(n===1?285:j*570/Math.max(1,n-1)),yy=160+Math.sin(j*2.9)*36;
     const light=smooth((p-j*.12)/.3),pulse=(p*2+.13*j)%1;
     beam(cx,cy,xx,yy,'rgba(108,231,249,'+(.08+light*.65)+')',2+light);
     if(light>0){glow(xx,yy,40,'#55d9ee',light*.6);ctx.save();ctx.strokeStyle='#a0efff';ctx.lineWidth=2;ctx.beginPath();ctx.arc(xx,yy,27+Math.sin(t*4+j)*2,0,TAU);ctx.stroke();ctx.fillStyle=['#a4d5f9','#e4ba9b','#b0e69f','#e1b3ff'][j];ctx.beginPath();ctx.arc(xx,yy,16,0,TAU);ctx.fill();ctx.restore()}
     let px=cx+(xx-cx)*pulse,py=cy+(yy-cy)*pulse;
     if(light>.9){fly(px,py,.1+(.11*pulse),false,(j%2?-.2:.2));}
     tag('MISSION '+String(opts[j]).padStart(2,'0'),xx,yy-40);
   }
   ctx.restore();tag(k==='chapter'?'UNEXPLORED STAR SYSTEM':'NEW PATHS EARNED',475,67,'#aaffd8');
 }else if(k==='departure'||k==='ending'){
   let formation=smooth(p/.6);for(let side of [-1,1]){
     let x=480+side*(330-formation*210)+Math.sin(t*1.3+side)*7,y=350-formation*75;
     fly(x,y,.40+formation*.17,false,side*.15*(1-formation));
     if(k==='ending'){for(let j=0;j<10;j++){let xx=x+Math.sin(j*13+t)*90,yy=y-50-Math.cos(j*8+t)*70;glow(xx,yy,9,'#ffeca0',.3+Math.sin(t+j)*.2)}}
   }
   fly(480,422-smooth(p)*80,.84+.1*Math.sin(t),false,Math.sin(t*1.4)*.04);
   if(p>.38){let travel=smooth((p-.38)/.55);beam(480,400,480,400+travel*310,'#8deefc70',2)}
   tag(k==='ending'?'THE SKIES ARE FREE':p<.65?'REGROUPING WINGMEN':'DESTINATION LOCKED',480,65,'#beffe5');
 }else{
   fly(480,415,.9,false);
 }
}
function render(dt){
 ctx.save();ctx.setTransform(canvas.width/vw,0,0,canvas.height/vh,0,0);ctx.fillStyle='#071021';ctx.fillRect(0,0,vw,vh);ctx.restore();
 ctx.save();ctx.beginPath();ctx.rect(0,0,W,H);ctx.clip();if(shake>0&&screen==='play')ctx.translate(rand(-shake,shake),rand(-shake,shake));
 let lev=game?game.index:selected;paintBG(worldTime,lev);
 if(screen==='home'||screen==='map'){drawRearJet(486,505,1.5,false,Math.sin(worldTime)*.05);}
 if(screen==='scene'){drawCinematic();}
 if(game&&['play','pause','clear','gameover','finish'].includes(screen)){
  const g=game;const objects=[];
  if(meteorLevels.has(g.index)){
    for(let k=0;k<14;k++){const z=(k*.133+worldTime*(.055+k%3*.008))%1,xx=960-z*1010,yy=clamp((k*157+21)%H,48,H-55);objects.push({x:xx,draw:()=>{const p=project(xx,yy),r=2+z*20;ctx.save();ctx.globalAlpha=.15+z*.35;ctx.translate(p.x,p.y);ctx.rotate(k*.6+worldTime*.22);ctx.drawImage(asteroidSprite(k+17),-r,-r,r*2,r*2);ctx.restore();}});}
    for(const m of g.meteors)objects.push({x:m.x,draw:()=>drawMeteor(m)});
  }
  for(let e of g.enemies)objects.push({x:e.x,draw:()=>{let p=project(e.x,e.y);drawRearJet(p.x,p.y,Math.max(.15,p.s*.67)*(e.type==='bomber'?1.4:1),true,Math.sin(e.time*3)*.1)}});
  if(g.boss)objects.push({x:g.boss.x,draw:()=>drawRearBoss(g.boss)});
  for(let target of g.groundTargets)objects.push({x:target.x,draw:()=>drawGroundRobot(target)});
  for(let item of g.pickups)objects.push({x:item.x,draw:()=>{const p=project(item.x,item.y),r=Math.max(7,p.s*18);ctx.save();ctx.translate(p.x,p.y);ctx.rotate(worldTime*.9);ctx.shadowColor='#9fffe0';ctx.shadowBlur=19;polygon([[0,-r],[r,0],[0,r],[-r,0]],'#0c536e','#ccffe8',2);ctx.restore();ctx.fillStyle='#f1fff9';ctx.textAlign='center';ctx.font='900 '+Math.round(r*1.0)+'px system-ui';ctx.fillText({beacon:'📡',rescue:'✚',heal:'♥',shield:'◆',rapid:'⚡',missile:'✚',spread:'✦',points:'★',overdrive:'🔥',wingman:'✈',nova:'☀'}[item.type],p.x,p.y+r*.35);ctx.textAlign='left'}});
  for(let s of g.foeShots)objects.push({x:s.x,draw:()=>{const p=project(s.x,s.y),r=Math.max(3,p.s*6);ctx.save();ctx.shadowColor='#ff987e';ctx.shadowBlur=14;ctx.fillStyle='#ffb793';ctx.beginPath();ctx.arc(p.x,p.y,r,0,TAU);ctx.fill();ctx.restore()}});
  for(let s of g.shots)objects.push({x:s.x,draw:()=>{const p=project(s.x,s.y),r=Math.max(2,p.s*5);ctx.save();ctx.shadowBlur=15;ctx.shadowColor=s.kind==='missile'?'#ffc178':'#72f7ff';ctx.strokeStyle=s.kind==='missile'?'#ffd7a4':'#b5ffff';ctx.lineWidth=r*1.25;ctx.beginPath();ctx.moveTo(p.x,p.y+r*3);ctx.lineTo(p.x,p.y-r*4);ctx.stroke();ctx.restore()}});
  objects.sort((a,b)=>b.x-a.x);for(let ob of objects)ob.draw();
  for(let q of g.particles){let p=project(q.x,q.y);ctx.globalAlpha=Math.min(1,q.life*2);ctx.fillStyle=q.color;ctx.fillRect(p.x,p.y,Math.max(2,q.r*p.s),Math.max(2,q.r*p.s))}ctx.globalAlpha=1;
  for(let b of g.explosions){let p=project(b.x,b.y);ctx.strokeStyle=`rgba(255,215,160,${1-b.t/b.life})`;ctx.lineWidth=3;ctx.beginPath();ctx.arc(p.x,p.y,b.r*p.s*(.25+b.t/b.life),0,TAU);ctx.stroke()}
  const p=project(g.player.x,g.player.y),bank=(controls.keys.has('ArrowLeft')||controls.keys.has('a')?-.1:controls.keys.has('ArrowRight')||controls.keys.has('d')?.1:0);
  for(const a of g.allies){if(a.hp>0){const ap=project(a.x,a.y);drawRearJet(ap.x,ap.y,.53,false,(a.y<p.y?-.08:.08));}}if(g.wingman>0){drawRearJet(p.x-100,p.y-45,.48,false,-.07);drawRearJet(p.x+100,p.y-45,.48,false,.07)}
  if(g.shield>0){ctx.strokeStyle='#92fffab5';ctx.shadowColor='#6ffcff';ctx.shadowBlur=20;ctx.lineWidth=3;ctx.beginPath();ctx.ellipse(p.x,p.y,104,85,0,0,TAU);ctx.stroke();ctx.shadowBlur=0}
  drawRearJet(p.x,p.y,Math.min(1.15,.88+p.s*.2),false,bank);
  if(p.depth>.5){ctx.fillStyle='#d5f8ff55';ctx.font='bold 11px monospace';ctx.fillText((meteorLevels.has(g.index)?'☄ METEOR FIELD  //  ':'VELOCITY  //  ') + Math.round(840+g.elapsed*14)+' KM/H',23,H-17)}
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
$('soundBtn').onclick=()=>{soundOn=!soundOn;saved.sound=soundOn;save();musicTime=0;if(!soundOn){try{speechSynthesis.cancel()}catch(e){}}else makeSound();$('soundBtn').textContent=soundOn?'♫ AUDIO ON':'♪ AUDIO OFF';audio(590,.12,'sine',.055,1.4);};$('soundBtn').textContent=soundOn?'♫ AUDIO ON':'♪ AUDIO OFF';
window.addEventListener('resize',resize);resize();requestAnimationFrame(frame);
})();
