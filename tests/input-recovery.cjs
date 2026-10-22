// UI remains usable when a storage worker accepts a request but never answers.
const { chromium } = require('playwright'), assert = require('node:assert/strict');
const http = require('node:http'), fs = require('node:fs'), path = require('node:path');
(async () => {
  const root = path.resolve(__dirname, '..'), checks = [], errors = [];
  const server = http.createServer((req, res) => {
    const file = path.resolve(root, '.' + new URL(req.url, 'http://local').pathname.replace(/\/$/, '/index.html'));
    if (!file.startsWith(root + path.sep)) return res.writeHead(403).end();
    try { res.setHeader('Content-Type', ({ '.js': 'application/javascript', '.css': 'text/css', '.html': 'text/html' })[path.extname(file)] || 'application/octet-stream'); res.end(fs.readFileSync(file)); } catch { res.writeHead(404).end(); }
  });
  let browser;
  const check = (name, value) => { assert.ok(value, name); checks.push(name); };
  try {
    if (!process.argv[2]) await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
    const base = process.argv[2] || 'http://127.0.0.1:' + server.address().port;
    browser = await chromium.launch({ headless: true, ...(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH, args: ['--no-sandbox'] } : {}) });
    const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
    await context.route('https://fonts.googleapis.com/**', r => r.abort());
    const page = await context.newPage(); page.on('pageerror', e => errors.push(e.message));
    await page.goto(base); await page.locator('[data-a=titleNew]').click(); await page.locator('[data-a=startGame]').click();
    await page.evaluate(async () => {
      G.manager = 'Latest database career'; await saveGameAsync();
      const older = structuredClone(G); older.manager = 'Old migration backup'; localStorage.setItem(SAVE_KEY, JSON.stringify(older));
      go('settings'); SaveStorage.timeoutMs = 1500;
      const send = SaveStorage.worker.postMessage.bind(SaveStorage.worker);
      SaveStorage.worker.postMessage = data => { if (data.type !== 'save') send(data); };
    });
    await page.locator('[data-a=returnTitle]').click();
    await page.locator('.tabs2 [data-s=team]').click();
    check('Navigation responds while Save & return is still waiting for storage', await page.evaluate(() => UI.s === 'squad' && ACTION_BUSY));
    await page.locator('.team-sections [data-s=tactics]').click();
    check('A second menu action responds while the save is pending', await page.evaluate(() => UI.s === 'tactics'));
    await page.waitForFunction(() => !SaveStorage.worker && !ACTION_BUSY);
    check('A silent worker fails within a deadline and releases the operation', await page.evaluate(() => !!SaveStorage.error && SaveStorage.jobs.size === 0 && SaveStorage.blocked));
    check('A failed delayed return does not navigate away from the selected screen', await page.evaluate(() => UI.s === 'tactics'));
    await page.evaluate(() => go('settings'));
    const downloadEvent = page.waitForEvent('download'); await page.locator('[data-a=downloadSave]').click(); const download = await downloadEvent;
    const backup = JSON.parse(fs.readFileSync(await download.path(), 'utf8'));
    check('Backup buttons still export the latest in-memory career after worker failure', backup.game.manager === 'Latest database career');

    const recovered = await context.newPage(); recovered.on('pageerror', e => errors.push(e.message));
    await recovered.addInitScript(() => {
      const timeout = window.setTimeout;
      window.setTimeout = (fn, ms, ...args) => timeout(fn, ms === 12000 ? 100 : ms, ...args);
    });
    await recovered.route('**/js/workers/storage.js?*', r => r.fulfill({ contentType: 'application/javascript', body: 'self.onmessage = () => {};' }));
    await recovered.goto(base); await recovered.locator('[data-a=titleContinue]').waitFor();
    check('Startup with an unresponsive worker recovers the newer IndexedDB career', await recovered.evaluate(() => G.manager === 'Latest database career' && SaveStorage.blocked));
    await recovered.locator('[data-a=titleContinue]').click();
    await recovered.locator('.tabs2 [data-s=team]').click();
    check('Recovered careers can still open game menus', await recovered.evaluate(() => UI.s === 'squad'));
    check('No browser errors', errors.length === 0);
    console.log(JSON.stringify({ passed: checks.length, checks }, null, 2));
  } finally { if (browser) await browser.close(); server.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
