// Fixed-tactic, seeded full matches using the shipped engine. No browser,
// teacher calls, cloud writes, copied engine logic or career data are required.
const { createEngineQaRuntime } = require('./engine-qa-runtime.cjs');
const vm = require('node:vm'), fs = require('node:fs'), path = require('node:path');
function seededRandom(seed) {
  let a = seed >>> 0;
  return () => { a += 0x6D2B79F5; let t = a; t = Math.imul(t ^ t >>> 15, t | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61); return ((t ^ t >>> 14) >>> 0) / 4294967296; };
}
function createMatchQaRuntime(seed = 20261021, fetcher = fetch) {
  const rt = createEngineQaRuntime(fetcher, { random: seededRandom(seed) }), root = path.resolve(__dirname, '..');
  rt.ctx.MATCH_QA_SEED = seed;
  // Host-only DOM/timer facade for the real playtime module. No UI is running.
  Object.assign(rt.ctx, { window: { addEventListener() {} }, document: { hidden: true, addEventListener() {}, getElementById() { return null; } }, setInterval() { return 0; } });
  for (const file of ['js/core/rosters.js', 'js/core/profiles.js', 'js/core/england-rosters.js', 'js/core/players.js', 'js/core/england-players.js', 'js/core/bio.js', 'js/core/state.js', 'js/core/playtime.js', 'js/core/calendar.js', 'js/engine/sim.js', 'js/systems/training.js']) {
    vm.runInContext(fs.readFileSync(path.join(root, file), 'utf8'), rt.ctx, { filename: file });
  }
  rt.run('G={players:{}}'); // synthetic shape audit precedes newGame() in the CLI
  vm.runInContext(fs.readFileSync(path.join(root, 'scripts/match-qa-scan.js'), 'utf8'), rt.ctx, { filename: 'scripts/match-qa-scan.js' });
  return rt;
}
module.exports = { createMatchQaRuntime, seededRandom };
