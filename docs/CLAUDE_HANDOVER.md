# Futbol Manager: continue here

Updated 21 October 2026. Repository: `mohdaie/Futbol-manager`.

## Checkout and release state

- Continue **`feat/rulebook-shape-jev-qa`**, draft **PR #40**:
  https://github.com/mohdaie/Futbol-manager/pull/40
- Fetch its latest head. Do not start from main: it contains the rulebook but
  not this implementation. The preceding layer-3 commit is `3b8b09c`.
- Nothing in this PR has been merged or deployed. Main's rulebook commit was
  `c08cdf2`; live remains **2026.10.21.24**. Check current remote state first
  because another worker may have changed it. Merge/deploy needs an owner request.
- This handover and the implementation are committed on the branch. No key,
  external research folder or transient `/tmp` report is needed to continue.

## Owner's requirements

Read `docs/FOOTBALL_RULEBOOK.md` first, especially section 12. Attacking shape
comes from selected roles; do not force a fixed attacking formation or fill
role-created empty lanes. Defending follows style/instructions. Low block must
ultimately be a full tactic and shout. Standard set-piece routines per style.
Gegenpress window ultimately 5–8 seconds from Work Rate, Stamina and tiredness.
**Tune league averages only. Never equalise styles' win rates.** No ENG tuning
values were changed by this PR.

The user wants faster work with **Jev-assisted testing** and fewer tokens.
They also want visible results, not just test counts. Show the existing video
and provide a playable preview or deployment when they request one.
Keep updates concise, avoid repeatedly reading all files/running unchanged
suites, finish one reviewable layer at a time and show it in 2D.

## Owner update: Jev is the lead development decision-maker (21 October 2026)

**This instruction supersedes the earlier advisory-only Jev workflow.**
The owner wants **ChatGPT and Claude to analyse and propose; Jev to make the
final development decision based on their analysis and measured evidence.**
Do not treat Jev as merely a second opinion.

- ChatGPT/Claude inspect code, diagnose issues, gather measurements and prepare
  concise options with supporting evidence, trade-offs and a recommendation.
  Send conclusions and rationale, not private internal reasoning.
- Jev selects the next development priority and approach, and determines the
  acceptance criteria within the owner's requirements and football rulebook.
  ChatGPT/Claude implement the selected approach and run the relevant checks.
- Return before/after results, regressions, limitations and visible match evidence
  to Jev. Jev decides accept, revise or investigate further for that development
  iteration. Record its decision and the evidence used in the handover/QA report.
- Jev's decision does not waive failing checks or override explicit owner
  requirements. Surface a conflict with evidence and request a revised Jev
  decision; do not silently substitute ChatGPT/Claude's preferred approach.
- If Jev is unavailable or its reply is invalid/insufficient, continue independent
  evidence collection and existing approved work, but mark the new decision as
  pending rather than claiming Jev approval or falling back silently.
- Use the existing working GitHub Actions secret and relay. Batch meaningful
  decisions, reuse decisions only while their evidence/scope remains applicable,
  and respect existing budgets. No need to ask the owner for each routine
  development choice within the authorised scope.
- This is development/QA authority, not runtime player control. Merge and
  deployment still require an owner request.

**Implementation status:** this update records the owner's requested operating
model. The existing integration is still a constrained priority recommender with
confidence-based local fallback; this documentation change does not implement
decision authority. First extend the prompt/response contract, validation,
decision records and workflow to support the proposal → Jev decision →
implementation → evidence → Jev acceptance loop. Replace advisory fallback for
new decisions with an explicit pending state. Clearly distinguish mocked replies
from genuine Jev decisions and verify the loop with a real provider response.

## Owner update: realistic 2D match flow is the primary acceptance goal

The owner explicitly prioritises believable sequences of play and tactical
interaction over goals per match. Evaluate actual match movement and decisions,
not only static shape targets or aggregate statistics. Goals per match is a
secondary regression/calibration signal, never the primary pass/fail condition.
Do not force goals, prescribe winners, or equalise style win rates.

Required next validation work:
- Build reproducible matchup scenarios, starting with gegenpressing versus long
  ball. Vary one versus two strikers, formations, role combinations, player
  abilities, fatigue and game state; swap sides and use multiple seeds.
- Trace complete passages: build-up → pressing trigger → pressure with cover and
  blocked outlets → short escape or long release → aerial contest/second-ball
  support → regain/counterpress or recovery → next attack. Inspect both successful
  and failed presses; long-ball teams must have credible direct outlets and
  supporting runners rather than simply kicking long on a script.
- Assess whether pressing direction, back-line step/drop, tracking, spacing,
  pass selection, ball travel, runs and transition timing make football sense in
  context. Distinguish high pressing from counterpressing after possession loss.
- Use paired before/after setups, event/position traces and representative 2D
  clips of actual simulation, including failures. The existing shape rehearsal
  alone cannot demonstrate realistic match flow.
- Ground expectations in sourced real-match examples or credible coaching
  analysis; the rulebook is a specification, not independent proof of realism.
  Document legitimate variation instead of forcing one predetermined sequence.
- Report concrete behavioural defects with timestamps and relevant measures:
  isolated pressers, uncovered receivers/runners, block gaps, viable escape
  routes, second-ball support and recovery after a bypassed press. Define
  scenario-specific acceptance criteria before using them to judge a change.
- ChatGPT/Claude prepare evidence and proposals; Jev decides the development
  response under the lead-decision workflow above. Do not reduce its input to
  scorelines or aggregate goals, or claim it watched clips if it only received
  text/structured traces.

Status: these are the owner's new validation requirements, not a claim that the
scenario suite, clip capture or Jev decision-workflow extension is implemented.
The low-goal observation remains diagnostic; first establish whether a concrete
flow defect exists rather than assuming the scoring average itself is a defect.

## What is implemented

1. **Pitch/team shape:** `js/engine/shape.js` supplies exact zones/lanes, phases,
   mapped OOP blocks, lateral shift/tuck and advancing rest defence. Normally
   3+2 cover; risky settings 2+2; keeper/carrier/missing players excluded.
2. **Position jobs:** phase-specific role anchors, role-aware lane spacing,
   inverted full-backs, half-spaces, late eights, false-nine drop, etc. See
   `docs/SHAPE_FOUNDATION.md` for limits and interpretation of lane occupancy.
3. **Carrier intent:** `js/engine/intent.js` adjusts existing options for safe
   forward routes, phase aims, purposeful returns and free flank switches.
   Completed line-breaking passes start six seconds of attacking continuity;
   possession changes/restarts clear it. See `docs/TEAM_INTENT.md`.
4. **Coordinated defending foundation:** new `js/engine/defending.js` and hooks
   in `sim.js`:
   - one nearest outfield presser, separate cover about five metres goal-side
     and inside; trigger/counterpress adds a distinct screen/trap/balance player;
   - inside approach on wide balls and a central receiving-lane shadow;
   - back-pass cause retained; slow-square passes and keeper/CB without an
     open forward outlet add triggers, using existing attribute-based probability;
   - uniform step on back passes/pressure with closed outlets, drop against a
     free forward-facing carrier, regroup priority; box movement left to marking;
   - actual defensive marking uses mapped **OOP** roles; back-line marking
     outside the box stays within 1.5 m of the shared depth target;
   - assigned pressure/cover players are protected from runner-tracking overrides.
   Other free defenders still track runners.

**Layer 4 is a foundation, not complete tactical proof.** Existing engagement
zones and trigger probabilities remain. The approach is a target bias, not a
curved-path solver. No persistent opponent trap memory or receiver-assignment
handoff exists. Three local defenders may still leave an important runner free;
inspect this before claiming robust defending. No strict actual-team compactness
bound is enforced while tracking/engaging. Planner checks measure anchors.

## 2D inspection

**More → Admin → Engine → Watch shape demo.** Pause/step, click the ball,
change possession, mirror, choose formations/roles. New **Show defending unit**
and **Trigger** controls draw the same helper's pressure/cover/screen target
arrows. The overlay uses rehearsal geometry; it bypasses match engagement gates
and does not simulate real attribute decisions. It never changes the career.
Screenshot: `docs/shape-demo/defending-unit.png`.
Watchable recording: `docs/shape-demo/defending-demo.mp4` (20 seconds). Live rendering/save/resume
also passed with the real new engine.

## Validation and known limits

- 1,109 planner scenarios / **3,555 assertions**, no failures (~0.15 seconds).
- `tests/defending.cjs`: **18** checks, mirrored geometry, assignment uniqueness,
  shadows, traps, pressure/outlets, step/drop, OOP lines, missing players,
  protected cover, trigger metadata and stale/dead-ball state.
- `tests/transitions.cjs`: **16** timing, cohort, escape, recovery, regain and
  restart checks.
- `tests/intent.cjs`: **17** checks; `tests/engine-qa.cjs`: **27** mocked
  client/budget/cache/concurrency/stale-state/CLI checks.
- `tests/shape.cjs`: **30** browser checks including overlay controls,
  64 formation pairs and eight full-match smoke tests.
- `tests/live.cjs`: **20** checks for display/frames, speeds, camera,
  highlights, save/load/refresh/resume and full time.
- Earlier unchanged UI/dashboard suites passed 10 and 33 checks respectively.

Seed **20261021**, same 12 fixed-tactic matches before/after this layer:

| Measure | Before | After |
|---|---:|---:|
| Finished / finite | 12 / 12 | 12 / 12 |
| Goals/match | 2.33 | 2.33 |
| Shots/match | 15.67 | 15.42 |
| Pass completion | 83.8% | 84.8% |
| Completed line breaks | 1,080 | 647 |
| Batch time on development host | 23.2 s | 24.6 s |

After: 37,191 active-unit frames; **zero assignment violations**, maximum one
**designated** presser; cover in 27,646 frames, wide triggers in 3,303 frames.
These correlated tick counts confirm code execution, not football quality.
Fewer line breaks is a diagnostic observation, not a validated success target.
Small samples are not league calibration or evidence of style parity.
Full rows: `docs/engine-qa/defending-comparison.json`.

## Fast testing and Jev

```sh
node scripts/engine-qa.cjs --strict
node tests/defending.cjs
node tests/transitions.cjs
node tests/intent.cjs
node tests/engine-qa.cjs
node scripts/engine-qa.cjs --matches 12 --strict
# Existing genuine-review command (decision workflow extension pending):
node scripts/engine-qa.cjs --matches 6 --jev --strict
CHROMIUM_PATH=/opt/pw-browsers/chromium node tests/shape.cjs
CHROMIUM_PATH=/opt/pw-browsers/chromium node tests/live.cjs
```

This host's Chromium was instead at
`/workspace/scratch/b91f57d25a6b/browser-check/chromium`; locate a working binary
in a fresh environment. The VM harness loads real engine files; baseline-intent
mode disables only layer-3 score changes, **not layer-4 defending**. To reproduce
the layer-4 before state, use commit `3b8b09c` in a separate checkout.

The owner's **GitHub Actions secret `JEV_API_KEY` already works**. Do not ask
for it again, expose it or commit it. `.github/workflows/engine-qa.yml` runs on
this branch, checks local contracts and makes one genuine review. It has
read-only contents permission and never deploys. Admin review is explicit;
opening a page doesn't query. Real requests use the existing `jevAsk()` client.
A prior genuine review passed in Actions run **39602677053**, selecting momentum
at **0.89 confidence**. The latest branch workflow will show the layers 4–5 review.
Current legacy behaviour: valid confidence below 0.6 is recorded separately and leaves the local priority;
this fallback must be superseded by the owner update above for new Jev-led decisions.
invalid/missing provider responses fail an explicitly requested CLI review.
See `docs/ENGINE_QA.md`. Synthetic provider replies in tests are clearly mocked.

The Admin attribute harness `runAttrTest()` in `js/systems/lab.js` remains
available for later attribute/league tuning. Existing engine levers live in ENG
at the top of `sim.js`; do not change them merely to make a small sample look good.

## What to do next

**Final handover priority (owner confirmed):** first extend and verify the Jev-led
decision loop described above. Build the actual-match flow evidence/scenario
harness, starting with gegenpressing versus long ball and one/two-striker
variants. Submit measured defects and proposed fixes to Jev before choosing the
next engine change. The layer roadmap below supplies candidate work, not a
reason to skip the flow-first validation. Keep goals secondary. Preserve the
draft branch and do not merge/deploy without an owner request.

1. Review layer-4 actual-match clips for free runners, pressing isolation and
   block gaps, using the new unit overlay and defensive counters. Strengthen
   behavioural assertions if those reveal a concrete defect.
2. Section-12 **layer 5, transitions is now implemented as a foundation**:
   `js/engine/transitions.js` freezes a local cohort of 3–4 at the loss, with
   a 5–8 s window from raw Work Rate/Stamina and current condition. A forward
   escape (>8 m and past at least two cohort players), expiry, or fewer than
   three nearby players ends the press and starts four seconds of recovery.
   Counterpress wins attack quickly for five seconds, while explicit Hold Shape
   is honoured. Restarts clear the state, and kickoffs no longer create false
   open-play turnovers. Actual sprint distance already feeds existing fatigue.
   Thresholds (20 m initial neighbourhood, 24 m ongoing support, 8 m escape,
   four seconds recovery) are implementation choices still needing match review.
   Next is **layer 6: box occupation, cut-backs and shooting**.
3. Then style-standard set pieces, low-block
   tactic/shout and league-only calibration. Much of the full rulebook remains.

Deeper style research mentioned in the earlier handover was never recovered.
Do not assume workspace-only research notes exist in a fresh session. No
new external research or database/schema change was required for this work.

## Publishing notes

On this host public git fetch worked, CLI push lacked credentials. The GitHub
connector published via blob → tree → commit → expected-head ref update.
Verify the tree and branch head; do not overwrite concurrent changes. Remote
commit SHA differs from an equivalent local commit when connector metadata
changes, so fetch/reset only after verifying identical trees and a clean state.

## Latest transitions batch (final code)

Seed 20261021, **24** fixed-tactic matches: all finished with finite positions,
zero assignment violations. 1509 local counterpresses started;
measured windows 5.90–7.77 seconds.
Goals/match 1.67, shots/match 13.79, completion 85.2%.
An earlier 12-match batch produced 1.17 goals/match, prompting the larger batch.
The final 1.67 remains lower than the layer-3 24-match sample (2.13). Treat
this as an unresolved attacking/defensive interaction to investigate before release;
do not tune style win rates or silently adjust ENG to hide it.
This remains a diagnostic, not calibrated league output. Full report:
`docs/engine-qa/transitions-batch.json`.
