import { handleJev } from './relay.mjs';

// Privileged key is supplied by Supabase at runtime and never sent to the game.
async function recordDiagnostic(row: Record<string, unknown>) {
  const base = Deno.env.get('SUPABASE_URL');
  const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!base || !key) return;
  const response = await fetch(base + '/rest/v1/futbol_manager_ai_requests', {
    method: 'POST', headers: { apikey: key, Authorization: 'Bearer ' + key, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
    body: JSON.stringify(row), signal: AbortSignal.timeout(2000),
  });
  if (!response.ok) throw new Error('Diagnostic write failed.');
}

// Key saved in /admin (Server key mode). Read with the privileged key; never sent to the game.
async function serverKey(): Promise<string | null> {
  const base = Deno.env.get('SUPABASE_URL');
  const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!base || !key) return null;
  const response = await fetch(base + '/rest/v1/futbol_admin_secrets?name=eq.jev&select=value', {
    headers: { apikey: key, Authorization: 'Bearer ' + key }, signal: AbortSignal.timeout(2000),
  });
  if (!response.ok) return null;
  const rows = await response.json();
  return rows[0]?.value ?? null;
}

// Fair use: requests per installation and in total over a rolling 24 hours, counted from the usage log.
// Override with the AI_DAILY_PLAYER_LIMIT and AI_DAILY_GLOBAL_LIMIT secrets. Fails open on any error.
async function countSince(filter: string): Promise<number> {
  const base = Deno.env.get('SUPABASE_URL');
  const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!base || !key) return 0;
  const since = new Date(Date.now() - 864e5).toISOString();
  const response = await fetch(base + '/rest/v1/futbol_manager_ai_requests?select=id&created_at=gte.' + encodeURIComponent(since) + filter, {
    headers: { apikey: key, Authorization: 'Bearer ' + key, Prefer: 'count=exact', Range: '0-0' }, signal: AbortSignal.timeout(2000),
  });
  if (!response.ok) throw new Error('Usage count failed.');
  return Number((response.headers.get('content-range') || '').split('/')[1]) || 0;
}
async function quota(source: string | null): Promise<'player' | 'global' | null> {
  const playerLimit = Number(Deno.env.get('AI_DAILY_PLAYER_LIMIT')) || 600, globalLimit = Number(Deno.env.get('AI_DAILY_GLOBAL_LIMIT')) || 15000;
  const [player, global] = await Promise.all([
    countSince(source ? '&source_id=eq.' + encodeURIComponent(source) : '&source_id=is.null'), countSince('')]);
  return global >= globalLimit ? 'global' : player >= playerLimit ? 'player' : null;
}

Deno.serve(req => handleJev(req, fetch, recordDiagnostic, serverKey, quota));
