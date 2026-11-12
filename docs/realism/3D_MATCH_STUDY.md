# 3D match realism study

What real football looks like, what older football games did to look like it, where our match fell short,
and what was changed. Measured on one recorded match from our engine (`scripts/record-match-3d.cjs`), the
same one the 3D viewer in `match3d/` replays. Written 12 November 2026.

## 1. Facts collected

### Real football: how players move (time-motion studies)

| Fact | Value | Source |
|---|---|---|
| Share of match time by activity, top-class outfield players | standing about 20%, walking about 42%, jogging about 17%, running about 17%, sprinting about 1.4% | Mohr et al. 2003, as cited in the JSSM positional study and Dolci and Hart's review |
| Distance covered, outfield | about 10-13 km a match | GSSI Sports Science Exchange 125 (Bangsbo) |
| Distance above 15 km/h / above 25 km/h | about 22-24% / about 2-3% of distance | Dolci and Hart's review |
| Speed zones used in studies | walk 0-7 km/h, jog 7-14.5, run 14.5-20, high speed 20-25, sprint above 25 | South African Journal of Sports Medicine goalkeeper study |
| Goalkeepers | about 5.6-6.0 km a match, about 70% of it walking | Dolci and Hart's review |

### Real football: the ball

| Fact | Value | Source |
|---|---|---|
| Rolling deceleration on turf at low speed | about 0.8-1.0 m/s² at about 2.5 m/s | ISSS ball-roll document (DIN 18035-7 method) |
| Rolling deceleration on grass, range | about 1-3 m/s², by grass length and wetness | FizzIQ activity (educational; less reliable) |
| Size 5 ball | 68-70 cm circumference | Laws of the Game (used for the ball model) |

Not found in the sources searched: a measured rebound figure for a ball on grass and measured pass speeds
in metres a second. The rebound of 0.55 used below is our own working value, not a sourced one.

### Real footage studied (four clips supplied by the owner)

- **Sprint (broadcast, World Cup):** torso leaning well forward, heel to the backside, knee to hip
  height, arms driving hard; the ball is pushed several metres ahead and chased, never at the feet.
- **Shooting (training):** last stride, plant foot beside the ball, opposite arm thrown wide, big
  follow-through that lifts the player off the ground.
- **Side-foot pass:** almost no backswing, boot turned out, body upright, eyes on the ball.
- **Receiving:** on the toes before the ball arrives, body open, the first touch moves the ball into the
  next action (across the body, on the half-turn, or dead under the sole).
- **What a broadcast picture contains:** mown stripes, a full stand behind the play, long shadows from
  every player, players of visibly different heights, all heads turned to the ball.

### Older FIFA games: what they added, in order

| Game | Feature | What it did |
|---|---|---|
| FIFA 12 | Player Impact Engine | Physics for every contact: more varied collisions, momentum kept through them |
| FIFA 12 | Precision Dribbling, Tactical Defending | Closer touches on the ball; defenders contain (jockey) rather than lunge |
| FIFA 13 | First Touch Control | Ended perfect control for everyone: a hard pass is hard to take, the ball can get away |
| FIFA 14 | Precision Movement | Players plant, pivot and cut with momentum; every step counts |
| FIFA 14 | Pure Shot / Real Ball Physics | Players adjust stride and angle before striking; the ball has its own flight |
| FIFA 14 | Variable dribble touches | The touch while running varies with skill: the ball is not on a string |

Sources: Wikipedia (FIFA 12, FIFA 13), PlayStation Blog (FIFA 14), and retail and fan listings (less
reliable, used only where they agree with the above).

**The common thread:** the ball is a separate object from the player, bodies carry momentum, and contact
has consequences. Our match had none of the three.

## 2. Where our match stood (measured before this work)

| Measure | Ours | Real | Verdict |
|---|---|---|---|
| Walking, share of time | 38% | about 42% | too little |
| Jogging | 30% | about 17% | far too much |
| Running (14.5-20 km/h) | 7% | about 17% | too little |
| Sprinting | 4% | about 1.4% | three times too much |
| Distance per outfield player | 12.2 km | 10-13 km | fine |
| Time on the ball per possession | 2.0 s median | about 2-3 s | fine |
| Ball after landing | stops dead, no bounce | bounces, then rolls | wrong |
| Ball while dribbling | fixed half a metre in front of the boot | pushed ahead and caught up | wrong |
| Keeper at wide crosses | on the near post | middle of the goal | wrong (fixed earlier) |
| Bodies meeting | pushed apart, speed untouched | lose speed, the stronger holds ground | wrong (fixed earlier) |
| Picture | flat green plane, grey fog, blob shadows, identical figures facing nowhere | stadium, crowd, shadows, different builds, heads on the ball | wrong |

## 3. What was changed

### Engine (`js/engine/sim.js`): changes real results, 2D included

- **Pace profile.** A small adjustment of position is walked; a longer one is a steady run; urgent work is
  a hard run; a flat-out sprint is kept for a run in behind, a loose ball, a break on the ball, or
  recovering near goal. After: standing 17%, walking 43%, jogging 25%, running 9%, sprinting 2%.
- **Ball bounce.** A dropping ball rebounds (0.55) and bounces lower each time before it rolls.
- Earlier in the same branch: players keep moving on the ball; keeper stance for crosses; body contact
  with weight; contact and foul marks.
- League check, 80 matches: goals 2.74, shots 26.2, on target 8.9, home wins 46%, draws 23%.

### 3D view (`match3d/viewer.js`)

- **Stadium:** mown, uneven grass with worn goal mouths; four raked stands full of people in both clubs'
  colours; advertising boards; goal nets; corner flags; sky.
- **Real shadows** from a low sun, falling back to simple ones by itself on a device that cannot keep up.
- **One mesh per player** instead of fifteen (kit and body coloured per vertex): 22 draw calls for the
  players instead of 330.
- **Different bodies:** height and build from the game's own player data; boot colours vary.
- **Heads on the ball:** neck and head turn to follow it, within what a neck can do.
- **Weight:** players lean into acceleration and bank into turns; no two players are in step.
- **Ball not glued:** a player running with it knocks it ahead and catches it up, short touches at a walk,
  long ones at a sprint.
- **Broadcast camera** from the halfway-line gantry as the default on a wide screen; a marker and name for
  the player on the ball.

## 4. Still short of real football

| Gap | Why it matters | Size |
|---|---|---|
| Jogging 25% against 17%, running 9% against 17% | Players still cruise where real ones stride out | engine, medium |
| Keepers cover about 2.5 km against 5.5 km | He stands on his spot when play is far away | engine, small |
| First touch has no error | Every pass is killed dead whatever its pace (FIFA 13's lesson) | engine, medium |
| Tackles are dice rolls | Who wins the ball is not decided by the bodies | engine, large |
| Animations are hand-keyed, not motion capture | Joints move correctly but without the small irregularities of a person | art, large |
| Feet slide during kicks and receives | The engine owns positions; clips are played in place | view, medium |
| No chest, thigh or head control of a ball in the air | Every receive is with the foot | art + view, medium |
| No shirt numbers or names on kits | Players are told apart only by build and boots | art, small |
| Engine samples twice a second | Sharp cuts are rounded off by the curve between samples | engine, large |
