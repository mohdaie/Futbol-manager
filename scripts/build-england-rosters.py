#!/usr/bin/env python3
"""Build identity facts from local pinned mirrors; no network or commercial ratings.

Usage: python3 scripts/build-england-rosters.py /path/to/FPL/data/2026-27 /path/to/player_profiles.csv
Source revisions/dates are recorded in data/england/sources.json.
"""
import argparse,csv,json,re,unicodedata,difflib,collections,datetime,subprocess
from pathlib import Path
parser=argparse.ArgumentParser(description=__doc__)
parser.add_argument('fpl',type=Path)
parser.add_argument('profiles',type=Path)
args=parser.parse_args()
root=Path(__file__).resolve().parent.parent
catalog_js="""const vm=require('node:vm'),fs=require('node:fs');const c=vm.createContext({});for(const f of ['data','rosters','profiles'])vm.runInContext(fs.readFileSync('js/core/'+f+'.js','utf8'),c);process.stdout.write(vm.runInContext('JSON.stringify({clubs:ENGLISH_CLUBS,rosters:ROSTERS,foreign:FOREIGN_ROSTERS,profiles:ROSTER_PROFILES,countries:COUNTRY,nations:NATIONS})',c));"""
cat=json.loads(subprocess.check_output(['node','-e',catalog_js],cwd=root,text=True))
REGION_COUNTRIES={'200': 'Spain', '73': 'France', '30': 'Brazil', '152': 'Netherlands', '241': 'England', '106': 'Italy', '62': 'Ecuador', '161': 'Norway', '173': 'Portugal', '206': 'Sweden', '80': 'Germany', '83': 'Greece', '172': 'Poland', '190': 'Serbia', '10': 'Argentina', '107': 'Jamaica', '243': 'Scotland', '21': 'Belgium', '207': 'Switzerland', '189': 'Senegal', '108': 'Japan', '50': 'DR Congo', '139': 'Mexico', '229': 'United States', '244': 'Wales', '98': 'Hungary', '145': 'Morocco', '219': 'Türkiye', '230': 'Uruguay', '104': 'Ireland', '99': 'Iceland', '35': 'Burkina Faso', '58': 'Denmark', '225': 'Ukraine', '132': 'Mali', '14': 'Austria', '78': 'The Gambia', '157': 'Nigeria', '97': 'Croatia', '81': 'Ghana', '54': "Cote d'Ivoire", '3': 'Algeria', '13': 'Australia', '203': 'Suriname', '48': 'Colombia', '242': 'Northern Ireland', '217': 'Trinidad and Tobago', '44': 'Chile', '90': 'Guinea-Bissau', '39': 'Canada', '103': 'Iraq', '2': 'Albania', '168': 'Paraguay', '195': 'Slovenia', '27': 'Bosnia-Herzegovina', '34': 'Bulgaria', '79': 'Georgia', '57': 'Czech Republic', '231': 'Uzbekistan', '38': 'Cameroon', '154': 'New Zealand', '63': 'Egypt', '194': 'Slovakia', '146': 'Mozambique', '92': 'Guinea', '114': 'South Korea', '105': 'Israel'}
def norm(s):return re.sub(r'[^a-z0-9]','',unicodedata.normalize('NFKD',s).encode('ascii','ignore').decode().lower())
def real(m):return re.sub(r' \(\d+\)$','',m['player_name'])
meta=list(csv.DictReader(args.profiles.open()))
fpl=list(csv.DictReader((args.fpl/'players_raw.csv').open()))
byname=collections.defaultdict(list)
for m in meta:byname[norm(real(m))].append(m)
bydob=collections.defaultdict(list)
for m in meta:
 if m['date_of_birth'] not in ['', 'None']:bydob[m['date_of_birth']].append(m)
joined=[]
for r in fpl:
 candidates=[]
 for m in bydob[r['birth_date']]:
  score=max(difflib.SequenceMatcher(None,norm(r['first_name']+' '+r['second_name']),norm(real(m))).ratio(),difflib.SequenceMatcher(None,norm(r['web_name']),norm(real(m))).ratio())
  candidates.append((score,m))
 candidates.sort(key=lambda item:item[0],reverse=True)
 score,m=candidates[0] if candidates else (0,None)
 joined.append({'row':r,'meta':m if score>=.70 else None,'score':score})
join={'players':joined,'regions':REGION_COUNTRIES.copy()}
profiles=cat['profiles']; byinsp={norm(p['insp']):k for k,p in profiles.items()}
legacy={r[8]:r for rs in cat['rosters'].values() for r in rs if len(r)>8}
country={norm(n[0]):k for k,n in cat['countries'].items()}
country.update({norm(n):k for n,k in {'Cote d\u2019Ivoire':'CIV',"Cote d'Ivoire":'CIV','Korea, South':'KOR','Korea South':'KOR','Türkiye':'TUR','Turkey':'TUR','United States':'USA','United States of America':'USA','Congo DR':'COD','DR Congo':'COD','Bosnia-Herzegovina':'BIH','Czechia':'CZE','Guinea-Bissau':'GNB','Trinidad and Tobago':'TRI','Cape Verde':'CPV','Sierra Leone':'SLE','South Africa':'RSA','Tunisia':'TUN','Guinea':'GUI','Iraq':'IRQ','St. Lucia':'LCA','Barbados':'BAR','Kenya':'KEN','Namibia':'NAM','Panama':'PAN','Montenegro':'MNE','Martinique':'MTQ'}.items()})
regions=join['regions'];regions.update({'203':'Suriname','92':'Guinea','114':'South Korea','105':'Israel'})
posmap={'Goalkeeper':'GK','Centre-Back':'DC','Left-Back':'DL','Right-Back':'DR','Defensive Midfield':'DM','Central Midfield':'MC','Left Midfield':'ML','Right Midfield':'MR','Attacking Midfield':'AMC','Left Winger':'AML','Right Winger':'AMR','Centre-Forward':'ST','Second Striker':'AMC'}
def position(m,default=None):return posmap.get(m['position'].split(' - ')[-1],default)
def age(dob):
 try:
  d=datetime.date.fromisoformat(dob);a=2026-d.year-((7,6)<(d.month,d.day));return a if 15<=a<=45 else None
 except:return None
def profile_for(names):
 for n in names:
  if norm(n) in byinsp:return byinsp[norm(n)]
 return ''
def metadata_for(r,j):
 candidates=byname.get(norm(r['first_name']+' '+r['second_name']),[])
 if not candidates:candidates=byname.get(norm(r['web_name']),[])
 if candidates:
  exact=[m for m in candidates if m['date_of_birth']==r['birth_date']]
  if len(exact)==1:return exact[0]
  if len(candidates)==1 and (r['birth_date'] in ['None',''] or candidates[0]['date_of_birth']==r['birth_date']):return candidates[0]
 return j['meta'] if j['score']>=.70 else None
# Use current football nationality from FPL, rather than the first citizenship in an older profile.
# England/Wales/Scotland/NI use their own football nationalities.
def nation(m=None,region=None,key=''):
 n=regions.get(region) if region and region!='None' else None
 if n:return country.get(norm(n))
 if key:
  p=profiles[key];r=legacy.get(p['insp']);
  if r:return r[4]
 if m:return country.get(norm(m['citizenship'].split('  ')[0]))
 return None
# Fictional name pools stay within the nationality. Reuse existing authored aliases when available.
pools=collections.defaultdict(set)
for rs in list(cat['rosters'].values())+list(cat['foreign'].values()):
 for r in rs:
  parts=r[1].split(' ',1)
  if len(parts)==2:pools[r[4]].add(parts[1])
for nat,n in cat['nations'].items():pools[nat].update(n['l'])
usedaliases=set(); assigned=set(); out={}; counts=collections.Counter(); unknown=[]
def alias(n,nat,key):
 if key and norm(key) not in usedaliases:
  usedaliases.add(norm(key));return key
 parts=n.split(' ',1);first=parts[0];last=parts[-1]
 options=sorted(pools[nat],key=lambda s:(-difflib.SequenceMatcher(None,norm(s),norm(last)).ratio(),s))
 for surname in options:
  a=first+' '+surname
  if norm(a)!=norm(n) and norm(a) not in usedaliases:usedaliases.add(norm(a));return a
 # Small datasets can lack a nationality's name pool; keep the language and change a vowel.
 for a,b in [('a','e'),('e','a'),('i','y'),('o','u'),('u','o')]:
  changed=re.sub(a,b,last,count=1,flags=re.I)
  val=first+' '+changed
  if norm(val)!=norm(n) and norm(val) not in usedaliases:usedaliases.add(norm(val));return val
 raise ValueError('Cannot make alias '+n)
def entry(n,m=None,r=None,source='TM2025',key='',fallbackpos=None):
 if not n.strip():return None
 key=key or profile_for([n])
 dob=r['birth_date'] if r and age(r['birth_date']) else m['date_of_birth'] if m else ''
 a=age(dob) or (profiles[key]['age'] if key else None)
 nat=nation(m,r['region'] if r else None,key)
 pos=profiles[key]['pos'] if key else position(m,fallbackpos) if m else fallbackpos
 if not a or not nat or not pos:unknown.append((n,a,nat,pos));return None
 canonical=profiles[key]['insp'] if key else real(m) if m else n
 # A long legal name in FPL and a short sporting name are one player.
 uid=norm(canonical)
 if uid in assigned:return None
 foot=m['foot'] if m else ''
 if not foot and key:foot=legacy.get(profiles[key]['insp'],[None]*6)[5] or ''
 return dict(n=canonical,m=m,a=a,nat=nat,pos=pos,foot='L' if foot in ['left','L'] else 'B' if foot in ['both','B'] else 'R',dob=dob if age(dob) else '',key=key,source=source,id='fpl:'+r['id'] if r else 'tm:'+m['player_id'] if m else 'authored:'+key,uid=uid)
def select(entries,size):
 chosen=[]
 for ps,num in [(['GK'],2),(['DC'],3),(['DL'],1),(['DR'],1),(['DM','MC'],3),(['ST'],2),(['AML','ML'],1),(['AMR','MR'],1)]:
  for e in [e for e in entries if e['pos'] in ps][:num]:
   if e not in chosen:chosen.append(e)
 for e in entries:
  if len(chosen)>=size:break
  if e not in chosen:chosen.append(e)
 return chosen[:size]
def store(cid,entries,size):
 rows=[]
 for e in select(entries,size):
  if e['uid'] in assigned:continue
  assigned.add(e['uid']);rows.append([alias(e['n'],e['nat'],e['key']),e['pos'],e['a'],e['nat'],e['foot'],e['n'],e['dob'],e['key'],e['source'],e['id']]);counts[e['source']]+=1
 out[cid]=rows
clubmap={'Arsenal':'GUN','Aston Villa':'VIL','Bournemouth':'CHR','Brentford':'BEE','Brighton':'GUL','Chelsea':'BLU','Coventry City':'SKY','Crystal Palace':'EAG','Everton':'TOF','Fulham':'COT','Hull City':'TIG','Ipswich Town':'TRA','Leeds':'PEA','Liverpool':'RED','Man City':'CIT','Man Utd':'DEV','Newcastle':'MAG','Nott\'m Forest':'TRE','Sunderland':'CAT','Spurs':'SPU'}
teammap={r['id']:clubmap[r['name']]for r in csv.DictReader((args.fpl/'teams.csv').open())}
all_fpl=set()
for team,cid in teammap.items():
 es=[]
 for j in join['players']:
  r=j['row']
  if r['team']!=team:continue
  n=r['first_name']+' '+r['second_name'];m=metadata_for(r,j)
  key=profile_for([n,r['web_name'],real(m)if m else ''])
  e=entry(n,m,r,'FPL2026',key,{1:'GK',2:'DC',3:'MC',4:'ST'}[int(r['element_type'])])
  if e:
   all_fpl.add(e['uid']);e['rank']=(1 if key else 0,int(r['minutes']),int(r['starts']),-e['a']);es.append(e)
 es.sort(key=lambda e:e['rank'],reverse=True);store(cid,es,25)
# Existing relegated squads have the game's newer authored first teams. Keep those identities,
# excluding anyone whose current Premier League membership is known from FPL.
clubids={'BIR':'337','BLA':'164','BOL':'355','BRI':'698','CLA':'1132','CAR':'603','CHA':'358','DER':'22','LIN':'1198','MID':'641','MIL':'1028','NOR':'1123','POM':'1020','PRE':'466','QPR':'1039','SHU':'350','SOU':'180','STO':'512','SWA':'2288','WAT':'1010','WBA':'984','HAM':'379','OLD':'543','WRE':'1112'}
for cid,id in clubids.items():
 es=[]
 if cid in ['CLA','HAM','OLD']:
  for row in cat['rosters'][cid]:
   if row[0]!='A' or norm(row[8])in all_fpl:continue
   e=entry(row[8],key=row[1],source='EXISTING')
   if e:es.append(e)
 # Older facts are a disclosed fallback. FPL membership overrides old club affiliation.
 for m in sorted([m for m in meta if m['current_club_id']==id],key=lambda m:(not(23<=(age(m['date_of_birth'])or 0)<=32),m['player_id'])):
  e=entry(real(m),m)
  if e and e['uid']not in all_fpl and all(x['uid']!=e['uid']for x in es):es.append(e)
 store(cid,es,24)
(root/'js/core/england-rosters.js').write_text("'use strict';\n// Sourced identity facts only; dates and limitations are in data/england/sources.json.\n// [fictional name, position, July-2026 age, nation, foot, inspirational figure, DOB, authored profile key, source, source ID]\nconst ENGLAND_ROSTERS_2026 = "+json.dumps(out,ensure_ascii=False,separators=(',',':'))+';\n')
(root/'data/england/roster-report.json').write_text(json.dumps({'counts':dict(counts),'firstTeamTarget':{'EPL':25,'ECH':24},'clubs':{c:{'sourced':len(rs),'generated':(25 if c in teammap.values() else 24)-len(rs),'sources':dict(collections.Counter(r[8]for r in rs))}for c,rs in out.items()},'note':'Generated reserves: Championship 12, Premier League 20 plus U18s 20. Club rosters describe source snapshots, not verified transfer-window completeness.'},indent=2)+'\n')
print(json.dumps({'counts':dict(counts),'clubSizes':{c:len(r)for c,r in out.items()},'unknownIdentitiesSkipped':unknown},indent=2))
