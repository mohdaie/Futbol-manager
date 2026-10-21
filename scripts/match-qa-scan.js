'use strict';
// Instrumentation wraps actual action/receive functions in this test runtime.
// It is not loaded by index.html and never changes a game player's experience.
const QA_PLAY = playOption, QA_KICK = kick, QA_RECEIVE = receive;
const QA_INTENT = applyTeamIntent;
let QA_BASELINE_INTENT = false;
applyTeamIntent = function(M, s, i, options, press, context) {
  // Baseline mode measures the same opportunities without changing scores.
  return QA_INTENT(M, s, i, QA_BASELINE_INTENT ? options.map(op => ({ ...op })) : options, press, context);
};
playOption = function(M, s, i, op, press) {
  const q = M.qa, p = P_(M, s, i), pass = ['pass', 'long', 'thru'].includes(op.k);
  if (q) {
    const fwd = pass ? (op.ty - p.y) * fwdY(s) : 0;
    if (pass) {
      q.passes++; if (fwd > 2) q.forward++; else if (fwd < -2) q.backward++; else q.sideways++;
      if (M.sim.lastPass?.s === s && M.sides[s].on[op.j] === M.sim.lastPass.id && M.sim.t - M.sim.lastPass.t < 6) {
        q.returnPass++; if (fwd < -2) q.backwardReturn++;
      }
    }
    const m = q.momentum;
    if (m && M.sim.t - m.t < 8 && M.sim.poss === m.s && s === m.s && i === m.i) {
      const back = pass && fwd < -2;
      q.afterBreak++; if (back) q.backAfterBreak++;
      if (press < .4 && M.sim.intent?.forward) { q.openAfterBreak++; if (back) q.backOpenAfterBreak++; }
      q.momentum = null;
    }
  }
  return QA_PLAY(M, s, i, op, press);
};
kick = function(M, s, i, k, tx, ty, j, o = {}) {
  const q = M.qa, p = P_(M, s, i), O = M.sides[1 - s];
  let broken = false;
  if (q && ['pass', 'long', 'thru'].includes(k) && (ty - p.y) * fwdY(s) > 3) {
    for (const band of [1, 3]) {
      const ys = M.sim.P[1 - s].filter((v, n) => v && n > 0 && (band === 1 ? LINE[FORMATIONS[O.oop][O.map[n]][0]] === 1 : [2, 3].includes(LINE[FORMATIONS[O.oop][O.map[n]][0]]))).map(v => v.y);
      if (!ys.length) continue;
      const line = ys.reduce((a, b) => a + b, 0) / ys.length;
      if ((p.y - line) * fwdY(s) < -1 && (ty - line) * fwdY(s) > 1) broken = true;
    }
  }
  const result = QA_KICK(M, s, i, k, tx, ty, j, o);
  if (q && M.sim.B.fl) M.sim.B.fl.qaBreak = broken;
  return result;
};
receive = function(M, s, j, fl, d) {
  const before = M.sides[s].st.pc, result = QA_RECEIVE(M, s, j, fl, d);
  if (M.qa && fl?.qaBreak && M.sides[s].st.pc > before) {
    M.qa.lineBreaks++; M.qa.momentum = { s, i: j, t: M.sim.t };
  }
  return result;
};

function matchQaBatch(n = 12, baselineIntent = false) {
  QA_BASELINE_INTENT = baselineIntent;
  const started = performance.now(), names = Object.keys(STYLES);
  newGame(CLUBS[0].id, 'Engine QA', 1); G.flags.fixedTac = true;
  const baseline = JSON.stringify(G), rows = [];
  for (let k = 0; k < n; k++) {
    G = JSON.parse(baseline);
    const clubs = plClubs(), h = clubs[(k * 2) % clubs.length], a = clubs[(k * 2 + 1) % clubs.length];
    // Manager changes are intentionally excluded to hold the tactical input fixed.
    const styles = [names[k % names.length], names[(k + 2) % names.length]];
    G.club = 'QA-unmanaged';
    [h, a].forEach((id, s) => { applyStyle(G.clubs[id].tac, styles[s]); });
    const M = createMatch({ id: -1 - k, h, a });
    M.qa = { passes: 0, forward: 0, backward: 0, sideways: 0, returnPass: 0, backwardReturn: 0, lineBreaks: 0, afterBreak: 0, backAfterBreak: 0, openAfterBreak: 0, backOpenAfterBreak: 0, momentum: null };
    let minutes = 0;
    while (!M.ended && minutes++ < 110) { simMinute(M); M.sides.forEach(S => injurySubs(M, S)); }
    const st = M.sides.map(S => S.st), qa = { ...M.qa }; delete qa.momentum;
    const finite = M.sim.P.every(P => P.every(p => !p || [p.x, p.y, p.vx, p.vy].every(Number.isFinite)));
    rows.push({ match: k + 1, styles, finished: M.ended, finite, minutes: M.min,
      goals: st[0].g + st[1].g, shots: st[0].sh + st[1].sh, onTarget: st[0].sot + st[1].sot,
      attempts: st[0].pa + st[1].pa, complete: st[0].pc + st[1].pc, ...qa });
  }
  const sum = key => rows.reduce((t, r) => t + (r[key] || 0), 0), rate = (a, b) => Math.round(1000 * sum(a) / Math.max(1, sum(b))) / 10;
  return { schema: 2, seed: MATCH_QA_SEED, matches: n, fixedTactics: true, baselineIntent, ms: Math.round(performance.now() - started),
    finished: rows.every(r => r.finished), finite: rows.every(r => r.finite),
    goalsPerMatch: +(sum('goals') / n).toFixed(2), shotsPerMatch: +(sum('shots') / n).toFixed(2), passesPerMatch: Math.round(sum('attempts') / n), completionPct: rate('complete', 'attempts'),
    forwardPct: rate('forward', 'passes'), backwardPct: rate('backward', 'passes'), returnPct: rate('returnPass', 'passes'), backwardReturnPct: rate('backwardReturn', 'passes'),
    lineBreaks: sum('lineBreaks'), afterBreak: sum('afterBreak'), backAfterBreak: sum('backAfterBreak'), backAfterBreakPct: rate('backAfterBreak', 'afterBreak'),
    openAfterBreak: sum('openAfterBreak'), backOpenAfterBreak: sum('backOpenAfterBreak'), backOpenAfterBreakPct: rate('backOpenAfterBreak', 'openAfterBreak'), rows };
}
