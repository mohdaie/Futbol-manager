# 3D match viewer

Replays one full match from the match engine in 3D, using the low-poly player (49 animation clips) and ball.
How the animation is mixed (gait blending, planted feet, the keeper) is described in `docs/realism/HANDOVER.md`.

- Open `match3d/index.html` from any static web server (it loads files with `fetch`, so `file://` will not work).
- `data/match.json` + `data/match.bin` are one recorded match. Record a new one with
  `node scripts/record-match-3d.cjs` (needs Playwright). It plays the user's next fixture in the real engine
  and stores the ball and 22 players every half second, plus every engine mark (kick, touch, duel, shot, goal, restart).
- `viewer.js` turns that into the 3D scene: positions and facings are interpolated between frames, each player's
  looping clip (Idle, Walk, Jog, Run, WalkBack, SideStep, Jockey, WalkDribble, Dribble) follows his speed and the direction he moves against where he faces, and one-off clips (Pass, Shoot, LongKick,
  Header, Tackle, ThrowIn, KeeperDive, KeeperCatch, Celebrate, and four ways of receiving the ball) are started early so the moment of
  ball contact lands on the engine's mark.
- `assets/player.glb` and `assets/ball.glb` are built by `scripts/blender/build_player.py` and
  `scripts/blender/build_ball.py` (Blender 5.x Python: `pip install bpy`, then
  `python build_player.py --export player.glb`). The player has 15 separately named parts with one flat
  material each, so kits are recoloured in code.
- `vendor/` is three.js 0.170.0 (MIT, see `vendor/LICENSE-three`).

Not yet wired into the live match screen: the game still shows the 2D view.
