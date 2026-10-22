# Football rulebook for the match engine

Status: version 2, with the owner's answers (2026-10-21). Nothing here is built yet.
Research notes behind it: `research_notes/Football styles study/` (kept outside the repo).

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

## 1b. The ball in and out of play

A real match is not 90 minutes of play. The ball is in play for only about **55-58 minutes** (Premier League);
the rest is restarts, goals, fouls, injuries and substitutions. This sets the rhythm of the game.

- **Restarts take real time:** throw-in about 10-15 s, goal kick 20-25 s, corner 25-30 s, free kick about 15-20 s
  (25-35 s near goal with a wall), penalty about a minute, a goal and kick-off 45-60 s.
- **Why the ball goes out:** deflections off tackles and blocks; mishit and overhit passes, long balls and crosses;
  blocked crosses (usually behind for a corner); heavy first touches near the line; a defender pressed on the
  touchline putting it out on purpose. A clean pass to a team-mate does not go out.
- **How often (per match, approximately):** 40-45 throw-ins, 16-18 goal kicks, about 10 corners, 22-25 fouls.
- How likely a mishit or a heavy touch is depends on the player's technique (Passing, Crossing, First Touch) and on
  pressure; good players under no pressure rarely give the ball away.

**You should see:** play stopping and restarting like a real match, with the ball going out mostly from
contested, hurried or overhit balls.

## 1c. Body shape: where a player faces

Every player faces somewhere, and that decides what he can see, how fast he can go where he wants, and what he
can do when the ball arrives.
- **Turning takes time.** A full turn takes about half a second to a second (quicker with Agility, slower at full
  speed). A player runs fastest forwards; sideways he is much slower, and backwards (backpedalling) slower still.
- **Without the ball he watches the ball.** Defenders face the ball and shuffle (side-on, backpedalling) to stay
  goal-side; when the ball goes over or past them they must turn, and the attacker facing forward gains a yard.
- **With his team on the ball he opens up.** A good receiver stands half-turned (between the ball and the goal he
  attacks) so he can see forward; Decisions, Vision and Anticipation make him open up more.
- **Receiving.** Facing forward or on the half-turn he can play forward straight away. With his back to goal he
  needs a touch to turn (or plays back, lays it off, or holds it up); a marker tight behind him makes turning
  hard.
- **Shooting and heading.** He shoots best facing the goal; with his back to it he has to turn first (or try a
  hook or overhead kick, rarely). A header is aimed where he faces.
- **Duels.** A defender caught facing the wrong way cannot tackle and is easy to run past; a carrier who turns
  his back on goal exposes the ball (a pressing trigger).

**You should see:** defenders side-on and backpedalling, turning when the ball goes over them; strikers holding
it up with their back to goal and laying it off; midfielders receiving on the half-turn and playing forward first
time; runners in behind beating defenders who have to turn.

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
3. **The attacking structure comes purely from the roles the manager picks** (owner's decision). There is no
   fixed 2-3-5 or 3-2-5: each role's job (section 6) says which lane and line it occupies in each phase, and the
   structure is what those jobs add up to. Example: two inverted full-backs + a 6 give a 2-3 behind the ball;
   wing-backs holding width + inside forwards give five across the front. The engine only enforces the lane rule
   (2) and rest defence (7); if the chosen roles leave a lane empty, it stays empty (that is the manager's choice).
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
10. **Individual tempo: scan, touch, play.** A player with nobody within about 10 m, in the middle or final third,
    takes a touch and looks up before passing (about 1.5 s): it lets runs develop. When a press is coming he plays
    early (one or two touches); under pressure he plays quickly to the free man. In build-up against a press the
    team keeps a quick tempo. Decisions and Composure decide how well he judges which is which.
11. **Patience in the box.** In chance creation, don't shoot from poor positions if a better chance can be
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
   **Near his own box the first defender delays rather than dives in:** on his feet, side-on, showing the attacker
   away from goal, until the ball is exposed (the attacker turns away from goal or loses control) or a team-mate
   is covering him. A defender who dives in and misses is out of the game, and the attacker is through.
   **Jockeying is the normal way to defend the man on the ball** (anywhere on the pitch): goal-side, between him and
   the goal, matching his movement and showing him one way. The defender commits to a tackle only when it is on
   (a heavy touch, the ball exposed, the attacker turned away, a team-mate covering). A team makes about 15-20
   tackles a match and its opponents about 8-10 successful dribbles; only a defender who commits and misses, or is
   beaten by a take-on, is left behind. A take-on beats the defender a bit under half the time; a tackle committed
   when it is on wins the ball about three times in five.
   **What a tackle is.** A tackle is a committed attempt by a defender to win the ball from an opponent in
   possession, whether or not he succeeds (take-on, ball exposed, attacker turned, or team-mate covering). It is
   won when the carrier loses the ball in it. Jockeying, however close, is not a tackle: no duel is fought and
   nothing is counted. A tackle is therefore a committed duel, and a jockey who wins the ball without committing is
   not counted as one.
   **Carrying past a defender is not a take-on.** A carrier who moves away from a defender that cannot reach his
   path in time is carrying into space: the defender jockeys and does not commit, and no duel is counted. A take-on
   is a carrier engaging a man in front of him, whose path that defender can cut off in time, so the carrier has
   chosen to run at him. A defender level with the carrier, side by side, is not a take-on: he is pressing from the
   side, and the carrier who gets clear of him has carried, not beaten him. Only that duel
   is an attempt at a dribble, and only a beaten defender in it is a successful dribble. A carrier runs at a man only
   when he judges he can beat him more often than not (Dribbling, Agility, Flair against the defender's
   Tackling and Anticipation); a blocked carrier who cannot shields, reassesses or passes, and does not face a
   forced tackle every second.
6. **Cover shadow.** A presser runs on the line that cuts off the pass behind him (usually into the 6).
7. **Back line moves as one.** It steps up when the ball goes back or the carrier is pressed and can't play forward;
   it drops when the carrier is free and facing forward ("ball pressure / no ball pressure"). This is the offside
   trap.
   A midfielder tracking a runner goes with him up to the back line and passes him on to the defenders; dropping
   behind his own back line plays everyone onside and leaves the line stranded.
   **The line steps up and drops together, quickly** (sprinting out, not jogging): a defender left a few metres
   behind the others plays every attacker onside, and that is the moment a ball over the top goes in behind.
   Organised, the back four stays within a few metres of each other in depth.
   **The line, not the man.** A back-line defender goes with a runner only when the ball carrier is free and
   facing forward (an open ball, and then the whole line drops); otherwise the line holds or steps up and the runner
   is left offside. Forwards play on the shoulder of the last defender; a runner who goes too early, or a pass a
   fraction late, is flagged (about four offsides a match). A passer sees a clear offside, but a tight one is easy to
   misjudge.
8. **Box defending.** In the low block the box is defended zonally (near post, 6-yard box, penalty spot, far post)
   plus marking of runners; the 6 protects the edge of the box (Zone 14 and cut-backs).
   **In shooting range (about 25 m and closer) the first defender comes at the ball on the goal side**, between the
   ball and the goal, to block the shot; showing him to the passing lane is for midfield. The second defender
   covers the pass inside (the cut-back or the square ball). Most shots in a real match go through at least one
   body; a shooter with nobody between him and the goal is a defensive mistake, not the normal case.
   **In and around the box every defender is goal-side of his man and close (1-2 m), with ball and man in view.**
   Halfway between his zone and his man is ball-watching: the runner arrives in front of him.

9. **Loose and second balls.** A loose ball (a deflection, a miscontrol, a long ball that has landed, a pass that
   has missed its man) is attacked at once by the nearest player of each side; the first there wins it, the next
   ones get close for the second ball. A pass only belongs to its receiver while he can still get to it first.
   **A long ball is read in the air.** As it is struck the defenders read its flight: the one who can get under it
   goes to head it or take it before it drops, and the others turn and get goal-side of where it will land. A
   striker only runs onto a ball over the top unchallenged when it is played into space no defender can reach.

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
3. **On losing the ball: counter-press window.** Guardiola's rule is about 5-6 seconds; Klopp and Rangnick aim
   to win it back within about 8 seconds (and shoot within about 10 after winning it). Engine: a window of
   5-8 s, longer for players with high Work Rate and Stamina and shorter when tired. The nearest 3-4 players press
   the ball immediately, cut its nearest passes and the escape lane forward; the rest step up to squeeze.
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

### 6.0 Zones and the living shape
- **A position is an area, not a point.** Each player looks after a zone (his lane and his line) and moves freely
  inside it, with and without the ball; at its edge he hands over to the team-mate next to him.
- **The shape is alive.** The team moves up and down with the ball, but not as one rod: the back line follows the
  ball up to the halfway line, the midfield stays close behind the ball, the forwards hold the last line. Without
  the ball the side of the ball squeezes and the far side tucks in.
- **The space decides the job.** When a player leaves his zone (an overlap, a run into the box), the nearest
  team-mate covers it; when a wide forward goes inside, the full-back takes the touchline.
- **Roles defend differently** (how far they come back is part of the role):

| Role | Without the ball |
|---|---|
| Wide Midfielder | Tracks the full-back all the way; forms a flat midfield line with the centre midfielders |
| Winger / Inverted Winger | Comes back to the midfield line, presses the full-back from the inside |
| Inside Forward | Stays higher, in the half-space between the opposition full-back and centre-back: the outlet for the counter |
| Full-Back / Wing-Back | Holds the back line; the Wing-Back steps out early to the winger |


### 6.1 Goalkeeper (1)
- Build-up: an extra passer behind the centre-backs; long when pressed (Sweeper/Ball-playing keeper: more involved).
- OOP: positioned on the line between ball and goal centre (at a tight angle that puts him at the near post), and he
  resets quickly with every pass near his goal: a keeper caught on the wrong line after a cut-back or a square ball
  shows the shooter most of the goal. Comes off his line behind a high line (sweeper); claims crosses into the
  6-yard box; narrows the angle in one-on-ones.

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
- Wide Midfielder: balanced; a little deeper and narrower than a Winger with the ball (supporting the full-back);
  tracks the full-back without it.
- Runs in behind: the Winger runs straight down the line; the Inside Forward runs diagonally inside, between the
  full-back and the centre-back; a wide midfielder rarely runs beyond.
- When the wide forward goes inside, the full-back on his side takes the touchline (the overlap).
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
   It needs a picture: the passer must have time to lift his head and see the run (facing forward, not tightly
   pressed). A pressed player who tries it mostly gives the ball away; only great Vision and Composure find it
   with a man on his back. Under pressure the normal choice is the safe pass, and the through ball comes from
   the team-mate who receives it free.
3. **Turn and shoot / slip** from Zone 14.
4. **Inside forward cutting in** to shoot from the half-space edge of the box.
5. **Cross** from the wide lane (whipped, early, or from deep): lower quality, many attempts.
6. **Long shots** from outside the box: low quality; taken when the block is deep and set, by good long shooters.

### 7.6 Kinds of shot, and where they go
The shooter picks the shot the moment allows, and aims where the keeper is not:
- **Placed** (side-foot, finesse) into the far corner, low: composed finishers with time in the box.
- **Low drive** into a bottom corner: the usual shot under pressure or from the edge of the box.
- **Power** from close range: high and hard, through or over the keeper.
- **From distance** (beyond about 20 m): driven or curled (Flair) towards a corner, often over or wide.
- **Chip** over a keeper who has come off his line in a one-on-one (Composure, Flair).
- **Header** aimed down and towards a post; **free kick** over the wall towards a top corner.
The keeper dives towards where it is going: he holds it, parries it (often for a corner) or is beaten; a miss
goes wide of a post or over the bar. Where the ball goes always matches what happened.

### 7.2 Filling the box on a wide attack (minimum three)
- **Near post:** the 9 (or the first runner) attacks the front of the 6-yard box.
- **Far post:** the far-side winger / inside forward, arriving late.
- **Penalty spot:** an 8 or 10 arriving late, for the cut-back and the second ball.
- **Edge of the box:** the other 8 / 10 for cut-backs and second balls.
- Rest defence stays.
- **When:** the box fills as soon as the ball goes wide in the attacking half: runners anticipate the cross; they
  do not wait until the ball reaches the byline. Near the box everyone re-reads the situation every second.
- **How:** runners hold onside on the defensive line, then attack the space as the ball is delivered (Off the
  Ball, Anticipation). The cross is aimed at a space (near post, penalty spot, far post), not just at a man.

### 7.4 The wide player's decision
- **Cross early** (from deep or wide of the box) when two or more runners are already attacking the box and the
  defence is not set; whipped to the near post or floated to the far post.
- **Go to the byline and cut back** when he has beaten his man or the full-back is caught square; the cut-back goes
  to the penalty spot or the edge.
- **Cut inside** (Inside Forward / Inverted Winger) onto his stronger foot into the half-space to shoot or slide a
  pass.
- **Recycle** (back to the full-back or the 8) when the box is empty or he is double-marked; the attack is rebuilt.
- His role, Crossing, Dribbling, Flair and Decisions decide what he chooses and how well it comes off.

### 7.3 Shooting rules
- Inside the box, unmarked, central or half-space: **shoot** (or square to a better-placed team-mate).
- One-on-one with the keeper: run at goal and **shoot**: early, low and across, or placed past him as he comes
  (the reading of 7.5 decides the moment). **Rounding the keeper is the exception**, only when he rushes right at
  the striker's feet. Even when it works it takes the striker wide, the angle narrows and defenders get back;
  when it fails the keeper smothers it or the ball runs away towards the byline. A good keeper rounded is rare: a
  team rounds the keeper a few times a season, not a few times a match.
- Outside the box: only when nothing better is on, the shooter is good from range, or the clock demands it.

**You should see:** most chances from cut-backs, through balls and cut-ins; three or more players in the box when
the ball is wide; clear chances finished.

### 7.5 What makes a chance good (shot quality)
A chance is judged the moment the ball is struck, from what the shooter sees (the structure follows the
professional shot models; the numbers are our own, set against public football figures):
1. **Distance and angle.** The goal mouth he can aim at narrows with distance and with the angle from the side.
   With the keeper set and nobody in the way: about 0.6 from 3 m, 0.4 from 6 m, 0.2-0.25 from the penalty spot,
   0.13 from the edge of the box, 0.04 from 25 m, 0.04 from a tight angle by the byline.
2. **How much of the goal he can see.** The keeper and any defender between ball and goal hide part of it. A keeper
   out of position (caught off his line, beaten by the pass) shows more of the goal: an open goal is a big
   chance even from distance; a well-set keeper closes it.
3. **Bodies in the way.** Each defender in the triangle between the ball and the posts makes it worse (and may block
   it): shots through a crowd rarely go in.
4. **Pressure on the shooter.** A man on him hurries the shot.
5. **The kind of shot.** A header is worth well under half of a shot with the foot from the same spot; free kicks
   and penalties are their own case (penalty about 0.76).
A one-on-one is not a fixed value: it is this same reading with nobody in the way and the keeper's position deciding
how much goal he shows.

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

## 9. Styles (presets): how each one attacks and defends

Each style is a set of principles and numbers. **Defending follows the style** (owner's decision).

### 9.1 Gegenpressing (Klopp's Dortmund/Liverpool, Rangnick's Red Bull school)
- **Defending:** high press, line of engagement in their defensive third, high back line (offside trap), compact
  block about 30 m deep pushed up. Man-oriented pressing near the ball, zonal further away. Triggers: back pass,
  pass to the full-back, poor touch, receiver facing his own goal, the touchline. Traps: force play wide, then
  close the touchline (winger, full-back, 8), the 6 cuts the pass inside. Forwards curve their runs to cut the
  pass into the 6. Rest defence 2+2 or 3+1 (CBs + 6 + one FB). Expect the opponent to make few passes per
  defensive action (PPDA about 8-10) and many high turnovers.
- **Attacking:** vertical and fast; into the half-spaces quickly; compact attack (players near the ball so the
  counter-press works); full-backs give width; many runners; shoot within about 10 s of winning the ball.
- **Transitions:** counter-press 5-8 s; counter at once on winning the ball.
- **Set pieces:** quick corners, outswingers to runners from deep; short throw-ins kept; mixed goal kicks;
  kick-off played diagonally to the winger and pressed.

### 9.2 Positional play / tiki-taka (Guardiola)
- **Defending:** counter-press first (about 5-6 s), then a high press or a mid block 4-4-2/4-1-4-1 shape when set;
  very high line, keeper sweeps. Defend by keeping the ball and by rest defence: 3+2 behind the ball (CBs, an
  inverted full-back and the 6) controlling the counter. Tactical fouls to stop counters.
- **Attacking:** short build-up with the keeper; five lanes filled; at most 2 per lane; third-man combinations;
  overload one side then switch; inverted full-backs into midfield; false 9 or a 9 pinning; patience; 600+
  passes, 60-65% possession; chances from cut-backs and half-space passes.
- **Transitions:** counter-press; secure the ball on winning it (hold shape).
- **Set pieces:** 25-45% short corners; short goal kicks 70-85%; short throw-ins; quick short free kicks;
  defend corners with a hybrid (zonal arc + man-markers).

### 9.3 Balanced (Ancelotti, many national teams)
- **Defending:** mid block, 4-4-2 or 4-5-1 out of possession, line of engagement around halfway, back line
  30-40 m from goal; press on triggers only; zonal with man-marking in the box.
- **Attacking:** flexible; build short or long by the pressure; forward when it is on; good players given freedom.
- **Transitions:** standard (forward if on, otherwise secure; delay then recover).
- **Set pieces:** standard mix; hybrid corner defence.

### 9.4 Counter-attack (Mourinho, Simeone, Ranieri's Leicester)
- **Defending:** low or mid block, two banks of four (4-4-2 or 4-4-1-1), very compact (lines about 10 m apart,
  block about 25-30 m deep), the whole block shifts to the ball and the far side tucks in; centre and Zone 14
  closed, let them cross from wide; strong box defending; few players forward (1-2 outlets).
- **Attacking:** win the ball, play forward in 1-2 passes to fast runners; 3-4 attack, the rest stay; long
  diagonals into the channels; 35-45% possession; few passes per possession.
- **Transitions:** regroup on losing the ball; counter on winning it.
- **Set pieces:** crossed corners, long goal kicks (60%+), long throws in range; zonal-heavy corner defence with
  1-2 left up for the counter.

### 9.5 Long ball / direct (Dyche, Allardyce, Pulis)
- **Defending:** mid or low block 4-4-2, compact and narrow, lots of heading and blocking; man-marking heavy in
  the box; all 11 back for set pieces.
- **Attacking:** long balls to a target man (flick-ons and knock-downs), midfielders win the second balls;
  early crosses, wide play; few passes (350-400), lots of aerial duels.
- **Transitions:** standard; second balls are the key.
- **Set pieces:** a big weapon: inswinging corners onto the keeper with 4-6 big players and a near-post flick;
  every wide free kick crossed; long throws whenever in range; 70-80% long goal kicks.

### 9.6 Low block ("park the bus") - an option, used as a tactic or as a shout (owner's decision)
- As a **tactic**: deep block (defensive line 16-25 m from goal), 4-5-1 or 5-4-1, extremely compact, box and
  Zone 14 protected, wide areas given away, one outlet up front; possession often under 35%.
- As a **shout** (during a match, e.g. protecting a lead): the team drops to the low block straight away and
  regroups on losing the ball, whatever the base style, until the shout is cancelled.
- **Set pieces:** everyone back, zonal-heavy; long goal kicks.

**Measured checks per style** (approximate, top-flight): possession; passes per match; PPDA (high press 8-10,
mid 11-13, low block 15+); share of long balls; crosses; high turnovers; counter-attacks; set-piece goals.

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

**A better player wins more of his duels, not all of them.** Even a clear gap (a top player against an average one)
wins about two duels in three; the best teams in a league win only just over half of all their duels. A strong side
dominates through its structure and many small edges, so it wins most games and sometimes by three or four, but
a league does not produce 10-0 scorelines: the weakest team in a division still defends its box, blocks shots and
scores now and then.
**The chance makes the goal more than the finisher.** A great finisher converts perhaps a tenth or a fifth more of
the same chances than an average one, and a poor one about that much fewer; Composure helps in one-on-ones. Who
creates the better chances matters far more than who strikes the ball.

---

## 11a. Starting players keep their football identity

First-team ability is an authored football assessment, separate from resale value. A missing valuation is
missing commercial data, never evidence of low ability. The player supplies his strengths and weaknesses:
a penalty-box finisher does not inherit elite dribbling, a passer does not inherit stamina, and an older
technician keeps technique without automatically keeping youthful mobility. Overall is calculated from the
completed attributes; it must not randomise or flatten them to hit a target. Keep physique and familiar
positions stable across new worlds. Unverified physical details are estimates, not claimed measurements.

Each named first-team entry has an explicit original quality assessment and football archetype, with
individual overrides for distinctive players. These are our fictional-player design decisions, not another
game's attribute database. Less-documented entries carry a provisional assessment and must not be presented
as fully scouted. Generated reserves, youth and free agents still vary, but their profiles also distinguish
specialists; no automatic ability bonus to physical attributes merely for being old.

Corrections apply to all new careers and untouched starting saves. Do not silently replace developed
players in an existing career: training increments before this change were not recorded separately, so they
cannot honestly be reconstructed. Those careers retain their attributes and progress; a new career uses the
complete revised database. Once applied, store the profile baseline/version on each player for future
explicit, progression-aware updates. Do not change match-engine coefficients to conceal database faults.

**You should see:** the finisher arriving to finish, the dribbler carrying, the creator distributing, the veteran
using judgement, and tall/strong targets contesting aerial balls. Different new worlds keep these identities.

## 11b. Set pieces: standard routines and numbers

Each style uses its standard routines (section 9). League targets (Premier League, Opta):
- Set pieces: about 20-27% of goals (excluding penalties).
- **Corners:** about 10 a match; about 3-3.5% of corners produce a goal; 20-25% produce a shot; about 0.03 xG
  per corner (an elite set-piece team 0.06-0.07). Inswingers and outswingers score at about the same rate;
  central 6-yard-box headers are the best chances.
- Attacking corner routine (standard): near-post runner, central runner, far-post runner, 1-3 players around the
  keeper (screens), one on the edge of the box, rest defence 2-3 back. Short corner sometimes (more in possession styles).
- Defending corners: hybrid (4-6 zonal players across the 6-yard box and near post + man-markers on the best
  headers + one on the edge); counter styles leave 1-2 up.
- **Direct free kicks:** only 3-7% scored (specialists more); taken from 18-27 m; wall 4-5 centrally at 16-22 m,
  3-4 at 22-27 m, 2-3 further, 0-1 from wide; wide free kicks are crossed.
- **Penalties:** about 78-80% scored.
- **Throw-ins:** short and kept by most; long throws into the box (about 0.04-0.05 xG each) by direct teams.
- **Goal kicks:** short build-up for possession styles, long for direct and counter styles (about half of all
  goal kicks now go long).
- **Kick-off:** played back to build (possession) or diagonally long to the winger and pressed (gegenpress).

## 11c. How this rulebook is used (owner's rule)

Every engine change starts from a section of this rulebook and says which one. If football needs something the
rulebook does not cover, the rulebook is updated first. Statistics only **check** the result (and calibrate league
averages at the end); behaviour is never changed just to move a number.

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
7. **Set pieces.** The standard routines per style (sections 9 and 11b).
8. **Calibration.** League averages only, plus the per-style checks in section 9.

At each layer I report what changed with screenshots and the checks (e.g. "passes back after a line-breaking
pass", "players in the box on a wide attack", "block depth").

---

## 13. Owner's decisions (2026-10-21)

1. Attacking structure: **comes purely from the roles the manager picks** (section 3.3).
2. Defending: **follows the style**; each style's defending is in section 9.
3. Gegenpress window: from the research, 5-8 s depending on Work Rate and Stamina (section 5.4).
4. Low block: **a tactic option, usable as a whole tactic or as a shout** (section 9.6).
5. Set pieces: **standard routines each style uses** (sections 9 and 11b).
6. Sections 4-8 confirmed; keep deepening them with study (attacking and defending notes per style are in the
   research folder and should be read before building each layer).
