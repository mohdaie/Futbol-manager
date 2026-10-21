// node scripts/match-analysis.cjs [--home gegen] [--away tiki] [--seed 20261021] [--minutes 45] [--out docs/analysis/run]
// Records one real simulated half the way a match analyst works: every possession chain (who passed to whom,
// from which zone), restarts and shots, plus frames (positions every 0.5 s) for average-position maps and
// freeze-frames (rendered with scripts/analysis-render.cjs). Developer tool; never loaded by the game.
const fs = require('node:fs'), path = require('node:path');
const { createMatchQaRuntime } = require('./match-qa-runtime.cjs');
const arg = (k, d) => { const i = process.argv.indexOf(k); return i < 0 ? d : process.argv[i + 1]; };
const home = arg('--home', 'gegen'), away = arg('--away', 'tiki'), seed = Number(arg('--seed', 20261021)), mins = Number(arg('--minutes', 45));
const out = arg('--out', 'docs/analysis/run');
const rt = createMatchQaRuntime(seed);
rt.ctx.CFG = { home, away, mins };
const res = rt.run(`(() => {
  newGame(CLUBS[0].id, 'Analysis', 1); G.flags.fixedTac = true; G.club = 'QA-unmanaged';
  const cl = plClubs(), h = cl[0], a = cl[1];
  applyStyle(G.clubs[h].tac, CFG.home); applyStyle(G.clubs[a].tac, CFG.away);
  const M = createMatch({ id: -5000, h, a }); M.live = true;
  const log = [], frames = [];
  const pos = (s, i) => FORMATIONS[M.sides[s].ip][i][0];
  const zone = (s, x, y) => { const z = pitchZone(...toOwn(s, x, y)); return z.third + '/' + ['L wing', 'L half', 'centre', 'R half', 'R wing'][z.lane]; };
  const oK = kick; kick = function (M2, s, i, k, tx, ty, j, o = {}) { const p = P_(M2, s, i); log.push({ t: +M2.sim.t.toFixed(1), min: M2.min, e: 'kick', k, side: s, from: pos(s, i), to: j >= 0 ? pos(s, j) : null, z0: zone(s, p.x, p.y), z1: zone(s, tx, ty), len: Math.round(Math.hypot(tx - p.x, ty - p.y)) }); return oK.apply(this, arguments); };
  const oG = giveBall; giveBall = function (M2, s, i) { const r = oG.apply(this, arguments); const p = P_(M2, s, i); if (p) log.push({ t: +M2.sim.t.toFixed(1), min: M2.min, e: 'has', side: s, who: pos(s, i), z: zone(s, p.x, p.y) }); return r; };
  const oS = shoot; shoot = function (M2, s) { const r = oS.apply(this, arguments); const fl = M2.sim.B.fl; if (fl && fl.k === 'shot') log.push({ t: +M2.sim.t.toFixed(1), min: M2.min, e: 'chance', side: s, xg: +(fl.xg || 0).toFixed(2), res: fl.res || '' }); return r; };
  const oR = setRestart; setRestart = function (M2, k, s, X, Y) { log.push({ t: +M2.sim.t.toFixed(1), min: M2.min, e: 'restart', k, side: s }); return oR.apply(this, arguments); };
  const g0 = [0, 0];
  while (M.min < CFG.mins) { simMinute(M); if (M.frames) frames.push(...M.frames.map(f => [M.min, ...f]));
    M.sides.forEach((S, s) => { while (S.st.g > g0[s]) { g0[s]++; const sh = log.filter(e => e.e === 'kick' && e.k === 'shot' && e.side === s).pop(); log.push({ t: sh ? sh.t : +M.sim.t.toFixed(1), min: M.min, e: 'goal', side: s }); } }); }
  return { home: CFG.home, away: CFG.away, ip: M.sides.map(S => S.ip), oop: M.sides.map(S => S.oop), roles: M.sides.map((S, s) => S.on.map((id, i) => id ? pos(s, i) + ':' + roleName(S, i) : null)), score: M.sides.map(S => S.st.g), stats: M.sides.map(S => ({ sh: S.st.sh, sot: S.st.sot, pa: S.st.pa, pc: S.st.pc, poss: Math.round(S.st.pos), co: S.st.co, fo: S.st.fo })), log, frames };
})()`);
fs.mkdirSync(out, { recursive: true });
fs.writeFileSync(path.join(out, 'match.json'), JSON.stringify(res));
// Possession chains: from one side gaining the ball to losing it.
const chains = []; let cur = null;
for (const e of res.log) {
  if (e.e === 'has') { if (!cur || cur.side !== e.side) { if (cur) chains.push(cur); cur = { side: e.side, t: e.t, min: e.min, start: e.z, steps: [e.who + '@' + e.z], passes: 0, end: null }; } else cur.steps.push(e.who + '@' + e.z); }
  else if (e.e === 'kick' && cur && e.side === cur.side) { cur.steps.push(`--${e.k}${e.len}m->`); if (['pass', 'long', 'thru', 'cross'].includes(e.k)) cur.passes++; if (e.k === 'shot') cur.end = 'shot'; }
  else if (e.e === 'restart' && cur) { cur.end = cur.end || 'restart ' + e.k; }
  else if (e.e === 'goal' && cur && e.side === cur.side) cur.end = 'GOAL';
}
if (cur) chains.push(cur);
fs.writeFileSync(path.join(out, 'chains.txt'), chains.map(c => `${c.min}' ${['HOME', 'AWAY'][c.side]} from ${c.start} (${c.passes} passes)${c.end ? ' -> ' + c.end : ''}\n   ${c.steps.join(' ')}`).join('\n'));
const S = s => chains.filter(c => c.side === s), pl = a => a.reduce((t, c) => t + c.passes, 0) / Math.max(1, a.length);
console.log(JSON.stringify({ score: res.score, stats: res.stats, ip: res.ip, oop: res.oop, frames: res.frames.length, chains: chains.length, passesPerPossession: [pl(S(0)).toFixed(1), pl(S(1)).toFixed(1)], out }, null, 1));
