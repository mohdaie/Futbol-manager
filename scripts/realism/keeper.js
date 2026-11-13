(() => {
  // Goalkeeper scorecard: what each keeper does in a match, averaged over N_ matches (run through league.cjs).
  // Real football, per keeper per match: about 5.5 km covered (about 70% of it walking), about 1 cross claimed and
  // 0.3-0.5 punched, about 3 saves, 25-35 distributions of which roughly half are from the hands or a goal kick.
  const A = { n: 0, dist: 0, walk: 0, jog: 0, run: 0, depthFar: 0, farN: 0, claims: 0, punches: 0, flaps: 0, saves: 0, held: 0, setShots: 0, shots: 0, roll: 0, thrw: 0, punt: 0, gkick: 0, holdT: 0, holdN: 0, rebound: 0, feet: 0, come: 0, short: 0 };
  const oMove = movePlayers, oMark = mark, oSet = setRestart;
  let last = null, heldAt = [null, null];
  movePlayers = function (M) {
    const r = oMove.apply(this, arguments), sim = M.sim;
    const now = [0, 1].map(s => { const g = sim.P[s][0]; return g ? [g.x, g.y] : null; });
    if (last) now.forEach((g, s) => {
      if (!g || !last[s]) return;
      const d = Math.hypot(g[0] - last[s][0], g[1] - last[s][1]), v = d / TICK;
      if (d > 8) return; // moved by a restart
      A.dist += d; if (v < 2) A.walk += d; else if (v < 4) A.jog += d; else A.run += d;
      if (Math.abs(sim.B.y - goalY(1 - s)) > 70) { A.depthFar += Math.abs(g[1] - goalY(1 - s)); A.farN++; }
    });
    last = now; return r;
  };
  mark = function (M, k, s, x) {
    if (k === 'come') A.come++;
    if (k === 'claim') { if (x.res === 'catch') A.claims++; else if (x.res === 'punch') A.punches++; else if (x.res === 'short') A.short++; else A.flaps++; }
    if (k === 'save') { A.saves++; if (x.how === 'hold') A.held++; }
    if (k === 'sfx' && x.res !== 'block') { A.shots++; if (x.set) A.setShots++; if (x.rebound) A.rebound++; }
    if (k === 'kick' && x.who === 0) {
      if (x.style === 'roll') A.roll++; else if (x.style === 'throw') A.thrw++; else if (x.style === 'punt') A.punt++; else if (x.rs === 'gk') A.gkick++; else if (x.style !== 'punch') A.feet++;
      if (heldAt[s] != null) { A.holdT += M.sim.t - heldAt[s]; A.holdN++; heldAt[s] = null; }
    }
    if (k === 'hands') heldAt[s] = M.sim.t;
    return oMark.apply(this, arguments);
  };
  G.fixtures.filter(x => x.hg == null && x.h !== G.club && x.a !== G.club).slice(0, N_).forEach(f => {
    last = null; heldAt = [null, null];
    const M = createMatch(f); while (!M.ended) stepMatch(M, true);
    A.n++;
  });
  movePlayers = oMove; mark = oMark; setRestart = oSet;
  const k = v => +(v / A.n / 2).toFixed(2);
  return { matches: A.n, kmPerKeeper: +(A.dist / A.n / 2 / 1000).toFixed(2), walkPct: Math.round(100 * A.walk / A.dist), jogPct: Math.round(100 * A.jog / A.dist), runPct: Math.round(100 * A.run / A.dist),
    depthWhenBallFar: +(A.depthFar / Math.max(1, A.farN)).toFixed(1), claims: k(A.claims), punches: k(A.punches), flaps: k(A.flaps), cameFor: k(A.come), cameButShort: k(A.short), saves: k(A.saves), savesHeld: k(A.held),
    shotsFaced: k(A.shots), keeperSetPct: Math.round(100 * A.setShots / Math.max(1, A.shots)), reboundShots: k(A.rebound), rolls: k(A.roll), throws: k(A.thrw), kicksFromHands: k(A.punt), goalKicks: k(A.gkick), passesWithFeet: k(A.feet), secondsHeld: +(A.holdT / Math.max(1, A.holdN)).toFixed(1) };
})()
