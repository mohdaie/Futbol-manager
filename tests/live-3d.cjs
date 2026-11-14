// The 3D tab of the live match: it loads, is fed by the match as it is played, survives a substitution and a
// change of tab, and leaves the 2D view working. Needs Playwright (CHROMIUM_PATH and NODE_PATH in the cloud container).
const { chromium } = require('playwright');
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert');
(async () => {
  const root = path.resolve(__dirname, '..'), types = { '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css', '.json': 'application/json', '.webp': 'image/webp' };
  const server = require('node:http').createServer((req, res) => {
    const file = path.resolve(root, '.' + new URL(req.url, 'http://x').pathname.replace(/\/$/, '/index.html'));
    if (!file.startsWith(root + path.sep)) { res.writeHead(403).end(); return; }
    try { res.setHeader('Content-Type', types[path.extname(file)] || 'application/octet-stream'); res.end(fs.readFileSync(file)); } catch { res.writeHead(404).end(); }
  });
  await new Promise(r => server.listen(0, '127.0.0.1', r));
  const browser = await chromium.launch({ headless: true, ...(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {}), args: ['--no-sandbox', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.route('https://fonts.googleapis.com/**', r => r.abort());
  try {
    await page.goto('http://127.0.0.1:' + server.address().port + '/');
    await page.locator('[data-a="titleNew"]').click();
    await page.locator('[data-a="startGame"]').click();
    await page.evaluate(() => { while (!userFixture()) advanceWeek(); startLive(userFixture()); });
    await page.waitForSelector('#matchTab-3d');
    assert.equal(await page.evaluate(() => LIVE.matchView), '2d', '2D is the default view');
    assert.equal(await page.evaluate(() => !!LIVE3D.mod), false, 'nothing 3D is loaded until it is asked for');
    await page.locator('#matchTab-3d').click();
    await page.waitForFunction(() => LIVE.v3 && (LIVE.v3.api || LIVE.v3.failed), null, { timeout: 120000 });
    assert.equal(await page.evaluate(() => !!LIVE.v3.api), true, 'the 3D view started');
    assert.ok(await page.evaluate(() => LIVE.v3.api.frames) >= 2, 'it shows the players before kick-off');
    // play some minutes at the top speed, full highlights, so every minute is fed and shown
    await page.evaluate(() => { G.settings.speed = 4; G.settings.hl = 'full'; LIVE.paused = false; });
    await page.waitForFunction(() => LIVE.M.min >= 3 && LIVE.v3.api.frames > 300, null, { timeout: 240000 });
    const t1 = await page.evaluate(() => LIVE.v3.api.time);
    await page.waitForTimeout(1500);
    assert.ok(await page.evaluate(() => LIVE.v3.api.time) > t1, 'the 3D clock follows the match');
    assert.ok(await page.evaluate(() => LIVE.v3.api.cuesOf('Pass')) > 5, 'actions are animated');
    // a substitution changes the man in the slot
    const swapped = await page.evaluate(() => { const S = LIVE.M.sides[LIVE.bottom], before = pname(G.players[S.on[9]]); const tmp = S.on[9]; S.on[9] = S.bench[0]; S.bench[0] = tmp; LIVE.M.sim.P[LIVE.bottom][9].id = S.on[9]; return before !== pname(G.players[S.on[9]]); });
    assert.ok(swapped);
    await page.waitForFunction(m => LIVE.M.min >= m, await page.evaluate(() => LIVE.M.min + 2), { timeout: 240000 });
    // camera and shadows buttons, then another tab and back, then 2D
    const cam0 = await page.evaluate(() => LIVE.v3.api.cam), shade0 = await page.evaluate(() => LIVE.v3.api.shadows);
    await page.locator('#m3Cam').click(); await page.locator('#m3Shade').click();
    assert.notEqual(await page.evaluate(() => LIVE.v3.api.cam), cam0, 'the camera button changes the camera');
    assert.equal(await page.evaluate(() => LIVE.v3.api.shadows), !shade0, 'the shadows button switches them');
    await page.locator('#matchTab-stats').click();
    await page.locator('#matchTab-3d').click();
    assert.equal(await page.evaluate(() => document.querySelector('#matchPanel-3d .m3-host canvas') === LIVE.v3.api.canvas), true, 'the same canvas comes back');
    if (process.env.SHOT) await page.screenshot({ path: process.env.SHOT });
    await page.locator('#matchTab-2d').click();
    await page.waitForTimeout(500);
    assert.equal(await page.evaluate(() => LIVE.matchView), '2d');
    assert.equal([...new Set(errors)].slice(0, 5).join(' || '), '', 'no page errors');
    console.log('live-3d: ok');
  } finally { await browser.close(); server.close(); }
})().catch(e => { console.error(e); process.exit(1); });
