// Personal-key relay: no shared API key, database, logging or arbitrary targets.
const ORIGIN = 'https://mohdaie.github.io';
const UPSTREAM = 'https://api.typesafe.ai/v1/systemone';
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

export async function handleJev(req, fetcher = fetch) {
  if (req.headers.get('Origin') !== ORIGIN) return json(403, { error: 'Origin not allowed.' });
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS });
  if (req.method !== 'POST') return json(405, { error: 'Use POST.' });
  if (!new URL(req.url).pathname.endsWith('/v1/systemone')) return json(404, { error: 'Unknown endpoint.' });
  const authorization = req.headers.get('Authorization') || '';
  if (!/^Bearer\s+\S+$/i.test(authorization)) return json(401, { error: 'Add your Jev API key in the game.' });
  let body;
  try {
    const text = await req.text();
    if (new TextEncoder().encode(text).length > 32768) return json(413, { error: 'Request is too large.' });
    body = JSON.parse(text);
    if (!body || typeof body.model !== 'string' || !body.model.startsWith('jev-') || body.state == null ||
        !body.questions || Array.isArray(body.questions) || typeof body.questions !== 'object' ||
        Object.keys(body.questions).length < 1 || Object.keys(body.questions).length > 16) {
      return json(400, { error: 'Expected a Jev model, state and 1–16 questions.' });
    }
  } catch { return json(400, { error: 'Invalid JSON request.' }); }
  try {
    const response = await fetcher(UPSTREAM, {
      method: 'POST', headers: { 'Authorization': authorization, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: body.model, state: body.state, questions: body.questions }),
      signal: AbortSignal.timeout(15000), redirect: 'error',
    });
    const data = await response.json();
    return json(response.status, data);
  } catch (error) {
    return json(error.name === 'TimeoutError' ? 504 : 502, {
      error: error.name === 'TimeoutError' ? 'Jev did not reply within 15 seconds.' : 'The relay could not reach Jev. Try again later.',
    });
  }
}
