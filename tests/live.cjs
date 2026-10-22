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

    // The 2D view draws the engine's own frames; the camera follows the ball; highlight levels skip quiet play.
    await page.evaluate(() => { G.settings.hl = 'full'; });
    await page.waitForFunction(() => LIVE.mq && LIVE.mq.fr.length > 0 && LIVE.M.min >= 2, null, { timeout: 30000 });
    await page.evaluate(() => { LIVE.paused = false; LIVE.hold = 0; LIVE.overlay = null; closeSheet(true); G.settings.hl = 'full'; LIVE.mq.segs = [[0, 60]]; LIVE.mq.p = 0; });
    const v = await page.evaluate(() => new Promise(done => {
      const L = LIVE, out = { frames: L.mq.fr.length, width: L.mq.fr[0].length, fast: 0, off: 0, inView: 0, samples: 0, match: 0 };
      // Speeds straight from the engine's frames (half a second apart).
      const fr = L.mq.fr;
      for (let k = 1; k < fr.length; k++) for (let n = 7; n < 51; n += 2) { if (fr[k][n] == null || fr[k - 1][n] == null) continue; const m = Math.hypot(fr[k][n] - fr[k - 1][n], fr[k][n + 1] - fr[k - 1][n + 1]); if (m > 6.5 && fr[k][6] === fr[k - 1][6] && !fr[k][6]) out.fast++; }
      let n = 0;
      const tick = () => {
        if (n++ > 120 || LIVE !== L) return done(out);
        if (L.mq && !L.paused && !L.hold) {
          out.samples++;
          const [bx, by] = view(L, L.ball.x, L.ball.y), x = sx(L, bx), y = sy(L, by);
          if (x >= 0 && x <= L.W && y >= 0 && y <= L.H) out.inView++;
          const d = L.dots[0][5], q = L.mq; // the screen shows the engine's position for that second
          const t = q.t0 + q.p, k = q.fr.findIndex(f => f[0] >= t), f = q.fr[Math.max(0, k)];
          if (d && f && f[7 + 10] != null && Math.hypot(d.x - f[17], d.y - f[18]) < 6) out.match++;
        }
        requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }));
    console.log('view', JSON.stringify(v));
    check('Playback checks sampled actual animated frames', v.samples >= 20, true);
    check('The engine records the minute every half second (ball + 22 players and where each faces)', [v.frames >= 110, v.width], [true, 73]);
    check('Players move at football speeds', v.fast, 0);
    check('The camera keeps the ball on screen', v.inView >= v.samples * 0.9, true);
    check('The screen draws the engine positions', v.match >= v.samples * 0.85, true);
    // A highlight is a story: from where the team won the ball to the finish. A corner or an attack that ends in
    // nothing is not a highlight; key < extended < full.
    const hl = await page.evaluate(() => {
      const marks = [{ t: 100, k: 'shot', s: 0, xg: 0.2 }, { t: 120, k: 'shot', s: 0, xg: 0.02 }, { t: 135, k: 'card', s: 1 }, { t: 140, k: 'corner', s: 0 }, { t: 145, k: 'attack', s: 0 }];
      const fr = []; for (let t = 90; t <= 150; t += 0.5) { const f = [t, 30, 50, 0, t < 95 ? 1 : 0, 3, '']; fr.push(f); }
      const run = lv => { G.settings.hl = lv; return segments(marks, 90, 0, null, fr); };
      const k = run('key'), e = run('ext'), f = run('full'); G.settings.hl = 'ext';
      const len = a => a.reduce((t, s) => t + s[1] - s[0], 0), covers = (a, p) => a.some(s => p >= s[0] && p <= s[1]);
      return { lens: [len(k), len(e), len(f)], storyStart: k[0] && k[0][0], cornerShown: covers(e, 52) || covers(k, 52) };
    });
    check('Highlights: key < extended < full', hl.lens[0] > 0 && hl.lens[0] < hl.lens[1] && hl.lens[1] < hl.lens[2] && hl.lens[2] === 60, true);
    check('A highlight starts where the team won the ball', Math.abs(hl.storyStart - 3.5) < 0.6, true);
    check('A corner or an attack that ends in nothing is not a highlight', hl.cornerShown, false);
    await page.screenshot({ path: '/tmp/futbol-live-view.png' });
    await page.evaluate(() => { G.settings.hl = 'ext'; });

    const min = await page.evaluate(() => LIVE.M.min);
    const score = await page.evaluate(() => LIVE.M.sides.map(S => S.st.g).join('-'));
    await act('back'); await page.waitForFunction(() => UI.s !== 'match');
    check('Back leaves the match', (await state()).screen, 'prematch');
    check('Match is kept in the save', await page.evaluate(async id => { await SaveStorage.flush(); return (await SaveStorage.request('load')).live.fid === id; }, fid), true);
    await act('go', { s: 'home' });
    await act('go', { s: 'squad' });
    await page.evaluate(() => go('prematch'));
    check('Prematch offers resume', await page.locator('[data-a="kickoff"]').innerText(), 'Resume match');
    await act('kickoff');
    check('Resume continues the same minute after visiting other pages', await page.evaluate(m => LIVE.M.min >= m && LIVE.M.min <= m + 1, min), true);

    const waitMin = async target => { for (let k = 0; k < 120; k++) { if (await page.evaluate(t => { G.settings.hl = 'key'; G.settings.speed = 4; if (LIVE.paused && !LIVE.done) { closeSheet(true); LIVE.paused = false; LIVE.overlay = null; } return LIVE.M.min >= t; }, target)) return; await page.waitForTimeout(500); } throw new Error('match did not reach minute ' + target); };
    await waitMin(min + 4);
    const before = await page.evaluate(() => ({ min: LIVE.M.min, score: LIVE.M.sides.map(S => S.st.g).join('-') }));
    // The match can advance after the preceding evaluate() and before reload.
    // Compare with the checkpoint at actual page exit, not an earlier clock sample.
    await page.evaluate(() => window.addEventListener('pagehide', () => {
      sessionStorage.setItem('test:live-exit', JSON.stringify({ min: LIVE.M.min, score: LIVE.M.sides.map(S => S.st.g).join('-') }));
    }, { once: true }));
    await page.evaluate(async () => { LIVE.paused = true; liveKeep(); await SaveStorage.flush(); });
    await page.reload();
    await page.waitForFunction(() => typeof LIVE !== 'undefined' && LIVE && UI.s === 'match');
    const after = await page.evaluate(() => ({ min: LIVE.M.min, score: LIVE.M.sides.map(S => S.st.g).join('-'), paused: LIVE.paused, s: UI.s }));
    check('Refresh returns to the live match', after.s, 'match');
    const exit = await page.evaluate(() => JSON.parse(sessionStorage.getItem('test:live-exit')));
    check('Refresh keeps the minute', after.min === exit.min && exit.min >= before.min, true);
    check('Refresh keeps the score', after.score, exit.score);
    check('Resumed match waits paused', after.paused, true);
    check('Scoreboard shows the kept score', await page.locator('#sbScore').innerText(), after.score.replace('-', ' - '));

    await waitMin(after.min + 3);
    const m2 = await page.evaluate(() => { LIVE.paused = true; liveKeep(); const min = LIVE.M.min; stopLive(); loadGame(); go('prematch'); return min; });
    await act('kickoff');
    check('Save and load resumes the same minute', await page.evaluate(() => LIVE.M.min), m2);
    check('Loaded match is the saved one, not a new kick-off', await page.evaluate(() => LIVE.M === G.live.M), true);
    const kb = await page.evaluate(async () => { await SaveStorage.flush(); return Math.round(JSON.stringify(await SaveStorage.request('load')).length / 1024); });
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
