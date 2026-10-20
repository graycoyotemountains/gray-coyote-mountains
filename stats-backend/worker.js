// Cloudflare Worker + D1 shared lifetime stats.
const ALLOWED_ORIGINS=new Set(['https://graycoyotemountains.github.io','http://localhost:4173','http://127.0.0.1:4173']);
function cors(origin){
 return {'Access-Control-Allow-Origin':ALLOWED_ORIGINS.has(origin)?origin:'https://graycoyotemountains.github.io',
 'Access-Control-Allow-Methods':'GET,POST,OPTIONS','Access-Control-Allow-Headers':'Content-Type','Vary':'Origin','Cache-Control':'no-store'};
}
function json(data,status,origin){
 return new Response(JSON.stringify(data),{status,headers:{...cors(origin),'Content-Type':'application/json; charset=utf-8'}});
}
export default {
 async fetch(request,env){
  const origin=request.headers.get('Origin')||'';
  const url=new URL(request.url);
  if(url.pathname!=='/stats')return json({error:'Not found'},404,origin);
  if(request.method==='OPTIONS')return new Response(null,{status:204,headers:cors(origin)});
  if(origin&&!ALLOWED_ORIGINS.has(origin))return json({error:'Forbidden origin'},403,origin);
  if(request.method!=='GET'&&request.method!=='POST')return json({error:'Method not allowed'},405,origin);
  try{
   if(request.method==='POST'){
    const body=await request.json();
    if(!body||!['visit','level'].includes(body.event)||typeof body.playerId!=='string'||!/^[-_a-zA-Z0-9]{10,100}$/.test(body.playerId))
     return json({error:'Invalid event or player ID'},400,origin);
    const statements=[env.DB.prepare('INSERT OR IGNORE INTO visitors (player_id) VALUES (?)').bind(body.playerId)];
    if(body.event==='level')statements.push(env.DB.prepare("UPDATE totals SET value=value+1 WHERE metric='levels'"));
    await env.DB.batch(statements);
   }
   const records=await env.DB.batch([
    env.DB.prepare('SELECT COUNT(*) AS count FROM visitors'),
    env.DB.prepare("SELECT value FROM totals WHERE metric='levels'")
   ]);
   return json({players:records[0].results[0].count,levels:records[1].results[0].value},200,origin);
  }catch(error){
   console.error('Stats API failure:',error);
   return json({error:'Statistics unavailable'},503,origin);
  }
 }
};
