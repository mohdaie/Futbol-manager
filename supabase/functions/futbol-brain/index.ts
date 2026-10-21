import { handleBrain } from './handler.mjs';

Deno.serve(req => handleBrain(req, async (source: string, digest: string, batch: unknown) => {
  const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const response = await fetch(Deno.env.get('SUPABASE_URL') + '/rest/v1/rpc/futbol_brain_ingest', {
    method: 'POST', headers: { apikey: key, Authorization: 'Bearer ' + key, 'Content-Type': 'application/json' },
    body: JSON.stringify({ p_source: source, p_digest: digest, p_batch: batch }), signal: AbortSignal.timeout(12000),
  });
  if (!response.ok) throw new Error(await response.text());
  return await response.json();
}, async (source: string) => {
  const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const response = await fetch(Deno.env.get('SUPABASE_URL') + '/rest/v1/rpc/futbol_ai_usage_stats', {
    method: 'POST', headers: { apikey: key, Authorization: 'Bearer ' + key, 'Content-Type': 'application/json' },
    body: JSON.stringify({ p_source: source }), signal: AbortSignal.timeout(8000),
  });
  if (!response.ok) throw new Error(await response.text());
  return await response.json();
}));
