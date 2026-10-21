// Run with Playwright installed: node tests/deals.cjs [existing server URL]
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
    // Helper in the page: run days, answering decisions like a manager who wants the deal.
    await page.evaluate(() => {
      window.runDays = (n, auto = true) => {
        for (let i = 0; i < n; i++) {
          const r = advanceDay(); if (r === 'match') { playUserInstant(userFixture()); continue; }
          if (!auto) continue;
          G.deals.filter(d => d.need && !d.closed && d.dir === 'in').forEach(d => {
            if (d.need.k === 'meeting') dealProceed(d, 'quiet', Math.max(d.memo.max, 60e6), 400000);
            else if (d.need.k === 'final') completeIn(d);
            else if (['bidlimit', 'notforsale', 'agentfee', 'wagelimit'].includes(d.need.k)) { G.fin.tb = Math.max(G.fin.tb, 200e6); G.fin.wb += 400000; dealRaise(d, d.need.k === 'wagelimit' ? d.need.wage : d.need.k === 'agentfee' ? d.agentFee : d.need.fee); }
          });
        }
      };
    });
    const r = await page.evaluate(() => {
      G.fin.tb = 150e6; G.fin.wb += 300000;
      const me = userClub();
      const p = Object.values(G.players).find(x => G.clubs[x.club].pl && x.club !== G.club && lvlOf(x) === 'A' && !isKeyPlayer(x) && x.ca < me.rep - 4 && x.age < 29 && !x.inj);
      G.know[p.id] = 70; addKnowledge(p, 25, 'Test');
      const d = activeDeal(p.id, 'in');
      const out = { pid: p.id, from: p.club, queued: !!d, stage0: d && d.stage, folder: scoutFile(p).folder, week: G.week, window: inWindow() };
      runDays(3, false);
      out.need = d.need && d.need.k; out.memo = d.memo && [d.memo.fin.length > 0, d.memo.tac.length > 0, d.memo.har.length > 0, d.memo.verdict];
      out.newsQuiet = G.news.filter(n => n.action && n.action.t === 'deal' && n.action.id === d.id).map(n => !!n.q);
      out.id = d.id;
      return out;
    });
    console.log('review', JSON.stringify(r));
    check('A file reaching 90% goes to the Director of Football', [r.queued, r.stage0, r.folder], [true, 'review', 'dof']);
    check('Director writes a memo and asks for a meeting', r.need, 'meeting');
    check('Memo covers finance, tactics and harmony', r.memo.slice(0, 3), [true, true, true]);
    check('The meeting stops the calendar (decision news)', r.newsQuiet.includes(false), true);

    await page.evaluate(id => { closeSheet(true); dealSheet(id); }, r.id);
    check('Deal sheet shows the meeting with limits', await page.locator('#layer [data-a="dealGo"][data-k="proceed"]').count(), 1);
    check('Deal sheet fits the phone', await page.evaluate(() => document.querySelector('#layer .sheet').scrollWidth <= document.querySelector('#layer .sheet').clientWidth + 1), true);
    await page.screenshot({ path: '/tmp/futbol-deal-meeting.png' });
    await page.locator('#layer [data-a="dealGo"][data-k="proceed"]').click();
    const flow = await page.evaluate(id => {
      const d = G.deals.find(x => x.id === id), start = dayAbs(), stages = new Set([d.stage]);
      for (let i = 0; i < 40 && !d.closed; i++) { runDays(1); stages.add(d.stage); }
      const p = G.players[d.pid];
      return { closed: d.closed, days: dayAbs() - start, stages: [...stages], club: p.club === G.club, log: d.log.length, fee: d.fee, wage: d.wage, summary: dealSummary(d) };
    }, r.id);
    console.log('flow', JSON.stringify(flow));
    if (flow.club) {
      check('Signing passes through every stage', ['interest', 'bid', 'agent', 'terms', 'player', 'medical', 'final'].every(s => flow.stages.includes(s)), true);
      check('A signing takes days, not a tap', flow.days >= 6, true);
    } else check('A collapsed deal says why', typeof flow.closed.why, 'string');
    check('Each step is on the timeline', flow.log >= 6, true);

    const many = await page.evaluate(() => {
      // Several signings to see completions and collapses.
      const me = userClub(), res = { done: 0, off: 0, why: [] };
      const pool = Object.values(G.players).filter(x => G.clubs[x.club] && !G.clubs[x.club].fa && x.club !== G.club && lvlOf(x) === 'A' && !activeDeal(x.id) && x.ca < me.rep);
      const ds = pool.slice(0, 8).map(p => { const d = startDeal(p, 'review'); DEAL_STEP.in.review(d, p); return d; });
      runDays(30);
      ds.forEach(d => { if (d.closed && d.closed.ok) res.done++; else if (d.closed) { res.off++; res.why.push(d.closed.why.slice(0, 50)); } });
      return res;
    });
    console.log('many', JSON.stringify(many));
    check('Most rational deals complete', many.done >= 3, true);

    const out = await page.evaluate(() => {
      const p = seniorSquad(G.club).find(x => !x.inj && x.pers !== 'Loyal'), b = G.clubs[plClubs().find(id => id !== G.club && G.clubs[id].rep > userClub().rep)] || G.clubs[plClubs().find(id => id !== G.club)];
      bidForUser(b, p, roundMoney(pValue(p) * 1.3));
      const d = activeDeal(p.id, 'out'), first = d.need && d.need.k;
      answerOffer(d, 'accept');
      for (let i = 0; i < 12 && !d.closed && !(d.need && d.need.k === 'finalout'); i++) runDays(1, false);
      const ready = d.need && d.need.k;
      if (ready === 'finalout') completeOut(d);
      // A bid that meets a release clause skips your answer.
      const q = seniorSquad(G.club).find(x => x.id !== p.id); q.rc = 5e6;
      bidForUser(b, q, 6e6);
      const rc = activeDeal(q.id, 'out');
      return { first, ready, sold: p.club === b.id || !!(d.closed && !d.closed.ok), rcStage: rc.stage, rcNeed: rc.need || null };
    });
    console.log('out', JSON.stringify(out));
    check('An offer for your player waits for your answer', out.first, 'offer');
    check('Accepted sale ends with your sanction (or the player stays)', out.ready === 'finalout' || out.sold, true);
    check('Release clause cannot be refused', [out.rcStage, out.rcNeed], ['terms', null]);

    const ai = await page.evaluate(() => {
      G.week = 1; G.day = 0;
      const res = { instantMoves: 0, done: 0, off: 0, hijack: null };
      const cs = plClubs().filter(id => id !== G.club).map(id => G.clubs[id]);
      const targets = Object.values(G.players).filter(x => G.clubs[x.club] && !G.clubs[x.club].pl && !G.clubs[x.club].fa && !activeDeal(x.id)).slice(0, 10);
      const ds = targets.map((p, i) => { aiDeal(cs[i % cs.length], p, 1e6); return activeDeal(p.id, 'ai'); });
      targets.forEach(p => { if (G.players[p.id].club === cs[0].id) res.instantMoves++; });
      // Your deal for a player a rival signs first.
      const h = targets[0], mine = startDeal(h, 'interest', { lim: { fee: 1e9, wage: 1e6 } });
      runDays(14, false);
      ds.forEach(d => { if (d.closed && d.closed.ok) res.done++; else if (d.closed) res.off++; });
      res.hijack = G.players[h.id].club !== mine.from ? (mine.closed ? mine.closed.why : 'open') : 'not signed';
      return res;
    });
    console.log('ai', JSON.stringify(ai));
    check('Computer clubs do not sign instantly', ai.instantMoves, 0);
    check('Computer deals complete over days (some collapse)', ai.done >= 5, true);
    check('A rival signing your target ends your deal', ai.hijack === 'not signed' || ai.hijack.includes('instead'), true);

    const shut = await page.evaluate(() => {
      const p = Object.values(G.players).find(x => G.clubs[x.club].pl && x.club !== G.club && !activeDeal(x.id));
      const d = startDeal(p, 'bid', { lim: { fee: 1e9, wage: 1e6 }, fee: 1e6, opened: true });
      G.week = 12; G.day = 0; dealsDay();
      return d.closed && d.closed.why;
    });
    check('Window shutting mid-deal collapses it', /window shut/.test(shut || ''), true);

    const old = await page.evaluate(() => { delete G.deals; G.staff = G.staff.filter(s => s.role !== 'Director'); saveGame(); loadGame(); return [Array.isArray(G.deals), staffOf('Director').length]; });
    check('Older saves get deals and a Director of Football', old, [true, 1]);
    await page.evaluate(() => { G.week = 2; closeSheet(true); UI.tab.tr = 'deals'; go('transfers'); });
    check('Deals tab renders', await page.locator('.main .card h3').first().innerText().then(t => t.startsWith('Director of Football')), true);
    await page.screenshot({ path: '/tmp/futbol-deals-tab.png', fullPage: true });
    check('No browser runtime errors', errors, []);
    console.log(JSON.stringify({ passed: checks.length, checks }, null, 2));
  } finally { await browser.close(); server.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
