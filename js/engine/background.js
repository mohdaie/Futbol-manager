'use strict';
const Simulation = {
  worker: null, jobs: new Map(), next: 0, pending: new WeakMap(), progress: null,
  request(type, data) {
    return new Promise((resolve, reject) => {
      if (!this.worker) return reject(new Error('Match worker unavailable.'));
      const id = ++this.next, timer = setTimeout(() => { this.jobs.delete(id); reject(new Error('Match processing timed out.')); }, 60000);
      this.jobs.set(id, { resolve, reject, timer });
      try { this.worker.postMessage({ id, type, data }); } catch (error) { clearTimeout(timer); this.jobs.delete(id); reject(error); }
    });
  },
  input(M) {
    const players = {}, clubs = {};
    for (const S of M.sides) {
      const c = G.clubs[S.cid]; clubs[c.id] = c;
      for (const id of c.squad) if (G.players[id]) players[id] = G.players[id];
      for (const id of [...S.played, ...S.bench]) if (G.players[id]) players[id] = G.players[id];
    }
    const B = brain();
    return { match: cleanMatch(M), norm: posNorm(), engine: ENG, engineKey: brainCloudEngine(), world: { players, clubs, club: G.club, training: G.training, tune: G.tune, staff: G.staff, season: G.season, week: G.week, flags: {} }, brain: { ...brainDefaults(), mode: B.mode, minN: B.minN, versions: B.versions.filter(v => v.id === B.active), active: B.active } };
  },
};
try {
  const url = new URL('../workers/simulation.js', document.currentScript.src); url.searchParams.set('v', GAME_VERSION);
  Simulation.worker = new Worker(url);
  Simulation.worker.onmessage = ({ data }) => {
    const job = Simulation.jobs.get(data.id); if (!job) return;
    Simulation.jobs.delete(data.id); clearTimeout(job.timer);
    data.error ? job.reject(new Error(data.error)) : job.resolve(data.result);
  };
  Simulation.worker.onerror = event => {
    for (const job of Simulation.jobs.values()) { clearTimeout(job.timer); job.reject(new Error(event.message || 'Match worker failed.')); }
    Simulation.jobs.clear(); Simulation.worker.terminate(); Simulation.worker = null;
  };
  Simulation.request('ping').catch(() => {});
} catch { Simulation.worker = null; }

async function simulateMatchAsync(fx) {
  if (played(fx)) return null;
  const game = G;
  let pending = Simulation.pending.get(game);
  if (!pending) { pending = new Map(); Simulation.pending.set(game, pending); }
  if (pending.has(fx.id)) return pending.get(fx.id);
  const job = (async () => {
    const M = createMatch(fx); M.instant = isUserFx(fx);
    if (Simulation.worker) {
      const result = await Simulation.request(M.instant ? 'full' : 'fast', Simulation.input(M));
      if (G !== game || played(fx)) return null;
      Object.assign(M, result.match);
    } else {
      await new Promise(resolve => setTimeout(resolve, 0));
      if (G !== game || played(fx)) return null;
      if (!M.instant) runFastMatch(M);
      else while (!M.ended) { stepMatch(M, true); await new Promise(resolve => setTimeout(resolve, 0)); if (G !== game) return null; }
    }
    if (G === game && !played(fx)) finishMatch(M);
    return M;
  })();
  pending.set(fx.id, job);
  try { return await job; } finally { pending.delete(fx.id); }
}
async function simulateFixtures(fixtures) {
  const game = G, list = fixtures.filter(f => !played(f)).sort(fxSort);
  Simulation.progress = { done: 0, total: list.length };
  try {
    for (const fx of list) {
      if (G !== game) return;
      await simulateMatchAsync(fx); Simulation.progress.done++;
      const label = document.getElementById('simulationProgress');
      if (label) label.textContent = `Updating results ${Simulation.progress.done}/${list.length}`;
    }
  } finally { Simulation.progress = null; }
}
async function simUpToAsync(fx, inclusive) {
  const key = fxDayNo(fx) * 10000 + +(fx.t || '15:00').replace(':', '');
  await simulateFixtures(G.fixtures.filter(f => {
    const k = fxDayNo(f) * 10000 + +(f.t || '15:00').replace(':', '');
    return f.w === fx.w && f.id !== fx.id && !played(f) && !isUserFx(f) && (k < key || inclusive && k === key);
  }));
}
async function advanceWeekAsync() {
  const game = G;
  const fx = userFixture(); if (fx && !played(fx)) return 'match';
  await simulateFixtures(G.fixtures.filter(f => f.w === G.week && !played(f)));
  if (G !== game) throw new Error('Career changed during processing.');
  return advanceWeek();
}
async function advanceDayAsync() {
  const game = G;
  const fx = userFixtures().find(f => !played(f)); if (fx && (fx.d ?? 5) <= G.day) return 'match';
  await simulateFixtures(G.fixtures.filter(f => f.w === G.week && (G.day >= 6 || (f.d ?? 5) === G.day) && !played(f) && !isUserFx(f)));
  if (G !== game) throw new Error('Career changed during processing.');
  return advanceDay();
}
async function finishRoundAsync() {
  const game = G;
  const fx = G.fixtures.find(f => f.id === G.lastMatch); if (fx) await simUpToAsync(fx, true);
  if (G !== game) return;
  await saveGameAsync();
}
async function playUserInstantAsync(fx) {
  const game = G;
  await simUpToAsync(fx, false); if (G !== game) return;
  G.day = fx.d ?? 5;
  await simulateMatchAsync(fx); if (G !== game) return;
  await finishRoundAsync();
}
