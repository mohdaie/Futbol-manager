# Club crests

129 original fictional club crests following the approved Gunners Armoury Shield concept:
pointed shield, stepped shoulders, double border, curved name banner and a distinct symbol.
Created with the built-in image-generation tool using Gunners as the style reference.

These transparent WebP files are trimmed and fitted into 256 × 294 pixels for the game's
18–50 px badge slots, preserving the approved artwork. The full-resolution PNG masters
remain in the separately delivered Futbol-Manager-Crests.zip asset pack.

`manifest.json` maps every club to its image and records the source PNG's SHA-256.
League IDs remain usable after an admin rename. Overseas names take precedence over
generated IDs so changing their list order does not swap the artwork. Existing saved
careers need no migration. Club selection and in-game screens share `clubBadge()` in
`js/ui/crests.js`; unknown clubs, free agents and failed image loads use the SVG fallback.

The English expansion adds 24 crests, covering all 44 English clubs (20 Premier League and 24 Championship). The overseas expansion adds 72 crests for Spain (19), Italy (19), Germany (17) and France (17), preserving the 13 existing overseas crests. All 129 registered clubs now have artwork; free agents and unknown clubs retain generated shields.

Expansion source sheets remain in `/workspace/generated_images/`; each expansion manifest source hash identifies its six-crest PNG sheet. The new overseas files use full league-prefixed IDs, so short codes shared with English clubs cannot select the wrong artwork. Name lookup also supports older saves whose overseas IDs differ. Failed loads resolve static English, foreign and world registries before a career exists.
