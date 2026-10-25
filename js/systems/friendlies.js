'use strict';
/* ===== friendlies.js =====
   Pre-season friendlies. The assistant coach looks at the overseas clubs already in the game, plays each one a few
   simulated games (home and away) on the engine, and suggests the ones that test the squad most. Arranging one puts
   a friendly in a pre-season week. Friendlies carry fr: true and are kept out of the league table. */

const FRIENDLY_CLUBS = 8; // closest in strength to us first
const FRIENDLY_GAMES = 2; // one home and one away per club

const inPreseason = () => G.week < PRESEASON_WEEKS;
const friendlyCount = () => G.fixtures.filter(f => f.fr && isUserFx(f)).length;

// Overseas clubs in the game: not in our league and not the free agents.
function friendlyCandidates() {
  const me = userClub();
  return Object.values(G.clubs)
    .filter(c => c.foreign && !c.fa && c.id !== G.club && c.squad.length >= 11)
    .sort((a, b) => Math.abs(a.rep - me.rep) - Math.abs(b.rep - me.rep))
    .slice(0, FRIENDLY_CLUBS);
}

// Plays our side against one club, once each way, without writing anything to the career.
function friendlyPlay(cid) {
  const me = G.club, rec = { w: 0, d: 0, l: 0, gf: 0, ga: 0 };
  [[me, cid], [cid, me]].forEach(([h, a]) => {
    const M = createMatch({ id: -1, h, a, fr: true });
    M.noLog = true; M.camp = true;
    while (!M.ended) stepMatch(M, true);
    const [H, W] = M.sides, mine = h === me ? H : W, theirs = h === me ? W : H;
    rec.gf += mine.st.g; rec.ga += theirs.st.g;
    if (mine.st.g > theirs.st.g) rec.w++; else if (mine.st.g < theirs.st.g) rec.l++; else rec.d++;
  });
  return rec;
}

// Runs the analysis, yielding between clubs so the screen stays responsive. Lower score = better friendly:
// a club close to our strength, whose simulated games are close (a real test rather than a walkover).
async function friendlyRun() {
  const me = userClub(), rows = [];
  for (const c of friendlyCandidates()) {
    UI.friendly.step = `Playing ${c.name}…`; render();
    await new Promise(r => setTimeout(r, 0));
    const rec = friendlyPlay(c.id), games = FRIENDLY_GAMES, gd = (rec.gf - rec.ga) / games, gap = c.rep - me.rep;
    rows.push({ id: c.id, name: c.name, nat: c.nat, rep: Math.round(c.rep), gap, rec, gd, score: Math.abs(gap) + 2 * Math.abs(gd) });
  }
  rows.sort((a, b) => a.score - b.score);
  UI.friendly = { busy: false, wk: G.week, rows };
  render();
}

// Saturday fixtures must be today or later, with both clubs free that week.
function freePreseasonWeek(home = G.club, away = null) {
  for (let w = Math.max(0, G.week); w < PRESEASON_WEEKS; w++) {
    if (w * 7 + 5 < todayNo()) continue;
    if (!G.fixtures.some(f => f.w === w && (f.h === home || f.a === home || away && (f.h === away || f.a === away)))) return w;
  }
  return null;
}

// Repair backdated friendlies in existing saves without inventing match results.
function ensureFriendlySchedule() {
  const overdue = G.fixtures.filter(f => f.fr && !played(f) && fxDayNo(f) < todayNo() && G.live?.fid !== f.id).sort(fxSort);
  if (!overdue.length) return;
  const ids = new Set(overdue.map(f => f.id));
  G.fixtures = G.fixtures.filter(f => !ids.has(f.id));
  const changes = [];
  for (const fx of overdue) {
    const w = freePreseasonWeek(fx.h, fx.a);
    if (w == null) {
      if (isUserFx(fx)) changes.push(`${clubName(fx.h === G.club ? fx.a : fx.h)}: cancelled because no pre-season date remains.`);
      continue;
    }
    fx.w = w; fx.d = 5;
    fx.wx = genWeather(fxDate(fx), fx.t);
    G.fixtures.push(fx);
    if (isUserFx(fx)) changes.push(`${clubName(fx.h === G.club ? fx.a : fx.h)}: rearranged for ${fxWhen(fx)}.`);
  }
  if (changes.length) addNews('club', 'Friendly schedule corrected', 'Some unplayed friendlies had been scheduled before the current date. ' + changes.join(' '));
}

function arrangeFriendly(cid) {
  ensureFriendlySchedule();
  const opponent = G.clubs[cid];
  if (!opponent || opponent.backgroundOnly || opponent.squad.length < 11) return { error: 'This club does not have a playable squad yet.' };
  if (G.fixtures.some(f => f.fr && (f.h === cid || f.a === cid))) return { error: 'Already arranged.' };
  const w = freePreseasonWeek(G.club, cid);
  if (w == null) return { error: 'No pre-season week is free.' };
  const fx = { id: G.nextId++, r: null, w, d: 5, t: '15:00', tv: false, h: G.club, a: cid, hg: null, ag: null, fr: true };
  fx.wx = genWeather(fxDate(fx), fx.t);
  G.fixtures.push(fx);
  saveGame();
  return { fx };
}

ACT.friendlyAnalyse = () => {
  if (UI.friendly && UI.friendly.busy) return;
  UI.friendly = { busy: true, step: 'Looking at the overseas clubs…', wk: G.week };
  render();
  friendlyRun();
};
ACT.friendlyArrange = ds => {
  const r = arrangeFriendly(ds.id);
  if (r.error) { toast(r.error); return; }
  toast('Friendly arranged for ' + fxWhen(r.fx) + '.');
  render();
};
