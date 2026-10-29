// The /admin page (the whole admin, running on this browser's career), Settings, and the game's use of
// server AI settings, with the Supabase API mocked. Run: node tests/admin-page.cjs
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('node:path'), http = require('node:http');
(async () => {
  const root = path.resolve(__dirname, '..'), checks = [], errors = [];
  const check = (name, actual, expected) => { assert.deepStrictEqual(actual, expected, name); checks.push(name); };
  const server = http.createServer((req, res) => {
    let file = path.resolve(root, '.' + new URL(req.url, 'http://x').pathname);
    if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, 'index.html');
    if (!file.startsWith(root + path.sep)) { res.writeHead(403).end(); return; }
    try { res.setHeader('Content-Type', ({ '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css', '.webp': 'image/webp' })[path.extname(file)] || 'application/octet-stream'); res.end(fs.readFileSync(file)); } catch { res.writeHead(404).end(); }
  });
  await new Promise(r => server.listen(0, '127.0.0.1', r));
  const base = 'http://127.0.0.1:' + server.address().port;

  // Both pages must load the same game code, in the same order (the admin page adds one file at the end).
  const scripts = f => [...fs.readFileSync(path.join(root, f), 'utf8').matchAll(/<script src="(js\/[^"?]+)/g)].map(m => m[1]);
  check('admin page loads every game script, in order, plus admin-services.js', scripts('admin/index.html'), [...scripts('index.html'), 'js/ui/admin-services.js']);
  check('admin page resolves URLs from the game root', fs.readFileSync(path.join(root, 'admin/index.html'), 'utf8').includes('<base href="../">'), true);

  const browser = await chromium.launch({ headless: true, ...(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH, args: ['--no-sandbox', '--disable-dev-shm-usage'] } : {}) });
  try {
    const feat = k => Object.fromEntries(k.map(x => [x, true]));
    const db = { keys: { jev: false, ds: false }, last4: {}, settings: {
      jev: { on: false, model: 'jev-latest', timeout: 10000, budget: 2, feat: feat(['engine', 'briefing', 'manager', 'react', 'transfer', 'advice']) },
      ds: { on: false, model: 'deepseek-flash', thinking: false, maxTokens: 300, temp: 0.7, timeout: 20000, budget: 2, feat: feat(['briefing', 'second', 'press', 'talks', 'report', 'staff', 'agents', 'news', 'match']) } } };
    const keyInfo = () => ({ jev: db.keys.jev ? { set: true, last4: db.last4.jev } : { set: false }, ds: db.keys.ds ? { set: true, last4: db.last4.ds } : { set: false } });
    const calls = [];
    const mock = async page => page.route('https://wkzrefbvjxqphkrduyqj.supabase.co/functions/v1/futbol-admin/**', async route => {
      const req = route.request(), p = new URL(req.url()).pathname.replace(/.*futbol-admin/, ''), body = req.postData() ? JSON.parse(req.postData()) : null;
      calls.push([req.method(), p, body]);
      const ok = data => route.fulfill({ status: 200, contentType: 'application/json', headers: { 'access-control-allow-origin': '*' }, body: JSON.stringify(data) });
      if (req.method() === 'OPTIONS') return route.fulfill({ status: 204, headers: { 'access-control-allow-origin': '*', 'access-control-allow-methods': '*', 'access-control-allow-headers': '*' } });
      if (p === '/state') return ok({ settings: db.settings, keys: keyInfo() });
      if (p === '/config') return ok({ settings: db.settings, keys: { jev: db.keys.jev, ds: db.keys.ds } });
      if (p === '/secret' && req.method() === 'PUT') { const s = body.service; db.keys[s] = true; db.last4[s] = body.value.slice(-4); return ok({ keys: keyInfo() }); }
      if (p.startsWith('/secret') && req.method() === 'DELETE') { db.keys[new URL(req.url()).searchParams.get('service')] = false; return ok({ keys: keyInfo() }); }
      if (p === '/settings') { Object.assign(db.settings, Object.fromEntries(Object.entries(body).map(([k, v]) => [k, { ...db.settings[k], ...v }]))); return ok({ settings: db.settings }); }
      if (p === '/test') return ok({ ok: true, ms: 120, detail: 'Key accepted.' });
      if (p === '/usage') return ok({ month: [{ provider: 'ds', calls: 3, fails: 0, input: 10, output: 5, ms: 90, cost: 0.001, installs: 2 }], total: [], features: [], days: [] });
      return route.fulfill({ status: 404, body: '{}' });
    });
    const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true });
    const open = async () => { const page = await context.newPage(); page.on('pageerror', e => errors.push(e.message)); page.on('dialog', d => d.accept()); await page.route('https://fonts.googleapis.com/**', r => r.abort()); await mock(page); return page; };

    // ---- /admin with no career in this browser
    const admin = await open();
    await admin.goto(base + '/admin/');
    await admin.waitForSelector('#svc-ds-model, .card .tag');
    check('without a career only AI keys is offered', [await admin.locator('.tabs button').allTextContents(), (await admin.locator('.banner').textContent()).includes('No career')], [['AI keys'], true]);

    // ---- the game: settings hold everything a player needs, and there is no Admin
    const game = await open();
    await game.goto(base + '/');
    await game.locator('[data-a="titleNew"]').click(); await game.locator('[data-a="startGame"]').click();
    await game.evaluate(() => go('more'));
    check('More has no Admin entry', (await game.locator('.main').innerText()).includes('Admin'), false);
    check('More still lists Settings', (await game.locator('.main').innerText()).includes('Settings'), true);
    await game.evaluate(() => go('settings'));
    const settingsText = await game.locator('.main').innerText();
    check('Settings has name, portrait, camera, highlights, speed, saving and new game', ['Manager name', 'Manager portrait', 'Match camera', 'Match highlights', 'Default match speed', 'Save game', 'New game'].map(t => settingsText.includes(t)), Array(7).fill(true));
    await game.fill('#setMgr', 'Test Boss'); await game.locator('[data-a=setMgrName]').click();
    await game.locator('[data-a=setCam][data-v=full]').click(); await game.locator('[data-a=setHl][data-v=key]').click(); await game.locator('[data-a=speed][data-v="4"]').click();
    check('settings are applied to the career', await game.evaluate(() => [G.manager, G.settings.cam, G.settings.hl, G.settings.speed]), ['Test Boss', 'full', 'key', 4]);
    check('the in-game admin screen is gone', await game.evaluate(() => { go('admin'); return document.getElementById('app').innerText.includes('Moved') && !document.getElementById('app').innerText.includes('Overview'); }), true);
    await game.evaluate(async () => { go('home'); saveGame(); await SaveStorage.flush(); });

    // ---- /admin with the career: every tab, and AI keys
    await admin.reload();
    await admin.waitForFunction(() => window.ADMIN_PAGE && G && UI.s === 'admin');
    check('the admin page offers every admin tab', await admin.locator('.tabs button').allTextContents(), ['AI keys', 'Overview', 'Clubs', 'Players', 'Time', 'Engine', 'AI Brain', 'AI Staff', 'Match Analyst', 'Data']);
    check('it opens the career from this browser', await admin.evaluate(() => G.manager), 'Test Boss');
    check('no game navigation is shown', await admin.locator('.tabs2, .bottombar').count(), 0);
    for (const t of ['over', 'club', 'play', 'time', 'eng', 'brain', 'staff', 'match', 'data']) {
      await admin.evaluate(t => { UI.tab.adm = t; render(); }, t);
      check('tab ' + t + ' renders', (await admin.locator('.main').innerText()).length > 40, true);
    }
    check('saving tools are not in the admin Data tab', (await admin.locator('.main').innerText()).includes('Delete save'), false);
    await admin.evaluate(() => { UI.tab.adm = 'svc'; render(); });
    await admin.waitForSelector('#svc-ds-key');
    check('the key field is a password input', await admin.locator('#svc-ds-key').getAttribute('type'), 'password');
    await admin.fill('#svc-ds-key', 'sk-test-key-9876');
    await admin.locator('[data-a=svcKeySave][data-svc=ds]').click();
    await admin.waitForFunction(() => document.body.innerText.includes('Key saved ••••9876'));
    check('the saved key is not in the page', (await admin.content()).includes('sk-test-key'), false);
    await admin.locator('[data-a=svcTest][data-svc=ds]').click();
    await admin.waitForSelector('.aitest.ok');
    check('test reports success', (await admin.locator('.aitest').textContent()).startsWith('Connected'), true);
    await admin.check('#svc-ds-on'); await admin.selectOption('#svc-ds-model', 'deepseek-v4-pro'); await admin.fill('#svc-ds-temp', '1.2'); await admin.uncheck('.svc-ds-feat[data-k=press]');
    await admin.locator('[data-a=svcSave][data-svc=ds]').click();
    await admin.waitForFunction(() => document.body.innerText.includes('On in the game'));
    const saved = calls.filter(c => c[1] === '/settings').at(-1)[2].ds;
    check('settings are sent as entered', [saved.on, saved.model, saved.temp, saved.feat.press, saved.feat.news], [true, 'deepseek-v4-pro', 1.2, false, true]);
    await admin.locator('[data-a=svcUsage]').click(); await admin.waitForFunction(() => document.body.innerText.includes('3 calls'));
    check('usage loads', true, true);
    await admin.locator('[data-a=svcKeyDel][data-svc=ds]').click();
    await admin.waitForFunction(() => !document.body.innerText.includes('••••9876'));
    check('removing a key updates the card', (await admin.locator('.card .tag').first().textContent()).trim(), 'No key');
    check('no sideways scrolling at 390px', await admin.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);

    // ---- opening the admin page pauses open game tabs, so two tabs never write one save
    check('an open game tab pauses when the admin page opens', await game.locator('#adminPause').count(), 1);
    check('a paused game tab stops saving', await game.evaluate(() => [SaveStorage.paused, saveGame()]), [true, false]);
    await admin.evaluate(() => { UI.tab.adm = 'data'; render(); ACT.admMoney({ v: String(10e6) }); });
    const bal = await admin.evaluate(() => Math.round(userClub().bal));
    await admin.waitForFunction(() => SaveStorage.dirty === SaveStorage.written && SaveStorage.dirty > 0, null, { timeout: 15000 });
    check('the admin edit is written to the career', await admin.evaluate(() => SaveStorage.error), null);
    await game.locator('#adminResume').click();
    await game.waitForFunction(() => typeof G !== 'undefined' && G && document.getElementById('adminPause') === null);
    check('after resuming, the game sees the admin edit', await game.evaluate(() => Math.round(userClub().bal)), bal);

    // ---- the game takes its AI settings from the server
    db.keys.ds = true; db.last4.ds = '9876'; db.settings.ds.on = true; db.settings.ds.model = 'deepseek-v4-pro'; db.settings.ds.feat.press = false; db.settings.jev.on = true; // jev has no key
    await game.reload();
    await game.waitForFunction(() => typeof aiCfg === 'function' && aiCfg().ds.mode === 'proxy');
    check('a service with a server key runs in Server key mode with the admin settings', await game.evaluate(() => { const c = aiCfg().ds; return [c.on, c.mode, c.key, c.model, c.feat.press, aiReady('ds', 'second'), aiReady('ds', 'press')]; }), [true, 'proxy', '', 'deepseek-v4-pro', false, true, false]);
    check('a service without a server key stays off', await game.evaluate(() => [aiCfg().jev.on, aiReady('jev', 'engine')]), [false, false]);
    check('no API key is stored in the browser', await game.evaluate(() => /"key":"[^"]/.test(localStorage.getItem(AI_KEY))), false);
    check('no page errors', errors, []);
    console.log(JSON.stringify({ passed: checks.length, checks }, null, 1));
  } finally { await browser.close(); server.close(); }
})().catch(e => { console.error(e); process.exit(1); });
