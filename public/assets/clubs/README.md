# Club crests

57 original fictional club crests following the approved Gunners Armoury Shield concept:
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

The English expansion adds 24 crests, covering all 44 English clubs (20 Premier League and 24 Championship). The 13 existing overseas crests remain unchanged; 72 overseas clubs retain generated shields. New source sheets remain in `/workspace/generated_images/`; each new manifest source hash identifies its six-crest PNG sheet.
