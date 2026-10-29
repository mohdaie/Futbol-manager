// /admin page and the game's use of server settings, with the Supabase API mocked. Run: node tests/admin-page.cjs
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
      if (p === '/usage') return ok({ month: [{ provider: 'ds', calls: 3, fails: 0, cost: 0.001, installs: 2 }], total: [], features: [], days: [] });
      return route.fulfill({ status: 404, body: '{}' });
    });

    // ---- /admin page
    const page = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true });
    page.on('pageerror', e => errors.push(e.message)); page.on('dialog', d => d.accept());
    await mock(page);
    await page.goto(base + '/admin/');
    await page.waitForSelector('#svc-jev');
    check('both services are listed with no key', [await page.locator('.card h2').allTextContents()].map(a => a.slice(0, 2))[0], ['Jev (TypeSafe)', 'DeepSeek']);
    check('the key field is a password input', await page.locator('#ds-key').getAttribute('type'), 'password');
    await page.fill('#ds-key', 'sk-test-key-9876');
    await page.locator('#svc-ds button:has-text("Save key")').click();
    await page.waitForSelector('#svc-ds .pill.ok');
    check('saving a key shows only its last four characters', (await page.locator('#svc-ds .pill').first().textContent()), 'Key saved ••••9876');
    check('the saved key is not in the page', (await page.content()).includes('sk-test-key'), false);
    check('the key field is cleared after saving', await page.inputValue('#ds-key'), '');
    await page.locator('#svc-ds button:has-text("Test saved key")').click();
    await page.waitForSelector('#ds-res .res.ok');
    check('test reports success', (await page.locator('#ds-res .res').textContent()).startsWith('Connected'), true);
    await page.check('#ds-on'); await page.selectOption('#ds-model', 'deepseek-v4-pro'); await page.fill('#ds-temp', '1.2'); await page.uncheck('.ds-feat[data-k=press]');
    await page.locator('#svc-ds button:has-text("Save settings")').click();
    await page.waitForFunction(() => document.querySelector('#svc-ds .pill:nth-of-type(2)')?.textContent === 'On in the game');
    const saved = calls.filter(c => c[1] === '/settings').at(-1)[2].ds;
    check('settings are sent as entered', [saved.on, saved.model, saved.temp, saved.feat.press, saved.feat.news], [true, 'deepseek-v4-pro', 1.2, false, true]);
    await page.locator('#svc-ds button:has-text("Remove key")').click();
    await page.waitForFunction(() => document.querySelector('#svc-ds .pill')?.textContent === 'No key');
    check('removing a key updates the card', await page.locator('#svc-ds .pill').first().textContent(), 'No key');
    await page.locator('#usageBtn').click(); await page.waitForSelector('#usageOut table');
    check('usage loads', (await page.locator('#usageOut').textContent()).includes('DeepSeek'), true);
    check('no sideways scrolling at 390px', await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
    check('admin page has no errors', errors, []);

    // ---- the game takes its AI settings from the server and hides the save tools from players
    db.keys.ds = true; db.last4.ds = '9876'; db.settings.ds.on = true; db.settings.ds.model = 'deepseek-v4-pro'; db.settings.ds.feat.press = false; db.settings.jev.on = true; // jev has no key
    const game = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true });
    game.on('pageerror', e => errors.push(e.message));
    await game.route('https://fonts.googleapis.com/**', r => r.abort());
    await mock(game);
    await game.goto(base + '/');
    await game.waitForFunction(() => typeof aiCfg === 'function' && aiCfg().ds.mode === 'proxy');
    check('a service with a server key runs in Server key mode with the admin settings', await game.evaluate(() => { const c = aiCfg().ds; return [c.on, c.mode, c.key, c.model, c.feat.press, aiReady('ds', 'second'), aiReady('ds', 'press')]; }), [true, 'proxy', '', 'deepseek-v4-pro', false, true, false]);
    check('a service without a server key stays off', await game.evaluate(() => [aiCfg().jev.on, aiReady('jev', 'engine')]), [false, false]);
    check('no API key is stored in the browser', await game.evaluate(() => /"key":"[^"]/.test(localStorage.getItem(AI_KEY))), false);
    check('save tools are open on localhost for development', await game.evaluate(() => adminAllowed()), true);
    check('on a public host the save tools are hidden until ?admin', await game.evaluate(() => {
      const real = Object.getOwnPropertyDescriptor(window, 'location');
      const fake = h => { try { sessionStorage.removeItem('futbol-admin'); } catch (e) {} const src = adminAllowed.toString().replace(/location\.hostname/g, JSON.stringify(h)); return new Function('return ' + src)()(); };
      const hidden = fake('mohdaie.github.io'); sessionStorage.setItem('futbol-admin', '1'); const shown = fake('mohdaie.github.io'); sessionStorage.removeItem('futbol-admin');
      return [hidden, shown];
    }).then(([hidden]) => hidden), false);
    check('game page has no errors', errors, []);
    await game.close();
    console.log(JSON.stringify({ passed: checks.length, checks }, null, 1));
  } finally { await browser.close(); server.close(); }
})().catch(e => { console.error(e); process.exit(1); });
