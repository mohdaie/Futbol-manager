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
    const r = await page.evaluate(() => {
      const out = { press: staffOf('Press').length, acc: Object.keys(MEDIA).length };
      const n0 = G.social.length;
      for (let i = 0; i < 14; i++) { const x = advanceDay(); if (x === 'match') playUserInstant(userFixture()); }
      out.posts = G.social.length - n0;
      out.fake = G.social.filter(p => p.kind === 'rumour' && !p.real).length;
      out.kinds = [...new Set(G.social.map(p => p.kind))];
      out.replies = G.social.filter(p => p.replies.length).length;
      // A computer deal produces posts from talks to "here we go".
      const c = G.clubs[plClubs().find(id => id !== G.club && G.clubs[id].rep >= 75)];
      const p = Object.values(G.players).find(x => G.clubs[x.club].pl && x.club !== c.id && x.club !== G.club && !activeDeal(x.id) && x.ca > 74);
      aiDeal(c, p, 30e6); const d = activeDeal(p.id, 'ai');
      for (let i = 0; i < 12 && !d.closed; i++) { const x = advanceDay(); if (x === 'match') playUserInstant(userFixture()); }
      out.aiPosts = G.social.filter(x => x.deal === d.id).map(x => x.kind);
      out.aiOk = d.closed && d.closed.ok;
      return out;
    });
    console.log('social', JSON.stringify(r));
    check('Press Officer joins the staff', r.press, 1);
    check('Fictional media accounts exist', r.acc >= 14, true);
    check('The feed fills day by day in a window', r.posts >= 8, true);
    check('False rumours appear', r.fake >= 3, true);
    check('Fans reply to posts', r.replies >= 3, true);
    check('A big computer deal is reported from talks to done', r.aiOk ? r.aiPosts.includes('here') && r.aiPosts.includes('done') : r.aiPosts.includes('off'), true);

    const pr = await page.evaluate(() => {
      G.fin.tb = 200e6;
      const p = Object.values(G.players).find(x => G.clubs[x.club].pl && x.club !== G.club && lvlOf(x) === 'A' && !activeDeal(x.id) && !isKeyPlayer(x));
      const d = startDeal(p, 'review'); DEAL_STEP.in.review(d, p);
      G.media.req = [];
      dealProceed(d, 'open', 100e6, 300000);
      const post = G.social.find(x => x.deal === d.id), req = G.media.req.find(x => x.pid === p.id);
      return { post: post && post.kind, req: req && req.kind, advice: req && req.advice, id: req && req.id, did: d.id };
    });
    console.log('press', JSON.stringify(pr));
    check('An open approach is reported', pr.post, 'talks');
    check('The Press Officer asks for a statement on your target', pr.req, 'target');
    const ans = await page.evaluate(({ id, did }) => { const d = G.deals.find(x => x.id === did); d.ask = 10e6; const n = G.social.length; pressAnswer(id, 'confirm'); return [d.pub, d.ask, G.social.length > n, G.social[0].acc === 'off:' + G.club]; }, pr);
    check('Confirming interest goes public, raises the price and posts a statement', ans, [true, 10.5e6, true, true]);
    const leak = await page.evaluate(() => {
      const test = rating => {
        staffOf('Press')[0].rating = rating; let leaks = 0;
        const ds = Object.values(G.players).filter(x => G.clubs[x.club] && !G.clubs[x.club].fa && x.club !== G.club && !activeDeal(x.id)).slice(0, 40).map(p => { const d = startDeal(p, 'bid', { approach: 'quiet', lim: { fee: 1, wage: 1 }, next: 1e9 }); return d; });
        const day0 = G.day;
        for (let k = 0; k < 20; k++) { G.day = k % 7; G.week += k % 7 === 6 ? 1 : 0; socialDay(); }
        G.day = day0;
        ds.forEach(d => { if (d.leaked) leaks++; d.closed = { ok: false, why: 'test', date: 0 }; });
        return leaks;
      };
      const w = G.week, bad = test(2), good = test(20); G.week = w;
      return [bad, good];
    });
    console.log('leaks with Press Officer 2 / 20:', leak.join(' / '));
    check('A better Press Officer keeps quiet talks quiet', leak[0] > leak[1], true);

    await page.evaluate(() => { UI.tab.nv = 'tc'; go('news'); });
    check('Transfer centre renders', await page.locator('.main .card h3').first().innerText().then(t => t.startsWith('Press Officer')), true);
    await page.screenshot({ path: '/tmp/futbol-tc.png', fullPage: true });
    await page.evaluate(() => { UI.tab.nv = 'social'; render(); });
    check('Social feed shows posts', await page.locator('.main .spost').count() > 5, true);
    check('Feed fits the phone', await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), true);
    await page.screenshot({ path: '/tmp/futbol-social.png' });
    await page.locator('.main .spost').first().click();
    check('A post opens its thread', await page.locator('#layer .spost.full').count() >= 1, true);
    const old = await page.evaluate(() => { delete G.social; delete G.media; G.staff = G.staff.filter(s => s.role !== 'Press'); saveGame(); loadGame(); return [Array.isArray(G.social), !!G.media, staffOf('Press').length]; });
    check('Older saves get the feed and a Press Officer', old, [true, true, 1]);
    check('No browser runtime errors', errors, []);
    console.log(JSON.stringify({ passed: checks.length, checks }, null, 2));
  } finally { await browser.close(); server.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
