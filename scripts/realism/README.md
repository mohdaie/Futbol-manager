# Realism toolkit (match engine)

Measure the engine against real football in the real game (headless Chromium), on fixed worlds.

```
# a league season sample: 120 matches of world 1 (SEED fixes the generated world and every random draw)
SEED=1 node scripts/realism/league.cjs "$(sed 's/N_/120/' scripts/realism/scorecard.js)"

# compare two engines on the same worlds: copy the old version somewhere and point ROOT at it
SEED=1 ROOT=/path/to/old-copy node scripts/realism/league.cjs "$(sed 's/N_/120/' scripts/realism/scorecard.js)"

# symmetry check: every fixture both ways round (remove the home bonus in a copy first, see swap.js)
SEED=1 node scripts/realism/league.cjs "$(sed 's/N_/80/' scripts/realism/swap.js)"
```

Environment in the Claude cloud container: `CHROMIUM_PATH=/opt/pw-browsers/chromium NODE_PATH=/opt/node-tools/node_modules`.
Elsewhere: `npm i playwright` (or point NODE_PATH at an install) and let it use its own Chromium.

## What scorecard.js reports, and real-football targets (approximate)

| Metric | Target |
|---|---|
| goals per match | about 2.8 |
| shots / on target | about 25 / 8.5 |
| home win / draw | about 45% / 25% |
| 0-0 | about 7-8% |
| wins by 5+ goals | about 3-4% |
| most goals by one team (in 120 matches) | about 7-9 |
| fouls / yellows | 22-25 / 3-4 |
| offsides | about 3.5-4 |
| passes per team | 450-550 |
| ground duels / tackles / successful dribbles per team | 50-60 / 15-20 / 8-10 |

## How to measure honestly

- Use **three seeded worlds** (SEED=1, 2, 3) of **120 matches** each. One unseeded world can differ by a goal a
  match; 30 two-club matches carry about +/-0.5 goals of noise.
- Compare engines on the **same** seeds (paired). For an attribute or tactic effect, play every fixture twice
  (each side gets the change once) and include a no-change control.
- In node, `scripts/match-qa-runtime.cjs` runs seeded matches without a browser (always the same two clubs, so
  scorelines are biased by their quality gap: use it for mechanisms, not league averages).
