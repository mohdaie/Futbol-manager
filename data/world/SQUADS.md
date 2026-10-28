# Selected overseas squads

Five established leading clubs per country receive compact squads. This is an original game selection, not a claim that these are the current top five in each table.

| Country | Selected clubs |
| --- | --- |
| Spain | Real Madrid, Barcelona, Atlético Madrid, Athletic Club, Villarreal |
| Italy | Inter, Juventus, AC Milan, Napoli, Atalanta |
| Germany | Bayern Munich, Borussia Dortmund, Bayer Leverkusen, RB Leipzig, Eintracht Frankfurt |
| France | Paris Saint-Germain, Marseille, Monaco, Lyon, Lille |

New careers have 11 first-team players and six reserves per selected club, including two goalkeepers. Names are fictional; 334 of 340 initial slots have real inspirational figures and six reserve gaps are generated. The generated slots are Napoli/Leverkusen/Lille backup keepers, two Leipzig outfield reserves and one Lille outfield reserve. Game abilities, potential, contracts, wages and values are original estimates.

The reference data contains 293 identities from the accessible September 13, 2025 Transfermarkt mirror and 41 existing authored identities from the game. Current known English affiliations are excluded using the October 22, 2026 FPL snapshot and the checked-in English squads. These are not verified complete 2026/27 foreign rosters. Where an existing game football nationality is unavailable, the older mirror's first citizenship is used; this is not a claim about current international eligibility. Reserve-team affiliation does not prove a player was trained at that academy from childhood. Exact provenance and limitations are in [squads-sources.json](squads-sources.json); per-club identities/gaps are in [squad-report.json](squad-report.json).

The academy strength parameter is an original 1–20 estimate based on historical development reputation, independent of overall club reputation. It affects initial prospect potential and ongoing reserve training up to age 24. It is not an official 2026 academy category or ranking. Prospects develop through training, but these clubs never receive annual youth intakes or generated level top-ups.

## Other overseas clubs: virtual read-only squads (before v1.1.0)

*Superseded: from v1.1.0 these 56 clubs have real squads, and from v1.2.0 reserves, U18s and a yearly intake (see the last section). The placeholder rules below still apply to older saves until they load once.*

The other 56 clubs keep no player records. Their 25 squad rows are deterministic virtual identities with country-matched name pools and nationalities. They have no profiles and are neither scoutable nor transferable; they do not enter search, simulation, or saves. The generated country / other-EU / non-EU mix is Spain 14/8/3, Italy 8/10/7, Germany 8/10/7, and France 8/10/7.

The Spanish mix respects the domestic first-team limit of three non-EU registrations; there is no domestic minimum for Spanish nationals. Italy, Germany, and France do not use a simple league-wide nationality minimum or cap for the whole domestic squad, so their 8 local / 17 international split is only a plausibility target, not a claimed legal quota. UEFA's separate 25-player List A has eight locally trained slots (with club-trained sublimits); local training depends on a player's history and cannot be inferred from nationality. These virtual identities carry no training history and are not represented as UEFA-eligible. Italy's foreign-signing limits apply to new registrations in transfer windows and do not apply to these non-signable display rows. Current official rule pages were not reachable from the onboarding network, so this models the stable league-level distinctions above and does not claim full 2026/27 registration compliance.

Foreign league calendars stay inactive: no added league fixtures, tables, promotion/relegation or management jobs. The clubs can play friendlies against the managed English team and their actual player records can be transferred. Vacancies are filled, where possible, by promoting existing reserves and recruiting existing free agents; this process creates no player records.

Existing careers retain all players, ownership, trained skills, contracts and existing fixtures. The four old authored squads keep their full rosters and receive up to six reserves, with a capacity exception to avoid deleting anyone. Sold or retired first-team identities at those four clubs are never seeded again. New clubs are populated once; people already owned elsewhere are replaced with openly fictional gaps. Source ages and new game contracts are advanced to the career season. Repeated loads and rollovers do not rerun the initial seeding.

To reproduce identity data from local pinned mirrors:

```sh
python3 scripts/build-world-squads.py /path/to/player_profiles.csv /path/to/FPL/data/2026-27
```

The builder imports identity facts only, not commercial valuations or ability ratings. It is deterministic; source revisions are recorded with the data.

## Validation

The focused checks cover 20 squads, first-team/reserve composition, duplicate exclusion, original aliases, source dates, caps, transfer ownership, all 20 friendly lineups, a complete match, independent academy development, progressed legacy careers, sold/retired identities, three season rollovers, phone-width navigation and durable saves.

```sh
node tests/world-squads.cjs
node tests/world-leagues.cjs
NODE_PATH=/opt/codex/cua_node/lib/node_modules CHROMIUM_PATH=/usr/bin/chromium node tests/world-leagues-ui.cjs
```

## Performance observation, 23 October 2026

The feature was compared with release 2026.10.22.45 in local headless Chromium at 390×844, DPR 3, with a synthetic 6× CPU slowdown. Menus used five render/two-frame samples; saves used three samples. These are laboratory observations, not field phone measurements. The parent branch's later Search/UI improvements are outside this comparison.

| Measurement | Release 45 | Squad draft |
| --- | ---: | ---: |
| Full player records, new career | 2,556 | 2,791 |
| Active league fixtures | 932 | 932 |
| Save after the probe |2.04 MB|2.28 MB|
| New-career tap through dashboard and durable save |1.93 s|2.40 s|
| Dashboard paint sample, median |105 ms|148 ms|
| Squad paint sample, median |100 ms|133 ms|
| All-clubs directory paint sample, median |242 ms|317 ms|
| Synchronous copy into save worker, median |67 ms|84 ms|
| Durable save, median |138 ms|162 ms|
|32 computer fixtures, one sample |1.62 s|1.80 s|

New careers add 235 full records (+9.2%) rather than generating squads for all 76 clubs. A previous-release career keeps its larger four authored squads and adds up to 296 records instead. Initial source data is 41.5 KB uncompressed. There are no extra weekly league matches, but training, linking, search and saving must handle the additional players.

The draft's 12-second live sample averaged 55.6 FPS with three frame intervals over 50 ms and a longest interval of 117 ms. Live runs varied substantially, including the baseline; this does not establish an FPS improvement or guarantee smooth playback on phones. Real Android Chrome and iPhone Safari remain untested.

The existing renderer invalidates the full entity-name index on every render, and save-worker posting still synchronously copies the whole career. Both remain performance costs as the player database expands. They were deliberately left for separate performance work; this feature does not claim to solve those pauses.

## Full overseas squads and academies (v1.1.0, v1.2.0)

All 76 overseas clubs now have a full 25-man first team. The 20 selected clubs keep their 11 first-team players and six reserves and gain 14 more first-team players (31 in total). The other 56 clubs stop being placeholders and receive 25 first-team players each, so they can be scouted, signed from and played in friendlies. `data/world/overseas/` holds the source tables and `js/core/world-full-squads-data.js` the compact game data.

| File | Contents |
| --- | --- |
| `data/world/overseas/big_overseas_clubs_completed_squad_rosters.md` | The 14 added slots for each of the 20 selected clubs (280 players), repaired from `big-clubs-draft.md`. The change log at the end lists each repair. |
| `data/world/overseas/other_overseas_clubs_squad_rosters.md` | Generated 25-man squads for the other 56 clubs (1,400 players). |
| `js/core/world-full-squads-data.js` | Both tables as game rows (`OVERSEAS_FULL_SQUADS`), generated by the script. |

Every name is fictional and unique across both files. `inspired_by` only records the real-world archetype of a big-club player, and is `-` for generated players and for slots whose real person already has a player elsewhere in the game. Spanish clubs have at most three Non-EU players in the added slots, and the Basque-only rule is applied at Athletic. Attributes are calibrated so the game's own position rating (`ratingFor`) equals the stated CA.

Names were cross-checked against about 128,000 real name keys: the Transfermarkt player profiles (about 92,000 players including retired ones), the 2025/26 FPL player list and every name in the game files. No generated name matches a real player's full name or their first + last name. To regenerate with that check, set `OVERSEAS_REAL_NAMES` to the colon-separated paths of `player_profiles.csv` and FPL `players_raw.csv`; without it, only the game files are checked. Run `python3 scripts/build-overseas-squads.py`; output is deterministic and the script fails if any club breaks its CA band, squad size, EU status, U21 flag or Non-EU limit.

**How the game loads them.** `ensureOverseasFullSquads()` runs after the compact squads are seeded, in new careers and when an older save loads. Each player has a stable source ID (`ov26:<club>:<slot>`), so a repeated load never re-adds someone who was sold, retired or released. A converted club gets its reputation, a formation, an estimated academy strength (from reputation, not an official ranking), a manager and a starting balance. Ages advance with the career season, and players who would be 38 or older are not added.

**Youth teams (v1.2.0).** `ensureOverseasYouth()` gives a club the English reserve and U18 structure: 20 of each, generated with the club country's name mix (about three quarters home-grown), no squad cap, and at each rollover U18s who turn 19 move up, reserves aged 23 or over step up or leave, and both youth levels are refilled with newly generated players. This is what a playable league uses. From v1.3.0 the four overseas leagues are simulation-only, so their clubs use the lighter structure below instead.

**Simulation-only leagues (v1.3.0).** `js/systems/world-sim.js` runs a league with `active: false` (`isSimClub(club)`) without fixtures in `G.fixtures` or the match engine:

- **Results.** One round per calendar week (the English `SCHEDULE`), played by `simWorldWeek()`. Each club's strength is the mean CA of its best XI (the better keeper and ten best outfielders); goals are Poisson draws with home advantage, so a signing or an injury really changes the table. The table is a few numbers per club in `G.worldLeagues[id].table`; the directory shows it, club pages show the league position, and each season's champion is announced and kept in `history`. Over 20 simulated seasons of each league: about 2.8 goals a match, champions 66–97 points (80 on average), bottom clubs 15–34 (24 on average).
- **Transfers.** `simTransferWeek()` runs each week a window is open (summer about 30% of clubs a week, January about 16%, rising towards the deadline). A club finds its weakest starting position and signs a better player from a club of equal or lower reputation or from the free agents, if it can afford 40% of its budget; fee, wages and contract follow the existing rules, nobody moves twice within 25 weeks, and sellers keep at least 19 first-team players. The English clubs' own market and the bids for your players already include these clubs. Only notable deals (fees from £20m, big clubs, or English clubs) are announced, at most four a week.
- **Development.** Simulated players skip the weekly training pass and are developed in one batch at the end of the season (38 passes), together with a transfer-budget top-up for each club. If a player moves to a club that trains, his condition is reset.
- **Prospects.** Each club keeps its best three prospects (reserve level) instead of 20 reserves and 20 U18s. At rollover prospects aged 21 step up or leave and the prospects are topped up. Older v1.2.0 careers are trimmed once, keeping shortlisted, scouted or negotiated players.
- **Making a league playable.** Setting `active: true` on a league stops its simulation; `ensureOverseasYouth()` then builds the full 20 + 20 youth teams. League fixtures, a managed-club option and an English-style calendar for it are not built yet.

**Cost (v1.3.0).** A new career holds about 4,600 player records (7,660 in v1.2.0, 2,830 in v1.0.0) and the save is about 3.8 MB (5.4 MB, 2.35 MB). A simulated season of the four leagues' results took about 40 ms and the transfer windows about 140 ms in local headless Chromium. These are laboratory observations, not phone measurements.
