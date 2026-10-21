# Football rulebook for the match engine

Status: draft for the owner's review. Nothing here is built yet.

This is the football the engine must play. The engine is built from it top-down:
**team plan first, then each position's job, then the individual decision**. Physics (speed, ball flight)
only carries the plan out. Every rule says what you should see on the 2D, so it can be checked by eye.

How to read it: "must" = a rule the engine follows. Numbers are targets for real top-flight football, used to
check the 2D and the match stats. Section 13 lists questions for the owner.

---

## 1. The pitch has parts

Pitch 105 × 68 m. Directions below are for the attacking team ("forward" = towards the goal it attacks).

### 1.1 Thirds (length)
| Third | Distance from own goal | Purpose with the ball |
|---|---|---|
| Defensive third | 0-35 m | Build-up: keep it safe, draw the press, find the free man |
| Middle third | 35-70 m | Progression: get past their midfield line |
| Final third | 70-105 m | Create and finish chances |

### 1.2 Five vertical lanes (width), the positional-play grid
Lines come from the penalty box (40.3 m wide) and the 6-yard box (18.3 m wide).
| Lane | x (m, 0 = left touchline) | Main use |
|---|---|---|
| Left wide lane | 0-13.8 | Width: stretch the back line, 1v1, crosses |
| Left half-space | 13.8-24.8 | The most valuable lane: diagonal passes, turning, cut-backs, shots |
| Centre lane | 24.8-43.2 | The 6, the 10, the 9; Zone 14 |
| Right half-space | 43.2-54.2 | As left |
| Right wide lane | 54.2-68 | As left |

### 1.3 Named zones
| Zone | Where | Why it matters |
|---|---|---|
| **Zone 14** | Centre lane, 17-30 m from goal (just outside the box) | Between their midfield and defence. A 10 or false 9 turning here = through ball or shot |
| **Between the lines** | Any lane, between their midfield line and back line | Receiving here breaks two lines at once |
| **Half-space by the box** ("cut-back zone" / "golden zone") | Half-space, 6-18 m from the byline | Low cut-back to the penalty spot is the best chance in open play |
| **Penalty box** | 16.5 × 40.3 m | Where most goals are scored |
| **Penalty spot area** | 9-13 m out, centre | Cut-back target, second wave |
| **6-yard box** | 5.5 × 18.3 m | Near-post flick, far-post tap-in, keeper's area |
| **Near post / far post spaces** | Either side of the 6-yard box | Cross targets |
| **Edge of the box** | 16-22 m, centre | Late runner (8), rebounds, cut-back shot |
| **Inverted space** | Half-space or centre, next to the 6 | Where an inverted full-back moves with the ball |
| **Wide channel** | Between full-back and centre-back | Runs in behind by wingers, 8s, forwards |
| **Space behind the line** | Between their back line and keeper | Through balls, runs; offside rules it |

**You should see:** players and passes using these spaces on purpose, not just "towards goal".

---

## 2. Phases of the game

The team is always in one phase. The phase decides the shape and what the ball carrier looks for.

| Phase | When | Team aim |
|---|---|---|
| **Build-up** | Our ball, in our defensive third | Keep it, draw their press, find the free man (6 or full-back) |
| **Progression** | Our ball, in the middle third | Get the ball between the lines or into a half-space facing forward |
| **Chance creation** | Our ball, final third | Overload a side, get to the byline or Zone 14, create a clear chance |
| **Finishing** | Ball in or near the box | Fill the box correctly, shoot when the chance is good |
| **Attack → defence transition** | First ~5 s after losing the ball | Counter-press or regroup (by tactic) |
| **Defence → attack transition** | First ~5 s after winning the ball | Counter or secure (by tactic) |
| **High press** | Their ball in their defensive third (if our tactic presses high) | Force a long ball or a mistake |
| **Mid block** | Their ball in the middle third | Stay compact, protect the centre, press on triggers |
| **Low block** | Their ball in our defensive third | Protect the box and Zone 14, let them have the wide areas |
| Set pieces | Dead ball | Later (section 12) |

**You should see:** the whole team change shape when the phase changes (e.g. full-backs push on when we
reach progression; everyone drops when the press is broken).

---

## 3. Principles with the ball (team)

These hold in every style; styles change the numbers, not the principles.

1. **Width and depth.** At least one player holds each wide lane in progression and chance creation (winger or
   full-back). The 9 (or the highest runner) gives depth on the last line. The ball side has a short option,
   the far side holds width for the switch.
2. **Lane rule.** In progression and chance creation: **at most 2 players in one lane**, and **never 3 in one
   horizontal line** in the same third. (Positional-play rule: it creates diagonals and triangles.)
3. **Five across the front line** in chance creation (wide, half-space, centre, half-space, wide), e.g. a 2-3-5
   or 3-2-5 attacking structure. Which players fill which lane depends on roles (section 6).
4. **Triangles and diamonds around the ball.** The carrier has a short option (8-15 m), a forward option
   (between the lines or in behind) and a back/switch option. Supporting players move to open angles, never
   standing in a straight line behind a defender (out of the "cover shadow").
5. **Third man.** If A can't pass to C, A plays to B who sets to C: when a player drops to receive, another
   runs into the space he left.
6. **Overload then switch.** Crowd one side (ball-side overload: 3v2 or 4v3), pull their block over, then switch
   to the free far side (wide player or full-back) when they shift.
7. **Rest defence.** While attacking, always keep **3 + 2** behind the ball (3 defenders + 2 screening, e.g.
   2 CBs + 1 FB, plus the 6 + an 8). Riskier styles may use 2 + 2; never fewer than 4 players behind the ball.
8. **Forward first.** Each carrier looks for the forward pass/carry first; sideways or back only when forward is
   closed or under pressure, or to draw the press and play forward next (deliberate). A pass straight back to
   the man who just passed it is a **one-two**, used to get past someone, not a habit.
9. **Momentum.** After a forward pass that breaks a line, the next actions continue forward (turn, carry,
   combine, runners go past). Going back right after breaking a line is the exception (receiver closed down).
10. **Patience in the box.** In chance creation, don't shoot from poor positions if a better chance can be
    made; but **a clear chance (inside the box, unmarked, decent angle) is always taken**.

**You should see:** a clear attacking structure (five lanes filled near goal), the ball moving forward in phases,
switches of play, triangles around the ball, and players staying back as rest defence.

---

## 4. Principles without the ball (team)

1. **Compact block.** The distance from our last defender to our highest presser stays about **30-35 m**
   (mid/low block); a high press stretches it a little more, which the back line covers by holding a high line.
2. **Line distances.** About **10-12 m** between the back line and midfield line, and between midfield and
   forwards. Nobody plays between the lines with time.
3. **Shift as a team.** The block slides across to the ball side together. The far-side wide player and full-back
   tuck in to the half-space. The ball-side full-back steps up to the winger.
4. **Protect the centre first.** The centre lane and Zone 14 are closed; the opponent is pushed wide (low/mid
   block). Wide is less dangerous than centre.
5. **Cover and balance.** The first defender presses the ball; the second covers him at an angle (~5 m behind,
   inside); the third balances on the far side. Never two defenders pressing the same man while a runner is free.
6. **Cover shadow.** A presser runs on the line that cuts off the pass behind him (usually into the 6).
7. **Back line moves as one.** It steps up when the ball goes back or the carrier is pressed and can't play forward;
   it drops when the carrier is free and facing forward ("ball pressure / no ball pressure"). This is the offside
   trap.
8. **Box defending.** In the low block the box is defended zonally (near post, 6-yard box, penalty spot, far post)
   plus marking of runners; the 6 protects the edge of the box (Zone 14 and cut-backs).

**You should see:** two or three tight lines that slide together, the far side tucked in, the centre closed,
one man pressing the ball with another covering, the line stepping up when the ball goes back.

---

## 5. Pressing and the gegenpress foundation

### 5.1 Pressing levels (our "Pressing" + "Defensive line")
| Level | Line of engagement (first pressure) | Defensive line | Typical style |
|---|---|---|---|
| Low block | Their side of halfway is left; press starts ~35-40 m from our goal | Edge of our box, 16-25 m | Counter-attack, underdogs |
| Mid block | Around halfway | 30-40 m from goal | Balanced, long ball |
| High press | In their defensive third | 40-50 m from goal (high line) | Gegenpress, tiki-taka |

### 5.2 Pressing triggers (when the nearest man jumps)
Back pass; poor or heavy first touch; receiver facing his own goal; ball on the touchline (the touchline is the
extra defender); a slow, square pass; a keeper or centre-back with no forward option. When a trigger fires, the
**nearest 2-3 go together** (one presses, others cut the passes); a single man pressing alone is wasted running.

### 5.3 Pressing traps
Show them one way (usually wide), then close: the presser curves his run to block the inside pass, the
ball-side full-back and 8 close the touchline, the 6 cuts the pass inside.

### 5.4 Gegenpress (the foundation, in order)
1. **Rest defence is set before the ball is lost** (3+2 or 2+2 behind the ball).
2. **Compact attack:** players near the ball in attack are close together (that is what makes the counter-press work).
3. **On losing the ball: 5-second rule.** The nearest 3-4 players press the ball immediately, cut its nearest
   passes and the escape lane forward; the rest step up to squeeze.
4. **If won back:** attack at once (the opponent is out of shape).
5. **If the press is broken** (they play forward past the pressers, or after ~5 s): stop and **drop into the
   block** quickly; the rest defence delays the counter.
6. Costs: running and tiredness; space behind the high line.

**You should see:** after losing the ball, several players swarm it at once and the others step up; if it fails,
everyone sprints back into shape.

---

## 6. Positions are jobs

Each position has a job per phase. Roles (our role names) change the job within the position.
"IP" = in possession, "OOP" = out of possession.

### 6.1 Goalkeeper (1)
- Build-up: an extra passer behind the centre-backs; long when pressed (Sweeper/Ball-playing keeper: more involved).
- OOP: positioned on the line between ball and goal centre; comes off his line behind a high line (sweeper);
  claims crosses into the 6-yard box; narrows the angle in one-on-ones.

### 6.2 Centre-backs (4, 5)
- Build-up: split wide (to the edge of the box) to give the keeper and 6 angles; carry forward into midfield when
  free (Ball-Playing Defender).
- Progression/attack: hold the halfway line area as rest defence (two of the "3").
- OOP: hold the line together; one steps out to the man in Zone 14 (Stopper), the other covers.

### 6.3 Full-backs / wing-backs (2, 3)
- Full-Back: width in build-up; overlaps the winger when the ball is on his side in the final third; part of rest
  defence when the ball is on the other side.
- Wing-Back: holds the wide lane high in progression and chance creation (in a back three, or with an inside winger).
- Inverted Full-Back: moves into the inverted space next to the 6 in progression; that makes a 3-2 rest defence.
- OOP: steps to the winger on his side; tucks in when the ball is on the far side.

### 6.4 Number 6 (DM: Anchor, Deep-Lying Playmaker, Ball-Winner)
- Build-up: shows for the ball between or in front of the centre-backs; switches play; drops between the
  centre-backs when they are pressed by two (Deep-Lying Playmaker).
- Progression: stays behind the ball as the pivot (one of the "+2" in rest defence).
- OOP: screens Zone 14 and the passes into it; first to stop a counter; protects the edge of the box in a low
  block. Anchor holds position; Ball-Winner presses the ball in midfield.

### 6.5 Number 8 (MC: Box-to-Box, Mezzala, Playmaker)
- Build-up: shows in the half-space to receive on the half-turn.
- Progression: receives between the lines in the half-space and plays forward; links wide player and 9.
- Chance creation: runs into the wide channel or the box late (arrives at the edge/penalty spot for cut-backs).
- Mezzala: lives in the half-space, runs wide of the striker. Box-to-Box: covers ground both ways, late box runs.
  Playmaker: drops to get the ball, dictates tempo, plays the forward pass.
- OOP: second pressing line; covers the 6; tracks runners from midfield.

### 6.6 Number 10 (AMC: Attacking Midfielder, Advanced Playmaker, Shadow Striker)
- Progression and chance creation: **finds space between the lines in Zone 14 or the half-space**, receives on
  the half-turn, plays the final pass (through ball, slip to the half-space) or shoots from the edge.
- Shadow Striker: makes late runs past the 9 into the box.
- OOP: presses their 6 / cuts the pass into him (cover shadow).

### 6.7 Wide players (ML/MR, AML/AMR)
- Winger: holds the wide lane; takes on the full-back on the outside; crosses or cuts back from the byline; far-side
  winger attacks the far post.
- Inside Forward: starts wide, **cuts inside onto his stronger foot into the half-space** to shoot or slide a pass;
  runs in behind the full-back.
- Inverted Winger: comes inside into the half-space to create (curled crosses, through balls).
- Wide Midfielder: balanced; tracks the full-back.
- Wide Playmaker: drifts into the half-space to create.
- OOP: presses their full-back from inside out (cutting the pass inside); tracks his full-back in a low block;
  tucks in when the ball is far side.

### 6.8 Number 9 (ST: Advanced Forward, Target Forward, Poacher, Pressing Forward, False Nine)
- Depth: pins the centre-backs on the last line so the 10 and 8s have space.
- Advanced Forward: runs in behind, attacks space, carries at defenders.
- Target Forward: back to goal, holds the ball up, wins headers, lays off to the onrushing 8/10 (who play forward).
- Poacher: lives on the last line and in the box, near post / penalty spot, little link play.
- Pressing Forward: leads the press; first trigger presser; curves runs to cut the pass to the 6.
- **False Nine: drops into Zone 14**, pulls a centre-back with him or turns; the wingers/inside forwards run into the
  space behind; arrives late in the box.
- Box runs on a cross: near post (first man), penalty spot or far post depending on who else attacks.

**You should see:** each number doing its job: the 6 behind the ball, 8s in the half-spaces, the 10 between the
lines, the 9 on the last line (or a false 9 dropping), wingers wide or cutting in by role, full-backs overlapping or
inverting by role.

---

## 7. Chance creation and the box

### 7.1 Ways to create (in order of quality in open play)
1. **Cut-back** from the byline/half-space by the box to the penalty spot or edge.
2. **Through ball** into the space behind (from Zone 14 or the half-space) for a runner timed onside.
3. **Turn and shoot / slip** from Zone 14.
4. **Inside forward cutting in** to shoot from the half-space edge of the box.
5. **Cross** from the wide lane (whipped, early, or from deep): lower quality, many attempts.
6. **Long shots** from outside the box: low quality; taken when the block is deep and set, by good long shooters.

### 7.2 Filling the box on a wide attack (minimum three)
- **Near post:** the 9 (or the first runner).
- **Far post:** the far-side winger / inside forward.
- **Penalty spot:** an 8 or 10 arriving late.
- **Edge of the box:** the other 8 / 10 for cut-backs and second balls.
- Rest defence stays.

### 7.3 Shooting rules
- Inside the box, unmarked, central or half-space: **shoot** (or square to a better-placed team-mate).
- One-on-one with the keeper: run at goal, shoot early (low, across) or round him if he comes out fast.
- Outside the box: only when nothing better is on, the shooter is good from range, or the clock demands it.

**You should see:** most chances from cut-backs, through balls and cut-ins; three or more players in the box when
the ball is wide; clear chances finished.

---

## 8. Transitions

| Transition | Instruction | Rule |
|---|---|---|
| Lose the ball | Counter-press | Nearest 3-4 press for ~5 s (section 5.4) |
| Lose the ball | Standard | Nearest man delays the ball, others recover into the block |
| Lose the ball | Regroup | Everybody drops straight into the block, no pressing until set |
| Win the ball | Counter | First pass forward within 1-2 touches; 2-3 runners sprint in behind; wide players go |
| Win the ball | Standard | Forward if it is on, otherwise secure it |
| Win the ball | Hold shape | Secure the ball, team takes its in-possession structure first |

**You should see:** the first 5 seconds after every turnover look different by instruction.

---

## 9. Styles (presets) = principles + numbers

| Style | With the ball | Without the ball | Transitions |
|---|---|---|---|
| **Gegenpressing** | Fast, vertical; ball into half-spaces quickly; many runners; compact attack | High press, high line; triggers + traps | Counter-press 5 s; counter at once |
| **Tiki-taka (positional play)** | Five lanes, triangles, third-man passing, patient build-up, switch after overload | High press, high line | Counter-press; secure on winning it |
| **Balanced** | Mixed; forward when on | Mid block | Standard |
| **Counter-attack** | Few in possession; fast direct ball to runners; 3-4 attack | Low/mid block, compact, centre closed | Regroup on losing it; counter on winning it |
| **Long ball** | Target man + second balls; early long balls; wide play and crosses | Mid block | Standard |
| (Low block / park the bus) | Rare, counter | Deep block in our third, box protected | Regroup |

**Measured checks per style** (approximate, top-flight): possession (tiki-taka 60-65%, counter 35-45%);
passes per match (tiki-taka 600+, long ball 350-400); PPDA (opponent passes per defensive action in their 60%
of the pitch: high press 8-10, mid 11-13, low block 15+); long-ball share; crosses; counter-attacks.

---

## 10. Our tactic settings, mapped to these rules

| Setting | Changes |
|---|---|
| In-possession formation | Starting slots for the attacking structure (section 3) |
| Out-of-possession formation | The block's shape (section 4) |
| Roles | Each player's job by phase (section 6) |
| Mentality | How many players join attacks, how high the block sits, rest defence 3+2 vs 2+2, risk |
| Width | Use of wide lanes vs half-spaces; how wide the attacking structure is |
| Tempo | Time on the ball, speed of circulation |
| Passing | Short combinations vs direct/long (section 3 and 9) |
| Pressing | Line of engagement, how readily triggers fire (section 5) |
| Defensive line | Height of the back line, offside trap (section 4) |
| When the ball is lost / won | Transitions (section 8) |
| Player instructions | Adjust a player's job (shoot more, dribble, get forward, stay wide, press, mark tighter...) |

---

## 11. Attributes decide how well the plan is carried out

The plan says **what** to do; attributes say **how well**:
- Positioning, Teamwork, Concentration-type skills: holding the block and lanes, rest defence.
- Off the Ball, Anticipation: finding space between the lines, timing runs, reading triggers.
- Vision, Passing, Decisions: seeing and playing the forward/line-breaking pass.
- First Touch, Technique-type skills: receiving on the half-turn under pressure.
- Dribbling, Agility, Pace, Flair: beating a man, carrying through lines, cutting in.
- Work Rate, Stamina: pressing and recovering for 90 minutes.
- Marking, Tackling, Strength, Heading: winning duels; Marking: staying with runners into the box.
- Finishing, Composure: taking chances; Crossing: delivery; goalkeeping attributes: the keeper's job.

Rule: **every attribute must change something you can see**, and the attribute test (Admin) must show each one
helping (none useless, none deciding everything).

---

## 12. Build order (one layer at a time, each shown on the 2D before the next)

1. **Pitch language + team shape as a unit.** Thirds, lanes, zones; phase detection; in-possession structure
   (five lanes near goal, rest defence) and out-of-possession block (compact, shift, tuck in). First a
   "shape demo": the ball is moved along a set route and you watch the team move.
2. **Position jobs.** Section 6, per phase.
3. **Team intent with the ball.** The carrier chooses by phase aim (section 2 and 3): forward first, momentum,
   one-twos only with a purpose, overload then switch.
4. **Defending as a team.** Pressing levels, cover/balance, triggers, traps, line stepping (sections 4-5).
5. **Transitions.** Section 8 and gegenpress 5.4.
6. **The box.** Section 7: cut-backs, filling the box, shooting rules.
7. **Set pieces.** Corners (near-post, far-post, short), free kicks, throw-ins: basic routines.
8. **Calibration.** League averages only, plus the per-style checks in section 9.

At each layer I report what changed with screenshots and the checks (e.g. "passes back after a line-breaking
pass", "players in the box on a wide attack", "block depth").

---

## 13. Questions for the owner

1. **Attacking structure:** should the default in-possession structure be **2-3-5** (full-backs push, the 6 + two
   8s behind five forwards) or **3-2-5**, or should it come purely from the roles you pick?
2. **Rest defence:** 3+2 for all styles, and 2+2 only for very attacking mentality - agree?
3. **Gegenpress window:** about 5 seconds - keep, or should it depend on Work Rate/Stamina more?
4. **Low block as its own style** (park the bus), separate from Counter-attack?
5. **Set pieces:** do you want to design routines yourself later (near post, far post, short corner), or should
   the engine use standard routines for now?
6. Anything in sections 4-8 that does not match how you see the game?
