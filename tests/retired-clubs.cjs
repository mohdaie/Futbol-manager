// Run: node tests/retired-clubs.cjs
// Lagos Stars and Selangor Harimau were taken out of the game. New careers do not create them, and older
// saves drop them cleanly: their squads go, loanees return home, deals close and old records keep the name.
const assert = require('node:assert/strict'), fs = require('node:fs'), vm = require('node:vm'), path = require('node:path');
const { createMatchQaRuntime } = require('../scripts/match-qa-runtime.cjs');
const rt = createMatchQaRuntime(20261027), checks = [];
const check = (name, code) => { assert.ok(rt.run(code), name); checks.push(name); };
for (const file of ['js/systems/transfers.js', 'js/systems/loans.js']) vm.runInContext(fs.readFileSync(path.resolve(__dirname, '..', file), 'utf8'), rt.ctx, { filename: file });
rt.run("newGame('GUN','Retired QA',1)");
check('New careers have no Lagos Stars or Selangor Harimau', `!Object.values(G.clubs).some(c => RETIRED_CLUBS[c.ros] || ['Lagos Stars','Selangor Harimau'].includes(c.name))`);
check('Their squads are not in the roster data', `!FOREIGN_ROSTERS.REM && !FOREIGN_ROSTERS.SEL`);
// Rebuild an older save that still has Selangor: a squad, a loanee from an English club, one of theirs on
// loan in England, an open deal, a shortlist entry and an unplayed friendly.
rt.run(`(() => {
  const c = { id: 'F12', name: 'Selangor Harimau', ros: 'SEL', nat: 'MAS', rep: 58, c1: '#E2001A', c2: '#FFD100', squad: [], bal: 5e6, tac: aiTactic(58), foreign: true, code: 'SEL' };
  G.clubs.F12 = c; genSquad(c, 18);
  globalThis.own = G.players[c.squad[0]]; globalThis.out = G.players[c.squad[1]];
  const eng = G.clubs.CHE || Object.values(G.clubs).find(x => x.pl && x.id !== G.club);
  globalThis.loanee = G.players[eng.squad.find(id => lvlOf(G.players[id]) === 'A')];
  removeFromClub(loanee); loanee.club = 'F12'; c.squad.push(loanee.id);
  loanee.loan = { parent: eng.id, host: 'F12', parentWage: loanee.wage, parentContract: loanee.con, parentLevel: 'A', end: Date.now() + 1e9 };
  removeFromClub(out); out.club = eng.id; eng.squad.push(out.id);
  out.loan = { parent: 'F12', host: eng.id, parentWage: 1234, parentContract: G.season + 2, parentLevel: 'A', end: Date.now() + 1e9 };
  G.shortlist.push(own.id);
  (G.deals ||= []).push({ id: G.nextId++, dir: 'in', pid: own.id, from: 'F12', to: G.club, stage: 'bid', log: [] });
  G.fixtures.push({ id: G.nextId++, w: 1, d: 5, t: '15:00', h: G.club, a: 'F12', hg: null, ag: null, fr: true });
  (G.tHist ||= []).unshift({ date: 0, pid: 999999, name: 'Old Signing', from: 'F12', to: G.club, fee: 1 });
  globalThis.engId = eng.id;
})()`);
rt.run('ensureWorld()');
check('Older saves drop the club', `!G.clubs.F12`);
check('Its own squad leaves the game', `!G.players[own.id] && !G.know[own.id]`);
check('A loanee there returns to his English club', `G.players[loanee.id].club === engId && !loanee.loan && G.clubs[engId].squad.includes(loanee.id)`);
check('Its player on loan in England stays there permanently', `G.players[out.id].club === engId && !out.loan && out.wage === 1234`);
check('Shortlist and open deals are cleared', `!G.shortlist.includes(own.id) && G.deals.every(d => d.closed || d.from !== 'F12')`);
check('Unplayed friendlies against them are removed', `!G.fixtures.some(f => f.a === 'F12' || f.h === 'F12')`);
check('Old records keep the club name', `clubName('F12') === 'Selangor Harimau'`);
check('Running the migration again changes nothing', `(() => { const n = Object.keys(G.players).length; ensureWorld(); return Object.keys(G.players).length === n; })()`);
console.log(JSON.stringify({ passed: checks.length, checks }, null, 2));
