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
    await page.goto('http://127.0.0.1:'+server.address().port);await page.locator('[data-a=titleNew]').tap();
    check('Only the two full English divisions are playable',await page.locator('[data-a=pickLeague]').count()===2);
    check('Club selection explains the four background league setups',/Spain \(20\).*Italy \(20\).*Germany \(18\).*France \(18\)/.test(await page.locator('.start').textContent()));
    await page.locator('[data-a=startGame]').tap();await page.evaluate(()=>go('clubs'));
    for(const [id,n] of [['ES1',20],['IT1',20],['DE1',18],['FR1',18]]){
      await page.locator(`[data-a=clubLeague][data-id=${id}]`).tap();
      check(id+' lists its complete club membership',await page.locator('.main .row[data-a=clubPage]').count()===n);
    }
    await page.locator('[data-a=clubLeague][data-id=ES1]').tap();
    await page.locator('[data-a=clubPage][data-id=ES1_BAR]').tap();
    check('Selected clubs explain academy quality and the yearly academy intake',/Academy development/.test(await page.locator('.main').textContent())&&/new academy players arrive every summer/.test(await page.locator('.main').textContent()));
    check('A selected club can be arranged directly as a friendly opponent',await page.locator('[data-a=friendlyArrange][data-id=ES1_BAR]').count()===1);
    await page.locator('[data-a=friendlyArrange][data-id=ES1_BAR]').tap();
    check('Arranging a selected opponent creates a friendly without league schedules',await page.evaluate(()=>G.fixtures.filter(f=>f.fr&&f.a==='ES1_BAR').length===1&&G.fixtures.filter(f=>!f.fr).length===932));
    await page.locator('.chip[data-a=clubPage][data-section=squad]').tap();
    check('Selected clubs show 25 first-team players',await page.locator('.main .list [data-a=player]').count()===25);
    await page.locator('[data-a=clubLevel][data-level=R]').tap();
    check('Simulation-only clubs show three prospects as their reserves and no empty U18 tab',await page.locator('.main .list [data-a=player]').count()===3&&await page.locator('[data-a=clubLevel][data-level=Y]').count()===0);
    await page.locator('.main .list [data-a=player]').first().tap();
    await page.locator('[data-a=psTab][data-v=bio]').tap();
    check('A reserve profile shows its real inspirational figure and transfer action',/Inspirational figure/.test(await page.locator('#layer .sheet').textContent())&&await page.locator('#layer .sheet [data-a=offer]').count()===1);
    await page.evaluate(()=>{closeSheet(true);G.week=SCHEDULE[7].w;simWorldWeek();UI.tab.clubLeague='ES1';go('clubs');});
    check('A simulated league shows its table with a row for every club, and the directory still lists every club',await page.locator('.main .card h3').first().textContent().then(t=>/La Liga table/.test(t))&&await page.locator('.main .card .row[data-a=clubPage]').count()===20&&await page.locator('.main > .list > .row[data-a=clubPage]').count()===20);
    await page.locator('[data-a=clubPage][data-id=ES1_BAR]').first().tap();
    check('A simulated club page shows its league position and explains that results are simulated',/League position/.test(await page.locator('.main').textContent())&&/\d+(st|nd|rd|th)/.test(await page.locator('.main .tile b').first().textContent())&&/simulated in the background/.test(await page.locator('.main').textContent()));
    await page.evaluate(()=>{G.week=0;delete G.worldLeagues.ES1.table;closeSheet(true);go('clubs');});
    await page.evaluate(()=>{closeSheet(true);go('clubs');});
    await page.locator('[data-a=clubPage][data-id=ES1_GET]').tap();await page.locator('.chip[data-a=clubPage][data-section=squad]').tap();
    check('Clubs outside the original twenty show 25 real, scoutable first-team players and a Transfers tab',await page.locator('.main .list [data-a=player]').count()===25&&await page.locator('[data-a=clubPage][data-section=transfers]').count()===1);
    // The previous release's placeholder state is rebuilt so the placeholder rules and the old-save migration stay covered.
    await page.evaluate(()=>{go('clubs');const c=G.clubs.ES1_GET;for(const id of c.squad.slice()){delete G.players[id];delete G.know[id];}
      Object.assign(c,{backgroundOnly:true,rep:70,bal:0,squad:[],dummySquad:{size:25,transferable:false}});delete c.foreignSquad;delete c.academy;delete c.mgr;Object.values(G.agents||{}).forEach(a=>{delete a.rel?.ES1_GET;});});
    check('Club directory hides real names while retaining metadata',!/Getafe CF/.test(await page.locator('[data-a=clubPage][data-id=ES1_GET]').textContent())&&await page.evaluate(()=>G.clubs.ES1_GET.realName==='Getafe CF'));
    await page.locator('[data-a=clubPage][data-id=ES1_GET]').tap();
    check('Club header hides the real name',!/Getafe CF/.test(await page.locator('.clubhead').textContent()));
    check('A placeholder club has a working dashboard with its league and country',/La Liga/.test(await page.locator('.main').textContent())&&/Spain/.test(await page.locator('.main').textContent()));
    await page.locator('.chip[data-a=clubPage][data-section=squad]').tap();
    check('The dummy squad shows 25 slots with no player profile or transfer controls',await page.locator('.main .list .row').count()===25&&await page.locator('.main [data-a=player],.main [data-a=contract],.main [data-a=scoutFile]').count()===0);
    check('Background squads show plain player rows with no read-only labels',!/read-only|placeholder|world-building/i.test(await page.locator('.main').textContent())&&await page.locator('.main .list .row').first().textContent().then(t=>!/Placeholder/.test(t)&&/Spain/.test(t)));
    check('Dummy clubs expose no Transfers tab',await page.locator('[data-a=clubPage][data-section=transfers]').count()===0);
    await page.locator('[data-a=clubPage][data-section=fixtures]').tap();
    check('A background club explains it has no fixtures',/No fixtures/.test(await page.locator('.main').textContent()));
    await page.evaluate(()=>go('clubs'));check('Directory navigation retains the country filter',await page.locator('.main .row[data-a=clubPage]').count()===20);
    await page.locator('[data-a=clubLeague][data-id=all]').tap();
    check('All clubs are reachable without duplicating the existing four overseas clubs',await page.locator('.main .row[data-a=clubPage]').count()===130);
    await page.evaluate(()=>admPlayerSheet(seniorSquad(G.club)[0].id));
    check('Admin cannot move a real player into a placeholder club',await page.locator('#apClub option[value=ES1_GET]').count()===0&&await page.locator('#apClub option[value=F0]').count()===1);
    await page.evaluate(()=>{closeSheet(true);go('home');});
    check('Placeholder clubs have no agent relationships or weekly financial processing',await page.evaluate(()=>{
      weeklyFinance();
      const ids=Object.values(G.clubs).filter(c=>c.backgroundOnly).map(c=>c.id);
      return ids.every(id=>G.clubs[id].bal===0)&&Object.values(G.agents).every(a=>ids.every(id=>!Object.hasOwn(a.rel,id)));
    }));
    check('A placeholder club cannot become the managed club through job changes',await page.evaluate(()=>{
      const before=JSON.stringify([G.club,G.tactics,G.fin]);return takeJob('ES1_GET')===false&&before===JSON.stringify([G.club,G.tactics,G.fin]);
    }));
    const legacy=await page.evaluate(async()=>{
      const playerIds=Object.keys(G.players),fixtures=JSON.stringify(G.fixtures);
      for(const c of Object.values(G.clubs)){if(c.backgroundOnly)delete G.clubs[c.id];else delete c.worldLeague;}
      delete G.worldLeagues;delete G.worldLeagueVersion;delete G.overseasSquadVersion;delete G.overseasYouthVersion;
      await saveGameAsync();return{playerIds,fixtures};
    });
    await page.reload();await page.waitForFunction(()=>G?.worldLeagueVersion===2);
    check('Loading an old save adds the club registry while retaining every player and fixture',await page.evaluate(({playerIds,fixtures})=>playerIds.every(id=>Object.hasOwn(G.players,id))&&JSON.stringify(G.fixtures)===fixtures&&Object.keys(G.clubs).length===130,legacy));
    check('Three rollovers keep every overseas club at 22+ first-team players with three prospects, and the migrated placeholder is now a real club',await page.evaluate(()=>{
      for(let n=0;n<3;n++)rollover();
      const cs=Object.values(G.clubs).filter(c=>c.foreignSquad);
      return cs.length===76&&cs.every(c=>seniorSquad(c.id).length>=22&&levelSquad(c.id,'R').length<=3&&levelSquad(c.id,'Y').length===0)&&Object.values(G.clubs).filter(c=>c.backgroundOnly).length===0&&Object.values(G.players).every(p=>!G.clubs[p.club].backgroundOnly)&&G.fixtures.length===932;
    }));
    await page.evaluate(async()=>{go('home');await saveGameAsync();});await page.reload();await page.waitForFunction(()=>G?.season===2029);
    check('Durable saves retain all four registries and dummy transfer locks',await page.evaluate(()=>Object.keys(G.worldLeagues).length===4&&Object.values(G.clubs).filter(c=>c.backgroundOnly).every(c=>!squadSpace(c)&&!c.squad.length)));
    check('No horizontal mobile overflow or browser errors',errors.length===0&&await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
    console.log(JSON.stringify({passed:checks.length,checks},null,2));
  }finally{if(browser)await browser.close();server.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
