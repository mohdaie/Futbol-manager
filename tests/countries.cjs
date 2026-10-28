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
    const page=await browser.newPage({viewport:{width:390,height:844}});
    page.on('pageerror',e=>errors.push(e.message));await page.route('https://fonts.googleapis.com/**',r=>r.abort());
    await page.goto('http://127.0.0.1:'+server.address().port);
    const starts=await page.evaluate(()=>Object.values(COUNTRIES).flatMap(c=>c.tiers.map(t=>{const cat=startCatalog(t);return[cat[0].id,c.id,c.tiers,t];}).concat(c.tiers.map(t=>{const cat=startCatalog(t);return[cat[cat.length-1].id,c.id,c.tiers,t];}))));
    for(const [club,country,tiers,tier] of starts){
      const r=await page.evaluate(([club,country,tiers])=>{
        newGame(club,'Country QA',1);
        const dom=domesticClubs().map(i=>G.clubs[i]);
        const sims=Object.values(G.clubs).filter(c=>isSimClub(c)),light=Object.values(G.clubs).filter(c=>c.backgroundOnly);
        const league=id=>dom.filter(c=>c.league===id).length;
        return{t1:LEAGUES[tiers[0]].teams,t2:LEAGUES[tiers[1]].teams,country:G.country,leagues:G.leagues.join(','),n1:league(tiers[0]),n2:league(tiers[1]),
          squads:dom.every(c=>seniorSquad(c.id).length>=22),
          worldIds:Object.keys(G.worldLeagues).sort().join(','),active:Object.values(G.worldLeagues).some(l=>l.active),
          simsOk:sims.every(c=>c.worldLeague&&!dom.includes(c)&&seniorSquad(c.id).length>=22),
          lightOk:light.every(c=>c.lw>0&&c.worldLeague&&!c.squad.length),
          fixtures:G.fixtures.filter(f=>!f.fr).length,userLeague:G.clubs[G.club].league};
      },[club,country,tiers]);
      check(club+' starts a '+country+' career with both divisions playable',r.country===country&&r.leagues===tiers.join(',')&&r.userLeague===tier&&r.n1===r.t1&&r.n2===r.t2&&r.squads&&r.fixtures>0);
      check(club+': every other country runs as a lightweight simulation',!r.active&&r.worldIds.split(',').length===8&&r.simsOk&&r.lightOk&&!r.worldIds.split(',').some(i=>tiers.includes(i)));
    }
    // A full season in every country: the played country's playoffs and the simulated countries' promotion and relegation.
    for(const [club,country] of [['ES2','ESP'],['IT2','ITA'],['DE2','GER'],['FR2','FRA'],['EPL','ENG']]){
      const r=await page.evaluate(async([key,country])=>{
        const first=startCatalog(key.length===3&&key!=='EPL'?key:'EPL')[0];
        newGame(first.id,'Season QA',1);
        const sizes=()=>Object.fromEntries(Object.keys(LEAGUES).map(id=>{const lg=LEAGUES[id];const n=G.leagues.includes(id)?leagueClubs(id).length:(G.worldLeagues[id]?.clubs.length||0);return[id,n];}));
        const before=sizes(),worldBefore=Object.fromEntries(Object.entries(G.worldLeagues).map(([id,l])=>[id,l.clubs.slice()]));
        for(const comp of G.leagues){const ids=leagueClubs(comp);for(const f of G.fixtures.filter(f=>leagueFixture(f,comp))){const home=ids.indexOf(f.h)<ids.indexOf(f.a);f.hg=home?2:0;f.ag=home?0:2;}}
        updateCompetitionSeason();updateCompetitionSeason();
        if(G.playoffs){const semis=G.fixtures.filter(f=>f.playoff);await simulateFixtures(semis);const final=G.fixtures.find(f=>f.id===G.playoffs.final);if(final)await simulateMatchAsync(final);}
        G.week=SEASON_WEEKS-1;seasonEnd();
        const after=sizes();
        const moved=Object.entries(worldBefore).map(([id,old])=>{const now=G.worldLeagues[id].clubs;return old.filter(c=>!now.includes(c)).length;});
        const players=Object.values(G.players);
        const ghost=players.filter(p=>!G.clubs[p.club]).length;
        const lightWithPlayers=Object.values(G.clubs).filter(c=>c.backgroundOnly&&c.squad.length).length;
        const topSquads=Object.values(G.clubs).filter(c=>c.league===G.leagues[0]||c.worldLeague&&/1$|^EPL$/.test(c.worldLeague)).every(c=>c.backgroundOnly?false:seniorSquad(c.id).length>=18);
        const bPromoted=Object.values(G.clubs).filter(c=>c.noPromotion&&(c.league||c.worldLeague)&&/1$/.test(c.league||c.worldLeague)).length;
        return{season:G.season,same:JSON.stringify(before)===JSON.stringify(after),moved,ghost,lightWithPlayers,topSquads,bPromoted,fx:G.fixtures.filter(f=>!f.fr).length,tables:G.leagues.every(id=>leagueClubs(id).length===LEAGUES[id].teams)};
      },[club,country]);
      check(country+': a full season keeps every division at its size and brings the next season\'s fixtures',r.season===2027&&r.same&&r.tables&&r.fx>0);
      check(country+': simulated divisions swap up to three clubs, nobody is left without a club and no B team is promoted',r.moved.every(n=>n<=4)&&r.moved.some(n=>n>0)&&r.ghost===0&&r.lightWithPlayers===0&&r.topSquads&&r.bPromoted===0);
    }
    check('No browser errors',errors.length===0);
    console.log(JSON.stringify({passed:checks.length,checks},null,2));
  }finally{if(browser)await browser.close();server.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
