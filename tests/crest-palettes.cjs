const assert=require('node:assert/strict');
const {createMatchQaRuntime}=require('../scripts/match-qa-runtime.cjs');
const rt=createMatchQaRuntime(1);
// Independent audit expectations: these must not be derived from production data.
const expected={ES1_ATH:['#ED1C24','#FFFFFF'],ES1_ATM:['#D71920','#FFFFFF'],ES1_BAR:['#A50044','#00529F'],ES1_CEL:['#8CCCE5','#FFFFFF'],ES1_VAL:['#FFFFFF','#111111'],ES1_VIL:['#FFE667','#002D62'],IT1_JUV:['#FFFFFF','#111111'],DE1_DOR:['#FFDD00','#111111'],DE1_FRA:['#111111','#E30613'],DE1_BAY:['#DC052D','#FFFFFF'],DE1_RBL:['#FFFFFF','#DD003F'],FR1_MON:['#E30613','#FFFFFF'],FR1_LIL:['#E21A23','#142D4E'],ES1_RMA:['#FFFFFF','#FEBE10'],IT1_ATA:['#1E71B8','#111111'],IT1_INT:['#00529F','#111111'],IT1_COM:['#0047AB','#FFFFFF'],FR1_STR:['#007BC4','#FFFFFF'],FR1_MAR:['#2FAEE0','#FFFFFF'],FR1_TRO:['#1C4D8C','#FFFFFF']};
rt.run("newGame('GUN','Palette QA',1)");
const palettes=()=>JSON.parse(rt.run(`JSON.stringify(Object.fromEntries(WORLD_CLUBS.filter(e=>WORLD_CREST_PALETTE_FIX_IDS.has(e.id)).map(e=>{const c=G.clubs[e.id]||Object.values(G.clubs).find(c=>c.ros===e.existingRoster);return [e.id,[c.c1,c.c2]]})))`));
assert.deepEqual(palettes(),expected,'New careers use independently audited colours');
rt.run(`globalThis.paletteBefore=JSON.stringify([G.players,G.fixtures,G.fin]);globalThis.unaffected=JSON.stringify(Object.values(G.clubs).filter(c=>!WORLD_CREST_PALETTE_FIX_IDS.has(c.id)&&c.id!=='F0').map(c=>[c.id,c.c1,c.c2]));for(const e of WORLD_CLUBS.filter(e=>WORLD_CREST_PALETTE_FIX_IDS.has(e.id))){const c=G.clubs[e.id]||Object.values(G.clubs).find(c=>c.ros===e.existingRoster);c.c1='#123456';c.c2='#654321';}delete G.worldCrestPaletteVersion;ensureWorldLeagues();`);
assert.deepEqual(palettes(),expected,'Existing careers with world registry v2 migrate');
assert.ok(rt.run(`paletteBefore===JSON.stringify([G.players,G.fixtures,G.fin])&&unaffected===JSON.stringify(Object.values(G.clubs).filter(c=>!WORLD_CREST_PALETTE_FIX_IDS.has(c.id)&&c.id!=='F0').map(c=>[c.id,c.c1,c.c2]))`),'Migration preserves player, fixture, finance and unrelated palette data');
assert.ok(rt.run(`(()=>{const before=JSON.stringify(G);ensureWorldLeagues();return before===JSON.stringify(G)})()`),'Migration is idempotent');
assert.ok(rt.run(`(()=>{const c=G.clubs.F0;delete G.clubs.F0;c.id='F99';c.name='Renamed Castilla';G.clubs.F99=c;c.c1='#123456';delete G.worldCrestPaletteVersion;ensureWorldLeagues();return c.c1==='#FFFFFF'&&c.c2==='#FEBE10';})()`),'Legacy foreign IDs and renamed clubs resolve through roster identity');
console.log('20 audited palettes pass new-career, saved-career, legacy-ID, preservation and idempotency checks');
