// Run with Playwright installed: node tests/mood.cjs [existing server URL]
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
    const r = await page.evaluate(() => {
      const out = {}, sq = seniorSquad(G.club), big = Object.values(G.clubs).filter(c => c.pl && c.id !== G.club).sort((a, b) => b.rep - a.rep)[0];
      const amb = sq.find(p => p.status !== 'Key player') || sq[0], loyal = sq.find(p => p !== amb);
      Object.assign(amb, { pers: 'Ambitious', amb: 18, mor: 60, status: 'Rotation' }); Object.assign(loyal, { pers: 'Loyal', amb: 4, mor: 70, status: 'Key player' });
      const m0 = amb.mor;
      transferBuzz(amb, big.id, true); transferBuzz(loyal, big.id, true);
      out.amb = [!!amb.unset, m0 - amb.mor, G.news.some(n => n.title.includes('distracted') && n.action && n.action.pid === amb.id)];
      out.loyal = [!!loyal.unset, loyal.mor];
      transferBuzz(amb, big.id, true);
      for (let w = 0; w < 2; w++) { amb.unset.since = dayAbs() - 8; moodWeekly(); }
      out.treq = !!amb.treq; out.treqNews = G.news.some(n => n.action && n.action.t === 'treq' && n.action.pid === amb.id);
      const mBefore = amb.mor; out.accept = answerRequest(amb, true); out.listed = amb.listed; out.morUp = amb.mor - mBefore;
      // Fading: four weeks without links.
      amb.unset.since = dayAbs() - 40; for (let w = 0; w < 4; w++) { moodWeekly(); if (amb.unset) amb.unset.since = dayAbs() - 40; }
      out.faded = !amb.unset;
      // Statements.
      const s1 = sq.find(p => !p.unset && p !== loyal); s1.mor = 70; delete s1.unset; s1.treq = null;
      out.nfsSettled = statementMood(s1, 'notforsale');
      s1.unset = { to: big.id, lvl: 2, since: dayAbs() }; out.nfsUnsettled = statementMood(s1, 'notforsale'); out.listenUnsettled = statementMood(s1, 'listen');
      return out;
    });
    console.log('mood', JSON.stringify(r));
    check('A link to a bigger club unsettles an ambitious player', r.amb, [true, r.amb[1] > 0 ? r.amb[1] : -1, true].map((x, i) => i === 1 ? r.amb[1] : x));
    check('Morale drops when unsettled', r.amb[1] >= 4, true);
    check('A loyal key player shrugs it off', r.loyal, [false, 70]);
    check('A long unsettled spell ends in a transfer request', [r.treq, r.treqNews], [true, true]);
    check('Accepting the request lists him and lifts his morale', [r.listed, r.morUp > 0], [true, true]);
    check('The feeling fades without new links', r.faded, true);
    check('"Not for sale" pleases a settled player, annoys an unsettled one', [r.nfsSettled > 0, r.nfsUnsettled < 0, r.listenUnsettled > 0], [true, true, true]);

    const s = await page.evaluate(() => {
      G.fin.tb = 400e6; G.fin.wb += 900000;
      const sq = seniorSquad(G.club), T = G.tactics;
      const starter = sq.find(p => T.slots.includes(p.id) && p.pos !== 'GK' && !['Determined', 'Professional'].includes(p.pers));
      const target = Object.values(G.players).find(x => x.club !== G.club && G.clubs[x.club].pl && x.pos === starter.pos && x.ca >= ovrAt(starter, starter.pos) && !activeDeal(x.id));
      const bench = sq.find(p => !T.slots.includes(p.id) && p.nat !== target.nat && p.id !== starter.id);
      const mate = sq.find(p => p.nat === target.nat && p.id !== starter.id && !(T.slots.includes(p.id) && (p.pos === target.pos || target.alt.includes(p.pos))));
      const before = { starter: starter.mor, bench: bench.mor, mate: mate ? mate.mor : null, fans: G.board.fans };
      const d = startDeal(target, 'final', { lim: { fee: 1e9, wage: 1e6 }, fee: 30e6, wage: 30000, years: 4, status: 'Key player', need: { k: 'final' } });
      completeIn(d);
      const after = { starter: starter.mor - before.starter, bench: bench.mor - before.bench, mate: mate ? mate.mor - before.mate : null, fans: G.board.fans - before.fans, news: G.news.some(n => n.title.startsWith('Dressing room reacts')) };
      // A key player sold to a league rival.
      const key = seniorSquad(G.club).find(p => p.id !== target.id && !activeDeal(p.id)); key.status = 'Key player';
      const rival = plClubs().find(id => id !== G.club);
      const others = seniorSquad(G.club).filter(p => p.id !== key.id).slice(0, 5), m = others.map(p => p.mor), f0 = G.board.fans;
      const od = { id: G.nextId++, dir: 'out', pid: key.id, from: G.club, to: rival, stage: 'final', need: { k: 'finalout' }, fee: 20e6, log: [], created: 0, round: 0 }; G.deals.unshift(od);
      completeOut(od);
      return { ...after, sale: others.map((p, i) => p.mor - m[i]).every(x => x <= -2), saleFans: G.board.fans - f0 };
    });
    console.log('signing', JSON.stringify(s));
    check('A big signing lifts the squad and fans', [s.bench >= 2, s.fans >= 2], [true, true]);
    check('The starter he replaces is worried', s.starter < 0, true);
    if (s.mate != null) check('Compatriots are pleased', s.mate >= 3, true);
    check('The dressing room reaction is reported', s.news, true);
    check('Selling a key player to a rival hits squad and fans', [s.sale, s.saleFans <= -4], [true, true]);

    await page.evaluate(() => { const p = seniorSquad(G.club)[3]; p.unset = { to: plClubs().find(id => id !== G.club), lvl: 2, since: dayAbs() }; playerSheet(p.id); });
    check('Profile shows he is unsettled', await page.locator('#layer .tag.warn', { hasText: 'Unsettled' }).count(), 1);
    check('No browser runtime errors', errors, []);
    console.log(JSON.stringify({ passed: checks.length, checks }, null, 2));
  } finally { await browser.close(); server.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
