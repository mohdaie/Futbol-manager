'use strict';
/* ===== esl.js =====
   The Euro Super League: 32 clubs from the top divisions of England, Spain, Italy, Germany and France, in the
   classic format: eight groups of four (home and away, midweek), then two-legged knockout rounds and a
   one-match final at a neutral ground. Level ties go to extra time and penalties (no away goals, decideMatchEnd).
   - Qualification: the top six of each of the five leagues, the holders, and the best seventh-placed clubs (points
     per game) to make 32. The first season, with no table yet, goes by club reputation.
   - Prize money follows UEFA's 2026/27 Champions League distribution (circular 48/2026), per club, converted to
     pounds: starting fee, group wins and draws, each knockout round reached, the winner's bonus and a value pillar
     (UEFA's market and coefficient share, here shared by club reputation).
   - Fixtures live in G.fixtures with comp 'ESL' (cup: true; knockout ties also playoff: true for the engine's
     aggregate, extra-time and penalty handling), so league tables, card counts and season labels leave them out.
   State: G.esl (this season), G.eslNext (next season's qualifiers), G.eslHistory. */

const ESL_NAME = 'Euro Super League', ESL_LEAGUES = ['EPL', 'ES1', 'IT1', 'DE1', 'FR1'], ESL_PER_LEAGUE = 6;
const EUR_GBP = 0.85;
// UEFA Champions League 2026/27, per club (EUR). The value pillar is UEFA's €853m for 36 clubs, scaled to 32.
const ESL_PRIZE_EUR = { start: 18.62e6, win: 2.1e6, draw: 0.7e6, r16: 11e6, qf: 12.5e6, sf: 15e6, final: 18.5e6, winner: 6.5e6, value: 853e6 * 32 / 36 };
const eslPrize = k => Math.round(ESL_PRIZE_EUR[k] * EUR_GBP);
const ESL_STAGES = { group: 'Group stage', r16: 'Round of 16', qf: 'Quarter-final', sf: 'Semi-final', final: 'Final' };
// Weeks of the season (week 0 = early July): six group matchdays September-December; knockout legs February-May.
const ESL_WEEKS = { md: [10, 12, 15, 17, 20, 22], r16: [32, 35], qf: [39, 40], sf: [42, 43] };
const ESL_ROUNDS = [[0, 1, 2, 3], [2, 0, 1, 3], [0, 3, 1, 2], [1, 0, 3, 2], [0, 2, 3, 1], [3, 0, 2, 1]]; // [h, a, h, a] per matchday

const eslLeagueClubs = id => (G.leagues.includes(id) ? leagueClubs(id) : G.worldLeagues?.[id]?.clubs || []).filter(cid => G.clubs[cid] && (G.clubs[cid].squad || []).length >= 16);
const eslLeagueTable = id => (G.leagues.includes(id) ? leagueTable(id) : typeof worldTable === 'function' ? worldTable(id) : []).filter(r => eslLeagueClubs(id).includes(r.id));
const eslLeagueOf = cid => ESL_LEAGUES.find(id => eslLeagueClubs(id).includes(cid)) || null;
const isEslFx = f => f.comp === 'ESL';

// The 32: top six per league, the holders, then the best of the rest by points per game (or reputation).
function eslQualify(byRep) {
  const ranked = ESL_LEAGUES.map(id => {
    const rows = byRep ? eslLeagueClubs(id).map(cid => ({ id: cid, ppg: G.clubs[cid].rep })) : eslLeagueTable(id).map(r => ({ id: r.id, ppg: r.p ? r.pts / r.p : 0 }));
    return byRep ? rows.sort((a, b) => b.ppg - a.ppg) : rows;
  });
  const teams = ranked.flatMap(rows => rows.slice(0, ESL_PER_LEAGUE).map(r => r.id));
  const holder = G.eslHistory?.[0]?.winner;
  if (holder && !teams.includes(holder) && G.clubs[holder] && eslLeagueOf(holder)) teams.push(holder);
  for (let place = ESL_PER_LEAGUE; teams.length < 32 && place < 20; place++) {
    ranked.map(rows => rows[place]).filter(Boolean).sort((a, b) => b.ppg - a.ppg).forEach(r => { if (teams.length < 32 && !teams.includes(r.id)) teams.push(r.id); });
  }
  return teams.slice(0, 32);
}
// Four pots by reputation (the holders top), eight groups, no two clubs from one league in a group.
function eslDrawGroups(teams) {
  const holder = G.eslHistory?.[0]?.winner, order = teams.slice().sort((a, b) => (b === holder) - (a === holder) || G.clubs[b].rep - G.clubs[a].rep);
  const pots = [0, 1, 2, 3].map(k => shuffle(order.slice(k * 8, k * 8 + 8))), groups = Array.from({ length: 8 }, () => []);
  const place = (k, i) => {
    if (k === 4) return true;
    if (i === 8) return place(k + 1, 0);
    const cid = pots[k][i], lg = eslLeagueOf(cid);
    for (const g of shuffle([0, 1, 2, 3, 4, 5, 6, 7])) {
      if (groups[g].length !== k || groups[g].some(x => eslLeagueOf(x) === lg)) continue;
      groups[g].push(cid);
      if (place(k, i + 1)) return true;
      groups[g].pop();
    }
    return false;
  };
  if (!place(0, 0)) { groups.forEach(g => { g.length = 0; }); order.forEach((cid, n) => groups[n % 8].push(cid)); } // cannot happen with five leagues of six or more
  return Object.fromEntries(groups.map((g, n) => ['ABCDEFGH'[n], g]));
}
// A free midweek for every club involved: the planned week, moved on while any of them plays Monday-Thursday.
function eslFreeWeek(w, clubs, after = -1) {
  const busy = wk => G.fixtures.some(f => f.w === wk && !isEslFx(f) && (f.d ?? 5) <= 3 && (clubs.includes(f.h) || clubs.includes(f.a)));
  w = Math.max(w, after + 1);
  while (busy(w) && w < SEASON_WEEKS - 2) w++;
  return w;
}
function addEslFixture(h, a, w, d, stage, extra = {}) {
  const f = { id: G.nextId++, r: null, comp: 'ESL', cup: true, stage, playoff: stage !== 'group', h, a, w, d, t: '20:00', tv: true, hg: null, ag: null, ...extra };
  f.wx = genWeather(fxDate(f), f.t); G.fixtures.push(f); return f;
}
function eslPay(cid, k, times = 1, why) {
  const c = G.clubs[cid]; if (!c || !times) return 0;
  const amount = (typeof k === 'number' ? k : eslPrize(k)) * times;
  c.bal += amount; G.esl.prizes[cid] = (G.esl.prizes[cid] || 0) + amount;
  if (cid === G.club && !jobless()) { G.ledger.prize += amount; if (why) addLog('club', `${ESL_NAME} prize money`, `${money(amount)}: ${why}.`); }
  return amount;
}
// The season's competition: the draw, the group fixtures, the starting fee and the value pillar.
function eslStart(teams) {
  G.esl = { season: G.season, teams, groups: eslDrawGroups(teams), ties: { r16: [], qf: [], sf: [] }, final: null, winner: null, runnerUp: null, paid: {}, prizes: {}, out: {} };
  const E = G.esl;
  Object.entries(E.groups).forEach(([g, ids], n) => {
    let after = -1;
    ESL_ROUNDS.forEach((r, md) => {
      const w = eslFreeWeek(ESL_WEEKS.md[md], ids, after); after = w;
      const d = (n < 4) === (md % 2 === 0) ? 1 : 2; // half the groups on Tuesday, half on Wednesday, alternating
      addEslFixture(ids[r[0]], ids[r[1]], w, d, 'group', { group: g, md: md + 1 });
      addEslFixture(ids[r[2]], ids[r[3]], w, d, 'group', { group: g, md: md + 1 });
    });
  });
  const weight = cid => Math.pow(Math.max(1, G.clubs[cid].rep - 50), 2), total = teams.reduce((t, cid) => t + weight(cid), 0);
  teams.forEach(cid => { eslPay(cid, 'start', 1, 'starting fee'); eslPay(cid, Math.round(eslPrize('value') * weight(cid) / total), 1, 'value pillar (market and coefficient)'); });
  const mine = teams.includes(G.club) && !jobless() ? Object.entries(E.groups).find(([, ids]) => ids.includes(G.club)) : null;
  addNews('league', `${ESL_NAME} draw`, Object.entries(E.groups).map(([g, ids]) => `Group ${g}: ${ids.map(clubName).join(', ')}`).join('. ') + '.');
  if (mine) addNews('club', `${ESL_NAME}: Group ${mine[0]}`, `${theClub(G.club)} face ${mine[1].filter(x => x !== G.club).map(clubName).join(', ')}. The starting fee of ${money(eslPrize('start'))} is paid; each group win is worth ${money(eslPrize('win'))}.`);
}
// Before the first matchday: this season's draw, from last season's qualifiers (or by reputation the first time).
function ensureEsl() {
  if (G.esl && G.esl.season === G.season) return G.esl;
  if (G.week >= ESL_WEEKS.md[0]) { G.esl = { season: G.season, skipped: true, prizes: {}, ties: {}, groups: {} }; return G.esl; }
  const next = G.eslNext && G.eslNext.season === G.season ? G.eslNext.teams.filter(cid => G.clubs[cid]) : null;
  eslStart(next && next.length === 32 ? next : eslQualify(true));
  return G.esl;
}
function eslGroupTable(g) {
  const E = G.esl, T = Object.fromEntries(E.groups[g].map(id => [id, { id, p: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, pts: 0 }]));
  G.fixtures.filter(f => isEslFx(f) && f.group === g && played(f)).forEach(f => {
    const h = T[f.h], a = T[f.a]; h.p++; a.p++; h.gf += f.hg; h.ga += f.ag; a.gf += f.ag; a.ga += f.hg;
    if (f.hg > f.ag) { h.w++; a.l++; h.pts += 3; } else if (f.hg < f.ag) { a.w++; h.l++; a.pts += 3; } else { h.d++; a.d++; h.pts++; a.pts++; }
  });
  const hth = (x, y) => G.fixtures.filter(f => isEslFx(f) && f.group === g && played(f) && [f.h, f.a].includes(x) && [f.h, f.a].includes(y)).reduce((n, f) => n + (f.h === x ? f.hg - f.ag : f.ag - f.hg), 0);
  return Object.values(T).sort((a, b) => b.pts - a.pts || hth(b.id, a.id) || (b.gf - b.ga) - (a.gf - a.ga) || b.gf - a.gf || G.clubs[b.id].rep - G.clubs[a.id].rep);
}
// Two-legged ties; R16 pairs group winners with runners-up from another group and league, winners at home second.
function eslPair(stage, winners, runners) {
  const E = G.esl, pairs = [];
  if (stage === 'r16') {
    const tryPair = (i, used) => {
      if (i === winners.length) return true;
      for (const r of shuffle(runners.filter(x => !used.has(x.id)))) {
        if (r.g === winners[i].g || eslLeagueOf(r.id) === eslLeagueOf(winners[i].id)) continue;
        used.add(r.id); pairs.push([r.id, winners[i].id]);
        if (tryPair(i + 1, used)) return true;
        used.delete(r.id); pairs.pop();
      }
      return false;
    };
    if (!tryPair(0, new Set())) { pairs.length = 0; winners.forEach((w, i) => pairs.push([runners[(i + 1) % runners.length].id, w.id])); }
  } else { const s = shuffle(winners.slice()); for (let i = 0; i < s.length; i += 2) pairs.push([s[i], s[i + 1]]); }
  const w1 = eslFreeWeek(ESL_WEEKS[stage][0], pairs.flat(), G.week), w2 = eslFreeWeek(Math.max(ESL_WEEKS[stage][1], w1 + 1), pairs.flat(), w1);
  pairs.forEach(([first, second], n) => {
    const d = n % 2 ? 2 : 1, tie = `${stage}-${n}`;
    const a = addEslFixture(first, second, w1, d, stage, { tie, leg: 1 }), b = addEslFixture(second, first, w2, d, stage, { tie, leg: 2, firstLeg: a.id });
    E.ties[stage].push({ legs: [a.id, b.id], winner: null });
  });
}
const ESL_NEXT = { r16: 'qf', qf: 'sf', sf: 'final' };
// Every week: prize money for played group games, the knockout draws as rounds finish, the final and the honours.
function eslWeek() {
  const E = ensureEsl();
  if (!E || E.skipped) return;
  G.fixtures.filter(f => isEslFx(f) && f.stage === 'group' && played(f) && !E.paid[f.id]).forEach(f => {
    E.paid[f.id] = 1;
    if (f.hg === f.ag) { eslPay(f.h, 'draw', 1, 'group draw'); eslPay(f.a, 'draw', 1, 'group draw'); }
    else eslPay(f.hg > f.ag ? f.h : f.a, 'win', 1, 'group win');
  });
  const groupFx = G.fixtures.filter(f => isEslFx(f) && f.stage === 'group');
  if (!E.ties.r16.length && groupFx.length && groupFx.every(played)) {
    const tables = Object.keys(E.groups).map(g => ({ g, t: eslGroupTable(g) }));
    const winners = tables.map(x => ({ g: x.g, id: x.t[0].id })), runners = tables.map(x => ({ g: x.g, id: x.t[1].id }));
    tables.forEach(x => x.t.slice(2).forEach(r => { E.out[r.id] = 'group'; }));
    eslPair('r16', winners, runners);
    [...winners, ...runners].forEach(x => eslPay(x.id, 'r16', 1, 'reaching the round of 16'));
    addNews('league', `${ESL_NAME}: round of 16 draw`, E.ties.r16.map(t => { const f = G.fixtures.find(x => x.id === t.legs[0]); return `${clubName(f.h)} v ${clubName(f.a)}`; }).join('; ') + '.');
  }
  for (const stage of ['r16', 'qf', 'sf']) {
    const ties = E.ties[stage];
    if (!ties.length) continue;
    ties.forEach(t => { if (!t.winner) { const f = G.fixtures.find(x => x.id === t.legs[1]); if (played(f) && f.winner) { t.winner = f.winner; E.out[f.h === f.winner ? f.a : f.h] = stage; } } });
    const next = ESL_NEXT[stage];
    if (!ties.every(t => t.winner) || (next === 'final' ? E.final : E.ties[next].length)) continue;
    const through = ties.map(t => t.winner);
    through.forEach(cid => eslPay(cid, next, 1, `reaching the ${ESL_STAGES[next].toLowerCase()}`));
    if (next === 'final') {
      const lastLeague = Math.max(...G.fixtures.filter(f => !isEslFx(f) && !f.fr && !f.playoff && ESL_LEAGUES.includes(f.comp || leagueOf(f.h))).map(f => f.w), 0);
      const sfEnd = Math.max(...ties.map(t => G.fixtures.find(x => x.id === t.legs[1]).w));
      const w0 = Math.min(SEASON_WEEKS - 1, Math.max(lastLeague + 1, sfEnd + 2)), w = typeof clubsFreeWeek === 'function' ? Math.min(SEASON_WEEKS - 1, clubsFreeWeek(w0, through, true)) : w0;
      E.final = addEslFixture(through[0], through[1], w, 5, 'final', { neutral: true, t: '20:00' }).id;
      addNews('league', `${ESL_NAME} final`, `${clubName(through[0])} and ${clubName(through[1])} meet in the final on ${fmtDate(fxDate(G.fixtures.find(f => f.id === E.final)), false)}.`);
    } else {
      eslPair(next, through);
      addNews('league', `${ESL_NAME}: ${ESL_STAGES[next].toLowerCase()} draw`, E.ties[next].map(t => { const f = G.fixtures.find(x => x.id === t.legs[0]); return `${clubName(f.h)} v ${clubName(f.a)}`; }).join('; ') + '.');
    }
  }
  const fin = E.final && G.fixtures.find(f => f.id === E.final);
  if (fin && played(fin) && fin.winner && !E.winner) {
    E.winner = fin.winner; E.runnerUp = fin.h === fin.winner ? fin.a : fin.h; E.out[E.runnerUp] = 'final';
    eslPay(E.winner, 'winner', 1, `winning the ${ESL_NAME}`);
    (G.eslHistory ||= []).unshift({ season: seasonLabel(), winner: E.winner, runnerUp: E.runnerUp, score: `${fin.hg}-${fin.ag}${fin.penalties ? ` (${fin.penalties.join('-')} pens)` : ''}` });
    G.clubs[E.winner].rep = clamp(G.clubs[E.winner].rep + 1, 55, 95);
    addNews('league', `${clubName(E.winner)} win the ${ESL_NAME}`, `${clubName(fin.h)} ${fin.hg}-${fin.ag} ${clubName(fin.a)} in the final. ${clubName(E.winner)} collect ${money(E.prizes[E.winner] || 0)} in prize money this season.`);
    if (E.winner === G.club && !jobless()) {
      G.trophies.push({ season: seasonLabel(), name: `${ESL_NAME} winners` });
      if (typeof managerAddAward === 'function') managerAddAward(`${ESL_NAME} winners · ${seasonLabel()}`, 500000);
      G.board.conf = clamp(G.board.conf + 15, 0, 100);
    }
  }
}
// End of the season (before the overseas tables reset): next season's 32.
function eslSeasonEnd() {
  G.eslNext = { season: G.season + 1, teams: eslQualify(false) };
  if (G.eslNext.teams.includes(G.club) && !jobless()) addNews('club', `${ESL_NAME} qualification`, `${theClub(G.club)} will play in the ${ESL_NAME} next season.`);
}
// A club's run this season, for the screens.
function eslStatus(cid) {
  const E = G.esl;
  if (!E || E.skipped || !E.teams.includes(cid)) return null;
  if (E.winner === cid) return 'Winners';
  if (E.out[cid]) return E.out[cid] === 'group' ? 'Out in the group stage' : E.out[cid] === 'final' ? 'Runners-up' : `Out in the ${ESL_STAGES[E.out[cid]].toLowerCase()}`;
  if (E.final && G.fixtures.find(f => f.id === E.final && (f.h === cid || f.a === cid))) return 'In the final';
  for (const s of ['sf', 'qf', 'r16']) if (E.ties[s]?.some(t => t.legs.some(id => { const f = G.fixtures.find(x => x.id === id); return f.h === cid || f.a === cid; }))) return ESL_STAGES[s];
  return 'Group stage';
}
const eslFixtureLabel = f => `${ESL_NAME} · ${ESL_STAGES[f.stage]}${f.group ? ' · Group ' + f.group + ', matchday ' + f.md : f.leg ? ' · leg ' + f.leg : ''}`;
