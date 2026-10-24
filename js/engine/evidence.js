'use strict';
/* Read-only match evidence. Never calls R(), changes tactics, or settles an action.
   Every engine tick is delta/RLE packed; no animation frames are discarded.
   Recordings belong to the season's fixtures and travel with normal save exports. */
const EVIDENCE_NULL = -1000000;
const evidenceRound = (n, scale = 100) => Number.isFinite(n) ? Math.round(n * scale) / scale : null;
function evidenceInit(M) {
  M.evidence = { version: 1, gameVersion: GAME_VERSION, tick: TICK, precisionMetres: .01,
    frameCount: 0, blocks: [], pending: [], previous: [], lastTime: -1, start: null, end: null,
    actions: [], contexts: [], roster: {}, totals: [evidenceTotals(), evidenceTotals()], movement: {},
    schema: 'Rows: [time*10,ballX*100,ballY*100,ballZ*100,ownerSide,ownerSlot,restartCode,flightCode, then 22 slots of x,y,vx,vy,targetX,targetY,facing (all *100)]. Missing=-1000000. x=width 0..68,y=length 0..105; home attacks y=0,away y=105. Each base64 block resets delta history. Varuint 0 followed by count encodes unchanged fields; otherwise (token-1) is zigzag delta. Codes below. Contexts record actual slot occupants, role names and tactics at changes.',
    restartCodes: ['', 'ko', 'thr', 'gk', 'ck', 'fk', 'pen'], flightCodes: ['', 'pass', 'long', 'thru', 'cross', 'shot', 'clear'],
  };
}
function evidenceTotals() {
  return { openSeconds: 0, defendingSeconds: 0, blockDepthSum: 0, blockWidthSum: 0, nearestCarrierSum: 0, carrierDefendingSeconds: 0, maxDepth: 0, minDepth: null, dangerousRunnerSeconds: 0, runnerGapSum: 0, runnerGapOver5mSeconds: 0,
    pressAssignedSeconds: 0, coverAssignedSeconds: 0, counterpressSeconds: 0, recoveringSeconds: 0,
    carrierSeconds: 0, ballGapSum: 0, ballGapMax: 0, decisions: 0, pressuredDecisions: 0, selected: {},
    duels: {}, keeperOneOnOneSeconds: 0, keeperDepthSum: 0, keeperMaxDepth: 0, keeperStationary25ydSeconds: 0 };
}
function evidenceContext(M) {
  const e = M.evidence, sides = M.sides.map(S => ({ club: S.cid, on: S.on.slice(), ip: S.ip, oop: S.oop,
    roles: S.on.map((id, i) => id ? roleName(S, i) : null), instructions: JSON.parse(JSON.stringify(S.pi || {})),
    mentality: S.ment, tempo: S.tempo, width: S.width, press: S.press, line: S.line, passing: S.pass, won: S.won, lost: S.lost }));
  const key = JSON.stringify(sides);
  if (key !== e.contextKey) { e.contextKey = key; e.contexts.push({ t: M.sim.t, sides }); }
  M.sides.forEach(S => S.on.forEach(id => {
    if (!id || e.roster[id]) return;
    const p = G.players[id];
    if (p) e.roster[id] = { name: fullName(p), age: p.age, naturalPosition: p.pos, attributes: Object.fromEntries(Object.entries(A).map(([k, i]) => [k, p.at[i]])) };
  }));
}
function evidenceAction(M, type, side, data = {}) {
  const e = M.evidence;
  if (!e) return;
  e.actions.push({ t: evidenceRound(M.sim.t, 10), min: M.min, type, side, ...data });
}
function evidenceDecision(M, s, i, options, pick, pressure, distance, through) {
  if (!M.evidence) return;
  const S = M.sides[s], p = P_(M, s, i), a = M.evidence.totals[s];
  a.decisions++; if (pressure > .5) a.pressuredDecisions++;
  a.selected[pick.k] = (a.selected[pick.k] || 0) + 1;
  evidenceAction(M, 'decision', s, { slot: i, player: S.on[i], xy: [evidenceRound(p.x), evidenceRound(p.y)],
    pressure: evidenceRound(pressure), condition: evidenceRound(S.cond[S.on[i]]), form: evidenceRound(S.form[i]), distance: evidenceRound(distance), through, selected: pick.k, selectedReceiver: pick.j ?? null, selectedUtility: evidenceRound(pick.v, 10000),
    transition: transition(M, s), mental: ['vis', 'fla', 'dec', 'cmp', 'tea'].map(k => evidenceRound(ac(S, i, k))),
    options: options.map(o => [o.k, o.j ?? null, evidenceRound(o.v, 10000), evidenceRound(o.risk, 1000), evidenceRound(o.tx ?? o.cx), evidenceRound(o.ty ?? o.cy), evidenceRound(o.xg,10000)]) });
}
function evidenceShot(M, s, i, xg, o, oneOnOne) {
  if (!M.evidence) return;
  const p = P_(M, s, i), g = P_(M, 1 - s, 0);
  evidenceAction(M, 'shotRelease', s, { slot: i, player: M.sides[s].on[i], xy: [evidenceRound(p.x), evidenceRound(p.y)],
    xg: evidenceRound(xg, 10000), pressure: evidenceRound(o.press || 0), oneOnOne,
    keeper: g ? [evidenceRound(g.x), evidenceRound(g.y), evidenceRound(g.tx), evidenceRound(g.ty)] : null,
    flags: { header: !!o.head, volley: !!o.volley, fk: !!o.fk, corner: !!o.ck, penalty: !!o.pen },
    mental: ['fin', 'cmp', 'dec'].map(k => evidenceRound(ac(M.sides[s], i, k))) });
}
function evidenceVarint(out, n) {
  while (n >= 128) { out.push((n & 127) | 128); n = Math.floor(n / 128); }
  out.push(n);
}
function evidenceFlush(e) {
  if (!e.pending.length) return;
  let binary = '';
  for (let i = 0; i < e.pending.length; i += 8192) binary += String.fromCharCode(...e.pending.slice(i, i + 8192));
  e.blocks.push(btoa(binary)); e.pending = []; e.previous = [];
}
function evidenceFrame(M) {
  const e = M.evidence, sim = M.sim, B = sim.B;
  if (!e) return;
  const sameTime = e.lastTime === sim.t;
  const dt = e.lastTime < 0 ? 0 : Math.min(TICK, sim.t - e.lastTime);
  evidenceContext(M);
  const row = [Math.round(sim.t * 10), B.x, B.y, B.z].map((v, i) => i ? Math.round(v * 100) : v);
  row.push(B.os, B.oi, e.restartCodes.indexOf(sim.rs?.k || ''), e.flightCodes.indexOf(B.fl?.k || ''));
  for (let s = 0; s < 2; s++) for (let i = 0; i < 11; i++) {
    const p = sim.P[s][i];
    for (const k of ['x', 'y', 'vx', 'vy', 'tx', 'ty', 'fa']) row.push(p && Number.isFinite(p[k]) ? Math.round(p[k] * 100) : EVIDENCE_NULL);
    if (p) {
      const m = e.movement[p.id] || (e.movement[p.id] = { metres: 0, sprintSeconds: 0, x: p.x, y: p.y });
      const distance = Math.hypot(p.x - m.x, p.y - m.y);
      // Kick-off placement is not distance run. Raw positions still preserve the placement.
      if (dt && distance < 15) m.metres += distance;
      if (dt && Math.hypot(p.vx, p.vy) > 6) m.sprintSeconds += dt;
      m.x = p.x; m.y = p.y;
    }
  }
  if (sameTime && e.lastRow && row.every((v,i) => v === e.lastRow[i])) return;
  e.lastTime = sim.t; e.start ??= sim.t; e.end = sim.t; e.lastRow = row;
  let zeros = 0;
  const flushZeros = () => { if (zeros) { e.pending.push(0); evidenceVarint(e.pending, zeros); zeros = 0; } };
  for (let i = 0; i < row.length; i++) {
    const d = row[i] - (e.previous[i] || 0);
    if (!d) { zeros++; continue; }
    flushZeros(); evidenceVarint(e.pending, (d >= 0 ? d * 2 : -d * 2 - 1) + 1);
  }
  flushZeros(); e.previous = row; e.frameCount++;
  if (e.frameCount % 120 === 0) evidenceFlush(e);
  if (sim.rs?.plan && e.restartPlanKey !== JSON.stringify([sim.rs.k, sim.rs.s, sim.rs.x, sim.rs.y, sim.rs.plan])) {
    e.restartPlanKey = JSON.stringify([sim.rs.k, sim.rs.s, sim.rs.x, sim.rs.y, sim.rs.plan]);
    evidenceAction(M, 'restartPlan', sim.rs.s, { kind: sim.rs.k, plan: JSON.parse(JSON.stringify(sim.rs.plan)) });
  }
  if (sim.rs || sim.celebrate > 0 || !dt) return;
  if (sim.defence) evidenceAction(M, 'defence', sim.defence.s, { carrierSide: B.os, carrierSlot: B.oi, assignments: (sim.defence.assignments || []).map(a => [a.i, a.job, evidenceRound(a.x), evidenceRound(a.y)]), recovering: !!sim.defence.recovering, lineStep: evidenceRound(sim.defence.lineStep), trigger: sim.pt?.until > sim.t ? sim.pt : null });
  for (let s = 0; s < 2; s++) {
    const a = e.totals[s], P = sim.P[s]; a.openSeconds += dt;
    if (B.os === s && P[B.oi]) {
      const p = P[B.oi], gap = Math.hypot(B.x - p.x, B.y - p.y);
      a.carrierSeconds += dt; a.ballGapSum += gap * dt; a.ballGapMax = Math.max(a.ballGapMax, gap);
    }
    if (sim.poss !== s) {
      const players = P.filter((p, i) => i && p), xs = players.map(p => p.x), ys = players.map(p => p.y), own = owner(M);
      if (players.length) {
        const depth = Math.max(...ys) - Math.min(...ys);
        a.defendingSeconds += dt; a.blockDepthSum += depth * dt; a.blockWidthSum += (Math.max(...xs) - Math.min(...xs)) * dt;
        a.maxDepth = Math.max(a.maxDepth, depth); a.minDepth = a.minDepth == null ? depth : Math.min(a.minDepth, depth);
        for (const [i, runner] of sim.P[1-s].entries()) if (i && runner && dGoal(1-s, runner.x, runner.y) < 30) {
          const gap = Math.min(...players.map(p => hyp(p.x-runner.x,p.y-runner.y)));
          a.dangerousRunnerSeconds += dt; a.runnerGapSum += gap * dt; if (gap > 5) a.runnerGapOver5mSeconds += dt;
        }
      }
      if (own && players.length) { a.nearestCarrierSum += Math.min(...players.map(p => hyp(p.x - own.x, p.y - own.y))) * dt; a.carrierDefendingSeconds += dt; }
      const def = sim.defence?.s === s ? sim.defence : null;
      a.pressAssignedSeconds += (def?.assignments || []).filter(x => x.job === 'press').length * dt;
      a.coverAssignedSeconds += (def?.assignments || []).filter(x => x.job !== 'press').length * dt;
      if (sim.counterpress?.s === s && sim.counterpress.until > sim.t && !sim.counterpress.broken) a.counterpressSeconds += dt;
      if (def?.recovering) a.recoveringSeconds += dt;
    }
  }
}
function evidenceKeeper(M, attackSide, own, g) {
  if (!M.evidence) return;
  const s = 1 - attackSide, a = M.evidence.totals[s], distance = dGoal(attackSide, own.x, own.y), depth = Math.abs(g.y - goalY(attackSide));
  a.keeperOneOnOneSeconds += TICK; a.keeperDepthSum += depth * TICK; a.keeperMaxDepth = Math.max(a.keeperMaxDepth, depth);
  // Observation only, NOT a rule that a keeper should rush from this distance.
  const stationary = distance >= 20 && distance <= 30 && Math.hypot(g.vx, g.vy) < .5;
  if (stationary) a.keeperStationary25ydSeconds += TICK;
  evidenceAction(M, 'keeperApproach', s, { attacker: own.id, distance: evidenceRound(distance), keeperDepth: evidenceRound(depth),
    xy: [evidenceRound(g.x), evidenceRound(g.y)], target: [evidenceRound(g.tx), evidenceRound(g.ty)],
    attackerXY: [evidenceRound(own.x), evidenceRound(own.y)], speed: evidenceRound(Math.hypot(g.vx, g.vy)),
    targetGap: evidenceRound(hyp(g.tx - g.x, g.ty - g.y)), stationary20to30m: stationary, oneOnOnes: evidenceRound(ac(M.sides[s], 0, 'one')) });
}
function evidenceFinish(M) {
  const e = M.evidence; if (!e) return null;
  evidenceFlush(e);
  // Runtime encoder state is small, resumable and serializable during live play.
  return { ...e, contextKey: undefined, pending: undefined, previous: undefined, lastRow: undefined };
}
function* evidenceRows(e) {
  const blocks = e.blocks.slice();
  if (e.pending?.length) {
    let binary = ''; for (let i = 0; i < e.pending.length; i += 8192) binary += String.fromCharCode(...e.pending.slice(i, i + 8192));
    blocks.push(btoa(binary));
  }
  const width = 8 + 22 * 7;
  for (const block of blocks) {
    const bytes = atob(block); let n = 0, shift = 0, row = [], previous = Array(width).fill(0), zeroRun = false;
    const emit = value => { row.push(value); };
    for (let i = 0; i < bytes.length; i++) {
      const b = bytes.charCodeAt(i); n += (b & 127) * 2 ** shift;
      if (b & 128) { shift += 7; continue; }
      if (zeroRun) { for (let j = 0; j < n; j++) emit(previous[row.length]); zeroRun = false; }
      else if (n === 0) { zeroRun = true; n = 0; shift = 0; continue; }
      else { const z = n - 1, d = z % 2 ? -(z + 1) / 2 : z / 2; emit(previous[row.length] + d); }
      n = 0; shift = 0;
      if (row.length === width) { yield row; previous = row; row = []; }
    }
    if (row.length || shift || zeroRun) throw new Error('Incomplete movement evidence block.');
  }
}
function evidenceSample(rows, max) {
  if (rows.length <= max) return rows.slice();
  return Array.from({ length: max }, (_, i) => rows[Math.round(i * (rows.length - 1) / Math.max(1, max - 1))]);
}
function evidenceSummary(e) {
  if (!e) return null;
  const actions = e.actions, samples = {}, categories = ['decision', 'kick', 'flight', 'receive', 'duel', 'duelResult', 'shotRelease', 'shotArrival', 'shotAccuracy', 'sfx', 'keeperApproach', 'restart', 'possession', 'defence', 'restartPlan', 'knockdown'];
  // Each side and category is represented; raw actions remain in the download.
  for (const type of categories) samples[type] = [0, 1].flatMap(s => {
    const rows = actions.filter(a => a.type === type && a.side === s);
    const chosen = type === 'decision' ? rows.filter(a => a.selected === 'thru' || a.through || a.pressure > .7) : rows;
    const pool = chosen.length ? chosen : rows;
    return evidenceSample(pool, type === 'shotRelease' ? 4 : 2).map(a => {
      if (type !== 'decision') return a;
      return { ...a, options: a.options.slice().sort((x, y) => y[2] - x[2]).slice(0, 3) };
    });
  });
  const bySide = e.totals.map((a, s) => {
    const shots = actions.filter(x => x.type === 'shotRelease' && x.side === s), arrivals = actions.filter(x => x.type === 'shotArrival' && x.side === s);
    return { side: s, decisions: a.decisions, pressuredDecisions: a.pressuredDecisions, chosenActions: a.selected,
      avgDefensiveDepthM: evidenceRound(a.blockDepthSum / (a.defendingSeconds || 1)), avgDefensiveWidthM: evidenceRound(a.blockWidthSum / (a.defendingSeconds || 1)), defendingSeconds: a.defendingSeconds,
      minDefensiveDepthM: evidenceRound(a.minDepth), maxDefensiveDepthM: evidenceRound(a.maxDepth),
      avgNearestDefenderToCarrierM: evidenceRound(a.nearestCarrierSum / (a.carrierDefendingSeconds || 1)),
      final30mRunnerPlayerSeconds: a.dangerousRunnerSeconds, avgNearestDefenderToRunnerM: evidenceRound(a.runnerGapSum / (a.dangerousRunnerSeconds || 1)), runnerGapOver5mPlayerSeconds: a.runnerGapOver5mSeconds,
      pressAssignedPlayerSeconds: a.pressAssignedSeconds, coverAssignedPlayerSeconds: a.coverAssignedSeconds, recoverySeconds: a.recoveringSeconds, counterpressSeconds: a.counterpressSeconds,
      avgCarriedBallGapM: evidenceRound(a.ballGapSum / (a.carrierSeconds || 1)), maxCarriedBallGapM: evidenceRound(a.ballGapMax),
      movementLeaders: Object.entries(e.movement).filter(([id]) => e.contexts.some(c => c.sides[s].on.some(pid => String(pid) === id))).sort((a,b) => b[1].metres-a[1].metres).slice(0,3).map(([id,m]) => [id, evidenceRound(m.metres), m.sprintSeconds]),
      duels: a.duels, knockdowns: actions.filter(x => x.type === 'knockdown' && x.side === s).length, recordedShots: shots.length, shotXgSum: evidenceRound(shots.reduce((n, x) => n + x.xg, 0), 10000),
      shotOutcomes: arrivals.reduce((o, x) => { o[x.result] = (o[x.result] || 0) + 1; return o; }, {}),
      oneOnOneSeconds: a.keeperOneOnOneSeconds, avgKeeperDepthInOneOnOnesM: evidenceRound(a.keeperDepthSum / (a.keeperOneOnOneSeconds || 1)), maxKeeperDepthM: evidenceRound(a.keeperMaxDepth), stationaryKeeper20to30mSeconds: a.keeperStationary25ydSeconds };
  });
  const seeds = ['thru', 'shot'].flatMap(k => [0, 1].map(s => actions.find(a => a.type === 'kick' && a.kind === k && a.side === s))).filter(Boolean);
  for (const kind of ['ck', 'fk']) {
    const a = actions.find(a => a.type === 'restart' && a.kind === kind);
    const delivery = a && actions.find(b => b.type === 'kick' && b.side === a.side && b.t >= a.t && b.t < a.t + 80);
    if (delivery) seeds.push({ ...delivery, kind });
  }
  const duel = actions.find(a => a.type === 'duel'); if (duel) seeds.push({ ...duel, receiver: duel.oi });
  const press = actions.find(a => a.type === 'defence' && a.assignments.some(x => x[1] === 'press'));
  if (press) seeds.push({ ...press, who: press.assignments.find(x => x[1] === 'press')[0], receiver: press.carrierSlot });
  const approaches = actions.filter(a => a.type === 'keeperApproach' && a.distance >= 20 && a.distance <= 30);
  const keeper = approaches.slice().sort((a,b) => Number(b.stationary20to30m) - Number(a.stationary20to30m) || b.targetGap - a.targetGap)[0];
  if (keeper) seeds.push(keeper);
  const clips = seeds.map(a => {
    const context = e.contexts.filter(c => c.t <= a.t).slice(-1)[0], attackerSlot = a.attacker ? context?.sides[1-a.side].on.indexOf(a.attacker) : -1;
    const flight = a.kind === 'thru' ? actions.find(b => b.type === 'flight' && b.t === a.t && b.side === a.side && b.kind === 'thru')?.flight : null;
    return { reason: a.kind || a.type, side: a.side, start: Math.max(e.start, a.t - 2), end: Math.min(e.end, Math.max(a.t + 4, (flight?.arr || a.t) + 2)),
      slots: [...new Set([0, attackerSlot >= 0 ? attackerSlot : a.who ?? a.slot ?? 10, a.receiver >= 0 ? a.receiver : 10])],
      lineup: context?.sides.map(s => s.on), frames: [] };
  });
  for (const row of evidenceRows(e)) for (const c of clips) {
    const t = row[0] / 10; if (t < c.start || t > c.end) continue;
    // Focus actors from BOTH teams at every tick. Archive has all 22 with velocities/targets/facing.
    c.frames.push([t, row[1] / 100, row[2] / 100, row[3] / 100, row[4], row[5], ...[0, 1].flatMap(s => c.slots.flatMap(i => { const k = 8 + (s * 11 + i) * 7; return [row[k] === EVIDENCE_NULL ? null : row[k] / 100, row[k + 1] === EVIDENCE_NULL ? null : row[k + 1] / 100]; }))]);
  }
  const passChains = actions.filter(a => a.type === 'flight' && a.kind === 'thru').map(a => {
    const received = actions.find(b => b.t >= a.t && b.type === 'receive' && b.side === a.side && b.release === a.flight.t0);
    const shot = received?.controlled ? actions.find(b => b.t >= received.t && b.t <= received.t + 8 && b.type === 'shotRelease' && b.player === received.player) : null;
    return { side: a.side, released: a.t, passer: a.player, receiver: received?.player ?? null, received: received?.t ?? null, controlled: received?.controlled ?? null, shot: shot?.t ?? null, touchToShotSeconds: shot ? shot.t - received.t : null };
  });
  const mentalBehavior = [0, 1].map(side => {
    const rows = actions.filter(a => a.type === 'decision' && a.side === side);
    return { side, underPressure: rows.filter(a => a.pressure > .5).length, throughOptions: rows.filter(a => a.options.some(o => o[0] === 'thru')).length,
      throughChosen: rows.filter(a => a.selected === 'thru').length, chosenBelowBestUtility: rows.filter(a => { const best = Math.max(...a.options.map(o => o[2])); return a.selectedUtility < best - .0001; }).length,
      decisionMentalSamples: evidenceSample(rows.filter(a => a.pressure > .5), 2).map(a => ({ t: a.t, player: a.player, pressure: a.pressure, mental: a.mental, chosen: a.selected })) };
  });
  return { version: e.version, gameVersion: e.gameVersion, tickSeconds: e.tick, precisionMetres: e.precisionMetres, recordedFrames: e.frameCount,
    recordedActions: actions.length, start: e.start, end: e.end, bySide, samples, clips,
    guide: 'Metrics use all recorded ticks/actions; clips and action samples are selected excerpts, not the entire archive. Clip row [time,ballX,ballY,height,ownerSide,ownerSlot, then home and away x,y pairs for listed slots]. Decision mental=[effective vision,flair,decisions,composure,teamwork]; options=[kind,receiverSlot,engineUtility,risk,targetX,targetY,perceivedShotXg], top 3 in report only. ShotAccuracy.onTarget is conditional on avoiding a block; goalGivenTarget is conditional conversion, not overall goal probability. Goal-plane paths honor those classifications. Engine utility is not real-world probability. Escape means a short physical turn/carry away from pressure with a cooldown; it is not guaranteed safe possession. Keeper stationary means speed<0.5m/s with attacker 20-30m from goal; never automatically a defect or instruction to rush. Compare closing target, ball control, angle, cover and shot timing. Runner-gap metrics count attackers within 30m of the goal they attack and distance to nearest outfield defender; >5m is a diagnostic bin, not proof of a marking error. Block depth excludes keepers. Mental values model attributes, NOT human consciousness.',
    throughPassChains: passChains, throughPassCount: passChains.length, mentalBehavior, contextCount: e.contexts.length, contexts: evidenceSample(e.contexts, 3), players: Object.fromEntries(Object.entries(e.roster).map(([id, p]) => [id, p.name])) };
}
// Lossless background compression keeps complete season recordings practical on phones.
// Raw evidence is already saved safely if the page closes before compression finishes.
async function evidenceArchiveFixture(fx, game) {
  const raw = fx.evidence;
  if (!raw || raw.encoding || typeof CompressionStream !== 'function') return;
  try {
    const stream = new Blob([JSON.stringify(raw)]).stream().pipeThrough(new CompressionStream('gzip'));
    const bytes = new Uint8Array(await new Response(stream).arrayBuffer());
    let binary = ''; for (let i = 0; i < bytes.length; i += 8192) binary += String.fromCharCode(...bytes.subarray(i, i + 8192));
    if (G !== game || fx.evidence !== raw || !game.fixtures.includes(fx)) return;
    fx.evidence = { version: raw.version, gameVersion: raw.gameVersion, frameCount: raw.frameCount, actionCount: raw.actions.length,
      tick: raw.tick, precisionMetres: raw.precisionMetres, encoding: 'gzip-json-v1', data: btoa(binary) };
    if (typeof saveGame === 'function') saveGame();
  } catch (_) { /* Complete raw recording remains available and portable. */ }
}
async function evidenceLoad(recording) {
  if (!recording?.encoding) return recording;
  if (recording.encoding !== 'gzip-json-v1' || typeof DecompressionStream !== 'function') throw new Error('This browser cannot open the compressed evidence. Use a current browser.');
  const binary = atob(recording.data), bytes = Uint8Array.from(binary, c => c.charCodeAt(0));
  const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'));
  return JSON.parse(await new Response(stream).text());
}
