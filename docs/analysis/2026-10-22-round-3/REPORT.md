# Analyst report 3: the most unrealistic thing first (scorelines)

Engine after round 3 (not released). Measured on three seeded league worlds (120 matches each, every club and style)
with the same worlds for the live engine (2026.10.21.27). Every change starts from the rulebook, written first.

## What a fan would not accept

The live engine produced **17-0, 20-0 and 22-0** in a league, and 13-17% of matches were won by five goals or more
(real football: about 3-4%). The averages looked right only because two extremes cancelled out: too many 0-0s and
too many thrashings.

## What was really happening (watched, then measured)

1. **The striker rounded the keeper every few minutes.** In a 18-1, 22 of the 26 shots came after going round the
   keeper. A good striker won that duel about three times in four and was then placed in front of an empty goal.
2. **Defenders lunged instead of jockeying.** Every defender near the ball committed to a tackle about once a
   second; each miss left him beaten and frozen for 1.5 s. Result: about 70 tackles and 85 successful dribbles per
   team (real: 15-20 and 8-10), and good dribblers ran from the edge of the box to the six-yard box through four men.
3. **Nobody read a long ball in the air.** Defenders only reacted once it had landed.
4. **Small quality gaps became huge.** Two sides about two attribute points apart (a top side against a good
   second-division side) gave a 3.4-goal difference a match and a five-goal win one game in three. Every attribute
   step (duels, decisions, pace, finishing, the keeper) added its own edge and they compounded.
5. **A great finisher scored 55% more from the same chances** (real: perhaps 10-20%).

## What changed (rulebook sections)

| Rule | Change |
|---|---|
| 7.3 | One-on-one: the striker shoots; rounding only when the keeper rushes at his feet, it takes him wide, and it often fails |
| 4.5 | Jockeying is the normal way to defend the man on the ball; tackles are committed only when on |
| 4.9 | Long balls are read in the air: the defender who can get there attacks it, the others get goal-side |
| 4.7 | The back line steps up and drops together, at full speed |
| 11 | A better player wins more of his duels, not all (about two in three for a clear gap) |
| 11 | The chance makes the goal more than the finisher (finishing worth about +/-12%) |
| 11 | How strongly quality shows (`ENG.qual` 0.55): two points better everywhere is worth about 1.3 goals a match |

Also fixed: the attribute cache returned a slightly different value on the first read than on later reads.

## Before and after (three worlds)

| | Live 2026.10.21.27 | Now | Real football |
|---|---|---|---|
| Wins by 5+ goals | 13-17% | 3.3-5.8% | about 3-4% |
| Most goals by one team | 17-22 | 7-11 | about 7-9 in a season |
| Draws | 23-34% | 24-25% | about 25% |
| 0-0 | 12-24% | 7-16% | about 7-8% |
| Goals per match | 2.6-2.8 | 2.3-2.7 | about 2.8 |
| Ground duels per team | about 150 | 43-48 | 50-60 |
| Tackles per team | about 70 | 19-21 | 15-20 |
| Successful dribbles per team | about 85 | 24-26 | 8-10 |
| Fouls per match | about 24 | 19-22 | 22-25 |

Calibration (league averages only): `ENG.fin` 1.25, `ENG.qual` 0.55, `ENG.tackleFoul` 0.13.

## Still not real (next, in order of how much a fan would notice)

1. **Shots about 21 a match, on target about 7** (real about 25 and 8.5); goals a little low in one world.
2. **0-0s still a little high in two worlds.**
3. **Dribbles still about 2.5 times real**: take-ons are tried too often.
4. **Passes about 730 per team** (real 450-550) and **offsides about 2** (real about 4).
5. Tiki-taka against a press, lofted balls back to your own defence (from report 2).
