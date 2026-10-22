// Motion regressions: run with Playwright and CHROMIUM_PATH, optionally a server URL.
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('node:path'), http = require('node:http');

(async () => {
  const root = path.resolve(__dirname, '..'), checks = [], errors = [];
  const server = http.createServer((req, res) => {
    const file = path.resolve(root, '.' + new URL(req.url, 'http://localhost').pathname.replace(/\/$/, '/index.html'));
    if (!file.startsWith(root + path.sep)) return res.writeHead(403).end();
    try {
      res.setHeader('Content-Type', ({ '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css', '.webp': 'image/webp' })[path.extname(file)] || 'application/octet-stream');
      res.end(fs.readFileSync(file));
    } catch { res.writeHead(404).end(); }
  });
  let browser;
  const check = (name, value) => { assert.ok(value, name); checks.push(name); };
  try {
    if (!process.argv[2]) await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
    browser = await chromium.launch({ headless: true, ...(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH, args: ['--no-sandbox', '--disable-dev-shm-usage'] } : {}) });
    const page = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
    page.on('pageerror', e => errors.push(e.message));
    await page.route('https://fonts.googleapis.com/**', r => r.abort());
    await page.goto(process.argv[2] || 'http://127.0.0.1:' + server.address().port);
    const curves = await page.evaluate(() => {
      const cases = [[0, 4, 4, 4], [8, 4, 4, 0], [0, 1, 5, 6], [8, 6, 2, 0], [1, 2, 1, 2]];
      let bounded = true, fixed = true, continuous = true;
      for (const points of cases) {
        const [a, b, c, d] = points;
        for (let j = 0; j <= 100; j++) {
          const v = liveCurve(a, b, c, d, j / 100);
          bounded &&= v >= Math.min(b, c) - 1e-9 && v <= Math.max(b, c) + 1e-9;
          if (b === c) fixed &&= v === b;
        }
        continuous &&= Math.abs(liveCurve(a, b, c, d, 1, true) - liveCurve(b, c, d, d + 1, 0, true)) < 1e-9;
      }
      return { bounded, fixed, continuous };
    });
    check('Players cannot overshoot a stop or drift while stationary', curves.bounded && curves.fixed);
    check('Player velocity is continuous across adjacent recorded frames', curves.continuous);

    await page.locator('[data-a="titleNew"]').click();
    await page.locator('[data-a="startGame"]').click();
    const camera = await page.evaluate(() => {
      const setting = G.settings.cam; G.settings.cam = 'follow';
      const run = hz => {
        const L = { W: 390, H: 500, bottom: 0, ball: { x: 38, y: 60 }, cam: { x: 34, y: 52, s: 500 / 60 } };
        for (let i = 0; i < hz; i++) moveCam(L, 1000 / hz);
        return L.cam;
      };
      const a = run(30), b = run(60), c = run(120);
      G.settings.cam = setting;
      return Math.max(Math.abs(a.x - b.x), Math.abs(a.y - b.y), Math.abs(a.x - c.x), Math.abs(a.y - c.y));
    });
    check('Camera has the same one-second response at 30, 60 and 120 Hz', camera < 1e-8);

    await page.evaluate(() => { G.settings.speed = 4; G.settings.hl = 'full'; while (!userFixture()) advanceWeek(); go('prematch'); ACT.kickoff(); });
    await page.waitForFunction(() => LIVE.mq && LIVE.mq.fr.length > 0);
    const motion = await page.evaluate(async () => {
      const L = LIVE;
      L.paused = true;
      const fr = L.mq.fr, start = fr[0][0];
      const result = { zero: start === L.mq.t0, samples: fr.length, width: fr[0].length };
      // Draw a recorded position exactly; interpolation must not change match facts.
      setFrame(L, fr[2][0] - L.mq.t0);
      result.exact = L.dots.every((team, s) => team.every((d, i) => !d || Math.abs(d.x - fr[2][7 + (s * 11 + i) * 2]) < 1e-8 && Math.abs(d.y - fr[2][8 + (s * 11 + i) * 2]) < 1e-8));
      setFrame(L, 0.1); const a = L.dots[0].map(d => d && [d.x, d.y]);
      setFrame(L, 0.4); const b = L.dots[0].map(d => d && [d.x, d.y]);
      result.startsMoving = a.some((d, i) => d && b[i] && Math.hypot(d[0] - b[i][0], d[1] - b[i][1]) > 0.01);
      const stride = L.dots[0].map(d => d && d.stride);
      setFrame(L, 0.4);
      result.pause = L.dots[0].every((d, i) => !d || d.stride === stride[i]);
      // A regular minute boundary must keep previous samples for its incoming tangent.
      const q = L.mq, last = q.fr[q.fr.length - 1];
      q.p = 60; q.ev = []; q.main = null; endMinute(L); await liveStep(L);
      result.seam = L.mq.fr.some(f => f[0] === last[0]) && L.mq.fr.some(f => f[0] < L.mq.t0);
      L.paused = false;
      return result;
    });
    check('Playback includes second zero and all 120 half-second intervals', motion.zero && motion.samples >= 121 && motion.width === 73);
    check('Player centres agree exactly with recorded engine positions', motion.exact);
    check('Players move during the first half-second instead of freezing', motion.startsMoving);
    check('Repeated or paused frames do not advance running footfalls', motion.pause);
    check('Minute boundaries retain samples for continuous incoming motion', motion.seam);
    await page.waitForTimeout(1000);
    check('Animated playback produces no browser errors', errors.length === 0);
    console.log(JSON.stringify({ passed: checks.length, checks }, null, 2));
  } finally {
    if (browser) await browser.close();
    server.close();
  }
})().catch(e => { console.error(e); process.exitCode = 1; });
