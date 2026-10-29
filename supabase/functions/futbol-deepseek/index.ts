import { handleDeepSeek } from './relay.mjs';

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
  const response = await fetch(base + '/rest/v1/futbol_admin_secrets?name=eq.deepseek&select=value', {
    headers: { apikey: key, Authorization: 'Bearer ' + key }, signal: AbortSignal.timeout(2000),
  });
  if (!response.ok) return null;
  const rows = await response.json();
  return rows[0]?.value ?? null;
}

Deno.serve(req => handleDeepSeek(req, fetch, recordDiagnostic, serverKey));
