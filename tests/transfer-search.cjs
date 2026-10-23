// Run: NODE_PATH=/opt/codex/cua_node/lib/node_modules CHROMIUM_PATH=/usr/bin/chromium node tests/transfer-search.cjs
const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),http=require('node:http');
(async()=>{
  const root=path.resolve(__dirname,'..'),checks=[],errors=[];
  const server=http.createServer((req,res)=>{
    const file=path.resolve(root,'.'+new URL(req.url,'http://local').pathname.replace(/\/$/,'/index.html'));
    if(!file.startsWith(root+path.sep))return res.writeHead(403).end();
    try{res.setHeader('Content-Type',({'.js':'application/javascript','.html':'text/html','.css':'text/css'})[path.extname(file)]||'application/octet-stream');res.end(fs.readFileSync(file));}catch{res.writeHead(404).end();}
  });
  let browser;const check=(name,result)=>{assert.ok(result,name);checks.push(name);};
  try{
    await new Promise(r=>server.listen(0,'127.0.0.1',r));
    browser=await chromium.launch({headless:true,...(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH,args:['--no-sandbox']}:{})});
    const page=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
    page.on('pageerror',e=>errors.push(e.message));await page.route('https://fonts.googleapis.com/**',r=>r.abort());
    await page.goto('http://127.0.0.1:'+server.address().port);await page.locator('[data-a=titleNew]').click();await page.locator('[data-a=startGame]').click();
    await page.evaluate(()=>{UI.tab.tr='search';go('transfers');});
    const rows=()=>page.locator('#transferSearchResults .player-main');
    check('New career shows no invented trending players',await rows().count()===0&&/No transfer stories yet/.test(await page.locator('.main').textContent()));
    const core=await page.evaluate(()=>{
      const before={social:G.social,rumours:G.rumours,news:G.news,tHist:G.tHist,deals:G.deals};
      const ps=Object.values(G.players).filter(p=>p.club!==G.club&&!G.clubs[p.club]?.backgroundOnly),own=seniorSquad(G.club)[0],date=today().getTime(),out={};
      G.social=[];G.news=[];G.rumours=[];G.tHist=[];G.deals=[];
      const values=Object.values;Object.values=obj=>{if(obj===G.players)throw Error('Full database scanned');return values(obj);};
      try{out.noDefaultScan=trendingTransferPlayers().length===0&&searchTransferPlayers({}).length===0;}finally{Object.values=values;}
      G.social=[{pid:ps[0].id,date,kind:'rumour',txt:'A move',real:false},{pid:ps[0].id,date,kind:'rumour',txt:'A move',real:false}];
      G.rumours=[{pid:ps[0].id,date,txt:'A move'}];
      const one=trendingTransferPlayers()[0];out.dedup=trendingTransferPlayers().length===1&&one.score<1&&one.label==='Transfer rumour';
      G.news=[{cat:'transfer',action:{t:'player',pid:ps[1].id},date,title:'Linked player'},{cat:'transfer',action:{t:'deal',id:123},date,title:'Linked deal'},{cat:'inbox',action:{t:'press',pid:ps[3].id},date,title:'Press rumour'},{cat:'training',action:{pid:ps[4].id},date,title:'Training'}];G.deals=[{id:123,pid:ps[2].id}];
      G.tHist=[{pid:ps[5].id,date,from:'FA',to:ps[5].club}];
      G.social.push({pid:own.id,date,kind:'talks',txt:'Our player'},{pid:ps[6].id,date:date-14*864e5,kind:'rumour',txt:'Expired'},{pid:ps[7].id,date:date+864e5,kind:'rumour',txt:'Future'},{pid:-999,date,kind:'rumour',txt:'Missing'});
      const ids=trendingTransferPlayers().map(x=>x.p.id);
      out.sources=[ps[0],ps[1],ps[2],ps[3],ps[5],own].every(p=>ids.includes(p.id))&&ids.length===6;
      out.dates=!ids.includes(ps[6].id)&&!ids.includes(ps[7].id);
      const p=ps[0],orig={fn:p.fn,ln:p.ln,insp:p.insp};p.fn='José';p.ln='Álvarez';p.insp='Andrés Iniesta';
      out.names=searchTransferPlayers({name:'jose alvarez'}).some(x=>x.id===p.id)&&searchTransferPlayers({name:'ANDRES INIESTA'}).some(x=>x.id===p.id);
      out.ownExcluded=!searchTransferPlayers({name:fullName(own)}).some(x=>x.id===own.id);
      out.filters=searchTransferPlayers({pos:'GK',maxAge:23,maxFee:5e6,minOvr:60}).every(x=>(x.pos==='GK'||x.alt?.includes('GK'))&&x.age<=23&&pValue(x)<=5e6&&seenOvr(x).v>=60);
      Object.assign(p,orig);Object.assign(G,before);return out;
    });
    for(const [name,result] of Object.entries(core))check('Core: '+name,result);
    const seed=await page.evaluate(()=>{
      G.social=[];G.rumours=[];G.news=[];G.tHist=[];
      const ps=Object.values(G.players).filter(p=>p.club!==G.club&&!G.clubs[p.club]?.backgroundOnly).slice(0,25);
      ps.forEach((p,i)=>G.social.push({pid:p.id,date:today().getTime(),kind:'rumour',txt:'Story '+i,real:false}));
      render();return{ids:ps.map(p=>p.id),name:fullName(ps[0]),inspiration:ps[0].insp};
    });
    check('Default shows exactly twenty unique story-linked players',await rows().count()===20&&new Set(await rows().evaluateAll(ns=>ns.map(n=>n.dataset.id))).size===20);
    check('Every default row labels the transfer rumour',await page.locator('#transferSearchResults').textContent().then(t=>(t.match(/Transfer rumour/g)||[]).length===20));
    await page.evaluate(()=>{window.searchInputNode=document.querySelector('#sName');});
    await page.locator('#sName').fill(seed.name);
    check('Typing keeps its input node and the trending list',await page.evaluate(()=>window.searchInputNode===document.querySelector('#sName'))&&await rows().count()===20);
    await page.locator('[data-a=transferSearch]').click();
    check('Search button reads the latest text and limits results',await rows().count()>=1&&await rows().count()<=20&&/Search results/.test(await page.locator('.main').textContent()));
    await page.locator('#sName').fill('no-such-player-xyz');await page.locator('#sName').press('Enter');
    check('Enter submits a new query without falling back to trends',await rows().count()===0&&/No players found/.test(await page.locator('.main').textContent()));
    await page.locator('[data-a=transferTrending]').click();
    check('Trending resets query and fields',await rows().count()===20&&await page.locator('#sName').inputValue()===''&&await page.evaluate(()=>UI.tab.transferPage===0&&!UI.tab.transferQuery));
    await page.locator('#sPos').selectOption('GK');await page.waitForTimeout(40);
    check('Changing a filter does not rebuild the current results',await rows().count()===20&&/Trending players/.test(await page.locator('.main').textContent()));
    await page.locator('[data-a=transferSearch]').click();
    const first=await rows().evaluateAll(ns=>ns.map(n=>n.dataset.id));
    check('Submitted filters search the full database in pages of twenty',first.length===20&&await page.locator('[data-a=transferPage]').count()===2);
    await page.locator('[data-a=transferPage]').last().click();
    const second=await rows().evaluateAll(ns=>ns.map(n=>n.dataset.id));
    check('Next page contains different players',second.length===20&&second.every(id=>!first.includes(id)));
    await rows().first().click();await page.evaluate(()=>viewAction(()=>ACT.back()));await page.waitForTimeout(100);
    check('Profile Back retains submitted search and page',await page.evaluate(()=>UI.tab.transferQuery.pos==='GK'&&UI.tab.transferPage===1)&&await rows().evaluateAll(ns=>ns.map(n=>n.dataset.id).join(','))===second.join(','));
    await page.locator('[data-a=transferPage]').first().click();
    check('Previous restores page one',await rows().evaluateAll(ns=>ns.map(n=>n.dataset.id).join(','))===first.join(','));
    await page.locator('#sName').fill(seed.inspiration);await page.locator('#sPos').selectOption('Any');await page.locator('[data-a=transferSearch]').click();
    check('Inspirational figure names can find real player counterparts',await rows().count()>=1&&await page.evaluate(()=>UI.tab.transferPage===0));
    check('Phone layout has no horizontal overflow or nested controls',await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)&&await page.locator('button button,button a').count()===0);
    check('No browser errors',errors.length===0);
    await page.screenshot({path:'/tmp/futbol-transfer-search.png'});
    console.log(JSON.stringify({passed:checks.length,checks},null,2));
  }finally{if(browser)await browser.close();server.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
