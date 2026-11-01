/* Skyfire Squadron voice cast. Original dialogue, device-local Web Speech voices. */
(()=>{'use strict';
const raw=[
['FLIGHT COMMAND','COMMANDER VALE','FLIGHT COMMAND',0,.91,.82,'en-GB','Squadron, maintain formation. The fleet is counting on you.'],
['ALPHA-2','PILOT JUNO','WING LEADER',3,1.20,1.37,'en-US','Juno here! I have your left wing. Let us fly!'],
['ALPHA-3','PILOT REX','SUPPORT PILOT',1,1.04,.94,'en-AU','Rex checking in. Missiles armed, shields up.'],
['SKYFIRE ONE','SKYFIRE ONE','SQUADRON LEADER',4,1.07,1.14,'en-US','Skyfire One to all squadrons. Ready for launch.'],
['NAVIGATION','NAVIGATOR IRIS','NAVIGATION',2,1.16,1.50,'en-GB','Iris here. I have marked your next destination on the solar map.'],
['ENEMY COMMANDER','OVERLORD VEX','ENEMY COMMANDER',5,.85,.77,'en-US','This sector belongs to the empire. Turn back!'],
['TEMPEST WARDEN','MARSHAL KORR','TEMPEST WARDEN · ACE PILOT',6,.88,.68,'en-GB','You have entered the storm. None escape Marshal Korr!'],
['ASH HYDRA','ADMIRAL PYRA','ASH HYDRA · BOSS PILOT',7,.94,.88,'en-US','I command the flames of the Ash Hydra!'],
['LEVIATHAN','CAPTAIN DRAVEN','LEVIATHAN · CARRIER CAPTAIN',8,.80,.57,'en-AU','The Leviathan has never surrendered. All guns, fire!'],
['ATLAS PRIME','GENERAL MADOX','ATLAS PRIME · WAR GENERAL',9,.82,.73,'en-GB','I am General Madox. My fortress will crush your fleet.'],
['IRON ORACLE','ORACLE NINE','IRON ORACLE · MACHINE PILOT',10,.75,1.51,'en-US','Probability of your survival approaches zero.'],
['TRIAD SENTINEL','COMMANDER TRIUNE','TRIAD SENTINEL · BOSS PILOT',11,1.03,.83,'en-IE','Three routes, one guardian. You will not pass.'],
['NEXUS OMEGA · DAWN','EMPEROR AURELIUS','EMPEROR OF DAWN',12,.78,.61,'en-GB','I am Emperor Aurelius. The dawn itself obeys my will.'],
['NEXUS OMEGA · STORM','EMPEROR RAIJIN','EMPEROR OF STORMS',13,.84,.49,'en-AU','I am Emperor Raijin. Hear the voice of the thunder.'],
['NEXUS OMEGA · VOID','EMPEROR NOCTIS','EMPEROR OF THE VOID',14,.71,.43,'en-US','I am Emperor Noctis. The black star devours all light.'],
['HELIOS · SOLAR TITAN','EMPEROR SOLARIUS','SOLAR EMPEROR',15,.87,.97,'en-GB','I am Emperor Solarius, guardian of the heart of the sun.']
];
const cast=Object.fromEntries(raw.map(([key,name,role,slot,rate,pitch,locale,demo])=>[key,{key,name,role,slot,rate,pitch,locale,demo}]));
const bossKeys=raw.slice(6).map(x=>x[0]).sort((a,b)=>b.length-a.length);
const bossAt={2:'TEMPEST WARDEN',5:'ASH HYDRA',8:'LEVIATHAN',9:'ATLAS PRIME',14:'IRON ORACLE',16:'TRIAD SENTINEL',17:'NEXUS OMEGA · DAWN',18:'NEXUS OMEGA · STORM',19:'NEXUS OMEGA · VOID',20:'HELIOS · SOLAR TITAN'};
function character(source,mission){
 const s=String(source||'').trim().toUpperCase();
 for(const k of bossKeys)if(s.includes(k))return cast[k];
 if(s.includes('EMPEROR'))for(const k of bossKeys)if(cast[k].name===s)return cast[k];
 if(s.includes('ENEMY BOSS')||s==='BOSS')return cast[bossAt[mission]||'ATLAS PRIME'];
 return null;
}
function profile(source,mission){
 const b=character(source,mission);if(b)return b;
 const s=String(source||'').toUpperCase();
 if(s.includes('ALPHA-2')||s.includes('JUNO'))return cast['ALPHA-2'];
 if(s.includes('ALPHA-3')||s.includes('REX'))return cast['ALPHA-3'];
 if(s.includes('NAVIGAT')||s.includes('IRIS'))return cast.NAVIGATION;
 if(s.includes('SKYFIRE'))return cast['SKYFIRE ONE'];
 if(s.includes('ENEMY')||s.includes('VEX'))return cast['ENEMY COMMANDER'];
 return cast['FLIGHT COMMAND'];
}
let current=null,available=[];
function updateVoices(){try{
 const all=window.speechSynthesis?.getVoices?.()||[];
 available=all.filter(v=>/^en([-_]|$)/i.test(v.lang)).sort((a,b)=>Number(!!b.localService)-Number(!!a.localService)||a.name.localeCompare(b.name));
 if(!available.length)available=all.filter(v=>v.lang).sort((a,b)=>a.name.localeCompare(b.name));
}catch(_){available=[]}return available}
try{window.speechSynthesis?.addEventListener?.('voiceschanged',updateVoices)}catch(_){}
function stop(){try{window.speechSynthesis?.cancel()}catch(_){}current=null}
function availableNow(){return !!(window.speechSynthesis&&window.SpeechSynthesisUtterance)}
function speak(from,message,enabled=true,mission){
 if(!enabled||!availableNow()||!String(message||'').trim())return false;
 const person=profile(from,mission),voices=updateVoices();
 try{
  stop();const u=new SpeechSynthesisUtterance(String(message));
  let v=null;
  if(voices.length){
   const local=voices.filter(x=>x.lang.toLowerCase().replace('_','-')===person.locale.toLowerCase());
   v=voices[person.slot%voices.length];
   if(local.length>1)v=local[person.slot%local.length];
   else if(local.length===1&&voices.length<4)v=local[0];
   u.voice=v;
  }
  u.lang=v?.lang||person.locale;u.rate=person.rate;u.pitch=person.pitch;u.volume=.92;
  u.onend=()=>{if(current===u)current=null};
  u.onerror=()=>{if(current===u)current=null};
  current=u;window.speechSynthesis.speak(u);return true;
 }catch(_){return false}
}
function bossLine(source,kind){const p=character(source);if(!p)return '';
 return kind==='wake'?p.demo:kind==='break'?(p.name.startsWith('EMPEROR')?'My empire... cannot... fall!':'No! My flagship... breaking apart!'):'';
}
window.SkyfireVoices={roster:raw.map(c=>c[0]),profile,character,bossLine,speak,stop,updateVoices,availableNow};
})();