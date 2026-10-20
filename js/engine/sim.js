'use strict';
/* ===== sim.js =====
   Match engine v2: each minute the side with the ball plays a chain of actions
   (pass, through ball, long ball, dribble, cross, shot) by the players actually
   involved. Every action is a duel between the attribute scores of the player on the ball
   (or the receiver) and the nearest defender, on positions from pitch.js.
   Every step is written to ev.seq, so the 2D view replays exactly what happened.
   All coordinates in a chain are in the attacking side's frame (y 0 = the goal it attacks). */

const sigm = z => 1 / (1 + Math.exp(-z));
const logit = p => Math.log(p / (1 - p));
// Success chance of a duel. a, d: attacker and defender scores (1-20 scale), close: how involved the defender is (0-1).
const duel = (a, d, base, close = 1, k = 3) => sigm(logit(clamp(base, 0.02, 0.98)) + ((a - 10) - (d - 10) * close) / k);
const dist = (a, b) => Math.hypot((a[0] - b[0]) * 0.65, a[1] - b[1]); // pitch is 68 x 105 m
const metres = (x, y) => Math.hypot((x - 0.5) * 68, y * 105);
const PHYS = new Set(['pac', 'sta', 'agi', 'str']);

// Form of each player this minute: morale, condition, sharpness, position fit, captain/shouts are in S.form.
function refreshForm(M, S) {
  const losingLate = M.min >= 75 && S.st.g < M.sides[1 - S.idx].st.g;
  S.form = S.on.map((id, i) => {
    if (!id) return 0;
    const p = G.players[id];
    return pForm(S, p) * fam(p, FORMATIONS[S.ip][i][0]) * (S.capF || 1) * (S.idx === 0 ? 1.015 : 1) * (losingLate && p.pers === 'Determined' ? 1.05 : 1);
  });
  S.fam = S.user ? G.training.fam : 85;
}
// Attribute k of the player in slot i, as it counts right now.
function av(S, i, k) {
  const p = G.players[S.on[i]];
  if (!p) return 5;
  let v = p.at[A[k]] * (S.form[i] || 0.8);
  if (PHYS.has(k)) v *= 0.8 + 0.2 * (S.cond[p.id] ?? 100) / 100;
  if ((k === 'cmp' || k === 'dec') && p.age >= 29) v += 0.6; // experience
  if ((k === 'cmp' || k === 'dec') && p.age <= 20) v -= 0.6;
  if (k === 'str') v += clamp((bmiOf(p) - 23) * 0.4, -1, 1.5); // weight helps holding the ball
  return v;
}
const avg2 = (S, i, ks) => ks.reduce((t, [k, w]) => t + av(S, i, k) * w, 0) / ks.reduce((t, [, w]) => t + w, 0);
const aerialAt = (S, i) => { const p = G.players[S.on[i]]; return av(S, i, 'hea') + clamp(((p.ht || 182) - 182) / 4, -3, 4); };
function nearest(pos, pt, skipGk = true, not = -1) {
  let best = -1, bd = 9;
  pos.forEach((q, i) => { if (!q || i === not || (skipGk && i === 0)) return; const d = dist(q, pt); if (d < bd) { bd = d; best = i; } });
  return [best, bd];
}
const bump = (S, i, d) => bumpRating(S, S.on[i], d);
const pstat = (S, i, k, n = 1) => { const id = S.on[i]; if (!id) return; const x = S.ps[id] || (S.ps[id] = {}); x[k] = (x[k] || 0) + n; };

// Which side has the ball this minute, and where the move starts.
function startMove(M) {
  const [H, W] = M.sides, c = M.carry;
  M.carry = null;
  if (c) {
    const L = M.sides[1 - c.side], X = M.sides[c.side];
    // Counter-press: the side that just lost the ball tries to win it straight back.
    if ((L.lost ?? 1) === 2 && c.y > 0.45) {
      const front = onPitch(L).filter(x => LINE[x.pos] >= 3);
      const wr = front.length ? front.reduce((t, x) => t + av(L, x.i, 'wor') + beh(L, x.i, 'pr') * 2, 0) / front.length : 8;
      if (R() < clamp(0.14 + (wr - 12) * 0.025 - (av(X, 0, 'cmp') - 10) * 0.005, 0.05, 0.35)) {
        L.st.cp = (L.st.cp || 0) + 1;
        return { s: L.idx, x: 1 - c.x, y: clamp(1 - c.y, 0.32, 0.6), counter: R() < 0.5, regain: true };
      }
    }
    return { s: c.side, x: c.x, y: c.y, counter: c.counter };
  }
  const s = R() < possShare(H, W) ? 0 : 1, S = M.sides[s], O = M.sides[1 - s];
  // Build-up start: deeper against a high press, higher for an attacking side.
  const r = R(), op = O.press ?? 1;
  const y = r < 0.18 + op * 0.06 ? 0.9 : r < 0.62 ? rf(0.55, 0.78) : rf(0.4, 0.55) - ((S.ment ?? 2) - 2) * 0.03;
  return { s, x: rf(0.25, 0.75), y, counter: false };
}

function chooseAction(M, S, O, i, x, y, posS, posO, pressure, counter, step) {
  const pk = k => av(S, i, k), b = k => beh(S, i, k);
  const gk = i === 0, pass = S.pass ?? 1, tempo = S.tempo ?? 1, width = S.width ?? 1, ment = S.ment ?? 2;
  const inBox = y < 0.165 && x > 0.2 && x < 0.8, wide = x < 0.2 || x > 0.8;
  const runners = posS.filter((q, j) => q && j && j !== i && q[1] < y - 0.06 && (LINE[FORMATIONS[S.ip][j][0]] >= 4 || beh(S, j, 'run') > 0.2)).length;
  const box = posS.filter((q, j) => q && j && j !== i && q[1] < 0.24 && q[0] > 0.25 && q[0] < 0.75).length;
  const w = {};
  if (!gk) {
    if (y < 0.3) w.shot = (0.32 - y) * 3.2 * (inBox ? 2 : 1) * (1 + b('sh') * 0.6) * (pk('fin') / 12) * [0.75, 0.88, 1, 1.12, 1.25][ment];
    else if (y < 0.34) w.shot = 0.3 * (1 + b('sh') * 0.8) * ((pk('fin') + pk('fla')) / 24) * (ment >= 3 ? 1.3 : 1);
    if (wide && y < 0.42 && box) w.cross = 0.9 * [0.6, 1, 1.45][width] * (1 + b('cr') * 0.7) * (pk('cro') / 12) * (1 + box * 0.15);
    w.drib = 0.32 * (inBox ? 1.6 : 1) * ((pk('dri') + pk('fla')) / 24) * (1 + b('dr') * 0.7) * (1 - pressure * 0.3) * (y < 0.5 ? 1.25 : 0.8);
    if (runners && y < 0.7) w.thru = 0.15 * (pk('vis') / 12) * (1 + b('thr') * 0.7 + b('rk') * 0.3) * [0.75, 1, 1.25][pass] * [0.6, 1, 1.45][O.line ?? 1] * (counter ? 1.5 : 1) * [0.8, 1, 1.2][tempo];
  }
  if (y > 0.42) w.long = [0.06, 0.25, 0.85][pass] * (gk ? 1.6 + b('rk') * -0.5 : 1) * (posS.some((q, j) => q && j && beh(S, j, 'aer') > 0.5) ? 1.4 : 1) * (counter ? 1.25 : 1);
  w.pass = (gk ? 1 + b('rk') * 0.6 : 1.25) * [1.3, 1, 0.72][pass] * (counter ? 1.2 : 1);
  if (step) w.keep = [0.9, 0.45, 0.2][tempo] * (pressure > 0.5 ? 1.2 : 1) * (y < 0.4 ? 0.8 : 1) * (1 - b('rk') * 0.3);
  // Better decision makers choose the best option more often.
  const sharp = 0.6 + pk('dec') / 22, keys = Object.keys(w);
  return wpick(keys, k => Math.pow(Math.max(w[k], 0.001), sharp));
}

// Shot: chance quality from the position, then finishing against the keeper.
function takeShot(M, S, O, ev, seq, i, x, y, o = {}) {
  const p = G.players[S.on[i]];
  if (!p) return;
  const gkI = 0, gk = G.players[O.on[0]];
  const d = metres(x, y), ang = Math.max(0.25, 1 - Math.abs(x - 0.5) * 1.6);
  let xg = o.pen ? 0.76 : clamp(0.75 * Math.exp(-d / 7.8) * ang, 0.01, 0.65);
  if (o.header) xg *= 0.55 * (o.del ? 0.8 + o.del / 50 : 1);
  if (o.oneOnOne) xg = Math.max(xg, rf(0.25, 0.42));
  if (o.fk) xg = rf(0.05, 0.11);
  const weak = !o.header && !o.pen && p.foot !== 'Either' && R() < ((x < 0.45) === (p.foot === 'Right') ? 0.4 : 0.12);
  if (weak) xg *= 0.8;
  if (!o.pen) xg = clamp(xg * (1 - (o.pressure || 0) * 0.3) * tune('xgScale') * M.mod.xg * (S.idx === 0 ? tune('homeShot') * M.mod.home : 1) * (1 + S.boost - O.guard), 0.01, 0.85);
  // Blocked by a defender in the way?
  const [bi, bd] = o.pen || o.fk ? [-1, 9] : nearest(o.posO || [], [x, y * 0.6]);
  S.st.sh++; S.st.xg += xg; pstat(S, i, 'sh');
  const step = { k: o.header ? 'head' : 'shot', s: S.idx, pid: p.id, x0: x, y0: y, x1: 0.5 + rf(-0.05, 0.05), y1: 0, xg };
  seq.push(step);
  Object.assign(ev, { t: 'shot', pid: p.id, xg, pen: !!o.pen, sp: !!o.header, ck: !!o.ck, fk: !!o.fk, aid: o.aid || null, key: true });
  if (bi > 0 && R() < clamp(0.3 * (1 - bd / 0.1), 0, 0.28) * (av(O, bi, 'pos') + av(O, bi, 'ant')) / 22) {
    step.res = 'block'; step.x1 = O.pos[bi][0]; step.y1 = O.pos[bi][1]; ev.t = 'miss'; ev.block = true;
    pstat(O, bi, 'blk'); bump(O, bi, 0.1);
    if (R() < 0.45) { S.st.co++; ev.corner = true; S.ckDue = true; }
    return;
  }
  const fin = o.header ? (aerialAt(S, i) + av(S, i, 'fin')) / 2 : o.fk ? fkSkill(p) : av(S, i, 'fin');
  const gkv = o.oneOnOne ? av(O, gkI, 'one') * 5 : O.u.gk;
  const pg = xg * (0.75 + (fin - 10) / 30) * (1.25 - gkv / 250) * (0.92 + 0.08 * av(S, i, 'cmp') / 10) * (1 - gkReach(gk));
  if (R() < pg) {
    S.st.g++; S.st.sot++; pstat(S, i, 'sot');
    ev.t = 'goal'; step.res = 'goal';
    S.goals.push({ min: M.min, pid: p.id, aid: ev.aid, pen: !!o.pen });
    bumpRating(S, p.id, o.pen ? 0.6 : 1.0); bumpRating(S, ev.aid, 0.6);
    S.on.forEach(id => bumpRating(S, id, 0.05));
    onPitch(O).forEach(z => bumpRating(O, z.p.id, z.pos === 'GK' ? -0.35 : LINE[z.pos] <= 2 ? -0.22 : -0.05));
  } else if (R() < clamp(0.32 + xg * 0.7, 0, 0.95)) {
    S.st.sot++; pstat(S, i, 'sot'); pstat(O, 0, 'sv');
    ev.t = 'save'; step.res = 'save'; step.x1 = 0.5 + rf(-0.04, 0.04); step.y1 = 0.03;
    bumpRating(S, p.id, 0.1); bumpRating(O, O.on[0], 0.15 + xg * 0.5);
    if (R() < 0.33) { S.st.co++; ev.corner = true; S.ckDue = true; }
  } else {
    ev.t = 'miss'; step.res = 'miss'; step.x1 = 0.5 + (R() < 0.5 ? -1 : 1) * rf(0.1, 0.2); step.y1 = -0.01;
    bumpRating(S, p.id, -0.05);
    if (R() < 0.16) { S.st.co++; ev.corner = true; S.ckDue = true; }
  }
}

// A foul by O's player in slot di on S's player in slot i at (x, y). Returns 'pen' | 'fk' | 'play'.
function chainFoul(M, S, O, evs, seq, i, di, x, y) {
  const fp = G.players[O.on[di]];
  O.st.fo++; pstat(O, di, 'fo');
  const ev = { min: M.min, side: S.idx, t: 'foul', pid: fp.id, fside: O.idx };
  const ycP = 0.15 * (1 + 0.25 * ((O.press ?? 1) - 1)) * (1 - O.calm) * cardMul(fp) * (1 + beh(O, di, 'tk') * 0.35) * (1 - ((O.capLdr ?? 10) - 10) * 0.008) * (y < 0.35 ? 1.1 : 1);
  if (R() < 0.0015 * cardMul(fp)) sendOff(M, O, fp.id, ev);
  else if (R() < ycP * (O.yc[fp.id] ? 0.35 : 1)) { // a booked player is more careful
    if (O.yc[fp.id]) { sendOff(M, O, fp.id, ev); ev.second = true; }
    else { O.yc[fp.id] = 1; O.st.yc++; ev.t = 'yellow'; bumpRating(O, fp.id, -0.3); }
  }
  seq.push({ k: 'foul', s: S.idx, pid: fp.id, x0: x, y0: y, x1: x, y1: y });
  if (ev.t !== 'foul') evs.push(ev); else if (y < 0.4) evs.push(ev);
  if (y < 0.165 && x > 0.2 && x < 0.8) return 'pen';
  return y < 0.33 ? 'fk' : 'play';
}

// Set pieces: a corner or a free kick delivered into the box, or a direct free kick.
function setPiece(M, S, O, ev, seq, kind, x, y) {
  const posS = positions(S, true, 0.5, 0.15), posO = positions(O, false, 0.5, 0.85).map(flip);
  S.pos = posS; O.pos = posO;
  if (kind === 'fk') {
    const t = taker(S, 'fk'), i = S.on.indexOf(t.p.id);
    return takeShot(M, S, O, ev, seq, i, x, y, { fk: true });
  }
  const t = taker(S, kind === 'ck' ? 'ck' : 'fk'), ti = S.on.indexOf(t.p.id);
  const fx = kind === 'ck' ? (R() < 0.5 ? 0.02 : 0.98) : x, fy = kind === 'ck' ? 0.005 : y;
  const cands = posS.map((q, j) => (q && j && j !== ti ? j : -1)).filter(j => j > 0);
  const hi = wpick(cands, j => Math.pow(aerialAt(S, j), 2) * (1 + beh(S, j, 'aer')) * (LINE[FORMATIONS[S.ip][j][0]] === 1 ? 1.2 : 1));
  const target = [rf(0.38, 0.62), rf(0.06, 0.13)];
  const [di] = nearest(posO, target);
  seq.push({ k: 'cross', s: S.idx, pid: t.p.id, x0: fx, y0: fy, x1: target[0], y1: target[1], to: S.on[hi] });
  const a = aerialAt(S, hi) * 0.7 + av(S, hi, 'str') * 0.2 + av(S, hi, 'otb') * 0.1 + (av(S, ti, 'cro') - 10) * 0.3;
  const d = di > 0 ? aerialAt(O, di) * 0.7 + av(O, di, 'str') * 0.2 + av(O, di, 'mar') * 0.1 : 8;
  if (R() < duel(a, d, kind === 'ck' ? tune('cornerShot') : 0.35)) takeShot(M, S, O, ev, seq, hi, target[0], target[1], { header: true, del: av(S, ti, 'cro'), aid: t.p.id, ck: kind === 'ck', posO });
  else { seq.push({ k: 'clear', s: O.idx, pid: O.on[di], x0: target[0], y0: target[1], x1: rf(0.3, 0.7), y1: rf(0.3, 0.45) }); if (di > 0) pstat(O, di, 'aer'); }
}

/* One minute of play. Returns the main event (with seq) and any extra events (cards). */
function playMinute(M) {
  const evs = [];
  M.sides.forEach(X => refreshForm(M, X));
  // A corner won last minute is taken now.
  const ckSide = M.sides.findIndex(X => X.ckDue);
  M.sides.forEach(X => { X.ckDue = false; });
  if (ckSide >= 0) {
    const S = M.sides[ckSide], O = M.sides[1 - ckSide], ev = { min: M.min, side: ckSide, t: 'poss', seq: [], ck: true, key: true };
    S.st.pos++;
    setPiece(M, S, O, ev, ev.seq, 'ck', 0, 0);
    if (ev.t === 'poss') M.carry = { side: O.idx, x: 0.5, y: 0.65, counter: (O.won ?? 1) === 2 };
    return [ev, ...evs];
  }
  const st = startMove(M), S = M.sides[st.s], O = M.sides[1 - st.s];
  S.st.pos++;
  const ev = { min: M.min, side: S.idx, t: 'poss', seq: [], counter: st.counter };
  if (st.regain) ev.seq.push({ k: 'regain', s: S.idx, x0: st.x, y0: st.y, x1: st.x, y1: st.y });
  const seq = ev.seq;
  // Background passing that is not shown: keeps pass counts and completion realistic.
  const nPass = Math.round([13, 9.5, 7][S.tempo ?? 1] * [1.15, 1, 0.75][S.pass ?? 1] * rf(0.6, 1.3));
  const rate = clamp(0.86 - (O.press ?? 1) * 0.025 + (S.u.mid - O.u.mid) / 300 - (M.mod.wind < 1 ? 0.01 : 0), 0.72, 0.97);
  S.st.pa = (S.st.pa || 0) + nPass; S.st.pc = (S.st.pc || 0) + Math.round(nPass * rate);
  let x = st.x, y = st.y, i = -1, counter = st.counter, lastPasser = null;
  const turnover = (tx, ty) => {
    const won = O.won ?? 1, regroup = (S.lost ?? 1) === 0;
    const c = won === 2 ? !regroup || R() < 0.5 : won === 1 ? R() < 0.25 : false;
    M.carry = { side: O.idx, x: 1 - tx, y: won === 0 ? Math.min(0.85, 1 - ty + 0.15) : 1 - ty, counter: c && ty < 0.6 };
  };
  for (let step = 0; step < 8; step++) {
    const posS = positions(S, true, x, y), posO = positions(O, false, 1 - x, 1 - y).map(flip);
    S.pos = posS; O.pos = posO;
    if (i < 0 || !S.on[i]) i = y > 0.87 ? 0 : nearest(posS, [x, y])[0];
    if (i < 0) break;
    const [di, dd] = nearest(posO, [x, y]);
    const pressure = di > 0 ? clamp(1 - dd / 0.16, 0, 1) * (0.85 + beh(O, di, 'pr') * 0.2) * (av(O, di, 'wor') / 13) : 0;
    const act = chooseAction(M, S, O, i, x, y, posS, posO, pressure, counter, step);
    const p0 = [x, y], A0 = S.on[i];
    if (act === 'shot') { takeShot(M, S, O, ev, seq, i, x, y, { pressure, aid: lastPasser, posO }); break; }
    if (act === 'keep') { // keep the ball: a safe pass sideways or back; patient sides keep probing, others reset
      const nx = clamp(x + rf(-0.3, 0.3), 0.1, 0.9), ny = clamp(y + rf(0.03, 0.12), 0.1, 0.9);
      seq.push({ k: 'pass', s: S.idx, pid: A0, x0: x, y0: y, x1: nx, y1: ny, res: 'ok', quiet: true });
      if (R() < [0.3, 0.5, 0.7][S.tempo ?? 1]) break;
      x = nx; y = ny; i = nearest(posS, [nx, ny], false, i)[0]; counter = false;
      continue;
    }
    if (act === 'pass' || act === 'thru' || act === 'long') {
      let j = -1, tgt = null, close = 0, base, a, d, ii = -1;
      if (act === 'pass') {
        const opts = posS.map((q, k) => (q && k && k !== i && q[1] < y + 0.08 && dist(q, p0) < 0.34 ? k : -1)).filter(k => k > 0);
        if (!opts.length) { i = -1; continue; }
        j = wpick(opts, k => { const op = nearest(posO, posS[k])[1]; return Math.pow(op + 0.02, 1.5) * (1 + Math.max(0, y - posS[k][1]) * 3) * (posS[k][1] < 0.17 ? 0.6 : 1) * (1 + av(S, k, 'otb') / 40); });
        tgt = posS[j];
        base = 0.86 + (1 - (S.pass ?? 1)) * 0.04 - pressure * 0.1 - dist(tgt, p0) * 0.25 - (M.mod.xg < 1 ? 0.02 : 0);
        a = avg2(S, i, [['pas', 1], ['vis', 0.3], ['cmp', 0.3 * pressure]]) * 0.75 + av(S, j, 'fir') * 0.25;
      } else if (act === 'thru') {
        const opts = posS.map((q, k) => (q && k && k !== i && q[1] < y - 0.06 && (LINE[FORMATIONS[S.ip][k][0]] >= 4 || beh(S, k, 'run') > 0.2) ? k : -1)).filter(k => k > 0);
        if (!opts.length) { i = -1; continue; }
        j = wpick(opts, k => (av(S, k, 'otb') + av(S, k, 'pac')) * (1 + beh(S, k, 'run')));
        const line = offsideLine(O, positions(O, false, 1 - x, 1 - y));
        // Timing of the run against the line. Precise: offside only if he is beyond the line when the pass is played.
        const timing = gauss() * 0.032 + 0.011 + (avg2(S, j, [['otb', 1], ['dec', 0.6], ['ant', 0.6]]) - 12) * 0.003 - (O.line === 2 ? 0.006 : 0)
          - (onPitch(O).filter(z => LINE[z.pos] === 1).reduce((t, z) => t + av(O, z.i, 'tea') + av(O, z.i, 'ant'), 0) / Math.max(1, onPitch(O).filter(z => LINE[z.pos] === 1).length * 2) - 12) * 0.002;
        const ry = line + timing;
        if (ry < line) {
          S.st.off = (S.st.off || 0) + 1; pstat(S, j, 'off');
          seq.push({ k: 'thru', s: S.idx, pid: A0, x0: x, y0: y, x1: posS[j][0], y1: Math.max(0.05, ry - 0.05), to: S.on[j], res: 'offside', line, ry });
          Object.assign(ev, { t: 'offside', pid: S.on[j], key: true });
          M.carry = { side: O.idx, x: 1 - posS[j][0], y: 1 - ry, counter: false };
          break;
        }
        tgt = [posS[j][0], Math.max(0.06, line - rf(0.04, 0.12))];
        base = 0.32 + ((O.line ?? 1) === 2 ? 0.08 : 0) + (counter ? 0.08 : 0);
        a = avg2(S, i, [['pas', 0.6], ['vis', 0.7], ['tea', 0.2]]) + beh(S, i, 'rk') * 0.8;
      } else {
        const opts = posS.map((q, k) => (q && k && k !== i && q[1] < y - 0.15 ? k : -1)).filter(k => k > 0);
        if (!opts.length) { i = -1; continue; }
        j = wpick(opts, k => Math.pow(aerialAt(S, k), 2) * (1 + beh(S, k, 'aer') * 2) * (LINE[FORMATIONS[S.ip][k][0]] >= 4 ? 2.5 : 0.4));
        tgt = [posS[j][0], posS[j][1]];
        base = 0.6 * M.mod.wind;
        a = i === 0 ? av(S, 0, 'kic') : avg2(S, i, [['pas', 1], ['vis', 0.3]]);
      }
      const mid = [(p0[0] + tgt[0]) / 2, (p0[1] + tgt[1]) / 2];
      const [ia, ida] = nearest(posO, act === 'pass' ? mid : tgt);
      ii = ia; close = clamp(1 - ida / 0.12, 0.1, 1) * (1 + (ii > 0 ? beh(O, ii, 'mk') * 0.25 : 0));
      d = ii > 0 ? avg2(O, ii, act === 'long' ? [['hea', 0.6], ['str', 0.3], ['pos', 0.3]] : [['ant', 0.5], ['pos', 0.3], ['mar', 0.2]]) + (act === 'long' ? clamp(((G.players[O.on[ii]].ht || 182) - 182) / 4, -3, 4) * 0.6 : 0) : 6;
      if (act === 'long') a = a * 0.4 + (aerialAt(S, j) + av(S, j, 'str') * 0.5 + beh(S, j, 'hold') * 2) / 1.5 * 0.6;
      S.st.pa++; pstat(S, i, 'pa');
      const ok = R() < duel(a + S.boost * 20, d + O.guard * 20, base, close);
      seq.push({ k: act, s: S.idx, pid: A0, x0: x, y0: y, x1: tgt[0], y1: tgt[1], to: S.on[j], oid: ii > 0 ? O.on[ii] : null, res: ok ? 'ok' : 'lost' });
      if (!ok) {
        if (ii > 0) { pstat(O, ii, act === 'long' ? 'aer' : 'int'); bump(O, ii, 0.05); }
        bump(S, i, -0.03);
        turnover(tgt[0], tgt[1]);
        break;
      }
      S.st.pc++; pstat(S, i, 'pc');
      if (tgt[1] < 0.3) { pstat(S, i, 'kp'); bump(S, i, 0.06); }
      lastPasser = A0;
      x = tgt[0]; y = tgt[1]; i = j;
      if (act === 'thru') {
        // Race for the ball in behind: runner's pace against the recovering defender (or a sweeper keeper).
        const [ri2] = nearest(posO, tgt);
        const sweep = beh(O, 0, 'sweep') > 0 && y < 0.2;
        const da = sweep ? avg2(O, 0, [['one', 1], ['pac', 0.6], ['ant', 0.4]]) : ri2 > 0 ? avg2(O, ri2, [['pac', 1], ['ant', 0.5], ['agi', 0.3]]) : 6;
        if (R() < duel(avg2(S, j, [['pac', 1], ['fir', 0.5], ['otb', 0.3]]), da, 0.45)) {
          takeShot(M, S, O, ev, seq, j, x, Math.max(0.07, y - 0.05), { oneOnOne: true, aid: A0, posO: [] });
          break;
        }
        seq.push({ k: 'tackle', s: O.idx, pid: sweep ? O.on[0] : O.on[ri2], x0: x, y0: y, x1: x, y1: y });
        if (!sweep && ri2 > 0) pstat(O, ri2, 'tk');
        turnover(x, y); break;
      }
      if (act === 'long') { // won in the air: a flick-on for a runner near the box, or a knock-down to the nearest team-mate
        const run = posS.map((q, k) => (q && k && k !== j && q[1] < y + 0.05 && beh(S, k, 'run') > 0 ? k : -1)).filter(k => k > 0);
        if (y < 0.42 && run.length && R() < 0.38 + beh(S, j, 'hold') * 0.15) {
          const k3 = wpick(run, k => av(S, k, 'otb') * (1 + beh(S, k, 'run')));
          const nt = [posS[k3][0], Math.max(0.08, y - rf(0.06, 0.12))];
          seq.push({ k: 'pass', s: S.idx, pid: S.on[j], x0: x, y0: y, x1: nt[0], y1: nt[1], to: S.on[k3], res: 'ok', flick: true });
          lastPasser = S.on[j]; i = k3; x = nt[0]; y = nt[1]; pstat(S, j, 'kp');
          continue;
        }
        const [k2] = nearest(posS, tgt, true, j);
        if (k2 > 0) { i = k2; x = clamp(x + rf(-0.08, 0.08), 0.05, 0.95); y = clamp(y + rf(-0.02, 0.05), 0.05, 0.95); }
      }
      counter = counter && step < 2;
      continue;
    }
    if (act === 'drib') {
      const dp = di > 0 ? G.players[O.on[di]] : null;
      const a = avg2(S, i, [['dri', 0.4], ['agi', 0.2], ['pac', 0.2], ['fla', 0.1], ['fir', 0.1], ['str', 0.05 + beh(S, i, 'hold') * 0.2]]);
      const d = di > 0 ? avg2(O, di, [['tck', 0.45], ['agi', 0.15], ['pac', 0.2], ['ant', 0.2]]) + beh(O, di, 'tk') * 0.8 : 5;
      const close = di > 0 ? clamp(1 - dd / 0.14, 0.15, 1) : 0;
      const ok = R() < duel(a + S.boost * 20, d + O.guard * 20, 0.52 - pressure * 0.08, close);
      const nx = clamp(x + (x < 0.5 ? 1 : -1) * beh(S, i, 'wd') * -0.05 + rf(-0.05, 0.05), 0.04, 0.96), ny = clamp(y - rf(0.06, 0.15), 0.03, 0.95);
      pstat(S, i, 'da');
      if (ok) {
        pstat(S, i, 'dw'); bump(S, i, 0.06); if (di > 0) bump(O, di, -0.03);
        seq.push({ k: 'drib', s: S.idx, pid: A0, oid: di > 0 ? O.on[di] : null, x0: x, y0: y, x1: nx, y1: ny, res: 'ok' });
        x = nx; y = ny; counter = counter && step < 2;
        continue;
      }
      // Lost the take-on: a clean tackle or a foul.
      const foulP = 0.24 * (1 + beh(O, di, 'tk') * 0.5) * (dp && dp.pers === 'Temperamental' ? 1.3 : 1) * (1 + (10 - av(O, di, 'tck')) / 25) * M.mod.foul * (1 - O.calm * 0.5) * (y < 0.165 ? 1.1 : 1);
      seq.push({ k: 'drib', s: S.idx, pid: A0, oid: dp ? dp.id : null, x0: x, y0: y, x1: x + (nx - x) * 0.3, y1: y + (ny - y) * 0.3, res: 'lost' });
      if (dp && R() < foulP) {
        const r = chainFoul(M, S, O, evs, seq, i, di, x, y);
        if (r === 'pen') {
          const t = S.pk && S.on.includes(S.pk) ? S.on.indexOf(S.pk) : S.on.indexOf(taker(S, 'pk').p.id);
          takeShot(M, S, O, ev, seq, t >= 0 ? t : i, 0.5, 0.105, { pen: true });
          if (ev.t !== 'goal' && ev.t !== 'save') ev.t = 'miss';
          break;
        }
        if (r === 'fk') { setPiece(M, S, O, ev, seq, R() < 0.45 ? 'fk' : 'hd', x, y); if (ev.t === 'poss') turnover(0.5, 0.25); break; }
        continue; // free kick in a harmless area: play on
      }
      if (dp) { pstat(O, di, 'tk'); bump(O, di, 0.06); }
      bump(S, i, -0.04);
      turnover(x, y); break;
    }
    if (act === 'cross') {
      const p = G.players[A0], natural = p.foot === 'Either' || (x < 0.5) === (p.foot === 'Left');
      const cands = posS.map((q, k) => (q && k && k !== i && q[1] < 0.3 ? k : -1)).filter(k => k > 0);
      if (!cands.length) { i = -1; continue; }
      const t = wpick(cands, k => (aerialAt(S, k) + av(S, k, 'otb')) * (1 + beh(S, k, 'aer')));
      const tgt = [clamp(posS[t][0], 0.32, 0.68), clamp(posS[t][1], 0.05, 0.16)];
      const [dI] = nearest(posO, tgt);
      S.st.cr = (S.st.cr || 0) + 1; pstat(S, i, 'cr');
      const del = av(S, i, 'cro') - (natural ? 0 : 2);
      // The keeper may come and claim it.
      const claim = 0.1 * (av(O, 0, 'han') + clamp(((G.players[O.on[0]] || {}).ht - 188) / 3 || 0, -2, 3)) / 12;
      if (R() < claim) {
        seq.push({ k: 'cross', s: S.idx, pid: A0, x0: x, y0: y, x1: tgt[0], y1: tgt[1], to: S.on[t], res: 'claim', oid: O.on[0] });
        pstat(O, 0, 'cl'); turnover(tgt[0], 0.05); break;
      }
      const a = aerialAt(S, t) * 0.65 + av(S, t, 'str') * 0.15 + av(S, t, 'otb') * 0.2 + (del - 10) * 0.35;
      const d = dI > 0 ? aerialAt(O, dI) * 0.65 + av(O, dI, 'str') * 0.15 + av(O, dI, 'mar') * 0.2 : 6;
      if (dI > 0 && R() < 0.02 * (1 + beh(O, dI, 'tk') * 0.4) * (G.players[O.on[dI]].pers === 'Temperamental' ? 1.3 : 1)) {
        seq.push({ k: 'cross', s: S.idx, pid: A0, x0: x, y0: y, x1: tgt[0], y1: tgt[1], to: S.on[t], res: 'foul' });
        chainFoul(M, S, O, evs, seq, t, dI, tgt[0], tgt[1]);
        const pt = S.pk && S.on.includes(S.pk) ? S.on.indexOf(S.pk) : S.on.indexOf(taker(S, 'pk').p.id);
        takeShot(M, S, O, ev, seq, pt, 0.5, 0.105, { pen: true });
        break;
      }
      const ok = R() < duel(a, d, 0.3 * M.mod.wind);
      seq.push({ k: 'cross', s: S.idx, pid: A0, x0: x, y0: y, x1: tgt[0], y1: tgt[1], to: S.on[t], oid: dI > 0 ? O.on[dI] : null, res: ok ? 'ok' : 'lost' });
      if (ok) { pstat(S, i, 'kp'); takeShot(M, S, O, ev, seq, t, tgt[0], tgt[1], { header: true, del, aid: A0, posO }); break; }
      if (dI > 0) { pstat(O, dI, 'aer'); bump(O, dI, 0.04); }
      if (R() < 0.38) { S.st.co++; ev.corner = true; S.ckDue = true; break; }
      turnover(tgt[0], 0.2); break;
    }
  }
  if (seq.some(s => s.y1 < 0.36 || s.k === 'regain') || ev.t !== 'poss') ev.key = true;
  // Fouls away from the ball, in midfield battles.
  if (R() < tune('foulRate') * 1.1 * M.mod.foul * (1 + 0.25 * ((O.press ?? 1) - 1))) {
    const cands = onPitch(O).filter(z => z.pos !== 'GK');
    const f = wpick(cands, z => (LINE[z.pos] <= 2 ? 1.2 : 1) * (z.p.at[A.tck] < 10 ? 1.3 : 1) * (z.p.at[A.ant] < 9 ? 1.2 : 1) * (1 + beh(O, z.i, 'pr') * 0.3));
    if (f) {
      // Where the foul happens; a foul in the final third gives a dangerous free kick if nothing else happened this minute.
      const fx = rf(0.15, 0.85), fy = rf(0.18, 0.85), fe = [];
      const r = chainFoul(M, S, O, fe, ev.t === 'poss' ? seq : [], 1, f.i, fx, Math.max(0.18, fy));
      fe.forEach(e => evs.push(e));
      if (r === 'fk' && ev.t === 'poss') { setPiece(M, S, O, ev, seq, R() < 0.5 ? 'fk' : 'hd', fx, Math.max(0.18, fy)); ev.key = true; }
    }
  }
  return [ev, ...evs];
}
