// Run through league.cjs with SEED=1,2,3. Paired inputs, 120 games per model.
(async () => {
  G.createdAt = typeof MATCH_COMPARE_SEED === 'undefined' ? 1 : Number(MATCH_COMPARE_SEED);
  const summary = () => ({ n: 0, g: 0, sh: 0, sot: 0, xg: 0, pa: 0, pc: 0, fo: 0, yc: 0, rc: 0, condition: 0, draws: 0, home: 0 });
  const result = { full: summary(), fast: summary() };
  for (const fx of G.fixtures.filter(f => !isUserFx(f)).slice(0, 120)) {
    const input = Simulation.input(createMatch(fx));
    for (const type of ['full', 'fast']) {
      const { match: M } = await Simulation.request(type, input), total = result[type];
      total.n++; total.draws += M.sides[0].st.g === M.sides[1].st.g ? 1 : 0; total.home += M.sides[0].st.g > M.sides[1].st.g ? 1 : 0;
      for (const S of M.sides) {
        if (S.st.g !== S.goals.length || S.st.g > S.st.sot || S.st.sot > S.st.sh || S.st.pc > S.st.pa || !Number.isFinite(S.st.xg)) throw new Error('Incoherent ' + type + ' match ' + fx.id);
        for (const k of ['g', 'sh', 'sot', 'xg', 'pa', 'pc', 'fo', 'yc', 'rc']) total[k] += S.st[k];
        total.condition += S.on.filter(Boolean).reduce((n, id) => n + S.cond[id], 0) / S.on.filter(Boolean).length / 2;
      }
    }
  }
  for (const s of Object.values(result)) { s.passPct = s.pc / s.pa; for (const k of Object.keys(s)) if (!['n', 'passPct'].includes(k)) s[k] /= s.n; }
  // Broad paired distribution gates, not claims of identical scorelines. Match
  // model refinement still requires actual-device and longer-career validation.
  for (const k of ['g', 'sh', 'sot', 'xg', 'pa', 'fo', 'yc']) if (Math.abs(result.fast[k] / result.full[k] - 1) > 0.35) throw new Error('Fast/full distribution differs too much: ' + k + ' ' + JSON.stringify(result));
  if (Math.abs(result.fast.passPct - result.full.passPct) > 0.1) throw new Error('Pass completion calibration differs too much.');
  if (Math.abs(result.fast.rc - result.full.rc) > 0.15 || Math.abs(result.fast.condition - result.full.condition) > 10) throw new Error('Discipline/condition calibration differs too much: ' + JSON.stringify(result));
  return result;
})()
