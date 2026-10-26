'use strict';
// Background club registry. Selected compact squads are added separately;
// registry membership itself never creates players, fixtures or league jobs.
function ensureWorldLeagues() {
  if (G.worldLeagueVersion === 3) return;
  const existing = Object.values(G.clubs);
  G.worldLeagues ||= {};
  for (const definition of Object.values(WORLD_LEAGUES)) {
    const ids = [];
    for (const entry of WORLD_CLUBS.filter(c => c.league === definition.id)) {
      let c = entry.existingRoster && existing.find(c => !c.fa && c.foreign &&
        (c.ros === entry.existingRoster || !c.ros && c.name === entry.name));
      c ||= G.clubs[entry.id];
      if (!c) {
        c = { id: entry.id, name: entry.name, realName: entry.realName, city: entry.city,
          nat: entry.nat, code: entry.code, c1: entry.c1, c2: entry.c2,
          squad: [], bal: 0, rep: 70, cap: 0, ground: '', foreign: true,
          backgroundOnly: true, dummySquad: { size: 25, transferable: false } };
        G.clubs[c.id] = c;
      }
      c.worldLeague = definition.id;
      c.realName ||= entry.realName;
      // Version 3: real club colours. Legacy F-id clubs keep the colours their crest artwork uses.
      if (c.id === entry.id) { c.c1 = entry.c1; c.c2 = entry.c2; }
      ids.push(c.id);
    }
    G.worldLeagues[definition.id] = { clubs: ids,
      mode: ids.some(id => G.clubs[id].foreignSquad) ? 'clubs-and-squads' : 'clubs-only', active: false };
  }
  G.worldLeagueVersion = 3;
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
