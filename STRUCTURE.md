# Futbol Manager: game structure

A browser football manager built for a phone held in portrait. Plain HTML, CSS and JavaScript with no build step and no libraries. To play it, open `index.html` from any static web server, or use the published artifact.

## 1. File map

```
index.html                 page shell; loads the CSS and every script in order
css/game.css               all styling (design tokens are at the top)
js/core/util.js            random numbers, maths, money/date formatting
js/core/data.js            STATIC DATA: clubs, nations, names, attributes, formations,
                           roles, instructions, training, press questions, talks, shouts
js/core/rosters.js         ROSTERS: the real-based squads (level, name, position, age,
                           nation, foot, contract, legacy value, inspirational figure)
js/core/england-rosters.js 2026/27 English player identity rows and source IDs
js/core/england-name-overrides.js culturally grounded Premier League display names
js/core/profiles.js        original fixed first-team attributes, physique, potential and positions
js/core/players.js         player generation, ratings, position fit, value, wages
js/core/bio.js             personal details (height, weight, character, ambition, favourite
                           person and manager), club managers, and how they affect the game
js/core/state.js           the game state object G, new-game world build, save/load,
                           news, auto-pick, squad helpers
js/core/playtime.js        per-career active time, session counts and background pause
js/core/calendar.js        weeks and dates, fixture generator, transfer windows, league table
js/engine/pitch.js         tactical styles, role behaviour, player instructions, positions() and the offside line
js/engine/sim.js           match engine v3: positional simulation, 22 players + ball every half second
js/engine/match.js         match setup, team summary units, subs, AI manager, results
js/engine/live.js          2D canvas match: replays ev.seq (key moments), commentary, team talks, shouts
js/systems/training.js     weekly training, development and decline, injuries, recovery
js/systems/finance.js      weekly income and costs, moving money between budgets
js/systems/scouting.js     knowledge and fog of war, scout assignments, reports
js/systems/transfers.js    bids, contracts, sales, releases, AI market, agent pitches
js/systems/ai.js           Jev and DeepSeek clients: settings, calls, budget guard, usage and cost tracking
js/systems/brain.js        learning engine for computer managers, engine versions, DeepSeek press library
js/systems/brain-cloud.js  private incremental cloud uploads, legacy import, offline queue and retry checkpoints
js/systems/season.js       weekly turn, monthly awards, youth intake, board, season end
js/systems/lab.js          Admin "Run test season": league averages against targets, results by style and by tactic fit
js/ui/crests.js            shared club artwork renderer and generated shield fallback
js/ui/ui.js                router, app shell, bottom sheets, toasts, click dispatch
js/ui/links.js             shared player/club links, related news actions, club directory and opposition dashboards
js/ui/dayrun.js            Continue: the calendar moves day by day and stops on matchday or important news
js/ui/navigation.js        browser/in-game Back history, view restoration, root guard
js/ui/screens-hub.js       Dashboard, News, My Team, Facilities, More, Game Status,
                           Fixtures, Table, Stats, Club, Settings
js/ui/screens-squad.js     Squad (first team / reserves / U18s), player profile, Tactics, Training, Medical, Youth
js/ui/screens-market.js    Transfers (search, shortlist, scouting, pitches, bids, history),
                           offers, contracts, Finances, Staff, Board
js/ui/screens-match.js     Title menu, career setup, Pre-match, Live match, Match report, Season review, Sacked
js/ui/screens-admin.js     Admin page: edit clubs and players, move time, tune the engine, maintenance
```

The scripts are classic `<script>` tags that share one global scope, so the load order in `index.html` matters. Core comes first, then engine, systems and UI.

**Title menu.** Every launch opens the stadium artwork with Start Game and Options. Start Game resumes the loaded career, or opens manager/club setup when there is no save. Options sets match speed (also remembered for a new career) and links to game settings for existing careers. The title screen remains the root Back destination.

**Main tabs.** Dashboard, News, My Team, Transfers, Facilities and More use two rows of three buttons. My Team groups Squad, Tactics, Fixtures, Training, Staff, Medical Center, Youth Academy, Stats and League Table. Facilities groups Finance, Board & Fans and Club. More contains Settings, Admin (when allowed) and Game Status. Child screens highlight their parent tab while Back retraces the actual visit order.

**Game Status.** Shows the career, season results, club finances/squad/facilities, world/save details and `GAME_VERSION` from `data.js`. `G.playtime` persists visible in-game time and session counts; title/setup and background time are excluded. A 15-second checkpoint and visibility/page-exit saves preserve time. Existing careers begin tracking on this update, without inventing older playtime. The playful addiction label uses recorded time only; browser view history never restores the clock.

**AI Brain cloud data.** Brain learning stays local for offline play and syncs to musab-agents through the write-only `futbol-brain` function. Details last 30 days; compact totals and engine/press/settings snapshots are retained. Existing drafts import once as legacy totals without recounting recent logs. AI Brain shows sync status and a manual retry. No cloud engine is automatically activated. See `supabase/functions/futbol-brain/README.md` for access, bounded batches, retention, analysis and production migration; `supabase/analysis/brain.sql` contains the analysis queries.

## 2. The game loop

One turn is one week, but every fixture has a real day and kick-off time. Pressing **Continue** moves the game on.

```
Continue
 ├─ an unplayed match of yours this week? (earliest first; midweek weeks have two)
 │     simUpTo() plays every game that kicks off earlier → Pre-match (conditions, press, line-up)
 │     Kick off (live 2D) or Instant result → finishRound() plays the games at the same time
 └─ otherwise advanceWeek():
       sim the rest of this week's fixtures
       weeklyTraining   development, familiarity, training injuries, recovery to the end of the week
       weeklyMedical, weeklyFinance, weeklyScouting, weeklyTransfers, weeklyContracts
       monthly awards, youth intake (March), board check
       week++ (day = Monday) → after the last week: seasonEnd() → review → rollover()
```

**The season calendar** (calendar.js, `SCHEDULE`):

| Item | Details |
|---|---|
| Pre-season | 5 weeks |
| League | 38 rounds from mid-August to late May |
| International breaks | 4 weeks: September, October, November, March |
| Cup weekends | 5 weekends with no league games (a hook for cup competitions later) |
| Midweek weeks | 6 weeks with a Tuesday/Wednesday round plus a weekend round |
| Weekend slots | Fri 20:00, Sat 12:30, Sat 15:00 ×4, Sat 17:30, Sun 14:00 ×2, Sun 16:30. Every slot except Saturday 15:00 is televised, and the biggest games take those slots. |
| Midweek slots | Tue/Wed 19:30–20:00; the 20:00 games are televised |
| Transfer windows | Summer: pre-season to 1 September, plus the off-season. January: 1 January to 2 February. |

**Rest, weather and kick-off effects:**

| Factor | Effect |
|---|---|
| **Rest days** | Players recover condition for each day since their last match (`recoverTo` in training.js). The rate is 3.4 a day for computer clubs; for you it depends on training intensity, recovery focus and physios. A full week brings a tired player back to about 90%. Two or three days leaves the team around 80%, so rotation matters. |
| **Injuries** | Teams that start a match tired get injured more often, and the most fatigued players are the likeliest to be hurt |
| **Weather** | Picked for each fixture from the month's climate (`CLIMATE`, `WEATHER` in data.js). Rain: harder finishing, more fouls and injuries. Wind: direct or wide play is less effective. Cold: faster fatigue, more injuries. Heat: much faster fatigue. Snow: fewer clear chances. |
| **Kick-off time** | 12:30 games create slightly fewer chances; games at 19:00 or later give a slightly bigger home advantage |
| **TV** | Televised games pay both clubs £0.6m extra |

The effects are kept small so the engine stays near real football: about 2.8 goals per game, around 41% home wins and 25% draws over full simulated seasons.

**Back navigation.** Browser Back (including Android gestures), the header Back button,
popup Back/scrim and Escape retrace pages, tabs and nested popups. The X button
dismisses the entire popup chain to its underlying page. History
keeps UI state, scroll positions and unsubmitted form text in memory; it never
restores `G` or replays game actions. At the first view, ordinary Back stays in
the game. Reloading, loading a different career, changing jobs or starting a
new season starts fresh view history. Returning to an unfinished match resumes
the existing simulation; a completed match opens its report.

`viewAction()` groups each click/change into one navigation step. `go()` and
`sheet()` also work outside event dispatch. Dynamic sheets supply a stable
`key`, a read-only `restore` renderer and, when needed, a `valid` check in their
options. Refreshing a sheet with the same key updates it without another step.
Use `data-a="back"` for Back controls; `closeSheet(true)` completes an action
and dismisses its sheet without replaying a previous action.

For the mobile browser regression checks, install Playwright as a development
tool (`npm install --no-save playwright` and `npx playwright install chromium`),
then run `node tests/navigation.cjs`. The test serves the repo locally and
uses a fresh browser profile, leaving your saved career untouched. An existing
static server URL can be passed as the first argument; `CHROMIUM_PATH` can point
to a preinstalled Chromium executable.

## 3. Game state (`G`)

Everything lives in one JSON-safe object, saved to `localStorage` after each week and each match.

| Key | What it holds |
|---|---|
| `club`, `manager`, `season`, `week` | who you are and when it is |
| `players{id}` | every player: attributes `at[26]`, `ca` (current rating), `pa` (potential), age, position plus alternates, contract, wage, morale, condition, sharpness, injury, ban, season and career stats |
| `clubs{id}` | 20 league clubs, 13 clubs abroad and a free-agent pool; squad IDs, balance, AI tactic, reputation |
| `fixtures[]` | 380 fixtures: round, week, teams, score, scorers, and for your games also stats and ratings |
| `tactics` | your in-possession shape, out-of-possession shape, XI, roles, bench, instructions, set-piece takers |
| `training` | weekly focus, intensity, tactical familiarity, individual focus per player |
| `fin`, `ledger`, `balHist` | transfer and wage budgets, season income and costs, weekly balance trend |
| `board` | board confidence, fan confidence, objective, facility levels |
| `staff`, `staffPool` | your staff and the people available to hire |
| `know{pid}` | scouting knowledge (0-100) per player; controls attribute ranges |
| `scout`, `shortlist`, `pitches` | assignments and reports, tracked players, agent offers |
| `news[]` | the news feed and inbox; items can carry actions (accept a bid, renew a contract) |
| `history`, `trophies` | past seasons and awards |

## 4. Systems in brief

**Player page.** The big number is the player's rating out of 100 (current ability at his main position), with a remark from Raw to World class. The stars and remark below it show potential. The hexagon sums up the attributes on six sides. Outfielders show Attacking, Technical, Speed, Physical, Defending and Mental. Keepers show Shot stopping, Handling, One on ones, Distribution, Positioning and Mental. Keepers only list GK as a position. Everything you can do with a player sits behind one **Actions** button, grouped by category: Motivate, Squad, Training and Contract for your players; Transfer and Scouting for others. To add an action, add an item to `PLAYER_ACTIONS` in screens-squad.js.

**Match engine v2** (`pitch.js`, `sim.js`, 2026.10.20.4).
- **Each minute:** the side with the ball (from midfield control, passing and tempo, plus home advantage) plays a chain of actions.
- **The actions:** pass, through ball, long ball, dribble, cross, shot. A safe "keep the ball" pass continues the move for patient sides.
- **Choosing:** the player on the ball weighs the options he has, using his Decisions, Vision and Flair, his role behaviour (`ROLE_B`), his player instructions and the team instructions.
- **Duels:** every action is decided between the players actually involved. The receiver or carrier faces the nearest defender, standing where `positions()` puts them. The table below shows the attributes each one uses.
- **Physical attributes** fall with condition. Experience adds composure and decisions, and weight adds strength.

| Action | Attacker | Defender |
|---|---|---|
| Pass | Passing, Vision, Composure under pressure, receiver's First Touch | Anticipation, Positioning, Marking; closeness; Mark tighter |
| Through ball | Passing, Vision, Teamwork, risky passing. Then a race: runner's Pace, First Touch, Off the Ball | Anticipation, Positioning. Race: defender's Pace, Anticipation, Agility, or a sweeper keeper's One on Ones and Pace |
| Long ball | Passing or Kicking, then the target's Heading + height, Strength and hold-up | Heading + height, Strength, Positioning |
| Dribble | Dribbling, Agility, Pace, Flair, First Touch, Strength (hold-up) | Tackling, Agility, Pace, Anticipation, Tackle harder |
| Cross | Crossing (weak foot −2), then the target's Heading + height, Strength, Off the Ball | Keeper may claim (Handling + height). Heading + height, Strength, Marking |
| Shot | Chance quality from distance and angle, pressure, weak foot, header or one-on-one. Then Finishing (or heading or free-kick skill) and Composure | Blocks (Positioning, Anticipation). Keeper rating, One on Ones, height |

- **Offside:** precise. The line is the deepest outfield defender (`offsideLine()`). The runner's position when the ball is played depends on his Off the Ball, Decisions and Anticipation against the back line's Teamwork and Anticipation and the line height. He is offside only if he is beyond the line. There is no VAR.
- **Transitions:**
  - "When the ball is lost: Counter-press" tries to win it straight back high up the pitch (Work Rate, pressing).
  - "When the ball is won: Counter" starts fast breaks; "Regroup" blunts them.
- **Fouls and cards:** tackles from lost dribbles and off-ball fouls (Temperamental, Tackle harder, low Anticipation). Card chance falls with captain leadership and the Calm shout.
- **Penalties:** fouls in the box on dribbles and at crosses.
- **Tactic fit** (`tacticFit()`, `FIT_AREAS` in pitch.js): every instruction asks something of the players.

| Area | Turned on by | Attributes it needs |
|---|---|---|
| Pressing | High press, or counter-press after losing the ball | Work Rate, Stamina, Pace, Teamwork, Anticipation |
| Short passing and possession | Short passing or patient tempo | Passing, First Touch, Composure, Decisions, Vision |
| Counter-attacking | Counter after winning the ball | Pace, Off the Ball, Finishing up front |
| Long balls and second balls | Direct passing | Heading, height, Strength up front; Work Rate in midfield |
| High defensive line | High line | Defenders' Pace, Anticipation, Teamwork; a sweeper keeper |
| Deep defensive line | Deep line | Positioning, Heading, Marking |
| Wide play and crossing | Wide attacking width | Crossing, Dribbling, Pace out wide; Heading in the box |

  - **How it's scored:** each area compares those attributes with the players' own general level, so it measures suitability rather than quality (quality already counts in every duel). It's shown as a % on the Tactics screen, and per player on Player instructions.
  - **Effects scale with fit and can turn negative:** counter-press regains, pressing's effect on the opponent's passing and its fatigue cost, possession and ball retention from short or patient play, how often counters and through balls succeed, the space behind a high line, and long-ball and second-ball success.
  - **No style has a built-in advantage.** A mismatched tactic costs more than it gains.
  - **Test** (same squad given different attribute profiles):
    - A pressing or physical squad gets the most points from gegenpressing, counter-attack or long ball.
    - A technical squad gets nothing from long ball (0.5 points per game against about 1.0).
    - A quick squad gets nothing from gegenpressing over Balanced.
- **Results follow squad strength.** League averages are only a sanity check. For example, against an even opponent the home side wins about 40%; when much stronger it wins 60–70% and outshoots the opponent by about 16 to 9.
- **Computer clubs choose their own tactic before every match** (`aiChooseTactic()`):
  - They try each style with their available XI and pick the one their players suit best (tactic fit).
  - The opponent nudges the choice a little: counter against a high line, long ball against a high press, tiki-taka against a low block.
  - Roles are picked from the players too (`roleFit()`, compared with typical players in that position, `posNorm()`).
- **Fit is measured against the position:** each player is compared with the league's typical player in his position, after allowing for his overall level, so fit is about suitability, not quality.
- **During a match:** team instructions, styles and player instructions can all be changed from the in-match Tactics sheet.
- **Tactical styles** (`STYLES`) are presets of the team instructions, shape and roles:
  - Gegenpressing
  - Tiki-taka
  - Balanced
  - Counter-attack
  - Long ball
- **Player instructions** (`PLAYER_INS`) are stored per position in `G.tactics.pi`:
  - Shooting, dribbling, passing risk, crossing
  - Forward runs, width
  - Pressing, tackling, marking
- **League-average sanity check** (380-match runs; individual matches depend on the two squads): about 2.6–3.0 goals, 25 shots, 3.4 yellow cards, 0.3 penalties, 3–4 offsides, 23 fouls and 9 corners per match. Pass completion is about 84%.
- **2D view:** shows key moments only, as in Football Manager. Each step of `ev.seq` is replayed: the ball travels the action's path, the players involved move to it, and everyone else stands at `positions()`. Quiet minutes pass quickly. The offside line is drawn. Speeds are 1x, 2x (default) and 4x.

**Captain, set pieces and keeper roles** (match.js). These details affect matches:
- **Captain:** his leadership (1–20) moves the whole team's strength by about ±3% while he is on the pitch, and a high-leadership captain cuts card risk. If he is off the pitch, the best leader on the pitch has half the effect.
- **Free-kick taker:** half of the free kicks that lead to a shot are direct shots by him. His skill is finishing, passing and half his vision. The other half are crosses he delivers for a header, and his crossing improves chance quality.
- **Corner taker:** a corner can lead to a header in the next minute (`cornerShot` in `TUNE_DEFAULTS`, 20%). His crossing improves chance quality, and he gets the assist.
- **Keeper roles:** the role's modifiers now count. A Sweeper Keeper loses about 2% of shot-stopping but takes 60% of the sting out of a fast opponent attacking a high line. A Ball-Playing Keeper adds to midfield control.
- **When the chosen player is off the pitch:** for any of these jobs, the best player on the pitch for that job takes over.
- **Computer clubs:** they always use their best player for each job.
- **Calibration:** after this change `shotBase` dropped to 0.275, which gives about 2.84 goals per game, 40% home wins and 24% draws.

**Personal details** (Personal tab, `bio.js`). Every player has these details, and each one changes the game:
| Detail | Effect |
|---|---|
| Height | Heading power in the air (`aerial()`): who attacks set pieces, set-piece finishing and defending. Taller keepers concede up to 4% fewer goals per shot (`gkReach()`). |
| Weight | Body mass index changes how fast he tires in matches (`fatigueMul()`, ±6–12%). |
| Nationality | A foreign player with no team-mates from his country slowly loses morale. With compatriots he settles. |
| Character | Development speed, contract demands, reaction to criticism, and card risk (Temperamental 1.5×, Professional and Model Citizen 0.8×). |
| Favourite person | Another player. If they are at the same club he is happier every week. He is more willing to join a club where they play, and asks for less. Moving his favourite person in or out changes his morale by 6. |
| Favourite manager | Playing for him makes him happier and he develops 8% faster. After a good season with regular games, your players may name you their favourite manager. Players who call you their favourite are easier and cheaper to sign. |
| Ambition (1–20) | Development speed (−9% to +10%) and wage demands. He also needs a bigger step up before he will join you. A very ambitious player at a club below his level slowly loses morale. |

Older saves get personal details and club managers when they load (`ensureWorld()`). For other clubs' players, character and ambition stay hidden until scout knowledge reaches 50%.

**Squads and levels.** Every player has a level: `A` first team, `R` reserves (under-21), `Y` U18s (`LEVELS` in data.js, `lvlOf()` in players.js). Only the first team is picked for league matches; reserves step in when fewer than 16 first-teamers are fit. First-team rosters use the 2026/27 English identity rows in `england-rosters.js`; Premier League display names use the culturally grounded overrides in `england-name-overrides.js`, keyed by stable source IDs so existing careers receive the same names. Each player keeps his age, nationality and position. Ratings come from market value (`ratingFromValue()`). Where a club's real youth list was short or not available, `fillLevel()` in state.js generates the rest of the reserves and U18s to 20 each. Positions are filled first, ages are 18 to 21 for reserves and 15 to 17 for U18s, and better clubs get higher potential. At each season end, U18s who turn 19 move to the reserves. Computer clubs promote or release reserves aged 23, promote their best reserves before signing free agents, and refill both youth levels. Signed players join the first team.

**Players.** Attributes use the classic 1-20 scale across technical, mental, physical and goalkeeping groups. There are 26 attributes. Anticipation, Off the Ball, Flair and Teamwork were added in 2026.10.20.3 and appended to the end of `ATTRS`, so older saves keep their order. `migrateAttrs()` fills them in from related attributes (Positioning and Decisions; Decisions, Pace and Finishing; Dribbling and Vision; Work Rate and Decisions) and keeps every rating unchanged. In matches: Off the Ball decides who gets on the end of chances and adds to attack; Flair adds to attack and assists; Anticipation and Teamwork add to defence and midfield; and low Anticipation means more late challenges. Each position weights the attributes differently (`WEIGHTS` in data.js) to produce a rating out of 100. Position fit ranges from natural (1.0) through alternate positions (0.97) to badly out of position (0.6, or 0.3 for an outfield player in goal).

**Match engine.** Each side gets attack, midfield and defence values plus a goalkeeper value. Attack and midfield come from the in-possession shape, defence from the out-of-possession shape. Every minute it rolls possession from midfield strength, then a shot from attack against defence, then fouls and injuries. Shots carry an xG value and convert based on finishing, composure and the keeper. Fatigue, morale, sharpness, roles, mentality, tempo, width, passing, pressing, line height, home advantage, red cards, shouts and team talks all feed in. It is calibrated to about 2.7 goals, 13 shots per team and 23% draws per game. The tuning numbers sit at the top of `shotChance()` and `shoot()`.

**Live 2D match.** The canvas pitch is portrait, with your team always attacking upward. Players move between their two shapes depending on who has the ball, and the block shifts with the ball. The engine only steps forward once the ball animation for the last minute has finished, so the pictures and the commentary stay in sync. Speeds are 1x, 2x and 4x, plus Skip.

**Scouting fog of war.** Players at other clubs show attribute ranges, and the ranges narrow as `know` rises. League players start at 45% known, players abroad at 10%. Assignments filter by region, position and age, and each report gets a grade from A to D relative to your current starter.

**Transfers.** The selling club accepts a bid at its asking price or above, makes a counter offer from 75% of it, and rejects anything lower. The player can refuse to talk if your club is too small. Personal terms depend on wage, contract length and the squad status you promise, and every deal is checked against the wage budget. Half of each sale fee goes back into your transfer budget.

**Finance.** Income comes from TV money per match, gate receipts at home, weekly sponsorship and merchandise, player sales and end-of-season prize money. Costs are wages, staff, running costs, scouting and transfer fees. Every £1k a week of wage budget converts to £100k of transfer budget.

**Board.** Confidence moves after every result relative to expectation, and again at season end against the objective. You are sacked when confidence falls below 10, or after finishing more than 5 places below target with confidence under 35. When sacked, you get job offers from smaller clubs.

## 5. Admin page

Open it from **More → Admin**. Every change applies to the current save immediately.

| Tab | What it does |
|---|---|
| Overview | Save statistics (season, week, player count, save size) and the manager's name |
| Clubs | Any club's nickname, city, stadium, capacity, colours, reputation, balance and computer tactic. For your club, also the budgets, board and fan confidence, and facility levels. You can switch which club you manage. |
| Players | Search every player. Edit names, position, nationality, age, potential, morale, condition, sharpness, wage, contract, personality and all 26 attributes. Move a player to another club, heal them, delete them, or create a new player for your club. |
| Time | Move forward 1, 4 or 10 weeks, or to the end of the season (your matches are played instantly), or play this week's match instantly |
| Engine | Sliders for the engine constants (`TUNE_DEFAULTS` in data.js, saved per game in `G.tune`). **Run test season** (`runTestSeason()` in lab.js) plays all 380 matches on a copy of the save and reports goals, home/draw/away, shots, shots on target, pass accuracy, fouls, cards, offsides, penalties, corners, crosses and long balls against their targets, then a table by style and one by tactic fit (points per match, "vs strength", possession, passing, long balls, crosses, shots, xG, offsides). |
| AI Brain | The learning engine: mode for real matches, training camp, what it has learned, engine versions (test, approve, roll back), the DeepSeek press question library, recent decisions. |
| Jev AI | Connection settings for TypeSafe Jev: on/off, direct key or proxy URL, model, timeout, monthly budget, which features it will drive, a **Test connection** button, this month's calls/tokens/cost and a call log. |
| DeepSeek | The same for DeepSeek, plus base URL, max reply length, temperature and thinking mode. |
| AI usage | Jev and DeepSeek calls, tokens and cost: this device's own count by month, and the cloud log kept by the relays (this month, all time, by feature for 30 days, by day for 14 days, and totals for every player). |
| Data | Squad fixes (heal injuries, clear bans, full condition, morale, sharpness, add academy players), money, reveal every player, add free agents, news clean-up, delete save |

**AI services:** settings are stored under their own browser key (`futbol-manager:ai`), never inside the game save, so an exported save never contains an API key. `jevAsk(state, questions)` and `dsChat(messages)` in `ai.js` are the two functions game features will call. Recommended picks: **jev-latest** ($0.042 per 1M input tokens, output free) and **deepseek-flash with thinking off** ($0.15-0.30 per 1M input, $0.60-1.20 per 1M output). A full season costs well under $1 for both together. DeepSeek accepts direct browser calls. Jev uses the Personal relay in the musab-agents development project to avoid direct browser connection failures. Each player supplies their own key; the relay forwards it to TypeSafe without saving it. The separate `futbol_manager_ai_requests` table stores only connection diagnostics. Relay code, schema migration and production move instructions are in `supabase/functions/futbol-jev/README.md`. Server key mode remains available for a server-managed shared key.

**Access control:** `adminAllowed()` at the top of `screens-admin.js` returns `true` for everyone. To restrict the page later, make it return `true` only after your own check. It hides both the More menu entry and the page. Because the game runs entirely in the browser, a check in this file only hides the page. Real protection needs a server login (for example Supabase Auth) and server-side saves.

## 6. AI Brain (learning engine)

Computer managers make a tactical decision at half-time and at 60, 70 and 80 minutes. They choose from ten options (`MGR_OPTIONS` in brain.js; see In-match manager decisions below). Learning runs on this device and compact research data syncs to the private cloud storage (brain-cloud.js).

1. **Record.** Every decision is logged with its situation, choice and source (Jev, DeepSeek, learned engine, rules or exploring). A situation is a bucket made of the minute, the score, relative strength, fatigue and red cards, giving 360 possible buckets.
2. **Judge.** At full time each decision gets a score: goal difference gained after it, plus 1.5 × points gained compared with the score at that moment.
3. **Learn.** The draft table stores, for each bucket and option, the count, total outcome and how often a teacher picked it. Option value = average outcome, shrunk toward zero when there is little data, plus a small bonus for teacher picks.
4. **Test.** A head-to-head plays the draft against the engine in use, each pairing twice with the sides swapped, and reports points per game.
5. **Release.** Approving saves the draft as a version, which also stores the Engine tab's tuning, and puts it in use. Rolling back is one tap.

**Mode availability:** Learned engine needs an approved version. Teacher needs Jev configured for Computer managers and can start without a version. Hybrid is available with Jev or an approved version, falling back to the rules when needed. DeepSeek second opinions run when Jev confidence is below the threshold; press questions are generated separately. DeepSeek now uses its own `futbol-deepseek` relay in musab-agents and shares the diagnostics table. Its key and feature switches remain under your control.

**Modes for real matches:**

| Mode | What happens |
|---|---|
| Rules | The original fixed rules |
| Learned | The approved version, which falls back to the rules in situations it hasn't seen enough |
| Hybrid | Asks the AI only when the approved version doesn't know the situation |
| Teacher | Asks the AI at every decision |

**When the AI is asked:** only in your live matches and in the training camp. It answers in the background and the match keeps playing. Background and instant results never wait for the AI.

**Teachers:** Jev chooses the option. If Jev's confidence is below the threshold (default 60%) and DeepSeek's second opinion is switched on, DeepSeek's choice is used instead, and disagreements are counted.

**Training camp:** plays simulated computer-vs-computer matches that never touch your career. With no teacher it explores random options at a set rate (default 30%), so learning works offline from outcomes alone.

**Press library:** DeepSeek writes press questions with three answers and their effects, clamped to −3 to +3. Once you approve them, they join the built-in questions and are used offline.

Brain data uses its own browser key (`futbol-manager:brain`) and is kept across careers. The decision log holds up to 2,000 entries, while the learned table keeps everything.

## 7. How the FM26 features map to this game

| Feature | Status |
|---|---|
| Separate in-possession and out-of-possession formations | Done: both shapes affect the engine, with a visualiser toggle on the tactics pitch |
| Player roles | Done: 3 to 5 per position, each with an attack, midfield or defence lean |
| Team instructions | Done: mentality, tempo, width, passing, pressing, defensive line |
| Tile and card interface | Done: home dashboard tiles, card lists, bottom sheets |
| Recruitment tools in the spirit of TransferRoom | Done: agent pitches aimed at your weakest position |
| Touchline shouts (returned in Update 4) | Done: 5 shouts, each lasting 10 minutes |
| Matchday presentation | Done: 2D pitch, score bug, possession bar, commentary, goal and card overlays |
| Scouting with fog of war | Done |
| Player search | Done: position, region, age, value, rating and name filters |
| Press conferences, team talks, player talks | Done |
| Board and fan confidence, board requests | Done: funds, training facilities, youth facilities |
| Staff hiring | Done: assistant, coaches, scouts, physios, analyst |
| Youth academy and intake | Done |
| Medical centre | Done |
| Monthly and season awards | Done |
| Women's football | Not done |

## 8. Roadmap: good next steps

1. **Cup competitions.** Add a domestic knockout cup and a European competition for the top-four clubs. Fixtures already carry a round and week, so add a `comp` field.
2. **Promotion and relegation.** Add a second division generated the same way as the top flight. The bottom three are already highlighted in the table.
3. **Loans.** Implemented in Transfers → Loans and player actions: a temporary registration with a fixed return date, loan fee, wage sharing, parent-club recall, purchase option or appearance-triggered obligation. Terms are stored on the player and survive save/load.
4. **Player promises and dynamics.** `p.promise` is already stored. Check it after 8 weeks and add squad hierarchy and happiness events.
5. **Set-piece routines and opposition instructions.**
6. **Match highlights mode** that only animates key chances.
7. **Data hub.** Charts of xG trends, player heatmaps and passing networks.
8. **Cloud save** and a PWA manifest so it installs to the home screen.

## 9. Making changes

- **Rename clubs or recolour them:** edit `CLUBS` in `data.js` (`name`, `c1`, `c2`, `rep`, `ground`).
- **Add a formation:** add 11 `[pos, x, y]` slots to `FORMATIONS`, with the GK first and y = 1 at your own goal line.
- **Add a role:** append to `ROLES[pos]` with `a`, `m`, `d` (unit leans) and `s` (shot share).
- **Rebalance the engine:** change the weights in `chooseAction()` and the bases in `sim.js`, or `xgScale`, `foulRate` and `cornerShot` in `TUNE_DEFAULTS`. Then run the admin test season and check the targets in the engine section.
- **Add a screen:** register `SCREENS.name = { render(p) { return html; } }` and add click handlers to `ACT`. Link to it with `data-a="go" data-s="name"`.
- **Change money:** `wageFor()` and `pValue()` in players.js, `sponsorWeekly()` and `opsWeekly()` in finance.js, and gate and TV money in `finishMatch()`.

## In-match manager decisions (2026.10.20.6)
- **Options:** computer managers (and your instant results) choose at 46, 60, 70 and 80 minutes from 10 options (`MGR_OPTIONS`):

| Option | What it does |
|---|---|
| attack | More attacking mentality, plus an attacker on |
| hold | Keep the current approach |
| defend | More defensive mentality, plus a defender or defensive midfielder on |
| press | Press higher |
| fresh | Replace tired players |
| restyle | Switch to the style the players on the pitch suit best |
| counter | Sit deep, regroup when the ball is lost, counter when it is won |
| cpress | Counter-press and high press |
| protect | Full-backs and holding midfielders stay back; tired players press less |
| mark | Defenders and defensive midfielders mark tighter and stay on their feet |

- **The rules policy** uses score, time, energy, tactic fit, duel share, shots and possession.
- **The situation record** (`situation()`) adds style, formation and tactic fit for both sides, pass accuracy, regains, duel share and offsides. The bucket key ends with the team's style, so the learning table separates what works for each kind of team.
- **The cloud function and table** (`futbol-brain`, migration `20261020150000`) accept the new options, style buckets and fields; older data is still valid.

## Player match stats
- **Per player:** passes and accuracy, key passes (the pass before a shot), dribbles, tackles, interceptions, aerial duels, blocks, shots, shots on target, crosses, offsides, fouls and saves (`PSTAT_KEYS`).
- **Where they appear:** they are added to each player's season stats, shown in the match report and the player's Stats tab, and ranked in Stats leaders.

## Live commentary
- The newest line is a full-width bar in the kit colour of the team it is about, and a goal flashes.

## During a live match (2026.10.20.7)
- **On the pitch:** every player has a condition bar (green, yellow below 75%, red below 60%) and his live match rating under him.
- **Tap a player:** his live card shows:
  - Match rating, condition, morale (with ↑/↓ when the match is lifting or knocking him) and sharpness.
  - His match stats: passes, key passes, dribbles, crosses, tackles, interceptions, aerials, blocks, shots, offsides and fouls, or saves for a keeper.
  - For your players, buttons for player instructions and a substitution.

  The card refreshes every minute while it is open. Names in the Stats sheet open the same card.
- **Live morale** (`moodSwing()`, `liveMor()` in match.js):
  - Goals lift the scoring side (most of all the scorer and the assister) and knock the conceding side (most of all the keeper).
  - Big saves lift the keeper; big chances missed and penalty misses knock the shooter; red cards knock the side that loses a player.
  - Temperamental players swing more, and determined, professional and model-citizen players shrug off setbacks. A high-leadership captain steadies the team.
  - Swings fade over about an hour, count in every duel through `pForm`, and only last for the match; the result changes real morale at full time.
- **Pass credit:** background passes that aren't animated are credited to the players who make them, so each player's pass count is realistic.

## AI-assisted staff, stage 1: assistant manager (2026.10.20.8, `staff.js`)
- **Where:** "Ask for advice" on the pre-match screen and the Tactics screen.
- **What he does:** plays the coming match through many times with the game's own engine, using both real squads, the opponent's likely tactic, fatigue, morale, home advantage and weather. Nothing is saved (`simFixture()`, fixture id -1). Then:
  - **Predicts** win/draw/loss and the likely score.
  - **Tries other styles** (best-suited first), with the XI re-picked for each formation, and recommends one if it is worth at least 0.1 points per game more.
  - **Gives reasons** from game data (`matchFacts()`): strength of the two elevens, tactic fit, condition and rest days, morale, missing players, their high line against our pace, their press, weather and home advantage.
- **Rating limits** (Assistant staff rating, 1–20):

| What | How the rating changes it |
|---|---|
| Run-throughs per tactic | 6 + 1.5 × rating |
| Styles tried | 1 + rating / 5 |
| Prediction error | ± (20 − rating) × 0.6 percentage points |
| Reasons given | 1 + rating / 4 |
| Precision | Exact numbers only from about 9–10 upwards |

- **Optional AI wording:** DeepSeek can word the advice (AI settings: "Staff advice in words"), from the computed facts only. `staffTextValid()` rejects any text with a number, player or club not in the facts, and the built-in wording is used instead.
- **Learning record:** `G.staffLog` stores each piece of advice (prediction, recommended and current style, rating), whether you followed it (style at kick-off) and the result (points, goals, xG difference). `assistantRecord()` shows how often he called the result right and points per game with and without his advice. It is shown on the assistant card and the Staff screen.
- **Later stages:** this record becomes the learning data for staff (stage 5).

## AI-assisted staff, stages 2–5 (2026.10.20.9, `staff2.js`, `screens-staff.js`)
- **Staff room (My Team > Staff room):** all staff advice in one place. The cards also appear on Training (coaches), Medical (physio), Transfers > Scout advice (scouts), the pre-match screen (opposition report) and the match report (analyst's view).
- **Analyst:**
  - `teamAnalysis()` lists strengths and weaknesses from recent matches against league averages: xG for and against, finishing, shots against, passing for possession sides, late goals, set-piece goals, tactic fit, weak positions and tiredness.
  - `oppReport()` covers the opponent's style, recent goals and xG, possession, crossing and in-form player.
  - `postMatchAnalysis()` stores tags per match (`G.analysis`), finds recurring patterns and gives one suggestion. The suggestion is judged by whether the problem comes back in the next match.
  - Every league match now keeps compact stats (`fx.s`, `fx.sty`).
  - Rating sets how many matches he looks at, how much he can see (late goals, set pieces and weak positions need 6–8+), whether numbers are exact, and how many findings he gives.
- **Coaches:** `coachPlan()` picks a team focus and intensity, putting recovery first when fixtures are congested (rating 6+), then the analyst's main weakness, plus individual plans for young players with room to grow (their weakest area for their position). Judged after four weeks on squad attribute growth and injuries (`G.flags.injN`).
- **Physio:** `physioAdvice()` lists squad players expected below 80% condition at kick-off, with relative injury risk (age, weight, fatigue). "Leave them out" removes them from the matchday squad. Judged on whether rested players got injured.
- **Scouts:**
  - `scoutAdvice()` works out needs: weak spots in the XI, ageing starters and positions with no cover.
  - It recommends players the scouts know well enough (minimum knowledge falls with rating), within the transfer budget and wage room, who are likely to join, ranked by improvement, youth and price.
  - Judged at season end: did the signed players play and rate well? Players recommended but not signed are tracked as "missed".
- **Staff growth and learning:**
  - Good outcomes give that role's staff experience; at season end experience becomes up to +2 rating (less for staff over 60).
  - All outcomes feed a device-wide learning table (`futbol-manager:staff`). Admin > AI Staff saves versions and approves one; approved evidence is shown with advice and steers it (the assistant needs a bigger edge before recommending a switch if switches have not paid off).
  - The table syncs to the cloud as a `staff` snapshot (futbol-brain function v4 accepts it).

## Test season, tactic balance and staff learning (2026.10.21.1)
- **Run test season** (Admin > Engine) reports every league average against its target, plus results by style and by tactic fit. "vs strength" is points per match above or below what the strength gap between the two elevens and home advantage predict (a least-squares fit over the season), so a style isn't flattered by the clubs that pick it. One season is noisy: differences under about 0.1 are chance.
- **Tactic balance** (checked over 16-40 simulated seasons with the real squads):
  - New fit area **Fast, direct play** (tempo "fast"): Pace, Decisions, First Touch, Passing, Off the Ball, Stamina. Fast tempo rushes every forward action (`TEMPO_RISK`) unless the players suit it. This removed Gegenpressing's built-in edge (it was +0.26 points per match regardless of players).
  - **Tactic cohesion** (`S.coh`, the average fit over the areas a side's instructions switch on) shifts every recorded duel (`COHESION_K`). A tactic that asks nothing special (Balanced) is neither helped nor hurt; a demanding style pays off only with players who suit it.
  - Long ball: knock-downs go out to the wingers when the side plays wide, so it crosses more; aerial duels and second balls depend more on fit. Tiki-taka: slow tempo eases pressure for players who suit possession play, and keeps the ball more after recycling it. Counter-attacks and a deep line give less for free and more through fit.
  - Result: every style within about ±0.1 points per match of what strength predicts; well-suited sides beat poorly suited ones by 0.15-0.4 points per match.
  - Calibration: fewer saves on target, fewer penalties and fouls (`foulRate` 0.18), chance quality `xgScale` 0.74. Shots per match (about 30) are still above the ~25 target, and a top striker takes most of his team's shots (top scorers reach 45-60 goals): known, not yet fixed.
- **Duel data (engine plan stage E):** every contested action in a real match is rolled through `duelRoll()` in sim.js, which records `M.duels['type|row|gap'] = [tries, wins, predicted chance]`. At full time `brainCloudDuels()` adds them to the cloud queue, tagged with game version and tuning; `futbol-brain` v5 stores them in `futbol_brain_duels` (migration `20261020170000`). `futbol_brain_duel_analysis` compares the real win rate with the engine's own prediction by type, pitch row and attribute gap. Test seasons, the assistant's run-throughs and the training camp are never uploaded.
- **Staff advice in words:** with the DeepSeek "Staff advice in words" tick, the analyst, coaches, physio and scouts also get a 2-3 sentence summary (`staffWords()`), checked by `staffTextValid()` against their own facts like the assistant's.
- **Learning tables now steer:**
  - Coaches: a focus is dropped for balanced training if balanced weeks have done better; a strong rating (10+) picks the focus that has worked best; hard weeks only if they have paid off.
  - Scouts: recommendations for a kind of need (weak spot, ageing starter, cover) rank higher when past signings for it rated well.
  - Physio: warns from 84% condition if resting has kept players fit more often than playing them anyway (`physio|played`, newly recorded), or only below 76% if it has made no difference.
- **Coach outcomes** are now relative: each player is paired with a similar player (age within a year, similar potential) at another club, and the plan is judged on growth above that control group over the same four weeks (minus 0.05 per injury), so plans are compared with each other rather than on raw growth.
- **Live commentary:** fouls and cards are told before the free kick or penalty they lead to; blocked shots, deflections for corners, keeper rushes and offsides have their own wording (no more "fires over the bar. Corner.").
- **AI usage statistics:** in Personal relay mode the game sends the feature name and its anonymous AI Brain installation id with each call (`aiMeta()`, never forwarded to the AI). The relays log tokens, cache hits, cost and feature in `futbol_manager_ai_requests` (migration `20261020171000`); `futbol-brain` serves `/usage` from `futbol_ai_usage_stats()`.

## Shot engine and day-by-day calendar (2026.10.21.2)
- **Shot engine** (`js/engine/shots.js`, used by sim.js): decides who gets the chances.
  - `shotWill()`: how keen the player on the ball is to shoot: position (`SHOT_POS`; a striker gets most chances, so his factor is lowest), Flair against Teamwork, tight marking, and patient possession sides (slow tempo, if the players suit it) waiting for the opening.
  - `lateRuns()`: when a move reaches the final third, midfielders with Off the Ball, Teamwork, Stamina and a running role arrive in the box (more after patient build-up, fewer on a fast break).
  - `targetWeight()` / `crossTarget()`: passes, through balls and crosses near the box go to attacking midfielders, wide players and late runners too, plus a far-post run on crosses.
  - `layOff()`: a marked player (strikers most) squares or cuts it back to a free team-mate: a clear chance (`cutback`, xG at least 0.10-0.26).
  - Attention: each side remembers the danger every opponent caused this match and marks the one causing most of it more tightly (doubled up after several shots), also in races in behind.
  - One-on-ones have fixed chance quality (`ONE_ON_ONE_XG`), so the xG slider can't change how costly a high line is.
  - `SHOT_TUNE` holds the levers (rate, mark, double, late).
  - Result over 4-16 seasons: about 25 shots, 9 on target and 2.8 goals per match; strikers take about 30% of shots (were 56%); no player averages more than about 5-6 shots; top scorers 35-44 goals (were 59-81); styles still within about ±0.1 points per match of strength.
- **Day by day** (`advanceDay()` in season.js, `js/ui/dayrun.js`):
  - Continue flips a calendar card one day at a time (about half a second each): matches kick off on their own day, transfer business happens on Wednesdays, contracts on Thursdays, scouting reports on Fridays (`DAY_JOBS`, each once a week, and still once if a week is skipped in Admin), and your squad recovers day by day.
  - It stops by itself on your matchday (to the pre-match screen), at season end, or when important news comes in (`newsImportant()`: transfers, bids, agent pitches, contracts, injuries, suspensions, the board, youth intake). The card then lists the news; tap one to read it, or Continue. Stop pauses at any time.
  - News is now dated on the day it happens. Admin > Time still moves whole weeks.

## Tuning rules and great players (2026.10.21.3)
- **What is tuned:** league averages only (goals, shots, on target, passing, fouls, cards, offsides, penalties, corners). Never per match, per player or per style.
- **Styles are not balanced against each other.** If the engine suits one style better, it wins more. The only check is for a free bonus: a style clearly ahead even with less suited players (Admin test season, "Style with poorly and well suited players", flagged in yellow). That points to a bonus built into the engine; it is investigated rather than tuned away. Read it over several seasons.
- **Great players:** tight marking now bites according to the defenders' Marking, Positioning, Anticipation and Teamwork against the attacker's Dribbling, Flair, Agility, First Touch, Composure, Decisions, Off the Ball and Anticipation (`markGrip()` in shots.js). Finishing matters more (`0.82 + (Finishing − 12) / 20`). A good decision maker lays the ball off only when the team-mate is the better bet, and keeps it when he is the better finisher. Result: an elite striker scores roughly 30-55 a season depending on the season and his team; a Messi-level player can reach 50+; an ordinary striker cannot.

## Inspirational figure (2026.10.21.4)
- Every first-team player from the real-based squads has `p.insp`: the name of the player he is based on. It is shown on the Personal tab and provides a fallback key for applying display-name overrides to older saves. Generated players (reserves, U18s, youth intake, free agents) have none.
- Older saves get it on load, matched by the player's name (`ensureWorld()` in bio.js, once, `G.flags.insp`).
- The full list is in `docs/INSPIRATIONAL_FIGURES.md`. It was rebuilt from the Transfermarkt 2026/27 squad pages, matching club, age, squad order and name likeness.

## Overseas clubs, refresh and daily saves (2026.10.21.5)
- **Overseas clubs** are built from real 2026/27 squads (`FOREIGN_ROSTERS` in rosters.js, linked by `ros` in `FOREIGN`): Castilla CF = Real Madrid, Lutece SG = PSG, Lombardia AC = AC Milan, Rhein 04 = Leverkusen, Porto Norte = FC Porto, Amstel FC = Ajax, Rio Atletico = Flamengo, Pampas Juniors = Boca Juniors, Brussels Royal = Anderlecht, Tokyo Bay FC = FC Tokyo, Oslo Vikings = Vålerenga, Lagos Stars = Remo Stars, Selangor Harimau = Selangor FC. 345 players with sound-alike names, real ages, nationalities, positions, feet and values, and their inspirational figure. New games only; old saves keep their generated overseas players. Free agents stay generated.
- Ratings from value: the age boost for older players now stops at 35 (`ratingFromValue()`), so a 41-year-old with a small value is no longer world class. Affects a few Premier League veterans in new games too.
- **Refresh** returns to the screen you were on (sessionStorage, this tab only; a live match returns to the pre-match screen). Opening the game in a new tab shows the title.
- **Daily saves:** the day-by-day calendar saves after every day.

## Connected navigation and club dashboards (2026.10.21.7)
- Player and club mentions in rendered text open their profile/dashboard across news, advice, tables, reports and live commentary. `linkEntities()` runs after page, sheet and commentary rendering. It uses escaped text nodes and whole names, skips existing controls/form fields, and asks which player when names are ambiguous. Player rows have separate profile and club-badge buttons; selection/substitution rows offer a separate Profile button.
- News includes Related buttons for mentioned players/clubs and relevant transfer shortlist, scouting, medical, training, squad, tactics, finance, board, league and match-report destinations. Bid/renewal actions remain available. Add to shortlist saves immediately and opens Transfers > Shortlist without duplicating a player.
- My Team > Club directory (also from League Table) includes all 33 clubs and free agents. `clubview` takes `{cid, section, level}` and shows the club dashboard, first team/reserves/U18s, fixtures/results and transfer activity. Opposition ratings retain scouting ranges; overseas results are explicitly unavailable because those leagues are not simulated. Your management controls stay on their existing pages.
- Fixture names and crests open clubs; fixture Preview/score buttons open a preview or report. Reports with saved ratings can switch between both teams. Browser Back and refresh preserve club/squad context using the existing navigation system; no save migration is required.
- Focused mobile regression: `node tests/links.cjs` and `node tests/navigation.cjs` (390×844; `CHROMIUM_PATH` may point at an installed Chromium).

## My Team opens Squad (2026.10.21.8)
- My Team routes directly to Squad, including older saved `team` views. All eleven team sections appear in a horizontal tab row above the section content, with the active tab brought into view. The former grid of menu cards is removed; section routes, Back history and squad filters remain intact.

## Title menu and updates (2026.10.21.9)
- The title shows **Continue game** (with a save), **New game**, **Options** and **Check for updates**, with the version status underneath. New game asks first when a career is saved; the old save is only replaced once you take charge of a club.
- **Updates** (`checkForUpdate()` in screens-match.js): opening the title reads `GAME_VERSION` from the published `js/core/data.js` (no cache). If it is newer, every script, stylesheet and the page are fetched again past the browser cache and the game reloads on the title, so players enter the latest version. The save is untouched. A version already tried in this tab is not reloaded again while GitHub Pages is still publishing it ("Try again in a minute"). It never reloads once you have gone into the game; offline it just says it could not check.
- Test: `node tests/updates.cjs` (390×844).

## Live match never restarts; realistic 2D movement (2026.10.21.10)
- **The match in progress is kept in the save** (`G.live` = the match state, possession and recent commentary; `liveKeep()` in live.js). It is written between minutes, when you leave the match screen, and when the page is hidden or closed. Back, other pages, Pause, refresh, closing the tab, or saving and loading all resume at the same minute and score (`liveFromSave()`), paused until Play, instead of kicking off again. `LIVE.G` ties the on-screen match to the loaded save. Full time clears `G.live`. Saving each minute takes about 20 ms (about 1 MB save).
- **2D movement is visual only**; the engine (sim.js) still decides every action, so results and calibration are unchanged.
  - Players have momentum and run at their own top speed (Pace, Agility, condition; `topSpeed()`), jogging into shape and sprinting when it matters.
  - The shape follows where the ball is going (`L.focus`), not every frame of its flight, so players read the play instead of chasing the ball.
  - The defending back line holds one line, no deeper than needed; both teams stay compact (no one more than about 40 m behind the ball).
  - Attackers not in the move stay onside against where the line is and where it is heading (`liveLine()`); runs in behind start from the shoulder of the last defender as the pass is played. An offside shows the player caught beyond the line before the pass.
  - Passes wait for the receiver's run and arrive with him (or go to where he can reach); intercepted or claimed balls go to the defender who wins them. Quiet minutes are short passes between team-mates, not the ball moving to empty space. On crosses, runners attack the near post, penalty spot and far post. After a goal and at half time both teams return to their halves for the kick-off. Players keep about 3 m apart.
- Test: `node tests/live.cjs` (390×844): resume after Back/other pages, refresh and save/load; onside shape, running speeds and passes reaching players.

## Scouting files (2026.10.21.11)
- **Knowledge = how much of the file is confirmed** (`scouting.js`). Stages: Heard of (0), Watched (25: physical attributes), Scouted (50: technical and goalkeeping, contract, wage, asking price), Detailed (75: mental, personality, ambition, potential), Full file (90: everything exact, plus happiness, role at his club, whether he would join you, likely wage demand). Within a stage each attribute is confirmed in a fixed order per player (`attrConfirmAt()`), so the share of exact values rises steadily (about 15% at 50, 62% at 75, 100% at 90). Not yet confirmed = a narrow range that always contains the true value (italic); not reached = "?". Ability and potential follow the same stages; grades are worked out from what has been seen.
- **Scouting takes time.** Player > Scouting > Send a scout: the best free scout follows him for three weeks (£6k a week in the Premier Division, £12k abroad). Every match he watches adds knowledge (`watchGain()`: scout rating, 1.25× in the scout's home region, less if the player did not play): league matches via `scoutWatchMatch()` from `finishMatch()`, Saturday matches abroad and friendlies when there is no league match, midweek training for free agents (`scoutDay()` each day). About three matches take a domestic player to a full file. Video analysis (£3k) files in two days and stops at 74%. Each scout follows up to three players or runs one assignment; scouts have a home region.
- **Assignments** search a region and file first reports (Watched stage) on two players a week.
- **Files** (`G.scout.reports`, up to 120): cover with scout, date and matches watched; verdict (grade, recommendation, best role in your formation against your current player); attributes; sections that open stage by stage; scout's notes (strengths and weaknesses for his position, form in matches watched); match log with ratings; report history; folders New / Recommended / Monitor / Rejected. Transfers > Scouting lists scouts, players being followed, assignments and the folders. A news item links to the file when a job finishes.
- Older saves keep their knowledge, which is now read with these stages; jobs, folders and scouts on assignments are added on load (`ensureScouting()`).
- Test: `node tests/scouting.cjs`.

## Director of Football and transfer deals (2026.10.21.12)
- **Transfers are deals that take days** (`js/systems/deals.js`, `G.deals`; UI in `js/ui/screens-deals.js`, Transfers > Deals). Each stage waits a few days (`d.next`, absolute day `dayAbs()`), checked every day by `dealsDay()` from `advanceDay()`. Every step goes on the deal's timeline; decisions you must make are `d.need`, with a news item that stops the day-by-day calendar. Progress news is quiet (`n.q`, `newsImportant()`).
- **Signing:** review (a file reaching 90% goes to the DoF: `dofQueue()` from `addKnowledge()`; "Make an offer" or "Talk to the Director" starts it straight away with a quick memo) → meeting (memo on finance, tactics and harmony with a verdict Proceed / Monitor / Drop; you choose a quiet or open approach and your fee and wage limits) → interest (the agent says whether he is keen, open, hesitant or refuses; the club says not for sale, or what it would listen to) → bid (the DoF shapes the offer: add-ons for young players with potential, instalments for big fees; rounds of counters, up to your limit, or he asks you) → agent's fee → personal terms (wage, years, role, release clause for ambitious or hesitant players, signing bonus) → the player decides → medical → you complete or pull out. A signing typically takes two to three weeks.
- **The DoF's rating** sets how close his fee and wage estimates are, how many points he makes, whether he spots wage-hierarchy problems, and how hard he negotiates. New careers and older saves get one (staff role `Director`, shown as Director of Football).
- **Selling:** an offer waits for you (accept, ask for 20% more, reject, with the DoF's advice); the player then talks to the buyer and may refuse; medical; you sanction or block (blocking a keen player hurts his morale). A bid that meets a release clause skips your answer.
- **Computer clubs** start deals that take days and can collapse (`aiDeal()`); if one signs your target first, your deal ends.
- **Window:** bids and later stages need an open window; talks before that wait. If the window shuts mid-deal, the deal collapses.
- **Money:** instalments are paid at the next season ends (`G.payments`, `payInstalments()` at rollover); add-ons are paid when the player reaches 25 appearances (`G.addOns`); agent's fee and signing bonus come out of the transfer budget; release clauses (`p.rc`) and sell-on shares (`p.sellOn`) are honoured when you sell.
- Rumours from open approaches and big computer deals are logged in `G.rumours` for the transfer news and social feed (later phases).
- Test: `node tests/deals.cjs`.

## Agents (2026.10.21.13)
- **40 fictional agents** (`js/systems/agents.js`, `G.agents`), sound-alike names inspired by real agents and agencies, plus original local agents; the list and what inspired each is in `docs/AGENTS.md`. Each has agency, markets (nations or regions; `*` = worldwide stars), reputation, greed and style, and a relationship with every club (`rel`, -50..50).
- **Every player 17 and over has an agent** (`p.ag`, `assignAgent()`): a few known pairings by inspirational figure, otherwise by nationality (the agent's markets) and level (big agents take the best players), fixed per player. Older saves are assigned on load.
- **In deals:** the agent's fee is 4% + greed × 0.35 of the transfer (above 8% needs your approval); his clients ask for more wages if he is greedy; his relationship with your club makes the player keener or warier. Agents pitch their clients (hostile agents do not call). Completing a deal (+8), paying his fee (+3) or sanctioning a client's sale (+4) improves the relationship; walking away during talks (−5), pulling out at the end (−10) or blocking a keen client's move (−8) hurts it.
- **Agent page** (from the player's Contract tab and scouting file at 75%, the deal sheet and Transfers > Agents): reputation, style, usual fee, markets, relationship with you and the last thing that changed it, clubs where he has power (three or more clients), clients at your club and elsewhere, and recent moves.
- Test: `node tests/agents.cjs`.

## Press Officer, Transfer centre and social feed (2026.10.21.14)
- **News has three views**: News, Transfer centre and Social (`js/ui/screens-social.js`).
- **Social feed** (`js/systems/social.js`, `G.social`, up to 160 posts): fictional journalists, a tabloid, rumour accounts and influencers (sound-alike names inspired by real reporters; `docs/MEDIA.md`), plus an official and a fan account for every club. Posts show likes, reposts, replies and the account's reliability; tapping one opens its thread with fan replies. Filters: For you, Journalists, Rumours, Fans, Your club.
- **Real deals post as they move** (`dealMedia()` from deals.js): talks, approach, leak, fee agreed, "HERE WE GO" (tier-1 journalist), the buying club's welcome post, and collapses. Your quiet talks only appear if they leak.
- **False rumours** every day (two a day in a window, fewer outside), weighted to good players in form, including yours (`falseRumour()`, `G.rumours` with `real: false`).
- **Press Officer** (staff role `Press`; older saves get one): rumours about your players or targets ask for a statement (once a month per player), with his advice: for your player "Not for sale", "No comment" or "We would listen to offers" (lists him); for a target "Deny", "No comment" or "Confirm our interest" (public: he becomes keener, his club asks 5% more). The statement is posted by your club account (`pressAnswer()`, `G.media.req`, `p.media` for phase 5). A weaker Press Officer misreads more situations, and quiet talks leak more often (about 4% over a deal with a top one, about half with a poor one).
- **Meeting approaches**: quiet talks, open approach, or leak to the press (keener player, higher price).
- **Transfer centre**: window banner, Press Officer statements, here-we-go posts, talks in progress around the league, the rumour mill, done deals and collapsed deals.
- Test: `node tests/social.cjs`.

## Transfers and rumours affect players (2026.10.21.15)
- **All through morale** (`js/systems/mood.js`), which the engine already uses for match form; the engine itself is unchanged.
- **Links unsettle** (`transferBuzz()`, from false rumours, deal posts and bids): how much a link gets to a player (`buzzReach()`) depends on ambition, character (Ambitious more, Loyal much less, Professional / Model Citizen less), low morale, a rotation or backup role, and how much bigger the other club is. Unsettled players (`p.unset`, levels 1-3) lose morale at once and each week (`moodWeekly()`); news tells you when one of yours is distracted. With no new links for four weeks it fades.
- **Transfer requests** (`p.treq`): an unsettled, unhappy ambitious player asks to leave. Accept (listed, morale up, agent pleased) or refuse (a calm character accepts it for now; others are angry; agent annoyed).
- **Statements** (`statementMood()`): "Not for sale" pleases a settled player (+3, calms him) and annoys one who wants out (−6); "We would listen" hurts a settled player (−7) and pleases one who wants out (+5).
- **Signings** (`signingMood()`): a big signing lifts the squad (+2) and fans; starters in his position worry (−4, −1 for determined or professional players); compatriots are pleased (+3); a new top earner on 25% more than anyone annoys senior players (−3). A news item sums up the dressing room's reaction.
- **Sales** (`saleMood()`): selling a key player or a leader lowers the squad (−3) and the fans (−2, −4 to a league rival).
- Moving club clears a player's unsettled state, request and listing. The profile shows "Distracted / Unsettled by X interest" or "Has asked to leave"; asking about his future gives an honest answer and can settle a mildly distracted player.
- Test: `node tests/mood.cjs`.

## Eight-week window and deadline day (2026.10.21.16)
- **Windows by date** (`windowState()` in calendar.js, using today's date): summer from the start of the season (first Monday of July) to deadline day, 1 September (about eight weeks); January from 1 January to 2 February. No window at the end of a season any more; talks agreed then wait for July. `windowState()` gives `left` (days to deadline) and, when shut, when it `opens`. Transfers and the Transfer centre show the days left and "DEADLINE DAY" on the day.
- **Deadline day hour by hour** (`js/systems/deadline.js`, `G.dd`): 09:00 to 23:00. Each hour every deal in a window stage gets a chance to move a step (`dealTick(d, true)`), computer clubs make late panic moves (`aiMarket()`), late bids for your players can land (`aiBidsForUser()`), rumours and a countdown ticker fill the feed. A "Deadline day" news item opens the day; "The window has shut" sums it up and lists your deals that missed it. Anything not done collapses the next morning.
- **On screen:** the day-by-day calendar turns into a deadline-day clock (one hour about every second), with the latest move under it; it stops for decisions (a late bid, a deal ready to sign). Skipping the day (or advancing without the calendar card) plays all the hours at once (`runDeadline()` from `advanceDay()`).
- `dealsDay()` now calls `dealTick()` for each deal (the same checks and steps, also used by deadline day).
- Test: `node tests/deadline.cjs`.

## AI for the transfer roles and learning (2026.10.21.17)
- **The game's own rules always decide when AI is off or slow** (`js/systems/transfer-ai.js`). AI answers are asked ahead of time and used only if they are back when the step is due.
- **Words (DeepSeek, AI settings):** "Staff advice in words" now also covers the Director of Football's memo (`dofWords()`), the scout's summary on the file (`scoutWords()`) and the Press Officer's advice (`pressWords()`); new "Agents' messages in deals" gives the agent's message on the deal sheet in his style (`agentWords()`); "News stories and rumours" lets journalists, the tabloid, rumour accounts and influencers write their own posts from the built-in post's facts (`postWords()`, up to 12 a day). Every text goes through `staffTextValid()`: any number, player or club not in its facts and the built-in wording stays. All AI words share a cap of 40 calls a day (`aiBudget()`).
- **Decisions (Jev, "Transfer decisions"):** a second opinion on the DoF's verdict (`dofSecondOpinion()`; a DoF rated below 13 takes a confident (70%+) different answer and says so on the timeline); whether a hesitant or open player joins (`askPlayerDecision()`, used by the player step); how a selling club answers a borderline offer, 88-105% of its valuation (`askClubAnswer()`). Up to 8 Jev calls a day. The memo shows the AI's opinion and how sure it was.
- **Learning:** DoF decisions are logged (`logDof()`, key `dof|verdict|your decision`, `|ai` if the AI changed it) and judged at season end on the player's average rating (`transferLearnSeason()`); statements are logged (`logStatement()`) and judged on the player's morale two weeks later (`transferLearnWeekly()`). Results go into the staff learning tables (synced to the cloud in the staff snapshot, now with a transfer summary in `records.transfers`; no backend change needed). An approved table moves the DoF's bar for Proceed (`dofBar()`) and lets a Press Officer rated 10+ prefer the statements that have worked (`learnedStatement()`). Good calls give the DoF and Press Officer experience, which turns into rating at season end.
- Test: `node tests/transfer-ai.cjs` (both AI services stubbed).

## Stable popup editing and transfer limits (2026.10.21.18)
- `sheet()` updates the body of an already-open sheet with the same explicit key, retaining its panel/scrim, scroll position, horizontal rails and focused control. It no longer repeats the entrance animation on fee/wage changes, choices or late AI wording. New sheets still animate, and the existing Back/restore behavior remains in use.
- Transfer fee/wage and contract-wage buttons apply exact increments without market-value rounding. Their step sizes stay fixed while that form is being edited, so decreasing then increasing across a threshold returns to the original amount. Minimums remain £0 fee / £300 weekly wage. Editable amounts use `moneyExact()` so £50k fee and £250 wage changes are visible; other money displays retain compact formatting. Stepper controls have accessible amount labels and support rapid mobile taps.
- Regression: `tests/ui-stability.cjs` covers rounding, thresholds, exact display, repeated taps, panel/animation/scroll/focus stability, late AI refresh, nested profiles/Back and unchanged game finances during editing.

## Starter position swaps (2026.10.21.19)
- Tactics has a mobile-friendly **Swap positions** mode: tap one starter, then another pitch position. Both players exchange slots; the bench, position roles/instructions and tactical familiarity stay unchanged. Swaps save immediately. Tap the same starter twice to clear selection, or **Done swapping** to return to the ordinary picker. Changing shape/view, auto-picking or leaving Tactics clears the pending selection.
- Pitch tokens show familiar position labels (ST, RW, LW, etc.). The normal player picker now separates **Starting XI — swap positions**, **Substitutes** and **Other squad players**, instead of burying starters in one suitability-sorted list. Existing substitute replacement behavior is retained, and picker changes save immediately too.
- `tests/lineup.cjs`: 23 mobile checks cover ST/RW swaps, unchanged bench/roles/instructions, persistence, ordinary picker swaps, substitute replacement, out-of-possession mapping and the XI used at kick-off. Match-time swaps are not added by this change.

## Return to title from Settings (2026.10.21.20)
- Settings starts with **Save & return to title**. It stops calendar/live playback, saves the career and clears the remembered page so refreshing stays at the title. **Continue game** resumes the same career. A failed save leaves Settings open with export advice.
- `tests/navigation.cjs` covers returning, refresh, continuing, saved progress and failed storage on a 390×844 viewport.

## Dashboard assistant briefing (2026.10.21.21)
- `js/systems/briefing.js` builds a deterministic club snapshot: last result, recent news and ten departments (finance, medical/fitness, dressing room, tactics, training, transfers/contracts, staff, scouting, board/results and academy). Each department has evidence and a status: needs attention, healthy or monitor. Pre-season results and idle scouting stay under monitor rather than being presented as healthy.
- The dashboard starts with the assistant's short briefing, first priority and linked attention/healthy departments. **Full club report** expands all evidence and recent news. Named players in the evidence link to profiles; scouting opens its own Transfers tab, and expiring contracts without pending deals link to Squad.
- Jev chooses a priority from the existing attention departments only; DeepSeek writes a short summary using that snapshot and priority. Both use existing AI clients, usage accounting, monthly limits and new **Dashboard assistant** feature switches (enabled for already-configured services unless explicitly disabled). Services remain off until configured. No backend change is required.
- The last snapshot/accepted response is saved in `G.assistantBriefing`. Identical data, rerenders and reloads reuse it; changed club data immediately updates factual statuses. A maximum of two briefing calls per service per game day, plus existing shared caps, prevents repeated spending. AI failures, invalid department choices and text with invented numbers/names fall back to club facts; stale responses cannot affect another career. Only the briefing card refreshes when AI returns.
- `tests/briefing.cjs` exercises the real client request/usage paths with mocked responses at 390×844: health flags, prioritisation, summaries, caching/reload, direct links, bad responses, server failure, daily caps and a career switch during an in-flight request.

## Compact, manual assistant (2026.10.21.22)
- The dashboard briefing is now exactly three compact rows: title/**Ask assistant**, department counts, and a single-line preview. Counts and preview open the full report in a separate sheet, retaining department/player/news links.
- AI is requested only by **Ask assistant**. Opening Dashboard, rerendering, reloading, opening a saved report or changing club facts never starts a request. Accepted answers for unchanged facts are reused; failed services can be retried manually, within the existing daily/monthly caps. Repeated taps during a request cannot start duplicates.
- `tests/briefing.cjs` verifies the compact height at 390×844, manual-only querying (including enabled services), caching, report links, errors, caps and stale responses.

## Match engine v3: positional simulation (2026.10.21.23)
- **Replaces v2 and the old 2D movement entirely** (`js/engine/sim.js`; `shots.js` removed, its marking/attention helpers moved into sim.js). Every half second (`TICK`) all 22 players and the ball move on a 68×105 m pitch: ball physics (air, bounce, friction), passes that can be cut out along their path, first touches, loose balls, offside judged at the moment of each pass, timed runs, pressing, jockeying, tackles, fouls, crosses and headers, shots with an xG model, and every restart (throw-ins, goal kicks, corners, free kicks, penalties).
- **Decisions:** the player on the ball scores his options (shoot, pass, long ball, through ball, cross, carry, clear) from his attributes, team-mates' movement, pressure and the tactic, then picks with a softmax whose sharpness grows with Decisions/Vision. All 26 attributes, height/foot/character, instructions and tactics feed positions, speeds and choices; nothing is aimed at a single match, player or style.
- **Levers:** `ENG` in sim.js (`xg`, `shoot`, `foul`, `intercept`, `sharp`, `touch`, `cross`, `fin`, `keepShot`...). Calibration, 24 matches: goals 2.7, shots 28, on target 8.5, corners 9.8, fouls 20, yellows 3.0, offsides 4.3, penalties 0.17, pass completion 79%.
- **Speed:** about 150-200 ms a match in a desktop browser; the assistant's run-throughs yield between matches (`simFixture` is async).
- **2D view** (`js/engine/live.js`): draws the engine's own frames (`M.frames`, 120 a minute, ball + 22 players), interpolated. Camera follows the ball (Cam button: follow / full pitch) with a mini-map; your team always attacks upward. **Highlights** (HL button): key (goals, shots, penalties, cards), extended (+ corners, free kicks, dangerous attacks) or full match; quiet parts are skipped with the clock jumping.
- **Saving:** frames are not saved; per-minute caches are rebuilt after a load (`shapeOf()` recreates its Map).
- Test: `node tests/live.cjs` (frames, speeds, camera, screen matches engine, highlight levels, resume/refresh/load).

## Engine fixes from the FM comparison (2026.10.21.24)
Built from `reports/FM match engine comparison.md` (not in the repo), items 1-10:
1. **Shots and carries re-priced** (`carrierDecide()`): a shot is worth its chance minus a small miss cost (`ENG.keepShot`), and `threat()` stays below the chance of a shot near goal, so a free player in the box shoots (about 2 in 3 times; before: never). A carry counts every opponent who can reach its path in time (speed, Anticipation), keeper included; the two best placed must be beaten.
2. **One-on-ones** (`throughOnGoal()`, `roundKeeper()`): through on goal he runs at it, deciding every half second; Composure decides when he pulls the trigger; he can round the keeper (Dribbling, Agility, Composure v One on Ones). The keeper comes out to narrow the angle and rushes him when close (One on Ones).
3. **Transitions** (`transition()`, `engage()`): *When the ball is lost*: Counter-press swarms the ball for 2.5 s + Work Rate (two close him in, a third cuts the nearest pass) wherever it is; Regroup drops straight into the block. *When the ball is won*: Counter decides faster, prefers forward passes and sends runners at once; Hold Shape is patient and holds runs.
4. **Attribute test** (Admin > Engine, `runAttrTest()` in lab.js): each attribute at 8 for one side and 16 for the other, 40 matches each, tactics chosen first. Result (60 matches each): Anticipation, Pace, Agility, Tackling, One on Ones, Strength, Decisions, Dribbling, Positioning, Stamina help most; Passing, Composure, Teamwork, First Touch, Finishing help; Marking and Work Rate are about neutral on results (Marking cuts the opponent's pass completion by about 4 points).
5. **Role movement by ball zone** (`ROLE_Z`, `ballZone()` in pitch.js): each role moves with the ball's third and flank (FM26-style): inverted full-backs step into midfield, centre-backs split to build, wingers hold the touchline and attack the back post from the far side, inside forwards come inside to score, false nines drop between the lines, mezzalas take the half-space, box-to-box midfielders arrive at the edge of the box.
6. **Space search** (`findSpace()`): midfielders and forwards with the ball nearby pick the best of nine spots around where their role wants them: free of defenders, a clear passing lane, dangerous, onside, not crowding a team-mate. Off the Ball picks the right one, Anticipation reads where defenders are going, Teamwork weighs spacing and lanes; free roles look further (`ROAM`).
7. **Runs with triggers** (`targets()`): the man on the ball facing forward or unpressed, a forward dropping deep, or a counter; how often by individual mentality (team mentality, role, instructions); players from midfield back only go if enough stay behind the ball.
8. **Pressing triggers** (`pressTrigger()`): a back pass, a poor touch, a receiver facing his own goal or the ball on the touchline can send the nearest man in outside the usual pressing zone (presser's Work Rate v receiver's First Touch).
9. **Highlights** (`segments()` in live.js): a highlight early in a minute keeps its build-up from the minute before; dynamic: a close game and the last 15 minutes show more (Key adds near things), a game decided by three goals shows less.
10. **Fatigue from sprinting** (`drain()` in match.js): each player tires by the metres he sprinted last minute (over 5.5 m/s), not by the pressing instruction. Players jog into position and sprint only for the ball, runs, pressing, a loose ball or getting back goal-side (Work Rate gets them there sooner).
- Marking now reads where the attacker is going, makes his first touch harder and helps cut out passes; Vision makes forward passes more likely; players weigh their four best passes.
- **Calibration** (`ENG`, 150+ matches): goals 2.6-2.9, shots 23-26, on target 7-8, corners 9, fouls 21-23, yellows 3.0, penalties 0.25, offsides about 2, pass completion 84%. About 0.3 s a match in a desktop browser.

## Rulebook-driven match engine (2026.10.21.26)
Built from `docs/FOOTBALL_RULEBOOK.md` (every change cites its section, rule 11c). Includes PR #40's foundation
(`js/engine/shape.js` pitch zones/phases/team shape and rest defence, `intent.js` forward-first decisions,
`defending.js` pressure/cover/screen unit and line step/drop, `transitions.js` counter-press window) and on top:
ball in and out of play with real restart times (1b), individual tempo (3.10), loose and second balls (4.9),
direct play with outlets and second-ball support (9.5), box occupation and attacking the space on the cross (7.2),
cut-backs, wingers to the byline and inside forwards cutting in (7.1, 7.4). League calibration (150 matches):
goals 2.73, shots 20, corners 8.3, fouls 24. Developer tools: `scripts/flow-scenarios.cjs` (gegenpress v long ball),
`scripts/flow-clips.cjs` (clips with timelines), Admin shape demo, Jev decision loop (`js/systems/jev-lead.js`,
paused by the owner). Handover: `docs/CLAUDE_HANDOVER.md`.

## Shot quality and defending near goal (2026.10.21.27)
From the analysis loop (reports in `docs/analysis/`; rulebook first, every change cites its section).
- **Shot quality** (7.5, `chanceAt` / `xgAt` in sim.js): distance, goal-mouth angle, how much of the goal the
  shooter sees past the keeper and defenders, bodies in the shooting triangle, pressure, header. Structure as in
  professional shot models; own coefficients fitted to public reference values. Used for the shot decision and
  the chance itself; replaces the fixed one-on-one value.
- **Keeper** (6.1): on the line from the middle of his goal to the ball (near post at a tight angle), resetting at
  full speed with every pass near his goal.
- **Defending near goal**: box marking goal-side, tight and at full speed (4.8); the first defender in shooting
  range blocks goal-side and the cover takes the pass inside (4.8); delay rather than dive in near the box (4.5);
  midfielders pass runners on at the back line (4.7); through balls need time on the ball (7.1).
- **Shape** (3.2-3.7, 6.2-6.6): build-up positions, the space between the opponent's lines, the back line squeezes
  up behind the ball, centre-backs step into midfield with the ball.
- **Calibration** (league averages only, three seeded worlds of 100 matches): `ENG.xg` 1, `ENG.fin` 0.85; goals
  2.5-3.0, shots 25-28, on target 7.8-8.9, draws 22-36%.
- Analysis tools: `scripts/match-analysis.cjs`, `scripts/analysis-render.cjs`, `scripts/analysis-summary.cjs`.

## Realistic scorelines and body orientation (2026.10.22.28)
From analysis rounds 3 and 4 (`docs/analysis/2026-10-22-round-3/`, `-round-4/`); rulebook first.
- **Body shape** (1c): every player faces somewhere (`p.fa`); turning takes time (Agility), slower sideways and
  backwards; defenders watch the ball and backpedal; team-mates open up on the half-turn; receiving with the back
  to goal needs a touch to turn (a tight marker stops it); passes, carries and shots behind where he faces cost
  time or quality; a defender facing the wrong way cannot tackle. Frames carry the 22 facings (width 73); the 2D
  view draws a pointer on each player.
- **Fair movement**: both sides read a start-of-tick snapshot of the other (the side moved first used to have an
  accidental edge of about 15 points).
- **Scorelines**: rounding the keeper is the exception (7.3); defenders jockey and tackle only when it is on (4.5);
  long balls are read in the air (4.9); the back line moves together at full speed (4.7); quality shows in
  proportion (rule 11: duel edges halved, finishing +/-12%, `ENG.qual` 0.55).
- **Calibration**: `ENG.fin` 1.12, `ENG.tackleFoul` 0.13. Three seeded worlds: goals 2.5-3.0, shots about 25,
  home/draw about 48%/25%, wins by 5+ 5-6% (was 13-17%), most goals by one team 8-10 (was 17-22).

## 2D view: readable and alive (2026.10.22.29)
`js/engine/live.js` only (the engine is unchanged).
- **Kits**: a kit must stand out from both colours of the other team's and from the grass; otherwise the second
  colour, otherwise the clearest alternative (`KIT_ALT`). Bigger markers (about 11 px on a phone).
- **Restarts**: the dead time of a throw-in, goal kick, corner, free kick or kick-off plays six times faster with
  a label (penalties at normal speed).
- **Movement**: players curve through the engine's half-second positions (Catmull-Rom); the ball too when it is
  carried; jumps (restarts, substitutions) stay straight.
- **Action cues**: the ball's trail while it travels (gold for a shot), a ring where possession is won, a ring at
  the keeper on a save, a quick fade between highlights.

## Story highlights and readable shots (2026.10.22.30)
- **Highlights** (`segments()` in live.js): a highlight is a story, from where the team won the ball (or the set
  piece it came from, at most 25 s before) to the finish: a goal, a shot, a penalty or a red card (extended adds
  low chances, yellow cards, offsides and through balls). Passing that ends in nothing is not a highlight.
- **Shots** (rulebook 7.6, `shotType()` in sim.js): placed, low drive, power, from distance, curler, chip, header,
  free kick, penalty; aimed away from the keeper (near or far post, height). Where the ball goes matches the
  outcome (inside the frame for a goal or save, wide or over for a miss); the keeper ends up where he dived. The
  chance of a goal is unchanged (the shot model).
- **2D view**: the ball rises to its target (a chip arcs), the keeper dives towards it, the net flashes on a goal,
  a label names the shot and then the result (Saved!, Wide, Over the bar); goals show a net. Commentary names the
  kind of shot and where it went. Card marks say whether a card is red.

## Zones, role profiles and the line (2026.10.22.31)
Rulebook 6.0 (zones and the living shape), 6.7 (wide roles), 4.7 (the line, not the man).
- **Roles defend differently** (`blockPlan` in shape.js): a Wide Midfielder makes a flat midfield line, Wingers sit
  just above it, an Inside Forward stays high in the half-space as the counter outlet (lower in a low block).
- **Roles with the ball** (`positionJobs`): the Wide Midfielder sits deeper and narrower than a Winger, supporting
  behind the ball; only the Winger attacks the far post; when the wide forward on his side plays inside, the
  full-back takes the touchline.
- **Runs by role**: Winger down the line, Inside Forward diagonally inside between full-back and centre-back,
  striker into the channel on the ball side.
- **The line, not the man** (`trackRuns`): back-line defenders follow a runner only on an open ball (carrier free,
  facing forward) or inside about 22 m; otherwise the line holds and the runner is offside. Midfielders hand
  runners on at the back line. Forwards play on the shoulder (`keepOnside`), with an occasional lapse (Off the
  Ball); passers misjudge tight offsides and through-ball timing (Vision). Offsides about 4-5 a match (was 2.6).

## 2026.10.22.32 — individual player profiles (owner-authorised release)

Rulebook 11a. All 887 named first-team players now have original, stable football profiles independent of
market value. Specialists keep distinct strengths/weaknesses, physique and authored familiar positions;
prospects/free agents use varied football types. Missing valuations no longer define named senior ability.
Profile baselines are stored separately; untouched saves migrate once, developed careers retain their
training and get a Settings note. Fixed a neutral-personality transfer memo with no harmony assessment.

23 suites exercised/passed after the targeted transfer-memo rerun; new 16-check player-profile suite,
3,555 strict audit assertions and 12 finite full-match contracts pass. Three seeds × 120 matches on each
version reveal higher challenge/foul rates and 11-/12-goal extremes. After disclosure, the owner explicitly
requested release and will reset the career; these match-balance limitations remain open.
See `docs/player-profiles/README.md` for the complete comparison, provisional-data limits and next work.

## 2026.10.22.33 — take-on episodes, tackle definition, body space (owner-requested release)

Released on the owner's request, with the match-balance limits below still open and the realism gate not passed.
Rule 4.5 now separates running at a man from carrying past
him. A carry is a take-on only when a defender can cut off its path in time, and a carrier takes a man on only
when he judges he can beat him more often than not (`carrierDecide`, `takeOn`). Blocked carriers who cannot
pass, shield or carry away. Only a take-on creates a forced contest (`challenges`), the take-on odds, and a
counted successful dribble; ground duels still count every contest.

Seed 3, 120 matches, before → after: fouls 32.3 → 28.1, tackles 38.6 → 30.4, successful dribbles 33.8 → 18.0,
ground duels 73.1 → 57.5, most goals by one team 12 → 7. Passes rose 640 → 678 (fewer carries), so the realism
gate has not passed. Dribbles remain above the rulebook's 8-10 per team; take-ons are still about two thirds of
contests. Strict audit 3,555 assertions and all 23 suites pass.
A defender level with the carrier is no longer a take-on (4.5); he jockeys. Seeds 1-3, 120 matches: fouls 26.6-27.5,
tackles 32-33, successful dribbles 16.5-16.9, ground duels 61. Goals rise to 2.9-3.2 and wins by 5+ to 7-8%, so the
side defence now needs work before any release.
Body space (`separateBodies`): every player is a soft circle, 0.2-0.36 m, sized by height and build. Players cannot
share ground: frames with two players closer than 0.4 m went from 5-6% to 0% on five recorded halves. Seeds 1-3,
120 matches: goals 3.0-3.3, wins by 5+ 5-7%, fouls 26.5-27.7, tackles 33-34, successful dribbles 16.8-17.4.
Duels and fouls are unchanged dice rolls; circles on screen are unchanged.
Tackles (rulebook 4.5): a tackle is a committed duel, won or lost, counted only when a defender commits (a take-on,
the ball exposed, the attacker turned, or a team-mate covering). Jockeying is no duel and counts nothing. Circles
on the live pitch and in analysis frames are the body radius at pitch scale (`bodyRadius`, 0.3-0.46 m), so the
on-screen contacts match the physics. Seeds 1-3, 120 matches: goals 2.6-2.9, fouls 25.5-25.9, tackles 31-32 (still
above the 15-20 target), dribbles 17-18 (target 8-10), wins by 5+ 4-9%, home wins 43-48%.
Tested a lower commitment rate (0.04 instead of 0.09 for exposed or covered duels) on seeds 1-3, 120 matches: tackles
22 per team, ground duels 44, fouls 20-21, goals 2.9-3.4, wins by 5+ 5-10%. Fewer tackles but fewer duels and more
goals, so it was reverted. Tackle counts are a calibration question still open; goal excess is a defence question.
Passing diagnosis (handover item 5, not yet changed): 72% of carrier decisions are passes; 42% of passes go more than 3 m
backward, and in the middle third without pressure 64% do (rule 3.8 says forward first). Forward options exist (90% of
unpressed middle-third moments have an onside team-mate 4-30 m ahead) but the top-four pass cut removes them, and their
value loses to backward passes because the receivers are marked (median 4.7 m from the nearest opponent, against 15.8 m
for team-mates behind the ball) and the passes are riskier (risk 0.39 against 0.15). The fix is attacking support
movement into free space between the lines, not the pass weights alone. Keeping the best forward pass in the cut
changed backward share from 64% to 61%, so it was not kept.
Attacking movement tests (handover item 5), all reverted: six matches each, balanced against balanced, full time.
(1) Wider free-space search for attackers (5x5 zone, forward bonus): forward receivers moved only from 4.6 m to 4.9 m
from the nearest opponent, and goals fell from 2.7 to 1.7 per match. Marking defenders follow runners, so the space
does not open. (2) Back players not on rest-defence duty look for free space: back line still for 34-36% of the time
instead of about 50%, but goals per match rose from 2.5 to 3.0. (3) Skill-based pass risk (passer's Vision, Passing,
Decisions, Composure; receiver's Off the Ball, First Touch): forward passes rose from 36% to 40%, passes per minute
fell from 7.3 to 7.2, but goals rose from about 2.7 to about 3.1 on 120-match seeds 1-3. Steps 2 and 3 together gave
goals 3.2-3.6 and wins by 5+ at 7-12%. Next attempt: the defence has to respond to forward movement, not only attack.

## 2026.10.22.34 — live match: red-card gap, tactics page, penalty run-up, dribble (owner-requested release)

A man down: a sent-off player is not replaced. The manager is asked to move one of his players into the gap, and the
spot that player leaves becomes the new gap. The player keeps his place on the pitch; he is not a new arrival.
In-match tactics: the tactics sheet shows the pitch with every player. Two players can swap places (keepers only with
keepers), and a player's role can be set. Roles and instructions belong to the slot, so a swap keeps them in place.
Presentation only: a penalty taker runs in from six metres behind the spot before the kick; a carrier on the move has the
ball just ahead of his feet and bobs with his stride. No change to match outcomes from these three items.
Verified: 25 test suites, the strict audit, the 12-match contract, and browser checks for the tactics page, the gap and
the penalty and dribble views. The penalty run-up was not checked by eye; the dribble frame was.
The match-balance limits in 2026.10.22.33 are unchanged and still open.
Unreleased (live match): the computer side closes a man-down gap itself (`fillGapAI`): the team-mate who fits the gap best
moves in, and the gap is left in an attacking slot where possible. Ten men still leave one slot empty. The live tactics
page now has set pieces and captain (penalties, free kicks, corners, captain), chosen from the players on the pitch.

## 2026.10.22.35 — computer side closes its man-down gap; set pieces and captain in the live tactics page (owner-requested release)

After a red card the computer side moves the team-mate who fits the gap best into it, leaving the gap in an attacking
slot where possible. Ten men still leave one slot empty. The live tactics page adds set pieces and captain (penalties,
free kicks, corners, captain), chosen from the players on the pitch and kept for that match only.
Verified: 25 test suites, the strict audit, browser checks for the tactics page and the set-piece choice, and a gap check.
The match-balance limits from earlier releases are unchanged and still open.

## 2026.10.22.38 — shot path drawn along its flight; role changes take effect at once (owner-requested release)

A shot in flight is drawn along its real path, from the shooter to the target at shot speed. The frames are 0.5 s apart
and a shot lasts about 0.4 s, so the ball is no longer interpolated across that gap. Outside a shot the ball is drawn
where the engine places it, as in 2026.10.22.36.
A role chosen on the First XI tab takes effect at once: the shape and behaviour caches are cleared, so the new role
drives the next moves rather than waiting for the cache to refresh.
This branch is merged with the owner's 2026.10.22.36 (smooth 2D playback, grounded running motion) and 2026.10.22.37
(matchday First XI and live condition indicators). Their First XI and ball drawing are kept.
Verified: 24 node suites, the strict audit (0 failures), the live tactics browser test (28 checks, including the shot path,
the penalty run-up and the role cache reset) and the live animation browser test.
The match-balance limits from earlier releases are unchanged and still open.

## 2026.10.22.39 — assistant coach: pre-season friendlies on the fixtures screen (owner-requested release)

In pre-season the fixtures screen offers an assistant coach. He looks at the overseas clubs already in the game, takes the
eight closest in strength to us, plays each one two simulated games on the engine (home and away), and ranks them by
strength gap and by how close those games were. The results are estimates, not a forecast.
Arranging a club puts a friendly in a free pre-season week (weeks 0–4), with us at home. Friendlies carry a `fr` flag and
are kept out of the league table. The analysis leaves every career stat and condition unchanged.
Verified: tests/friendlies.cjs (9 checks), tests/friendlies-ui.cjs (7 checks, browser), all node suites, the strict audit,
and the live tactics browser test.
The match-balance limits from earlier releases are unchanged and still open.

## 2026.10.24.4 — Premier League squad registration, expansion players and shirt numbers

The 43 supplemental Premier League identities from the supplied ability-profile document now join their listed clubs
as first-team players in new careers, and are added idempotently to existing careers when still at their original
Premier League club. Their supplied 1–20 attributes and potential are preserved in the game profile data. Premier
League clubs keep a season-specific list of up to 25 senior players; eligible Under-21 players are exempt, and the
match picker excludes unregistered senior players. Managers can edit their list from Squad; it renews at season rollover.
The Squad page can sort players by kit number. Manual number changes require an open transfer window and enforce a
unique club number from 1–99. JavaScript syntax checks passed; the full test suites and live browser checks were not run.

## 2026.10.24.5 — keep transfer search on fictional player names

Player display names remain fictional, while the bio shows the inspirational figure name. Transfer search matches
fictional display names only. Inspiration metadata also remains part of roster identity and simulation linking.
