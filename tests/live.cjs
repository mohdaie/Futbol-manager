// Run with Playwright installed: node tests/live.cjs [existing server URL]
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
    await page.goto(base + '/');
    await page.locator('[data-a="titleNew"]').click();
    await page.locator('[data-a="startGame"]').click();
    await page.evaluate(() => { G.settings.speed = 4; while (!userFixture()) advanceWeek(); go('prematch'); });
    await act('kickoff');
    const fid = await page.evaluate(() => LIVE.fid);

    // Movement: sample the 2D view while the match plays.
    const probe = await page.evaluate(() => new Promise(done => {
      const L = LIVE, out = { frames: 0, beyond: 0, offside: 0, fast: 0, meets: 0, misses: 0, gaps: [] };
      let prev = null, lastCur = null;
      const tick = () => {
        if (LIVE !== L || L.M.min >= 25 || out.frames > 2400) { out.min = L.M.min; out.paused = L.paused; return done(out); }
        out.frames++;
        // Attackers not involved in the move stay onside (allowing for players still getting back).
        if (!L.kick && L.poss != null) {
          const a = L.poss, line = liveLine(L, a);
          L.M.sides[a].on.forEach((id, i) => {
            const d = L.dots[a][i]; if (!id || !i || !d || L.pins[a + ':' + i]) return;
            // Offside and not getting back (vy is in canvas frame; own frame "back" is +y).
            const back = (a === L.bottom ? 1 : -1) * (d.vy || 0);
            if (toCanvas(L, a, d.x, d.y)[1] < line - 0.03) { out.beyond++; if (back < 0.002) out.offside++; }
          });
        }
        // Nobody moves faster than a sprinting footballer (with the catch-up allowance).
        if (prev) [0, 1].forEach(si => L.dots[si].forEach((d, i) => {
          const p = prev[si][i], id = L.M.sides[si].on[i]; if (!p || !id || L.pins[si + ':' + i]?.hold) return;
          const m = Math.hypot((d.x - p.x) * 68, (d.y - p.y) * 105), dt = L.lastDt || 16;
          if (m / dt > topSpeed(L, L.M.sides[si], id) * 1.7 + 0.002) out.fast++;
        }));
        // A pass ends with the receiver on the ball.
        if (lastCur && L.cur !== lastCur && lastCur.rk) {
          const [si, i] = lastCur.rk.split(':').map(Number), d = L.dots[si][i];
          const gap = Math.hypot((d.x - lastCur.x) * 68, (d.y - lastCur.y) * 105);
          if (gap < 3) out.meets++; else { out.misses++; out.gaps.push(+gap.toFixed(1)); }
        }
        lastCur = L.cur;
        prev = L.dots.map(s => s.map(d => d && { x: d.x, y: d.y }));
        requestAnimationFrame(tick);
      };
      const orig = liveFrame;
      requestAnimationFrame(tick);
    }));
    console.log('movement', JSON.stringify(probe));
    check('Attackers stay onside when not in the move', probe.offside / probe.frames < 0.03, true);
    check('Players move at running speed', probe.fast, 0);
    check('Passes reach the receiver', probe.misses <= Math.max(2, probe.meets * 0.1), true);

    const min = await page.evaluate(() => LIVE.M.min);
    const score = await page.evaluate(() => LIVE.M.sides.map(S => S.st.g).join('-'));
    await act('back'); await page.waitForTimeout(100);
    check('Back leaves the match', (await state()).screen, 'prematch');
    check('Match is kept in the save', await page.evaluate(id => JSON.parse(localStorage.getItem(SAVE_KEY)).live.fid === id, fid), true);
    await act('go', { s: 'home' });
    await act('go', { s: 'squad' });
    await page.evaluate(() => go('prematch'));
    check('Prematch offers resume', await page.locator('[data-a="kickoff"]').innerText(), 'Resume match');
    await act('kickoff');
    check('Resume continues the same minute after visiting other pages', await page.evaluate(m => LIVE.M.min >= m && LIVE.M.min <= m + 1, min), true);

    await page.evaluate(() => { LIVE.paused = false; });
    await page.waitForFunction(m => LIVE.M.min >= m + 4, min);
    const before = await page.evaluate(() => ({ min: LIVE.M.min, score: LIVE.M.sides.map(S => S.st.g).join('-') }));
    await page.reload();
    await page.waitForFunction(() => typeof LIVE !== 'undefined' && LIVE && UI.s === 'match');
    const after = await page.evaluate(() => ({ min: LIVE.M.min, score: LIVE.M.sides.map(S => S.st.g).join('-'), paused: LIVE.paused, s: UI.s }));
    check('Refresh returns to the live match', after.s, 'match');
    check('Refresh keeps the minute', after.min >= before.min - 1 && after.min <= before.min, true);
    check('Refresh keeps the score', after.score === before.score || after.min < before.min, true);
    check('Resumed match waits paused', after.paused, true);
    check('Scoreboard shows the kept score', await page.locator('#sbScore').innerText(), after.score.replace('-', ' - '));

    await page.evaluate(() => { LIVE.paused = false; });
    await page.waitForFunction(m => LIVE.M.min >= m + 3, after.min);
    const m2 = await page.evaluate(() => { liveKeep(); return LIVE.M.min; });
    await page.evaluate(() => { stopLive(); loadGame(); go('prematch'); });
    await act('kickoff');
    check('Save and load resumes the same minute', await page.evaluate(() => LIVE.M.min), m2);
    check('Loaded match is the saved one, not a new kick-off', await page.evaluate(() => LIVE.M === G.live.M), true);
    const kb = await page.evaluate(() => Math.round(localStorage.getItem(SAVE_KEY).length / 1024));
    const ms = await page.evaluate(() => { const t = performance.now(); saveGame(); return Math.round(performance.now() - t); });
    console.log('save', kb + ' KB', ms + ' ms');
    check('Saving each minute is quick', ms < 80, true);

    await act('instant2');
    check('Full time clears the kept match', await page.evaluate(() => G.live), null);
    check('Result recorded once', await page.evaluate(id => played(G.fixtures.find(f => f.id === id)), fid), true);
    check('No browser runtime errors', errors, []);
    console.log(JSON.stringify({ passed: checks.length, checks }, null, 2));
  } finally { await browser.close(); server.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
