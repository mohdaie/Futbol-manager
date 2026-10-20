# Match engine v2: design plan

Status: stages A-D built in 2026.10.20.4 (pitch model, action engine, tactical styles, player instructions, 2D replay). Stage E (duel data in cloud sync, removing v1) is still to do. v1 was replaced directly rather than kept behind a switch. Covers items 1-3 from the engine review:
player-against-player actions, tactics tied to space, and a 2D view driven by the engine.

## 1. Goals

- Every attribute and relevant personal detail (height, weight, foot, age, character) changes what happens on the pitch, through specific player-against-player duels.
- Tactics (formations, roles, width, defensive line, pressing, tempo, passing, mentality) change where players stand and which actions they choose. Their effect can be seen on the 2D pitch.
- The 2D view shows what the engine decided, move by move, from one shared timeline. Nothing on screen is invented for decoration.
- Instant results, background matches and the live match all use the same engine.
- Realistic totals: goals, shots, possession, passing, fouls, cards, offsides and penalties close to Premier League averages.

## 2. Core idea: possessions made of actions

Today each minute is one dice roll on three team averages.

In v2 a match is a sequence of **possessions**, about 150-200 per match. Each possession is a chain of **actions** taken by specific players:

```
build-up pass -> progression (pass / carry / dribble) -> final-third action (through ball / cross / cut inside) -> shot or header
       ^ each step can be won by the defending side: interception, tackle, pressure error, offside, foul, clearance
```

- Each action has a ball carrier, a target or opponent, a start and end position on the pitch, and an outcome.
- The engine writes every action to a timeline: `{t, type, side, from, to, pid, oppId, x0, y0, x1, y1, outcome}`.
  - The 2D view plays this timeline.
  - Commentary, stats and player ratings are read from it.
- The clock still advances in minutes. A possession uses its real duration: build-up is slow, a counter-attack is fast. Tempo changes the duration.
- About 600-900 actions per match. These are small numeric steps with no physics, so a full 380-match test season should still run in seconds on a phone.

## 3. The pitch model

- **Grid:** 6 rows (own box to opponent box) × 5 lanes (left wing, left half-space, centre, right half-space, right wing). Positions inside zones are still continuous (0-1), so the 2D view looks smooth.
- **Player positions** are recalculated at each action from:
  1. The in-possession or out-of-possession formation slot (already exists).
  2. The ball's zone: the shape shifts toward the ball and compresses (as today, but used by the engine too).
  3. Tactics:
     - Width spreads or narrows the attacking lanes.
     - Defensive line sets the depth of the back line.
     - Pressing pushes the front players up and closes gaps.
  4. Role movement, e.g. overlapping full-back, inverted winger, target man, box-to-box (section 6).
  5. Fatigue: tired players lag behind their target spot, which opens space late in matches.
- **Distance** between a defender and the receiver or carrier decides who contests an action. The nearest one or two defenders become the opponent in each duel. Marking is zonal by default.

## 4. Action resolution: player against player

Every contested action uses the same formula:

```
p(success) = base(type, zone) × logistic((attackerScore − defenderScore) / k + context)
context = pressure + fatigue + morale/form + home + weather + tactics modifiers
```

`base` and `k` sit in `TUNE_DEFAULTS` so they can be calibrated and later learned.

### Attribute map

| Action | Ball side uses | Defending side uses |
|---|---|---|
| Short pass | Passing, First Touch (receiver), Decisions, Composure under pressure | Positioning, Work Rate (pressing), distance to lane |
| Long / switch pass | Passing, Vision, Kicking for keepers | Positioning, Heading + height (aerial clearance) |
| Through ball | Vision, Passing; runner: Pace, Decisions (timing) | Positioning, Pace, line height |
| Dribble / take-on | Dribbling, Agility, Pace, First Touch, Composure | Tackling, Agility, Pace, Positioning |
| Carry / holding the ball | Strength, Dribbling, Balance (Agility) | Strength, Tackling, Work Rate |
| Cross | Crossing; weak foot penalty | Positioning; keeper: Handling, height (claims) |
| Header | Heading + height, Strength, Positioning | Heading + height, Strength, Marking |
| Shot | Finishing, Composure, First Touch; weak foot penalty; distance and angle | Keeper: Reflexes, One on Ones, Positioning, Agility, height; blocking defender: Positioning, Tackling |
| Tackle / interception (defensive action) | Tackling, Marking, Positioning, Decisions; Temperamental means more fouls | Carrier's Strength, Dribbling, Composure |
| Pressing | Work Rate, Stamina, Pace, Decisions | Composure, Decisions, First Touch of the receiver |
| Keeper sweeping | Pace, Decisions, One on Ones, Sweeper Keeper role | Attacker Pace, Finishing |
| Keeper distribution | Kicking, Passing, Decisions, Ball-Playing role | Opponent press |

### Personal details and the rest

- **Preferred foot:** a player on his natural side crosses better. On the opposite side he is more likely to cut inside and shoot. Using the weak foot lowers accuracy. Players marked "Either" have no penalty.
- **Age / experience:** players over 28 get a small Composure and Decisions bonus under pressure. Players under 21 get a small penalty in big moments (late, close score).
- **Height and weight:** height counts in aerial duels and keeper reach, as now. Weight adds to Strength in shielding but lowers Agility a little and makes him tire faster (as now).
- **Character:**
  - Temperamental players commit more fouls and get more cards.
  - Determined players keep trying when losing late: more forward actions.
  - Professional players keep their shape: smaller positional error when tired.
- **Morale, condition, sharpness, familiarity:**
  - Morale, sharpness and familiarity multiply every attribute through `pForm` (as now).
  - Condition hits physical attributes most (Pace, Stamina, Agility, Strength), then decisions late in the match.
  - Tactical familiarity adds to positional error: low familiarity means players stand in the wrong place more often.

Anticipation, Off the Ball, Flair and Teamwork were added in 2026.10.20.3, so there are 26 attributes. Duel uses for v2: Anticipation for interceptions and reading through balls; Off the Ball for runs and getting free; Flair for take-ons and unexpected passes; Teamwork for holding shape, pressing together and support runs.

## 5. Decisions: what the ball carrier chooses

At each step the carrier picks from available options, weighted by:

- **Space:** passing lanes not covered by a defender, free team-mates, space ahead to carry into, shooting angle and distance.
- **His own Decisions and Vision:** better players pick the best option more often; weaker players pick at random more often. Vision lets him see far options such as a switch or a through ball.
- **Team instructions:**
  - Tempo: speed of play, and more risk under pressure.
  - Passing: short or direct, so the share of long balls.
  - Width: the share of wide play and crosses.
  - Mentality: how willing he is to shoot from range and how many players join attacks.
- **His role** (section 6), such as an inverted winger shooting more, a playmaker trying more through balls, or a target man as the long-ball target.
- **Match state:** losing late means more risk; winning late means keeping the ball and running the clock.

The defending side decides its pressing per action: press the carrier, cover the lane, or hold the line. That depends on the pressing instruction, the zone, and the players' Work Rate and Stamina.

## 6. Tactics mapped to behaviour

| Tactic | Effect on positions | Effect on actions |
|---|---|---|
| Formation (in / out of possession) | Slot positions (already exist) | Which players are near the ball and who has numbers in each zone |
| Width | Attacking lane spread ±10-15% | More crosses and switches, fewer central combinations; wider means more space between defenders |
| Defensive line | Depth of the back four ±12% | High: more offsides won and more balls over the top (pace duels). Low: fewer through balls conceded, more long-range shots conceded |
| Pressing | Front players higher, smaller gaps | More turnovers high up, more fouls, faster tiring |
| Tempo | Shorter possessions | More forward passes, lower pass completion, more turnovers both ways |
| Passing (short / mixed / direct) | Short means a closer support structure | Mix of short and long passes; direct means more aerial duels |
| Mentality | Block height and how many players join attacks | Shot threshold, how many runners, vulnerability to counters |
| Roles | Per-role position offsets and runs | Per-role action preferences (table below) |
| Captain / set-piece takers | (Done) | (Done) |

Role examples (each formation position already has role lists in `ROLES`):

| Role | Movement | Action bias |
|---|---|---|
| Wing-back / attacking full-back | Overlaps high when in possession | Crosses, joins attacks; leaves space behind |
| Inverted winger | Starts wide, moves into the half-space | Cuts inside on his strong foot, shoots |
| Winger | Stays on the touchline | Takes on the full-back, crosses |
| Playmaker / deep-lying playmaker | Drops to receive | More through balls and switches |
| Box-to-box | Late runs into the box | Shots from the edge, pressing |
| Ball-winning / anchor | Stays between the lines | Interceptions, tackles, simple passes |
| Target man | Stays high and central | Long-ball target, holds up, flick-ons |
| Poacher / advanced forward | On the last defender's shoulder | Runs in behind, offside risk, finishing |
| Sweeper / ball-playing keeper | (Done in v1, kept) | Sweeping and distribution |

## 7. 2D view driven by the timeline

- The live screen no longer invents passes. It plays the timeline:
  - **Player movement:** each player moves from his old position to his new one between actions, and the ball moves along the action's path.
  - **Ball speed by action type:** short passes are quick, long balls arc slowly, crosses are drawn as curves, shots are fast.
- **Visible behaviour:**
  - The pressing player runs at the carrier, and a shading line shows the pressing trap.
  - The back line holds its height. Offsides show as a flag with the line drawn.
  - A dribble shows as the carrier moving past the defender. A tackle shows the defender stepping in.
  - Runners make their runs before a through ball or cross.
- **Event marker:** a small marker on the important moment (key pass, tackle won, save), and commentary taken from the action.
- **Speed control:** at 1× and 2× every action is shown. At "Key moments" only the final-third actions are animated and the rest is skipped. Instant result uses the same engine with no drawing.
- **Positions on both screens:** the tactics screen previews the same calculated positions as the match, so what you set is what you see.

## 8. Stats and ratings

- **Player stats per match:** passes attempted and completed, key passes, dribbles, tackles, interceptions, aerial duels won, shots, xG, offsides, fouls. They feed the player rating instead of today's small random rating bumps.
- **Team stats:** pass completion, possession (by time), shots, shots on target, corners, fouls, offsides, cards.
- **Season stats:** added to the player Stats tab and the Stats leaders screen.
- **AI Brain cloud data:** adds compact per-match duel summaries (success rate by action type, zone and attribute gap). With enough matches, these tune the `base` and `k` values from real play. They don't replace the manual approval of engine versions.

## 9. Calibration targets (Premier League-like)

| Measure | Target |
|---|---|
| Goals per match | 2.7-2.9 |
| Shots / on target per match | ~25 / ~8.5 |
| Home win / draw / away win | ~43% / 24% / 33% |
| Pass completion | 75-90% by team strength |
| Fouls / yellow cards per match | ~21 / ~3.5 |
| Offsides per match | ~3.5 |
| Penalties per match | ~0.27 |
| Corners per match | ~10 |
| Strength spread | Top club 80-90 points, bottom 20-30 |

The admin **Run test season** reports all of these and compares v1 and v2.

## 10. Compatibility and rollout

- **Same API:** `createMatch`, `stepMatch`, `quickSim` and `finishMatch` keep their signatures, so season, finance, news, the AI Brain decision points (46/60/70/80) and saves keep working.
- **Engine version setting** (`G.engine = 1 | 2`, admin toggle):
  - New games default to v2 once it is calibrated.
  - Old saves can switch.
  - v1 stays available for comparison until v2 is trusted.
- **AI Brain learned tables** are tagged with the engine version, since outcomes differ between engines. Learning restarts for v2, and v1 data stays separate in the cloud.

## 11. Delivery phases

| Phase | Work | Check before moving on |
|---|---|---|
| A | Pitch model and positions from formation, tactics and roles; tactics screen preview uses it | Positions look right for every formation and setting |
| B | Action engine (numbers only, v2 behind the admin toggle): possessions, decisions, duels, set pieces, fouls, offsides | Test seasons hit the targets in section 9; ability spread is correct |
| C | Per-player stats and action-based ratings; commentary from actions | Stats look realistic |
| D | 2D view plays the timeline; pressing, runs and offside visuals; speed modes | Plays smoothly on a phone, with no invented moves |
| E | Brain duel summaries in cloud sync; make v2 the default and keep v1 as an option | Phone data arrives; v1 vs v2 comparison |

Each phase is a separate pull request that can go live on its own. Phases A and C are useful even before v2 becomes the default.

## 12. Risks

- **Calibration** is the hardest part: many interacting probabilities. Mitigation: a small number of global constants in `TUNE_DEFAULTS`, plus test seasons after every change.
- **Phone performance** with the full 2D timeline. Mitigation: the engine writes keyframes only and the canvas interpolates them; "Key moments" mode as a fallback.
- **Strength gaps** could become too large or too small once individual duels decide outcomes. Mitigation: the logistic scale `k` is tuned against the points spread.
- **Save size:** the timeline is kept only for the match being played, not saved for every fixture.

## 13. Decisions for you

1. Live match speed: show every action (longer matches, about 4-6 minutes at 1×), or key moments by default?
2. Should offsides and VAR-style moments be shown?
3. Make v2 the default for existing saves, or only for new games at first?
4. ~~Add the missing attributes?~~ Done in 2026.10.20.3, with old saves migrated and ratings kept.
