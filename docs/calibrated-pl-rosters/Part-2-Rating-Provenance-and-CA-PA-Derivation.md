# Part 2: Rating Provenance & Mathematical Derivation (CA / PA)

This document defines the implemented method for calculating Current Ability (CA) and Potential Ability (PA) from the 26 supplied attributes. The database builder and live game share `calibratedAbility` and `CALIBRATED_WEIGHTS` in `js/core/data.js`. All 543 supplied profiles are checked against this method.

## 1. Attribute order and input rules

Each attribute is an integer from 1 to 20, in this fixed order:

`[Fin, Pas, Dri, 1st, Cro, Tac, Mar, Hea, Vis, Dec, Pos, Wor, Cmp, Lea, Pac, Sta, Str, Agi, Ref, Han, 1v1, Kic, Ant, OtB, Fla, Tea]`

The abbreviations mean Finishing, Passing, Dribbling, First Touch, Crossing, Tackling, Marking, Heading, Vision, Decisions, Positioning, Work Rate, Composure, Leadership, Pace, Stamina, Strength, Agility, Reflexes, Handling, One-on-Ones, Kicking, Anticipation, Off the Ball, Flair, and Teamwork.

Reject a profile if an attribute is missing, non-integer, or outside 1–20. Do not silently replace missing values with averages.

## 2. Position-weighted CA

For each position, calculate the weighted attribute mean:

\[
M_{pos}=\frac{\sum_{i=1}^{26}w_{pos,i}A_i}{\sum_{i=1}^{26}w_{pos,i}}
\]

Then convert it to the 1–100 CA scale:

\[
CA=\operatorname{clamp}_{1}^{100}\left(\operatorname{round}(20+4.65\cdot M_{pos})\right)
\]

Use ordinary rounding to the nearest integer (exact halves round upward), then clamp the result to 1–100. The 20-point offset and 4.65 scale factor calibrate the 543 supplied profiles to a league mean close to the established-player benchmarks; position weights determine each player's relative level. With the current weights and roster attributes, the resulting mean CA is about 77.2. All weights below are relative weights; the formula normalizes by their sum.

### 2.1 Goalkeepers (GK)

Assign weights as follows:

- Reflexes, Handling, One-on-Ones, Kicking, Positioning, Anticipation, Decisions, and Agility: **0.7 / 8 each**.
- Each of the other 18 attributes: **0.3 / 18 each**.

Thus keeper attributes account for exactly 70% of the total weight; outfield attributes account for 30% together.

### 2.2 Outfield positions

Start with these default weights:

- Fin, Pas, Dri, 1st, Cro, Tac, Mar, Hea, Vis, Dec, Pos, Wor, Cmp, Lea, Pac, Sta, Str, Agi, Ant, OtB, Fla, Tea: **0.75 each**.
- Ref, Han, 1v1, Kic: **0.05 each**.

Then, for each player's listed position, replace the default weight of the named attributes with the position weight shown below. All attributes not named for that position keep their defaults. `Core`, `Secondary`, and `Support` weights are **1.6**, **1.3**, and **1.0**, respectively.

| Position | Core (1.6) | Secondary (1.3) | Support (1.0) |
|---|---|---|---|
| DC | Tac, Mar, Hea, Pos | Dec, Str, Ant, Cmp | Pas, 1st, Lea, Wor, Tea |
| DL / DR | Pac, Sta, Cro, Wor | Tac, Pos, Dri, Agi | Pas, 1st, Dec, Ant, Tea |
| DM | Pas, Tac, Pos, Dec, Ant | Vis, Wor, Sta, Tea, Cmp | 1st, Mar, Str, Agi, Lea |
| MC | Pas, Vis, Dec, 1st | Wor, Sta, Tea, Dri, Cmp | Fin, Tac, Pos, Ant, OtB, Fla |
| AMC | Vis, Pas, 1st, Dec | Dri, Fin, OtB, Fla | Cmp, Agi, Tea, Ant, Cro |
| AML / AMR | Pac, Dri, Cro, OtB | 1st, Agi, Fla, Fin | Pas, Vis, Dec, Wor, Tea, Sta |
| ML | Pac, Sta, Cro, Wor | Dri, 1st, Tac, Pos | Pas, Vis, Dec, Tea, OtB, Ant |
| ST | Fin, OtB, Cmp, Ant | Hea, Pac, 1st, Str | Vis, Dec, Wor, Dri, Tea |

These are authored starting weights, not values fitted from licensed ratings. Roles not listed in this roster set must be assigned a complete vector before use; do not guess a nearest position silently.

## 3. CA benchmark bands

Use these bands as review targets after calculating CA. They do not override the formula or justify manually changing a player's result.

| CA | Benchmark |
|---:|---|
| 90–95 | Generational world-class outlier |
| 84–89 | Continental / elite international starter |
| 78–83 | Established top-flight starter |
| 72–77 | Reliable rotation / mid-table starter / strong second-tier player |
| 65–71 | Squad depth / transition prospect |
| Below 65 | Developmental prospect |
| 96–100 | Exceptional score; manually audit the profile and weights |

Examples such as Håkon Solberg / Haaland or Julian Weigel / Wirtz are illustrative anchors only; they are not input ratings or evidence for copied attribute values.

## 4. Potential Ability (PA)

PA is the player's projected peak CA ceiling, not a promise that training will reach it. Calculate it by adding an age-based development range to the newly calculated CA. Use the roster row's supplied PA-minus-CA gap only as a signal for where within the age band the player sits; the supplied CA is not retained:

| Age | Suggested development delta (PA − CA) |
|---:|---:|
| 16 | +12 to +25 |
| 17–18 | +10 to +22 |
| 19–21 | +8 to +18 |
| 22–24 | +3 to +12 |
| 25–26 | +1 to +6 |
| 27–29 | 0 to +2 |
| 30+ | 0; allow +1 only for an explicitly documented late peak |

Rules:

1. PA must be an integer, at least CA, and no higher than 100.
2. For ages 16–29, calculate `sourceDelta = max(0, supplied PA − supplied CA)` and clamp it to the age band's minimum and maximum. This deterministic rule uses the supplied potential assessment as a relative signal. Age 30+ receives zero delta because the files provide no late-peak evidence.
3. If CA plus the chosen delta exceeds 100, cap PA at 100.
4. A low ceiling can give a young player PA close to CA; do not force every prospect to receive the top of the range.
5. A player aged 27 or older normally has PA equal to CA, with up to two extra points only when a late peak is documented.
6. PA is a ceiling for the progression system. Facilities and coaching may affect development rate, not silently raise the authored PA.

Record the supplied source delta, age band, clamped delta, and resulting PA in the generated player profile so another reviewer can reproduce the decision.

## 5. Calibration and provenance checks

Before applying this method to all roster players:

1. Calculate a varied sample: goalkeeper, defender, full-back, defensive midfielder, central midfielder, attacking midfielder, winger, striker, and at least one player from each CA benchmark band.
2. Check that each player's strengths and weaknesses are reflected by the positional weights and that the CA tier is credible. Adjust weights only as a documented calibration change, then recalculate the full sample.
3. Check that swapping a player's position changes CA in an explainable way, and that raising a highly weighted attribute cannot lower CA.
4. Record the author, date, weight version, input attribute source, formula version, and any manual PA rationale. Use original authored attributes and calibration; do not copy third-party ratings or claim they were independently verified when they were not.
5. Keep the current roster CA/PA values labeled **unverified** until they have been recalculated with this version and reviewed. This document does not itself change those values.

## Runtime consistency

Calibrated profiles carry `originProfile.calibrationVersion = 1`. Creation, training, attribute migration, positional ratings, goalkeeper unit ratings and admin edits use this version through `playerRating`. PA remains a fixed ceiling during development; training does not reapply the initial age-based PA calculation. Players without this calibration marker retain their existing rating method to preserve ongoing careers. The right midfield position MR uses the documented ML vector, matching the DL/DR and AML/AMR symmetry.

Regression checks: `node tests/calibrated-rating-consistency.cjs` verifies all 543 profiles, positive and negative training, potential ceilings and every supported positional rating.
