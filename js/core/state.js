'use strict';
/* ===== state.js =====
   The single game state object G, new-game world generation, save/load, news,
   and squad helpers (auto-pick, wage bill, squad status). */

let G = null;
const SAVE_KEY = 'futbol-manager:v1';

// First 11 are starters, next 11 rotation, last 3 youngsters.
const SQUAD_TEMPLATE = ['GK', 'DL', 'DC', 'DC', 'DR', 'DM', 'MC', 'MC', 'AML', 'AMR', 'ST', 'GK', 'DL', 'DC', 'DC', 'DR', 'DM', 'MC', 'AMC', 'AML', 'AMR', 'ST', 'GK', 'MC', 'ST'];
const SHIRT = { GK: [1, 13, 31], DR: [2, 22, 32], DL: [3, 23, 33], DC: [4, 5, 15, 16, 26, 35], DM: [6, 16, 18], MC: [8, 14, 20, 24, 25], ML: [11, 21], MR: [7, 27], AML: [11, 19, 29], AMR: [7, 17, 27], AMC: [10, 28], ST: [9, 19, 39, 30] };

const club = id => G.clubs[id];
const userClub = () => G.clubs[G.club];
const clubName = id => (G.clubs[id] ? G.clubs[id].name : 'Free agent');
// "the Reds", but "Spurs", "Old Gold" and overseas names such as "La Dea" take no article. Takes a club or an id.
const NO_ARTICLE = new Set(['SPU', 'OLD', 'POM', 'MID']);
function theClub(c) {
  if (typeof c !== 'object') c = G.clubs[c];
  if (!c) return 'a free agent';
  return c.foreign || c.worldLeague || NO_ARTICLE.has(c.id) ? c.name : 'the ' + c.name;
}
const TheClub = c => { const s = theClub(c); return s[0].toUpperCase() + s.slice(1); };
const possessive = s => s + (/s$/i.test(s) ? "'" : "'s");
const plClubs = () => leagueClubs('EPL');
const squadOf = id => G.clubs[id].squad.map(pid => G.players[pid]).filter(Boolean);
const seniorSquad = id => squadOf(id).filter(p => lvlOf(p) === 'A');
const levelSquad = (id, l) => squadOf(id).filter(p => lvlOf(p) === l);
const clubWageBill = c => sum(c.squad, id => { const p = G.players[id]; return p && !p.loan ? p.wage : 0; }) + (typeof loanWageForClub === 'function' ? loanWageForClub(c.id) : 0);
const seasonLabel = (s = G.season) => s + '/' + String(s + 1).slice(2);

function assignNumber(c, p) {
  const used = new Set(c.squad.map(id => G.players[id] && G.players[id].no));
  for (const n of SHIRT[p.pos] || []) if (!used.has(n)) { p.no = n; return; }
  for (let n = 12; n <= 99; n++) if (!used.has(n)) { p.no = n; return; }
}

function addToClub(p, c) {
  if (!squadSpace(c, p)) throw new Error(squadLimitMessage(c));
  if (c.league === 'ECH' && lvlOf(p) === 'Y') { p.lvl = 'R'; p.youth = false; }
  G.players[p.id] = p;
  p.club = c.id;
  assignNumber(c, p);
  c.squad.push(p.id);
  const l = lvlOf(p);
  if (!p.wage) p.wage = l === 'Y' ? roundWage(rf(300, 900)) : l === 'R' ? roundWage(Math.max(1500, wageFor(p, c.rep) * 0.5)) : wageFor(p, c.rep);
  if (!p.con) p.con = G.season + ri(1, 5);
  p.listed = false;
}

function removeFromClub(p) {
  const c = G.clubs[p.club];
  if (c) c.squad = c.squad.filter(id => id !== p.id);
  if (p.club === G.club && G.tactics) {
    G.tactics.slots = G.tactics.slots.map(id => (id === p.id ? null : id));
    G.tactics.bench = G.tactics.bench.filter(id => id !== p.id);
  }
}

function genSquad(c, size = 25) {
  const top = 60 + (c.rep - 50) * 0.6; // typical starter rating for this club
  SQUAD_TEMPLATE.slice(0, size).forEach((pos, i) => {
    let ca, age;
    if (i < 11) { ca = top + gauss() * 2.6; age = ri(22, 31); }
    else if (i < 22) { ca = top - 5 + gauss() * 3; age = ri(20, 33); }
    else { age = ri(17, 20); ca = top - 16 + gauss() * 3; }
    const pa = ca + (age <= 20 ? rf(8, 22) : age <= 23 ? rf(3, 12) : age <= 26 ? rf(0, 5) : 0);
    const nat = c.nat && R() < 0.75 ? c.nat : pickNat(PL_NATS);
    addToClub(genPlayer({ pos, ca, pa, age, nat, club: c.id }), c);
  });
}

function genFreeAgent() {
  const p = genPlayer({ pos: pick(SQUAD_TEMPLATE), ca: rf(50, 72), age: ri(20, 34), nat: pickNat(PL_NATS) });
  p.pa = Math.max(p.pa, p.ca + (p.age < 24 ? ri(2, 10) : 0));
  addToClub(p, G.clubs.FA);
  p.con = 0;
  return p;
}

// Home-grown mix for overseas academies and generated depth players: mostly the club's own country, the rest from its league's usual sources.
function youthNat(c) {
  const prof = VIRTUAL_SQUAD_PROFILES[c.worldLeague];
  return !prof || R() < 0.75 ? c.nat : pick(prof.eu.concat(prof.international));
}

function genYouth(c, quality) {
  if (!squadSpace(c) || c.academy?.noAnnualIntake) return null;
  const pos = pick(SQUAD_TEMPLATE);
  const age = ri(15, 17);
  const pa = clamp(quality + gauss() * 9 + (R() < 0.06 ? 12 : 0), 45, 95);
  const p = genPlayer({ pos, ca: clamp(pa - rf(22, 35), 28, 60), pa, age, nat: c.worldLeague ? youthNat(c) : R() < 0.7 ? 'ENG' : pickNat(PL_NATS), club: c.id, lvl: c.league === 'ECH' ? 'R' : 'Y' });
  addToClub(p, c);
  p.wage = roundWage(rf(300, 900));
  p.con = G.season + 3;
  G.know[p.id] = 100;
  return p;
}

// Top up a club's reserves (R) or U18s (Y) to a target size with generated youngsters,
// filling the positions the level is short of first. Bigger clubs have better prospects.
const LEVEL_TEMPLATE = ['GK', 'GK', 'DC', 'DC', 'DC', 'DC', 'DL', 'DL', 'DR', 'DR', 'DM', 'DM', 'MC', 'MC', 'MC', 'AML', 'AMR', 'AMC', 'ST', 'ST'];
function fillLevel(c, l, target) {
  if (c.academy?.noAnnualIntake) return;
  const have = levelSquad(c.id, l);
  const need = LEVEL_TEMPLATE.slice();
  have.forEach(p => { const i = need.indexOf(p.pos); if (i >= 0) need.splice(i, 1); });
  if (!Object.hasOwn(clubLevels(c), l)) return;
  for (let n = have.length; n < target && squadSpace(c); n++) {
    const pos = need.length ? need.shift() : pick(LEVEL_TEMPLATE);
    const age = l === 'Y' ? wpick([15, 16, 17], a => (a === 15 ? 2 : 4)) : wpick([18, 19, 20, 21], a => (a === 21 ? 2 : 4));
    const nat = c.worldLeague ? youthNat(c) : R() < 0.72 ? 'ENG' : pickNat(PL_NATS);
    const pa = clamp(55 + (c.rep - 60) * 0.55 + gauss() * 8 + (R() < 0.05 ? 10 : 0), 45, 94);
    const ca = l === 'Y' ? clamp(pa - rf(24, 36) + (age - 15) * 2, 28, 58) : clamp(pa - rf(14, 26) + (age - 18) * 1.5, 38, 68);
    const p = genPlayer({ pos, ca, pa, age, nat, club: c.id, lvl: l });
    addToClub(p, c);
    p.con = G.season + (l === 'Y' ? ri(1, 3) : ri(1, 2));
    if (c.id === G.club) G.know[p.id] = 100;
  }
}

function staffName(n = pickNat({ ENG: 6, SCO: 2, ESP: 1, POR: 1, NED: 1, GER: 1, ITA: 1, FRA: 1 })) { const [f, l] = genName(n); return f + ' ' + l; }
// Scouts come from anywhere and know countries (scouting.js); other staff are mostly British.
function genStaffMember(role, rep) {
  const rating = clamp(Math.round(6 + (rep - 60) / 4 + gauss() * 2.5), 3, 20);
  const nat = role === 'Scout' ? pickNat(SCOUT_NATS) : null;
  const s = { id: G.nextId++, role, name: staffName(nat || undefined), age: ri(32, 64), rating, wage: roundWage(1200 * rating + rf(0, 3000)) };
  if (nat) { s.nat = nat; if (typeof genScoutCountries === 'function') s.cn = genScoutCountries(s); }
  return s;
}
function genStaffPool(rep) {
  const pool = [];
  Object.keys(STAFF_ROLES).forEach(role => { for (let i = 0; i < 2; i++) pool.push(genStaffMember(role, rep + ri(-10, 12))); });
  return pool;
}
const staffOf = role => G.staff.filter(s => s.role === role);
const staffAvg = (role, dflt = 8) => { const s = staffOf(role); return s.length ? avg(s, x => x.rating) : dflt; };

function expectationFor(cid) {
  const order = leagueClubs(leagueOf(cid)).slice().sort((a, b) => G.clubs[b].rep - G.clubs[a].rep);
  const r = order.indexOf(cid);
  if (leagueOf(cid) === 'ECH') return r < 3 ? { pos: 2, text: 'Win automatic promotion' } : r < 8 ? { pos: 6, text: 'Reach the promotion playoffs' } : r < 16 ? { pos: 12, text: 'Finish in the top half' } : { pos: 21, text: 'Avoid relegation' };
  if (r < 2) return { pos: 1, text: 'Win the league' };
  if (r < 5) return { pos: 4, text: 'Qualify for the Champions Cup (top 4)' };
  if (r < 8) return { pos: 7, text: 'Qualify for Europe (top 7)' };
  if (r < 12) return { pos: 10, text: 'Finish in the top half' };
  if (r < 16) return { pos: 14, text: 'Comfortable mid-table finish' };
  return { pos: 17, text: 'Avoid relegation' };
}

// Computer clubs: big clubs lean to pressing and possession, smaller clubs to counter-attack and long ball.
function aiTactic(rep = 70) {
  const k = wpick(Object.keys(STYLES), s => ({ gegen: rep - 60, tiki: rep - 66, bal: 30, counter: 95 - rep, long: 88 - rep }[s]) || 1);
  const t = { style: k };
  applyStyle(t, k);
  return t;
}

function newGame(clubId, manager, avatar) {
  if (!CLUBS.concat(CHAMPIONSHIP_CLUBS).some(c => c.id === clubId)) throw new Error('This club is not playable yet. Choose a Premier League or Championship club.');
  G = {
    createdAt: Date.now(),
    leagues: ['EPL', 'ECH'], competitionVersion: 2, v: 1, manager: manager || 'The Boss', avatar: avatar || 1, club: clubId, season: START_SEASON, week: 0, day: 0, nextId: 1,
    players: {}, clubs: {}, fixtures: [], news: [], know: {}, shortlist: [],
    scout: { assign: [], reports: [], jobs: [] }, pitches: [], offers: [], tHist: [],
    fin: null, board: null, staff: [], staffPool: [], tactics: null,
    training: { focus: 'bal', intensity: 1, fam: 60, indiv: {} },
    ledger: null, ledgerPrev: null, balHist: [], history: [], trophies: [],
    settings: { speed: 2 }, seasonReview: null, gameOver: false, flags: {}, lastMatch: null, press: {},
  };
  CLUBS.concat(CHAMPIONSHIP_CLUBS).forEach(c => {
    const league = ENGLAND_MEMBERSHIP_2026.ECH.includes(c.id) ? 'ECH' : 'EPL';
    const cl = { ...c, squad: [], bal: Math.round(30e6 + Math.pow(Math.max(0, c.rep - 60), 2) * 0.25e6), tac: aiTactic(c.rep), pl: true, league };
    G.clubs[c.id] = cl;
    fillEnglandFirstTeam(cl, league === 'ECH' ? 24 : 25);
    fillLevel(cl, 'R', league === 'ECH' ? 12 : 20);
    if (league === 'EPL') fillLevel(cl, 'Y', 20);
  });
  FOREIGN.forEach((f, i) => {
    const id = 'F' + i;
    const cl = { ...f, id, city: NATIONS[f.nat].n, ground: '', cap: 0, squad: [], bal: 50e6, tac: aiTactic(), foreign: true, code: f.name.replace(/[^A-Za-z]/g, '').slice(0, 3).toUpperCase() };
    G.clubs[id] = cl;
    // Selected world clubs receive their compact squads after registry creation.
    if (WORLD_CLUBS.some(e => e.existingRoster === f.ros && WORLD_SQUAD_DATA[e.id])) return;
    // Real-based first team when there is one (with the real player each is inspired by), otherwise generated.
    if (typeof FOREIGN_ROSTERS !== 'undefined' && FOREIGN_ROSTERS[f.ros]) {
      const domesticIdentities = new Set(Object.values(G.players).filter(p => p.insp).map(p => p.insp));
      FOREIGN_ROSTERS[f.ros].filter(row => !row[8] || !domesticIdentities.has(row[8])).forEach(row => addToClub(playerFromRoster(row, id), cl));
    }
    else genSquad(cl, 18);
  });
  G.clubs.FA = { id: 'FA', name: 'Free agents', city: '', rep: 50, c1: '#55646B', c2: '#D8E0E2', squad: [], foreign: true, fa: true, code: 'FA', bal: 0 };
  for (let i = 0; i < 50; i++) genFreeAgent();

  Object.values(G.players).forEach(p => {
    const c = G.clubs[p.club];
    G.know[p.id] = c.pl ? 45 : c.fa ? 20 : 10;
  });

  ensureWorld({ newCareer: true });
  G.fixtures = G.leagues.flatMap(id => genFixtures(leagueClubs(id), id));
  setupUserClub();
  addNews('club', 'Welcome to ' + theClub(clubId), `The board has appointed ${G.manager} as manager. Their objective for ${seasonLabel()}: ${lcFirst(G.board.target.text)}. The transfer budget is ${money(G.fin.tb)}.`, null);
  addNews('club', 'Pre-season begins', 'Set your training focus, review the squad and check the tactics screen before the opening match in mid-August. The summer transfer window is open until 1 September.');
  seasonOpeningStory();
  saveGame();
}

function setupUserClub() {
  const c = userClub();
  c.squad.forEach(id => { G.know[id] = 100; });
  G.tactics = { ip: c.tac.ip, oop: c.tac.oop, roles: Array(11).fill(0), slots: [], bench: [], ment: 2, tempo: 1, width: 1, press: 1, line: 1, pass: 1, lost: 1, won: 1, pi: {}, cap: null, pk: null, fk: null, ck: null };
  const pk = autoPick(c.id, G.tactics.ip);
  G.tactics.slots = pk.xi;
  G.tactics.bench = pk.bench;
  autoSetPieces();
  rankSquadStatus(c);
  G.fin = { tb: roundMoney(c.bal * 0.3), wb: roundWage(clubWageBill(c) * 1.1) };
  G.board = { conf: 65, fans: 65, target: expectationFor(c.id), facTrain: clamp(Math.round((c.rep - 55) / 2.2), 5, 20), facYouth: clamp(Math.round((c.rep - 58) / 2.2), 4, 20), reqWin: '' };
  G.staff = [];
  Object.entries(STAFF_ROLES).forEach(([role, n]) => { for (let i = 0; i < (role === 'Coach' || role === 'Scout' ? 2 : 1); i++) G.staff.push(genStaffMember(role, c.rep)); });
  G.staffPool = genStaffPool(c.rep);
  G.ledger = emptyLedger();
  G.balHist = [c.bal];
}

function rankSquadStatus(c) {
  const all = c.squad.map(id => G.players[id]);
  all.filter(p => lvlOf(p) !== 'A').forEach(p => { p.status = 'Prospect'; });
  const ps = all.filter(p => lvlOf(p) === 'A').sort((a, b) => b.ca - a.ca);
  ps.forEach((p, i) => {
    if (p.age <= 20 && i > 14) p.status = 'Prospect';
    else p.status = i < 4 ? 'Key player' : i < 11 ? 'First team' : i < 16 ? 'Rotation' : 'Backup';
  });
  // the number-one keeper is a starter even though keepers rate lower than outfielders
  const gk = ps.filter(p => p.pos === 'GK')[0];
  if (gk && !['Key player', 'First team'].includes(gk.status)) gk.status = 'First team';
}

const available = p => p && !p.inj && (!(p.ban > 0) || !!G?.flags?.friendlySelection);

// Greedy best XI for a formation, scarce positions first, plus a 9-man bench with a keeper.
function autoPick(cid, formation, keep) {
  const slots = FORMATIONS[formation];
  let pool = seniorSquad(cid).filter(p => availableForLeague(p, cid));
  // short of fit first-team players: call up the best reserves
  const poolTarget = G.clubs[cid].foreignSquad ? 20 : 16;
  if (pool.length < poolTarget) pool = pool.concat(levelSquad(cid, 'R').filter(p => availableForLeague(p, cid)).sort((a, b) => b.ca - a.ca).slice(0, poolTarget - pool.length));
  const xi = Array(11).fill(null);
  const used = new Set();
  if (keep) keep.forEach((id, i) => { if (id && pool.some(p => p.id === id)) { xi[i] = id; used.add(id); } });
  const natCount = pos => pool.filter(p => p.pos === pos).length;
  const order = slots.map((s, i) => i).filter(i => !xi[i]).sort((a, b) => (slots[a][0] === 'GK' ? -1 : 0) - (slots[b][0] === 'GK' ? -1 : 0) || natCount(slots[a][0]) - natCount(slots[b][0]));
  for (const i of order) {
    const pos = slots[i][0];
    let best = null, bs = -1;
    for (const p of pool) {
      if (used.has(p.id)) continue;
      const s = ovrAt(p, pos) * (0.75 + 0.25 * p.cond / 100);
      if (s > bs) { bs = s; best = p; }
    }
    if (best) { xi[i] = best.id; used.add(best.id); }
  }
  const rest = pool.filter(p => !used.has(p.id)).sort((a, b) => b.ca - a.ca);
  const bench = [];
  const gk = rest.find(p => p.pos === 'GK');
  if (gk) bench.push(gk.id);
  for (const p of rest) { if (bench.length >= 9) break; if (!bench.includes(p.id)) bench.push(p.id); }
  return { xi, bench };
}

// Keep the user's lineup valid: drop departed, injured or banned players and fill gaps.
function ensureUserLineup() {
  const T = G.tactics, ok = id => { const p = G.players[id]; return p && p.club === G.club && lvlOf(p) !== 'Y' && availableForLeague(p, G.club); };
  T.slots = T.slots.map(id => (ok(id) ? id : null));
  T.bench = T.bench.filter(ok).filter(id => !T.slots.includes(id));
  if (T.slots.some(x => !x) || T.bench.length < 7) {
    const pk = autoPick(G.club, T.ip, T.slots);
    T.slots = pk.xi;
    const extra = pk.bench.filter(id => !T.bench.includes(id));
    T.bench = T.bench.concat(extra).slice(0, 9);
  }
  ['cap', 'pk', 'fk', 'ck'].forEach(k => { if (!T.slots.includes(T[k])) T[k] = null; });
  autoSetPieces();
}

function autoSetPieces() {
  const T = G.tactics, xi = T.slots.map(id => G.players[id]).filter(Boolean);
  if (!xi.length) return;
  const best = f => xi.slice().sort((a, b) => f(b) - f(a))[0].id;
  if (!T.cap) T.cap = best(p => p.at[A.ldr] * 2 + p.age / 3);
  if (!T.pk) T.pk = best(p => p.at[A.fin] + p.at[A.cmp]);
  if (!T.fk) T.fk = best(p => p.at[A.pas] + p.at[A.fin] + p.at[A.vis] / 2);
  if (!T.ck) T.ck = best(p => p.at[A.cro] * 2 + p.at[A.pas]);
}

function emptyLedger() { return { tv: 0, gate: 0, spon: 0, merch: 0, sales: 0, prize: 0, wages: 0, staff: 0, manager: 0, buys: 0, ops: 0, scout: 0 }; }

// News that stops the day-by-day calendar: transfers, offers, contracts, injuries, suspensions, the board.
const NEWS_STOP = /injur|hurt|suspend|contract|released|board|sack|takes over|scouting assignment|youth intake|season begins/i;
const newsImportant = n => (n.cat === 'transfer' && !n.q) || n.cat === 'inbox' || (n.cat === 'club' && NEWS_STOP.test(n.title));
/* Where an item lives: 'news' (public stories), 'inbox' (private, may need you) or 'log' (private
   admin notices). Anything with an action or about your club defaults to the inbox. */
const defaultNewsBox = (cat, action) => (action || cat === 'inbox' || cat === 'club' ? 'inbox' : 'news');
function addNews(cat, title, body, action, box) {
  G.news.unshift({ id: G.nextId++, date: (typeof today === 'function' ? today() : weekDate(G.week)).getTime(), cat, title, body: body || '', action: action || null, box: box || defaultNewsBox(cat, action), read: false, done: false });
  // Over the cap, drop the oldest item that is not still waiting for your decision.
  while (G.news.length > 160) { const i = G.news.findLastIndex(n => !(n.action && !n.done)); G.news.splice(i < 0 ? G.news.length - 1 : i, 1); }
  if (typeof worldAlertForNews === 'function') worldAlertForNews(G.news[0]);
}
// The public curtain-raiser for a season, so the front page is never empty on day one.
function seasonOpeningStory() {
  const lg = leagueOf(G.club), name = leagueName(lg);
  addStory('league', `${seasonLabel()} ${name} season`, `The ${name} season ${seasonLabel()} is on its way.`);
  if (typeof makeStory === 'function') storySimple(G.news[0], 'league', 'season-start', { league: name, season: seasonLabel(), teams: leagueClubs(lg).length });
}
const addLog = (cat, title, body, action) => addNews(cat, title, body, action, 'log');
const addStory = (cat, title, body, action) => addNews(cat, title, body, action, 'news');
// Saves from before the split: sort existing items once, by the same rules as new ones.
const LEGACY_LOG = /^(Transfer instalment (paid|received)|Add-on paid|Sell-on paid|Manager bonus paid|Staff have learned|Friendly schedule corrected|Purchase obligation triggered)| promoted$/;
const LEGACY_STORY = /signs a new contract$| released$|^Youth intake arrives| takes over at /;
function ensureNewsBoxes() {
  const closed = new Set((G.deals || []).filter(d => d.closed).map(d => d.id)), answered = new Set((G.media?.req || []).filter(r => r.done).map(r => r.id));
  (G.news || []).forEach(n => {
    n.box ||= LEGACY_LOG.test(n.title) ? 'log' : n.cat === 'club' && !n.action && LEGACY_STORY.test(n.title) ? 'news' : defaultNewsBox(n.cat, n.action);
    if (n.action?.t === 'deal' && closed.has(n.action.id) || n.action?.t === 'press' && answered.has(n.action.id)) n.done = true;
  });
}

function saveGame() {
  if (!G) return false;
  syncPlaytime();
  if (typeof brainSave === 'function') brainSave();
  if (typeof SaveStorage !== 'undefined') {
    G.savedAt = Date.now(); return SaveStorage.enqueue(G);
  }
  const previous = G.savedAt;
  try { G.savedAt = Date.now(); localStorage.setItem(SAVE_KEY, JSON.stringify(G)); return true; } catch (e) { G.savedAt = previous; return false; }
}
// Clock checkpoints (playtime, brain) skip the full-career copy. A pending full save already carries the clock.
function saveClock() {
  if (!G) return false;
  if (typeof SaveStorage === 'undefined' || SaveStorage.blocked || !SaveStorage.worker) return saveGame();
  if (SaveStorage.dirty > SaveStorage.written) return true;
  syncPlaytime();
  if (typeof brainSave === 'function') brainSave();
  G.savedAt = Date.now();
  const { players, clubs, ...world } = SaveStorage.snapshot(G);
  SaveStorage.request('saveWorld', world).catch(() => saveGame());
  return true;
}
function loadGame() {
  if (typeof SaveStorage !== 'undefined') {
    const saved = SaveStorage.current || SaveStorage.cached;
    if (!saved) return false;
    G = structuredClone(SaveStorage.snapshot(saved)); ensureWorld(); return true;
  }
  try {
    const s = localStorage.getItem(SAVE_KEY);
    if (s) { G = JSON.parse(s); ensureWorld(); return true; }
  } catch (e) { /* storage blocked or corrupt */ }
  return false;
}
function hasSave() { if (typeof SaveStorage !== 'undefined') return !!(SaveStorage.current || SaveStorage.cached); try { return !!localStorage.getItem(SAVE_KEY); } catch (e) { return false; } }
function deleteSave() { if (typeof SaveStorage !== 'undefined') return SaveStorage.clear(); try { localStorage.removeItem(SAVE_KEY); } catch (e) { /* ignore */ } }
async function saveGameAsync() {
  if (!saveGame()) return false;
  try { return typeof SaveStorage === 'undefined' || await SaveStorage.flush(); } catch { return false; }
}
