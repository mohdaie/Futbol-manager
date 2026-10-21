// node scripts/analysis-render.cjs <dir with match.json> [--at 12.5,30] [--avg]
// Average-position maps (each team in and out of possession) and labelled freeze-frames from an analysis run.
// Home (blue) is drawn attacking UP. Rendered in Chromium (CHROMIUM_PATH) so labels are real text.
const fs = require('node:fs'), path = require('node:path');
const { chromium } = require('playwright');
const dir = process.argv[2], arg = (k, d) => { const i = process.argv.indexOf(k); return i < 0 ? d : process.argv[i + 1]; };
const m = JSON.parse(fs.readFileSync(path.join(dir, 'match.json'), 'utf8'));
const pos = s => m.roles[s].map(r => r ? r.split(':')[0] : null);
// Frame layout: [min, t, bx, by, bz, os, oi, rs, then 22 x (x, y)]
const P = (f, s, i) => [f[8 + (s * 11 + i) * 2], f[9 + (s * 11 + i) * 2]];
function averages() {
  const acc = [[[], []], [[], []]]; // [team][state 0 = own ball, 1 = their ball]
  for (const f of m.frames) {
    if (f[5] < 0 || f[7]) continue;
    for (let s = 0; s < 2; s++) { const st = f[5] === s ? 0 : 1; for (let i = 0; i < 11; i++) { const [x, y] = P(f, s, i); if (x == null) continue; const a = acc[s][st][i] || (acc[s][st][i] = [0, 0, 0]); a[0] += x; a[1] += y; a[2]++; } }
  }
  return acc.map(t => t.map(st => st.map(a => a ? [a[0] / a[2], a[1] / a[2]] : null)));
}
const page = d => `<!doctype html><html><body style="margin:0;background:#0d1f18;font:12px system-ui;color:#e8efe9">${d}</body></html>`;
function pitchSvg(players, ball, title, lines) {
  const W = 340, H = 525, sx = x => 10 + x / 68 * (W - 20), sy = y => 10 + y / 105 * (H - 20);
  let g = `<rect x="0" y="0" width="${W}" height="${H}" fill="#2a7f45"/><rect x="${sx(0)}" y="${sy(0)}" width="${sx(68) - sx(0)}" height="${sy(105) - sy(0)}" fill="none" stroke="#dfe" />`;
  g += `<line x1="${sx(0)}" y1="${sy(52.5)}" x2="${sx(68)}" y2="${sy(52.5)}" stroke="#dfe"/>`;
  for (const y0 of [0, 88.5]) g += `<rect x="${sx(13.84)}" y="${sy(y0)}" width="${sx(54.16) - sx(13.84)}" height="${sy(16.5) - sy(0)}" fill="none" stroke="#dfe"/>`;
  for (const x of [13.8, 24.8, 43.2, 54.2]) g += `<line x1="${sx(x)}" y1="${sy(0)}" x2="${sx(x)}" y2="${sy(105)}" stroke="#ffffff22" stroke-dasharray="4 4"/>`;
  for (const y of [35, 70]) g += `<line x1="${sx(0)}" y1="${sy(y)}" x2="${sx(68)}" y2="${sy(y)}" stroke="#ffffff22" stroke-dasharray="4 4"/>`;
  (lines || []).forEach(l => { g += `<line x1="${sx(0)}" y1="${sy(l.y)}" x2="${sx(68)}" y2="${sy(l.y)}" stroke="${l.c}" stroke-width="1.5" stroke-dasharray="6 3"/>`; });
  players.forEach(p => { if (!p) return; g += `<circle cx="${sx(p.x)}" cy="${sy(p.y)}" r="9" fill="${p.c}" stroke="#fff" stroke-width="1"/><text x="${sx(p.x)}" y="${sy(p.y) + 3}" font-size="7.5" text-anchor="middle" fill="#fff">${p.l}</text>`; });
  if (ball) g += `<circle cx="${sx(ball[0])}" cy="${sy(ball[1])}" r="4" fill="#fff" stroke="#000"/>`;
  return `<div style="display:inline-block;margin:6px;vertical-align:top"><div style="padding:4px 2px">${title}</div><svg width="${W}" height="${H}">${g}</svg></div>`;
}
// Home attacks Y = 0 already (up). Away attacks Y = 105: mirror the away team's own-ball map so both attack up.
const flip = ([x, y]) => [68 - x, 105 - y];
(async () => {
  const b = await chromium.launch({ headless: true, ...(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH, args: ['--no-sandbox'] } : {}) });
  const pg = await b.newPage({ viewport: { width: 1450, height: 600 } });
  if (process.argv.includes('--avg')) {
    const av = averages(), C = ['#2f6fe0', '#d9343a'], name = [m.home + ' (home, blue)', m.away + ' (away, red)'];
    let html = '';
    for (let s = 0; s < 2; s++) for (let st = 0; st < 2; st++) {
      const pl = av[s][st].map((p, i) => p ? (() => { const [x, y] = s === 1 ? flip(p) : p; return { x, y, c: C[s], l: pos(s)[i] }; })() : null);
      html += pitchSvg(pl, null, `${name[s]} - ${st === 0 ? 'IN possession' : 'OUT of possession'} (attacking up)`);
    }
    await pg.setContent(page(html)); await pg.screenshot({ path: path.join(dir, 'average-positions.png'), fullPage: true });
  }
  const at = arg('--at', null);
  if (at) for (const T of at.split(',').map(Number)) {
    const f = m.frames.reduce((a, c) => (Math.abs(c[1] - T) < Math.abs(a[1] - T) ? c : a));
    const pl = []; for (let s = 0; s < 2; s++) for (let i = 0; i < 11; i++) { const [x, y] = P(f, s, i); if (x != null) pl.push({ x, y, c: ['#2f6fe0', '#d9343a'][s], l: pos(s)[i] + (f[5] === s && f[6] === i ? '*' : '') }); }
    const own = f[5] >= 0 ? ['home', 'away'][f[5]] + ' ball' : 'loose/air';
    await pg.setContent(page(pitchSvg(pl, [f[2], f[3]], `${f[0]}' t=${f[1]}s ${own}${f[7] ? ' restart ' + f[7] : ''} (home blue attacks up)`)));
    await pg.screenshot({ path: path.join(dir, `frame-${T}.png`), clip: { x: 0, y: 0, width: 360, height: 570 } });
  }
  await b.close();
})().catch(e => { console.error(e); process.exitCode = 1; });
