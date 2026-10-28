# Match engine feature film (draft)

37 s, 1920x1080 HyperFrames film in the same style as `promo/transfers`: a floating phone playing real match footage, giant words behind it, callouts, and three data panels.

- `assets/` real captures: 17 s of a live match (`live-match.mp4`), the Formation (with and without the ball), Line up and Match stats tabs, Admin Engine and AI Brain screens.
- `build.py` generates `index.html`. Edit the tables at the top (`SCORE`, `C`, `heads`), run `python3 build.py`, then `npx hyperframes render -o futbol-manager-match-engine-draft.mp4`.
- No audio track yet.

## Where the numbers come from

| Panel | Source |
|---|---|
| Scorecard | `SEED=1 node scripts/realism/league.cjs "$(sed 's/N_/120/' scripts/realism/scorecard.js)"` on the code at the time of capture (27 Oct 2026). Bands are the targets in `scripts/realism/README.md`. |
| Home-side bug | `docs/analysis/2026-10-22-round-4/REPORT.md` (symmetry test, home bonus off). |
| AI Brain | Admin > AI Brain after a 100-match training camp and "Test draft vs built-in rules" (200 matches, sides swapped). |

## Before a final render

The scorecard shows the engine currently **below** real football on goals (1.83 vs about 2.8), shots, fouls and home wins, and in range on passes, yellows and duels. The release note for 2026.10.25.1 says the same. The draft shows this honestly. Recalibrate and re-run the scorecard, update `SCORE`, and re-render before using the film to claim the engine matches real football.
