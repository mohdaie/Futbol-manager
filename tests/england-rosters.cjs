const assert = require('node:assert/strict');
const { createMatchQaRuntime } = require('../scripts/match-qa-runtime.cjs');
const rt = createMatchQaRuntime(20261022), checks = [];
const check = (name, source) => { assert.ok(rt.run(source), name); checks.push(name); };
rt.run("newGame('WRE','Identity QA',1)");
check('All 44 clubs have a complete first team and position coverage', `domesticClubs().every(id => {
  const ps=seniorSquad(id); return ps.length===(leagueOf(id)==='ECH'?24:Math.max(25,(ENGLAND_ROSTERS_2026[id]||[]).length+(ENGLAND_EXPANSION_ROSTERS[id]||[]).length)) && ps.filter(p=>p.pos==='GK').length>=2 && ps.some(p=>p.pos==='DC') && ps.some(p=>p.pos==='ST');
})`);
check('Every sourced identity has a fictional name, known nationality and the real inspirational figure', `domesticClubs().every(id=>seniorSquad(id).filter(p=>p.identity).every(p=>p.insp && fullName(p)!==p.insp && COUNTRY[p.nat] && p.originProfile))`);
check('All Premier League first teams use sourced snapshot or expansion identities', `leagueClubs('EPL').every(id=>seniorSquad(id).every(p=>p.identity?.source==='FPL2026' && p.identity.rosterDate==='2026-10-22' || p.identity?.source==='EPLMAP2026' && p.identity.id.startsWith('epl-add:')))`);
check('Older Championship identities keep their source date', `Object.values(G.players).filter(p=>p.identity?.source==='TM2025').every(p=>p.identity.rosterDate==='2025-09-13')`);
check('One real player cannot occur twice across domestic and overseas first teams', `(()=>{const all=Object.values(G.players).filter(p=>p.insp);return new Set(all.map(p=>p.insp)).size===all.length;})()`);
check('Generated gaps and reserve prospects have no fabricated inspirational figure', `domesticClubs().every(id=>squadOf(id).filter(p=>!p.identity && lvlOf(p)!=='A' || !p.originProfile).every(p=>!p.insp))`);
check('Current football nationality overrides older citizenship order', `(()=>{const all=Object.values(G.players);return all.find(p=>p.insp==='Joël Piroe')?.nat==='SUR' && all.find(p=>p.insp==='Wilson Isidor')?.nat==='GUI' && all.find(p=>p.insp==='Tatsuhiro Sakamoto')?.nat==='JPN';})()`);
check('Sourced procedural skills repeat across new careers without sharing live arrays', `(()=>{const row=ENGLAND_ROSTERS_2026.WRE.find(r=>!r[7]),a=playerFromEnglandIdentity(row,'WRE'),b=playerFromEnglandIdentity(row,'WRE');const same=JSON.stringify([a.at,a.pa,a.ht,a.wt])===JSON.stringify([b.at,b.pa,b.ht,b.wt]);a.at[0]=1;return same&&a.originProfile.at[0]===b.at[0]&&a.at!==b.at;})()`);
console.log(JSON.stringify({ passed: checks.length, checks }, null, 2));
