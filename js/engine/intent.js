'use strict';
/* Rulebook layer 3: give the carrier a team purpose before choosing an action.
   Geometry and risk still decide what is on. No style receives a win-rate bonus. */
const INTENT_PASSES = new Set(['pass', 'long', 'thru']);

function brokenLines(M, s, fromY, toY) {
  const fw = fwdY(s), O = M.sides[1 - s];
  if ((toY - fromY) * fw <= 3) return 0;
  const groups = [[], []], f = FORMATIONS[O.oop], map = O.map || shapeMap(O.ip, O.oop);
  M.sim.P[1 - s].forEach((p, i) => {
    if (!p || !i) return;
    const line = LINE[f[map[i]][0]];
    if (line === 1) groups[0].push(p.y);
    else if (line === 2 || line === 3) groups[1].push(p.y);
  });
  return groups.reduce((n, ys) => {
    if (!ys.length) return n;
    const y = ys.reduce((a, b) => a + b, 0) / ys.length;
    return n + ((fromY - y) * fw < -1 && (toY - y) * fw > 1 ? 1 : 0);
  }, 0);
}

function applyTeamIntent(M, s, i, options, pressure, context = {}) {
  const S = M.sides[s], p = M.sim.P[s][i], sim = M.sim;
  const [x, y] = toOwn(s, p.x, p.y), phase = teamPhase(S, true, x, y);
  if (context.restart) return { phase: 'restart', forward: false, momentum: false };
  const momentum = !!(sim.momentum && sim.momentum.s === s && sim.momentum.until > sim.t);
  const read = options.map(op => {
    const pass = INTENT_PASSES.has(op.k), carry = op.k === 'carry';
    const targetY = pass ? op.ty : carry ? op.cy : p.y;
    const fwd = (targetY - p.y) * fwdY(s);
    const viable = fwd > 2 && (pass ? op.risk <= .32 && (op.rpress ?? 0) <= .45 && op.v >= -.015 : carry && op.v > .005);
    return { op, pass, carry, fwd, viable };
  });
  const forward = read.some(r => r.viable), free = clamp((.65 - pressure) / .65, 0, 1);
  const vision = clamp((ac(S, i, 'vis') + ac(S, i, 'dec')) / 30, .4, 1.2);
  const opp = sim.P[1 - s].filter((q, j) => q && j > 0), centreX = opp.length ? opp.reduce((a, q) => a + q.x, 0) / opp.length : PW / 2;
  // Weak-side overload: four or more opponents packed into the carrier's flank (14 m across, 20 m deep).
  const crowded = opp.filter(q => Math.abs(q.x - p.x) < 14 && Math.abs(q.y - p.y) < 20).length >= 4;
  for (const r of read) {
    const { op, pass, fwd, viable } = r;
    // Overload then switch: reward a genuinely free opposite flank when the
    // defending block has shifted across. A square pass then has a purpose.
    const switchOpen = pass && op.risk <= .42 && (op.rpress ?? 0) < .3 &&
      Math.abs(p.x - PW / 2) > 14 && Math.abs(op.tx - PW / 2) > 14 &&
      (p.x - PW / 2) * (op.tx - PW / 2) < 0 && (p.x - PW / 2) * (centreX - PW / 2) > 56;
    if (switchOpen) op.v += .008 * vision;
    if (switchOpen && crowded && ['Winger', 'Inverted Winger', 'Inside Forward'].includes(roleName(S, op.j))) op.v += .015;
    // Third man: a pass to a forward who has dropped to receive is worth more while an advancing runner is open behind him.
    if (pass && isDropper(S, op.j, sim.P[s][op.j], fwdY(s))) {
      const dropper = sim.P[s][op.j];
      const runner = sim.P[s].some((q, j) => q && j && j !== op.j && j !== i && q.run > sim.t && q.vy * fwdY(s) >= 0 && (q.y - dropper.y) * fwdY(s) < 0 && recvPressure(M, s, q.x, q.y)[1] < .45);
      if (runner) op.v += .012;
    }
    if (forward && viable) {
      const progress = clamp(fwd / 15, .2, 1);
      op.v += (.004 + progress * .004 + (momentum ? .012 : 0)) * free * vision;
      if (pass && phase === 'build' && ['DM', 'DL', 'DR'].includes(FORMATIONS[S.ip][op.j]?.[0])) op.v += .003 * free * (1 - op.risk);
      if (pass && phase === 'create' && pitchZone(...toOwn(s, op.tx, op.ty)).zone14) op.v += .004 * free * (1 - op.risk);
    }
    // Under pressure or with forward routes closed, recycling remains available.
    if (forward && pass && fwd < -2 && !switchOpen) op.v -= (.006 + (momentum ? .012 : 0)) * free * vision;
    const previous = sim.lastPass;
    if (forward && pass && previous?.s === s && sim.t - previous.t < 6 && S.on[op.j] === previous.id && fwd <= 2 && !switchOpen) op.v -= .008 * free * vision;
  }
  return { phase, forward, momentum };
}
// Preserve the production source fingerprint even when test instrumentation
// wraps the public entry point to compare the baseline decision scores.
const TEAM_INTENT_SOURCE = [brokenLines, applyTeamIntent].map(String).join('\n');
