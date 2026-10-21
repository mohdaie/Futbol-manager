# AI Brain cloud research

Current development host: **musab-agents** (`wkzrefbvjxqphkrduyqj`).
The game still plays and learns locally. `js/systems/brain-cloud.js` incrementally
uploads research data; it never downloads or activates a server engine automatically.

## Storage and size

- `futbol_brain_decisions`: compact situation/action/confidence/final-score details,
  retained for 30 days after receipt. Includes shots, xG, possession, fatigue,
  instructions and score at the decision. Match IDs are random and anonymous.
- `futbol_brain_summaries`: permanent counts, reward sums/squares, positive/negative
  counts, confidence totals and teacher disagreements. Separated by installation,
  app version, engine/tuning fingerprint, match kind, situation, action and provider.
- `futbol_brain_snapshots`: changed engine versions, approved/unapproved press items,
  current Brain settings and engine tuning/model metadata. No provider credentials.
- `futbol_brain_sources`: anonymous installation hashes and the last accepted batch
  sequence/digest. These remain after raw records expire, preventing replay totals.
- `futbol_brain_analysis`: private, security-invoker aggregate view for analysis.
- `futbol_brain_duels` (v5, migration `20261020170000`): per-installation player-duel totals from real matches,
  by engine version (game version + tuning hash), duel type, pitch row (0 = goal attacked) and attribute gap
  (steps of 2): tries, wins and the engine's predicted chance. `futbol_brain_duel_analysis` compares real
  against predicted rates. Batches may carry an optional `duels` array (at most 400 rows).
- `POST /usage` (v5): this installation's Jev/DeepSeek usage from `futbol_manager_ai_requests` via
  `futbol_ai_usage_stats()` (migration `20261020171000`), plus this month's totals across installations.

The first upload imports the entire existing draft as `legacy` summary totals and
up to 2,000 available decisions as details. Those details do **not** add to the totals
again. Older provenance/confidence/variance cannot be reconstructed, so legacy
rows remain separate and unknown variance/rates are returned as null.

Uploads contain at most 80 changed summary rows, 100 details and one changed
snapshot. Batches are capped at 512 KiB. A frozen batch is saved locally before
upload and kept until its acknowledgement is saved locally. Server updates and
sequence advancement happen in one transaction. Concurrent/different batches
with the same sequence are rejected rather than silently merged. Avoid running
the same local career in multiple tabs.

Offline details are capped at the latest 2,000 pending records; **all learning totals
remain** in the compact pending summaries. Omitted details are counted explicitly.
There is no quota-based silent discard of summaries. A full/blocked browser store
pauses sending to protect retry checkpoints. Retries back off to one hour maximum
and resume on reconnect/reopen; the AI Brain screen also offers **Sync now**.

Cron `futbol-brain-retention` runs hourly at minute 17 and removes at most 100,000
expired detail rows per run. Summaries and snapshots are not pruned. Inspect actual
table growth rather than assuming permanent storage is unlimited.

## Access

All tables have RLS and no browser grants; only the Edge Function service role can
ingest, and privileged project tools can analyse them. The write-only endpoint
hashes a random 256-bit installation credential into its source identity. It never
accepts a caller-supplied source ID or offers a public read endpoint. New credentials
create separate anonymous contributors. This is installation attribution, **not** a
verified human identity; treat submitted research as untrusted evidence.

The function limits each installation to 600 accepted batches/hour, validates and
whitelists uploaded fields, limits request size and restricts browser origin. The
service-role key stays in the Edge runtime. API keys, manager names, player records,
prompts, and full match commentary are never selected for upload. Local Brain reset
does not delete uploaded research; browser-data deletion loses the local credential
but leaves the server research available to project administrators.

## Analyse before changing the match engine

Run the queries in `supabase/analysis/brain.sql` through privileged Supabase tools.
Keep `live`, `instant`, `background`, `camp` and `legacy` separate, and compare like
situations and engine versions. Reward measures subsequent goal/points improvement;
it is not a match win rate or proof that the action caused the outcome. Several
decisions share a match result, so they are not independent trials. Use head-to-head
simulation before approving a version. This feature collects evidence; it does not
change simulation coefficients or publish a learned version automatically.

## Move to production

1. Apply the `futbol_brain_cloud` migration and `futbol_brain_ingest_fix` migration
   in order. Enable `pg_cron` and confirm the named retention job is active.
2. Deploy this function as `futbol-brain` with `verify_jwt = false`. Its handler does
   its own installation-credential authentication. Runtime service-role variables
   are provided by Supabase; do not put them in the game.
3. Copy all four Brain tables, including source sequence/digest checkpoints and
   snapshots. Preserve existing IDs. Copying only the records loses replay safety.
4. Change `BRAIN_CLOUD_URL`, deploy the game, then disable the old write endpoint
   once clients have refreshed. Keep a single writable backend during cutover.
5. Check a real phone's AI Brain sync status, query the received counts and inspect
   the retention job. No provider AI request is necessary to test cloud sync.

## 2026.10.20.6 update
Actions now also include `restyle`, `counter`, `cpress`, `protect` and `mark`. Buckets may end with the team's style (`|gegen`, `|tiki`, `|bal`, `|counter`, `|long`, `|custom`). `details.f` adds style, shape, fit, passPct, regains, duels and offsides for both sides. To set up production, apply migration `20261020150000_futbol_brain_actions_v2.sql` after the two earlier Brain migrations.
