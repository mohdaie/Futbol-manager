# Futbol Manager: game structure

A browser football manager built for a phone held in portrait. Plain HTML, CSS and JavaScript with no build step and no libraries. To play it, open `index.html` from any static web server, or use the published artifact.

## 1. File map

```
index.html                 page shell; loads the CSS and every script in order
css/game.css               all styling (design tokens are at the top)
js/core/util.js            random numbers, maths, money/date formatting
js/core/data.js            STATIC DATA: clubs, nations, names, attributes, formations,
                           roles, instructions, training, press questions, talks, shouts
js/core/rosters.js         ROSTERS: the 20 real-based squads (level, name, position, age,
                           nation, foot, contract, value). Ratings come from market value.
js/core/players.js         player generation, ratings, position fit, value, wages
js/core/bio.js             personal details (height, weight, character, ambition, favourite
                           person and manager), club managers, and how they affect the game
js/core/state.js           the game state object G, new-game world build, save/load,
                           news, auto-pick, squad helpers
js/core/playtime.js        per-career active time, session counts and background pause
js/core/calendar.js        weeks and dates, fixture generator, transfer windows, league table
js/engine/pitch.js         tactical styles, role behaviour, player instructions, positions() and the offside line
js/engine/sim.js           match engine v2: each minute's chain of player-against-player actions (ev.seq)
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
js/ui/ui.js                router, app shell, bottom sheets, toasts, click dispatch
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
- **Calibration** (380-match runs): about 2.7–2.9 goals, 29 shots, 3.2 yellow cards, 0.3 penalties, 3–4 offsides, 21 fouls and 10 corners per match. Pass completion is about 84%, and home sides win about 43%.
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

**Squads and levels.** Every player has a level: `A` first team, `R` reserves (under-21), `Y` U18s (`LEVELS` in data.js, `lvlOf()` in players.js). Only the first team is picked for league matches; reserves step in when fewer than 16 first-teamers are fit. First-team rosters come from Transfermarkt's 2026/27 squads (read with Firecrawl), renamed into different names with a similar sound (Bukayo Saka becomes Kayode Bako). Each player keeps his age, nationality and position. Ratings come from market value (`ratingFromValue()`). Where a club's real youth list was short or not available, `fillLevel()` in state.js generates the rest of the reserves and U18s to 20 each. Positions are filled first, ages are 18 to 21 for reserves and 15 to 17 for U18s, and better clubs get higher potential. At each season end, U18s who turn 19 move to the reserves. Computer clubs promote or release reserves aged 23, promote their best reserves before signing free agents, and refill both youth levels. Signed players join the first team.

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
| Engine | Sliders for the engine constants (`TUNE_DEFAULTS` in data.js, saved per game in `G.tune`). **Run test season** plays all 380 matches on a copy of the save and reports goals per game, home/draw/away split, shots, xG, cards, top scorer and the points range. |
| AI Brain | The learning engine: mode for real matches, training camp, what it has learned, engine versions (test, approve, roll back), the DeepSeek press question library, recent decisions. |
| Jev AI | Connection settings for TypeSafe Jev: on/off, direct key or proxy URL, model, timeout, monthly budget, which features it will drive, a **Test connection** button, this month's calls/tokens/cost and a call log. |
| DeepSeek | The same for DeepSeek, plus base URL, max reply length, temperature and thinking mode. |
| Data | Squad fixes (heal injuries, clear bans, full condition, morale, sharpness, add academy players), money, reveal every player, add free agents, news clean-up, delete save |

**AI services:** settings are stored under their own browser key (`futbol-manager:ai`), never inside the game save, so an exported save never contains an API key. `jevAsk(state, questions)` and `dsChat(messages)` in `ai.js` are the two functions game features will call. Recommended picks: **jev-latest** ($0.042 per 1M input tokens, output free) and **deepseek-flash with thinking off** ($0.15-0.30 per 1M input, $0.60-1.20 per 1M output). A full season costs well under $1 for both together. DeepSeek accepts direct browser calls. Jev uses the Personal relay in the musab-agents development project to avoid direct browser connection failures. Each player supplies their own key; the relay forwards it to TypeSafe without saving it. The separate `futbol_manager_ai_requests` table stores only connection diagnostics. Relay code, schema migration and production move instructions are in `supabase/functions/futbol-jev/README.md`. Server key mode remains available for a server-managed shared key.

**Access control:** `adminAllowed()` at the top of `screens-admin.js` returns `true` for everyone. To restrict the page later, make it return `true` only after your own check. It hides both the More menu entry and the page. Because the game runs entirely in the browser, a check in this file only hides the page. Real protection needs a server login (for example Supabase Auth) and server-side saves.

## 6. AI Brain (learning engine)

Computer managers make a tactical decision at half-time and at 60, 70 and 80 minutes. They choose from five options: **attack, hold, defend, press, fresh legs** (`MGR_OPTIONS` in brain.js). The loop runs entirely on this device; there is no central logging.

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
3. **Loans.** Use the same flow as transfers with a `loan` flag, a return date and wage sharing.
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
