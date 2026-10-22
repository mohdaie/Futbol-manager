// Optional authoring tool; the game needs no build step. All ability numbers below are original.
const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const data = vm.runInNewContext(fs.readFileSync(path.join(root, 'js/core/data.js'), 'utf8') + '\nJSON.stringify({ATTRS,WEIGHTS,FOREIGN})');
const { ATTRS, WEIGHTS, FOREIGN } = JSON.parse(data);
const rosters = JSON.parse(vm.runInNewContext(fs.readFileSync(path.join(root, 'js/core/rosters.js'), 'utf8') + '\nJSON.stringify({ROSTERS,FOREIGN_ROSTERS})'));
const manifest = require('./profile-assessments.cjs'), assessments = manifest.clubs;
const signature = require('node:crypto').createHash('sha256').update(JSON.stringify(
 Object.entries({...rosters.ROSTERS,...rosters.FOREIGN_ROSTERS}).sort(([a],[b])=>a.localeCompare(b))
 .map(([k,rows])=>[k,rows.filter(r=>r[0]==='A').map(r=>[r[1],r[2],r[3],r[8]])])
)).digest('hex');
if (signature !== manifest.signature) throw Error('Roster identities/order changed: review named assessments before regenerating.');
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
// Reference outfield skills. Football types override these, independently of position/overall weights.
const base = { fin:9,pas:13,dri:11,fir:13,cro:9,tck:9,mar:9,hea:10,vis:12,dec:13,pos:11,wor:13,cmp:13,ldr:10,pac:12,sta:13,str:12,agi:12,ref:2,han:2,one:2,kic:2,ant:13,otb:11,fla:10,tea:13 };
const types = {
 gk:{fin:2,pas:9,dri:3,fir:8,cro:2,tck:3,mar:3,hea:4,vis:9,dec:14,pos:16,wor:10,cmp:14,pac:8,sta:10,str:13,agi:16,ref:17,han:16,one:16,kic:12,ant:15,otb:2,fla:3,tea:12},
 sk:{fin:2,pas:14,dri:6,fir:13,cro:2,tck:5,mar:3,hea:4,vis:13,dec:16,pos:16,wor:11,cmp:16,pac:10,sta:10,str:12,agi:15,ref:16,han:15,one:16,kic:17,ant:16,otb:3,fla:6,tea:14},
 stopper:{fin:5,pas:11,dri:7,fir:10,cro:5,tck:17,mar:17,hea:18,vis:9,dec:14,pos:17,wor:14,cmp:13,pac:10,sta:13,str:18,agi:9,ant:16,otb:8,fla:5,tea:15},
 bpd:{fin:5,pas:16,dri:11,fir:15,cro:7,tck:15,mar:15,hea:16,vis:14,dec:16,pos:16,wor:13,cmp:17,pac:12,sta:13,str:15,agi:11,ant:16,otb:8,fla:9,tea:16},
 cover:{fin:4,pas:12,dri:9,fir:12,cro:6,tck:16,mar:16,hea:15,vis:10,dec:15,pos:16,wor:14,cmp:14,pac:18,sta:14,str:15,agi:13,ant:17,otb:7,fla:5,tea:15},
 fb:{fin:5,pas:13,dri:10,fir:12,cro:12,tck:17,mar:17,hea:12,vis:10,dec:15,pos:17,wor:16,cmp:12,pac:14,sta:16,str:13,agi:12,ant:16,otb:10,fla:7,tea:16},
 wb:{fin:8,pas:13,dri:15,fir:13,cro:17,tck:13,mar:12,hea:9,vis:12,dec:13,pos:12,wor:16,cmp:12,pac:17,sta:17,str:11,agi:15,ant:13,otb:15,fla:12,tea:14},
 inverted:{fin:7,pas:16,dri:13,fir:16,cro:11,tck:14,mar:13,hea:10,vis:15,dec:16,pos:15,wor:15,cmp:16,pac:13,sta:15,str:12,agi:14,ant:15,otb:12,fla:10,tea:16},
 anchor:{fin:5,pas:14,dri:10,fir:14,cro:6,tck:17,mar:16,hea:13,vis:13,dec:17,pos:18,wor:15,cmp:16,pac:11,sta:15,str:15,agi:11,ant:18,otb:7,fla:6,tea:17},
 destroyer:{fin:6,pas:12,dri:11,fir:12,cro:6,tck:18,mar:15,hea:11,vis:10,dec:14,pos:15,wor:18,cmp:12,pac:14,sta:18,str:16,agi:14,ant:16,otb:9,fla:7,tea:16},
 regista:{fin:9,pas:18,dri:12,fir:17,cro:11,tck:12,mar:11,hea:8,vis:18,dec:18,pos:16,wor:13,cmp:18,pac:9,sta:13,str:11,agi:11,ant:17,otb:10,fla:13,tea:17},
 box:{fin:12,pas:15,dri:13,fir:14,cro:9,tck:15,mar:12,hea:12,vis:14,dec:15,pos:14,wor:18,cmp:14,pac:14,sta:18,str:15,agi:13,ant:15,otb:16,fla:10,tea:17},
 creator:{fin:10,pas:18,dri:16,fir:18,cro:12,tck:9,mar:8,hea:6,vis:18,dec:17,pos:12,wor:13,cmp:17,pac:10,sta:12,str:9,agi:16,ant:16,otb:13,fla:17,tea:16},
 runner:{fin:13,pas:14,dri:14,fir:14,cro:10,tck:11,mar:9,hea:11,vis:13,dec:14,pos:11,wor:18,cmp:13,pac:16,sta:18,str:14,agi:14,ant:14,otb:18,fla:12,tea:16},
 wing:{fin:11,pas:12,dri:16,fir:14,cro:18,tck:7,mar:6,hea:7,vis:12,dec:12,pos:7,wor:13,cmp:12,pac:18,sta:14,str:10,agi:17,ant:12,otb:15,fla:16,tea:12},
 dribbler:{fin:10,pas:13,dri:19,fir:17,cro:12,tck:5,mar:5,hea:5,vis:14,dec:12,pos:6,wor:11,cmp:12,pac:17,sta:12,str:9,agi:19,ant:12,otb:13,fla:19,tea:11},
 inside:{fin:17,pas:13,dri:16,fir:16,cro:11,tck:6,mar:5,hea:9,vis:13,dec:14,pos:6,wor:13,cmp:16,pac:17,sta:14,str:12,agi:16,ant:15,otb:18,fla:15,tea:12},
 ten:{fin:13,pas:18,dri:16,fir:18,cro:13,tck:6,mar:5,hea:6,vis:19,dec:17,pos:8,wor:12,cmp:17,pac:11,sta:12,str:9,agi:16,ant:16,otb:16,fla:18,tea:15},
 ss:{fin:17,pas:13,dri:15,fir:16,cro:9,tck:6,mar:5,hea:9,vis:13,dec:15,pos:7,wor:14,cmp:16,pac:16,sta:14,str:11,agi:16,ant:16,otb:19,fla:14,tea:13},
 poacher:{fin:19,pas:10,dri:11,fir:16,cro:5,tck:4,mar:4,hea:14,vis:10,dec:15,pos:5,wor:12,cmp:18,pac:16,sta:13,str:13,agi:13,ant:19,otb:20,fla:10,tea:11},
 target:{fin:16,pas:13,dri:8,fir:15,cro:4,tck:4,mar:5,hea:19,vis:11,dec:14,pos:6,wor:13,cmp:15,pac:10,sta:13,str:20,agi:8,ant:16,otb:16,fla:6,tea:16},
 press:{fin:16,pas:12,dri:12,fir:13,cro:7,tck:8,mar:6,hea:13,vis:11,dec:13,pos:8,wor:20,cmp:13,pac:17,sta:19,str:13,agi:14,ant:15,otb:18,fla:9,tea:18},
 link:{fin:15,pas:17,dri:14,fir:19,cro:8,tck:5,mar:4,hea:11,vis:17,dec:17,pos:6,wor:13,cmp:17,pac:11,sta:12,str:13,agi:14,ant:16,otb:16,fla:16,tea:18},
 complete:{fin:18,pas:14,dri:16,fir:18,cro:8,tck:5,mar:4,hea:14,vis:14,dec:16,pos:6,wor:14,cmp:18,pac:18,sta:14,str:15,agi:16,ant:17,otb:19,fla:15,tea:14},
};
// Distinctive traits override a type. Absolute 1–20 values are our assessments, not imported ratings.
const traits = {
 'Erling Haaland':{fin:20,cmp:19,fir:18,otb:20,ant:19,pac:18,str:19,hea:17,dri:14,agi:12,pas:12,vis:11,sta:15,wor:15,tea:14,fla:11,dec:17},
 'Jérémy Doku':{dri:19,agi:19,pac:19,fla:19,fin:12,cmp:13,dec:13,str:10,hea:5,cro:14,pas:13,otb:15},
 'Morgan Rogers':{dri:18,fir:18,pac:16,str:17,agi:16,fin:16,pas:17,vis:17,dec:17,cmp:17,otb:18,fla:17,sta:16,wor:16},
 'João Pedro':{fin:18,fir:18,cmp:17,dri:16,pas:16,vis:16,pac:16,str:15,agi:16,hea:13,otb:18,ant:17,dec:17},
 'Bruno Fernandes':{pas:19,vis:20,dec:17,fir:19,dri:15,agi:15,sta:18,wor:19,tea:18,fin:17,cmp:18,fla:18,otb:18,pac:12,str:11,cro:17},
 'Granit Xhaka':{pas:19,vis:17,dec:19,pos:18,ant:18,tea:18,ldr:18,pac:8,agi:9,dri:11,fir:16,sta:15,str:16,tck:16,mar:14,fin:11},
 'Luka Modrić':{pas:19,vis:19,dec:19,fir:19,dri:18,agi:16,sta:11,wor:14,cmp:19,tea:18,pac:9,str:8,fin:12,tck:11,pos:15,ant:18,otb:12,fla:18,ldr:18},
 'Brian Brobbey':{str:19,hea:16,pac:16,fir:16,fin:16,cmp:15,otb:17,ant:17,dec:13,dri:12,agi:12,pas:12,tea:14},
 'Kevin Schade':{pac:19,otb:16,dri:16,fir:16,fin:15,cmp:14,pas:11,vis:12,fla:14,cro:15,hea:14,str:14},
 'Virgil van Dijk':{pac:13,agi:10,hea:19,str:19,ant:19,pos:19,tck:18,mar:19,pas:16,fir:15,cmp:19,ldr:19,tea:18,dec:19,dri:10},
 'William Saliba':{pac:17,str:18,hea:16,tck:18,mar:19,pos:19,ant:18,cmp:18,dec:18,pas:16,fir:16,dri:13,agi:13,tea:17},
 'Gabriel':{hea:19,str:18,tck:18,mar:18,pos:18,ant:18,dec:17,pac:14,agi:10,pas:14,cmp:17,tea:18,ldr:16},
 'Declan Rice':{sta:19,wor:19,tea:19,tck:18,pos:18,ant:18,pas:18,vis:17,dec:18,fir:17,cmp:18,pac:15,str:17,cro:17,ldr:17},
 'Bukayo Saka':{dri:18,fir:18,fin:17,pas:17,vis:17,dec:18,cmp:18,pac:16,agi:18,otb:18,ant:17,tea:18,wor:17,str:14,cro:17},
 'Martin Ødegaard':{pas:19,vis:20,fir:19,dec:19,dri:17,agi:17,pac:12,sta:17,wor:18,tea:19,fin:15,otb:17,cmp:18,ldr:17},
 'Cole Palmer':{pas:18,vis:19,fir:19,dri:18,fin:18,cmp:19,dec:18,fla:18,agi:16,pac:14,str:12,sta:14,otb:18},
 'Moisés Caicedo':{tck:19,pos:18,ant:18,dec:17,pas:16,fir:16,wor:19,sta:19,tea:18,pac:15,str:16,agi:16,cmp:17},
 'Elliot Anderson':{pas:17,vis:16,dec:16,dri:16,fir:16,sta:18,wor:18,tck:16,pos:15,pac:14,str:15,agi:15},
 'Enzo Fernández':{pas:19,vis:19,dec:17,fir:18,cmp:17,tck:14,pos:15,sta:17,wor:17,pac:12,agi:13,str:13,dri:15,otb:15},
 'Sandro Tonali':{pas:17,vis:16,dec:17,fir:16,tck:16,pos:16,ant:17,sta:18,wor:18,tea:17,pac:16,str:15,dri:14,agi:14},
 'Kylian Mbappé':{pac:20,agi:19,dri:19,fin:20,cmp:19,fir:19,otb:20,ant:18,str:15,pas:16,vis:15,dec:17,hea:10,wor:11,tea:12},
 'Vinicius Junior':{pac:20,dri:20,agi:19,fla:20,fin:17,cmp:17,otb:18,ant:16,pas:16,vis:16,dec:16,str:11,hea:6},
 'Jude Bellingham':{fin:17,otb:19,ant:18,pas:17,vis:17,fir:18,dri:18,str:17,sta:19,wor:18,cmp:18,dec:18,agi:16,pac:16,tea:18,hea:15},
 'Federico Valverde':{pac:18,sta:20,wor:20,tea:19,str:17,pas:17,vis:16,dec:17,tck:17,pos:16,fin:15,dri:15,fir:17,otb:17},
 'Vitinha':{pas:20,vis:19,dec:19,fir:20,dri:18,cmp:19,agi:17,pac:12,str:10,sta:18,wor:17,tea:19,pos:17,tck:14},
 'Ousmane Dembélé':{dri:19,agi:19,pac:18,fla:19,fir:18,fin:18,pas:17,vis:17,otb:18,ant:17,dec:16,cmp:17,str:10,hea:7,wor:16},
 'Khvicha Kvaratskhelia':{dri:19,fla:19,agi:18,pac:17,fir:18,fin:17,pas:17,vis:17,cmp:17,dec:16,otb:17,str:14,sta:17,wor:16},
 'Phil Foden':{dri:18,agi:18,fir:19,pas:17,vis:17,fin:17,otb:18,dec:17,cmp:17,pac:14,str:10,sta:16,tea:17},
 'Rayan Cherki':{dri:19,fla:20,fir:19,pas:18,vis:19,agi:18,pac:13,fin:14,dec:15,cmp:15,sta:13,wor:11,str:11},
 'Alexander Isak':{fin:19,cmp:19,fir:18,dri:18,pac:17,agi:17,str:14,hea:12,otb:19,ant:17,pas:15,vis:14},
 'Hugo Ekitiké':{dri:17,pac:17,agi:16,fin:17,fir:17,otb:18,str:14,hea:13,pas:14,cmp:16},
 'Cody Gakpo':{fin:17,hea:15,str:16,pac:16,dri:16,agi:13,pas:15,fir:16,otb:17,cro:16},
 'Bruno Guimarães':{pas:18,vis:18,dec:18,fir:18,cmp:18,dri:16,pac:11,agi:14,sta:17,wor:17,pos:16,tck:16,str:14},
 'Pascal Groß':{pas:18,vis:18,dec:18,fir:17,cro:18,tea:18,pac:7,agi:10,sta:13,str:11,dri:12,pos:16},
 'Christian Nørgaard':{pos:17,ant:17,tck:16,tea:17,dec:16,pas:15,pac:9,agi:10,sta:14,str:14},
 'Chris Wood':{fin:17,cmp:17,hea:19,str:18,otb:18,ant:17,pac:9,agi:7,dri:8,pas:11,fir:13},
 'Dan Burn':{hea:18,str:19,pac:10,agi:6,tck:16,mar:17,pos:17,ant:16,pas:11,fir:10},
 'Micky van de Ven':{pac:20,agi:13,str:17,hea:14,pos:16,mar:16,tck:17,ant:16,pas:14},
 'Harry Maguire':{hea:19,str:19,pac:8,agi:6,pos:17,ant:16,mar:16,tck:16,pas:14,fir:12,ldr:16},
 'Kyle Walker':{pac:14,sta:12,agi:10,str:15,pos:15,ant:15,dec:14,cro:11,pas:12},
 'Kieran Trippier':{cro:18,pas:17,vis:16,dec:17,pos:16,ant:16,pac:8,agi:9,sta:11,str:10},
 'Jamie Vardy':{fin:17,ant:18,otb:18,cmp:16,pac:12,agi:11,sta:10,str:10,dri:9,pas:9,wor:14},
 'Callum Wilson':{fin:17,otb:17,ant:16,cmp:16,pac:12,sta:11,dri:11,agi:11,str:13},
 'Raúl Jiménez':{fin:16,cmp:17,hea:17,fir:16,pas:15,vis:14,otb:17,pac:10,agi:10,sta:12,str:16},
 'Nicolas Jackson':{pac:17,otb:18,wor:17,sta:16,dri:14,fin:14,cmp:13,pas:12,hea:11},
 'Max Dowman':{pa:92,dri:15,agi:15,fir:14,fla:16,str:7,sta:10,dec:10,pas:12,fin:10},
 'Endrick':{pa:90,fin:16,str:15,pac:16,otb:15,dec:11,cmp:13},
 'Estêvão':{pa:94,dri:18,fir:16,fla:18,agi:18,fin:14,pas:14,str:8,dec:13},
 'Rio Ngumoha':{pa:90,pac:17,dri:16,agi:17,fla:17,str:7,dec:10,fin:10},
 'Francesco Camarda':{pa:87,fin:13,otb:14,ant:12,str:10,dec:9,cmp:11},
 'Faisal Halim':{pac:15,agi:17,dri:14,fla:14,fin:12,str:5,hea:3,otb:13,sta:14,wor:14},
 'Safuwan Baharudin':{hea:15,ant:14,ldr:16,pos:14,dec:14,str:13,pac:8,agi:8},
 'Mukhairi Ajmal':{pas:14,vis:14,fir:13,dri:12,fin:11,dec:12,str:9,sta:12},
};
const familiar = {
 'Myles Lewis-Skelly':['DL','MC'],'Jurriën Timber':['DC','DL'],'Ben White':['DC'],'Piero Hincapié':['DL'],
 'Riccardo Calafiori':['DC'],'Declan Rice':['DM'],'Bruno Guimarães':['DM'],'Mikel Merino':['DM','ST'],
 'Eberechi Eze':['AML'],'Bukayo Saka':['MR'],'Kai Havertz':['AMC'],'Morgan Rogers':['AML','ST'],
 'Cole Palmer':['AMR'],'João Pedro':['AMC'],'Joško Gvardiol':['DC'],'Nico O\'Reilly':['MC'],
 'Matheus Nunes':['MC'],'Rico Lewis':['DM','MC'],'Enzo Fernández':['DM'],'Phil Foden':['AMR','MC'],
 'Rayan Cherki':['AMR'],'Iliman Ndiaye':['AMC'],'Antoine Semenyo':['AML','ST'],'Bruno Fernandes':['MC'],
 'Matheus Cunha':['AMC','AML'],'Amad Diallo':['AMC'],'Patrick Dorgu':['DL'],'Noussair Mazraoui':['DL'],
 'Lisandro Martínez':['DM'],'Luke Shaw':['DC'],'Kobbie Mainoo':['DM'],'Youri Tielemans':['DM'],
 'Florian Wirtz':['AML'],'Dominik Szoboszlai':['MC'],'Cody Gakpo':['ST'],'Federico Chiesa':['AML'],
 'Jude Bellingham':['MC'],'Federico Valverde':['MR','DR'],'Eduardo Camavinga':['DM','DL'],
 'Aurélien Tchouaméni':['DC'],'Trent Alexander-Arnold':['DM'],'Vinicius Junior':['ST'],
 'Kylian Mbappé':['AML'],'Rodrygo':['AML','ST'],'Arda Güler':['AMR'],'Bernardo Silva':['MC','AMR'],
 'Vitinha':['MC'],'João Neves':['DM'],'Warren Zaïre-Emery':['DM'],'Ousmane Dembélé':['AMR','AML'],
 'Désiré Doué':['AML','AMC'],'Ferran Torres':['AMR','AML'],'Lucas Hernández':['DC'],
 'Luka Modrić':['AMC'],'Christian Pulisic':['AML','AMC'],'Alexis Saelemaekers':['DR','AMR'],
 'Granit Xhaka':['MC'],'Enzo Le Fée':['AMC'],'Noah Sadiki':['DM'],'Habib Diarra':['AMC'],
 'Sandro Tonali':['MC'],'Dejan Kulusevski':['AMR','MC'],'Xavi Simons':['AML'],'Archie Gray':['DM','MC'],
 'James Maddison':['MC'],'Mohammed Kudus':['AMC'],'Omar Marmoush':['AML'],'Mathys Tel':['ST'],
 'Mats Wieffer':['DM','MC'],'Pascal Groß':['DR','DM'],'Jack Hinshelwood':['DR','MC'],
 'Ferdi Kadıoğlu':['DR','ML'],'Georginio Rutter':['AMC'],'Antonee Robinson':['ML'],
 'Alex Iwobi':['MC','AML'],'Sander Berge':['MC'],'Tomáš Souček':['MC'],'Joël Veltman':['DC'],
 'Jarrad Branthwaite':['DL'],'Jake O\'Brien':['DC'],'Ainsley Maitland-Niles':['MC','DM'],
 'John McGinn':['MC','AMC'],'Boubacar Kamara':['DC'],'Aaron Wan-Bissaka':['DL'],
 'Kristoffer Ajer':['DR'],'Keane Lewis-Potter':['AML'],'Aaron Hickey':['DL'],'Dango Ouattara':['AML','ST'],
 'Justin Kluivert':['AML'],'Marcus Tavernier':['AML','MC'],'David Brooks':['AMC'],
 'Takehiro Tomiyasu':['DR','DL'],'Óscar Mingueza':['DC'],'Daichi Kamada':['AMC'],
 'Marcos Senesi':['DL'],'Murillo':['DL'],'Dan Burn':['DL'],'Lewis Hall':['MC'],
 'Kieran Trippier':['DL'],'Raúl Jiménez':['AMC'],'Safuwan Baharudin':['DM','ST'],
 'Jefferson Tabinas':['DL'],'Quentin Cheng':['MR'],'Mukhairi Ajmal':['AMC'],
};
const profiles = {}, evidence = [];
for (const [club, source] of Object.entries(assessments)) {
 const rows = (rosters.ROSTERS[club] || rosters.FOREIGN_ROSTERS[club] || []).filter(r => r[0] === 'A');
 const specs = source.trim().split(/\s+/);
 if (rows.length !== specs.length) throw Error(club + ': ' + rows.length + ' players but ' + specs.length + ' assessments');
 rows.forEach((r,i) => {
  const [quality,type,height] = specs[i].split('/'), q = +quality, pos = r[2], name = r[8];
  if (!types[type] || !name || profiles[r[1]]) throw Error('Invalid or duplicated profile: ' + r[1]);
  const values = {...base, ...types[type]};
  // Match the assessment band by a uniform shift, never by randomly editing key skills.
  // Then apply the player's actual football traits; overall is read back from the result.
  const weights = WEIGHTS[pos], wsum = Object.values(weights).reduce((a,b)=>a+b,0);
  const reference = Object.entries(weights).reduce((s,[k,w])=>s+values[k]*w,0)/wsum;
  const shift = q / 5 - reference;
  for (const [k,,group] of ATTRS) values[k] = clamp(Math.round(values[k] + (pos==='GK' ? (group==='G'||weights[k] ? shift : 0) : group==='G' ? 0 : shift)),1,20);
  // Age only affects mobility/endurance and leadership; no blanket veteran quality bonus.
  const ageing = Math.max(0,r[3]-(pos==='GK'?35:30));
  for (const k of (pos==='GK'?['agi']:['pac','sta','agi'])) values[k]=clamp(values[k]-Math.floor(ageing*.45),1,20);
  values.ldr = clamp(Math.round(8 + Math.max(0,r[3]-20)*.35),4,17);
  const special = traits[name] || {};
  for(const [k,v] of Object.entries(special)) if(k!=='pa') values[k]=v;
  const at=ATTRS.map(([k])=>values[k]);
  const ca=Math.round(Object.entries(weights).reduce((s,[k,w])=>s+values[k]*w,0)/wsum*5);
  const growth = r[3]<=17?18:r[3]<=19?13:r[3]<=21?9:r[3]<=23?6:r[3]<=26?2:0;
  const pa=Math.max(ca, Math.min(94, special.pa || ca+growth));
  const ht=+height, bmi=type==='target'||type==='stopper'?24:type==='dribbler'||type==='wing'?21.5:22.8;
  // Physical dimensions without a cited measurement remain stable fictional estimates.
  const wt=Math.round(bmi*(ht/100)**2);
  profiles[r[1]]={insp:name,pos,age:r[3],type,q,at,pa,ht,wt,alt:familiar[name]||[],confidence:Object.keys(special).length?'individual':'provisional'};
  evidence.push({club,name:r[1],inspiration:name,type,assessment:q,overall:ca,potential:pa,height:ht,confidence:profiles[r[1]].confidence});
 });
}
const expected = [...Object.values(rosters.ROSTERS),...Object.values(rosters.FOREIGN_ROSTERS)].flat().filter(r=>r[0]==='A');
if(expected.length!==Object.keys(profiles).length)throw Error('First-team coverage incomplete');
const archetypes = Object.fromEntries(Object.entries(types).map(([k,v])=>[k,{...base,...v}]));
const objectLines = o => '{\n' + Object.entries(o).map(([k,v])=>'  '+JSON.stringify(k)+': '+JSON.stringify(v)).join(',\n')+'\n}';
const output = "'use strict';\n// Rulebook 11a: original fixed football profiles, independent of market values.\n// Generated by scripts/build-player-profiles.cjs from original assessments; no third-party ratings.\nconst ROSTER_PROFILE_VERSION = 1;\nconst PLAYER_ARCHETYPES = " + objectLines(archetypes) + ';\nconst ROSTER_PROFILES = ' + objectLines(profiles) + ';\n';
fs.writeFileSync(path.join(root,'js/core/profiles.js'),output);
fs.mkdirSync(path.join(root,'docs/player-profiles'),{recursive:true});
fs.writeFileSync(path.join(root,'docs/player-profiles/assessments.json'),JSON.stringify(evidence,null,2)+'\n');
console.log('Built '+expected.length+' original profiles.');
