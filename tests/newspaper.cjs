// Run with Playwright installed: node tests/newspaper.cjs [existing server URL]
// Public news items get a newspaper story: outlet, headline, standfirst, photo and weight.
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('node:path');

(async () => {
  const browser = await chromium.launch({ headless: true, ...(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH, args: ['--no-sandbox', '--disable-dev-shm-usage'] } : {}) });
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const errors = [], checks = [];
  page.on('pageerror', e => errors.push(e.message));
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
  try {
    await page.goto(base + '/');
    await page.locator('[data-a="titleNew"]').click();
    await page.locator('[data-a="startGame"]').click();

    const lib = await page.evaluate(() => ({
      images: [...new Set(Object.values(NEWS_IMAGES).flat())],
      missingTemplates: Object.keys(NEWS_IMAGES).filter(k => !STORY_TEMPLATES[k]?.length),
      outlets: Object.keys(OUTLETS),
    }));
    check('Every occasion with photos also has templates', lib.missingTemplates, []);
    check('Five papers: club, match, transfer, life, league', lib.outlets, ['club', 'match', 'transfer', 'life', 'league']);
    check('Every photo a story can use exists in public/assets/news', lib.images.filter(f => !fs.existsSync(path.join(root, 'public/assets/news', f + '.webp'))), []);

    check('A new career opens with a public season story on the front page', await page.evaluate(() => G.news.find(n => n.box === 'news')?.story?.occasion), 'season-start');

    const matches = await page.evaluate(() => {
      const us = G.club, opp = plClubs().find(id => id !== us && G.clubs[id].city !== userClub().city), ids = seniorSquad(us).map(p => p.id);
      const run = (goals, against, fr = false) => {
        addNews('match', 'Test result', 'Test.');
        const S = { cid: us, st: { g: goals.length }, goals: goals.map(([i, min]) => ({ pid: ids[i], min })) };
        const O = { cid: opp, st: { g: against.length }, goals: against.map(min => ({ pid: 0, min })) };
        storyMatch(G.news[0], { h: us, a: opp, fr }, S, O, ids[0]);
        return G.news[0].story;
      };
      return {
        late: run([[0, 20], [1, 89]], [50]).occasion, brace: run([[2, 10], [2, 60]], []).occasion, hattrick: run([[3, 5], [3, 30], [3, 70]], [80]).occasion,
        big: run([[0, 5], [1, 30], [2, 70]], []).occasion, goalless: run([], []).occasion, heavy: run([], [10, 20, 30]).occasion, lateLoss: run([[0, 10]], [40, 88]).occasion,
        friendly: run([[0, 10]], [], true).occasion, score: run([[0, 10], [1, 20]], [30]).score,
      };
    });
    check('Match stories pick the occasion from the facts', [matches.late, matches.brace, matches.hattrick, matches.big, matches.goalless, matches.heavy, matches.lateLoss, matches.friendly],
      ['win-late', 'win-brace', 'win-hattrick', 'win-big', 'draw-goalless', 'loss-heavy', 'loss-late', 'friendly']);
    check('Match stories carry a home/away score bar', [matches.score.hg, matches.score.ag], [2, 1]);

    const deals = await page.evaluate(() => {
      const p = Object.values(G.players).find(x => x.club !== G.club && G.clubs[x.club]?.pl);
      const from = p.club, to = plClubs().find(id => id !== from && id !== G.club);
      const make = fee => { addNews('transfer', 'Test move', 'Test.'); storyTransfer(G.news[0], 'signing', p, from, to, fee); return G.news[0].story; };
      return { free: make(0).occasion, small: make(5e6).occasion, big: make(30e6).occasion, record: make(80e6).occasion, prose: make(5e6).standfirst };
    });
    check('Transfer stories scale with the fee', [deals.free, deals.small, deals.big, deals.record], ['signing-free', 'signing', 'signing-big', 'signing-record']);
    check('Standfirsts are sentences: capitalised, no unfilled facts', /^[A-Z0-9£]/.test(deals.prose) && !/[{}]/.test(deals.prose), true);

    const text = await page.evaluate(() => {
      const bad = [];
      for (const [occ, list] of Object.entries(STORY_TEMPLATES)) for (const [h, s] of list) if (/\bthe \{(club|to|from|us|opp)\}/i.test(h + ' ' + s)) bad.push(occ);
      return bad;
    });
    check('No template writes "the" before a club name (articles come from the club data)', text, []);

    const library = await page.evaluate(() => {
      const counts = Object.fromEntries(Object.entries(STORY_TEMPLATES).map(([k, v]) => [k, v.length]));
      const frequent = ['win', 'draw', 'loss', 'draw-goalless', 'signing', 'signing-big', 'potm', 'manager-month'];
      const V = { us: 'Gunners', opp: 'Villans', oppP: "Villans'", score: '2-0', gf: 2, motm: 'A Player', scorers: 'Hertwig and Bako' };
      G.storyRecent = []; const run = []; for (let i = 0; i < 20; i++) run.push(storyTemplate('win', V, 'w' + i)[0]);
      G.storyRecent = []; const away = []; for (let i = 0; i < 8; i++) away.push(storyTemplate('win', { ...V, away: '1' }, 'a' + i)[0]);
      return { thin: Object.entries(counts).filter(([, n]) => n < 3).map(([k]) => k), thinFrequent: frequent.filter(k => counts[k] < 8),
        distinct: new Set(run).size, firstDistinct: new Set(run.slice(0, 15)).size, awayUsed: away.some(h => /road|Away-day/.test(h)), noAwayLeak: run.every(h => !/road|Away-day/.test(h)) };
    });
    check('Every occasion has at least 3 templates, frequent ones at least 8', [library.thin, library.thinFrequent], [[], []]);
    check('Twenty wins with identical facts: no repeat in the first 15, at least 17 different headlines', [library.firstDistinct, library.distinct >= 17], [15, true]);
    check('Situational templates appear only when their fact is true (an away win)', [library.awayUsed, library.noAwayLeak], [true, true]);

    const privateItem = await page.evaluate(() => { addNews('inbox', 'Private', 'Test.', { t: 'renew', pid: seniorSquad(G.club)[0].id }); makeStory(G.news[0], 'club', 'new-contract', { player: 'X', pos: 'striker', years: 3 }); return !!G.news[0].story; });
    check('Only public News items become newspaper stories', privateItem, false);

    await page.evaluate(() => { UI.tab.nv = 'news'; UI.f.news = 'all'; go('news'); });
    check('The front page leads with a full newspaper header', await page.locator('.lead-story .paper .mast b').count(), 1);
    check('The lead is the heaviest recent story', await page.evaluate(() => { const lead = leadStory(newsList('news')); return lead.story.weight === Math.max(...newsList('news').filter(n => n.story && n.date >= lead.date - 3 * 864e5).map(n => n.story.weight)); }), true);
    const id = await page.evaluate(() => G.news.find(n => n.story?.occasion === 'signing-record').id);
    await page.evaluate(id => ACT.news({ id }), id);
    check('An opened story shows its newspaper header', await page.locator('.paper.in-sheet .phead').count(), 1);
    check('No page errors', errors, []);
    console.log(`${checks.length} newspaper checks passed`);
  } finally {
    await browser.close(); server.close();
  }
})().catch(e => { console.error(e); process.exit(1); });
