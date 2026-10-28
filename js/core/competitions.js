'use strict';
// Competition format and game-specific squad policy. The ownership cap is separate
// from a real competition's senior registration list; see data/england/sources.json.
const LEAGUES = {
  EPL: { id: 'EPL', name: 'Premier League', country: 'ENG', tier: 1, teams: 20, matches: 38, win: 3, draw: 1, relegated: 3, automatic: 0, playoff: [], bench: 9, substitutions: 5, windows: 3, seniorList: 25, nonHomegrown: 17, under21BornFrom: 2005, levels: ['A', 'R', 'Y'], squadMax: null },
  ECH: { id: 'ECH', name: 'Championship', country: 'ENG', tier: 2, teams: 24, matches: 46, win: 3, draw: 1, relegated: 3, automatic: 2, playoff: [3, 4, 5, 6], bench: 9, substitutions: 5, windows: 3, seniorList: 25, nonHomegrown: 17, under21BornFrom: 2005, levels: ['A', 'R'], squadMax: 36 },
};
// The other countries play the same two-division format: three clubs go down and three come up (two automatically, one
// through the playoffs between places 3-6). Their domestic registration rules are not modelled (seniorList and
// nonHomegrown below are the English rules and are only used for English clubs).
[['ES1', 'La Liga', 'ESP', 1, 20], ['ES2', 'Segunda División', 'ESP', 2, 22], ['IT1', 'Serie A', 'ITA', 1, 20], ['IT2', 'Serie B', 'ITA', 2, 20],
 ['DE1', 'Bundesliga', 'GER', 1, 18], ['DE2', '2. Bundesliga', 'GER', 2, 18], ['FR1', 'Ligue 1', 'FRA', 1, 18], ['FR2', 'Ligue 2', 'FRA', 2, 18]].forEach(([id, name, country, tier, teams]) => {
  LEAGUES[id] = { ...(tier === 1 ? LEAGUES.EPL : LEAGUES.ECH), id, name, country, tier, teams, matches: 2 * (teams - 1) };
});
// A career is played in one country's two divisions (G.country); every other country runs as a lightweight simulation (world-sim.js).
const COUNTRIES = {
  ENG: { id: 'ENG', name: 'England', nat: 'ENG', tiers: ['EPL', 'ECH'] },
  ESP: { id: 'ESP', name: 'Spain', nat: 'ESP', tiers: ['ES1', 'ES2'] },
  ITA: { id: 'ITA', name: 'Italy', nat: 'ITA', tiers: ['IT1', 'IT2'] },
  GER: { id: 'GER', name: 'Germany', nat: 'GER', tiers: ['DE1', 'DE2'] },
  FRA: { id: 'FRA', name: 'France', nat: 'FRA', tiers: ['FR1', 'FR2'] },
};
const playedCountry = () => COUNTRIES[G?.country || 'ENG'];
const leagueTier = id => LEAGUES[id]?.tier || 1;
const topLeague = () => G?.leagues?.[0] || 'EPL';
const secondLeague = () => G?.leagues?.[1] || 'ECH';
const leagueOf = cid => G?.clubs?.[cid]?.league || playedCountry().tiers[0];
const leagueRules = (id = leagueOf(G?.club)) => LEAGUES[id] || LEAGUES[playedCountry().tiers[0]];
const leagueName = (id = leagueOf(G?.club)) => leagueRules(id).name;
const domesticClubs = () => Object.values(G.clubs).filter(c => c.pl && !c.foreign && !c.fa).map(c => c.id);
const leagueClubs = (id = leagueOf(G.club)) => domesticClubs().filter(cid => leagueOf(cid) === id);
const overseasClubs = () => Object.values(G.clubs).filter(c => c.foreignSquad).map(c => c.id);
// Clubs whose reserves, U18s and squad size the game maintains each season: the English clubs and the overseas clubs with squads.
const academyClubs = () => domesticClubs().concat(overseasClubs());
const clubLevels = c => c?.backgroundOnly ? {} : Object.fromEntries(leagueRules(c?.league || topLeague()).levels.map(k => [k, LEVELS[k]]));
const clubSquadMax = c => c?.backgroundOnly ? 0 : leagueRules(c?.league || topLeague()).squadMax ?? Infinity;
const squadSpace = (c, p) => !!c && !c.backgroundOnly && (p?.club === c.id && c.squad.includes(p.id) || c.squad.length < clubSquadMax(c));
const squadLimitMessage = c => c?.backgroundOnly ? `${c.name} are not signing players.` : `${c.name} already have ${clubSquadMax(c)} players. Release or transfer someone before signing another player.`;
function ensureCompetitions() {
  if (!G.competitionVersion) (G.flags ||= {}).legacyLeagueSetup = true;
  // A loaded career keeps its own membership and fixtures. Do not rewrite a
  // mid-season 2025/26 world using the new 2026/27 club catalog.
  for (const c of Object.values(G.clubs)) if (c.pl && !c.league) c.league = 'EPL'; // careers made before there were divisions
  G.country ||= 'ENG';
  G.leagues ||= [...new Set(domesticClubs().map(leagueOf))];
}
function leagueFixture(f, id = leagueOf(G.club)) {
  return !f.fr && !f.playoff && (f.comp || leagueOf(f.h)) === id && leagueOf(f.a) === id;
}
function competitionLastWeek() {
  const leagueGames = G.fixtures.filter(f => !f.fr);
  return leagueGames.length ? Math.max(...leagueGames.map(f => f.w)) : SCHEDULE[37].w;
}
function leagueRulesHtml(id = leagueOf(G.club)) {
  const r = leagueRules(id), second = r.tier === 2, other = LEAGUES[playedCountry().tiers[second ? 0 : 1]];
  return `<div class="card"><h3>${r.name} rules</h3><ul class="notes"><li>${r.teams} clubs, home and away: ${r.matches} league matches per club.</li><li>Win ${r.win} points, draw ${r.draw}, defeat 0. Ranked by points, goal difference and goals scored${second ? ', then wins' : ', then head-to-head points and away goals when a decisive position is tied'}.</li><li>${r.substitutions} substitutes from ${r.bench} named substitutes; ${r.windows} substitution windows. Half-time does not use a window.</li><li>Each club uses unique shirt numbers from 1 to 99. Number changes are allowed during transfer windows.</li><li>${second ? 'Top two promoted automatically. Places 3–6 contest two-leg semifinals (3rd v 6th, 4th v 5th), then a final; no away-goals rule.' : `Bottom three relegated to the ${other.name}.`}</li>${id === 'EPL' ? '<li>Premier League clubs register up to 25 senior players for each season. Eligible Under-21 players are exempt and do not use a place.</li>' : ''}${second ? `<li>Bottom three are relegation positions. Movement to a third division is held until that division is added.</li><li>Game squad limit: ${r.squadMax} players combined across first team and reserves. No U18 squad. After relegation, the club retains 24 first-team players and 12 prospects; surplus players are released with contract compensation.</li>` : ''}</ul></div>`;
}
