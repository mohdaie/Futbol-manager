const assert = require('node:assert/strict');
const { createMatchQaRuntime } = require('../scripts/match-qa-runtime.cjs');
const rt = createMatchQaRuntime(20261022), checks = [];
rt.run("newGame('GUN','Discipline QA',1); function brainScore(){}; globalThis.startWorld=JSON.stringify(G);");
function scenario(comp, games, before, opts = {}) {
  return rt.run(`(()=>{
    G=JSON.parse(startWorld);const cid=leagueClubs('${comp}').find(id=>id!==G.club), fixtures=G.fixtures.filter(f=>leagueFixture(f,'${comp}')&&(f.h===cid||f.a===cid));
    fixtures.slice(0,${games - 1}).forEach(f=>{f.hg=0;f.ag=0});const f=fixtures[${games - 1}];
    f.fr=${!!opts.friendly};f.playoff=${!!opts.playoff};
    const p=seniorSquad(cid).find(p=>p.pos==='DC');p.ban=${opts.banned || 0};p.discipline={season:G.season,cards:{'${comp}':${before}}};
    const M=createMatch(f),S=M.sides.find(S=>S.cid===cid);
    ${opts.banned ? '' : opts.red ? `S.reds.push(p.id);M.log.push({t:'red',pid:p.id,second:${!!opts.second}});` : 'S.yc[p.id]=1;'}
    finishMatch(M);return {ban:p.ban,cards:p.discipline.cards['${comp}'],selected:S.on.includes(p.id),rc:p.st.rc};
  })()`);
}
for (const [comp, cutoff] of [['EPL', 19], ['ECH', 23]]) {
  assert.equal(scenario(comp, cutoff, 4).ban, 1); checks.push(comp + ' fifth yellow at cutoff suspends');
  assert.equal(scenario(comp, cutoff + 1, 4).ban, 0); checks.push(comp + ' fifth yellow after cutoff does not suspend');
}
for (const [comp, cutoff] of [['EPL', 32], ['ECH', 37]]) {
  assert.equal(scenario(comp, cutoff, 9).ban, 2); checks.push(comp + ' tenth yellow at cutoff suspends twice');
  assert.equal(scenario(comp, cutoff + 1, 9).ban, 0); checks.push(comp + ' tenth yellow after cutoff does not suspend');
}
assert.equal(scenario('ECH', 45, 14).ban, 3); checks.push('Fifteen league cautions suspend three matches');
assert.equal(scenario('ECH', 1, 0, { red: true, second: true }).ban, 1); checks.push('Second yellow dismissal carries one match');
assert.equal(scenario('ECH', 1, 0, { red: true }).ban, 3); checks.push('Default straight red carries three matches');
const friendly = scenario('ECH', 1, 4, { friendly: true, banned: 2 });
assert.equal(friendly.ban, 2); assert.equal(friendly.cards, 4); checks.push('Friendlies do not serve competitive suspensions or add league cautions');
assert.equal(scenario('ECH', 1, 0, { banned: 2 }).ban, 1); checks.push('A competitive club match serves exactly one suspension match');
assert.equal(scenario('ECH', 1, 4, { playoff: true }).ban, 0); checks.push('Playoffs exclude league yellow-card accumulation');
console.log(JSON.stringify({ passed: checks.length, checks }, null, 2));
