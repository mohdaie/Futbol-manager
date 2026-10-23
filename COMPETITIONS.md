# English leagues, 2026/27

New careers have 20 Premier League clubs and 24 Championship clubs. Club selection shows the game's nickname and the source's standard club name. Existing careers retain their clubs, player IDs, attributes, contracts, dates and fixtures; starting a new career is required for the new league membership. Export an existing career before replacing it.

Membership and all 932 home/away fixtures come from the pinned OpenFootball snapshot in [data/england/sources.json](data/england/sources.json). Source scores are not imported. Subsequent seasons regenerate pairings using the two divisions' fixture-slot templates.

## Squads and player identities

Championship clubs start with 24 first-team players and 12 generated reserves. The combined ownership limit is 36, with no U 18 squad. Transfers, contracts, AI recruitment, intake, admin creation and automatic top-ups check capacity before changing ownership or money. New prospects join the reserves if space exists. Moving a player between these two squad groups does not consume another place.

Premier League clubs start with 25 first-team players, 20 reserves and 20 U 18 players. The Championship ownership limit does not apply to the Premier League. These are game squad sizes, separate from real-world registration rules.

First-team facts use these sources:

- Premier League: FPL mirror snapshot dated 22 October 2026, choosing 25 players per club with positional coverage. Football nationality takes precedence over the first citizenship in an older identity record.
- Burnley, West Ham and Wolves: the existing authored game squads, excluding known current Premier League players.
- Other Championship clubs: the accessible September 2025 Transfermarkt profile snapshot. This is an explicitly dated fallback, **not verified 2026/27 player membership**. Known current Premier League memberships override it. Incomplete identities are omitted, and unfilled first-team positions are generated.

The build report records source and generated counts per club. Names are fictional, using existing aliases or nationality-specific similar name pools. The actual player's name appears as the inspirational figure. A generated gap or reserve prospect has no invented real inspirational figure. One inspiration is assigned to at most one starting first-team player across domestic and overseas clubs.

Existing authored ability profiles are reused where available. Other sourced identities have deterministic procedural game attributes and potential; those are original game ratings, not researched abilities, EA ratings or valuations. Contracts and procedural body measurements are game values. The source attribution and FPL license notice are in `data/england/`.

Rebuild identity facts after checking out the pinned mirrors:

```sh
python 3 scripts/build-england-rosters.py /path/to/Fantasy-Premier-League/data/2026-27 /path/to/player_profiles.csv
```

## Implemented competition format

Both divisions use three points for a win and one for a draw, separate league tables and awards, nine substitutes, five substitutions and three substitution windows. Half-time substitutions do not use a window.

The Premier League has 38 matches per club. Its bottom three exchange places with the Championship's top two and playoff winner at rollover. Championship clubs play 46 regular-season matches. Places 3–6 play two-legged semifinals (3 rd v 6 th and 4 th v 5 th), with the higher seed home second, then a neutral final. There is no away-goals rule. Tied deciding legs use 30 minutes of extra time, then penalties. Extra time permits a sixth substitute and fourth window. Playoff results do not affect league points. Playoff scheduling uses game dates after the final Championship round; it does not claim confirmed official 2027 playoff dates.

A relegated club retains its best 24 first-team players (protecting two goalkeepers) and 12 remaining prospects. Excess players enter the free-agent pool with the game's contract compensation; the season review lists the managed club's releases. Championship clubs continue to respect the 36-player cap through subsequent seasons.

Yellow-card thresholds use 5 by club game 19/23, 10 by 32/37, and 15 across the regular season for Premier League/Championship. Second-yellow dismissals carry one match; the game's default straight-red category carries three. Friendly matches do not count league cautions or serve competitive bans. Outstanding bans survive rollover. This remains a simplified disciplinary model, without all FA offence categories, appeals or misconduct hearings.

## Background club setup: Spain, Italy, Germany and France

Release 2026.10.22.45 adds a separate, browsable club registry for La Liga (20 clubs), Serie A (20), Bundesliga (18) and Ligue 1 (18). The 2026/27 membership comes from the same pinned OpenFootball revision; all club names and source URLs are recorded in [data/world/sources.json](data/world/sources.json). These are community source snapshots, not independently checked official league publications.

The registry remains separate from `G.leagues`: no foreign league fixtures, results, promotion/relegation or manageable career choices are enabled. Twenty selected leading clubs now have transferable players and can be arranged as friendly opponents directly from their club dashboard. Club directory filters retain nicknames alongside standard names.

New careers use 11 first-team players and six reserve prospects per selected club. The four existing counterparts (Real Madrid, Paris Saint-Germain, AC Milan and Bayer Leverkusen) keep their club IDs. In older careers their complete squads, trained attributes, contracts, ownership and sold/retired identities are preserved; only missing reserve slots and the 16 newly populated clubs are seeded. The one-time migration never rebuilds first teams at those four legacy clubs.

Academy strength is a separate 1–20 game estimate for these 20 clubs, based on historical development reputation. It affects reserve prospect potential and training quality independently of club reputation. There is no annual intake or generated reserve refill. Departures can be replaced with existing free agents; compact squads remain bounded. Older authored rosters have a capacity exception so existing players are not deleted.

The remaining 56 clubs retain 25 virtual placeholder slots with no player ID, attributes, age, contract or inspirational figure. They cannot own players, arrange friendlies, recruit, train, generate managers or enter weekly finances. Three rollover checks verify that they stay empty and selected clubs create no new annual intake.

The selected clubs, source dates, generated gaps and performance measurements are documented in [data/world/SQUADS.md](data/world/SQUADS.md). The accessible identity snapshot is September 2025, supplemented by existing authored squads; this is not a verified 2026/27 roster update. Academy ratings are original estimates, not official rankings.

Dedicated validation:

```sh
node tests/world-squads.cjs
node tests/world-leagues.cjs
node tests/world-leagues-ui.cjs
```

## Deliberately pending

Official 2026/27 PL/EFL handbooks were inaccessible in the environment. This release does not claim full verification of every current competition regulation.

- The bottom three Championship positions are marked, but movement into League One is held until that division exists.
- Senior-list/homegrown/Under-21 registration, loan quotas, financial regulations, exceptional disciplinary cases and official broadcast/prize distributions are not enforced. Configuration fields for registration are preparatory only.
- After the model's points, goal difference, goals, wins (Championship) and head-to-head criteria, an unresolved exact tie uses a stable club-ID order. A special neutral league-position decider is not implemented.
- FA Cup, League Cup, European competitions and team-only simulation of additional countries are not part of this release.
- English academy facilities retain their existing reputation-based starting value. Selected overseas clubs have independent historical development estimates; an officially verified academy ranking is not implemented.

## Validation

The focused suites cover club membership against the pinned source, all home/away pairings, date conflicts, separate tables, identity and nationality coverage, deterministic procedural attributes, Championship capacity checks, caution thresholds, playoff aggregate/extra time/penalties, mobile navigation, two rollovers and durable save/reload. Existing release-43 saves are also compared before and after load: their players and fixture payloads remain unchanged.

```sh
node tests/competitions.cjs
node tests/england-rosters.cjs
node tests/competition-discipline.cjs
node tests/championship-ui.cjs
node tests/player-profiles.cjs
node tests/background.cjs
node tests/storage.cjs
node tests/input-recovery.cjs
node tests/dashboard-friendlies.cjs
node tests/live-red-card.cjs
node tests/navigation.cjs
```
