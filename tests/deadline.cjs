// Run with Playwright installed: node tests/deadline.cjs [existing server URL]
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
    const w = await page.evaluate(() => {
      const keep = [G.week, G.day], open = { s: [], j: [] }, closedOff = [];
      for (let wk = 0; wk < SEASON_WEEKS; wk++) for (let d = 0; d < 7; d++) {
        G.week = wk; G.day = d; const s = windowState();
        if (s.open) (s.label.startsWith('Summer') ? open.s : open.j).push(fmtDate(today(), false));
        if (wk >= SEASON_WEEKS - 2 && s.open) closedOff.push(wk);
      }
      [G.week, G.day] = keep;
      return { summer: open.s.length, first: open.s[0], last: open.s[open.s.length - 1], jan: open.j.length, jlast: open.j[open.j.length - 1], off: closedOff.length };
    });
    console.log('windows', JSON.stringify(w));
    check('Summer window lasts about eight weeks', w.summer >= 53 && w.summer <= 60, true);
    check('Summer deadline day is 1 September', w.last.startsWith('1 Sep'), true);
    check('January window runs to 2 February', [w.jan >= 31, w.jlast.startsWith('2 Feb')], [true, true]);
    check('No window at the end of the season', w.off, 0);

    // Move to deadline day with deals in progress.
    const pre = await page.evaluate(() => {
      G.fin.tb = 300e6; G.fin.wb += 600000;
      let guard = 0;
      while (!deadlineToday() && guard++ < 80) { const r = advanceDay(); if (r === 'match') playUserInstant(userFixture()); }
      const mine = Object.values(G.players).filter(x => G.clubs[x.club].pl && x.club !== G.club && lvlOf(x) === 'A' && !activeDeal(x.id) && !isKeyPlayer(x)).slice(0, 3)
        .map(p => startDeal(p, 'bid', { lim: { fee: 1e9, wage: 1e6 }, fee: roundMoney(askingPrice(p)), approach: 'open', opened: true, next: dayAbs() + 5 }).id);
      // Answer outstanding decisions from the setup's time skip before pressing Continue.
      pendingTransferDecisions().forEach(d => { if(d.need.k==='offer')answerOffer(d,'reject');else dealWalk(d); });
      return { date: fmtDate(today(), false), mine, t0: G.tHist.length, s0: G.social.length };
    });
    check('Calendar reaches deadline day', pre.date.startsWith('1 Sep'), true);
    await page.evaluate(() => { G.settings.speed = 4; go('home'); ACT.continue(); });
    await page.waitForFunction(() => G.dd?.h >= 9, null, { timeout: 15000 });
    const decisionFirst = await page.evaluate(() => pendingTransferDecisions().length > 0);
    check('Deadline day shows its clock or pauses for a required transfer response', decisionFirst ? await page.evaluate(() => !DAYRUN.on && UI.popup?.key.startsWith('deal:')) : await page.locator('#dayrun .dr-cal.dl .dr-day').innerText() === '09:00', true);
    check('Deadline day stops for news or a required decision', decisionFirst || await page.locator('#dayrun', { hasText: 'Deadline day' }).count() >= 1, true);
    if (decisionFirst) await page.evaluate(() => {
      pendingTransferDecisions().forEach(d => { if(d.need.k==='final')completeIn(d);else if(d.need.k==='offer')answerOffer(d,'reject');else if(d.need.k==='finalout')blockOut(d);else if(['bidlimit','notforsale','agentfee','wagelimit'].includes(d.need.k))dealRaise(d,d.need.wage||d.need.fee||d.agentFee);else dealWalk(d); });
      closeSheet(true);
    });
    await page.screenshot({ path: '/tmp/futbol-deadline-0900.png' });
    await page.evaluate(() => ACT.dayRunGo());
    await page.waitForFunction(() => G.dd.h >= 13 || !DAYRUN.on, null, { timeout: 30000 });
    await page.evaluate(() => { if (DAYRUN.on) ACT.dayRunStop(); });
    const hourNow = await page.evaluate(() => G.dd.h);
    check('Hours tick by on deadline day', hourNow >= 10, true);
    await page.screenshot({ path: '/tmp/futbol-deadline-hours.png' });
    const post = await page.evaluate(pre => {
      ACT.dayRunClose();
      // Answer anything urgent like a manager who wants deals done, then let the day finish.
      const answer = () => G.deals.filter(d => d.need && dealOpen(d)).forEach(d => { if (d.need.k === 'final') completeIn(d); else if (d.need.k === 'offer') answerOffer(d, 'reject'); else if (d.need.k === 'finalout') blockOut(d); else if (['bidlimit', 'notforsale', 'agentfee', 'wagelimit'].includes(d.need.k)) dealRaise(d, d.need.k === 'wagelimit' ? d.need.wage : d.need.k === 'agentfee' ? d.agentFee : d.need.fee); });
      while (!G.dd.done) { answer(); deadlineHour(); }
      const day = { h: G.dd.h, deals: G.tHist.length - pre.t0, posts: G.social.length - pre.s0, ticker: G.social.some(p => p.kind === 'ticker'), shut: G.news.some(n => n.title === 'The window has shut') };
      const openMine = pre.mine.map(id => G.deals.find(d => d.id === id)).filter(d => dealOpen(d) && WINDOW_STAGES.includes(d.stage)).length;
      const step = () => { const r = advanceDay(); if (r === 'match') playUserInstant(userFixture()); };
      let g = 0; while (inWindow() && g++ < 5) step();
      step(); // the first day after the window shut
      day.after = pre.mine.map(id => G.deals.find(d => d.id === id)).map(d => d.closed ? (d.closed.ok ? 'done' : /window shut/.test(d.closed.why) ? 'shut' : 'off') : 'open');
      day.openMine = openMine; day.window = inWindow(); day.aiOpen = G.deals.filter(d => dealOpen(d) && d.dir === 'ai' && WINDOW_STAGES.includes(d.stage)).length;
      return day;
    }, pre);
    console.log('deadline', JSON.stringify(post));
    check('The day runs to 23:00', post.h, 23);
    check('A busy deadline day: deals done and the feed buzzing', [post.deals >= 2, post.posts >= 10, post.ticker], [true, true, true]);
    check('Window-shut news', post.shut, true);
    check('Window closed the next morning', post.window, false);
    check('Unfinished deals collapse when the window shuts', post.after.every(x => x !== 'open') && post.aiOpen === 0, true);
    await page.evaluate(() => { UI.tab.tr = 'deals'; go('transfers'); });
    check('Transfers banner says when the window opens', await page.locator('.main .banner b').innerText().then(t => /opens 1 Jan/.test(t)), true);
    check('No browser runtime errors', errors, []);
    console.log(JSON.stringify({ passed: checks.length, checks }, null, 2));
  } finally { await browser.close(); server.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
