'use strict';
/* ===== lab.js =====
   Admin "Run test season": plays all 380 league matches on a copy of the save and reports league
   averages against the real-world targets, plus how each style and each level of tactic fit did.
   Style and fit results are also shown "against strength": points per match above or below what the
   strength gap between the two elevens predicts, so a style isn't flattered by the clubs that use it. */

let LAB_RUN = false; // true while a test season runs: nothing is sent to the cloud
const FIT_BANDS = [['<45', 0, 45], ['45-55', 45, 55], ['55-65', 55, 65], ['65+', 65, 101]];

function runTestSeason(opts = {}) {
  const real = G, rows = [];
  const T = { n: 0, goals: 0, h: 0, d: 0, sh: 0, sot: 0, xg: 0, yc: 0, rc: 0, fo: 0, pa: 0, pc: 0, off: 0, pk: 0, pkg: 0, co: 0, cr: 0, lp: 0 };
  LAB_RUN = true;
  try {
    G = JSON.parse(JSON.stringify(real));
    G.fixtures.forEach(f => { f.hg = f.ag = null; });
    Object.values(G.players).forEach(p => { p.st = newStats(); });
    G.fixtures.forEach(f => {
      Object.values(G.players).forEach(p => { p.cond = 100; p.inj = null; p.ban = 0; });
      const M = createMatch(f);
      M.instant = f.h === G.club || f.a === G.club;
      const kick = M.sides.map(S => ({ sty: styleOf(S) || 'custom', fit: fitOverall(S), str: avg(S.on.filter(Boolean), id => G.players[id].ca) }));
      while (!M.ended) stepMatch(M, true);
      finishMatch(M);
      T.n++; T.goals += f.hg + f.ag; if (f.hg > f.ag) T.h++; else if (f.hg === f.ag) T.d++;
      const tp = M.sides[0].st.pos + M.sides[1].st.pos || 1;
      M.sides.forEach((S, si) => {
        const O = M.sides[1 - si], st = S.st;
        ['sh', 'sot', 'xg', 'yc', 'rc', 'fo', 'pa', 'pc', 'off', 'pk', 'pkg', 'co', 'cr', 'lp'].forEach(k => { T[k] += st[k] || 0; });
        rows.push({ ...kick[si], gap: kick[si].str - kick[1 - si].str, home: si === 0, pts: st.g > O.st.g ? 3 : st.g === O.st.g ? 1 : 0, gf: st.g, ga: O.st.g,
          pos: 100 * st.pos / tp, pa: st.pa || 0, pc: st.pc || 0, lp: st.lp || 0, cr: st.cr || 0, sh: st.sh, xg: st.xg, off: st.off || 0, fo: st.fo });
      });
    });
    const tbl = leagueTable(), top = Object.values(G.players).sort((a, b) => b.st.g - a.st.g)[0];
    return labReport(T, rows, { ...(opts.rows ? { rows } : {}), top: top.st.g + ' (' + top.ln + ')', champ: G.clubs[tbl[0].id].name, range: tbl[tbl.length - 1].pts + '-' + tbl[0].pts + ' pts' });
  } finally { G = real; LAB_RUN = false; }
}

// Points per match expected from the strength gap and home advantage (least squares over this season).
function strengthModel(rows) {
  const xs = rows.map(r => [1, r.gap, r.home ? 1 : 0]), ys = rows.map(r => r.pts);
  const A3 = [[0, 0, 0], [0, 0, 0], [0, 0, 0]], b3 = [0, 0, 0];
  xs.forEach((x, k) => { for (let i = 0; i < 3; i++) { b3[i] += x[i] * ys[k]; for (let j = 0; j < 3; j++) A3[i][j] += x[i] * x[j]; } });
  // Solve the 3x3 system by Gaussian elimination.
  const m = A3.map((r, i) => [...r, b3[i]]);
  for (let i = 0; i < 3; i++) {
    const p = m[i][i] || 1e-9;
    for (let j = i; j < 4; j++) m[i][j] /= p;
    for (let k = 0; k < 3; k++) if (k !== i) { const f = m[k][i]; for (let j = i; j < 4; j++) m[k][j] -= f * m[i][j]; }
  }
  const c = m.map(r => r[3]);
  return r => c[0] + c[1] * r.gap + c[2] * (r.home ? 1 : 0);
}

function labGroup(rows, exp) {
  const n = rows.length, s = f => rows.reduce((t, r) => t + f(r), 0), pa = s(r => r.pa);
  return { n, ppg: +(s(r => r.pts) / n).toFixed(2), vs: +(s(r => r.pts - exp(r)) / n).toFixed(2), gf: +(s(r => r.gf) / n).toFixed(2), ga: +(s(r => r.ga) / n).toFixed(2),
    pos: Math.round(s(r => r.pos) / n), pass: pa ? Math.round(100 * s(r => r.pc) / pa) : 0, pa: Math.round(pa / n), lp: +(s(r => r.lp) / n).toFixed(1), cr: +(s(r => r.cr) / n).toFixed(1),
    sh: +(s(r => r.sh) / n).toFixed(1), xg: +(s(r => r.xg) / n).toFixed(2), off: +(s(r => r.off) / n).toFixed(1), fo: +(s(r => r.fo) / n).toFixed(1), fit: Math.round(s(r => r.fit) / n), str: +(s(r => r.str) / n).toFixed(1) };
}

function labReport(T, rows, extra) {
  const n = T.n, f1 = v => +(v / n).toFixed(1), f2 = v => +(v / n).toFixed(2), exp = strengthModel(rows);
  const styles = {}, fit = {};
  [...Object.keys(STYLES), 'custom'].forEach(k => {
    const g = rows.filter(r => r.sty === k);
    if (!g.length) return;
    styles[k] = labGroup(g, exp);
    // Free-bonus check: the same style split at its median fit. A style should only win with players who suit it;
    // one that is clearly ahead even with poorly suited players has a bonus built into the engine.
    const srt = g.slice().sort((a, b) => a.fit - b.fit), h = srt.length >> 1, vs = rs => rs.reduce((t, r) => t + r.pts - exp(r), 0) / Math.max(1, rs.length);
    styles[k].vsLow = +vs(srt.slice(0, h)).toFixed(2); styles[k].vsHigh = +vs(srt.slice(h)).toFixed(2);
  });
  FIT_BANDS.forEach(([b, lo, hi]) => { const g = rows.filter(r => r.fit >= lo && r.fit < hi); if (g.length) fit[b] = labGroup(g, exp); });
  return {
    gpg: f2(T.goals), h: Math.round(T.h / n * 100), d: Math.round(T.d / n * 100), a: Math.round((n - T.h - T.d) / n * 100),
    sh: f1(T.sh / 2), sot: f1(T.sot), shm: f1(T.sh), xg: f2(T.xg / 2), cards: f1(T.yc + T.rc), yc: f1(T.yc), fo: f1(T.fo), pass: T.pa ? Math.round(100 * T.pc / T.pa) : 0,
    off: f1(T.off), pk: f2(T.pk), pkConv: T.pk ? Math.round(100 * T.pkg / T.pk) : 0, co: f1(T.co), cr: f1(T.cr), lp: f1(T.lp), styles, fit, ...extra,
  };
}
// Targets for the report (Premier League-like league averages per match).
const LAB_TARGETS = { gpg: '2.7-2.9', shm: '~25', sot: '~8.5', pass: '75-90', fo: '~21', cards: '~3.5', off: '~3.5', pk: '~0.27', co: '~10' };
