// Reuse the real browser engine in Node for fast, deterministic developer audits.
const vm = require('node:vm'), fs = require('node:fs'), path = require('node:path');
function createEngineQaRuntime(fetcher = fetch, options = {}) {
  const memory = new Map(), root = path.resolve(__dirname, '..');
  const math = Object.create(Math); math.random = options.random || Math.random;
  const ctx = vm.createContext({ performance, AbortController, setTimeout, clearTimeout, fetch: fetcher,
    Math: math,
    localStorage: { getItem: k => memory.get(k) || null, setItem: (k, v) => memory.set(k, v) }, G: { players: {} } });
  for (const file of ['js/core/util.js', 'js/core/data.js', 'js/core/competitions.js', 'js/core/england-fixtures.js', 'js/engine/pitch.js', 'js/engine/shape.js', 'js/engine/intent.js', 'js/engine/defending.js', 'js/engine/transitions.js', 'js/engine/match.js', 'js/systems/ai.js', 'js/systems/engine-qa.js']) {
    vm.runInContext(fs.readFileSync(path.join(root, file), 'utf8'), ctx, { filename: file });
  }
  return { ctx, run: source => vm.runInContext(source, ctx) };
}
module.exports = { createEngineQaRuntime };
