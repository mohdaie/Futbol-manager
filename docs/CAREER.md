# Manager career: jobs, time between clubs, retirement and holidays

Code: `js/systems/career.js` (rules), `js/ui/screens-career.js` (screens and sheets), hooks in `season.js`,
`managers.js`, `match.js`, `calendar.js`, `dayrun.js` and `ui.js`. Browser checks: `tests/career.cjs`.

State: `G.career = { status: 'employed' | 'unemployed' | 'retired', apps, offers, holiday, since, from, reason,
lastHoliday, summary }`. Older saves get it on first render; a save left on the old "Sacked" screen becomes time
between clubs with its job offers.

## Jobs

- **Vacancies**: the end-of-season vacancies as before, plus mid-season sackings at computer clubs five or more
  places below their target (3% a week per league while none is open, weeks 8 to 6 before the end).
- **Applying** (manager profile, or the between-clubs screen): choose an interview pitch (Win now / Build for the
  future / Attractive football). The board's priority is shown: results at big clubs (reputation 80+ or a top-six
  target), a plan at smaller and second-tier clubs, football in between.
  Chance = logistic((your reputation − club reputation + 4) / 3), +12 points for the board's pitch (−5 otherwise),
  +3 per honour (max 15), ± your current board's confidence, −10 points per half-year out of work; 2-92%.
  The answer comes 4-10 days later. Applying while employed: 35% chance your board hears of it (−8 confidence).
- **Offers** last 10 days: from an application, an approach (a club with a vacancy that fits your reputation;
  employed, only a step up and only with board confidence 55+), or after a sacking (up to three clubs).
  Accepting moves you there with the offered salary and contract.

## Between clubs

Sacked or resigned (−1 reputation): the club appoints an interim manager at once and advertises the job; your
open transfer talks end and salary stops. `G.club` keeps naming the last club because the game's helpers need one,
but `jobless()` turns off everything that makes it yours: your fixtures, the user side in matches, post-match
board and morale effects, the manager attachment and contract renewals at rollover. The leagues carry on with
Continue; at the end of a season there are prizes, promotion and relegation but no review or board verdict.
Only screens that make sense without a club stay open (news, tables, fixtures, stats, clubs, manager profile,
settings). Reputation fades by 0.05 a week after eight weeks out.

Limit: during a spell out of work the old club does not make computer transfers (the transfer AI still skips
`G.club`); its squad and finances otherwise carry on.

## Retirement

From the manager profile or between clubs, with a confirmation. The career summary (score, seasons, clubs,
trophies, honours, earnings) replaces the game; the save is kept but cannot manage again. Score = 10 a season +
120 a trophy + 25 an honour + 2 × reputation.

## Holidays

Manager profile → Go on holiday: until after the next match, 1/2/4 weeks, or the end of the season, and a rule
for bids (reject all, or accept at market value). Continue runs the days without stopping for news; your matches
are played by instant result with the assistant's team, press conferences are handled. Bids follow the rule
(an accepted sale is completed); any other transfer decision calls you back early. On return: a report with
results, league position and board confidence before and after, the director's decisions and the headlines.
"Come back now" on the home screen ends it early. A holiday cannot start while a non-bid decision is open.
