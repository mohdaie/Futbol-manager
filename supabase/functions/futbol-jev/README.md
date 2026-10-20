# Futbol Manager Jev relay (development)

Hosted in **musab-agents**, project `wkzrefbvjxqphkrduyqj`:

`https://wkzrefbvjxqphkrduyqj.supabase.co/functions/v1/futbol-jev`

The game uses Personal relay automatically, retaining an existing Jev API key.
Each caller supplies their own Jev key in the Authorization header. Jev validates
it; `verify_jwt = false` prevents Supabase from interpreting it as a Supabase JWT.
No shared Jev key is stored in the repo or function.

The relay accepts only the GitHub Pages origin, POST/OPTIONS, a fixed TypeSafe
upstream and small typed decision requests. GET `/health` is a public readiness
check and makes no Jev call.

## Database

`public.futbol_manager_ai_requests` holds status, timing, model and token counts
for forwarded requests. It contains no API keys, prompts, match state or personal
data. RLS is enabled and browser roles have no access. The function uses its
Supabase runtime service key for metadata writes; that key never reaches clients.
Failed diagnostic writes do not interrupt the game.

## Moving to production

1. Apply `supabase/migrations/20261020113648_futbol_manager_ai_requests.sql` to
   the production project (or use the normal Supabase migration workflow).
2. Deploy this `futbol-jev` function and its local `relay.mjs` file with the
   checked-in function configuration. No Jev secret needs to be copied.
3. Update `JEV_RELAY_URL` in `js/systems/ai.js` and the saved relay URL in the
   game's Jev settings to the new project URL.
4. If the game's public domain changes, update `ORIGIN` in `relay.mjs`.
5. Test using the Jev key already saved in the browser. Export/import existing
   diagnostic rows separately only if needed; they are not career saves.
