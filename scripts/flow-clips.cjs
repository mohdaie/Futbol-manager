// node scripts/flow-clips.cjs [--seed 20261021] [--scenario 0..7] [--out docs/flow-clips]
// Renders short top-down clips of real simulated passages (frames recorded by the engine) to MP4.
// Blue: pressing side, red: direct side, white: ball. Needs ffmpeg.
const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm'), { spawnSync } = require('node:child_process');
const { createMatchQaRuntime } = require('./match-qa-runtime.cjs');
const arg = (k, d) => { const i = process.argv.indexOf(k); return i < 0 ? d : process.argv[i + 1]; };
const seed = Number(arg('--seed', 20261021)), sc = Number(arg('--scenario', 0)), outDir = arg('--out', 'docs/flow-clips');
const cfgs = []; for (const pSt of [1, 2]) for (const dSt of [1, 2]) for (const swap of [false, true]) cfgs.push({ name: `press ${pSt}ST v direct ${dSt}ST${swap ? ' (swapped)' : ''}`, pSt, dSt, swap });
const rt = createMatchQaRuntime(seed);
vm.runInContext(fs.readFileSync(path.join(__dirname, 'flow-scan.js'), 'utf8'), rt.ctx, { filename: 'flow-scan.js' });
rt.ctx.CFG = { ...cfgs[sc], n: sc, seed, pair: 0, live: true };
const res = rt.run(`(() => { newGame(CLUBS[0].id, 'Flow QA', 1); G.flags.fixedTac = true; FLOW_BASE = JSON.stringify(G); const r = flowMatch(CFG); return { frames: r.frames, ev: r.M.flow.events, p: r.M.flow.p, sum: flowSummary(r.M, CFG), pos: r.M.sides.map(S => FORMATIONS[S.ip].map(x => x[0])) }; })()`);
fs.mkdirSync(outDir, { recursive: true });
const W = 340, H = 520, sx = x => 10 + x / 68 * (W - 20), sy = y => 10 + y / 105 * (H - 20);
function frameImg(f, label) {
  const buf = Buffer.alloc(W * H * 3);
  const px = (x, y, c) => { x |= 0; y |= 0; if (x < 0 || y < 0 || x >= W || y >= H) return; const o = (y * W + x) * 3; buf[o] = c[0]; buf[o + 1] = c[1]; buf[o + 2] = c[2]; };
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) px(x, y, ((y / 40) | 0) % 2 ? [38, 120, 60] : [44, 132, 66]);
  const line = (x0, y0, x1, y1) => { const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0)) | 0; for (let k = 0; k <= n; k++) px(x0 + (x1 - x0) * k / (n || 1), y0 + (y1 - y0) * k / (n || 1), [220, 230, 220]); };
  const rect = (x0, y0, x1, y1) => { line(sx(x0), sy(y0), sx(x1), sy(y0)); line(sx(x1), sy(y0), sx(x1), sy(y1)); line(sx(x1), sy(y1), sx(x0), sy(y1)); line(sx(x0), sy(y1), sx(x0), sy(y0)); };
  rect(0, 0, 68, 105); line(sx(0), sy(52.5), sx(68), sy(52.5)); rect(13.84, 0, 54.16, 16.5); rect(13.84, 88.5, 54.16, 105); rect(24.84, 0, 43.16, 5.5); rect(24.84, 99.5, 43.16, 105);
  const disc = (x, y, r, c) => { for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) if (dx * dx + dy * dy <= r * r) px(sx(x) + dx, sy(y) + dy, c); };
  for (let s = 0; s < 2; s++) for (let i = 0; i < 11; i++) { const x = f[8 + (s * 11 + i) * 2], y = f[9 + (s * 11 + i) * 2]; if (x == null) continue; disc(x, y, 6, s === res.p ? [40, 110, 230] : [220, 50, 50]); if (i === 0) disc(x, y, 2, [255, 230, 0]); }
  disc(f[2], f[3], 3 + Math.min(4, f[4] * 0.6), [255, 255, 255]);
  return buf;
}
// Second-by-second description of a clip for Jev (who cannot watch video): who has the ball, where (third and
// lane from the direct side's point of view), numbers near the ball, and changes of possession or flight.
const side = s => (s === res.p ? 'blue(press)' : 'red(direct)');
function where(x, y) {
  const d = res.p === 0 ? y : 105 - y; // distance from the direct side's own goal line (away attacks +Y)
  const third = d < 35 ? "red's defensive third" : d < 70 ? 'middle third' : "red's attacking third";
  const lx = res.p === 0 ? x : 68 - x, lane = lx < 13.8 ? 'left wing' : lx < 24.8 ? 'left half-space' : lx < 43.2 ? 'centre' : lx < 54.2 ? 'right half-space' : 'right wing';
  return third + ', ' + lane;
}
function describe(sel) {
  const out = [], t0 = sel[0][1];
  let last = '';
  for (let k = 0; k < sel.length; k += 2) {
    const f = sel[k], bx = f[2], by = f[3], bz = f[4], os = f[5], oi = f[6], rs = f[7];
    const near = [0, 1].map(s => { let n = 0; for (let i = 0; i < 11; i++) { const x = f[8 + (s * 11 + i) * 2], y = f[9 + (s * 11 + i) * 2]; if (x != null && Math.hypot(x - bx, y - by) < 12) n++; } return n; });
    const g = sel[k + 1] || f, moving = Math.hypot(g[2] - bx, g[3] - by) > 2.5; // over 5 m/s: a pass, not a loose ball
    const who = rs ? 'restart ' + rs : os >= 0 ? side(os) + ' ' + res.pos[os][oi] + ' on the ball' : bz > 1 ? 'ball in the air' : moving ? 'ground pass' : 'loose ball';
    const line = `${(f[1] - t0).toFixed(0)}s ${who}, ${where(bx, by)}; within 12 m: blue ${near[res.p]}, red ${near[1 - res.p]}`;
    if (line.split(';')[0] !== last || k % 6 === 0) out.push(line);
    last = line.split(';')[0];
  }
  return out.slice(0, 16);
}
const fr = res.frames, made = [], kinds = {};
for (const e of res.ev) {
  if ((kinds[e.k] = (kinds[e.k] || 0) + 1) > 2) continue; // two clips of each kind
  const sel = fr.filter(f => f[0] === e.min && f[1] >= e.t - 8 && f[1] <= e.t + 7);
  if (sel.length < 10) continue;
  const name = `${e.k}-${e.min}m-${Math.round(e.t)}.mp4`, file = path.join(outDir, name);
  // Interpolate to 10 fps (engine frames are 0.5 s apart) and play at real speed.
  const imgs = [];
  for (let k = 0; k < sel.length - 1; k++) for (let u = 0; u < 5; u++) imgs.push(frameImg(sel[k].map((v, n) => n < 2 || v == null || sel[k + 1][n] == null || typeof v !== 'number' ? v : v + (sel[k + 1][n] - v) * u / 5)));
  const r = spawnSync('ffmpeg', ['-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', `${W}x${H}`, '-r', '10', '-i', '-', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', file], { input: Buffer.concat(imgs) });
  if (r.status === 0) { const timeline = describe(sel); fs.writeFileSync(file.replace(/\.mp4$/, '.txt'), timeline.join('\n') + '\n'); made.push({ file, kind: e.k, minute: e.min, at: e.t, timeline }); }
}
console.log(JSON.stringify({ scenario: res.sum.scenario, pressingSide: res.p ? 'away (blue)' : 'home (blue)', clips: made }, null, 2));
