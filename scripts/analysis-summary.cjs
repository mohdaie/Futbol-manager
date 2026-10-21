// node scripts/analysis-summary.cjs <dir with match.json>
// The analyst's numbers for a recorded half: line heights by ball zone (from each team's own goal), passes back
// to the keeper, lofted passes backwards, passes per possession, possession. Used to compare before/after.
const fs = require('node:fs'), path = require('node:path');
const m = JSON.parse(fs.readFileSync(path.join(process.argv[2], 'match.json'), 'utf8'));
const P = (f, s, i) => [f[8 + (s * 11 + i) * 2], f[9 + (s * 11 + i) * 2]];
const pos = s => m.roles[s].map(r => r && r.split(':')[0]);
const own = (s, y) => (s === 0 ? 105 - y : y);
const acc = {};
for (const f of m.frames) {
  if (f[5] < 0 || f[7]) continue;
  for (const t of [0, 1]) {
  const s = t, bd = own(f[5], f[3]), zone = bd < 35 ? 'own third' : bd < 70 ? 'middle third' : 'final third';
  const ys = pos(s).map((p, i) => p && p !== 'GK' ? { p, d: own(s, P(f, s, i)[1]) } : null).filter(Boolean);
  const av = a => a.reduce((x, y) => x + y, 0) / a.length, k = ['home', 'away'][s] + (t === f[5] ? ' WITH ball, ball in its ' + zone : ' WITHOUT ball, opponent ball in its ' + zone);
  const a = acc[k] || (acc[k] = { n: 0, back: 0, mid: 0, front: 0, len: 0 });
  a.n++; a.back += av(ys.filter(q => /^D[LCR]$/.test(q.p)).map(q => q.d)); a.mid += av(ys.filter(q => /^(M|DM)/.test(q.p)).map(q => q.d));
  a.front += av(ys.filter(q => /^(ST|AM)/.test(q.p)).map(q => q.d)); a.len += Math.max(...ys.map(q => q.d)) - Math.min(...ys.map(q => q.d));
  }
}
const lines = Object.fromEntries(Object.entries(acc).sort().map(([k, a]) => [k, `back ${(a.back / a.n).toFixed(0)} | mid ${(a.mid / a.n).toFixed(0)} | front ${(a.front / a.n).toFixed(0)} | length ${(a.len / a.n).toFixed(0)} m (${a.n} frames)`]));
const kicks = m.log.filter(e => e.e === 'kick');
const has = m.log.filter(e => e.e === 'has');
let chains = [0, 0], passes = [0, 0], last = -1;
for (const e of m.log) { if (e.e === 'has' && e.side !== last) { chains[e.side]++; last = e.side; } if (e.e === 'kick' && ['pass', 'long', 'thru', 'cross'].includes(e.k)) passes[e.side]++; }
const by = (s, f) => kicks.filter(e => e.side === s && f(e)).length;
console.log(JSON.stringify({
  score: m.score, possessionPct: m.stats.map(x => Math.round(100 * x.poss / (m.stats[0].poss + m.stats[1].poss))), shots: m.stats.map(x => x.sh),
  passesPerPossession: [0, 1].map(s => +(passes[s] / Math.max(1, chains[s])).toFixed(1)),
  passesToOwnKeeper: [0, 1].map(s => by(s, e => e.to === 'GK' && e.k !== 'shot')),
  loftedBackwards: [0, 1].map(s => by(s, e => e.k === 'long' && /^(GK|DC)$/.test(e.to))),
  centreBackCarries: [0, 1].map(s => has.filter(e => e.side === s && e.who === 'DC' && /middle|final/.test(e.z)).length),
  lines }, null, 1));
