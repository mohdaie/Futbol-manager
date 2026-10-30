// Run: node tests/ai-relay-quota.mjs. Per-player and global daily limits on the AI relays.
import assert from 'node:assert/strict';
import { handleDeepSeek } from '../supabase/functions/futbol-deepseek/relay.mjs';
import { handleJev } from '../supabase/functions/futbol-jev/relay.mjs';

const install = 'a'.repeat(64), origin = 'https://fmotg.app';
const upstream = body => async () => new Response(JSON.stringify(body), { status: 200, headers: { 'Content-Type': 'application/json' } });
const call = (handler, url, body, quota, seen = {}) => handler(
  new Request(url, { method: 'POST', headers: { Origin: origin, Authorization: 'Bearer k', 'Content-Type': 'application/json' }, body: JSON.stringify(body) }),
  async (...a) => { seen.upstream = (seen.upstream || 0) + 1; return upstream({ usage: {}, model: 'x' })(...a); },
  async row => { seen.rows = (seen.rows || []).concat(row); }, async () => null, quota);
const ds = { model: 'deepseek-flash', messages: [{ role: 'user', content: 'hi' }], meta: { f: 'press', i: install } };
const jev = { model: 'jev-latest', state: {}, questions: { q: {} }, meta: { f: 'manager', i: install } };
const cases = [[handleDeepSeek, 'https://x/functions/v1/futbol-deepseek/chat/completions', ds], [handleJev, 'https://x/functions/v1/futbol-jev/v1/systemone', jev]];

for (const [handler, url, body] of cases) {
  let seen = {}, r = await call(handler, url, body, async () => null, seen);
  assert.equal(r.status, 200); assert.equal(seen.upstream, 1);

  seen = {}; r = await call(handler, url, body, async () => 'player', seen);
  assert.equal(r.status, 429); assert.equal(r.headers.get('Retry-After'), '3600');
  assert.match((await r.json()).error, /Daily AI limit/); assert.equal(seen.upstream, undefined); assert.equal(seen.rows, undefined);

  seen = {}; r = await call(handler, url, body, async () => 'global', seen);
  assert.equal(r.status, 429); assert.match((await r.json()).error, /busy today/); assert.equal(seen.upstream, undefined);

  seen = {}; r = await call(handler, url, body, async () => { throw new Error('db down'); }, seen);
  assert.equal(r.status, 200, 'fails open when the count fails'); assert.equal(seen.upstream, 1);

  let asked; await call(handler, url, body, async s => { asked = s; return null; });
  assert.match(asked, /^[a-f0-9]{64}$/); assert.notEqual(asked, install, 'quota is keyed by the hashed id');
  await call(handler, url, { ...body, meta: {} }, async s => { asked = s; return null; });
  assert.equal(asked, null, 'no id is counted as one shared anonymous pool');
}
console.log('ai relay quota: ok');
