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
  Invalid answers retain the local priority. Valid low-confidence reviews are
  recorded separately without adopting the suggestion and can be
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
node scripts/engine-qa.cjs --matches 6 --jev --strict
```

`--matches N` adds 1–40 seeded full matches to the report.
`--baseline-intent` compares the prior carrier scores while still measuring
pressure and forward opportunities; it requires `--matches`. See
[TEAM_INTENT.md](TEAM_INTENT.md) for the 24-match comparison.

The second command uses `JEV_API_KEY` or `TYPESAFE_API_KEY` from the environment
for one genuine call to the existing official endpoint. The real key stays in
the Node process, never in the VM's browser-settings stub or the output. Without
a key, it reports that no AI request was made and still runs the local audit.
`--strict` exits nonzero for measured failures; without it the report is diagnostic.
An explicitly requested Jev review that is unavailable/invalid exits with code 2.
A valid review below 0.6 confidence records `providerReview` and leaves the local
priority intact; the CLI succeeds because the provider actually reviewed the
batch. This does not mean its suggestion was accepted or a release approved.

The development loop is: audit → identify a failed group → optional Jev priority
→ implement the specific fix → audit again → meaningful browser/match regression.
Jev is an optional triage assistant; the scripts themselves provide the speed-up.

## What was verified

- Relay health request returned `{"status":"ok","service":"futbol-jev"}`.
- A **genuine Jev call succeeded in GitHub Actions** after the owner added
  `JEV_API_KEY`: run 39591839073 selected `match_regression` with confidence 1.
- A subsequent genuine full-match review selected `momentum` with confidence
  0.59. The original 0.6 adoption threshold rejected that suggestion; diagnostics
  now distinguish a valid uncertain review from an invalid provider response.
  The threshold for adopting suggestions remains 0.6.
- `tests/engine-qa.cjs`: 27 integration/contract checks with controlled HTTP
  responses, exercising the actual Jev client, usage, caching, bad answers,
  provider failure, budgets, concurrent calls, stale responses, and injected
  engine faults. These are explicitly mocked, not evidence of provider output.
- `tests/engine-qa-ui.cjs`: 10 mobile browser checks, including manual requests,
  local-only runs, caching, honest disconnected state, career isolation and layout.
- `tests/transitions.cjs`: 16 window, cohort, break/recovery and regain checks.
- `tests/defending.cjs`: 20 coordinated-unit, trigger, line-movement and back-line drift-limit checks.
- `tests/intent.cjs`: 17 scorer, mirrored geometry and possession lifecycle checks.
- `tests/shape.cjs`: 30 browser checks plus eight full-match smoke tests.
- `tests/briefing.cjs`: 33 regression checks for the existing manual dashboard AI.
- `tests/live.cjs`: 20 live playback/save/resume regression checks passed.
- The live save/resume test now compares refresh with the actual page-exit
  checkpoint and pauses the save/load round trip atomically. Its earlier clock
  samples raced the running match between separate browser calls.

This remains a draft branch. The full rulebook, league calibration and a live
release are separate remaining work.

Coordinated defending and continuation instructions: [CLAUDE_HANDOVER.md](CLAUDE_HANDOVER.md).
The full-match report now includes unit assignment, cover, trap and step/drop
frame counters. Strict mode also fails a measured assignment violation.
