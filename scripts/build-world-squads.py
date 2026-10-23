#!/usr/bin/env python3
"""Build compact foreign identity squads from pinned, locally available mirrors.

Usage: python3 scripts/build-world-squads.py PROFILE_CSV FPL_2026_27_DIRECTORY
Identity facts only: no real-world ability, potential, value or wage ratings are imported.
"""
import argparse, collections, csv, datetime, difflib, json, re, subprocess, unicodedata
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('profiles', type=Path)
parser.add_argument('fpl', type=Path)
args = parser.parse_args()
selection = json.loads((ROOT/'data/world/selected-clubs.json').read_text())
# Read the checked-in game catalog, rather than depending on a scratch export.
CATALOG = """const fs=require('node:fs'),vm=require('node:vm'),c=vm.createContext({});for(const f of ['data','world-data','rosters','profiles','england-rosters'])vm.runInContext(fs.readFileSync('js/core/'+f+'.js','utf8'),c);process.stdout.write(vm.runInContext('JSON.stringify({clubs:WORLD_CLUBS,profiles:ROSTER_PROFILES,foreign:FOREIGN_ROSTERS,rosters:ROSTERS,england:ENGLAND_ROSTERS_2026,countries:COUNTRY,nations:NATIONS})',c));"""
cat = json.loads(subprocess.check_output(['node','-e',CATALOG],cwd=ROOT,text=True))
meta = list(csv.DictReader(args.profiles.open()))
fpl = list(csv.DictReader((args.fpl/'players_raw.csv').open()))

def norm(value):
    return re.sub(r'[^a-z0-9]', '', unicodedata.normalize('NFKD', value).encode('ascii','ignore').decode().lower())
def real(row):
    return re.sub(r' \(\d+\)$', '', row['player_name']).strip()
def age(dob):
    try:
        d = datetime.date.fromisoformat(dob)
        a = 2026-d.year-((7,6)<(d.month,d.day))
        return a if 15 <= a <= 45 else None
    except (ValueError, TypeError):
        return None

byname = collections.defaultdict(list)
bydob = collections.defaultdict(list)
byclub = collections.defaultdict(list)
for row in meta:
    byname[norm(real(row))].append(row)
    bydob[row['date_of_birth']].append(row)
    byclub[row['current_club_id']].append(row)
profiles = cat['profiles']
profile_by_name = {norm(p['insp']): key for key,p in profiles.items()}
legacy = {norm(r[8]):r for rows in list(cat['rosters'].values())+list(cat['foreign'].values()) for r in rows if len(r)>8}
worldclubs = {c['id']:c for c in cat['clubs']}
selected_rosters = {worldclubs[c].get('existingRoster') for c in selection['clubs']}
# Current known English affiliations override an older foreign snapshot, including
# current English players outside our selected English first-team squad size.
excluded = {norm(r[5]) for rows in cat['england'].values() for r in rows if r[5]}
excluded_ids = {r[9] for rows in cat['england'].values() for r in rows if r[9]}
for row in fpl:
    full = row['first_name']+' '+row['second_name']
    excluded.update([norm(full), norm(row['web_name'])])
    candidates = []
    for m in bydob[row['birth_date']]:
        score = max(difflib.SequenceMatcher(None,norm(full),norm(real(m))).ratio(),difflib.SequenceMatcher(None,norm(row['web_name']),norm(real(m))).ratio())
        if score >= .70:
            candidates.append((score,m))
    if candidates:
        m = max(candidates,key=lambda pair:pair[0])[1]
        excluded.add(norm(real(m)))
        excluded_ids.add('tm:'+m['player_id'])
for roster,rows in cat['foreign'].items():
    if roster not in selected_rosters:
        excluded.update(norm(r[8]) for r in rows if len(r)>8)

countries = {norm(n[0]): code for code,n in cat['countries'].items()}
countries.update({norm(n):code for n,code in {
    "Cote d'Ivoire":'CIV','Cote d’Ivoire':'CIV','Korea, South':'KOR','Korea South':'KOR',
    'Türkiye':'TUR','Turkey':'TUR','United States':'USA','United States of America':'USA',
    'Congo DR':'COD','DR Congo':'COD','Bosnia-Herzegovina':'BIH','Czechia':'CZE',
    'Guinea-Bissau':'GNB','Trinidad and Tobago':'TRI','Cape Verde':'CPV','Sierra Leone':'SLE',
    'South Africa':'RSA','Tunisia':'TUN','Guinea':'GUI','Iraq':'IRQ','St. Lucia':'LCA',
    'Barbados':'BAR','Kenya':'KEN','Namibia':'NAM','Panama':'PAN','Montenegro':'MNE','Martinique':'MTQ'
}.items()})
positions = {'Goalkeeper':'GK','Centre-Back':'DC','Left-Back':'DL','Right-Back':'DR',
    'Defensive Midfield':'DM','Central Midfield':'MC','Left Midfield':'ML','Right Midfield':'MR',
    'Attacking Midfield':'AMC','Left Winger':'AML','Right Winger':'AMR','Centre-Forward':'ST','Second Striker':'AMC'}
shapes = {
 '4-3-3':['GK','DL','DC','DC','DR','DM','MC','MC','AML','ST','AMR'],
 '4-2-3-1':['GK','DL','DC','DC','DR','DM','DM','AML','AMC','AMR','ST'],
 '4-4-2':['GK','DL','DC','DC','DR','ML','MC','MC','MR','ST','ST'],
 '3-5-2':['GK','DC','DC','DC','ML','DM','MC','MC','MR','ST','ST'],
 '3-4-3':['GK','DC','DC','DC','ML','MC','MC','MR','AML','ST','AMR']}
# Alternative game role compatibility; a sourced natural position is never changed.
families = [set(['DL','ML','AML']),set(['DR','MR','AMR']),set(['DM','MC','AMC']),set(['ST','AMC'])]
def fit(pos,slot):
    if pos == slot:return 100
    if any(pos in f and slot in f for f in families):return 75
    if pos=='DC' and slot in ['DM','DL','DR']:return 35
    if slot=='DC' and pos in ['DM','DL','DR']:return 35
    if pos in ['AML','AMR'] and slot=='ST':return 45
    if pos in ['AMC','MC'] and slot in ['AML','AMR','ML','MR']:return 30
    return -1000 if 'GK' in [pos,slot] else -100

used_names = set(excluded)
used_ids = set(excluded_ids)
pools = collections.defaultdict(set)
firsts = collections.defaultdict(list)
for code,n in cat['nations'].items():
    pools[code].update(n['l'])
    firsts[code].extend(n['f'])
for rows in list(cat['rosters'].values())+list(cat['foreign'].values()):
    for r in rows:
        parts=r[1].split(' ',1)
        if len(parts)==2:pools[r[4]].add(parts[1])
used_aliases = set()
unknown = []

def alias(name,nat,key=''):
    if key and norm(key)!=norm(name) and norm(key) not in used_aliases:
        used_aliases.add(norm(key));return key
    parts=name.split(' ',1)
    first,last=parts[0],parts[-1]
    choices=sorted(pools[nat],key=lambda n:(-difflib.SequenceMatcher(None,norm(n),norm(last)).ratio(),n))
    for surname in choices:
        val=first+' '+surname
        if norm(val)!=norm(name) and norm(val) not in used_aliases:
            used_aliases.add(norm(val));return val
    for old,new in [('a','e'),('e','a'),('i','y'),('o','u'),('u','o')]:
        val=first+' '+re.sub(old,new,last,count=1,flags=re.I)
        if norm(val)!=norm(name) and norm(val) not in used_aliases:
            used_aliases.add(norm(val));return val
    raise ValueError('Cannot create fictional alias: '+name)

def sourced(m,old=None):
    name=real(m) if m else old[8]
    key=profile_by_name.get(norm(name),'')
    # Canonical spelling matches existing authored inspiration IDs where present.
    canonical=profiles[key]['insp'] if key else name
    dob=m['date_of_birth'] if m and age(m['date_of_birth']) else ''
    a=age(dob) or (old[3] if old else profiles[key]['age'] if key else None)
    # Existing aliases have an explicitly authored football nationality; otherwise
    # use the snapshot's first listed citizenship, not place of birth.
    nat=old[4] if old else countries.get(norm(m['citizenship'].split('  ')[0])) if m else None
    pos=old[2] if old else positions.get(m['position'].split(' - ')[-1]) if m else None
    if not canonical or not a or not nat or not pos:
        unknown.append({'name':name,'age':a,'nation':nat,'position':pos});return None
    sid='tm:'+m['player_id'] if m else 'authored:'+key
    if norm(canonical) in used_names or sid in used_ids:return None
    foot=old[5] if old else 'L' if m['foot']=='left' else 'B' if m['foot']=='both' else 'R'
    return {'name':canonical,'pos':pos,'age':a,'nat':nat,'foot':foot,'dob':dob,'key':key,
      'source':'EXISTING' if old else 'TM2025','id':sid,'club':m['current_club_name'] if m and not old else '',
      'rank':0,'uid':norm(canonical)}

def reserve_sort(e):
    return (abs(e['age']-20),e['id'])

def claim(e,level):
    used_names.add(e['uid']);used_ids.add(e['id'])
    return [alias(e['name'],e['nat'],e['key']),e['pos'],e['age'],e['nat'],e['foot'],e['name'],e['dob'],e['key'],e['source'],e['id'],level,e['club']]

def generated(cid,pos,index):
    nat=worldclubs[cid]['nat']; ns=firsts[nat] or ['Alex']; ls=sorted(pools[nat]) or ['Moran']
    i=index
    while True:
        name=ns[i%len(ns)]+' '+ls[(i//len(ns)+index*7)%len(ls)]
        if norm(name) not in used_aliases:
            used_aliases.add(norm(name));break
        i+=1
    return [name,pos,18+index%3,nat,'R','', '', '', 'GENERATED','generated:'+cid+':'+str(index),'R','']

out={};report={}; source_counts=collections.Counter()
for cid,config in selection['clubs'].items():
    preferred={norm(n):i for i,n in enumerate(config['preferred'])}
    entries={}
    legacy_roster=worldclubs[cid].get('existingRoster')
    if legacy_roster:
        for old in cat['foreign'][legacy_roster]:
            if old[0]!='A':continue
            matches=byname.get(norm(old[8]),[])
            # Name-only authored matches never override the authored nationality/role.
            # Prefer the same-club metadata when a common name has several entries.
            m=next((m for m in matches if m['current_club_id']==config['tm']),None)
            e=sourced(m,old)
            if e:entries[e['uid']]=e
    for m in byclub[config['tm']]:
        e=sourced(m)
        if e and e['uid'] not in entries:entries[e['uid']]=e
    candidates=list(entries.values())
    for e in candidates:
        e['rank']=(100 if e['uid'] in preferred else 0)+(15 if e['source']=='EXISTING' else 0)
    picked=[]
    # Centre-backs and goalkeepers first to avoid spending scarce specialists on
    # flexible midfield/wing roles. Shape is game selection, not a factual lineup.
    slots=sorted(enumerate(shapes[config['shape']]),key=lambda v:({'GK':0,'DC':1,'ST':2}.get(v[1],3),v[0]))
    lineup={}
    for slot_index,slot in slots:
        available=[e for e in candidates if e not in picked]
        e=max(available,key=lambda e:(fit(e['pos'],slot)*10+e['rank'], -preferred.get(e['uid'],99), e['id']),default=None)
        if not e or fit(e['pos'],slot)<0:
            raise ValueError(cid+' lacks senior coverage for '+slot)
        picked.append(e);lineup[slot_index]=e
    rows=[claim(lineup[i],'A') for i in range(11)]
    # Reserve identity facts come from listed B/U23/academy-affiliated teams where
    # available; this does not assert that an individual is a homegrown graduate.
    reserve_entries={}
    for club_id in config['reserves']+[config['tm']]:
        for m in byclub[club_id]:
            e=sourced(m)
            if e and 16<=e['age']<=24 and e['uid'] not in reserve_entries:
                reserve_entries[e['uid']]=e
    reserve_candidates=sorted(reserve_entries.values(),key=reserve_sort)
    gaps=[]
    for index,target in enumerate(['GK','DC','DL','MC','AMR','ST']):
        available=[e for e in reserve_candidates if e['uid'] not in used_names and e['id'] not in used_ids]
        if target=='GK':available=[e for e in available if e['pos']=='GK']
        else:available=[e for e in available if e['pos']!='GK']
        e=max(available,key=lambda e:(fit(e['pos'],target), -abs(e['age']-20), e['id']),default=None)
        if e:
            rows.append(claim(e,'R'))
        else:
            rows.append(generated(cid,target,index));gaps.append({'position':target,'reason':'No eligible unused source identity available'})
    source_counts.update(r[8] for r in rows)
    out[cid]={k:config[k] for k in ['rep','academy','shape','basis']}
    out[cid]['rows']=rows
    report[cid]={'firstTeam':11,'reserves':6,'sources':dict(collections.Counter(r[8] for r in rows)),
      'generatedGaps':gaps,'sourceClubs':sorted(set(r[11] for r in rows if r[11])),
      'inspirations':[r[5] for r in rows if r[5]]}

header="'use strict';\n// Identity snapshot dates and limitations: data/world/squads-sources.json.\n// Game selection and academy estimates are original; no commercial ability data.\n// Rows: [fictional name, natural game role, July-2026 age, nation, foot, inspiration, DOB, profile key, source, source ID, level, source club].\n"
(ROOT/'js/core/world-squads-data.js').write_text(header+'const WORLD_SQUAD_DATA = '+json.dumps(out,ensure_ascii=False,separators=(',',':'))+';\n')
(ROOT/'data/world/squad-report.json').write_text(json.dumps({'counts':dict(source_counts),'clubs':report,'unknownSourceIdentitiesSkipped':unknown},indent=2,ensure_ascii=False)+'\n')
source_doc={
 'selection':selection['selection'],
 'academy':selection['academyScale'],
 'identitySources':[
  {'id':'TM2025','url':'https://github.com/salimt/football-datasets','revision':'da9227e1f42baf74561324290dbf1ad2e3c00edd','path':'datalake/transfermarkt/player_profiles/player_profiles.csv','snapshotDate':'2025-09-13','fieldsUsed':['player_id','player_name','date_of_birth','citizenship','position','foot','current_club_id','current_club_name'],'limitations':'Older accessible identity/club snapshot. These are not verified complete 2026/27 squads. Nation uses first listed citizenship where the game has no existing authored football nationality. B/U23 affiliation does not prove homegrown academy status.'},
  {'id':'EXISTING','path':'js/core/rosters.js: FOREIGN_ROSTERS and js/core/profiles.js','limitations':'Existing original game roster identities and fictional aliases for the four previously authored counterparts. Real-world membership is not newly verified. Available same-club profile DOB may be reused; ages without DOB retain the authored game age.'},
  {'id':'FPL2026','url':'https://github.com/vaastav/Fantasy-Premier-League','path':'data/2026-27/players_raw.csv','snapshotDate':'2026-10-22','use':'Exclusion only: current known English affiliations override older foreign snapshot membership.'},
  {'id':'GENERATED','use':'Fictional reserve gaps. No real inspiration, DOB or claimed real-world affiliation.'}],
 'ability':'Ability, potential, wages, contracts, heights, development and valuations remain original game estimates. No Transfermarkt valuations or commercial ability ratings were imported.',
 'season':'Ages are evaluated at 2026-07-06 where DOB exists. The runtime advances age for an existing career season.',
 'scope':'20 compact squads of 11 first-team and six reserves. Foreign league schedules remain inactive. Historical academy strength is an original game parameter; no annual intake.',
 'rebuild':'python3 scripts/build-world-squads.py /path/to/player_profiles.csv /path/to/FPL/data/2026-27'
}
(ROOT/'data/world/squads-sources.json').write_text(json.dumps(source_doc,indent=2,ensure_ascii=False)+'\n')
print(json.dumps({'counts':dict(source_counts),'clubs':len(out),'players':sum(len(c['rows'])for c in out.values()),'generatedGaps':{c:r['generatedGaps']for c,r in report.items()if r['generatedGaps']},'unknown':unknown},indent=2))
