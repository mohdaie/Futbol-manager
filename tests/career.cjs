// Run with Playwright installed: node tests/career.cjs [existing server URL]
// Manager career: resign into time between clubs (the world carries on, the old club is the computer's), a
// season ending while out of work, applying and accepting an offer, a sacking with rescue offers, approaches,
// a holiday played by the assistant with its report, and retirement.
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
  const weeks = n => page.evaluate(n => { const out = []; for (let i = 0; i < n; i++) { const fx = userFixture(); if (fx && !played(fx)) quickSim(fx); out.push(advanceWeek()); } return out; }, n);
  try {
    await page.goto(base + '/');
    await page.locator('[data-a="titleNew"]').click();
    await page.locator('[data-a="startGame"]').click();
    await page.evaluate(() => { G.settings.speed = 4; });
    const first = await page.evaluate(() => G.club);

    // Holiday until after the next match: the assistant plays it, then the report.
    await page.evaluate(() => { while (!nextUserFixture() || fxDayNo(nextUserFixture()) - todayNo() > 6) { const fx = userFixture(); if (fx && !played(fx)) quickSim(fx); advanceWeek(); } go('manager'); });
    await page.locator('[data-a=careerHolidayAsk]').click();
    await page.locator('[data-a=careerHolidayLen][data-v=match]').click();
    await page.locator('[data-a=careerHolidayGo]').click();
    check('the holiday starts with the assistant in charge', await page.evaluate(() => G.career.holiday?.len || [document.getElementById('toast').textContent, JSON.stringify(G.career), pendingTransferDecisions().length]), 'match');
    await page.waitForFunction(() => !G.career.holiday, null, { timeout: 120000 });
    const report = await page.evaluate(() => G.career.lastHoliday);
    check('the assistant played the match by instant result', report.results.length, 1);
    check('the report shows on return', await page.locator('#layer').textContent().then(t => /Welcome back/.test(t) && /League position/.test(t)), true);
    await act('closeSheet');
    check('a timed holiday ends on its date', await page.evaluate(() => { startHoliday('w2', 'value'); const h = G.career.holiday, a = holidayDue(); h.until = todayNo(); const b = holidayDue(); endHoliday('test'); return [h.until !== null, a, b, h.bids]; }), [true, false, true, 'value']);

    // Resign: out of work, the old club gets an interim manager, the world carries on.
    await page.evaluate(() => go('manager'));
    await page.locator('[data-a=careerResignAsk]').click();
    await page.locator('#layer [data-a=careerResign]').click();
    check('resigning leaves you between clubs', await page.evaluate(() => [G.career.status, G.career.from, UI.s]), ['unemployed', first, 'unemployed']);
    check('the old club has a new (computer) manager and a vacancy', await page.evaluate(c => { const cl = G.clubs[c], p = G.managerProfiles[cl.managerId]; return !!p && !p.isUser && G.managerJobs.some(j => j.cid === c && j.status === 'open'); }, first), true);
    check('club screens are closed to you', await page.evaluate(() => { go('squad'); return UI.s; }), 'unemployed');
    check('news and tables stay open', await page.evaluate(() => { go('news'); const a = UI.s; go('table'); return [a, UI.s]; }), ['news', 'table']);
    const out = await weeks(3);
    check('weeks pass without your matches', out.every(r => r === 'ok'), true);
    check('the old club played its fixtures under the computer', await page.evaluate(c => G.fixtures.filter(f => (f.h === c || f.a === c) && played(f) && f.w >= G.week - 3).length > 0 && userFixtures().length === 0, first), true);
    check('no salary between clubs', await page.evaluate(() => { const p = userManagerProfile(), b = p.bank; weeklyFinance(); return p.bank === b && p.currentClubId === null; }), true);

    // Applying: a decision a few days later; an offer to accept.
    const job = await page.evaluate(() => { const j = openJobs()[0] || postManagerJob(Object.keys(G.clubs).find(id => G.clubs[id].league === leagueOf(G.career.from) && id !== G.career.from), 'Test vacancy'); return j.id; });
    await page.evaluate(() => go('unemployed'));
    await page.locator(`[data-a=careerApply][data-id="${job}"]`).click();
    check('the interview offers three pitches with chances', await page.locator('#layer [data-a=careerApplyGo]').count(), 3);
    await page.locator('#layer [data-a=careerApplyGo]').first().click();
    const offered = await page.evaluate(() => { const a = G.career.apps[0]; a.odds = 1; a.decide = todayNo(); careerWeek(); return [a.status, G.career.offers.length > 0]; });
    check('a successful application becomes an offer', offered, ['offered', true]);
    await page.evaluate(() => { render(); });
    const target = await page.evaluate(() => G.career.offers[0].cid);
    await page.locator('[data-a=careerAccept]').first().click();
    check('accepting an offer makes you manager there', await page.evaluate(() => [G.career.status, G.club, userManagerProfile().currentClubId === G.club, UI.s]), ['employed', target, true, 'home']);
    check('your fixtures are yours again', await page.evaluate(() => G.fixtures.some(f => isUserFx(f))), true);

    // A season ending while out of work: no review, promotion and relegation still happen.
    await page.evaluate(() => { resignJob(); G.week = SEASON_WEEKS - 1; });
    const season = await page.evaluate(() => { const s = G.season; const r = advanceWeek(); return [r, G.season === s + 1, !!G.seasonReview, G.career.status]; });
    check('the season rolls over without a review between clubs', season, ['ok', true, false, 'unemployed']);

    // Approaches between clubs.
    await page.evaluate(() => { const mr = Math.random; Math.random = () => 0; G.career.offers = []; const id = Object.keys(G.clubs).find(c => G.leagues.includes(G.clubs[c].league) && c !== G.career.from && !G.managerJobs.some(j => j.cid === c && j.status === 'open')); postManagerJob(id, 'Approach test'); G.clubs[id].rep = 50; careerWeek(); Math.random = mr; });
    check('a club with a vacancy can approach you', await page.evaluate(() => G.career.offers.some(o => o.source === 'approach')), true);

    // A sacking: out of work with rescue offers.
    await page.evaluate(() => { acceptOffer(G.career.offers[0].id); sack('Test sacking.'); });
    check('a sacking leaves you between clubs with offers', await page.evaluate(() => [G.career.status, G.career.offers.filter(o => o.source === 'rescue').length > 0, !!G.gameOver]), ['unemployed', true, false]);

    // Retirement.
    await page.evaluate(() => { render(); });
    await page.locator('[data-a=careerRetireAsk]').first().click();
    await page.locator('#layer [data-a=careerRetire]').click();
    check('retiring shows the career summary', await page.locator('.logo').textContent(), 'Retired');
    check('the summary counts the clubs managed', await page.evaluate(() => G.career.summary.clubs >= 2), true);
    check('a retired career stays on the summary', await page.evaluate(() => { go('squad'); return document.querySelector('.logo')?.textContent; }), 'Retired');
    check('the summary fits a phone', await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
    check('No browser runtime errors', errors, []);
    console.log(JSON.stringify({ checks }, null, 2));
  } catch (e) { console.error(e); console.error(errors); process.exitCode = 1; }
  finally { await browser.close(); server.close(); }
})();
