// Personal-key relay. Diagnostics never contain keys, prompts or personal data.
const ORIGIN = 'https://mohdaie.github.io';
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

export async function handleDeepSeek(req, fetcher = fetch, record = async () => {}) {
  if (req.method === 'GET' && new URL(req.url).pathname.endsWith('/health')) return json(200, { status: 'ok', service: 'futbol-deepseek' });
  if (req.headers.get('Origin') !== ORIGIN) return json(403, { error: 'Origin not allowed.' });
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS });
  if (req.method !== 'POST') return json(405, { error: 'Use POST.' });
  if (!new URL(req.url).pathname.endsWith('/chat/completions')) return json(404, { error: 'Unknown endpoint.' });
  const authorization = req.headers.get('Authorization') || '';
  if (!/^Bearer\s+\S+$/i.test(authorization)) return json(401, { error: 'Add your DeepSeek API key in the game.' });
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
    try { await record({ provider: 'deepseek', http_status, duration_ms: Math.round(performance.now() - started), model, input_tokens: count(usage.prompt_tokens), output_tokens: count(usage.completion_tokens), error_code }); } catch { /* Diagnostics must not interrupt a match. */ }
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
