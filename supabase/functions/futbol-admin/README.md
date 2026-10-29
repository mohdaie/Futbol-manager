# Futbol Manager admin API

Development host: **musab-agents** (`wkzrefbvjxqphkrduyqj`).

Base URL: `https://wkzrefbvjxqphkrduyqj.supabase.co/functions/v1/futbol-admin`

Backs the **/admin** page (`admin/index.html`, served at `https://mohdaie.github.io/Futbol-manager/admin/`).
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

Tables (`20261029120000_futbol_admin.sql`): `futbol_admin_settings` and `futbol_admin_secrets`. Row-level security is on
with no policies, and anon / authenticated have no grants, so only the edge functions (service role) can read them.

## How the keys are used

`futbol-jev` and `futbol-deepseek` use the saved key when the game sends no `Authorization` header (Server key
mode). A personal key sent by a client still wins. The game never receives a key: it reads `/config` and, for a
service with a saved key, runs in Server key mode through the relay. A service without a key stays off.

## No sign-in yet

By request, the admin API has no authentication. Anyone who can reach the origin-restricted URLs can change
settings, replace or remove keys, and the relays will spend the saved keys for any caller. Keys are write-only
(never returned). Add a passphrase or Supabase Auth check in `handleAdmin` before sharing the address widely, and
consider per-device rate limits on the relays.

Deploy with the Supabase dashboard or MCP: `index.ts` + `handler.mjs`, `verify_jwt = false`.
