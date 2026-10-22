'use strict';
/* ===== agents.js =====
   Player agents. Each agent looks after many players; every player (17 and over) has one (p.ag).
   Agents are fictional, with sound-alike names inspired by real agents and agencies (see docs/AGENTS.md).
   - Who represents whom: a few well-known clients by their inspirational figure (p.insp), otherwise by the
     player's nationality (each agent works certain markets) and level (big agents take the best players).
   - What an agent changes: his fee in a deal (greed), the wage his clients ask for, how keen a client is to
     join you (his relationship with your club), and which players he pitches to you.
   - Relationships (G.agents[id].rel[club], -50..50) move with how you deal with him: completed deals help,
     pulling out late or blocking a client's move hurts. */

// [id, name, agency, inspired by, markets (nation codes or regions), reputation, greed 1-20, style]
const AGENT_DATA = [
  ['mandes', 'Jorge Mandes', 'Gestifuturo', 'Jorge Mendes', ['POR', 'BRA', 'ESP', '*'], 97, 15, 'Power broker'],
  ['pimentel', 'Rafaela Pimentel', 'One Pimentel Sports', 'Rafaela Pimenta', ['NED', 'ITA', 'NOR', 'FRA', '*'], 95, 18, 'Hard-nosed'],
  ['zahary', 'Pini Zahary', 'Zahary Associates', 'Pini Zahavi', ['GER', 'ESP', 'Europe', '*'], 90, 14, 'Power broker'],
  ['burnett', 'Jonathan Burnett', 'ICS Stella', 'Jonathan Barnett', ['ENG', 'SCO', 'IRL', 'Britain & Ireland', '*'], 92, 13, 'Hard-nosed'],
  ['jourabian', 'Kia Jourabian', 'Kia Global', 'Kia Joorabchian', ['BRA', 'ARG', 'South America', '*'], 88, 16, 'Power broker'],
  ['strauth', 'Volker Strauth', 'Sports 361', 'Volker Struth', ['GER', 'Europe'], 86, 12, 'Relationship'],
  ['pastorella', 'Federico Pastorella', 'Rich Sporting', 'Federico Pastorello', ['ITA', 'BEL', 'Europe'], 82, 13, 'Fair'],
  ['felicevic', 'Fernando Felicevic', 'Pro Sudamérica', 'Fernando Felicevich', ['ARG', 'South America'], 80, 14, 'Hard-nosed'],
  ['stratford', 'Paul Stratford', 'Base Wasserville', 'Paul Stretford', ['ENG', 'Britain & Ireland'], 84, 12, 'Fair'],
  ['barak', 'Ali Barak', 'Unique Sports Line', 'Ali Barat', ['ESP', 'ENG', 'Europe', 'Africa'], 82, 11, 'Relationship'],
  ['guardiano', 'Pere Guardiano', 'Media Bass', 'Pere Guardiola', ['ESP', 'Europe'], 80, 10, 'Relationship'],
  ['lucchi', 'Alessandro Lucchi', 'World Soccer Agency', 'Alessandro Lucci', ['ITA', 'Europe'], 78, 12, 'Fair'],
  ['bertolini', 'Giuliano Bertolini', 'Bertolini Sports', 'Giuliano Bertolucci', ['BRA', 'South America'], 79, 13, 'Fair'],
  ['ribeira', 'Wagner Ribeira', 'Ribeira Gestão', 'Wagner Ribeiro', ['BRA', 'South America'], 74, 15, 'Hard-nosed'],
  ['curi', 'André Curi', 'Curi Futebol', 'André Cury', ['BRA', 'South America'], 76, 12, 'Relationship'],
  ['siegal', 'Rob Siegal', 'Wasserville Football', 'Rob Segal', ['ENG', 'USA', 'Britain & Ireland', 'North America'], 81, 11, 'Fair'],
  ['ruby', 'Saif Ruby', 'Unique Sports Line', 'Saif Rubie', ['ENG', 'Britain & Ireland', 'Africa'], 77, 11, 'Fair'],
  ['manesseh', 'David Manesseh', 'Family Football Group', 'David Manasseh', ['ENG', 'Britain & Ireland'], 75, 10, 'Relationship'],
  ['wittmer', 'Roger Wittmer', 'Rogo', 'Roger Wittmann', ['GER', 'Europe'], 78, 13, 'Hard-nosed'],
  ['cetinkara', 'Hasan Cetinkara', 'Arena Elf', 'Hasan Çetinkaya', ['GER', 'Europe'], 72, 12, 'Fair'],
  ['lopes', 'Juanma Lopes', 'Promo Fútbol', 'Juanma López', ['ESP', 'ARG', 'Europe'], 74, 11, 'Relationship'],
  ['janssen', 'Rob Janssens', 'Sports Entertainment Gr.', 'Rob Jansen', ['NED', 'BEL', 'Europe'], 76, 12, 'Fair'],
  ['bayati', 'Mogi Bayati', 'Sports Management Int.', 'Mogi Bayat', ['BEL', 'FRA', 'SEN', 'CIV', 'Africa'], 73, 14, 'Hard-nosed'],
  ['bernez', 'Jean-Pierre Bernèz', 'Bernèz Conseil', 'Jean-Pierre Bernès', ['FRA', 'SEN', 'CIV', 'Europe'], 77, 12, 'Fair'],
  ['solbakk', 'Jim Solbakk', 'Nordic Sport Mgmt', 'Jim Solbakken', ['NOR', 'DEN', 'Europe'], 74, 11, 'Relationship'],
  ['betancor', 'Pablo Betancor', 'Tenfield Sport', 'Pablo Bentancur', ['ARG', 'South America'], 73, 14, 'Hard-nosed'],
  ['bragarni', 'Cristian Bragarni', 'Bragarni Group', 'Christian Bragarnik', ['ARG', 'South America'], 71, 13, 'Fair'],
  ['adeyemo', 'Tunde Adeyemo', 'Lagos Pro Sports', '', ['NGA', 'GHA', 'Africa'], 64, 12, 'Relationship'],
  ['mensah', 'Kwame Mensah', 'Gold Coast Talent', '', ['GHA', 'CIV', 'Africa'], 60, 11, 'Fair'],
  ['diallo', 'Ousmane Diallo', 'Sénégal Foot Conseil', '', ['SEN', 'CIV', 'FRA', 'Africa'], 62, 12, 'Fair'],
  ['moriyama', 'Kenji Moriyama', 'J-Link Management', '', ['JPN', 'Asia'], 63, 9, 'Relationship'],
  ['azlan', 'Azlan Rahman', 'Harimau Sports', '', ['MAS', 'Asia'], 52, 9, 'Relationship'],
  ['carter', 'Mike Carter', 'Stars & Stripes Soccer', '', ['USA', 'North America'], 58, 10, 'Fair'],
  ['holt', 'Gareth Holt', 'Northern Football Reps', '', ['ENG', 'SCO', 'IRL', 'Britain & Ireland'], 55, 9, 'Relationship'],
  ['byrne', 'Declan Byrne', 'Emerald Sports', '', ['IRL', 'SCO', 'Britain & Ireland'], 50, 8, 'Relationship'],
  ['moretti', 'Luca Moretti', 'Moretti & Figli', '', ['ITA', 'Europe'], 56, 10, 'Fair'],
  ['nielsen', 'Mads Nielsen', 'Scandi Football', '', ['DEN', 'NOR', 'Europe'], 54, 9, 'Fair'],
  ['ferreira', 'Rui Ferreira', 'Lusitânia Sports', '', ['POR', 'BRA', 'Europe'], 57, 10, 'Fair'],
  ['schmidt', 'Jonas Schmidt', 'Ballwerk Agentur', '', ['GER', 'Europe'], 53, 9, 'Relationship'],
  ['dupont', 'Hugo Dupont', 'Hexagone Sports', '', ['FRA', 'BEL', 'Europe'], 55, 10, 'Fair'],
];
// A few well-known pairings, by inspirational figure (fictional players inspired by these real players).
const AGENT_CLIENTS = {
  mandes: ['Bernardo Silva', 'Rúben Dias', 'João Cancelo', 'Ederson', 'Rúben Neves', 'Matheus Nunes', 'Pedro Neto', 'Diogo Dalot', 'João Félix', 'Gonçalo Ramos', 'Cristiano Ronaldo'],
  pimentel: ['Erling Haaland', 'Matthijs de Ligt', 'Ryan Gravenberch', 'Gianluigi Donnarumma', 'Xavi Simons'],
  burnett: ['Jack Grealish', 'Ben White', 'Luke Shaw', 'Ben Chilwell'],
};
const AGENT_STYLE = { 'Power broker': 'Moves the biggest names and plays clubs off against each other.', 'Hard-nosed': 'Drives a hard bargain on fees and wages.', Fair: 'Firm but reasonable.', Relationship: 'Values long relationships and a fair deal for both sides.' };
const agentOf = p => (p && G.agents ? G.agents[p.ag || assignAgent(p)] || null : null);
const agentRel = a => (a && a.rel ? a.rel[G.club] || 0 : 0);
const agentClients = id => Object.values(G.players).filter(p => p.ag === id);

function makeAgents() {
  const out = {};
  AGENT_DATA.forEach(([id, name, agency, insp, markets, rep, greed, style]) => {
    const rel = {};
    Object.keys(G.clubs).forEach(c => { if (!G.clubs[c].fa && !G.clubs[c].backgroundOnly) rel[c] = Math.round((hash01(id + ':' + c) - 0.5) * 30); });
    out[id] = { id, name, agency, insp, markets, rep, greed, style, rel };
  });
  return out;
}
// Who represents him: well-known pairings first, then the agents who work his market, nearer his level.
function assignAgent(p) {
  if (!G.agents || !p || p.age < 17) return null;
  const known = p.insp && Object.keys(AGENT_CLIENTS).find(id => AGENT_CLIENTS[id].includes(p.insp));
  if (known && G.agents[known]) return (p.ag = known);
  const region = NATIONS[p.nat] ? NATIONS[p.nat].r : 'Europe', tier = clamp(40 + (p.ca - 55) * 1.6 + (p.pa - p.ca) * 0.5, 30, 100);
  const cands = Object.values(G.agents).filter(a => a.markets.includes(p.nat) || a.markets.includes(region) || (a.markets.includes('*') && tier >= 85));
  const list = cands.length ? cands : Object.values(G.agents);
  const w = list.map(a => Math.exp(-Math.abs(a.rep - tier) / 10) * (a.markets.includes(p.nat) ? 2 : 1) * (a.rep > tier + 15 ? 0.25 : 1));
  let r = hash01(p.id + ':ag') * w.reduce((t, x) => t + x, 0);
  const pick = list[w.findIndex(x => (r -= x) <= 0)] || list[0];
  return (p.ag = pick.id);
}

// Effects on deals.
const agentFeePct = a => (a ? Math.round(4 + a.greed * 0.35) : 6);
const agentWageMul = a => (a ? 1 + (a.greed - 10) * 0.012 : 1);
function agentRelMove(p, d, why) {
  const a = agentOf(p);
  if (!a) return;
  a.rel[G.club] = clamp((a.rel[G.club] || 0) + d, -50, 50);
  if (why) a.last = { date: today().getTime(), txt: why, d };
}
const relLabel = v => (v >= 25 ? 'Excellent' : v >= 10 ? 'Good' : v > -10 ? 'Neutral' : v > -25 ? 'Strained' : 'Hostile');

// Older saves and new careers: agents, and an agent for every player 17 or over.
function ensureAgents() {
  if (!G.agents) G.agents = makeAgents();
  Object.values(G.players).forEach(p => { if (!p.ag && p.age >= 17) assignAgent(p); });
}
