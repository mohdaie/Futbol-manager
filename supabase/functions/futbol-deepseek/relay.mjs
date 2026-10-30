// Personal-key relay. Diagnostics never contain keys, prompts or personal data.
// The game's own pages; the first is the live domain, the others redirect to it.
const ORIGINS = ['https://fmotg.app', 'https://www.fmotg.app', 'https://mohdaie.github.io'];
const ORIGIN = ORIGINS[0];
const UPSTREAM = 'https://api.deepseek.com/chat/completions';
const CORS = {
  'Access-Control-Allow-Origin': ORIGIN,
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, content-type',
  'Access-Control-Max-Age': '86400',
  'Cache-Control': 'no-store',
  'Vary': 'Origin',
};
const json = (status, data) => new Response(JSON.stringify(data), {
  status, headers: { ...CORS, 'Content-Type': 'application/json' },
});

// Usage statistics: the game names the feature and its anonymous installation (body.meta, never forwarded).
const meta = body => {
  const m = body && typeof body.meta === 'object' && body.meta ? body.meta : {};
  return { feature: typeof m.f === 'string' && /^[a-z0-9 :_-]{1,40}$/i.test(m.f) ? m.f : null, install: typeof m.i === 'string' && /^[a-f0-9]{64}$/.test(m.i) ? m.i : null };
};
async function sourceOf(install) {
  if (!install) return null;
  const bytes = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(install));
  return [...new Uint8Array(bytes)].map(n => n.toString(16).padStart(2, '0')).join('');
}
// US$ per 1M tokens [off-peak, peak]; peak = Mon-Fri 01:00-04:00 and 06:00-10:00 UTC (same table as js/systems/ai.js).
const PRICES = { 'deepseek-flash': { hit: [0.003, 0.006], miss: [0.15, 0.3], out: [0.6, 1.2] }, 'deepseek-v4-pro': { hit: [0.022, 0.044], miss: [0.66, 1.32], out: [1.98, 3.96] } };
export function deepSeekCost(model, u, d = new Date()) {
  const P = PRICES[model] || PRICES['deepseek-flash'], day = d.getUTCDay(), h = d.getUTCHours();
  const i = day >= 1 && day <= 5 && ((h >= 1 && h < 4) || (h >= 6 && h < 10)) ? 1 : 0;
  const hit = u.prompt_cache_hit_tokens || 0, miss = u.prompt_cache_miss_tokens ?? Math.max(0, (u.prompt_tokens || 0) - hit);
  return (hit * P.hit[i] + miss * P.miss[i] + (u.completion_tokens || 0) * P.out[i]) / 1e6;
}

// serverKey() supplies the key saved in /admin when the game sends none (Server key mode).
async function handleDeepSeekFor(req, fetcher = fetch, record = async () => {}, serverKey = async () => null) {
  if (req.method === 'GET' && new URL(req.url).pathname.endsWith('/health')) return json(200, { status: 'ok', service: 'futbol-deepseek' });
  if (!ORIGINS.includes(req.headers.get('Origin'))) return json(403, { error: 'Origin not allowed.' });
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS });
  if (req.method !== 'POST') return json(405, { error: 'Use POST.' });
  if (!new URL(req.url).pathname.endsWith('/chat/completions')) return json(404, { error: 'Unknown endpoint.' });
  let authorization = req.headers.get('Authorization') || '';
  if (!authorization) { const saved = await serverKey().catch(() => null); if (saved) authorization = 'Bearer ' + saved; }
  if (!/^Bearer\s+\S+$/i.test(authorization)) return json(401, { error: 'No API key is set. Save one in /admin.' });
  let body;
  try {
    const text = await req.text();
    if (new TextEncoder().encode(text).length > 32768) return json(413, { error: 'Request is too large.' });
    body = JSON.parse(text);
    if (!body || !['deepseek-flash', 'deepseek-v4-pro'].includes(body.model) || !Array.isArray(body.messages) || body.messages.length < 1 || body.messages.length > 32 || body.messages.some(m => !['system', 'user', 'assistant'].includes(m.role) || typeof m.content !== 'string')) {
      return json(400, { error: 'Expected a supported DeepSeek model and text messages.' });
    }
  } catch { return json(400, { error: 'Invalid JSON request.' }); }
  const payload = { model: body.model, messages: body.messages, max_tokens: Math.min(4000, Math.max(1, Math.trunc(Number(body.max_tokens) || 300))), thinking: { type: body.thinking?.type === 'enabled' ? 'enabled' : 'disabled' }, stream: false };
  if (payload.thinking.type === 'disabled') payload.temperature = Math.min(2, Math.max(0, Number(body.temperature) || 0));
  if (body.response_format?.type === 'json_object') payload.response_format = { type: 'json_object' };
  const started = performance.now();
  const log = async (http_status, usage = {}, model = body.model, error_code = null) => {
    const count = n => Number.isFinite(n) && n > 0 ? Math.min(2147483647, Math.trunc(n)) : 0;
    try {
      const m = meta(body), ok = http_status < 400;
      await record({ provider: 'deepseek', http_status, duration_ms: Math.round(performance.now() - started), model, input_tokens: count(usage.prompt_tokens), output_tokens: count(usage.completion_tokens), error_code,
        feature: m.feature, cache_hit_tokens: count(usage.prompt_cache_hit_tokens), cost_usd: ok ? deepSeekCost(model, usage || {}) : 0, source_id: await sourceOf(m.install) });
    } catch { /* Diagnostics must not interrupt a match. */ }
  };
  try {
    const response = await fetcher(UPSTREAM, {
      method: 'POST', headers: { 'Authorization': authorization, 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(18000), redirect: 'error',
    });
    const data = await response.json();
    await log(response.status, data.usage, data.model || body.model, response.ok ? null : 'upstream_http_error');
    return json(response.status, data);
  } catch (error) {
    await log(error.name === 'TimeoutError' ? 504 : 502, {}, body.model, error.name === 'TimeoutError' ? 'timeout' : 'upstream_unreachable');
    return json(error.name === 'TimeoutError' ? 504 : 502, {
      error: error.name === 'TimeoutError' ? 'DeepSeek did not reply within 18 seconds.' : 'The relay could not reach DeepSeek. Try again later.',
    });
  }
}

// CORS answers with the calling page's own origin.
export async function handleDeepSeek(req, ...args) {
  const response = await handleDeepSeekFor(req, ...args), origin = req.headers.get('Origin');
  if (ORIGINS.includes(origin)) response.headers.set('Access-Control-Allow-Origin', origin);
  return response;
}
