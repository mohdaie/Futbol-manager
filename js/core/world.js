'use strict';
// Background club registry. No new player records, fixtures, AI jobs or match
// processing are created until these leagues are explicitly activated later.
function ensureWorldLeagues() {
  if (G.worldLeagueVersion === 1) return;
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
      ids.push(c.id);
    }
    G.worldLeagues[definition.id] = { clubs: ids, mode: 'clubs-only' };
  }
  G.worldLeagueVersion = 1;
}

function worldLeagueClubs(id) {
  return (G.worldLeagues?.[id]?.clubs || []).map(cid => G.clubs[cid]).filter(Boolean);
}
function clubCompetitionLabel(c) {
  return WORLD_LEAGUES[c.worldLeague]?.name || (c.pl ? leagueName(leagueOf(c.id)) : natName(c.nat));
}
function dummySquadSlots(c) {
  if (!c.backgroundOnly) return [];
  return SQUAD_TEMPLATE.slice(0, c.dummySquad?.size || 25).map((pos, i) => ({
    no: i + 1, pos, name: 'Placeholder ' + String(i + 1).padStart(2, '0'), transferable: false,
  }));
}
