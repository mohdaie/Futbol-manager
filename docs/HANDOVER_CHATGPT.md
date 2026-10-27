# Handover: Futbol Manager match engine (for ChatGPT or any assistant)

Live game: https://mohdaie.github.io/Futbol-manager/ (GitHub Pages, served from `main`).
Repository: `mohdaie/Futbol-manager`. Plain HTML/JS, no build step. Current version **2026.10.22.31**.

Read this first, then `docs/FOOTBALL_RULEBOOK.md` (the rulebook), then `STRUCTURE.md` (feature history, newest at the
bottom) and `docs/CLAUDE_HANDOVER.md` (earlier engine notes).

---

## 1. The owner's rules (non-negotiable)

1. **Football first.** The owner wants a "fanatic maestro football tactician", not an engineer who fits numbers.
   Watch the match (freeze-frames, video), explain what a coach would see, then fix the football.
2. **Rulebook first (rule 11c).** Every engine change starts by writing or extending a section of
   `docs/FOOTBALL_RULEBOOK.md`, and the code cites it (comments like `// 4.7: ...`).
3. **Statistics only check.** Never change behaviour just because a number is low or high. Find the football
   reason. Numbers are used for **league-average calibration at the end of a round** (the `ENG` levers).
4. **Tune league averages only.** Never balance one tactical style's win rate against another.
5. **Tactics:** the attacking shape comes from the roles chosen; defending follows the style; the low block is a
   tactic option and a shout; set pieces use each style's standard routines.
6. **Releases:** the owner said "once it's reliable, go live; I don't want to wait". Reliable = all test suites
   pass (see the two known intermittent ones below), the strict audit passes, and the league scorecard on three
   seeded worlds is realistic.
7. **Communication:** plain language, frequent short updates, tables for before/after, honest about what did not
   work. The owner can check the game himself: do not over-prove.
8. **No third-party data in the game.** The owner shared Football Manager's `simatch.fmf` (decoded: zstd frames;
   it holds FM's shot xG models, stat distributions, ratings, team-selection factors and commentary). We used
   only the *structure* (which features judge a shot). Never copy Sports Interactive's numbers, tables or text.
9. **Jev** (an external AI decision loop, `js/systems/jev-lead.js`, secret `JEV_API_KEY` in GitHub Actions) is
   paused by the owner. Never expose the key.
10. No AI model names in commits, PRs or code.

## 2. Release process

1. Work on a branch; if the previous PR was merged, restart the branch from `origin/main`.
2. Bump `GAME_VERSION` in `js/core/data.js` and every `?v=` in `index.html`. Format `MAJOR.MINOR.PATCH` (shown as
   `v1.0.0`): PATCH for fixes, MINOR for new features, MAJOR for big changes. Releases before 1.0.0 used `YYYY.MM.DD.N`.
3. Add a short section at the bottom of `STRUCTURE.md`.
4. Run all tests (below), the strict audit, and the scorecard on 3 seeds.
5. Open a PR to `main`, squash-merge, then confirm the live site serves the new version:
   `curl -s "https://mohdaie.github.io/Futbol-manager/js/core/data.js?t=$(date +%s)" | grep GAME_VERSION`.

## 3. Tests

```
for f in tests/*.cjs; do node $f; done          # 22 suites (Playwright; set CHROMIUM_PATH if needed)
node scripts/engine-qa.cjs --strict              # engine audit
```
Known intermittent on `main` as well (not engine related): `tests/mood.cjs` (about 1 in 3) and
`tests/transfer-ai.cjs` (about 1 in 4). Re-run them; do not "fix" the engine for them.

## 4. Engine architecture (js/engine)

- **sim.js**: the simulation. Pitch 68 x 105 m, tick 0.5 s. Side 0 (home) attacks y = 0, side 1 attacks y = 105.
  `toOwn(s, x, y)` gives a side's own frame (y = 0 is the goal it attacks). Key functions:
  - `carrierDecide`: the man on the ball scores options (shot, pass, long, through ball, cross, carry, round the
    keeper, clear) and picks one by softmax (`ENG.sharp`).
  - `chanceAt` / `xgAt`: the shot model (rulebook 7.5): distance, goal-mouth angle, goal visible past keeper and
    defenders, bodies in the triangle, pressure, header, facing. Fitted to public reference values.
  - `shoot` / `shotType` / `shotArrives`: kinds of shot and aim points (7.6); outcome from the shot model;
    the keeper ends where he dived.
  - `challenges`: jockeying, committed tackles and take-ons (4.5).
  - `targets` (where everyone goes), `engage` (pressing unit), `trackRuns` (4.7 the line, not the man),
    `keepOnside`, `chase` / `readFlight` (loose balls, long balls read in the air, 4.9).
  - `movePlayers`: speed (Pace), acceleration (Agility), **facing and turning** (rulebook 1c, `p.fa`), and a
    start-of-tick snapshot so both sides move at the same moment (this fixed a home bias of about 15 points).
  - `av` / `ac`: effective attributes (form, condition; `ENG.qual` compresses quality towards 11, rule 11).
  - `recordFrame`: frames for the 2D view: `[t, bx, by, bz, owner side, owner index, restart, 22 x (x, y),
    22 facings]` (73 values).
- **shape.js**: team shape. `positionJobs` (where each role stands per phase, with the ball), `blockPlan` (the
  block without the ball, including how each wide role defends, 6.0), `restSlots`, `teamPhase`, `pitchZone`.
- **pitch.js**: `positions()` (formation spots moving with the ball, tactics), `ROLE_Z` (role adjustments).
- **defending.js** (`defensiveUnit`, `defensiveLineStep`), **intent.js**, **transitions.js**, **match.js**
  (match setup, team ratings), **live.js** (the 2D view: kits, camera, smooth movement, trails, facing pointers,
  story highlights, shot labels and keeper dives, commentary).
- `js/core/data.js`: `GAME_VERSION`, `FORMATIONS`, `LINE`.

### Calibration levers (`ENG` in sim.js), current values
`xg 1, fin 1.12, qual 0.55, tackleFoul 0.13, keepShot 0.12, foul 1.1, intercept 1.1, carry 1, carryRisk 1,
thr 0.28, sharp 60, touch 1.1, cross 0.45, offFoul 0.06, shoot 1`.

## 5. Measuring (scripts/realism, see its README)

The scorecard runs the real game in a headless browser on a fixed world (SEED). Always use three seeds of 120
matches and compare engines on the same seeds. Other useful tools: `scripts/match-analysis.cjs` (records a match:
possession chains, goals, chance values, frames), `scripts/analysis-render.cjs` (average positions and
freeze-frames), `scripts/analysis-summary.cjs` (line heights, passes back to the keeper).

## 6. Where the engine stands (three seeded worlds, 120 matches each, version .31)

| | Now | Real football |
|---|---|---|
| Goals | 2.3-2.9 | about 2.8 |
| Shots / on target | about 23.5 / 7-7.5 | about 25 / 8.5 |
| Home win / draw | 41-53% / 22-32% | about 45% / 25% |
| 0-0 | 9-17% | about 7-8% |
| Wins by 5+ | 3-7% | about 3-4% |
| Offsides | 4.0-5.0 | about 3.5-4 |
| Passes per team | about 670 | 450-550 |
| Successful dribbles per team | about 25 | 8-10 |
| Tackles per team | about 30 | 15-20 |

Analyst reports: `docs/analysis/` (rounds 1-4). Freeze-frames there show how problems were found.

## 7. What this session did (oldest first)

1. Shape: build-up positions, space between the lines, squeeze-up, centre-back carries.
2. Shot model (7.5), keeper positioning (6.1), box defending and blocking (4.8), delay near the box (4.5).
3. Scorelines: rounding the keeper is rare (7.3), jockeying (4.5), long balls read in the air (4.9), quality in
   proportion (rule 11, `ENG.qual`): 5+ goal wins 13-17% -> 3-7%, no more 22-0.
4. Body orientation (1c) and the first-mover bias fix.
5. 2D view: clear kits, fast-forward restarts, smooth movement, ball trail, action cues.
6. Story highlights (from the recovery to the finish), shot types (7.6) with keeper dives and labels.
7. Zones and role profiles (6.0, 6.7), runs by role, the line not the man (4.7): offsides 2.6 -> 4-5.

Lessons: measure on three seeded worlds (single runs mislead); a mirror/swap test finds side biases; the attribute
cache must return the stored value; when a test fails, check the same test on `main` before blaming the change.

## 8. Next steps (the owner's order)

The owner's comments on the game (2D good now; tactics not visible; needs spark; positioning improvable) led to
this plan. Steps 1-3 and the positions/roles layer are done. Next:

4. **Spark** (the most important for the owner):
   - Take-ons as a **deliberate choice** by dribblers (wingers, attacking midfielders, forwards) in the final third
     and wide; ordinary players stop and pass. Today a take-on happens automatically whenever a carrier runs at a
     defender (about 37 attempts per team; real 15-20).
   - **Combinations**: one-twos (winger and striker, midfielder and striker), full-back overlaps and underlaps,
     third-man runs, late runs from midfield into the box, switches of play.
   - **Progression**: only 8% of passes are made in the final third (real 20-25%) and 34% go backwards (real
     15-20%); attacks should settle and circulate in the final third.
5. **Visible tactical identity per style**: gegenpressing swarms the ball with 3-4 players within seconds of losing
   it and attacks fast; counter-attack drops deep then breaks with runners; possession circulates and rotates.
   Add small on-pitch cues (e.g. "Counter-press!", "Counter-attack!").
6. **Fluid roles and rotation**: the space decides the job (whoever arrives in a zone does its job; someone covers
   the space left behind).
Also open: 0-0 a little high in some worlds; shots a little low; tackles about 30 per team; passes high.

Work loop the owner approved: fix -> simulate -> analyse (watch it as a coach) -> report -> fix again, one
change at a time, rulebook first, then release when reliable.
