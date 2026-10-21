'use strict';
// Match-flow scenario instrumentation (developer only; loaded by scripts/flow-scenarios.cjs, never by the game).
// Traces passages between a pressing side (P) and a direct side (D) in real seeded matches.
const FL_TICK = tickSim, FL_KICK = kick, FL_RECEIVE = receive;
const FLOW_THIRD = (s, y) => { const o = toOwn(s, PW / 2, y)[1]; return o > 2 / 3 ? 'def' : o > 1 / 3 ? 'mid' : 'fin'; };

function flowNew(pside) {
  return { p: pside, poss: null, passages: [], press: 0, isolated: 0, covered: 0, highPress: 0, longs: [], recv: { fin: 0, free: 0 }, recvP: { fin: 0, free: 0 },
    cp: { starts: 0, regain: 0, broken: 0, bypassed: 0, expired: 0, isolatedStart: 0 }, recoveries: [], deep: { frames: 0, gap: 0 }, events: [] };
}
// Possession segments of the direct side starting in its own defensive third (build-up under the press).
function flowPossStart(M, F, s) {
  const B = M.sim.B, own = owner(M);
  F.poss = { s, t: M.sim.t, min: M.min, third: own ? FLOW_THIRD(s, own.y) : FLOW_THIRD(s, B.y), pressed: 0, isolated: 0, long: false, escape: false, reachedFin: false, shot: false, maxFwd: 0, y0: B.y, end: null };
}
function flowPossEnd(M, F, why) {
  const q = F.poss; if (!q) return;
  q.end = why; q.dur = +(M.sim.t - q.t).toFixed(1);
  if (q.s === 1 - F.p) F.passages.push(q);
  F.poss = null;
}
tickSim = function(M) {
  const F = M.flow, sim = M.sim;
  const before = { poss: sim.poss, sh: M.sides.map(S => S.st.sh), g: M.sides.map(S => S.st.g), cp: sim.counterpress };
  FL_TICK(M);
  if (!F) return;
  const B = sim.B, own = owner(M), D = 1 - F.p;
  // Possession changes and outcomes.
  if (sim.poss !== before.poss) { if (F.poss) flowPossEnd(M, F, sim.rs ? 'restart' : 'lost'); flowPossStart(M, F, sim.poss); }
  const q = F.poss;
  if (q && q.s === D) {
    if (M.sides[D].st.sh > before.sh[D]) { q.shot = true; }
    if (own && B.os === D && FLOW_THIRD(D, own.y) === 'fin') q.reachedFin = true;
    q.maxFwd = Math.max(q.maxFwd, (B.y - q.y0) * fwdY(D));
  }
  // The pressing side's defensive unit while the direct side has the ball.
  const d = sim.defence;
  if (own && B.os === D && d && d.assignments && d.assignments.length) {
    const pr = d.assignments.find(a => a.job === 'press');
    if (pr) {
      F.press++; if (q) q.pressed++;
      if (FLOW_THIRD(D, own.y) === 'def') F.highPress++;
      const P = sim.P[F.p][pr.i], mates = sim.P[F.p].filter((z, j) => z && j && j !== pr.i && hyp(z.x - P.x, z.y - P.y) < 10).length;
      const cover = d.assignments.some(a => a.job === 'cover');
      if (!cover && !mates) { F.isolated++; if (q) q.isolated++; if (F.events.length < 400 && F.isolated % 25 === 1) F.events.push({ k: 'isolated-presser', min: M.min, t: +sim.t.toFixed(1), x: +P.x.toFixed(1), y: +P.y.toFixed(1) }); }
      else if (cover) F.covered++;
    }
  }
  // Block depth and line gap of the pressing side when out of possession in the middle third.
  if (own && B.os === D && FLOW_THIRD(D, own.y) === 'mid') {
    const ys = sim.P[F.p].filter((z, j) => z && j).map(z => toOwn(F.p, z.x, z.y)[1] * PL).sort((a, b) => a - b);
    F.deep.frames++;
    if (ys[ys.length - 1] - ys[0] > 40) F.deep.gap++;
  }
  // Counter-press lifecycle of the pressing side.
  const c = sim.counterpress;
  if (c && c.s === F.p && c !== before.cp) { F.cp.starts++; if (c.broken && c.reason === 'isolated') { F.cp.isolatedStart++; if (F.events.length < 400 && F.cp.isolatedStart % 10 === 1) F.events.push({ k: 'counterpress-isolated', min: M.min, t: +sim.t.toFixed(1) }); } c.flowSeen = true; }
  if (c && c.s === F.p && c.broken && !c.flowEnd) {
    c.flowEnd = true; F.cp.broken++; if (c.reason === 'bypassed') F.cp.bypassed++; if (c.reason === 'expired') F.cp.expired++;
    F.recoveries.push({ t0: sim.t, done: null, c });
  }
  // Regain: the pressing side wins the ball while its counter-press is still live.
  const pc = before.cp;
  if (pc && pc.s === F.p && !pc.broken && !pc.flowRegain && sim.poss === F.p && before.poss !== F.p) { pc.flowRegain = true; F.cp.regain++; if (F.events.length < 400 && F.cp.regain % 6 === 1) F.events.push({ k: 'counterpress-regain', min: M.min, t: +sim.t.toFixed(1) }); F.cp.regainSecs = (F.cp.regainSecs || 0) + (sim.t - pc.t); }
  // Recovery after a failed press: time until 7+ outfield players are goal-side of the ball.
  for (const r of F.recoveries) if (r.done == null) {
    const gs = sim.P[F.p].filter((z, j) => z && j && (z.y - B.y) * fwdY(F.p) < 0).length;
    if (gs >= 7 || sim.poss === F.p) r.done = +(sim.t - r.t0).toFixed(1); else if (sim.t - r.t0 > 15) r.done = 15;
  }
  // Long balls of the direct side: landing, first contact, second ball within 5 s.
  for (const L of F.longs) if (!L.done) {
    if (!L.landed && (!B.fl || B.fl !== L.fl || B.fl.landed)) {
      L.landed = true; L.tl = sim.t;
      const lx = B.x, ly = B.y;
      L.support = sim.P[D].filter((z, j) => z && j && hyp(z.x - lx, z.y - ly) < 15).length;
      L.opp = sim.P[F.p].filter((z, j) => z && j && hyp(z.x - lx, z.y - ly) < 15).length;
    }
    if (L.landed && B.os >= 0) { L.done = true; L.won = B.os === D; L.secs = +(sim.t - L.tl).toFixed(1); }
    else if (L.landed && (sim.t - L.tl > 5 || sim.rs)) { L.done = true; L.won = sim.rs ? sim.rs.s === D : null; L.secs = 5; L.dead = !!sim.rs; }
  }
};
kick = function(M, s, i, k, tx, ty, j, o = {}) {
  const F = M.flow, r = FL_KICK(M, s, i, k, tx, ty, j, o);
  if (F && s === 1 - F.p && (k === 'long' || k === 'clear') && M.sim.B.fl) {
    const p = P_(M, s, i);
    F.kinds = F.kinds || {}; const kk = (M.sim.rs ? M.sim.rs.k + ':' : '') + k; F.kinds[kk] = (F.kinds[kk] || 0) + 1;
    F.longs.push({ min: M.min, t: +M.sim.t.toFixed(1), k, rs: M.sim.rs ? M.sim.rs.k : null, from: FLOW_THIRD(s, p.y), len: Math.round(M.sim.B.fl.len), fl: M.sim.B.fl, landed: false, done: false,
      pressed: pressureOn(M, s, i)[0] > 0.5, toTarget: j >= 0 });
    if (F.poss && F.poss.s === s) F.poss.long = true;
    if (pressureOn(M, s, i)[0] > 0.5 && F.events.length < 400 && F.longs.length % 15 === 1) F.events.push({ k: 'pressed-long-' + k, min: M.min, t: +M.sim.t.toFixed(1) });
  }
  return r;
};
receive = function(M, s, j, fl, d) {
  const F = M.flow, before = M.sides[s].st.pc, r = FL_RECEIVE(M, s, j, fl, d);
  if (F && M.sides[s].st.pc > before) {
    const p = P_(M, s, j);
    if (p && FLOW_THIRD(s, p.y) === 'fin') {
      const near = M.sim.P[1 - s].filter((z, n) => z && n && hyp(z.x - p.x, z.y - p.y) < 4).length, R = s === F.p ? F.recvP : F.recv;
      R.fin++; if (!near) R.free++;
      if (!near && dGoal(s, p.x, p.y) < 25 && F.events.length < 400) F.events.push({ k: s === F.p ? 'free-receiver-P' : 'free-receiver-D', min: M.min, t: +M.sim.t.toFixed(1), x: +p.x.toFixed(1), y: +p.y.toFixed(1) });
    }
    // Short escape: a completed ground pass out of the press past two or more pressers.
    if (F.poss && F.poss.s === s && s === 1 - F.p && fl && fl.k === 'pass' && fl.i != null) {
      const a = P_(M, s, fl.i), passed = M.sim.P[F.p].filter((z, n) => z && n && hyp(z.x - a.x, z.y - a.y) < 12 && (z.y - p.y) * fwdY(s) < 0).length;
      if (passed >= 2 && (p.y - a.y) * fwdY(s) > 8) F.poss.escape = true;
    }
  }
  return r;
};

// Build a side's tactic: style preset, then formation/roles for the strikers variant.
function flowTactic(T, style, strikers) {
  applyStyle(T, style);
  const shapes = { gegen: { 1: ['4-3-3', '4-1-4-1'], 2: ['4-4-2', '4-4-2'] }, long: { 1: ['4-1-4-1', '4-1-4-1'], 2: ['4-4-2', '4-4-2'] } }[style][strikers];
  T.ip = shapes[0]; T.oop = shapes[1];
  const want = style === 'gegen' ? { ST: 'Pressing Forward', MC: 'Box-to-Box', DM: 'Ball-Winner', AML: 'Inside Forward', AMR: 'Inside Forward', ML: 'Wide Midfielder', MR: 'Wide Midfielder', DL: 'Full-Back', DR: 'Full-Back' }
    : { ST: 'Target Forward', DC: 'Stopper', ML: 'Winger', MR: 'Winger', MC: 'Box-to-Box', DM: 'Anchor' };
  if (style === 'long' && strikers === 2) want.ST2 = 'Advanced Forward';
  let st = 0;
  T.roles = FORMATIONS[T.ip].map(([pos]) => { let n = want[pos]; if (pos === 'ST') { n = st++ && want.ST2 ? want.ST2 : want.ST; } const i = ROLES[pos].findIndex(r => r.n === n); return i < 0 ? 0 : i; });
}

// One scenario: P presses (gegen), D plays direct (long). swap: P is the away club.
function flowMatch(cfg) {
  G = JSON.parse(FLOW_BASE);
  const clubs = plClubs(), A = clubs[cfg.pair * 2 % clubs.length], Bc = clubs[(cfg.pair * 2 + 1) % clubs.length];
  const [h, a] = cfg.swap ? [Bc, A] : [A, Bc], pside = cfg.swap ? 1 : 0;
  G.club = 'QA-unmanaged';
  flowTactic(G.clubs[[h, a][pside]].tac, 'gegen', cfg.pSt);
  flowTactic(G.clubs[[h, a][1 - pside]].tac, 'long', cfg.dSt);
  const M = createMatch({ id: -900 - cfg.n, h, a });
  M.flow = flowNew(pside);
  if (cfg.live) M.live = true;
  const frames = [];
  let minutes = 0;
  while (!M.ended && minutes++ < 110) {
    simMinute(M); M.sides.forEach(S => injurySubs(M, S));
    if (cfg.live && M.frames) frames.push(...M.frames.map(f => [M.min, ...f]));
  }
  return { M, frames };
}

function flowSummary(M, cfg) {
  const F = M.flow, P = F.p, D = 1 - P, st = M.sides.map(S => S.st), pct = (a, b) => b ? Math.round(100 * a / b) : null;
  const ps = F.passages, build = ps.filter(q => q.third === 'def'), pressedB = build.filter(q => q.pressed > 2);
  const out = k => pressedB.filter(k).length;
  const L = F.longs.filter(l => l.done && l.won !== undefined), Lw = L.filter(l => l.won === true), Ll = L.filter(l => l.won === false);
  const rec = F.recoveries.filter(r => r.done != null);
  return {
    scenario: cfg.name, seed: cfg.seed, swap: !!cfg.swap, score: `${st[P].g}-${st[D].g} (press-direct)`, shots: [st[P].sh, st[D].sh], possPress: Math.round(100 * st[P].pos / (st[P].pos + st[D].pos)),
    buildUps: build.length, pressedBuildUps: pressedB.length,
    pressedOutcome: { lostOwnThird: out(q => q.end === 'lost' && q.maxFwd < 20), shortEscape: out(q => q.escape), longRelease: out(q => q.long), reachedFinalThird: out(q => q.reachedFin), shot: out(q => q.shot) },
    isolatedPressPct: pct(F.isolated, F.press), coveredPressPct: pct(F.covered, F.press), highPressFrames: F.highPress,
    longBalls: F.longs.length, longUnderPressure: F.longs.filter(l => l.pressed).length, longToTarget: F.longs.filter(l => l.toTarget).length,
    secondBallWonPct: pct(Lw.length, Lw.length + Ll.length), deadAfterLong: F.longs.filter(l => l.dead).length,
    supportAtLanding: +(F.longs.reduce((t, l) => t + (l.support || 0), 0) / Math.max(1, F.longs.length)).toFixed(1), oppAtLanding: +(F.longs.reduce((t, l) => t + (l.opp || 0), 0) / Math.max(1, F.longs.length)).toFixed(1),
    freeReceiverFinalThirdPct: { direct: pct(F.recv.free, F.recv.fin), press: pct(F.recvP.free, F.recvP.fin) },
    counterpress: { ...F.cp, regainPct: pct(F.cp.regain, F.cp.starts) }, recoverySecs: rec.length ? +(rec.reduce((t, r) => t + r.done, 0) / rec.length).toFixed(1) : null, slowRecoveries: rec.filter(r => r.done >= 8).length,
    blockOver40mPct: pct(F.deep.gap, F.deep.frames), longKinds: F.kinds || {}, directPasses: st[D].pa, directLongStat: st[D].lp || 0, events: F.events.slice(0, 12), allEvents: F.events,
  };
}

function flowRun(list) {
  const prev = G;
  newGame(CLUBS[0].id, 'Flow QA', 1); G.flags.fixedTac = true;
  FLOW_BASE = JSON.stringify(G);
  const rows = list.map(cfg => flowSummary(flowMatch(cfg).M, cfg));
  G = prev;
  return rows;
}
let FLOW_BASE = null;
