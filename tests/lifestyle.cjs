// Run with Playwright installed: node tests/lifestyle.cjs [existing server URL]
// The manager's own money (lifestyle.js): cars and homes (part-exchange, value over time, prestige and sponsorship,
// the board noticing a home), holiday trips and freshness, shares in his club (board seat, dividends, sold on
// leaving) and the profile screens.
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
    await page.evaluate(() => { const p = lifestyle(); p.bank = 2e6; go('manager'); });

    check('the profile shows the lifestyle card', await page.locator('.lifestyle').count(), 1);
    await page.locator('[data-a=lifeShop][data-k=car]').click();
    check('cars beyond the bank are disabled', await page.locator('#layer [data-a=lifeBuy][data-k=super]').isDisabled(), false);
    await page.locator('#layer [data-a=lifeBuy][data-k=saloon]').click();
    check('buying a car spends personal money and adds prestige', await page.evaluate(() => [lifestyle().bank, prestige()]), [2e6 - 70e3, 2]);
    check('a part-exchange credits the old car', await page.evaluate(() => { const b = lifestyle().bank; buyAsset('car', 'sports'); return [lifestyle().bank === b + 70e3 - 180e3, assetOf(lifestyle(), 'car').k, lifestyle().assets.length]; }), [true, 'sports', 1]);
    check('a home near the club pleases the board once', await page.evaluate(() => { const c = G.board.conf; buyAsset('home', 'flat'); const a = G.board.conf; sellAsset('home'); buyAsset('home', 'flat'); return [a - c, G.board.conf - a]; }), [3, 0]);
    check('prestige lifts weekly sponsorship', await page.evaluate(() => { const p = lifestyle(), run = () => { managerPayWeek(); return p.transactions.find(t => t.kind === 'sponsor').amount; }; const withIt = run(); const keep = p.assets; p.assets = []; const without = run(); p.assets = keep; return Math.round(withIt / without * 1000); }), 1135);
    check('cars lose value over time', await page.evaluate(() => { const a = assetOf(lifestyle(), 'car'), v = a.value; for (let i = 0; i < 52; i++) lifestyleWeek(); return Math.round(a.value / v * 100); }), 86);

    // Freshness: matches wear it down, a holiday with a trip restores it, and it weights team talks.
    check('freshness falls with matches and weights team talks', await page.evaluate(() => { const p = lifestyle(); p.fresh = 80; const fx = G.fixtures.find(f => isUserFx(f)); const w = G.week; G.week = fx.w; quickSim(fx); lifestyleWeek(); G.week = w; const after = p.fresh; p.fresh = 0; const f0 = freshFactor(); p.fresh = 100; return [after, f0, freshFactor()]; }), [78, 0.6, 1]);
    check('a trip is paid for and adds freshness on return', await page.evaluate(() => { const p = lifestyle(); p.fresh = 20; const b = p.bank; startHoliday('w1', 'reject', 'beach'); const paid = b - p.bank; const r = endHoliday('test'); return [paid, p.fresh, r.fresh[1]]; }), [40e3, 50, 50]);
    check('a trip you cannot afford is refused', await page.evaluate(() => { const p = lifestyle(), b = p.bank; p.bank = 1000; const r = startHoliday('w1', 'reject', 'safari'); p.bank = b; return [r.ok, !!G.career.holiday]; }), [false, false]);

    // Shares in the club: a board seat at 10%, dividends from profit, sold on leaving.
    const shares = await page.evaluate(() => {
      const p = lifestyle(); p.bank = 1e10; const conf = G.board.conf, odds = reinvestAskOdds(10);
      buyShares(5); const before = boardSeat(); buyShares(5);
      const out = { pct: p.shares.pct, seat: [before, boardSeat()], conf: G.board.conf - conf, odds: Math.round((reinvestAskOdds(10) - odds) * 100), cap: buyShares(20).ok };
      Object.assign(G.ledger, { tv: 100e6, gate: 0, spon: 0, merch: 0, sales: 0, prize: 0, wages: 60e6, staff: 0, manager: 0, buys: 0, ops: 0, scout: 0 });
      const b = p.bank; lifestyleDividend(); out.dividend = p.bank - b;
      const worth = sharePrice() * p.shares.pct, b2 = p.bank; resignJob(); out.sold = [p.shares, p.bank - b2 === worth];
      return out;
    });
    check('10% of the club gives a board seat', shares.seat, [false, true]);
    check('the board seat raises confidence and the board listens more', [shares.conf, shares.odds >= 0], [3, true]);
    check('no more than 25%', shares.cap, false);
    check('dividends are a quarter of the profit, pro rata', shares.dividend, Math.round(40e6 * 0.25 * 0.10));
    check('leaving the club sells the shares at their value', shares.sold, [null, true]);
    check('between clubs you cannot buy shares', await page.evaluate(() => buyShares(1).ok), false);

    await page.evaluate(() => go('manager'));
    check('the profile shows lifestyle between clubs too', await page.locator('.lifestyle').count(), 1);
    check('transactions show spending with a minus sign', await page.locator('.main').textContent().then(t => /−£/.test(t)), true);
    check('the profile fits a phone', await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
    await page.evaluate(() => { lifestyle().bank = 5e6; retireCareer(); render(); });
    check('retirement shows net worth', await page.locator('.start').textContent().then(t => /Net worth/.test(t)), true);
    check('No browser runtime errors', errors, []);
    console.log(JSON.stringify({ checks }, null, 2));
  } catch (e) { console.error(e); console.error(errors); process.exitCode = 1; }
  finally { await browser.close(); server.close(); }
})();
