// Run with Playwright installed: node tests/friendlies-ui.cjs [existing server URL]
// The assistant coach's pre-season friendlies on the fixtures screen. No provider calls.
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
  try {
    await page.goto(base + '/');
    await page.locator('[data-a="titleNew"]').click();
    await page.locator('[data-a="startGame"]').click();
    await page.evaluate(() => { go('fixtures'); });
    check('the fixtures screen offers the assistant coach in pre-season', await page.locator('[data-a="friendlyAnalyse"]').count(), 1);

    await page.locator('[data-a="friendlyAnalyse"]').click();
    await page.waitForSelector('[data-a="friendlyArrange"]', { timeout: 180000 });
    const rows = await page.locator('[data-a="friendlyArrange"]').count();
    check('the analysis lists overseas clubs to arrange', rows > 0 && rows <= 8, true);

    const before = await page.evaluate(() => G.fixtures.filter(f => f.fr).length);
    await page.locator('[data-a="friendlyArrange"]').first().click();
    const after = await page.evaluate(() => G.fixtures.filter(f => f.fr).length);
    check('arranging a friendly adds one pre-season fixture', after - before, 1);
    check('an arranged club is marked as arranged', await page.locator('.row', { hasText: 'Arranged' }).count() >= 1, true);

    const leagueBefore = await page.evaluate(() => leagueTable().reduce((n, r) => n + r.p, 0));
    await page.evaluate(() => { G.fixtures.filter(f => f.fr && !played(f)).forEach(quickSim); });
    const leagueAfter = await page.evaluate(() => leagueTable().reduce((n, r) => n + r.p, 0));
    check('a played friendly leaves the league table unchanged', leagueAfter, leagueBefore);

    await page.evaluate(() => { while (G.week < PRESEASON_WEEKS) advanceWeek(); go('fixtures'); });
    check('the assistant coach is hidden once the season starts', await page.locator('[data-a="friendlyAnalyse"]').count(), 0);
    check('no page errors', errors, []);
  } finally {
    await browser.close();
    server.close();
  }
  console.log(`friendlies UI checks passed: ${checks.length}`);
  for (const name of checks) console.log(' ok -', name);
})().catch(e => { console.error(e); process.exit(1); });
