'use strict';
(function(){
 const endpoint=String(window.GCM_STATS_ENDPOINT||'').replace(/\/+$/,'');
 const output=document.getElementById('globalStats');
 const USER_KEY='gray-coyote-mountains-anonymous-player-v1';
 let playerId=null;
 try{
  playerId=localStorage.getItem(USER_KEY);
  if(!playerId){playerId=crypto.randomUUID();localStorage.setItem(USER_KEY,playerId);}
 }catch(error){}
 function display(data){
  if(!data||!Number.isSafeInteger(data.players)||!Number.isSafeInteger(data.levels))return;
  output.textContent='🌍 '+data.players.toLocaleString()+' unique browsers played · '+data.levels.toLocaleString()+' levels started since tracking began';
 }
 async function request(event){
  if(!endpoint||!playerId)return;
  try{
   const response=await fetch(endpoint+'/stats',{
    method:'POST',headers:{'Content-Type':'application/json'},
    body:JSON.stringify({event,playerId})
   });
   if(!response.ok)throw Error('Statistics unavailable');
   display(await response.json());
  }catch(error){output.textContent='🌍 Worldwide counters temporarily unavailable';}
 }
 if(endpoint&&playerId){
  output.textContent='🌍 Loading worldwide play statistics…';
  request('visit');
 }else output.textContent='🌍 Worldwide counters awaiting shared server connection';
 const oldLoad=loadLevel;
 loadLevel=function(i){
  const permitted=Number.isInteger(i)&&i>=0&&i<LEVELS.length&&(!challengeMode||i!==VILLAGE_INDEX)
   &&(challengeMode||i<MAIN_MOUNTAINS?(challengeMode||i<unlocked||i===MAIN_MOUNTAINS-1&&summitTrailUnlocked)
   :(i===VILLAGE_INDEX?collectedFacts.size===50:i===SECRET_LEVEL?secretUnlocked:Boolean(extraUnlocked[i-SECRET_LEVEL-1])));
  oldLoad(i);
  if(permitted&&screen==='game'&&levelIndex===i)request('level');
 };
})();
