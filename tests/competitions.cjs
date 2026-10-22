// Membership, fixtures, standings and Championship ownership policy.
const assert = require('node:assert/strict'), fs = require('node:fs');
const { createMatchQaRuntime } = require('../scripts/match-qa-runtime.cjs');
const rt = createMatchQaRuntime(20261022), checks = [];
const check = (name, source) => { assert.ok(rt.run(source), name); checks.push(name); };
rt.run("newGame('BIR','Champ QA',1)");
const sources = JSON.parse(fs.readFileSync(require('node:path').join(__dirname, '../data/england/sources.json'), 'utf8'));
for (const [id, source] of Object.entries(sources.sources)) {
  assert.deepEqual(JSON.parse(rt.run(`JSON.stringify(leagueClubs('${id}').map(id => G.clubs[id].realName).sort())`)), source.teams.slice().sort());
  checks.push(id + ' clubs match the pinned 2026/27 source');
}
check('Both leagues contain 44 unique domestic clubs', `domesticClubs().length === 44 && new Set(domesticClubs()).size === 44`);
check('All Championship clubs have only 24 first-team players and 12 reserves', `leagueClubs('ECH').every(id => G.clubs[id].squad.length === 36 && levelSquad(id,'A').length === 24 && levelSquad(id,'R').length === 12 && levelSquad(id,'Y').length === 0)`);
check('Premier League youth squads remain available', `leagueClubs('EPL').every(id => levelSquad(id,'R').length >= 20 && levelSquad(id,'Y').length >= 20)`);
check('Fixtures have complete home-and-away schedules with no same-day double booking', `(() => {
  for (const [comp, n] of [['EPL',20],['ECH',24]]) {
    const fx = G.fixtures.filter(f=>f.comp===comp); if(fx.length!==n*(n-1))return false;
    const pairs=new Set(), dates=new Set();
    for(const f of fx){ const key=f.h+':'+f.a;if(pairs.has(key))return false;pairs.add(key);
      for(const id of [f.h,f.a]){const k=id+':'+fxDayNo(f);if(dates.has(k))return false;dates.add(k);}
    }
    if(!leagueClubs(comp).every(id=>fx.filter(f=>f.h===id).length===n-1&&fx.filter(f=>f.a===id).length===n-1))return false;
  } return true;
})()`);
check('2026/27 league fixture dates match the source calendar', `G.fixtures.filter(f=>f.comp==='EPL').every(f=>fxDate(f).getFullYear()===2026||fxDate(f).getFullYear()===2027)&&G.fixtures.find(f=>f.comp==='EPL'&&f.r===0).w===6&&G.fixtures.find(f=>f.comp==='ECH'&&f.r===0).w===5`);
check('Reputation cannot break a tie in league results', `(() => { const old=G.fixtures;G.fixtures=[];const t=leagueTable('ECH');G.fixtures=old;return t.every((r,i)=>!i||t[i-1].id.localeCompare(r.id)<0); })()`);
check('Friendly and playoff results never enter either league table', `(() => {const old=G.fixtures;const ids=leagueClubs('ECH');G.fixtures=[{h:ids[0],a:ids[1],hg:9,ag:0,w:0,d:5,fr:true},{h:ids[0],a:ids[1],hg:9,ag:0,w:0,d:5,comp:'ECH',playoff:true}];const ok=leagueTable('ECH').every(r=>r.p===0)&&leagueTable('EPL').every(r=>r.p===0);G.fixtures=old;return ok;})()`);
check('Championship results cannot change the Premier League table', `(() => {const old=G.fixtures, ids=leagueClubs('ECH');G.fixtures=[{h:ids[0],a:ids[1],hg:2,ag:1,w:0,d:5,comp:'ECH'}];const ok=leagueTable('ECH').find(r=>r.id===ids[0]).pts===3&&leagueTable('EPL').every(r=>r.p===0);G.fixtures=old;return ok;})()`);
check('Generation and intake cannot exceed a full Championship squad', `(() => {const c=userClub(),before=Object.keys(G.players).length;fillLevel(c,'R',99);fillLevel(c,'Y',20);return genYouth(c,85)===null&&c.squad.length===36&&Object.keys(G.players).length===before;})()`);
check('Joining a full Championship club fails before ownership changes', `(() => { const c=userClub(),p=squadOf('FA')[0],before=JSON.stringify([p,G.clubs.FA.squad,c.squad]);let failed=false;try{addToClub(p,c);}catch{failed=true;}return failed&&before===JSON.stringify([p,G.clubs.FA.squad,c.squad]);})()`);
check('A deciding level tie gets 30 minutes extra time then a penalty winner', `(() => {const ids=leagueClubs('ECH'),M=createMatch({id:-717,h:ids[0],a:ids[1]});M.knockout={home:2,away:2};M.min=94;M.sides.forEach(S=>S.st.g=0);decideMatchEnd(M);if(M.ended||!M.extra||M.finishAt!==124)return false;M.min=124;matchRandom(M,()=>decideMatchEnd(M));return M.ended&&M.penalties&&M.penalties[0]!==M.penalties[1]&&ids.includes(M.winner);})()`);
check('Aggregate score decides a second leg without an away-goals rule', `(() => {const ids=leagueClubs('ECH'),M=createMatch({id:-718,h:ids[0],a:ids[1]});M.knockout={home:0,away:1};M.sides[0].st.g=1;M.sides[1].st.g=0;M.min=94;decideMatchEnd(M);return M.extra&&!M.ended;})()`);
check('Extra time grants one additional substitution and window', `(() => {const ids=leagueClubs('ECH'),M=createMatch({id:-719,h:ids[0],a:ids[1]}),S=M.sides[0];M.min=105;S.subs=5;S.wins=3;if(canSub(M,S))return false;M.extra=true;return canSub(M,S);})()`);
console.log(JSON.stringify({passed:checks.length,checks},null,2));
