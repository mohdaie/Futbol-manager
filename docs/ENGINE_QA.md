# Fast engine testing with Jev

The quick audit runs **1,109 deterministic scenarios / 3,555 assertions** against
the real pitch planner, covering 64 formation pairings, both possession states,
central/wide build-up, progression and final-third positions, each style,
carrier exclusion, two missing players and selected role jobs. The current scan
passes all assertions in roughly **0.2 seconds** in Node on the development host.
It measures shape anchors; it does not establish full-match quality or league calibration.

## Use in the game

**More → Admin → Engine → Fast engine checks + Jev**:

- **Quick local checks** computes the batch without making an AI request.
- **Run checks + Jev** computes it and sends one bounded aggregate result to the
  existing `jevAsk()` client. Enable **Engine testing** under Jev AI and use the
  existing connection/key. Opening Admin or the shape demo makes no request.
- Jev selects an investigation from the failures that actually occurred. With
  no failures it can select full-match regression. It cannot alter a test result,
  rewrite the engine, change tuning or equalise style win rates.
- Accepted reviews are reused for identical facts and engine-source fingerprint.
  Failed/invalid/low-confidence answers retain the local priority and can be
  retried explicitly. Only one engine-review request can be in flight. Existing
  monthly budget and usage accounting apply. Career changes discard stale replies.
- Data sent to Jev contains counts and at most three examples per category.
  No player records, career snapshot, API key or source code is included in state.
  The existing client sends the credential in its normal authorization header.

## Developer workflow

For hosted testing, add a repository Actions secret named `JEV_API_KEY` under
Settings → Secrets and variables → Actions. `.github/workflows/engine-qa.yml`
runs local checks and one genuine review on the draft branch. The credential is
available only to the review step; it is never printed or committed. A missing
secret fails the review step explicitly. After adding it, rerun that failed job.
The workflow has read-only repository permissions and does not deploy the game.

Run the actual browser planner in Node without launching Chromium:

```sh
node scripts/engine-qa.cjs --strict
node scripts/engine-qa.cjs --jev --strict
```

The second command uses `JEV_API_KEY` or `TYPESAFE_API_KEY` from the environment
for one genuine call to the existing official endpoint. The real key stays in
the Node process, never in the VM's browser-settings stub or the output. Without
a key, it reports that no AI request was made and still runs the local audit.
`--strict` exits nonzero for measured failures; without it the report is diagnostic.
An explicitly requested Jev review that is unavailable/invalid exits with code 2,
so an automated workflow cannot mistake a local-only run for a provider review.

The development loop is: audit → identify a failed group → optional Jev priority
→ implement the specific fix → audit again → meaningful browser/match regression.
Jev is an optional triage assistant; the scripts themselves provide the speed-up.

## What was verified

- Relay health request returned `{"status":"ok","service":"futbol-jev"}`.
- **No real provider review was performed in this workspace**: neither supported
  environment variable was set, and the personal relay deliberately has no shared
  key. The user's in-game browser settings are not accessible from this workspace.
- `tests/engine-qa.cjs`: 25 integration/contract checks with controlled HTTP
  responses, exercising the actual Jev client, usage, caching, bad answers,
  provider failure, budgets, concurrent calls, stale responses, and injected
  engine faults. These are explicitly mocked, not evidence of provider output.
- `tests/engine-qa-ui.cjs`: 10 mobile browser checks, including manual requests,
  local-only runs, caching, honest disconnected state, career isolation and layout.
- `tests/shape.cjs`: 28 browser checks plus eight full-match smoke tests.
- `tests/briefing.cjs`: 33 regression checks for the existing manual dashboard AI.
- `tests/live.cjs`: 20 live playback/save/resume regression checks passed.
- The live save/resume test now compares refresh with the actual page-exit
  checkpoint and pauses the save/load round trip atomically. Its earlier clock
  samples raced the running match between separate browser calls.

This remains a draft branch. The full rulebook, league calibration and a live
release are separate remaining work.
