'use strict';
/* ===== cups.js =====
   Domestic cups for the country the career is played in: the National Cup (every country) and, in England, the
   League Cup. Single-match knockout ties with extra time and penalties (decideMatchEnd); the League Cup semi-finals
   are two legs. Every club in the played divisions enters. So that the draw proper is exactly 32 clubs, the lowest
   ranked clubs (second division, by reputation) first play a first round; the rest join in the round of 32.
   - National Cup: Saturdays on the calendar's cup weekends (CUP_WEEKS, January-April), semi-finals and the final
     (mid-May) at a neutral ground. Prize money from the FA's 2026/27 FA Cup prize fund, by the number of clubs
     left in the round (the round of 64 amounts for the first round).
   - League Cup (England): midweek rounds from August, two-legged semi-finals in January/February and a Sunday
     final in March at a neutral ground. Prize money as the EFL pays it: semi-finals onwards only.
   - A tie is played in the planned week, or the next one in which neither club has a match on those days.
   Fixtures: comp = the cup id, cup: true, playoff: true (knockout handling); single-leg ties also single: true.
   State: G.cups (this season, per cup), G.cupHistory. */

const CUP_DEFS = {
  // The weekends the 2026/27 Premier League leaves free (weeks 26, 31, 34, 37) carry the January-March rounds.
  NC: { id: 'NC', name: 'National Cup', short: 'Cup', weekend: true, weeks: { p: 26, 32: 31, 16: 34, 8: 37, 4: 42, 2: 45 }, neutral: [4, 2],
    prize: { p: [121500, 26500], 32: [127000, 0], 16: [238500, 0], 8: [477000, 0], 4: [1060000, 530000], 2: [2120000, 1060000] }, award: 150000, board: 8 },
  LC: { id: 'LC', name: 'League Cup', short: 'LC', weekend: false, weeks: { p: 5, 32: 11, 16: 18, 8: 24, 4: [28, 31], 2: 36 }, neutral: [2], twoLegs: [4], finalDay: 6, england: true,
    prize: { 4: [0, 25000], 2: [100000, 50000] }, award: 75000, board: 5 },
};
const CUP_ROUND_NAMES = { p: 'First round', 32: 'Round of 32', 16: 'Round of 16', 8: 'Quarter-finals', 4: 'Semi-finals', 2: 'Final' };
const CUP_ORDER = ['p', 32, 16, 8, 4, 2];
const cupsPlayed = () => Object.values(CUP_DEFS).filter(d => !d.england || G.leagues.includes('EPL')).map(d => d.id);
const isCupFx = f => !!(f.cup && CUP_DEFS[f.comp]);

// A week in which none of these clubs plays on those days (Friday-Sunday for a weekend tie, Monday-Thursday midweek).
function clubsFreeWeek(w, clubs, weekend, after = -1) {
  const lo = weekend ? 4 : 0, hi = weekend ? 6 : 3;
  const busy = wk => G.fixtures.some(f => f.w === wk && (f.d ?? 5) >= lo && (f.d ?? 5) <= hi && (clubs.includes(f.h) || clubs.includes(f.a)));
  w = Math.max(w, after + 1);
  while (busy(w) && w < SEASON_WEEKS - 1) w++;
  return w;
}
// A one-match tie: the Saturday if both clubs are free that weekend (National Cup), otherwise Tuesday or Wednesday
// of the same week, otherwise the next week. Midweek cups only look at midweeks; finals only at weekends.
function cupSlot(def, stage, clubs, target, after, midweekDay) {
  if (stage === 2) return { w: Math.min(SEASON_WEEKS - 1, clubsFreeWeek(target, clubs, true, after)), d: def.finalDay ?? 5 };
  if (!def.weekend) return { w: clubsFreeWeek(target, clubs, false, after), d: midweekDay };
  for (let w = Math.max(target, after + 1); w < SEASON_WEEKS - 1; w++) {
    if (clubsFreeWeek(w, clubs, true) === w) return { w, d: 5 };
    if (clubsFreeWeek(w, clubs, false) === w) return { w, d: midweekDay };
  }
  return { w: SEASON_WEEKS - 2, d: midweekDay };
}
function cupEntrants() {
  return G.leagues.flatMap(id => leagueClubs(id).filter(cid => (G.clubs[cid].squad || []).length >= 16).sort((a, b) => G.clubs[b].rep - G.clubs[a].rep));
}
function addCupFixture(def, h, a, w, stage, { d = 1, ...extra } = {}) {
  const f = { id: G.nextId++, r: null, comp: def.id, cup: true, stage, playoff: true, single: !extra.leg, h, a, w, d, t: stage === 2 ? (d === 6 ? '16:30' : '17:30') : d >= 4 ? '15:00' : '19:45',
    tv: true, neutral: def.neutral.includes(stage), hg: null, ag: null, ...extra };
  f.wx = genWeather(fxDate(f), f.t); G.fixtures.push(f); return f;
}
// Draw a round: pair the clubs at random, the first drawn at home; schedule each tie in its own free week.
function cupDraw(def, stage, clubs) {
  const C = G.cups[def.id], s = shuffle(clubs.slice()), ties = [];
  const prev = C.rounds[CUP_ORDER[CUP_ORDER.indexOf(stage) - 1]], after = prev ? Math.max(...prev.flatMap(t => t.legs.map(id => G.fixtures.find(f => f.id === id).w))) : G.week - 1;
  const plan = def.weeks[stage], two = (def.twoLegs || []).includes(stage);
  for (let i = 0; i < s.length; i += 2) {
    const [h, a] = [s[i], s[i + 1]], n = i / 2;
    if (two) {
      const w1 = clubsFreeWeek(plan[0], [h, a], false, after), w2 = clubsFreeWeek(Math.max(plan[1], w1 + 1), [h, a], false, w1);
      const one = addCupFixture(def, h, a, w1, stage, { leg: 1, d: n % 2 ? 2 : 1 }), second = addCupFixture(def, a, h, w2, stage, { leg: 2, firstLeg: one.id, d: n % 2 ? 2 : 1 });
      ties.push({ legs: [one.id, second.id], winner: null });
    } else {
      const slot = cupSlot(def, stage, [h, a], Array.isArray(plan) ? plan[0] : plan, after, n % 2 ? 2 : 1);
      ties.push({ legs: [addCupFixture(def, h, a, slot.w, stage, { d: slot.d }).id], winner: null });
    }
  }
  C.rounds[stage] = ties;
  const mine = ties.find(t => { const f = G.fixtures.find(x => x.id === t.legs[0]); return [f.h, f.a].includes(G.club); });
  const first = id => G.fixtures.find(f => f.id === id);
  addNews('league', `${def.name}: ${CUP_ROUND_NAMES[stage].toLowerCase()} draw`, ties.map(t => `${clubName(first(t.legs[0]).h)} v ${clubName(first(t.legs[0]).a)}`).join('; ') + '.');
  if (mine && !jobless()) { const f = first(mine.legs[0]); addNews('club', `${def.name} draw`, `${CUP_ROUND_NAMES[stage]}: ${clubName(f.h)} v ${clubName(f.a)}, ${fmtDate(fxDate(f), false)}${f.neutral ? ' at a neutral ground' : ''}.`); }
}
function cupPay(def, cid, amount, why) {
  if (!amount || !G.clubs[cid]) return;
  const C = G.cups[def.id];
  G.clubs[cid].bal += amount; C.prizes[cid] = (C.prizes[cid] || 0) + amount;
  if (cid === G.club && !jobless()) { G.ledger.prize += amount; addLog('club', `${def.name} prize money`, `${money(amount)}: ${why}.`); }
}
// The season's cups, drawn before their first round (a cup whose first round has passed waits for next season).
function ensureCups() {
  const ids = cupsPlayed();
  if (G.cups && G.cups.season === G.season && ids.every(id => G.cups[id])) return G.cups;
  if (!G.cups || G.cups.season !== G.season) G.cups = { season: G.season };
  for (const id of ids) {
    if (G.cups[id]) continue;
    const def = CUP_DEFS[id], entrants = cupEntrants(), size = entrants.length >= 32 ? 32 : 16;
    if (G.week >= (Array.isArray(def.weeks.p) ? def.weeks.p[0] : def.weeks.p) || entrants.length < size) { G.cups[id] = { skipped: true, rounds: {}, prizes: {}, out: {} }; continue; }
    const extra = entrants.length - size, prelim = entrants.slice(entrants.length - extra * 2);
    G.cups[id] = { entrants, byes: entrants.slice(0, entrants.length - extra * 2), rounds: {}, prizes: {}, out: {}, winner: null, runnerUp: null, size };
    if (extra) cupDraw(def, 'p', prelim);
    else cupDraw(def, size, entrants);
  }
  return G.cups;
}
// Every week: ties decided (prize money), the next round drawn when a round is complete, the final and its honours.
function cupsWeek() {
  ensureCups();
  for (const id of cupsPlayed()) {
    const def = CUP_DEFS[id], C = G.cups[id];
    if (!C || C.skipped || C.winner) continue;
    for (const stage of CUP_ORDER) {
      const ties = C.rounds[stage];
      if (!ties) continue;
      ties.forEach(t => {
        if (t.winner) return;
        const last = G.fixtures.find(f => f.id === t.legs.at(-1));
        if (!played(last) || !last.winner) return;
        t.winner = last.winner;
        const loser = last.h === t.winner ? last.a : last.h, [won, lost] = def.prize[stage] || [0, 0];
        C.out[loser] = stage;
        cupPay(def, t.winner, won, stage === 2 ? `winning the ${def.name}` : `winning a ${CUP_ROUND_NAMES[stage].toLowerCase()} tie`);
        cupPay(def, loser, lost, stage === 2 ? `${def.name} runners-up` : `${CUP_ROUND_NAMES[stage].toLowerCase()}`);
        if (stage === 2) cupWon(def, t.winner, loser, last);
      });
      const next = stage === 'p' ? C.size : CUP_ORDER[CUP_ORDER.indexOf(stage) + 1];
      if (stage === 2 || !ties.every(t => t.winner) || C.rounds[next]) continue;
      const through = ties.map(t => t.winner).concat(stage === 'p' ? C.byes : []);
      if (stage === 'p' && through.length !== C.size) continue;
      cupDraw(def, next, through);
    }
  }
}
function cupWon(def, winner, runnerUp, fin) {
  const C = G.cups[def.id];
  Object.assign(C, { winner, runnerUp });
  ((G.cupHistory ||= {})[def.id] ||= []).unshift({ season: seasonLabel(), winner, runnerUp, score: `${fin.hg}-${fin.ag}${fin.penalties ? ` (${fin.penalties.join('-')} pens)` : ''}` });
  G.clubs[winner].rep = clamp(G.clubs[winner].rep + 0.5, 55, 95);
  addNews('league', `${clubName(winner)} win the ${def.name}`, `${clubName(fin.h)} ${fin.hg}-${fin.ag} ${clubName(fin.a)}${fin.penalties ? ` (${fin.penalties.join('-')} on penalties)` : ''} in the final.`);
  if (winner === G.club && !jobless()) {
    G.trophies.push({ season: seasonLabel(), name: `${def.name} winners` });
    if (typeof managerAddAward === 'function') managerAddAward(`${def.name} winners · ${seasonLabel()}`, def.award);
    G.board.conf = clamp(G.board.conf + def.board, 0, 100);
  }
}
const cupFixtureLabel = f => `${CUP_DEFS[f.comp].name} · ${CUP_ROUND_NAMES[f.stage]}${f.leg ? ' · leg ' + f.leg : ''}`;
function cupStatus(id, cid) {
  const C = G.cups?.[id];
  if (!C || C.skipped || !C.entrants?.includes(cid)) return null;
  if (C.winner === cid) return 'Winners';
  if (C.out[cid] != null) return C.out[cid] === 2 ? 'Runners-up' : `Out in the ${CUP_ROUND_NAMES[C.out[cid]].toLowerCase()}`;
  const stage = [...CUP_ORDER].reverse().find(s => C.rounds[s]?.some(t => t.legs.some(fid => { const f = G.fixtures.find(x => x.id === fid); return f.h === cid || f.a === cid; })));
  return stage != null ? CUP_ROUND_NAMES[stage] : C.byes?.includes(cid) ? 'Enters in the round of 32' : 'Entered';
}
