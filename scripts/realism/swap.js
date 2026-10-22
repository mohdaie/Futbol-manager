(() => { const r = { side0: 0, side1: 0, d: 0, n: 0 };
  G.fixtures.filter(x => x.hg == null && x.h !== G.club && x.a !== G.club).slice(0, N_).forEach(f => { for (const sw of [false, true]) {
    const M = createMatch(sw ? { ...f, h: f.a, a: f.h } : f); while (!M.ended) stepMatch(M, true);
    const a = M.sides[0].st.g, b = M.sides[1].st.g; r.n++; if (a > b) r.side0++; else if (b > a) r.side1++; else r.d++; } });
  return { matches: r.n, side0WinPct: Math.round(100 * r.side0 / r.n), side1WinPct: Math.round(100 * r.side1 / r.n), drawPct: Math.round(100 * r.d / r.n) }; })()
