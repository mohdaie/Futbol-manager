// Run with Playwright installed: node tests/ai-limit.cjs [existing server URL]
// When the AI relay answers 429 (daily fair-use limit) the game pauses AI quietly and falls back to the engine.
const { chromium } = require('playwright');
const assert = require('node:assert/strict');

(async () => {
  const browser = await chromium.launch({ headless: true, ...(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH, args: ['--no-sandbox', '--disable-dev-shm-usage'] } : {}) });
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  const fs = require('node:fs'), path = require('node:path');
  const root = path.resolve(__dirname, '..');
  const server = require('node:http').createServer((req, res) => {
    const file = path.resolve(root, '.' + new URL(req.url, 'http://localhost').pathname.replace(/\/$/, '/index.html'));
    if (!file.startsWith(root + path.sep)) { res.writeHead(403).end(); return; }
    try {
      res.setHeader('Content-Type', ({ '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css', '.webp': 'image/webp' })[path.extname(file)] || 'application/octet-stream');
      res.end(fs.readFileSync(file));
    } catch { res.writeHead(404).end(); }
  });
  if (!process.argv[2]) await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const base = process.argv[2] || 'http://127.0.0.1:' + server.address().port;
  await page.route('https://fonts.googleapis.com/**', route => route.abort());
  let relayCalls = 0;
  await page.route('https://*.supabase.co/functions/v1/futbol-admin/**', route => route.abort());
  await page.route('https://*.supabase.co/functions/v1/futbol-{deepseek,jev}/**', route => { relayCalls++; route.fulfill({ status: 429, contentType: 'application/json', body: '{"error":"AI unavailable."}' }); });
  try {
    await page.goto(base + '/');
    await page.locator('[data-a="titleNew"]').click();
    await page.locator('[data-a="startGame"]').click();
    const r = await page.evaluate(async () => {
      const c = aiCfg();
      ['jev', 'ds'].forEach(k => { c[k].on = true; c[k].mode = 'proxy'; c[k].feat = { staff: true, briefing: true, engine: true, manager: true }; });
      const before = { ready: aiReady('ds', 'staff'), jev: aiReady('jev', 'briefing'), fails: aiUsage('ds').fails };
      let first = null;
      try { await dsChat([{ role: 'user', content: 'hi' }], 'test'); } catch (e) { first = { msg: e.message, limited: !!e.limited }; }
      const after = { ds: aiReady('ds', 'staff'), jev: aiReady('jev', 'briefing'), fails: aiUsage('ds').fails };
      let second = null;
      try { await jevAsk({}, { q: { type: 'choice', criteria: {} } }, 'test'); } catch (e) { second = e.message; }
      return { before, first, after, second, toasts: document.querySelectorAll('.toast').length };
    });
    assert.deepEqual(r.before, { ready: true, jev: true, fails: 0 });
    assert.deepEqual(r.first, { msg: 'AI unavailable.', limited: true });
    assert.deepEqual(r.after, { ds: false, jev: false, fails: 0 }, 'both services pause and the limit is not logged as a failure');
    assert.equal(r.second, 'AI unavailable.');
    assert.equal(relayCalls, 1, 'no further relay calls while paused');
    assert.deepEqual(errors, [], 'no browser runtime errors');
    console.log(JSON.stringify({ ok: true, relayCalls }));
  } finally { await browser.close(); server.close(); }
})().catch(e => { console.error(e); process.exit(1); });
