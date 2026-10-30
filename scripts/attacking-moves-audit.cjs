// Seeded attacking-play audit: cut-back risk (offered vs actually cut out), clear decision mistakes, shot
// quality and how often the combination moves (one-two, first time, skill moves, rounding the keeper) are chosen.
// node scripts/attacking-moves-audit.cjs [root=.] [matches=20] [out.json]. Compare engines: run it on a copy of the old
// commit (root) and on this one with the same match count; the worlds and seeds are identical.
const root = process.argv[2] || require('path').resolve(__dirname, '..'), N = +process.argv[3] || 20, out = process.argv[4];
const { createMatchQaRuntime } = require(require('path').resolve(root) + '/scripts/match-qa-runtime.cjs');
const rt = createMatchQaRuntime(20261030);
rt.run(`newGame('GUL','Audit',1);G.flags.fixedTac=true;G.simSeed=20261030;G.club='QA-unmanaged';
const AUD={cut:[],shots:[],dec:0,top:0,bigMiss:0,moves:{},firstTime:0,give:0,cal:[]};
const _refine=refineShotChoice;refineShotChoice=function(M,s,i,o,p){_refine(M,s,i,o,p);M._opts=o;M._press=p;};
const _play=playOption;playOption=function(M,s,i,op,press){
  const opts=M._opts||[op];AUD.dec++;const best=opts.reduce((a,b)=>b.v>a.v?b:a);if(best===op)AUD.top++;if(best.v-op.v>.02)AUD.bigMiss++;
  AUD.moves[op.k+(op.move?':'+op.move:'')]=(AUD.moves[op.k+(op.move?':'+op.move:'')]||0)+1;
  const p=P_(M,s,i),[ox,oy]=toOwn(s,p.x,p.y);
  if(oy<.13&&Math.abs(ox-.5)>.12)opts.forEach(o=>{if(o.k!=='pass'&&o.k!=='onetwo')return;const dg=dGoal(s,o.tx,o.ty);if(dg<7||dg>20||Math.abs(o.tx-PW/2)>12)return;
    const lane=passRisk(M,s,p.x,p.y,o.tx,o.ty,false),face=Math.max(0,faceOff(p,o.tx,o.ty)-1.75)*.08*(1+press);
    AUD.cut.push({risk:o.risk,lane,face,press,rpress:o.rpress,picked:o===op,v:o.v,best:best.v,shot:(opts.find(x=>x.k==='shot')||{}).v});});
  if(op.k==='shot')AUD.shots.push({xg:op.xg,gap:best.v-op.v,d:dGoal(s,p.x,p.y),press});
  if(['pass','thru','long','onetwo'].includes(op.k)){const isCut=oy<.13&&Math.abs(ox-.5)>.12&&dGoal(s,op.tx,op.ty)<20&&dGoal(s,op.tx,op.ty)>7&&Math.abs(op.tx-PW/2)<12;M._pend={risk:op.risk,s,j:op.j,cut:isCut,k:op.k};}
  return _play(M,s,i,op,press);};
const _give=giveBall;giveBall=function(M,s,i){const q=M._pend;if(q){M._pend=null;AUD.cal.push([q.risk,s===q.s?0:1,q.cut?1:0,q.k]);}return _give(M,s,i);};
const _rest=setRestart;setRestart=function(M,k,s){const q=M._pend;if(q){M._pend=null;AUD.cal.push([q.risk,1,q.cut?1:0,q.k]);}return _rest(...arguments);};
const base=JSON.stringify(G),rows=[];
for(let k=0;k<${N};k++){G=JSON.parse(base);const clubs=k%3===2?Object.keys(G.clubs).filter(id=>G.clubs[id].league==='ECH'&&!G.clubs[id].backgroundOnly):plClubs();const n=(k*2)%clubs.length;const h=clubs[n],a=clubs[(n+1)%clubs.length];const styles=Object.keys(STYLES);applyStyle(G.clubs[h].tac,styles[k%styles.length]);applyStyle(G.clubs[a].tac,styles[(k+3)%styles.length]);
const M=createMatch({id:70000+k,h,a});while(!M.ended&&M.min<130)matchRandom(M,()=>{simMinute(M);M.sides.forEach(S=>injurySubs(M,S));});
rows.push({goals:M.sides.map(S=>S.st.g),shots:M.sides.map(S=>S.st.sh),sot:M.sides.map(S=>S.st.sot),xg:M.sides.map(S=>S.st.xg),pa:M.sides.map(S=>S.st.pa),pc:M.sides.map(S=>S.st.pc),fin:M.ended&&M.sim.P.every(P=>P.every(p=>!p||[p.x,p.y].every(Number.isFinite)))});}
AUD.rows=rows;`);
const A = rt.run('AUD'), R = A.rows, sum = f => R.reduce((n, r) => n + f(r), 0), m = N;
const cut = A.cut, sh = A.shots, avg = (a, f) => a.length ? a.reduce((n, x) => n + f(x), 0) / a.length : 0;
const res = {
  matches: m, finished: R.every(r => r.fin),
  goals: +(sum(r => r.goals[0] + r.goals[1]) / m).toFixed(2), shots: +(sum(r => r.shots[0] + r.shots[1]) / m).toFixed(2),
  sot: +(sum(r => r.sot[0] + r.sot[1]) / m).toFixed(2), xg: +(sum(r => r.xg[0] + r.xg[1]) / m).toFixed(2),
  passes: +(sum(r => r.pa[0] + r.pa[1]) / m).toFixed(0), passPct: +(100 * sum(r => r.pc[0] + r.pc[1]) / sum(r => r.pa[0] + r.pa[1])).toFixed(1),
  decisionsTopPct: +(100 * A.top / A.dec).toFixed(1), clearMistakePct: +(100 * A.bigMiss / A.dec).toFixed(2),
  cutbackOptions: cut.length, cutbackRisk: +avg(cut, x => x.risk).toFixed(3), cutbackRisk90: +(100 * avg(cut, x => x.risk >= .9)).toFixed(1),
  cutbackLane: +avg(cut, x => x.lane).toFixed(3), cutbackFace: +avg(cut, x => x.face).toFixed(3), cutbackPicked: cut.filter(x => x.picked).length,
  shotsLowXg: +(100 * avg(sh, x => x.xg < .03)).toFixed(1), shotXgAvg: +avg(sh, x => x.xg).toFixed(3), shotsOver25m: +(100 * avg(sh, x => x.d > 25)).toFixed(1),
  calib: (()=>{const o={};for(const [lo,hi] of [[0,.1],[.1,.2],[.2,.35],[.35,.5],[.5,.7],[.7,.9],[.9,1]]){const a=A.cal.filter(c=>c[0]>=lo&&c[0]<hi);o[lo+'-'+hi]=[a.length,+avg(a,c=>c[1]).toFixed(2)];}const c=A.cal.filter(c=>c[2]);o.cutback=[c.length,+avg(c,x=>x[0]).toFixed(2),+avg(c,x=>x[1]).toFixed(2)];return o;})(),
  shotsClearMistake: +(100 * avg(sh, x => x.gap > .02)).toFixed(1), moves: A.moves,
};
console.log(JSON.stringify(res, null, 1));
if (out) require('fs').writeFileSync(out, JSON.stringify(res, null, 1));
