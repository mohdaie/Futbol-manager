# Futbol Manager DeepSeek relay

Development host: **musab-agents** (`wkzrefbvjxqphkrduyqj`).

Base URL: `https://wkzrefbvjxqphkrduyqj.supabase.co/functions/v1/futbol-deepseek`

The game appends `/chat/completions` and forwards the saved personal DeepSeek
key. Only text messages, supported models, bounded output lengths and the
fixed DeepSeek endpoint are allowed. There is no shared funded DeepSeek key.

The function writes metadata to `public.futbol_manager_ai_requests` with
`provider = deepseek`. It stores no credentials, prompts or generated content.
The existing checked-in migration covers both providers.

For production, apply the existing table migration, deploy this function with
its `relay.mjs` and the checked-in configuration, then update `DS_RELAY_URL` in
`js/systems/ai.js` and the saved relay URL in game settings. Update ORIGIN in
the relay if the game's public domain changes.

In More → Admin → DeepSeek, supply a personal key and enable the required
features: Second opinion and/or Press conference questions. These settings do
not enable paid calls automatically. Use Test connection to verify the key.

## Usage statistics (version 2)

The game may add `meta: { f: feature, i: installation }` to the request body in Personal relay mode. The relay
never forwards it. It logs the feature, cache-hit tokens, the cost in US$ (list prices, DeepSeek peak/off-peak)
and the SHA-256 of the installation id in `futbol_manager_ai_requests` (migration `20261020171000`).
Admin > AI usage reads it back through `futbol-brain` `/usage`.
