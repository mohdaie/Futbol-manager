'use strict';
/* ===== match.js =====
   Minute-by-minute match simulation, shared by the live 2D match and instant results.
   Team strength = attack, midfield and defence units plus the goalkeeper.
   Attack and midfield come from the in-possession shape, defence from the
   out-of-possession shape, so both formations matter. */

const POS_SHOT = { GK: 0, DL: .35, DR: .35, DC: .3, DM: .6, ML: 1.2, MR: 1.2, MC: 1, AML: 2.4, AMR: 2.4, AMC: 2.4, ST: 4.2 };
const POS_ASSIST = { GK: .1, DL: 1, DR: 1, DC: .3, DM: .8, ML: 1.6, MR: 1.6, MC: 1.5, AML: 1.8, AMR: 1.8, AMC: 2.2, ST: 1 };

const cAtt = p => { const a = p.at; return (a[A.fin] * 1.3 + a[A.dri] + a[A.pas] + a[A.vis] + a[A.fir] + a[A.pac] + a[A.cmp] + a[A.cro] * 0.5 + a[A.otb] + a[A.fla] * 0.6) / 9.4 * 5; };
const cMid = p => { const a = p.at; return (a[A.pas] * 1.3 + a[A.vis] + a[A.dec] + a[A.fir] + a[A.wor] + a[A.sta] + a[A.tck] * 0.6 + a[A.cmp] * 0.6 + a[A.tea] + a[A.ant] * 0.6) / 9.1 * 5; };
const cDef = p => { const a = p.at; return (a[A.tck] * 1.2 + a[A.mar] * 1.2 + a[A.pos] * 1.2 + aerial(p) * 0.8 + a[A.str] * 0.7 + a[A.dec] + a[A.pac] * 0.6 + a[A.wor] * 0.5 + a[A.ant] + a[A.tea] * 0.5) / 8.7 * 5; };

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

function buildSide(cid, idx, fx = {}) {
  const c = G.clubs[cid], user = cid === G.club && !jobless();
  let tac, xi, bench, roles;
  if (user) { ensureUserLineup(); tac = G.tactics; xi = tac.slots.slice(); bench = tac.bench.slice(); roles = tac.roles.slice(); }
  else { tac = c.tac; const pk = autoPick(cid, tac.ip); xi = pk.xi; bench = pk.bench; roles = (tac.roles || Array(11).fill(0)).slice(); }
  const S = {
    cid, idx, user, neutral: !!fx.neutral, ip: tac.ip, oop: tac.oop, roles, ment: tac.ment, tempo: tac.tempo, width: tac.width, press: tac.press, line: tac.line, pass: tac.pass, lost: tac.lost ?? 1, won: tac.won ?? 1,
    pi: user ? JSON.parse(JSON.stringify(tac.pi || {})) : {}, ps: {}, form: [], pos: [],
    pk: user ? tac.pk : null, cap: user ? tac.cap : null, fk: user ? tac.fk : null, ck: user ? tac.ck : null, on: xi, bench, off: [], subs: 0, wins: 0, lastSubMin: -1, cond: {}, rat: {}, yc: {}, reds: [], injuries: [],
    played: xi.filter(Boolean), st: { g: 0, sh: 0, sot: 0, xg: 0, pos: 0, fo: 0, yc: 0, rc: 0, co: 0, pa: 0, pc: 0, off: 0, cr: 0, pk: 0, pkg: 0, lp: 0 }, goals: [],
    banned: fx.fr ? [] : c.squad.filter(id => G.players[id] && G.players[id].ban > 0), u: null, map: shapeMap(tac.ip, tac.oop), boost: 0, guard: 0, calm: 0,
  };
  xi.concat(bench).forEach(id => { if (id) { S.cond[id] = G.players[id].cond; S.rat[id] = 6.5; } });
  S.startCond = avg(xi.filter(Boolean), id => G.players[id].cond);
  return S;
}

// Conditions for one match: weather plus kick-off time.
function matchMods(fx) {
  const w = (fx.wx && WEATHER[fx.wx.k]) || {}, t = fx.t || '15:00';
  return { drain: w.drain || 1, xg: w.xg || 1, shot: (w.shot || 1) * (t < '13:00' ? 0.98 : 1), foul: w.foul || 1, inj: w.inj || 1, wind: w.wind || 1, home: !fx.neutral && t >= '19:00' ? 1.03 : 1 };
}

function createMatch(fx) {
  if ([fx.h, fx.a].some(cid => G.clubs[cid]?.backgroundOnly)) throw new Error('This club has a placeholder squad. Matches are unavailable until player data is added.');
  // Real fixtures keep their stream across workers/reloads. Hypothetical advice
  // and training games need independent trials rather than the same result n times.
  const seed = fx.id < 0 ? Math.floor(R() * 4294967295) : Math.floor(hash01(`${G.simSeed ?? G.createdAt ?? G.season}:${fx.id}:${fx.h}:${fx.a}`) * 4294967295);
  const random = { rng: seed };
  return matchRandom(random, () => { const old = G.flags.friendlySelection; G.flags.friendlySelection = !!fx.fr; try { const M = createMatchState(fx); M.rng = random.rng; return M; } finally { if (old === undefined) delete G.flags.friendlySelection; else G.flags.friendlySelection = old; } });
}
function createMatchState(fx) {
  // Real fixtures: players recover for the days since their last match before teams are picked.
  if (fx.id > 0 && fx.w != null) [fx.h, fx.a].forEach(cid => squadOf(cid).forEach(p => recoverTo(p, fxDayNo(fx))));
  if (fx.id > 0 && isUserFx(fx) && typeof adviceAtKickoff === 'function') adviceAtKickoff(fx);
  // Computer clubs set up for this match with the tactic their available players suit best.
  [[fx.h, fx.a], [fx.a, fx.h]].forEach(([c, o]) => { if ((c !== G.club || jobless()) && G.clubs[c] && G.clubs[c].pl && !(G.flags && G.flags.fixedTac)) G.clubs[c].tac = aiChooseTactic(c, o); });
  const M = { fid: fx.id, min: 0, added: ri(1, 5), ended: false, dirty: false, mod: matchMods(fx), sides: [buildSide(fx.h, 0, fx), buildSide(fx.a, 1, fx)], log: [], shout: null, duels: fx.id > 0 ? {} : null };
  if (fx.playoff && (fx.leg === 2 || fx.neutral || fx.single)) { // a deciding leg, a final or a one-match cup tie
    const first = fx.firstLeg && G.fixtures.find(f => f.id === fx.firstLeg);
    M.knockout = { home: first ? first.ag : 0, away: first ? first.hg : 0 };
  }
  M.sides.forEach(S => calcUnits(S));
  if (fx.id > 0 && isUserFx(fx)) {
    if (typeof evidenceInit === 'function') evidenceInit(M);
    M.analysisFrames = []; M.analysisNextFrame = 0;
    M.analysisTactics = M.sides.map(S => ({ club: S.cid, ip: S.ip, oop: S.oop, roles: S.roles.slice(), mentality: S.ment, tempo: S.tempo, width: S.width, press: S.press, line: S.line, passing: S.pass, startingXI: S.on.slice() }));
  }
  return M;
}

const onPitch = S => S.on.map((id, i) => (id ? { p: G.players[id], i, pos: FORMATIONS[S.ip][i][0] } : null)).filter(Boolean);
const roleOf = (S, i) => ROLES[FORMATIONS[S.ip][i][0]][S.roles[i]] || {};

// Captain and set-piece takers. The chosen player if he is on the pitch, otherwise the best one on the pitch.
const TAKER_SCORE = {
  cap: p => p.at[A.ldr] * 2 + p.age / 3,
  pk: p => p.at[A.fin] + p.at[A.cmp],
  fk: p => p.at[A.pas] + p.at[A.fin] + p.at[A.vis] / 2,
  ck: p => p.at[A.cro] * 2 + p.at[A.pas],
};
function taker(S, key) {
  const xs = onPitch(S).filter(x => key === 'cap' || x.pos !== 'GK');
  const mine = xs.find(x => x.p.id === S[key]);
  if (mine) return { p: mine.p, chosen: true };
  const best = xs.sort((a, b) => TAKER_SCORE[key](b.p) - TAKER_SCORE[key](a.p))[0];
  return best ? { p: best.p, chosen: !S.user } : null;
}
// Direct free-kick skill on the 1-20 scale.
const fkSkill = p => (p.at[A.fin] + p.at[A.pas] + p.at[A.vis] / 2) / 2.5;
// Morale in the match: his morale coming in plus how the match is going for him (S.mo, see moodSwing).
const liveMor = (S, p) => clamp(p.mor + ((S.mo && S.mo[p.id]) || 0), 0, 100);
const pForm = (S, p) => (0.7 + 0.3 * (S.cond[p.id] ?? p.cond) / 100) * (0.94 + 0.12 * liveMor(S, p) / 100) * (0.95 + 0.05 * p.shp / 100);
/* Live morale swings: goals, big chances, saves and red cards lift or knock players during the match.
   Character matters (temperamental players swing more, determined and professional players shrug off setbacks),
   and a captain with high leadership steadies the team after a blow. The swing fades slowly and is only for this match;
   the result changes real morale at full time. who: 'all' or a player id; d: change in morale points. */
function moodSwing(S, who, d) {
  S.mo = S.mo || {};
  const one = id => {
    const p = G.players[id]; if (!p) return;
    let x = d;
    if (p.pers === 'Temperamental') x *= 1.4;
    if (x < 0 && ['Determined', 'Professional', 'Model Citizen'].includes(p.pers)) x *= 0.6;
    if (x < 0 && who === 'all') x *= 1 - clamp(((S.capLdr ?? 10) - 10) * 0.04, -0.2, 0.4);
    S.mo[id] = clamp((S.mo[id] || 0) + x, -30, 30);
  };
  if (who === 'all') S.on.forEach(id => { if (id) one(id); }); else one(who);
}

function calcUnits(S) {
  const ip = FORMATIONS[S.ip], oop = FORMATIONS[S.oop];
  let att = 0, wa = 0, mid = 0, wm = 0, def = 0, wd = 0, gk = 30, gkRole = {}, n = 0, nAtt = 0, nDef = 0, pace = 0;
  S.on.forEach((id, i) => {
    if (!id) return;
    n++;
    const p = G.players[id], slot = ip[i], f = pForm(S, p) * fam(p, slot[0]);
    // Keeper roles: a sweeper keeper gives up a little shot-stopping to cover the space behind a high line; a ball-playing keeper helps build-up play.
    if (slot[0] === 'GK') { gkRole = roleOf(S, i); gk = playerRating(p, 'GK') * f * (1 + (gkRole.d || 0)); return; }
    const role = roleOf(S, i), y = slot[2], yo = oop[S.map[i]][2];
    const wA = clamp((0.8 - y) * 1.8, 0.08, 1), wM = clamp(1 - Math.abs(y - 0.52) * 2.6, 0.1, 1), wD = clamp((yo - 0.36) * 1.9, 0.08, 1);
    att += cAtt(p) * f * wA * (1 + (role.a || 0)); wa += wA;
    mid += cMid(p) * f * wM * (1 + (role.m || 0)); wm += wM;
    def += cDef(p) * f * wD * (1 + (role.d || 0)); wd += wD;
    if (y < 0.42) nAtt++;
    if (yo > 0.6) nDef++;
    pace += p.at[A.pac];
  });
  // Captain: his leadership lifts the whole team (about ±3%); a stand-in captain has half the effect.
  const cap = taker(S, 'cap'), capF = cap ? 1 + (cap.p.at[A.ldr] - 10) * (cap.chosen ? 0.003 : 0.0015) : 1;
  const famF = (S.user ? 0.93 + 0.07 * G.training.fam / 100 : 0.985) * capF;
  S.capLdr = cap && cap.chosen ? cap.p.at[A.ldr] : 10;
  S.capF = capF;
  sideFit(S);
  S.u = { att: (att / (wa || 1)) * famF, mid: (mid / (wm || 1)) * famF * (1 + (gkRole.m || 0) * 0.3), def: (def / (wd || 1)) * famF, gk, n, nAtt, nDef, pace: pace / Math.max(1, n - 1), sweep: gkRole.n === 'Sweeper Keeper' };
}

function possShare(H, W) {
  // Short passing, patience and pressing only help keep the ball if the players suit them (tactic fit).
  const fp = S => (S.fit ? S.fit.poss : 0) * 0.9 + 0.3, fr = S => (S.fit ? S.fit.press : 0) + 0.5;
  const f = S => Math.pow(S.u.mid, 1.2) * (1 + 0.03 * (S.press - 1) * fr(S) + (S.pass === 0 ? 0.2 * fp(S) : -0.08 * (S.pass - 1)) + (S.tempo === 0 ? 0.14 * fp(S) : -0.06 * (S.tempo - 1))) * (S.u.n / 11);
  const a = f(H) * (H.neutral ? 1 : tune('homePoss')), b = f(W);
  return a / (a + b);
}

function drain(M, S) {
  // Pressing tires players; those built for it cope better.
  const pf = 1 - (S.fit ? S.fit.press : 0) * 0.35;
  // Each player tires by the sprinting he actually did last minute (pressing, runs, getting back), not by the
  // instruction alone: about 41 m a minute is normal.
  const P = M.sim && M.sim.P[S.idx];
  const rate = (tune('fatigue') + 0.03 * (S.tempo - 1)) * M.mod.drain;
  S.on.forEach((id, i) => {
    if (!id) return;
    const p = G.players[id], q = P && P[i] && P[i].id === id ? P[i] : null;
    const spr = q ? clamp(((q.spr || 0) - 41) * 0.0053, -0.04, 0.2) * pf * M.mod.drain : (0.06 * (S.press - 1) + ((S.lost ?? 1) === 2 ? 0.02 : 0)) * pf * M.mod.drain;
    if (q) q.spr = 0;
    S.cond[id] = Math.max(15, S.cond[id] - (rate + spr) * (1.5 - p.at[A.sta] / 20) * fatigueMul(p) * (i === 0 ? 0.3 : 1));
  });
}

const bumpRating = (S, id, d) => { if (id && S.rat[id] != null) S.rat[id] = clamp(S.rat[id] + d, 3, 10); };

function simMinute(M) {
  const managerEvents = typeof applyPendingManagerChanges === 'function' ? applyPendingManagerChanges(M) : [];
  M.min++;
  const [H, W] = M.sides, evs = [];
  if (M.min % 5 === 0 || M.dirty) { calcUnits(H); calcUnits(W); M.dirty = false; }
  drain(M, H); drain(M, W);
  M.sides.forEach(X => { if (X.mo) Object.keys(X.mo).forEach(id => { X.mo[id] *= 0.985; }); }); // swings fade over about an hour
  if (M.shout && M.min >= M.shout.until) { const S = M.sides[M.shout.side]; S.boost = 0; S.guard = 0; S.calm = 0; M.shout = null; }
  const played = playMinute(M), ev = played[0];
  evs.push(...played);
  M.sides.forEach(X => { const e = reviewTacticalShout(M, X); if (e) evs.push(e); });
  // Injuries: more likely in bad weather and for sides that started tired (fixture congestion).
  M.sides.forEach(X => {
    if (R() < (tune('injuryRate') / 2) * M.mod.inj * (1 + Math.max(0, 85 - (X.startCond ?? 100)) / 30)) { const e = injury(M, X); if (e) evs.push(e); }
  });
  if (M.min % 15 === 0) M.sides.forEach(X => X.on.forEach(id => bumpRating(X, id, gauss() * 0.03)));
  if (M.min === 45) ev.ht = true;
  if (M.extra && M.min === M.extraStart + 15) ev.etBreak = true;
  if (M.min >= (M.finishAt ?? 90 + M.added)) { const extra = M.extra; decideMatchEnd(M); if (M.ended) ev.ft = true; else if (!extra && M.extra) ev.etBreak = true; }
  evs.forEach(e => { if (e.t !== 'poss') M.log.push(e); });
  return [...managerEvents, ...evs];
}

/* ---------- tactical shouts ---------- */
// Each shout overrides a few instructions for its spell (S.tsh remembers the manager's own values) and the engine
// reads S.tsh.k for what instructions cannot say (shooting, crossing). Its staff measure is a per-minute score from
// the side's chances (xG plus dangerous attacks), chances conceded and the shout's own aim.
const TSHOUT = {
  shoot: { set: S => ({ ment: Math.min(4, S.ment + 1) }), score: d => d.thrF - d.thrA * 0.5 },
  wide: { set: () => ({ width: 2 }), score: d => d.thrF + d.cr * 0.003 - d.thrA * 0.5 },
  deeper: { set: S => ({ line: Math.max(0, S.line - 1), press: Math.max(0, S.press - 1), ment: Math.max(0, S.ment - 1) }), score: d => d.thrF * 0.3 - d.thrA },
  higher: { set: S => ({ line: Math.min(2, S.line + 1), press: Math.min(2, S.press + 1) }), score: d => d.thrF - d.thrA + d.hr * 0.003 },
  calm: { set: S => ({ tempo: 0, pass: 0, ment: Math.max(1, S.ment - 1) }), score: d => d.thrF * 0.5 - d.thrA + (d.pos - 0.5) * 0.02 },
};
// A dangerous attack (the ball in the final 30%) is worth about this much xG in the staff's measure.
const TSH_ATTACK = 0.004, TSH_PRIOR_MIN = 15;
function tshCount(M, S) {
  const O = M.sides[1 - S.idx];
  return { min: M.min, xgF: S.st.xg, xgA: O.st.xg, daF: S.st.da || 0, daA: O.st.da || 0, cr: S.st.cr || 0, hr: S.st.hr || 0, posF: S.st.pos, posA: O.st.pos };
}
// Per-minute rates between two counts. With few minutes the rates lean towards a typical match (prior).
function tshRate(a, b, prior = 0) {
  const m = Math.max(1, b.min - a.min), k = prior ? TSH_PRIOR_MIN : 0, pm = (x, p) => (x + p * k) / (m + k);
  const pos = (b.posF - a.posF) / ((b.posF - a.posF) + (b.posA - a.posA) || 1);
  return { thrF: pm(b.xgF - a.xgF + (b.daF - a.daF) * TSH_ATTACK, 0.0175), thrA: pm(b.xgA - a.xgA + (b.daA - a.daA) * TSH_ATTACK, 0.0175),
    cr: pm(b.cr - a.cr, 0.2), hr: pm(b.hr - a.hr, 0.1), pos: (pos * m + 0.5 * k) / (m + k) };
}
function tshRestore(S) {
  const t = S.tsh;
  if (!t) return;
  // Only what still holds the shout's value goes back: an instruction changed during the spell is the manager's.
  Object.keys(t.set).forEach(f => { if (S[f] === t.set[f]) S[f] = t.orig[f]; });
  S.tsh = null;
}
// Start (or replace) a tactical shout. Returns the touchline event.
function tacticalShout(M, S, k) {
  if (!TSHOUT[k]) return null;
  tshRestore(S);
  const set = TSHOUT[k].set(S), orig = {}, now = tshCount(M, S);
  Object.keys(set).forEach(f => { orig[f] = S[f]; S[f] = set[f]; });
  const zero = { min: 0, xgF: 0, xgA: 0, daF: 0, daA: 0, cr: 0, hr: 0, posF: 0, posA: 0 };
  S.tsh = { k, from: M.min, until: M.min + 10, set, orig, start: now, pre: TSHOUT[k].score(tshRate(zero, now, 1)), keep: false, ext: false, checks: 0 };
  M.dirty = true;
  return evt(M, { side: S.idx, t: 'tsh', k, res: 'start', key: true });
}
// The manager keeps it regardless of the staff's measure, or goes back to the main tactic.
function tacticalShoutKeep(M, S) { if (S.tsh) { S.tsh.keep = true; M.dirty = true; } }
function tacticalShoutEnd(M, S) {
  if (!S.tsh) return null;
  const k = S.tsh.k; tshRestore(S); M.dirty = true;
  return evt(M, { side: S.idx, t: 'tsh', k, res: 'end', key: true });
}
// Every minute: at the end of a spell the staff compare the last 10 (or 15) minutes with the side's rate before the
// shout. Clearly better: it stays and is checked again in 10 minutes. Clearly worse: back to the main tactic.
// Unclear: 5 more minutes once, then the sign decides.
function reviewTacticalShout(M, S) {
  const t = S.tsh;
  if (!t || M.min < t.until || M.ended) return null;
  const now = tshCount(M, S), win = TSHOUT[t.k].score(tshRate(t.start, now)), diff = win - t.pre;
  const xg = `${(now.xgF - t.start.xgF).toFixed(2)} xG for, ${(now.xgA - t.start.xgA).toFixed(2)} against in ${now.min - t.start.min} min`;
  if (t.keep) { Object.assign(t, { until: M.min + 10, start: now }); return null; }
  t.checks++;
  if (diff > 0.002 || t.ext && diff >= 0) {
    Object.assign(t, { until: M.min + 10, start: now, ext: false, kept: true });
    return evt(M, { side: S.idx, t: 'tsh', k: t.k, res: 'keep', why: xg, key: true });
  }
  if (diff < -0.004 || t.ext) { tshRestore(S); M.dirty = true; return evt(M, { side: S.idx, t: 'tsh', k: t.k, res: 'revert', why: xg, key: true }); }
  t.ext = true; t.until = M.min + 5;
  return evt(M, { side: S.idx, t: 'tsh', k: t.k, res: 'extend', why: xg });
}
// Computer managers use them too: protect a late lead, chase a game, or try something when chances dry up.
function aiTacticalShout(M, S) {
  if (S.user || S.tsh || M.min < 30 || M.min > 88 || M.min % 5 || R() > 0.3) return null;
  const O = M.sides[1 - S.idx], diff = S.st.g - O.st.g;
  let k = null;
  if (diff > 0 && M.min >= 70) k = (S.pass === 0 || S.tempo === 0) && R() < 0.6 ? 'calm' : 'deeper';
  else if (diff < 0 && M.min >= 60) k = M.min >= 78 ? (R() < 0.5 ? 'higher' : 'shoot') : S.width === 2 || R() < 0.4 ? 'wide' : 'shoot';
  else if (diff === 0 && M.min >= 55 && S.st.xg <= O.st.xg) k = R() < 0.5 ? 'wide' : 'shoot';
  else if (O.st.xg - S.st.xg > 0.8 && M.min >= 35) k = 'deeper';
  return k ? tacticalShout(M, S, k) : null;
}

// A deciding playoff leg uses aggregate goals; away goals never break a tie.
function decideMatchEnd(M) {
  const [H, Away] = M.sides, k = M.knockout;
  if (!k) { M.ended = true; return; }
  const h = H.st.g + k.home, a = Away.st.g + k.away;
  if (h === a && !M.extra) { M.extra = true; M.extraStart = M.min; M.finishAt = M.min + 30; M.ended = false; return; }
  if (h === a) {
    const score = [0, 0], attempts = [0, 0], order = M.sides.map(S => onPitch(S).filter(x => x.pos !== 'GK').sort((a, b) => TAKER_SCORE.pk(b.p) - TAKER_SCORE.pk(a.p)));
    const kick = side => {
      const p = order[side][attempts[side] % (order[side].length || 1)]?.p, keeper = G.players[M.sides[1 - side].on[0]];
      return R() < clamp(.75 + ((p?.at[A.fin] ?? 10) - 10) * .012 - ((keeper?.at[A.one] ?? 10) - 10) * .008, .5, .92);
    };
    shootout: for (let n = 0; n < 5; n++) for (const side of [0, 1]) {
      score[side] += +kick(side); attempts[side]++;
      if (score[0] > score[1] + 5 - attempts[1] || score[1] > score[0] + 5 - attempts[0]) break shootout;
    }
    for (let n = 0; score[0] === score[1] && n < 100; n++) for (const side of [0, 1]) { score[side] += +kick(side); attempts[side]++; }
    if (score[0] === score[1]) score[R() < .5 ? 0 : 1]++; // bounded sudden death
    M.penalties = score; M.winner = score[0] > score[1] ? H.cid : Away.cid;
  } else M.winner = h > a ? H.cid : Away.cid;
  M.ended = true;
}

function sendOff(M, S, id, ev) {
  ev.off = S.idx; ev.slot = S.on.indexOf(id); // the side that lost the man, and the gap he leaves
  S.on = S.on.map(x => (x === id ? null : x));
  S.reds.push(id); S.st.rc++;
  ev.t = 'red';
  moodSwing(S, 'all', -3); moodSwing(M.sides[1 - S.idx], 'all', 2);
  bumpRating(S, id, -1.5);
  M.dirty = true;
}
// Two players on the pitch change places (the tactics page): each keeps his place in the shape of his new slot.
// Keepers swap only with keepers. Roles and instructions belong to the slot, so they stay where they are.
function swapInMatch(M, S, i, j) {
  if (i === j || i < 0 || j < 0 || i >= S.on.length || j >= S.on.length || !S.on[i] || !S.on[j]) return false;
  if ((FORMATIONS[S.ip][i][0] === 'GK') !== (FORMATIONS[S.ip][j][0] === 'GK')) return false;
  [S.on[i], S.on[j]] = [S.on[j], S.on[i]];
  const P = M.sim.P[S.idx]; [P[i], P[j]] = [P[j], P[i]];
  const B = M.sim.B;
  if (B.os === S.idx) { if (B.oi === i) B.oi = j; else if (B.oi === j) B.oi = i; }
  S._shape = null; S._ac = null; S._sp = null; S._rc = null; S._chem = null; S._attC = null; S._bh = null;
  M.dirty = true;
  return true;
}
// The computer side closes a man-down gap itself. Ten men still leave one slot empty, so the question is which one:
// the team-mate who fits the gap best moves in, and the gap is left in an attacking slot where possible, not in defence.
function fillGapAI(M, S) {
  const gap = S.on.indexOf(null);
  if (gap < 0) return;
  const pos = FORMATIONS[S.ip][gap][0];
  let best = -1, bs = -Infinity;
  S.on.forEach((id, j) => {
    if (!id || j === gap || (j === 0 && gap !== 0)) return; // the keeper stays in goal unless he is the one gone
    const p = G.players[id]; if (!p) return;
    const sc = ovrAt(p, pos) + LINE[FORMATIONS[S.ip][j][0]] * 1.5;
    if (sc > bs) { bs = sc; best = j; }
  });
  if (best >= 0) moveIntoGap(M, S, S.on[best], gap);
}
// A sent-off player is not replaced: his side plays a man down. The manager may move one of his players into the gap.
// The player keeps his place on the pitch (no new arrival); the slot he leaves becomes the new gap.
function moveIntoGap(M, S, fromId, gap) {
  const from = S.on.indexOf(fromId);
  if (from < 0 || !Number.isInteger(gap) || gap < 0 || gap >= S.on.length || gap === from || S.on[gap]) return false;
  S.on[gap] = fromId; S.on[from] = null;
  const P = M.sim.P[S.idx], q = P[from]; P[gap] = q; P[from] = null;
  if (M.sim.B.os === S.idx && M.sim.B.oi === from) M.sim.B.oi = gap;
  S._shape = null; S._ac = null; S._sp = null; S._rc = null; S._chem = null; S._attC = null; S._bh = null;
  M.dirty = true;
  return true;
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

function subInterval(M) { return M.min === 45 || !!M.extra && [M.extraStart, M.extraStart + 15].includes(M.min); }
function canSub(M, S) { return S.subs < (M.extra ? 6 : 5) && (S.wins < (M.extra ? 4 : 3) || S.lastSubMin === M.min || subInterval(M)); }
function makeSub(M, S, outId, inId) {
  const idx = S.on.indexOf(outId);
  if (!outId || idx < 0 || !S.bench.includes(inId) || !canSub(M, S)) return null;
  if (S.lastSubMin !== M.min && !subInterval(M)) S.wins++;
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

// Computer manager: forced changes, then a tactical review at checkpoints and after goals and red cards (see brain.js).
function aiManage(M, S) {
  const evs = injurySubs(M, S);
  if (!S.user) { const e = aiTacticalShout(M, S); if (e) evs.push(e); }
  if (typeof managerReview === 'function') evs.push(...managerReview(M, S, S.user ? (M, S) => applyMgrOption(M, S, rulesDecision(M, S)) : brainDecide));
  return evs;
}

function stepMatch(M, autoUser) {
  return matchRandom(M, () => stepMatchState(M, autoUser));
}
function stepMatchState(M, autoUser) {
  const evs = simMinute(M);
  M.sides.forEach(S => { if (!S.user || autoUser) evs.push(...aiManage(M, S)); });
  return evs;
}

function quickSim(fx) {
  if (played(fx)) return null;
  const M = createMatch(fx);
  M.instant = isUserFx(fx);
  if (!M.instant && typeof runFastMatch === 'function') runFastMatch(M);
  else while (!M.ended) stepMatch(M, true);
  finishMatch(M);
  return M;
}

function finishMatch(M) {
  const fixture = G.fixtures.find(f => f.id === M.fid);
  if (!fixture || played(fixture)) return false; // retries cannot settle a fixture twice
  if (typeof scoutWatchMatch === 'function') scoutWatchMatch(M);
  if (typeof brainCloudDuels === 'function') brainCloudDuels(M);
  brainScore(M);
  const fx = G.fixtures.find(f => f.id === M.fid);
  const [H, W] = M.sides;
  if (isUserFx(fx)) {
    fx.timeline = (M.evidence ? M.log : M.log.slice(-240)).map(e => ({ ...e }));
    if (M.evidence) { fx.evidence = evidenceFinish(M); evidenceArchiveFixture(fx, G); }
    if (M.analysisFrames?.length) fx.trace = M.analysisFrames;
    if (M.analysisTactics) fx.engineTactics = M.analysisTactics;
  }
  fx.hg = H.st.g; fx.ag = W.st.g;
  fx.model = M.model || 'positional-v3';
  if (M.extra) fx.extra = true;
  if (M.penalties) fx.penalties = M.penalties;
  if (M.winner) fx.winner = M.winner;
  if (typeof statsMatch === 'function') statsMatch(M, fx);
  fx.goals = [].concat(...M.sides.map((S, si) => S.goals.map(g => [si, g.min, g.pid, g.pen ? 1 : 0]))).sort((a, b) => a[1] - b[1]);
  // Compact stats for every league match (analyst reports): [possession %, shots, on target, xG, passes, completed, crosses, corners, set-piece goals], and each side's style.
  const totPos = M.sides[0].st.pos + M.sides[1].st.pos || 1;
  fx.s = M.sides.map(X => [Math.round(100 * X.st.pos / totPos), X.st.sh, X.st.sot, Math.round(X.st.xg * 100) / 100, X.st.pa || 0, X.st.pc || 0, X.st.cr || 0, X.st.co, M.log.filter(e => e.t === 'goal' && e.side === X.idx && (e.ck || e.fk)).length]);
  fx.sty = M.sides.map(X => styleOf(X) || 'custom');
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
      p.st.a++; p.st.rt += rt; p.car.a++; if (p.loan) p.loan.apps = (p.loan.apps || 0) + 1;
      const ps = S.ps[id] || {};
      PSTAT_KEYS.forEach(k => { if (ps[k]) p.st[k] = (p.st[k] || 0) + ps[k]; });
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
    if (!fx.fr) {
      S.banned.forEach(id => { const p = G.players[id]; if (p && p.ban > 0) p.ban--; });
      const comp = fx.comp || leagueOf(S.cid), games = G.fixtures.filter(f => played(f) && leagueFixture(f, comp) && (f.h === S.cid || f.a === S.cid)).length;
      Object.keys(S.yc).forEach(id => {
        const p = G.players[id]; if (!p || S.reds.includes(+id)) return;
        p.st.yc++;
        if (fx.playoff || fx.cup) return; // only league cautions count towards league bans
        if (!p.discipline || p.discipline.season !== G.season) {
          // An older career has only its total cautions; retain those instead of
          // discarding a suspension threshold halfway through its first season.
          const legacy = !p.discipline ? Math.max(0, p.st.yc - 1) : 0;
          p.discipline = { season: G.season, cards: { [comp]: legacy } };
        }
        const count = p.discipline.cards[comp] = (p.discipline.cards[comp] || 0) + 1;
        const second = leagueTier(comp) === 2, rounds = leagueRules(comp).matches;
        const ban = count === 5 && games <= Math.floor(rounds / 2) ? 1 : count === 10 && games <= Math.round(rounds * (second ? 0.804 : 0.842)) ? 2 : count === 15 ? 3 : 0;
        if (ban) { p.ban += ban; if (S.user) addNews('club', pname(p) + ' suspended', `${fullName(p)} has collected ${count} league yellow cards and misses ${ban} match${ban === 1 ? '' : 'es'}.`, { t: 'player', pid: p.id }); }
      });
      S.reds.forEach(id => { const p = G.players[id]; if (p) { const e = M.log.find(e => e.t === 'red' && e.pid === id); p.ban += e?.second ? 1 : 3; p.st.rc++; } });
    }
    S.injuries.forEach(([id, wk, n]) => {
      const p = G.players[id];
      if (!p) return;
      p.inj = { n, w: wk };
      if (S.user) G.flags.injN = (G.flags.injN || 0) + 1;
      if (S.user) addNews('club', pname(p) + ' injured', `${fullName(p)} suffered a ${n.toLowerCase()} and is expected to be out for ${wk} week${wk > 1 ? 's' : ''}.`, { t: 'player', pid: p.id });
    });
    // squad members who did not play feel the result a little
    if (S.user) squadOf(S.cid).forEach(p => { if (!S.played.includes(p.id) && lvlOf(p) === 'A') p.mor = clamp(p.mor + r * 1.5 - (p.status === 'Key player' ? 2 : 0), 0, 100); });
  });
  if (motm) { G.players[motm].st.mom++; fx.motm = motm; }

  // money: TV for both, gate for the home side
  const hc = G.clubs[fx.h], ac = G.clubs[fx.a];
  const tv = fx.fr ? 0 : leagueTier(fx.comp || leagueOf(fx.h)) === 2 ? 60000 + (fx.tv ? 50000 : 0) : 0.9e6 + (fx.tv ? TV_FEE : 0);
  const fans = fx.h === G.club ? G.board.fans : 60;
  const att = Math.round((fx.neutral ? 88000 : hc.cap) * clamp(0.82 + fans / 600 + ac.rep / 1000, 0.6, 1));
  const gate = Math.round(att * (25 + hc.rep * 0.35));
  fx.att = att;
  [hc, ac].forEach(c => { c.bal += tv; });
  if (fx.neutral) { hc.bal += Math.round(gate / 2); ac.bal += Math.round(gate / 2); } else hc.bal += gate;
  if (isUserFx(fx)) {
    G.ledger.tv += tv;
    if (fx.neutral) G.ledger.gate += Math.round(gate / 2); else if (fx.h === G.club) G.ledger.gate += gate;
    const us = fx.h === G.club ? 0 : 1, S = M.sides[us], O = M.sides[1 - us];
    fx.stats = M.sides.map(X => ({ ...X.st, xg: Math.round(X.st.xg * 100) / 100 }));
    fx.ratings = M.sides.map(X => X.played.map(id => [id, X.rat[id]]));
    // Player action stats for the match report: [id, passes completed, attempted, key passes, dribbles won, tackles, interceptions, aerials, shots, on target]
    fx.pstats = M.sides.map(X => X.played.map(id => { const s = X.ps[id] || {}; return [id, s.pc || 0, s.pa || 0, s.kp || 0, s.dw || 0, s.tk || 0, s.int || 0, s.aer || 0, s.sh || 0, s.sot || 0, s.sv || 0]; }));
    boardAfterMatch(S.st.g, O.st.g, G.clubs[O.cid].rep, us === 0 && !fx.neutral);
    if (typeof adviceResult === 'function') adviceResult(fx, S.st.g, O.st.g, S.st.xg, O.st.xg);
    if (typeof postMatchAnalysis === 'function') postMatchAnalysis(M, fx);
    const opp = clubName(O.cid), sg = S.st.g, og = O.st.g;
    const head = sg > og ? `${clubName(G.club)} beat ${theClub(O.cid)} ${sg}-${og}` : sg < og ? `${clubName(G.club)} lose ${sg}-${og} to ${theClub(O.cid)}` : `${clubName(G.club)} held ${sg}-${og} by ${theClub(O.cid)}`;
    const scorers = S.goals.map(g => pname(G.players[g.pid]) + ' ' + g.min + "'").join(', ');
    addNews('match', head, (scorers ? 'Scorers: ' + scorers + '. ' : '') + (motm ? 'Player of the match: ' + fullName(G.players[motm]) + '.' : ''));
    if (typeof makeStory === 'function') storyMatch(G.news[0], fx, S, O, motm);
    G.lastMatch = fx.id;
  }
  if (typeof updateCompetitionSeason === 'function') updateCompetitionSeason();
  if (typeof managerMatchBonus === 'function') managerMatchBonus(fx);
}

function boardAfterMatch(gf, ga, oppRep, home) {
  const pts = gf > ga ? 3 : gf === ga ? 1 : 0;
  const exp = clamp(1.35 + (userClub().rep - oppRep) / 30 + (home ? 0.2 : -0.1), 0.6, 2.2);
  G.board.conf = clamp(Math.round(G.board.conf + (pts - exp) * 1.8), 0, 100);
  G.board.fans = clamp(Math.round(G.board.fans + (pts - exp) * 3 + (gf - ga) * 0.5), 0, 100);
}
