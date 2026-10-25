// Run with Playwright installed: node tests/transfer-decisions.cjs [existing server URL]
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


    const setup = await page.evaluate(() => {
      G.deals=[];G.fin.tb=G.fin.wb=1e9;
      const p=seniorSquad(G.club).find(p=>!p.loan&&!p.inj),buyer=domesticClubs().find(id=>id!==G.club&&squadSpace(G.clubs[id],p));
      p.rc=0;delete p.buyBack;G.clubs[buyer].bal=1e9;
      bidForUser(G.clubs[buyer],p,roundMoney(pValue(p)*1.1));
      window.decisionDeal=activeDeal(p.id,'out').id;
      G.news.forEach(n=>{n.read=true;n.done=true;});go('home');
      return {id:decisionDeal,pid:p.id,day:todayNo(),from:p.club};
    });
    check('Footer identifies a response is required', await page.locator('.bottombar .cta').textContent().then(t=>t.includes('Review transfer')), true);
    await page.setViewportSize({width:320,height:568});
    check('Review transfer control fits a small phone', await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth&&document.querySelector('.bottombar .cta').getBoundingClientRect().right<=innerWidth), true);
    await page.setViewportSize({width:390,height:844});
    await page.locator('.bottombar .cta').click();
    check('Continue opens the outstanding offer without advancing the date', await page.evaluate(s=>todayNo()===s.day&&!DAYRUN.on&&UI.popup.key==='deal:'+s.id,setup), true);
    const before = await page.evaluate(()=>{const d=G.deals.find(d=>d.id===decisionDeal);return JSON.stringify([d.need,d.stage,d.next,d.closed,G.players[d.pid].club,G.fin,userClub().bal]);});
    await page.locator('[data-a=dealAdvice]').click();
    check('Director provides advice without resolving or signing the deal', await page.evaluate(b=>{const d=G.deals.find(d=>d.id===decisionDeal);return !!d.advice&&JSON.stringify([d.need,d.stage,d.next,d.closed,G.players[d.pid].club,G.fin,userClub().bal])===b;},before), true);
    check('Advice is visible in the offer', await page.locator('[data-dof-advice]').textContent().then(t=>t.length>20), true);
    await page.evaluate(()=>{closeSheet(true);ACT.continue();});
    check('Asking the Director does not release Continue', await page.evaluate(s=>pendingTransferDecisions().length===1&&!DAYRUN.on&&todayNo()===s.day,setup), true);
    await page.locator('[data-a=dealGo][data-k=accept]').click();
    check('Accepting the offer starts negotiations without selling the player', await page.evaluate(s=>{const d=G.deals.find(d=>d.id===decisionDeal);return !d.need&&d.stage==='terms'&&G.players[s.pid].club===s.from&&pendingTransferDecisions().length===0;},setup), true);
    const canContinue = await page.evaluate(()=>{closeSheet(true);ACT.continue();const started=DAYRUN.on;DAYRUN.on=false;clearTimeout(DAYRUN.timer);DAYRUN.timer=0;closeDayRun();return started;});
    check('Continue resumes once the offer has been answered', canContinue, true);
    await page.evaluate(async()=>{
      const d=G.deals.find(d=>d.id===decisionDeal);d.stage='final';approveTransferPackage(d);
      needDecision(d,'finalout','Ready for your final approval','Sanction or block the sale.');
      saveGame();await SaveStorage.flush();
    });
    await page.reload();await page.waitForFunction(()=>G?.deals?.some(d=>d.need?.k==='finalout'));
    await page.evaluate(()=>{go('home');ACT.continue();});
    check('Unanswered final approval still blocks Continue after reload', await page.evaluate(s=>{const d=G.deals.find(d=>d.id===s.id);return UI.popup.key==='deal:'+d.id&&!DAYRUN.on&&d.need.k==='finalout'&&G.players[s.pid].club===s.from;},setup), true);
    await page.locator('[data-a=dealAdvice]').click();
    check('Director cannot complete the final sale', await page.evaluate(s=>G.players[s.pid].club===s.from&&!!pendingTransferDecisions().length,setup), true);
    await page.locator('[data-a=dealGo][data-k=sell]').click();
    check('Only the manager final approval completes the sale', await page.evaluate(s=>{const d=G.deals.find(d=>d.id===s.id);return d.closed?.ok&&G.players[s.pid].club===d.to&&pendingTransferDecisions().length===0;},setup), true);
    const stops = await page.evaluate(async()=>{
      closeSheet(true);G.deals=[];G.week=0;G.day=0;
      const p=Object.values(G.players).find(p=>G.clubs[p.club]?.pl&&p.club!==G.club),d=startDeal(p,'interest');
      const oldAdvance=advanceDayAsync,oldHour=deadlineHour,oldFixtures=G.fixtures;
      const out={};
      try {
        advanceDayAsync=async()=>{G.day++;needDecision(d,'bidlimit','Price above limit','Your answer is needed.',{fee:100});return 'ok';};
        DAYRUN.on=true;await dayTick();
        out.daily=!DAYRUN.on&&DAYRUN.timer===0&&UI.popup?.key==='deal:'+d.id&&G.day===1;
        closeSheet(true);d.need=null;DAYRUN.on=true;
        for(let w=0;w<SEASON_WEEKS;w++){G.week=w;let found=false;for(let day=0;day<7;day++){G.day=day;if(deadlineToday()){found=true;break;}}if(found)break;}
        G.fixtures=G.fixtures.filter(f=>!isUserFx(f));const deadlineDate=todayNo();
        deadlineHour=()=>{needDecision(d,'final','Ready to sign','Your final approval is needed.');return {h:10};};
        await dayTick();
        out.hourly=!DAYRUN.on&&DAYRUN.timer===0&&UI.popup?.key==='deal:'+d.id&&todayNo()===deadlineDate;
        return out;
      } finally {advanceDayAsync=oldAdvance;deadlineHour=oldHour;G.fixtures=oldFixtures;}
    });
    check('A decision arriving during normal Continue stops the calendar', stops.daily, true);
    check('A decision arriving during deadline hours stops the clock', stops.hourly, true);
    check('No browser runtime errors', errors, []);
    console.log(JSON.stringify({ passed: checks.length, checks }, null, 2));
  } finally { await browser.close(); server.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
