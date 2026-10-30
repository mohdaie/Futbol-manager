// Run with Playwright installed: node tests/cups.cjs [existing server URL]
// Domestic cups (cups.js) over a whole season: entrants, the first round for the lowest-ranked clubs, Saturday and
// midweek scheduling with no club playing twice in a day, single-match ties settled on the day, two-legged League
// Cup semi-finals, neutral finals, prize money, honours, next season's draw and the Competitions screen.
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

    const start = await page.evaluate(() => {
      const N = G.cups.NC, L = G.cups.LC, fx = id => G.fixtures.filter(f => f.comp === id);
      return { cups: cupsPlayed(), entrants: [N.entrants.length, L.entrants.length], byes: N.byes.length, prelim: [N.rounds.p.length, L.rounds.p.length],
        prelimSecondTier: N.rounds.p.every(t => { const f = G.fixtures.find(x => x.id === t.legs[0]); return leagueOf(f.h) === secondLeague() && leagueOf(f.a) === secondLeague(); }),
        ncSaturday: fx('NC').every(f => f.d === 5 && f.w >= 26), lcMidweek: fx('LC').every(f => f.d === 1 || f.d === 2) };
    });
    check('England plays the National Cup and the League Cup', start.cups, ['NC', 'LC']);
    check('all 44 clubs enter both cups', start.entrants, [44, 44]);
    check('20 clubs wait for the round of 32; 12 first-round ties', [start.byes, start.prelim], [20, [12, 12]]);
    check('the first round is for the lowest-ranked clubs', start.prelimSecondTier, true);
    check('National Cup ties on Saturdays from January; League Cup ties midweek', [start.ncSaturday, start.lcMidweek], [true, true]);
    check('other countries play the National Cup only', await page.evaluate(() => { const l = G.leagues; G.leagues = ['ES1', 'ES2']; const c = cupsPlayed(); G.leagues = l; return c; }), ['NC']);

    const season = await page.evaluate(() => {
      const s0 = G.season; let guard = 0, clash = 0;
      const sameDay = () => { const seen = new Map(); for (const f of G.fixtures) for (const c of [f.h, f.a]) { const k = c + ':' + fxDayNo(f); if (seen.has(k)) clash++; seen.set(k, 1); } };
      sameDay();
      const snap = {}, roll = rollover; // the finished cups, just before the new season replaces them
      rollover = function () { sameDay(); snap.NC = structuredClone(G.cups.NC); snap.LC = structuredClone(G.cups.LC); snap.fixtures = G.fixtures.filter(f => f.cup && f.comp !== 'ESL').map(f => ({ ...f })); return roll.apply(this, arguments); };
      while (G.season === s0 && guard++ < 80) {
        const fx = userFixture(); if (fx && !played(fx)) quickSim(fx);
        advanceWeek(); if (G.seasonReview) G.seasonReview = null;
      }
      rollover = roll;
      const stageSizes = id => Object.fromEntries(Object.entries(snap[id].rounds).map(([k, t]) => [k, t.length]));
      const tieWinners = id => Object.values(snap[id].rounds).flat().every(t => !!t.winner);
      const fin = id => snap.fixtures.find(f => f.comp === id && f.stage === 2);
      const ncWinner = snap.NC.winner, lcWinner = snap.LC.winner;
      return { clash, rolled: G.season === s0 + 1, nc: stageSizes('NC'), lc: stageSizes('LC'), winners: [tieWinners('NC'), tieWinners('LC')],
        ncNeutral: snap.fixtures.filter(f => f.comp === 'NC' && (f.stage === 4 || f.stage === 2)).every(f => f.neutral), ncFinal: fin('NC').d,
        lcSemis: snap.LC.rounds[4].every(t => t.legs.length === 2), lcFinal: [fin('LC').d, fin('LC').neutral],
        ncPrize: snap.NC.prizes[ncWinner] >= 127000 + 238500 + 477000 + 1060000 + 2120000, lcPrize: snap.LC.prizes[lcWinner] === 100000,
        lcLosers: snap.LC.rounds[4].every(t => { const f = snap.fixtures.find(x => x.id === t.legs[1]); const loser = f.h === t.winner ? f.a : f.h; return snap.LC.prizes[loser] === 25000; }),
        history: [G.cupHistory?.NC?.[0]?.winner === ncWinner, G.cupHistory?.LC?.[0]?.winner === lcWinner],
        next: [G.cups.season === G.season, G.cups.NC.rounds.p?.length, G.cups.LC.rounds.p?.length] };
    });
    check('no club ever plays twice on one day', season.clash, 0);
    check('the season completes', season.rolled, true);
    check('National Cup rounds from the first round to the final', season.nc, { p: 12, 32: 16, 16: 8, 8: 4, 4: 2, 2: 1 });
    check('League Cup rounds from the first round to the final', season.lc, { p: 12, 32: 16, 16: 8, 8: 4, 4: 2, 2: 1 });
    check('every tie has a winner (extra time and penalties on the day)', season.winners, [true, true]);
    check('National Cup semi-finals and final at a neutral ground, final on a Saturday', [season.ncNeutral, season.ncFinal], [true, 5]);
    check('League Cup semi-finals over two legs, a neutral Sunday final', [season.lcSemis, season.lcFinal], [true, [6, true]]);
    check('National Cup winners earn every round from the round of 32', season.ncPrize, true);
    check('League Cup prize money from the semi-finals only', [season.lcPrize, season.lcLosers], [true, true]);
    check('the winners are recorded', season.history, [true, true]);
    check('next season both cups are drawn again', season.next, [true, 12, 12]);

    await page.evaluate(() => { UI.tab.homeCompetition = 'NC'; go('competitions'); });
    check('Competitions shows the cups', await page.locator('.comp-seg button').count(), 5);
    check('the National Cup lists its first-round ties', await page.locator('.main .row').count() >= 12, true);
    await page.locator('[data-a=tab][data-key=cupView][data-v=prize]').click();
    check('the prize money view shows the FA amounts', await page.locator('.main').textContent().then(t => /£2\.1m|£2,120,000|£2.12m/.test(t)), true);
    check('the screen fits a phone', await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
    check('No browser runtime errors', errors, []);
    console.log(JSON.stringify({ checks }, null, 2));
  } catch (e) { console.error(e); console.error(errors); process.exitCode = 1; }
  finally { await browser.close(); server.close(); }
})();
