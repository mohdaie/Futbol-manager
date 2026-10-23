# Selected overseas squads

Five established leading clubs per country receive compact squads. This is an original game selection, not a claim that these are the current top five in each table.

| Country | Selected clubs |
| --- | --- |
| Spain | Real Madrid, Barcelona, Atlético Madrid, Athletic Club, Villarreal |
| Italy | Inter, Juventus, AC Milan, Napoli, Atalanta |
| Germany | Bayern Munich, Borussia Dortmund, Bayer Leverkusen, RB Leipzig, Eintracht Frankfurt |
| France | Paris Saint-Germain, Marseille, Monaco, Lyon, Lille |

New careers have 11 first-team players and six reserves per selected club, including two goalkeepers. Names are fictional;334 of 340 initial slots have real inspirational figures and six reserve gaps are generated. The generated slots are Napoli/Leverkusen/Lille backup keepers, two Leipzig outfield reserves and one Lille outfield reserve. Game abilities, potential, contracts, wages and values are original estimates.

The reference data contains 293 identities from the accessible September 13,2025 Transfermarkt mirror and 41 existing authored identities from the game. Current known English affiliations are excluded using the October 22,2026 FPL snapshot and the checked-in English squads. These are not verified complete 2026/27 foreign rosters. Where an existing game football nationality is unavailable, the older mirror's first citizenship is used; this is not a claim about current international eligibility. Reserve-team affiliation does not prove a player was trained at that academy from childhood. Exact provenance and limitations are in [squads-sources.json](squads-sources.json); per-club identities/gaps are in [squad-report.json](squad-report.json).

The academy strength parameter is an original 1–20 estimate based on historical development reputation, independent of overall club reputation. It affects initial prospect potential and ongoing reserve training up to age 24. It is not an official 2026 academy category or ranking. Prospects develop through training, but these clubs never receive annual youth intakes or generated level top-ups.

Foreign league calendars stay inactive: no added league fixtures, tables, promotion/relegation or management jobs. The clubs can play friendlies against the managed English team and their actual player records can be transferred. Vacancies are filled, where possible, by promoting existing reserves and recruiting existing free agents; this process creates no player records.

Existing careers retain all players, ownership, trained skills, contracts and existing fixtures. The four old authored squads keep their full rosters and receive up to six reserves, with a capacity exception to avoid deleting anyone. Sold or retired first-team identities at those four clubs are never seeded again. New clubs are populated once; people already owned elsewhere are replaced with openly fictional gaps. Source ages and new game contracts are advanced to the career season. Repeated loads and rollovers do not rerun the initial seeding.

To reproduce identity data from local pinned mirrors:

```sh
python 3 scripts/build-world-squads.py /path/to/player_profiles.csv /path/to/FPL/data/2026-27
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
