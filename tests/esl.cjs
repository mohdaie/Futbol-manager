// Run with Playwright installed: node tests/esl.cjs [existing server URL]
// Euro Super League (esl.js) over a whole season: qualification and draw, a clash-free midweek schedule, group prize
// money, knockout draws through to the final, honours, league tables untouched, next season's qualifiers and the
// Competitions screen.
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

    const draw = await page.evaluate(() => {
      const E = G.esl, fx = G.fixtures.filter(isEslFx);
      const perLeague = Object.fromEntries(ESL_LEAGUES.map(id => [id, E.teams.filter(c => eslLeagueOf(c) === id).length]));
      const clash = fx.some(f => G.fixtures.some(o => !isEslFx(o) && o.w === f.w && (o.d ?? 5) <= 3 && [o.h, o.a].some(c => [f.h, f.a].includes(c))));
      return { teams: new Set(E.teams).size, groups: Object.values(E.groups).map(g => g.length), sameLeague: Object.values(E.groups).some(g => new Set(g.map(eslLeagueOf)).size < 4),
        perLeague: Object.values(perLeague).every(n => n >= 6), fixtures: fx.length, midweek: fx.every(f => f.d === 1 || f.d === 2), clash,
        start: E.teams.every(c => E.prizes[c] >= eslPrize('start')), squads: E.teams.every(c => G.clubs[c].squad.length >= 16) };
    });
    check('32 different clubs qualify', draw.teams, 32);
    check('eight groups of four', draw.groups, [4, 4, 4, 4, 4, 4, 4, 4]);
    check('no group has two clubs from one league', draw.sameLeague, false);
    check('every league has at least six clubs', draw.perLeague, true);
    check('96 group fixtures on Tuesdays and Wednesdays', [draw.fixtures, draw.midweek], [96, true]);
    check('no club has a league match in the same midweek', draw.clash, false);
    check('every club is paid the starting fee and has a full squad', [draw.start, draw.squads], [true, true]);

    // A whole season, the user's matches by instant result.
    const season = await page.evaluate(() => {
      const s0 = G.season; let guard = 0;
      while (G.season === s0 && guard++ < 80) { const fx = userFixture(); if (fx && !played(fx)) quickSim(fx); advanceWeek(); if (G.seasonReview) G.seasonReview = null; }
      return { rolled: G.season === s0 + 1, history: G.eslHistory?.[0] || null };
    });
    check('the season completes', season.rolled, true);
    check('a winner is crowned and recorded', !!(season.history && season.history.winner && season.history.runnerUp), true);

    // The finished competition is the previous season's G.esl until the new draw replaced it; check its record.
    const next = await page.evaluate(() => ({ season: G.esl.season === G.season, teams: G.esl.teams.length, holder: G.esl.teams.includes(G.eslHistory[0].winner) || !eslLeagueOf(G.eslHistory[0].winner),
      fromQualifiers: G.eslNext && G.eslNext.season === G.season && G.esl.teams.every(c => G.eslNext.teams.includes(c)) }));
    check('next season has a new 32-club draw from the qualifiers, holders included', [next.season, next.teams, next.holder, next.fromQualifiers], [true, 32, true, true]);

    // Replay one season's knockout bookkeeping on the fresh draw: groups then each round, ending in a final.
    const ko = await page.evaluate(() => {
      const E = G.esl, s0 = G.season; let guard = 0;
      while (!E.winner && G.season === s0 && guard++ < 60) { const fx = userFixture(); if (fx && !played(fx)) quickSim(fx); advanceWeek(); if (G.seasonReview) G.seasonReview = null; }
      const fin = G.fixtures.find(f => f.id === E.final) || null;
      const winner = E.winner, paid = E.prizes[winner] || 0;
      const minimum = eslPrize('start') + eslPrize('r16') + eslPrize('qf') + eslPrize('sf') + eslPrize('final') + eslPrize('winner');
      const epl = G.leagues.includes('EPL') ? leagueTable('EPL').every(r => r.p <= 38) : true;
      return { ties: [E.ties.r16.length, E.ties.qf.length, E.ties.sf.length], final: !!fin && fin.neutral && fin.d === 5, winner: !!winner, paid: paid >= minimum, epl,
        legs: E.ties.r16.every(t => { const [a, b] = t.legs.map(id => G.fixtures.find(f => f.id === id)); return a.h === b.a && a.a === b.h && b.firstLeg === a.id; }),
        groupWinnersHome: E.ties.r16.every(t => { const b = G.fixtures.find(f => f.id === t.legs[1]); return Object.keys(E.groups).some(g => eslGroupTable(g)[0].id === b.h); }) };
    });
    check('round of 16, quarter-finals and semi-finals are drawn', ko.ties, [8, 4, 2]);
    check('two legs with the second leg reversed', ko.legs, true);
    check('group winners host the second leg', ko.groupWinnersHome, true);
    check('the final is one Saturday match at a neutral ground', ko.final, true);
    check('the winner earns at least the fee and every round', [ko.winner, ko.paid], [true, true]);
    check('league tables are untouched by the competition', ko.epl, true);

    await page.evaluate(() => { UI.tab.homeCompetition = 'ESL'; go('competitions'); });
    check('Competitions has a Euro Super League tab with eight groups', await page.locator('.main .tbl').count(), 8);
    await page.locator('[data-a=tab][data-key=eslView][data-v=ko]').click();
    check('the knockout view lists the ties', await page.locator('.main').textContent().then(t => /Round of 16/.test(t) && /aggregate/.test(t)), true);
    await page.locator('[data-a=tab][data-key=eslView][data-v=prize]').click();
    check('the prize money view shows the UEFA amounts', await page.locator('.main').textContent().then(t => /€18\.62m/.test(t) && /€6\.50m/.test(t)), true);
    check('the screen fits a phone', await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
    check('No browser runtime errors', errors, []);
    console.log(JSON.stringify({ checks }, null, 2));
  } catch (e) { console.error(e); console.error(errors); process.exitCode = 1; }
  finally { await browser.close(); server.close(); }
})();
