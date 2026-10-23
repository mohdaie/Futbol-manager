'use strict';
/* Rulebook layer 1. Shared pitch language and team anchors, in the side's own
   frame (y=0 is the goal attacked). No action probabilities or style balancing.
   Individual decisions/runs are still the existing engine, layered over these anchors. */
const PITCH = Object.freeze({ width: 68, length: 105, lanes: [0, 13.8, 24.8, 43.2, 54.2, 68] });
const LANE_NAMES = ['Left wide', 'Left half-space', 'Centre', 'Right half-space', 'Right wide'];
const PHASE_NAMES = { build: 'Build-up', progress: 'Progression', create: 'Chance creation', finish: 'Finishing', high: 'High press', mid: 'Mid block', low: 'Low block', restart: 'Set piece' };

// Geometry only. Contextual spaces (between lines / behind the line) need the
// opposition's actual line positions, supplied in the same attacking frame.
function pitchZone(x, y, lines = {}) {
  const X = clamp(x, 0, 1) * PITCH.width, d = clamp(y, 0, 1) * PITCH.length;
  let lane = 0;
  while (lane < 4 && X >= PITCH.lanes[lane + 1]) lane++;
  const centre = lane === 2, half = lane === 1 || lane === 3;
  return { lane, third: d <= 35 ? 'final' : d <= 70 ? 'middle' : 'defensive', distance: d,
    zone14: centre && d >= 17 && d <= 30,
    cutback: half && d >= 6 && d <= 18,
    box: d <= 16.5 && Math.abs(X - 34) <= 20.15,
    sixYard: d <= 5.5 && Math.abs(X - 34) <= 9.15,
    penaltySpot: centre && d >= 9 && d <= 13,
    edge: centre && d >= 16 && d <= 22,
    betweenLines: Number.isFinite(lines.back) && Number.isFinite(lines.mid) && y > lines.back && y < lines.mid,
    behindLine: Number.isFinite(lines.back) && y < lines.back };
}

function teamPhase(T, has, bx, by, restart = false) {
  if (restart) return 'restart';
  const z = pitchZone(bx, by);
  if (has) return z.box || (z.edge && z.distance <= 22) ? 'finish' : z.third === 'defensive' ? 'build' : z.third === 'middle' ? 'progress' : 'create';
  return by >= 2 / 3 || (T.press ?? 1) === 0 ? 'low' : (T.press ?? 1) === 2 && by <= 1 / 3 ? 'high' : 'mid';
}

// Stable defensive/screening assignments. The carrier is never counted as his
// own cover; missing players stay missing (red cards / substitutions).
function restSlots(T, bx, carrier = -1) {
  const f = FORMATIONS[T.ip], active = (T.on || []).map((id, i) => id && i > 0 && i !== carrier ? i : -1).filter(i => i > 0);
  const score = i => {
    const pos = f[i][0], name = roleName(T, i), far = (f[i][1] - 0.5) * (bx - 0.5) < 0;
    return pos === 'DC' ? 0 : ['DL', 'DR'].includes(pos) ? (name === 'Wing-Back' ? 4 : name === 'Inverted Full-Back' ? 3 : far ? 1 : 2) : pos === 'DM' ? 5 : pos === 'MC' ? 6 : 10;
  };
  const backCount = (T.ment ?? 2) >= 4 || styleOf(T) === 'gegen' ? 2 : 3;
  const sorted = active.slice().sort((a, b) => score(a) - score(b) || f[b][2] - f[a][2] || a - b);
  const back = sorted.slice(0, Math.min(backCount, active.length));
  const screen = active.filter(i => !back.includes(i)).sort((a, b) => {
    const rank = i => f[i][0] === 'DM' ? 0 : roleName(T, i) === 'Inverted Full-Back' ? 1 : f[i][0] === 'MC' ? 2 : 3;
    return rank(a) - rank(b) || f[b][2] - f[a][2] || a - b;
  }).slice(0, 2);
  return { back, screen };
}

// Rulebook layer 2: a position has a job in this phase. Width comes from
// selected roles; no preset silently converts the attack into a fixed formation.
// lines (optional, own frame): the opponent's back line and midfield line, so that players can take the space
// between them (rulebook 1.3, 3.2-3.5, 6.5, 6.6). Without them (tactics screen, demo) the anchors are used.
function positionJobs(T, raw, bx, by, phase, lines = null) {
  const f = FORMATIONS[T.ip], final = phase === 'create' || phase === 'finish', build = phase === 'build';
  // The pocket between the opponent's midfield and back lines, kept onside (just short of the back line).
  const pocket = lines && lines.mid - lines.back > 8 / 105 ? clamp(lines.back + (lines.mid - lines.back) * 0.45, lines.back + 3 / 105, 0.9) : null;
  // The ball-side winger holds the touchline (more than 0.35 of the pitch width from the centre): the full-back, wing-back or
  // mezzala on that side underlaps into the half-space channel instead.
  const holdsWidth = side => (bx - .5) * side > 0 && raw.some((r, j) => r && j && roleName(T, j) === 'Winger' && (f[j][1] - .5) * side > 0 && Math.abs(r[0] - .5) > .35);
  const jobs = [], positions = raw.map((q, i) => {
    if (!q) { jobs[i] = null; return null; }
    const role = roleName(T, i), slot = f[i], side = slot[1] < .5 ? -1 : 1;
    const half = side < 0 ? 19.3 / 68 : 48.7 / 68, near = (bx - .5) * side > .08;
    let [x, y] = q, job = 'Offer a passing angle';
    if (i === 0) {
      job = 'Support behind the centre-backs';
      y = phase === 'build' ? .94 - (role === 'Ball-Playing Keeper' ? .025 : 0) : .91;
    } else if (slot[0] === 'DC') {
      // 6.2: in build-up the centre-backs split towards the edges of the box, about 15-20 m out.
      if (build) { x = .5 + side * .21; y = clamp(Math.min(by + .02, 1 - 16 / 105), 1 - 24 / 105, 1 - 14 / 105); job = 'Split to build from the keeper'; }
      else job = 'Hold rest defence';
    } else if (role === 'Inverted Full-Back') {
      // 6.3: steps inside beside the 6, in build-up too (that is what makes the 2-3 to play out).
      x = .5 + side * .15; y = build ? 1 - 30 / 105 : clamp(by + .1, .34, .72); job = 'Invert beside the pivot';
    } else if (role === 'Wing-Back') {
      x = .5 + side * .43; y = build ? 1 - 38 / 105 : clamp(by - .05, .10, .48); job = 'Hold width high';
      if (!build && near && holdsWidth(side)) { x = half; y = clamp(by - .08, .04, .96); job = 'Underlap half-space channel'; }
    } else if (role === 'Full-Back') {
      job = final && near ? 'Overlap on the ball side' : 'Support width / cover the far side';
      if (build) { x = .5 + side * .44; y = 1 - 32 / 105; job = 'Give width higher up in build-up'; } // 6.3
      if (final && near) y = clamp(by + .03, .10, .38);
      // Underlap: the advancing full-back takes the half-space channel just ahead of the ball, outside the winger's inside line.
      if (!build && near && holdsWidth(side)) { x = half; y = clamp(by - .08, .04, .96); job = 'Underlap half-space channel'; }
      // 6.0: when the wide forward on his side plays inside, the touchline is his.
      const inside = !build && f.some((sl, k) => k !== i && LINE[sl[0]] >= 3 && (sl[1] - .5) * side > .25 && T.on && T.on[k] && ['Inside Forward', 'Inverted Winger', 'Wide Playmaker'].includes(roleName(T, k)));
      if (inside) { x = .5 + side * .44; y = Math.min(y, clamp(by + (near ? -.02 : .06), .12, .6)); job = 'Take the touchline (the wide forward is inside)'; }
    } else if (slot[0] === 'DM') {
      job = build ? 'Show in front of the centre-backs' : 'Screen behind the ball';
      y = build ? 1 - 27 / 105 : clamp(by + .07, .34, .8); // 6.4: shows between the pressers, in front of the centre-backs
    } else if (['Box-to-Box', 'Mezzala', 'Playmaker', 'Ball-Winner'].includes(role) && slot[0] === 'MC') {
      x = half; job = 'Receive on the half-turn in the half-space';
      if (!final && pocket != null) { y = role === 'Playmaker' ? lerp(y, pocket, .5) : pocket; job = 'Receive between the lines in the half-space'; }
      if (role === 'Mezzala' && !final && near && holdsWidth(side)) { y = clamp(by - .08, .04, .96); job = 'Underlap half-space channel'; }
      if (final) {
        if (role === 'Box-to-Box') { x = .5 + side * .09; y = 20 / 105; job = 'Arrive at the box edge'; }
        else if (role === 'Mezzala') { y = 18 / 105; job = 'Run through the wide channel'; }
        else { y = 28 / 105; job = 'Link the pivot and the attack'; }
      }
    } else if (slot[0] === 'AMC' && phase !== 'build') {
      y = final ? 24 / 105 : pocket != null ? pocket : clamp(by - .18, 24 / 105, .42); job = 'Receive between the lines / Zone 14';
      if (role === 'Shadow Striker' && final) { y = 11 / 105; job = 'Run past the nine'; }
    } else if (role === 'Winger') {
      job = 'Hold the wide lane';
      if (final && !near && Math.abs(bx - .5) > .25 && by <= 18 / 105) {
        x = .5 + side * .06; y = 7 / 105; job = 'Attack the far post';
      } else { x = .5 + side * .43; }
    } else if (role === 'Wide Midfielder') { // 6.7: a little deeper and narrower than a Winger, supporting behind the ball
      job = 'Support the full-back on the wide side'; x = .5 + side * .37;
      if (!build) y = Math.max(y, by + .03);
    } else if (['Inside Forward', 'Inverted Winger', 'Wide Playmaker'].includes(role) && phase !== 'build') {
      x = half; job = role === 'Inside Forward' ? 'Cut into the half-space to score' : 'Create from the half-space';
      if (final) y = role === 'Inside Forward' ? 15 / 105 : 25 / 105;
    } else if (slot[0] === 'ST') {
      job = 'Pin the last line / provide depth';
      if (role === 'False Nine') {
        y = final ? 24 / 105 : pocket != null ? pocket : clamp(by - .16, 24 / 105, .43); job = 'Drop into Zone 14 / link play';
      } else if (final) { y = role === 'Target Forward' ? 14 / 105 : 9 / 105; }
    }
    jobs[i] = job;
    return [clamp(x, .04, .96), clamp(y, .04, .96)];
  });
  return { positions, jobs };
}

function attackPlan(T, bx, by, carrier = -1, lines = null) {
  const phase = teamPhase(T, true, bx, by);
  const work = positionJobs(T, positions(T, true, bx, by), bx, by, phase, lines), pos = work.positions;
  if (carrier > 0 && pos[carrier]) pos[carrier] = [bx, by]; // measure the carrier where the ball actually is
  const rest = phase === 'build' ? { back: [], screen: [] } : restSlots(T, bx, carrier);
  // Move the cover with the ball as a unit. Keep the role's lateral anchor;
  // never invent a winger to repair an empty lane in the manager's setup.
  // 3.7 / 5.4: the team squeezes up behind the ball; how far the back line goes is the defensive-line instruction
  // (a high line follows the ball to about 10 m into the opponent's half).
  const top = [0.55, 0.48, 0.42][T.line ?? 1];
  rest.back.forEach(i => { pos[i][1] = clamp(by + 14 / 105, top, 0.94); });
  rest.screen.forEach(i => { pos[i][1] = clamp(by + 5 / 105, 0.34, 0.94); });
  if (phase === 'progress' || phase === 'create') {
    const cover = [...rest.back, ...rest.screen], unit = pos.map((q, i) => q && i > 0 && !cover.includes(i) ? i : -1).filter(i => i > 0);
    const lanes = Array(5).fill(0); unit.forEach(i => lanes[pitchZone(...pos[i]).lane]++);
    // An eight/ten may use its own half-space when two forwards occupy the
    // centre. This is part of that role's job, not a replacement wide role.
    for (const i of unit) {
      if (i === carrier) continue;
      const lane = pitchZone(...pos[i]).lane, role = roleName(T, i), slot = FORMATIONS[T.ip][i];
      if (lanes[lane] <= 2 || !['Box-to-Box', 'Mezzala', 'Playmaker', 'Advanced Playmaker', 'Attacking Midfielder', 'Shadow Striker', 'Advanced Forward', 'Target Forward', 'Pressing Forward', 'Poacher'].includes(role)) continue;
      const options = slot[1] < .5 ? [1, 3] : [3, 1], to = options.find(l => l !== lane && lanes[l] < 2);
      if (to == null) continue;
      pos[i][0] = to === 1 ? 19.3 / 68 : 48.7 / 68; lanes[lane]--; lanes[to]++;
      work.jobs[i] += ' through the half-space';
    }
    // Three attackers on the same horizontal line remove passing diagonals.
    // Stagger the third, keeping the lane selected by its role.
    for (let n = 0; n < unit.length; n++) {
      const i = unit[n];
      if (i === carrier) continue;
      for (let attempt = 0; attempt < 6; attempt++) {
        const aligned = unit.slice(0, n).filter(j => pitchZone(...pos[j]).third === pitchZone(...pos[i]).third && Math.abs(pos[i][1] - pos[j][1]) < 2 / 105);
        if (aligned.length < 2) break;
        pos[i][1] = clamp(pos[i][1] + 5 / 105, .04, .94);
      }
    }
  }
  // Stagger nearby players in the same lane to offer diagonal/backward options.
  for (let i = 1; i < pos.length; i++) {
    if (!pos[i] || i === carrier) continue;
    for (let j = 1; j < i; j++) {
      if (!pos[j] || pitchZone(...pos[i]).lane !== pitchZone(...pos[j]).lane) continue;
      if (Math.abs(pos[i][1] - pos[j][1]) < 5 / 105) pos[i][1] = clamp(pos[j][1] + 6 / 105, 0.04, 0.94);
    }
  }
  rest.back.forEach(i => { work.jobs[i] = 'Hold rest defence'; });
  rest.screen.forEach(i => { work.jobs[i] = roleName(T, i) === 'Inverted Full-Back' ? 'Invert and screen behind the ball' : 'Screen behind the ball'; });
  return { positions: pos, phase, rest, jobs: work.jobs };
}

// The OOP formation supplies the lines. All defenders on a line have the same
// depth; the whole block slides towards the ball, with the far flank tucked in.
// Instructions are authoritative, including custom changes to a style preset.
function blockPlan(T, bx, by) {
  const phase = teamPhase(T, false, bx, by), f = FORMATIONS[T.oop], map = T.map || shapeMap(T.ip, T.oop);
  const line = T.line ?? 1, high = phase === 'high', low = phase === 'low';
  const backMetres = clamp((1 - by) * 105 - 10, low ? 16 : [22, 30, 40][line], low ? 25 : [28, 40, 50][line]);
  const backY = 1 - backMetres / 105, gap = (high ? 12 : low ? 10 : 11) / 105;
  const shift = (bx - 0.5) * (low ? 0.28 : 0.34), width = low ? 0.68 : 0.74;
  const pos = (T.on || []).map((id, i) => {
    if (!id) return null;
    if (i === 0) return [clamp(0.5 + (bx - 0.5) * 0.12, 0.42, 0.58), high ? 0.91 : 0.965];
    const slot = f[map[i]], row = LINE[slot[0]], role = roleName(T, i);
    let band = row === 1 ? 0 : row === 2 ? 0.55 : row === 3 ? 1.15 : row === 4 ? 1.9 : 2.8;
    // 6.0: how far a wide role comes back is part of the role. The Wide Midfielder makes a flat midfield line, the
    // Winger sits just above it, the Inside Forward stays high in the half-space as the outlet for the counter.
    const wide = Math.abs(slot[1] - 0.5) > 0.25 && row >= 3;
    if (wide && role === 'Wide Midfielder') band = Math.min(band, 1.1);
    else if (wide && ['Winger', 'Inverted Winger', 'Wide Playmaker'].includes(role)) band = Math.max(band, 1.35);
    else if (wide && role === 'Inside Forward') band = Math.max(band, low ? 1.6 : 2.3);
    let x = 0.5 + (slot[1] - 0.5) * (wide && role === 'Inside Forward' && !low ? 0.5 : width) + shift;
    const far = (slot[1] - 0.5) * (bx - 0.5) < 0;
    if (far) x = lerp(x, 0.5 + shift * 0.5, Math.abs(bx - 0.5) * 0.35);
    return [clamp(x, 0.06, 0.94), clamp(backY - band * gap, 0.06, 0.95)];
  });
  return { positions: pos, phase, rest: { back: [], screen: [] } };
}

function teamPlan(T, has, bx, by, carrier = -1, lines = null) {
  return has ? attackPlan(T, bx, by, carrier, lines) : blockPlan(T, bx, by);
}

// Measurements, not promises about the individual movements over the anchors.
// Empty or crowded attacking lanes remain visible for the manager to diagnose.
function shapeMetrics(plan, bx, by, carrier = -1) {
  const out = plan.positions.map((q, i) => i && q ? { i, x: q[0], y: q[1], lane: pitchZone(...q).lane } : null).filter(Boolean);
  const cover = [...plan.rest.back, ...plan.rest.screen];
  const lanes = Array(5).fill(0);
  out.filter(q => !cover.includes(q.i)).forEach(q => lanes[q.lane]++);
  return { depth: out.length ? (Math.max(...out.map(q => q.y)) - Math.min(...out.map(q => q.y))) * 105 : 0,
    behind: out.filter(q => q.i !== carrier && q.y > by).length,
    back: plan.rest.back.length, screen: plan.rest.screen.length, lanes,
    crowded: lanes.map((n, i) => n > 2 ? LANE_NAMES[i] : null).filter(Boolean),
    empty: lanes.map((n, i) => n === 0 ? LANE_NAMES[i] : null).filter(Boolean) };
}
