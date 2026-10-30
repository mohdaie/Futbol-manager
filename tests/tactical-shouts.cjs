// Run with Playwright installed: node tests/tactical-shouts.cjs [existing server URL]
// Tactical shouts in a live match: start, instructions overridden and restored, staff review keep/revert,
// Keep it, Back to main tactic, a manager change during the spell survives the revert, the sheet fits a phone.
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
  try {
    await page.goto(base + '/');
    await page.locator('[data-a="titleNew"]').click();
    await page.locator('[data-a="startGame"]').click();
    await page.evaluate(() => { G.settings.speed = 4; while (!userFixture()) advanceWeek(); go('prematch'); });
    await act('kickoff');
    await page.waitForFunction(() => LIVE && LIVE.M.min >= 1, null, { timeout: 30000 });
    await page.evaluate(() => { LIVE.paused = true; const S = liveSide(); Object.assign(S, { ment: 2, line: 1, press: 1, width: 1, tempo: 1, pass: 1 }); });

    await act('liveSheet', { k: 'shouts' });
    check('the shouts sheet lists the five tactical shouts', await page.locator('#layer [data-a=tshout]').count(), 5);
    check('motivational shouts remain', await page.locator('#layer [data-a=shout]').count() > 0, true);
    check('the shouts sheet fits a small phone', await page.evaluate(() => { const s = document.querySelector('#layer .sheet'); return s.scrollWidth <= s.clientWidth + 1; }), true);
    await page.locator('#layer [data-a=tshout][data-k=deeper]').click();
    check('Drop deeper lowers line, press and mentality for the spell', await page.evaluate(() => { const S = liveSide(); return [S.tsh.k, S.line, S.press, S.ment, S.tsh.until - S.tsh.from]; }), ['deeper', 0, 0, 1, 10]);
    check('the touchline call appears in the commentary', await page.evaluate(() => LIVE.feed.some(f => /drop deeper/i.test(f.txt))), true);

    await act('liveSheet', { k: 'shouts' });
    check('the active shout shows when the staff will check it', (await page.locator('#layer .note').first().innerText()).includes('Staff check at'), true);
    await page.locator('#layer [data-a=tshoutEnd]').click();
    check('Back to main tactic restores the instructions', await page.evaluate(() => { const S = liveSide(); return [S.tsh, S.line, S.press, S.ment]; }), [null, 1, 1, 2]);

    // Staff review: a clearly worse spell reverts, but an instruction the manager changed during it is his.
    const reverted = await page.evaluate(() => {
      const M = LIVE.M, S = liveSide(), O = M.sides[1 - S.idx];
      tacticalShout(M, S, 'higher'); S.tsh.pre = 0.05; S.press = 0; // a manager change during the spell
      M.min = S.tsh.until; O.st.xg += 3;
      const e = reviewTacticalShout(M, S);
      return [e.res, S.tsh, S.line, S.press];
    });
    check('a clearly worse spell goes back to the main tactic and keeps the manager change', reverted, ['revert', null, 1, 0]);
    const kept = await page.evaluate(() => {
      const M = LIVE.M, S = liveSide(); S.press = 1;
      tacticalShout(M, S, 'shoot'); S.tsh.pre = -1; M.min = S.tsh.until;
      const e = reviewTacticalShout(M, S); return [e.res, S.tsh.k, S.tsh.until - M.min];
    });
    check('a working spell stays and is checked again in 10 minutes', kept, ['keep', 'shoot', 10]);
    const unclear = await page.evaluate(() => {
      const M = LIVE.M, S = liveSide(); tacticalShout(M, S, 'calm');
      M.min = S.tsh.until; S.tsh.pre = TSHOUT.calm.score(tshRate(S.tsh.start, tshCount(M, S)));
      const a = reviewTacticalShout(M, S).res, until = S.tsh.until - M.min; return [a, until, S.tsh.ext];
    });
    check('an unclear spell gets five more minutes once', unclear, ['extend', 5, true]);
    await act('liveSheet', { k: 'shouts' });
    await page.locator('#layer [data-a=tshoutKeep]').click();
    const keep = await page.evaluate(() => { const M = LIVE.M, S = liveSide(); S.tsh.pre = 99; M.min = S.tsh.until; const e = reviewTacticalShout(M, S); return [e, S.tsh.k, S.tsh.keep]; });
    check('Keep it overrides the staff review', keep, [null, 'calm', true]);
    await act('closeSheet');
    await page.evaluate(() => { LIVE.paused = false; });
    await page.waitForFunction(m => LIVE.M.min > m, await page.evaluate(() => LIVE.M.min), { timeout: 30000 });
    check('the match keeps playing with an active shout', await page.evaluate(() => liveSide().tsh?.k), 'calm');
    check('No browser runtime errors', errors, []);
    console.log(JSON.stringify({ checks }, null, 2));
  } catch (e) { console.error(e); process.exitCode = 1; }
  finally { await browser.close(); server.close(); }
})();
