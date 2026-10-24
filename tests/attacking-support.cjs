const assert=require('node:assert/strict');
const {createMatchQaRuntime}=require('../scripts/match-qa-runtime.cjs');
const rt=createMatchQaRuntime(20261024),checks=[];
const check=(name,code)=>{assert.ok(rt.run(code),name);checks.push(name);};
rt.run(`newGame('GUL','Support QA',1);G.flags.fixedTac=true;G.simSeed=20261024;
function setup(s=0){const M=createMatch({id:-44,h:'GUL',a:'RED'});M.sides[0].ip=M.sides[0].oop='4-3-3';M.sides[0].map=shapeMap('4-3-3','4-3-3');M.sides[0].roles=FORMATIONS['4-3-3'].map(p=>p[0]==='DM'?1:0);simInit(M);M.sim.rs=null;M.sim.t=100;M.sides.forEach(S=>refreshForm(M,S));
 M.sim.P.forEach((P,t)=>P.forEach((p,i)=>{if(!p)return;p.x=i?10+i*4:34;p.y=i?(t===s?50:70):goalY(1-t)+fwdY(1-t)*1.5;p.vx=p.vy=0;p.run=p.sup=0;p.tx=p.x;p.ty=p.y;}));
 const p=P_(M,s,9);p.x=34;p.y=s?90:15;p.fa=fwdA(s);const defender=P_(M,1-s,2);defender.x=34;defender.y=p.y+fwdY(s);giveBall(M,s,9);return M;}
function opts(M,s=0,i=9){let result;const old=playOption;playOption=(m,s,i,o)=>{result=o;};const intent=applyTeamIntent;let all;applyTeamIntent=(m,s,i,a,p,c)=>{const v=intent(m,s,i,a,p,c);all=a.map(o=>({...o}));return v;};try{matchRandom(M,()=>carrierDecide(M,s,i));}finally{playOption=old;applyTeamIntent=intent;}return {all,result};}
`);
check('Crowded carriers get a short escape into genuinely lower pressure',`[0,1].every(s=>{const M=setup(s),p=P_(M,s,9),e=pressureEscape(M,s,9,1,.3);return e&&hyp(e.cx-p.x,e.cy-p.y)<=3.01&&recvPressure(M,s,e.cx,e.cy)[1]<1;})`);
check('Escape physically moves the carrier, never teleports the ball',`(()=>{const M=setup(),p=P_(M,0,9),e=pressureEscape(M,0,9,1,.3),x=p.x,y=p.y;playOption(M,0,9,e,1);movePlayers(M);attachBallToCarrier(M);return hyp(p.x-x,p.y-y)>0&&hyp(p.x-x,p.y-y)<5&&hyp(M.sim.B.x-p.x,M.sim.B.y-p.y)<.6;})()`);
check('Escape has a cooldown rather than offering endless safe shielding',`(()=>{const M=setup(),e=pressureEscape(M,0,9,1,.3);playOption(M,0,9,e,1);return !pressureEscape(M,0,9,1,.3)&&M.sim.B.dt<=1;})()`);
check('An unpressed player is not distracted by an escape action',`!pressureEscape(setup(),0,9,.2,.3)`);
check('An escape cannot move straight through a surrounding defensive ring',`(()=>{const M=setup(),p=P_(M,0,9);M.sim.P[1].forEach((q,i)=>{if(q&&i){q.x=p.x+Math.cos(i*Math.PI/5)*1.2;q.y=p.y+Math.sin(i*Math.PI/5)*1.2;}});return !pressureEscape(M,0,9,1,.3);})()`);
check('A nearby midfielder offers a goal-side passing triangle',`(()=>{const M=setup();for(const i of[5,6,7]){const p=P_(M,0,i);p.x=23+i;p.y=27+i%2;}const a=closeSupport(M,0,9,null);return a&&a.y>15&&a.y<=25&&hyp(a.x-34,a.y-15)<12;})()`);
check('Support respects the back-line reserve and protects the last central screen',`(()=>{const M=setup(),S=M.sides[0];for(const i of[5,6,7]){const p=P_(M,0,i);p.x=23+i;p.y=27+i%2;}const a=closeSupport(M,0,9,null),r=restSlots(S,toOwn(0,34,15)[0],9);if(!a||r.back.includes(a.i))return false;S.on[6]=S.on[7]=null;M.sim.P[0][6]=M.sim.P[0][7]=null;return !closeSupport(M,0,9,null);})()`);
check('Players already assigned to the box do not abandon their runs for support',`(()=>{const M=setup();for(const i of[5,6,7]){const p=P_(M,0,i);p.x=23+i;p.y=27+i%2;}return !closeSupport(M,0,9,new Map([[5,[20,8]],[6,[34,10]],[7,[45,8]]]));})()`);
check('Support becomes a movement target rather than instant arrival',`(()=>{const M=setup();for(const i of[5,6,7]){const p=P_(M,0,i);p.x=23+i;p.y=27+i%2;}const a=closeSupport(M,0,9,null),p=P_(M,0,a.i),x=p.x,y=p.y;targets(M,true);const distance=hyp(p.tx-x,p.ty-y);movePlayers(M);return distance>0&&hyp(p.x-x,p.y-y)<distance&&hyp(p.x-x,p.y-y)<5;})()`);
check('A pressured attacker can prefer an open teammate with a better shooting position',`(()=>{const M=setup(),q=P_(M,0,8);q.x=27;q.y=8;q.vx=q.vy=0;P_(M,1,3).x=60;P_(M,1,3).y=4;M.sim.offC=null;const a=opts(M).all,pass=a.find(o=>o.k==='pass'&&o.j===8),shot=a.find(o=>o.k==='shot');return pass&&shot&&pass.v>shot.v;})()`);
console.log(JSON.stringify({passed:checks.length,checks},null,2));
