# News photos

Black-and-white documentary-style photos for newspaper stories (`js/systems/newspaper.js`).
They were generated with ChatGPT's image tool from a shared style brief: neutral grayscale, plain
grey kit with no badges, numbers or text, and fictional people, mostly seen from behind or at a distance.

Each file is 1200 × 800 grayscale WebP, converted from the 1536 × 1024 PNG masters delivered in
`news-images-launch.zip`. The game adds the sepia tone and the club-colour tint in CSS
(`.paper .pimg`), so one photo works for every club.

`manifest.json` lists each file. Files are named by occasion. `NEWS_IMAGES` in `newspaper.js` maps
story occasions to these names and never shows the same photo twice in a row. To add a photo,
drop the WebP here, add it to the manifest and list it under one or more occasions in `NEWS_IMAGES`.
`tests/newspaper.cjs` checks that every photo a story can use exists.
