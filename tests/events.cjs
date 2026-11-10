// Run with Playwright installed: node tests/events.cjs [existing server URL]
// Dressing-room events: situations, choices, promises kept and broken, and the Dashboard card.
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
  try {
    await page.goto(base + '/');
    await page.locator('[data-a="titleNew"]').click();
    await page.locator('[data-a="startGame"]').click();

    const r = await page.evaluate(() => {
      const out = {}, sq = seniorSquad(G.club), p = sq[0];
      // Every kind: forcing it creates an Inbox item and each choice runs without error.
      out.kinds = Object.keys(EVT_KINDS).length;
      p.status = 'Key player'; p.mor = 40; G.tactics.slots = sq.slice(5, 16).map(x => x.id);
      const ev = eventHappen('benched', [p.id]);
      out.news = G.news.some(n => n.action?.t === 'evt' && n.action.id === ev.id && !n.done);
      out.card = eventCard().includes('data-a="evtChoice"');
      const m0 = p.mor; eventAnswer(ev.id, 'promise');
      out.promiseMade = !!promiseOf(p.id); out.pleased = p.mor > m0; out.done = G.news.some(n => n.action?.id === ev.id && n.done);
      // Kept: start him two weeks running.
      G.tactics.slots = [p.id, ...sq.slice(5, 15).map(x => x.id)];
      const before = p.mor; promisesWeekly(); promisesWeekly();
      out.kept = !promiseOf(p.id) && p.mor > before;
      // Broken: leave him out until the deadline.
      const q = sq[1]; q.mor = 60; G.tactics.slots = sq.slice(5, 16).map(x => x.id);
      makePromise(q, 'start', 0); const after = q.mor;
      eventState().promises.find(x => x.pid === q.id && !x.done).until = dayAbs() - 1; promisesWeekly();
      out.broken = q.mor < after - 10 && !!q.unset && G.news.some(n => n.title.includes('broke your promise'));
      // Ignored events resolve on their own and cost morale.
      const r2 = sq[2]; r2.mor = 60; r2.status = 'Key player';
      const ev2 = eventHappen('benched', [r2.id]); ev2.day = dayAbs() - 8; eventsWeekly();
      out.auto = ev2.choice === 'ignore' && r2.mor < 60;
      // Each kind's choices and ignore path run cleanly on real players.
      out.errors = [];
      Object.entries(EVT_KINDS).forEach(([k, K]) => {
        K.choices.concat([['ignore']]).forEach(c => {
          try {
            const ps = sq.slice(3, 8); ps.forEach(x => { x.mor = 40; x.unset = { to: nearestBigClub(x), lvl: 2, since: dayAbs() }; });
            const e = eventHappen(k, ps.slice(0, k === 'clash' ? 2 : k === 'unhappy' ? 5 : 1).map(x => x.id));
            eventAnswer(e.id, c[0]);
            if (!e.choice) out.errors.push(k + ':' + c[0]);
          } catch (x) { out.errors.push(k + ':' + c[0] + ' ' + x.message); }
        });
      });
      render();
      return out;
    });
    check('Six situations exist', r.kinds, 6);
    check('An event lands in the Inbox as an action item', r.news, true);
    check('The Dashboard card has choice buttons', r.card, true);
    check('Promising a start pleases him and records the promise', [r.promiseMade, r.pleased, r.done], [true, true, true]);
    check('Keeping a promise settles it with a morale lift', r.kept, true);
    check('Breaking a promise hurts morale, unsettles him and tells you', r.broken, true);
    check('An unanswered event resolves as ignored', r.auto, true);
    check('Every choice of every kind runs', r.errors, []);

    await page.evaluate(() => { const p = seniorSquad(G.club)[4]; p.status = 'Key player'; p.mor = 40; eventHappen('benched', [p.id]); go('home'); });
    check('The card renders on the Dashboard', await page.locator('.evcard').count(), 1);
    await page.locator('.evcard [data-k="promise"]').click();
    check('Tapping a choice removes the card', await page.locator('.evcard').count(), 0);
    check('No browser runtime errors', errors, []);
    console.log(JSON.stringify({ passed: checks.length, checks }, null, 2));
  } finally { await browser.close(); server.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
