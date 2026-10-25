// Run with Playwright installed: node tests/social.cjs [existing server URL]
const { chromium } = require('playwright');
const assert = require('node:assert/strict');

(async () => {
  const browser = await chromium.launch({ headless: true, ...(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH, args: ['--no-sandbox', '--disable-dev-shm-usage'] } : {}) });
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const errors = [], checks = [];
  page.on('pageerror', e => errors.push(e.message));
  const fs = require('node:fs'), path = require('node:path');
  const root = path.resolve(__dirname, '..');
  const server = require('node:http').createServer((req, res) => {
    const file = path.resolve(root, '.' + new URL(req.url, 'http://localhost').pathname.replace(/\/$/, '/index.html'));
    if (!file.startsWith(root + path.sep)) { res.writeHead(403).end(); return; }
    try {
      res.setHeader('Content-Type', ({ '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css', '.webp': 'image/webp' })[path.extname(file)] || 'application/octet-stream');
      res.end(fs.readFileSync(file));
    } catch { res.writeHead(404).end(); }
  });
  if (!process.argv[2]) await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const base = process.argv[2] || 'http://127.0.0.1:' + server.address().port;
  await page.route('https://fonts.googleapis.com/**', route => route.abort());
  const check = (name, actual, expected) => { assert.deepEqual(actual, expected, name); checks.push(name); };
  const state = () => page.evaluate(() => ({ screen: UI.s, popup: UI.popup?.key || null, index: VIEW_HISTORY.index }));
  const act = (name, ds = {}) => page.evaluate(({ name, ds }) => viewAction(() => ACT[name](ds)), { name, ds });
  const back = async () => { await page.evaluate(() => history.back()); await page.waitForTimeout(100); };
  const appBack = async () => { await act('back'); await page.waitForTimeout(100); };
  try {
    await page.goto(base + '/');
    await page.locator('[data-a="titleNew"]').click();
    await page.locator('[data-a="startGame"]').click();


    await page.evaluate(()=>{
      window.resetAlert=()=>{closeSheet(true);clearTimeout(WORLD_ALERT_TIMER);clearTimeout(WORLD_ALERT_EXIT_TIMER);WORLD_ALERT_TIMER=WORLD_ALERT_EXIT_TIMER=0;G.worldAlerts=[];go('home');};
      window.worldPlayer=Object.values(G.players).find(p=>G.clubs[p.club]?.pl&&p.club!==G.club).id;
      window.worldClub=domesticClubs().find(id=>id!==G.club&&id!==G.players[worldPlayer].club);
    });
    const open = () => page.locator('#world-alert .world-alert-story').click();
    const manager = await page.evaluate(()=>{resetAlert();const c=G.clubs[worldClub];addNews('league',`Manager wanted: ${c.name}`,`${c.name} are seeking a new manager. Poor results.`);return G.news[0].id;});
    await open();
    check('Sacking notification opens the exact existing news story',await page.evaluate(id=>UI.s==='news'&&UI.tab.nv==='news'&&UI.popup?.key==='news:'+id,manager),true);
    const appointed = await page.evaluate(()=>{resetAlert();const c=G.clubs[worldClub];addNews('league',`${c.name} appoint a manager`,`${c.mgr} takes charge.`);return G.news[0].id;});
    await open();
    check('Appointment notification opens its own news story',await page.evaluate(id=>UI.popup?.key==='news:'+id,appointed),true);
    const fixture=await page.evaluate(()=>{resetAlert();const f=G.fixtures.find(f=>f.h!==G.club&&f.a!==G.club&&leagueOf(f.h)===leagueOf(G.club));f.hg=3;f.ag=1;f.goals=[];worldAlertForResults([f]);return f.id;});
    await open();
    check('Result notification opens the exact match report',await page.evaluate(id=>UI.s==='post'&&UI.p.fid===id,fixture),true);
    const transfer=await page.evaluate(()=>{
      resetAlert();G.social=[];const p=G.players[worldPlayer];
      G.tHist.unshift({date:today().getTime(),pid:p.id,name:fullName(p),from:p.club,to:worldClub,fee:2500000});
      addNews('transfer',`${fullName(p)} joins ${clubName(worldClub)}`,`A transfer for £2.5m.`);return G.news[0].id;
    });
    await open();
    check('Completed transfer notification opens the transfer announcement',await page.evaluate(id=>UI.s==='news'&&UI.popup?.key==='news:'+id,transfer),true);
    const loan=await page.evaluate(()=>{resetAlert();const p=Object.values(G.players).find(p=>p.id!==worldPlayer&&p.club===worldClub);window.loanPlayer=p.id;addNews('transfer',`${fullName(p)} joins ${clubName(p.club)} on loan`,'A season-long loan.');return G.news[0].id;});
    await open();
    check('Loan notification opens its own announcement',await page.evaluate(id=>UI.popup?.key==='news:'+id,loan),true);
    const social=await page.evaluate(()=>{resetAlert();G.tHist=[];const p=G.players[worldPlayer],p0=post('off:'+worldClub,`${fullName(p)} has signed for us.`,{kind:'done',pid:p.id,clubs:[worldClub,p.club]});return p0.id;});
    await open();
    check('Club social notification opens the original post in Social',await page.evaluate(id=>UI.s==='news'&&UI.tab.nv==='social'&&UI.popup?.key==='thread:'+id,social),true);
    const fallback=await page.evaluate(()=>{resetAlert();const p=G.players[worldPlayer],pt=post('whispers','A speculative move',{kind:'rumour',pid:p.id,clubs:[worldClub,p.club]});G.social=G.social.filter(p=>p.id!==pt.id);G.rumours=G.rumours.filter(p=>p.id!==pt.id);return p.id;});
    await open();
    check('A removed post falls back to its related player',await page.evaluate(id=>UI.popup?.key==='player:'+id,fallback),true);
    const legacy=await page.evaluate(()=>{resetAlert();const f=G.fixtures.find(f=>played(f)&&f.h!==G.club&&f.a!==G.club);window.legacyFixture=f.id;queueWorldAlert(`RESULT · ${clubName(f.h)} ${f.hg}–${f.ag} ${clubName(f.a)}`);return f.id;});
    await open();
    check('Older saved result notifications recover their fixture source',await page.evaluate(id=>UI.s==='post'&&UI.p.fid===id,legacy),true);
    await page.evaluate(async()=>{resetAlert();const c=G.clubs[worldClub];addNews('league',`${c.name} appoint a manager`,'Saved source destination.');saveGame();await SaveStorage.flush();});
    await page.reload();await page.waitForFunction(()=>G?.worldAlerts?.length);
    await page.evaluate(()=>{window.worldClub=G.worldAlerts[0].clubId;window.resetAlert=()=>{closeSheet(true);clearTimeout(WORLD_ALERT_TIMER);clearTimeout(WORLD_ALERT_EXIT_TIMER);WORLD_ALERT_TIMER=WORLD_ALERT_EXIT_TIMER=0;G.worldAlerts=[];go('home');};});
    await page.evaluate(()=>go('home'));await open();
    check('Source destination survives save and reload',await page.locator('#layer').textContent().then(t=>t.includes('Saved source destination.')),true);
    await page.evaluate(()=>{resetAlert();queueWorldAlert('RESULT · Removed fixture',{fixtureId:-99,clubId:worldClub});DAYRUN.on=true;DAYRUN.timer=setTimeout(()=>{},10000);});
    await open();
    check('Missing match falls back to its club and pauses Continue',await page.evaluate(()=>UI.s==='clubview'&&UI.p.cid===worldClub&&!DAYRUN.on&&DAYRUN.timer===0),true);
    await page.evaluate(()=>{resetAlert();queueWorldAlert('Unknown expired event',{newsId:-99});});await open();
    check('Unavailable sources do not open an unrelated page',await page.evaluate(()=>UI.s==='home'&&!UI.popup),true);
    check('No notification page or nested controls introduced',await page.evaluate(()=>!SCREENS.notifications)&&await page.locator('button button,button a').count()===0,true);
    check('No browser errors',errors,[]);
    console.log(JSON.stringify({passed:checks.length,checks},null,2));
  }finally{await browser.close();server.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
