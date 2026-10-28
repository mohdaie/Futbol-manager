# Match Engine hero film (4:3, 1440x1080, about 37 s)

A cinematic feature film: a floating phone that flies, zooms and spins through one match.
Story: they score first, you switch tactics and subs, you equalise, they get a man sent off, you shout "Demand more", then you make your move.

- `assets/clip-*.mp4`: real footage cut from recorded matches of one fixture (Tigers v Red Devils, seeded world 41). The concession, tactics, subs and equaliser clips come from one match; the red card (C. Anguissa, 57') and shout clips are other real plays of the same fixture. The sequence is assembled; every shot is real engine output and real UI.
- `assets/title-hero.png`, `a02-results.png`, `b01_final_after.png`: real UI stills.
- `build.py` generates `index.html` from the clips (reads their lengths); `events.json` holds the moment inside each clip (goal overlay, card, shout tap).
- Render: `npx hyperframes render -o futbol-manager-match-engine-hero.mp4`
- No audio yet.
