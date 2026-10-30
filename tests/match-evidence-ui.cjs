const ADMIN_LOGIN = '#access_token=e30.eyJlbWFpbCI6ImFkbWluQHRlc3QuZXhhbXBsZSIsImV4cCI6NDEwMjQ0NDgwMH0.sig'; // a test session (the server is mocked or not called)
const { chromium } = require('playwright'), assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('node:path'), http = require('node:http');
(async () => {
  const root = path.resolve(__dirname, '..'), errors = [], checks = [];
  const server = http.createServer((req, res) => {
    const file = path.resolve(root, '.' + new URL(req.url, 'http://local').pathname.replace(/\/$/, '/index.html'));
    if (!file.startsWith(root + path.sep)) return res.writeHead(403).end();
    try { res.setHeader('Content-Type', ({ '.js': 'application/javascript', '.css': 'text/css', '.html': 'text/html' })[path.extname(file)] || 'application/octet-stream'); res.end(fs.readFileSync(file)); } catch { res.writeHead(404).end(); }
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  let browser;
  try {
    browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium', headless: true, args: ['--no-sandbox', '--disable-dev-shm-usage'] });
    const context = await browser.newContext({ viewport: { width: 390, height: 844 }, permissions: ['clipboard-read', 'clipboard-write'] });
    const page = await context.newPage(); page.on('pageerror', e => errors.push(e.message));
    await page.route('https://fonts.googleapis.com/**', r => r.abort());
    await page.goto('http://127.0.0.1:' + server.address().port);
    await page.locator('[data-a="titleNew"]').click(); await page.locator('[data-a="startGame"]').click();
    const result = await page.evaluate(async () => {
      const fx = G.fixtures.find(f => isUserFx(f)), M = createMatch(fx), input = Simulation.input(M), local = structuredClone(input.match);
      matchRandom(local, () => simMinute(local));
      const remote = (await Simulation.request('minute', input)).match;
      const parity = local.rng === remote.rng && JSON.stringify(local.evidence) === JSON.stringify(remote.evidence);
      const raw = evidenceFinish(local), before = JSON.stringify(raw);
      fx.evidence = raw; fx.hg = 0; fx.ag = 0; fx.stats = local.sides.map(S => S.st);
      await evidenceArchiveFixture(fx, G);
      const restored = await evidenceLoad(fx.evidence);
      const roundtrip = JSON.stringify(restored) === before;
      G.matchAnalyses = [{ fid: fx.id, at: Date.now(), text: 'Complete test report\nBoth teams: movement, decisions and keeper approach.', model: 'test', auditVersion: 3, movementFrames: raw.frameCount, movementClips: 2 }];
      await saveGameAsync();
      return { fid: fx.id, parity, roundtrip, compressed: !!fx.evidence.encoding, frames: raw.frameCount, rawBytes: before.length, compressedBytes: JSON.stringify(fx.evidence).length };
    });
    const toAdmin = async () => { await page.evaluate(async () => { saveGame(); await SaveStorage.flush(); }); await page.goto('http://127.0.0.1:' + server.address().port + '/admin/' + ADMIN_LOGIN); await page.waitForFunction(() => window.ADMIN_PAGE && typeof G !== 'undefined' && G && UI.s === 'admin'); };
    await toAdmin();
    await page.evaluate(fid => { UI.tab.adm = 'match'; ADM.matchAnalystFid = fid; render(); }, result.fid);
    assert(result.parity); checks.push('Simulation worker and main thread record identical movement and decisions');
    assert(result.roundtrip && result.compressed); checks.push('Lossless background compression restores every frame and action');
    await page.locator('[data-a="matchAnalystCopy"]').click();
    assert.equal(await page.evaluate(() => navigator.clipboard.readText()), 'Complete test report\nBoth teams: movement, decisions and keeper approach.');
    checks.push('Copy report still copies the complete text');
    const downloading = page.waitForEvent('download'); await page.locator('[data-a="matchAnalystDownload"]').click();
    const download = await downloading, data = JSON.parse(fs.readFileSync(await download.path(), 'utf8'));
    assert.equal(data.frames.length, result.frames); assert(data.frames.every(r => r.length === 162));
    assert(data.actions.length > 0 && data.roster && data.contexts.length > 0);
    checks.push('Download exports all decoded frames, actions, identities, attributes and tactics');
    await page.reload();
    const saved = await page.evaluate(async () => { await SaveStorage.ready; const game = SaveStorage.cached; const e = game.fixtures.find(f => f.evidence)?.evidence; const raw = await evidenceLoad(e); return { frames: raw.frameCount, decoded: [...evidenceRows(raw)].length }; });
    assert.equal(saved.frames, result.frames); assert.equal(saved.decoded, result.frames);
    checks.push('Compressed recordings survive durable save and browser reload');
    assert.deepEqual(errors, []);
    console.log(JSON.stringify({ passed: checks.length, checks, result }, null, 2));
  } finally { await browser?.close(); server.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
