// Regressions: overseas friendlies must not make Dashboard or match preparation throw.
const { chromium } = require('playwright'), assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('node:path'), http = require('node:http');
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
    const page = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
    page.on('pageerror', e => errors.push(e.message)); await page.route('https://fonts.googleapis.com/**', r => r.abort());
    await page.goto(base); await page.locator('[data-a=titleNew]').click(); await page.locator('[data-a=startGame]').click();
    check('League-only careers still render Dashboard', await page.locator('.dash-h h1').textContent() === 'Dashboard');
    await page.evaluate(() => { arrangeFriendly(friendlyCandidates()[0].id); go('squad'); });
    await page.locator('.tabs2 [data-s=home]').tap();
    check('Tapping Dashboard opens it with an upcoming overseas friendly', await page.evaluate(() => UI.s === 'home' && document.getElementById('app').dataset.screen === 'home'));
    check('The next match is labelled Friendly with no invented league form', /Friendly/.test(await page.locator('.nm-mid').textContent()) && /No recorded league form/.test(await page.locator('.nm-form').textContent()));
    await page.locator('[data-a=go][data-s=squad].dlink').tap();
    check('Dashboard squad button works', await page.evaluate(() => UI.s === 'squad'));
    await page.locator('.tabs2 [data-s=home]').tap();
    await page.locator('.cc-conf').tap();
    check('Dashboard board-confidence button works', await page.evaluate(() => UI.s === 'board'));
    await page.locator('.tabs2 [data-s=home]').tap();
    await page.locator('.dcard[data-s=finance]').tap();
    check('Dashboard finance card works', await page.evaluate(() => UI.s === 'finance'));
    await page.locator('.tabs2 [data-s=home]').tap();
    await page.evaluate(() => saveGameAsync());
    await page.reload(); await page.locator('.dash-h h1').waitFor();
    check('Reloading an existing saved career with a friendly restores Dashboard', await page.evaluate(() => VIEW_HISTORY.ready && nextUserFixture().fr));
    await page.locator('[data-a=fixturePage]').first().tap();
    await page.locator('#layer [data-a=go][data-s=prematch]').tap();
    check('Friendly match preparation opens without a missing league-table row', /Not in this league/.test(await page.locator('.main').textContent()));
    await page.locator('[data-a=kickoff]').tap(); await page.locator('#pitch').waitFor();
    await page.waitForFunction(() => LIVE && LIVE.M.min > 0);
    check('The friendly can kick off and generate live play', await page.evaluate(() => UI.s === 'match' && LIVE.M.min > 0));
    await page.evaluate(async () => { LIVE.paused = true; stopLive(); go('squad'); });
    await page.locator('.tabs2 [data-s=home]').tap();
    check('Dashboard still works after leaving the live friendly', await page.evaluate(() => document.getElementById('app').dataset.screen === 'home'));
    check('No browser errors', errors.length === 0);
    console.log(JSON.stringify({ passed: checks.length, checks }, null, 2));
  } finally { if (browser) await browser.close(); server.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
