# Tactical shouts

Live match → **Shouts** → *Tactical shouts*. Five temporary changes of approach, separate from the motivational
shouts (both can be active). Data: `TACTICAL_SHOUTS` (`js/core/data.js`); engine: `tacticalShout()`,
`reviewTacticalShout()`, `aiTacticalShout()` (`js/engine/match.js`) and `S.tsh` reads in `js/engine/sim.js`.

| Shout | Instructions for the spell | In the engine | Staff measure (per minute) |
|---|---|---|---|
| Shoot on sight | Mentality +1 | Shot willingness ×1.5 and +0.01 value; long shots no longer talked out of | chances for − ½ chances against |
| Get it wide and cross | Width wide | Wider crossing zone, cross value ×1.6 (+0.008), passes out to the flanks favoured, wide players carry to the byline | chances for + crosses − ½ chances against |
| Drop deeper | Line, press, mentality −1 | (instructions only) | ⅓ chances for − chances against |
| Push up | Line and press +1 | (instructions only) | chances for − chances against + balls won in their half |
| Keep the ball | Patient tempo, short passing, mentality −1 (not below Cautious) | (instructions only) | ½ chances for − chances against + possession |

"Chances" = xG plus 0.004 for each dangerous attack (ball received in the final 30%, at most one per 8 s), so a
10-minute window is not judged on two or three shots alone.

## Keep or revert

At the start the side's rate so far (since kick-off, leaning towards a typical match for its first 15 minutes) is
the baseline for that shout's measure. After 10 minutes the last spell is compared with it:

- clearly better (> +0.002 per minute): it stays and is checked again every 10 minutes;
- clearly worse (< −0.004 per minute): back to the main tactic;
- in between: 5 more minutes once, then the sign decides.

Commentary reports the verdict with the spell's xG for and against. **Keep it** skips the review; **Back to main
tactic** ends it. Only instructions that still hold the shout's value are restored, so a change made by the
manager (or a computer manager's review) during the spell is kept. A new tactical shout replaces the active one.

Computer managers use them from minute 30 (a check every 5 minutes): protect a lead from minute 70 (Drop deeper,
or Keep the ball for a patient side), chase a game from minute 60 (wide or shoot; Push up or shoot after 78),
look for chances when level and behind on xG after 55, drop deeper when outplayed by 0.8 xG.

## Measured

`node scripts/tactical-shouts-audit.cjs 10 out.json [shouts]` (`MODE=kept|auto`): the same 10 seeded Premier
League matches with the home side giving the shout at minute 30; minute 30 to full time, per match.

| | No shout | Shoot | Wide | Deeper | Push up | Keep ball |
|---|---:|---:|---:|---:|---:|---:|
| Shots for | 6.9 | **8.5** | 6.7 | 5.7 | 8.8 | 4.1 |
| Shots against | 10.2 | 9.6 | 8.8 | **9.2** | 7.9 | **7.4** |
| Crosses | 9.9 | 8.7 | **11.4** | 6.3 | 9.8 | 8.7 |
| Possession | 48% | 50% | 50% | 43% | 51% | **51%** |
| Balls won in their half | 23.4 | 20.1 | 23.8 | 17.1 | **30.2** | 22.4 |

(Shout kept to full time.) With the automatic review, each shout was kept at about 60-70% of reviews and reverted
at 20-25%. Ten matches carry about ±0.3 xG of noise per side; the shot, cross and regain counts are steadier.
The wide shout's effect is modest because a cross still needs runners in the box.

Browser checks: `tests/tactical-shouts.cjs`.
