// Pre-season friendlies: the assistant coach's overseas analysis, arranging a friendly, and keeping friendlies out of the table.
// Real engine code; no provider calls.
const assert = require('node:assert/strict');
const { createMatchQaRuntime } = require('../scripts/match-qa-runtime.cjs');
const vm = require('node:vm'), fs = require('node:fs'), path = require('node:path');
const rt = createMatchQaRuntime(), checks = [];
const check = (name, source) => { assert.ok(rt.run(source), name); checks.push(name); };
// The screen and save hooks are not loaded here; the logic only calls them, so they are stubbed.
rt.run(`ACT = {}; UI = {}; render = () => {}; toast = () => {}; saveGame = () => {}; brainScore = () => {}; CHECKPOINTS = [];`);
vm.runInContext(fs.readFileSync(path.resolve(__dirname, '../js/systems/friendlies.js'), 'utf8'), rt.ctx, { filename: 'js/systems/friendlies.js' });
rt.run(`newGame(CLUBS[0].id,'Friendly QA',1);`);

check('the first pre-season week is free for a friendly', `freePreseasonWeek() === 0`);
check('overseas clubs in the game are the candidates; our own club and free agents are not', `(() => {
  const cs = friendlyCandidates();
  return cs.length > 0 && cs.length <= FRIENDLY_CLUBS && cs.every(c => c.foreign && !c.fa && c.id !== G.club);
})()`);
check('candidates are ordered by closeness in strength to us', `(() => {
  const me = userClub().rep, cs = friendlyCandidates();
  return cs.every((c, i) => i === 0 || Math.abs(cs[i - 1].rep - me) <= Math.abs(c.rep - me));
})()`);
check('an analysis game is played on the engine and returns a record', `(() => {
  const c = friendlyCandidates()[0], r = friendlyPlay(c.id);
  return r.w + r.d + r.l === FRIENDLY_GAMES && Number.isFinite(r.gf) && Number.isFinite(r.ga);
})()`);
check('the analysis leaves every player’s career stats and condition unchanged', `(() => {
  const snap = () => JSON.stringify(Object.values(G.players).map(p => [p.st, p.car, p.cond, p.fit]));
  const before = snap(), c = friendlyCandidates()[0];
  friendlyPlay(c.id); friendlyPlay(c.id);
  return snap() === before;
})()`);
check('arranging a friendly puts it in a pre-season week against the chosen overseas club', `(() => {
  const c = friendlyCandidates()[0], r = arrangeFriendly(c.id);
  const fx = r.fx;
  return !r.error && fx.fr === true && fx.w < PRESEASON_WEEKS && fx.h === G.club && fx.a === c.id && fx.hg == null && G.fixtures.includes(fx);
})()`);
check('the same club cannot be arranged twice', `(() => { const c = friendlyCandidates()[0]; const r = arrangeFriendly(c.id); return !!r.error; })()`);
check('a played friendly is not counted in the league table', `(() => {
  const before = leagueTable().reduce((n, r) => n + r.p, 0);
  const fx = G.fixtures.find(f => f.fr && isUserFx(f) && !played(f));
  quickSim(fx);
  const after = leagueTable().reduce((n, r) => n + r.p, 0);
  return played(fx) && after === before;
})()`);
check('the pre-season weeks run out when all of them are taken', `(() => {
  for (let w = 0; w < PRESEASON_WEEKS; w++) if (!G.fixtures.some(f => f.w === w && isUserFx(f))) G.fixtures.push({ id: G.nextId++, r: null, w, d: 5, t: '15:00', h: G.club, a: 'FA', hg: null, ag: null, fr: true });
  const fresh = friendlyCandidates().find(c => !G.fixtures.some(f => f.fr && (f.h === c.id || f.a === c.id)));
  return freePreseasonWeek() === null && arrangeFriendly(fresh.id).error === 'No pre-season week is free.';
})()`);

console.log(`friendlies: ${checks.length} checks passed`);
for (const name of checks) console.log(' ok -', name);
