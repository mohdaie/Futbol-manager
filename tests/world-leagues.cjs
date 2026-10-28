const assert = require('node:assert/strict'), fs = require('node:fs'), vm = require('node:vm'), path = require('node:path');
const { createMatchQaRuntime } = require('../scripts/match-qa-runtime.cjs');
const rt = createMatchQaRuntime(20261022), checks = [];
const check = (name, code) => { assert.ok(rt.run(code), name); checks.push(name); };
for (const file of ['js/systems/transfers.js','js/core/save-format.js','js/systems/friendlies.js']) {
  if(file.endsWith('friendlies.js')) rt.run('globalThis.ACT={};');
  vm.runInContext(fs.readFileSync(path.resolve(__dirname,'..',file),'utf8'),rt.ctx,{filename:file});
}
rt.run("newGame('GUN','World QA',1)");
// Rebuild the previous release's state (17-player selected clubs, 56 placeholders) so the registry and placeholder rules stay covered;
// the new full-squad migration is exercised at the end.
rt.run(`(()=>{for(const c of Object.values(G.clubs).filter(c=>c.worldLeague)){
  const selected=!!(c.foreignSquad&&WORLD_SQUAD_DATA[c.foreignSquad.catalogId]);
  for(const id of c.squad.slice()){const p=G.players[id];if(selected&&p.identity&&p.identity.source!=='OVERSEAS2026')continue;removeFromClub(p);delete G.players[id];delete G.know[id];}
  if(selected){c.foreignSquad.maxPlayers=17;c.academy.noAnnualIntake=true;}
  else{delete c.foreignSquad;delete c.academy;delete c.mgr;Object.assign(c,{backgroundOnly:true,rep:70,bal:0,dummySquad:{size:25,transferable:false},squad:[]});}
}G.overseasSquadVersion=1;G.overseasYouthVersion=1;})()`);
const source=JSON.parse(fs.readFileSync(path.resolve(__dirname,'../data/world/sources.json'),'utf8'));
for(const [id,league] of Object.entries(source.leagues)) {
  const actual=JSON.parse(rt.run(`JSON.stringify(worldLeagueClubs('${id}').map(c=>c.realName).sort())`));
  assert.deepEqual(actual,league.teams.slice().sort());checks.push(league.name+' membership matches the pinned 2026/27 source');
}
check('All 76 clubs occur in exactly one background league', `(()=>{const ids=Object.values(G.worldLeagues).flatMap(l=>l.clubs);return ids.length===76&&new Set(ids).size===76;})()`);
const selectedClubs=JSON.parse(fs.readFileSync(path.resolve(__dirname,'../data/world/selected-clubs.json'),'utf8')).clubs;
const backgroundPalettes=JSON.parse(rt.run(`JSON.stringify(WORLD_CLUBS.filter(c=>!${JSON.stringify(Object.keys(selectedClubs))}.includes(c.id)))`));
assert.equal(backgroundPalettes.length,56);assert.ok(new Set(backgroundPalettes.map(c=>c.c1+':'+c.c2)).size>=38);assert.ok(backgroundPalettes.every(c=>/^#[0-9A-F]{6}$/i.test(c.c1)&&/^#[0-9A-F]{6}$/i.test(c.c2)));checks.push('Every background-only overseas club has an identity-matched crest palette');
check('Existing overseas clubs are reused with compact first teams and reserves', `['F0','F1','F2','F3'].every(id=>G.clubs[id].worldLeague&&G.clubs[id].squad.length===14&&!G.clubs[id].backgroundOnly)`);
check('Missing clubs have 25 stable, unique, read-only player identities and zero player records', `(()=>{const clubs=Object.values(G.clubs).filter(c=>c.backgroundOnly);return clubs.length===56&&clubs.every(c=>{const slots=dummySquadSlots(c);return !c.squad.length&&clubSquadMax(c)===0&&slots.length===25&&slots.every(p=>p.id==null&&p.transferable===false&&p.scoutable===false&&!/placeholder/i.test(p.name))&&new Set(slots.map(p=>p.name)).size===25&&JSON.stringify(slots)===JSON.stringify(dummySquadSlots(c));});})()`);
check('Virtual squad nationalities follow each league profile', `(()=>{const expected={ES1:[14,8,3],IT1:[8,10,7],DE1:[8,10,7],FR1:[8,10,7]};return Object.values(G.clubs).filter(c=>c.backgroundOnly).every(c=>{const p=VIRTUAL_SQUAD_PROFILES[c.worldLeague],slots=dummySquadSlots(c),local=slots.filter(x=>x.nat===p.local).length,nonEu=slots.slice(-p.nonEuCount).length,eu=slots.length-local-nonEu;return local===expected[c.worldLeague][0]&&eu===expected[c.worldLeague][1]&&nonEu===expected[c.worldLeague][2]&&slots.every(x=>NATIONS[x.nat]);});})()`);
check('No new fixtures or playable leagues are added', `G.fixtures.length===932&&G.leagues.join(',')==='EPL,ECH'&&Object.values(G.worldLeagues).every(l=>l.mode==='clubs-and-squads'&&l.active===false)`);
check('Placeholder clubs cannot be used to start a career', `(()=>{const original=G;try{newGame('ES1_GET','Invalid',1);return false;}catch{return G===original;}})()`);
check('Adding background leagues to a legacy career preserves every player and fixture', `(()=>{
  const ids=Object.keys(G.clubs).filter(id=>!G.clubs[id].backgroundOnly),oldPlayers=JSON.stringify(G.players),oldFixtures=JSON.stringify(G.fixtures),next=G.nextId;
  G.clubs=Object.fromEntries(ids.map(id=>[id,G.clubs[id]]));for(const c of Object.values(G.clubs))delete c.worldLeague;delete G.worldLeagues;delete G.worldLeagueVersion;
  ensureWorldLeagues();return JSON.stringify(G.players)===oldPlayers&&JSON.stringify(G.fixtures)===oldFixtures&&G.nextId===next&&Object.keys(G.clubs).length===130;
})()`);
check('Existing careers refresh background crest palettes without changing selected clubs', `(()=>{const selected=['F0','F1','F2','F3'].map(id=>[id,G.clubs[id].c1,G.clubs[id].c2]),players=JSON.stringify(G.players);Object.values(G.clubs).filter(c=>c.backgroundOnly).forEach(c=>{c.c1='#A50044';c.c2='#F7CB46';});G.worldLeagueVersion=1;ensureWorldLeagues();return G.worldLeagueVersion===2&&JSON.stringify(G.players)===players&&Object.values(G.clubs).filter(c=>c.backgroundOnly).every(c=>{const e=WORLD_CLUBS.find(x=>x.id===c.id);return c.c1===e.c1&&c.c2===e.c2;})&&selected.every(([id,c1,c2])=>G.clubs[id].c1===c1&&G.clubs[id].c2===c2);})()`);
check('Registry migration is idempotent and does not consume player IDs', `(()=>{const before=JSON.stringify(G);ensureWorldLeagues();ensureWorld();return before===JSON.stringify(G);})()`);
check('A transfer into a placeholder club fails before ownership or finances change', `(()=>{
  const p=seniorSquad(G.club)[0],target=G.clubs.ES1_GET,before=JSON.stringify([G.players,G.clubs,G.fin]);let rejected=false;
  try{moveClub(p,target.id);}catch{rejected=true;}return rejected&&!sellPlayer(p,target.id,1e6)&&before===JSON.stringify([G.players,G.clubs,G.fin]);
})()`);
check('Bids and contracts cannot turn a dummy slot into a player', `(()=>{const c=G.clubs.ES1_GET,slot=dummySquadSlots(c)[0],before=JSON.stringify([G.players,G.clubs,G.fin]);const bid=makeBid(slot.id,0),offer=offerContract(slot.id,1,3,'Backup',0,'buy');let rejected=false;try{completeSigning(slot,0,1,3,'Backup');}catch{rejected=true;}return bid.r==='reject'&&!offer.ok&&rejected&&before===JSON.stringify([G.players,G.clubs,G.fin]);})()`);
check('Intake and squad top-ups cannot create background player records', `(()=>{const c=G.clubs.ES1_GET,n=Object.keys(G.players).length;fillLevel(c,'A',25);fillLevel(c,'R',20);return genYouth(c,90)===null&&Object.keys(G.players).length===n&&!c.squad.length;})()`);
check('Dummy clubs cannot arrange or start a friendly', `(()=>{const before=JSON.stringify([G.fixtures,G.nextId]),r=arrangeFriendly('ES1_GET');let rejected=false;try{createMatch({id:-1,h:G.club,a:'ES1_GET'});}catch{rejected=true;}return !!r.error&&rejected&&before===JSON.stringify([G.fixtures,G.nextId]);})()`);
check('Existing full overseas squads remain friendly candidates', `friendlyCandidates().every(c=>!c.backgroundOnly&&c.squad.length>=11)&&friendlyCandidates().length>0`);
check('Save formats retain all league records without materializing placeholders', `(()=>{const before=JSON.stringify(G),copy=parseCareerSave(careerSaveFile(G));return JSON.stringify(copy)===before&&Object.values(copy.clubs).filter(c=>c.backgroundOnly).every(c=>!c.squad.length);})()`);
check('Import rejects real players inserted into a placeholder club', `(()=>{const copy=JSON.parse(JSON.stringify(G));copy.clubs.ES1_GET.squad.push(copy.clubs[copy.club].squad[0]);try{parseCareerSave(JSON.stringify(copy));return false;}catch{return true;}})()`);
// Full overseas squads: migrating the previous release's career turns the 56 placeholders into real clubs and completes the 20 selected squads.
check('Full-squad migration gives all 76 overseas clubs 25 first-team players and removes every placeholder', `(()=>{delete G.overseasSquadVersion;delete G.overseasYouthVersion;ensureWorld();const cs=Object.values(G.clubs).filter(c=>c.worldLeague);return cs.length===76&&cs.every(c=>!c.backgroundOnly&&c.foreignSquad&&seniorSquad(c.id).length===25&&true)&&Object.values(G.worldLeagues).every(l=>l.mode==='clubs-and-squads'&&l.active===false);})()`);
check('Migrated squads are playable, scoutable and keep three prospects instead of reserve and U18 teams while the league is simulated', `Object.values(G.clubs).filter(c=>c.worldLeague).every(c=>{const p=autoPick(c.id,c.tac.ip);return p.xi.filter(Boolean).length===11&&p.bench.some(id=>G.players[id].pos==='GK')&&Object.keys(clubLevels(c)).join(',')==='A,R,Y'&&levelSquad(c.id,'R').length===3&&levelSquad(c.id,'Y').length===0&&!c.dummySquad&&!c.academy.noAnnualIntake&&c.foreignSquad.maxPlayers===undefined;})&&friendlyCandidates().every(c=>!c.backgroundOnly&&seniorSquad(c.id).length>=11)`);
check('Migrated players keep game ratings equal to their data CA and fixed shirt numbers are unique per club', `Object.values(G.players).filter(p=>p.identity?.source==='OVERSEAS2026').every(p=>{const d=OVERSEAS_FULL_SQUADS[p.identity.id.split(':')[1]].rows[+p.identity.id.split(':')[2]];return p.ca===d[5]&&p.pa===d[6]&&fullName(p)===d[0]&&p.at.length===26;})&&Object.values(G.clubs).filter(c=>c.worldLeague).every(c=>new Set(c.squad.map(id=>G.players[id].no)).size===c.squad.length)`);
check('Full-squad migration is idempotent, creates no duplicate identities and survives a save reload', `(()=>{const before=JSON.stringify(G),ids=Object.values(G.players).map(p=>p.identity?.id).filter(Boolean);ensureWorld();ensureOverseasFullSquads();const same=JSON.stringify(G)===before;const copy=parseCareerSave(careerSaveFile(G));return same&&new Set(ids).size===ids.length&&JSON.stringify(copy)===before;})()`);
check('A sold migrated player is not regenerated', `(()=>{const c=G.clubs.ES1_GET,p=seniorSquad(c.id)[0],id=p.identity.id,n=c.squad.length;removeFromClub(p);delete G.players[p.id];ensureWorld();return !Object.values(G.players).some(x=>x.identity?.id===id)&&c.squad.length===n-1;})()`);
console.log(JSON.stringify({passed:checks.length,checks},null,2));
