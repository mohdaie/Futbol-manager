// Run with Playwright installed: node tests/updates.cjs [existing server URL]
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
    const VER = fs.readFileSync(path.join(root, 'js/core/data.js'), 'utf8').match(/GAME_VERSION = '([^']+)'/)[1];
    let remote = VER, refetched = [];
    await page.route('**/js/core/data.js*', async route => {
      const req = route.request();
      if (req.resourceType() !== 'fetch') return route.continue();
      if (!req.url().includes('check=')) { refetched.push(req.url()); return route.continue(); }
      const text = fs.readFileSync(path.join(root, 'js/core/data.js'), 'utf8').replace(VER, remote);
      route.fulfill({ body: text, contentType: 'application/javascript' });
    });
    const status = () => page.locator('#title-update').innerText();
    await page.goto(base + '/');
    await page.waitForFunction(() => UPDATE.state === 'latest');
    check('Title checks for updates on load', await status(), 'Up to date · version ' + VER);
    check('Fresh install shows New game, Options and Check for updates', await page.locator('.title-menu button').allInnerTexts(), ['New game', 'Options', 'Check for updates']);
    await page.locator('[data-a="titleNew"]').click();
    await page.locator('[data-a="startGame"]').click();
    await page.evaluate(() => go('title'));
    check('Saved career shows Continue game first', await page.locator('.title-menu button').allInnerTexts(), ['Continue game', 'New game', 'Options', 'Check for updates']);
    await page.locator('[data-a="titleNew"]').click();
    check('New game asks before replacing a save', await page.locator('#layer [data-a="titleNewGo"]').count(), 1);
    await page.locator('#layer [data-a="titleNewGo"]').click();
    check('Confirmed New game opens club choice', await page.evaluate(() => UI.s), 'start');
    await page.evaluate(() => go('title'));
    await page.locator('[data-a="titleUpdate"]').click();
    await page.waitForFunction(() => UPDATE.state === 'latest');
    check('Manual check reports up to date', await status(), 'Up to date · version ' + VER);

    remote = VER.replace(/\d+$/, n => +n + 1);
    const nav = page.waitForEvent('framenavigated');
    await page.locator('[data-a="titleUpdate"]').click();
    await nav; await page.waitForFunction(() => typeof UPDATE !== 'undefined' && UPDATE.state === 'pending');
    check('Newer version reloads the game', await page.evaluate(() => sessionStorage.getItem('futbol-manager:update')), remote);
    check('Scripts were fetched past the cache before reload', refetched.some(u => !u.includes('check=')), true);
    check('No reload loop while Pages is still publishing', await status(), 'Version ' + remote + ' is still being published. Try again in a minute.');
    check('Save survives the update reload', await page.locator('[data-a="titleContinue"]').count(), 1);
    remote = VER.replace(/\d+$/, n => +n - 1);
    await page.locator('[data-a="titleUpdate"]').click();
    await page.waitForFunction(() => UPDATE.state === 'latest');
    check('Older published version is not an update', await status(), 'Up to date · version ' + VER);
    check('Title fits the phone screen', await page.evaluate(() => { const b = document.querySelector('.title-menu').getBoundingClientRect(); return b.bottom <= innerHeight && b.top > document.querySelector('.title-wordmark').getBoundingClientRect().bottom; }), true);
    check('No browser runtime errors', errors, []);
    await page.screenshot({ path: '/tmp/futbol-updates.png' });
    console.log(JSON.stringify({ passed: checks.length, checks }, null, 2));
  } finally { await browser.close(); server.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
