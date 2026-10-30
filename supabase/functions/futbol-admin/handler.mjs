// Admin API for /admin: global AI settings, server-held API keys and usage.
// No sign-in yet (by design, for now): keys are write-only, so they can be replaced or removed but never read back.
// The game's own pages; the first is the live domain, the others redirect to it.
const ORIGINS = ['https://fmotg.app', 'https://www.fmotg.app', 'https://mohdaie.github.io'];
const ORIGIN = ORIGINS[0];
const CORS = {
  'Access-Control-Allow-Origin': ORIGIN,
  'Access-Control-Allow-Methods': 'GET, PUT, POST, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'content-type',
  'Access-Control-Max-Age': '86400',
  'Cache-Control': 'no-store',
  'Vary': 'Origin',
};
const json = (status, data) => new Response(JSON.stringify(data), { status, headers: { ...CORS, 'Content-Type': 'application/json' } });

export const SERVICES = { jev: 'jev', ds: 'deepseek' }; // settings id -> secret name
const REPORT_KINDS = new Set(['open', 'play', 'career', 'match']);
const FEATURES = { jev: ['engine', 'briefing', 'manager', 'react', 'transfer', 'advice'], ds: ['briefing', 'second', 'press', 'talks', 'report', 'staff', 'agents', 'news', 'match'] };
const allOn = list => Object.fromEntries(list.map(k => [k, true]));
const MODELS = { jev: /^jev-[a-z0-9.-]{1,60}$/, ds: /^(deepseek-flash|deepseek-v4-pro)$/ };
export const DEFAULTS = {
  jev: { on: false, model: 'jev-latest', timeout: 10000, budget: 2, feat: allOn(FEATURES.jev) },
  ds: { on: false, model: 'deepseek-flash', thinking: false, maxTokens: 300, temp: 0.7, timeout: 20000, budget: 2, feat: allOn(FEATURES.ds) },
};
const num = (v, lo, hi, d) => (Number.isFinite(Number(v)) ? Math.min(hi, Math.max(lo, Number(v))) : d);

// Keep only known fields, with safe ranges. Anything else in the request is dropped.
export function cleanSettings(id, raw, base = DEFAULTS[id]) {
  const r = raw && typeof raw === 'object' ? raw : {}, out = { ...base, feat: { ...base.feat } };
  if (typeof r.on === 'boolean') out.on = r.on;
  if (typeof r.model === 'string' && MODELS[id].test(r.model)) out.model = r.model;
  out.timeout = num(r.timeout, 500, 60000, out.timeout);
  out.budget = num(r.budget, 0, 10000, out.budget);
  if (id === 'ds') {
    if (typeof r.thinking === 'boolean') out.thinking = r.thinking;
    out.maxTokens = num(r.maxTokens, 50, 4000, out.maxTokens);
    out.temp = num(r.temp, 0, 2, out.temp);
  }
  if (r.feat && typeof r.feat === 'object') FEATURES[id].forEach(k => { if (typeof r.feat[k] === 'boolean') out.feat[k] = r.feat[k]; });
  return out;
}

/* store: { settings(): {id: value}, saveSettings(id, value), secrets(): {name: value}, saveSecret(name, value), deleteSecret(name), usage(),
            report(row), players(days) }
   probe: async (name, key) => { ok, status, ms, detail } */
async function handleAdminFor(req, store, probe) {
  const url = new URL(req.url), path = url.pathname.replace(/\/+$/, '');
  if (req.method === 'GET' && path.endsWith('/health')) return json(200, { status: 'ok', service: 'futbol-admin' });
  if (!ORIGINS.includes(req.headers.get('Origin'))) return json(403, { error: 'Origin not allowed.' });
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS });
  const merged = async () => { const s = await store.settings(); return { jev: cleanSettings('jev', s.jev), ds: cleanSettings('ds', s.ds) }; };
  const keyInfo = async () => {
    const sec = await store.secrets();
    return Object.fromEntries(Object.entries(SERVICES).map(([id, name]) => [id, sec[name] ? { set: true, last4: sec[name].slice(-4) } : { set: false }]));
  };
  try {
    // What the game needs at start-up: settings and whether a server key exists. Never the key.
    if (req.method === 'GET' && path.endsWith('/config')) {
      const [settings, keys] = await Promise.all([merged(), keyInfo()]);
      return json(200, { settings, keys: { jev: keys.jev.set, ds: keys.ds.set } });
    }
    if (req.method === 'GET' && path.endsWith('/state')) return json(200, { settings: await merged(), keys: await keyInfo() });
    if (req.method === 'GET' && path.endsWith('/usage')) return json(200, await store.usage());
    // Anonymous play statistics from the game (js/systems/telemetry.js); the database function validates and rate-limits.
    if (req.method === 'POST' && path.endsWith('/report')) {
      const b = await req.json().catch(() => null);
      if (!b || !REPORT_KINDS.has(b.kind) || !/^[0-9a-f]{32}$/.test(b.device) || !/^[0-9a-f]{32}$/.test(b.session)) return json(400, { error: 'Bad report.' });
      const data = b.data && typeof b.data === 'object' && !Array.isArray(b.data) ? b.data : {};
      if (JSON.stringify(data).length > 1500) return json(400, { error: 'Bad report.' });
      await store.report({ p_kind: b.kind, p_device: b.device, p_session: b.session, p_version: String(b.version || '?').slice(0, 20), p_data: data });
      return new Response(null, { status: 204, headers: CORS });
    }
    if (req.method === 'GET' && path.endsWith('/players')) return json(200, await store.players(num(url.searchParams.get('days'), 1, 180, 30)));
    if (req.method === 'PUT' && path.endsWith('/settings')) {
      const body = await req.json(), cur = await merged();
      for (const id of Object.keys(SERVICES)) if (body && body[id]) await store.saveSettings(id, cleanSettings(id, body[id], cur[id]));
      return json(200, { settings: await merged() });
    }
    if (req.method === 'PUT' && path.endsWith('/secret')) {
      const body = await req.json(), name = SERVICES[body && body.service];
      const value = typeof body.value === 'string' ? body.value.trim().replace(/^Bearer\s+/i, '').trim() : '';
      if (!name) return json(400, { error: 'Unknown service.' });
      if (!/^[\x21-\x7e]{8,400}$/.test(value)) return json(400, { error: 'That does not look like an API key.' });
      await store.saveSecret(name, value);
      return json(200, { keys: await keyInfo() });
    }
    if (req.method === 'DELETE' && path.endsWith('/secret')) {
      const name = SERVICES[url.searchParams.get('service')];
      if (!name) return json(400, { error: 'Unknown service.' });
      await store.deleteSecret(name);
      return json(200, { keys: await keyInfo() });
    }
    if (req.method === 'POST' && path.endsWith('/test')) {
      const body = await req.json(), name = SERVICES[body && body.service];
      if (!name) return json(400, { error: 'Unknown service.' });
      const key = (await store.secrets())[name];
      if (!key) return json(200, { ok: false, detail: 'No key saved for this service yet.' });
      return json(200, await probe(name, key));
    }
  } catch (e) {
    return json(400, { error: e instanceof SyntaxError ? 'Invalid JSON request.' : 'The admin service could not complete that request.' });
  }
  return json(404, { error: 'Unknown endpoint.' });
}

// CORS answers with the calling page's own origin.
export async function handleAdmin(req, ...args) {
  const response = await handleAdminFor(req, ...args), origin = req.headers.get('Origin');
  if (ORIGINS.includes(origin)) response.headers.set('Access-Control-Allow-Origin', origin);
  return response;
}
