'use strict';
// Build the 2026/27 Premier League attribute database from the supplied roster markdown.
// CA/PA formula: docs/calibrated-pl-rosters/Part-2-Rating-Provenance-and-CA-PA-Derivation.md
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const docs = path.join(root, 'docs/calibrated-pl-rosters');
const files = [
  '1-Calibrated-Premier-League-First-Team-Rosters-Clubs-1-to-5-1-.md',
  '2-Calibrated-Premier-League-First-Team-Rosters-Clubs-6-to-10-1-.md',
  '3-Calibrated-Premier-League-First-Team-Rosters-Clubs-11-to-15-.md',
  '4-Calibrated-Premier-League-First-Team-Rosters-Clubs-16-to-20-.md',
];
const attrNames = ['Fin','Pas','Dri','1st','Cro','Tac','Mar','Hea','Vis','Dec','Pos','Wor','Cmp','Lea','Pac','Sta','Str','Agi','Ref','Han','1v1','Kic','Ant','OtB','Fla','Tea'];
const clubIds = new Set(['CHR','GUN','VIL','BEE','GUL','BLU','SKY','EAG','TOF','COT','TIG','TRA','PEA','RED','CIT','DEV','MAG','TRE','CAT','SPU']);
const clubNames = {
  BEE:'Bees (Brentford FC)', CAT:'Black Cats (Sunderland AFC)', BLU:'Blues (Chelsea FC)',
  CHR:'Cherries (AFC Bournemouth)', CIT:'Citizens (Manchester City FC)', COT:'Cottagers (Fulham FC)',
  EAG:'Eagles (Crystal Palace FC)', GUN:'Gunners (Arsenal FC)', MAG:'Magpies (Newcastle United FC)',
  PEA:'Peacocks (Leeds United FC)', DEV:'Red Devils (Manchester United FC)', RED:'Reds (Liverpool FC)',
  GUL:'Seagulls (Brighton & Hove Albion FC)', SKY:'Sky Blues (Coventry City FC)',
  SPU:'Spurs (Tottenham Hotspur FC)', TIG:'Tigers (Hull City AFC)', TOF:'Toffees (Everton FC)',
  TRA:'Tractor Boys (Ipswich Town FC)', TRE:'Tricky Trees (Nottingham Forest FC)', VIL:'Villans (Aston Villa FC)',
};
const normalize = value => String(value || '').normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]/g, '');
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const ratingContext = vm.createContext({});
vm.runInContext(fs.readFileSync(path.join(root, 'js/core/data.js'), 'utf8'), ratingContext);
const deriveAbility = vm.runInContext('calibratedAbility', ratingContext);
function readCurrentEplRows() {
  const ctx = vm.createContext({});
  for (const file of ['data.js','rosters.js','profiles.js','england-rosters.js','england-expansion.js']) {
    const full = path.join(root, 'js/core', file);
    vm.runInContext(fs.readFileSync(full, 'utf8'), ctx, { filename: full });
  }
  const data = JSON.parse(vm.runInContext('JSON.stringify({base:ENGLAND_ROSTERS_2026,extra:ENGLAND_EXPANSION_ROSTERS})', ctx));
  const byInspiration = new Map();
  for (const [id, rows] of Object.entries(data.base)) {
    if (!clubIds.has(id)) continue;
    for (const row of rows) {
      const key = normalize(row[5]);
      if (byInspiration.has(key)) throw new Error(`Duplicate current Premier League inspiration: ${row[5]}`);
      byInspiration.set(key, { clubId:id, row, source:'base' });
    }
  }
  for (const [id, rows] of Object.entries(data.extra)) {
    if (!clubIds.has(id)) continue;
    for (const row of rows) {
      const key = normalize(row[5]);
      if (byInspiration.has(key)) throw new Error(`Duplicate current Premier League inspiration: ${row[5]}`);
      byInspiration.set(key, { clubId:id, row, source:'expansion' });
    }
  }
  return byInspiration;
}
function parseRoster(file) {
  const text = fs.readFileSync(path.join(docs, file), 'utf8');
  const players = [];
  let club = null;
  for (const line of text.split(/\r?\n/)) {
    const heading = line.match(/^## \d+\. (.*?) — (\d+) First-Team Players/);
    if (heading) { club = heading[1]; continue; }
    if (!line.startsWith('|')) continue;
    const cols = line.trim().replace(/^\||\|$/g, '').split('|').map(x => x.trim());
    if (cols.length < 8 || cols[0] === 'Player' || cols[0].startsWith(':')) continue;
    const attrs = cols[7].split(';').map(x => Number(x.trim()));
    if (attrs.length !== 26 || attrs.some(x => !Number.isInteger(x) || x < 1 || x > 20)) continue;
    players.push({ club, name:cols[0], pos:cols[1], age:Number(cols[2]), sourceCA:Number(cols[3]), sourcePA:Number(cols[4]), insp:cols[5], attrs });
  }
  return players;
}
function ageDelta(age, sourceGap) {
  let min, max;
  if (age === 16) [min,max] = [12,25];
  else if (age <= 18) [min,max] = [10,22];
  else if (age <= 21) [min,max] = [8,18];
  else if (age <= 24) [min,max] = [3,12];
  else if (age <= 26) [min,max] = [1,6];
  else if (age <= 29) [min,max] = [0,2];
  else [min,max] = [0,0];
  return clamp(Math.max(0, sourceGap), min, max);
}
function calculate(player) {
  const { ca, weightedMean } = deriveAbility(player.attrs, player.pos);
  const sourceDelta = Math.max(0, player.sourcePA - player.sourceCA);
  const paDelta = ageDelta(player.age, sourceDelta);
  return { ca, pa:Math.min(100, ca + paDelta), weightedMean:Number(weightedMean.toFixed(4)), sourceDelta, paDelta };
}
const current = readCurrentEplRows();
const players = files.flatMap(parseRoster);
if (players.length !== 543) throw new Error(`Expected 543 roster profiles, found ${players.length}`);
const bySourceId = {};
const names = new Set();
const clubs = new Map();
for (const player of players) {
  if (!clubNames || !player.club) throw new Error('Roster row missing club heading');
  if (names.has(normalize(player.name))) throw new Error(`Duplicate display name ${player.name}`);
  names.add(normalize(player.name));
  const match = current.get(normalize(player.insp));
  if (!match) throw new Error(`No stable current player identity for ${player.insp}`);
  if (clubNames[match.clubId] !== player.club) throw new Error(`Club mismatch for ${player.insp}: ${player.club} vs ${match.clubId}`);
  const sourceId = match.row[9];
  if (!sourceId || bySourceId[sourceId]) throw new Error(`Missing or duplicate source ID for ${player.insp}`);
  if (player.age !== match.row[2]) throw new Error(`Age mismatch for ${player.insp}: source ${match.row[2]}, roster ${player.age}`);
  const result = calculate(player);
  bySourceId[sourceId] = {
    calibrationVersion:1, name:player.name, insp:player.insp, pos:player.pos, age:player.age, at:player.attrs,
    ca:result.ca, pa:result.pa, weightedMean:result.weightedMean,
    sourceDelta:result.sourceDelta, paDelta:result.paDelta,
  };
  clubs.set(player.club, (clubs.get(player.club) || 0) + 1);
}
if (Object.keys(bySourceId).length !== current.size) throw new Error(`Matched ${Object.keys(bySourceId).length} profiles to ${current.size} current IDs`);
if (clubs.size !== 20) throw new Error(`Expected 20 clubs, got ${clubs.size}`);
const output = `'use strict';\n// Generated by scripts/build-calibrated-premier-league-profiles.cjs; see rulebook 11a.\nconst ENGLAND_CALIBRATED_PROFILES_BY_ID = Object.freeze(${JSON.stringify(bySourceId)});\n`;
fs.writeFileSync(path.join(root, 'js/core/england-calibrated-profiles.js'), output);
const records = Object.values(bySourceId);
console.log(`Wrote ${records.length} calibrated Premier League profiles across ${clubs.size} clubs.`);
console.log(`CA mean ${ (records.reduce((n,p)=>n+p.ca,0)/records.length).toFixed(1)}; range ${Math.min(...records.map(p=>p.ca))}–${Math.max(...records.map(p=>p.ca))}; PA 85+ ${records.filter(p=>p.pa>=85).length}.`);
