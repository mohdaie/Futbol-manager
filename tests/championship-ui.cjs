// Two-league UI, durable saves, hard squad limits, playoffs and rollover.
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
    await page.goto(base); await page.locator('[data-a=titleNew]').click();
    check('Premier League selection offers the 20 updated clubs', await page.locator('[data-a=pickClub]').count() === 20);
    await page.locator('[data-a=pickLeague][data-id=ECH]').tap();
    check('Championship selection offers 24 clubs with official names beside nicknames', await page.locator('[data-a=pickClub]').count() === 24 && /Wrexham AFC/.test(await page.locator('[data-a=pickClub][data-id=WRE]').textContent()));
    await page.locator('[data-a=startGame]').tap();
    check('A Championship career opens on its own dashboard', await page.evaluate(() => UI.s === 'home' && leagueOf(G.club) === 'ECH' && leagueTable().length === 24));
    for (const screen of ['squad', 'tactics', 'fixtures', 'table', 'youth', 'clubs', 'finance', 'gamestatus']) await page.evaluate(screen => go(screen), screen);
    await page.evaluate(() => go('squad'));
    check('Championship squad controls expose First team and Reserves only', await page.locator('[data-a=sqL]').count() === 2 && await page.locator('[data-a=sqL][data-v=Y]').count() === 0);
    check('The squad screen shows the combined 36-player limit', /36 \/ 36 players/.test(await page.locator('.h1').textContent()));
    await page.evaluate(() => { go('fixtures'); UI.tab.fx = 'all'; render(); });
    check('All Championship rounds are available', await page.locator('#rsel option').count() === 46);
    await page.evaluate(() => go('table'));
    check('The Championship table explains automatic promotion and playoffs', /Automatic promotion/.test(await page.locator('.legend').textContent()) && await page.locator('.tbl tbody tr').count() === 24);
    await page.locator('[data-a=leagueView][data-id=EPL]').tap();
    check('Both league tables are available and kept separate', await page.locator('.tbl tbody tr').count() === 20);
    check('The 37th signing is rejected before money or ownership changes', await page.evaluate(() => {
      const p = squadOf('FA')[0], before = JSON.stringify([p, userClub().squad, userClub().bal, G.fin, G.ledger]);
      const offer = offerContract(p.id, 1e6, 3, 'First team', 0, 'buy');
      let failed = false; try { completeSigning(p, 0, 1e6, 3, 'First team'); } catch { failed = true; }
      return !offer.ok && failed && before === JSON.stringify([p, userClub().squad, userClub().bal, G.fin, G.ledger]);
    }));
    check('The intake and transfer top-ups respect the squad cap', await page.evaluate(() => {
      G.week = 36; while (weekDate(G.week).getMonth() !== 2 || weekDate(G.week).getDate() < 15) G.week++;
      youthIntake(); weeklyTransfers(); return leagueClubs('ECH').every(id => G.clubs[id].squad.length <= 36 && levelSquad(id, 'Y').length === 0);
    }));
    check('Young arrivals join the reserves when a roster space exists', await page.evaluate(() => {
      const released = squadOf(G.club).at(-1); moveClub(released, 'FA');
      const prospect = squadOf('FA').find(p => p.age <= 17) || genPlayer({ pos: 'MC', ca: 55, age: 17, nat: 'ENG', club: 'FA' });
      if (!G.players[prospect.id]) addToClub(prospect, G.clubs.FA);
      moveClub(prospect, G.club); return prospect.lvl === 'R' && userClub().squad.length === 36 && levelSquad(G.club, 'Y').length === 0;
    }));
    const playoff = await page.evaluate(async () => {
      // Deterministic completed league tables isolate actual postseason handling.
      for (const comp of G.leagues) {
        const ids = leagueClubs(comp);
        for (const f of G.fixtures.filter(f => leagueFixture(f, comp))) { const home = ids.indexOf(f.h) < ids.indexOf(f.a); f.hg = home ? 2 : 0; f.ag = home ? 0 : 2; }
      }
      const before = JSON.stringify(leagueTable('ECH'));
      updateCompetitionSeason(); updateCompetitionSeason();
      const semis = G.fixtures.filter(f => f.playoff), pairs = G.playoffs.ties;
      const seeded = pairs.every(([a,b],i) => { const first = G.fixtures.find(f=>f.id===a), second=G.fixtures.find(f=>f.id===b); return first.h===G.playoffs.participants[3-i] && second.h===G.playoffs.participants[i] && second.firstLeg===first.id; });
      await simulateFixtures(semis);
      const final = G.fixtures.find(f=>f.id===G.playoffs.final); await simulateMatchAsync(final);
      return { seeded, semis:semis.length, final:!!final.neutral, winner:G.playoffs.winner, automatic:G.playoffs.automatic, unchanged:before===JSON.stringify(leagueTable('ECH')), expectedRelegated:leagueTable('EPL').slice(-3).map(r=>r.id) };
    });
    check('Playoff semifinals use 3rd v 6th and 4th v 5th with the higher side home second', playoff.seeded && playoff.semis === 4);
    check('The neutral final produces a winner without altering league points', playoff.final && playoff.winner && playoff.unchanged);
    check('Rollover promotes three and relegates three while enforcing Championship squad policy', await page.evaluate(({ automatic, winner, expectedRelegated }) => {
      G.week = SEASON_WEEKS - 1; seasonEnd();
      return G.season === 2027 && leagueClubs('EPL').length === 20 && leagueClubs('ECH').length === 24 && automatic.concat(winner).every(id=>leagueOf(id)==='EPL') && expectedRelegated.every(id=>leagueOf(id)==='ECH') && leagueClubs('ECH').every(id=>G.clubs[id].squad.length<=36&&!levelSquad(id,'Y').length) && G.fixtures.length===932;
    }, playoff));
    check('A second rollover cannot regrow Championship U18s or exceed the limit', await page.evaluate(() => { rollover(); return G.season===2028 && leagueClubs('ECH').every(id=>G.clubs[id].squad.length<=36&&!levelSquad(id,'Y').length); }));
    await page.evaluate(async () => { G.seasonReview = null; go('home'); await saveGameAsync(); });
    await page.reload(); await page.waitForFunction(() => G && G.season === 2028);
    check('Durable save and reload retain both divisions and their squad limits', await page.evaluate(() => G.leagues.length===2 && leagueClubs('ECH').length===24 && leagueClubs('ECH').every(id=>G.clubs[id].squad.length<=36&&!levelSquad(id,'Y').length)));
    check('No mobile overflow or browser errors', errors.length===0 && await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
    console.log(JSON.stringify({passed:checks.length,checks},null,2));
  } finally { if(browser) await browser.close(); server.close(); }
})().catch(error => { console.error(error); process.exitCode=1; });
