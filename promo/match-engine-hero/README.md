# Match Engine hero film (4:3, 1440x1080, about 36 s)

A cinematic feature film: a floating phone that flies, zooms and spins through one match.
Story, in match order: they score first (27') -> you switch tactics and sub -> you equalise (31', 1-1) -> they are sent off (57', 1-1) -> you shout "Demand more" (58', 1-1) -> the team pushes on -> exit card.

- `assets/clip-*.mp4`: real footage cut from recorded matches of one fixture (Tigers v Red Devils, seeded world 41, recorded at 2x). Concession, tactics, subs and equaliser come from one match. The red card (57') and the shout (58') come from two other real plays of the same fixture, both level at 1-1, so the minute and the score run on without a jump. The sequence is assembled; every shot is real engine output and real UI.
- `assets/title-hero.png`: the game's title screen (opening and closing screen).
- `build.py` generates `index.html` from the clips (reads their lengths); `events.json` holds the moment inside each clip (goal overlay, card, shout sheet and tap).
- Render: `npx hyperframes render -o futbol-manager-match-engine-hero.mp4`
- No audio yet.
