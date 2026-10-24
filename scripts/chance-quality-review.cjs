// Thirty seeded detailed matches: 10 Reds/Seagulls, 10 varied Premier League, 10 varied Championship.
// node scripts/chance-quality-review.cjs [output.json]
const {createMatchQaRuntime}=require('./match-qa-runtime.cjs');
const fs=require('fs');const rt=createMatchQaRuntime(20261024);
rt.run(`newGame('GUL','Attack QA',1);G.flags.fixedTac=true;G.simSeed=20261024;G.club='QA-unmanaged';
function auditTac(cid,ip,oop,names,opts){const t=G.clubs[cid].tac;Object.assign(t,opts,{ip,oop});t.roles=FORMATIONS[ip].map((p,i)=>Math.max(0,ROLES[p[0]].findIndex(r=>r.n===names[i])));}
auditTac('GUL','4-3-3','4-3-3',['Goalkeeper','Full-Back','Centre-Back','Centre-Back','Full-Back','Deep-Lying Playmaker','Playmaker','Box-to-Box','Inside Forward','Advanced Forward','Inside Forward'],{ment:3,tempo:0,width:1,press:2,line:2,pass:0,won:0,lost:2});
auditTac('RED','4-4-2','4-4-2',['Ball-Playing Keeper','Wing-Back','Ball-Playing Defender','Stopper','Wing-Back','Wide Midfielder','Playmaker','Playmaker','Winger','False Nine','Target Forward'],{ment:2,tempo:1,width:2,press:1,line:1,pass:2,won:1,lost:1});
const auditBase=JSON.stringify(G),baseKick=kick,baseGive=giveBall;
kick=function(M,s,i,k,tx,ty,j,o){if(M.audit&&o?.kind==='header'&&k==='pass')M.audit.knockdowns++;if(M.audit&&['pass','long','thru'].includes(k)&&transition(M,s)==='ctr'){M.audit.counterPasses++;if((ty-P_(M,s,i).y)*fwdY(s)<-2)M.audit.counterBack++;}return baseKick(...arguments);};
giveBall=function(M,s,i){if(M.audit&&i===0&&M.sim.B.fl?.k==='cross'&&M.sim.B.fl.s!==s){const p=P_(M,s,i),gap=hyp(p.x-M.sim.B.x,p.y-M.sim.B.y);if(gap>2)M.audit.farClaims++;}return baseGive(...arguments);};
const savedShoot=shoot;shoot=function(M,s,i,o){const r=savedShoot(...arguments);const ev=M.sim.B.fl?.ev;if(M.audit&&ev){M.audit.shotXg+=ev.xg;M.audit.lowShots+=ev.xg<=.02001;}return r;};const auditRows=[];const auditStart=performance.now();
for(let k=0;k<30;k++){G=JSON.parse(auditBase);let h=k%2?'RED':'GUL',a=k%2?'GUL':'RED',group='recorded-tactics';
if(k>=10){const clubs=k<20?plClubs():Object.keys(G.clubs).filter(id=>G.clubs[id].league==='ECH'&&!G.clubs[id].backgroundOnly);const n=(k%10)*2;h=clubs[n%clubs.length];a=clubs[(n+1)%clubs.length];group=k<20?'premier-league-varied':'championship-varied';const styles=Object.keys(STYLES);applyStyle(G.clubs[h].tac,styles[k%styles.length]);applyStyle(G.clubs[a].tac,styles[(k+2)%styles.length]);}
const M=createMatch({id:50000+k,h,a});M.audit={counterPasses:0,counterBack:0,farClaims:0,knockdowns:0,lowShots:0,shotXg:0};while(!M.ended&&M.min<130)matchRandom(M,()=>{simMinute(M);M.sides.forEach(S=>injurySubs(M,S));});auditRows.push({match:k+1,group,home:h,away:a,finished:M.ended,styles:M.sides.map(S=>styleOf(S)||'custom'),goals:M.sides.map(S=>S.st.g),shots:M.sides.map(S=>S.st.sh),sot:M.sides.map(S=>S.st.sot),xg:M.sides.map(S=>+S.st.xg.toFixed(2)),passes:M.sides.map(S=>S.st.pa),...M.audit,finite:M.sim.P.every(P=>P.every(p=>!p||[p.x,p.y,p.vx,p.vy].every(Number.isFinite)))});}
`);
const rows=rt.run('auditRows');const sum=k=>rows.reduce((n,r)=>n+(Array.isArray(r[k])?r[k].reduce((a,b)=>a+b,0):r[k]||0),0);
const result={matches:30,finished:rows.every(r=>r.finished),goals:sum('goals'),shots:sum('shots'),sot:sum('sot'),passes:sum('passes'),counterPasses:sum('counterPasses'),counterBack:sum('counterBack'),farClaims:sum('farClaims'),knockdowns:sum('knockdowns'),lowShots:sum('lowShots'),shotXg:sum('shotXg'),allFinite:rows.every(r=>r.finite),rows,ms:rt.run('Math.round(performance.now()-auditStart)')};
result.groups=Object.fromEntries([...new Set(rows.map(r=>r.group))].map(group=>{const a=rows.filter(r=>r.group===group);return [group,{matches:a.length,goals:a.reduce((n,r)=>n+r.goals[0]+r.goals[1],0),shots:a.reduce((n,r)=>n+r.shots[0]+r.shots[1],0),sot:a.reduce((n,r)=>n+r.sot[0]+r.sot[1],0),xg:a.reduce((n,r)=>n+r.shotXg,0),lowShots:a.reduce((n,r)=>n+r.lowShots,0),farClaims:a.reduce((n,r)=>n+r.farClaims,0)}];}));
if(!result.finished||!result.allFinite||result.farClaims!==0)process.exitCode=1;
if(process.argv[2])fs.writeFileSync(process.argv[2],JSON.stringify(result,null,2));console.log(JSON.stringify({...result,rows:undefined}));
