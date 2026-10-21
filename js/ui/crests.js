'use strict';
/* Approved Armoury Shield artwork. Names take precedence so overseas crests
   remain correct if the generated F0–F12 IDs are assigned in another order. */
const CLUB_CREST_NAMES = Object.freeze({
  'Gunners': 'GUN', 'Villans': 'VIL', 'Cherries': 'CHR', 'Bees': 'BEE',
  'Seagulls': 'GUL', 'Clarets': 'CLA', 'Blues': 'BLU', 'Eagles': 'EAG',
  'Toffees': 'TOF', 'Cottagers': 'COT', 'Peacocks': 'PEA', 'Reds': 'RED',
  'Citizens': 'CIT', 'Red Devils': 'DEV', 'Magpies': 'MAG', 'Tricky Trees': 'TRE',
  'Black Cats': 'CAT', 'Spurs': 'SPU', 'Hammers': 'HAM', 'Old Gold': 'OLD',
  'Castilla CF': 'F0', 'Lutece SG': 'F1', 'Lombardia AC': 'F2', 'Rhein 04': 'F3',
  'Porto Norte': 'F4', 'Amstel FC': 'F5', 'Rio Atletico': 'F6', 'Pampas Juniors': 'F7',
  'Brussels Royal': 'F8', 'Tokyo Bay FC': 'F9', 'Oslo Vikings': 'F10',
  'Lagos Stars': 'F11', 'Selangor Harimau': 'F12',
});
const CLUB_CREST_IDS = new Set(Object.values(CLUB_CREST_NAMES));

function clubCrestKey(c) {
  if (!c || c.fa) return null;
  // League IDs survive admin renames; names protect overseas list reordering.
  if (CLUB_CREST_IDS.has(c.id) && !/^F\d+$/.test(c.id)) return c.id;
  if (Object.hasOwn(CLUB_CREST_NAMES, c.name)) return CLUB_CREST_NAMES[c.name];
  return CLUB_CREST_IDS.has(c.id) ? c.id : null;
}

function fallbackClubBadge(c, size = 28) {
  if (!c) return '';
  const code = c.code || c.id, txt = isLight(c.c1) ? '#141414' : '#FFFFFF';
  return `<svg class="crest" width="${size}" height="${Math.round(size * 1.15)}" viewBox="0 0 40 46" aria-hidden="true"><path d="M20 1.5 37.5 6v16c0 12-8 19-17.5 22.5C10.5 41 2.5 34 2.5 22V6z" fill="${esc(c.c1)}" stroke="${esc(c.c2)}" stroke-width="2.5"/><path d="M8 9h24" stroke="${esc(c.c2)}" stroke-width="2" opacity=".55"/><text x="20" y="28" text-anchor="middle" font-size="${String(code).length > 2 ? 11.5 : 13}" font-weight="800" fill="${txt}" font-family="Plus Jakarta Sans, sans-serif">${esc(code)}</text></svg>`;
}

function clubBadge(c, size = 28) {
  if (!c) return '';
  const key = clubCrestKey(c);
  if (!key) return fallbackClubBadge(c, size);
  return `<img class="crest crest-art" src="public/assets/clubs/${key}.webp" width="${size}" height="${Math.round(size * 1.15)}" alt="" aria-hidden="true" decoding="async" data-crest-club="${esc(c.id || '')}" data-crest-name="${esc(c.name)}">`;
}

// Keep a usable badge if artwork cannot be loaded, including on club selection
// before G exists. Decorative crests sit beside the visible club name.
document.addEventListener('error', e => {
  const img = e.target;
  if (!img.matches?.('img.crest-art')) return;
  const c = G?.clubs[img.dataset.crestClub] || CLUBS.find(c => c.id === img.dataset.crestClub) || FOREIGN.find(c => c.name === img.dataset.crestName);
  if (c) img.outerHTML = fallbackClubBadge(c, +img.getAttribute('width') || 28);
}, true);
