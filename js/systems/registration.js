'use strict';
/* Premier League List A: up to 25 over-age players per club and season.
   Under-21 players are eligible without taking a List A place. */
const premierLeagueRegistrationLimit = () => leagueRules('EPL').seniorList || 25;

function under21Exempt(p, season = G.season) {
  const cutoff = Date.parse(`${season - 21}-01-01T00:00:00Z`);
  const dob = p?.identity?.dob;
  if (dob && Number.isFinite(Date.parse(dob))) return Date.parse(dob) >= cutoff;
  // Some authored identities have an age but no verified birth date. Treat a
  // player aged 20 or younger at the season start as exempt; do not guess for 21s.
  return Number(p?.age) <= 20;
}

function registeredPLIds(c) {
  return new Set(c?.plRegistration?.season === G.season ? c.plRegistration.ids || [] : []);
}

function ensurePLRegistration(cid) {
  const c = G.clubs[cid];
  if (!c || c.league !== 'EPL') return;
  const old = c.plRegistration;
  const current = old?.season === G.season;
  const roster = squadOf(cid).filter(p => lvlOf(p) !== 'Y' && !under21Exempt(p));
  const validIds = new Set(roster.map(p => p.id));
  let ids = current ? (old.ids || []).filter(id => validIds.has(id)).slice(0, premierLeagueRegistrationLimit()) : [];
  if (!current) {
    ids = roster.sort((a, b) => (lvlOf(a) === 'A' ? 0 : 1) - (lvlOf(b) === 'A' ? 0 : 1) || b.ca - a.ca)
      .slice(0, premierLeagueRegistrationLimit()).map(p => p.id);
  }
  c.plRegistration = { season: G.season, ids };
}

function ensurePremierLeagueRegistrations() {
  if (!G?.clubs || !G?.players) return;
  Object.values(G.clubs).filter(c => c.pl && c.league === 'EPL').forEach(c => ensurePLRegistration(c.id));
}

function setPremierLeagueRegistration(cid, ids) {
  const c = G.clubs[cid];
  if (!c || c.league !== 'EPL') return { ok: false, reason: 'Premier League registration is only used by Premier League clubs.' };
  ensurePLRegistration(cid);
  const requested = [...new Set(ids.map(Number))].filter(id => {
    const p = G.players[id];
    return p && p.club === cid && lvlOf(p) !== 'Y' && !under21Exempt(p);
  });
  if (requested.length > premierLeagueRegistrationLimit()) {
    return { ok: false, reason: `The Premier League list can contain at most ${premierLeagueRegistrationLimit()} players.` };
  }
  c.plRegistration = { season: G.season, ids: requested };
  return { ok: true };
}

function premierLeagueEligible(p, cid = p?.club) {
  if (!p) return false;
  if (leagueOf(cid) !== 'EPL' || under21Exempt(p)) return true;
  ensurePLRegistration(cid);
  return registeredPLIds(G.clubs[cid]).has(p.id);
}

function availableForLeague(p, cid = p?.club) {
  return available(p) && premierLeagueEligible(p, cid);
}
