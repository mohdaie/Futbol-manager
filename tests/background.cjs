// Worker determinism, match bookkeeping, cancellation, fallback and batch timing.
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
    browser = await chromium.launch({ headless: true, ...(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH, args: ['--no-sandbox', '--disable-dev-shm-usage'] } : {}) });
    const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
    page.on('pageerror', e => errors.push(e.message)); await page.route('https://fonts.googleapis.com/**', r => r.abort());
    await page.goto(process.argv[2] || 'http://127.0.0.1:' + server.address().port);
    await page.locator('[data-a="titleNew"]').click(); await page.locator('[data-a="startGame"]').click();
    const parity = await page.evaluate(async () => {
      const fx = G.fixtures.find(f => !isUserFx(f)), M = createMatch(fx), input = Simulation.input(M);
      const local = structuredClone(input.match);
      matchRandom(local, () => simMinute(local));
      const remote = (await Simulation.request('minute', input)).match;
      const minute = JSON.stringify(local.frames) === JSON.stringify(remote.frames) && local.rng === remote.rng;
      const fastLocal = structuredClone(input.match); runFastMatch(fastLocal);
      const fastRemote = (await Simulation.request('fast', input)).match;
      return { minute, fast: JSON.stringify(fastLocal.sides) === JSON.stringify(fastRemote.sides) && fastLocal.rng === fastRemote.rng };
    });
    check('Detailed minutes have identical frames and random state in the worker', parity.minute);
    check('Fast match results are deterministic across worker and compatibility paths', parity.fast);
    const effects = await page.evaluate(async () => {
      const fx = G.fixtures.find(f => !isUserFx(f));
      const [a, b] = await Promise.all([simulateMatchAsync(fx), simulateMatchAsync(fx)]);
      const before = JSON.stringify({ clubs: [G.clubs[fx.h].bal, G.clubs[fx.a].bal], players: G.players, fx });
      finishMatch(a); await simulateMatchAsync(fx);
      return { one: a === b && before === JSON.stringify({ clubs: [G.clubs[fx.h].bal, G.clubs[fx.a].bal], players: G.players, fx }), coherent: a.sides.every(S => S.st.g === S.goals.length && S.st.g <= S.st.sot && S.st.sot <= S.st.sh && S.st.pc <= S.st.pa && Object.values(S.ps).reduce((n, x) => n + (x.sh || 0), 0) === S.st.sh && Object.values(S.ps).reduce((n, x) => n + (x.pa || 0), 0) === S.st.pa && Object.values(S.cond).every(c => c >= 15 && c <= 100)), model: a.model };
    });
    check('Concurrent/repeated requests settle goals, player stats and money once', effects.one);
    check('Event matches retain coherent team/player statistics and condition', effects.coherent && effects.model === 'events-v1');
    const mechanisms = await page.evaluate(async () => {
      const fx = G.fixtures.find(f => !played(f) && !isUserFx(f)), original = Simulation.input(createMatch(fx)), totals = { base: 0, stronger: 0, tired: 0 };
      for (let n = 0; n < 64; n++) for (const variant of Object.keys(totals)) {
        const input = structuredClone(original); input.match.rng = (n * 2654435761 + 42) >>> 0;
        const S = input.match.sides[0];
        if (variant === 'stronger') for (const id of [...S.on, ...S.bench].filter(Boolean)) { const p = input.world.players[id]; p.at = p.at.map(v => Math.min(20, v + 6)); }
        if (variant === 'tired') for (const id of S.on.filter(Boolean)) S.cond[id] = 25;
        const { match } = await Simulation.request('fast', input); totals[variant] += match.sides[0].st.xg;
      }
      return totals;
    });
    check('Stronger players improve chance creation in paired event matches', mechanisms.stronger > mechanisms.base);
    check('Starting exhausted reduces chance creation in paired event matches', mechanisms.tired < mechanisms.base);
    check('Late results cannot change a replacement career', await page.evaluate(async () => {
      const old = G, fx = G.fixtures.find(f => !played(f) && !isUserFx(f)), job = simulateMatchAsync(fx);
      G = structuredClone(G); await job;
      const untouched = !played(fx) && !played(G.fixtures.find(f => f.id === fx.id)); G = old; return untouched;
    }));
    check('Compatibility mode still completes event matches without a worker', await page.evaluate(async () => {
      const worker = Simulation.worker; Simulation.worker = null;
      try { const fx = G.fixtures.find(f => !played(f) && !isUserFx(f)); const M = await simulateMatchAsync(fx); return played(fx) && M.fast; }
      finally { Simulation.worker = worker; }
    }));
    const responsiveness = await page.evaluate(async () => {
      let frames = 0, running = true;
      const tick = () => { frames++; if (running) requestAnimationFrame(tick); }; requestAnimationFrame(tick);
      const fx = G.fixtures.find(f => isUserFx(f)), M = createMatch(fx); M.instant = true;
      const remote = await Simulation.request('full', Simulation.input(M)); running = false;
      return { frames, ended: remote.match.ended, fast: !!remote.match.fast };
    });
    check('The interface keeps rendering during a detailed instant match', responsiveness.frames >= 5 && responsiveness.ended && !responsiveness.fast);
    const batch = await page.evaluate(async () => {
      const fixtures = G.fixtures.filter(f => !played(f) && !isUserFx(f)).slice(0, 32), start = performance.now();
      await simulateFixtures(fixtures);
      return { ms: performance.now() - start, played: fixtures.filter(played).length };
    });
    check('A 32-match background batch completes without the old full-engine workload', batch.played === 32 && batch.ms < 10000);
    await page.evaluate(() => { while (!userFixture()) advanceWeek(); go('prematch'); ACT.kickoff(); });
    await page.waitForFunction(() => LIVE.mq && !LIVE.simBusy);
    check('A tactics edit during minute generation discards the stale result', await page.evaluate(async () => {
      const L = LIVE; L.paused = true; L.mq = null; const minute = L.M.min;
      const job = liveStep(L); L.M.sides[L.bottom].ment = 4; L.M.dirty = true; await job;
      const discarded = L.M.min === minute && !L.mq;
      await liveStep(L);
      return discarded && L.M.min === minute + 1 && L.M.sides[L.bottom].ment === 4;
    }));
    check('No browser errors', errors.length === 0);
    console.log(JSON.stringify({ passed: checks.length, checks, batch, responsiveness, mechanisms }, null, 2));
  } finally { if (browser) await browser.close(); server.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
