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
    c.foreignSquad = { catalogId, seeded: true, maxPlayers: legacyAuthored ? Math.max(17, c.squad.length + Math.max(0, 6 - existingReserves)) : 17 };
    c.academy = { strength: data.academy, noAnnualIntake: true, basis: data.basis, estimate: true };
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

// Reserve development is continuous training. Vacancies are filled from players
// already in the career's free-agent market; this never generates a youth intake.
function maintainForeignSquads() {
  const free = squadOf('FA').filter(p => !p.inj).sort((a, b) => b.ca - a.ca);
  for (const c of Object.values(G.clubs).filter(c => c.foreignSquad)) {
    while (seniorSquad(c.id).length < 11) {
      const needKeeper = !seniorSquad(c.id).some(p => p.pos === 'GK');
      const p = levelSquad(c.id, 'R').filter(p => !needKeeper || p.pos === 'GK').sort((a, b) => b.ca - a.ca)[0];
      if (!p) break;
      p.lvl = 'A'; p.wage = Math.max(p.wage, wageFor(p, c.rep));
    }
    while (c.squad.length < Math.min(17, clubSquadMax(c))) {
      const squad = squadOf(c.id), keepers = squad.filter(p => p.pos === 'GK').length;
      const reserve = seniorSquad(c.id).length >= 11;
      const needed = FORMATIONS[c.tac.ip].map(s => s[0]);
      for (const p of seniorSquad(c.id)) { const at = needed.indexOf(p.pos); if (at >= 0) needed.splice(at, 1); }
      const wanted = keepers < (reserve ? 2 : 1) ? 'GK' : needed[0];
      let index = free.findIndex(p => (!wanted || p.pos === wanted) && (!reserve || p.age <= 24));
      if (index < 0) index = free.findIndex(p => (!wanted || wanted !== 'GK' || p.pos === 'GK') && (!reserve || p.age <= 24));
      if (index < 0) break;
      const p = free.splice(index, 1)[0];
      moveClub(p, c.id); p.lvl = reserve ? 'R' : 'A'; p.con = G.season + 2;
      p.wage = wageFor(p, c.rep) * (reserve ? 0.5 : 1);
    }
  }
}
