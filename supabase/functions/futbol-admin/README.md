# Futbol Manager admin API

Development host: **musab-agents** (`wkzrefbvjxqphkrduyqj`).

Base URL: `https://wkzrefbvjxqphkrduyqj.supabase.co/functions/v1/futbol-admin`

Backs the **/admin** page (`admin/index.html`, served at `https://fmotg.app/admin/`). The functions accept requests from `https://fmotg.app`, `https://www.fmotg.app` and the old `https://mohdaie.github.io` (`ORIGINS` in each handler).
It stores the AI settings and the Jev / DeepSeek API keys in Supabase.

| Route | What it does |
|---|---|
| `GET /config` | What the game reads at start-up: settings plus whether a server key exists. Never the key. |
| `GET /state` | Settings plus `{ set, last4 }` for each key (admin page). |
| `PUT /settings` | Save settings for `jev` and/or `ds`. Unknown fields are dropped and numbers clamped. |
| `PUT /secret` | `{ service: 'jev' \| 'ds', value }` saves or replaces a key. |
| `DELETE /secret?service=jev` | Removes a key. |
| `POST /test` | `{ service }` sends one tiny request with the saved key. |
| `GET /usage` | AI call totals from `futbol_manager_ai_requests`. |
| `POST /report` | Anonymous play statistics from the game (`js/systems/telemetry.js`): `{ kind: open\|play\|career\|match, device, session, version, data }`. Validated and rate-limited by `futbol_play_report`. |
| `GET /players?days=30` | The admin Dashboard: players per day, new and returning players, minutes, matches and results, clubs, devices and versions (`futbol_play_dashboard`, Malaysia time). |

Tables (`20261029120000_futbol_admin.sql`): `futbol_admin_settings` and `futbol_admin_secrets`. Row-level security is on
with no policies, and anon / authenticated have no grants, so only the edge functions (service role) can read them.

## How the keys are used

`futbol-jev` and `futbol-deepseek` use the saved key when the game sends no `Authorization` header (Server key
mode). A personal key sent by a client still wins. The game never receives a key: it reads `/config` and, for a
service with a saved key, runs in Server key mode through the relay. A service without a key stays off.

## Sign-in (Google)

Every route except `GET /config`, `POST /report` and `/health` needs `Authorization: Bearer <Supabase Auth access
token>` from a Google sign-in whose email is in the `ADMIN_EMAILS` edge function secret (comma separated). No token:
401; a token for any other account: 403. With `ADMIN_EMAILS` unset nobody is an admin (fail closed). The admin page
(`js/ui/admin-services.js`) sends people to `/auth/v1/authorize?provider=google` and reads the access token from the
address fragment on return (implicit flow, one hour; then sign in again). It keeps the token in sessionStorage.

One-time setup:
1. Google Cloud Console → APIs & Services → Credentials → Create OAuth client ID (Web application). Authorized
   redirect URI: `https://wkzrefbvjxqphkrduyqj.supabase.co/auth/v1/callback`.
2. Supabase → Authentication → Sign In / Providers → Google: on, with that client ID and secret.
3. Supabase → Authentication → URL Configuration: add `https://fmotg.app/admin/` to the redirect URLs.
4. Supabase → Edge Functions → Secrets: `ADMIN_EMAILS` = the admin Google address(es).

Still open: the relays (`futbol-jev`, `futbol-deepseek`) spend the saved keys for any caller from the game's origins;
the per-device monthly budget is enforced in the game. Consider server-side rate limits.

Deploy with the Supabase dashboard or MCP: `index.ts` + `handler.mjs`, `verify_jwt = false`.
