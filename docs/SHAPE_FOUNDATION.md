# Pitch language and team shape: first review

Draft foundation for rulebook v2, section 12, layers 1–2.
Layer 3 carrier decisions and their measured limits are now described in
[TEAM_INTENT.md](TEAM_INTENT.md). This branch changes the
simulation's team anchors and adds a rehearsal at **More → Admin → Engine →
Watch shape demo**. It is not a completed implementation of the rulebook.

## What to watch

The ball follows a twelve-stop route through build-up, progression, a switch,
a wide attack, the cut-back zone and Zone 14, then changes possession to show
the defending block sliding and recovering. Pause, step, tap the pitch, change
possession, mirror the view, or try different formations and roles.

Red is your side; blue is the opponent. Gold rings identify assigned cover.
Faint circles are the target anchors. Players move towards them at up to 6 m/s
in this rehearsal; this is an illustration of collective shape, not a match
or an attribute test. The readout describes target anchors, not a guarantee
that every moving player has already recovered to that position.

The rehearsal clones the tactic and squad selection. It does not play a fixture,
spend AI credits, edit the career tactic, or change player condition. A low-block
5-4-1 is available here as a rehearsal, not yet as a new full tactic/shout in the game.

## Shared implementation

- `js/engine/shape.js`: 105×68 m pitch; the rulebook's exact five lane boundaries,
  thirds, Zone 14, cut-back zone, box, six-yard box, penalty-spot area and box edge.
  Between-lines/behind-line queries accept contextual opposition line depths.
  Other contextual spaces from section 1.3 still need their position jobs.
- `teamPhase()`: build-up, progression, chance creation, finishing, high press,
  mid block and low block. Match restart metadata is marked as set piece.
  Transition behaviour remains the previous engine pending layer 5.
- `teamPlan()`: uses existing role anchors from `positions()` for attacks,
  retains their lateral positions, and moves assigned cover behind the ball.
  Normally reserves three deepest cover players and two screens; gegenpressing
  and the highest mentality reserve two plus two. Keeper and carrier are excluded.
  Build-up keeps the existing role positioning: forcing five players behind a
  keeper near his own line would be physically impossible.
- The defensive plan uses mapped **out-of-possession** positions for line
  membership, moves the lines together and tucks in the far side. Pressing and
  line instructions select the block profile; a manual custom instruction remains
  authoritative. The back line target sits 16–25 m from goal in the low block,
  30–40 m for a standard mid block and 40–50 m for a high line/high press.
- `sim.js` uses those same anchors. Assigned cover cannot start a forward run
  or be pulled ahead of its anchor by support/space search. Caches are rebuilt
  each minute and after save/load; the carrier and restart state are in the key.
  Existing pressing, marking, offside, and carrier decisions still act over the
  anchors and can temporarily stretch the actual team.

## Deliberate limits before the next layer

**Role-aware lane spacing now handles the audited progression/creation cases.** Rulebook 3.1 says
to fill both wide lanes, but the owner's decision in 3.3 says role-created empty
lanes stay empty. The planner preserves the selected roles' lateral anchors and
reports empty/crowded attacking lanes. Eligible eights, tens and forwards can
use their role's half-space when the centre is full, while the third attacker on
a horizontal line is staggered. The two-per-lane constraint applies to the
attacking unit during progression/chance creation, excluding assigned cover;
finishing is excluded, as the rulebook explicitly limits this principle to those
two phases. The interpretation of a cap across the entire outfield team still
needs clarification. Arbitrary custom role combinations can still leave crowding
that the audit should report rather than inventing an unrelated role.

Position-job anchors now include keeper support, inverted/overlapping full-backs,
pivot screens, half-space midfielders, late eights, the ten, shadow strikers,
wide players, far-post runs and a dropping false nine. False nines retain their
drop instead of immediately starting the old generic striker run. Individual
cover shadows, third-man combinations, pressing triggers/traps,
pressure-dependent line stepping, the revised 5–8 s counter-press, new low-block
tactic/shout, box occupation and style-specific set-piece routines are pending.
No inaccessible research notes were assumed to have been recovered. `ENG` and
all tuning levers are unchanged. No style win-rate balancing was added.

## Validation

`tests/shape.cjs`: **28 checks passed**, including all 64 formation pairings,
exact lane boundaries, contextual zones, phase selection, back-line membership,
block depth and shifting, role-specific width, cover advancing with the ball,
missing players, carrier exclusion, immutable planning, mobile controls, demo
isolation, animation lifecycle, saved-cache restoration and finite match frames.

Eight full-match smoke tests finished: 25 goals, 155 shots and 85.7% completed
passes in this sample. These are **not calibration results** (unseeded, small
sample; averages remain to be checked with a full test season at layer 8).

`tests/live.cjs`: **20 checks passed** for engine/display alignment, player speed,
camera, highlights, leaving/resuming, refresh, save/load, full time and no runtime
errors. Save checkpoint in that run: about 1.1 MB, 24 ms.

Run with Playwright and a Chromium executable:

```sh
CHROMIUM_PATH=/path/to/chromium node tests/shape.cjs
CHROMIUM_PATH=/path/to/chromium node tests/live.cjs
```

Phone screenshots: [attack](shape-demo/attack.png), [low block](shape-demo/low-block.png).
Initial layer-1 rehearsal, before the position-job update: [30-second video](shape-demo/rehearsal.mp4).

Fast deterministic developer audit and the Jev integration are described in
[ENGINE_QA.md](ENGINE_QA.md). The audit covers 1,109 scenarios / 3,555 checks and
runs without browser startup. Its measured failures drove the lane-spacing fixes.

The game version is intentionally still `2026.10.21.24` while this foundation is
reviewed on its branch. Merging or publishing this draft would require a release
decision and appropriate further calibration.
