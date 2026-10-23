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
    await page.locator('[data-a="titleNew"]').click();
    await page.locator('[data-a="startGame"]').click();
    check('New career starts on dashboard', (await state()).screen, 'home');
    check('Dashboard has Overview and Competitions tabs and no player stats table', await page.evaluate(() => document.querySelectorAll('.dashboard-sections button').length === 2 && !document.querySelector('.main').innerText.includes('Player stats')) , true);
    await page.locator('.cc-league-link').click();
    check('Dashboard league name opens its competition table', (await state()).screen, 'competitions');
    check('Dashboard league link selects the current league', await page.locator('.main [data-a="homeCompetition"].on').getAttribute('data-id'), 'EPL');
    check('Dashboard league link opens the Premier League table', await page.locator('.main .tbl tbody tr').count(), 20);
    await page.locator('.dashboard-sections [data-s="home"]').click();
    await page.locator('.dashboard-sections [data-s="competitions"]').click();
    check('Competitions opens within Dashboard navigation', (await state()).screen, 'competitions');
    check('Competitions opens with the current league table', await page.locator('.main .tbl tbody tr').count(), 20);
    await page.locator('.main .tabs [data-v="fixtures"]').click();
    check('Competition tab lists current matchweek fixtures', await page.locator('.main .fxr').count(), 10);
    await page.locator('.main [data-a="homeCompetition"][data-id="ECH"]').click();
    await page.locator('.main .tabs [data-v="table"]').click();
    check('Championship selector displays its 24 clubs', await page.locator('.main .tbl tbody tr').count(), 24);
    await page.locator('.dashboard-sections [data-s="home"]').click();
    check('Dashboard Overview tab returns to the overview', (await state()).screen, 'home');
    check('Every club receives a manager profile', await page.evaluate(() => Object.keys(G.managerProfiles).length >= Object.keys(G.clubs).filter(id => !G.clubs[id].fa).length), true);
    check('AI manager profiles use club reference nationality, age and fictional names', await page.evaluate(() => {
      const clubs = Object.values(G.clubs).filter(c => c.pl && !c.fa && c.id !== G.club);
      return clubs.length === 43 && clubs.every(c => {
        const p = G.managerProfiles[c.managerId], ref = MANAGER_REAL_WORLD[c.id];
        return !!ref && p?.nationality === ref.nationality && p.age === ref.age && p.name === ref.fictionalName && p.name !== ref.name && p.inspiration === ref.name && p.inspirationalFigures?.length === ref.figures.length;
      }) && Object.keys(MANAGER_REAL_WORLD).length === 44;
    }), true);
    check('Existing manager profiles migrate to their real-world reference', await page.evaluate(() => {
      const c = Object.values(G.clubs).find(x => x.id !== G.club && MANAGER_REAL_WORLD[x.id]), p = G.managerProfiles[c.managerId], ref = MANAGER_REAL_WORLD[c.id];
      p.name = c.mgr = 'Wrong Locale'; p.nationality = 'ENG'; p.age = 50; p.inspiration = 'Wrong'; p.identityVersion = 2; ensureManagerProfiles();
      return p.nationality === ref.nationality && p.age === ref.age && p.name === ref.fictionalName && p.inspiration === ref.name && c.mgr === p.name;
    }), true);
    await act('go', { s: 'manager' });
    check('Manager profile shows compact inspirational figure with personal bank and career sections', await page.evaluate(() => {
      const main = document.querySelector('.main'), label = [...main.querySelectorAll('.kv small')].find(x => x.textContent === 'Inspirational figure');
      const text = main.innerText.toLowerCase();
      return ['personal bank', 'career history'].every(x => text.includes(x)) && !!label?.parentElement.querySelector('b')?.textContent.trim() && !text.includes('inspired by');
    }), true);
    await page.evaluate(() => weeklyFinance());
    check('Weekly manager wage is recorded in club ledger', await page.evaluate(() => G.ledger.manager === G.managerProfiles[G.managerProfileId].weeklySalary), true);
    check('Weekly manager salary reaches personal bank', await page.evaluate(() => G.managerProfiles[G.managerProfileId].bank >= G.managerProfiles[G.managerProfileId].weeklySalary), true);
    await page.evaluate(() => render());
    check('Manager profile remains accessible after weekly income is recorded', await page.evaluate(() => UI.s === 'manager' && document.querySelector('.main').innerText.includes('Club salary') && document.querySelector('.main').innerText.includes('Recent income')), true);
    await act('go', { s: 'home' });
    await page.locator('.tabs2 [data-s="team"]').click();
    check('My Team opens Squad directly', (await state()).screen, 'squad');
    check('Squad position sort shows alternate roles and wellbeing below the name', await page.evaluate(() => {
      const row = document.querySelector('.main .prow'), text = row?.innerText || '';
      return !!row?.querySelector('.squad-metric.alt') && /condition/i.test(text) && /superb|very good|good|okay|poor/i.test(text) && !row.querySelector('.mbar');
    }), true);
    check('Squad position sort shows an alternative fit for every outfield player, colored by its 80 rating threshold', await page.evaluate(() => {
      const rows = [...document.querySelectorAll('.main .prow')];
      return rows.filter(row => row.querySelector('.pos')?.textContent.trim() !== 'GK').every(row => {
        const fit = row.querySelector('.squad-metric.alt b'), score = Number(fit?.textContent.trim().match(/(\d+)$/)?.[1]);
        return Number.isFinite(score) && !!fit.textContent.trim().match(/^[A-Z]+\s+\d+$/) && fit.classList.contains(score >= 80 ? 'good' : 'warn');
      });
    }), true);
    await page.locator('.sortbar [data-v="ovr"]').click();
    check('Squad rating sort displays player rating', await page.locator('.main .prow .ovr').count(), await page.locator('.main .prow').count());
    await page.locator('.sortbar [data-v="age"]').click();
    check('Squad age sort displays age in the metric column', await page.locator('.main .prow .squad-metric.stat small').first().textContent(), 'years');
    await page.locator('.sortbar [data-v="cond"]').click();
    check('Squad condition sort displays percentage and condition bar', await page.locator('.main .prow .squad-metric.condition').count(), await page.locator('.main .prow').count());
    await page.locator('.sortbar [data-v="mor"]').click();
    check('Squad morale sort displays the morale face', await page.locator('.main .prow .mood').count(), await page.locator('.main .prow').count());
    await page.locator('.sortbar [data-v="val"]').click();
    check('Squad value sort displays market value', await page.locator('.main .prow .squad-metric.value').count(), await page.locator('.main .prow').count());
    await page.locator('.sortbar [data-v="pos"]').click();
    check('Team sections appear as top tabs', await page.locator('.team-sections button').count(), 12);
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
    await page.locator('.main [data-a="tab"][data-v="search"]').click();
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
    check('Opening Subs pauses a running match', await page.evaluate(() => LIVE.paused), true);
    await act('liveSheet', { k: 'subs' }); await back();
    check('Back from Subs leaves the match paused', await page.evaluate(() => LIVE.paused), true);
    await page.evaluate(() => { LIVE.paused = false; });
    await act('liveSheet', { k: 'tactics' });
    check('Opening Tactics pauses a running match', await page.evaluate(() => LIVE.paused), true);
    await back();
    check('Back from Tactics leaves the match paused', await page.evaluate(() => LIVE.paused), true);
    await page.evaluate(() => { LIVE.paused = true; });
    await back();
    check('Back from match restores prematch', (await state()).screen, 'prematch');
    check('Prematch offers resume', await page.locator('[data-a="kickoff"]').innerText(), 'Resume match');
    await act('kickoff');
    check('Resuming preserves the live match object', await page.evaluate(id => LIVE.fid === id && LIVE.paused, fid), true);
    await act('liveSheet', { k: 'stats' }); await back();
    check('Stats closes to match', (await state()).popup, null);
    const minute = await page.evaluate(() => LIVE.M.min);
    await act('go', { s: 'settings' });
    await page.screenshot({ path: '/tmp/futbol-settings-title.png' });
    await page.getByRole('button', { name: 'Save & return to title' }).click();
    await page.waitForFunction(() => UI.s === 'title');
    check('Settings returns to title', (await state()).screen, 'title');
    check('Returning saves the live fixture', await page.evaluate(async () => { await SaveStorage.flush(); return (await SaveStorage.request('load')).live.fid; }), fid);
    check('Returning stops match playback', await page.evaluate(() => LIVE.raf), 0);
    await page.reload();
    await page.locator('.title-screen').waitFor();
    check('Refresh stays on title', (await state()).screen, 'title');
    await page.getByRole('button', { name: 'Continue game', exact: true }).click();
    check('Continue returns to career dashboard', (await state()).screen, 'home');
    await act('go', { s: 'prematch' }); await act('kickoff');
    check('Continue preserves match minute and fixture', await page.evaluate(() => [LIVE.fid, LIVE.M.min]), [fid, minute]);
    await act('instant2'); await act('toPost'); await back();
    check('Back after full time shows report', (await state()).screen, 'post');
    check('Result remains recorded', await page.evaluate(id => played(G.fixtures.find(f => f.id === id)), fid), true);

    await act('go', { s: 'settings' });
    await page.evaluate(() => {
      window.originalSaveRequest = SaveStorage.request;
      SaveStorage.request = function(type, data) { if (type === 'save') return Promise.reject(new Error('Storage unavailable')); return window.originalSaveRequest.call(this, type, data); };
    });
    await page.getByRole('button', { name: 'Save & return to title' }).click();
    await page.getByText('Saving failed. Stay here and export your save before leaving.').waitFor();
    check('Failed save stays in Settings', (await state()).screen, 'settings');
    check('Failed save explains export option', await page.getByText('Saving failed. Stay here and export your save before leaving.').count(), 1);
    await page.evaluate(async () => { SaveStorage.request = window.originalSaveRequest; delete window.originalSaveRequest; await SaveStorage.flush(); });

    await page.reload(); await back(); await back();
    check('Reload keeps root guard working', page.url(), base + '/');
    check('No browser runtime errors', errors, []);
    await page.screenshot({ path: '/tmp/futbol-navigation.png' });
    console.log(JSON.stringify({ passed: checks.length, checks }, null, 2));
  } finally { await browser.close(); server.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
