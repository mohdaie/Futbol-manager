# Attacking play: cut-backs, decisions and combination moves

Prompted by a 0-0 match evidence file (19 Sep 2026, Spurs v Villans, v1.7.3): 20 home shots for 0.59 xG, most
from 22-32 m under full pressure, while free team-mates at the penalty spot were ignored. Two engine defects
explained most of it; the owner also asked for the moves that make football exciting. All changes are in
`js/engine/sim.js` (commentary and the 2D flash in `js/engine/live.js`, the decision's `move` in the evidence export).

## Fixes

**Cut-back risk.** `passRisk()` gives every defender a 3-4 m reach from a standing start at every point of the
pass, and the reaches of several defenders multiply. In the box this read nearly every cut-back as 0.85-0.95
(in the evidence file, a team-mate 5 m free at the penalty spot was 0.95), so a 1% shot from the byline won.
Cut-backs now use `groundPassRisk()`: the defender covers the standing reach the ball physics actually gives
him at once, then closes at 3.2 m/s after reading it (Anticipation), against the time the ball (struck at
`kick()`'s speed) takes to reach him. Only cut-backs use it. Applying it to every ground pass was better
calibrated but changed the whole game's balance (goals 2.5 → 0.75 in a 4-match probe), so that is left as
separate league-calibration work.

**Clear decision mistakes.** Options are compared on an xG-like scale where 0.02-0.05 is a big difference, so
the softmax (`ENG.sharp` 60) still picked an option more than 0.02 below the best about 10% of the time,
including byline shots over an open cross. An option further below the best than a margin is now left out:
0.015 + (20 − Decisions) × 0.0015, plus pressure × (14 − Composure) × 0.002 when he lacks composure. Near-equal
options remain a weighted choice. `ENG` values are unchanged.

## New moves

All are options competing on value, not scripts; each is gated by attributes and, for the ones that need
team-mates to read each other, by **chemistry** (`chemistry()`: tactical familiarity, the XI's Teamwork and
tactic cohesion; about 0.35-0.4 for a typical Premier League side, 0.65+ for a drilled, unselfish one).

| Move | How it works | Who |
|---|---|---|
| One-two | `oneTwo()`: short pass, the passer sprints past the man in front into the space behind (`p.give`), the receiver (`p.wall`) plays it first time. Value: space behind × both passes' success, the defender's Anticipation against the return. The wall picks something else when the run is tracked. | Passing, Off the Ball, Teamwork (passer); First Touch, Passing, Teamwork (wall); chemistry |
| First time | `firstTime()`: in a quick move of completed short passes in the attacking half, a player may play it without stopping the ball (no carry/turn options, slightly less accurate by First Touch). | First Touch, Passing, Vision, Decisions; chemistry, tempo, short passing |
| Skill moves | `skillMove()` on a take-on: roulette (man closing at his side), quick feet (two in front, high Agility), step-over (one in front). Adds to the take-on rating in the decision and in the duel; success shows a gold flash and a commentary line. | Flair and Dribbling 13+; Agility, Strength |
| Finesse shot | `finesseOn()`: from 12-26 m, 5-20 m off centre, on the stronger foot, he curls it inside the far post (more curve, a little more accurate, up to +10% conversion). | Flair 13+, Finishing 12+, foot |
| Round the keeper | Existing 7.3 option; a strong dribbler now tries it a step earlier and values it more. | Dribbling, Agility, Composure |
| Fluid interchange | `rotation()`: with chemistry 0.5+, two midfielders/forwards within 22 m swap places in the shape for 8-14 s, keeping their own role's runs. Never the rest defence or an Anchor; ends on losing the ball. | Chemistry, mentality |

The existing third-man run (a midfielder sent beyond a dropping forward) is unchanged.

## Measured (seeded, same worlds and seeds)

`node scripts/attacking-moves-audit.cjs [root] [matches] [out.json]`, 30 matches (Premier League and
Championship pairings, rotating styles), before (fefe766) → after:

| Per match unless stated | Before | After |
|---|---:|---:|
| Goals | 1.80 | 1.80 |
| Shots / on target | 23.9 / 7.3 | 24.8 / 7.9 |
| xG | 1.68 | 2.01 |
| xG per shot | 0.071 | 0.081 |
| Shots under 0.03 xG | 62% | 57% |
| Decisions picking an option > 0.02 below the best | 10.2% | 5.0% |
| Shots that were such a mistake | 11.3% | 5.0% |
| Cut-back risk offered (mean / share ≥ 0.9) | 0.85 / 67% | 0.71 / 39% |
| Cut-backs played (30 matches) | 57 | 149 |
| Pass completion | 72.5% | 73.5% |
| One-twos started / returns played | – | 9.3 / 3.3 |
| First-time passes | – | 22.7 |
| Take-ons with a skill move (roulette / step-over / quick feet) | – | 9.0 / 8.4 / 0.9 |
| Keeper rounding attempts | (not counted) | 0.7 |

Cut-backs actually played were cut out 48% of the time against 0.38 predicted (63 played before: 30% against
0.46), so the new estimate is close, slightly optimistic. Goals are unchanged while xG rose; with 30 matches,
goals carry about ±0.25 of noise. Seeded samples measure mechanisms; they are not league calibration.

## Limits

- Interchange swaps shape anchors only; markers are not deliberately confused beyond following a different man.
- Skill moves have no dedicated sprite animation: the 2D view shows the take-on, a gold flash and commentary.
- The general pass-risk over-estimate outside cut-backs remains (predicted 0.5-0.7 failed about 25% of the time).
