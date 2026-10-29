// Rulebook geometry/shape invariants plus the real mobile demo and match paths.
// Run: CHROMIUM_PATH=/path/to/chromium node tests/shape.cjs
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('node:path');
const root = path.resolve(__dirname, '..');
const server = require('node:http').createServer((req, res) => {
  const file = path.resolve(root, '.' + new URL(req.url, 'http://localhost').pathname.replace(/\/$/, '/index.html'));
  if (!file.startsWith(root + path.sep)) return res.writeHead(403).end();
  try { res.setHeader('Content-Type', ({ '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css', '.webp': 'image/webp' })[path.extname(file)] || 'application/octet-stream'); res.end(fs.readFileSync(file)); }
  catch { res.writeHead(404).end(); }
});
(async () => {
  await new Promise(r => server.listen(0, '127.0.0.1', r));
  const browser = await chromium.launch({ headless: true, ...(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH, args: ['--no-sandbox', '--disable-dev-shm-usage'] } : {}) });
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const errors = [], checks = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.route('https://fonts.googleapis.com/**', r => r.abort());
  const check = (n, v) => { assert.ok(v, n); checks.push(n); };
  try {
    await page.goto('http://127.0.0.1:' + server.address().port);
    await page.locator('[data-a="titleNew"]').click(); await page.locator('[data-a="startGame"]').click();
    const r = await page.evaluate(() => {
      const near = (a, b) => Math.abs(a - b) < .00001;
      const lanes = [0, 13.8, 24.8, 43.2, 54.2, 68].map(x => pitchZone(x / 68, .5).lane);
      const zones = [pitchZone(.5, 20 / 105).zone14, !pitchZone(.1, 20 / 105).zone14, pitchZone(19 / 68, 10 / 105).cutback, !pitchZone(.5, 10 / 105).cutback, pitchZone(.5, 11 / 105).penaltySpot, pitchZone(.5, 4 / 105).sixYard, !pitchZone(2 / 68, 4 / 105).box, pitchZone(.5, .3, { back: .2, mid: .4 }).betweenLines, !pitchZone(.5, .3).betweenLines];
      const T = demoTactic('bal');
      const phases = [.8, .5, .25, .1].map(y => teamPhase(T, true, .5, y));
      const phaseDef = [teamPhase({ press: 2 }, false, .5, .2), teamPhase(T, false, .5, .5), teamPhase(T, false, .5, .8)];
      const L = blockPlan(T, .1, .55), R = blockPlan(T, .9, .55);
      const shift = L.positions.every((q, i) => !q || R.positions[i][0] > q[0]);
      const map = T.map, f = FORMATIONS[T.oop];
      const back = L.positions.filter((q, i) => q && i > 0 && LINE[f[map[i]][0]] === 1);
      const flat = back.every(q => near(q[1], back[0][1]));
      const depth = shapeMetrics(L, .1, .55).depth;
      const oop = { ...T, oop: '5-4-1', map: shapeMap(T.ip, '5-4-1') };
      const oopPlan = blockPlan(oop, .5, .55);
      const backCount = oopPlan.positions.filter((q, i) => q && i > 0 && near(q[1], Math.max(...oopPlan.positions.slice(1).map(q => q[1])))).length;
      const attack = attackPlan(T, .85, .3), cover = [...attack.rest.back, ...attack.rest.screen];
      const covered = cover.length === 5 && cover.every(i => attack.positions[i][1] > .3);
      const excluded = !Object.values(restSlots(T, .85, 2)).flat().includes(2);
      const short = { ...T, on: T.on.map((id, i) => [2, 6].includes(i) ? null : id) }, sp = teamPlan(short, true, .85, .3);
      const missing = sp.positions[2] === null && sp.positions[6] === null && !Object.values(sp.rest).flat().some(i => [2, 6].includes(i));
      const roleT = demoTactic('gegen');
      const i = FORMATIONS[roleT.ip].findIndex(q => q[0] === 'DL');
      roleT.roles[i] = 1; const wide = attackPlan(roleT, .2, .4).positions[i][0];
      roleT.roles[i] = 2; const invert = attackPlan(roleT, .2, .4).positions[i][0];
      const roles = invert > wide + .1;
      const lateral = attack.positions[7][0] < 13.8 / 68 && attack.positions[9][0] >= 54.2 / 68;
      const narrow = demoTactic('tiki');
      narrow.roles[8] = narrow.roles[10] = 1;
      const roleGaps = attackPlan(narrow, .5, .25).positions.slice(1).every(q => q && pitchZone(...q).lane !== 0 && pitchZone(...q).lane !== 4);
      const pushed = attack.rest.back.every(i => attack.positions[i][1] < .65);
      const copy = JSON.stringify(T); teamPlan(T, true, .2, .3); teamPlan(T, false, .9, .6);
      let finite = true;
      for (const ip of Object.keys(FORMATIONS)) for (const oop of Object.keys(FORMATIONS)) {
        const t = { ...T, ip, oop, map: shapeMap(ip, oop), roles: Array(11).fill(0) };
        for (const [x, y] of [[0, 0], [1, 1], [.2, .5], [.8, .3]]) for (const has of [true, false]) {
          const plan = teamPlan(t, has, x, y);
          finite &&= plan.positions.length === 11 && plan.positions.every(q => !q || q.every(v => Number.isFinite(v) && v >= 0 && v <= 1));
        }
      }
      return { lanes, zones, phases, phaseDef, shift, flat, depth, backCount, covered, excluded, missing, roles, lateral, roleGaps, pushed, immutable: copy === JSON.stringify(T), finite };
    });
    check('Five lanes include exact boundaries and both touchlines', JSON.stringify(r.lanes) === '[0,1,2,3,4,4]');
    check('Named and contextual zones have correct geometry', r.zones.every(Boolean));
    check('With-ball phases follow thirds and box', JSON.stringify(r.phases) === '["build","progress","create","finish"]');
    check('Without-ball phases distinguish high, mid and low blocks', JSON.stringify(r.phaseDef) === '["high","mid","low"]');
    check('Whole block shifts towards either flank', r.shift);
    check('The back line holds one depth', r.flat);
    check('Mid block target stays 30–35 metres deep', r.depth >= 30 && r.depth <= 35);
    check('OOP formation decides defensive line membership', r.backCount === 5);
    check('Normal attack keeps five assigned outfield players behind ball', r.covered);
    check('The carrier cannot count as his own cover', r.excluded);
    check('Missing players are neither respawned nor assigned cover', r.missing);
    check('Inverting a full-back changes lateral shape by role', r.roles);
    check('Selected wingers supply both wide lanes', r.lateral);
    check('Inverting all wide roles preserves the manager-created gaps', r.roleGaps);
    check('Rest defence advances with the attack instead of staying in own third', r.pushed);
    check('Planning does not mutate tactic or squad', r.immutable);
    check('All 64 formation pairings remain finite on both flanks and goals', r.finite);

    const toAdmin = async () => { await page.evaluate(async () => { saveGame(); await SaveStorage.flush(); }); await page.goto('http://127.0.0.1:' + server.address().port + '/admin/'); await page.waitForFunction(() => window.ADMIN_PAGE && typeof G !== 'undefined' && G && UI.s === 'admin'); };
    await toAdmin();
    const before = await page.evaluate(() => { window.shapeBefore = JSON.stringify({ tactics: G.tactics, fixtures: G.fixtures, players: G.players, ai: G.ai }); return true; });
    await page.evaluate(() => { UI.tab.adm = 'eng'; render(); });
    await page.locator('[data-a="go"][data-s="shapedemo"]').click();
    await page.waitForFunction(() => document.getElementById('shapeReadout')?.textContent.includes('Build-up'));
    await page.locator('[data-a="shapePlay"]').click();
    await page.locator('#shapeStyle').selectOption('gegen');
    await page.waitForFunction(() => SHAPE_DEMO.T.ip === '4-3-3');
    await page.locator('details.card > summary').click();
    await page.locator('#shapeRole1').selectOption('2');
    await page.waitForFunction(() => SHAPE_DEMO.T.roles[1] === 2);
    check('Role editor dispatches real changes in the demo', await page.evaluate(() => roleName(SHAPE_DEMO.T, 1) === 'Inverted Full-Back'));
    await page.locator('details.card > summary').click();
    await page.evaluate(() => { demoScene(SHAPE_DEMO, 4); SHAPE_DEMO.dots = [[], []]; });
    await page.waitForFunction(() => document.getElementById('shapeReadout').textContent.includes('Chance creation'));
    fs.mkdirSync(path.join(root, 'docs', 'shape-demo'), { recursive: true });
    await page.evaluate(() => { document.querySelector('.main').scrollTop = 0; });
    await page.screenshot({ path: path.join(root, 'docs/shape-demo/attack.png') });
    await page.locator('[data-a="shapeUnit"]').click();
    await page.locator('[data-a="shapeTrigger"]').click();
    check('Defending overlay uses distinct real-engine unit assignments', await page.evaluate(() => { const u=demoDefendingUnit(SHAPE_DEMO); return u.assignments.length>=2 && u.assignments.filter(a=>a.job==='press').length===1 && new Set(u.assignments.map(a=>a.i)).size===u.assignments.length; }));
    await page.screenshot({ path: path.join(root, 'docs/shape-demo/defending-unit.png') });
    await page.locator('[data-a="shapeUnit"]').click();
    check('Defending rehearsal toggles leave the tactic and possession unchanged', await page.evaluate(() => !SHAPE_DEMO.showUnit && SHAPE_DEMO.unitTrigger && SHAPE_DEMO.has));
    await page.locator('[data-a="shapePoss"]').click();
    await page.waitForFunction(() => !SHAPE_DEMO.has);
    await page.locator('[data-a="shapeMirror"]').click();
    check('Possession and mirrored viewpoint controls work', await page.evaluate(() => !SHAPE_DEMO.has && SHAPE_DEMO.mirror));
    await page.locator('#shapeStyle').selectOption('low');
    await page.waitForFunction(() => SHAPE_DEMO.T.oop === '5-4-1');
    await page.evaluate(() => { demoScene(SHAPE_DEMO, 10); SHAPE_DEMO.dots = [[], []]; SHAPE_DEMO.mirror = false; render(); });
    await page.waitForFunction(() => document.getElementById('shapeReadout').textContent.includes('Low block'));
    await page.evaluate(() => { document.querySelector('.main').scrollTop = 0; });
    await page.screenshot({ path: path.join(root, 'docs/shape-demo/low-block.png') });
    check('Demo fits phone width', await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    check('Demo does not change career data or call AI', before && await page.evaluate(() => shapeBefore === JSON.stringify({ tactics: G.tactics, fixtures: G.fixtures, players: G.players, ai: G.ai })));
    await page.locator('[data-a="shapeStep"][data-n="1"]').click();
    check('Step control pauses the route', await page.evaluate(() => !SHAPE_DEMO.playing && SHAPE_DEMO.step === 11));
    await page.locator('[data-a="shapePlay"]').click();
    await page.evaluate(() => go('home')); await page.waitForTimeout(150);
    const stopped = await page.evaluate(() => SHAPE_DEMO.last);
    await page.waitForTimeout(100);
    check('Animation stops when leaving demo', await page.evaluate(t => SHAPE_DEMO.last === t, stopped));
    const sim = await page.evaluate(() => {
      const ids = plClubs().slice(0, 2), M = createMatch({ id: -1, h: ids[0], a: ids[1] });
      simInit(M); const S = M.sides[0];
      M.sim.rs = null; M.sim.B.os = 0; M.sim.B.oi = 2; M.sim.B.x = 55; M.sim.B.y = 30;
      shapeOf(M, 0, true, 55 / 68, 30 / 105); const noCarrier = !Object.values(S._teamPlan.rest).flat().includes(2);
      S._shape = {}; shapeOf(M, 0, true, .8, .3); const cache = S._shape instanceof Map;
      targets(M, true);
      const cover = Object.values(S._teamPlan.rest).flat();
      const holds = cover.every(i => M.sim.P[0][i].ty >= 30);
      let frames = true; M.live = true; const t = performance.now();
      for (let n = 0; n < 5; n++) { stepMatch(M, false); frames &&= M.frames.length > 100 && M.frames.every(f => f.every((v, i) => i === 6 || v == null || Number.isFinite(v))); }
      const ms = performance.now() - t, totals = { matches: 0, goals: 0, shots: 0, passes: 0, complete: 0 };
      const clubs = plClubs();
      for (let n = 0; n < 8; n++) {
        const full = createMatch({ id: -10 - n, h: clubs[n * 2], a: clubs[n * 2 + 1] });
        full.instant = true;
        while (!full.ended) stepMatch(full, true);
        totals.matches++;
        for (const side of full.sides) { totals.goals += side.st.g; totals.shots += side.st.sh; totals.passes += side.st.pa; totals.complete += side.st.pc; }
      }
      return { noCarrier, cache, holds, frames, ms, smoke: totals };
    });
    check('Real match planner excludes carrier and rebuilds saved caches', sim.noCarrier && sim.cache);
    check('Individual movement cannot pull reserved cover ahead of ball', sim.holds);
    check('Real match produces finite 2D frames across five minutes', sim.frames);
    check('Eight full matches finish with valid scores and shots', sim.smoke.matches === 8 && Number.isFinite(sim.smoke.goals) && sim.smoke.shots > 0);
    check('Browser runtime has no errors', errors.length === 0);
    console.log(JSON.stringify({ passed: checks.length, checks, fiveMinutesMs: sim.ms, smoke: sim.smoke, errors }, null, 2));
  } finally { await browser.close(); await new Promise(r => server.close(r)); }
})().catch(e => { console.error(e); server.close(); process.exitCode = 1; });
