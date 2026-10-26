// Verify the shared artwork renderer in club directories, profiles and match preparation.
const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),http=require('node:http');
(async()=>{
 const root=path.resolve(__dirname,'..'),errors=[];
 const server=http.createServer((req,res)=>{const file=path.resolve(root,'.'+new URL(req.url,'http://local').pathname.replace(/\/$/,'/index.html'));if(!file.startsWith(root+path.sep))return res.writeHead(403).end();try{res.setHeader('Content-Type',({'.js':'application/javascript','.css':'text/css','.webp':'image/webp','.html':'text/html'})[path.extname(file)]||'application/octet-stream');res.end(fs.readFileSync(file));}catch{res.writeHead(404).end();}});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));let browser;
 try{
  browser=await chromium.launch({headless:true,...(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH,args:['--no-sandbox']}: {})});
  for(const width of [390,1440]){
   const page=await browser.newPage({viewport:{width,height:900}});page.on('pageerror',e=>errors.push(e.message));await page.route('**/*',r=>new URL(r.request().url()).hostname==='127.0.0.1'?r.continue():r.abort());await page.goto('http://127.0.0.1:'+server.address().port);await page.click('[data-a=titleNew]');
   const fallback=()=>page.evaluate(()=>{const c=WORLD_CLUBS.find(c=>c.id==='ES1_VIL'),host=document.createElement('div');host.innerHTML=clubBadge(c);document.body.append(host);host.querySelector('img').dispatchEvent(new Event('error'));const ok=!!host.querySelector('svg');host.remove();return ok;});
   assert.ok(await fallback(),'World club fallback before career');await page.click('[data-a=startGame]');assert.ok(await fallback(),'World club fallback in career');
   async function check(){await page.waitForFunction(()=>Array.from(document.querySelectorAll('img.crest-art')).every(i=>i.complete&&i.naturalWidth===256&&i.naturalHeight===294));assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'No overflow');}
   await page.evaluate(()=>go('clubs'));await check();assert.equal(await page.locator('.main img.crest-art').count(),129);
   for(const [id,n] of [['ES1',20],['IT1',20],['DE1',18],['FR1',18]]){await page.click(`[data-a=clubLeague][data-id=${id}]`);await check();assert.equal(await page.locator('.main img.crest-art').count(),n);const cid=await page.locator('.main .row[data-a=clubPage]').first().getAttribute('data-id');await page.evaluate(cid=>go('clubview',{cid}),cid);await check();assert.equal(await page.locator('.clubhead img.crest-art').count(),1);await page.evaluate(()=>go('clubs'));}
   for(const screen of ['table','club','prematch']){await page.evaluate(s=>{if(s==='prematch'){const f=G.fixtures.find(f=>!played(f)&&(f.h===G.club||f.a===G.club));G.week=f.w;}go(s);},screen);await check();assert.ok(await page.locator('.main img.crest-art').count());}
   await page.close();
  }
  assert.deepEqual(errors,[]);console.log('All 129 artwork files load; world directories, profiles, tables, match preparation, cold-start and career fallbacks pass at 390px and 1440px');
 }finally{await browser?.close();server.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
