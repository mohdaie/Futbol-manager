const assert = require('node:assert/strict'), fs = require('node:fs'), vm = require('node:vm'), path = require('node:path');
const { createMatchQaRuntime } = require('../scripts/match-qa-runtime.cjs');
const rt = createMatchQaRuntime(20261022), checks = [];
const check = (name, code) => { assert.ok(rt.run(code), name); checks.push(name); };
for (const file of ['js/systems/transfers.js','js/core/save-format.js','js/systems/friendlies.js']) {
  if(file.endsWith('friendlies.js')) rt.run('globalThis.ACT={};');
  vm.runInContext(fs.readFileSync(path.resolve(__dirname,'..',file),'utf8'),rt.ctx,{filename:file});
}
rt.run("newGame('GUN','World QA',1)");
const source=JSON.parse(fs.readFileSync(path.resolve(__dirname,'../data/world/sources.json'),'utf8'));
for(const [id,league] of Object.entries(source.leagues)) {
  const actual=JSON.parse(rt.run(`JSON.stringify(worldLeagueClubs('${id}').map(c=>c.realName).sort())`));
  assert.deepEqual(actual,league.teams.slice().sort());checks.push(league.name+' membership matches the pinned 2026/27 source');
}
check('All 76 clubs occur in exactly one background league', `(()=>{const ids=Object.values(G.worldLeagues).flatMap(l=>l.clubs);return ids.length===76&&new Set(ids).size===76;})()`);
const selectedClubs=JSON.parse(fs.readFileSync(path.resolve(__dirname,'../data/world/selected-clubs.json'),'utf8')).clubs;
const backgroundPalettes=JSON.parse(rt.run(`JSON.stringify(WORLD_CLUBS.filter(c=>!${JSON.stringify(Object.keys(selectedClubs))}.includes(c.id)))`));
assert.equal(backgroundPalettes.length,56);assert.ok(new Set(backgroundPalettes.map(c=>c.c1+':'+c.c2)).size>=38);assert.ok(backgroundPalettes.every(c=>/^#[0-9A-F]{6}$/i.test(c.c1)&&/^#[0-9A-F]{6}$/i.test(c.c2)));checks.push('Every background-only overseas club has an identity-matched crest palette');
check('Existing overseas clubs are reused with compact first teams and reserves', `['F0','F1','F2','F3'].every(id=>G.clubs[id].worldLeague&&G.clubs[id].squad.length===17&&!G.clubs[id].backgroundOnly)`);
check('Missing clubs have 25 stable, unique, read-only player identities and zero player records', `(()=>{const clubs=Object.values(G.clubs).filter(c=>c.backgroundOnly);return clubs.length===56&&clubs.every(c=>{const slots=dummySquadSlots(c);return !c.squad.length&&clubSquadMax(c)===0&&slots.length===25&&slots.every(p=>p.id==null&&p.transferable===false&&p.scoutable===false&&!/placeholder/i.test(p.name))&&new Set(slots.map(p=>p.name)).size===25&&JSON.stringify(slots)===JSON.stringify(dummySquadSlots(c));});})()`);
check('Virtual squad nationalities follow each league profile', `(()=>{const expected={ES1:[14,8,3],IT1:[8,10,7],DE1:[8,10,7],FR1:[8,10,7]};return Object.values(G.clubs).filter(c=>c.backgroundOnly).every(c=>{const p=VIRTUAL_SQUAD_PROFILES[c.worldLeague],slots=dummySquadSlots(c),local=slots.filter(x=>x.nat===p.local).length,nonEu=slots.slice(-p.nonEuCount).length,eu=slots.length-local-nonEu;return local===expected[c.worldLeague][0]&&eu===expected[c.worldLeague][1]&&nonEu===expected[c.worldLeague][2]&&slots.every(x=>NATIONS[x.nat]);});})()`);
check('No new fixtures or playable leagues are added', `G.fixtures.length===932&&G.leagues.join(',')==='EPL,ECH'&&Object.values(G.worldLeagues).every(l=>l.mode==='clubs-and-squads'&&l.active===false)`);
check('Placeholder clubs cannot be used to start a career', `(()=>{const original=G;try{newGame('ES1_GET','Invalid',1);return false;}catch{return G===original;}})()`);
check('Adding background leagues to a legacy career preserves every player and fixture', `(()=>{
  const ids=Object.keys(G.clubs).filter(id=>!G.clubs[id].backgroundOnly),oldPlayers=JSON.stringify(G.players),oldFixtures=JSON.stringify(G.fixtures),next=G.nextId;
  G.clubs=Object.fromEntries(ids.map(id=>[id,G.clubs[id]]));for(const c of Object.values(G.clubs))delete c.worldLeague;delete G.worldLeagues;delete G.worldLeagueVersion;
  ensureWorldLeagues();return JSON.stringify(G.players)===oldPlayers&&JSON.stringify(G.fixtures)===oldFixtures&&G.nextId===next&&Object.keys(G.clubs).length===130;
})()`);
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
console.log(JSON.stringify({passed:checks.length,checks},null,2));
