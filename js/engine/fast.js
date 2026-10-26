'use strict';
// Event model for unwatched matches. No positional ticks or fabricated frames.
// It uses the same lineups, condition drain, tactic fit, discipline, injury,
// substitutions and result settlement as the detailed engine.
const FAST_PASS = { DM: 2, MC: 2.5, AMC: 1.6, DC: 1.3, DL: 1.4, DR: 1.4 };
const FAST_DEFEND = { DC: 2.5, DL: 2, DR: 2, DM: 3, MC: 1.8 };
const FAST_FOUL = { DC: 2, DL: 1.5, DR: 1.5, DM: 2.5, MC: 1.5 };
const FAST_WIDE = { DL: 3, DR: 3, AML: 4, AMR: 4 };
const FAST_PLAYERS = new WeakMap();
function fastPlayer(S, weights, exclude) {
  let cache = FAST_PLAYERS.get(S);
  if (!cache || cache.minute !== S._fastMinute) {
    const key = S.ip + ':' + S.on.join(',');
    if (!cache || cache.key !== key) { cache = { key, choices: new Map() }; FAST_PLAYERS.set(S, cache); }
    cache.minute = S._fastMinute;
  }
  let choices = cache.choices.get(weights);
  if (!choices) {
    choices = onPitch(S).filter(x => x.pos !== 'GK').map(x => ({ x, weight: (weights[x.pos] || 0.4) * (0.6 + x.p.at[A.otb] / 25) }));
    cache.choices.set(weights, choices);
  }
  let total = 0;
  for (const item of choices) if (item.x.p.id !== exclude) total += item.weight;
  let value = R() * total;
  for (const item of choices) if (item.x.p.id !== exclude) { value -= item.weight; if (value <= 0) return item.x; }
  return choices.find(item => item.x.p.id !== exclude)?.x || onPitch(S)[0];
}
function fastStat(S, id, key, n = 1) {
  if (id) { const stats = S.ps[id] || (S.ps[id] = {}); stats[key] = (stats[key] || 0) + n; }
}
function fastMinute(M) {
  M.min++;
  const evs = [], [H, W] = M.sides;
  for (const S of M.sides) {
    S._fastMinute = M.min;
    drain(M, S); refreshForm(M, S);
    if (M.min % 5 === 1 || M.dirty) calcUnits(S);
  }
  M.dirty = false;
  const possession = clamp(possShare(H, W), 0.18, 0.82);
  for (const S of M.sides) {
    const O = M.sides[1 - S.idx], share = S.idx === 0 ? possession : 1 - possession;
    S.st.pos += share * 60;
    const players = onPitch(S), out = players.filter(x => x.pos !== 'GK');
    if (!out.length) continue;
    // Pace/style changes volume and completion together, rather than granting
    // possession without passes. Every team total is assigned to actual players.
    const attempts = Math.max(0, Math.round(share * (13.8 + (S.pass === 0 ? 2.4 : S.pass === 2 ? -1.4 : 0) + S.tempo * 0.7) + rf(-1, 1)));
    const completion = clamp(0.78 + (S.u.mid - O.u.mid) * 0.002 + (S.pass === 0 ? 0.04 : S.pass === 2 ? -0.06 : 0) - (O.press - 1) * 0.015, 0.55, 0.94);
    for (let n = 0; n < attempts; n++) {
      const p = fastPlayer(S, FAST_PASS);
      S.st.pa++; fastStat(S, p.p.id, 'pa');
      if (R() < completion) { S.st.pc++; fastStat(S, p.p.id, 'pc'); }
    }
    const fit = S.fit ? S.fit.chance || S.fit.poss || 0 : 0;
    const strength = clamp((S.u.att + S.u.mid * 0.25) / Math.max(15, O.u.def + O.u.mid * 0.25), 0.45, 1.9);
    const risk = 1 + (S.ment - 2) * 0.06 + (O.ment - 2) * 0.035;
    const chance = 0.23 * (tune('shotBase') / 0.285) * share * strength * risk * (1 + fit * 0.06) * (S.idx === 0 && !S.neutral ? tune('homeShot') * M.mod.home : 1);
    if (R() < chance && S.u.n > 1) {
      const shooter = fastPlayer(S, POS_SHOT), id = shooter.p.id;
      const penalty = R() < 0.015;
      const xg = penalty ? 0.76 : clamp(rf(0.04, 0.20) * strength * tune('xgScale') / 0.85 * M.mod.xg, 0.015, 0.65);
      const targetChance = penalty ? 0.88 : clamp(0.29 + (shooter.p.at[A.fin] - 12) * 0.008, 0.2, 0.44);
      const target = R() < targetChance;
      const probability = clamp(xg * ENG.fin * (S.idx === 0 && !S.neutral ? 1.04 : 1) * (1 + (shooter.p.at[A.fin] - 12) * 0.018) * (1 + (65 - O.u.gk) * 0.008), 0.005, penalty ? 0.95 : 0.6);
      const goal = target && R() < clamp(probability / targetChance, 0.01, 0.95);
      S.st.sh++; S.st.xg += xg; fastStat(S, id, 'sh');
      if (penalty) S.st.pk++;
      if (target) { S.st.sot++; fastStat(S, id, 'sot'); }
      if (goal) {
        S.st.g++; bumpRating(S, id, 0.65);
        const helper = !penalty && R() < 0.78 ? fastPlayer(S, POS_ASSIST, id) : null;
        S.goals.push({ min: M.min, pid: id, aid: helper ? helper.p.id : null, pen: penalty });
        if (helper) { fastStat(S, helper.p.id, 'kp'); bumpRating(S, helper.p.id, 0.2); }
        moodSwing(S, 'all', 2); moodSwing(O, 'all', -2); M.dirty = true;
        evs.push({ t: 'goal', min: M.min, side: S.idx, pid: id, aid: helper && helper.p.id, pen: penalty });
      } else if (target && O.on[0]) { fastStat(O, O.on[0], 'sv'); bumpRating(O, O.on[0], 0.07); }
      if (!goal && R() < 0.38) S.st.co++;
    }
    if (R() < 0.16 * (0.75 + S.width * 0.25)) { const p = fastPlayer(S, FAST_WIDE); S.st.cr++; fastStat(S, p.p.id, 'cr'); }
    if (R() < 0.2) { const p = fastPlayer(S, FAST_DEFEND); fastStat(S, p.p.id, 'aer'); }
    if (R() < 0.1) { const p = fastPlayer(S, POS_SHOT); fastStat(S, p.p.id, 'da'); if (R() < 0.55) fastStat(S, p.p.id, 'dw'); }
    if (R() < 0.34) { const p = fastPlayer(S, FAST_DEFEND); fastStat(S, p.p.id, R() < 0.6 ? 'tk' : 'int'); }
    if (R() < 0.06) { S.st.off++; fastStat(S, fastPlayer(S, POS_SHOT).p.id, 'off'); }
    if (R() < 0.13 * (tune('foulRate') / 0.18) * M.mod.foul * (1 + (S.press - 1) * 0.12)) {
      const p = fastPlayer(S, FAST_FOUL);
      S.st.fo++; fastStat(S, p.p.id, 'fo');
      if (R() < 0.175 * cardMul(p.p) * (S.yc[p.p.id] ? 0.35 : 1)) {
        if (S.yc[p.p.id]) { const event = { min: M.min, side: O.idx, pid: p.p.id, fside: S.idx, second: true }; sendOff(M, S, p.p.id, event); evs.push(event); }
        else { S.yc[p.p.id] = 1; S.st.yc++; evs.push({ t: 'yellow', min: M.min, side: O.idx, fside: S.idx, pid: p.p.id }); }
      } else if (R() < 0.002) { const event = { min: M.min, side: O.idx, fside: S.idx, pid: p.p.id }; sendOff(M, S, p.p.id, event); evs.push(event); }
    }
    if (R() < tune('injuryRate') / 2 * M.mod.inj) { const e = injury(M, S); if (e) evs.push(e); }
  }
  evs.forEach(e => M.log.push(e));
  M.sides.forEach(S => { evs.push(...injurySubs(M, S)); evs.push(...managerReview(M, S, brainDecide)); });
  if (M.min >= (M.finishAt ?? 90 + M.added)) decideMatchEnd(M);
  return evs;
}
function runFastMatch(M) {
  M.fast = true; M.model = 'events-v1'; M.noLog = true;
  return matchRandom(M, () => { while (!M.ended) fastMinute(M); return M; });
}
