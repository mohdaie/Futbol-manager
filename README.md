# Futbol Manager

A football manager game for the browser, designed for a phone held in portrait. Plain HTML, CSS and JavaScript with no build step and no dependencies.

## Play

- **Online:** turn on GitHub Pages for this repo (Settings → Pages → Deploy from a branch → `main`, folder `/ (root)`). The game is then at `https://mohdaie.github.io/Futbol-manager/`.
- **Locally:** run any static server from the repo root, for example `python3 -m http.server 8000`, then open `http://localhost:8000`. Opening `index.html` straight from disk is not supported.

Your career saves automatically in the browser. Use Settings → Export save to keep a backup.

## What's in it

- The 20 top-flight clubs under their nicknames (Gunners, Reds, Citizens and so on). Every club has a first team, reserves and U18s (about 1,300 players). First teams, and some youth squads, are based on the real 2026/27 squads, renamed with different names that sound similar (same age, nationality and position). The rest of the youth squads are generated.
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

`public/assets/managers/` holds five comic-style manager portraits (see its README). The game shows them as **Manager 1 to 5**: you pick one on the start screen and can change it in Settings. It loads the small WebP copies in `public/assets/managers/small/` (320 px, about 20 KB each) rather than the 1.5 MB originals.
