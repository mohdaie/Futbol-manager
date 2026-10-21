// Real engine geometry and assignment/lifecycle checks; no provider calls.
const assert = require('node:assert/strict');
const { createMatchQaRuntime } = require('../scripts/match-qa-runtime.cjs');
const rt = createMatchQaRuntime(), checks = [];
const check = (name, source) => { assert.ok(rt.run(source), name); checks.push(name); };
rt.run(`
newGame(CLUBS[0].id,'Defending QA',1); const dc=plClubs(); let D;
function setupDef(s=0,x=.3,y=.45) {
 D=createMatch({id:-731,h:dc[0],a:dc[1]});simInit(D);D.sides.forEach(S=>refreshForm(D,S));
 const sim=D.sim;sim.rs=null;sim.t=100;sim.poss=s;sim.tr=null;sim.pt=null;sim.B.os=s;sim.B.oi=6;sim.B.offSet=0;
 D.sides[1-s].lost=1;D.sides[1-s].press=2;
 // Layout rotates through the same team-relative coordinates for either side.
 sim.P[s].forEach((p,i)=>{if(p){const q=toWorld(s,.8,.8);Object.assign(p,{x:q[0],y:q[1],vx:0,vy:0,run:0});}});
 const q=toWorld(s,x,y);Object.assign(sim.P[s][6],{x:q[0],y:q[1]});sim.B.x=q[0];sim.B.y=q[1];
 sim.P[1-s].forEach((p,i)=>{if(p){const q=toWorld(s,.15+i*.06,.25);Object.assign(p,{x:q[0],y:q[1],eng:-1,run:0});}});
 const p=sim.P[s][6];[[1,7,0],[2,9,-3],[3,12,5]].forEach(([i,dy,dx])=>{sim.P[1-s][i].x=p.x+(s? -dx:dx);sim.P[1-s][i].y=p.y+fwdY(s)*dy;});
 return s;
}
function centralOutlet(s=0) {const p=D.sim.P[s][6],q=D.sim.P[s][7];q.x=p.x<12?20:p.x>PW-12?48:34;q.y=p.y+fwdY(s)*8;return q;}
`);
check('One nearest outfield presser and a distinct cover player', `setupDef();(()=>{const a=defensiveUnit(D,0,1.2).assignments;return a.length===2&&a[0].i===1&&a[0].job==='press'&&a[1].job==='cover'&&new Set(a.map(x=>x.i)).size===2;})()`);
check('Cover sits about five metres goal-side of the presser', `setupDef();(()=>{const [a,b]=defensiveUnit(D,0,1.2).assignments;return hyp(b.x-a.x,b.y-a.y)>4&&hyp(b.x-a.x,b.y-a.y)<7&&(b.y-a.y)*fwdY(0)>4;})()`);
check('Triggered units add one separate screen/balance instead of a second presser', `setupDef();(()=>{const a=defensiveUnit(D,0,1.2,true).assignments;return a.length===3&&a.filter(q=>q.job==='press').length===1&&new Set(a.map(q=>q.i)).size===3;})()`);
check('Central receiver is screened by the approach angle', `setupDef();(()=>{const q=centralOutlet(),p=owner(D),u=defensiveUnit(D,0,1.2),a=u.assignments[0];return u.shadow&&segD(a.x,a.y,p.x,p.y,q.x,q.y)<.001;})()`);
check('Wide trap approaches from inside and screens a passing outlet', `setupDef(0,.1);centralOutlet();(()=>{const u=defensiveUnit(D,0,1.2,true);return u.trap&&u.assignments[0].x>owner(D).x&&u.assignments.some(a=>a.job==='trap');})()`);
check('Unit geometry rotates consistently for both directions', `(()=>{setupDef(0,.3);centralOutlet(0);const a=defensiveUnit(D,0,1.2,true).assignments;setupDef(1,.3);centralOutlet(1);const b=defensiveUnit(D,1,1.2,true).assignments;return a.every((q,i)=>q.job===b[i].job&&Math.abs(q.x+b[i].x-PW)<1e-8&&Math.abs(q.y+b[i].y-PL)<1e-8);})()`);
check('Missing players and the keeper are never assigned as outfield support', `setupDef();D.sim.P[1][1]=null;D.sim.P[1][3]=null;(()=>{const a=defensiveUnit(D,0,1.2,true).assignments;return a.length>0&&a.every(q=>q.i&&D.sim.P[1][q.i])&&new Set(a.map(q=>q.i)).size===a.length;})()`);
check('Restarts and the wrong possession side have no pressing assignments', `setupDef();(()=>{const wrong=defensiveUnit(D,1,1.2).assignments.length===0;D.sim.rs={k:'fk'};return wrong&&defensiveUnit(D,0,1.2).assignments.length===0;})()`);
check('Free forward-facing carriers make the unit drop in both directions', `[0,1].every(s=>{setupDef(s);owner(D).vy=fwdY(s)*2;return defensiveLineStep(D,1-s)===-4;})`);
check('Back-pass triggers step the unit up and expired triggers do not', `setupDef();(()=>{D.sim.pt={o:1,back:true,until:102};const up=defensiveLineStep(D,1)>0;D.sim.pt.until=99;return up&&defensiveLineStep(D,1)===0;})()`);
check('Regroup takes precedence over a trigger', `setupDef();D.sides[1].lost=0;D.sim.tr={s:0,t:99};D.sim.pt={o:1,back:true,until:102};defensiveLineStep(D,1)<0`);
check('The box retains runner/box defending instead of stepping up', `setupDef(0,.3,.1);D.sim.pt={o:1,back:true,until:102};defensiveLineStep(D,1)===0`);
check('Pressure with no safe outlet steps up; an open forward outlet prevents it', `setupDef();(()=>{const p=owner(D);D.sim.P[1][1].x=p.x-3;D.sim.P[1][1].y=p.y;const up=defensiveLineStep(D,1)>0;const q=D.sim.P[0][7];q.x=p.x+20;q.y=p.y-10;return up&&defensiveOutlet(D,0,6)&&defensiveLineStep(D,1)===0;})()`);
check('Real engage protects assigned cover from runner tracking overrides', `setupDef();centralOutlet();D.sim.pt={o:1,until:103};engage(D);(()=>{const u=D.sim.defence;return u.assignments.length===3&&u.assignments.every(a=>{const p=D.sim.P[1][a.i];return p.eng===100&&p.tx===a.x&&p.ty===a.y;});})()`);
check('Real targets use mapped OOP back-line membership and bounded depth', `setupDef();(()=>{const S=D.sides[1];S.oop='5-4-1';S.map=shapeMap(S.ip,S.oop);S._shape=null;D.sim.pt={o:1,until:103,back:true};targets(D,true);const base=shapeOf(D,1,false,1-D.sim.B.x/PW,1-D.sim.B.y/PL);const back=S.on.map((id,i)=>id&&i&&LINE[FORMATIONS[S.oop][S.map[i]][0]]===1?i:null).filter(i=>i!==null);return back.length===5&&back.every(i=>Math.abs(D.sim.P[1][i].ty-(toWorld(1,...base[i])[1]+fwdY(1)*2.5))<=1.50001);})()`);
check('Back-pass trigger records its cause for the shared line decision', `setupDef(0,.05);(()=>{const p=owner(D),z=D.sim.P[0][7];z.x=p.x;z.y=p.y-10;p.vy=2;for(let i=0;i<40&&!D.sim.pt;i++)pressTrigger(D,0,6,{i:7,len:10,sp:10},true);return D.sim.pt?.back&&D.sim.pt.o===1;})()`);
check('No forward outlet at the keeper can trigger coordinated pressure', `setupDef();(()=>{D.sim.B.oi=0;const p=D.sim.P[0][0];p.x=34;p.y=85;p.vy=0;D.sim.P[0].forEach((q,i)=>{if(q&&i)q.y=95;});for(let i=0;i<40&&!D.sim.pt;i++)pressTrigger(D,0,0,null,false);return D.sim.pt?.o===1;})()`);
check('Inactive or dead-ball frames discard previous defensive assignments', `setupDef();engage(D);D.sim.rs={k:'fk'};engage(D);D.sim.defence===null`);
console.log(JSON.stringify({passed:checks.length,checks},null,2));
