(() => {
  const A = { n: 0, g: 0, sh: 0, sot: 0, xg: 0, pa: 0, pc: 0, lp: 0, cr: 0, co: 0, fo: 0, yc: 0, off: 0, da: 0, dw: 0, tk: 0, int: 0, aer: 0, poss: 0, m3: 0, m5: 0, maxG: 0, d00: 0, h: 0, d: 0, oneSide: [] };
  let changes = 0, rounds = 0, oneOnOnes = 0; const oP = playOption; playOption = function (M, s, i, op) { if (op.k === 'round') rounds++; return oP.apply(this, arguments); }; const oSh = shoot; shoot = function (M, s, i, o = {}) { const p = P_(M, s, i); if (p && !o.pen && !o.fk && throughOnGoal(M, s, p.x, p.y) && dGoal(s, p.x, p.y) < 20) oneOnOnes++; return oSh.apply(this, arguments); }; const oG = giveBall; giveBall = function (M, s) { if (M.sim && M.sim.poss !== s) changes++; return oG.apply(this, arguments); };
  G.fixtures.filter(x => x.hg == null && x.h !== G.club && x.a !== G.club).slice(0, N_).forEach(f => {
    changes = 0; const M = createMatch(f); while (!M.ended) stepMatch(M, true);
    const [H, W] = M.sides, gh = H.st.g, ga = W.st.g; A.n++; A.g += gh + ga; const mg = Math.abs(gh - ga);
    if (mg >= 3) A.m3++; if (mg >= 5) A.m5++; if (gh + ga === 0) A.d00++; if (gh > ga) A.h++; else if (gh === ga) A.d++;
    A.maxG = Math.max(A.maxG, gh, ga); if (mg >= 6) A.oneSide.push(gh + '-' + ga);
    M.sides.forEach(S => { ['sh', 'sot', 'xg', 'pa', 'pc', 'lp', 'cr', 'co', 'fo', 'yc', 'off'].forEach(k => { A[k] += S.st[k] || 0; }); Object.values(S.ps).forEach(x => { ['da', 'dw', 'tk', 'int', 'aer'].forEach(k => { A[k] += x[k] || 0; }); }); });
    A.poss += changes;
  });
  giveBall = oG; playOption = oP; shoot = oSh;
  const per = k => +(A[k] / A.n).toFixed(2), team = k => +(A[k] / A.n / 2).toFixed(1);
  return { matches: A.n, goals: per('g'), shots: per('sh'), onTarget: per('sot'), xg: per('xg'), passesPerTeam: team('pa'), passPct: Math.round(100 * A.pc / A.pa), longPerTeam: team('lp'), crossesPerTeam: team('cr'), corners: per('co'), fouls: per('fo'), yellows: per('yc'), offsides: per('off'),
    groundDuelsPerTeam: team('da'), dribblesWonPerTeam: team('dw'), tacklesPerTeam: team('tk'), interceptionsPerTeam: team('int'), aerialPerTeam: team('aer'), possessionsPerTeam: team('poss'), passesPerPossession: +(A.pa / Math.max(1, A.poss)).toFixed(1),
    roundsPerTeam: +(rounds / A.n / 2).toFixed(2), oneOnOneShotsPerTeam: +(oneOnOnes / A.n / 2).toFixed(2), homeWin: Math.round(100 * A.h / A.n), draws: Math.round(100 * A.d / A.n), nilNil: Math.round(100 * A.d00 / A.n), margin3plus: Math.round(100 * A.m3 / A.n), margin5plus: +(100 * A.m5 / A.n).toFixed(1), mostGoalsOneTeam: A.maxG, blowouts6plus: A.oneSide };
})()
