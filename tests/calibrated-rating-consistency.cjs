'use strict';
const assert = require('node:assert/strict');
const { createMatchQaRuntime } = require('../scripts/match-qa-runtime.cjs');
const rt = createMatchQaRuntime(20261024);
rt.run("newGame('GUL','Calibration QA',1)");
const result = JSON.parse(rt.run(`JSON.stringify((()=>{
  const players=Object.values(G.players).filter(p=>p.originProfile?.calibrationVersion===1);
  const failures=[];
  const fail=(p,why)=>failures.push(fullName(p)+': '+why);
  for(const p of players){
    const profile=ENGLAND_CALIBRATED_PROFILES_BY_ID[p.identity.id];
    if(!Number.isFinite(p.ht)||p.ht<150||!Number.isFinite(p.wt)||p.wt<40) fail(p,'missing physical estimates');
    if(p.ca!==profile.ca || playerRating(p)!==profile.ca || p.pa!==profile.pa) fail(p,'creation differs from database');
    const saved={at:p.at.slice(),ca:p.ca,pa:p.pa};
    bumpAttr(p,1,['fin']);
    if(p.ca<saved.ca || p.ca!==playerRating(p) || p.pa!==saved.pa) fail(p,'growth changed scale or potential');
    p.at=saved.at.slice();p.ca=saved.ca;p.pa=saved.ca;
    bumpAttr(p,1,['fin']);
    if(p.ca>p.pa || p.ca!==playerRating(p)) fail(p,'growth exceeded ceiling');
    p.at=saved.at.slice();p.ca=saved.ca;p.pa=saved.pa;
    bumpAttr(p,-1);
    if(p.ca>saved.ca || p.ca!==playerRating(p) || p.pa!==saved.pa) fail(p,'decline changed scale or potential');
    p.at=saved.at;p.ca=saved.ca;p.pa=saved.pa;
    for(const pos of Object.keys(WEIGHTS)) {
      const expected=Math.round(calibratedAbility(p.at,pos).ca*fam(p,pos));
      if(ovrAt(p,pos)!==expected) fail(p,'positional rating uses different scale: '+pos);
    }
  }
  const witness=players.find(p=>fullName(p)==='Callum Wheatley');
  const before=witness.ca;bumpAttr(witness,1,['fin']);
  const legacy=Object.values(G.players).find(p=>!p.originProfile?.calibrationVersion);
  let sum=0,total=0;for(const k in WEIGHTS[legacy.pos]){sum+=legacy.at[A[k]]*WEIGHTS[legacy.pos][k];total+=WEIGHTS[legacy.pos][k];}
  if(playerRating(legacy)!==Math.round(sum/total*5)) fail(legacy,'legacy scale changed');
  return {count:players.length,failures,witness:{before,after:witness.ca}};
})())`));
assert.equal(result.count,543);
assert.deepEqual(result.failures,[]);
assert.ok(result.witness.after>=result.witness.before);
console.log(JSON.stringify(result,null,2));
