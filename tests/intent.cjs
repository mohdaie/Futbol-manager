// Exercise the real layer-3 scorer, line geometry and possession lifecycle.
const assert = require('node:assert/strict');
const { createMatchQaRuntime } = require('../scripts/match-qa-runtime.cjs');
const rt = createMatchQaRuntime(), checks = [];
const check = (name, source) => { assert.ok(rt.run(source), name); checks.push(name); };
rt.run(`
newGame(CLUBS[0].id, 'Intent QA', 1);
const qaClubs = plClubs();
let M;
function setupIntent(s = 0, ownY = .5, x = .5) {
  M = createMatch({id:-991,h:qaClubs[0],a:qaClubs[1]}); simInit(M);
  M.sides.forEach(S => refreshForm(M,S));
  M.sim.rs=null; M.sim.t=100; M.sim.poss=s; M.sim.B.offSet=0;
  const [px,py]=toWorld(s,x,ownY); Object.assign(M.sim.P[s][6],{x:px,y:py});
  return s;
}
function choices(s = 0) {
  const p=M.sim.P[s][6];
  return [{k:'pass',j:7,tx:p.x,ty:p.y+fwdY(s)*10,v:.04,risk:.12,rpress:.1},
    {k:'pass',j:5,tx:p.x,ty:p.y-fwdY(s)*8,v:.04,risk:.1,rpress:.1}];
}
function scores(s=0,pressure=.1,context={}) {
  const o=choices(s),meta=applyTeamIntent(M,s,6,o,pressure,context);return {o,meta};
}
`);
check('Safe forward options beat equal-value recycling in both directions', `
[0,1].every(s=>{setupIntent(s);const {o,meta}=scores(s);return meta.forward&&o[0].v>o[1].v;})`);
check('Pressure leaves immediate forward/back scores unchanged', `
setupIntent(); (()=>{const {o}=scores(0,.9);return o.every(q=>q.v===.04);})()`);
check('Closed or high-risk forward routes do not punish recycling', `
setupIntent(); (()=>{const o=choices();o[0].risk=.8;applyTeamIntent(M,0,6,o,.1);return o.every(q=>q.v===.04);})()`);
check('A marked receiver does not count as a safe forward option', `
setupIntent(); (()=>{const o=choices();o[0].rpress=.9;const r=applyTeamIntent(M,0,6,o,.1);return !r.forward&&o.every(q=>q.v===.04);})()`);
check('Momentum sharpens a safe forward choice after a line break', `
setupIntent(); (()=>{const normal=scores().o;M.sim.momentum={s:0,until:106};const r=scores();return r.meta.momentum&&r.o[0].v>normal[0].v&&r.o[1].v<normal[1].v;})()`);
check('Expired and opponent momentum cannot bias the carrier', `
setupIntent(); (()=>{const normal=scores().o;return [{s:0,until:99},{s:1,until:106}].every(m=>{M.sim.momentum=m;const r=scores();return !r.meta.momentum&&r.o.every((q,i)=>q.v===normal[i].v);});})()`);
check('Routine backward returns are discouraged when a forward route is open', `
setupIntent(); (()=>{const normal=scores().o[1].v;M.sim.lastPass={s:0,id:M.sides[0].on[5],t:99};return scores().o[1].v<normal;})()`);
check('A forward one-two keeps its normal forward value', `
setupIntent(); (()=>{const normal=scores().o[0].v;M.sim.lastPass={s:0,id:M.sides[0].on[7],t:99};return scores().o[0].v===normal;})()`);
check('A free opposite flank is rewarded when the block has shifted', `
setupIntent(0,.5,.1); (()=>{M.sim.P[1].forEach(p=>{if(p)p.x=12;});const p=M.sim.P[0][6],o=[{k:'long',j:10,tx:60,ty:p.y,v:.04,risk:.2,rpress:.1}];applyTeamIntent(M,0,6,o,.1);return o[0].v>.04;})()`);
check('A marked opposite flank is not rewarded as an open switch', `
setupIntent(0,.5,.1); (()=>{M.sim.P[1].forEach(p=>{if(p)p.x=12;});const p=M.sim.P[0][6],o=[{k:'long',j:10,tx:60,ty:p.y,v:.04,risk:.2,rpress:.8}];applyTeamIntent(M,0,6,o,.1);return o[0].v===.04;})()`);
check('Restart decisions and shot scores retain the existing engine values', `
setupIntent(); (()=>{const a=scores(0,.1,{restart:'gk'});const b=[...choices(),{k:'shot',v:.08}];applyTeamIntent(M,0,6,b,.1);return a.meta.phase==='restart'&&a.o.every(q=>q.v===.04)&&b[2].v===.08;})()`);
check('Build-up finds the pivot and chance creation values Zone 14', `
setupIntent(0,.8); (()=>{const a=choices();const dm=FORMATIONS[M.sides[0].ip].findIndex(q=>q[0]==='DM');if(dm<0)return false;a[0].j=dm;applyTeamIntent(M,0,6,a,.1);const build=a[0].v;setupIntent(0,.5);const regular=scores().o[0].v;setupIntent(0,.25);const c=choices();c[0].tx=34;c[0].ty=20;const meta=applyTeamIntent(M,0,6,c,.1);return build>regular&&meta.phase==='create'&&c[0].v>.04;})()`);
check('Actual OOP lines are crossed symmetrically; backward/short passes are excluded', `
[0,1].every(s=>{setupIntent(s);const O=M.sides[1-s],f=FORMATIONS[O.oop];M.sim.P[1-s].forEach((p,i)=>{if(!p||!i)return;const line=LINE[f[O.map[i]][0]];p.y=toWorld(s,.5,line===1?.2:.4)[1];});const y=v=>toWorld(s,.5,v)[1];return brokenLines(M,s,y(.6),y(.1))===2&&brokenLines(M,s,y(.1),y(.6))===0&&brokenLines(M,s,y(.41),y(.4))===0;})`);
check('Turnovers clear momentum and same-team control preserves it', `
setupIntent(); M.sim.momentum={s:0,until:106};giveBall(M,0,6); (()=>{const kept=!!M.sim.momentum;giveBall(M,1,6);return kept&&M.sim.momentum===null;})()`);
check('Kickoffs and dead-ball restarts clear momentum', `
setupIntent(); M.sim.momentum={s:0,until:106};kickOff(M,1); (()=>{const ko=M.sim.momentum===null;M.sim.momentum={s:0,until:106};setRestart(M,'thr',0,1,52);return ko&&M.sim.momentum===null;})()`);
check('Completed intended line-breaking passes start a six-second team window', `
setupIntent(); (()=>{const j=7,p=M.sim.P[0][j],B=M.sim.B;Object.assign(B,{x:p.x,y:p.y,z:0,vx:0,vy:0,offSet:0});const fl={s:0,i:6,j,k:'pass',linesBroken:1};for(let k=0;k<20&&!M.sim.momentum;k++)receive(M,0,j,fl,0);return M.sim.momentum?.s===0&&M.sim.momentum.until===106;})()`);
check('A plain pass does not manufacture line-breaking momentum', `
setupIntent(); (()=>{const j=7,p=M.sim.P[0][j],B=M.sim.B;Object.assign(B,{x:p.x,y:p.y,z:0,vx:0,vy:0,offSet:0});const before=M.sides[0].st.pc;for(let k=0;k<20&&M.sides[0].st.pc===before;k++)receive(M,0,j,{s:0,i:6,j,k:'pass',linesBroken:0},0);return M.sides[0].st.pc>before&&!M.sim.momentum;})()`);
console.log(JSON.stringify({passed:checks.length,checks},null,2));
