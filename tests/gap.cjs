// A sent-off player is not replaced: the manager can move a team-mate into the gap (match.js moveIntoGap).
// Real engine code; no provider calls.
const assert = require('node:assert/strict');
const { createMatchQaRuntime } = require('../scripts/match-qa-runtime.cjs');
const rt = createMatchQaRuntime(), checks = [];
const check = (name, source) => { assert.ok(rt.run(source), name); checks.push(name); };
rt.run(`
newGame(CLUBS[0].id,'Gap QA',1); const gc=plClubs();
function setupGap() {
  const M = createMatch({ id: -741, h: gc[0], a: gc[1] }); simInit(M);
  const S = M.sides[0], P = M.sim.P[0];
  // Ten players left: the one at slot 4 has just been sent off.
  S.on = S.on.map((id, i) => (i === 4 ? null : id)); P[4] = null;
  M.sim.B.os = 0; M.sim.B.oi = 7;
  return { M, S, P };
}
`);
check('a team-mate moves into the gap and leaves his slot empty', `(() => { const { M, S, P } = setupGap(); const id = S.on[7], q = P[7];
  const ok = moveIntoGap(M, S, id, 4); return ok && S.on[4] === id && S.on[7] === null && P[4] === q && P[7] === null; })()`);
check('the ball carrier follows the player who moves', `(() => { const { M, S, P } = setupGap(); const id = S.on[7];
  moveIntoGap(M, S, id, 4); return M.sim.B.oi === 4; })()`);
check('a move into an occupied slot is refused', `(() => { const { M, S } = setupGap(); const before = S.on.slice();
  const ok = moveIntoGap(M, S, S.on[7], 3); return ok === false && S.on.every((x, i) => x === before[i]); })()`);
check('a player who is not on the pitch cannot be moved', `(() => { const { M, S } = setupGap(); return moveIntoGap(M, S, -1, 4) === false; })()`);
check('a dismissal records the side and the slot it leaves', `(() => { const { M, S } = setupGap(); const id = S.on[2]; const ev = { min: 1, side: 1, t: 'foul', pid: id };
  sendOff(M, S, id, ev); return ev.t === 'red' && ev.off === 0 && ev.slot === 2 && S.on[2] === null; })()`);
check('two outfield players swap places and the ball follows the carrier', `(() => { const { M, S, P } = setupGap(); const a = S.on[2], b = S.on[7], pa = P[2], pb = P[7];
  const ok = swapInMatch(M, S, 2, 7); return ok && S.on[2] === b && S.on[7] === a && P[2] === pb && P[7] === pa && M.sim.B.oi === 2; })()`);
check('a keeper does not swap with an outfield player', `(() => { const { M, S } = setupGap(); return swapInMatch(M, S, 0, 3) === false; })()`);
check('the computer side closes its gap with ten men, keeper in goal', `(() => { const { M, S } = setupGap(); const keeper = S.on[0];
  fillGapAI(M, S); const on = S.on.filter(Boolean); return on.length === 10 && S.on[0] === keeper && S.on.indexOf(null) >= 0 && new Set(on).size === 10; })()`);
console.log(`gap checks passed: ${checks.length}`);
