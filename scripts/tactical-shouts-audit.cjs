// Tactical shouts, paired: the same seeded matches with no shout and with the home side giving each shout at
// minute 30. "kept" holds it to full time (the shout's real effect); "auto" lets the staff review keep or revert it.
// node scripts/tactical-shouts-audit.cjs [matches=12] [out.json] [only=shoot,wide] (MODE=kept or MODE=auto runs one mode only)
const N = +process.argv[2] || 12, out = process.argv[3], only = process.argv[4] ? process.argv[4].split(',') : null;
const { createMatchQaRuntime } = require('./match-qa-runtime.cjs');
const rows = {};
for (const k of ['none', 'shoot', 'wide', 'deeper', 'higher', 'calm'].filter(k => !only || k === 'none' || only.includes(k))) for (const mode of k === 'none' ? ['none'] : ['kept', 'auto']) {
  if (process.env.MODE && k !== 'none' && mode !== process.env.MODE) continue;
  const rt = createMatchQaRuntime(20261031);
  rows[k + ':' + mode] = rt.run(`newGame('GUL','Audit',1);G.flags.fixedTac=true;G.simSeed=20261031;G.club='QA-unmanaged';
  const base=JSON.stringify(G),acc={m:0,xgF:0,xgA:0,shF:0,shA:0,gF:0,gA:0,cr:0,pos:0,hr:0,da:0,res:{}};
  for(let n=0;n<${N};n++){G=JSON.parse(base);const c=plClubs(),h=c[(n*2)%c.length],a=c[(n*2+1)%c.length];
    const M=createMatch({id:90000+n,h,a});let snap=null;
    while(!M.ended&&M.min<130)matchRandom(M,()=>{simMinute(M);M.sides.forEach(S=>injurySubs(M,S));
      if(M.min===30){const S=M.sides[0],O=M.sides[1];snap=[S.st.xg,O.st.xg,S.st.sh,O.st.sh,S.st.g,O.st.g,S.st.cr||0,S.st.pos,O.st.pos,S.st.hr||0,S.st.da||0];
        if('${k}'!=='none'){tacticalShout(M,S,'${k}');if('${mode}'==='kept')tacticalShoutKeep(M,S);}}
      (M.mev||[]).forEach(e=>{if(e.t==='tsh'&&e.side===0&&e.res!=='start')acc.res[e.res]=(acc.res[e.res]||0)+1;});});
    const S=M.sides[0],O=M.sides[1];acc.m++;acc.xgF+=S.st.xg-snap[0];acc.xgA+=O.st.xg-snap[1];acc.shF+=S.st.sh-snap[2];acc.shA+=O.st.sh-snap[3];acc.gF+=S.st.g-snap[4];acc.gA+=O.st.g-snap[5];
    acc.cr+=(S.st.cr||0)-snap[6];acc.pos+=(S.st.pos-snap[7])/((S.st.pos-snap[7])+(O.st.pos-snap[8])||1);acc.hr+=(S.st.hr||0)-snap[9];acc.da+=(S.st.da||0)-snap[10];}
  acc`);
}
const fmt = r => ({ xgFor: +(r.xgF / r.m).toFixed(2), xgAgainst: +(r.xgA / r.m).toFixed(2), shotsFor: +(r.shF / r.m).toFixed(1), shotsAgainst: +(r.shA / r.m).toFixed(1),
  goals: (r.gF / r.m).toFixed(2) + '-' + (r.gA / r.m).toFixed(2), crosses: +(r.cr / r.m).toFixed(1), possession: Math.round(100 * r.pos / r.m) + '%', highRegains: +(r.hr / r.m).toFixed(1), attacks: +(r.da / r.m).toFixed(1), review: r.res });
const res = Object.fromEntries(Object.entries(rows).map(([k, r]) => [k, fmt(r)]));
console.log('Home side, minute 30 to full time, per match (' + N + ' matches each):');
console.table(Object.fromEntries(Object.entries(res).map(([k, r]) => [k, { ...r, review: JSON.stringify(r.review) }])));
if (out) require('fs').writeFileSync(out, JSON.stringify(res, null, 1));
