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

// Isolate calendar regressions from the engine matches above.
rt.run(`function withFriendlyCalendar(fn) {
  const original = { fixtures: G.fixtures, week: G.week, day: G.day, news: G.news };
  try { G.fixtures = []; G.week = 2; G.day = 0; G.news = []; return fn(); }
  finally { Object.assign(G, original); }
}`);
check('arranging midway through pre-season never selects an earlier empty week', `withFriendlyCalendar(() => {
  const r = arrangeFriendly(friendlyCandidates()[0].id);
  return !r.error && r.fx.w === 2 && fxDayNo(r.fx) >= todayNo();
})`);
check('Saturday allows a same-day friendly but Sunday moves to next week', `withFriendlyCalendar(() => {
  G.day = 5; const saturday = freePreseasonWeek(); G.day = 6;
  return saturday === 2 && freePreseasonWeek() === 3;
})`);
check('both clubs must be free in the selected week', `withFriendlyCalendar(() => {
  const opponent = friendlyCandidates()[0].id;
  G.fixtures.push({ id: -10, w: 2, h: opponent, a: 'FA', d: 5 });
  const r = arrangeFriendly(opponent);
  return !r.error && r.fx.w === 3;
})`);
check('stale arrange actions cannot add friendlies after pre-season', `withFriendlyCalendar(() => {
  G.week = PRESEASON_WEEKS;
  return freePreseasonWeek() === null && !!arrangeFriendly(friendlyCandidates()[0].id).error && !G.fixtures.length;
})`);
check('last pre-season Sunday has no date available', `withFriendlyCalendar(() => {
  G.week = PRESEASON_WEEKS - 1; G.day = 6;
  return freePreseasonWeek() === null && !!arrangeFriendly(friendlyCandidates()[0].id).error;
})`);
check('old backdated friendlies are rearranged without changing played or league fixtures', `withFriendlyCalendar(() => {
  const opponents = friendlyCandidates(), old = opponents.slice(0,2).map((c,i) => ({ id: -20-i, w: i, d: 5, t: '15:00', h: G.club, a: c.id, fr: true, hg: null, ag: null }));
  const pastResult = { ...old[0], id: -30, hg: 2, ag: 1 }, league = { ...old[0], id: -31, fr: false };
  G.fixtures = [...old, pastResult, league];
  const preserved = JSON.stringify([pastResult, league]); ensureFriendlySchedule();
  const first = JSON.stringify([G.fixtures, G.news]); ensureFriendlySchedule();
  return old.every(f => G.fixtures.includes(f) && fxDayNo(f) >= todayNo()) && old[0].w !== old[1].w
    && JSON.stringify([pastResult, league]) === preserved && G.news.length === 1 && JSON.stringify([G.fixtures, G.news]) === first;
})`);
check('overdue friendlies are cancelled once pre-season ends without fabricated scores', `withFriendlyCalendar(() => {
  const old = { id: -40, w: 0, d: 5, h: G.club, a: friendlyCandidates()[0].id, fr: true, hg: null, ag: null };
  G.fixtures = [old]; G.week = PRESEASON_WEEKS + 1; ensureFriendlySchedule();
  return !G.fixtures.length && old.hg === null && G.news.length === 1 && /cancelled/.test(G.news[0].body);
})`);

console.log(`friendlies: ${checks.length} checks passed`);
for (const name of checks) console.log(' ok -', name);
