# Team intent: layer 3 review

`js/engine/intent.js` now adjusts the real carrier's existing action values before
shortlisting and selection. It considers direction, interception risk, receiver
pressure, current phase, Vision/Decisions and the previous passer. Existing
passing style, tempo, attributes and stochastic decision quality remain active.

- Prefer a viable forward pass/carry, while allowing recycling under pressure
  or when forward routes are closed. Build-up favours a safe pivot/full-back;
  chance creation values access to Zone 14.
- A completed intended pass crossing the opponent's actual midfield/back line
  starts a six-second forward-continuity window. Turnovers, kickoffs and restarts
  clear it. Existing saves without this optional state remain readable.
- Discourage routine backward/square returns when another safe forward route
  exists. A forward return to the previous passer retains its usual value.
- Value an open opposite flank when the defending block has shifted towards
  the ball. This recognises the switch opportunity; new overload/third-man
  runner choreography is still pending.

The scorer changes preferences, not guarantees. A forward route requires more
than two metres of progress and acceptable risk/receiver pressure. Restart
choices and shot values are untouched. The six-second window is an implementation
choice for attacking continuity, separate from the pending 5–8 s counter-press.
No `ENG` tuning values or style win-rate targets changed.

## Same-seed comparison

Both batches use the real shipped match functions, the same generated world and
seed **20261021**, with manager tactical changes disabled. Baseline mode measures
opportunities on cloned options and discards only the new intent score changes.
It reproduces the preceding engine's six-match baseline exactly. No baseline
flag is shipped in the game.

| Measure | Baseline, 24 matches | Team intent, 24 matches |
|---|---:|---:|
| Finished / finite positions | 24 / 24 | 24 / 24 |
| Goals per match | 2.17 | 2.13 |
| Shots per match | 13.63 | 16.38 |
| Pass completion | 86.3% | 84.1% |
| Forward passes | 38.9% | 44.4% |
| Returns to previous passer | 19.9% | 16.7% |
| Backward returns / all passes | 9.0% | 6.9% |
| Backward next actions after line break, all cases | 705 / 1,321 (53.4%) | 1,035 / 1,916 (54.0%) |
| Backward next actions, unpressured with viable forward route | 4 / 84 (4.8%) | 3 / 146 (2.1%) |

The all-cases backward rate did **not** improve. Most receivers did not have an
open forward route. The conditional counts are small and do not prove a general
improvement. The change increases forward play and reduces routine return passes
in this sample; it is not evidence of league calibration or style parity.
The first six-match sample swung from 1.50 to 4.17 goals per match, illustrating
why a small batch alone would have been misleading.

Full rows: [team-intent-comparison.json](engine-qa/team-intent-comparison.json).

```sh
node tests/intent.cjs
node scripts/engine-qa.cjs --matches 24 --baseline-intent --strict
node scripts/engine-qa.cjs --matches 24 --strict
# One bounded genuine provider review, with JEV_API_KEY in the environment:
node scripts/engine-qa.cjs --matches 6 --jev --strict
```

`tests/intent.cjs` exercises mirrored decisions, closed routes, pressure,
momentum expiry/ownership, purposeful returns, switches, phase aims, actual
line geometry, successful reception and restart/turnover lifecycle. Shape and
live browser regressions continue to exercise the same 2D engine frames.
[Full-pitch phone screenshot](shape-demo/team-intent-live.png) shows an actual
paused match using this engine; it is a rendering check, not proof that a
particular decision was optimal.

Layer 4 (coordinated pressing, cover/balance, triggers/traps and line stepping)
is next. Layers 5–8 and the complete rulebook remain unfinished.
