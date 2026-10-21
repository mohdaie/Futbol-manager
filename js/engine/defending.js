'use strict';
/* Rulebook layer 4. One pressure/cover/balance unit; the existing transition
   state is supplied by the transition layer. Targets are world metres, not copied player state. */
function defensiveOutlet(M, s, i) {
  const p = M.sim.P[s][i];
  return M.sim.P[s].some((q, j) => q && j !== i && (q.y - p.y) * fwdY(s) > 3 &&
    hyp(q.x - p.x, q.y - p.y) < 30 && recvPressure(M, s, q.x, q.y)[1] < .45 &&
    passRisk(M, s, p.x, p.y, q.x, q.y, false) < .32);
}

function defensiveLineStep(M, o) {
  const sim = M.sim, B = sim.B, p = owner(M);
  if (!p || sim.rs || B.os === o) return 0;
  const s = B.os, [, y] = toOwn(o, p.x, p.y);
  if (y > .8) return 0; // box defending / runner marking takes priority
  const counter = counterpressState(M,o);
  if (counter.recover) return -3;
  if (counter.active) return 1.5;
  const tr = sim.tr;
  if ((M.sides[o].lost ?? 1) === 0 && tr?.s === s && sim.t - tr.t < 4) return -3;
  const pressure = pressureOn(M, s, B.oi)[0], forward = p.vy * fwdY(s);
  const back = sim.pt?.o === o && sim.pt.until > sim.t && sim.pt.back;
  if (back || pressure > .6 && !defensiveOutlet(M, s, B.oi)) return 2.5;
  return pressure < .35 && forward > .5 ? -4 : 0;
}

function defensiveUnit(M, s, gap, jump = false, counterpress = false, cohort = null) {
  const sim = M.sim, p = owner(M), o = 1 - s, P = sim.P[o];
  if (!p || sim.rs || sim.B.os !== s) return { assignments: [] };
  const nearest = P.map((q, i) => q && i ? { i, d: hyp(q.x - p.x, q.y - p.y) } : null)
    .filter(q => q && (!counterpress || !cohort || cohort.includes(q.i))).sort((a, b) => a.d - b.d);
  if (!nearest.length) return { assignments: [] };
  const gx = PW / 2, gy = goalY(s), L = hyp(gx - p.x, gy - p.y) || 1;
  const ux = (gx - p.x) / L, uy = (gy - p.y) / L, inside = p.x < gx ? 1 : -1;
  const wide = p.x < 12 || p.x > PW - 12;
  // Approach through the inside passing lane. This screens a central receiver
  // and shows the carrier towards the touchline instead of chasing straight on.
  const outlets = sim.P[s].map((q, i) => q && i && i !== sim.B.oi ? { q, d: hyp(q.x - p.x, q.y - p.y) } : null)
    .filter(r => r && r.d > 5 && r.d < 24 && Math.abs(r.q.x - gx) < 15 && (r.q.y - p.y) * fwdY(s) > -6)
    .sort((a, b) => Math.abs(a.q.x - gx) - Math.abs(b.q.x - gx) || a.d - b.d);
  const outlet = outlets[0];
  let ax = ux, ay = uy;
  if (outlet) { ax = (outlet.q.x - p.x) / outlet.d; ay = (outlet.q.y - p.y) / outlet.d; }
  if (wide) { ax = ux + inside * .7; ay = uy; const n = hyp(ax, ay) || 1; ax /= n; ay /= n; }
  const g = jump || counterpress ? .9 : Math.max(.8, gap);
  const assignments = [], put = (n, job, x, y) => {
    if (!nearest[n]) return;
    assignments.push({ i: nearest[n].i, job, x: clamp(x, .5, PW - .5), y: clamp(y, .5, PL - .5) });
  };
  put(0, 'press', p.x + ax * g, p.y + ay * g);
  // Cover sits five metres goal-side of the presser, angled towards the centre.
  if (nearest[1]?.d < (counterpress ? 24 : 20)) put(1, 'cover', p.x + ax * g + ux * 5 + inside * 1.5, p.y + ay * g + uy * 5);
  if ((jump || counterpress) && nearest[2]?.d < 24) {
    if (outlet) put(2, wide ? 'trap' : 'screen', p.x + (outlet.q.x - p.x) * .65, p.y + (outlet.q.y - p.y) * .65);
    else put(2, 'balance', p.x + ux * 9 + inside * 6, p.y + uy * 9);
  }
  if (counterpress && nearest[3]?.d < 24) put(3, 'escape', p.x + ux * 7 - inside * 4, p.y + uy * 7);
  return { assignments, shadow: !!outlet, trap: wide && jump, counterpress };
}
const DEFENDING_SOURCE = [defensiveOutlet, defensiveLineStep, defensiveUnit].map(String).join('\n');
