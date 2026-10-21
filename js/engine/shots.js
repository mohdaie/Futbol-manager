'use strict';
/* ===== shots.js =====
   Shot engine: who gets the chances, and how many. sim.js asks it at four points of a move:
   - shotWill(): how keen the player on the ball is to shoot (position, role, Finishing, Flair, marking).
   - lateRuns(): when a move reaches the final third, midfielders with Off the Ball, Teamwork and a
     running role arrive in and around the box, so they are there to be found.
   - targetWeight(): who the pass or cross goes to. Players arriving late are found more; a player
     who has already caused danger is marked more tightly and found less.
   - layOff(): a marked player about to shoot can square or cut it back to a free team-mate instead.
   Attention: each side remembers the danger every opponent has caused this match (shots, xG, goals)
   and marks him more closely, so a lone striker cannot take every shot. Players with good Teamwork,
   Vision and Decisions share the ball; selfish, high-Flair finishers still shoot more. */

// How readily each position shoots when it has the ball in a shooting position. A striker gets far more of those
// chances than anyone else, so his factor is lower: together this gives top-flight shot shares by position.
const SHOT_POS = { GK: 0, DC: 0.35, DL: 0.4, DR: 0.4, DM: 0.45, MC: 0.7, ML: 0.75, MR: 0.75, AML: 0.85, AMR: 0.85, AMC: 0.9, ST: 0.62 };
const SHOT_TUNE = { rate: 1.35, mark: 0.3, double: 0.25, late: 0.55 };

const posOf = (S, i) => FORMATIONS[S.ip][i][0];
// Attention counts most for the player who causes most of his side's danger: a team that shoots a lot does not get
// its striker doubled up just for having the ball, only a striker who takes the lion's share.
function attention(O, pid) {
  const A = O.att, a = (A && A[pid]) || 0;
  if (!a) return 0;
  const tot = O.attSum || a;
  return a * clamp(2 * a / tot, 0.3, 1.2);
}
// Marking factor for a player: 1 when nobody pays him special attention, lower the more danger he has caused.
// It grows faster than the danger itself: after several shots he is doubled up on.
const watchF = (O, pid) => { const a = attention(O, pid); return 1 / (1 + SHOT_TUNE.mark * a + SHOT_TUNE.double * a * a); };

// After every shot: the defending side O takes more notice of the shooter (and of the provider a little).
function noteThreat(O, pid, aid, xg, goal) {
  const A = O.att || (O.att = {}), d = 0.5 + xg * 2.5 + (goal ? 1.5 : 0);
  A[pid] = (A[pid] || 0) + d; O.attSum = (O.attSum || 0) + d;
  if (aid && aid !== pid) { A[aid] = (A[aid] || 0) + 0.25; O.attSum += 0.25; }
}

// Multiplier on the carrier's shot weight in chooseAction().
function shotWill(S, O, i) {
  const pos = posOf(S, i), p = G.players[S.on[i]];
  const selfish = p ? 1 + (av(S, i, 'fla') - 12) * 0.02 - (av(S, i, 'tea') - 12) * 0.015 : 1;
  // Patient possession sides keep probing until the opening comes, rather than recycling the ball: they take
  // the shot when it is there, if the players suit possession play.
  const patient = (S.tempo ?? 1) === 0 ? clamp(1.3 + 0.4 * (S.fit ? S.fit.poss : 0), 1, 1.7) : 1;
  return SHOT_TUNE.rate * patient * (SHOT_POS[pos] ?? 0.6) * clamp(selfish, 0.8, 1.15) * Math.pow(watchF(O, S.on[i]), 1.2);
}

// Late runs into the box: chosen once per move when the ball first reaches the final third.
// Returns the slots that arrive; positions() of those players are then moved forward each step.
function lateRuns(S, y, counter) {
  if (y > 0.36) return null;
  // Patient build-up gives runners time to arrive (if the players suit possession play); a fast break leaves them behind.
  const fp = S.fit ? S.fit.poss : 0, tempo = S.tempo ?? 1;
  const pace = (counter ? 0.85 : 1) * (tempo === 0 ? clamp(1.25 + 0.4 * fp, 0.9, 1.7) : tempo === 2 ? 0.9 : 1);
  const out = [];
  S.on.forEach((id, k) => {
    if (!id || !k) return;
    const ln = LINE[posOf(S, k)];
    if (ln < 2 || ln > 4) return;
    const chance = SHOT_TUNE.late * (0.35 + beh(S, k, 'run') * 0.6 + beh(S, k, 'fw') * 0.4 + (av(S, k, 'otb') - 12) * 0.04 + (av(S, k, 'tea') - 12) * 0.02 + (av(S, k, 'sta') - 12) * 0.015) * (ln === 2 ? 0.45 : 1);
    if (R() < clamp(chance * pace, 0.03, 0.85)) out.push([k, rf(0.36, 0.64), rf(0.08, 0.24)]);
  });
  return out;
}
// Put the late runners where they arrive (in the attacking side's frame).
function applyRuns(posS, runs) {
  if (!runs) return posS;
  runs.forEach(([k, rx, ry]) => { const q = posS[k]; if (q && q[1] > ry) posS[k] = [q[0] + (rx - q[0]) * 0.6, ry]; });
  return posS;
}

// Multiplier on a team-mate's chance of being picked for a pass, through ball or cross.
function targetWeight(S, O, k, y) {
  let w = watchF(O, S.on[k]);
  // Near the box, attacking midfielders and wide players are options too, not just the striker.
  if (y < 0.4) w *= (SHOT_POS[posOf(S, k)] ?? 0.6) * (0.85 + av(S, k, 'otb') / 40);
  return w;
}

// The player in slot i is about to shoot. Returns the slot of a free team-mate to lay it off to, or -1.
function layOff(S, O, i, x, y, posS, posO, pressure) {
  if (y > 0.34) return -1;
  const cands = posS.map((q, k) => (q && k && k !== i && q[1] < 0.34 && Math.abs(q[1] - y) < 0.2 && dist(q, [x, y]) < 0.3 ? k : -1)).filter(k => k > 0);
  if (!cands.length) return -1;
  const marked = attention(O, S.on[i]);
  const giving = (av(S, i, 'tea') + av(S, i, 'vis') + av(S, i, 'dec') - 36) * 0.012 - (av(S, i, 'fla') - 12) * 0.01;
  // Strikers, closest to goal and most closely watched, lay it off most; their team-mates arrive facing goal.
  // Possession sides look for the cut-back more, if their players suit it.
  const patient = (S.tempo ?? 1) === 0 ? clamp(0.06 + 0.12 * (S.fit ? S.fit.poss : 0), -0.05, 0.2) : 0;
  const p = clamp(0.12 + (posOf(S, i) === 'ST' ? 0.18 : 0) + pressure * 0.3 + marked * 0.07 + giving + patient, 0, 0.75);
  if (R() >= p) return -1;
  // The best-placed free team-mate: open, close to goal, and likely to finish.
  return wpick(cands, k => { const op = nearest(posO, posS[k])[1]; return Math.pow(op + 0.02, 1.5) * (1.2 - posS[k][1]) * (SHOT_POS[posOf(S, k)] ?? 0.6) * (av(S, k, 'fin') / 12) * watchF(O, S.on[k]); });
}

// Who a cross is aimed at: players in the box, plus a wide player arriving at the far post. Heading and height
// count, but a striker who has already been dangerous is picked up by a marker (full attention, not softened).
function crossTarget(S, O, i, x, posS) {
  const cands = posS.map((q, k) => {
    if (!q || !k || k === i) return -1;
    if (q[1] < 0.3) return k;
    return LINE[posOf(S, k)] >= 3 && Math.abs(q[0] - x) > 0.4 && q[1] < 0.48 ? k : -1; // far-post run
  }).filter(k => k > 0);
  if (!cands.length) return -1;
  return wpick(cands, k => Math.pow(Math.max(1, aerialAt(S, k)), 1.3) * (1 + beh(S, k, 'aer')) * (0.8 + av(S, k, 'otb') / 40) * (SHOT_POS[posOf(S, k)] ?? 0.6) * watchF(O, S.on[k]));
}
