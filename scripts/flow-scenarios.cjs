// node scripts/flow-scenarios.cjs [--seeds 3] [--out docs/engine-qa/flow-baseline.json]
// Gegenpressing v long ball, one/two strikers each side, sides swapped, several seeds.
// Real engine, seeded, fixed tactics. Prints per-scenario passage traces and an aggregate.
const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm');
const { createMatchQaRuntime } = require('./match-qa-runtime.cjs');
const arg = (k, d) => { const i = process.argv.indexOf(k); return i < 0 ? d : process.argv[i + 1]; };
const seeds = Number(arg('--seeds', 3)), base = 20261021, rows = [];
const scen = [];
for (const pSt of [1, 2]) for (const dSt of [1, 2]) for (const swap of [false, true]) scen.push({ name: `press ${pSt}ST v direct ${dSt}ST${swap ? ' (swapped)' : ''}`, pSt, dSt, swap });
const t0 = Date.now();
for (let k = 0; k < seeds; k++) {
  const rt = createMatchQaRuntime(base + k);
  vm.runInContext(fs.readFileSync(path.join(__dirname, 'flow-scan.js'), 'utf8'), rt.ctx, { filename: 'flow-scan.js' });
  if (arg('--eng', null)) rt.run('Object.assign(ENG,' + arg('--eng') + ')');
  rt.ctx.FLOW_LIST = scen.map((c, n) => ({ ...c, n, seed: base + k, pair: k }));
  rows.push(...rt.run('flowRun(FLOW_LIST)'));
}
const avg = (f) => { const v = rows.map(f).filter(x => x != null && Number.isFinite(x)); return v.length ? +(v.reduce((a, b) => a + b, 0) / v.length).toFixed(1) : null; };
const sum = f => rows.reduce((t, r) => t + (f(r) || 0), 0);
const pb = sum(r => r.pressedBuildUps);
const agg = {
  passesPerTeam: Math.round(rows.reduce((t, r) => t + r.passesBoth, 0) / rows.length / 2),
  matches: rows.length, seeds, secs: Math.round((Date.now() - t0) / 1000),
  goals: avg(r => r.score.split(' ')[0].split('-').reduce((a, b) => +a + +b, 0)), possPress: avg(r => r.possPress),
  pressedBuildUpsPerMatch: avg(r => r.pressedBuildUps),
  pressedOutcomePct: Object.fromEntries(['lostOwnThird', 'shortEscape', 'longRelease', 'reachedFinalThird', 'shot'].map(k => [k, Math.round(100 * sum(r => r.pressedOutcome[k]) / Math.max(1, pb))])),
  isolatedPressPct: avg(r => r.isolatedPressPct), coveredPressPct: avg(r => r.coveredPressPct),
  longBallsPerMatch: avg(r => r.longBalls), longUnderPressurePct: Math.round(100 * sum(r => r.longUnderPressure) / Math.max(1, sum(r => r.longBalls))),
  secondBallWonPct: avg(r => r.secondBallWonPct), supportAtLanding: avg(r => r.supportAtLanding), oppAtLanding: avg(r => r.oppAtLanding),
  freeReceiverFinalThirdPct: { direct: avg(r => r.freeReceiverFinalThirdPct.direct), press: avg(r => r.freeReceiverFinalThirdPct.press) },
  counterpressRegainPct: avg(r => r.counterpress.regainPct), counterpressPerMatch: avg(r => r.counterpress.starts), cpBypassedPerMatch: avg(r => r.counterpress.bypassed), cpIsolatedStartPerMatch: avg(r => r.counterpress.isolatedStart),
  recoverySecs: avg(r => r.recoverySecs), slowRecoveriesPerMatch: avg(r => r.slowRecoveries), blockOver40mPct: avg(r => r.blockOver40mPct),
  byStrikers: Object.fromEntries(['1-1', '1-2', '2-1', '2-2'].map(k => { const [p, d] = k.split('-'); const R = rows.filter(r => r.scenario.startsWith(`press ${p}ST v direct ${d}ST`));
    return [`press ${p}ST v direct ${d}ST`, { secondBallWonPct: +(R.reduce((t, r) => t + (r.secondBallWonPct || 0), 0) / R.length).toFixed(0), isolatedPressPct: +(R.reduce((t, r) => t + r.isolatedPressPct, 0) / R.length).toFixed(0), longBalls: +(R.reduce((t, r) => t + r.longBalls, 0) / R.length).toFixed(0), possPress: +(R.reduce((t, r) => t + r.possPress, 0) / R.length).toFixed(0) }]; })),
};
const report = { schema: 1, generated: new Date().toISOString(), aggregate: agg, rows };
const out = arg('--out', null);
if (out) fs.writeFileSync(out, JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify(agg, null, 2));
