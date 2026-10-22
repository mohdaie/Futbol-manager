# Individual starting-player profiles — version 2026.10.22.32

Version: **2026.10.22.32**, based on main `972c20e` / version .31.

**Release decision, 22 October 2026:** after the results below were disclosed, the owner explicitly
requested “Go live. I will reset my game.” Release is authorised with the documented match-balance
limitations still open. This decision supersedes the previous release hold; it does not resolve those
limitations or claim that the realism gate passed.

The former database generated current ability from market value and then randomised all attributes from
primary position. It did not use the inspirational figure's football strengths. A zero valuation gave an
established goalkeeper roughly 56 ability. This change replaces that path for **all 887 first-team players**
(542 league, 345 abroad), with fixed original profiles and separate specialist generation for prospects.

## What is authored

- `scripts/profile-assessments.cjs`: every first-team entry has an original assessment band, football type and
  stable physique. Its roster signature stops order changes silently assigning another player's assessment.
- `scripts/build-player-profiles.cjs`: original football types and explicit traits for distinctive players,
  deterministic familiar positions, current ability calculated from attributes, potential separate from value.
- `js/core/profiles.js`: shipped data, loaded before player generation. No build step is needed to play.
- `assessments.json`: named, club-by-club manifest of the resulting ratings for review.
- Rulebook **11a** defines the requirements. No match-engine coefficients changed.

These are fictional-player design assessments, **not imported EA or Football Manager ratings**. Public
comparisons in the earlier audit identified review candidates; that dataset is not a build input.
Most profiles remain **provisional**, using an explicitly chosen football type rather than claiming complete
individual scouting. Physical dimensions without independently verified measurements are stable estimates,
not asserted facts. Fine-grained individual validation remains open for lesser-documented players.

| Inspiration | Previous 100-world mean | Revised overall | Key identity correction |
|---|---:|---:|---|
| Morgan Rogers | 92.6 | 86 | Powerful carrier, 187 cm; no automatic elite creator attributes |
| João Pedro | 91.6 | 85 | Touch/link play; reduced raw pace/strength relative to the old generation |
| Brian Brobbey | 87.7 | 79 | Strong target, more modest finishing/composure |
| Kevin Schade | 87.6 | 80 | Fast runner; does not excel at every attacking skill |
| Erling Haaland | 93.8 | 93 | Finishing/movement 20; dribbling 14; 195 cm |
| Jérémy Doku | 90.3 | 85 | Dribbling/agility/flair 19; finishing 12 |
| Bruno Fernandes | 91.8 | 89 | Vision 20, passing/work 19; dribbling 15 |
| Granit Xhaka | 87.4 | 86 | Passing 19, pace 8 |
| Luka Modrić | 84.8 | 86 | Passing/first touch 19, dribbling 18, stamina 11 |
| Benjamin Lecomte | 56.3 | 73 | Fixed assessed keeper profile; zero value no longer weakens him |

## Existing careers

New careers use all corrected profiles. Untouched starting saves migrate once, retaining IDs, contracts,
money, injuries, statistics and selections. Careers already advanced keep their trained attributes and
receive a Settings note explaining that the revised database is used for new careers. Historical training
increments were not recorded against a starting baseline, so this change does not pretend to reconstruct
them or silently erase development. Newly profiled players store an independent baseline for future work.

## Functional validation

- 23 test suites exercised. Initial `deals.cjs` exposed an empty harmony memo for a neutral personality;
  added a neutral assessment without changing the transfer score. Its 20 checks passed on rerun; the other
  22 suites passed. Baseline `deals.cjs` was also run and passed.
- New `tests/player-profiles.cjs`: 16 checks covering all 887 entries, exact attribute bounds, price
  independence, random-world identity stability, specialist contrasts, missing valuations, physique,
  versatility, generated prospects, independent baselines, legacy migration, progress retention and save/load.
- Strict engine audit: **3,555 assertions / 1,109 scenarios, no failures**.
- 12 full matches through `engine-qa.cjs --matches 12 --strict`: finished, finite, no defensive assignment
  violations. See `match-contracts.json` and `profile-contracts.json`.

## League comparison and release hold

Each version ran three fixed seeded worlds, 120 matches per world: **720 matches total**.
The same seed IDs reproduce each version; changed world-generation draw counts mean they are not identical
player/tactic worlds or matched random-event streams. Treat the comparison as a broad league screen, not a
controlled estimate of one attribute's causal effect.

| Metric | Main .31, seeds 1 / 2 / 3 | Revised .32, seeds 1 / 2 / 3 |
|---|---|---|
| Goals/match | 2.86 / 2.74 / 2.30 | 2.63 / 2.50 / 2.99 |
| Shots/match | 23.63 / 23.59 / 22.97 | 20.70 / 19.98 / 20.63 |
| Passes/team | 682.2 / 675.0 / 658.2 | 643.4 / 642.5 / 639.7 |
| Fouls/match | 24.07 / 24.02 / 25.32 | 31.98 / 31.91 / 32.28 |
| Tackles/team | 30.4 / 30.9 / 33.1 | 38.2 / 38.1 / 38.6 |
| Successful dribbles/team | 23.9 / 25.2 / 27.0 | 34.5 / 33.8 / 33.8 |
| Offsides/match | 4.31 / 4.04 / 5.00 | 5.77 / 5.52 / 5.29 |
| Wins by 5+ | 3.3% / 5.8% / 6.7% | 3.3% / 6.7% / 7.5% |
| Most goals by one team | 10 / 8 / 8 | 6 / 11 / 12 |

The consistent increase in ground challenges/fouls and 11-/12-goal extremes means **the release realism gate
has not passed**. This initially blocked release; the explicit owner decision above authorises rollout
with these known limitations. No ENG
coefficient was adjusted to hide the issue. The baseline already has excess dribbles/tackles, but that does
not excuse the revised candidate's larger counts.

A separate 45-minute actual-match trace (seed 20261022, Gunners gegenpress against Villans long ball)
ended 1–0 in both versions. Baseline: shots 11–4, passes 309–296, fouls 3–4; revised: shots 8–0, passes
406–260, fouls 4–6. Revised average-position maps show a recognisable 4-3-3 press versus a 4-4-2 block,
but the action trace at 119.5 s contains a 37 m long pass from the away ST in the final third back to a DC
in the middle third. This is a concrete progression defect, not a conclusion from the score. Freeze-frames
at 120/300/600 s and average positions were inspected; these do not isolate the cause of the league's
extra challenges or extreme scorelines.

Next validation: trace challenge/carry sequences and the extreme fixtures, distinguish profile mistakes
from automatic take-on/defensive-flow behaviour, then fix the football reason under the rulebook and rerun
three seeded worlds. Keep credible specialist strengths; do not fit profiles to league totals or style wins.

Reproduce profile authoring with `node scripts/build-player-profiles.cjs`, then run
`node tests/player-profiles.cjs`. The existing `scripts/realism/README.md` describes the scorecard.
