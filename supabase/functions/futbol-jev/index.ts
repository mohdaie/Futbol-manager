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

Deno.serve(req => handleJev(req, fetch, recordDiagnostic));
