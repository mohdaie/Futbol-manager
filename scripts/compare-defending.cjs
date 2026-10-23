// node scripts/compare-defending.cjs base.json head.json out.json
// base.json / head.json: `node scripts/engine-qa.cjs --matches N` output from two commits (same seed and N).
// Writes per-metric batch means, deltas and a standard error from the per-match rows (match runs are not paired,
// so |z| below 2 is not a clear difference).
const fs = require('node:fs');
const [basePath, headPath, outPath] = process.argv.slice(2);
if (!basePath || !headPath || !outPath) throw new Error('usage: compare-defending.cjs base.json head.json out.json');
const load = f => { const j = JSON.parse(fs.readFileSync(f, 'utf8')); return j.match || j; };
const base = load(basePath), head = load(headPath);
if (base.seed !== head.seed || base.matches !== head.matches) throw new Error('batches must share seed and match count');
const METRICS = ['goals', 'shots', 'onTarget', 'lineBreaks', 'openAfterBreak', 'backOpenAfterBreak', 'counterpressStarts', 'defensiveFrames', 'trapFrames', 'stepFrames', 'dropFrames', 'defensiveViolations'];
const mean = xs => xs.reduce((s, x) => s + x, 0) / xs.length;
const se = xs => { const m = mean(xs); return Math.sqrt(xs.reduce((s, x) => s + (x - m) ** 2, 0) / (xs.length - 1) / xs.length); };
const round = (x, d = 3) => +x.toFixed(d);
const metrics = METRICS.map(k => {
  const a = base.rows.map(r => r[k]), b = head.rows.map(r => r[k]);
  const d = mean(b) - mean(a), sed = Math.sqrt(se(a) ** 2 + se(b) ** 2);
  return { metric: k, base: round(mean(a)), head: round(mean(b)), delta: round(d), se: round(sed), z: round(d / sed, 2) };
});
const out = { description: `Seed ${base.seed}, ${base.matches} fixed-tactic matches per side: base ${basePath} vs head ${headPath}. Unpaired; |z| < 2 is not a clear difference.`, seed: base.seed, matches: base.matches, base: { commit: process.env.BASE_COMMIT || null }, head: { commit: process.env.HEAD_COMMIT || null }, metrics };
fs.writeFileSync(outPath, JSON.stringify(out, null, 2) + '\n');
console.log(metrics.map(m => `${m.metric.padEnd(20)} ${String(m.base).padStart(9)} ${String(m.head).padStart(9)} z=${m.z}`).join('\n'));
