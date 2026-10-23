// Season-scoped attribute deltas and weekly development reports.
const assert = require('node:assert/strict');
const { createMatchQaRuntime } = require('../scripts/match-qa-runtime.cjs');
const rt = createMatchQaRuntime(20261023), checks = [];
rt.run("newGame('GUN','Development QA',1)");
const check = (name, source) => { assert.equal(rt.run(source), true, name); checks.push(name); };
check('Development baseline covers first team, reserves and academy', `(()=>{const d=ensureTrainingDev();return levelSquad(G.club,'A').every(p=>d.base[p.id])&&levelSquad(G.club,'R').every(p=>d.base[p.id])&&levelSquad(G.club,'Y').every(p=>d.base[p.id]);})()`);
rt.run(`globalThis.devTarget=levelSquad(G.club,'Y')[0];globalThis.devOld=develop;develop=(p)=>{if(p.id===devTarget.id){p.at[A.pac]++;p.ca=ratingFor(p.at,p.pos);}};weeklyTraining(new Set());develop=devOld;`);
check('Weekly report records youth attribute change and resulting CA', `(()=>{const r=G.training.dev.reports.at(-1),x=r.players.find(x=>x.id===devTarget.id);return r.season===G.season&&r.week===G.week&&x?.changes.some(([i,d])=>i===A.pac&&d===1)&&x.ca===devTarget.ca-G.training.dev.base[devTarget.id].ca&&devTarget.ca===ratingFor(devTarget.at,devTarget.pos);})()`);
check('Profile season delta reflects the recorded attribute increase', `trainingAttrDelta(devTarget,A.pac)===1`);
check('Season reset clears weekly reports and snapshots new player baselines', `(()=>{G.season++;resetTrainingDev();return G.training.dev.season===G.season&&G.training.dev.reports.length===0&&trainingAttrDelta(devTarget,A.pac)===0&&G.training.dev.base[devTarget.id].ca===devTarget.ca;})()`);
console.log(JSON.stringify({ passed: checks.length, checks }, null, 2));
