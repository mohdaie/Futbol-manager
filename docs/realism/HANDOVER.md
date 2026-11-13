# Handover: 3D match, player model, animations, engine realism

Branch `claude/football-manager-repo-connect-e1r6nf` (no pull request yet). Last updated 13 November 2026.

## Where things are

| What | Where |
|---|---|
| Live 3D replay (private artifact) | https://claude.ai/artifact/3nbJ4BTM8UtaRMyBBwAbGy |
| 3D viewer | `match3d/index.html`, `match3d/viewer.js` (three.js 0.170.0 in `match3d/vendor/`) |
| 3D on match day | `js/engine/live3d.js` (the 3D tab of the live match screen), test `tests/live-3d.cjs` |
| Player and ball models | `match3d/assets/player.glb`, `match3d/assets/ball.glb` |
| Blender build scripts (source of the models) | `scripts/blender/build_player.py`, `scripts/blender/build_ball.py` |
| Motion capture | `scripts/blender/mocap_retarget.py` (fits CMU recordings to the rig) writes `scripts/blender/mocap.json`, which `build_player.py` uses |
| Recorded match | `match3d/data/match.json` + `match.bin`; record a new one with `node scripts/record-match-3d.cjs` |
| Publishing the artifact | `match3d/publish/README.md` and `page.html` (the artifact still shows the match recorded on 12 November: republish to update it) |
| Video of the replay | `node scripts/match3d-video.cjs out.mp4 '<segments JSON>'` (captioned segments, any camera) |
| Keeper scorecard | `SEED=1 node scripts/realism/league.cjs "$(sed 's/N_/30/' scripts/realism/keeper.js)"` |
| Facts, comparison, what is left | `docs/realism/3D_MATCH_STUDY.md` (read this first) |
| Engine | `js/engine/sim.js` |

## How to build and check

- Blender as a Python module: `pip install bpy` (5.3.0 used), then
  `python3 scripts/blender/build_player.py --export match3d/assets/player.glb`.
  `--anim Name,outdir,angle,cx,scale,w,h,step` renders preview frames of one clip; `--render front.png` renders the rest pose.
- Headless browser in the cloud container: `export CHROMIUM_PATH=/opt/pw-browsers/chromium NODE_PATH=/opt/node-tools/node_modules`.
- Engine statistics, 80 matches, fixed world (compare against a `git worktree` of the previous commit with `ROOT=`):
  `SEED=1 node scripts/realism/league.cjs "$(sed 's/N_/80/' scripts/realism/scorecard.js)"`
- Engine tests run after every engine change (all pass now): `football-motion intent defending transitions shape
  attacking-decisions attacking-support shot-accuracy tactical-shouts engine-qa live live-animation match-evidence gap`
  (`node tests/<name>.cjs`).
- Viewer: open `match3d/?manual=1` and drive it from the page with `match3d.seek(t)`, `match3d.step(dt)`,
  `match3d.setCam(n)` (0 behind, 1 TV, 2 close, 3 full pitch), `match3d.follow(side, slot)` (close on one player),
  `match3d.follow(side, 0, true)` (behind the goal, over the keeper), `match3d.cuesOf('Cut')` (when a clip is played). WebGL in headless
  Chromium needs `--use-gl=angle --use-angle=swiftshader --enable-unsafe-swiftshader`.

## Player model

15 separately named parts with one flat material each (head, hair, eyes, pupils, eyebrows, mouth, neck, arms, hands,
legs, shirt, shorts, socks, boots, boot_soles), 4,250 triangles, 1.80 m, origin at the feet, 17-bone rig.
The viewer merges the parts into one mesh per player and colours them per vertex.

49 clips at 60 fps, all hand-keyed from named values (pelvis, boot targets solved by two-bone IK, torso and arm
angles) in `build_player.py`; there is no motion capture. Right-footed and to the keeper's left; the viewer mirrors.

- Movement: Idle, IdleShift, IdleLook, IdleBounce, Walk, WalkBack, SideStep, Jog, Run, Jockey, Dribble, WalkDribble,
  Cut, Turn.
- Ball: FirstTouch, ReceiveInside, ReceiveTurn, ReceiveSole, ReceiveRun, ReceiveChest, ReceiveThigh, ReceiveHead,
  Pass, Shoot, LongKick, Header, ThrowIn.
- Contact: Tackle, Shoulder, Stumble, Fall, Celebrate. Arm gestures (upper body only): Call, Point.
- Keeper: KeeperReady, KeeperShuffle, KeeperDiveLow, KeeperDive (body height), KeeperDiveHigh, KeeperScoop (standing
  catch), KeeperCatch (high catch), KeeperPunch, KeeperSmother, KeeperGetUp, KeeperHold, KeeperHoldWalk, KeeperThrow,
  KeeperRoll, KeeperPunt.

`body_pose()` lifts a boot that would go below the turf, so no clip sinks more than about 4 cm (the fall used to
sink 17 cm).

## Motion capture (added 13 November)

Walk, Jog, Stride (a steady run) and Shoot are motion capture from the Carnegie Mellon University Graphics Lab
Motion Capture Database (mocap.cs.cmu.edu; its data "may be copied, modified, or redistributed without permission").
Takes used: 35_01 walk, 35_17 jog, 16_45 run, 10_01 football kick. `mocap_retarget.py` documents the fitting; to add
a clip, download the subject's `.asf` and the take's `.amc`, add a line to `TAKES`, run it, rebuild the model.
The library has no flat-out sprint, so the hand-keyed Run stays for top speed; everything else is still hand-keyed.
Good candidates not yet used: 127_05 run to quick stop, 127_15/16 run and turn, 09_12 walking backwards and sideways,
16_17 to 16_20 walking 90-degree turns.

## Movement between engine frames, and tried-and-reverted engine stepping

The viewer draws a shape-preserving curve through the engine's half-second positions (no sliding past a stop; a
cut is a plant and a drive) and takes the speed for the gait from the same curve. Each player has his own stride,
arm carriage, lean and sway (`vary()` in the viewer, from his name).

Moving players in 0.1 s steps inside the engine was tried on 13 November and reverted: acceleration that builds
over a tick instead of being taken at its start hurt defenders reacting more than attackers running (goals 3.2 to
3.7 a match against 2.65, attempts to round the keeper tripled) and the engine ran about 3.5 times slower. It would
need defending rebalanced and the per-step work cached; it is a project of its own.

## How the viewer animates (`match3d/viewer.js`)

- Every clip is split into a legs half and an upper-body half; each half has target weights and eases to them
  (`play`, `playUpper`, `loop`, `mix`). Gait clips share one stride phase per player.
- Forward movement is a blend of Walk, Jog, Stride and Run by speed (`gaitOf`), not a switch at a threshold.
- A player striking or controlling the ball keeps his position planted until just after contact, then catches up
  with the engine (`p.plant`, `p.ox/p.oz`). The same offset carries a keeper's dive and a goal-kick run-up.
- Keeper: the dive is chosen by the ball's height and whether the engine says he dived, and scaled so his hands
  reach the ball (`ROOTED`); between the engine's `hands` mark and his next kick the ball is in his hands.
- Cuts and turns on the spot are read from the recorded path; balls arriving in the air are taken on the chest,
  thigh or head.

## Match day in 3D (`js/engine/live3d.js`)

- The live match screen has a 3D tab next to 2D (`MATCH_VIEWS` in `js/ui/live-panels.js`). 2D is the default.
- Nothing 3D is fetched until the tab is opened; then `match3d/viewer.js` is imported (the import map for three.js
  is in `index.html`) and `createLive()` returns an empty viewer for the two teams.
- `live3dFeed()` pushes each minute's frames, marks and line-up as `liveStep()` produces them; `live3dFrame()` tells
  the viewer which second to show (`q.t0 + q.p`), so highlights, speed and pause are live.js's own. In 3D the lowest
  speed is real time (half the 2D rate).
- The viewer's canvas is kept across redraws of the screen and moved into the new panel. A device without WebGL, or
  a failed load, gets a toast and the 2D tab.
- Known limits: an action in the first half second of a minute can start its swing late (the viewer only learns of
  it when the minute arrives); tapping a player in 3D does not open his card (it does in 2D).
- Kits carry the surname and number on the back and the number on the chest (`print()` and `number()` in the viewer).

## Keeper in the engine (`js/engine/sim.js`)

- `targets()`: depth by the ball's distance (1.5 m inside 30 m, out to 17 m for a standard line at 72 m), sideways
  with the ball. `keeperSet()`: plants his feet as the man on the ball shapes to act within 30 m.
- `shoot()`: set 0.95, moving up to 1.16, stranded under a missed cross 1.35, on the ground 1.45 (multipliers on the
  goal chance). A dive (`fl.dive`) leaves him down for 1.5 s.
- `readKeeperCross()` / `keeperClaim()`: one decision per cross, then catch, punch or miss.
- `keeperHolds()` / `keeperDistribute()`: ball in his hands (no challenge), release within 7.5 s by roll, throw or
  kick from the hands according to the side's passing style.
- New marks for the viewer: `save` (hold, tip, parry, smother), `claim` (catch, punch, miss, short), `come`, `hands`,
  and on `sfx`: `set`, `rebound`, `dive`; a kick's `style` can be roll, throw, punt or punch, and `rs` names a restart.

## What the owner asked for, in their words, and how they work

- Realism judged by eye against real football. They send phone recordings (TikTok) as references; frames are pulled
  with ffmpeg into a contact sheet and studied before animating. **For the goalkeeper they said: take reference from
  YouTube.** On 13 November YouTube refused video downloads from the cloud container (bot check); the transcripts of
  three coaching videos did download and the keeper clips were built from those. The owner was told. If they send
  footage, check the clips against it.
- They want to see a short video after each stage, not only at the end.
- "If usage hits the limit, hold and continue when it is available again."
- They asked to be told the plan before work starts on the keeper and animation.

## Done on 13 November (the plan agreed on 12 November)

All three stages, in order, with a video sent to the owner after each:

1. **Keeper behaviour (engine).** Moves with play (2.2 km a match before, 4.7 km now; real about 5.5), sets for
   shots, decides on crosses (1.2 to 1.6 caught and 0.6 to 0.8 punched per keeper per match, over samples of 20 to 30 matches), holds, gets up and distributes.
2. **Keeper animations.** 13 clips and the viewer logic above.
3. **All-player animation.** Gait blending, planted feet, split upper and lower body, cut, turn, chest/thigh/head
   control, idle variety and gestures, reworked walk, jog and fall.

Not done or only partly done, honestly:

- Keeper clips were made from transcripts, not from watching footage. They have not been compared with video.
- Walk and jog were reworked from general gait knowledge (pelvis sway and roll, narrower step, arm carriage); the
  owner has not yet said what looked wrong in the old ones.
- The live artifact has not been republished with the new match and model.
- 3D on match day has been run in headless Chromium with software rendering only, not yet on a real phone.
- Head control is rare by design; the engine lets most high balls bounce before they are controlled.

## Known gaps (also in the study)

Jogging 25% of time (real about 17%), running 9% (about 17%); first touch never fails; tackles are dice rolls;
the engine samples positions twice a second; every lost duel plays a stumble (too many);
keepers do not sweep up balls over the top; shots are a little high (about 26.5 a match against about 25).

## Engine numbers now (3 x 80 matches, worlds 1 to 3)

Goals 2.65, shots 26.5, on target 9.2, passes 477 per team. Before the keeper work, same worlds: goals 2.46,
shots 25.8, on target 8.8. Runs are not exactly repeatable even with a seed (about +/-0.1 goals between two runs of
the same 80 matches), so compare on several worlds. All 14 engine tests pass.
