// Actual browser database, migration, durable saves, failure recovery and backups.
// node tests/storage.cjs [server URL], with Playwright installed.
const { chromium } = require('playwright'), assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('node:path'), http = require('node:http');
(async () => {
  const root = path.resolve(__dirname, '..'), checks = [], errors = [];
  const server = http.createServer((req, res) => {
    const file = path.resolve(root, '.' + new URL(req.url, 'http://local').pathname.replace(/\/$/, '/index.html'));
    if (!file.startsWith(root + path.sep)) return res.writeHead(403).end();
    try { res.setHeader('Content-Type', ({ '.js': 'application/javascript', '.css': 'text/css', '.html': 'text/html' })[path.extname(file)] || 'application/octet-stream'); res.end(fs.readFileSync(file)); } catch { res.writeHead(404).end(); }
  });
  let browser;
  const check = (label, actual, expected = true) => { assert.deepEqual(actual, expected, label); checks.push(label); };
  try {
    if (!process.argv[2]) await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
    const base = process.argv[2] || 'http://127.0.0.1:' + server.address().port;
    browser = await chromium.launch({ headless: true, ...(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH, args: ['--no-sandbox', '--disable-dev-shm-usage'] } : {}) });
    const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const page = await context.newPage();
    page.on('pageerror', e => errors.push(e.message));
    await page.route('https://fonts.googleapis.com/**', r => r.abort());
    await page.goto(base); await page.locator('[data-a="titleNew"]').click(); await page.locator('[data-a="startGame"]').click();
    check('A new career commits to IndexedDB without a legacy localStorage save', await page.evaluate(async () => {
      await SaveStorage.flush(); const game = await SaveStorage.request('load');
      return !!game && game.club === G.club && Object.keys(game.players).length === Object.keys(G.players).length && !localStorage.getItem(SAVE_KEY);
    }));
    check('Repeated save requests coalesce into one durable checkpoint', await page.evaluate(async () => {
      await SaveStorage.flush(); let count = 0; const original = SaveStorage.worker.postMessage.bind(SaveStorage.worker);
      SaveStorage.worker.postMessage = data => { if (data.type === 'save') count++; original(data); };
      saveGame(); saveGame(); saveGame(); await SaveStorage.flush(); SaveStorage.worker.postMessage = original;
      return count === 1;
    }));
    check('Clock checkpoints store playtime without copying players or clubs', await page.evaluate(async () => {
      await SaveStorage.flush(); const sent = []; const original = SaveStorage.worker.postMessage.bind(SaveStorage.worker);
      SaveStorage.worker.postMessage = data => { sent.push(data); original(data); };
      const players = Object.keys(G.players).length; G.playtime.ms += 5000; saveClock();
      await new Promise(resolve => setTimeout(resolve, 300)); SaveStorage.worker.postMessage = original;
      const saved = await SaveStorage.request('load');
      const clock = sent.filter(message => message.type === 'saveWorld');
      return clock.length === 1 && !('players' in clock[0].data) && !('clubs' in clock[0].data) &&
        saved.playtime.ms === G.playtime.ms && Object.keys(saved.players).length === players;
    }));
    check('Closing during a real pending checkpoint is guarded until it commits', await page.evaluate(async () => {
      saveGame(); const event = new Event('beforeunload', { cancelable: true }); window.dispatchEvent(event);
      const protectedClose = event.defaultPrevented; await SaveStorage.flush();
      return protectedClose && SaveStorage.written === SaveStorage.dirty;
    }));
    check('Partial record deletion does not resurrect a retired player', await page.evaluate(async () => {
      const id = G.clubs.FA.squad.pop(); delete G.players[id]; saveGame(); await SaveStorage.flush();
      return !(await SaveStorage.request('load')).players[id];
    }));
    check('A failed worker serialization keeps the previous complete checkpoint', await page.evaluate(async () => {
      const old = await SaveStorage.request('load'), bad = SaveStorage.snapshot(); bad.flags = {}; bad.flags.cycle = bad.flags;
      let failed = false; try { await SaveStorage.request('save', bad); } catch { failed = true; }
      const now = await SaveStorage.request('load'); return failed && now.savedAt === old.savedAt && now.club === old.club;
    }));
    const legacy = await page.evaluate(async () => {
      G.manager = 'Legacy Å Manager'; G.week = 3; await saveGameAsync();
      const game = await SaveStorage.request('load'), json = JSON.stringify(game);
      await SaveStorage.request('delete'); localStorage.setItem(SAVE_KEY, json); return json;
    });
    await page.reload(); await page.waitForFunction(() => G && G.manager === 'Legacy Å Manager');
    check('Existing localStorage careers migrate and are read back correctly', await page.evaluate(async () => { const game = await SaveStorage.request('load'); return !SaveStorage.error && game.manager === 'Legacy Å Manager' && game.week === 3; }));
    check('The original legacy recovery copy is preserved byte for byte', await page.evaluate(() => localStorage.getItem(SAVE_KEY)), legacy);
    check('Later saves update IndexedDB while keeping the original recovery copy', await page.evaluate(async () => { G.manager = 'Updated career'; await saveGameAsync(); const game = await SaveStorage.request('load'); return game.manager === G.manager && JSON.parse(localStorage.getItem(SAVE_KEY)).manager === 'Legacy Å Manager'; }));
    await page.reload(); await page.waitForFunction(() => G && G.manager === 'Updated career');
    check('Reload prefers the latest IndexedDB checkpoint over the legacy copy', await page.evaluate(() => G.manager), 'Updated career');
    check('Saves beyond the old localStorage size limit work', await page.evaluate(async () => {
      G.flags.storageTest = 'x'.repeat(7 * 1024 * 1024); const success = await saveGameAsync();
      const saved = await SaveStorage.request('load'); delete G.flags.storageTest; await saveGameAsync();
      return success && saved.flags.storageTest.length === 7 * 1024 * 1024;
    }));
    check('JSON files and old save codes round-trip Unicode and career data', await page.evaluate(async () => {
      const snapshot = SaveStorage.snapshot(), json = await SaveStorage.request('export', snapshot), code = await SaveStorage.request('exportCode', snapshot);
      const a = await SaveStorage.request('import', json), b = await SaveStorage.request('import', code);
      return a.manager === G.manager && b.manager === G.manager && Object.keys(a.players).length === Object.keys(b.players).length;
    }));
    check('Explicit backups remain available if workers cannot run', await page.evaluate(async () => {
      const worker = SaveStorage.worker; SaveStorage.worker = null;
      try { const file = await SaveStorage.request('export', SaveStorage.snapshot()); return JSON.parse(file).game.manager === G.manager; }
      finally { SaveStorage.worker = worker; }
    }));
    check('Malformed backups cannot replace the career', await page.evaluate(async () => { const old = G; await importCareer('{"players":{},"clubs":{}}'); return G === old; }));
    await page.evaluate(() => go('settings'));
    await page.evaluate(() => { window.phoneFile = ''; window.showSaveFilePicker = async () => ({ createWritable: async () => ({ write: async text => { window.phoneFile = text; }, close: async () => {}, abort: async () => {} }) }); });
    await page.evaluate(() => ACT.savePhone());
    check('A supported phone file receives a portable career backup', await page.evaluate(() => JSON.parse(window.phoneFile).game.manager === G.manager));
    await page.evaluate(() => { window.showSaveFilePicker = undefined; });
    const downloadPromise = page.waitForEvent('download'); await page.evaluate(() => ACT.savePhone()); const download = await downloadPromise;
    const downloaded = JSON.parse(fs.readFileSync(await download.path(), 'utf8'));
    check('Browsers without file access receive a JSON download', downloaded.format, 'futbol-manager');
    const imported = structuredClone(downloaded); imported.game.manager = 'Imported file manager';
    await page.evaluate(() => ACT.importOpen());
    await page.setInputFiles('#importFile', { name: 'career.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(imported)) });
    await page.waitForFunction(() => G.manager === 'Imported file manager');
    check('Importing a phone file durably replaces the career', await page.evaluate(async () => (await SaveStorage.request('load')).manager), 'Imported file manager');
    const other = await page.context().newPage();
    await other.route('https://fonts.googleapis.com/**', r => r.abort()); await other.goto(base); await other.waitForFunction(() => !!G);
    await page.evaluate(async () => { G.week = 4; await saveGameAsync(); });
    check('A stale second tab cannot overwrite the latest saved career', await other.evaluate(async () => { G.week = 2; const success = await saveGameAsync(); const saved = await SaveStorage.request('load'); return !success && saved.week === 4; }));
    await other.close();
    await page.evaluate(() => go('settings'));
    await page.evaluate(() => { window.realRequest = SaveStorage.request; SaveStorage.request = function(type, data) { return type === 'save' ? Promise.reject(new Error('Disk full')) : window.realRequest.call(this, type, data); }; });
    await page.getByRole('button', { name: 'Save & return to title' }).click();
    await page.getByText('Saving failed. Stay here and export your save before leaving.').waitFor();
    check('Failed saves keep the user in Settings', await page.evaluate(() => UI.s), 'settings');
    await page.evaluate(async () => { SaveStorage.request = window.realRequest; await SaveStorage.flush(); });
    check('No browser errors', errors, []);
    console.log(JSON.stringify({ passed: checks.length, checks }, null, 2));
  } finally { if (browser) await browser.close(); server.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
