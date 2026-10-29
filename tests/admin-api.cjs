// Admin API and relay server-key fallback. Run: node tests/admin-api.cjs
const assert = require('node:assert/strict');
(async () => {
  const { handleAdmin, cleanSettings, DEFAULTS } = await import('../supabase/functions/futbol-admin/handler.mjs');
  const { handleDeepSeek } = await import('../supabase/functions/futbol-deepseek/relay.mjs');
  const { handleJev } = await import('../supabase/functions/futbol-jev/relay.mjs');
  const ORIGIN = 'https://mohdaie.github.io', checks = [];
  const check = (name, actual, expected) => { assert.deepStrictEqual(actual, expected, name); checks.push(name); };

  const db = { settings: {}, secrets: {} };
  const store = {
    settings: async () => structuredClone(db.settings), saveSettings: async (id, v) => { db.settings[id] = v; },
    secrets: async () => ({ ...db.secrets }), saveSecret: async (n, v) => { db.secrets[n] = v; }, deleteSecret: async n => { delete db.secrets[n]; },
    usage: async () => ({ month: [], total: [], features: [], days: [] }),
  };
  const probe = async (name, key) => ({ ok: key === 'good-key-123', detail: name });
  const call = (method, path, body, origin = ORIGIN) => handleAdmin(new Request('https://x.test/functions/v1/futbol-admin' + path, { method, headers: { ...(origin ? { Origin: origin } : {}), 'Content-Type': 'application/json' }, body: body ? JSON.stringify(body) : undefined }), store, probe);
  const read = async r => ({ status: r.status, body: await r.json() });

  check('health needs no origin', (await call('GET', '/health', null, null)).status, 200);
  check('other origins are refused', (await call('GET', '/config', null, 'https://evil.example')).status, 403);
  check('no origin is refused', (await call('GET', '/state', null, null)).status, 403);

  let r = await read(await call('GET', '/config'));
  check('fresh config has defaults and no keys', [r.status, r.body.settings.jev.on, r.body.settings.ds.model, r.body.keys], [200, false, 'deepseek-flash', { jev: false, ds: false }]);

  r = await read(await call('PUT', '/secret', { service: 'ds', value: 'Bearer sk-secret-abcd1234' }));
  check('key saved without the Bearer prefix', db.secrets.deepseek, 'sk-secret-abcd1234');
  check('response shows only the last four characters', r.body.keys, { jev: { set: false }, ds: { set: true, last4: '1234' } });
  check('rejects junk keys', (await call('PUT', '/secret', { service: 'ds', value: 'short' })).status, 400);
  check('rejects unknown services', (await call('PUT', '/secret', { service: 'x', value: 'sk-secret-abcd1234' })).status, 400);

  const cfgText = JSON.stringify(await read(await call('GET', '/config')));
  const stateText = JSON.stringify(await read(await call('GET', '/state')));
  check('the key never appears in config or state', [cfgText.includes('sk-secret'), stateText.includes('sk-secret')], [false, false]);
  check('config reports a server key exists', JSON.parse(cfgText).body.keys, { jev: false, ds: true });

  r = await read(await call('PUT', '/settings', { ds: { on: true, model: 'deepseek-v4-pro', timeout: 999999, temp: 9, maxTokens: 10, feat: { press: false, bogus: true }, evil: 1 } }));
  check('settings are clamped and unknown fields dropped', [r.body.settings.ds.on, r.body.settings.ds.model, r.body.settings.ds.timeout, r.body.settings.ds.temp, r.body.settings.ds.maxTokens, r.body.settings.ds.feat.press, 'bogus' in r.body.settings.ds.feat, 'evil' in r.body.settings.ds], [true, 'deepseek-v4-pro', 60000, 2, 50, false, false, false]);
  r = await read(await call('PUT', '/settings', { ds: { model: 'gpt-5' } }));
  check('unknown models are ignored', r.body.settings.ds.model, 'deepseek-v4-pro');
  check('bad JSON is a 400', (await handleAdmin(new Request('https://x.test/settings', { method: 'PUT', headers: { Origin: ORIGIN }, body: '{oops' }), store, probe)).status, 400);
  check('cleanSettings does not mutate defaults', cleanSettings('jev', { on: true }).on && !DEFAULTS.jev.on, true);

  check('test with a bad key fails', (await read(await call('POST', '/test', { service: 'ds' }))).body.ok, false);
  db.secrets.deepseek = 'good-key-123';
  check('test with a good key passes', (await read(await call('POST', '/test', { service: 'ds' }))).body.ok, true);
  check('test without a key explains', (await read(await call('POST', '/test', { service: 'jev' }))).body.detail, 'No key saved for this service yet.');

  r = await read(await call('DELETE', '/secret?service=ds'));
  check('key can be removed', [db.secrets.deepseek, r.body.keys.ds.set], [undefined, false]);
  check('usage is served', (await call('GET', '/usage')).status, 200);
  check('unknown path is 404', (await call('GET', '/nope')).status, 404);

  // Relays use the server key only when the game sends none.
  const sent = [];
  const fetcher = async (url, init) => { sent.push(init.headers.Authorization); return new Response(JSON.stringify({ choices: [], usage: {}, answers: {} }), { status: 200 }); };
  const ds = (auth, key) => handleDeepSeek(new Request('https://x.test/futbol-deepseek/chat/completions', { method: 'POST', headers: { Origin: ORIGIN, ...(auth ? { Authorization: auth } : {}) }, body: JSON.stringify({ model: 'deepseek-flash', messages: [{ role: 'user', content: 'hi' }] }) }), fetcher, async () => {}, async () => key);
  check('DeepSeek relay: no key anywhere is 401', (await ds(null, null)).status, 401);
  check('DeepSeek relay: server key used', [(await ds(null, 'srv-key-12345')).status, sent.at(-1)], [200, 'Bearer srv-key-12345']);
  check('DeepSeek relay: a personal key wins', [(await ds('Bearer mine-12345', 'srv-key-12345')).status, sent.at(-1)], [200, 'Bearer mine-12345']);
  const jev = (auth, key) => handleJev(new Request('https://x.test/futbol-jev/v1/systemone', { method: 'POST', headers: { Origin: ORIGIN, ...(auth ? { Authorization: auth } : {}) }, body: JSON.stringify({ model: 'jev-latest', state: 's', questions: { q: { type: 'choice' } } }) }), fetcher, async () => {}, async () => key);
  check('Jev relay: no key anywhere is 401', (await jev(null, null)).status, 401);
  check('Jev relay: server key used', [(await jev(null, 'srv-jev-12345')).status, sent.at(-1)], [200, 'Bearer srv-jev-12345']);
  check('Relay survives a failing key lookup', (await handleJev(new Request('https://x.test/futbol-jev/v1/systemone', { method: 'POST', headers: { Origin: ORIGIN }, body: '{}' }), fetcher, async () => {}, async () => { throw new Error('db down'); })).status, 401);

  console.log(JSON.stringify({ passed: checks.length, checks }, null, 1));
})().catch(e => { console.error(e); process.exit(1); });
