import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const root=path.join(path.dirname(fileURLToPath(import.meta.url)),'public');
const PORT=Number(process.env.PORT||3000);
const MODEL=process.env.OPENAI_MODEL||'gpt-4.1-mini';
const password=process.env.APP_PASSWORD||'';
const apiKey=process.env.OPENAI_API_KEY||'';
const hits=new Map();
function reply(res,status,data,headers={}){res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store',...headers});res.end(JSON.stringify(data));}
function safeEqual(a,b){const x=Buffer.from(a),y=Buffer.from(b);return x.length===y.length&&crypto.timingSafeEqual(x,y);}
function authorized(req){if(!password)return false;const header=req.headers.authorization||'';if(!header.startsWith('Basic '))return false;try{const decoded=Buffer.from(header.slice(6),'base64').toString();return safeEqual(decoded.slice(decoded.indexOf(':')+1),password)}catch{return false}}
function digitRoot(n){let s=String(n).replace(/\D/g,'');if(!s)return null;while(s.length>1)s=String([...s].reduce((a,b)=>a+Number(b),0));return Number(s)}
function profileData(p){const dob=String(p.dob||'');const m=/^(\d{4})-(\d\d)-(\d\d)$/.exec(dob);if(!m)throw Error('Enter a valid date of birth.');const [y,mo,d]=m.slice(1).map(Number);const dt=new Date(Date.UTC(y,mo-1,d));if(dt.getUTCFullYear()!==y||dt.getUTCMonth()!==mo-1||dt.getUTCDate()!==d)throw Error('Invalid birth date.');if(!String(p.fullName||'').trim()||!String(p.city||'').trim())throw Error('Full name and birth city are required.');const rulers={1:'Sun (Surya)',2:'Moon (Chandra)',3:'Jupiter (Guru)',4:'Rahu',5:'Mercury (Budh)',6:'Venus (Shukra)',7:'Ketu',8:'Saturn (Shani)',9:'Mars (Mangal)'};const mulank=digitRoot(d),bhagyank=digitRoot(dob);return {fullName:String(p.fullName).slice(0,100),dob,city:String(p.city).slice(0,120),birthTime:String(p.birthTime||'').slice(0,20),timeKnown:!!p.birthTime,mulank,bhagyank,mulankRuler:rulers[mulank],bhagyankRuler:rulers[bhagyank]}}
const system=`You are ASTRAVA, a thoughtful, conversational Indian numerology and Vedic astrology cultural guide. Speak naturally, in simple language; answer the actual user question in depth when appropriate. You receive a deterministic numerology profile. The 1–9 ruler mapping is traditional Indian numerology. Do not invent calculated Lagna, Nakshatra, Rashi, graha house positions, Panchang, Mahadasha/Antardasha, transit or auspicious timing: NO verified astronomical ephemeris is connected to this prototype. Clearly say these cannot yet be calculated by this prototype, even if birth time is given. Do not claim life events prove particular planetary causes, or that unknown birth time can be reconstructed reliably from life events. You may discuss general traditional symbolism, conditional examples, and possible questions to explore, but distinguish those from personal chart facts. Astrology and numerology are cultural/spiritual practices, not scientifically validated predictors. Never guarantee outcomes, use fear-based remedies, prescribe expensive rituals, or replace professional medical, financial, legal, or mental health advice. For temple queries, describe traditions without claiming supernatural certainty. When useful ask ONE relevant follow-up question. Protect user agency. Do not imply you browsed the web; no browsing tool is connected. Respond in the user's language when feasible.`;
async function readBody(req){let b='';for await(const c of req){b+=c;if(b.length>80000)throw Error('Request too large.')}return JSON.parse(b)}
const server=http.createServer(async(req,res)=>{
 try{
  if(!authorized(req)){res.writeHead(401,{'WWW-Authenticate':'Basic realm="ASTRAVA Private Beta"','Content-Type':'text/plain','Cache-Control':'no-store'});return res.end('Private ASTRAVA beta: enter your password. Configure APP_PASSWORD on your host.');}
  const url=new URL(req.url,'http://localhost');
  if(req.method==='GET'&&url.pathname==='/api/status')return reply(res,200,{aiConfigured:!!apiKey,model:MODEL});
  if(req.method==='POST'&&url.pathname==='/api/profile'){const p=profileData(await readBody(req));return reply(res,200,{profile:p});}
  if(req.method==='POST'&&url.pathname==='/api/chat'){
   if(!apiKey)return reply(res,503,{error:'OpenAI is not configured. Add OPENAI_API_KEY to your hosting environment.'});
   const ip=req.socket.remoteAddress||'unknown',now=Date.now();const recent=(hits.get(ip)||[]).filter(t=>now-t<60000);if(recent.length>=12)return reply(res,429,{error:'Please wait a minute before sending more messages.'});recent.push(now);hits.set(ip,recent);if(hits.size>500)hits.clear();
   const body=await readBody(req),p=profileData(body.profile||{});const messages=Array.isArray(body.messages)?body.messages:[];
   const clean=messages.slice(-16).filter(x=>['user','assistant'].includes(x.role)&&typeof x.content==='string').map(x=>({role:x.role,content:x.content.slice(0,3500)}));
   if(!clean.length||clean.at(-1).role!=='user')return reply(res,400,{error:'Please type a question.'});
   const context='Verified numerology data (NOT a verified Vedic chart): '+JSON.stringify(p)+'\nAdditional life context volunteered by user: '+String(body.lifeContext||'').slice(0,2500);
   const controller=new AbortController();const timeout=setTimeout(()=>controller.abort(),45000);
   let response;
   try{response=await fetch('https://api.openai.com/v1/responses',{method:'POST',headers:{'Authorization':`Bearer ${apiKey}`,'Content-Type':'application/json'},body:JSON.stringify({model:MODEL,instructions:system+'\n'+context,input:clean,max_output_tokens:1100,store:false}),signal:controller.signal})}finally{clearTimeout(timeout)}
   const result=await response.json().catch(()=>({}));if(!response.ok){console.error('OpenAI status',response.status,result?.error?.code||'');return reply(res,502,{error:'AI request failed. Check your API key, credits and model access in the hosting dashboard.'})}
   const answer=(result.output||[]).flatMap(x=>x.content||[]).filter(x=>x.type==='output_text').map(x=>x.text).join('\n').trim();return reply(res,200,{answer:answer||'No text response was returned. Please try again.'});
  }
  if(req.method==='GET'&&(url.pathname==='/'||url.pathname==='/index.html')){const html=await fs.readFile(path.join(root,'index.html'));res.writeHead(200,{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer','Content-Security-Policy':"default-src 'self'; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline'; connect-src 'self'; base-uri 'none'; form-action 'self'"});return res.end(html)}
  return reply(res,404,{error:'Not found'});
 }catch(e){console.error(e?.message||e);return reply(res,e?.message==='Request too large.'?413:400,{error:e?.message||'Unexpected error'})}
});
server.listen(PORT,'0.0.0.0',()=>console.log(`ASTRAVA listening on port ${PORT}`));
