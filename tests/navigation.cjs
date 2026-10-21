// Run with Playwright installed: node tests/navigation.cjs [existing server URL]
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
    await page.route('**/outside', r => r.fulfill({ body: '<h1>Outside the game</h1>', contentType: 'text/html' }));
    await page.goto(base + '/outside');
    await page.goto(base + '/');
    await page.locator('[data-a="titleStart"]').click();
    await page.locator('[data-a="startGame"]').click();
    check('New career starts on dashboard', (await state()).screen, 'home');
    await back(); await back();
    check('Repeated browser Back at root stays in game', await page.locator('.title-screen').count(), 1);
    check('Root guard preserves URL', page.url(), base + '/');

    await page.locator('[data-a="titleStart"]').click();
    await page.locator('.tabs2 [data-s="team"]').click();
    check('My Team opens Squad directly', (await state()).screen, 'squad');
    check('Team sections appear as top tabs', await page.locator('.team-sections button').count(), 11);
    await page.locator('.team-sections [data-s="tactics"]').click();
    check('Top tabs open team sections', (await state()).screen, 'tactics');
    await appBack();
    check('Back returns to squad from team tabs', (await state()).screen, 'squad');
    await page.locator('.main [data-s="squad"]').click();
    await page.locator('[data-a="sqL"][data-v="R"]').click();
    await page.locator('[data-a="sqF"][data-v="GK"]').click();
    await back();
    check('Back restores previous squad filter', await page.evaluate(() => UI.f.squad), 'ALL');
    const pid = await page.locator('.main [data-a="player"]').first().getAttribute('data-id');
    await page.evaluate(() => { document.querySelector('.main').scrollTop = 180; });
    const scroll = await page.evaluate(() => document.querySelector('.main').scrollTop);
    await act('player', { id: pid });
    await page.locator('[data-a="psTab"][data-v="bio"]').click();
    check('Personal tab opens', await page.evaluate(() => UI.tab.ps), 'bio');
    const friend = await page.locator('#layer [data-a="player"]').first().getAttribute('data-id');
    await page.locator('#layer [data-a="player"]').first().click();
    check('Related player opens nested popup', (await state()).popup, 'player:' + friend);
    await back();
    check('Back restores original player', (await state()).popup, 'player:' + pid);
    check('Back restores original Personal tab', await page.evaluate(() => UI.tab.ps), 'bio');
    await page.locator('[data-a="pActions"]').click();
    await page.locator('[data-a="pActions"][data-k="contract"]').click();
    await page.locator('[data-a="pAct"][data-i="0"]').click();
    check('Contract opens from nested action category', (await state()).popup, 'contract:' + pid + ':renew');
    const idx = (await state()).index;
    await act('wStep', { v: 250 }); await act('wStep', { v: 250 });
    check('Wage adjustments do not add fake pages', (await state()).index, idx);
    await back();
    check('Browser Back returns to contract action category', (await state()).popup, 'actions:' + pid + ':contract');
    await page.locator('#layer [data-a="back"]').click(); await page.waitForTimeout(100);
    check('Popup Back returns to Actions menu', (await state()).popup, 'actions:' + pid + ':');
    await page.locator('.sh-x').click(); await page.waitForTimeout(100);
    check('Popup X dismisses all nested popups', (await state()).popup, null);
    await act('player', { id: pid });
    await act('psTab', { id: pid, v: 'bio' });
    await page.keyboard.press('Escape'); await page.waitForTimeout(100);
    check('Escape returns to previous profile tab', await page.evaluate(() => UI.tab.ps || 'attr'), 'attr');
    await back();
    check('Back closes final popup', (await state()).popup, null);
    check('Squad level is preserved', await page.evaluate(() => UI.f.lvl), 'R');
    check('Squad scroll is preserved', await page.evaluate(() => document.querySelector('.main').scrollTop), scroll);

    await act('go', { s: 'transfers' });
    await page.locator('#sName').fill('test draft');
    await act('go', { s: 'finance' });
    await appBack();
    check('In-game Back restores previous page', (await state()).screen, 'transfers');
    check('Unsubmitted text is preserved', await page.locator('#sName').inputValue(), 'test draft');
    await act('tab', { key: 'tr', v: 'short' }); await back();
    check('Transfer tab history is restored', await page.evaluate(() => UI.tab.tr || 'search'), 'search');
    await act('go', { s: 'news' });
    await page.locator('.main [data-a="news"]').first().click();
    const newsKey = (await state()).popup;
    await act('player', { id: pid }); await back();
    check('Back restores underlying news popup', (await state()).popup, newsKey);
    await back();
    check('Back returns to news page', (await state()).screen, 'news');

    await act('go', { s: 'admin' }); await act('tab', { key: 'adm', v: 'play' });
    await act('admPlayer', { id: pid });
    await page.locator('#apFn').fill('Unsubmitted name');
    await act('player', { id: pid }); await back();
    check('Admin draft survives nested popup', await page.locator('#apFn').inputValue(), 'Unsubmitted name');
    check('History never changes player data', await page.evaluate(id => G.players[id].fn !== 'Unsubmitted name', pid), true);
    await back();

    await page.evaluate(() => { while (!userFixture()) advanceWeek(); go('prematch'); });
    await act('kickoff');
    await page.waitForTimeout(100);
    await page.evaluate(() => { LIVE.paused = true; });
    const fid = await page.evaluate(() => LIVE.fid);
    await act('liveSheet', { k: 'subs' }); await back();
    check('Back from Subs restores match', (await state()).screen, 'match');
    check('Already paused match stays paused', await page.evaluate(() => LIVE.paused), true);
    await page.evaluate(() => { LIVE.paused = false; });
    await act('liveSheet', { k: 'subs' }); await back();
    check('Back from Subs resumes previously running match', await page.evaluate(() => LIVE.paused), false);
    await page.evaluate(() => { LIVE.paused = true; });
    await back();
    check('Back from match restores prematch', (await state()).screen, 'prematch');
    check('Prematch offers resume', await page.locator('[data-a="kickoff"]').innerText(), 'Resume match');
    await act('kickoff');
    check('Resuming preserves the live match object', await page.evaluate(id => LIVE.fid === id && LIVE.paused, fid), true);
    await act('liveSheet', { k: 'stats' }); await back();
    check('Stats closes to match', (await state()).popup, null);
    await act('instant2'); await act('toPost'); await back();
    check('Back after full time shows report', (await state()).screen, 'post');
    check('Result remains recorded', await page.evaluate(id => played(G.fixtures.find(f => f.id === id)), fid), true);

    await page.reload(); await back(); await back();
    check('Reload keeps root guard working', page.url(), base + '/');
    check('No browser runtime errors', errors, []);
    await page.screenshot({ path: '/tmp/futbol-navigation.png' });
    console.log(JSON.stringify({ passed: checks.length, checks }, null, 2));
  } finally { await browser.close(); server.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
