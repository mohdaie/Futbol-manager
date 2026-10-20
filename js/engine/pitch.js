'use strict';
/* ===== pitch.js =====
   Where players stand, and the tactical vocabulary the match engine reads:
   tactical styles (presets of the team instructions), role behaviour,
   and player instructions. positions() is shared by the match engine, the 2D
   view and the tactics screen, so what you set is what you see.

   Frame: every side is described in its own frame, as in FORMATIONS:
   x 0 = left touchline, x 1 = right; y 0 = the goal it attacks, y 1 = its own goal.
   The other side's frame is the mirror image (1 - x, 1 - y). */

// Five tactical styles, built from the team instructions. Formation and roles are recommendations applied with the style.
const STYLES = {
  gegen: { n: 'Gegenpressing', d: 'Win the ball back straight after losing it, high up the pitch, and attack quickly before the opponent is organised.',
    ins: { ment: 3, tempo: 2, width: 1, pass: 1, press: 2, line: 2, lost: 2, won: 2 }, ip: '4-3-3', oop: '4-3-3',
    roles: { ST: 'Pressing Forward', MC: 'Box-to-Box', DM: 'Ball-Winner', AML: 'Inside Forward', AMR: 'Inside Forward', DL: 'Full-Back', DR: 'Full-Back' } },
  tiki: { n: 'Tiki-taka', d: 'Keep the ball with short passes, move it patiently, press high to get it back and wait for the opening.',
    ins: { ment: 3, tempo: 0, width: 1, pass: 0, press: 2, line: 2, lost: 2, won: 0 }, ip: '4-3-3', oop: '4-1-4-1',
    roles: { GK: 'Ball-Playing Keeper', DC: 'Ball-Playing Defender', DL: 'Inverted Full-Back', DR: 'Inverted Full-Back', DM: 'Deep-Lying Playmaker', MC: 'Playmaker', AML: 'Inverted Winger', AMR: 'Inverted Winger', ST: 'False Nine' } },
  bal: { n: 'Balanced', d: 'A solid, flexible approach with no extremes. A good base to adjust during a match.',
    ins: { ment: 2, tempo: 1, width: 1, pass: 1, press: 1, line: 1, lost: 1, won: 1 }, ip: '4-2-3-1', oop: '4-4-2', roles: {} },
  counter: { n: 'Counter-attack', d: 'Defend deep and compact, then break forward quickly into the space the opponent leaves behind.',
    ins: { ment: 1, tempo: 2, width: 2, pass: 2, press: 0, line: 0, lost: 0, won: 2 }, ip: '4-2-3-1', oop: '4-4-2',
    roles: { ST: 'Advanced Forward', AML: 'Inside Forward', AMR: 'Inside Forward', DM: 'Anchor', AMC: 'Shadow Striker' } },
  long: { n: 'Long ball', d: 'Skip midfield with long balls to a strong target man, then win the second balls and attack crosses.',
    ins: { ment: 2, tempo: 1, width: 2, pass: 2, press: 1, line: 1, lost: 1, won: 1 }, ip: '4-4-2', oop: '4-4-2',
    roles: { ST: 'Target Forward', DC: 'Stopper', ML: 'Winger', MR: 'Winger', MC: 'Box-to-Box' } },
};
const STYLE_KEYS = ['ment', 'tempo', 'width', 'pass', 'press', 'line', 'lost', 'won'];
// Which style the current instructions match (or null for a custom tactic).
const styleOf = T => Object.keys(STYLES).find(k => STYLE_KEYS.every(x => (T[x] ?? 1) === STYLES[k].ins[x])) || null;
function applyStyle(T, k) {
  const st = STYLES[k];
  Object.assign(T, st.ins);
  T.ip = st.ip; T.oop = st.oop;
  T.roles = FORMATIONS[st.ip].map(([pos]) => { const i = ROLES[pos].findIndex(r => r.n === st.roles[pos]); return i < 0 ? 0 : i; });
}

// How each role behaves on the ball and without it. Values are roughly -1..1.
// fw forward position, wd width (+ wider, - narrower), sh shooting, dr dribbling, cr crossing, thr through balls,
// rk risky passing, run runs in behind, pr pressing, tk tackling, aer aerial target, hold hold-up play, sweep keeper sweeping.
const ROLE_B = {
  'Sweeper Keeper': { sweep: 1, rk: 0.2 }, 'Ball-Playing Keeper': { rk: 0.4 },
  'Wing-Back': { fw: 0.6, wd: 0.3, cr: 0.5, run: 0.3, pr: 0.2 }, 'Inverted Full-Back': { wd: -0.7, fw: 0.15, rk: 0.2 },
  'Ball-Playing Defender': { rk: 0.4, thr: 0.2 }, Stopper: { fw: 0.15, tk: 0.4, pr: 0.3 },
  Anchor: { fw: -0.25, rk: -0.4, pr: -0.3 }, 'Deep-Lying Playmaker': { rk: 0.3, thr: 0.5, fw: -0.1 }, 'Ball-Winner': { pr: 0.6, tk: 0.5 },
  Winger: { wd: 0.4, cr: 0.7, dr: 0.4 }, 'Wide Playmaker': { wd: -0.3, thr: 0.4, rk: 0.2 }, 'Wide Midfielder': { pr: 0.1 },
  'Box-to-Box': { fw: 0.25, run: 0.3, sh: 0.2, pr: 0.2 }, Playmaker: { thr: 0.6, rk: 0.4 }, Mezzala: { wd: 0.25, fw: 0.3, run: 0.3, dr: 0.3 },
  'Inside Forward': { wd: -0.35, sh: 0.6, dr: 0.4, run: 0.5 }, 'Inverted Winger': { wd: -0.2, thr: 0.4, cr: 0.2, dr: 0.3 },
  'Attacking Midfielder': { sh: 0.3, thr: 0.3, run: 0.2 }, 'Advanced Playmaker': { thr: 0.7, rk: 0.4 }, 'Shadow Striker': { fw: 0.3, run: 0.7, sh: 0.4 },
  'Advanced Forward': { run: 0.7, sh: 0.3, fw: 0.05 }, 'Target Forward': { aer: 1, hold: 0.7, run: -0.3 }, 'Pressing Forward': { pr: 0.9, run: 0.2 },
  'False Nine': { fw: -0.45, thr: 0.5, sh: -0.3, dr: 0.2 }, Poacher: { run: 0.9, sh: 0.6, pr: -0.5, fw: 0.05 },
};

// Player instructions: set per position (slot) on the Player instructions page. Stored as index 0/1/2, read as -1/0/+1.
const PLAYER_INS = [
  { k: 'sh', n: 'Shooting', o: ['Shoot less', 'Normal', 'Shoot more'] },
  { k: 'dr', n: 'Dribbling', o: ['Dribble less', 'Normal', 'Dribble more'] },
  { k: 'rk', n: 'Passing', o: ['Safer passes', 'Normal', 'Riskier passes'] },
  { k: 'cr', n: 'Crossing', o: ['Cross less', 'Normal', 'Cross more'] },
  { k: 'fw', n: 'Forward runs', o: ['Stay back', 'Normal', 'Get further forward'] },
  { k: 'wd', n: 'Position', o: ['Sit narrower', 'Normal', 'Stay wider'] },
  { k: 'pr', n: 'Pressing', o: ['Press less', 'Normal', 'Press more'] },
  { k: 'tk', n: 'Tackling', o: ['Stay on feet', 'Normal', 'Tackle harder'] },
  { k: 'mk', n: 'Marking', o: ['Zonal', 'Normal', 'Mark tighter'] },
];
const GK_INS = ['rk'];
// Behaviour of the player in slot i for key k: role behaviour plus his player instruction.
function beh(S, i, k) {
  const pos = FORMATIONS[S.ip][i][0], role = ROLES[pos][(S.roles || [])[i]] || ROLES[pos][0];
  const pi = S.pi && S.pi[i] && S.pi[i][k] != null ? S.pi[i][k] - 1 : 0;
  return ((ROLE_B[role.n] || {})[k] || 0) + pi * 0.6;
}
const roleName = (S, i) => { const pos = FORMATIONS[S.ip][i][0]; return (ROLES[pos][(S.roles || [])[i]] || ROLES[pos][0]).n; };

// Deterministic small error per slot: low tactical familiarity puts players slightly out of place.
const slotNoise = (i, salt) => Math.sin(i * 12.9898 + salt * 78.233) * 0.5;

/* Positions of a side's players, in its own frame.
   T: the side (or a tactic with on/map), hasBall: in possession, bx/by: the ball in this side's frame. */
function positions(T, hasBall, bx = 0.5, by = 0.5) {
  const ip = FORMATIONS[T.ip], oop = FORMATIONS[T.oop], map = T.map || shapeMap(T.ip, T.oop);
  const width = T.width ?? 1, line = T.line ?? 1, press = T.press ?? 1, ment = T.ment ?? 2;
  const fam = T.fam ?? 100;
  return (T.on || []).map((id, i) => {
    if (!id) return null;
    const src = hasBall ? ip[i] : oop[map[i]], pos = ip[i][0];
    let x = src[1], y = src[2];
    const p = G.players[id], cond = T.cond && T.cond[id] != null ? T.cond[id] : 100;
    if (pos === 'GK') {
      // Keepers come off their line behind a high line, sweepers most of all.
      const off = (line - 1) * 0.02 + beh(T, i, 'sweep') * 0.03 * (by < 0.5 ? 1 : 0.3);
      return [clamp(0.5 + (bx - 0.5) * 0.12, 0.42, 0.58), clamp(0.955 - off - (hasBall ? 0.01 : 0), 0.86, 0.97)];
    }
    const back = LINE[pos] === 1, front = LINE[pos] >= 4;
    if (hasBall) {
      x = 0.5 + (x - 0.5) * [0.8, 1, 1.16][width];
      y -= (ment - 2) * (back ? 0.015 : 0.03);
      y -= beh(T, i, 'fw') * 0.07 + beh(T, i, 'run') * 0.025;
      const wd = beh(T, i, 'wd');
      x += Math.sign(x - 0.5 || 1) * wd * 0.07;
      y += (by - 0.5) * 0.42; // the block moves up and down with the ball
      x += (bx - 0.5) * 0.12;
    } else {
      x = 0.5 + (x - 0.5) * [0.86, 0.9, 0.95][width === 2 ? 2 : 1]; // compact without the ball
      if (back) y += [0.06, 0, -0.07][line];
      y += [0.07, 0, -0.06][press] * (front ? 1.3 : back ? 0.5 : 1);
      y -= beh(T, i, 'pr') * (front ? 0.03 : 0.015);
      y += (by - 0.5) * 0.3;
      x += (bx - x) * 0.2; // shift across to the ball side
      if (cond < 60) y += (60 - cond) / 500 * (p && p.pers === 'Professional' ? 0.5 : 1); // tired players drop off
    }
    const err = (100 - fam) / 100 * 0.04;
    x += slotNoise(i, 1) * err; y += slotNoise(i, 2) * err;
    return [clamp(x, 0.04, 0.96), clamp(y, back && !hasBall ? 0.2 : 0.05, 0.93)];
  });
}
// Mirror a point into the other side's frame.
const flip = pt => (pt ? [1 - pt[0], 1 - pt[1]] : null);

// The offside line in the attacking side's frame: the deepest outfield defender (second-last opponent).
function offsideLine(O, oPos) {
  let deep = 0;
  O.on.forEach((id, i) => { if (id && i !== 0 && oPos[i]) deep = Math.max(deep, oPos[i][1]); });
  return Math.min(0.5, 1 - deep); // never offside in your own half
}
