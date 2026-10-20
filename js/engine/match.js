'use strict';
/* ===== match.js =====
   Minute-by-minute match simulation, shared by the live 2D match and instant results.
   Team strength = attack, midfield and defence units plus the goalkeeper.
   Attack and midfield come from the in-possession shape, defence from the
   out-of-possession shape, so both formations matter. */

const POS_SHOT = { GK: 0, DL: .35, DR: .35, DC: .3, DM: .6, ML: 1.2, MR: 1.2, MC: 1, AML: 2.4, AMR: 2.4, AMC: 2.4, ST: 4.2 };
const POS_ASSIST = { GK: .1, DL: 1, DR: 1, DC: .3, DM: .8, ML: 1.6, MR: 1.6, MC: 1.5, AML: 1.8, AMR: 1.8, AMC: 2.2, ST: 1 };

const cAtt = p => { const a = p.at; return (a[A.fin] * 1.3 + a[A.dri] + a[A.pas] + a[A.vis] + a[A.fir] + a[A.pac] + a[A.cmp] + a[A.cro] * 0.5) / 7.8 * 5; };
const cMid = p => { const a = p.at; return (a[A.pas] * 1.3 + a[A.vis] + a[A.dec] + a[A.fir] + a[A.wor] + a[A.sta] + a[A.tck] * 0.6 + a[A.cmp] * 0.6) / 7.5 * 5; };
const cDef = p => { const a = p.at; return (a[A.tck] * 1.2 + a[A.mar] * 1.2 + a[A.pos] * 1.2 + aerial(p) * 0.8 + a[A.str] * 0.7 + a[A.dec] + a[A.pac] * 0.6 + a[A.wor] * 0.5) / 7.2 * 5; };

// Map each in-possession slot to the nearest out-of-possession slot (GK to GK).
function shapeMap(ipN, oopN) {
  const a = FORMATIONS[ipN], b = FORMATIONS[oopN], pairs = [];
  a.forEach((s, i) => b.forEach((t, j) => {
    if ((i === 0) !== (j === 0)) return;
    pairs.push([Math.hypot(s[1] - t[1], (s[2] - t[2]) * 1.3), i, j]);
  }));
  pairs.sort((x, y) => x[0] - y[0]);
  const map = Array(11).fill(-1), used = new Set();
  for (const [, i, j] of pairs) { if (map[i] >= 0 || used.has(j)) continue; map[i] = j; used.add(j); }
  return map;
}

function buildSide(cid, idx) {
  const c = G.clubs[cid], user = cid === G.club;
  let tac, xi, bench, roles;
  if (user) { ensureUserLineup(); tac = G.tactics; xi = tac.slots.slice(); bench = tac.bench.slice(); roles = tac.roles.slice(); }
  else { tac = c.tac; const pk = autoPick(cid, tac.ip); xi = pk.xi; bench = pk.bench; roles = Array(11).fill(0); }
  const S = {
    cid, idx, user, ip: tac.ip, oop: tac.oop, roles, ment: tac.ment, tempo: tac.tempo, width: tac.width, press: tac.press, line: tac.line, pass: tac.pass,
    pk: user ? tac.pk : null, on: xi, bench, off: [], subs: 0, wins: 0, lastSubMin: -1, cond: {}, rat: {}, yc: {}, reds: [], injuries: [],
    played: xi.filter(Boolean), st: { g: 0, sh: 0, sot: 0, xg: 0, pos: 0, fo: 0, yc: 0, rc: 0, co: 0 }, goals: [],
    banned: c.squad.filter(id => G.players[id] && G.players[id].ban > 0), u: null, map: shapeMap(tac.ip, tac.oop), boost: 0, guard: 0, calm: 0,
  };
  xi.concat(bench).forEach(id => { if (id) { S.cond[id] = G.players[id].cond; S.rat[id] = 6.5; } });
  S.startCond = avg(xi.filter(Boolean), id => G.players[id].cond);
  return S;
}

// Conditions for one match: weather plus kick-off time.
function matchMods(fx) {
  const w = (fx.wx && WEATHER[fx.wx.k]) || {}, t = fx.t || '15:00';
  return { drain: w.drain || 1, xg: w.xg || 1, shot: (w.shot || 1) * (t < '13:00' ? 0.98 : 1), foul: w.foul || 1, inj: w.inj || 1, wind: w.wind || 1, home: t >= '19:00' ? 1.03 : 1 };
}

function createMatch(fx) {
  // Real fixtures: players recover for the days since their last match before teams are picked.
  if (fx.id > 0 && fx.w != null) [fx.h, fx.a].forEach(cid => squadOf(cid).forEach(p => recoverTo(p, fxDayNo(fx))));
  const M = { fid: fx.id, min: 0, added: ri(1, 5), ended: false, dirty: false, mod: matchMods(fx), sides: [buildSide(fx.h, 0), buildSide(fx.a, 1)], log: [], shout: null };
  M.sides.forEach(S => calcUnits(S));
  return M;
}

const onPitch = S => S.on.map((id, i) => (id ? { p: G.players[id], i, pos: FORMATIONS[S.ip][i][0] } : null)).filter(Boolean);
const roleOf = (S, i) => ROLES[FORMATIONS[S.ip][i][0]][S.roles[i]] || {};
const pForm = (S, p) => (0.7 + 0.3 * (S.cond[p.id] ?? p.cond) / 100) * (0.94 + 0.12 * p.mor / 100) * (0.95 + 0.05 * p.shp / 100);

function calcUnits(S) {
  const ip = FORMATIONS[S.ip], oop = FORMATIONS[S.oop];
  let att = 0, wa = 0, mid = 0, wm = 0, def = 0, wd = 0, gk = 30, n = 0, nAtt = 0, nDef = 0, pace = 0;
  S.on.forEach((id, i) => {
    if (!id) return;
    n++;
    const p = G.players[id], slot = ip[i], f = pForm(S, p) * fam(p, slot[0]);
    if (slot[0] === 'GK') { gk = ratingFor(p.at, 'GK') * f; return; }
    const role = roleOf(S, i), y = slot[2], yo = oop[S.map[i]][2];
    const wA = clamp((0.8 - y) * 1.8, 0.08, 1), wM = clamp(1 - Math.abs(y - 0.52) * 2.6, 0.1, 1), wD = clamp((yo - 0.36) * 1.9, 0.08, 1);
    att += cAtt(p) * f * wA * (1 + (role.a || 0)); wa += wA;
    mid += cMid(p) * f * wM * (1 + (role.m || 0)); wm += wM;
    def += cDef(p) * f * wD * (1 + (role.d || 0)); wd += wD;
    if (y < 0.42) nAtt++;
    if (yo > 0.6) nDef++;
    pace += p.at[A.pac];
  });
  const famF = S.user ? 0.93 + 0.07 * G.training.fam / 100 : 0.985;
  S.u = { att: (att / (wa || 1)) * famF, mid: (mid / (wm || 1)) * famF, def: (def / (wd || 1)) * famF, gk, n, nAtt, nDef, pace: pace / Math.max(1, n - 1) };
}

function possShare(H, W) {
  const f = S => Math.pow(S.u.mid, 1.2) * (1 + 0.03 * (S.press - 1) + 0.02 * (S.line - 1) - 0.04 * (S.pass - 1)) * (S.u.n / 11);
  const a = f(H) * tune('homePoss'), b = f(W);
  return a / (a + b);
}

function shotChance(M, S, O) {
  const ratio = S.u.att / O.u.def;
  let p = tune('shotBase') * Math.pow(ratio, 1.1);
  p *= 1 + 0.08 * (S.ment - 2);
  p *= 1 + 0.05 * (O.ment - 2); // an attacking opponent leaves space
  p *= 1 + 0.06 * (S.tempo - 1) + 0.03 * (O.tempo - 1);
  p *= 1 + 0.03 * (S.width - 1) + 0.03 * (S.pass - 1);
  p *= 1 - 0.04 * (O.press - 1);
  if (O.line === 2) p *= 1 + 0.05 * (S.u.pace - 12) / 4;
  if (O.line === 0) p *= 0.96;
  p *= 0.85 + 0.05 * Math.min(S.u.nAtt, 5);
  p *= 1.12 - 0.03 * Math.min(O.u.nDef, 6);
  p *= (S.u.n / 11) * Math.sqrt(11 / Math.max(7, O.u.n));
  p *= 1 + S.boost - O.guard;
  if (S.idx === 0) p *= tune('homeShot') * M.mod.home; // home advantage, louder at night
  p *= M.mod.shot;
  if (S.pass === 2 || S.width === 2) p *= M.mod.wind;
  return clamp(p, 0.04, 0.75);
}

function drain(M, S) {
  const rate = (tune('fatigue') + 0.06 * (S.press - 1) + 0.03 * (S.tempo - 1)) * M.mod.drain;
  S.on.forEach((id, i) => {
    if (!id) return;
    const p = G.players[id];
    S.cond[id] = Math.max(15, S.cond[id] - rate * (1.5 - p.at[A.sta] / 20) * fatigueMul(p) * (i === 0 ? 0.3 : 1));
  });
}

const bumpRating = (S, id, d) => { if (id && S.rat[id] != null) S.rat[id] = clamp(S.rat[id] + d, 3, 10); };

function simMinute(M) {
  M.min++;
  const [H, W] = M.sides, evs = [];
  if (M.min % 5 === 0 || M.dirty) { calcUnits(H); calcUnits(W); M.dirty = false; }
  drain(M, H); drain(M, W);
  if (M.shout && M.min >= M.shout.until) { const S = M.sides[M.shout.side]; S.boost = 0; S.guard = 0; S.calm = 0; M.shout = null; }
  const s = R() < possShare(H, W) ? 0 : 1, S = M.sides[s], O = M.sides[1 - s];
  S.st.pos++;
  const ev = { min: M.min, side: s, t: 'poss' };
  evs.push(ev);
  if (R() < shotChance(M, S, O)) shoot(M, S, O, ev, false);
  else if (R() < tune('foulRate') * M.mod.foul) foul(M, O, S, ev);
  // Injuries: more likely in bad weather and for sides that started tired (fixture congestion).
  M.sides.forEach(X => {
    if (R() < (tune('injuryRate') / 2) * M.mod.inj * (1 + Math.max(0, 85 - (X.startCond ?? 100)) / 30)) { const e = injury(M, X); if (e) evs.push(e); }
  });
  if (M.min % 15 === 0) M.sides.forEach(X => X.on.forEach(id => bumpRating(X, id, gauss() * 0.07)));
  if (M.min === 45) ev.ht = true;
  if (M.min >= 90 + M.added) { M.ended = true; ev.ft = true; }
  evs.forEach(e => { if (e.t !== 'poss') M.log.push(e); });
  return evs;
}

function shoot(M, S, O, ev, setPiece) {
  const ratio = S.u.att / O.u.def;
  const cands = onPitch(S).filter(x => x.pos !== 'GK');
  if (!cands.length) return;
  const pen = !setPiece && R() < 0.025;
  let sh = null;
  if (pen && S.pk) sh = cands.find(x => x.p.id === S.pk);
  if (pen && !sh) sh = cands.slice().sort((a, b) => (b.p.at[A.fin] + b.p.at[A.cmp]) - (a.p.at[A.fin] + a.p.at[A.cmp]))[0];
  if (!sh) sh = wpick(cands, x => POS_SHOT[x.pos] * (1 + (roleOf(S, x.i).s || 0)) * (0.5 + (setPiece ? aerial(x.p) : x.p.at[A.fin]) / 10));
  const q = R();
  let xg = pen ? 0.78 : setPiece ? rf(0.03, 0.16) : q < 0.05 ? rf(0.3, 0.6) : q < 0.25 ? rf(0.08, 0.25) : rf(0.02, 0.08);
  if (!pen) xg = clamp(xg * clamp(Math.pow(ratio, 0.35), 0.75, 1.3) * tune('xgScale') * M.mod.xg, 0.01, 0.9);
  const a = sh.p.at, fin = setPiece ? (aerial(sh.p) + a[A.fin]) / 2 : a[A.fin];
  const gkId = O.on[0];
  const pg = xg * (0.75 + (fin - 10) / 30) * (1.25 - O.u.gk / 250) * (0.92 + 0.08 * a[A.cmp] / 10) * (1 - gkReach(G.players[gkId]));
  S.st.sh++; S.st.xg += xg;
  Object.assign(ev, { t: 'shot', pid: sh.p.id, xg, pen, sp: setPiece });
  if (R() < pg) {
    S.st.g++; S.st.sot++;
    ev.t = 'goal';
    let aid = null;
    if (!pen && R() < 0.78) {
      const mates = cands.filter(x => x.p.id !== sh.p.id);
      if (mates.length) aid = wpick(mates, x => POS_ASSIST[x.pos] * (x.p.at[A.pas] + x.p.at[A.vis] + x.p.at[A.cro] * 0.6)).p.id;
    }
    ev.aid = aid;
    S.goals.push({ min: M.min, pid: sh.p.id, aid, pen });
    bumpRating(S, sh.p.id, pen ? 0.6 : 1.0);
    bumpRating(S, aid, 0.6);
    S.on.forEach(id => bumpRating(S, id, 0.05));
    onPitch(O).forEach(x => bumpRating(O, x.p.id, x.pos === 'GK' ? -0.35 : LINE[x.pos] <= 2 ? -0.22 : -0.05));
  } else if (R() < clamp(0.3 + xg * 0.7, 0, 0.95)) {
    S.st.sot++;
    ev.t = 'save';
    bumpRating(S, sh.p.id, 0.1);
    bumpRating(O, gkId, 0.15 + xg * 0.5);
    if (R() < 0.3) { S.st.co++; ev.corner = true; }
  } else {
    ev.t = 'miss';
    bumpRating(S, sh.p.id, -0.05);
    if (R() < 0.25) { S.st.co++; ev.corner = true; }
  }
}

function foul(M, O, S, ev) {
  const cands = onPitch(O).filter(x => x.pos !== 'GK');
  if (!cands.length) return;
  const f = wpick(cands, x => (LINE[x.pos] <= 2 ? 1.3 : 1) * (x.p.at[A.tck] < 10 ? 1.3 : 1));
  O.st.fo++;
  Object.assign(ev, { t: 'foul', pid: f.p.id, fside: O.idx });
  const ycP = 0.14 * (1 + 0.3 * (O.press - 1)) * (1 - O.calm) * cardMul(f.p);
  if (R() < 0.006 * cardMul(f.p)) sendOff(M, O, f.p.id, ev);
  else if (R() < ycP) {
    if (O.yc[f.p.id]) { sendOff(M, O, f.p.id, ev); ev.second = true; }
    else { O.yc[f.p.id] = 1; O.st.yc++; ev.t = 'yellow'; bumpRating(O, f.p.id, -0.3); }
  } else if (R() < 0.05) {
    shoot(M, S, O, ev, true);
    ev.fk = true;
  }
}

function sendOff(M, S, id, ev) {
  S.on = S.on.map(x => (x === id ? null : x));
  S.reds.push(id); S.st.rc++;
  ev.t = 'red';
  bumpRating(S, id, -1.5);
  M.dirty = true;
}

function injury(M, S) {
  const cands = onPitch(S);
  if (!cands.length) return null;
  const x = wpick(cands, c => 1.7 - (S.cond[c.p.id] ?? 100) / 100), inj = pick(INJURIES);
  const physio = S.user ? staffAvg('Physio') : 10;
  const wk = Math.max(1, Math.round(rf(inj[1], inj[2]) * (1.25 - physio / 40)));
  S.injuries.push([x.p.id, wk, inj[0]]);
  S.cond[x.p.id] = Math.min(S.cond[x.p.id], 40);
  M.dirty = true;
  return { min: M.min, side: S.idx, t: 'inj', pid: x.p.id, inj: inj[0], wk };
}

function canSub(M, S) { return S.subs < 5 && (S.wins < 3 || S.lastSubMin === M.min || M.min === 45); }
function makeSub(M, S, outId, inId) {
  const idx = S.on.indexOf(outId);
  if (idx < 0 || !S.bench.includes(inId) || !canSub(M, S)) return null;
  if (S.lastSubMin !== M.min && M.min !== 45) S.wins++;
  S.lastSubMin = M.min;
  S.on[idx] = inId;
  S.bench = S.bench.filter(id => id !== inId);
  S.off.push(outId); S.subs++;
  if (!S.played.includes(inId)) S.played.push(inId);
  if (S.cond[inId] == null) { S.cond[inId] = G.players[inId].cond; S.rat[inId] = 6.5; }
  M.dirty = true;
  const ev = { min: M.min, side: S.idx, t: 'sub', pid: inId, out: outId };
  M.log.push(ev);
  return ev;
}

// Forced changes: injured players, and anyone close to exhaustion late on.
function injurySubs(M, S) {
  const evs = [];
  const bestBench = pos => S.bench.map(id => G.players[id]).filter(Boolean).sort((a, b) => ovrAt(b, pos) - ovrAt(a, pos))[0];
  const out = S.injuries.map(x => x[0]).filter(id => S.on.includes(id));
  if (M.min === 75) onPitch(S).forEach(x => { if (x.pos !== 'GK' && S.cond[x.p.id] < 55 && !out.includes(x.p.id)) out.push(x.p.id); });
  out.forEach(id => {
    if (!canSub(M, S)) return;
    const pos = FORMATIONS[S.ip][S.on.indexOf(id)][0], b = bestBench(pos);
    if (b && (pos === 'GK') === (b.pos === 'GK')) { const e = makeSub(M, S, id, b.id); if (e) evs.push(e); }
  });
  return evs;
}

// Computer manager: forced changes, then a tactical decision at each checkpoint (see brain.js).
function aiManage(M, S) {
  const evs = injurySubs(M, S);
  if (CHECKPOINTS.includes(M.min)) evs.push(...(S.user ? applyMgrOption(M, S, rulesDecision(M, S)) : brainDecide(M, S)));
  return evs;
}

function stepMatch(M, autoUser) {
  const evs = simMinute(M);
  M.sides.forEach(S => { if (!S.user || autoUser) evs.push(...aiManage(M, S)); });
  return evs;
}

function quickSim(fx) {
  const M = createMatch(fx);
  M.instant = fx.h === G.club || fx.a === G.club;
  while (!M.ended) stepMatch(M, true);
  finishMatch(M);
  return M;
}

function finishMatch(M) {
  brainScore(M);
  const fx = G.fixtures.find(f => f.id === M.fid);
  const [H, W] = M.sides;
  fx.hg = H.st.g; fx.ag = W.st.g;
  fx.goals = [].concat(...M.sides.map((S, si) => S.goals.map(g => [si, g.min, g.pid, g.pen ? 1 : 0]))).sort((a, b) => a[1] - b[1]);
  let motm = null, best = 0;
  M.sides.forEach((S, si) => {
    const O = M.sides[1 - si], r = Math.sign(S.st.g - O.st.g);
    S.played.forEach(id => {
      const p = G.players[id];
      if (!p) return;
      let rt = S.rat[id] + (r > 0 ? 0.3 : r < 0 ? -0.2 : 0);
      const defensive = p.pos === 'GK' || LINE[p.pos] === 1;
      if (O.st.g === 0 && defensive) { rt += 0.5; p.st.cs++; }
      rt = clamp(Math.round(rt * 10) / 10, 3, 10);
      S.rat[id] = rt;
      p.st.a++; p.st.rt += rt; p.car.a++;
      (G.flags.pw = G.flags.pw || []).push(id);
      p.cond = clamp(Math.round(S.cond[id]), 0, 100);
      p.shp = Math.min(100, p.shp + 10);
      p.mor = clamp(Math.round(p.mor + r * 4 + (rt - 6.8) * 3), 0, 100);
      if (rt > best) { best = rt; motm = id; }
    });
    S.goals.forEach(g => {
      const p = G.players[g.pid];
      if (p) { p.st.g++; p.car.g++; }
      if (g.aid && G.players[g.aid]) G.players[g.aid].st.as++;
    });
    S.banned.forEach(id => { const p = G.players[id]; if (p && p.ban > 0) p.ban--; });
    Object.keys(S.yc).forEach(id => {
      const p = G.players[id];
      if (!p || S.reds.includes(+id)) return;
      p.st.yc++;
      if (p.st.yc % 5 === 0) { p.ban += 1; if (S.user) addNews('club', pname(p) + ' suspended', `${fullName(p)} has collected ${p.st.yc} yellow cards and misses the next match.`); }
    });
    S.reds.forEach(id => { const p = G.players[id]; if (p) { p.ban += 1; p.st.rc++; } });
    S.injuries.forEach(([id, wk, n]) => {
      const p = G.players[id];
      if (!p) return;
      p.inj = { n, w: wk };
      if (S.user) addNews('club', pname(p) + ' injured', `${fullName(p)} suffered a ${n.toLowerCase()} and is expected to be out for ${wk} week${wk > 1 ? 's' : ''}.`);
    });
    // squad members who did not play feel the result a little
    if (S.user) squadOf(S.cid).forEach(p => { if (!S.played.includes(p.id) && lvlOf(p) === 'A') p.mor = clamp(p.mor + r * 1.5 - (p.status === 'Key player' ? 2 : 0), 0, 100); });
  });
  if (motm) { G.players[motm].st.mom++; fx.motm = motm; }

  // money: TV for both, gate for the home side
  const hc = G.clubs[fx.h], ac = G.clubs[fx.a];
  const tv = 0.9e6 + (fx.tv ? TV_FEE : 0);
  const fans = fx.h === G.club ? G.board.fans : 60;
  const att = Math.round(hc.cap * clamp(0.82 + fans / 600 + ac.rep / 1000, 0.6, 1));
  const gate = Math.round(att * (25 + hc.rep * 0.35));
  fx.att = att;
  [hc, ac].forEach(c => { c.bal += tv; });
  hc.bal += gate;
  if (fx.h === G.club || fx.a === G.club) {
    G.ledger.tv += tv;
    if (fx.h === G.club) G.ledger.gate += gate;
    const us = fx.h === G.club ? 0 : 1, S = M.sides[us], O = M.sides[1 - us];
    fx.stats = M.sides.map(X => ({ ...X.st, xg: Math.round(X.st.xg * 100) / 100 }));
    fx.ratings = M.sides.map(X => X.played.map(id => [id, X.rat[id]]));
    boardAfterMatch(S.st.g, O.st.g, G.clubs[O.cid].rep, us === 0);
    const opp = clubName(O.cid), sg = S.st.g, og = O.st.g;
    const head = sg > og ? `${clubName(G.club)} beat the ${opp} ${sg}-${og}` : sg < og ? `${clubName(G.club)} lose ${sg}-${og} to the ${opp}` : `${clubName(G.club)} held ${sg}-${og} by the ${opp}`;
    const scorers = S.goals.map(g => pname(G.players[g.pid]) + ' ' + g.min + "'").join(', ');
    addNews('match', head, (scorers ? 'Scorers: ' + scorers + '. ' : '') + (motm ? 'Player of the match: ' + fullName(G.players[motm]) + '.' : ''));
    G.lastMatch = fx.id;
  }
}

function boardAfterMatch(gf, ga, oppRep, home) {
  const pts = gf > ga ? 3 : gf === ga ? 1 : 0;
  const exp = clamp(1.35 + (userClub().rep - oppRep) / 30 + (home ? 0.2 : -0.1), 0.6, 2.2);
  G.board.conf = clamp(Math.round(G.board.conf + (pts - exp) * 1.8), 0, 100);
  G.board.fans = clamp(Math.round(G.board.fans + (pts - exp) * 3 + (gf - ga) * 0.5), 0, 100);
}
