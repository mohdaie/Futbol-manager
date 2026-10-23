'use strict';
/* Manager identities, employment history, personal earnings and the managerial job market. */
const MANAGER_INFLUENCES = [
  { name: 'Pep Guardiola', style: 'tiki', note: 'positional play, patient possession and flexible rotations' },
  { name: 'Jürgen Klopp', style: 'gegen', note: 'high energy, coordinated pressing and fast transitions' },
  { name: 'Carlo Ancelotti', style: 'bal', note: 'calm man-management and adaptable match plans' },
  { name: 'José Mourinho', style: 'counter', note: 'compact defending, game management and quick counters' },
  { name: 'Marcelo Bielsa', style: 'gegen', note: 'intense preparation, brave pressing and relentless running' },
  { name: 'Arsène Wenger', style: 'tiki', note: 'technical development, fluid attacking football and long-term planning' },
  { name: 'Sir Alex Ferguson', style: 'bal', note: 'competitive standards, resilience and decisive substitutions' },
  { name: 'Helenio Herrera', style: 'counter', note: 'defensive organisation and rapid counter-attacks' },
  { name: 'Arrigo Sacchi', style: 'gegen', note: 'compact lines, collective pressing and rehearsed movement' },
  { name: 'Johan Cruyff', style: 'tiki', note: 'positional freedom, technical courage and attacking width' },
  { name: 'Brian Clough', style: 'long', note: 'direct leadership, clear roles and confidence in players' },
  { name: 'Claudio Ranieri', style: 'counter', note: 'pragmatic preparation and a strong collective spirit' },
];
const MANAGER_STYLES = { tiki: 'Possession and positional play', gegen: 'High press and fast transitions', counter: 'Compact shape and counter-attacks', long: 'Direct play and second balls', bal: 'Balanced, adaptable football' };
const MANAGER_INCOME_NAMES = { salary: 'Club salary', win: 'Match bonus', owner: 'Owner bonus', sponsor: 'Sponsorship and endorsements', award: 'Award bonus', signing: 'Signing bonus' };

function managerSalaryFor(c) {
  if (!c) return 0;
  const rep = Math.max(45, +c.rep || 55), league = c.league || (c.pl ? leagueOf(c.id) : '');
  const factor = league === 'EPL' ? 1.1 : league === 'ECH' ? 0.42 : c.backgroundOnly ? 0.22 : 0.32;
  return roundWage((1500 + rep * rep * 8) * factor);
}
function managerCountry(c) {
  if (c.nat && NATIONS[c.nat]) return c.nat;
  return c.league === 'EPL' || c.league === 'ECH' ? 'ENG' : 'ENG';
}
function managerInfluence(id, style) {
  const pool = MANAGER_INFLUENCES.filter(x => x.style === style);
  const list = pool.length ? pool : MANAGER_INFLUENCES;
  return list[Math.floor(hash01(id + ':influence') * list.length)];
}
function managerDateLabel(season = G.season, week = G.week) { return `${seasonLabel(season)} · week ${week + 1}`; }
function newManagerProfile(name, cid, isUser = false) {
  const c = G.clubs[cid], id = `MGR${G.nextManagerId++}`, nat = managerCountry(c), style = c.tac?.style || 'bal', mentor = managerInfluence(id, style);
  const profile = {
    id, name: name || genManagerName(), nationality: nat, age: 34 + Math.floor(hash01(id + ':age') * 27),
    born: 'Career-generated profile', style, styleName: MANAGER_STYLES[style] || MANAGER_STYLES.bal,
    inspiration: mentor.name, inspirationNote: mentor.note, reputation: Math.round(c?.rep || 55), birthSeason: G.season,
    weeklySalary: managerSalaryFor(c), contractYears: 2 + Math.floor(hash01(id + ':contract') * 3),
    bank: 0, totals: {}, transactions: [], history: [], awards: [], currentClubId: cid, isUser: !!isUser,
  };
  profile.history.push({ club: cid, name: c?.name || 'Without a club', league: c?.league || '', joined: managerDateLabel(), salary: profile.weeklySalary, left: null, reason: 'Appointed' });
  G.managerProfiles[id] = profile;
  if (c) c.managerId = id;
  return profile;
}
function ensureManagerProfiles() {
  G.managerProfiles ||= {}; G.managerJobs ||= []; G.nextManagerId ||= 1;
  for (const c of Object.values(G.clubs || {})) {
    if (c.fa || c.id === G.club) continue;
    c.mgr ||= genManagerName();
    let p = c.managerId && G.managerProfiles[c.managerId];
    if (!p || p.name !== c.mgr) p = newManagerProfile(c.mgr, c.id, false);
    else { p.currentClubId = c.id; p.weeklySalary = managerSalaryFor(c); }
    p.isUser = false;
  }
  let user = G.managerProfileId && G.managerProfiles[G.managerProfileId];
  if (!user) user = newManagerProfile(G.manager, G.club, true);
  user.name = G.manager; user.isUser = true; user.currentClubId = G.club;
  const c = G.clubs[G.club];
  if (c) { c.mgr = G.manager; c.managerId = user.id; user.weeklySalary = managerSalaryFor(c); user.reputation = Math.max(user.reputation || 0, Math.round(c.rep)); }
  G.managerProfileId = user.id;
  Object.values(G.managerProfiles).forEach(p => {
    p.bank ||= 0; p.totals ||= {}; p.transactions ||= []; p.history ||= []; p.awards ||= [];
  });
  return user;
}
function userManagerProfile() { return ensureManagerProfiles(); }
function managerRecordIncome(profile, kind, amount, detail, external = false) {
  if (!profile || !(amount > 0)) return 0;
  amount = Math.round(amount); profile.bank = Math.round((profile.bank || 0) + amount);
  profile.totals[kind] = Math.round((profile.totals[kind] || 0) + amount);
  if (profile.isUser || profile.id === G.managerProfileId) {
    profile.transactions.unshift({ date: today().getTime(), kind, amount, detail, club: G.club, external: !!external });
    profile.transactions = profile.transactions.slice(0, 250);
  }
  return amount;
}
function managerPayWeek() {
  ensureManagerProfiles();
  let userSalary = 0;
  for (const cid of domesticClubs()) {
    const c = G.clubs[cid], p = c?.managerId && G.managerProfiles[c.managerId];
    if (!c || !p) continue;
    const salary = p.weeklySalary = managerSalaryFor(c);
    c.bal -= salary;
    if (p.id === G.managerProfileId) {
      userSalary = salary;
      managerRecordIncome(p, 'salary', salary, `Weekly salary from the ${c.name}.`);
      const sponsor = Math.round((c.rep * 65) + (p.awards.length * 250));
      if (sponsor > 0) managerRecordIncome(p, 'sponsor', sponsor, 'Weekly personal sponsorship and endorsement income.', true);
    } else {
      p.bank = Math.round((p.bank || 0) + salary);
      p.totals.salary = Math.round((p.totals.salary || 0) + salary);
    }
  }
  return userSalary;
}
function managerOwnerBonus(kind, amount, detail) {
  const p = userManagerProfile(), c = userClub();
  amount = Math.max(0, Math.round(amount));
  if (!amount) return 0;
  c.bal -= amount;
  if (G.ledger) G.ledger.manager = (G.ledger.manager || 0) + amount;
  managerRecordIncome(p, kind, amount, detail);
  if (kind !== 'win') addNews('club', 'Manager bonus paid', `${money(amount)} ${MANAGER_INCOME_NAMES[kind]?.toLowerCase() || 'bonus'} paid to ${G.manager}. ${detail}`);
  return amount;
}
function managerMatchBonus(fx) {
  if (!fx || (fx.h !== G.club && fx.a !== G.club) || fx.fr) return;
  const us = fx.h === G.club ? fx.hg : fx.ag, them = fx.h === G.club ? fx.ag : fx.hg;
  if (us > them) managerOwnerBonus('win', G.clubs[G.club].league === 'ECH' ? 1800 : 5000, `Win bonus for the ${us}–${them} result.`);
}
function managerAddAward(name, amount = 0) {
  const p = userManagerProfile();
  if (p.awards.some(a => a.name === name)) return;
  p.awards.unshift({ name, date: today().getTime(), season: seasonLabel() });
  if (amount) managerOwnerBonus('award', amount, `${name} award bonus.`);
}
function managerCloseEmployment(pid, reason) {
  const p = G.managerProfiles[pid], h = p?.history?.find(x => !x.left);
  if (!p || !h) return;
  h.left = managerDateLabel(); h.reason = reason || 'Departed'; p.currentClubId = null;
}
function managerHireUser(cid) {
  const p = userManagerProfile(), c = G.clubs[cid];
  if (!c) return false;
  const previous = G.managerProfiles[c.managerId];
  if (previous && previous.id !== p.id) managerCloseEmployment(previous.id, 'Replaced');
  p.name = G.manager; p.currentClubId = cid; p.weeklySalary = managerSalaryFor(c); p.reputation = Math.max(p.reputation || 0, Math.round(c.rep));
  p.contractYears = 2 + Math.floor(hash01(p.id + ':' + G.season + ':' + cid) * 3);
  p.history.push({ club: cid, name: c.name, league: c.league, joined: managerDateLabel(), salary: p.weeklySalary, left: null, reason: 'Appointed' });
  c.managerId = p.id; c.mgr = G.manager;
  return true;
}
function managerReplaceAt(cid, reason = 'Dismissed') {
  const c = G.clubs[cid]; if (!c) return null;
  if (c.managerId) managerCloseEmployment(c.managerId, reason);
  const p = newManagerProfile(genManagerName(), cid, false);
  c.mgr = p.name; c.managerId = p.id;
  return p;
}
function postManagerJob(cid, reason = 'The club is seeking a new manager.') {
  if (!G.clubs[cid] || !G.leagues.includes(G.clubs[cid].league) || G.managerJobs.some(j => j.cid === cid && j.status === 'open')) return null;
  const c = G.clubs[cid], job = { id: G.nextId++, cid, league: c.league, opened: today().getTime(), expires: dayAbs() + 35, status: 'open', reason };
  G.managerJobs.unshift(job); G.managerJobs = G.managerJobs.slice(0, 20);
  addNews('league', `Manager wanted: ${c.name}`, `${c.name} are seeking a new manager in the ${leagueName(c.league)}. ${reason}`);
  return job;
}
function managerJobWeek() {
  if (!G.managerJobs) return;
  G.managerJobs.filter(j => j.status === 'open' && dayAbs() >= j.expires).forEach(j => {
    const c = G.clubs[j.cid]; if (!c || c.id === G.club) return;
    managerReplaceAt(j.cid, 'Contract ended'); j.status = 'filled'; j.filled = today().getTime();
    addNews('league', `${c.name} appoint a manager`, `${c.mgr} takes charge in the ${leagueName(c.league)}.`);
  });
}
function managerSeasonRecords() {
  const champions = {};
  for (const league of G.leagues) {
    const table = leagueTable(league); if (!table.length) continue;
    champions[league] = table[0].id;
    table.forEach((row, i) => {
      const c = G.clubs[row.id], p = c?.managerId && G.managerProfiles[c.managerId];
      if (!p) return;
      const job = p.history.find(x => !x.left && x.club === c.id);
      if (job) { job.seasons ||= []; job.seasons.push({ season: seasonLabel(), league, position: i + 1, points: row.pts, champion: i === 0 }); job.seasons = job.seasons.slice(-30); }
      if (i === 0) {
        const title = `${leagueName(league)} champions · ${seasonLabel()}`;
        if (!p.awards.some(a => a.name === title)) p.awards.unshift({ name: title, date: today().getTime(), season: seasonLabel() });
      }
    });
    // A realistic manager job watch: once in a while, a poorly performing playable club opens a vacancy.
    const candidate = table.map((row, i) => ({ row, pos: i + 1, target: expectationFor(row.id).pos }))
      .filter(x => x.row.id !== G.club && x.pos >= x.target + 4 && hash01(G.season + ':' + league + ':' + x.row.id + ':manager-job') < 0.32)
      .sort((a, b) => b.pos - a.pos)[0];
    if (candidate) postManagerJob(candidate.row.id, `After a ${ordinal(candidate.pos)}-place finish, the board is looking for a new direction.`);
  }
  return champions;
}
