const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),http=require('node:http');
(async()=>{
 const root=path.resolve(__dirname,'..'),errors=[];
 const server=http.createServer((req,res)=>{const f=path.resolve(root,'.'+new URL(req.url,'http://local').pathname.replace(/\/$/,'/index.html'));if(!f.startsWith(root+path.sep))return res.writeHead(403).end();try{res.setHeader('Content-Type',({'.js':'application/javascript','.html':'text/html','.css':'text/css'})[path.extname(f)]||'application/octet-stream');res.end(fs.readFileSync(f));}catch{res.writeHead(404).end();}});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));let browser;
 try{
  browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox','--disable-dev-shm-usage']});
  const page=await browser.newPage();page.on('pageerror',e=>errors.push(e.message));await page.route('https://fonts.googleapis.com/**',r=>r.abort());await page.goto('http://127.0.0.1:'+server.address().port);await page.locator('[data-a="titleNew"]').click();await page.locator('[data-a="startGame"]').click();
  const result=await page.evaluate(async()=>{
   G.flags.fixedTac=true;G.simSeed=20261024;
   const M=createMatch({id:-4242,h:G.club==='RED'?'GUN':'RED',a:G.club});M.live=true;M.min=70;
   brain().mode='teacher';aiReady=()=>true;let answer;askTeacher=()=>new Promise(r=>answer=r);
   const captured=M.sides[0];brainDecide(M,captured);
   const first=await Simulation.request('minute',Simulation.input(M));Object.assign(M,first.match);
   const signature=JSON.stringify(cleanMatch(M));answer({opt:'fresh',src:'jev',conf:.9});await Promise.resolve();await Promise.resolve();
   const queuedWithoutAnnouncement=M.sides[0].subs===0&&!M.log.some(e=>e.t==='sub');
   const signatureDetectsQueuedReply=signature!==JSON.stringify(cleanMatch(M));
   const input=Simulation.input(M),local=structuredClone(input.match);matchRandom(local,()=>simMinute(local));
   const second=await Simulation.request('minute',input);Object.assign(M,second.match);
   const subs=second.events.filter(e=>e.t==='sub');
   const applied=subs.length===2&&subs.every(e=>M.sides[0].on.includes(e.pid)&&!M.sides[0].on.includes(e.out)&&M.sim.P[0].some(p=>p?.id===e.pid));
   const matchingEvents=subs.length===M.log.filter(e=>e.t==='sub').length;
   const currentDecisionUpdated=M.dec[0][1].src==='jev'&&M.dec[0][1].changed&&M.dec[0][1].f.min===71&&M.dec[0][1].requestedF.min===70;
   // Underscore keys (such as _box) are derived caches the worker result leaves out; only real state must match.
   const noCache=(k,v)=>k[0]==='_'?undefined:v;
   const parity=M.rng===local.rng&&JSON.stringify(M.sides,noCache)===JSON.stringify(local.sides,noCache)&&JSON.stringify(M.log)===JSON.stringify(local.log);
   const last=await Simulation.request('minute',Simulation.input(M));
   return {queuedWithoutAnnouncement,signatureDetectsQueuedReply,applied,matchingEvents,currentDecisionUpdated,parity,oldSideUntouched:captured.subs===0,noRepeat:!last.events.some(e=>e.t==='sub')&&last.match.sides[0].subs===2};
  });
  for(const[k,v]of Object.entries(result))assert.ok(v,k);assert.deepEqual(errors,[]);
  console.log(JSON.stringify({passed:Object.keys(result).length,checks:result},null,2));
 }finally{await browser?.close();server.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
