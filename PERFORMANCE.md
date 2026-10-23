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


## Release 2026.10.22.45: background club registry

Four top-division club registries cover 76 clubs in Spain, Italy, Germany and France. Four existing overseas counterparts are reused; only 72 club records are added. Placeholder slots are derived on demand from a shared position template. No individual dummy player, agent relationship, fixture, weekly financial simulation or automatic squad generation is created.

In a seeded browser comparison against release 44, the player count stayed at 2,556 and fixture count at 932. SHA-256 digests of the complete player and fixture payloads were identical. Agent-to-club relationship entries stayed at 2,280. The serialized career grew from 1,942,946 to 1,965,588 UTF-8 bytes: about 23 KB (1.17%). This is storage overhead, not a physical-phone timing guarantee.

A single paired headless Chromium run at 390 × 844 and 6× CPU throttling recorded a 32-match batch at 2.30 s before / 2.11 s after, and dashboard render medians at 116 / 95 ms. These differences include normal measurement noise and do not establish an improvement. The all-clubs directory increased from 147 to 220 ms while its club count grew from 58 to 130; country filters reduce the list to 18 or 20 clubs. Both runs completed without browser errors. Real-device and long-career measurements remain separate.

The focused world suites check all four memberships against the pinned source, transfer and friendly exclusions, migration preserving players and fixtures, save/reload, phone layout, and three rollovers without materializing dummy players. Existing English competition, profile, transfer-deal, storage, input-recovery, club-navigation and friendly suites also passed; the strict engine audit retained 1,109 passing scenarios / 3,555 assertions.

## Release 2026.10.23.1: transfer search

Transfer Search opens with at most 20 unique players referenced by recent in-game transfer news, rumours or completed moves. The 14-day feed resolves player IDs directly, without enumerating the player database or sorting every player by scouting rating. If no stories exist, the landing page is empty. Name and filter edits remain drafts until Search players or Enter submits them; results use 20-player pages. Both fictional and inspirational names are searchable, including accent-insensitive matches. Players remain in the career database; this change defers search work and limits rendered rows rather than removing player records from memory.

A paired headless Chromium measurement at 390 × 844 with 6× CPU throttling, seven renders per build and 25 linked rumours, recorded median transfer-screen render time of 175.6 ms in release 45 and 91.5 ms in this release. Visible rows fell from 60 to 20. Full-player enumerations across the seven complete screen renders fell from 14 to 7: the shared shell still enumerates players; the landing search itself does not. Both careers contained 2,556 players. This is a development-machine observation, not a physical-phone guarantee.

The focused search suite passes 22 checks covering real story sources, date windows, deduplication, no default database enumeration, names and filters, input stability, Enter submission, paging, profile Back navigation and mobile layout. Navigation (47), links (51), scouting (23) and updates (13) also pass.

```sh
NODE_PATH=/opt/codex/cua_node/lib/node_modules CHROMIUM_PATH=/usr/bin/chromium node tests/transfer-search.cjs
```

## Release 2026.10.23.2: position-led team views

Formation circles show the position in the selected in-possession or out-of-possession shape rather than numerical ability. Shared player rows and matchday selection lists omit ability badges; opening a player profile retains the rating and attributes. Live substitute lists also omit OVR text. Condition, fatigue, injury indicators and match-performance scores remain available. The shared row renderer no longer calculates a scouting rating for the removed badge. Player data and match calculations are unchanged.

Lineup (23), live tactics (28), links (51), transfer search (22) and updates (13) pass. A separate 390-pixel browser inspection confirmed both formation shapes display their actual positions, squad and selection rows contain no ability badges, profiles retain ability, and no horizontal overflow or browser errors occurred.

## Release 2026.10.23.3: transfer packages and retained manager names

Transfer packages add bounded annual payment rows and small player-clause records, with no extra players or fixtures. The payment processor iterates outstanding obligations rather than player squads. Finance lists the next 20 payments separately from conditional sell-on and buy-back rights. Entire guaranteed cash fees reserve transfer budget once; only due cash changes bank balances and the cash ledger. Legacy payments acquire a fixed debtor club so changing jobs does not move the debt to the new club. See [TRANSFER_PACKAGES.md](TRANSFER_PACKAGES.md) for the explicitly simulated negotiation rules and finance semantics.

The focused browser suite passes 69 checks, including actual Premier League and Championship negotiation stages, purchases and sales, multiple future annual settlements, buy-back completion, refusal and valuation checks, medical and stale-package rejection without partial moves, duplicate payment/completion protection, legacy debtor migration, durable save/reload and phone layout. A one-for-one exchange between two 36-player Championship squads keeps both at 36. Existing deals (20), storage (19), input recovery (8), navigation (47), live tactics (28), Championship UI (17), background league UI (21), updates (13), Dashboard/friendlies (11), lineup (23), links (51), transfer search (22) and world-registry core checks also pass.

Manager names are stored on input and captured before avatar/league/club rerenders. The new-career regression follows all three choices, Enter and Take charge, confirming the entered name reaches the career rather than the fallback. Tactics also includes the requested First XI list immediately above substitutes, with natural positions, condition/fatigue, morale, sharpness and profile access. Player abilities and match calculations are unchanged.

## Release 2026.10.23.4: back line holds when a runner is tracked

When a striker runs in behind the defence while the ball is still in midfield or on the edge of the final third, the nearest centre-back no longer chases him into the six-yard box. He holds the line, at most about 2.5 m behind the average height of the other defenders, and moves slightly towards the middle to cover the central channel. If the striker is already deeper than that, the offside trap and goalkeeper take him, as they would in a real defence. Once the ball is behind the line or inside the penalty area, defenders track runners fully again.

This is a shape and positioning change. Player abilities, match calculations and the player-facing screens are unchanged. Defending tests (20 checks) and the engine QA suites pass, and a 40-match seeded batch against the previous release showed no defensive violations. Match-level differences in that batch (fewer open chances after a break, slightly fewer shots and goals) are not statistically significant on a sample of this size, so they are not presented as a measured change in realism. See [engine-qa/defending-drift-comparison.json](engine-qa/defending-drift-comparison.json) for the full comparison.

## Release 2026.10.23.5: attacking movement

Attacking runs and passing are more coordinated. When a forward drops back to receive, an advancing midfielder or winger from behind him is sent into the space beyond him, and passes to the dropped forward are slightly preferred while that runner is open. On a turnover, wide attackers run diagonally inwards at once. In a counter-attack, back-passes are discouraged and diagonal releases to wide attackers and through-balls are preferred.

When the ball-side winger holds the touchline, the full-back, wing-back or mezzala on that side underlaps into the half-space in build-up and progression. This applies to teams whose wide player is assigned the Winger role (the Balanced and Long Ball presets). Against four or more opponents packed on the ball side, cross-field switches to an isolated wide winger are slightly preferred.

Defenders pressing wide are triggered less often by the underlap: about a fifth fewer wide-trap situations per match in a 40-match seeded batch. Whether that reads as better or worse on the pitch has not yet been judged. Goals rose in the same batch, but not significantly. Engine suites pass. See [engine-qa/defending-drift-comparison.json](engine-qa/defending-drift-comparison.json) for the comparison method.


## Release 2026.10.23.6: twenty compact overseas squads

Five clubs each in Spain, Italy, Germany and France gain transferable first teams, six reserves and separate academy-strength estimates. Foreign leagues stay inactive and clubs are friendly opponents rather than management jobs. No annual youth intake or generated reserve top-up is enabled for these clubs. Existing careers retain the four old authored rosters, trained players, contracts and transfer ownership; new squads are seeded once. The other 56 clubs retain virtual non-transferable placeholders. Source dates and generated gaps are explicit in [data/world/SQUADS.md](data/world/SQUADS.md).

A paired local headless Chromium run against release 3, before merging the newer engine releases, at 390 × 844 with 6× CPU throttling measured 2,556 versus 2,791 players, 932 fixtures in both builds, and serialized new-career saves of 1,966,662 versus 2,205,066 bytes (+238,404, about 0.24 MB). Five menu samples and three save samples produced the observations below. This single run includes timing noise and does not establish a performance improvement or physical-phone guarantee. The isolated feature's earlier comparison against release 45 recorded larger menu/save-copy costs; that report is retained rather than treating one later run as definitive.

| Measurement | Release 3 | Integrated squad draft |
| --- | ---: | ---: |
| New career through durable save | 2.15 s | 2.14 s |
| Dashboard paint median | 133 ms | 137 ms |
| Tactics paint median | 167 ms | 149 ms |
| All-clubs directory paint median | 292 ms | 266 ms |
| Transfer Search paint median | 83 ms | 81 ms |
| Save-worker synchronous copy median | 67 ms | 66 ms |
| Durable save median | 132 ms | 130 ms |

Both runs completed without browser errors. Raw measurements are in [data/world/performance-integration-2026-10-23.json](data/world/performance-integration-2026-10-23.json). Save copying and the all-clubs directory remain measurable costs; this feature does not change their underlying mechanisms.

Integration checks pass for foreign squads (22), registry (18), mobile directory/friendlies and three rollovers (27), transfers including Premier League/Championship package simulations (69), deals (20), storage (19), player links (51), navigation (47), update handling (13), friendlies (9), English identities (8), profiles (16), and competition rules (15). The player-link test now expects the selected clubs' explicit inactive-league/friendly/transfer message rather than their old placeholder-era wording.

The final integration was rebased onto release 2026.10.23.5 before publication. Its defending and attacking-movement engine changes are retained unchanged. After that rebase, foreign squads (22), the 69-case transfer package suite, mobile directory/three rollovers (27), player links (51), updates (13) and the updated defending suite (20) passed again. The timing table above remains the explicitly labelled pre-engine-merge squad comparison.

## Release 2026.10.23.7: live match views and changes of ends

The match screen has four persistent views: 2D, Formation, Line up and Match stats. Both sides' formations, roles, lineups, substitutes, substitutions, dismissals, condition, injury, fatigue, morale and team statistics use the current live match state. With-ball/without-ball formation views are available for both teams. Health information is in Line up, replacing the strip under the canvas. Player cards work for the opposition and unused substitutes as well as the managed side.

The canvas, mini-map, camera, player-facing markers and click projection change ends when the second half begins. The manager's team identity remains fixed, so swaps, substitutions and tactical instructions continue to affect the correct side. The transform also handles the dynamically timed extra-time periods. Half-time breaks clear the previous-minute interpolation samples, and saved matches restore their selected view, formation phase and correct period orientation without altering engine coordinates or results.

Tab changes do not recreate the canvas or start another animation loop. The match continues while data views are open. Hidden data panes wait until shown before rebuilding, visible lineups retain their controls during ordinary health updates, and hidden 2D drawing is skipped while the simulation and commentary continue. Stale hidden lineup rows are excluded from health updates, including when an opponent substitutes while another pane is visible. No extra players, fixtures or background match work are introduced.

The focused match-view suite passes 43 checks covering both sides, actual half-time and the following worker minute, away-manager orientation, extra-time orientation, canvas hit testing after the end change, live substitutions/dismissals/shapes/stats, immediate manager shape/captain changes, health focus preservation, continued simulation with 2D hidden, hidden-pane roster updates, durable save/reload, keyboard tabs and 390×844 / 320×568 / 844×390 layouts. Existing full live matches (23), live tactics (28), dismissal reorganization (16), animation (9), navigation (47) and update handling (13) also pass. Viewport tests use headless Chromium rather than physical Android/iPhone hardware.

```sh
NODE_PATH=/opt/codex/cua_node/lib/node_modules CHROMIUM_PATH=/usr/bin/chromium node tests/match-views.cjs
```

## Release 2026.10.23.8: compact live tabs and pause before match management

The live match view tabs use a compact segmented style to fit the phone screen. Opening Tactics or Subs pauses the match and leaves it paused when the panel closes, giving the manager time to make changes before explicitly resuming play. The navigation suite passes 49 checks, including pause behavior for both panels; the match-view suite passes 43 checks across phone and landscape layouts.

## Release 2026.10.23.9: virtual international squads

The 56 non-selected overseas clubs now show 25 deterministic, country-matched read-only player names and nationalities. They remain virtual rows without player IDs or profiles, so they do not enter scouting, transfers, match simulation or saves. The generated nationality mixes respect Spain's three non-EU registration limit; the Italian, German and French splits are marked as plausibility targets rather than domestic legal quotas.

## Release 2026.10.23.10: overseas club crest colors

The 56 background-only overseas clubs now use club-specific crest colors based on their real-world home identities. Existing selected clubs keep their current palettes.

## Release 2026.10.23.11: closing-window urgency

During the final week of a transfer window, scouting reports arrive sooner and their rush rates rise with urgency. Video reports cost more and can be delivered immediately on deadline day. Transfer negotiations between clubs also advance faster as the deadline approaches.

## Release 2026.10.23.12: final-week transfer urgency

Transfer-window urgency now starts seven days before closing. Scouting rush pricing, faster report timing, and quicker club negotiations are limited to this final-week period.

## Release 2026.10.23.13: exact players in news links

When a news item carries a player ID, matching abbreviated name links in that item now resolve to that exact player instead of listing every player with the same display name.
