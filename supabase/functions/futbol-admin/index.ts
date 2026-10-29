import { handleAdmin } from './handler.mjs';

// Privileged key is supplied by Supabase at runtime and never sent to a browser.
const base = () => Deno.env.get('SUPABASE_URL') + '/rest/v1';
const headers = (extra: Record<string, string> = {}) => {
  const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  return { apikey: key, Authorization: 'Bearer ' + key, 'Content-Type': 'application/json', ...extra };
};
async function rest(path: string, init: RequestInit = {}) {
  const response = await fetch(base() + path, { ...init, headers: headers((init.headers as Record<string, string>) || {}), signal: AbortSignal.timeout(8000) });
  if (!response.ok) throw new Error(await response.text());
  return response.status === 204 ? null : await response.json().catch(() => null);
}

const store = {
  async settings() { const rows = await rest('/futbol_admin_settings?select=id,value'); return Object.fromEntries((rows || []).map((r: { id: string; value: unknown }) => [r.id, r.value])); },
  async saveSettings(id: string, value: unknown) {
    await rest('/futbol_admin_settings?on_conflict=id', { method: 'POST', headers: { Prefer: 'resolution=merge-duplicates,return=minimal' }, body: JSON.stringify({ id, value, updated_at: new Date().toISOString() }) });
  },
  async secrets() { const rows = await rest('/futbol_admin_secrets?select=name,value'); return Object.fromEntries((rows || []).map((r: { name: string; value: string }) => [r.name, r.value])); },
  async saveSecret(name: string, value: string) {
    await rest('/futbol_admin_secrets?on_conflict=name', { method: 'POST', headers: { Prefer: 'resolution=merge-duplicates,return=minimal' }, body: JSON.stringify({ name, value, updated_at: new Date().toISOString() }) });
  },
  async deleteSecret(name: string) { await rest('/futbol_admin_secrets?name=eq.' + encodeURIComponent(name), { method: 'DELETE' }); },
  async usage() { return await rest('/rpc/futbol_ai_usage_overview', { method: 'POST', body: '{}' }); },
  async report(row: Record<string, unknown>) { await rest('/rpc/futbol_play_report', { method: 'POST', headers: { Prefer: 'return=minimal' }, body: JSON.stringify(row) }); },
  async players(days: number) { return await rest('/rpc/futbol_play_dashboard', { method: 'POST', body: JSON.stringify({ p_days: Math.round(days) }) }); },
};

// One tiny, cheap request to confirm a saved key works.
async function probe(name: string, key: string) {
  const t0 = performance.now();
  try {
    const response = name === 'deepseek'
      ? await fetch('https://api.deepseek.com/chat/completions', { method: 'POST', headers: { Authorization: 'Bearer ' + key, 'Content-Type': 'application/json' }, body: JSON.stringify({ model: 'deepseek-flash', messages: [{ role: 'user', content: 'Reply with the word ok.' }], max_tokens: 5, thinking: { type: 'disabled' } }), signal: AbortSignal.timeout(15000), redirect: 'error' })
      : await fetch('https://api.typesafe.ai/v1/systemone', { method: 'POST', headers: { Authorization: 'Bearer ' + key, 'Content-Type': 'application/json' }, body: JSON.stringify({ model: 'jev-latest', state: 'Test.', questions: { q: { type: 'choice', instructions: 'Pick one', criteria: { a: 'A', b: 'B' } } } }), signal: AbortSignal.timeout(15000), redirect: 'error' });
    const ms = Math.round(performance.now() - t0);
    return { ok: response.ok, status: response.status, ms, detail: response.ok ? 'Key accepted.' : response.status === 401 || response.status === 403 ? 'The provider rejected this key.' : 'The provider returned HTTP ' + response.status + '.' };
  } catch (e) {
    return { ok: false, ms: Math.round(performance.now() - t0), detail: (e as Error).name === 'TimeoutError' ? 'The provider did not reply in time.' : 'Could not reach the provider.' };
  }
}

Deno.serve(req => handleAdmin(req, store, probe));
