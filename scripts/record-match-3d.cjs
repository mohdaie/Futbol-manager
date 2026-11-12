// Records one full match from the real engine for the 3D viewer (match3d/).
// Run with Playwright installed: node scripts/record-match-3d.cjs
// Writes match3d/data/match.json (teams, marks, line-ups, frame times) and
// match3d/data/match.bin (Int16, 72 values a frame: ball, owner, restart, 22 players, 22 facings).
const { chromium } = require('playwright');
const fs = require('node:fs'), path = require('node:path');

(async () => {
  const root = path.resolve(__dirname, '..');
  const server = require('node:http').createServer((req, res) => {
    const file = path.resolve(root, '.' + new URL(req.url, 'http://localhost').pathname.replace(/\/$/, '/index.html'));
    if (!file.startsWith(root + path.sep)) { res.writeHead(403).end(); return; }
    try {
      res.setHeader('Content-Type', ({ '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css', '.webp': 'image/webp' })[path.extname(file)] || 'application/octet-stream');
      res.end(fs.readFileSync(file));
    } catch { res.writeHead(404).end(); }
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const browser = await chromium.launch({ headless: true, ...(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH, args: ['--no-sandbox', '--disable-dev-shm-usage'] } : {}) });
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  page.on('pageerror', e => console.error('page error:', e.message));
  await page.route('https://fonts.googleapis.com/**', route => route.abort());
  try {
    await page.goto('http://127.0.0.1:' + server.address().port + '/');
    await page.locator('[data-a="titleNew"]').click();
    await page.locator('[data-a="startGame"]').click();
    const out = await page.evaluate(() => {
      while (!userFixture()) advanceWeek();
      const fx = userFixture(), M = createMatch(fx);
      M.live = true;
      const RS = { thr: 1, gk: 2, ck: 3, fk: 4, pen: 5, ko: 6 };
      const frames = [], times = [], marks = [], seen = new Set(), lineups = [];
      const names = S => S.on.map(id => (id ? pname(G.players[id]) : null));
      let last = '';
      while (!M.ended && M.min < 130) {
        simMinute(M);
        const lu = [names(M.sides[0]), names(M.sides[1])], key = JSON.stringify(lu);
        if (key !== last) { last = key; lineups.push({ min: M.min, on: lu }); }
        for (const f of M.frames || []) {
          const row = [Math.round(f[1] * 100), Math.round(f[2] * 100), Math.round(f[3] * 100), f[4], f[5], RS[f[6]] || 0];
          for (let n = 7; n < 51; n++) row.push(f[n] == null ? -32768 : Math.round(f[n] * 100));
          for (let n = 51; n < 73; n++) row.push(f[n] == null ? 0 : Math.round(f[n] * 1000));
          times.push(f[0]); frames.push(row);
        }
        for (const m of M.marks || []) {
          if (seen.has(m)) continue;
          seen.add(m);
          const c = {};
          for (const k in m) { const v = m[k]; if (v == null || typeof v === 'object') continue; c[k] = typeof v === 'number' ? Math.round(v * 100) / 100 : v; }
          marks.push(c);
        }
      }
      const col = kitColors(M.sides[0].cid, M.sides[1].cid);
      const team = (S, c) => ({ name: clubName(S.cid), id: S.cid, shirt: c.f, trim: c.s || null, keeper: c.gk || null, goals: S.st.g });
      return { pitch: [PW, PL], tick: TICK, minutes: M.min, teams: [team(M.sides[0], col[0]), team(M.sides[1], col[1])], colors: col, lineups, marks, times, frames };
    });
    const flat = new Int16Array(out.frames.length * 72);
    out.frames.forEach((row, k) => flat.set(row, k * 72));
    const dir = path.join(root, 'match3d', 'data');
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, 'match.bin'), Buffer.from(flat.buffer));
    const meta = { ...out, frames: out.frames.length };
    fs.writeFileSync(path.join(dir, 'match.json'), JSON.stringify(meta));
    console.log(`${out.teams[0].name} ${out.teams[0].goals}-${out.teams[1].goals} ${out.teams[1].name}: ${out.frames.length} frames, ${out.marks.length} marks, ${out.minutes} minutes`);
    console.log('colors', JSON.stringify(out.colors));
  } finally {
    await browser.close();
    server.close();
  }
})().catch(e => { console.error(e); process.exit(1); });
