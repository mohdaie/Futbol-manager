const ORIGIN = 'https://mohdaie.github.io';
const CORS = { 'Access-Control-Allow-Origin': ORIGIN, 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'authorization, content-type', 'Access-Control-Max-Age': '86400', 'Cache-Control': 'no-store', Vary: 'Origin' };
const json = (status, body) => new Response(JSON.stringify(body), { status, headers: { ...CORS, 'Content-Type': 'application/json' } });
const actions = ['attack', 'hold', 'defend', 'press', 'fresh', 'restyle', 'counter', 'cpress', 'protect', 'mark'];
const providers = ['jev', 'deepseek', 'learned', 'rules', 'explore', 'legacy'];
const kinds = ['live', 'instant', 'background', 'camp', 'legacy'];
const bucket = /^(HT|60|70|80)\|(-2|-1|0|1|2)\|(weaker|stronger|even)\|(tired|fresh)\|(man down|man up|11v11)(\|(gegen|tiki|bal|counter|long|custom))?$/;
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const number = (v, min, max, integer = false) => Number.isFinite(v) && v >= min && v <= max && (!integer || Number.isSafeInteger(v));
const text = (v, max) => typeof v === 'string' && v.length > 0 && v.length <= max;
const only = (o, keys) => o && typeof o === 'object' && !Array.isArray(o) && Object.keys(o).every(k => keys.includes(k));
function dimensions(r) {
  return text(r.v, 40) && text(r.e, 80) && kinds.includes(r.k) && bucket.test(r.b) && actions.includes(r.a) && providers.includes(r.s);
}
function validateSnapshot(s) {
  if (!only(s, ['name', 'data']) || !text(s.name, 120) || JSON.stringify(s.data).length > 262144) return false;
  const type = s.name.split(':')[0];
  const keys = {
    version: ['id', 'name', 'date', 'table', 'tune', 'buckets', 'decisions', 'ab'],
    settings: ['mode', 'minN', 'conf', 'explore', 'active', 'saved'],
    press: ['items'],
    config: ['app', 'engine', 'tune', 'mode', 'jevModel', 'dsModel', 'scoreVersion'],
    staff: ['app', 'tables', 'records'],
  }[type];
  if (!keys || !only(s.data, keys)) return false;
  // Reject secret-bearing fields even inside a nested snapshot.
  const safe = value => !value || typeof value !== 'object' || Object.entries(value).every(([k, v]) => !/^(key|token|secret|authorization|password|prompt|manager)$/i.test(k) && safe(v));
  return safe(s.data);
}
export function validateBatch(b) {
  if (!only(b, ['seq', 'stats', 'records', 'snapshots', 'omitted']) || !number(b.seq, 1, Number.MAX_SAFE_INTEGER, true) || !number(b.omitted, 0, 1e9, true) ||
      !Array.isArray(b.stats) || b.stats.length > 80 || !Array.isArray(b.records) || b.records.length > 100 || !Array.isArray(b.snapshots) || b.snapshots.length > 1) return false;
  if (!b.stats.every(r => only(r, ['v', 'e', 'k', 'b', 'a', 's', 'n', 'r', 'q', 'w', 'l', 'c', 'cn', 'd', 'tv']) && dimensions(r) &&
      number(r.n, 1, 1e9, true) && number(r.r, -100 * r.n, 100 * r.n) && number(r.q, 0, 10000 * r.n) &&
      ['w', 'l', 'cn', 'd', 'tv'].every(k => number(r[k], 0, r.n, true)) && r.w + r.l <= r.n && number(r.c, 0, r.cn))) return false;
  if (!b.records.every(r => only(r, ['id', 't', 'v', 'e', 'k', 'b', 'a', 's', 'o', 'c', 'details']) && uuid.test(r.id) && dimensions(r) &&
      number(r.t, 0, Date.now() + 86400000) && number(r.o, -100, 100) && (r.c === null || number(r.c, 0, 1)) &&
      only(r.details, ['f', 'match', 'side', 'at', 'score', 'jev', 'second', 'mode', 'jevModel', 'dsModel']) && JSON.stringify(r.details).length <= 2048 &&
      (!r.details.f || (only(r.details.f, ['min', 'diff', 'home', 'str', 'cond', 'reds', 'ment', 'subs', 'shots', 'sot', 'xg', 'oppShots', 'oppXg', 'possession', 'press', 'line', 'tempo', 'style', 'oppStyle', 'shape', 'oppShape', 'fit', 'oppFit', 'passPct', 'oppPassPct', 'regains', 'oppRegains', 'duels', 'offsides']) && Object.values(r.details.f).every(v => typeof v === 'boolean' || number(v, -100, 10000)))) &&
      Object.entries(r.details).filter(([k]) => k !== 'f').every(([, v]) => v === null || typeof v === 'boolean' || number(v, -100, 1e12) || (typeof v === 'string' && v.length <= 100) || (Array.isArray(v) && v.length <= 2 && v.every(n => number(n, 0, 100)))))) return false;
  return b.snapshots.every(validateSnapshot);
}
async function digest(value) {
  const bytes = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
  return [...new Uint8Array(bytes)].map(n => n.toString(16).padStart(2, '0')).join('');
}
export async function handleBrain(req, ingest) {
  if (req.method === 'GET' && new URL(req.url).pathname.endsWith('/health')) return json(200, { status: 'ok', service: 'futbol-brain' });
  if (req.headers.get('Origin') !== ORIGIN) return json(403, { error: 'Origin not allowed.' });
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS });
  if (req.method !== 'POST') return json(405, { error: 'Use POST.' });
  const token = (req.headers.get('Authorization') || '').replace(/^Bearer /i, '');
  // Anonymous installation identity: 256 random bits. No shared public write key,
  // no read endpoint, and clients cannot choose or overwrite another source.
  if (!/^[a-f0-9]{64}$/.test(token)) return json(401, { error: 'Missing installation credential.' });
  let body, raw;
  try {
    const reader = req.body.getReader(), chunks = []; let size = 0;
    while (true) { const { value, done } = await reader.read(); if (done) break; size += value.length; if (size > 524288) { await reader.cancel(); return json(413, { error: 'Batch too large.' }); } chunks.push(value); }
    const bytes = new Uint8Array(size); let offset = 0; for (const c of chunks) { bytes.set(c, offset); offset += c.length; }
    raw = new TextDecoder().decode(bytes); body = JSON.parse(raw);
    if (!validateBatch(body)) return json(400, { error: 'Invalid learning batch.' });
  } catch { return json(400, { error: 'Invalid JSON batch.' }); }
  try {
    const result = await ingest(await digest(token), await digest(raw), body);
    return json(200, result);
  } catch (e) {
    const message = String(e.message || '');
    if (message.includes('sequence_conflict')) return json(409, { error: 'Sync conflict. Keep this tab open and avoid running the same save in multiple tabs.' });
    if (message.includes('rate_limited')) return json(429, { error: 'Sync limit reached. Data is kept locally; retry later.' });
    return json(503, { error: 'Cloud storage is temporarily unavailable. Learning is kept locally.' });
  }
}
