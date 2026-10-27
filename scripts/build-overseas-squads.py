#!/usr/bin/env python3
"""Build the 25-man overseas squad databases.

Usage: python3 scripts/build-overseas-squads.py [DRAFT_MD] [OUT_DIR]

1. Reads the 14-slot completion draft for the 20 big clubs
   (default data/world/overseas/big-clubs-draft.md), repairs it (see FIXES below)
   and writes big_overseas_clubs_completed_squad_rosters.md.
2. Generates full 25-man squads for the other 56 clubs in the four overseas
   leagues and writes other_overseas_clubs_squad_rosters.md.

Deterministic: every random draw is seeded from the club and slot. All in-game
names are fictional; `inspired_by` records the real-world archetype only.
"""
import csv, io, json, math, random, re, statistics, sys, unicodedata
from collections import Counter, defaultdict
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from overseas_names import POOLS, DOUBLE_SURNAME

ROOT = Path(__file__).resolve().parent.parent
DRAFT = Path(sys.argv[1]) if len(sys.argv) > 1 else ROOT / 'data/world/overseas/big-clubs-draft.md'
OUT = Path(sys.argv[2]) if len(sys.argv) > 2 else ROOT / 'data/world/overseas'
OUT.mkdir(parents=True, exist_ok=True)

STATS = 'fin pas dri fir cro tck mar hea vis dec pos wor cmp ldr pac sta str agi ref han one kic ant otb fla tea'.split()
COLS = ('club squad_no name_in_game inspired_by position alt_positions age nation eu_status hg_status u21_elig reg_status '
        'ca pa foot ht_cm wt_kg').split() + STATS + ['confidence', 'notes']
EU = set('AUT BEL BUL CRO CYP CZE DEN EST FIN FRA GER GRE HUN IRL ITA LAT LTU LUX MLT NED POL POR ROU SVK SVN ESP SWE NOR ISL'.split())
LEAGUE_ORDER = ['La Liga', 'Serie A', 'Bundesliga', 'Ligue 1']
LEAGUE_ID = {'La Liga': 'ES1', 'Serie A': 'IT1', 'Bundesliga': 'DE1', 'Ligue 1': 'FR1'}
GK_STATS = {'ref', 'han', 'one', 'kic'}

def fold(s):
    return re.sub(r'[^a-z0-9]', '', unicodedata.normalize('NFKD', s).encode('ascii', 'ignore').decode().lower())

# ---------------------------------------------------------------- parsing
def parse_draft(path):
    clubs, league = {}, None
    for blk in re.split(r'\n(?=### |## )', path.read_text(encoding='utf-8')):
        m = re.match(r'## \d+\. (.*)', blk)
        if m:
            league = m.group(1).strip()
        h = re.match(r'### (.*)', blk)
        c = re.search(r'```csv\n(.*?)```', blk, re.S)
        if not (h and c):
            continue
        band = re.search(r'CA Band:\*\* (\d+)–(\d+)', blk)
        rows = list(csv.DictReader(io.StringIO(c.group(1))))
        clubs[rows[0]['club']] = dict(
            title=h.group(1).strip(), league=league, rep=int(re.search(r'Reputation:\*\* (\d+)', blk).group(1)),
            band=(int(band.group(1)), int(band.group(2))), rows=rows,
            rule=(re.search(r'Registration Rule:\*\* (.*)', blk) or [None, ''])[1].strip())
    return clubs

# ---------------------------------------------------------------- shared helpers
def attr_models(rows):
    """Mean attribute vector, mean CA and mean height/weight per position, from the repaired draft."""
    by = defaultdict(list)
    for r in rows:
        by[r['position']].append(r)
    model = {}
    for pos, rs in by.items():
        model[pos] = dict(ca=statistics.mean(int(r['ca']) for r in rs), ht=(statistics.mean(int(r['ht_cm']) for r in rs), 4.5),
                          stats={s: statistics.mean(int(r[s]) for r in rs) for s in STATS})
    return model

KEY = {
    'GK': 'ref han one kic pos dec'.split(), 'DL': 'tck mar pos pac sta cro'.split(), 'DR': 'tck mar pos pac sta cro'.split(),
    'DC': 'tck mar hea pos str dec'.split(), 'DM': 'tck pos dec pas wor sta'.split(), 'MC': 'pas vis dec fir wor tea'.split(),
    'AMC': 'pas vis dri fir otb dec'.split(), 'AML': 'dri pac cro fir otb agi'.split(), 'AMR': 'dri pac cro fir otb agi'.split(),
    'ST': 'fin otb hea pac fir cmp'.split()}

def nudge(r, delta):
    """Move a player's ability by delta CA points by shifting his key attributes (about 1.5 points each)."""
    n, keys, i, step = int(round(abs(delta) * 1.5)), KEY[r['position']], 0, 1 if delta > 0 else -1
    while n > 0 and i < 40:
        k = keys[i % len(keys)]; i += 1
        v = int(r[k]) + step
        if 1 <= v <= 20 and not (r['position'] != 'GK' and k in GK_STATS):
            r[k] = str(v); n -= 1

class Namer:
    """Unique fictional names, checked against every name already in the game files."""
    def __init__(self):
        self.used = set()
        text = ''
        for p in list((ROOT / 'js/core').glob('*.js')) + list((ROOT / 'data').rglob('*.json')):
            try:
                text += p.read_text(encoding='utf-8', errors='ignore')
            except OSError:
                pass
        self.game_text = fold(text)

    def make(self, rng, nat, pool_key=None):
        first, last = POOLS.get(pool_key or nat) or POOLS.get({'AUS': 'USA', 'SUI': 'GER'}.get(nat, 'ENG'))
        for attempt in range(400):
            f, l = rng.choice(first), rng.choice(last)
            if attempt > 40 and (pool_key or nat) in DOUBLE_SURNAME:
                l = l + ' ' + rng.choice(last)
            elif attempt > 40:
                l = rng.choice(last) + '-' + rng.choice(last)
            name = f'{f} {l}'
            key = fold(name)
            if key not in self.used and key not in self.game_text:
                self.used.add(key)
                return name
        raise RuntimeError('name pool exhausted for ' + nat)

def band_cap_note(r, hi):
    notes = [n for n in r['notes'].replace('-', '').split(';') if n.strip() and n.strip() != 'capped by band']
    if int(r['ca']) == hi:
        notes.append('capped by band')
    r['notes'] = '; '.join(n.strip() for n in notes) or '-'

def u21_fields(r):
    young = int(r['age']) <= 21
    r['u21_elig'] = 'Yes' if young else 'No'
    r['reg_status'] = 'U21 Exempt' if young else 'Registered'

def add_note(r, text):
    r['notes'] = text if r['notes'] in ('-', '') else r['notes'] + '; ' + text

# ---------------------------------------------------------------- 1. repair the draft
# Dual nationals / naturalised players so that the added Spanish slots respect the
# three-non-EU limit. The chosen player keeps his football identity; only the passport changes.
DUAL = {
    ('Castilla CF', 'Karim Benali'): 'ESP', ('Castilla CF', 'Danilo Silveira'): 'ITA',
    ('Colchoneros', 'Franco Roldán'): 'ESP', ('Colchoneros', 'Facundo Tenaglia'): 'ITA',
    ('Colchoneros', 'Wendel Caetano'): 'POR', ('Colchoneros', 'Lucas Barovero'): 'ITA',
}
AGE_CAP = {'GK': 37, None: 36}
INSPIRED_FIX = {('Red Bulls', 'Nicolas Seiwald'): 'Nicolas Seiwald', ('Phocéens', 'Neal Maupay'): 'Neal Maupay'}
# Basque-born players of African descent keep their names (Athletic's Basque-only rule is about origin, not surname).
BASQUE_KEEP = {'Ousmane Diallo', 'Buba Sangaré'}
CLUB_POOL = {'Lions of Bilbao': 'BASQUE'}

def repair(clubs, namer):
    log = []
    for club, info in clubs.items():
        lo, hi = info['band']
        spain = info['league'] == 'La Liga'
        for r in info['rows']:
            old = r['name_in_game']
            # nationality / registration
            if (club, old) in DUAL:
                was = r['nation']; r['nation'] = DUAL[(club, old)]; r['eu_status'] = 'EU'
                add_note(r, f'EU passport (dual national; was listed {was})')
                log.append(f'{club}: {old} listed as {r["nation"]} (dual national) to respect the Non-EU limit')
            if club == 'Lions of Bilbao' and r['nation'] != 'ESP':
                log.append(f'{club}: {old} ({r["nation"]}) replaced by a Basque-born player')
                r['nation'], r['eu_status'], r['hg_status'] = 'ESP', 'EU', 'HGC'
            # age realism
            cap = AGE_CAP['GK'] if r['position'] == 'GK' else AGE_CAP[None]
            if int(r['age']) > cap:
                log.append(f'{club}: {old} age {r["age"]} -> {cap}'); r['age'] = str(cap)
            u21_fields(r)
            # CA must sit inside the club's band
            ca = int(r['ca'])
            if not lo <= ca <= hi:
                new = min(max(ca, lo), hi)
                nudge(r, new - ca); r['ca'] = str(new)
                log.append(f'{club}: {old} CA {ca} -> {new} (band {lo}-{hi}), attributes adjusted')
            if int(r['pa']) < int(r['ca']):
                r['pa'] = r['ca']
            if (club, old) in INSPIRED_FIX:
                r['inspired_by'] = INSPIRED_FIX[(club, old)]
            band_cap_note(r, hi)
            # fictional name (real names in the draft were other footballers)
            rng = random.Random(f'{club}:{r["squad_no"]}:name')
            if old in BASQUE_KEEP:
                namer.used.add(fold(old))
            else:
                r['name_in_game'] = namer.make(rng, r['nation'], CLUB_POOL.get(club))
        non_eu = sum(r['eu_status'] == 'Non-EU' for r in info['rows'])
        if spain and non_eu > 3:
            raise SystemExit(f'{club}: {non_eu} non-EU after repair')
    return log

# ---------------------------------------------------------------- 2. generate the other 56 clubs
# Reputation and display data follow js/core/world-data.js (membership) with original reputation estimates.
OTHER = {
 'La Liga': dict(rule='Max 3 Non-EU players; GKs strictly 1, 13, 25.', clubs=[
   ('ES1_RSO', 79), ('ES1_BET', 78), ('ES1_SEV', 77), ('ES1_VAL', 77), ('ES1_CEL', 74), ('ES1_RAY', 70), ('ES1_OSA', 70),
   ('ES1_GET', 69), ('ES1_ESP', 67), ('ES1_ALA', 66), ('ES1_ELC', 62), ('ES1_LEV', 62), ('ES1_MAL', 60), ('ES1_DEP', 60), ('ES1_RAC', 58)]),
 'Serie A': dict(rule='None', clubs=[
   ('IT1_ROM', 81), ('IT1_LAZ', 79), ('IT1_FIO', 79), ('IT1_BOL', 78), ('IT1_TOR', 72), ('IT1_GEN', 70), ('IT1_UDI', 68),
   ('IT1_COM', 68), ('IT1_CAG', 66), ('IT1_SAS', 66), ('IT1_PAR', 65), ('IT1_LEC', 64), ('IT1_MON', 62), ('IT1_VEN', 60), ('IT1_FRO', 58)]),
 'Bundesliga': dict(rule='None', clubs=[
   ('DE1_STU', 79), ('DE1_FRE', 76), ('DE1_BMG', 75), ('DE1_HOF', 74), ('DE1_WER', 74), ('DE1_MAI', 72), ('DE1_UNI', 72),
   ('DE1_S04', 71), ('DE1_HSV', 70), ('DE1_KOE', 70), ('DE1_AUG', 68), ('DE1_PAD', 58), ('DE1_ELV', 56)]),
 'Ligue 1': dict(rule='None', clubs=[
   ('FR1_NIC', 79), ('FR1_REN', 78), ('FR1_LEN', 78), ('FR1_STR', 72), ('FR1_BRE', 70), ('FR1_TOU', 68), ('FR1_AUX', 62),
   ('FR1_LOR', 62), ('FR1_HAV', 62), ('FR1_ANG', 60), ('FR1_PFC', 60), ('FR1_TRO', 56), ('FR1_LEM', 55)]),
}
# local / other EU / non-EU mix and weighted nationality tables per league
MIX = {  # (home players, non-EU players) for a club of reputation >= 70; weaker clubs get two more home players
    'La Liga': (14, 3), 'Serie A': (10, 6), 'Bundesliga': (10, 6), 'Ligue 1': (12, 6)}
HOME = {'La Liga': 'ESP', 'Serie A': 'ITA', 'Bundesliga': 'GER', 'Ligue 1': 'FRA'}
NATS = {
 'La Liga': dict(eu='POR:5 FRA:4 ITA:2 GER:1 NED:1 BEL:1 CRO:1 DEN:1 ROU:1 GRE:1 POL:1'.split(),
                 non='ARG:5 URU:3 COL:3 BRA:3 MAR:3 MEX:2 NGA:2 SEN:2 CIV:1 GHA:1 USA:1 VEN:1 CHI:1 ECU:1'.split()),
 'Serie A': dict(eu='ESP:4 FRA:4 GER:1 POR:3 NED:2 BEL:2 CRO:3 SVN:2 DEN:2 SWE:1 POL:3 ROU:1 GRE:1 AUT:1 CZE:1'.split(),
                 non='BRA:4 ARG:4 ALB:3 SRB:3 URU:2 COL:2 NGA:3 GHA:2 SEN:2 MAR:2 USA:2 TUR:1 SUI:2 BIH:2 MKD:1 KOS:1 JPN:1 ENG:1'.split()),
 'Bundesliga': dict(eu='AUT:5 POL:4 CRO:3 DEN:3 SWE:2 NED:3 BEL:2 FRA:3 ESP:2 ITA:2 POR:2 GRE:1 CZE:2 HUN:1 FIN:1'.split(),
                    non='SUI:4 TUR:4 BIH:2 SRB:2 BRA:3 USA:3 JPN:3 KOR:2 NGA:2 GHA:2 CIV:2 MAR:2 ENG:2 CAN:1 AUS:1 ISR:1 UKR:1'.split()),
 'Ligue 1': dict(eu='BEL:4 POR:3 ESP:2 ITA:2 GER:1 NED:2 DEN:1 POL:2 CRO:1'.split(),
                 non='MAR:5 ALG:4 SEN:5 CIV:4 MLI:3 CMR:3 COD:2 GUI:2 TUN:1 BRA:2 ARG:1 ENG:1 SUI:1 TUR:1 JPN:1 MAS:0 GHA:1 NGA:2'.split()),
}
SLOTS = ['GK', 'DL', 'DC', 'DC', 'DR', 'DM', 'MC', 'MC', 'AML', 'AMR', 'ST', 'GK', 'DL', 'DC', 'DC', 'DR', 'DM', 'MC', 'AMC',
         'AML', 'AMR', 'ST', 'GK', 'MC', 'ST']
ALT = {'DL': ['DC', 'ML', 'WBL'], 'DR': ['DC', 'MR', 'WBR'], 'DC': ['DR', 'DL', 'DM'], 'DM': ['MC', 'DC'], 'MC': ['DM', 'AMC'],
       'AMC': ['MC', 'AML', 'AMR'], 'AML': ['AMC', 'ST', 'ML'], 'AMR': ['AMC', 'ST', 'MR'], 'ST': ['AML', 'AMR', 'AMC'], 'GK': []}
NUMBERS = {'GK': [1, 13, 25], 'DL': [3, 23, 15, 33], 'DR': [2, 22, 12, 32], 'DC': [4, 5, 15, 24, 6, 34], 'DM': [6, 8, 14, 28],
           'MC': [8, 10, 14, 16, 20, 21, 18], 'AMC': [10, 17, 11, 19], 'AML': [11, 7, 17, 21], 'AMR': [7, 11, 19, 27],
           'ST': [9, 19, 18, 29, 39]}

def weighted(rng, table):
    items = [(k.split(':')[0], int(k.split(':')[1])) for k in table if int(k.split(':')[1]) > 0]
    return rng.choices([i[0] for i in items], [i[1] for i in items])[0]

def gen_club(entry, rep, league, band_lo, model, namer, slope=0.2):
    cid = entry['id']; nick = entry['name']
    lo = band_lo; hi = lo + 9
    rng = random.Random(f'gen:{cid}')
    home_n, non_eu_n = MIX[league]
    if rep < 70:
        home_n += 2
    home_n = max(8, min(home_n + rng.choice([-1, 0, 0, 1]), 17))
    eu_n = 25 - home_n - non_eu_n
    nats = [HOME[league]] * home_n + [weighted(rng, NATS[league]['eu']) for _ in range(eu_n)] + [weighted(rng, NATS[league]['non']) for _ in range(non_eu_n)]
    young_slots = [22, 23, 24] + rng.sample([13, 14, 16, 17, 19, 20, 21], 1)
    free = [i for i in range(25) if i not in young_slots]
    rng.shuffle(free)
    # home-grown players go to the youngsters first, then the rest is shuffled
    home = [n for n in nats if n == HOME[league]]; other = [n for n in nats if n != HOME[league]]
    order = young_slots + free
    assign = {}
    for i in order:
        assign[i] = home.pop() if home and (i in young_slots) else None
    rest = home + other; rng.shuffle(rest)
    for i in order:
        if assign[i] is None:
            assign[i] = rest.pop()
    rows, taken = [], set()
    for i, pos in enumerate(SLOTS):
        rng = random.Random(f'gen:{cid}:{i}')
        nat = assign[i]
        young = i in young_slots
        starter = i < 11
        if young:
            age = rng.choice([17, 18, 18, 19, 19, 20, 21])
        elif pos == 'GK':
            age = int(min(max(rng.gauss(29.5, 4.2), 22), 37)) if starter else int(min(max(rng.gauss(26, 4), 21), 35))
        else:
            age = int(min(max(rng.gauss(28.4 if starter else 26.6, 3.3 if starter else 3.9), 21 if starter else 19), 36))
        if young:
            ca = lo + rng.randint(0, 3)
        elif starter:
            ca = hi - int(abs(rng.gauss(0, 2.6)))
        else:
            ca = lo + int(abs(rng.gauss(0, 3.4)))
        if pos == 'GK' and not young:
            ca -= rng.choice([0, 1])
        ca = min(max(ca, lo), hi)
        if age <= 19: gain = rng.randint(9, 16)
        elif age <= 21: gain = rng.randint(5, 12)
        elif age <= 24: gain = rng.randint(2, 7)
        elif age <= 28: gain = rng.randint(0, 3)
        else: gain = 0
        pa = min(ca + gain, 100)
        m = model[pos]
        stats = {}
        for s in STATS:
            base = m['stats'][s]
            if pos != 'GK' and s in GK_STATS:
                stats[s] = 2; continue
            if pos == 'GK' and s in {'fin', 'cro', 'tck', 'mar', 'hea', 'otb', 'fla'}:
                stats[s] = max(2, round(base)); continue
            weight = min(max((base - 4) / 12, 0.08), 1.0)
            v = base + slope * weight * (ca - m['ca']) + rng.gauss(0, 1.1)
            stats[s] = int(min(max(round(v), 1), 20))
        # archetype twist: one strength, one weakness
        keys = [k for k in KEY[pos]]
        stats[rng.choice(keys)] = min(20, stats[rng.choice(keys)] + 1)
        ht = int(round(rng.gauss(m['ht'][0], 4.2))); ht = min(max(ht, 165), 202)
        wt = int(round(ht - 104 + rng.gauss(0, 3.5)))
        foot = 'Right'
        r = rng.random()
        if pos in ('DL', 'AML'):
            foot = 'Left' if r < 0.78 else 'Right' if r < 0.95 else 'Either'
        else:
            foot = 'Right' if r < 0.74 else 'Left' if r < 0.95 else 'Either'
        alts = '-'
        if ALT[pos] and rng.random() < 0.45:
            alts = rng.choice(ALT[pos])
            if rng.random() < 0.25:
                alts += '/' + rng.choice([a for a in ALT[pos] if a != alts])
        # registration
        eu = 'EU' if nat in EU else 'Non-EU'
        homegrown = nat == HOME[league]
        x = rng.random()
        if homegrown:
            hg = 'HGC' if (x < 0.55 or (age <= 21 and x < 0.8)) else 'HGN' if x < 0.9 else 'Non-HG'
        else:
            hg = 'HGN' if (age <= 23 and eu == 'EU' and x < 0.12) else 'Non-HG'
        # squad number
        num = next((n for n in NUMBERS[pos] if n not in taken and not (young and n <= 20 and pos != 'GK')), None)
        if num is None:
            num = next(n for n in range(30, 60) if n not in taken)
        if young and pos != 'GK' and num < 30:
            num = next(n for n in range(30, 60) if n not in taken)
        taken.add(num)
        row = dict(club=nick, squad_no=str(num), inspired_by='-', position=pos, alt_positions=alts, age=str(age), nation=nat,
                   eu_status=eu, hg_status=hg, ca=str(ca), pa=str(pa), foot=foot, ht_cm=str(ht), wt_kg=str(wt),
                   confidence='generated', notes='-', **{k: str(v) for k, v in stats.items()})
        row['name_in_game'] = namer.make(random.Random(f'gen:{cid}:{i}:name'), nat)
        u21_fields(row)
        band_cap_note(row, hi)
        if league == 'La Liga' and pos == 'GK':
            row['squad_no'] = str({0: 1, 11: 13, 22: 25}[i]); taken.add(int(row['squad_no']))
        rows.append(row)
    # La Liga: three non-EU maximum is enforced by construction; assert it.
    if league == 'La Liga':
        assert sum(r['eu_status'] == 'Non-EU' for r in rows) <= 3, nick
    return rows

# ---------------------------------------------------------------- output
def write_csv_block(rows):
    buf = io.StringIO()
    w = csv.DictWriter(buf, fieldnames=COLS, lineterminator='\n'); w.writeheader()
    for r in sorted(rows, key=lambda r: -1 if False else 0):
        w.writerow({c: r.get(c, '') for c in COLS})
    return buf.getvalue()

def validate(club_rows, band, league, expect):
    errs = []
    lo, hi = band
    nums = Counter(r['squad_no'] for r in club_rows)
    for r in club_rows:
        ca, pa, age = int(r['ca']), int(r['pa']), int(r['age'])
        if len(club_rows) != expect: errs.append('size')
        if not lo <= ca <= hi: errs.append(f'band {r["name_in_game"]}')
        if pa < ca: errs.append(f'pa {r["name_in_game"]}')
        if (age <= 21) != (r['u21_elig'] == 'Yes'): errs.append('u21')
        if (r['eu_status'] == 'EU') != (r['nation'] in EU): errs.append(f'eu {r["name_in_game"]} {r["nation"]}')
        if nums[r['squad_no']] > 1: errs.append('dup number ' + r['squad_no'])
        if any(not 1 <= int(r[s]) <= 20 for s in STATS): errs.append('stat range')
    return errs

def main():
    clubs = parse_draft(DRAFT)
    namer = Namer()
    log = repair(clubs, namer)
    # --- big clubs
    errs = []
    for club, info in clubs.items():
        errs += [f'{club}: {e}' for e in validate(info['rows'], info['band'], info['league'], 14)]
    if errs: raise SystemExit('\n'.join(errs))
    md = ['# Big Overseas Clubs: Completed 25-Man Squad Database (2026/27)', '',
          'This file contains the 280 completed first-team squad slots (14 per club across 20 clubs) to complete each roster to 25 players at the start of the 2026/27 season.',
          'It is the repaired version of the original draft: see the change log at the end.', '',
          '### Standardized Database Schema',
          '* **Registration Metadata:** `squad_no`, `eu_status` (EU / Non-EU), `hg_status` (HGC / HGN / Non-HG), `u21_elig` (Yes / No), `reg_status` (Registered / U21 Exempt).',
          '* **Ability Ratings:** `ca` (Current Ability, 1–100 scale derived via position-weighted vector), `pa` (Potential Ability, 1–100 scale).',
          '* **Attribute Order (1–20 scale, 26 Stats):** `' + ', '.join(STATS) + '`.',
          '* **Names:** every `name_in_game` is fictional and unique across all overseas squads. `inspired_by` is the real-world archetype only.',
          '* **EU status:** EU/EEA passports are EU. English, Scottish, Swiss, Turkish and other nationalities are Non-EU. Dual nationals are noted.',
          '* **Zero Duplications:** no overlap with the Premier League master dataset and no repeated names.', '', '---', '']
    for lg in LEAGUE_ORDER:
        md += [f'## {LEAGUE_ORDER.index(lg) + 1}. {lg}', '']
        for club, info in clubs.items():
            if info['league'] != lg: continue
            md += [f'### {info["title"]}', f'**Reputation:** {info["rep"]} | **CA Band:** {info["band"][0]}–{info["band"][1]} | **Registration Rule:** {info["rule"] or "None"}', '',
                   '```csv', write_csv_block(info['rows']).rstrip('\n'), '```', '']
    md += ['---', '', '## Change log', ''] + [f'* {l}' for l in log] + ['']
    (OUT / 'big_overseas_clubs_completed_squad_rosters.md').write_text('\n'.join(md), encoding='utf-8')

    # --- other 56 clubs
    world = json.loads(subprocess_world())
    by_id = {c['id']: c for c in world}
    model = attr_models([r for info in clubs.values() for r in info['rows']])
    rows_all, summary = [], []
    md2 = ['# Other Overseas Clubs: Full 25-Man Squad Database (2026/27)', '',
        'Full first-team squads (25 players each) for the 56 La Liga, Serie A, Bundesliga and Ligue 1 clubs that are not in the big-club file, so every club in the four overseas leagues can be scouted.',
        'All names are fictional and unique. `inspired_by` is `-` because these are generated players, not stand-ins for specific real people; `confidence` is `generated`.',
        'Schema, attribute order and registration fields are identical to the big-club file. CA bands follow the same reputation curve: band minimum = 66 + 0.65 x (reputation - 80), width 10 (reputation 80 -> 66–75).',
        'Squad-shape rules: 3 goalkeepers, 2 left backs, 4 centre backs, 2 right backs, 2 defensive midfielders, 3-4 central midfielders, wide and central attackers, 3 strikers; 4 players aged 21 or under; Spanish clubs have at most 3 Non-EU players and goalkeepers numbered 1, 13 and 25.', '', '---', '']
    for lg in LEAGUE_ORDER:
        md2 += [f'## {LEAGUE_ORDER.index(lg) + 1}. {lg}', '']
        for cid, rep in OTHER[lg]['clubs']:
            entry = by_id[cid]
            lo = int(round(66 + 0.65 * (rep - 80)))
            rows = gen_club(entry, rep, lg, lo, model, namer)
            e = validate(rows, (lo, lo + 9), lg, 25)
            if e: raise SystemExit(f'{cid}: {e[:3]}')
            md2 += [f'### {entry["name"]} ({entry["realName"]})', f'**Reputation:** {rep} | **CA Band:** {lo}–{lo + 9} | **Registration Rule:** {OTHER[lg]["rule"]}', '',
                    '```csv', write_csv_block(rows).rstrip('\n'), '```', '']
            rows_all += rows
            summary.append((lg, entry['name'], rep, lo, round(statistics.mean(int(r['ca']) for r in rows), 1),
                            sum(r['eu_status'] == 'Non-EU' for r in rows), round(statistics.mean(int(r['age']) for r in rows), 1)))
    (OUT / 'other_overseas_clubs_squad_rosters.md').write_text('\n'.join(md2), encoding='utf-8')
    names = Counter(r['name_in_game'] for r in rows_all) + Counter(r['name_in_game'] for i in clubs.values() for r in i['rows'])
    assert max(names.values()) == 1, 'duplicate names'
    print(len(clubs), 'big clubs repaired;', len(summary), 'clubs generated;', len(rows_all), 'players;', len(log), 'repairs logged')
    for s in summary: print(*s)

def subprocess_world():
    import subprocess
    js = ("const fs=require('node:fs'),vm=require('node:vm');const c=vm.createContext({});"
          "vm.runInContext(fs.readFileSync('js/core/world-data.js','utf8'),c);"
          "process.stdout.write(JSON.stringify(vm.runInContext('WORLD_CLUBS',c)));")
    return subprocess.check_output(['node', '-e', js], cwd=ROOT, text=True)

if __name__ == '__main__':
    main()
