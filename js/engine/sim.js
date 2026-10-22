'use strict';
/* ===== sim.js =====
   Match engine v3: a positional simulation. The match is played second by second (TICK) on a 68 x 105 m
   pitch: 22 players with their own speed, acceleration and decisions, and a ball with speed and height that
   can be intercepted on its way, goes out of play and is restarted (throw-ins, goal kicks, corners, free
   kicks, penalties, kick-offs). Goals, shots, cards and every stat come from what happens on the pitch,
   and the 2D view draws the same positions (M.frames).

   World frame: X 0-68 m (left to right as seen by the home side), Y 0-105 m. The home side (sides[0])
   attacks Y = 0, the away side Y = 105. Each side's own frame (as in FORMATIONS and positions()) is
   x 0-1, y 0 = the goal it attacks.

   Attributes act through what players do: Pace and Agility are speed and acceleration, Passing, Vision,
   Composure, Decisions and Teamwork choose and play the pass, First Touch controls it, Anticipation and
   Positioning cut passes out, Marking keeps defenders close, Tackling, Strength and Dribbling settle
   challenges, Heading and height win the ball in the air, Off the Ball and Anticipation time runs,
   Finishing and Composure finish, the goalkeeping attributes save, Work Rate and Stamina keep players
   pressing, Flair and Dribbling take players on, Crossing delivers, Leadership (captain) lifts the side.
   Tactics move the shape (teamPlan()/positions()), set tempo (time on the ball), directness and risk, width,
   pressing (who goes and how far), the defensive line and what happens on winning or losing the ball;
   roles and player instructions (beh()) shape each player's choices and runs. */

const PW = 68, PL = 105, TICK = 0.5;
const sigm = z => 1 / (1 + Math.exp(-z));
const logit = p => Math.log(p / (1 - p));
// Success chance of a duel. a, d: attacker and defender scores (1-20 scale), close: how involved the defender is (0-1).
// Rule 11: about two in three for a clear gap (4 attribute points), not four in five; edges compound over a match.
const duel = (a, d, base, close = 1, k = 6) => sigm(logit(clamp(base, 0.02, 0.98)) + ((a - 10) - (d - 10) * close) / k);
// Roll a duel and record it for engine tuning: M.duels['type|row|gap'] = [tries, wins, sum of chances].
// Tactic cohesion: a side whose players suit what its tactic asks of them wins a little more of every duel.
function duelRoll(M, t, y, a, d, base, close = 1, S = null, O = null) {
  const p = sigm(logit(duel(a, d, base, close)) + COHESION_K * ((S ? S.coh || 0 : 0) - (O ? O.coh || 0 : 0) * close)), ok = R() < p;
  if (M.duels) {
    const key = t + '|' + clamp(Math.floor(y * 6), 0, 5) + '|' + clamp(Math.round((a - 10 - (d - 10) * close) / 2) * 2, -8, 8);
    const x = M.duels[key] || (M.duels[key] = [0, 0, 0]);
    x[0]++; if (ok) x[1]++; x[2] += p;
  }
  return ok;
}
const COHESION_K = 0.35;
const PHYS = new Set(['pac', 'sta', 'agi', 'str']);
// Engine levers for league averages only (calibrated with Admin > Run test season).
const ENG = { xg: 1, shoot: 1, foul: 1.1, intercept: 1.1, offFoul: 0.06, keepShot: 0.12, carry: 1, carryRisk: 1, thr: 0.28, sharp: 60, touch: 1.1, tackleFoul: 0.13, cross: 0.45, fin: 1.12, qual: 0.55 };

// Form of each player this minute: morale, condition, sharpness, position fit, captain.
function refreshForm(M, S) {
  const losingLate = M.min >= 75 && S.st.g < M.sides[1 - S.idx].st.g;
  S.form = S.on.map((id, i) => {
    if (!id) return 0;
    const p = G.players[id];
    return pForm(S, p) * fam(p, FORMATIONS[S.ip][i][0]) * (S.capF || 1) * (S.idx === 0 && !S.neutral ? 1.015 : 1) * (losingLate && p.pers === 'Determined' ? 1.05 : 1);
  });
  S.fam = S.user ? G.training.fam : 85;
  S._ac = null; S._sp = null; S._rc = null; S._attC = null; S._bh = null; S._shape = null;
}
// Attribute k of the player in slot i, as it counts right now.
function av(S, i, k) {
  const p = G.players[S.on[i]];
  if (!p) return 5;
  let v = p.at[A[k]] * (S.form[i] || 0.8);
  if (PHYS.has(k)) v *= 0.8 + 0.2 * (S.cond[p.id] ?? 100) / 100;
  if ((k === 'cmp' || k === 'dec') && p.age >= 29) v += 0.6;
  if ((k === 'cmp' || k === 'dec') && p.age <= 20) v -= 0.6;
  if (k === 'str') v += clamp((bmiOf(p) - 23) * 0.4, -1, 1.5);
  return 11 + (v - 11) * ENG.qual; // rule 11: how strongly quality shows (a better player wins more, not all)
}
// The same, cached for the minute (the engine asks for the same values every tick).
const NA = ATTRS.length;
function ac(S, i, k) {
  let c = S._ac;
  if (!c) { c = S._ac = new Float32Array(11 * NA); c.fill(NaN); }
  const key = i * NA + A[k], v = c[key];
  return v === v ? v : (c[key] = av(S, i, k), c[key]); // the stored (float32) value, the same on every read
}
// Role behaviour plus player instruction (beh() in pitch.js), cached for the minute.
const BEH_K = ['fw', 'wd', 'sh', 'dr', 'cr', 'thr', 'rk', 'run', 'pr', 'tk', 'aer', 'hold', 'sweep', 'mk'];
const BEH_I = Object.fromEntries(BEH_K.map((k, n) => [k, n]));
function bh(S, i, k) {
  let c = S._bh;
  if (!c) { c = S._bh = new Float32Array(11 * BEH_K.length); c.fill(NaN); }
  const key = i * BEH_K.length + BEH_I[k], v = c[key];
  return v === v ? v : (c[key] = beh(S, i, k));
}
// Shared rulebook anchors, cached on a one-metre grid for this minute.
function defShape(S, bx, by) { return blockPlan(S, bx, by).positions; }
function shapeOf(M, s, has, bx, by) {
  const S = M.sides[s];
  if (!(S._shape instanceof Map)) S._shape = new Map(); // caches are rebuilt after loading a saved match
  const carrier = has && M.sim && M.sim.B.os === s ? M.sim.B.oi : -1;
  const qx = Math.round(clamp(bx, 0, 1) * 68), qy = Math.ceil(clamp(by, 0, 1) * 105);
  // The opponent's back and midfield lines (in our frame, rounded to 3 m) so we can play between them.
  let lines = null;
  if (has && M.sim) {
    const O = M.sides[1 - s], ys = M.sim.P[1 - s].map((q, j) => q && j ? { y: toOwn(s, q.x, q.y)[1], row: LINE[FORMATIONS[O.oop][(O.map || shapeMap(O.ip, O.oop))[j]][0]] } : null).filter(Boolean);
    const avg = a => a.length ? a.reduce((t, q) => t + q.y, 0) / a.length : NaN, r3 = v => Math.round(v * 35) / 35;
    const back = avg(ys.filter(q => q.row === 1)), mid = avg(ys.filter(q => q.row === 2 || q.row === 3));
    if (Number.isFinite(back) && Number.isFinite(mid)) lines = { back: r3(back), mid: r3(mid) };
  }
  const restart = !!M.sim?.rs, key = [has, qx, qy, carrier, restart, lines ? lines.back + ':' + lines.mid : ''].join('|');
  let plan = S._shape.get(key);
  if (!plan) {
    plan = teamPlan(S, has, qx / 68, qy / 105, carrier, lines);
    if (restart) plan.phase = 'restart';
    S._shape.set(key, plan);
  }
  S._teamPlan = plan;
  return plan.positions;
}
const avg2 = (S, i, ks) => ks.reduce((t, [k, w]) => t + ac(S, i, k) * w, 0) / ks.reduce((t, [, w]) => t + w, 0);
const aerialAt = (S, i) => { const p = G.players[S.on[i]]; return ac(S, i, 'hea') + clamp(((p && p.ht || 182) - 182) / 4, -3, 4); };
const bump = (S, i, d) => bumpRating(S, S.on[i], d);
const pstat = (S, i, k, n = 1) => { const id = S.on[i]; if (!id) return; const x = S.ps[id] || (S.ps[id] = {}); x[k] = (x[k] || 0) + n; };
const metres = (x, y) => Math.hypot((x - 0.5) * 68, y * 105); // own frame: distance to the goal attacked

/* ---------- geometry ---------- */
const goalY = s => (s === 0 ? 0 : PL);
const fwdY = s => (s === 0 ? -1 : 1);                       // direction of attack in Y
const toOwn = (s, X, Y) => (s === 0 ? [X / PW, Y / PL] : [1 - X / PW, 1 - Y / PL]);
const toWorld = (s, x, y) => (s === 0 ? [x * PW, y * PL] : [(1 - x) * PW, (1 - y) * PL]);
const dGoal = (s, X, Y) => Math.hypot(X - PW / 2, Y - goalY(s));
const hyp = Math.hypot;
// Rulebook 1c, body shape: p.fa is the angle a player faces (world frame, atan2(dy, dx)).
const wrapA = a => { while (a > Math.PI) a -= 2 * Math.PI; while (a < -Math.PI) a += 2 * Math.PI; return a; };
const fwdA = s => (s === 0 ? -Math.PI / 2 : Math.PI / 2); // the way side s attacks
const faceOff = (p, X, Y) => Math.abs(wrapA(Math.atan2(Y - p.y, X - p.x) - (p.fa ?? 0))); // how far he must turn to face (X, Y)
const backness = (s, p) => Math.abs(wrapA((p.fa ?? fwdA(s)) - fwdA(s))) / Math.PI; // 0 facing forward, 1 back to goal
// Distance from point P to segment AB (returned), and how far along it (SD.u, 0-1). No allocation: called a lot.
const SD = { u: 0 };
function segD(px, py, ax, ay, bx, by) {
  const dx = bx - ax, dy = by - ay, L2 = dx * dx + dy * dy || 1;
  let u = ((px - ax) * dx + (py - ay) * dy) / L2;
  if (u < 0) u = 0; else if (u > 1) u = 1;
  SD.u = u;
  const ex = px - ax - u * dx, ey = py - ay - u * dy;
  return Math.sqrt(ex * ex + ey * ey);
}
function segDist(px, py, ax, ay, bx, by) { const d = segD(px, py, ax, ay, bx, by); return [d, SD.u]; }
// Chance quality from a spot (the xG model the league is calibrated on).
// Rulebook 7.5 (1): the chance from distance and the goal-mouth angle, keeper set and nobody in the way (fitted to
// public figures: ~0.4 from 6 m, ~0.22 from the spot, ~0.13 from the box edge, ~0.04 from 25 m or a tight angle).
const goalAngle = (s, X, Y) => { const dy = Math.abs(Y - goalY(s)) || 0.01; return Math.abs(Math.atan2(dy, X - (PW / 2 - 3.66)) - Math.atan2(dy, X - (PW / 2 + 3.66))); };
const xgAt = (s, X, Y) => { const d = Math.max(1, dGoal(s, X, Y)); return clamp(1 / (1 + Math.exp(9.31 + 0.237 * d - 3.41 * Math.log(d) - 3.86 * goalAngle(s, X, Y))), 0.005, 0.7); };
// Rulebook 7.5 (2-5): what the shooter actually sees. The keeper and defenders between ball and goal hide part of
// the goal mouth (compared with a keeper set on the line to goal); every body in the shooting triangle makes it
// worse; a man on him hurries it; a header is worth well under half.
function chanceAt(M, s, X, Y, o = {}) {
  const d = Math.max(1, dGoal(s, X, Y)), gy = goalY(s), dy = gy - Y;
  const pa = Math.atan2(dy, PW / 2 - 3.66 - X), pb = Math.atan2(dy, PW / 2 + 3.66 - X), lo = Math.min(pa, pb), hi = Math.max(pa, pb), th = hi - lo || 1e-3;
  const shade = (c, half) => [Math.max(lo, c - half), Math.min(hi, c + half)];
  // The reference keeper is set as 6.1 places him: 1.5 m off his line on the line to the ball (near post at most).
  const kx = clamp(PW / 2 + (X - PW / 2) * 1.5 / Math.max(1.6, Math.abs(dy)), PW / 2 - 3.2, PW / 2 + 3.2), ky = gy - Math.sign(dy) * 1.5;
  const ks = shade(Math.atan2(ky - Y, kx - X), Math.atan(1.2 / Math.max(0.5, hyp(kx - X, ky - Y)))), visSet = 1 - Math.max(0, ks[1] - ks[0]) / th;
  const iv = []; let between = 0;
  M.sim.P[1 - s].forEach((q, j) => {
    if (!q || Math.abs(q.y - gy) >= Math.abs(dy)) return; // only those between him and the goal line
    const r = Math.max(0.5, hyp(q.x - X, q.y - Y)), c = Math.atan2(q.y - Y, q.x - X), [a, b] = shade(c, Math.atan((j ? 0.4 : 1.2) / r));
    if (b > a) iv.push([a, b]);
    if (j && b > a) between++; // his body is in the shooting triangle
  });
  iv.sort((u, v) => u[0] - v[0]);
  let cov = 0, e = -Infinity; for (const [a, b] of iv) { if (b <= e) continue; cov += b - Math.max(a, e); e = b; }
  const visible = 1 - cov / th, z = Math.log(xgAt(s, X, Y) / (1 - xgAt(s, X, Y))) + 4 * (visible - visSet) - 0.35 * between - 0.6 * (o.press || 0) - (o.head ? 1 : 0) - 1.6 * Math.max(0, (o.fo || 0) - 1.1); // 1c: shooting with his back to goal
  return { xg: clamp(1 / (1 + Math.exp(-z)), 0.005, 0.9), visible, between };
}
// How dangerous a spot is with the ball (expected threat): grows towards goal, highest centrally.
// Near goal it stays below the chance of a shot from there: close in, shooting is how you score.
function threat(s, X, Y) {
  const d = dGoal(s, X, Y), c = Math.abs(X - PW / 2) / (PW / 2), cent = c > 0.6 ? 0.25 : 1 - c * c * 2;
  return 0.01 + ENG.thr * Math.exp(-d / 22) * cent + xgAt(s, X, Y) * 0.1;
}

/* ---------- the match state ---------- */
// M.sim: t (seconds), P[side][slot] players {id, x, y, vx, vy, tx, ty, cool, run}, B the ball, rs a pending restart.
function simInit(M) {
  const st = { t: 0, P: [[], []], B: { x: PW / 2, y: PL / 2, z: 0, vx: 0, vy: 0, vz: 0, os: -1, oi: -1, ls: 0, li: -1, fl: null, dt: 0, hx: 0, hy: 0 }, rs: null, poss: 0, ko: 0, half: 1, tgtT: 0, last: null };
  M.sim = st;
  M.sides.forEach((S, s) => syncSide(M, s, true));
  kickOff(M, 0);
}
// Keep the players on the pitch in step with the side (substitutions, red cards).
function syncSide(M, s, place) {
  const S = M.sides[s], P = M.sim.P[s];
  if (S.on.every((id, i) => (P[i] ? P[i].id : null) === (id || null))) return;
  S._ac = null; S._shape = null; S._sp = null; S._rc = null; S._attC = null; S._bh = null;
  const pos = positions(S, false, 0.5, 0.5);
  S.on.forEach((id, i) => {
    if (!id) { if (P[i] && M.sim.B.os === s && M.sim.B.oi === i) looseBall(M); P[i] = null; return; }
    if (P[i] && P[i].id === id) return;
    const q = pos[i] || [0.5, 0.5], [X, Y] = toWorld(s, q[0], q[1]);
    const entering = !place && P[i];
    P[i] = { id, x: entering ? (s === 0 ? 0.5 : PW - 0.5) : X, y: entering ? PL / 2 : Y, vx: 0, vy: 0, tx: X, ty: Y, cool: 0, run: 0, carry: 0, want: 0, fa: fwdA(s) };
  });
  for (let i = S.on.length; i < P.length; i++) P[i] = null;
}
const P_ = (M, s, i) => M.sim.P[s][i];
const owner = M => (M.sim.B.os >= 0 ? M.sim.P[M.sim.B.os][M.sim.B.oi] : null);
function giveBall(M, s, i) {
  const B = M.sim.B, p = P_(M, s, i);
  if (!p) return looseBall(M);
  if (B.offSet && B.offS === s && (B.offSet & (1 << i)) && !M.sim.rs) { B.offSet = 0; return offside(M, s, i, null); }
  if (B.offS !== s) B.offSet = 0;
  if (M.sim.poss !== s) {
    const quick = counterpressState(M,s).active;
    beginCounterpress(M, M.sim.poss, B.x, B.y);
    M.sim.momentum = null; M.sim.poss = s; M.sim.turn = M.sim.t;
    if (!M.sim.rs) M.sim.tr = { s, t:M.sim.t, quick:!!quick };
  } // won in open play: a transition
  if (toOwn(s, p.x, p.y)[1] < 0.3 && M.sim.t - (M.sim.lastAtt || -99) > 8) { M.sim.lastAtt = M.sim.t; mark(M, 'attack', s); }
  B.os = s; B.oi = i; B.ls = s; B.li = i; B.fl = null; B.x = p.x; B.y = p.y; B.z = 0; B.vx = B.vy = B.vz = 0;
  B.dt = decideDelay(M, s, i, ENG.touch) * (transition(M, s) === 'ctr' ? 0.6 : 1);
  { const bk = backness(s, p); if (bk > 0.45 && !M.sim.rs) B.dt += (bk - 0.45) * 1.2; } // 1c: back to goal, he needs a touch to turn
  // Unpressed, a player takes a touch and looks up before passing; pressed, he plays quickly.
  if (pressureOn(M, s, i)[2] > 10 && toOwn(s, p.x, p.y)[1] < 0.66 && transition(M, s) !== 'ctr') B.dt = Math.max(B.dt, 1.2 + R() * 0.6); // nobody within 10 m (build-up keeps its tempo)
}
// Straight after a change of possession: 'ctr' (counter: quick and forward), 'hold' (keep it, wait for the shape),
// or null. Set by "When the ball is won".
function transition(M, s) {
  const tr = M.sim.tr, w = M.sides[s].won ?? 1;
  if (!tr || tr.s !== s || w === 1 && !tr.quick) return null;
  const t = M.sim.t - tr.t;
  return (w === 2 || tr.quick && w !== 0) && t < 5 ? 'ctr' : w === 0 && t < 4 ? 'hold' : null;
}
function looseBall(M) { const B = M.sim.B; B.os = -1; B.oi = -1; B.fl = null; }

/* ---------- restarts ---------- */
function kickOff(M, s) {
  const sim = M.sim;
  sim.momentum = null; sim.counterpress = null;
  sim.poss = s; // a restart is not an open-play turnover
  sim.rs = { k: 'ko', s, x: PW / 2, y: PL / 2, w: 3 };
  looseBall(M); Object.assign(sim.B, { x: PW / 2, y: PL / 2, z: 0, vx: 0, vy: 0, vz: 0 });
  [0, 1].forEach(t => {
    const pos = positions(M.sides[t], false, 0.5, 0.5);
    sim.P[t].forEach((p, i) => { if (!p || !pos[i]) return; let [X, Y] = toWorld(t, pos[i][0], Math.max(pos[i][1], 0.53)); p.x = p.tx = X; p.y = p.ty = Y; p.vx = p.vy = 0; });
  });
}
// A restart for side s at (X, Y): 'thr' throw-in, 'gk' goal kick, 'ck' corner, 'fk' free kick, 'pen' penalty.
// Dead time before a restart is taken, in seconds, as in real matches (the ball is in play for only about
// 55-58 of 90+ minutes): a throw-in about 15 s, a goal kick about 24 s, a corner about 28 s, a free kick in
// the attacking half about 30 s (wall, set-up) and about 18 s elsewhere, a penalty about 50 s.
function restartWait(k, s, X, Y) {
  if (k === 'thr') return 15;
  if (k === 'gk') return 24;
  if (k === 'ck') return 28;
  if (k === 'pen') return 50;
  if (k === 'fk') return dGoal(s, X, Y) < 38 ? 30 : 18;
  return 4;
}
function setRestart(M, k, s, X, Y, ev) {
  const sim = M.sim;
  sim.momentum = null; sim.counterpress = null;
  looseBall(M); sim.B.offSet = 0;
  sim.rs = { k, s, x: clamp(X, 0, PW), y: clamp(Y, 0, PL), w: restartWait(k, s, X, Y), ev: ev || null };
  Object.assign(sim.B, { x: sim.rs.x, y: sim.rs.y, z: 0, vx: 0, vy: 0, vz: 0 });
  if (sim.poss !== s) { sim.poss = s; sim.turn = sim.t; }
  if (k === 'ck') { M.sides[s].st.co++; mark(M, 'corner', s); }
  if (k === 'fk' && dGoal(s, sim.rs.x, sim.rs.y) < 35) mark(M, 'fk', s);
}
function takerFor(M, k, s) {
  const S = M.sides[s], P = M.sim.P[s], rs = M.sim.rs;
  if (k === 'gk') return 0;
  if (k === 'pen') { const id = S.pk && S.on.includes(S.pk) ? S.pk : taker(S, 'pk').p.id; return S.on.indexOf(id); }
  if (k === 'ck' || (k === 'fk' && dGoal(s, rs.x, rs.y) < 32)) { const id = (k === 'ck' ? S.ck : S.fk); const i = id && S.on.includes(id) ? S.on.indexOf(id) : S.on.indexOf(taker(S, k === 'ck' ? 'ck' : 'fk').p.id); if (i > 0) return i; }
  let best = -1, bd = 1e9;
  P.forEach((p, i) => { if (!p || i === 0) return; const d = hyp(p.x - rs.x, p.y - rs.y); if (d < bd) { bd = d; best = i; } });
  return best;
}
// Players take up their places for the restart; when the wait is over the taker plays it.
function restartTick(M) {
  const sim = M.sim, rs = sim.rs, s = rs.s, o = 1 - s;
  if (rs.ti == null) rs.ti = takerFor(M, rs.k, s);
  const tk = P_(M, s, rs.ti);
  if (!tk) { rs.ti = null; return; }
  // Taker to the ball; set pieces bring the big men forward; everyone else to the shape for this ball position.
  const [bx, by] = toOwn(s, rs.x, rs.y);
  if (rs.placed) { rs.w -= TICK; if (rs.w > 0) return; } else rs.placed = true;
  if (rs.w > 0) [s, o].forEach(t => {
    const S = M.sides[t], pos = shapeOf(M, t, t === s, t === s ? bx : 1 - bx, t === s ? by : 1 - by);
    sim.P[t].forEach((p, i) => {
      if (!p || !pos[i]) return;
      let [X, Y] = toWorld(t, pos[i][0], pos[i][1]);
      if (rs.k === 'ko') Y = t === 0 ? Math.max(Y, PL / 2 + 0.6) : Math.min(Y, PL / 2 - 0.6);
      if ((rs.k === 'ck' || (rs.k === 'fk' && dGoal(s, rs.x, rs.y) < 38)) && i > 0) {
        const tall = aerialAt(S, i) >= 12 || LINE[FORMATIONS[S.ip][i][0]] >= 4;
        if (t === s && tall && LINE[FORMATIONS[S.ip][i][0]] !== 3) { const spot = boxSpot(s, i); X = spot[0]; Y = spot[1]; }
        if (t === o && LINE[FORMATIONS[S.ip][i][0]] <= 3) { const spot = boxSpot(s, i + 3); X = spot[0] + (i % 2 ? 1.5 : -1.5); Y = spot[1] + fwdY(s) * -1.2; }
      }
      if (rs.k === 'pen' && i > 0) { const [, gy] = [0, goalY(s)]; Y = gy - fwdY(s) * 20; X = clamp(X, 14, 54); }
      p.tx = X; p.ty = Y;
    });
  });
  tk.tx = rs.x; tk.ty = rs.y;
  if (rs.k === 'pen' && rs.w > 0) { const g = P_(M, o, 0); if (g) { g.tx = PW / 2; g.ty = goalY(s); } tk.tx = PW / 2; tk.ty = goalY(s) - fwdY(s) * 11; rs.x = tk.tx; rs.y = tk.ty; }
  if (rs.w > 0) return;
  // Teleport the taker onto the ball if he is still on his way (the game does not wait forever).
  if (hyp(tk.x - rs.x, tk.y - rs.y) > 1.5) { tk.x = rs.x; tk.y = rs.y; }
  sim.rs = null;
  const k = rs.k;
  giveBall(M, s, rs.ti);
  const B = sim.B;
  if (k === 'pen') return shoot(M, s, rs.ti, { pen: true });
  if (k === 'ck') return crossBall(M, s, rs.ti, { ck: true });
  if (k === 'fk' && dGoal(s, rs.x, rs.y) < 30 && Math.abs(rs.x - PW / 2) < 20 && R() < 0.55) return shoot(M, s, rs.ti, { fk: true });
  if (k === 'fk' && dGoal(s, rs.x, rs.y) < 40) return crossBall(M, s, rs.ti, { fk: true });
  B.dt = 0; carrierDecide(M, s, rs.ti, { restart: k });
}
// Places in and around the box for set pieces, in side s's attack.
function boxSpot(s, n) {
  const spots = [[0.44, 0.06], [0.56, 0.06], [0.5, 0.1], [0.4, 0.12], [0.6, 0.12], [0.5, 0.16], [0.35, 0.09], [0.65, 0.09], [0.5, 0.21], [0.3, 0.18], [0.7, 0.18], [0.5, 0.05], [0.45, 0.14], [0.55, 0.14]];
  const q = spots[n % spots.length];
  return toWorld(s, q[0], q[1]);
}

/* ---------- moments for highlights and commentary ---------- */
function mark(M, k, s, extra) { (M.marks || (M.marks = [])).push({ t: M.sim.t, k, s, ...(extra || {}) }); }
function evt(M, e) { const x = { min: M.min, tt: Math.round((M.sim.t % 60) * 10) / 10, ...e }; (M.mev || (M.mev = [])).push(x); return x; }

/* ---------- the player on the ball ---------- */
// Time before the next decision: quick thinkers and a fast tempo decide sooner; pressure hurries everyone.
function decideDelay(M, s, i, base = 1) {
  const S = M.sides[s], tempo = S.tempo ?? 1;
  return clamp(base * (1.15 - (ac(S, i, 'dec') - 10) * 0.025) * [1.35, 1, 0.75][tempo] * (0.8 + R() * 0.4), 0.6, 3.5);
}
// How hard the player on the ball is pressed (0-1) and by whom.
function pressureOn(M, s, i) {
  const p = P_(M, s, i), O = M.sim.P[1 - s];
  let best = -1, bd = 99;
  O.forEach((q, j) => { if (!q) return; const d = hyp(q.x - p.x, q.y - p.y); if (d < bd) { bd = d; best = j; } });
  return [clamp(1 - (bd - 1) / 6, 0, 1), best, bd];
}
// Chance a ball from A to the target is cut out on its way, from where the opponents stand and how they read it.
function passRisk(M, s, ax, ay, bx, by, air) {
  const O = M.sides[1 - s], OP = M.sim.P[1 - s], rc = reads(O), dx = bx - ax, dy = by - ay, L2 = dx * dx + dy * dy || 1, len = Math.sqrt(L2);
  let safe = 1;
  for (let j = 0; j < OP.length; j++) {
    const q = OP[j];
    if (!q) continue;
    let u = ((q.x - ax) * dx + (q.y - ay) * dy) / L2;
    if (u < 0) u = 0; else if (u > 1) u = 1;
    if (air && u < 0.85) continue; // a lofted ball goes over the players in between
    const ex = q.x - ax - u * dx, ey = q.y - ay - u * dy, d = Math.sqrt(ex * ex + ey * ey);
    const reach = rc[j] + u * len * 0.06;
    if (d < reach) { let f = (1 - d / reach) * (0.45 + u * 0.35); if (f > 0.9) f = 0.9; safe *= 1 - f * ENG.intercept; }
  }
  return 1 - safe;
}
// How far each player reads and cuts out a pass (Anticipation, Positioning), once a minute.
function reads(S) {
  if (S._rc) return S._rc;
  const a = new Float32Array(11);
  for (let j = 0; j < 11; j++) a[j] = 1.4 + (ac(S, j, 'ant') + ac(S, j, 'pos')) * 0.06 + ac(S, j, 'mar') * 0.025;
  return (S._rc = a);
}
// Options for the player on the ball, each with a value; he picks one, better decision makers more reliably.
function carrierDecide(M, s, i, o = {}) {
  const S = M.sides[s], O = M.sides[1 - s], sim = M.sim, B = sim.B, p = P_(M, s, i), TP = sim.P[s];
  const [press, di, dd] = pressureOn(M, s, i), here = threat(s, p.x, p.y), d2g = dGoal(s, p.x, p.y);
  const gk = i === 0, opts = [], b = k => bh(S, i, k), [ox, oy] = toOwn(s, p.x, p.y), thr = o.restart === 'thr';
  const pass = S.pass ?? 1, ment = S.ment ?? 2, vis = ac(S, i, 'vis'), pas = ac(S, i, 'pas'), tea = ac(S, i, 'tea');
  // Losing the ball costs what we had here, plus the counter it gives them (worse near our own goal).
  // Patient sides (slow tempo, short passing) and good team players value keeping it more.
  const trn = transition(M, s);
  const careful = [1.5, 1.15, 0.9][S.tempo ?? 1] * [1.2, 1, 0.85][pass] * (1 - bh(S, i, 'rk') * 0.25) * (trn === 'hold' ? 1.3 : trn === 'ctr' ? 0.8 : 1);
  const lossCost = (here + 0.05 + (oy > 0.55 ? 0.05 + (oy - 0.55) * 0.3 : 0)) * careful;
  // Shot.
  // Through on goal (only the keeper to beat): he goes for goal and decides every half second; Composure
  // waits for the best moment, a nervous finisher snatches at it early.
  const thru1 = !gk && !o.restart && throughOnGoal(M, s, p.x, p.y);
  if (!gk && d2g < 32 && !o.restart) {
    let xg = chanceAt(M, s, p.x, p.y, { press, fo: faceOff(p, PW / 2, goalY(s)) }).xg; // 7.5, 1c
    let will = (1 + b('sh') * 0.6) * (0.85 + (ac(S, i, 'fla') - 10) * 0.02) * [0.8, 0.9, 1, 1.1, 1.2][ment] * ENG.shoot * shotNerve(S, i);
    if (thru1) will *= 1 + (12 - ac(S, i, 'cmp')) * 0.04;
    // Worth its chance (plus a little for rebounds and corners); a miss only gives them a goal kick, so the
    // choice is mostly against what keeping the ball would bring (the other options).
    opts.push({ k: 'shot', v: xg * 1.15 * will - (1 - xg) * ENG.keepShot, w: will });
  }
  // Passes to team-mates (and through balls into space ahead of runners).
  const range = 20 + vis * 1.1 + [-4, 0, 14][pass] + (gk ? 25 : 0), longOk = gk || pass === 2 || vis >= 13 || bh(S, i, 'rk') > 0.2;
  TP.forEach((q, j) => {
    if (!q || j === i || (j === 0 && oy < 0.6)) return;
    const lead = 0.6, tx = q.x + q.vx * lead, ty = q.y + q.vy * lead, len = hyp(tx - p.x, ty - p.y);
    if (len < 4 || len > (thr ? 22 : range)) return;
    const air = !thr && len > 32;
    if (air && !longOk) return;
    const risk = clamp(passRisk(M, s, p.x, p.y, tx, ty, air) + len * (0.003 + (20 - pas) * 0.0006) + (air ? 0.12 + aerialContest(M, s, j, tx, ty) : 0) + press * 0.08 - (ac(S, j, 'fir') - 10) * 0.006 + Math.max(0, faceOff(p, tx, ty) - 1.75) * 0.08 * (1 + press), 0.02, 0.95); // 1c: a ball played behind where he faces
    const [, rpress] = recvPressure(M, s, tx, ty);
    // A free team-mate close by under pressure deep: the short escape out of the press.
    // Out of the press: a ground ball to a free team-mate past two or more pressers (a press-breaking pass) is
    // what a pressed side looks for first; a free short option close by is also worth more than usual.
    let esc = 1;
    if (!air && oy > 0.55 && press > 0.4 && rpress < 0.35) {
      const beat = sim.P[1 - s].filter((z, n) => z && n && hyp(z.x - p.x, z.y - p.y) < 12 && (z.y - ty) * fwdY(s) < 0).length;
      esc = beat >= 2 && (ty - p.y) * fwdY(s) > 8 ? 1.6 : len < 25 ? 1.3 : 1;
    }
    // The cut-back: from the byline area to the penalty spot or the edge, the best chance in open play (7.1).
    const cutback = !air && oy < 0.13 && Math.abs(ox - 0.5) > 0.12 && dGoal(s, tx, ty) > 7 && dGoal(s, tx, ty) < 20 && Math.abs(tx - PW / 2) < 12 && rpress < 0.5;
    const val = threat(s, tx, ty) * (1 - rpress * 0.45) * esc * (cutback ? 1.5 : 1);
    const fwd = (toOwn(s, p.x, p.y)[1] - toOwn(s, tx, ty)[1]);
    const style = (fwd > 0 ? [0.9, 1, 1.18][pass] * (1 + fwd * (vis - 10) * 0.25) : [1.12, 1, 0.85][pass]) * (1 + Math.max(0, fwd) * b('rk') * 0.4) * (trn === 'ctr' ? 1 + Math.max(0, fwd) * 2 : 1);
    if (offsideNow(M, s, j) && R() > ((q.y - offsideY(M, s)) * fwdY(s) < 1.2 ? 0.15 + (12 - vis) * 0.02 : (20 - vis) / 160)) return; // 4.7: a clear offside he sees; a tight one is easy to misjudge (Vision). He sees the flag coming (poor Vision misses it now and then)
    opts.push({ k: air ? 'long' : 'pass', j, tx, ty, v: ((1 - risk) * val - risk * lossCost) * style, risk, rpress, esc });
    // Through ball into the space in behind for a player making a run.
    // A runner is found while he is still onside (a mistimed run, by a fraction, is flagged).
    if (q.run > sim.t && !gk && !thr && !beyond(s, q.y, offsideY(M, s) + fwdY(s) * (0.05 + (ac(S, j, 'otb') - 10) * 0.03 - (0.25 + Math.max(0, 14 - vis) * 0.1) * R()))) { // 4.7: timing read by Vision; a fraction late is flagged
      const ahead = 9 + ac(S, j, 'pac') * 0.3, sx = clamp(q.x + q.vx * 1.2, 4, PW - 4), sy = clamp(q.y + fwdY(s) * ahead, 2, PL - 2);
      const tl = hyp(sx - p.x, sy - p.y), r2 = clamp(passRisk(M, s, p.x, p.y, sx, sy, false) + 0.12 + (20 - vis) * 0.012 + tl * 0.004 - b('thr') * 0.05 + press * clamp(0.32 - (vis + ac(S, i, 'cmp') - 24) * 0.012, 0.08, 0.4) + Math.max(0, faceOff(p, sx, sy) - 1.75) * 0.1, 0.05, 0.95); // 7.1: a through ball needs time to see the run
      opts.push({ k: 'thru', j, tx: sx, ty: sy, v: ((1 - r2) * threat(s, sx, sy) * 1.15 - r2 * lossCost) * (1 + b('thr') * 0.4 + b('rk') * 0.2) * [0.85, 1, 1.15][pass], risk: r2, rpress: recvPressure(M, s, sx, sy)[1] });
    }
  });
  // Cross from a wide area near the box.
  const wide = ox < 0.22 || ox > 0.78;
  if (!gk && !thr && wide && oy < 0.33) {
    // 7.4: cross when runners are attacking the box (already in it or on their way to it).
    const inBox = TP.filter((q, j) => q && j && j !== i && ((toOwn(s, q.x, q.y)[1] < 0.2 && Math.abs(toOwn(s, q.x, q.y)[0] - 0.5) < 0.22) || (toOwn(s, q.tx, q.ty)[1] < 0.2 && Math.abs(toOwn(s, q.tx, q.ty)[0] - 0.5) < 0.22))).length;
    if (inBox) opts.push({ k: 'cross', v: ENG.cross * (0.03 + inBox * 0.018) * (1 + b('cr') * 0.6) * (ac(S, i, 'cro') / 12) * [0.75, 1, 1.25][S.width ?? 1] * (1 + (O.line === 2 ? 0.05 : 0)) });
  }
  // Carry it forward, or take the defender on.
  if (!gk && !thr) {
    const len = thru1 ? 6 : 8, gk1 = P_(M, 1 - s, 0);
    // Through on goal he runs at it, aiming away from the keeper; otherwise towards goal, away from defenders.
    let dir = carryDir(M, s, i);
    if (thru1) { const ax = PW / 2 + (gk1 ? clamp((PW / 2 - gk1.x) * 2, -3, 3) : 0), gy = goalY(s), L = hyp(ax - p.x, gy - p.y) || 1; dir = [(ax - p.x) / L, (gy - p.y) / L]; }
    const cx = clamp(p.x + dir[0] * len, 1.5, PW - 1.5), cy = clamp(p.y + dir[1] * len, 2.5, PL - 2.5);
    // Everyone who can get across his path in the time the carry takes (keeper included) has to be beaten:
    // the defender's speed and Anticipation against the carrier's pace, then Dribbling against Tackling.
    // (The two who get there best count: the rest are cover.)
    let f1 = 1, f2 = 1, inPath = 0;
    const tk = (ac(S, i, 'dri') + ac(S, i, 'agi') + ac(S, i, 'fla') * 0.5) / 2.5, OS = speeds(O), tC = len / (speeds(S)[i * 2] * 0.85) + Math.max(0, faceOff(p, cx, cy) - 0.5) / (2.5 + ac(S, i, 'agi') * 0.15); // 1c: turning first
    sim.P[1 - s].forEach((q, j) => {
      if (!q) return;
      const d = segD(q.x, q.y, p.x, p.y, cx, cy), u = SD.u, tq = Math.max(0, d - 1.2) / OS[j * 2] - (ac(O, j, 'ant') - 10) * 0.03, late = tq - u * tC;
      if (late >= 0 || (q.y - p.y) * fwdY(s) < 0.5) return; // 4.5: a take-on is against a man in front; one level with him is not
      inPath++; // 4.5: a defender in front who can cut off this path in time makes the carry a take-on
      const f = sigm((tk - (j === 0 ? ac(O, 0, 'one') : avg2(O, j, [['tck', 0.6], ['ant', 0.2], ['pos', 0.2]]))) / 3 + ENG.carryRisk + late * 1.2);
      if (f < f1) { f2 = f1; f1 = f; } else if (f < f2) f2 = f;
    });
    const beat = 0.95 * f1 * f2;
    // Rulebook 6.2: a centre-back with nobody within 10 m steps into midfield with the ball (a Ball-Playing
    // Defender all the more), until someone comes out to him and frees a team-mate.
    const cbStep = FORMATIONS[S.ip][i][0] === 'DC' && oy > 0.4 && dd > 10 ? 0.02 * (roleName(S, i) === 'Ball-Playing Defender' ? 1.5 : 1) : 0;
    // 4.5: a carrier runs at a man only when he judges he can beat him more often than not; a blocked carrier
    // who cannot passes, shields or carries away from him instead.
    if (thru1 || inPath === 0 || beat >= 0.5) opts.push({ k: 'carry', cx, cy, v: cbStep + (beat * threat(s, cx, cy) * 0.9 - (1 - beat) * lossCost) * (1 + b('dr') * 0.5) * (0.9 + ac(S, i, 'fla') * 0.01) * (thru1 ? 1.1 : 1) * ENG.carry, thru1, takeOn: inPath > 0 });
    // Round the keeper when he comes out: Dribbling, Agility and Composure against his One on Ones.
    if (thru1 && gk1 && hyp(gk1.x - p.x, gk1.y - p.y) < 3.5 && dGoal(s, gk1.x, gk1.y) < d2g) { // 7.3: only when he rushes at his feet
      const pr = duel(roundSkill(S, i), roundStop(O), 0.35);
      opts.push({ k: 'round', v: pr * 0.5 * (1 + b('dr') * 0.3) - (1 - pr) * 0.1 });
    }
  }
  // Under pressure deep in his own half: an aimed ball to the outlet (target man or a runner in the channel),
  // worth what winning it there brings, and a blind clearance only as a last resort in real danger.
  if (oy > 0.72 && press > 0.35) {
    const out = directOutlet(M, s, i);
    if (out) opts.push({ k: 'long', j: out.j, tx: out.x, ty: out.y, v: out.win * threat(s, out.x, out.y) - (1 - out.win) * 0.04, risk: 1 - out.win, outlet: true });
    if (oy > 0.84 && press > 0.7) opts.push({ k: 'clear', v: 0.01 + press * 0.04 + (gk ? 0.01 : 0) });
  }
  // Cornered on the touchline under pressure in his own half: put it out for a throw-in.
  if (!gk && oy > 0.5 && press > 0.6 && (p.x < 4 || p.x > PW - 4)) opts.push({ k: 'touch', v: 0.004 + press * 0.012 });
  if (!opts.length) { B.dt = 0.5; return; }
  sim.intent = applyTeamIntent(M, s, i, opts, press, o);
  // He weighs the few best passes he sees (Vision finds them), not every team-mate equally.
  const PK = { pass: 1, long: 1, thru: 1 }, passes = opts.filter(x => PK[x.k]);
  if (passes.length > 4) { passes.sort((a, b) => b.v - a.v); const keep = new Set(passes.slice(0, 4)); for (let k = opts.length - 1; k >= 0; k--) if (PK[opts[k].k] && !keep.has(opts[k])) opts.splice(k, 1); }
  // Decision quality: Decisions and Composure under pressure sharpen the choice.
  const sharp = ENG.sharp * (1 + (ac(S, i, 'dec') - 10) * 0.06 + (ac(S, i, 'cmp') - 10) * press * 0.03);
  const pick1 = wpick(opts, x => Math.exp(sharp * Math.max(-0.2, x.v)));
  playOption(M, s, i, pick1, press);
  sim.last = { s, i, k: pick1.k };
}
// A shot is more likely the better he is at finishing (a poor finisher passes instead).
const shotNerve = (S, i) => 0.75 + ac(S, i, 'fin') * 0.02;
function recvPressure(M, s, X, Y) {
  let bd = 99;
  const OP = M.sim.P[1 - s];
  for (let j = 0; j < OP.length; j++) { const q = OP[j]; if (q) { const d = Math.sqrt((q.x - X) * (q.x - X) + (q.y - Y) * (q.y - Y)); if (d < bd) bd = d; } }
  return [bd, clamp(1 - (bd - 1.5) / 7, 0, 1)];
}
// Which way to carry the ball: towards goal, away from defenders.
function carryDir(M, s, i) {
  const p = P_(M, s, i), S = M.sides[s], [ox, oy] = toOwn(s, p.x, p.y), role = roleName(S, i);
  let dx = (PW / 2 - p.x) * 0.25, dy = fwdY(s) * 10;
  // 7.4: in the attacking half a Winger goes down the line to the byline, then turns towards the cut-back
  // zone; an Inside Forward / Inverted Winger cuts inside into the half-space (more so on his stronger foot).
  if (oy < 0.5 && (ox < 0.25 || ox > 0.75)) {
    const side = ox < 0.5 ? -1 : 1, pl = G.players[S.on[i]];
    if (role === 'Winger' || role === 'Wing-Back' || role === 'Wide Midfielder') { dx = oy < 0.12 ? (PW / 2 - p.x) * 0.6 : (PW / 2 - p.x) * 0.05; dy = fwdY(s) * (oy < 0.12 ? 2 : 10); }
    else if (role === 'Inside Forward' || role === 'Inverted Winger') {
      const strong = pl && (pl.foot === 'Either' || (side > 0 ? pl.foot === 'Left' : pl.foot === 'Right')) ? 1 : 0.55;
      const [hx] = toWorld(s, 0.5 + side * 0.17, oy); dx = (hx - p.x) * 0.9 * strong; dy = fwdY(s) * 6;
    }
  }
  M.sim.P[1 - s].forEach(q => { if (!q) return; const d = hyp(q.x - p.x, q.y - p.y); if (d < 9) { dx -= (q.x - p.x) / d * (9 - d) * 0.9; dy -= (q.y - p.y) / d * (9 - d) * 0.5; } });
  const L = hyp(dx, dy) || 1;
  return [dx / L, dy / L];
}
// Through on goal: no outfield defender between him and the goal (in a corridor towards it).
function throughOnGoal(M, s, X, Y) {
  if (dGoal(s, X, Y) > 38) return false;
  const OP = M.sim.P[1 - s], d0 = dGoal(s, X, Y), gy = goalY(s);
  for (let j = 1; j < OP.length; j++) { const q = OP[j]; if (q && dGoal(s, q.x, q.y) < d0 - 0.5 && segD(q.x, q.y, X, Y, PW / 2, gy) < 3 + (d0 - dGoal(s, q.x, q.y)) * 0.15) return false; }
  return true;
}
// A one-on-one shot: nobody between him and the keeper and nobody on him.
const oneOnOneAt = (M, s, X, Y) => dGoal(s, X, Y) < 18 && blockedBy(M, s, X, Y) === 1 && recvPressure(M, s, X, Y)[0] > 4;
// Players in the way of a shot cut its chance.
function blockedBy(M, s, X, Y) {
  let f = 1;
  M.sim.P[1 - s].forEach((q, j) => {
    if (!q || j === 0) return;
    const d = segD(q.x, q.y, X, Y, PW / 2, goalY(s)), u = SD.u;
    if (u > 0.05 && u < 0.95 && d < 1.6) f *= 0.72;
  });
  return f;
}
// Second-last defender line in side s's attack, as a Y (with the ball and the halfway line).
function offsideY(M, s) {
  const sim = M.sim, c = sim.offC || (sim.offC = [null, null, -1]);
  if (c[2] !== sim.t) { c[0] = c[1] = null; c[2] = sim.t; }
  if (c[s] != null) return c[s];
  return (c[s] = offsideCalc(M, s));
}
function offsideCalc(M, s) {
  // The second-last defender: the two deepest players of the defending side.
  let a = s === 0 ? 1e9 : -1e9, b = a;
  const OP = M.sim.P[1 - s];
  for (let j = 0; j < OP.length; j++) { const q = OP[j]; if (!q) continue; const y = q.y; if (s === 0 ? y < a : y > a) { b = a; a = y; } else if (s === 0 ? y < b : y > b) b = y; }
  let line = Math.abs(b) < 1e8 ? b : goalY(s);
  const half = PL / 2, by = M.sim.B.y;
  return s === 0 ? Math.min(line, by, half) : Math.max(line, by, half);
}
const beyond = (s, Y, line) => (s === 0 ? Y < line - 0.3 : Y > line + 0.3);
const offsideNow = (M, s, j) => { const q = P_(M, s, j); return q && beyond(s, q.y, offsideY(M, s)); };

function playOption(M, s, i, op, press) {
  const S = M.sides[s], sim = M.sim, B = sim.B, p = P_(M, s, i);
  if (op.k === 'shot') return shoot(M, s, i, { press });
  if (op.k === 'cross') return crossBall(M, s, i, {});
  if (op.k === 'carry') { B.hx = op.cx; B.hy = op.cy; B.dt = op.thru1 ? 0.5 : decideDelay(M, s, i, ENG.touch + 0.6); p.carry = 1; p.takeOn = !!op.takeOn; return; }
  if (op.k === 'round') return roundKeeper(M, s, i);
  if (op.k === 'touch') return kick(M, s, i, 'clear', p.x < PW / 2 ? -3 : PW + 3, p.y + fwdY(s) * rf(2, 10), -1, { air: false, err: 1 });
  if (op.k === 'clear') {
    // Away from danger, towards the outlet if there is one, otherwise up the near channel.
    const out = directOutlet(M, s, i), [px] = toOwn(s, p.x, p.y);
    const [tx, ty] = out ? [out.x, out.y] : toWorld(s, px < 0.5 ? rf(0.08, 0.3) : rf(0.7, 0.92), rf(0.3, 0.5));
    return kick(M, s, i, 'clear', tx, ty, out ? out.j : -1, { air: true, err: 6 });
  }
  // A pass: off-target by the passer's technique, more so under pressure, on the weaker foot or in the wind.
  const pl = G.players[S.on[i]], len = hyp(op.tx - p.x, op.ty - p.y);
  const weak = pl && pl.foot !== 'Either' && R() < 0.3 ? 1.3 : 1;
  const err = len * (0.035 + (20 - ac(S, i, 'pas')) * 0.0045 + (20 - ac(S, i, 'fir')) * 0.001) * (1 + press * (1.1 - ac(S, i, 'cmp') * 0.04)) * weak * (op.k === 'long' ? 1.3 / M.mod.wind : 1) * ((S.tempo ?? 1) === 2 ? 1.08 : 1);
  S.st.pa++; pstat(S, i, 'pa'); if (op.k === 'long') S.st.lp = (S.st.lp || 0) + 1;
  const tgt = P_(M, s, op.j), off = op.k === 'thru' || (tgt && beyond(s, tgt.y, offsideY(M, s)));
  kick(M, s, i, op.k, op.tx, op.ty, op.j, { air: op.k === 'long', err, off: off && tgt ? beyond(s, tgt.y, offsideY(M, s)) : false });
}
// The ball leaves the player's foot: speed and height by the kind of ball, aimed with some error.
function kick(M, s, i, k, tx, ty, j, o = {}) {
  const sim = M.sim, B = sim.B, p = P_(M, s, i);
  let e = o.err || 0, ex = tx + gauss() * e * 0.6, ey = ty + gauss() * e * 0.6;
  // Now and then a ball is mishit: overhit or sliced well off line (more likely for a poor or hurried kick,
  // and for crosses). These are what run out for throw-ins and goal kicks in a real match.
  if (k !== 'shot' && R() < clamp(0.035 + e * 0.006 + (k === 'cross' ? 0.1 : 0), 0.03, 0.22)) {
    const L0 = hyp(tx - p.x, ty - p.y) || 1, over = rf(0.15, 0.5) * L0 + 3;
    ex = tx + (tx - p.x) / L0 * over + gauss() * L0 * 0.18; ey = ty + (ty - p.y) / L0 * over + gauss() * L0 * 0.18;
  }
  const len = hyp(ex - p.x, ey - p.y) || 1;
  const sp = k === 'shot' ? 26 : k === 'clear' ? 24 : o.air ? clamp(14 + len * 0.18, 16, 26) : clamp(9 + len * 0.42, 10, 22);
  B.os = -1; B.oi = -1; B.x = p.x; B.y = p.y; B.z = o.air ? 0.1 : 0;
  B.vx = (ex - p.x) / len * sp; B.vy = (ey - p.y) / len * sp;
  const flight = len / sp;
  B.vz = o.air ? 9.8 * flight / 2 : 0;
  B.fl = { k, s, i, j, tx: ex, ty: ey, t0: sim.t, arr: sim.t + flight, off: !!o.off, air: !!o.air, len, xg: o.xg || 0, aid: o.aid || null, sp,
    linesBroken: INTENT_PASSES.has(k) ? brokenLines(M, s, p.y, ey) : 0 };
  B.ls = s; B.li = i; p.carry = 0; p.takeOn = 0;
  // Offside: every team-mate beyond the second-last defender (and the ball) when the ball is played.
  B.offS = s; B.offSet = 0;
  if (k !== 'shot') { const line = offsideY(M, s), P = sim.P[s]; for (let m = 1; m < P.length; m++) { const q = P[m]; if (q && m !== i && beyond(s, q.y, line)) B.offSet |= 1 << m; } }
  if (j >= 0) { const r = P_(M, s, j); if (r) { r.tx = ex; r.ty = ey; r.want = sim.t + flight + 0.5; } }
  if (o.air && (k === 'long' || k === 'clear')) secondBallSupport(M, s, i, j, ex, ey, flight);
}

// Taking the ball round the keeper: past him and an open goal, or he smothers it (now and then a penalty).
// 4.7: one of the back line (in the out-of-possession shape): it steps up and drops together at full speed.
const backLine = (S, i) => LINE[FORMATIONS[S.oop][(S.map || shapeMap(S.ip, S.oop))[i]][0]] === 1;
// Rounding the keeper (7.3): Dribbling, Agility and Composure against his One on Ones and Agility, at half the usual
// weight per attribute point: even a great dribbler fails often against a keeper set at his feet.
const roundSkill = (S, i) => 10 + (avg2(S, i, [['dri', 0.45], ['agi', 0.35], ['cmp', 0.2]]) - 10) / 2;
const roundStop = O => 10 + (avg2(O, 0, [['one', 0.7], ['agi', 0.3]]) - 10) / 2;
function roundKeeper(M, s, i) {
  const S = M.sides[s], O = M.sides[1 - s], p = P_(M, s, i), g = P_(M, 1 - s, 0);
  if (!g) return shoot(M, s, i, {});
  pstat(S, i, 'da');
  if (duelRoll(M, 'round', 0.05, roundSkill(S, i), roundStop(O), 0.35, 1, S, O)) {
    pstat(S, i, 'dw'); bump(S, i, 0.1);
    // 7.3: going round him takes the striker wide; the angle narrows (the shot is read as it is, 7.5).
    const side = p.x < g.x ? -1 : 1;
    p.x = clamp(g.x + side * rf(4, 6), 2, PW - 2); p.y = g.y + fwdY(s) * 0.5; g.cool = 1.5;
    return shoot(M, s, i, { open: true });
  }
  if (R() < 0.08 * M.mod.foul) return foul(M, s, i, 1 - s, 0);
  if (R() < 0.35) { // pushed too wide: the ball runs away towards the byline
    looseBall(M); const B = M.sim.B; B.vx = (p.x < PW / 2 ? -1 : 1) * rf(3, 6); B.vy = fwdY(s) * rf(3, 6); return;
  }
  pstat(O, 0, 'sv'); bump(O, 0, 0.2);
  giveBall(M, 1 - s, 0);
}

// A lofted pass has to be won in the air: the receiver against the nearest defender at the landing point
// (Heading, Jumping via height, Strength through aerialAt), so a marked target is a riskier ball than a free one.
function aerialContest(M, s, j, x, y) {
  const OP = M.sim.P[1 - s];
  let dj = -1, dd = 99;
  for (let k = 1; k < OP.length; k++) { const z = OP[k]; if (z) { const d = hyp(z.x - x, z.y - y); if (d < dd) { dd = d; dj = k; } } }
  if (dj < 0 || dd > 5) return 0;
  return (1 - sigm((aerialAt(M.sides[s], j) - aerialAt(M.sides[1 - s], dj)) / 3)) * 0.6 * (1 - dd / 5);
}
// The outlet for a ball forward from deep (rulebook 9.5, 1.3): the target man or a forward/runner well up the
// pitch, preferring height and Heading; the landing point is just ahead of him. win: chance his side wins the
// first contact or the knock-down (his aerial ability against the nearest defender, plus team-mates near it).
function directOutlet(M, s, i) {
  const S = M.sides[s], O = M.sides[1 - s], P = M.sim.P[s], OP = M.sim.P[1 - s], p = P[i], fw = fwdY(s);
  let best = null;
  for (let j = 1; j < P.length; j++) {
    const q = P[j];
    if (!q || j === i || (q.y - p.y) * fw < 25 || hyp(q.x - p.x, q.y - p.y) > 62 || offsideNow(M, s, j)) continue;
    const role = LINE[FORMATIONS[S.ip][j][0]];
    if (role < 3) continue;
    const x = clamp(q.x + q.vx * 0.8, 4, PW - 4), y = q.y + fw * 3;
    let dj = -1, dd = 99;
    for (let k = 1; k < OP.length; k++) { const z = OP[k]; if (z) { const d = hyp(z.x - x, z.y - y); if (d < dd) { dd = d; dj = k; } } }
    const air = aerialAt(S, j) * (1 + bh(S, j, 'aer') * 0.3) + clamp(dd - 2, 0, 6) - (dj > 0 ? aerialAt(O, dj) : 0);
    const help = P.filter((z, n) => z && n && n !== j && n !== i && hyp(z.x - x, z.y - y) < 18).length;
    const win = clamp(sigm(air / 3) * 0.75 + help * 0.05, 0.1, 0.85), v = win * (1 + bh(S, j, 'aer') * 0.3 + bh(S, j, 'hold') * 0.2);
    if (!best || v > best.v) best = { j, x, y, win, v };
  }
  return best;
}
// When the ball is played long, two or three nearby team-mates go for the knock-down and the second ball:
// one behind the landing point, one to the side and a runner beyond it (rulebook 9.5: midfielders win the
// second balls, runners attack the flick-on). The rest keep their shape.
function secondBallSupport(M, s, i, j, x, y, flight) {
  const sim = M.sim, P = sim.P[s], fw = fwdY(s), S = M.sides[s];
  const near = P.map((q, n) => q && n && n !== i && n !== j ? { n, d: hyp(q.x - x, q.y - y), role: LINE[FORMATIONS[S.ip][n][0]] } : null)
    .filter(z => z && z.d < 45 && z.role >= 2).sort((a, b) => a.d - b.d).slice(0, 3);
  const side = x < PW / 2 ? 1 : -1;
  const spots = [[0, -6], [side * 6, -2], [-side * 4, 7]]; // behind, inside, beyond
  near.forEach((z, k) => {
    const q = P[z.n], [dx, dy] = spots[k];
    q.tx = clamp(x + dx, 1, PW - 1); q.ty = clamp(y + dy * fw, 1, PL - 1);
    q.sup = sim.t + flight + 2.5; q.run = sim.t + flight + 1;
  });
  // The defender nearest the landing point attacks the ball (a centre-back challenging the target man).
  {
    const OP0 = sim.P[1 - s];
    let dj = -1, dd = 30;
    for (let n = 1; n < OP0.length; n++) { const q = OP0[n]; if (q) { const d = hyp(q.x - x, q.y - y); if (d < dd) { dd = d; dj = n; } } }
    if (dj > 0) { const q = OP0[dj]; q.tx = x; q.ty = clamp(y - fw * 0.8, 1, PL - 1); q.sup = sim.t + flight + 1; q.run = sim.t + flight + 1; }
  }
  // The defending side reacts too: its two nearest midfielders drop on to the landing zone, goal-side, to
  // contest the second ball (Anticipation reads it earlier: a closer starting spot).
  const O = M.sides[1 - s], OP = sim.P[1 - s];
  OP.map((q, n) => q && n ? { n, d: hyp(q.x - x, q.y - y), role: LINE[FORMATIONS[O.ip][n][0]] } : null)
    .filter(z => z && z.d < 35 && z.role >= 2 && z.role <= 3).sort((a, b) => a.d - b.d).slice(0, 2).forEach((z, k) => {
      const q = OP[z.n], read = clamp((ac(O, z.n, 'ant') - 8) * 0.4, 0, 4);
      q.tx = clamp(x + (k ? -side : side) * 4, 1, PW - 1); q.ty = clamp(y - fw * (6 - read), 1, PL - 1); q.sup = sim.t + flight + 2; q.run = sim.t + flight + 1;
    });
}

/* ---------- shots ---------- */
// Rulebook 7.6: the kind of shot and the aim point (ax across the goal from its centre, az height), away from the
// keeper. Only how it looks and where the ball goes; the chance of a goal is the shot model's.
function shotType(M, s, i, p, o, oneOnOne, press) {
  const S = M.sides[s], g = P_(M, 1 - s, 0), d = dGoal(s, p.x, p.y), cmp = ac(S, i, 'cmp'), fla = ac(S, i, 'fla'), fin = ac(S, i, 'fin');
  const gOff = g ? g.x - PW / 2 : 0, far = p.x < PW / 2 ? 1 : -1, away = Math.abs(gOff) > 0.6 ? -Math.sign(gOff) : far;
  if (o.pen) return { kind: 'penalty', ax: (R() < 0.5 ? -1 : 1) * rf(1.4, 3.3), az: rf(0, 1.9) };
  if (o.fk) return { kind: 'free kick', ax: away * rf(2, 3.4), az: rf(1.4, 2.35) };
  if (o.head) return { kind: 'header', ax: away * rf(0.8, 3.3), az: rf(0.1, 1.6) };
  if (o.open) return { kind: 'open goal', ax: rf(-1.5, 1.5), az: rf(0, 0.6) };
  const gkOut = g ? Math.abs(g.y - goalY(s)) : 0;
  if (oneOnOne && gkOut > 4 && R() < clamp(0.15 + (cmp + fla - 24) * 0.03, 0.05, 0.5)) return { kind: 'chip', ax: rf(-1.2, 1.2), az: rf(1.7, 2.3) };
  if (d > 20) return fla >= 13 && R() < 0.5 ? { kind: 'curler', ax: away * rf(2.4, 3.4), az: rf(1.2, 2.35) } : { kind: 'long', ax: away * rf(1.5, 3.4), az: rf(0.2, 2.2) };
  if (d < 8) return { kind: 'power', ax: rf(-2.6, 2.6), az: rf(0.5, 2.3) };
  if (R() < clamp(0.3 + (cmp - 10) * 0.04 + (fin - 10) * 0.02 - press * 0.3, 0.1, 0.8)) return { kind: 'placed', ax: far * rf(2.3, 3.3), az: rf(0.1, 0.8) };
  return { kind: 'driven', ax: away * rf(1.4, 3.3), az: rf(0, 0.5) };
}
function shoot(M, s, i, o = {}) {
  const S = M.sides[s], O = M.sides[1 - s], sim = M.sim, p = P_(M, s, i), pl = G.players[S.on[i]];
  if (!p || !pl) return looseBall(M);
  const press = o.press || 0;
  let xg = o.pen ? 0.76 : chanceAt(M, s, p.x, p.y, { press, head: o.head, fo: o.head ? 0 : faceOff(p, PW / 2, goalY(s)) }).xg; // 7.5, 1c
  if (o.head && o.del) xg *= 0.8 + o.del / 50;
  if (o.fk) xg = clamp(0.06 * Math.exp(-(dGoal(s, p.x, p.y) - 18) / 12), 0.02, 0.1);
  // A one-on-one: nobody between him and the keeper.
  const oneOnOne = !o.pen && !o.head && !o.fk && oneOnOneAt(M, s, p.x, p.y);
  const weak = !o.head && !o.pen && pl.foot !== 'Either' && R() < 0.25;
  if (weak) xg *= 0.8;
  if (!o.pen) xg = clamp(xg * ENG.xg * tune('xgScale') * M.mod.xg * (s === 0 ? tune('homeShot') * M.mod.home : 1) * (1 + S.boost - O.guard), 0.01, 0.85);
  S.st.sh++; S.st.xg += xg; pstat(S, i, 'sh');
  if (o.pen) S.st.pk++;
  const aid = o.aid != null ? o.aid : (sim.lastPass && sim.lastPass.s === s && sim.t - sim.lastPass.t < 6 && sim.lastPass.id !== pl.id ? sim.lastPass.id : null);
  if (aid && S.on.includes(aid)) { pstat(S, S.on.indexOf(aid), 'kp'); bumpRating(S, aid, 0.08); }
  noteThreat(O, pl.id, aid, xg);
  // Outcome: blocked, goal, saved or off target. Finishing, Composure and the keeper decide.
  const ev = evt(M, { side: s, t: 'shot', pid: pl.id, xg, pen: !!o.pen, sp: !!o.head, ck: !!o.ck, fk: !!o.fk, aid: aid || null, key: true });
  mark(M, 'shot', s, { xg });
  const gk = P_(M, 1 - s, 0), gkp = G.players[O.on[0]];
  let blk = -1;
  if (!o.pen && !o.fk) M.sim.P[1 - s].forEach((q, j) => { if (q && j && blk < 0) { const [d, u] = segDist(q.x, q.y, p.x, p.y, PW / 2, goalY(s)); if (u > 0.05 && u < 0.9 && d < 1.2 && R() < 0.55 * (ac(O, j, 'pos') + ac(O, j, 'ant')) / 24) blk = j; } });
  const gy = goalY(s), shot = shotType(M, s, i, p, o, oneOnOne, press);
  ev.kind = shot.kind;
  if (blk > 0) {
    const q = P_(M, 1 - s, blk);
    ev.t = 'miss'; ev.block = true; pstat(O, blk, 'blk'); bump(O, blk, 0.1);
    kick(M, s, i, 'shot', q.x, q.y, -1, {});
    M.sim.B.fl.res = 'block'; M.sim.B.fl.bj = blk; M.sim.B.fl.ev = ev;
    return;
  }
  const fin = o.head ? (aerialAt(S, i) + ac(S, i, 'fin')) / 2 : o.fk ? fkSkill(pl) : ac(S, i, 'fin');
  const gkv = o.open ? 30 : oneOnOne ? ac(O, 0, 'one') * 5 : O.u.gk;
  const pg = xg * ENG.fin * (1 + (fin - 12) / 50) * // rule 11: finishing is worth about +/-12% across the range
     (1.25 - gkv / 250) * (0.92 + 0.08 * ac(S, i, 'cmp') / 10) * (o.open ? 1 : 1 - gkReach(gkp));
  let res;
  if (R() < pg) res = 'goal';
  else if (R() < clamp(0.25 + xg * 0.6, 0, 0.95)) res = 'save';
  else res = 'miss';
  // 7.6: where the ball goes matches what happened: inside the frame for a goal or a save, wide of a post or over the
  // bar for a miss.
  let { ax, az } = shot;
  if (res === 'miss') { if (['power', 'long', 'curler', 'free kick', 'chip'].includes(shot.kind) && R() < 0.5) { az = rf(2.6, 4.5); ev.over = true; } else ax = (Math.sign(ax) || (R() < 0.5 ? -1 : 1)) * rf(3.9, 7.5); }
  ev.aim = Math.abs(ax) < 1.2 ? 'central' : ((ax > 0) === (p.x > PW / 2) ? 'near post' : 'far post');
  kick(M, s, i, 'shot', PW / 2 + ax, gy - fwdY(s) * (res === 'save' ? 0.8 : -1.5), -1, {});
  Object.assign(M.sim.B.fl, { res, ev, xg, aid, ax, az, kind: shot.kind });
  mark(M, 'sfx', s, { kind: shot.kind, ax, az, res, x0: p.x, y0: p.y, tx: M.sim.B.fl.tx, ty: M.sim.B.fl.ty, who: i, flight: M.sim.B.fl.arr - M.sim.t, aim: ev.aim });
  if (o.head) M.sim.B.vz = 2;
}
// The shot arrives: goal, save (held, parried or turned behind), or wide (goal kick, sometimes a deflection for a corner).
function shotArrives(M, fl) {
  const s = fl.s, S = M.sides[s], O = M.sides[1 - s], ev = fl.ev, i = fl.i, pid = ev.pid;
  if (fl.res === 'goal') {
    S.st.g++; S.st.sot++; pstat(S, i, 'sot');
    if (ev.pen) S.st.pkg++;
    noteThreat(O, pid, null, 0, true);
    ev.t = 'goal';
    S.goals.push({ min: M.min, pid, aid: ev.aid, pen: !!ev.pen });
    moodSwing(S, 'all', 4); moodSwing(S, pid, 5); if (ev.aid) moodSwing(S, ev.aid, 3);
    moodSwing(O, 'all', -4); moodSwing(O, O.on[0], -3);
    bumpRating(S, pid, ev.pen ? 0.6 : 1.0); bumpRating(S, ev.aid, 0.6);
    S.on.forEach(id => bumpRating(S, id, 0.05));
    onPitch(O).forEach(z => bumpRating(O, z.p.id, z.pos === 'GK' ? -0.35 : LINE[z.pos] <= 2 ? -0.22 : -0.05));
    mark(M, 'goal', s);
    M.sim.celebrate = 35; // celebration and the walk back for the kick-off
    return kickOff(M, 1 - s);
  }
  if ((fl.res === 'save' || fl.res === 'goal') && fl.ax != null) { // 7.6: the keeper ends up where he dived (beaten: short of it)
    const g = P_(M, 1 - s, 0);
    if (g) { g.x = clamp(g.x + (PW / 2 + fl.ax * (fl.res === 'save' ? 0.95 : 0.8) - g.x) * (fl.res === 'save' ? 1 : 0.75), PW / 2 - 4, PW / 2 + 4); g.y = goalY(s) - fwdY(s) * 0.8; g.vx = g.vy = 0; g.cool = 0.8; }
  }
  if (fl.res === 'save') {
    S.st.sot++; pstat(S, i, 'sot'); pstat(O, 0, 'sv');
    if (ev.xg > 0.3) { moodSwing(O, O.on[0], 4); moodSwing(S, pid, -2); }
    ev.t = 'save'; bumpRating(S, pid, 0.1); bumpRating(O, O.on[0], 0.15 + ev.xg * 0.5);
    const hold = R() < clamp(0.45 + (ac(O, 0, 'han') - 10) * 0.03 - ev.xg * 0.4, 0.1, 0.85);
    if (hold) return giveBall(M, 1 - s, 0);
    if (R() < 0.62) { ev.corner = true; return setRestart(M, 'ck', s, R() < 0.5 ? 0.5 : PW - 0.5, goalY(s)); }
    const g = P_(M, 1 - s, 0), B = M.sim.B;
    B.os = -1; B.fl = null; B.x = g ? g.x : PW / 2; B.y = goalY(s) - fwdY(s) * 2; B.vx = rf(-9, 9); B.vy = -fwdY(s) * rf(4, 9); B.vz = 0; // parried into play
    return;
  }
  if (ev.xg > 0.3 || ev.pen) moodSwing(S, pid, ev.pen ? -7 : -3);
  ev.t = 'miss'; bumpRating(S, pid, -0.05);
  if (R() < 0.12) { ev.corner = true; return setRestart(M, 'ck', s, fl.tx < PW / 2 ? 0.5 : PW - 0.5, goalY(s)); }
  setRestart(M, 'gk', 1 - s, PW / 2 + rf(-9, 9), goalY(s) - fwdY(s) * 5.5);
}

/* ---------- crosses and headers ---------- */
function crossBall(M, s, i, o) {
  // A defender close to the crosser can block it: most go behind for a corner, the rest loose.
  if (!o.ck && !o.fk) {
    const p0 = P_(M, s, i), O = M.sides[1 - s];
    const bl = M.sim.P[1 - s].findIndex((q, j) => q && j && hyp(q.x - p0.x, q.y - p0.y) < 2.2);
    if (bl > 0 && R() < 0.28 + (ac(O, bl, 'pos') - 10) * 0.015) {
      pstat(O, bl, 'blk'); M.sides[s].st.cr = (M.sides[s].st.cr || 0) + 1;
      if (R() < 0.6) return setRestart(M, 'ck', s, p0.x < PW / 2 ? 0.5 : PW - 0.5, goalY(s));
      const B = M.sim.B; looseBall(M); B.x = p0.x; B.y = p0.y; B.vx = rf(-7, 7); B.vy = -fwdY(s) * rf(2, 8); B.ls = 1 - s; B.li = bl; return;
    }
  }
  const S = M.sides[s], TP = M.sim.P[s], p = P_(M, s, i);
  // 7.2: the cross is aimed at a space a runner is attacking (near post whipped, penalty spot, far post floated),
  // chosen by the runner's aerial ability, how close he is to arriving and how crowded the space is.
  if (S._box && S._box.spots && !o.ck && !o.fk) {
    let pick = null, pv = -1e9;
    for (const sp of S._box.spots) {
      const q = TP[sp.i];
      if (!q || sp.i === i || sp.k === 'edge') continue;
      const crowd = M.sim.P[1 - s].filter((z, n) => z && n && hyp(z.x - sp.x, z.y - sp.y) < 3).length;
      const v = aerialAt(S, sp.i) * (1 + bh(S, sp.i, 'aer')) - hyp(q.x - sp.x, q.y - sp.y) * 0.4 - crowd * 2.5 + R() * 3;
      if (v > pv) { pv = v; pick = sp; }
    }
    if (pick) {
      const del = ac(S, i, 'cro'), r = TP[pick.i];
      S.st.cr = (S.st.cr || 0) + 1; pstat(S, i, 'cr'); S.st.pa++; pstat(S, i, 'pa');
      kick(M, s, i, 'cross', pick.x, pick.y, pick.i, { air: true, err: (20 - del) * 0.35 + 1.5 });
      Object.assign(M.sim.B.fl, { del, ck: false, fk: false });
      attackTheBox(M, s, S._box.spots, i);
      return;
    }
  }
  // Otherwise: the best header of the ball among team-mates in the box, else the penalty spot area.
  let best = -1, bv = -1;
  TP.forEach((q, j) => { if (!q || j === i || j === 0 || offsideNow(M, s, j)) return; const [x, y] = toOwn(s, q.x, q.y); if (y < 0.24 && Math.abs(x - 0.5) < 0.26) { const v = aerialAt(S, j) * (1 + bh(S, j, 'aer')) + R() * 4; if (v > bv) { bv = v; best = j; } } });
  const tq = best > 0 ? P_(M, s, best) : null, [tx, ty] = tq ? [clamp(tq.x, PW * 0.3, PW * 0.7), tq.y] : toWorld(s, rf(0.4, 0.6), rf(0.07, 0.13));
  const del = ac(S, i, 'cro');
  S.st.cr = (S.st.cr || 0) + 1; pstat(S, i, 'cr'); S.st.pa++; pstat(S, i, 'pa');
  kick(M, s, i, 'cross', tx, ty, best, { air: true, err: (20 - del) * 0.35 + 1.5 });
  Object.assign(M.sim.B.fl, { del, ck: !!o.ck, fk: !!o.fk });
}
// A high ball comes down: the best-placed players from both sides challenge in the air.
function airDuel(M, fl) {
  const B = M.sim.B, s = fl.s, o = 1 - s, S = M.sides[s], O = M.sides[o];
  const near = t => M.sim.P[t].map((q, j) => (q ? [j, hyp(q.x - B.x, q.y - B.y)] : null)).filter(x => x && x[1] < 4.5 && (x[0] > 0 || t === o) && !(t === s && B.offS === s && (B.offSet & (1 << x[0])))).sort((a, b) => a[1] - b[1]); // an offside player stays out of it
  const A = near(s), D = near(o);
  // The keeper comes for crosses into the six-yard box.
  const gk = P_(M, o, 0), [, gyOwn] = toOwn(s, B.x, B.y);
  if (gk && fl.k === 'cross' && gyOwn < 0.11 && R() < 0.22 * ac(O, 0, 'han') / 12) { pstat(O, 0, 'cl'); return giveBall(M, o, 0); }
  if (!A.length && !D.length) return; // nobody there: it drops
  const aScore = A.length ? aerialAt(S, A[0][0]) * 0.7 + ac(S, A[0][0], 'str') * 0.2 + ac(S, A[0][0], 'otb') * 0.1 - A[0][1] * 0.8 + ((fl.del || 10) - 10) * 0.3 : -9;
  const dScore = D.length ? aerialAt(O, D[0][0]) * 0.7 + ac(O, D[0][0], 'str') * 0.15 + ac(O, D[0][0], 'mar') * 0.2 - D[0][1] * 0.8 : -9;
  const win = A.length && (!D.length || duelRoll(M, 'aerial', toOwn(s, B.x, B.y)[1], aScore + 10, dScore + 10, 0.45, 1, S, O));
  if (!win) {
    const j = D[0][0];
    pstat(O, j, 'aer'); bump(O, j, 0.04);
    // Clearing header.
    const [tx, ty] = toWorld(s, clamp(toOwn(s, B.x, B.y)[0] + rf(-0.25, 0.25), 0.1, 0.9), rf(0.3, 0.5));
    giveBall(M, o, j); return kick(M, o, j, 'clear', tx, ty, -1, { air: true, err: 5 });
  }
  const j = A[0][0], [, yo] = toOwn(s, B.x, B.y);
  if (yo < 0.2 && Math.abs(B.x - PW / 2) < 14) { giveBall(M, s, j); return shoot(M, s, j, { head: true, del: fl.del, aid: S.on[fl.i], ck: fl.ck, fk: fl.fk }); }
  // Won further out: knock it down to the nearest team-mate (a flick-on for a runner).
  giveBall(M, s, j);
}

/* ---------- the ball each tick ---------- */
function ballTick(M) {
  const sim = M.sim, B = sim.B, dt = TICK;
  const own = owner(M);
  if (own) {
    // Carrying: the ball stays at the player's feet, a little ahead.
    const sp = hyp(own.vx, own.vy) || 1;
    B.x = own.x + own.vx / sp * 0.6; B.y = own.y + own.vy / sp * 0.6; B.z = 0;
    return;
  }
  const fl = B.fl, x0 = B.x, y0 = B.y;
  // Move, with gravity for lofted balls and friction on the ground.
  const steps = 3, h = dt / steps;
  for (let k = 0; k < steps; k++) {
    B.x += B.vx * h; B.y += B.vy * h;
    if (B.z > 0 || B.vz > 0) { B.z += B.vz * h; B.vz -= 9.8 * h; if (B.z <= 0) { B.z = 0; B.vz = 0; B.vx *= 0.45; B.vy *= 0.45; if (fl && fl.air && !fl.landed) { fl.landed = true; if (fl.k === 'cross' || fl.k === 'long' || fl.k === 'clear') { airDuel(M, fl); if (sim.B.fl !== fl) return; } } } }
    else { const f = Math.max(0, 1 - 0.55 * h); B.vx *= f; B.vy *= f; }
    if (fl && fl.k === 'shot') { if (sim.t - dt + h * (k + 1) >= fl.arr) { B.x = fl.tx; B.y = fl.ty; B.z = 0; B.fl = null; return fl.res === 'block' ? blockArrives(M, fl) : shotArrives(M, fl); } continue; }
    if (outOfPlay(M)) return;
  }
  if (fl && fl.k === 'shot') return;
  // Who can get to the ball's path this tick, in the order the ball meets them.
  const sp = hyp(B.vx, B.vy);
  if (B.z < 1.8) {
    const cand = [];
    for (let t = 0; t < 2; t++) { const P = sim.P[t]; for (let j = 0; j < P.length; j++) { const q = P[j]; if (!q) continue; const d = segD(q.x, q.y, x0, y0, B.x, B.y); if (d < 2.4) cand.push([t, j, d, SD.u]); } }
    cand.sort((a, b) => a[3] - b[3] || a[2] - b[2]);
    const at = u => { B.x = x0 + (B.x - x0) * u; B.y = y0 + (B.y - y0) * u; };
    for (const [t, j, d, u] of cand) {
      const S = M.sides[t];
      if (fl && t === fl.s && j === fl.i && sim.t - fl.t0 < 0.8) continue; // just kicked it
      if (fl && t === fl.s) { // a team-mate: controls it if it is his ball or it comes close enough
        if (j !== fl.j && B.offS === t && (B.offSet & (1 << j))) continue; // offside: he leaves it
        if (j === fl.j || d < 1.2 || sp < 6) { at(u); return receive(M, t, j, fl, d); }
        continue;
      }
      if (fl && t !== fl.s) { // an opponent in the path
        const reach = 0.8 + (ac(S, j, 'ant') + ac(S, j, 'pos')) * 0.025;
        if (d > reach || (fl.tried & (1 << j))) continue;
        fl.tried = (fl.tried || 0) | (1 << j); // one go each
        // Right at the passer's feet it is a block, which is harder than reading the pass further on.
        const early = Math.min(1, (sim.t - fl.t0) * 1.5 + 0.25);
        const ok = duelRoll(M, 'int', toOwn(fl.s, B.x, B.y)[1], ac(S, j, 'ant') * 0.5 + ac(S, j, 'pos') * 0.3 + ac(S, j, 'agi') * 0.2, 7 + sp * 0.3 + d * 2, 0.35 * early * ENG.intercept, 1, S, M.sides[fl.s]);
        if (ok) { at(u); pstat(S, j, 'int'); bump(S, j, 0.05); bump(M.sides[fl.s], fl.i, -0.03); return controlOrLoose(M, t, j, sp, true); }
        continue;
      }
      // A loose ball: first to it.
      if (!fl && d < 1.4) {
        if (B.offS === t && (B.offSet & (1 << j))) continue; // offside: he leaves it
        at(u);
        const rival = cand.find(c => c[0] !== t && c[2] < 1.8);
        if (rival) {
          const T2 = M.sides[rival[0]];
          const won = duelRoll(M, 'loose', toOwn(t, B.x, B.y)[1], ac(S, j, 'str') * 0.4 + ac(S, j, 'agi') * 0.3 + ac(S, j, 'ant') * 0.3 - d, ac(T2, rival[1], 'str') * 0.4 + ac(T2, rival[1], 'agi') * 0.3 + ac(T2, rival[1], 'ant') * 0.3 - rival[2], 0.5, 1, S, T2);
          const box = toOwn(t, B.x, B.y)[1] < 0.16 && Math.abs(B.x - PW / 2) < 20;
          if (!won) { if (sim.poss !== rival[0] && R() < 0.14 * (box ? 0.04 : 1) * M.mod.foul * ENG.foul) return foul(M, t, j, rival[0], rival[1]); return controlOrLoose(M, rival[0], rival[1], sp, false); }
        }
        return controlOrLoose(M, t, j, sp, false);
      }
    }
  }
  if (fl && sp < 2.5 && B.z === 0) B.fl = null; // came to rest: a loose ball
}
function blockArrives(M, fl) {
  const s = fl.s, O = M.sides[1 - s], B = M.sim.B, ev = fl.ev;
  if (R() < 0.55) { ev.corner = true; return setRestart(M, 'ck', s, B.x < PW / 2 ? 0.5 : PW - 0.5, goalY(s)); }
  B.os = -1; B.fl = null; B.vx = rf(-8, 8); B.vy = -fwdY(s) * rf(3, 10); B.vz = 0; // loose after the block
}
// A team-mate gets to the pass: first touch under pressure decides if he keeps it.
function receive(M, s, j, fl, d) {
  const S = M.sides[s], sim = M.sim, B = sim.B;
  if (B.offSet && B.offS === s && (B.offSet & (1 << j))) { B.offSet = 0; return offside(M, s, j, fl); }
  const [, press] = recvPressure(M, s, B.x, B.y), [, mk] = pressureOn(M, s, j);
  const sp = hyp(B.vx, B.vy), air = B.z > 0.8, mq = mk > 0 ? (ac(M.sides[1 - s], mk, 'mar') - 10) * 0.03 : 0; // his marker's Marking
  const ctrl = clamp(0.93 + (ac(S, j, 'fir') - 10) * 0.012 - press * (0.13 + mq) - Math.max(0, sp - 16) * 0.012 - (air ? 0.06 : 0), 0.45, 0.99);
  const roll = R();
  if (roll < ctrl) {
    pressTrigger(M, s, j, fl, roll > ctrl - 0.15);
    if (fl && fl.i != null && fl.j === j) { S.st.pc++; pstat(S, fl.i, 'pc'); if (toOwn(s, B.x, B.y)[1] < 0.3) bump(S, fl.i, 0.03); sim.lastPass = { s, id: S.on[fl.i], t: sim.t }; }
    if (fl && fl.k === 'thru') mark(M, 'chance', s);
    giveBall(M, s, j);
    if (fl?.linesBroken && fl.j === j) sim.momentum = { s, until: sim.t + 6 };
    return;
  }
  // Heavy touch: the ball bounces off him a few metres (out of play if he is on the line).
  B.fl = null; { const a = Math.atan2(B.vy, B.vx) + rf(-1.2, 1.2), v = rf(3, 7); B.vx = Math.cos(a) * v; B.vy = Math.sin(a) * v; }
}
// A pressing trigger for the other side: a back pass, a poor touch, a receiver facing his own goal, the ball on
// the touchline. The presser's Work Rate and the receiver's First Touch decide whether it is pounced on.
function pressTrigger(M, s, j, fl, poor) {
  const sim = M.sim, B = sim.B, r = P_(M, s, j), o = 1 - s;
  if (!r) return;
  let c = poor ? 1 : 0, back = false;
  if (fl && fl.i != null) { const z = P_(M, s, fl.i); if (z) {
    back = dGoal(s, r.x, r.y) - dGoal(s, z.x, z.y) > 4;
    if (back) c++;
    if (fl.sp < 13 && fl.len > 6 && Math.abs(r.y - z.y) < 3) c++;
  } }
  if (LINE[FORMATIONS[M.sides[s].ip][j][0]] <= 1 && !defensiveOutlet(M, s, j)) c++;
  if (r.vy * fwdY(s) < -1) c++;
  if (B.x < 7 || B.x > PW - 7) c++;
  if (!c) return;
  const [, a] = pressureOn(M, s, j);
  if (a < 0) return;
  if (R() < c * 0.3 * (1 + (ac(M.sides[o], a, 'wor') - 10) * 0.05) * (1 - (ac(M.sides[s], j, 'fir') - 10) * 0.03) * (1 + bh(M.sides[o], a, 'pr') * 0.3)) sim.pt = { o, back, until: sim.t + 2.5 };
}
function controlOrLoose(M, t, j, sp, cut) {
  const S = M.sides[t], B = M.sim.B;
  if (R() < clamp(0.8 + (ac(S, j, 'fir') - 10) * 0.015 - (cut ? sp * 0.012 : 0), 0.35, 0.97)) { giveBall(M, t, j); return; }
  B.fl = null; B.vx = B.vx * rf(-0.5, 0.3) + rf(-6, 6); B.vy = B.vy * rf(-0.5, 0.3) + rf(-6, 6); B.ls = t; B.li = j; // deflected
  if (B.offS !== t) B.offSet = 0;
}
function offside(M, s, j, fl) {
  const S = M.sides[s], O = M.sides[1 - s], B = M.sim.B, pid = S.on[j];
  S.st.off = (S.st.off || 0) + 1; pstat(S, j, 'off');
  evt(M, { side: s, t: 'offside', pid, key: true, line: offsideY(M, s) });
  mark(M, 'offside', s, { line: offsideY(M, s) });
  setRestart(M, 'fk', 1 - s, B.x, B.y);
}
// Out over a line: throw-in, goal kick or corner, by who touched it last.
function outOfPlay(M) {
  const B = M.sim.B, ls = B.ls;
  if (B.x < -0.2 || B.x > PW + 0.2) { setRestart(M, 'thr', 1 - ls, clamp(B.x, 0, PW), clamp(B.y, 1, PL - 1)); return true; }
  if (B.y < -0.2 || B.y > PL + 0.2) {
    const end = B.y < 0 ? 0 : 1, attacking = end === 0 ? 0 : 1; // the side that attacks this end
    if (ls === attacking) setRestart(M, 'gk', 1 - attacking, PW / 2 + rf(-9, 9), end === 0 ? 5.5 : PL - 5.5);
    else setRestart(M, 'ck', attacking, B.x < PW / 2 ? 0.5 : PW - 0.5, end === 0 ? 0 : PL);
    return true;
  }
  return false;
}

/* ---------- challenges and fouls ---------- */
// Defenders close to the player on the ball try to win it: Tackling against Dribbling, Agility and Strength.
function challenges(M) {
  const sim = M.sim, B = sim.B, own = owner(M);
  if (!own || sim.rs) return;
  const s = B.os, i = B.oi, S = M.sides[s], o = 1 - s, O = M.sides[o];
  // 4.5: only a carry the carrier chose to run at a defender is a take-on; carrying past one is not.
  const takeOn = !!(own.carry && own.takeOn);
  sim.P[o].forEach((q, j) => {
    if (!q || j === 0 && toOwn(o, own.x, own.y)[1] < 0.8 || q.cool > 0 || B.os !== s) return;
    const d = hyp(q.x - own.x, q.y - own.y);
    if (d > 2.3) return;
    // A defender goal-side and in his path blocks a take-on: he has to beat him (a take-on every second).
    const front = (q.y - own.y) * fwdY(s) > 0.3 && d < 1.8, wrongWay = faceOff(q, own.x, own.y) > 1.9; // 1c: facing away, he cannot tackle
    if (wrongWay && !(front && takeOn)) return;
    if (front && takeOn && sim.t - (q.toT || -9) >= 1) q.toT = sim.t;
    else if (front && takeOn) return;
    // 4.5: near his own box he delays, and only commits when the ball is exposed (the attacker facing away from
    // goal) or a team-mate covers him; elsewhere he presses to win it.
    const exposed = backness(s, own) > 0.6, covered = sim.P[o].some((c, k) => c && k && k !== j && hyp(c.x - own.x, c.y - own.y) < 7 && (c.y - own.y) * fwdY(s) > (q.y - own.y) * fwdY(s));
    // 4.5: a tackle is a committed duel. A take-on is one; otherwise he commits only when the ball is exposed or a
    // team-mate covers him, and otherwise he jockeys (no duel, nothing counted).
    const go = front && takeOn ? 1 : exposed || covered ? 0.09 * (1 + bh(O, j, 'tk') * 0.4) * (1 + ((O.press ?? 1) - 1) * 0.15) * (own.carry ? 1.3 : 1) : 0;
    if (go < 1 && R() > go * TICK * 2) return;
    // Foul? Rash challenges, poor tacklers, temperament, the weather; fewer in the box.
    const pl = G.players[O.on[j]], inBox = toOwn(s, own.x, own.y)[1] < 0.157 && Math.abs(own.x - PW / 2) < 20;
    const fp = ENG.tackleFoul * tune('foulRate') / 0.18 * ENG.foul * (1 + bh(O, j, 'tk') * 0.5) * (pl && pl.pers === 'Temperamental' ? 1.3 : 1) * (1 + (10 - ac(O, j, 'tck')) / 25) * M.mod.foul * (1 - O.calm * 0.5) * (inBox ? 0.015 : 1);
    if (R() < fp) return foul(M, s, i, o, j);
    const a = avg2(S, i, [['dri', 0.4], ['agi', 0.2], ['str', 0.2 + bh(S, i, 'hold') * 0.2], ['fla', 0.1], ['fir', 0.1]]) + (faceOff(q, own.x, own.y) > 1.6 ? 1.5 : 0); // a defender caught turned is easier to beat
    const dd = avg2(O, j, [['tck', 0.25], ['str', 0.2], ['agi', 0.15], ['ant', 0.25], ['pos', 0.15]]) + bh(O, j, 'tk') * 0.8;
    pstat(S, i, 'da');
    if (duelRoll(M, 'tackle', toOwn(s, own.x, own.y)[1], a + S.boost * 20, dd + O.guard * 20, front && takeOn ? 0.47 : 0.38, 1, S, O)) { // 4.5: take-on a bit under half; a tackle that is on wins three in five
      if (takeOn) pstat(S, i, 'dw'); bump(S, i, 0.05); bump(O, j, -0.03); q.cool = 1.5; // beaten: he needs a moment to turn
      return;
    }
    pstat(O, j, 'tk'); bump(O, j, 0.06); bump(S, i, -0.04);
    if (R() < 0.65) return giveBall(M, o, j);
    looseBall(M); { const a = rf(0, 6.283), v = rf(5, 11); B.vx = Math.cos(a) * v + (B.x < PW / 2 ? -2 : 2); B.vy = Math.sin(a) * v; } B.ls = o; B.li = j; // poked away
  });
}
// A foul by side o's player j on side s's player i: free kick or penalty, and maybe a card.
function foul(M, s, i, o, j) {
  const S = M.sides[s], O = M.sides[o], B = M.sim.B, own = P_(M, s, i) || B, fp = G.players[O.on[j]];
  if (!fp) return;
  O.st.fo++; pstat(O, j, 'fo');
  const ev = evt(M, { side: s, t: 'foul', pid: fp.id, fside: o });
  const [ox, oy] = toOwn(s, own.x, own.y);
  const ycP = 0.15 * (1 + 0.25 * ((O.press ?? 1) - 1)) * (1 - O.calm) * cardMul(fp) * (1 + bh(O, j, 'tk') * 0.35) * (1 - ((O.capLdr ?? 10) - 10) * 0.008) * (oy < 0.35 ? 1.1 : 1);
  if (R() < 0.0015 * cardMul(fp) * 1.4) { sendOff(M, O, fp.id, ev); syncSide(M, o); if (!O.user) fillGapAI(M, O); mark(M, 'card', o, { red: true }); }
  else if (R() < ycP * (O.yc[fp.id] ? 0.35 : 1)) {
    const red = !!O.yc[fp.id];
    if (red) { sendOff(M, O, fp.id, ev); ev.second = true; syncSide(M, o); if (!O.user) fillGapAI(M, O); }
    else { O.yc[fp.id] = 1; O.st.yc++; ev.t = 'yellow'; bumpRating(O, fp.id, -0.3); }
    mark(M, 'card', o, { red });
  }
  const inBox = oy < 0.157 && Math.abs(ox - 0.5) < 0.3;
  if (inBox) { mark(M, 'pen', s); ev.pen = true; return setRestart(M, 'pen', s, PW / 2, goalY(s) - fwdY(s) * 11, ev); }
  setRestart(M, 'fk', s, own.x, own.y, ev);
}

/* ---------- off the ball ---------- */
// Every second: where each player wants to be. In possession: the shape, support near the ball, runs in behind,
// width and late runs into the box. Without it: the shape, pressing the ball, marking and a back line that holds.
function targets(M, all) {
  const sim = M.sim, B = sim.B, own = owner(M);
  for (let s = 0; s < 2; s++) {
    const S = M.sides[s], P = sim.P[s], T = sim.P[1 - s], has = sim.poss === s, ip = FORMATIONS[S.ip];
    if (has && !all) continue; // the side with the ball re-plans every two seconds, the defenders every second
    const bx = s === 0 ? B.x / PW : 1 - B.x / PW, by = s === 0 ? B.y / PL : 1 - B.y / PL;
    const pos = shapeOf(M, s, has, bx, by), carrier = has && own ? B.oi : -1, line = offsideY(M, s), fw = fwdY(s);
    const reserves = new Set([...(S._teamPlan?.rest.back || []), ...(S._teamPlan?.rest.screen || [])]);
    const box = has && own ? boxPlan(M, s, ip, bx, by, carrier, reserves, line) : null;
    if (has) S._box = box;
    const gx = PW / 2, gy = goalY(1 - s); // their own goal
    const unitStep = !has && own ? defensiveLineStep(M, s) : 0;
    S._defStep = unitStep;
    // Run triggers (with the ball): the man on the ball facing forward or unpressed, or a forward dropping deep
    // to leave space behind him; after winning the ball, Counter sends runners at once and Hold Shape waits.
    let trig = false, drop = false, cover = 0;
    const ctr = transition(M,s) === 'ctr', hold = transition(M,s) === 'hold';
    if (has && own) {
      trig = own.vy * fw > 0.5 || pressureOn(M, s, B.oi)[0] < 0.4;
      for (let i = 1; i < P.length; i++) { const q = P[i]; if (!q || i === carrier) continue; if (LINE[ip[i][0]] >= 4 && q.vy * fw < -2) drop = true; if ((q.y - B.y) * fw < 0 && !(q.run > sim.t)) cover++; }
    }
    // 4.7: the back line (its anchors after the unit step) sets the offside line for the whole side.
    let backY = null;
    if (!has) {
      const ys = [], map = S.map || shapeMap(S.ip, S.oop);
      for (let k = 1; k < P.length; k++) if (P[k] && pos[k] && LINE[FORMATIONS[S.oop][map[k]][0]] === 1) ys.push((s === 0 ? pos[k][1] * PL : (1 - pos[k][1]) * PL) + fw * unitStep);
      if (ys.length) backY = ys.reduce((a, b) => a + b, 0) / ys.length;
    }
    for (let i = 0; i < P.length; i++) {
      const p = P[i];
      if (!p || !pos[i] || i === carrier) continue;
      if (B.fl && B.fl.s === s && B.fl.j === i && sim.t < (p.want || 0)) continue; // running onto a pass
      if ((p.sup || 0) > sim.t) continue; // going for the knock-down / second ball
      let X = s === 0 ? pos[i][0] * PW : (1 - pos[i][0]) * PW, Y = s === 0 ? pos[i][1] * PL : (1 - pos[i][1]) * PL;
      const role = LINE[ip[i][0]], defRole = LINE[FORMATIONS[S.oop][(S.map || shapeMap(S.ip, S.oop))[i]][0]];
      if (!has && i) Y += fw * unitStep;
      const lineY = Y;
      if (i === 0) { // keeper: on his line, covering the angle; a sweeper higher behind a high line
        const ky = gy + fw * (1.5 + (by > 0.5 ? 0 : (S.line ?? 1) * 3 + bh(S, 0, 'sweep') * 6));
        // 6.1: on the line from the middle of his goal to the ball, at his depth (at the near post for a tight angle).
        const dep = Math.abs(ky - gy), kx = PW / 2 + (B.x - PW / 2) * dep / Math.max(dep + 0.1, Math.abs(B.y - gy));
        p.tx = has ? X : clamp(kx, PW / 2 - 3.2, PW / 2 + 3.2); p.ty = has ? Y : ky; continue;
      }
      if (reserves.has(i)) p.run = 0; // the chosen cover cannot join an attacking run
      const running = p.run > sim.t;
      if (has) {
        // Runs in behind: forwards and runners, timed by Off the Ball and Anticipation, when the ball can be played.
        // Runs in behind, like duties: how attacking the player is (team mentality, role, instruction) sets how
        // often he goes; Off the Ball times it; anyone from midfield back only goes if enough stay behind the ball.
        const droppingNine = roleName(S, i) === 'False Nine' && S._teamPlan.phase !== 'finish';
        if (droppingNine) p.run = 0;
        if (!droppingNine && !reserves.has(i) && !running && own && by > 0.18 && (role >= 3 || bh(S, i, 'run') > 0.2 || bh(S, i, 'fw') > 0.3) && Math.abs(own.x - p.x) + Math.abs(own.y - p.y) < 55) {
          const im = (S.ment ?? 2) - 2 + bh(S, i, 'fw') + bh(S, i, 'run') * 1.5 + (role >= 4 ? 1 : role === 3 ? 0 : -1);
          const ok = role >= 4 || cover >= 4 + ((S.ment ?? 2) <= 1 ? 1 : 0);
          const pr = ok ? (trig || ctr || (drop && role <= 3) ? 0.24 : 0.04) * (ac(S, i, 'otb') / 12) * clamp(1 + im * 0.3, 0.15, 2) * (ctr ? 2 : 1) * (hold ? 0.2 : 1) : 0;
          if (R() < pr) { p.run = sim.t + 2 + ac(S, i, 'ant') * 0.04; if (role <= 3) cover--; }
        }
        // 7.2: on a wide attack his box spot comes first, and getting there is a run (a sprint), not a jog.
        const boxTo = box && box.get(i);
        if (boxTo) { X = boxTo[0]; Y = boxTo[1]; if (hyp(p.x - X, p.y - Y) > 3) p.boxRun = sim.t + 1.5; }
        else if (p.run > sim.t) { // 6.7: the Winger runs down the line, the Inside Forward diagonally inside, the 9 into the channel
          const rn = roleName(S, i), sd = p.x < PW / 2 ? -1 : 1;
          X = /Winger$|Wide Midfielder|Wing-Back|Full-Back/.test(rn) && rn !== 'Inverted Winger' ? clamp(p.x, 3, PW - 3)
            : /Inside Forward|Inverted Winger|Shadow Striker/.test(rn) ? PW / 2 + sd * 7
            : LINE[ip[i][0]] === 5 ? PW / 2 + Math.sign(B.x - PW / 2 || sd) * 8 : clamp(p.x + (PW / 2 - p.x) * 0.15, 3, PW - 3);
          Y = line + fw * (6 + ac(S, i, 'pac') * 0.3); }
        else {
          if (role >= 3 && beyond(s, Y, line)) Y = line - fw * 1.2; // stay onside
          // Support: midfielders offer a pass.
          if (own && role >= 2 && role <= 3) { const dx = X - own.x, dy = Y - own.y; if (dx * dx + dy * dy > 484) { const k = clamp(0.1 + ac(S, i, 'tea') * 0.015, 0.1, 0.45); X += (own.x - X) * k; Y += (own.y - Y) * k; } } // Teamwork: comes to help
          // Filling the box when the ball is wide in the final third or in the cut-back zone (rulebook 7.2).
          const inBox = box && box.get(i);
          if (inBox) { X = inBox[0]; Y = inBox[1]; }
          // Direct play (long passing) building from the back: the midfielder further from the ball pushes up near
          // the target man for the knock-down and second ball; the nearer one stays short as the escape pass.
          if ((S.pass ?? 1) === 2 && role === 3 && by > 0.55) {
            const mids = ip.map((q, n) => LINE[q[0]] === 3 && P[n] ? n : -1).filter(n => n > 0), far = mids.sort((a, b) => hyp(P[b].x - B.x, P[b].y - B.y) - hyp(P[a].x - B.x, P[a].y - B.y))[0];
            const tg = ip.map((q, n) => LINE[q[0]] === 5 && P[n] ? n : -1).filter(n => n > 0)[0];
            if (i === far && tg) { X += (P[tg].x - X) * 0.4; Y = P[tg].y - fw * 10; }
          }
          // Find space near that spot (Off the Ball, Anticipation).
          else if (!inBox && own && role >= 2 && Math.abs(Y - own.y) < 40) [X, Y] = findSpace(M, s, i, X, Y, own, line);
        }
      } else if (defRole <= 3) {
        // Marking: stay goal-side of the nearest attacker in his zone, tighter with Marking (and the instruction).
        let m = -1, md = 144;
        for (let k = 1; k < T.length; k++) { const q = T[k]; if (!q) continue; const dx = q.x - X, dy = q.y - Y, d2 = dx * dx + dy * dy; if (d2 < md) { md = d2; m = k; } }
        if (m > 0) {
          const q = T[m], qy = s === 0 ? q.y / PL : 1 - q.y / PL, danger = qy > 0.55; // near our goal (their attack)
          // Marking reads where his man is going (and stays goal-side of that), rather than standing on his toes.
          const box = qy > 0.8; // 4.8: in and around his own box he is goal-side and touch-tight
          const tight = (box ? 1.4 : danger ? 2.2 : 3.6) - bh(S, i, 'mk') * (box ? 0.3 : 0.8) - attention(S, M.sides[1 - s].on[m]) * 0.4;
          const lead = clamp((ac(S, i, 'mar') - 4) * 0.06, 0, 1), px = q.x + q.vx * lead, py = q.y + q.vy * lead;
          const L = hyp(gx - px, gy - py) || 1, t2 = Math.max(1, tight);
          const mx = px + (gx - px) / L * t2, my = py + (gy - py) / L * t2;
          const w = clamp((box ? 0.78 : danger ? 0.55 : 0.35) + ac(S, i, 'pos') * 0.02 + (ac(S, i, 'tea') - 10) * 0.012 + bh(S, i, 'mk') * 0.15, 0.2, box ? 0.97 : 0.92);
          X += (mx - X) * w; Y += (my - Y) * w;
          if (defRole === 1 && by < .8) Y = clamp(Y, lineY - 1.5, lineY + 1.5);
          // A midfielder tracks his runner up to the back line and passes him on (4.7); dropping behind it would
          // play everyone onside and leave the line stranded.
          else if (defRole >= 2 && backY != null && by < .8 && (backY - Y) * fw > 1) Y = backY - fw;
        }
      }
      // Individual support/search must not pull the reserved cover ahead of its team anchor.
      if (has && reserves.has(i)) {
        const anchorY = toWorld(s, pos[i][0], pos[i][1])[1];
        Y = s === 0 ? Math.max(Y, anchorY) : Math.min(Y, anchorY);
      }
      p.tx = clamp(X, 0.5, PW - 0.5); p.ty = clamp(Y, 0.5, PL - 0.5);
    }
  }
}
// Filling the box (rulebook 7.2): with the ball wide in the final third or in the cut-back zone, the attackers
// who are not rest defence take the near post (usually the 9), the far post (the far-side wide forward), the
// penalty spot (an 8 or 10 arriving late) and the edge of the box (a midfielder, for cut-backs and second balls).
// Off the Ball and the run instruction pick who gets there; nobody stands offside before the ball is played.
function boxPlan(M, s, ip, bx, by, carrier, reserves, line) {
  const wide = bx < 0.3 || bx > 0.7, cut = by < 0.13 && (bx < 0.38 || bx > 0.62);
  if (!(by < 0.5 && (wide || cut))) return null; // 7.2: the box fills as soon as the ball is wide in the attacking half
  const S = M.sides[s], P = M.sim.P[s], sgn = bx < 0.5 ? -1 : 1;
  const cand = P.map((q, i) => q && i && i !== carrier && !reserves.has(i) && LINE[ip[i][0]] >= 3 ? i : -1).filter(i => i > 0);
  if (!cand.length) return null;
  const L = i => LINE[ip[i][0]], farSide = i => (ip[i][1] - 0.5) * sgn < -0.05;
  const spots = [
    ['near', 0.5 + sgn * 0.06, 0.055, i => (L(i) === 5 ? 3 : L(i) === 4 && !farSide(i) ? 1 : 0)],
    ['far', 0.5 - sgn * 0.08, 0.065, i => (L(i) === 4 && farSide(i) ? 3 : L(i) === 5 ? 2 : farSide(i) ? 1 : 0)],
    ['spot', 0.5 - sgn * 0.02, 0.105, i => (ip[i][0] === 'AMC' ? 3 : L(i) === 3 ? 2 : 1)],
    ['edge', 0.5 + sgn * 0.03, 0.185, i => (L(i) === 3 ? 2 : 0)],
  ];
  const out = new Map();
  for (const [, x, y, pref] of spots) {
    const [wx, wy] = toWorld(s, x, y);
    let best = -1, bv = -1e9;
    for (const i of cand) {
      if (out.has(i)) continue;
      const q = P[i], v = pref(i) * 10 - hyp(q.x - wx, q.y - wy) * 0.25 + bh(S, i, 'run') * 2 + ac(S, i, 'otb') * 0.15;
      if (v > bv) { bv = v; best = i; }
    }
    if (best < 0) break;
    out.set(best, [wx, beyond(s, wy, line) ? line - fwdY(s) * 0.8 : wy]);
    out.spots = out.spots || []; out.spots.push({ i: best, x: wx, y: wy, k: spots[out.spots.length][0] }); // the spaces themselves, for the cross
  }
  return out;
}

// 7.2: as the cross is struck, every box runner leaves the line and attacks his space (offside was judged at the
// kick, so he is free to go); Pace and Off the Ball decide who gets there first.
function attackTheBox(M, s, spots, crosser) {
  const P = M.sim.P[s], t = M.sim.t;
  for (const sp of spots) {
    const q = P[sp.i];
    if (!q || sp.i === crosser) continue;
    q.tx = sp.x; q.ty = sp.y; q.boxRun = t + 2.5; q.sup = t + 2.5;
  }
}

// Space search off the ball: a few spots around where the role wants him, scored by how free they are, whether
// the ball can reach them, how dangerous they are, staying onside and out of a team-mate's space. Off the Ball
// picks the right one, Anticipation reads where the defenders are going; free roles look further.
const ROAM = { Playmaker: 9, 'Advanced Playmaker': 9, 'False Nine': 9, 'Shadow Striker': 8, 'Inside Forward': 8, Mezzala: 8, 'Inverted Winger': 8, 'Wide Playmaker': 8, Anchor: 3, 'Target Forward': 3, Winger: 4, 'Deep-Lying Playmaker': 5 };
const SPOT = [[0, 0], [1, 0], [-1, 0], [0, 1], [0, -1], [0.7, 0.7], [-0.7, 0.7], [0.7, -0.7], [-0.7, -0.7]];
function findSpace(M, s, i, X, Y, own, line) {
  const S = M.sides[s], sim = M.sim, P = sim.P[s], OP = sim.P[1 - s], fw = fwdY(s);
  const tw = ac(S, i, 'tea') / 10, r = ROAM[roleName(S, i)] || 6, la = (ac(S, i, 'ant') - 5) * 0.05, noise = (20 - ac(S, i, 'otb')) * 0.012, disc = ac(S, i, 'pos') / 20;
  let bx = X, by = Y, bv = -9;
  for (let k = 0; k < SPOT.length; k++) {
    const x = clamp(X + SPOT[k][0] * r, 2, PW - 2), y = clamp(Y + SPOT[k][1] * r, 2, PL - 2);
    if (beyond(s, y, line)) continue;
    let open = 9, lane = 5, crowd = 0;
    for (let j = 0; j < OP.length; j++) {
      const q = OP[j]; if (!q) continue;
      const qx = q.x + q.vx * la, qy = q.y + q.vy * la, d = Math.sqrt((qx - x) * (qx - x) + (qy - y) * (qy - y));
      if (d < open) open = d;
      const l = segD(qx, qy, own.x, own.y, x, y); if (l < lane && SD.u > 0.1) lane = l;
    }
    for (let j = 1; j < P.length; j++) { const q = P[j]; if (!q || j === i || q === own) continue; const d = hyp(q.tx - x, q.ty - y); if (d < 7) crowd += (7 - d) / 7; }
    const v = open / 9 * 0.5 + lane / 5 * 0.4 * tw + threat(s, x, y) * 3 - crowd * 0.35 * tw - hyp(x - X, y - Y) / r * 0.2 * disc + gauss() * noise;
    if (v > bv) { bv = v; bx = x; by = y; }
  }
  return [bx, by];
}

// Movement: top speed from Pace, acceleration from Agility, both lower when tired; jogging into shape, sprinting when it matters.
function movePlayers(M) {
  const sim = M.sim, B = sim.B, dt = TICK, rs = !!sim.rs;
  // Both sides move at the same moment: anything a player reads about the other side is where they were at the
  // start of the tick (otherwise the side moved second always reacts to the other's next position).
  const at = sim.P.map(P => P.map(q => (q ? [q.x, q.y] : null)));
  for (let s = 0; s < 2; s++) {
    const S = M.sides[s], P = sim.P[s], sp = speeds(S);
    for (let i = 0; i < P.length; i++) {
      const p = P[i];
      if (!p) continue;
      if (p.cool > 0) { p.cool -= dt; p.vx *= 0.5; p.vy *= 0.5; p.x += p.vx * dt; p.y += p.vy * dt; continue; }
      const carrier = B.os === s && B.oi === i;
      let tx = p.tx, ty = p.ty;
      if (carrier) { if (p.carry) { tx = B.hx; ty = B.hy; } else { tx = p.x; ty = p.y; } }
      const dx = tx - p.x, dy = ty - p.y, d = Math.sqrt(dx * dx + dy * dy);
      let top = sp[i * 2] * (carrier && p.carry ? 0.85 : 1);
      if (carrier) { const O = at[1 - s]; for (let j = 0; j < O.length; j++) { const q = O[j]; if (q && (q[0] - p.x) * (q[0] - p.x) + (q[1] - p.y) * (q[1] - p.y) < 9 && (q[1] - p.y) * fwdY(s) > -0.5) { top *= 0.55; break; } } }
      // Sprint only when it matters: on the ball, making a run, pressing, going for a loose ball, a restart, or
      // getting back goal-side; otherwise jog into position (most of a match is jogging).
      const urgent = carrier || p.run > sim.t || (p.boxRun || 0) > sim.t || p.eng === sim.t || p.chase === sim.t || sim.t < (p.want || 0) || (rs && d > 12) || (sim.poss !== s && (p.y - ty) * fwdY(s) > 21 - ac(M.sides[s], i, 'wor') * 0.6) || (sim.poss !== s && i > 0 && d > 1 && dGoal(1 - s, tx, ty) < 25) || (i === 0 && sim.poss !== s && d > 0.5 && dGoal(1 - s, B.x, B.y) < 35) || (sim.poss !== s && i > 0 && Math.abs(p.y - ty) > 3 && backLine(M.sides[s], i)); // 4.8: defending his own box is never at a jog; 6.1: the keeper resets with every pass near his goal
      let want = urgent ? top : Math.min(top * (0.4 + ac(M.sides[s], i, 'wor') * 0.01), d / 2); // Work Rate: gets into position
      if (want > d / 0.6) want = d / 0.6;
      // Rulebook 1c: where he faces. On the ball he turns to face play (unless a man tight behind him stops the turn);
      // defending he watches the ball (turning his back only to sprint back); with his team on the ball he opens up
      // on the half-turn, between the ball and the goal he attacks. Turning takes time (Agility), and he is slower
      // sideways and backwards than forwards.
      const mv = d > 0.3 ? Math.atan2(dy, dx) : null, sp0 = hyp(p.vx, p.vy), toBall = Math.atan2(B.y - p.y, B.x - p.x);
      let face = p.fa ?? fwdA(s), turnK = 1;
      if (carrier) {
        if (p.carry && mv != null) face = mv;
        else { const tight = at[1 - s].some(q => q && hyp(q[0] - p.x, q[1] - p.y) < 2.2); face = tight && backness(s, p) > 0.5 ? p.fa : fwdA(s); if (tight) turnK = 0.5; }
      } else if (i === 0 || sim.poss !== s) face = urgent && d > 4 && mv != null && Math.abs(wrapA(mv - toBall)) > 1.75 ? mv : toBall;
      else if (sp0 > 5 && mv != null) face = mv;
      else { const open = clamp(0.3 + (ac(S, i, 'dec') + ac(S, i, 'vis') + ac(S, i, 'ant') - 30) * 0.012, 0.15, 0.6), f0 = fwdA(s);
        face = Math.atan2(Math.sin(toBall) * (1 - open) + Math.sin(f0) * open, Math.cos(toBall) * (1 - open) + Math.cos(f0) * open); }
      const rate = (2.5 + ac(S, i, 'agi') * 0.15) * (1 - 0.35 * Math.min(1, sp0 / 8)) * turnK;
      p.fa = wrapA((p.fa ?? fwdA(s)) + clamp(wrapA(face - (p.fa ?? fwdA(s))), -rate * dt, rate * dt));
      if (mv != null) want *= 1 - 0.5 * clamp((Math.abs(wrapA(mv - p.fa)) - 0.6) / 2, 0, 1);
      const vx = d > 0.2 ? dx / d * want : 0, vy = d > 0.2 ? dy / d * want : 0;
      const ddx = vx - p.vx, ddy = vy - p.vy, dv = Math.sqrt(ddx * ddx + ddy * ddy), lim = sp[i * 2 + 1] * dt;
      if (dv > lim) { p.vx += ddx / dv * lim; p.vy += ddy / dv * lim; } else { p.vx = vx; p.vy = vy; }
      const m = carrier ? 0.8 : -1;
      p.x += p.vx * dt; p.y += p.vy * dt;
      const v2 = p.vx * p.vx + p.vy * p.vy;
      if (v2 > 30) p.spr = (p.spr || 0) + Math.sqrt(v2) * dt; // sprinting (over about 5.5 m/s): what tires players
      if (p.x < m) p.x = m; else if (p.x > PW - m) p.x = PW - m;
      if (p.y < m) p.y = m; else if (p.y > PL - m) p.y = PL - m;
    }
  }
  separateBodies(M);
}
// Body space: every player is a soft circle sized by height and build (about 0.3-0.45 m: shoulders and arms). Two
// players cannot share the same ground, so a presser stands beside a carrier rather than inside him. The on-screen
// circle is this radius at pitch scale. Duels are still dice rolls.
function bodyRadius(S, i) {
  const p = G.players[S.on[i]];
  if (!p || !p.ht) return 0.36;
  return clamp(0.34 + (p.ht - 182) * 0.0015 + (bmiOf(p) - 23) * 0.01, 0.3, 0.46);
}
function separateBodies(M) {
  const sim = M.sim, bodies = [];
  for (let s = 0; s < 2; s++) sim.P[s].forEach((q, i) => { if (q) bodies.push({ q, r: bodyRadius(M.sides[s], i) }); });
  for (let pass = 0; pass < 2; pass++) for (let a = 0; a < bodies.length; a++) for (let b = a + 1; b < bodies.length; b++) {
    const A = bodies[a].q, C = bodies[b].q, min = bodies[a].r + bodies[b].r;
    let dx = C.x - A.x, dy = C.y - A.y;
    // Against a goal line or touchline they slide apart along it: a push into the line would be clamped back.
    if (Math.min(A.y, PL - A.y, C.y, PL - C.y) < 1.5) dy = 0;
    let d = Math.sqrt(dx * dx + dy * dy);
    if (d >= min) continue;
    if (d < 1e-3) { dx = 1; dy = 0; d = 1; } // exactly on top of each other: part sideways
    const push = (min - d) / 2 / d;
    A.x -= dx * push; A.y -= dy * push; C.x += dx * push; C.y += dy * push;
    A.x = clamp(A.x, 0.5, PW - 0.5); A.y = clamp(A.y, 0.5, PL - 0.5); C.x = clamp(C.x, 0.5, PW - 0.5); C.y = clamp(C.y, 0.5, PL - 0.5);
  }
  bodies.forEach(({ q }) => { q.x = clamp(q.x, 0.5, PW - 0.5); q.y = clamp(q.y, 0.5, PL - 0.5); });
}
// Top speed (Pace) and acceleration (Agility) per slot, both lower when tired: worked out once a minute.
function speeds(S) {
  if (S._sp) return S._sp;
  const a = new Float32Array(22);
  for (let i = 0; i < 11; i++) { a[i * 2] = 5.6 + ac(S, i, 'pac') * 0.17; a[i * 2 + 1] = 2.5 + ac(S, i, 'agi') * 0.16; }
  return (S._sp = a);
}

// Every tick: the nearest defender engages the player on the ball, goal-side of him (jockeying), closer and
// more aggressively the higher the press and his Work Rate; the next one covers behind him.
function engage(M) {
  const sim = M.sim, B = sim.B, own = owner(M);
  sim.defence = null;
  if (!own && !sim.rs) return chase(M);
  if (!own || sim.rs) return;
  const s = B.os, o = 1 - s, O = M.sides[o], OP = sim.P[o], gx = PW / 2, gy = goalY(s);
  // A forward through on goal: the keeper comes out to narrow the angle, and rushes him when he gets close
  // (One on Ones decides how far and how well judged).
  const g = OP[0];
  if (g && throughOnGoal(M, s, own.x, own.y)) {
    const d = dGoal(s, own.x, own.y), f = d < 13 ? clamp(1 - (1.5 + (20 - ac(O, 0, 'one')) * 0.08) / d, 0.3, 0.92) : clamp(0.22 + (ac(O, 0, 'one') - 10) * 0.015, 0.12, 0.4);
    g.tx = gx + (own.x - gx) * f; g.ty = gy + (own.y - gy) * f; g.run = sim.t + 1;
  }
  let a = -1, ad = 1e9;
  for (let j = 1; j < OP.length; j++) { const q = OP[j]; if (!q) continue; const d = hyp(q.x - own.x, q.y - own.y); if (d < ad) { a = j; ad = d; } }
  if (a < 0) return;
  const [, oy] = toOwn(o, own.x, own.y), press = O.press ?? 1;
  // How close he goes: right in for a high press or near his own goal, otherwise he holds off a little.
  const gap = oy > 0.62 ? 1.1 : press === 2 ? 1.2 : press === 0 && oy < 0.4 ? 4.5 : 1.9 - bh(O, a, 'pr') * 0.6 - (ac(O, a, 'wor') - 10) * 0.04;
  // The pressing zone: deep for a low block, from about halfway for a standard press, everywhere for a high press.
  const zone = [0.58, 0.44, 0.2][press] - bh(O, a, 'pr') * 0.06;
  // After a loss: a 5–8 s Work Rate/Stamina/condition window, ending early if bypassed.
  // Regroup drops straight back into the block. A pressing trigger (back pass, poor touch, a man facing his
  // own goal, the ball pinned on the touchline) sends the nearest man in outside the usual zone.
  const tr = sim.tr && sim.tr.s === s ? sim.t - sim.tr.t : 99, lost = O.lost ?? 1;
  const counter = counterpressState(M,o), cp = counter.active;
  const regroup = lost === 0 && tr < 4 || counter.recover;
  const pt = !counter.recover && sim.pt && sim.pt.o === o && sim.t < sim.pt.until;
  if (counter.recover) OP.forEach((p,i) => { if(p && i) p.run=sim.t+.6; });
  if (regroup && ad > 4 && oy < 0.62) return trackRuns(M, s, o, OP, gx, gy);
  if (oy < zone && ad > 4 && !cp && !pt) return trackRuns(M, s, o, OP, gx, gy);
  const active = ad < 22 || oy > .5 || cp || pt;
  const unit = active ? defensiveUnit(M, s, gap, !!pt, cp, counter.cohort) : { assignments: [] };
  sim.defence = { s: o, ...unit, recovering:counter.recover, lineStep: O._defStep || 0 };
  unit.assignments.forEach(a => {
    const p = OP[a.i]; p.tx = a.x; p.ty = a.y; p.eng = sim.t;
    if (a.job === 'press' || cp) p.run = sim.t + .6;
  });
  trackRuns(M, s, o, OP, gx, gy);
}
// Runs in behind are tracked: the nearest free defender goes with the runner, goal-side of him.
function trackRuns(M, s, o, OP, gx, gy) {
  const sim = M.sim, O = M.sides[o], TP = sim.P[s];
  for (let k = 1; k < TP.length; k++) {
    const r = TP[k];
    if (!r || !(r.run > sim.t || (r.vy * fwdY(s) > 4.5 && toOwn(s, r.x, r.y)[1] < 0.6))) continue;
    let m = -1, md = 14;
    for (let j = 1; j < OP.length; j++) { const q = OP[j]; if (!q || q.eng === sim.t) continue; const d = hyp(q.x - r.x, q.y - r.y); if (d < md) { md = d; m = j; } }
    if (m < 0) continue;
    // 4.7: the line, not the man. A back-line defender follows only on an open ball (carrier free, facing forward);
    // otherwise he holds and the runner is left offside. Near goal (inside about 22 m) he goes with him.
    const own = owner(M), open = own && sim.B.os === s && pressureOn(M, s, sim.B.oi)[0] < 0.35 && backness(s, own) < 0.4;
    if (backLine(O, m) && !open && dGoal(s, r.x, r.y) > 22) continue;
    const q = OP[m], px = r.x + r.vx * 0.8, py = r.y + r.vy * 0.8, L2 = hyp(gx - px, gy - py) || 1, lead = 1.4;
    q.tx = px + (gx - px) / L2 * lead; q.ty = py + (gy - py) / L2 * lead; q.eng = sim.t;
    if (!backLine(O, m)) { // a midfielder hands him on at the back line
      const ys = OP.map((z, k) => z && k && backLine(O, k) ? z.y : null).filter(v => v != null);
      if (ys.length) { const bl = ys.reduce((a, b) => a + b, 0) / ys.length, fwo = fwdY(o); if ((bl - q.ty) * fwo > 1) q.ty = bl - fwo; }
    }
  }
}

// Attackers who are not making a run keep themselves onside: back behind the line, a step at a time.
// Off the Ball and Anticipation make them better at it.
function keepOnside(M) {
  const sim = M.sim, s = sim.poss, B = sim.B;
  if (s < 0 || sim.rs) return;
  const S = M.sides[s], P = sim.P[s], line = offsideY(M, s);
  for (let i = 1; i < P.length; i++) {
    const p = P[i];
    if (!p || p.run > sim.t || (B.os === s && B.oi === i) || (B.fl && B.fl.s === s && B.fl.j === i)) continue;
    // 4.7: on the shoulder of the last defender; Off the Ball and Anticipation keep him onside, a lapse now and then
    if (R() < Math.max(0, 14 - ac(S, i, 'otb')) * 0.0025) continue;
    const slack = 0.3 + clamp((ac(S, i, 'otb') + ac(S, i, 'ant') - 20) * 0.03, 0, 0.5);
    if (beyond(s, p.ty, line - fwdY(s) * slack)) p.ty = line - fwdY(s) * (0.4 + slack);
  }
}
// A ball nobody controls (or a pass nobody is near): the nearest player on each side runs to where he can meet it.
// Rulebook 4.9: a long ball is read in the air. The defender who can get under it first goes to the landing spot
// (to head it or take it); if none can beat the receiver there, the quickest gets goal-side of where it drops.
function readFlight(M) {
  const sim = M.sim, B = sim.B, fl = B.fl, d = 1 - fl.s, P = sim.P[d], left = Math.max(0, fl.arr - sim.t), gy = goalY(fl.s);
  const r = fl.j >= 0 ? P_(M, fl.s, fl.j) : null, rt = r ? hyp(r.x - fl.tx, r.y - fl.ty) / 7.5 : 9;
  let best = -1, bt = 1e9;
  for (let k = 1; k < P.length; k++) { const q = P[k]; if (!q || (q.cool || 0) > 0) continue; const t = hyp(q.x - fl.tx, q.y - fl.ty) / 7.5 - (ac(M.sides[d], k, 'ant') - 10) * 0.03; if (t < bt) { bt = t; best = k; } }
  if (best < 0) return;
  const q = P[best], toGoal = hyp(PW / 2 - fl.tx, gy - fl.ty) || 1;
  if (bt <= Math.max(left, rt) + 0.3) { q.tx = fl.tx; q.ty = fl.ty; } // he gets there: attack the ball
  else { q.tx = fl.tx + (PW / 2 - fl.tx) / toGoal * 2; q.ty = fl.ty + (gy - fl.ty) / toGoal * 2; } // goal-side of the drop
  q.tx = clamp(q.tx, 0.5, PW - 0.5); q.ty = clamp(q.ty, 0.5, PL - 0.5); q.chase = sim.t;
}
function chase(M) {
  const sim = M.sim, B = sim.B, fl = B.fl;
  if (fl && fl.air && !fl.landed && (fl.k === 'long' || fl.k === 'clear')) readFlight(M);
  if (fl && (fl.k === 'shot' || fl.air && !fl.landed)) return;
  // Rulebook 4.9: a pass on its way to a team-mate is his only while he can still get to it first; a landed long
  // ball or a pass that has run past its man is a loose ball, and both sides go for it.
  if (fl && fl.j >= 0 && !fl.landed && hyp(B.vx, B.vy) > 3) {
    const r = P_(M, fl.s, fl.j), sx = B.x + B.vx / 0.55, sy = B.y + B.vy / 0.55; // where it would stop
    if (r && (hyp(r.x - fl.tx, r.y - fl.ty) < 9 || segD(r.x, r.y, B.x, B.y, sx, sy) < 4)) return;
  }
  for (let t = 0; t < 2; t++) {
    const P = sim.P[t];
    let best = -1, bt = 1e9, bx = 0, by = 0;
    for (let j = 1; j < P.length; j++) {
      const p = P[j]; if (!p || (B.offS === t && (B.offSet & (1 << j)))) continue;
      // Where the ball will be in the time he needs to get there (a few looks ahead).
      for (let k = 0; k <= 3; k++) {
        const tt = k * 0.6, f = Math.exp(-0.55 * tt), X = B.x + B.vx * (1 - f) / 0.55, Y = B.y + B.vy * (1 - f) / 0.55;
        const need = hyp(X - p.x, Y - p.y) / 7.5;
        if (need <= tt + 0.3 || k === 3) { if (need < bt) { bt = need; best = j; bx = X; by = Y; } break; }
      }
    }
    if (best > 0) { P[best].tx = clamp(bx, 0.5, PW - 0.5); P[best].ty = clamp(by, 0.5, PL - 0.5); P[best].chase = sim.t; }
  }
}

/* ---------- one tick, one minute ---------- */
function tickSim(M) {
  const sim = M.sim, B = sim.B;
  sim.t += TICK;
  if (sim.celebrate > 0) { sim.celebrate -= TICK; recordFrame(M); return; }
  if (sim.rs) restartTick(M);
  else {
    const own = owner(M);
    if (own) {
      B.dt -= TICK;
      if (B.dt <= 0) { own.carry = 0; carrierDecide(M, B.os, B.oi); }
    }
    if (!sim.rs) ballTick(M);
  }
  if (!sim.rs) challenges(M);
  const tk = Math.round(sim.t / TICK);
  // 7.2: near the box everyone re-reads the situation every second; elsewhere the side with the ball every two.
  const near = B.os >= 0 && toOwn(B.os, B.x, B.y)[1] < 0.45;
  if (!sim.rs && (tk % 2 === 0 || sim.turn >= sim.t - TICK)) targets(M, tk % 4 === 0 || (near && tk % 2 === 0) || sim.turn >= sim.t - TICK);
  engage(M);
  keepOnside(M);
  movePlayers(M);
  if (B.os >= 0 || (B.fl && B.fl.k !== 'shot')) M.sides[B.os >= 0 ? B.os : B.fl.s].st.pos += TICK;
  recordFrame(M);
}
// Frames for the 2D view (only for a match being watched): time, ball, then 22 players, then where each faces.
function recordFrame(M) {
  if (!M.live) return;
  const sim = M.sim, B = sim.B, f = [Math.round(sim.t * 10) / 10, +B.x.toFixed(2), +B.y.toFixed(2), +B.z.toFixed(2), B.os, B.oi, sim.rs ? sim.rs.k : ''];
  for (let s = 0; s < 2; s++) for (let i = 0; i < 11; i++) { const p = sim.P[s][i]; f.push(p ? +p.x.toFixed(2) : null, p ? +p.y.toFixed(2) : null); }
  for (let s = 0; s < 2; s++) for (let i = 0; i < 11; i++) { const p = sim.P[s][i]; f.push(p ? +(p.fa ?? 0).toFixed(2) : null); } // 1c: where each faces
  (M.frames || (M.frames = [])).push(f);
}

/* One minute of play. Returns the minute's main event (most important first) and the others. */
function playMinute(M) {
  if (!M.sim) simInit(M);
  M.sides.forEach(X => refreshForm(M, X));
  M.sides.forEach((S, s) => syncSide(M, s));
  M.mev = []; M.marks = []; M.frames = M.live ? [] : null;
  if (M.min === 46 && M.sim.half === 1) { M.sim.half = 2; kickOff(M, 1); }
  recordFrame(M); // include second zero: playback must not freeze for the first half-second
  const end = M.sim.t + 60;
  const pos0 = M.sides.map(S => S.st.pos);
  // A few fouls off the ball (holding, blocking runs) that the tackles do not cover.
  if (R() < ENG.offFoul * tune('foulRate') / 0.18 * M.mod.foul) M.offFoul = R() * 60;
  while (M.sim.t < end - 1e-6) {
    tickSim(M);
    if (M.offFoul != null && (M.sim.t % 60) >= M.offFoul && !M.sim.rs) {
      M.offFoul = null;
      const s = M.sim.poss, o = 1 - s, cand = M.sim.P[o].map((p, j) => (p && j ? j : -1)).filter(j => j > 0), q = M.sim.P[s].findIndex((p, i) => p && i > 0);
      const cb = owner(M), inBox = cb && toOwn(s, cb.x, cb.y)[1] < 0.18;
      if (cand.length && q > 0 && M.sim.B.os === s && !inBox) foul(M, s, M.sim.B.oi, o, wpick(cand, j => (LINE[FORMATIONS[M.sides[o].ip][j][0]] <= 2 ? 1.2 : 1) * (G.players[M.sides[o].on[j]].at[A.tck] < 10 ? 1.3 : 1)));
    }
  }
  const ps = M.sides.map((S, s) => S.st.pos - pos0[s]), side = ps[0] >= ps[1] ? 0 : 1;
  const rank = { goal: 6, save: 5, miss: 4, shot: 4, red: 3, offside: 2, yellow: 2, foul: 1 };
  const evs = M.mev.slice().sort((a, b) => (rank[b.t] || 0) - (rank[a.t] || 0));
  const main = evs.length && (rank[evs[0].t] || 0) >= 2 ? evs.shift() : { min: M.min, side, t: 'poss', key: M.marks.some(m => m.k === 'chance' || m.k === 'corner') };
  return [main, ...evs];
}

// Attention (shots.js before v3): each side remembers the danger every opponent caused and marks him tighter.
function attention(O, pid) {
  const c = O._attC || (O._attC = {});
  return c[pid] != null ? c[pid] : (c[pid] = attentionCalc(O, pid));
}
function attentionCalc(O, pid) {
  const A = O.att, a = (A && A[pid]) || 0;
  if (!a) return 0;
  return clamp(a * clamp(2 * a / (O.attSum || a), 0.3, 1.2) * markGrip(O, pid) * 0.25, 0, 3);
}
function markGrip(O, pid) {
  const key = O.on.join(',');
  if (O.mqKey !== key) {
    const ds = O.on.map((id, i) => (id && i && LINE[FORMATIONS[O.ip][i][0]] <= 2 ? G.players[id] : null)).filter(Boolean);
    O.mq = ds.length ? ds.reduce((t, p) => t + p.at[A.mar] + p.at[A.pos] + p.at[A.ant] + p.at[A.tea], 0) / (ds.length * 4) : 10;
    O.mqKey = key;
  }
  const p = G.players[pid], m = p ? ['dri', 'fla', 'agi', 'fir', 'cmp', 'dec', 'otb', 'ant'].reduce((t, k) => t + p.at[A[k]], 0) / 8 : 10;
  return clamp(1 + (O.mq - 12) * 0.06 - clamp((m - 12) * 0.09, 0, 0.75), 0.15, 1.5);
}
function noteThreat(O, pid, aid, xg, goal) {
  const A = O.att || (O.att = {}), d = 0.5 + xg * 2.5 + (goal ? 1.5 : 0);
  O._attC = null;
  A[pid] = (A[pid] || 0) + d; O.attSum = (O.attSum || 0) + d;
  if (aid && aid !== pid) { A[aid] = (A[aid] || 0) + 0.25; O.attSum += 0.25; }
}
