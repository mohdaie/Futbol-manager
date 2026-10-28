'use strict';
// Postseason fixtures share the normal calendar, match engine and save path.
function updateCompetitionSeason() {
  if (typeof LAB_RUN !== 'undefined' && LAB_RUN) return;
  const second = secondLeague();
  if (G.leagues.length < 2) return;
  const regular = G.fixtures.filter(f => leagueFixture(f, second));
  if (!regular.length || regular.some(f => !played(f))) return;
  if (!G.playoffs) {
    // Reserve teams of top-flight clubs cannot go up: promotion places pass to the next clubs in the table.
    const table = leagueTable(second).filter(r => !G.clubs[r.id].noPromotion), last = Math.max(...regular.map(f => f.w));
    G.playoffs = { season: G.season, automatic: table.slice(0, 2).map(r => r.id), participants: table.slice(2, 6).map(r => r.id), ties: [], final: null, winner: null, last };
    const P = G.playoffs;
    [[P.participants[0], P.participants[3]], [P.participants[1], P.participants[2]]].forEach(([high, low], i) => {
      const tie = 'semi-' + i;
      const first = addPlayoffFixture(low, high, last + 1, 5, '12:30', tie, 1);
      const second = addPlayoffFixture(high, low, last + 2, 1 + i, '20:00', tie, 2); second.firstLeg = first.id;
      P.ties.push([first.id, second.id]);
    });
    addNews('league', `${leagueName(second)} promotion playoffs`, P.participants.map(clubName).join(', ') + ' compete for the final promotion place. No away goals; level second legs go to extra time and penalties.');
    if (typeof makeStory === 'function') storySimple(G.news[0], 'league', 'playoffs', { clubs: P.participants.map(hClub).join(', ') }, P.participants);
  }
  const P = G.playoffs;
  if (!P.final && P.ties.every(([, id]) => played(G.fixtures.find(f => f.id === id)))) {
    const winners = P.ties.map(([, id]) => G.fixtures.find(f => f.id === id).winner);
    if (winners.every(Boolean)) P.final = addPlayoffFixture(winners[0], winners[1], P.last + 4, 5, '15:00', 'final', 1).id;
  }
  if (P.final) { const f = G.fixtures.find(f => f.id === P.final); if (played(f)) P.winner = f.winner; }
}
function addPlayoffFixture(h, a, w, d, t, tie, leg) {
  const f = { id: G.nextId++, r: null, comp: secondLeague(), playoff: true, tie, leg, neutral: tie === 'final', h, a, w, d, t, tv: true, hg: null, ag: null };
  f.wx = genWeather(fxDate(f), t); G.fixtures.push(f); return f;
}
function applyDivisionChanges() {
  if (G.leagues.length < 2 || !G.playoffs?.winner) return null;
  const top = topLeague(), second = secondLeague();
  const relegated = leagueTable(top).slice(-leagueRules(top).relegated).map(r => r.id);
  const promoted = G.playoffs.automatic.concat(G.playoffs.winner);
  const change = { relegated, promoted, championshipBottom: leagueTable(second).slice(-3).map(r => r.id), released: [] };
  for (const id of relegated) {
    const c = G.clubs[id]; c.league = second;
    // Keep the best first-team players and prospects; no Championship U18 team.
    const all = squadOf(id), senior = all.filter(p => lvlOf(p) === 'A').sort((a, b) => b.ca - a.ca);
    const keepers = senior.filter(p => p.pos === 'GK').slice(0, 2), first = [...keepers, ...senior.filter(p => !keepers.includes(p))].slice(0, 24);
    const reserves = all.filter(p => !first.includes(p)).sort((a, b) => b.pa - a.pa || b.ca - a.ca).slice(0, 36 - first.length);
    const kept = new Set([...first, ...reserves].map(p => p.id));
    first.forEach(p => { p.lvl = 'A'; p.youth = false; }); reserves.forEach(p => { p.lvl = 'R'; p.youth = false; });
    all.filter(p => !kept.has(p.id)).forEach(p => {
      const compensation = Math.round(p.wage * 26 * Math.max(0, p.con - G.season)); c.bal -= compensation;
      if (id === G.club) { G.ledger.wages += compensation; change.released.push(fullName(p)); }
      moveClub(p, 'FA'); p.con = 0;
    });
  }
  promoted.forEach(id => { G.clubs[id].league = top; });
  return change;
}
