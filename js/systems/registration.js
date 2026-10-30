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
  const limit = premierLeagueRegistrationLimit();
  let ids = current ? (old.ids || []).filter(id => validIds.has(id)).slice(0, limit) : [];
  let seen = current ? new Set((old.seen || []).filter(id => validIds.has(id))) : new Set();
  const rank = (a, b) => (lvlOf(a) === 'A' ? 0 : 1) - (lvlOf(b) === 'A' ? 0 : 1) || b.ca - a.ca;
  if (!current) {
    ids = roster.slice().sort(rank).slice(0, limit).map(p => p.id);
    seen = new Set(roster.map(p => p.id));
  } else {
    // Signings and loan arrivals take a free place automatically. When the list is
    // full they stay unseen, which makes the manager choose who to drop.
    roster.filter(p => !seen.has(p.id) && !ids.includes(p.id)).sort(rank).forEach(p => {
      if (ids.length < limit) { ids.push(p.id); seen.add(p.id); }
      else if (cid !== G.club) seen.add(p.id);
    });
    roster.forEach(p => { if (ids.includes(p.id)) seen.add(p.id); });
  }
  c.plRegistration = { season: G.season, ids, seen: [...seen] };
}

// Senior players the manager has not yet decided on (list full when they arrived).
function plRegistrationPending(cid = G.club) {
  const c = G.clubs[cid];
  if (!c || c.league !== 'EPL') return [];
  ensurePLRegistration(cid);
  const seen = new Set(c.plRegistration.seen), ids = new Set(c.plRegistration.ids);
  return squadOf(cid).filter(p => lvlOf(p) !== 'Y' && !under21Exempt(p) && !ids.has(p.id) && !seen.has(p.id));
}

function confirmPLRegistration(cid = G.club) {
  const c = G.clubs[cid];
  if (!c || c.league !== 'EPL') return;
  ensurePLRegistration(cid);
  c.plRegistration.seen = squadOf(cid).filter(p => lvlOf(p) !== 'Y' && !under21Exempt(p)).map(p => p.id);
}

// The registration list must be answered before the window shuts: from the day before deadline day on.
function plRegistrationDue() {
  const s = windowState();
  return s.open && s.left <= 1 && plRegistrationPending().length > 0;
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
  c.plRegistration = { season: G.season, ids: requested, seen: c.plRegistration.seen };
  return { ok: true };
}

function premierLeagueEligible(p, cid = p?.club) {
  if (!p) return false;
  // 14: List A is an EPL competition rule. Friendlies (including preseason
  // fixtures against foreign clubs) can select the full available squad.
  if (G?.flags?.friendlySelection || G?.clubs?.[cid]?.league !== 'EPL' || under21Exempt(p)) return true;
  ensurePLRegistration(cid);
  return registeredPLIds(G.clubs[cid]).has(p.id);
}

function availableForLeague(p, cid = p?.club) {
  return available(p) && premierLeagueEligible(p, cid);
}
