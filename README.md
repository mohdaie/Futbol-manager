# Futbol Manager

A football manager game for the browser, designed for a phone held in portrait. Plain HTML, CSS and JavaScript with no build step and no dependencies.

## Play

- **Online:** turn on GitHub Pages for this repo (Settings → Pages → Deploy from a branch → `main`, folder `/ (root)`). The game is then at `https://mohdaie.github.io/Futbol-manager/`.
- **Locally:** run any static server from the repo root, for example `python3 -m http.server 8000`, then open `http://localhost:8000`. Opening `index.html` straight from disk is not supported.

Your career saves automatically in the browser. Use Settings → Export save to keep a backup.

Autosaves use IndexedDB on this device, with serialization and database writes in a worker. Existing localStorage careers are copied and verified before use; their original recovery copy is retained. Save now and Save & return to title wait for the checkpoint to finish. If you close or refresh during an unfinished save, the browser can ask you to stay until it completes. Clearing site data still removes local saves.

Settings also offers a portable JSON download and file import, plus the existing save-code format. Browsers with file-system access can update a user-selected save file. These files are manual backups; they are not cloud saves.

Unwatched computer fixtures use an event-based engine. Your watched matches and instant results retain the detailed positional engine. Normal gameplay runs both models in a Web Worker, keeping match generation off the rendering thread. See [PERFORMANCE.md](PERFORMANCE.md) for validation commands and compatibility details.

## What's in it

- The 2026/27 Premier League (20 clubs) and Championship (24), selectable for new careers. Championship clubs have first team and reserves only, with a combined 36-player limit. Premier League clubs retain reserves and U18s. First-team names are fictional, with real inspirational figures where sourced; prospects and roster gaps are generated. The Championship identity fallback is dated September 2025. See [COMPETITIONS.md](COMPETITIONS.md) for source dates, promotion/playoffs, squad policy and pending official regulations.
- Premier League first-team display names use the supplied culturally grounded 2026/27 map where an inspirational figure matches the game roster. Existing browser careers migrate those names too. Unmatched identities remain unchanged; see the [name map review](docs/ENGLAND_NAME_MAP.md).
- Five playable countries, each with two divisions: England (Premier League 20, Championship 24), Spain (La Liga 20, Segunda División 22), Italy (Serie A 20, Serie B 20), Germany (Bundesliga 18, 2. Bundesliga 18) and France (Ligue 1 18, Ligue 2 18). Pick a country, a division and a club on the new-game screen. The country you pick is played in full (fixtures, reserves/U18s or reserves, promotion and relegation with playoffs). Every other country runs as a lightweight simulation in the background: full fixture lists on the English calendar, strength-model results and live tables, transfer windows between all simulated clubs, season-end development, and promotion and relegation between its two divisions. First-division simulated clubs have a 25-man squad of fictional, scoutable and transferable players with a few prospects; second-division simulated clubs are lightweight strength ratings that get a squad only when promoted (and release it to free agents when relegated). The Spanish, Italian, German and French second-division lists are in [data/world/overseas/second-tier-clubs.md](data/world/overseas/second-tier-clubs.md).
- Squad, tactics with separate in-possession and out-of-possession shapes, roles and instructions.
- Transfers with scouting fog of war, agent pitches, bids and contract talks. Negotiate instalments, valued player exchanges, sell-on shares and fixed buy-back rights; Finance tracks future payments. Temporary loans go through club talks and counteroffers, player agreement, a medical and final manager approval, with a fee, wage share, recall clause, purchase option and appearance-triggered purchase obligation. Individual scouting takes up to two weeks, with faster reports near the transfer deadline. See [TRANSFER_PACKAGES.md](TRANSFER_PACKAGES.md) for permanent transfer rules. Search opens with up to 20 players linked to recent in-game transfer stories; submit a name or filters to browse the database in pages of 20.
- Training, medical centre, youth academy, finances, staff, board and fans, news and inbox.
- A live match with 2D, Formation, Line up and Match stats tabs for both teams, commentary, substitutions, shouts and half-time team talks, plus instant results. Teams change ends at half-time; live condition and fatigue are in Line up.
- A real fixture calendar: Friday to Monday and midweek kick-off times, TV games, cup weekends and international breaks. Rest days, weather and kick-off time affect fitness, injuries and results.
- **Admin page** at `/admin/` (not in the game): API keys, AI settings and AI usage, stored in Supabase. Editing clubs, players, time and the match engine works on a career save, so it stays inside the game and is hidden from players: add `?admin` to the game address, then More → Admin. The **AI Brain** (a learning engine for computer managers, with versions you approve) is there too.

The full design, file map and how to extend it are in [STRUCTURE.md](STRUCTURE.md).

## AI services (optional)

Set them up on the `/admin/` page (`https://mohdaie.github.io/Futbol-manager/admin/`). Keys are saved in Supabase and used by the `futbol-jev` and `futbol-deepseek` relays; they never reach the player's browser or save. Players get the settings you save (on or off, model, features, budget) when the game opens. See [supabase/functions/futbol-admin/README.md](supabase/functions/futbol-admin/README.md).

There is no sign-in on the admin page yet, so treat the address as private.

## Assets

`public/assets/clubs/` holds the 129 approved Armoury Shield club crests as transparent, mobile-sized WebP files. The same renderer supplies club selection and every in-game badge, including existing careers. Free agents, unknown clubs and failed image loads retain a generated shield. See the folder's README and manifest for the artwork mapping.

`public/assets/managers/` holds five comic-style manager portraits (see its README). The game shows them as **Manager 1 to 5**: you pick one on the start screen and can change it in Settings. It loads the small WebP copies in `public/assets/managers/small/` (320 px, about 20 KB each) rather than the 1.5 MB originals.
