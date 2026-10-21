'use strict';
// Freeze the local cohort/window at the loss, then recover if the press fails.
function counterpressWindow(S, cohort) {
  if (!cohort.length) return 5;
  let quality = 0, condition = 0;
  for (const i of cohort) {
    const p = G.players[S.on[i]];
    quality += p ? clamp(((p.at[A.wor] + p.at[A.sta]) / 2 - 1) / 19, 0, 1) : 0;
    condition += clamp((S.cond[S.on[i]] ?? 100) / 100, 0, 1);
  }
  return 5 + 3 * quality / cohort.length * condition / cohort.length;
}
function beginCounterpress(M, s, x, y) {
  const sim = M.sim, S = M.sides[s];
  sim.counterpress = null;
  if (!S || (S.lost ?? 1) !== 2 || sim.rs) return;
  const cohort = sim.P[s].map((p, i) => p && i ? { i, d: hyp(p.x-x,p.y-y) } : null)
    .filter(p => p && p.d <= 20).sort((a,b) => a.d-b.d).slice(0,4).map(p => p.i);
  const until = sim.t + counterpressWindow(S, cohort);
  sim.counterpress = { s, t:sim.t, x,y,cohort,until,broken:cohort.length<3,
    recoverUntil:cohort.length<3 ? sim.t+4 : 0, reason:cohort.length<3 ? 'isolated' : null };
}
function counterpressState(M, s) {
  const sim = M.sim, c = sim.counterpress;
  if (!c || c.s !== s || sim.rs || sim.poss === s || (M.sides[s].lost ?? 1) !== 2) return { active:false, recover:false };
  if (!c.broken) {
    const live = c.cohort.filter(i => sim.P[s][i]);
    const fw = fwdY(1-s), progress = (sim.B.y-c.y)*fw;
    const bypassed = live.filter(i => (sim.B.y-sim.P[s][i].y)*fw>2).length;
    if (live.filter(i => hyp(sim.P[s][i].x-sim.B.x,sim.P[s][i].y-sim.B.y)<24).length<3 || sim.t>=c.until || progress>8 && bypassed>=2) {
      c.broken=true; c.recoverUntil=sim.t+4;
      c.reason=sim.t>=c.until?'expired':progress>8 && bypassed>=2?'bypassed':'isolated';
    }
  }
  return { active:!c.broken, recover:c.broken && sim.t<c.recoverUntil, cohort:c.cohort, reason:c.reason };
}
const TRANSITIONS_SOURCE = [counterpressWindow,beginCounterpress,counterpressState].map(String).join('\n');
