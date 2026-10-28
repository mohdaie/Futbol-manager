#!/usr/bin/env python3
"""Add the second divisions of Spain, Italy, Germany and France to js/core/world-data.js.

Usage: python3 scripts/build-world-tier2.py [SECOND_TIER_MD]

Club membership comes from data/world/overseas/second-tier-clubs.md (the list supplied for the 2026/27 projection).
Nicknames, colours, reputations and home grounds are original game data: every club is shown by a fictional nickname, like the
top flights. The script also gives every club a reputation, ground and capacity so that a league can be played, rewrites
WORLD_LEAGUES with country and tier fields, and records the new memberships in data/world/sources.json. Deterministic.
"""
import json, re, subprocess, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = Path(sys.argv[1]) if len(sys.argv) > 1 else ROOT / 'data/world/overseas/second-tier-clubs.md'

# id suffix, real name (as listed), city, fictional nickname, ground stem, colours, reputation, extra
# Extra: 'B' marks a reserve side of a top-flight club in the same country; it cannot be promoted above its parent.
TIERS = {
 'DE2': dict(name='2. Bundesliga', country='Germany', nat='GER', heading='2. Bundesliga (Germany)', clubs=[
  ('HDH', '1. FC Heidenheim', 'Heidenheim', 'Brenzers', 'Brenz', '#E2001A', '#1E4C9A', 62),
  ('KLA', '1. FC Kaiserslautern', 'Kaiserslautern', 'Palatines', 'Betze', '#D3171E', '#FFFFFF', 61),
  ('MAG', '1. FC Magdeburg', 'Magdeburg', 'Elbe Blues', 'Elbe', '#0059A9', '#FFFFFF', 56),
  ('NUR', '1. FC Nürnberg', 'Nuremberg', 'Franconians', 'Franken', '#AF1D2C', '#000000', 62),
  ('BIE', 'Arminia Bielefeld', 'Bielefeld', 'Arminians', 'Alm', '#005BAA', '#000000', 55),
  ('DRE', 'Dynamo Dresden', 'Dresden', 'Dynamos', 'Rudolf', '#FFD500', '#000000', 56),
  ('BRA', 'Eintracht Braunschweig', 'Braunschweig', 'Brunswick Lions', 'Eintracht', '#FFD200', '#0046A0', 53),
  ('COT', 'Energie Cottbus', 'Cottbus', 'Lusatians', 'Lausitz', '#D5002B', '#FFFFFF', 50),
  ('STP', 'FC St. Pauli', 'Hamburg', 'Kiezkickers', 'Kiez', '#6B3A1E', '#FFFFFF', 62),
  ('FUR', 'Greuther Fürth', 'Fürth', 'Cloverleafs', 'Ronhof', '#009A44', '#FFFFFF', 56),
  ('H96', 'Hannover 96', 'Hanover', 'Lower Saxons', 'Leine', '#E2001A', '#1A1A1A', 61),
  ('HER', 'Hertha BSC', 'Berlin', 'Berlin Blues', 'Olympia', '#005CA9', '#FFFFFF', 63),
  ('KIE', 'Holstein Kiel', 'Kiel', 'Storks', 'Fjord', '#003C8F', '#FFFFFF', 54),
  ('KSC', 'Karlsruher SC', 'Karlsruhe', 'Wildparkers', 'Wildpark', '#0057A8', '#FFFFFF', 56),
  ('DAR', 'SV Darmstadt 98', 'Darmstadt', 'Lilies', 'Bölle', '#004E9E', '#FFFFFF', 55),
  ('BOC', 'VfL Bochum', 'Bochum', 'Ruhr Miners', 'Ruhr', '#005CA9', '#FFFFFF', 57),
  ('OSN', 'VfL Osnabrück', 'Osnabrück', 'Lilacs', 'Bremer', '#6A2C91', '#FFFFFF', 50),
  ('WOB', 'VfL Wolfsburg', 'Wolfsburg', 'Wolfpack', 'Volkswald', '#65B32E', '#FFFFFF', 68),
 ]),
 'IT2': dict(name='Serie B', country='Italy', nat='ITA', heading='Serie B (Italy)', clubs=[
  ('ASC', 'Ascoli Calcio', 'Ascoli Piceno', 'Woodpeckers', 'Cino', '#1A1A1A', '#FFFFFF', 50),
  ('BEN', 'Benevento Calcio', 'Benevento', 'Witches', 'Vigorito', '#E31B23', '#FFD100', 52),
  ('PAD', 'Calcio Padova', 'Padua', 'White Shields', 'Euganeo', '#FFFFFF', '#C8102E', 50),
  ('CAR', 'Carrarese Calcio', 'Carrara', 'Marmisti', 'Marmo', '#FFD100', '#0057B8', 48),
  ('CES', 'Cesena FC', 'Cesena', 'Seahorses', 'Manuzzi', '#1A1A1A', '#FFFFFF', 50),
  ('EMP', 'FC Empoli', 'Empoli', 'Tuscan Blues', 'Castellani', '#005BAC', '#FFFFFF', 56),
  ('SUD', 'FC Südtirol', 'Bolzano', 'South Tyroleans', 'Druso', '#E2001A', '#FFFFFF', 49),
  ('VER', 'Hellas Verona', 'Verona', 'Mastiffs', 'Bentegodi', '#FFD100', '#0033A0', 60),
  ('JST', 'Juve Stabia', 'Castellammare di Stabia', 'Wasps', 'Menti', '#FFD100', '#0033A0', 49),
  ('VIC', 'LR Vicenza', 'Vicenza', 'Lanerossi', 'Menti', '#D2232A', '#FFFFFF', 51),
  ('MAN', 'Mantova 1911', 'Mantua', 'Virgilians', 'Martelli', '#D2232A', '#FFFFFF', 48),
  ('MOD', 'Modena FC', 'Modena', 'Yellow-Blues', 'Braglia', '#FFD100', '#0057B8', 52),
  ('PAL', 'Palermo FC', 'Palermo', 'Pink and Blacks', 'Barbera', '#F8A5C2', '#1A1A1A', 63),
  ('PIS', 'Pisa Sporting Club', 'Pisa', 'Towermen', 'Arena Garibaldi', '#0057B8', '#1A1A1A', 56),
  ('ARE', 'SS Arezzo', 'Arezzo', 'Amaranths', 'Città', '#8B0000', '#FFFFFF', 46),
  ('SAM', 'UC Sampdoria', 'Genoa', 'Blucerchiati', 'Ferraris', '#0057A8', '#FFFFFF', 60),
  ('AVE', 'US Avellino 1912', 'Avellino', 'Irpini', 'Partenio', '#00703C', '#FFFFFF', 50),
  ('CTZ', 'US Catanzaro', 'Catanzaro', 'Calabrians', 'Ceravolo', '#FFD100', '#E31B23', 52),
  ('CRE', 'US Cremonese', 'Cremona', 'Grigiorossi', 'Zini', '#C8102E', '#9A9A9A', 52),
  ('ENT', 'Virtus Entella', 'Chiavari', 'Entellans', 'Comunale', '#00A3E0', '#FFFFFF', 45),
 ]),
 'ES2': dict(name='Segunda División', country='Spain', nat='ESP', heading='LaLiga 2 / Segunda División (Spain)', clubs=[
  ('CEU', 'AD Ceuta FC', 'Ceuta', 'Ceutans', 'Murallas', '#FFFFFF', '#1A1A1A', 45),
  ('ALB', 'Albacete Balompié', 'Albacete', 'Manchegos', 'Belmonte', '#FFFFFF', '#D71920', 50),
  ('BUR', 'Burgos CF', 'Burgos', 'Burgalese', 'El Plantío', '#FFFFFF', '#1A1A1A', 47),
  ('CAD', 'Cádiz CF', 'Cádiz', 'Tacitas', 'Carranza', '#FFD100', '#0033A0', 57),
  ('CAS', 'CD Castellón', 'Castellón', 'Orelluts', 'Castalia', '#1A1A1A', '#FFFFFF', 50),
  ('ELD', 'CD Eldense', 'Elda', 'Eldenses', 'Pepico Amat', '#003DA5', '#FFFFFF', 42),
  ('LEG', 'CD Leganés', 'Leganés', 'Pepineros', 'Butarque', '#0057A8', '#FFFFFF', 54),
  ('TEN', 'CD Tenerife', 'Santa Cruz de Tenerife', 'Chicharreros', 'Heliodoro', '#FFFFFF', '#0057B8', 52),
  ('SAB', 'CE Sabadell FC', 'Sabadell', 'Arlequinats', 'Nova Creu', '#0057B8', '#FFFFFF', 44),
  ('CFO', 'Celta de Vigo B (Celta Fortuna)', 'Vigo', 'Fortuna', 'Barreiro', '#8CCCE5', '#FFFFFF', 44, 'B:ES1_CEL'),
  ('COR', 'Córdoba CF', 'Córdoba', 'Caliphs', 'Arcángel', '#00703C', '#FFFFFF', 50),
  ('AND', 'FC Andorra', 'Andorra la Vella', 'Andorrans', 'Nacional', '#0033A0', '#FFD100', 46),
  ('GIR', 'Girona FC', 'Girona', 'Gironins', 'Montilivi', '#E2001A', '#FFFFFF', 60),
  ('GRA', 'Granada CF', 'Granada', 'Nasrids', 'Los Cármenes', '#E2001A', '#FFFFFF', 56),
  ('MLL', 'RCD Mallorca', 'Palma', 'Vermilions', 'Son Moix', '#E2001A', '#1A1A1A', 60),
  ('OVI', 'Real Oviedo', 'Oviedo', 'Carbayones', 'Tartiere', '#0033A0', '#FFFFFF', 54),
  ('RSB', 'Real Sociedad B', 'San Sebastián', 'Sanse', 'Zubieta', '#FFFFFF', '#0057B8', 46, 'B:ES1_RSO'),
  ('VLL', 'Real Valladolid', 'Valladolid', 'Pucelanos', 'Zorrilla', '#6C1D45', '#FFFFFF', 56),
  ('EIB', 'SD Eibar', 'Eibar', 'Armourers', 'Ipurúa', '#A50034', '#0057B8', 52),
  ('GIJ', 'Sporting Gijón', 'Gijón', 'Gijonese', 'Molinón', '#E2001A', '#FFFFFF', 55),
  ('ALM', 'UD Almería', 'Almería', 'Indalicos', 'Mediterráneo', '#E2001A', '#FFFFFF', 54),
  ('LPA', 'UD Las Palmas', 'Las Palmas', 'Canarians', 'Gran Canaria', '#FFD100', '#0057B8', 58),
 ]),
 'FR2': dict(name='Ligue 2', country='France', nat='FRA', heading='Ligue 2 (France)', clubs=[
  ('STE', 'AS Saint-Étienne (ASSE)', 'Saint-Étienne', 'Verts', 'Geoffroy', '#00A650', '#FFFFFF', 64),
  ('CLE', 'Clermont Foot 63', 'Clermont-Ferrand', 'Auvergnats', 'Gabriel Montpied', '#C8102E', '#0057B8', 48),
  ('DIJ', 'Dijon FCO', 'Dijon', 'Dijonnais', 'Gaston Gérard', '#E2001A', '#FFFFFF', 49),
  ('GUI', 'En Avant Guingamp', 'Guingamp', 'Guingampais', 'Roudourou', '#E2001A', '#1A1A1A', 52),
  ('ANN', 'FC Annecy', 'Annecy', 'Annéciens', 'Parc des Sports', '#E2001A', '#FFFFFF', 44),
  ('MET', 'FC Metz', 'Metz', 'Grenats', 'Saint-Symphorien', '#8E1B3A', '#FFFFFF', 58),
  ('NAN', 'FC Nantes', 'Nantes', 'Nantais', 'Beaujoire', '#FFD100', '#00A650', 62),
  ('SOC', 'FC Sochaux-Montbéliard (FCSM)', 'Montbéliard', 'Cubs', 'Bonal', '#FFD100', '#0033A0', 52),
  ('GRE', 'Grenoble Foot 38', 'Grenoble', 'Grenoblois', 'Alpes', '#0033A0', '#FFFFFF', 46),
  ('MTP', 'Montpellier HSC', 'Montpellier', 'Paillade', 'Mosson', '#0033A0', '#F26522', 60),
  ('NCY', 'Nancy Lorraine', 'Nancy', 'Thistles', 'Marcel Picot', '#FFFFFF', '#E2001A', 50),
  ('PAU', 'Pau FC', 'Pau', 'Béarnais', 'Nouste Camp', '#FFD100', '#0033A0', 44),
  ('RED', 'Red Star FC', 'Saint-Ouen', 'Audoniens', 'Bauer', '#00A650', '#FFFFFF', 44),
  ('ROD', 'Rodez AF', 'Rodez', 'Ruthenois', 'Paul Lignon', '#E2001A', '#FFD100', 42),
  ('REI', 'Stade de Reims', 'Reims', 'Champenois', 'Auguste Delaune', '#E2001A', '#FFFFFF', 60),
  ('LAV', 'Stade Lavallois (Laval)', 'Laval', 'Tangos', 'Francis Le Basser', '#FF7F00', '#1A1A1A', 44),
  ('BOU', 'US Boulogne', 'Boulogne-sur-Mer', 'Boulonnais', 'Libération', '#E2001A', '#1A1A1A', 43),
  ('DUN', 'USL Dunkerque', 'Dunkirk', 'Dunkerquois', 'Tribut', '#0033A0', '#E2001A', 44),
 ]),
}
PARENT = {'ES2': 'ES1', 'IT2': 'IT1', 'DE2': 'DE1', 'FR2': 'FR1'}
SUFFIX = ['Arena', 'Park', 'Stadium', 'Ground', 'Dome', 'Field']

def ground(stem, key):
    h = sum(ord(c) * (i + 3) for i, c in enumerate(key)) % len(SUFFIX)
    return f'{stem} {SUFFIX[h]}'
def capacity(rep):
    return int(round((8000 + (rep - 48) ** 2 * 30) / 100) * 100)
def stem(city):
    parts = city.split()
    return parts[1] if len(parts) > 1 and parts[0] in ('San', 'Santa', 'Las', 'Le', 'Los', 'La') else parts[0]

def node_json(expr, files):
    load = ''.join(f"vm.runInContext(fs.readFileSync('js/core/{f}.js','utf8'),c);" for f in files)
    js = f"const fs=require('node:fs'),vm=require('node:vm');const c=vm.createContext({{}});{load}process.stdout.write(JSON.stringify(vm.runInContext({json.dumps(expr)},c)));"
    return json.loads(subprocess.check_output(['node', '-e', js], cwd=ROOT, text=True))

def listed(md):
    """Club names listed under each heading of the supplied file, in order."""
    out, cur = {}, None
    for line in md.read_text(encoding='utf-8').splitlines():
        m = re.match(r'## \d+\. (.*)', line)
        if m: cur = m.group(1).strip(); out[cur] = []
        elif cur and line.startswith('* ') and not line.startswith('*Total'): out[cur].append(line[2:].strip())
    return out

def main():
    lists = listed(SRC)
    for lid, t in TIERS.items():
        names = [c[1] for c in t['clubs']]
        assert names == lists[t['heading']], f'{lid}: table does not match {SRC.name}: {set(names) ^ set(lists[t["heading"]])}'
    cat = node_json('({leagues: WORLD_LEAGUES, clubs: WORLD_CLUBS, squads: typeof OVERSEAS_FULL_SQUADS !== "undefined" ? Object.fromEntries(Object.entries(OVERSEAS_FULL_SQUADS).map(([k, v]) => [k, v.rep])) : {}})',
                    ['util', 'data', 'world-data', 'world-full-squads-data'])
    leagues, clubs, reps = cat['leagues'], cat['clubs'], cat['squads']
    for l in leagues.values():
        l.setdefault('tier', 1)
        l['code'] = l['nat']
    # Top-flight clubs gain the reputation and home ground that a playable league needs.
    for c in clubs:
        if c['league'] in PARENT.values():
            rep = reps[c['id']]
            c['rep'] = rep
            c.setdefault('ground', ground(stem(c['city']), c['id']))
            c.setdefault('cap', capacity(rep))
    used = {c['name'].lower() for c in clubs}
    for lid, t in TIERS.items():
        leagues[lid] = dict(id=lid, name=t['name'], country=t['country'], nat=t['nat'], code=t['nat'], teams=len(t['clubs']),
                            matches=2 * (len(t['clubs']) - 1), background=True, tier=2)
        for row in t['clubs']:
            code, real, city, nick, gstem, c1, c2, rep = row[:8]
            extra = row[8] if len(row) > 8 else ''
            assert nick.lower() not in used, f'duplicate nickname {nick}'
            used.add(nick.lower())
            entry = dict(id=f'{lid}_{code}', league=lid, name=nick, realName=real, city=city, nat=t['nat'], code=code, c1=c1, c2=c2,
                         rep=rep, ground=ground(gstem, f'{lid}{code}'), cap=capacity(rep))
            if extra.startswith('B:'): entry.update(reserveOf=extra[2:], noPromotion=True)
            assert not any(c['id'] == entry['id'] for c in clubs), entry['id']
            clubs.append(entry)
    path = ROOT / 'js/core/world-data.js'
    lines = path.read_text(encoding='utf-8').split('\n')
    for i, line in enumerate(lines):
        if line.startswith('const WORLD_LEAGUES = '): lines[i] = 'const WORLD_LEAGUES = ' + json.dumps(leagues, ensure_ascii=False, separators=(',', ':')) + ';'
        if line.startswith('const WORLD_CLUBS = '): lines[i] = 'const WORLD_CLUBS = ' + json.dumps(clubs, ensure_ascii=False, separators=(',', ':')) + ';'
    lines[1] = '// 2026/27 club membership. Top flights: data/world/sources.json. Second divisions: data/world/overseas/second-tier-clubs.md.'
    path.write_text('\n'.join(lines), encoding='utf-8')
    src = json.loads((ROOT / 'data/world/sources.json').read_text(encoding='utf-8'))
    for lid, t in TIERS.items():
        src['leagues'][lid] = dict(name=t['name'], country=t['country'], teams=[c[1] for c in t['clubs']])
    src['secondTierNote'] = 'Second-division membership is the supplied 2026/27 projection (data/world/overseas/second-tier-clubs.md), not an official list. Real names are shown only in club metadata; the game displays fictional nicknames.'
    (ROOT / 'data/world/sources.json').write_text(json.dumps(src, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print(len(clubs), 'world clubs;', sum(len(t['clubs']) for t in TIERS.values()), 'second-division clubs')

if __name__ == '__main__':
    main()
