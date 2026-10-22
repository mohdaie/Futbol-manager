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
- Background club setup for Spain, Italy, Germany and France’s first divisions (20/20/18/18 teams). Browse them in My Team → Club directory. New clubs have non-transferable placeholder squads; player data and fixtures come later. Existing overseas squads are retained. These leagues are not playable yet.
- Squad, tactics with separate in-possession and out-of-possession shapes, roles and instructions.
- Transfers with scouting fog of war, player search, agent pitches, bids and contract talks.
- Training, medical centre, youth academy, finances, staff, board and fans, news and inbox.
- A live 2D match with commentary, substitutions, shouts and half-time team talks, plus instant results.
- A real fixture calendar: Friday to Monday and midweek kick-off times, TV games, cup weekends and international breaks. Rest days, weather and kick-off time affect fitness, injuries and results.
- **Admin page** (More → Admin): edit clubs and players, move time forward, tune the match engine, connect Jev and DeepSeek, and the **AI Brain**, a learning engine for computer managers with versions you approve.

The full design, file map and how to extend it are in [STRUCTURE.md](STRUCTURE.md).

## AI services (optional)

Set them up in Admin → Jev AI and Admin → DeepSeek. Keys are stored only in your browser, never in the game save.

- **DeepSeek** accepts calls straight from the browser.
- **Jev (TypeSafe)** does not accept direct browser calls, so it needs a small proxy server, for example a Supabase Edge Function.
- AI calls are blocked inside the Claude artifact preview, but they work when the game is served from GitHub Pages or any normal host.

## Assets

`public/assets/clubs/` holds the 33 approved Armoury Shield club crests as transparent, mobile-sized WebP files. The same renderer supplies club selection and every in-game badge, including existing careers. Free agents, unknown clubs and failed image loads retain a generated shield. See the folder's README and manifest for the artwork mapping.

`public/assets/managers/` holds five comic-style manager portraits (see its README). The game shows them as **Manager 1 to 5**: you pick one on the start screen and can change it in Settings. It loads the small WebP copies in `public/assets/managers/small/` (320 px, about 20 KB each) rather than the 1.5 MB originals.
