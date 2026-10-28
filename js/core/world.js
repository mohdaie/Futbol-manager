'use strict';
// Background club registry. Selected compact squads are added separately;
// registry membership itself never creates players, fixtures or league jobs.
//
// Every country has two divisions and exactly one country is played (G.country); the leagues of the others are registered
// here and simulated in the background (world-sim.js). The English divisions are catalogue entries too, so that a career can
// be played in Spain, Italy, Germany or France and leave England simulated.
const ENGLAND_WORLD_CLUBS = ENGLISH_CLUBS.map(c => ({ id: c.id, league: ENGLAND_MEMBERSHIP_2026.ECH.includes(c.id) ? 'ECH' : 'EPL', name: c.name,
  realName: c.realName, city: c.city, nat: 'ENG', code: c.id, c1: c.c1, c2: c.c2, rep: c.rep, ground: c.ground, cap: c.cap, english: true }));
Object.assign(WORLD_LEAGUES, {
  EPL: { id: 'EPL', name: 'Premier League', country: 'England', nat: 'ENG', code: 'ENG', teams: 20, matches: 38, background: true, tier: 1 },
  ECH: { id: 'ECH', name: 'Championship', country: 'England', nat: 'ENG', code: 'ENG', teams: 24, matches: 46, background: true, tier: 2 },
});
const WORLD_CATALOG = WORLD_CLUBS.concat(ENGLAND_WORLD_CLUBS);
const catalogEntry = id => WORLD_CATALOG.find(e => e.id === id);
// Strength of a club that has no squad: the middle of the CA band its reputation would give a squad.
const lightStrength = rep => Math.round((66 + 0.65 * (rep - 80) + 4.5) * 10) / 10;

function ensureWorldLeagues() {
  const played = new Set(G.leagues || []), existing = Object.values(G.clubs);
  G.worldLeagues ||= {};
  for (const definition of Object.values(WORLD_LEAGUES)) {
    // Register each simulated league once; the leagues of the country being played are ordinary leagues.
    if (played.has(definition.id) || G.worldLeagues[definition.id]) continue;
    const ids = [];
    for (const entry of WORLD_CATALOG.filter(c => c.league === definition.id)) {
      let c = entry.existingRoster && existing.find(c => !c.fa && c.foreign &&
        (c.ros === entry.existingRoster || !c.ros && c.name === entry.name));
      c ||= G.clubs[entry.id];
      if (!c) {
        c = { id: entry.id, name: entry.name, realName: entry.realName, city: entry.city,
          nat: entry.nat, code: entry.code, c1: entry.c1, c2: entry.c2,
          squad: [], bal: 0, rep: entry.rep || 70, cap: entry.cap || 0, ground: entry.ground || '', foreign: true,
          backgroundOnly: true, dummySquad: { size: 25, transferable: false } };
        c.lw = lightStrength(c.rep);
        G.clubs[c.id] = c;
      }
      c.worldLeague = definition.id;
      c.realName ||= entry.realName;
      if (c.backgroundOnly) { c.c1 = entry.c1; c.c2 = entry.c2; }
      ids.push(c.id);
    }
    G.worldLeagues[definition.id] = { clubs: ids,
      mode: ids.some(id => G.clubs[id].foreignSquad) ? 'clubs-and-squads' : 'clubs-only', active: false };
  }
  G.worldLeagueVersion = 3;
  ensureWorldCrestPalettes();
}

// The catalogue club behind a menu choice, wherever it now lives in the career (the authored overseas clubs keep their old ids).
function resolveCatalogClub(catalogId) {
  const entry = catalogEntry(catalogId);
  if (!entry) return null;
  return G.clubs[catalogId] || Object.values(G.clubs).find(c => !c.fa && c.foreign && entry.existingRoster &&
    (c.ros === entry.existingRoster || !c.ros && c.name === entry.name)) || null;
}
const catalogEntryOf = c => WORLD_CATALOG.find(e => e.id === c.id || e.realName === c.realName && e.nat === c.nat) || {};

// When England is not the country played, its Premier League clubs hold first-team players and a few prospects, like the
// top flights abroad; the Championship clubs are placeholders until one is promoted.
function ensureEnglandSim() {
  const lg = G.worldLeagues?.EPL;
  if (!lg || G.englandSimVersion === 1) return;
  for (const id of lg.clubs) {
    const c = G.clubs[id];
    if (!c.backgroundOnly) continue;
    materializeClub(c, id, c.rep);
    fillClubSquad(c, 25);
    fillLevel(c, 'R', WORLD_PROSPECTS);
    c.squad.forEach(pid => { G.know[pid] = 10; });
  }
  G.englandSimVersion = 1;
}

// The country played: its leagues stop being simulated and its clubs become ordinary league clubs with the full English
// structure (a top flight with reserves and U18s, a second division with a first team and reserves).
function makePlayableClub(c, leagueId) {
  const entry = catalogEntryOf(c), second = leagueTier(leagueId) === 2;
  if (c.backgroundOnly) { materializeClub(c, entry.id || c.id, c.rep); }
  delete c.foreignSquad; delete c.lw;
  c.pl = true; c.foreign = false; c.league = leagueId;
  c.cap ||= entry.cap || 8000; c.ground ||= entry.ground || (c.city + ' Stadium');
  c.bal = Math.round(30e6 + Math.pow(Math.max(0, c.rep - 60), 2) * 0.25e6);
  if (!seniorSquad(c.id).length) fillClubSquad(c, second ? 24 : 25);
  fillLevel(c, 'R', second ? 12 : 20);
  if (!second) fillLevel(c, 'Y', 20);
  c.mgr ||= genManagerName();
  c.squad.forEach(pid => { G.know[pid] = Math.max(G.know[pid] || 0, 45); });
}
function activateCountry(code) {
  const [first, second] = COUNTRIES[code].tiers;
  for (const id of [first, second]) {
    const lg = G.worldLeagues?.[id];
    if (!lg) continue;
    for (const cid of lg.clubs) makePlayableClub(G.clubs[cid], id);
    delete G.worldLeagues[id];
  }
  G.country = code; G.leagues = [first, second];
}

function worldLeagueClubs(id) {
  return (G.worldLeagues?.[id]?.clubs || []).map(cid => G.clubs[cid]).filter(Boolean);
}
function clubCompetitionLabel(c) {
  return WORLD_LEAGUES[c.worldLeague]?.name || (c.pl ? leagueName(leagueOf(c.id)) : natName(c.nat));
}
function dummySquadSlots(c) {
  if (!c.backgroundOnly) return [];
  const profile = VIRTUAL_SQUAD_PROFILES[c.worldLeague] || VIRTUAL_SQUAD_PROFILES.ES1;
  const size = Math.min(c.dummySquad?.size || 25, SQUAD_TEMPLATE.length);
  const local = Array(size).fill(profile.local).slice(0, profile.localCount);
  const eu = profile.eu, international = profile.international;
  const nats = [...local];
  while (nats.length < size - profile.nonEuCount) nats.push(eu[Math.floor(hash01(c.id + ':eu:' + nats.length) * eu.length)]);
  while (nats.length < size) nats.push(international[Math.floor(hash01(c.id + ':int:' + nats.length) * international.length)]);
  const used = new Set();
  return SQUAD_TEMPLATE.slice(0, size).map((pos, i) => {
    const nat = nats[i], pool = NATIONS[nat] || NATIONS[profile.local];
    let name = '';
    for (let salt = 0; salt < 200; salt++) {
      const f = pool.f[Math.floor(hash01(`${c.id}:${i}:${salt}:f`) * pool.f.length)];
      const l = pool.l[Math.floor(hash01(`${c.id}:${i}:${salt}:l`) * pool.l.length)];
      name = f + ' ' + l;
      if (!used.has(name)) break;
    }
    used.add(name);
    return { no: i + 1, pos, name, nat, nationality: natName(nat), transferable: false, scoutable: false };
  });
}

// Display-only nationality mix for 25-person virtual squads. Spain has a
// domestic maximum of three non-EU registrations. The other profiles use an
// eight-player local share as a realism target; they are not legal minima.
// Italy, Germany and France have no equivalent domestic nationality quota.
// UEFA's eight locally-trained list places depend on training history, which
// these virtual, profile-free players do not claim to satisfy.
const VIRTUAL_SQUAD_PROFILES = {
  ES1: { local: 'ESP', localCount: 14, eu: ['POR','FRA','GER','ITA','NED','BEL','IRL','SCO','DEN','NOR'], nonEuCount: 3, international: ['BRA','ARG','NGA','GHA','SEN','CIV','JPN','MAS','USA'] },
  IT1: { local: 'ITA', localCount: 8, eu: ['ESP','FRA','GER','POR','NED','BEL','IRL','SCO','DEN','NOR'], nonEuCount: 7, international: ['BRA','ARG','NGA','GHA','SEN','CIV','JPN','MAS','USA'] },
  DE1: { local: 'GER', localCount: 8, eu: ['ESP','FRA','ITA','POR','NED','BEL','IRL','SCO','DEN','NOR'], nonEuCount: 7, international: ['BRA','ARG','NGA','GHA','SEN','CIV','JPN','MAS','USA'] },
  FR1: { local: 'FRA', localCount: 8, eu: ['ESP','GER','ITA','POR','NED','BEL','IRL','SCO','DEN','NOR'], nonEuCount: 7, international: ['BRA','ARG','NGA','GHA','SEN','CIV','JPN','MAS','USA'] },
};

// A second division and England use the profile of their country's top flight (or their own).
VIRTUAL_SQUAD_PROFILES.ES2 = VIRTUAL_SQUAD_PROFILES.ES1; VIRTUAL_SQUAD_PROFILES.IT2 = VIRTUAL_SQUAD_PROFILES.IT1;
VIRTUAL_SQUAD_PROFILES.DE2 = VIRTUAL_SQUAD_PROFILES.DE1; VIRTUAL_SQUAD_PROFILES.FR2 = VIRTUAL_SQUAD_PROFILES.FR1;
VIRTUAL_SQUAD_PROFILES.EPL = VIRTUAL_SQUAD_PROFILES.ECH = { local: 'ENG', localCount: 12, eu: ['FRA','ESP','POR','GER','NED','BEL','IRL','DEN','NOR','ITA'], nonEuCount: 5, international: ['BRA','ARG','NGA','GHA','SEN','CIV','JPN','USA','SCO','WAL'] };

// One-time colour correction for the audited clubs, including established squads.
// Resolve legacy generated foreign IDs through their authored roster identity.
const WORLD_CREST_PALETTE_FIX_IDS = new Set(["ES1_ATH", "ES1_ATM", "ES1_BAR", "ES1_CEL", "ES1_VAL", "ES1_VIL", "IT1_JUV", "DE1_DOR", "DE1_FRA", "DE1_BAY", "DE1_RBL", "FR1_MON", "FR1_LIL", "ES1_RMA", "IT1_ATA", "IT1_INT", "IT1_COM", "FR1_STR", "FR1_MAR", "FR1_TRO"]);
function ensureWorldCrestPalettes() {
  if (G.worldCrestPaletteVersion === 1) return;
  for (const entry of WORLD_CLUBS.filter(c => WORLD_CREST_PALETTE_FIX_IDS.has(c.id))) {
    const c = G.clubs[entry.id] || Object.values(G.clubs).find(c => c.foreign && !c.fa &&
      (entry.existingRoster && c.ros === entry.existingRoster || c.name === entry.name));
    if (c) { c.c1 = entry.c1; c.c2 = entry.c2; }
  }
  G.worldCrestPaletteVersion = 1;
}
