'use strict';
/* ===== world-sim.js =====
   Simulation-only overseas leagues. A league with `active: false` has no fixtures in G.fixtures and no match engine runs:
   - results come from a team-strength model, one round at a time, into a compact table (G.worldLeagues[id].table);
   - clubs trade players in the transfer windows, with each other, with the English clubs and with free agents;
   - their players are developed in one batch at the end of the season instead of every week;
   - each club keeps its 25-man first team and only a few prospects, instead of full reserve and U18 teams.
   Making a league playable later means setting `active: true`; the club then follows the full English structure. */

const WORLD_PROSPECTS = 3;
const isSimClub = c => !!c?.foreignSquad && G.worldLeagues?.[c.worldLeague]?.active === false;
const simClubs = () => Object.values(G.clubs).filter(isSimClub);
const simLeagueIds = () => Object.keys(G.worldLeagues || {}).filter(id => G.worldLeagues[id].active === false);

/* ---------- results and tables ---------- */
const worldRoundCache = new Map();
// Double round robin (circle method) in a fixed order, so a round can be rebuilt from the club list alone.
function worldRounds(ids) {
  const key = ids.join('|');
  if (worldRoundCache.has(key)) return worldRoundCache.get(key);
  const a = ids.slice().sort(), rounds = [];
  if (a.length % 2) a.push(null);
  const n = a.length;
  for (let r = 0; r < n - 1; r++) {
    const m = [];
    for (let i = 0; i < n / 2; i++) {
      let h = a[i], b = a[n - 1 - i];
      if ((r + i) % 2 === 1) [h, b] = [b, h];
      if (h && b) m.push([h, b]);
    }
    rounds.push(m);
    a.splice(1, 0, a.pop());
  }
  const all = rounds.concat(rounds.map(m => m.map(([h, b]) => [b, h])));
  worldRoundCache.set(key, all);
  return all;
}

// Best XI strength: the better keeper and the ten best outfielders.
function simStrength(c) {
  const squad = seniorSquad(c.id).filter(p => !p.inj);
  const gk = squad.filter(p => p.pos === 'GK').sort((a, b) => b.ca - a.ca)[0];
  const field = squad.filter(p => p.pos !== 'GK').sort((a, b) => b.ca - a.ca).slice(0, 10);
  const xi = gk ? [gk, ...field] : field;
  return xi.length ? xi.reduce((t, p) => t + p.ca, 0) / xi.length : 50;
}
function poisson(lambda) {
  const limit = Math.exp(-lambda);
  let k = 0, p = 1;
  do { k++; p *= R(); } while (p > limit);
  return k - 1;
}
function ensureWorldSeason(lg) {
  if (lg.table && lg.season === G.season) return;
  lg.season = G.season; lg.next = 0; lg.last = null;
  lg.table = Object.fromEntries(lg.clubs.map(id => [id, [0, 0, 0, 0, 0, 0, 0]])); // played, won, drawn, lost, for, against, points
}
function playWorldRound(lg, r) {
  const strength = {};
  for (const id of lg.clubs) strength[id] = simStrength(G.clubs[id]);
  const results = [];
  for (const [h, a] of worldRounds(lg.clubs)[r] || []) {
    const d = strength[h] - strength[a];
    const hg = poisson(1.42 * Math.exp(0.03 * d + 0.1)), ag = poisson(1.08 * Math.exp(-0.03 * d));
    const H = lg.table[h], A = lg.table[a];
    H[0]++; A[0]++; H[4] += hg; H[5] += ag; A[4] += ag; A[5] += hg;
    if (hg > ag) { H[1]++; A[3]++; H[6] += 3; } else if (hg < ag) { A[1]++; H[3]++; A[6] += 3; } else { H[2]++; A[2]++; H[6]++; A[6]++; }
    results.push([h, a, hg, ag]);
  }
  lg.last = { r, results };
}
// Called once a week: plays every round that has come due, however many weeks were skipped.
function simWorldWeek() {
  for (const id of simLeagueIds()) {
    const lg = G.worldLeagues[id];
    ensureWorldSeason(lg);
    const rounds = worldRounds(lg.clubs);
    while (lg.next < rounds.length && SCHEDULE[lg.next] && SCHEDULE[lg.next].w <= G.week) playWorldRound(lg, lg.next++);
  }
}
function worldTable(id) {
  const lg = G.worldLeagues[id];
  if (!lg) return [];
  // Before the first round of a season there is no table yet: every club is on zero.
  return Object.entries(lg.table && lg.season === G.season ? lg.table : Object.fromEntries(lg.clubs.map(cid => [cid, [0, 0, 0, 0, 0, 0, 0]]))).map(([cid, t]) => ({ id: cid, p: t[0], w: t[1], d: t[2], l: t[3], gf: t[4], ga: t[5], pts: t[6] }))
    .sort((x, y) => y.pts - x.pts || (y.gf - y.ga) - (x.gf - x.ga) || y.gf - x.gf || x.id.localeCompare(y.id));
}

/* ---------- season end: champions, development, finances ---------- */
function worldSimSeasonEnd() {
  const keys = TRAINING_FOCUS[0].attrs;
  for (const id of simLeagueIds()) {
    const lg = G.worldLeagues[id];
    ensureWorldSeason(lg);
    const rounds = worldRounds(lg.clubs);
    while (lg.next < rounds.length) playWorldRound(lg, lg.next++);
    const top = worldTable(id)[0];
    if (!top) continue;
    (lg.history ||= []).unshift({ season: seasonLabel(), champion: top.id, pts: top.pts });
    lg.history.length = Math.min(lg.history.length, 10);
    addNews('league', `${WORLD_LEAGUES[id].name} champions`, `${TheClub(top.id)} win the ${seasonLabel()} ${WORLD_LEAGUES[id].name} with ${top.pts} points.`);
  }
  // One batch for the whole season in place of 38 weekly training passes.
  for (const p of Object.values(G.players)) {
    const c = G.clubs[p.club];
    if (!isSimClub(c) || (p.pa <= p.ca && p.age < 30)) continue;
    const quality = c.academy && lvlOf(p) === 'R' && p.age <= 24 ? c.academy.strength : 6 + (c.rep - 60) / 4;
    for (let w = 0; w < 38; w++) develop(p, quality, keys, 1);
  }
  for (const c of simClubs()) c.bal = Math.max(c.bal, Math.round(30e6 + Math.pow(Math.max(0, c.rep - 60), 2) * 0.25e6));
}

/* ---------- prospects instead of reserve and U18 teams ---------- */
// Rollover for a simulated club: reserves who are 21 step up or leave, then the prospects are topped up.
function simYouthRollover(c) {
  const squad = seniorSquad(c.id);
  levelSquad(c.id, 'R').filter(p => p.age >= 21).forEach(p => {
    const worst = squad.length ? Math.min(...squad.map(x => x.ca)) : 0;
    if (p.ca >= worst - 2) { p.lvl = 'A'; p.wage = wageFor(p, c.rep); } else { moveClub(p, 'FA'); p.lvl = 'A'; p.con = 0; }
  });
  fillLevel(c, 'R', WORLD_PROSPECTS);
}
// One-off for careers made before this existed: keep each simulated club's best few prospects.
function ensureSimTier() {
  if (G.simTierVersion === 1 || G.overseasYouthVersion !== 1) return;
  const protectedIds = new Set([...(G.shortlist || []), ...(G.deals || []).map(d => d.pid), ...(G.pitches || []).map(x => x.pid), ...(G.scout?.reports || []).map(r => r.pid)]);
  for (const c of simClubs()) {
    const youth = c.squad.map(id => G.players[id]).filter(p => p && lvlOf(p) !== 'A' && !p.loan).sort((a, b) => b.pa - a.pa);
    youth.forEach((p, i) => {
      if (i < WORLD_PROSPECTS || protectedIds.has(p.id)) { if (lvlOf(p) === 'Y') p.lvl = 'R'; return; }
      removeFromClub(p);
      delete G.players[p.id]; delete G.know[p.id];
    });
  }
  G.simTierVersion = 1;
}

/* ---------- transfers between simulated clubs, the English clubs and free agents ---------- */
// Players a computer club could sign, by position: first team, not on loan, not yours, not injured.
function simPlayerIndex() {
  const index = {};
  for (const p of Object.values(G.players)) {
    if (lvlOf(p) !== 'A' || p.loan || p.inj || p.club === G.club) continue;
    const c = G.clubs[p.club];
    if (!c || c.backgroundOnly) continue;
    (index[p.pos] ||= []).push(p);
  }
  return index;
}
const SIM_DEAL_REST = 25; // weeks before the same player can move again
const notableSimDeal = (c, from, fee) => fee >= 20e6 || c.rep >= 85 && fee >= 8e6 || from.pl;

function simClubDeal(c, index) {
  const pk = autoPick(c.id, c.tac.ip), slots = FORMATIONS[c.tac.ip];
  let worst = -1, wv = 999;
  pk.xi.forEach((id, i) => {
    const pos = slots[i][0], v = id ? ovrAt(G.players[id], pos) : 0;
    if (v < wv && pos !== 'GK') { wv = v; worst = i; }
  });
  if (worst < 0) return null;
  const pos = slots[worst][0], now = G.season * 60 + G.week;
  const candidates = (index[pos] || []).filter(p => {
    if (p.club === c.id || p.ca <= wv + 2 || p.age > 31 || p.mv && now - p.mv < SIM_DEAL_REST) return false;
    const from = G.clubs[p.club];
    return from.fa || from.rep <= c.rep + 4 && seniorSquad(from.id).length > 19;
  });
  for (let tries = 0; tries < 5 && candidates.length; tries++) {
    const p = candidates.splice(candidates.indexOf(wpick(candidates, x => Math.pow(1.1, x.ca - 60))), 1)[0];
    const from = G.clubs[p.club];
    if (G.players[p.id] !== p || (G.deals && typeof activeDeal === 'function' && activeDeal(p.id))) continue;
    const fee = from.fa ? 0 : roundMoney(askingPrice(p) * rf(0.95, 1.1));
    if (!from.fa && fee > c.bal * 0.4) continue;
    try { moveClub(p, c.id); } catch { continue; }
    if (!from.fa) from.bal += fee;
    c.bal -= fee;
    p.wage = wageFor(p, c.rep); p.con = G.season + ri(2, 4); p.mv = now;
    G.know[p.id] ??= from.pl ? 45 : 10;
    return { p, from, fee };
  }
  return null;
}

// Once a week while a window is open. Roughly three deals per club in the summer and one or two in January.
function simTransferWeek() {
  const state = windowState();
  if (!state.open) return;
  const chance = (state.label === 'Summer window' ? 0.3 : 0.16) * (1 + windowClosingPressure());
  let index = null, headlines = 0;
  for (const c of shuffle(simClubs())) {
    if (R() > chance) continue;
    index ||= simPlayerIndex();
    const deal = simClubDeal(c, index);
    if (!deal) continue;
    const { p, from, fee } = deal;
    if (!notableSimDeal(c, from, fee)) continue;
    G.tHist.unshift({ date: today().getTime(), pid: p.id, name: fullName(p), from: from.id, to: c.id, fee });
    if (G.tHist.length > 120) G.tHist.length = 120;
    if (headlines++ < 4) addNews('transfer', `${pname(p)} joins ${c.name}`, `${TheClub(c)} sign ${fullName(p)} (${p.age}, ${POS_NAME[p.pos]})${from.fa ? ' on a free transfer' : ' from ' + theClub(from) + (fee ? ' for ' + money(fee) : '')}.`, { t: 'player', pid: p.id });
  }
}
