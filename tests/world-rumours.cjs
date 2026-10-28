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
    await page.goto('http://127.0.0.1:'+server.address().port);await page.locator('[data-a=titleNew]').tap();await page.locator('[data-a=startGame]').tap();
    // Two signings are started: one player is on the shortlist, the other is not.
    const setup=await page.evaluate(()=>{
      G.week=0;G.simDeals=[];G.social=[];
      const idx=simPlayerIndex(),pend=new Set(),deals=[];
      for(const c of simClubs()){const d=simPickDeal(c,idx,pend);if(d&&d.from.id!==G.club&&!d.from.fa){pend.add(d.p.id);deals.push([c,d]);}if(deals.length===2)break;}
      const [[cA,dA],[cB,dB]]=deals;G.shortlist.push(dA.p.id);
      const ctx={headlines:0,rumours:3};
      const a=startSimDeal(cA,dA,ctx);a.real=true;a.due=a.made+1;
      let b,tries=0;do{b=startSimDeal(cB,dB,ctx);b.real=true;b.due=b.made+1;if(!G.social.some(x=>x.pid===b.pid)){G.simDeals=G.simDeals.filter(x=>x!==b);b=null;}tries++;}while(!b&&tries<40);
      return{a:{pid:a.pid,to:a.to,from:a.from},b:b&&{pid:b.pid,to:b.to,from:b.from},aName:clubName(a.to),aFrom:clubName(a.from),bTo:b&&clubName(b.to),bFrom:b&&clubName(b.from)};
    });
    check('A vague rumour was produced for the player who is not on the shortlist',!!setup.b);
    check('A shortlisted player gets a detailed rumour naming both clubs',await page.evaluate(({a})=>{const p=G.social.find(x=>x.pid===a.pid&&x.kind==='rumour');return !!p&&p.clubs.includes(a.to)&&p.clubs.includes(a.from);},setup));
    check('Anyone else gets one vague line with no clubs and no fee',await page.evaluate(({b,bTo,bFrom})=>{const p=G.social.find(x=>x.pid===b.pid&&x.kind==='rumour');return !!p&&p.clubs.length===0&&!p.txt.includes(bTo)&&!p.txt.includes(bFrom)&&!/[£€$]/.test(p.txt)&&G.social.filter(x=>x.pid===b.pid).length===1;},setup));
    check('The vague rumour is a scouting lead on the Transfers screen',await page.evaluate(({b})=>trendingTransferPlayers().some(e=>e.p.id===b.pid),setup));
    await page.evaluate(()=>{G.week=1;simTransferWeek();});
    check('The shortlisted signing is announced as done by the buying club, and the player has moved',await page.evaluate(({a})=>{const d=G.social.find(x=>x.pid===a.pid&&x.kind==='done');return !!d&&G.players[a.pid].club===a.to&&d.clubs.includes(a.to);},setup));
    check('The other signing completes without a detailed announcement',await page.evaluate(({b})=>G.players[b.pid].club===b.to&&!G.social.some(x=>x.pid===b.pid&&['done','agreed','talks','off'].includes(x.kind)),setup));
    // A collapsed deal for a shortlisted player is reported, and he stays put.
    const off=await page.evaluate(()=>{
      G.week=2;G.simDeals=[];const idx=simPlayerIndex(),pend=new Set();
      for(const c of simClubs()){const d=simPickDeal(c,idx,pend);if(d&&!d.from.fa&&d.from.id!==G.club){G.shortlist.push(d.p.id);const it=startSimDeal(c,d,{headlines:0,rumours:0});it.real=false;it.due=it.made+1;G.week=3;simTransferWeek();return{pid:d.p.id,from:d.from.id};}}
    });
    check('A false rumour about a shortlisted player ends with a "talks off" report and no move',await page.evaluate(({pid,from})=>G.social.some(x=>x.pid===pid&&x.kind==='off')&&G.players[pid].club===from,off));
    check('No browser errors',errors.length===0);
    console.log(JSON.stringify({passed:checks.length,checks},null,2));
  }finally{if(browser)await browser.close();server.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
