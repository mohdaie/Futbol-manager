'use strict';
// An inactive league can have a few real squads without gaining a calendar,
// daily AI simulation, a management job or an annual youth-intake programme.
const worldIdentityKey = name => String(name || '').normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]/g, '');

function ensureForeignSquads({ newCareer = false } = {}) {
  if (G.foreignSquadVersion === 1) return;
  const people = new Set(), sourceIds = new Set();
  for (const p of Object.values(G.players)) {
    if (p.insp) people.add(worldIdentityKey(p.insp));
    if (p.identity?.id) sourceIds.add(p.identity.id);
  }
  for (const [catalogId, data] of Object.entries(WORLD_SQUAD_DATA)) {
    const entry = WORLD_CLUBS.find(c => c.id === catalogId);
    const c = worldLeagueClubs(entry.league).find(c => c.id === catalogId || entry.existingRoster &&
      (c.ros === entry.existingRoster || !c.ros && c.name === entry.name));
    if (!c || c.foreignSquad?.seeded) continue;
    // Never rebuild an existing authored first team: departed identities may
    // have retired or moved to another club before this migration was installed.
    const legacyAuthored = !newCareer && !!entry.existingRoster;
    const existingReserves = levelSquad(c.id, 'R').length;
    c.backgroundOnly = false;
    delete c.dummySquad;
    c.foreignSquad = { catalogId, seeded: true };
    c.academy = { strength: data.academy, basis: data.basis, estimate: true };
    if (!legacyAuthored) { c.rep = data.rep; c.bal = Math.max(c.bal || 0, 50e6); c.tac = aiTactic(c.rep); c.tac.ip = data.shape; c.tac.oop = data.shape; }
    const targets = legacyAuthored ? [['R', 6]] : [['A', 11], ['R', 6]];
    for (const [level, target] of targets) {
      const rows = data.rows.filter(row => row[10] === level);
      for (let slot = levelSquad(c.id, level).length; slot < target && squadSpace(c); slot++) {
        const row = rows[slot];
        const elapsed = Math.max(0, G.season - START_SEASON);
        const age = row ? row[2] + elapsed : 18;
        const duplicate = row && (people.has(worldIdentityKey(row[5])) && !!row[5] || sourceIds.has(row[9]));
        const current = row && !duplicate && (elapsed === 0 || age < 38) && (level !== 'R' || age <= 24);
        let identity;
        if (current) { identity = row.slice(); identity[2] = age; }
        else {
          // Missing or already-owned identities get an openly fictional slot,
          // rather than copying a sold player or inventing a real-life prospect.
          const pos = row?.[1] || (level === 'R' && slot === 0 ? 'GK' : SQUAD_TEMPLATE[slot]);
          const seedRow = ['', pos, level === 'R' ? 18 : 25, c.nat, 'R', '', '', '', 'GENERATED', `world:${catalogId}:${level}:${slot}`];
          const names = matchRandom({ rng: seedRow[9].split('').reduce((h, x) => Math.imul(h ^ x.charCodeAt(0), 16777619) >>> 0, 2166136261) }, () => genName(c.nat));
          seedRow[0] = names.join(' '); identity = seedRow;
        }
        const p = playerFromEnglandIdentity(identity, c.id, { level, academy: c.academy.strength });
        p.con = G.season + 2;
        p.identity.sourceClub = current ? row[11] || null : null;
        addToClub(p, c); G.know[p.id] = 10;
        if (p.insp) people.add(worldIdentityKey(p.insp));
        sourceIds.add(p.identity.id);
      }
    }
  }
  for (const league of Object.values(G.worldLeagues)) { league.mode = 'clubs-and-squads'; league.active = false; }
  G.foreignSquadVersion = 1;
}

// Overseas clubs keep the English structure: first team, reserves and U18s, a yearly top-up of both youth levels (rollover),
// and generated depth players when a first team runs short (weeklyTransfers). Only the emergency call-up is kept here.
function maintainForeignSquads() {
  for (const c of Object.values(G.clubs).filter(c => c.foreignSquad)) {
    while (seniorSquad(c.id).length < 11) {
      const needKeeper = !seniorSquad(c.id).some(p => p.pos === 'GK');
      const p = levelSquad(c.id, 'R').filter(p => !needKeeper || p.pos === 'GK').sort((a, b) => b.ca - a.ca)[0];
      if (!p) break;
      p.lvl = 'A'; p.wage = Math.max(p.wage, wageFor(p, c.rep));
    }
  }
}

// Full 25-man overseas squads (OVERSEAS_FULL_SQUADS, world-full-squads-data.js). The 20 selected clubs gain their remaining
// first-team slots; the other 56 clubs stop being placeholders and receive real, scoutable players. Source identities are stable
// ('ov26:club:slot'), so a repeated load never re-adds a player who was sold, retired or released.
const OVERSEAS_FULL_SQUAD_SIZE = 25;
const OVERSEAS_SHAPES = ['4-3-3', '4-2-3-1', '4-4-2', '3-5-2'];

function playerFromOverseasRow(row, c, id, elapsed) {
  const [name, pos, age, nat, foot, ca, pa, ht, wt, alt, attrs, inspiration] = row;
  const at = Array.from(attrs, ch => parseInt(ch, 36));
  let seed = 2166136261;
  for (const ch of id) seed = Math.imul(seed ^ ch.charCodeAt(0), 16777619) >>> 0;
  // A local seed stops a new career rerolling a sourced player's personality, bio and starting condition.
  const p = matchRandom({ rng: seed }, () => genPlayer({ pos, age: age + elapsed, nat, club: c.id, lvl: 'A', ca, pa,
    profile: { at, alt: alt ? alt.split('/') : [], ht, wt, pa }, profileKey: id }));
  p.originProfile = { kind: 'generated-identity', key: id, at: p.at.slice(), ca: p.ca, pa: p.pa, ht: p.ht, wt: p.wt, alt: p.alt.slice() };
  const parts = name.split(' ');
  p.fn = parts.length > 1 ? parts.shift() : '';
  p.ln = parts.join(' ');
  p.foot = foot === 'L' ? 'Left' : foot === 'B' ? 'Either' : 'Right';
  if (inspiration) p.insp = inspiration;
  p.identity = { source: 'OVERSEAS2026', id, dob: null, rosterDate: null };
  p.con = G.season + 2; // Game contract, not a claim about a real contract.
  return p;
}

function ensureOverseasFullSquads() {
  if (G.overseasSquadVersion === 1 || typeof OVERSEAS_FULL_SQUADS === 'undefined') return;
  // The compact squads come first. If any selected club is still unseeded, wait for the next load.
  if (Object.keys(WORLD_SQUAD_DATA).some(id => !G.clubs[id]?.foreignSquad && !Object.values(G.clubs).some(c => c.foreignSquad?.catalogId === id))) return;
  const owned = new Set(), people = new Set();
  for (const p of Object.values(G.players)) {
    if (p.identity?.id) owned.add(p.identity.id);
    if (p.insp) people.add(worldIdentityKey(p.insp));
  }
  const elapsed = Math.max(0, G.season - START_SEASON);
  for (const [catalogId, data] of Object.entries(OVERSEAS_FULL_SQUADS)) {
    const entry = WORLD_CLUBS.find(e => e.id === catalogId);
    const c = entry && worldLeagueClubs(entry.league).find(c => c.id === catalogId || entry.existingRoster &&
      (c.ros === entry.existingRoster || !c.ros && c.name === entry.name));
    if (!c) continue;
    if (c.backgroundOnly) {
      // A placeholder becomes a real club that can play friendlies and trade players, like the 20 selected clubs.
      materializeClub(c, catalogId, data.rep);
    }
    if (!c.foreignSquad) continue;
    const need = Math.max(0, OVERSEAS_FULL_SQUAD_SIZE - seniorSquad(c.id).length);
    let added = 0;
    for (let i = 0; i < data.rows.length && added < need; i++) {
      const row = data.rows[i], id = `ov26:${catalogId}:${i}`;
      if (owned.has(id) || row[2] + elapsed >= 38 || row[11] && people.has(worldIdentityKey(row[11]))) continue;
      const p = playerFromOverseasRow(row, c, id, elapsed);
      addToClub(p, c);
      if (row[12] && !c.squad.some(x => x !== p.id && G.players[x]?.no === row[12])) p.no = row[12];
      G.know[p.id] = 10;
      owned.add(id); added++;
      if (p.insp) people.add(worldIdentityKey(p.insp));
    }
  }
  G.overseasSquadVersion = 1;
}

// Reserves and U18s for every overseas club, as at the English clubs: 20 of each. Older saves lose the compact-squad limits
// (no annual intake, a 17/25/31-player cap) once, and the clubs then follow the same yearly rollover as the English clubs.
const OVERSEAS_YOUTH_TARGET = 20;
function ensureOverseasYouth() {
  if (G.overseasYouthVersion === 1 || G.overseasSquadVersion !== 1) return;
  const first = G.nextId;
  for (const c of Object.values(G.clubs).filter(c => c.foreignSquad)) {
    if (c.academy) delete c.academy.noAnnualIntake;
    delete c.foreignSquad.maxPlayers; delete c.foreignSquad.full;
    // Simulation-only leagues keep a few prospects; a playable league gets the full English-sized youth teams.
    if (typeof isSimClub === 'function' && isSimClub(c)) { fillLevel(c, 'R', typeof WORLD_PROSPECTS === 'number' ? WORLD_PROSPECTS : 3); continue; }
    fillLevel(c, 'R', OVERSEAS_YOUTH_TARGET);
    fillLevel(c, 'Y', OVERSEAS_YOUTH_TARGET);
  }
  for (const p of Object.values(G.players)) if (p.id >= first) G.know[p.id] = 10;
  G.overseasYouthVersion = 1;
}

/* ---------- clubs that gain or lose their players ---------- */
// A placeholder club (no players, a strength rating) becomes a club with a squad record: friendlies, trades and scouting.
function materializeClub(c, catalogId, rep = c.rep) {
  const shape = OVERSEAS_SHAPES[Math.floor(hash01(catalogId + ':shape') * OVERSEAS_SHAPES.length)];
  c.backgroundOnly = false; delete c.dummySquad; delete c.lw;
  c.rep = rep; c.bal = Math.max(c.bal || 0, Math.round(20e6 + Math.pow(Math.max(0, rep - 50), 2) * 0.1e6));
  c.tac = aiTactic(c.rep); c.tac.ip = shape; c.tac.oop = shape;
  c.academy = { strength: clamp(Math.round(4 + (rep - 55) * 0.4 + hash01(catalogId + ':academy') * 4), 3, 14),
    basis: 'Strength estimated from club reputation; this is not an official academy ranking.', estimate: true };
  c.foreignSquad = { catalogId, seeded: true };
}

// Fictional names for generated players: country pools (world-names.js), never a name already in the career.
let worldNamesUsed = null;
function worldNameSet() {
  if (!worldNamesUsed || worldNamesUsed.size < Object.keys(G.players).length * 0.5) worldNamesUsed = new Set(Object.values(G.players).map(fullName));
  return worldNamesUsed;
}
function genWorldName(nat) {
  const used = worldNameSet(), pool = WORLD_NAME_POOLS[nat] || WORLD_NAME_POOLS.ENG;
  for (let attempt = 0; attempt < 60; attempt++) {
    const first = pick(pool[0]);
    let last = pick(pool[1]);
    if (attempt > 20) last += WORLD_DOUBLE_SURNAME.has(nat) ? ' ' + pick(pool[1]) : '-' + pick(pool[1]);
    const name = first + ' ' + last;
    if (!used.has(name)) { used.add(name); return [first, last]; }
  }
  return [pick(pool[0]), pick(pool[1])];
}
const setWorldName = (p, nat = p.nat) => { const [first, last] = genWorldName(nat); p.fn = first; p.ln = last; };

// A generated first team for a club. The English divisions use their usual scale of ability; overseas clubs use the band
// of their reputation (as in the squad tables: floor = 66 + 0.65 x (reputation - 80), ten points wide).
function generateClubSquad(c, size = 25) {
  const english = c.nat === 'ENG', lo = 66 + 0.65 * (c.rep - 80), hi = lo + 9, top = 60 + (c.rep - 50) * 0.6;
  // Only the positions the club still lacks (all of them for a new club).
  const missing = SQUAD_TEMPLATE.slice(0, size), have = seniorSquad(c.id);
  have.forEach(p => { const i = missing.indexOf(p.pos); if (i >= 0) missing.splice(i, 1); });
  missing.forEach((pos, k) => {
    const n = have.length + k, starter = n < 11, youngster = n >= size - 3;
    const age = youngster ? ri(17, 21) : clamp(Math.round(gauss() * (starter ? 3.3 : 3.9) + (starter ? 28.4 : 26.6)), starter ? 21 : 19, 36);
    let ca = english ? (starter ? top + gauss() * 2.6 : top - 5 + gauss() * 3) : (starter ? hi - Math.abs(gauss() * 2.6) : lo + Math.abs(gauss() * 3.4));
    if (youngster) ca = (english ? top - 14 : lo) + rf(0, 3);
    ca = clamp(ca, 38, 90);
    const pa = ca + (age <= 19 ? rf(9, 16) : age <= 21 ? rf(5, 12) : age <= 24 ? rf(2, 7) : age <= 28 ? rf(0, 3) : 0);
    const p = genPlayer({ pos, ca, pa, age, nat: english && R() < 0.72 ? 'ENG' : youthNat(c), club: c.id, lvl: 'A' });
    setWorldName(p);
    addToClub(p, c);
    p.con = G.season + ri(1, 4);
  });
}
// Fill a club's first team: its sourced English identities if it is an English club and they are still unowned, then generated players.
function fillClubSquad(c, size) {
  if (c.nat === 'ENG' && ENGLAND_ROSTERS_2026[c.id]) {
    const owned = new Set(Object.values(G.players).map(p => p.identity?.id).filter(Boolean));
    const people = new Set(Object.values(G.players).filter(p => p.insp).map(p => worldIdentityKey(p.insp)));
    ENGLAND_ROSTERS_2026[c.id].filter(row => !owned.has(row[9]) && !people.has(worldIdentityKey(row[5]))).slice(0, size).forEach(row => {
      const p = playerFromEnglandIdentity(row, c.id); p.age += Math.max(0, G.season - START_SEASON); p.con = G.season + 2; addToClub(p, c);
    });
  }
  if (seniorSquad(c.id).length < size) generateClubSquad(c, size);
}
// A club with players becomes a placeholder again: the players are released and the club keeps a strength rating.
function dissolveClub(c) {
  const squad = squadOf(c.id), top = squad.filter(p => lvlOf(p) === 'A').sort((a, b) => b.ca - a.ca).slice(0, 11);
  const strength = top.length ? top.reduce((t, p) => t + p.ca, 0) / top.length : lightStrength(c.rep);
  for (const p of squad) {
    if (p.loan) delete p.loan; // a loanee becomes permanent rather than returning to a club with no squad
    moveClub(p, 'FA'); p.con = 0; p.lvl = 'A'; p.wage = 0; p.listed = false;
  }
  c.squad = []; c.backgroundOnly = true; c.dummySquad = { size: 25, transferable: false };
  c.lw = Math.round(strength * 10) / 10;
  delete c.foreignSquad; delete c.academy;
}
