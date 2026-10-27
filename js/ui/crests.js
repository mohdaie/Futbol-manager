'use strict';
/* Approved Armoury Shield artwork. Names take precedence so overseas crests
   remain correct if the generated F0–F10 IDs are assigned in another order. */
const CLUB_CREST_NAMES = Object.freeze({
  'Gunners': 'GUN', 'Villans': 'VIL', 'Cherries': 'CHR', 'Bees': 'BEE',
  'Seagulls': 'GUL', 'Clarets': 'CLA', 'Blues': 'BLU', 'Eagles': 'EAG',
  'Toffees': 'TOF', 'Cottagers': 'COT', 'Peacocks': 'PEA', 'Reds': 'RED',
  'Citizens': 'CIT', 'Red Devils': 'DEV', 'Magpies': 'MAG', 'Tricky Trees': 'TRE',
  'Black Cats': 'CAT', 'Spurs': 'SPU', 'Hammers': 'HAM', 'Old Gold': 'OLD',
  'Sky Blues': 'SKY',
  'Tigers': 'TIG',
  'Tractor Boys': 'TRA',
  'Brummies': 'BIR',
  'Rovers': 'BLA',
  'Trotters': 'BOL',
  'Robins': 'BRI',
  'Bluebirds': 'CAR',
  'Addicks': 'CHA',
  'Rams': 'DER',
  'Imps': 'LIN',
  'Boro': 'MID',
  'Lions': 'MIL',
  'Canaries': 'NOR',
  'Pompey': 'POM',
  'Lilywhites': 'PRE',
  'Hoops': 'QPR',
  'Blades': 'SHU',
  'Saints': 'SOU',
  'Potters': 'STO',
  'Swans': 'SWA',
  'Hornets': 'WAT',
  'Baggies': 'WBA',
  'Red Dragons': 'WRE',
  "Lions of Bilbao": 'ES1_ATH',
  "Rojillos": 'ES1_OSA',
  "Colchoneros": 'ES1_ATM',
  "Babazorros": 'ES1_ALA',
  "Franjiverdes": 'ES1_ELC',
  "Blaugrana": 'ES1_BAR',
  "Azulones": 'ES1_GET',
  "Granotas": 'ES1_LEV',
  "Boquerones": 'ES1_MAL',
  "Celestes": 'ES1_CEL',
  "Herculinos": 'ES1_DEP',
  "Periquitos": 'ES1_ESP',
  "Franjirrojos": 'ES1_RAY',
  "Verdiblancos": 'ES1_BET',
  "Montañeses": 'ES1_RAC',
  "Txuri-Urdin": 'ES1_RSO',
  "Hispalenses": 'ES1_SEV',
  "Bats": 'ES1_VAL',
  "Yellow Submarine": 'ES1_VIL',
  "Brianzoli": 'IT1_MON',
  "Viola": 'IT1_FIO',
  "Giallorossi": 'IT1_ROM',
  "La Dea": 'IT1_ATA',
  "Felsinei": 'IT1_BOL',
  "Isolani": 'IT1_CAG',
  "Lariani": 'IT1_COM',
  "Nerazzurri": 'IT1_INT',
  "Canarini": 'IT1_FRO',
  "Grifone": 'IT1_GEN',
  "Old Lady": 'IT1_JUV',
  "Crociati": 'IT1_PAR',
  "Biancocelesti": 'IT1_LAZ',
  "Partenopei": 'IT1_NAP',
  "Granata": 'IT1_TOR',
  "Salentini": 'IT1_LEC',
  "Neroverdi": 'IT1_SAS',
  "Zebrette": 'IT1_UDI',
  "Lagunari": 'IT1_VEN',
  "Billy Goats": 'DE1_KOE',
  "Iron Ones": 'DE1_UNI',
  "Zero-Fivers": 'DE1_MAI',
  "Black and Yellows": 'DE1_DOR',
  "Foals": 'DE1_BMG',
  "Frankfurt Eagles": 'DE1_FRA',
  "Fuggerstädter": 'DE1_AUG',
  "Bavarians": 'DE1_BAY',
  "Royal Blues": 'DE1_S04',
  "Red Shorts": 'DE1_HSV',
  "Red Bulls": 'DE1_RBL',
  "Breisgau Brazilians": 'DE1_FRE',
  "Paderborn Blue-Blacks": 'DE1_PAD',
  "Elversberg Village Club": 'DE1_ELV',
  "River Islanders": 'DE1_WER',
  "Village Club": 'DE1_HOF',
  "Swabians": 'DE1_STU',
  "Auxerrois": 'FR1_AUX',
  "Monégasques": 'FR1_MON',
  "Scoïstes": 'FR1_ANG',
  "Troyens": 'FR1_TRO',
  "Merlus": 'FR1_LOR',
  "Ciel et Marine": 'FR1_HAV',
  "Sang et Or du Mans": 'FR1_LEM',
  "Dogues": 'FR1_LIL',
  "Aiglons": 'FR1_NIC',
  "Gones": 'FR1_LYO',
  "Phocéens": 'FR1_MAR',
  "Parisiens FC": 'FR1_PFC',
  "Racing Alsace": 'FR1_STR',
  "Sang et Or": 'FR1_LEN',
  "Pirates": 'FR1_BRE',
  "Rouge et Noir": 'FR1_REN',
  "Violets": 'FR1_TOU',
  'Castilla CF': 'F0', 'Lutece SG': 'F1', 'Lombardia AC': 'F2', 'Rhein 04': 'F3',
  'Porto Norte': 'F4', 'Amstel FC': 'F5', 'Rio Atletico': 'F6', 'Pampas Juniors': 'F7',
  'Brussels Royal': 'F8', 'Tokyo Bay FC': 'F9', 'Oslo Vikings': 'F10',
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
  return `<img class="crest crest-art" src="public/assets/clubs/${key}.webp?v=2026.10.26.4" width="${size}" height="${Math.round(size * 1.15)}" alt="" aria-hidden="true" decoding="async" data-crest-club="${esc(c.id || '')}" data-crest-name="${esc(c.name)}">`;
}

// Keep a usable badge if artwork cannot be loaded, including on club selection
// before G exists. Decorative crests sit beside the visible club name.
document.addEventListener('error', e => {
  const img = e.target;
  if (!img.matches?.('img.crest-art')) return;
  const c = G?.clubs?.[img.dataset.crestClub] || ENGLISH_CLUBS.find(c => c.id === img.dataset.crestClub) || FOREIGN.find(c => c.name === img.dataset.crestName) || WORLD_CLUBS.find(c => c.id === img.dataset.crestClub);
  if (c) img.outerHTML = fallbackClubBadge(c, +img.getAttribute('width') || 28);
}, true);
