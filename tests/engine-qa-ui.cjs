const { chromium } = require('playwright');
const assert = require('node:assert/strict'), fs = require('node:fs'), path = require('node:path');
const root = path.resolve(__dirname, '..');
const server = require('node:http').createServer((req, res) => {
  const file = path.resolve(root, '.' + new URL(req.url, 'http://localhost').pathname.replace(/\/$/, '/index.html'));
  if (!file.startsWith(root + path.sep)) return res.writeHead(403).end();
  try { res.setHeader('Content-Type', ({ '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css', '.webp': 'image/webp' })[path.extname(file)] || 'application/octet-stream'); res.end(fs.readFileSync(file)); }
  catch { res.writeHead(404).end(); }
});
(async () => {
  await new Promise(r => server.listen(0, '127.0.0.1', r));
  const browser = await chromium.launch({ headless: true, ...(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH, args: ['--no-sandbox', '--disable-dev-shm-usage'] } : {}) });
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const errors = [], calls = [], checks = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.route('https://fonts.googleapis.com/**', r => r.abort());
  await page.route('https://engineqa.test/**', route => {
    calls.push(route.request().postDataJSON());
    return route.fulfill({ contentType: 'application/json', body: JSON.stringify({ answers: { priority: { choice: 'match_regression', confidence: .9 } }, usage: { input_tokens: 200 } }) });
  });
  const check = (n, v) => { assert.ok(v, n); checks.push(n); };
  try {
    await page.goto('http://127.0.0.1:' + server.address().port);
    await page.locator('[data-a="titleNew"]').click(); await page.locator('[data-a="startGame"]').click();
    await page.evaluate(() => {
      Object.assign(aiCfg().jev, { on: true, mode: 'proxy', proxy: 'https://engineqa.test', feat: { engine: true } });
      window.qaOriginal = JSON.stringify({ tactics: G.tactics, players: G.players, fixtures: G.fixtures, tune: G.tune });
      go('admin'); UI.tab.adm = 'eng'; render();
    });
    check('Opening Admin engine makes no AI call', calls.length === 0);
    await page.locator('[data-a="admEngineQa"]:not([data-jev])').click();
    check('Quick local button runs batch without AI', await page.evaluate(() => ADM.engineQa.checked > 3000 && ADM.engineQa.failed === 0) && calls.length === 0);
    check('Local report is visible on the phone', (await page.locator('.main').innerText()).includes('checks passed'));
    const ask = async () => { await page.locator('[data-a="admEngineQa"][data-jev="1"]').click(); await page.waitForFunction(() => !ADM.engineQaRun); };
    await ask();
    check('Explicit Jev button sends one batched review', calls.length === 1 && calls[0].state.scenarios > 1000);
    check('Jev result is labelled on screen', (await page.locator('.main').innerText()).includes('Jev priority'));
    await ask();
    check('Repeating the same report reuses the review', calls.length === 1 && await page.evaluate(() => ADM.engineQa.review.cached));
    check('Testing preserves career tactic, players, fixtures and tuning', await page.evaluate(() => qaOriginal === JSON.stringify({ tactics: G.tactics, players: G.players, fixtures: G.fixtures, tune: G.tune })));
    await page.evaluate(() => { ENGINE_QA_CACHE = null; aiCfg().jev.on = false; });
    await ask();
    check('Disconnected Jev produces an honest local message', calls.length === 1 && (await page.locator('.main').innerText()).includes('Jev unavailable'));
    check('No horizontal overflow', await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    check('No browser errors', errors.length === 0);
    console.log(JSON.stringify({ passed: checks.length, checks, mockedReviewCalls: calls.length }, null, 2));
  } finally { await browser.close(); await new Promise(r => server.close(r)); }
})().catch(e => { console.error(e); server.close(); process.exitCode = 1; });
