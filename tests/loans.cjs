// Run with Playwright installed: node tests/scouting.cjs [existing server URL]
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

    const result = await page.evaluate(() => {
      G.fin.tb = G.fin.wb = 1e9; G.deals = [];
      const candidates = Object.values(G.players).filter(p => p.club !== G.club && G.clubs[p.club]?.pl && !p.inj && p.con > G.season);
      const p = candidates[0], from = p.club, cash = userClub().bal, tb = G.fin.tb, history = G.tHist.length;
      const offer = loanOffer(p.id, G.club, { duration: 26, fee: 1000, wageShare: 0, recall: true, optionFee: 500000, obligationApps: 10 });
      if (offer.error) throw Error(offer.error);
      const d = offer.deal;
      const out = { noInstant: p.club === from && !p.loan && userClub().bal === cash && G.fin.tb === tb && G.tHist.length === history,
        zeroShare: d.loanTerms.wageShare === 0, duplicate: !!loanOffer(p.id, G.club, d.loanTerms).error,
        premature: !!completeLoan(d).error };
      d.will = 'open'; d.id = 1;
      while (hash01(d.id + ':loan') < .4) d.id++;
      dealTick(d, true); dealTick(d, true);
      out.counter = d.need?.k === 'loancounter' && !p.loan;
      window.loanTestId = d.id;
      dealSheet(d.id);
      return out;
    });
    Object.entries(result).forEach(([name, ok]) => check(name, ok, true));
    await page.locator('[data-a="dealGo"][data-k="loanaccept"]').click();
    const ready = await page.evaluate(() => {
      const d = G.deals.find(x => x.id === loanTestId), stages = [];
      for (let i=0; i<5 && !d.need; i++) { stages.push(d.stage); dealTick(d, true); }
      dealSheet(d.id);
      return { final: d.need?.k === 'finalloan', notMoved: G.players[d.pid].club === d.from, stages };
    });
    check('Club, player and medical precede final approval', ready.final && ready.notMoved && ready.stages.includes('player') && ready.stages.includes('medical'), true);
    check('Loan sheet fits mobile', await page.evaluate(() => document.querySelector('#layer .sheet').scrollWidth <= document.querySelector('#layer .sheet').clientWidth + 1), true);
    const saved = await page.evaluate(() => {
      saveGame(); loadGame();
      const d = G.deals.find(x => x.id === loanTestId); dealSheet(d.id);
      return d.need.k === 'finalloan' && d.loanTerms.optionFee === 500000;
    });
    check('Pending loan and clauses survive save/load', saved, true);
    const blocked = await page.evaluate(() => {
      const d = G.deals.find(x => x.id === loanTestId), before = userClub().bal;
      G.fin.tb = 0;
      return !!completeLoan(d).error && !G.players[d.pid].loan && userClub().bal === before;
    });
    check('Final approval rechecks budget without moving or charging', blocked, true);
    await page.evaluate(() => G.fin.tb = 1e9);
    await page.locator('[data-a="dealGo"][data-k="loancomplete"]').click();
    const done = await page.evaluate(() => {
      const d = G.deals.find(x => x.id === loanTestId), p = G.players[d.pid], bal = userClub().bal;
      const repeat = completeLoan(d);
      return d.closed.ok && p.club === G.club && p.loan.parent === d.from && p.loan.optionFee === 500000 && p.loan.obligationApps === 10 && repeat.error && userClub().bal === bal;
    });
    check('Only final approval moves player and payment occurs once', !!done, true);
    const failures = await page.evaluate(() => {
      G.deals = [];
      const p = seniorSquad(G.club).find(p => !p.loan && p.con > G.season && !p.inj), host = domesticClubs().find(id => id !== G.club && squadSpace(G.clubs[id], p));
      G.clubs[host].bal = 1e9;
      const d = loanOffer(p.id, host, { duration: 16, fee: 0, wageShare: 75 }).deal;
      d.loanAgreed = true; p.listed = true;
      dealTick(d, true); dealTick(d, true); dealTick(d, true);
      p.inj = { w: 8, n: 'Broken leg' }; dealTick(d, true);
      const medical = !d.closed.ok && p.club === G.club && !p.loan;
      p.inj = null;
      const d2 = loanOffer(p.id, host, { duration: 16, fee: 0, wageShare: 75 }).deal;
      dealWalk(d2);
      const walk = !d2.closed.ok && !p.loan;
      const d3 = loanOffer(p.id, host, { duration: 16, fee: 0, wageShare: 75 }).deal;
      const old = [G.week, G.day];
      for (let w=0; w<SEASON_WEEKS; w++) { G.week = w; if (!inWindow()) break; }
      dealTick(d3, true); [G.week, G.day] = old;
      return { medical, walk, window: d3.closed?.ok === false };
    });
    Object.entries(failures).forEach(([name, ok]) => check(name, ok, true));
    check('No browser runtime errors', errors, []);
    console.log(JSON.stringify({ passed: checks.length, checks }, null, 2));
  } finally { await browser.close(); server.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
