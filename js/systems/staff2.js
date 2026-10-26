'use strict';
/* ===== staff2.js =====
   AI-assisted staff, stages 2-5. Every piece of advice comes from game data only and is limited by the
   staff member's rating (how much they can see, how precisely, how many suggestions). Every piece of advice
   is recorded with what happened next; good advice earns the staff experience (rating growth at the end of
   the season) and feeds the staff learning tables (device-wide, approved in Admin > AI Staff, synced to the cloud).
   2 Analyst: team strengths and weaknesses, opposition reports, post-match analysis and recurring patterns.
   3 Coaches: weekly training plan. Physio: who to rest before the next match.
   4 Scouts: who to sign for the team's needs, within budget, from players they have actually watched. */

const staffR = role => staffAvg(role, 6);
const r1 = v => Math.round(v * 10) / 10;

/* ---------- match data ---------- */
// Finished league matches of a club, newest first: { us, them, gf, ga, goals, fx, home, sty }.
function clubMatches(cid, n = 99) {
  return G.fixtures.filter(f => f.s && (f.h === cid || f.a === cid)).sort((a, b) => fxSort(b, a)).slice(0, n).map(f => {
    const si = f.h === cid ? 0 : 1;
    return { us: f.s[si], them: f.s[1 - si], gf: si ? f.ag : f.hg, ga: si ? f.hg : f.ag, goals: (f.goals || []).map(g => [g[0] === si, g[1], g[3]]), fx: f, home: !si, sty: f.sty ? f.sty[si] : null };
  });
}
// League averages per team per match.
function leagueNorm() {
  const fs = G.fixtures.filter(f => f.s);
  if (!fs.length) return { xg: 1.4, sh: 13, pass: 83, ga: 1.4, gf: 1.4, sot: 4.5 };
  let xg = 0, sh = 0, pa = 0, pc = 0, g = 0, sot = 0, n = 0;
  fs.forEach(f => f.s.forEach((s, i) => { n++; xg += s[3]; sh += s[1]; sot += s[2]; pa += s[4]; pc += s[5]; g += i ? f.ag : f.hg; }));
  return { xg: xg / n, sh: sh / n, sot: sot / n, pass: pa ? 100 * pc / pa : 83, gf: g / n, ga: g / n };
}
const avgOf = (xs, f) => (xs.length ? xs.reduce((t, x) => t + f(x), 0) / xs.length : 0);

/* ---------- stage 2: analyst ---------- */
// Strengths and weaknesses of your team. Each finding: { tag, kind: 'weak'|'strong', text, fix, sev }.
function teamAnalysis() {
  const r = staffR('Analyst'), N = 3 + Math.round(r / 2), ms = clubMatches(G.club, N), L = leagueNorm();
  const out = [], T = G.tactics, vague = r < 9;
  const say = (precise, rough) => (vague ? rough : precise);
  const fuzz = v => v + rf(-1, 1) * (20 - r) * 0.02;
  if (ms.length >= 2) {
    const xf = fuzz(avgOf(ms, m => m.us[3])), xa = fuzz(avgOf(ms, m => m.them[3])), gf = avgOf(ms, m => m.gf), ga = avgOf(ms, m => m.ga);
    const shA = avgOf(ms, m => m.them[1]), pass = avgOf(ms, m => (m.us[4] ? 100 * m.us[5] / m.us[4] : 83));
    if (xf < L.xg - 0.25) out.push({ tag: 'lowXg', kind: 'weak', sev: (L.xg - xf) * 4, text: say(`We create too little: ${xf.toFixed(2)} xG per match against a league average of ${L.xg.toFixed(2)}.`, 'We are not creating enough chances.'), fix: { focus: 'att', text: 'More attacking mentality, wider play or attacking training.' } });
    if (xf > L.xg + 0.3) out.push({ tag: 'highXg', kind: 'strong', sev: (xf - L.xg) * 3, text: say(`We create plenty: ${xf.toFixed(2)} xG per match.`, 'We are creating good chances.') });
    if (xa > L.xg + 0.25) out.push({ tag: 'highXgA', kind: 'weak', sev: (xa - L.xg) * 4, text: say(`We give away too much: ${xa.toFixed(2)} xG against per match (league ${L.xg.toFixed(2)}).`, 'Opponents are getting good chances against us.'), fix: { focus: 'def', text: 'Defensive training, a deeper line or a more cautious mentality.' } });
    if (xa < L.xg - 0.3) out.push({ tag: 'lowXgA', kind: 'strong', sev: (L.xg - xa) * 3, text: say(`Solid at the back: only ${xa.toFixed(2)} xG against per match.`, 'We are hard to break down.') });
    if (r >= 6 && ms.length >= 4 && gf - avgOf(ms, m => m.us[3]) < -0.35) out.push({ tag: 'poorFinish', kind: 'weak', sev: 3, text: say(`Wasteful in front of goal: ${gf.toFixed(1)} goals per match from ${avgOf(ms, m => m.us[3]).toFixed(1)} xG.`, 'We are missing too many chances.'), fix: { focus: 'att', text: 'Finishing work in training; give the chances to the best finishers.' } });
    if (r >= 6 && ms.length >= 4 && ga - xa > 0.35) out.push({ tag: 'leaky', kind: 'weak', sev: 2.5, text: 'We concede more than the chances we allow suggest: look at the goalkeeper.', fix: { text: 'Check the goalkeeper; scouts can look for an upgrade.' } });
    if (shA > L.sh + 3) out.push({ tag: 'outshot', kind: 'weak', sev: (shA - L.sh) / 2, text: say(`Opponents average ${shA.toFixed(1)} shots against us.`, 'We let opponents shoot too often.'), fix: { focus: 'def', text: 'Press more in midfield or sit deeper to block shots.' } });
    const poss = (T.pass ?? 1) === 0 || (T.tempo ?? 1) === 0;
    if (poss && pass < 82) out.push({ tag: 'possLoss', kind: 'weak', sev: 3, text: say(`For a possession side we lose the ball too often: ${pass.toFixed(0)}% passing.`, 'We lose the ball too much for the way we want to play.'), fix: { focus: 'tac', text: 'Mixed passing, or players better suited to short passing.' } });
    if (r >= 8) {
      const late = ms.reduce((t, m) => t + m.goals.filter(g => !g[0] && g[1] >= 75).length, 0), all = ms.reduce((t, m) => t + m.ga, 0);
      if (late >= 3 && late / Math.max(1, all) >= 0.35) out.push({ tag: 'lateConcede', kind: 'weak', sev: 4, text: `We concede late: ${late} of our last ${all} goals against came after 75 minutes.`, fix: { focus: 'phy', text: 'Fitness training, earlier substitutions, less pressing late in matches.' } });
      const sp = ms.reduce((t, m) => t + (m.them[8] || 0), 0);
      if (sp >= 3) out.push({ tag: 'setPiece', kind: 'weak', sev: 3, text: `We have conceded ${sp} goals from set pieces.`, fix: { focus: 'set', text: 'Set-piece training and taller defenders.' } });
    }
  } else out.push({ tag: 'none', kind: 'info', sev: 0, text: 'Not enough matches yet to judge the team.' });
  // Squad and tactic, available from day one.
  const rep = tacticReport(T);
  rep.active.filter(x => x.pct < 45).forEach(x => out.push({ tag: 'fit:' + x.a, kind: 'weak', sev: (50 - x.pct) / 6, text: say(`Our players do not suit ${x.n.toLowerCase()} (${x.pct}% fit).`, `The players do not really suit our ${x.n.toLowerCase()}.`), fix: { focus: 'tac', text: `Change the instruction behind ${x.n.toLowerCase()}, or sign players who suit it.` } }));
  if (r >= 6) {
    const ip = FORMATIONS[T.ip], xi = T.slots.map((id, i) => [i, G.players[id]]).filter(([, p]) => p), avgR = avgOf(xi, ([i, p]) => ovrAt(p, ip[i][0]));
    xi.map(([i, p]) => [i, p, ovrAt(p, ip[i][0])]).filter(([, , v]) => v < avgR - 5).sort((a, b) => a[2] - b[2]).slice(0, 2)
      .forEach(([i, p, v]) => out.push({ tag: 'weakPos:' + ip[i][0], pos: ip[i][0], kind: 'weak', sev: (avgR - v) / 2, text: say(`${POS_NAME[ip[i][0]]} is our weakest position: ${pname(p)} rates ${v} against a team average of ${avgR.toFixed(0)}.`, `${POS_NAME[ip[i][0]]} is a weak spot in the side.`), fix: { text: 'Ask the scouts for options.' } }));
  }
  const ours = squadOf(G.club).filter(p => lvlOf(p) === 'A'), cond = avgOf(ours, p => p.cond);
  if (cond < 80) out.push({ tag: 'tired', kind: 'weak', sev: (85 - cond) / 3, text: say(`The squad is tired: ${cond.toFixed(0)}% average condition.`, 'The players look tired.'), fix: { focus: 'rec', text: 'Lighter training and rotation.' } });
  return out.filter(x => x.kind !== 'info' || out.length === 1).sort((a, b) => b.sev - a.sev).slice(0, 2 + Math.floor(r / 4));
}

// Opposition report lines for the pre-match screen.
function oppReport(oppCid) {
  const r = staffR('Analyst'), ms = clubMatches(oppCid, 2 + Math.round(r / 3)), c = G.clubs[oppCid], out = [];
  if (r >= 6 && c.tac) out.push(`Likely style: ${styleName(c.tac.style)}${r >= 9 ? ` (${c.tac.ip} with the ball)` : ''}.`);
  if (ms.length >= 2) {
    if (r >= 9) out.push(`Last ${ms.length}: ${avgOf(ms, m => m.gf).toFixed(1)} scored and ${avgOf(ms, m => m.ga).toFixed(1)} conceded per match, ${avgOf(ms, m => m.us[3]).toFixed(1)} xG for and ${avgOf(ms, m => m.them[3]).toFixed(1)} against.`);
    else out.push(avgOf(ms, m => m.gf) > avgOf(ms, m => m.ga) ? 'They have been scoring more than they concede.' : 'They have been leaking goals.');
    if (r >= 11) { const L = leagueNorm(), p = avgOf(ms, m => m.us[0]); if (p > 56) out.push(`They keep the ball (${p.toFixed(0)}% possession): be patient without it.`); else if (p < 44) out.push(`They do not mind giving us the ball (${p.toFixed(0)}% possession) and look to break.`); if (avgOf(ms, m => m.us[6]) > 14) out.push('They cross a lot: our defenders must win headers.'); if (avgOf(ms, m => m.them[3]) > L.xg + 0.3) out.push('Their defence gives chances away.'); }
  }
  if (r >= 12) { const top = squadOf(oppCid).filter(p => p.st.a >= 2).sort((a, b) => avgRating(b) - avgRating(a))[0]; if (top) out.push(`In-form player: ${pname(top)}, averaging ${avgRating(top).toFixed(2)}.`); }
  return out;
}

// After each of your matches: what decided it, recurring patterns, and one suggestion. Tags let the next match judge the suggestion.
function postMatchAnalysis(M, fx) {
  const r = staffR('Analyst'), S = M.sides.find(x => x.user), O = M.sides.find(x => !x.user);
  if (!S) return;
  const tags = [], lines = [], gd = S.st.g - O.st.g, xd = S.st.xg - O.st.xg;
  if (xd > 0.8 && gd <= 0) { tags.push('unlucky'); lines.push(`We deserved more: ${S.st.xg.toFixed(1)} xG to ${O.st.xg.toFixed(1)}.`); }
  if (xd < -0.8 && gd >= 0) { tags.push('fortunate'); lines.push(`We rode our luck: they created ${O.st.xg.toFixed(1)} xG to our ${S.st.xg.toFixed(1)}.`); }
  if (S.st.g < S.st.xg - 1) { tags.push('poorFinish'); lines.push('We wasted good chances.'); }
  if (O.st.sh - S.st.sh >= 6) { tags.push('outshot'); lines.push(`They had ${O.st.sh} shots to our ${S.st.sh}.`); }
  const pass = S.st.pa ? 100 * S.st.pc / S.st.pa : 83;
  if (pass < 78) { tags.push('possLoss'); lines.push(`Our passing was poor (${pass.toFixed(0)}%).`); }
  const late = O.goals.filter(g => g.min >= 75).length;
  if (late) { tags.push('lateConcede'); lines.push(`We conceded ${late > 1 ? late + ' goals' : 'a goal'} after 75 minutes.`); }
  if (M.log.some(e => e.t === 'goal' && e.side === O.idx && (e.ck || e.fk))) { tags.push('setPiece'); lines.push('We conceded from a set piece.'); }
  const cond = avgOf(onPitch(S), x => S.cond[x.p.id]);
  if (cond < 58) { tags.push('tired'); lines.push(`The players were exhausted by the end (${cond.toFixed(0)}% condition).`); }
  if (S.st.yc + S.st.rc * 2 >= 4) { tags.push('cards'); lines.push('Too many cards.'); }
  if (r >= 8) { const ds = typeof duelShare === 'function' ? duelShare(S, O) : 50; if (ds < 44) { tags.push('duelsLost'); lines.push(`We lost the individual battles (${ds}% won).`); } else if (ds > 56) lines.push(`We won the individual battles (${ds}%).`); }
  const best = S.played.map(id => [id, S.rat[id]]).sort((a, b) => b[1] - a[1])[0];
  if (best && r >= 5) lines.push(`Best performer: ${pname(G.players[best[0]])} (${best[1].toFixed(1)}).`);
  // Recurring patterns over the last few analyses.
  const hist = (G.analysis || []).slice(0, 7), pats = {};
  tags.forEach(t => { const n = hist.filter(a => a.tags.includes(t)).length; if (n >= 2) pats[t] = n + 1; });
  const FIX = { lateConcede: ['Protect leads late on: earlier substitutions and less pressing after 70 minutes.', 'phy'], poorFinish: ['Finishing practice, and make sure the best finishers get the chances.', 'att'], outshot: ['Tighten up: more cautious mentality or a deeper line.', 'def'], possLoss: ['Use mixed passing, or pick better passers.', 'tac'], setPiece: ['Set-piece training and taller players at corners.', 'set'], tired: ['Rotate and train lighter between matches.', 'rec'], cards: ['Tell aggressive players to stay on their feet.', 'tac'], duelsLost: ['Stronger, more physical players or more physical training.', 'phy'] };
  const key = Object.keys(pats).sort((a, b) => pats[b] - pats[a])[0] || tags.find(t => FIX[t]);
  const a = { fid: fx.id, season: G.season, week: G.week, r: Math.round(r), score: [S.st.g, O.st.g], tags, lines: lines.slice(0, 2 + Math.floor(r / 4)),
    patterns: r >= 7 ? Object.entries(pats).map(([t, n]) => `${t}:${n}`) : [], suggest: key && FIX[key] ? { tag: key, text: FIX[key][0], focus: FIX[key][1] } : null, fixed: null };
  // Judge the previous suggestion: did that problem come back?
  const prev = (G.analysis || [])[0];
  if (prev && prev.suggest && prev.fixed == null) { prev.fixed = !tags.includes(prev.suggest.tag); staffOutcome('analyst', 'analyst|' + prev.suggest.tag, prev.fixed ? 1 : 0, prev.fixed ? 1 : 0); }
  G.analysis = [a, ...(G.analysis || [])].slice(0, 40);
}
const PATTERN_TEXT = { lateConcede: 'conceding late', poorFinish: 'wasting chances', outshot: 'being outshot', possLoss: 'losing the ball', setPiece: 'conceding from set pieces', tired: 'running out of energy', cards: 'picking up cards', duelsLost: 'losing individual battles', unlucky: 'deserving more than we get', fortunate: 'riding our luck' };

/* ---------- stage 3: coaches and physio ---------- */
function coachPlan() {
  const r = staffR('Coach'), nf = nextUserFixture(), rest = nf ? restDays(G.club, nf) : null;
  const ours = squadOf(G.club).filter(p => lvlOf(p) !== 'Y'), cond = avgOf(ours.filter(p => lvlOf(p) === 'A'), p => p.cond), inj = ours.filter(p => p.inj).length;
  const two = userFixtures(G.week).filter(f => !played(f)).length >= 2;
  const why = [];
  let focus = 'bal', intensity = 1;
  if (r >= 6 && (two || (rest != null && rest <= 3)) && cond < 88) { focus = 'rec'; intensity = 0; why.push(two ? 'Two matches this week: recovery first.' : `Only ${rest} days before the next match: recovery first.`); }
  else {
    const weak = teamAnalysis().find(x => x.kind === 'weak' && x.fix && x.fix.focus);
    if (weak && R() < 0.35 + r / 25) { focus = weak.fix.focus; why.push(`Working on our main weakness: ${weak.text.replace(/\.$/, '').toLowerCase()}.`); }
    else why.push('A balanced week.');
    // Learning table: plans are compared with each other (growth against similar players at other clubs).
    const evF = staffEvidence(`coach|${focus}|1`), evB = staffEvidence('coach|bal|1');
    if (focus !== 'bal' && evF && evB && evF.mean < evB.mean - 0.1) { focus = 'bal'; why.push('In past weeks, balanced training has done more for the players than this focus, so we stay balanced.'); }
    else if (focus === 'bal' && r >= 10) {
      const best = TRAINING_FOCUS.filter(f => f.k !== 'rec').map(f => [f.k, staffEvidence(`coach|${f.k}|1`)]).filter(([, e]) => e && e.mean > (evB ? evB.mean : 0) + 0.15).sort((a, b) => b[1].mean - a[1].mean)[0];
      if (best) { focus = best[0]; why.push(`${TRAINING_FOCUS.find(f => f.k === best[0]).n} training has worked best for us so far.`); }
    }
    if (inj >= 4) { intensity = 0; why.push(`${inj} players injured: keep the load light.`); }
    else if (r >= 12 && cond > 88 && (rest == null || rest >= 6)) {
      const hard = staffEvidence(`coach|${focus}|2`), norm = staffEvidence(`coach|${focus}|1`);
      if (hard && norm && hard.mean < norm.mean - 0.1) why.push('Hard weeks have not paid off before, so normal intensity.');
      else { intensity = 2; why.push('Fresh squad and a long week: we can train hard.'); }
    }
  }
  // Individual plans for young players with room to grow: work on their weakest area for their position.
  const indiv = {};
  ours.filter(p => p.age <= 23 && p.pa - p.ca >= 6).sort((a, b) => (b.pa - b.ca) - (a.pa - a.ca)).slice(0, Math.floor(r / 3)).forEach(p => {
    const groups = p.pos === 'GK' ? ['G', 'M', 'P'] : ['T', 'M', 'P'], w = WEIGHTS[p.pos];
    const score = g => { const ks = Object.keys(w).filter(k => ATTRS[A[k]][2] === g); return ks.length ? avgOf(ks, k => p.at[A[k]]) : 99; };
    const g = R() < r / 22 ? groups.sort((a, b) => score(a) - score(b))[0] : pick(groups);
    indiv[p.id] = g;
  });
  return { r: Math.round(r), focus, intensity, indiv, why };
}
function applyCoachPlan(plan) {
  const T = G.training;
  T.focus = plan.focus; T.intensity = plan.intensity;
  Object.entries(plan.indiv).forEach(([id, g]) => { T.indiv[id] = g; });
  const ours = squadOf(G.club).filter(p => lvlOf(p) !== 'Y');
  logStaff({ k: 'coach', key: `coach|${plan.focus}|${plan.intensity}`, r: plan.r, week: G.week, season: G.season, inj: G.flags.injN || 0,
    us: ours.map(p => [p.id, attrSum(p)]), ctrl: coachControl(ours) });
}
const attrSum = p => p.at.reduce((a, b) => a + b, 0);
const squadAttrSum = () => squadOf(G.club).filter(p => lvlOf(p) !== 'Y').reduce((t, p) => t + attrSum(p), 0);
// Control group: for each of our players, a similar player (age within a year, similar potential) at another club.
// Comparing growth with them over the same weeks separates the coaching plan from age, potential and the time of year.
function coachControl(ours) {
  const pool = Object.values(G.players).filter(q => q.club !== G.club && G.clubs[q.club] && lvlOf(q) !== 'Y');
  if (!pool.length) return [];
  return ours.map(p => { const c = pool.filter(q => Math.abs(q.age - p.age) <= 1 && Math.abs(q.pa - p.pa) <= 12); const q = c.length ? pick(c) : pick(pool); return [q.id, attrSum(q)]; });
}
// Average attribute growth of the players in [[id, start sum]] who are still around.
const growthOf = xs => { const g = (xs || []).filter(([id]) => G.players[id]).map(([id, v]) => attrSum(G.players[id]) - v); return g.length ? g.reduce((a, b) => a + b, 0) / g.length : 0; };

// Physio: who should not play in the next match, and how risky the rest are.
function physioAdvice() {
  const r = staffR('Physio'), nf = nextUserFixture(), rest = nf ? restDays(G.club, nf) : null, T = G.tactics;
  const xi = T.slots.concat(T.bench).map(id => G.players[id]).filter(Boolean);
  const out = [], thr = physioThreshold();
  xi.forEach(p => {
    // Condition expected at kick-off after the days of rest still to come.
    const days = nf ? Math.max(0, fxDayNo(nf) - todayNo()) : 3, exp = Math.min(100, p.cond + days * recoveryRate(p));
    const risk = clamp((1.7 - exp / 100) * 2.2 * (p.age >= 32 ? 1.25 : 1) * (bmiOf(p) > 25 ? 1.1 : 1), 0.3, 4); // relative match-injury risk
    if (exp < thr && R() < 0.4 + r / 30) out.push({ id: p.id, exp: Math.round(exp), risk, starter: T.slots.includes(p.id) });
  });
  out.sort((a, b) => a.exp - b.exp);
  const list = out.slice(0, 1 + Math.floor(r / 4));
  if (nf) G.physioLast = { fid: nf.id, ids: list.map(x => x.id), applied: G.physioLast && G.physioLast.fid === nf.id && G.physioLast.applied };
  return { r: Math.round(r), rest, thr, list };
}
// Condition below which the physio advises rest. Learning table: if resting has kept players fit more often than
// playing them anyway, warn earlier; if it has made no difference, warn only for the most tired.
function physioThreshold() {
  const rest = staffEvidence('physio|rested'), play = staffEvidence('physio|played');
  if (!rest || !play) return 80;
  const d = rest.mean - play.mean;
  return d > 0.15 ? 84 : d < 0.05 ? 76 : 80;
}
function applyPhysio(adv) {
  const T = G.tactics, ids = adv.list.map(x => x.id);
  T.slots = T.slots.map(id => (ids.includes(id) ? null : id)); T.bench = T.bench.filter(id => !ids.includes(id));
  ensureUserLineup();
  // The rested players stay out of this match's squad: ensureUserLineup may pick them again, so swap them out.
  const repl = ids.filter(id => T.slots.includes(id) || T.bench.includes(id));
  if (repl.length) { const pool = seniorSquad(G.club).filter(p => available(p) && !ids.includes(p.id) && !T.slots.includes(p.id) && !T.bench.includes(p.id)); T.slots = T.slots.map(id => (ids.includes(id) && pool.length ? pool.shift().id : id)); T.bench = T.bench.filter(id => !ids.includes(id)); }
  const nf = nextUserFixture();
  if (G.physioLast && nf && G.physioLast.fid === nf.id) G.physioLast.applied = true;
  logStaff({ k: 'physio', key: 'physio|rested', r: adv.r, fid: nf && nf.id, ids, week: G.week });
}

/* ---------- stage 4: scouts ---------- */
function teamNeeds() {
  const T = G.tactics, ip = FORMATIONS[T.ip], xi = T.slots.map((id, i) => [i, G.players[id]]).filter(([, p]) => p);
  const avgR = avgOf(xi, ([i, p]) => ovrAt(p, ip[i][0])), needs = [];
  xi.forEach(([i, p]) => { const v = ovrAt(p, ip[i][0]); if (v < avgR - 4) needs.push({ type: 'weak', pos: ip[i][0], cur: v, who: p.id, sev: avgR - v }); });
  xi.forEach(([i, p]) => { if (p.age >= 32 && !needs.some(n => n.pos === ip[i][0])) needs.push({ type: 'age', pos: ip[i][0], cur: ovrAt(p, ip[i][0]), who: p.id, sev: (p.age - 30) * 1.5 }); });
  // Depth: positions where nobody on the bench is close to the starter.
  const seen = new Set();
  xi.forEach(([i, p]) => {
    const pos = ip[i][0]; if (seen.has(pos)) return; seen.add(pos);
    const cover = seniorSquad(G.club).filter(q => q.id !== p.id && !T.slots.includes(q.id) && ovrAt(q, pos) >= ovrAt(p, pos) - 8).length;
    if (!cover && !needs.some(n => n.pos === pos)) needs.push({ type: 'depth', pos, cur: ovrAt(p, pos) - 10, who: null, sev: 2 });
  });
  return needs.sort((a, b) => b.sev - a.sev).slice(0, 3);
}
function scoutAdvice() {
  const r = staffR('Scout'), needs = teamNeeds(), budget = G.fin.tb, room = G.fin.wb - clubWageBill(userClub());
  const minKnow = Math.max(25, 72 - r * 2.5), recs = [];
  needs.forEach(nd => {
    // Learning table: signings for this kind of need that rated well before count for more; ones that flopped count for less.
    const ev = staffEvidence('scout|' + nd.type), evW = ev ? clamp(ev.mean, -0.6, 0.6) * 3 : 0;
    const pool = Object.values(G.players).filter(p => p.club !== G.club && lvlOf(p) !== 'Y' && knowOf(p) >= minKnow && (p.pos === nd.pos || p.alt.includes(nd.pos)) && p.age <= 33);
    const scored = pool.map(p => {
      const so = seenOvr(p), at = so.v + (ovrAt(p, nd.pos) - p.ca), fee = p.club === 'FA' ? 0 : askingPrice(p), wage = wageDemand(p, false);
      if (fee > budget || wage > room) return null;
      const gain = at - nd.cur, youth = p.age <= 23 ? (seenPot(p) - stars(p.ca)) * 2 : 0, unlikely = p.ca > userClub().rep + 6 + joinPull(p);
      if (gain < 2 || unlikely) return null;
      return { p, nd, gain: r1(gain), fee, wage, score: gain + youth + evW - fee / 8e6 + rf(-1, 1) * (20 - r) * 0.3 };
    }).filter(Boolean).sort((a, b) => b.score - a.score).slice(0, 1 + Math.floor(r / 7));
    recs.push(...scored);
  });
  return { r: Math.round(r), needs, recs: recs.slice(0, 2 + Math.floor(r / 5)), minKnow: Math.round(minKnow) };
}
function logScoutRecs(adv) {
  adv.recs.forEach(x => { if (!(G.staffLog || []).some(e => e.k === 'scout' && e.pid === x.p.id && e.season === G.season)) logStaff({ k: 'scout', key: 'scout|' + x.nd.type, pid: x.p.id, pos: x.nd.pos, gain: x.gain, r: adv.r, season: G.season }); });
}

/* ---------- optional AI wording for every staff role ---------- */
// DeepSeek rewords a staff member's advice from the computed facts only (AI settings: "Staff advice in words").
// The same check as the assistant: any number, player or club not in the facts and the built-in wording is kept.
const STAFF_WORDS = {};
const STAFF_ROLE_TEXT = { Analyst: 'performance analyst', Coach: 'first-team coach', Physio: 'head physio', Scout: 'chief scout', Director: 'director of football', Press: 'press officer' };
function staffWords(role, key, facts) {
  if (typeof aiReady !== 'function' || !aiReady('ds', 'staff') || !facts || !facts.length) return null;
  const c = STAFF_WORDS[key];
  if (c) return c.text || null;
  STAFF_WORDS[key] = {};
  const r = Math.round(staffR(role)), data = { role: STAFF_ROLE_TEXT[role], facts };
  const sys = `You are the club's ${STAFF_ROLE_TEXT[role]}, talking to the manager. ${r >= 15 ? 'Sound sure of yourself.' : r >= 9 ? 'Be practical.' : 'Keep it simple and hedge a little.'} ` +
    'Write 2-3 short sentences summing up your advice. Use ONLY the facts given. Do not add any number, player, club or event that is not in the facts. ' + AI_STYLE + ' Reply only with JSON {"text": "..."}.';
  dsChat([{ role: 'system', content: sys }, { role: 'user', content: JSON.stringify(data) }], role + ' advice', { json: true, maxTokens: 220 }).then(res => {
    const t = String(JSON.parse(res.text).text || '').trim();
    if (t && staffTextValid(t, data)) { STAFF_WORDS[key].text = t; if (typeof render === 'function') render(); }
  }).catch(() => { /* keep the built-in wording */ });
  return null;
}

/* ---------- recording, outcomes, staff growth ---------- */
function logStaff(e) {
  G.staffLog = G.staffLog || [];
  G.staffLog.push({ ...e, t: Date.now(), res: null });
  if (G.staffLog.length > STAFF_LOG_MAX) G.staffLog.splice(0, G.staffLog.length - STAFF_LOG_MAX);
}
// Good advice earns that role's staff experience, and every outcome goes into the learning table.
function staffOutcome(role, key, value, xp) {
  const roleName = { assist: 'Assistant', analyst: 'Analyst', coach: 'Coach', physio: 'Physio', scout: 'Scout' }[role];
  staffOf(roleName).forEach(s => { s.xp = (s.xp || 0) + xp; });
  staffLearnAdd(key, value);
}
// Weekly: judge the assistant's advice after the match, coach plans after four weeks, physio advice after the match.
function staffWeekly() {
  (G.staffLog || []).forEach(e => {
    if (e.res && e.k !== 'assist') return;
    if (e.k === 'coach' && (G.week - e.week >= 4 || (e.season != null && e.season !== G.season))) {
      const injuries = (G.flags.injN || 0) - e.inj;
      if (!e.us) { e.res = { old: true }; return; } // logged before control groups existed: not comparable
      // Growth of our players against the control group over the same weeks: positive means the plan beat normal development.
      const growth = growthOf(e.us), ctrl = growthOf(e.ctrl), rel = growth - ctrl;
      e.res = { growth: r1(growth), ctrl: r1(ctrl), rel: r1(rel), injuries };
      staffOutcome('coach', e.key, rel - injuries * 0.05, rel > 0.3 && injuries <= 2 ? 2 : rel > 0 ? 1 : 0);
    }
    if (e.k === 'assist' && e.res && !e.judged) {
      e.judged = true;
      const exp = (3 * e.pred.w + e.pred.d) / 100, val = e.res.pts - exp;
      staffOutcome('assist', 'assist|' + (e.rec !== e.cur ? 'switch' : 'stick') + (e.followed ? '' : '|ignored'), val, (e.followed && val > 0 ? 1 : 0) + ((e.res.pts === 3 ? 0 : e.res.pts === 1 ? 1 : 2) === [e.pred.w, e.pred.d, e.pred.l].indexOf(Math.max(e.pred.w, e.pred.d, e.pred.l)) ? 1 : 0));
    }
    if (e.k === 'physio' && e.fid) {
      const fx = G.fixtures.find(f => f.id === e.fid);
      if (fx && played(fx)) { const hurt = e.ids.filter(id => G.players[id] && G.players[id].inj).length; e.res = { hurt }; staffOutcome('physio', 'physio|rested', hurt ? 0 : 1, hurt ? 0 : 1); }
    }
  });
  // Physio advice that was not followed: did the flagged players who played get injured? (the comparison for 'rested')
  const L = G.physioLast, fx = L && G.fixtures.find(f => f.id === L.fid);
  if (L && fx && played(fx)) {
    if (!L.applied && fx.ratings) {
      const us = fx.h === G.club ? 0 : 1, ran = new Set((fx.ratings[us] || []).map(x => x[0]));
      L.ids.filter(id => ran.has(id)).forEach(id => staffLearnAdd('physio|played', G.players[id] && G.players[id].inj ? 0 : 1));
    }
    G.physioLast = null;
  }
}
// Scouts: judged at the end of the season, on how the players they recommended did.
function staffSeasonEnd() {
  if (typeof transferLearnSeason === 'function') transferLearnSeason();
  (G.staffLog || []).forEach(e => {
    if (e.k === 'scout' && e.season === G.season && !e.res) {
      const p = G.players[e.pid];
      if (!p) { e.res = { gone: true }; return; }
      const signed = p.club === G.club, rt = p.st.a ? avgRating(p) : null;
      e.res = { signed, apps: p.st.a, rt: rt ? r1(rt) : null };
      if (signed && p.st.a >= 8) staffOutcome('scout', e.key, rt - 6.8, rt >= 6.9 ? 3 : 0);
      else if (!signed && p.st.a >= 8) staffLearnAdd(e.key + '|missed', rt - 6.8);
    }
  });
  // Experience turns into rating: up to +2 a season. Older staff improve more slowly.
  const up = [];
  G.staff.forEach(s => {
    const xp = s.xp || 0, gain = s.age > 60 ? (xp >= 14 ? 1 : 0) : xp >= 12 ? 2 : xp >= 5 ? 1 : 0;
    if (gain && s.rating < 20) { s.rating = Math.min(20, s.rating + gain); up.push(`${s.name} (${s.role.toLowerCase()}) +${gain}`); }
    s.xp = 0;
  });
  if (up.length) addNews('club', 'Staff have learned from the season', `Their advice paid off and they have improved: ${up.join(', ')}.`);
}

/* ---------- learning tables (device-wide, like the AI Brain) ---------- */
const STAFF_KEY = 'futbol-manager:staff';
let SLEARN = null;
function staffLearn() {
  if (SLEARN) return SLEARN;
  SLEARN = { v: 1, draft: {}, versions: [], active: null };
  try { const s = JSON.parse(localStorage.getItem(STAFF_KEY) || 'null'); if (s) SLEARN = { ...SLEARN, ...s }; } catch (e) { /* storage blocked */ }
  return SLEARN;
}
function staffLearnSave() { try { localStorage.setItem(STAFF_KEY, JSON.stringify(staffLearn())); return true; } catch (e) { return false; } }
function staffLearnAdd(key, value) {
  const L = staffLearn(), x = L.draft[key] || (L.draft[key] = { n: 0, sum: 0 });
  x.n++; x.sum = Math.round((x.sum + value) * 1000) / 1000;
  staffLearnSave();
}
const staffActive = () => staffLearn().versions.find(v => v.id === staffLearn().active) || null;
// Evidence from the approved version: { n, mean } for a key, or null.
function staffEvidence(key) {
  const V = staffActive(), x = V && V.table[key];
  return x && x.n >= 3 ? { n: x.n, mean: x.sum / x.n } : null;
}
function staffSnapshot() {
  const L = staffLearn();
  return { app: GAME_VERSION, tables: L.draft, records: { versions: L.versions.length, active: L.active, transfers: typeof transferSummary === 'function' && G ? transferSummary() : null } };
}
