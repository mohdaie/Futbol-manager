'use strict';
/* ===== data.js =====
   Static game data: clubs, nations and names, positions, attributes, formations,
   roles, instructions, training, press conferences, team talks and shouts.
   Edit this file to rebalance or rename things without touching game logic. */

const GAME_NAME = 'Futbol Manager';
const GAME_VERSION = '2026.10.22.45';
// Manager portraits shown as Manager 1-5 (small copies of public/assets/managers).
const AVATARS = [1, 2, 3, 4, 5];
const avatarSrc = n => `public/assets/managers/small/manager-${AVATARS.includes(+n) ? +n : 1}.webp`;
const START_SEASON = 2026;
const LEAGUE_NAME = 'Premier League';

// The 20 top-flight clubs, by nickname. rep (1-100) drives squad quality, money and expectations.
const LEGACY_CLUBS = [
  { id: 'GUN', name: 'Gunners', city: 'North London', c1: '#D7192D', c2: '#FFFFFF', rep: 91, ground: 'Armoury Park', cap: 60700 },
  { id: 'VIL', name: 'Villans', city: 'Birmingham', c1: '#7A1E43', c2: '#9CC7EA', rep: 82, ground: 'Holte Park', cap: 42600 },
  { id: 'CHR', name: 'Cherries', city: 'Bournemouth', c1: '#D52B1E', c2: '#141414', rep: 76, ground: 'Seaside Court', cap: 11300 },
  { id: 'BEE', name: 'Bees', city: 'Brentford', c1: '#E30613', c2: '#FFFFFF', rep: 75, ground: 'Hive Road', cap: 17250 },
  { id: 'GUL', name: 'Seagulls', city: 'Brighton', c1: '#0057B8', c2: '#FFFFFF', rep: 78, ground: 'Falmer Downs', cap: 31800 },
  { id: 'CLA', name: 'Clarets', city: 'Burnley', c1: '#6C1D45', c2: '#99D6EA', rep: 70, ground: 'Turf Lane', cap: 21900 },
  { id: 'BLU', name: 'Blues', city: 'West London', c1: '#0A4AA6', c2: '#FFFFFF', rep: 87, ground: 'Bridge Ground', cap: 40300 },
  { id: 'EAG', name: 'Eagles', city: 'South London', c1: '#1B458F', c2: '#C4122E', rep: 76, ground: 'Selhurst Lodge', cap: 25400 },
  { id: 'TOF', name: 'Toffees', city: 'Merseyside', c1: '#1240A0', c2: '#FFFFFF', rep: 75, ground: 'Dockside Arena', cap: 52800 },
  { id: 'COT', name: 'Cottagers', city: 'West London', c1: '#F2F2F2', c2: '#1A1A1A', rep: 75, ground: 'Riverside Cottage', cap: 29600 },
  { id: 'PEA', name: 'Peacocks', city: 'Leeds', c1: '#F7F7F7', c2: '#1D428A', rep: 72, ground: 'Elland Park', cap: 37800 },
  { id: 'RED', name: 'Reds', city: 'Merseyside', c1: '#C8102E', c2: '#F6EB61', rep: 92, ground: 'Kop Hill', cap: 61200 },
  { id: 'CIT', name: 'Citizens', city: 'Manchester', c1: '#6CABDD', c2: '#1C2C5B', rep: 92, ground: 'Eastlands Dome', cap: 53400 },
  { id: 'DEV', name: 'Red Devils', city: 'Manchester', c1: '#DA291C', c2: '#FBE122', rep: 84, ground: 'Trafford Park', cap: 74300 },
  { id: 'MAG', name: 'Magpies', city: 'Tyneside', c1: '#1A1A1A', c2: '#FFFFFF', rep: 84, ground: 'Gallowgate Park', cap: 52300 },
  { id: 'TRE', name: 'Tricky Trees', city: 'Nottingham', c1: '#DD0000', c2: '#FFFFFF', rep: 77, ground: 'Trentside Ground', cap: 30400 },
  { id: 'CAT', name: 'Black Cats', city: 'Wearside', c1: '#EB172B', c2: '#1A1A1A', rep: 70, ground: 'Wearmouth Park', cap: 49000 },
  { id: 'SPU', name: 'Spurs', city: 'North London', c1: '#FFFFFF', c2: '#132257', rep: 83, ground: 'Lane Arena', cap: 62800 },
  { id: 'HAM', name: 'Hammers', city: 'East London', c1: '#7A263A', c2: '#1BB1E7', rep: 76, ground: 'Bow Stadium', cap: 62500 },
  { id: 'OLD', name: 'Old Gold', city: 'Wolverhampton', c1: '#FDB913', c2: '#231F20', rep: 73, ground: 'Waterloo Road', cap: 31700 },
];


// 2026/27 domestic membership: OpenFootball snapshot, recorded in data/england/sources.json.
const REAL_CLUB_NAMES = {"GUN": "Arsenal FC", "VIL": "Aston Villa FC", "CHR": "AFC Bournemouth", "BEE": "Brentford FC", "GUL": "Brighton & Hove Albion FC", "CLA": "Burnley FC", "BLU": "Chelsea FC", "EAG": "Crystal Palace FC", "TOF": "Everton FC", "COT": "Fulham FC", "PEA": "Leeds United FC", "RED": "Liverpool FC", "CIT": "Manchester City FC", "DEV": "Manchester United FC", "MAG": "Newcastle United FC", "TRE": "Nottingham Forest FC", "CAT": "Sunderland AFC", "SPU": "Tottenham Hotspur FC", "HAM": "West Ham United FC", "OLD": "Wolverhampton Wanderers FC"};
const ADDED_ENGLISH_CLUBS = [{"id":"SKY","name":"Sky Blues","city":"Coventry","realName":"Coventry City FC","c1":"#64A4D9","c2":"#FFFFFF","rep":71,"ground":"Highfield Arena","cap":32600},{"id":"TIG","name":"Tigers","city":"Hull","realName":"Hull City AFC","c1":"#F5A623","c2":"#111111","rep":69,"ground":"Humber Park","cap":25400},{"id":"TRA","name":"Tractor Boys","city":"Ipswich","realName":"Ipswich Town FC","c1":"#005AAA","c2":"#FFFFFF","rep":71,"ground":"Portman Ground","cap":30300},{"id":"BIR","name":"Brummies","city":"Birmingham","realName":"Birmingham City FC","c1":"#0000AA","c2":"#FFFFFF","rep":68,"ground":"Small Heath Park","cap":29400},{"id":"BLA","name":"Rovers","city":"Blackburn","realName":"Blackburn Rovers FC","c1":"#0066CC","c2":"#FFFFFF","rep":65,"ground":"Ewood Ground","cap":31300},{"id":"BOL","name":"Trotters","city":"Bolton","realName":"Bolton Wanderers FC","c1":"#FFFFFF","c2":"#002060","rep":62,"ground":"Horwich Stadium","cap":28700},{"id":"BRI","name":"Robins","city":"Bristol","realName":"Bristol City FC","c1":"#E21A23","c2":"#FFFFFF","rep":66,"ground":"Ashton Park","cap":27000},{"id":"CAR","name":"Bluebirds","city":"Cardiff","realName":"Cardiff City FC","c1":"#0070B5","c2":"#FFFFFF","rep":63,"ground":"Leckwith Ground","cap":33300},{"id":"CHA","name":"Addicks","city":"Charlton","realName":"Charlton Athletic FC","c1":"#D71920","c2":"#FFFFFF","rep":62,"ground":"Valley Ground","cap":27100},{"id":"DER","name":"Rams","city":"Derby","realName":"Derby County FC","c1":"#FFFFFF","c2":"#111111","rep":65,"ground":"Pride Ground","cap":33500},{"id":"LIN","name":"Imps","city":"Lincoln","realName":"Lincoln City FC","c1":"#D71920","c2":"#FFFFFF","rep":60,"ground":"Sincil Ground","cap":10700},{"id":"MID","name":"Boro","city":"Middlesbrough","realName":"Middlesbrough FC","c1":"#E21A23","c2":"#FFFFFF","rep":69,"ground":"Teeside Ground","cap":34700},{"id":"MIL","name":"Lions","city":"Millwall","realName":"Millwall FC","c1":"#001B54","c2":"#FFFFFF","rep":65,"ground":"Bermondsey Den","cap":20100},{"id":"NOR","name":"Canaries","city":"Norwich","realName":"Norwich City FC","c1":"#FFF200","c2":"#00A650","rep":68,"ground":"Carrow Ground","cap":27200},{"id":"POM","name":"Pompey","city":"Portsmouth","realName":"Portsmouth FC","c1":"#001489","c2":"#FFFFFF","rep":62,"ground":"Fratton Ground","cap":20800},{"id":"PRE","name":"Lilywhites","city":"Preston","realName":"Preston North End FC","c1":"#FFFFFF","c2":"#002060","rep":64,"ground":"Deepdale Park","cap":23400},{"id":"QPR","name":"Hoops","city":"West London","realName":"Queens Park Rangers FC","c1":"#005CA9","c2":"#FFFFFF","rep":64,"ground":"Shepherds Ground","cap":18400},{"id":"SHU","name":"Blades","city":"Sheffield","realName":"Sheffield United FC","c1":"#EE2737","c2":"#FFFFFF","rep":69,"ground":"Bramall Ground","cap":32700},{"id":"SOU","name":"Saints","city":"Southampton","realName":"Southampton FC","c1":"#D71920","c2":"#FFFFFF","rep":71,"ground":"St Marys Park","cap":32300},{"id":"STO","name":"Potters","city":"Stoke","realName":"Stoke City FC","c1":"#E03A3E","c2":"#FFFFFF","rep":65,"ground":"Trentham Stadium","cap":30000},{"id":"SWA","name":"Swans","city":"Swansea","realName":"Swansea City AFC","c1":"#FFFFFF","c2":"#111111","rep":64,"ground":"Tawe Stadium","cap":21100},{"id":"WAT","name":"Hornets","city":"Watford","realName":"Watford FC","c1":"#FBEE23","c2":"#111111","rep":67,"ground":"Vicarage Ground","cap":22200},{"id":"WBA","name":"Baggies","city":"West Bromwich","realName":"West Bromwich Albion FC","c1":"#122F67","c2":"#FFFFFF","rep":67,"ground":"Hawthorns Park","cap":26800},{"id":"WRE","name":"Red Dragons","city":"Wrexham","realName":"Wrexham AFC","c1":"#E41B23","c2":"#FFFFFF","rep":64,"ground":"Racecourse Park","cap":13300}];
const ENGLISH_CLUBS = LEGACY_CLUBS.map(c => ({ ...c, realName: REAL_CLUB_NAMES[c.id] })).concat(ADDED_ENGLISH_CLUBS);
const ENGLAND_MEMBERSHIP_2026 = {"EPL":["CHR","GUN","VIL","BEE","GUL","BLU","SKY","EAG","TOF","COT","TIG","TRA","PEA","RED","CIT","DEV","MAG","TRE","CAT","SPU"],"ECH":["BIR","BLA","BOL","BRI","CLA","CAR","CHA","DER","LIN","MID","MIL","NOR","POM","PRE","QPR","SHU","SOU","STO","SWA","WAT","WBA","HAM","OLD","WRE"]};
const CLUBS = ENGLAND_MEMBERSHIP_2026.EPL.map(id => ENGLISH_CLUBS.find(c => c.id === id));
const CHAMPIONSHIP_CLUBS = ENGLAND_MEMBERSHIP_2026.ECH.map(id => ENGLISH_CLUBS.find(c => c.id === id));

// Clubs abroad. They play no fixtures; they hold players you can scout and buy. ros: their real-based squad in FOREIGN_ROSTERS (rosters.js).
const FOREIGN = [
  { name: 'Castilla CF', ros: 'RMA', nat: 'ESP', rep: 86, c1: '#F5F5F5', c2: '#5B2C83' },
  { name: 'Lutece SG', ros: 'PSG', nat: 'FRA', rep: 84, c1: '#0B2A5B', c2: '#E2001A' },
  { name: 'Lombardia AC', ros: 'MIL', nat: 'ITA', rep: 81, c1: '#B5121B', c2: '#111111' },
  { name: 'Rhein 04', ros: 'LEV', nat: 'GER', rep: 80, c1: '#E32219', c2: '#111111' },
  { name: 'Porto Norte', ros: 'POR', nat: 'POR', rep: 78, c1: '#1B4E9B', c2: '#FFFFFF' },
  { name: 'Amstel FC', ros: 'AJA', nat: 'NED', rep: 76, c1: '#FFFFFF', c2: '#C8102E' },
  { name: 'Rio Atletico', ros: 'FLA', nat: 'BRA', rep: 74, c1: '#1A1A1A', c2: '#E30613' },
  { name: 'Pampas Juniors', ros: 'BOC', nat: 'ARG', rep: 73, c1: '#0033A0', c2: '#FFD100' },
  { name: 'Brussels Royal', ros: 'AND', nat: 'BEL', rep: 70, c1: '#5B2C83', c2: '#FFFFFF' },
  { name: 'Tokyo Bay FC', ros: 'TOK', nat: 'JPN', rep: 66, c1: '#00205B', c2: '#E4002B' },
  { name: 'Oslo Vikings', ros: 'VAL', nat: 'NOR', rep: 62, c1: '#FFD200', c2: '#111111' },
  { name: 'Lagos Stars', ros: 'REM', nat: 'NGA', rep: 60, c1: '#008751', c2: '#FFFFFF' },
  { name: 'Selangor Harimau', ros: 'SEL', nat: 'MAS', rep: 58, c1: '#E2001A', c2: '#FFD100' },
];

const NATIONS = {
  ENG: { n: 'England', r: 'Britain & Ireland', f: ['Harry', 'Jack', 'Oliver', 'George', 'Charlie', 'Alfie', 'Callum', 'Mason', 'Reece', 'Jordan', 'Tyler', 'Kieran', 'Ben', 'Lewis', 'Jamie', 'Connor', 'Ryan', 'Ethan', 'Noah', 'Josh'], l: ['Walker', 'Hughes', 'Bennett', 'Clarke', 'Turner', 'Wright', 'Barnes', 'Foster', 'Palmer', 'Mitchell', 'Hayes', 'Shaw', 'Cole', 'Ward', 'Holt', 'Rowe', 'Gibbs', 'Marsh', 'Doyle', 'Fletcher', 'Ashworth', 'Pickering', 'Lowe', 'Kirby'] },
  SCO: { n: 'Scotland', r: 'Britain & Ireland', f: ['Callum', 'Ross', 'Scott', 'Andrew', 'Kenny', 'Billy', 'Lewis', 'Fraser', 'Euan', 'Calum'], l: ['MacLeod', 'Fraser', 'Campbell', 'Murray', 'Stewart', 'Ferguson', 'McKenzie', 'Paterson', 'Gilchrist', 'Drummond'] },
  IRL: { n: 'Ireland', r: 'Britain & Ireland', f: ['Sean', 'Cian', 'Darragh', 'Conor', 'Oisin', 'Evan', 'Niall', 'Ronan'], l: ['Byrne', 'Kelly', "O'Brien", 'Walsh', 'Ryan', 'Doherty', 'Moran', 'Keane'] },
  ESP: { n: 'Spain', r: 'Europe', f: ['Pablo', 'Alvaro', 'Sergio', 'Iker', 'Dani', 'Marc', 'Pedro', 'Adrian', 'Hugo', 'Raul', 'Unai', 'Mikel'], l: ['Garcia', 'Navarro', 'Ortega', 'Romero', 'Iglesias', 'Serrano', 'Molina', 'Castro', 'Vidal', 'Ruiz', 'Herrera', 'Dominguez'] },
  FRA: { n: 'France', r: 'Europe', f: ['Lucas', 'Theo', 'Hugo', 'Antoine', 'Jules', 'Mathis', 'Enzo', 'Maxime', 'Rayan', 'Yanis', 'Bastien', 'Noam'], l: ['Martin', 'Bernard', 'Dubois', 'Moreau', 'Laurent', 'Lefevre', 'Fontaine', 'Girard', 'Mercier', 'Blanc', 'Garnier', 'Kone'] },
  GER: { n: 'Germany', r: 'Europe', f: ['Leon', 'Jonas', 'Lukas', 'Felix', 'Niklas', 'Florian', 'Timo', 'Kai', 'Julian', 'Moritz', 'Jannik'], l: ['Muller', 'Schmidt', 'Wagner', 'Becker', 'Hoffmann', 'Schulz', 'Kramer', 'Brandt', 'Vogel', 'Neuhaus', 'Weber'] },
  POR: { n: 'Portugal', r: 'Europe', f: ['Joao', 'Ruben', 'Diogo', 'Goncalo', 'Rafael', 'Tiago', 'Bruno', 'Nuno', 'Andre', 'Vasco'], l: ['Silva', 'Santos', 'Ferreira', 'Costa', 'Pereira', 'Neves', 'Mendes', 'Carvalho', 'Moutinho', 'Teixeira'] },
  ITA: { n: 'Italy', r: 'Europe', f: ['Lorenzo', 'Federico', 'Nicolo', 'Alessandro', 'Matteo', 'Davide', 'Gianluca', 'Sandro', 'Riccardo', 'Giacomo'], l: ['Rossi', 'Bianchi', 'Romano', 'Ricci', 'Esposito', 'Conti', 'Marino', 'Greco', 'Gallo', 'Colombo'] },
  NED: { n: 'Netherlands', r: 'Europe', f: ['Daan', 'Sem', 'Luuk', 'Bram', 'Jurrien', 'Xavi', 'Cody', 'Teun', 'Joey', 'Milan'], l: ['de Jong', 'Bakker', 'Visser', 'de Vries', 'Smit', 'Janssen', 'Mulder', 'van der Berg', 'Kuipers', 'Dekker'] },
  BEL: { n: 'Belgium', r: 'Europe', f: ['Arthur', 'Romeo', 'Youri', 'Jeremy', 'Leandro', 'Charles', 'Maxim', 'Zeno'], l: ['Peeters', 'Janssens', 'Maes', 'Claes', 'Wouters', 'Lambert', 'Dupont', 'Goossens'] },
  NOR: { n: 'Norway', r: 'Europe', f: ['Erik', 'Martin', 'Sander', 'Jonas', 'Kristian', 'Oscar', 'Andreas', 'Tobias'], l: ['Hansen', 'Johansen', 'Olsen', 'Larsen', 'Berg', 'Strand', 'Haugen', 'Nygaard'] },
  DEN: { n: 'Denmark', r: 'Europe', f: ['Rasmus', 'Mikkel', 'Kasper', 'Emil', 'Mathias', 'Jesper', 'Viktor', 'Magnus'], l: ['Jensen', 'Nielsen', 'Christensen', 'Poulsen', 'Mikkelsen', 'Dalsgaard', 'Lindholm', 'Bach'] },
  BRA: { n: 'Brazil', r: 'South America', f: ['Gabriel', 'Vinicius', 'Lucas', 'Matheus', 'Thiago', 'Eder', 'Caio', 'Igor', 'Wesley', 'Murilo', 'Danilo', 'Rafinha'], l: ['Oliveira', 'Souza', 'Lima', 'Alves', 'Barbosa', 'Ribeiro', 'Martins', 'Rocha', 'Andrade', 'Cardoso', 'Moraes', 'Pires'] },
  ARG: { n: 'Argentina', r: 'South America', f: ['Julian', 'Lautaro', 'Enzo', 'Alexis', 'Nicolas', 'Valentin', 'Facundo', 'Santiago', 'Franco', 'Thiago'], l: ['Fernandez', 'Gonzalez', 'Rodriguez', 'Lopez', 'Paredes', 'Acuna', 'Correa', 'Medina', 'Sosa', 'Ibarra'] },
  NGA: { n: 'Nigeria', r: 'Africa', f: ['Victor', 'Samuel', 'Ademola', 'Taiwo', 'Chidera', 'Wilfred', 'Kelechi', 'Moses', 'Calvin', 'Tobi'], l: ['Okafor', 'Adeyemi', 'Nwankwo', 'Okonkwo', 'Balogun', 'Eze', 'Uche', 'Afolabi'] },
  GHA: { n: 'Ghana', r: 'Africa', f: ['Kwame', 'Kofi', 'Yaw', 'Kojo', 'Mohammed', 'Abdul', 'Kwabena', 'Nana'], l: ['Mensah', 'Asante', 'Boateng', 'Owusu', 'Appiah', 'Addo', 'Agyei', 'Ofori'] },
  SEN: { n: 'Senegal', r: 'Africa', f: ['Ismaila', 'Pape', 'Cheikh', 'Moussa', 'Abdou', 'Idrissa', 'Lamine', 'Habib'], l: ['Diallo', 'Ndiaye', 'Sarr', 'Diouf', 'Faye', 'Gueye', 'Cisse', 'Mbaye'] },
  CIV: { n: 'Ivory Coast', r: 'Africa', f: ['Franck', 'Wilfried', 'Serge', 'Simon', 'Yves', 'Ibrahim', 'Jean'], l: ['Kone', 'Traore', 'Bamba', 'Toure', 'Coulibaly', 'Diomande', 'Seri'] },
  JPN: { n: 'Japan', r: 'Asia', f: ['Kaoru', 'Takumi', 'Daichi', 'Ritsu', 'Wataru', 'Kou', 'Ao', 'Yuki'], l: ['Tanaka', 'Suzuki', 'Takahashi', 'Watanabe', 'Ito', 'Yamamoto', 'Nakamura', 'Kobayashi'] },
  MAS: { n: 'Malaysia', r: 'Asia', f: ['Aiman', 'Haziq', 'Faisal', 'Arif', 'Syafiq', 'Danial', 'Akhyar', 'Luqman', 'Hakimi', 'Irfan'], l: ['Rahman', 'Ismail', 'Hassan', 'Aziz', 'Hamzah', 'Yusof', 'Zainal', 'Halim'] },
  USA: { n: 'United States', r: 'North America', f: ['Tyler', 'Weston', 'Christian', 'Brenden', 'Gio', 'Josh', 'Zack', 'Matt'], l: ['Adams', 'Johnson', 'Miller', 'Davis', 'Carter', 'Robinson', 'Brooks', 'Hayes'] },
};
// Every nationality used in the game: code -> [name, scouting region].
// NATIONS above only holds name pools for generated players.
const COUNTRY = (() => {
  const g = {
    'Britain & Ireland': 'ENG England|SCO Scotland|WAL Wales|NIR Northern Ireland|IRL Ireland|GIB Gibraltar',
    Europe: 'FRA France|ESP Spain|POR Portugal|GER Germany|NED Netherlands|BEL Belgium|ITA Italy|NOR Norway|SWE Sweden|DEN Denmark|ISL Iceland|AUT Austria|SUI Switzerland|CRO Croatia|SRB Serbia|BIH Bosnia-Herzegovina|ALB Albania|GRE Greece|TUR Türkiye|UKR Ukraine|POL Poland|CZE Czech Republic|SVK Slovakia|HUN Hungary|GEO Georgia|KAZ Kazakhstan|CYP Cyprus|LTU Lithuania|SVN Slovenia|BUL Bulgaria|FIN Finland|KOS Kosovo|MDA Moldova|RUS Russia|ISR Israel|MNE Montenegro',
    'South America': 'BRA Brazil|ARG Argentina|URU Uruguay|PAR Paraguay|COL Colombia|ECU Ecuador|CHI Chile|VEN Venezuela|SUR Suriname',
    'North America': 'USA United States|CAN Canada|MEX Mexico|JAM Jamaica|CUW Curaçao|HAI Haiti|BER Bermuda|TRI Trinidad and Tobago|LCA Saint Lucia|BAR Barbados|PAN Panama|MTQ Martinique',
    Africa: "NGA Nigeria|GHA Ghana|SEN Senegal|CIV Ivory Coast|CMR Cameroon|MLI Mali|BFA Burkina Faso|GAM The Gambia|GUI Guinea|ALG Algeria|MAR Morocco|TUN Tunisia|EGY Egypt|COD DR Congo|ANG Angola|BEN Benin|ZIM Zimbabwe|MOZ Mozambique|MTN Mauritania|COM Comoros|LBR Liberia|GNB Guinea-Bissau|CPV Cape Verde|SLE Sierra Leone|KEN Kenya|NAM Namibia|RSA South Africa",
    Asia: 'JPN Japan|KOR South Korea|CHN China|AUS Australia|NZL New Zealand|PHI Philippines|UZB Uzbekistan|MAS Malaysia|IDN Indonesia|SGP Singapore|IRQ Iraq',
  };
  const out = {};
  Object.entries(g).forEach(([r, list]) => list.split('|').forEach(x => { out[x.slice(0, 3)] = [x.slice(4), r]; }));
  return out;
})();
const natName = c => (COUNTRY[c] ? COUNTRY[c][0] : NATIONS[c] ? NATIONS[c].n : c);
const natRegion = c => (COUNTRY[c] ? COUNTRY[c][1] : NATIONS[c] ? NATIONS[c].r : 'Europe');
const LEVELS = { A: 'First team', R: 'Reserves', Y: 'U18s' };

const REGIONS = ['Everywhere', 'Premier League', 'Championship', 'Britain & Ireland', 'Europe', 'South America', 'Africa', 'Asia', 'North America', 'Free agents'];

// Nationality mix for generated top-flight squads (weights).
const PL_NATS = { ENG: 38, SCO: 4, IRL: 2, ESP: 6, FRA: 7, GER: 4, POR: 5, ITA: 2, NED: 4, BEL: 3, NOR: 2, DEN: 3, BRA: 6, ARG: 3, NGA: 3, GHA: 3, SEN: 3, CIV: 2, JPN: 2, MAS: 1, USA: 2 };

const POSITIONS = ['GK', 'DL', 'DC', 'DR', 'DM', 'ML', 'MC', 'MR', 'AML', 'AMC', 'AMR', 'ST'];
const POS_NAME = { GK: 'Goalkeeper', DL: 'Left Back', DC: 'Centre Back', DR: 'Right Back', DM: 'Defensive Midfielder', ML: 'Left Midfielder', MC: 'Central Midfielder', MR: 'Right Midfielder', AML: 'Left Winger', AMC: 'Attacking Midfielder', AMR: 'Right Winger', ST: 'Striker' };
const LINE = { GK: 0, DL: 1, DC: 1, DR: 1, DM: 2, ML: 3, MC: 3, MR: 3, AML: 4, AMC: 4, AMR: 4, ST: 5 };
const SIDE = { GK: 'C', DL: 'L', DC: 'C', DR: 'R', DM: 'C', ML: 'L', MC: 'C', MR: 'R', AML: 'L', AMC: 'C', AMR: 'R', ST: 'C' };
const POS_GROUP = { GK: 'GK', DL: 'DEF', DC: 'DEF', DR: 'DEF', DM: 'MID', ML: 'MID', MC: 'MID', MR: 'MID', AML: 'ATT', AMC: 'ATT', AMR: 'ATT', ST: 'ATT' };
const ALT_POS = { GK: [], DL: ['DR', 'ML', 'DC'], DR: ['DL', 'MR', 'DC'], DC: ['DM', 'DL', 'DR'], DM: ['MC', 'DC'], MC: ['DM', 'AMC', 'ML', 'MR'], ML: ['AML', 'DL', 'MC'], MR: ['AMR', 'DR', 'MC'], AML: ['AMR', 'ML', 'ST', 'AMC'], AMR: ['AML', 'MR', 'ST', 'AMC'], AMC: ['MC', 'ST', 'AML', 'AMR'], ST: ['AMC', 'AML', 'AMR'] };

// Attributes on the classic 1-20 scale. [key, label, group: T technical, M mental, P physical, G goalkeeping]
const ATTRS = [
  ['fin', 'Finishing', 'T'], ['pas', 'Passing', 'T'], ['dri', 'Dribbling', 'T'], ['fir', 'First Touch', 'T'],
  ['cro', 'Crossing', 'T'], ['tck', 'Tackling', 'T'], ['mar', 'Marking', 'T'], ['hea', 'Heading', 'T'],
  ['vis', 'Vision', 'M'], ['dec', 'Decisions', 'M'], ['pos', 'Positioning', 'M'], ['wor', 'Work Rate', 'M'],
  ['cmp', 'Composure', 'M'], ['ldr', 'Leadership', 'M'],
  ['pac', 'Pace', 'P'], ['sta', 'Stamina', 'P'], ['str', 'Strength', 'P'], ['agi', 'Agility', 'P'],
  ['ref', 'Reflexes', 'G'], ['han', 'Handling', 'G'], ['one', 'One on Ones', 'G'], ['kic', 'Kicking', 'G'],
  // Added in 2026.10.20.3: appended so existing saves keep their attribute order (migrateAttrs fills them in).
  ['ant', 'Anticipation', 'M'], ['otb', 'Off the Ball', 'M'], ['fla', 'Flair', 'M'], ['tea', 'Teamwork', 'M'],
];
const A = {};
ATTRS.forEach((a, i) => { A[a[0]] = i; });
const ATTR_GROUPS = { T: 'Technical', M: 'Mental', P: 'Physical', G: 'Goalkeeping' };

// How much each attribute counts toward the rating in each position.
const WEIGHTS = {
  GK: { ref: 3, han: 2, one: 2, pos: 2, kic: 1, dec: 1, agi: 1, cmp: 1, ant: 1 },
  DC: { tck: 3, mar: 3, pos: 3, hea: 2, str: 2, dec: 1, pac: 1, cmp: 1, ant: 2, tea: 1 },
  DL: { tck: 2, mar: 2, pos: 2, pac: 2, sta: 2, cro: 2, wor: 1, dri: 1, pas: 1, ant: 1, tea: 1 },
  DM: { tck: 2, pos: 2, pas: 2, dec: 2, wor: 2, sta: 1, str: 1, mar: 1, vis: 1, ant: 2, tea: 2 },
  MC: { pas: 3, vis: 2, dec: 2, fir: 2, sta: 1, wor: 1, tck: 1, cmp: 1, tea: 2, ant: 1, otb: 1 },
  ML: { cro: 2, pac: 2, sta: 2, dri: 2, pas: 2, wor: 1, fir: 1, otb: 1, tea: 1 },
  AML: { dri: 3, pac: 3, fin: 2, fir: 2, agi: 2, cro: 1, vis: 1, cmp: 1, otb: 2, fla: 2 },
  AMC: { vis: 3, pas: 2, dri: 2, fir: 2, fin: 2, dec: 1, cmp: 1, agi: 1, fla: 2, otb: 1 },
  ST: { fin: 3, cmp: 2, fir: 2, pac: 2, hea: 1, str: 1, dri: 1, dec: 1, otb: 3, ant: 1 },
};
WEIGHTS.DR = WEIGHTS.DL; WEIGHTS.MR = WEIGHTS.ML; WEIGHTS.AMR = WEIGHTS.AML;

const PERSONALITIES = ['Professional', 'Ambitious', 'Determined', 'Balanced', 'Model Citizen', 'Temperamental', 'Laid Back', 'Loyal'];

/* Formations: 11 slots of [position, x, y]. x 0 = left touchline, y 1 = own goal line.
   GK is always slot 0. Any formation can be used in or out of possession (FM26-style split shapes). */
const FORMATIONS = {
  '4-3-3': [['GK', .5, .95], ['DL', .13, .74], ['DC', .37, .8], ['DC', .63, .8], ['DR', .87, .74], ['DM', .5, .64], ['MC', .3, .5], ['MC', .7, .5], ['AML', .15, .28], ['ST', .5, .2], ['AMR', .85, .28]],
  '4-2-3-1': [['GK', .5, .95], ['DL', .13, .74], ['DC', .37, .8], ['DC', .63, .8], ['DR', .87, .74], ['DM', .37, .6], ['DM', .63, .6], ['AML', .15, .36], ['AMC', .5, .38], ['AMR', .85, .36], ['ST', .5, .18]],
  '4-4-2': [['GK', .5, .95], ['DL', .13, .74], ['DC', .37, .8], ['DC', .63, .8], ['DR', .87, .74], ['ML', .13, .5], ['MC', .38, .54], ['MC', .62, .54], ['MR', .87, .5], ['ST', .38, .24], ['ST', .62, .24]],
  '4-1-4-1': [['GK', .5, .95], ['DL', .13, .74], ['DC', .37, .8], ['DC', .63, .8], ['DR', .87, .74], ['DM', .5, .66], ['ML', .13, .46], ['MC', .36, .5], ['MC', .64, .5], ['MR', .87, .46], ['ST', .5, .22]],
  '3-5-2': [['GK', .5, .95], ['DC', .27, .8], ['DC', .5, .83], ['DC', .73, .8], ['ML', .09, .5], ['DM', .5, .64], ['MC', .32, .5], ['MC', .68, .5], ['MR', .91, .5], ['ST', .38, .24], ['ST', .62, .24]],
  '3-4-3': [['GK', .5, .95], ['DC', .27, .8], ['DC', .5, .83], ['DC', .73, .8], ['ML', .1, .52], ['MC', .38, .56], ['MC', .62, .56], ['MR', .9, .52], ['AML', .2, .28], ['ST', .5, .2], ['AMR', .8, .28]],
  '5-3-2': [['GK', .5, .95], ['DL', .08, .68], ['DC', .3, .8], ['DC', .5, .83], ['DC', .7, .8], ['DR', .92, .68], ['MC', .3, .52], ['MC', .5, .56], ['MC', .7, .52], ['ST', .38, .24], ['ST', .62, .24]],
  '5-4-1': [['GK', .5, .95], ['DL', .08, .7], ['DC', .3, .8], ['DC', .5, .83], ['DC', .7, .8], ['DR', .92, .7], ['ML', .12, .5], ['MC', .38, .54], ['MC', .62, .54], ['MR', .88, .5], ['ST', .5, .3]],
};
const AI_SHAPES = [['4-3-3', '4-1-4-1'], ['4-2-3-1', '4-4-2'], ['4-4-2', '4-4-2'], ['4-1-4-1', '4-1-4-1'], ['3-4-3', '5-4-1'], ['3-5-2', '5-3-2']];

// Player roles. a/m/d adjust the attack/midfield/defence contribution, s boosts shot share.
const ROLES = {
  GK: [{ n: 'Goalkeeper' }, { n: 'Sweeper Keeper', m: .05, d: -.02 }, { n: 'Ball-Playing Keeper', m: .08 }],
  DL: [{ n: 'Full-Back' }, { n: 'Wing-Back', a: .2, d: -.08 }, { n: 'Inverted Full-Back', m: .15, a: -.05 }],
  DC: [{ n: 'Centre-Back' }, { n: 'Ball-Playing Defender', m: .12, d: -.03 }, { n: 'Stopper', d: .08, m: -.05 }],
  DM: [{ n: 'Anchor', d: .12, a: -.1 }, { n: 'Deep-Lying Playmaker', m: .15, d: -.05 }, { n: 'Ball-Winner', d: .08, m: .04, a: -.05 }],
  ML: [{ n: 'Wide Midfielder' }, { n: 'Winger', a: .15, d: -.08 }, { n: 'Wide Playmaker', m: .12 }],
  MC: [{ n: 'Box-to-Box', a: .06, d: .04 }, { n: 'Playmaker', m: .15, d: -.05 }, { n: 'Ball-Winner', d: .1, a: -.06 }, { n: 'Mezzala', a: .14, d: -.08 }],
  AML: [{ n: 'Winger', a: .1 }, { n: 'Inside Forward', a: .15, s: .6, d: -.05 }, { n: 'Inverted Winger', m: .08, a: .05 }],
  AMC: [{ n: 'Attacking Midfielder', a: .08 }, { n: 'Advanced Playmaker', m: .12 }, { n: 'Shadow Striker', a: .15, s: .6, m: -.05 }],
  ST: [{ n: 'Advanced Forward', a: .08, s: .2 }, { n: 'Target Forward', a: .04, s: .1 }, { n: 'Pressing Forward', d: .06, a: .02 }, { n: 'False Nine', m: .12, s: -.3 }, { n: 'Poacher', a: .1, s: .6, m: -.08 }],
};
ROLES.DR = ROLES.DL; ROLES.MR = ROLES.ML; ROLES.AMR = ROLES.AML;

const INSTRUCTIONS = [
  { k: 'ment', n: 'Mentality', o: ['Defensive', 'Cautious', 'Balanced', 'Positive', 'Attacking'] },
  { k: 'tempo', n: 'Tempo', o: ['Patient', 'Standard', 'Quick'] },
  { k: 'width', n: 'Attacking width', o: ['Narrow', 'Fluid', 'Wide'] },
  { k: 'pass', n: 'Passing', o: ['Short', 'Mixed', 'Direct'] },
  { k: 'press', n: 'Pressing', o: ['Low block', 'Mid block', 'High press'] },
  { k: 'line', n: 'Defensive line', o: ['Deep', 'Standard', 'High'] },
  { k: 'lost', n: 'When the ball is lost', o: ['Regroup', 'Balanced', 'Counter-press'] },
  { k: 'won', n: 'When the ball is won', o: ['Hold shape', 'Balanced', 'Counter'] },
];

const TRAINING_FOCUS = [
  { k: 'bal', n: 'Balanced', d: 'Even spread across every area.', attrs: [] },
  { k: 'att', n: 'Attacking', d: 'Finishing, dribbling and final-third play.', attrs: ['fin', 'dri', 'fir', 'cro', 'cmp'] },
  { k: 'def', n: 'Defending', d: 'Tackling, marking and shape without the ball.', attrs: ['tck', 'mar', 'pos', 'hea'] },
  { k: 'phy', n: 'Physical', d: 'Pace, stamina and strength. Raises injury risk.', attrs: ['pac', 'sta', 'str', 'agi'] },
  { k: 'tac', n: 'Tactical', d: 'Decision making and tactical familiarity.', attrs: ['dec', 'vis', 'pos', 'wor'] },
  { k: 'set', n: 'Set pieces', d: 'Delivery and aerial threat from dead balls.', attrs: ['cro', 'hea', 'fin'] },
  { k: 'rec', n: 'Recovery', d: 'Light sessions. Big condition boost, little development.', attrs: [] },
];
const INTENSITY = ['Light', 'Normal', 'Intense'];
const INDIV_FOCUS = { none: 'No extra focus', T: 'Technical', M: 'Mental', P: 'Physical', G: 'Goalkeeping' };

// Pre-match press conference. Effects: mor = squad morale, fan = fan confidence, board = board confidence.
const PRESS = [
  { q: 'Your opponents arrive in good form. Are you concerned?', a: [['We respect them, but we fear nobody.', { mor: 2, fan: 1 }], ['They are favourites. The pressure is on them.', { mor: -1, fan: -1 }], ['Form goes out of the window on matchday.', { mor: 1 }]] },
  { q: 'Supporters are asking for more attacking football. Will you listen?', a: [['The fans will see us go for it.', { fan: 3, mor: 1 }], ['Results come first, style second.', { board: 1, fan: -2 }], ['We will find the right balance.', { fan: 1 }]] },
  { q: 'Is there any update on transfer targets?', a: [['We are always looking to improve.', { board: 1 }], ['I am happy with the squad I have.', { mor: 3, board: -1 }], ['I will not discuss other clubs’ players.', {}]] },
  { q: 'One of your senior players looked unhappy last week. Is there a problem?', a: [['Everyone here is pulling in the same direction.', { mor: 2 }], ['Players who are not happy can knock on my door.', { mor: -2, board: 1 }], ['That is a private matter.', { mor: 1, fan: -1 }]] },
  { q: 'How big is this match for your season?', a: [['Every match is a final for us.', { mor: 1, fan: 1 }], ['It is three points, nothing more.', { mor: 1 }], ['A win here could define our season.', { mor: 3, fan: 2, board: -1 }]] },
];

const TEAM_TALKS = [
  { k: 'praise', n: 'Praise', d: 'You have been excellent. Keep it up.' },
  { k: 'enc', n: 'Encourage', d: 'I believe in you. Go out and show it.' },
  { k: 'demand', n: 'Demand more', d: 'That was not good enough. I want more.' },
  { k: 'calm', n: 'Keep calm', d: 'Stay composed. Do the simple things.' },
  { k: 'hair', n: 'Hairdryer', d: 'Raise your voice and let them have it.' },
];

// Touchline shouts last 10 match minutes.
const SHOUTS = [
  { k: 'enc', n: 'Encourage', d: 'Small morale lift.' },
  { k: 'demand', n: 'Demand more', d: 'Lifts a losing side, irritates a winning one.' },
  { k: 'fire', n: 'Fire up', d: 'More chances created, more fouls given away.' },
  { k: 'focus', n: 'Focus', d: 'Fewer chances conceded.' },
  { k: 'calm', n: 'Calm down', d: 'Lowers card risk.' },
];

const INJURIES = [['Hamstring strain', 2, 5], ['Twisted ankle', 1, 3], ['Calf strain', 1, 4], ['Groin strain', 2, 4], ['Knee ligament damage', 6, 14], ['Bruised ribs', 1, 2], ['Broken metatarsal', 6, 10], ['Thigh strain', 2, 4], ['Concussion', 1, 2], ['Back spasms', 1, 2]];

// Weather effects on a match. drain = fatigue, xg = chance quality, shot = chances created,
// foul / inj = foul and injury rates, wind = penalty for direct passing or wide play.
const WEATHER = {
  clear: { n: 'Clear', d: 'Good conditions.' },
  rain: { n: 'Rain', d: 'Slippery: harder finishing, more fouls and knocks.', xg: 0.97, foul: 1.12, inj: 1.15, drain: 1.03 },
  wind: { n: 'Windy', d: 'Long balls and crosses are unreliable.', wind: 0.93 },
  cold: { n: 'Cold', d: 'Heavy pitch: players tire faster, more muscle injuries.', drain: 1.06, inj: 1.15 },
  hot: { n: 'Hot', d: 'Draining heat: fatigue builds quickly.', drain: 1.15, shot: 0.97 },
  snow: { n: 'Snow', d: 'Scrappy game: fewer clear chances.', xg: 0.92, shot: 0.97, drain: 1.1 },
};
const KICKOFF_NOTES = { early: 'Early kick-off: games tend to start slowly.', evening: 'Evening game under the lights: louder home crowd.' };
const TV_FEE = 0.6e6; // extra per club for a televised match

// Match engine tuning. The admin page can override these per save (G.tune).
const TUNE_DEFAULTS = {
  shotBase: { v: 0.285, min: 0.1, max: 0.5, step: 0.01, n: 'Shot chance per possession minute' },
  xgScale: { v: 0.85, min: 0.5, max: 2, step: 0.05, n: 'Chance quality (xG) multiplier' },
  homeShot: { v: 1.06, min: 1, max: 1.3, step: 0.01, n: 'Home advantage: shots' },
  homePoss: { v: 1.04, min: 1, max: 1.3, step: 0.01, n: 'Home advantage: possession' },
  fatigue: { v: 0.38, min: 0.1, max: 0.8, step: 0.02, n: 'Fatigue per minute' },
  cornerShot: { v: 0.2, min: 0, max: 0.5, step: 0.01, n: 'Chance a corner leads to a header' },
  foulRate: { v: 0.18, min: 0.05, max: 0.4, step: 0.01, n: 'Foul chance per minute' },
  injuryRate: { v: 0.0024, min: 0, max: 0.01, step: 0.0002, n: 'Injury chance per minute' },
};
const tune = k => (G && G.tune && G.tune[k] != null ? G.tune[k] : TUNE_DEFAULTS[k].v);

const STAFF_ROLES = { Assistant: 1, Coach: 3, Scout: 3, Physio: 2, Analyst: 1, Director: 1, Press: 1 };
const STAFF_TITLE = { Director: 'Director of Football', Press: 'Press Officer' };
const STAFF_DESC = { Assistant: 'Team talk advice and match prep', Coach: 'Player development in training', Scout: 'One scouting assignment each', Physio: 'Injury prevention and recovery', Analyst: 'Opposition reports before matches', Director: 'Reviews fully scouted players and runs transfer deals with you', Press: 'Statements to the media; keeps quiet talks quiet' };
