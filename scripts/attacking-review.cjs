// Exactly ten seeded, detailed matches using the supplied Seagulls/Eagles tactical matchup.
// node scripts/attacking-review.cjs [output.json]
const {createMatchQaRuntime}=require('./match-qa-runtime.cjs');
const fs=require('fs');const rt=createMatchQaRuntime(20261023);
rt.run(`newGame('GUL','Attack QA',1);G.flags.fixedTac=true;G.simSeed=20261023;G.club='QA-unmanaged';
function auditTac(cid,ip,oop,names,opts){const t=G.clubs[cid].tac;Object.assign(t,opts,{ip,oop});t.roles=FORMATIONS[ip].map((p,i)=>Math.max(0,ROLES[p[0]].findIndex(r=>r.n===names[i])));}
auditTac('GUL','4-3-3','4-3-3',['Goalkeeper','Full-Back','Centre-Back','Centre-Back','Full-Back','Ball-Winner','Box-to-Box','Box-to-Box','Inside Forward','Pressing Forward','Inside Forward'],{ment:3,tempo:2,width:1,press:1,line:1,pass:1,won:2,lost:2});
auditTac('EAG','4-4-2','4-4-2',['Goalkeeper','Full-Back','Stopper','Stopper','Inverted Full-Back','Winger','Playmaker','Playmaker','Wide Midfielder','Target Forward','Target Forward'],{ment:2,tempo:1,width:2,press:1,line:1,pass:2,won:1,lost:1});
const auditBase=JSON.stringify(G),baseKick=kick,baseGive=giveBall;
kick=function(M,s,i,k,tx,ty,j,o){if(M.audit&&o?.kind==='header'&&k==='pass')M.audit.knockdowns++;if(M.audit&&['pass','long','thru'].includes(k)&&transition(M,s)==='ctr'){M.audit.counterPasses++;if((ty-P_(M,s,i).y)*fwdY(s)<-2)M.audit.counterBack++;}return baseKick(...arguments);};
giveBall=function(M,s,i){if(M.audit&&i===0&&M.sim.B.fl?.k==='cross'&&M.sim.B.fl.s!==s){const p=P_(M,s,i),gap=hyp(p.x-M.sim.B.x,p.y-M.sim.B.y);if(gap>2)M.audit.farClaims++;}return baseGive(...arguments);};
const auditRows=[];const auditStart=performance.now();
for(let k=0;k<10;k++){G=JSON.parse(auditBase);const M=createMatch({id:50000+k,h:k%2?'EAG':'GUL',a:k%2?'GUL':'EAG'});M.audit={counterPasses:0,counterBack:0,farClaims:0,knockdowns:0};while(!M.ended)matchRandom(M,()=>{simMinute(M);M.sides.forEach(S=>injurySubs(M,S));});auditRows.push({match:k+1,goals:M.sides.map(S=>S.st.g),shots:M.sides.map(S=>S.st.sh),sot:M.sides.map(S=>S.st.sot),xg:M.sides.map(S=>+S.st.xg.toFixed(2)),passes:M.sides.map(S=>S.st.pa),...M.audit,finite:M.sim.P.every(P=>P.every(p=>!p||[p.x,p.y,p.vx,p.vy].every(Number.isFinite)))});}
`);
const rows=rt.run('auditRows');const sum=k=>rows.reduce((n,r)=>n+(Array.isArray(r[k])?r[k].reduce((a,b)=>a+b,0):r[k]||0),0);
const result={matches:10,goals:sum('goals'),shots:sum('shots'),sot:sum('sot'),passes:sum('passes'),counterPasses:sum('counterPasses'),counterBack:sum('counterBack'),farClaims:sum('farClaims'),knockdowns:sum('knockdowns'),allFinite:rows.every(r=>r.finite),rows,ms:rt.run('Math.round(performance.now()-auditStart)')};
if(process.argv[2])fs.writeFileSync(process.argv[2],JSON.stringify(result,null,2));console.log(JSON.stringify({...result,rows:undefined}));
