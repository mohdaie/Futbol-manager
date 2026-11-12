# Handover: 3D match, player model, animations, engine realism

Branch `claude/football-manager-repo-connect-e1r6nf` (no pull request yet). Last updated 12 November 2026.

## Where things are

| What | Where |
|---|---|
| Live 3D replay (private artifact) | https://claude.ai/artifact/3nbJ4BTM8UtaRMyBBwAbGy |
| 3D viewer | `match3d/index.html`, `match3d/viewer.js` (three.js 0.170.0 in `match3d/vendor/`) |
| Player and ball models | `match3d/assets/player.glb`, `match3d/assets/ball.glb` |
| Blender build scripts (source of the models) | `scripts/blender/build_player.py`, `scripts/blender/build_ball.py` |
| Recorded match | `match3d/data/match.json` + `match.bin`; record a new one with `node scripts/record-match-3d.cjs` |
| Publishing the artifact | `match3d/publish/README.md` and `page.html` |
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
  `match3d.setCam(n)` (0 behind, 1 TV, 2 close, 3 full pitch), `match3d.follow(side, slot)`. WebGL in headless
  Chromium needs `--use-gl=angle --use-angle=swiftshader --enable-unsafe-swiftshader`.

## Player model

15 separately named parts with one flat material each (head, hair, eyes, pupils, eyebrows, mouth, neck, arms, hands,
legs, shirt, shorts, socks, boots, boot_soles), 4,250 triangles, 1.80 m, origin at the feet, 17-bone rig.
The viewer merges the parts into one mesh per player and colours them per vertex.

26 clips at 60 fps: Idle, Walk, WalkBack, SideStep, Jog, Run (sprint), Jockey, Dribble, WalkDribble, FirstTouch,
ReceiveInside, ReceiveTurn, ReceiveSole, ReceiveRun, Pass, Shoot, LongKick, Header, Tackle, Shoulder, Stumble,
Fall, ThrowIn, KeeperDive, KeeperCatch, Celebrate. All right-footed; the viewer mirrors for the left.
Clips are hand-keyed from named values (pelvis, boot targets solved by two-bone IK, torso and arm angles) in
`build_player.py`; there is no motion capture.

## What the owner asked for, in their words, and how they work

- Realism judged by eye against real football. They send phone recordings (TikTok) as references; frames are pulled
  with ffmpeg into a contact sheet and studied before animating. **For the goalkeeper they said: take reference from
  YouTube.** Video download was not tried this session; if it is blocked, use written coaching sources and say so.
- They want to see a short video after each stage, not only at the end.
- "If usage hits the limit, hold and continue when it is available again."
- They asked to be told the plan before work starts on the keeper and animation.

## Agreed next work (plan given to the owner; they asked for a new session before starting)

**Keeper behaviour (engine, changes results):** move across the goal with the ball and up to the box edge when play
is far away (now about 2.5 km a match, real about 5.5 km); set his feet just before a shot; decide to claim or stay
for crosses; hold, get up and distribute (throw or kick, by tactic) after a save.

**Keeper animations:** ready stance, side shuffle, low / mid / high dive and standing catch (now one dive for
everything), parry and get up, smother at feet, punch, overarm throw, roll out, goal kick, kick from hands.

**All-player animation:** blend walk / jog / run by speed; plant the standing foot during kicks and receives (feet
slide now); upper body separate from legs; sharp cut and turn on the spot; chest, thigh and head control; idle
variety; rework walk, jog and the fall (the fall sinks the trailing feet up to 17 cm).

Order: keeper behaviour, keeper animations, all-player animation, with the 80-match check and tests after each engine
change and a video to the owner after each stage.

## Known gaps (also in the study)

Jogging 25% of time (real about 17%), running 9% (about 17%); first touch never fails; tackles are dice rolls;
no shirt numbers; the engine samples positions twice a second; every lost duel plays a stumble (too many).

## Engine numbers now (80 matches, world 1)

Goals 2.74, shots 26.2, on target 8.9, passes 483 per team, home wins 46%, draws 23%, 0-0 9%.
