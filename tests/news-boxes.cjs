// Run with Playwright installed: node tests/news-boxes.cjs [existing server URL]
// News is split into public stories (News), private items (Inbox) and admin records (Club log).
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

    const routed = await page.evaluate(() => {
      const p = seniorSquad(G.club)[0];
      addNews('match', 'Gunners beat the Reds 2-0', 'Scorers: test.');
      addNews('league', 'September Player of the Month', 'Test.');
      addNews('transfer', 'X joins the Reds', 'Test.');
      addNews('club', 'Board concerned by finances', 'Test.');
      addNews('inbox', 'Bid for test', 'Test.', { t: 'bid', pid: p.id, from: 'CIT', fee: 1e6 });
      addNews('transfer', 'Agent pitch: test', 'Test.', { t: 'player', pid: p.id });
      addLog('club', 'Manager bonus paid', 'Test.');
      addStory('club', `${fullName(p)} signs a new contract`, 'Test.');
      return G.news.slice(0, 8).map(n => n.box).reverse();
    });
    check('Public results, awards and transfers go to News; private items to Inbox; payments to Club log', routed, ['news', 'news', 'news', 'inbox', 'inbox', 'inbox', 'log', 'news']);

    const legacy = await page.evaluate(() => {
      const mk = (cat, title, action) => ({ id: G.nextId++, date: today().getTime(), cat, title, body: '', action: action || null, read: false, done: false });
      const items = [mk('club', 'Transfer instalment paid'), mk('club', 'Manager bonus paid'), mk('club', 'Youth intake arrives'), mk('league', 'Retirements'), mk('club', 'Welcome to the Gunners'), mk('inbox', 'Press Officer: statement on X', { t: 'press', id: -1 })];
      G.news.unshift(...items);
      ensureNewsBoxes(); const first = items.map(n => n.box);
      ensureNewsBoxes(); const again = items.map(n => n.box);
      return { first, stable: JSON.stringify(first) === JSON.stringify(again) };
    });
    check('Saves from before the split are sorted once on load', legacy.first, ['log', 'log', 'news', 'news', 'inbox', 'inbox']);
    check('Sorting old saves is idempotent', legacy.stable, true);

    const cap = await page.evaluate(() => {
      const p = seniorSquad(G.club)[0];
      G.news = [];
      addNews('inbox', 'Waiting bid', 'Test.', { t: 'bid', pid: p.id, from: 'CIT', fee: 1e6 });
      for (let i = 0; i < 200; i++) addNews('match', 'Result ' + i, 'Test.');
      return { size: G.news.length, kept: G.news.some(n => n.title === 'Waiting bid') };
    });
    check('The 160-item cap never pushes out a decision still waiting for you', cap, { size: 160, kept: true });

    const stale = await page.evaluate(() => {
      const p = seniorSquad(G.club)[1];
      const d = { id: G.nextId++, dir: 'out', pid: p.id, from: G.club, to: 'CIT', stage: 'offer', need: { k: 'offer' }, fee: 5e6, log: [], created: dayAbs(), round: 0 };
      G.deals.unshift(d);
      addNews('transfer', 'Bid for test', 'Test.', { t: 'deal', id: d.id, pid: p.id });
      const before = needsYou(G.news[0]);
      closeDeal(d, false, 'Talks ended.', false);
      return [before, needsYou(G.news.find(n => n.title === 'Bid for test'))];
    });
    check('Closing a deal clears the Action tag on its inbox items', stale, [true, false]);

    await page.evaluate(() => { UI.tab.nv = 'news'; UI.f.news = 'all'; go('news'); });
    const newsView = await page.locator('.main .list .row').allTextContents();
    check('The News view lists only public stories', newsView.some(t => /Result 199/.test(t)) && !newsView.some(t => /Bid for test|Manager bonus/.test(t)), true);
    await page.evaluate(() => { UI.tab.nv = 'inbox'; UI.f.inbox = 'all'; render(); });
    const inboxView = await page.locator('.main .list .row').allTextContents();
    check('The Inbox view lists private items, not public results', inboxView.some(t => /Bid for test|Waiting bid/.test(t)) && !inboxView.some(t => /Result \d/.test(t)), true);
    await page.locator('[data-a="newsF"][data-v="action"]').click();
    const actionView = await page.locator('.main .list .row').allTextContents();
    check('Needs action shows only items still waiting for a decision', actionView.every(t => /Action/.test(t)) && actionView.some(t => /Waiting bid/.test(t)), true);
    await page.evaluate(() => { go('home'); });
    check('The dashboard links to the inbox', await page.locator('[data-a="newsOpen"][data-v="inbox"]').count() > 0, true);
    check('The bottom bar counts the inbox', /\d+ inbox/.test(await page.locator('.bb-sum').textContent()), true);
    check('No page errors', errors, []);
    console.log(`${checks.length} news split checks passed`);
  } finally {
    await browser.close(); server.close();
  }
})().catch(e => { console.error(e); process.exit(1); });
