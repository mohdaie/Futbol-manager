// Run with Playwright installed: node tests/life.cjs [existing server URL]
// Player life events: off-the-pitch stories, effects, your decisions and the sound-alike safety rule.
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('node:path');

(async () => {
  const browser = await chromium.launch({ headless: true, ...(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH, args: ['--no-sandbox', '--disable-dev-shm-usage'] } : {}) });
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const errors = [], checks = [];
  page.on('pageerror', e => errors.push(e.message));
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

    check('Name likeness: near-copies score high, different names low', await page.evaluate(() => [nameLikeness('Mohamadou Konte', 'Mohamadou Kanté') > 0.9, nameLikeness('Sondre Lindqvist', 'Kristoffer Ajer') < 0.2]), [true, true]);

    const rule = await page.evaluate(() => {
      const bad = Object.values(LIFE_EVENTS).filter(e => !e.good);
      const alikes = lifeCandidates().filter(soundAlike), others = lifeCandidates().filter(p => !soundAlike(p));
      return { alikes: alikes.length > 0, others: others.length > 0, blocked: alikes.every(p => bad.every(e => !lifeAllowed(p, e))), allowed: others.every(p => bad.every(e => lifeAllowed(p, e))) };
    });
    check('Negative events are blocked for sound-alikes of real people and allowed for others', rule, { alikes: true, others: true, blocked: true, allowed: true });

    const season = await page.evaluate(() => {
      const before = G.life?.list.length || 0, weeks = 30;
      for (let i = 0; i < weeks; i++) lifeWeekly();
      const L = G.life.list.slice(0, G.life.list.length - before), neg = ['accident', 'nightclub', 'social', 'homesick'];
      return { perWeek: L.length / weeks, negShare: L.filter(e => neg.includes(e.kind)).length / L.length,
        negOnAlike: L.filter(e => neg.includes(e.kind) && soundAlike(G.players[e.pid])).length, repeats: L.length - new Set(L.map(e => e.pid)).size,
        stories: L.every(e => G.news.some(n => n.story?.occasion === 'life-' + e.kind && n.action?.pid === e.pid)) };
    });
    check('About two life stories a week across the league', season.perWeek >= 1 && season.perWeek <= 3, true);
    check('Roughly one story in five is negative (between 8% and 40%)', season.negShare >= 0.08 && season.negShare <= 0.4, true);
    check('No negative story ever involves a sound-alike', season.negOnAlike, 0);
    check('A player has at most one event every six months', season.repeats, 0);
    check('Every event becomes a Beyond the Touchline story', season.stories, true);

    const effects = await page.evaluate(() => {
      const fresh = () => seniorSquad(G.club).find(p => !soundAlike(p) && !p.inj && !(p.lifeDay > dayAbs() - LIFE_GAP_DAYS));
      const a = fresh(); a.mor = 50; lifeHappen(a, 'ambassador'); const good = a.mor;
      const b = fresh(); lifeHappen(b, 'accident'); const injured = !!b.inj && b.inj.w >= 1;
      const c = fresh(); c.mor = 60; const conf = G.board.conf; const ev = lifeHappen(c, 'nightclub');
      const item = G.news.find(n => n.action?.t === 'life' && n.action.id === ev.id);
      const asked = !!item && needsYou(item) && item.box === 'inbox';
      const msg = lifeAnswer(ev.id, 'fine');
      const d = fresh(); const ev2 = lifeHappen(d, 'social'); G.life.list.find(e => e.id === ev2.id).day -= 8; lifeWeekly();
      const other = Object.values(G.players).find(p => p.club !== G.club && G.clubs[p.club]?.pl && !soundAlike(p) && !(p.lifeDay > dayAbs() - LIFE_GAP_DAYS));
      const before = G.news.filter(n => n.action?.t === 'life').length; lifeHappen(other, 'nightclub');
      return { good, injured, asked, fined: [c.mor, G.board.conf - conf, !!msg, needsYou(item)], expired: G.life.list.find(e => e.id === ev2.id).choice, otherAsks: G.news.filter(n => n.action?.t === 'life').length - before };
    });
    check('Good news lifts the player\'s morale', effects.good, 55);
    check('A car accident causes a short injury', effects.injured, true);
    check('A nightclub incident at your club asks you to decide in the Inbox', effects.asked, true);
    check('Fining him lowers his morale, raises board confidence and clears the Action tag', effects.fined, [51, 1, true, false]);
    check('A decision left for a week is settled without you', effects.expired, 'none');
    check('Incidents at other clubs are news only, not decisions for you', effects.otherAsks, 0);

    await page.evaluate(() => { UI.tab.nv = 'news'; UI.f.news = 'life'; go('news'); });
    check('News has an Off the pitch section led by Beyond the Touchline', await page.locator('.lead-story .p-life .mast b').textContent(), 'Beyond the Touchline');
    const id = await page.evaluate(() => { const p = seniorSquad(G.club).find(x => !soundAlike(x) && !(x.lifeDay > dayAbs() - LIFE_GAP_DAYS)); const ev = lifeHappen(p, 'homesick'); return G.news.find(n => n.action?.t === 'life' && n.action.id === ev.id).id; });
    await page.evaluate(id => ACT.news({ id }), id);
    check('The decision offers three choices with their effects in words', await page.locator('[data-a="lifeChoice"]').count(), 3);
    await page.locator('[data-a="lifeChoice"][data-k="family"]').click();
    check('Flying his family over costs the club money', await page.evaluate(() => G.life.list[0].choice), 'family');
    check('No page errors', errors, []);
    console.log(`${checks.length} life event checks passed`);
  } finally {
    await browser.close(); server.close();
  }
})().catch(e => { console.error(e); process.exit(1); });
