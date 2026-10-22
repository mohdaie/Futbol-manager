// Run with Playwright installed: node tests/live-tactics.cjs [existing server URL]
// Live match: the tactics page (pitch, swaps, roles) and the gap after a dismissal. No provider calls.
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
    try { res.setHeader('Content-Type', ({ '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css', '.webp': 'image/webp' })[path.extname(file)] || 'application/octet-stream'); res.end(fs.readFileSync(file)); } catch { res.writeHead(404).end(); }
  });
  if (!process.argv[2]) await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const base = process.argv[2] || 'http://127.0.0.1:' + server.address().port;
  await page.route('https://fonts.googleapis.com/**', route => route.abort());
  const check = (name, actual, expected) => { assert.deepEqual(actual, expected, name); checks.push(name); };
  const act = (name, ds = {}) => page.evaluate(({ name, ds }) => viewAction(() => ACT[name](ds)), { name, ds });
  try {
    await page.goto(base + '/');
    await page.locator('[data-a="titleNew"]').click();
    await page.locator('[data-a="startGame"]').click();
    await page.evaluate(() => { G.settings.speed = 4; while (!userFixture()) advanceWeek(); go('prematch'); });
    await act('kickoff');
    await page.waitForFunction(() => LIVE && LIVE.M.min >= 1, null, { timeout: 30000 });

    await act('liveSheet', { k: 'tactics' });
    const toks = await page.locator('.tpitch .tok').count();
    check('the tactics page shows every player on the pitch', toks, await page.evaluate(() => LIVE.M.sides[LIVE.bottom].on.filter(Boolean).length));

    const before = await page.evaluate(() => LIVE.M.sides[LIVE.bottom].on.slice(2, 8));
    await act('liveSwapMode');
    await act('liveTok', { i: 2 });
    await act('liveTok', { i: 7 });
    const after = await page.evaluate(() => LIVE.M.sides[LIVE.bottom].on.slice(2, 8));
    check('two players swap places on the pitch', [after[0], after[5]], [before[5], before[0]]);

    await act('liveSwapMode');
    await act('liveTok', { i: 3 });
    await act('liveRole', { i: 3, k: 0 });
    check('a role can be set during the match', await page.evaluate(() => LIVE.M.sides[LIVE.bottom].roles[3]), 0);

    // A dismissal leaves a gap; the manager moves a team-mate into it.
    await act('closeSheet');
    await page.evaluate(() => { const S = liveSide(), id = S.on[5]; sendOff(LIVE.M, S, id, { min: LIVE.M.min, side: 1 - S.idx, t: 'foul', pid: id }); syncSide(LIVE.M, S.idx); openLiveSheet('gap'); });
    check('the gap is shown after a dismissal', await page.locator('.sh-t', { hasText: 'A man down' }).count() > 0, true);
    const mover = await page.evaluate(() => liveSide().on[7]);
    await act('gapMove', { id: mover });
    check('a team-mate moves into the gap and leaves a new one', await page.evaluate(() => { const S = liveSide(); return S.on[5] === null || S.on[5] === undefined ? false : S.on.indexOf(null) === 7; }), true);
  } finally {
    await browser.close(); server.close();
  }
  check('no page errors', errors, []);
  console.log(`live tactics checks passed: ${checks.length}`);
})().catch(e => { console.error(e); process.exit(1); });
