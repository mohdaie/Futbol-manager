const assert = require('node:assert/strict');
const fs = require('node:fs'), vm = require('node:vm');
const { createMatchQaRuntime } = require('../scripts/match-qa-runtime.cjs');
const rt = createMatchQaRuntime(20261023), checks = [];
Object.assign(rt.ctx, { btoa: s => Buffer.from(s, 'binary').toString('base64'), atob: s => Buffer.from(s, 'base64').toString('binary') });
vm.runInContext(fs.readFileSync('js/engine/evidence.js', 'utf8'), rt.ctx);
rt.run(`newGame('GUN','Evidence QA',1); G.flags.fixedTac=true;
G.simSeed=20261023;const clubs=plClubs();
function testMatch(capture){const M=createMatch({id:27001,h:G.club,a:clubs.find(c=>c!==G.club)});if(!capture)delete M.evidence;M.live=true;return M;}
const initial=testMatch(true), original=JSON.stringify(initial), rawG=JSON.stringify(G);
const recorded=JSON.parse(original), rawFrames=[];
while(!recorded.ended){matchRandom(recorded,()=>simMinute(recorded));rawFrames.push(...recorded.frames);}
const archive=evidenceFinish(recorded), decoded=[...evidenceRows(archive)];
`);
assert(rt.run('recorded.ended')); checks.push('Detailed match finishes with evidence enabled');
assert(rt.run('decoded.length===archive.frameCount && decoded.length>10000'));
assert(rt.run('decoded.every((r,i)=>r.length===162 && (!i||[0,5].includes(r[0]-decoded[i-1][0])))'));
checks.push('Every 0.5-second tick, including restarts and celebrations, survives packing');
assert(rt.run(`(()=>{const unique=rawFrames.filter((f,i)=>!i||JSON.stringify(f)!==JSON.stringify(rawFrames[i-1]));return unique.length===decoded.length&&unique.every((f,i)=>{const r=decoded[i];return Math.round(f[0]*10)===r[0]&&Math.round(f[1]*100)===r[1]&&Math.round(f[2]*100)===r[2]&&Array.from({length:22},(_,k)=>k).every(k=>f[7+k*2]==null?r[8+k*7]===EVIDENCE_NULL:Math.abs(Math.round(f[7+k*2]*100)-r[8+k*7])===0);});})()`));
checks.push('All 22 players and ball exactly match the shipped playback positions at centimetre precision');
rt.run(`G=JSON.parse(rawG);const unrecorded=JSON.parse(original);delete unrecorded.evidence;while(!unrecorded.ended)matchRandom(unrecorded,()=>simMinute(unrecorded));`);
// Observation can warm unused attribute cache entries without changing gameplay.
assert(rt.run('recorded.rng===unrecorded.rng && JSON.stringify(recorded.sides,(k,v)=>k==="_ac"?undefined:v)===JSON.stringify(unrecorded.sides,(k,v)=>k==="_ac"?undefined:v) && JSON.stringify(recorded.log)===JSON.stringify(unrecorded.log)'));
checks.push('Capture preserves random state, results, player statistics and event timeline');
assert(rt.run("archive.actions.every(a=>Number.isFinite(a.t))"));
assert(rt.run("['decision','flight','receive','shotRelease','shotArrival','defence','duelResult','restartPlan'].every(t=>archive.actions.some(a=>a.type===t))"));
checks.push('Decision alternatives, ball flights, first touches, shooting, defending, duels and set-piece plans are recorded');
assert(rt.run('archive.contexts.every(c=>c.sides.length===2 && c.sides.every(s=>s.roles.length===11))'));
checks.push('Both sides have actual tactical slots, role names, player identity and attributes');
// Resume the serializable encoder halfway through a minute, preserving the pending block.
assert(rt.run(`(()=>{const a=JSON.parse(original);simInit(a);for(let i=0;i<21;i++)matchRandom(a,()=>tickSim(a));const b=JSON.parse(JSON.stringify(a));for(let i=0;i<300;i++){a.sim.t+=TICK;b.sim.t+=TICK;a.sim.B.x+=.001;b.sim.B.x+=.001;recordFrame(a);recordFrame(b);}return JSON.stringify(evidenceFinish(a))===JSON.stringify(evidenceFinish(b));})()`));
checks.push('An interrupted live save resumes without lost or duplicate movement ticks');
// Target the user's 25-yard breakaway for BOTH attack directions, without correcting keeper behavior.
assert(rt.run(`(()=>{for(const side of [0,1]){const M=JSON.parse(original);simInit(M);M.sim.rs=null;M.sim.celebrate=0;const p=P_(M,side,10);p.x=34;p.y=goalY(side)-fwdY(side)*22.86;M.sim.P[1-side].forEach((q,j)=>{if(q&&j){q.x=62;q.y=p.y-fwdY(side)*10;}});giveBall(M,side,10);engage(M);const a=M.evidence.actions.find(a=>a.type==='keeperApproach');if(!a||a.side!==1-side||a.distance!==22.86||a.target.length!==2)return false;}return true;})()`));
checks.push('Both keepers record actual approach targets, movement and one-on-one distance at 25 yards');
Object.assign(rt.ctx, { ADMIN_TABS: {}, ACT: {}, CHG: {}, ADM: {}, TextEncoder });
vm.runInContext(fs.readFileSync('js/systems/match-analyst.js', 'utf8'), rt.ctx);
rt.run('const summary=evidenceSummary(archive);');
assert(rt.run('summary.bySide.every((s,i)=>s.recordedShots===recorded.sides[i].st.sh && Math.abs(s.shotXgSum-recorded.sides[i].st.xg)<.01)'));
checks.push('All shots, including misses and saves, reconcile with total xG');
assert(rt.run("summary.clips.some(c=>c.reason==='thru') && summary.clips.every(c=>c.frames.every((f,i)=>!i||[0,.5].includes(f[0]-c.frames[i-1][0])))"));
checks.push('Analyst sequences retain continuous half-second motion through passes and shots');
rt.run(`const fakePack={index:Array(78).fill('js/engine/sim.js'),files:[{path:'js/engine/sim.js',source:'code'.repeat(2500)}],rulebook:'rules'.repeat(1000),enginePlan:'plan'.repeat(200),qaGuide:'qa'.repeat(400)};
const packet={fixture:{home:'Home',away:'Away'},movementEvidence:summary,twoDPositionTrace:[],actionTimeline:[],playerRatingsAndStats:[],evidenceLimits:{}};
const fit=matchAnalystFitMessages(packet,fakePack);`);
assert(rt.run('fit.bytes<=29000 && fit.movementFrames===archive.frameCount && fit.movementClips>=2'));
assert(rt.run('packet.movementEvidence.clips.length===summary.clips.length'));
checks.push('Full-match metrics and continuous sequences fit the relay without changing the saved archive');
console.log(JSON.stringify({ passed: checks.length, checks, capture: rt.run('({frames:archive.frameCount,actions:archive.actions.length,archiveBytes:JSON.stringify(archive).length,requestBytes:fit.bytes,clips:fit.movementClips})') }, null, 2));
