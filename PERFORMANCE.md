# Performance and local saving

The game remains a static site with no build step. Workers and IndexedDB require serving it over HTTP(S); opening index.html directly is unsupported.

## Match processing

- `js/engine/fast.js` runs the `events-v1` model for unwatched computer fixtures. It shares lineups, strength calculations, tactic suitability, condition drain, substitutions, discipline, injury handling, and final settlement with the detailed model. It generates no positional frames.
- User fixtures retain the positional model whether watched or played instantly. Event-model decisions are excluded from positional-engine learning to avoid mixing training outcomes from different models.
- `js/engine/background.js` and `js/workers/simulation.js` run normal calendar processing, instant user matches, and live minute generation asynchronously. Worker input includes only participating squads, settings needed by the engine, approved manager-policy data, and league-wide positional averages. API credentials are not sent.
- Per-fixture random state survives checkpoints. The same input produces the same model result in the worker and compatibility paths. The two models are statistically compared; they do not promise identical scorelines.
- Sync `quickSim`, `advanceDay`, and related APIs remain available for existing analysis tools. Normal UI paths use their async counterparts. If a simulation worker is unavailable, event matches can run locally and detailed instant matches yield between minutes.
- Match settlement is idempotent. Duplicate or late jobs cannot pay a fixture twice or apply results to a replacement career. Live results computed before a tactical edit or navigation are discarded.

## Save durability

- `js/workers/storage.js` owns the `futbol-manager` IndexedDB database. Career metadata, player records and club records are committed in one transaction. Only changed records are written; records removed from the career are deleted. Learning-engine data is stored separately in the same database.
- Autosaves coalesce requests over 150 ms. `saveGame()` queues a checkpoint; it does **not** prove the data is durable. Critical navigation uses `await saveGameAsync()` or `await SaveStorage.flush()` and stays put on failure.
- Serialization occurs in the worker. Posting a structured snapshot still has a main-thread copying cost; this does not imply zero-cost saves for arbitrarily large worlds.
- Live checkpoints exclude animation frames and callbacks and are frozen before generating another minute.
- Startup waits for database hydration. Legacy localStorage careers are copied, read back and compared before use. Their original recovery copy remains untouched. New saves prefer IndexedDB. Explicitly deleting a career removes its old localStorage recovery copy too.
- Database revisions reject stale writes from another tab. A failed write retains the previous complete checkpoint. A pending-save close warning prevents silently assuming an asynchronous page-exit write will finish; force-closing a browser can still lose changes since the last committed checkpoint.
- JSON downloads and old base64 codes are portable. File import validates and normalizes data before replacing the stored career. Direct phone-file writes require browser support and user permission; manual download remains available. A selected file handle is remembered only for the current session.
- If workers cannot start, explicit backup serialization can run locally so an existing career can still be exported. Database errors are not reported as successful saves. IndexedDB remains local browser storage, not cloud sync or an unlimited storage guarantee.

## Validation

Set `CHROMIUM_PATH=/usr/bin/chromium` in this environment. Playwright resolves through the existing NODE_PATH. Tests can start their own servers or accept an existing server URL.

```sh
node tests/storage.cjs
node tests/input-recovery.cjs
node tests/dashboard-friendlies.cjs
node tests/live-red-card.cjs
node tests/gap.cjs
node tests/background.cjs
node tests/live-animation.cjs
node tests/live.cjs
node tests/live-tactics.cjs
node tests/navigation.cjs
node tests/updates.cjs
node tests/lineup.cjs
node tests/links.cjs
node scripts/engine-qa.cjs --strict
```

The paired distribution check runs 120 matches per model in each seeded world. Run it with SEED=1, 2 and 3; retain each result separately. The broad gates detect large regressions in goals, shots, xG, passing and discipline, not exact football realism or real-phone performance.

```sh
SEED=1 node scripts/realism/league.cjs "globalThis.MATCH_COMPARE_SEED=1;$(cat scripts/realism/fast-compare.js)"
```

The background suite reports a 32-fixture batch time and verifies that rendering continues during a detailed instant match. Benchmark without other CPU-heavy suites running when recording release performance. Physical-device and long-career testing remain separate validation.

## Release 2026.10.22.40 measurements

Headless Chromium on the development machine processed 32 background fixtures in approximately 0.5–1.1 seconds across the recorded runs. The earlier detailed background engine took roughly 0.9–1.5 seconds for each fixture. A 16-second live sample at 4x playback rendered 961 frames, with a 95th-percentile interval of 16.8 ms and no observed main-thread long tasks over 50 ms. These measurements are not promises for all phones.

Across 360 paired fixtures (120 each in seeded worlds 1, 2 and 3), the models produced these averages per match:

| Metric | Detailed | Event model |
| --- | ---: | ---: |
| Goals | 3.03 | 3.23 |
| Shots | 21.86 | 22.97 |
| xG | 3.01 | 3.07 |
| Pass attempts | 1,291 | 1,326 |
| Pass completion | 78.0% | 76.5% |
| Fouls | 26.46 | 25.15 |
| Yellow cards | 3.74 | 3.93 |
| Red cards | 0.23 | 0.24 |
| Final on-pitch condition | 77.5% | 76.9% |

For reproducing worlds 2 and 3, change both SEED and MATCH_COMPARE_SEED in the command above. These are measured comparisons against the shipped positional model, not a claim that all statistics match real-world football. User fixtures keep the detailed model in both watched and instant play.

## Release 2026.10.22.41 input recovery

A stalled asynchronous save previously left the global input lock active indefinitely, silently swallowing navigation and backup buttons. Navigation and backup actions now remain available while career-changing operations finish; conflicting career operations report that they are waiting. Storage requests have a 12-second deadline. If the storage worker cannot start, a bounded read-only recovery path loads the latest IndexedDB career before considering the legacy migration backup. Failed storage remains blocked against new writes, and portable backup export remains available. Static scripts and CSS are versioned together to avoid reusing incompatible cached files.

The input-recovery suite injects an unresponsive worker, checks menu actions during a pending save, verifies timeout cleanup and backup download, and checks recovery from IndexedDB with a deliberately older localStorage copy. Storage, navigation and update suites also pass. This verifies the reproduced input-lock failure; it does not establish that every source of lag on a physical phone is resolved.

## Release 2026.10.22.42 dashboard rendering

An upcoming overseas friendly has no opponent row in the domestic league table. Dashboard and match preparation both dereferenced that missing row, throwing before the new screen could replace the old one. Both screens now handle absent domestic league data; the dashboard labels friendly fixtures correctly. The mobile regression suite arranges an overseas friendly, taps Dashboard and its squad/board/finance links, reloads the saved career, opens match preparation, starts live play, and returns to Dashboard. All 11 checks pass, along with briefing, navigation, input recovery and update checks.

## Release 2026.10.22.43 dismissal reorganization

After closing the automatic dismissal popup, managers can reopen Reorganize positions from both in-match Tactics and Substitutions. Empty positions are selectable in First XI and Formation; swap mode can move a remaining player into an empty position in either selection order. With multiple dismissals, the manager can choose which gap to cover. Moving a player leaves another gap and consumes no substitution or window. A substitute must replace an on-pitch player and cannot directly fill the dismissed player's vacant slot.

The red-card browser regression suite dismisses the initial popup, uses the normal controls to reorganize, covers multiple dismissals and an emergency keeper, makes a normal substitution, and reloads the saved match. Engine checks verify player-count conservation, ball ownership, exhausted substitution limits, invalid target rejection and rejection of direct replacements for sent-off players.


## Release 2026.10.22.44: two English divisions

The new world has 2,556 players and 932 regular-season fixtures. Championship squads stay at a combined maximum of 36 across first team and reserves, without U18 squads. The new identity data is static; match workers still receive only the two participating squads. World initialization shares nationality/club indexes for favourite-person links instead of rebuilding a full player list for each player.

A single paired headless Chromium run at 390 × 844, with **6× CPU throttling**, produced these measurements. They are development-machine observations, not physical-phone guarantees or statistically controlled performance improvements:

| Measurement | Release 43 world | Two-league world |
| --- | ---: | ---: |
| Players | 1,738 | 2,556 |
| Serialized save after 32 fixtures | 1.24 MB | 1.99 MB |
| New-career click to dashboard | 2.27 s | 1.87 s |
| Median squad render, 3 samples | 69 ms | 74 ms |
| Median tactics render, 3 samples | 140 ms | 100 ms |
| Median fixtures render, 3 samples | 91 ms | 108 ms |
| Median league-table render, 3 samples | 84 ms | 93 ms |
| Median dashboard render, 3 samples | 87 ms | 90 ms |
| Explicit save snapshot clone | 90 ms | 157 ms |
| 32 background fixtures | 1.84 s | 1.95 s |

Both runs completed without browser errors. The larger career increases main-thread snapshot copying cost; IndexedDB does not remove structured-clone cost. An unthrottled background-suite run processed 32 fixtures in 533 ms and confirmed continued rendering during a detailed instant match. Save coalescing, bounded storage failures and navigation during pending saves retain their existing checks.

The release also passed the dedicated Championship UI suite (17 checks), identity checks (8), competition rules checks (15), discipline checks (14), player profiles (16), storage (19), input recovery (8), navigation (47), links (51), briefing (33), lineup (23), Dashboard/friendlies (11), red-card reorganization (16), live tactics (28), and updates (13). The strict engine audit passed 1,109 scenarios / 3,555 assertions. Legacy release-43 migration retained all 1,738 player records and fixture records byte-for-byte in the tested career. Long-career and physical-device testing remain separate.
