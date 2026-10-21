'use strict';
/* ===== bio.js =====
   Personal details: height, weight, character, ambition, favourite person and
   favourite manager. Each one changes something in the game, through the
   helpers at the bottom (used by the match engine, training, morale and transfers).
   bioNotes() lists the effects in plain words for the player's Personal tab. */

const HT_BASE = { GK: 190, DC: 187, DL: 178, DR: 178, DM: 181, MC: 178, ML: 176, MR: 176, AML: 175, AMC: 176, AMR: 175, ST: 182 };
const CHARACTER = {
  Professional: 'Trains hard every day. Develops faster and is rarely booked.',
  Ambitious: 'Wants trophies and a big club. Develops faster but asks for more money.',
  Determined: 'Never gives up. Develops faster and takes criticism well.',
  Balanced: 'Steady and even-tempered. No strong strengths or weaknesses.',
  'Model Citizen': 'A good influence. Develops faster, takes criticism well and is rarely booked.',
  Temperamental: 'Plays on the edge. Picks up more cards and reacts badly to criticism.',
  'Laid Back': 'Relaxed about everything, including training. Develops slower.',
  Loyal: 'Values his club. Asks for less money when renewing his contract.',
};
const ambLabel = a => (a >= 17 ? 'Very high' : a >= 13 ? 'High' : a >= 9 ? 'Moderate' : a >= 5 ? 'Low' : 'Very low');
const MGR_NATS = ['ENG', 'ENG', 'ENG', 'ESP', 'ITA', 'POR', 'GER', 'FRA', 'NED', 'ARG', 'SCO', 'IRL', 'NOR', 'BEL'];

function genManagerName() {
  const n = pick(MGR_NATS.filter(k => NATIONS[k]));
  const [f, l] = genName(n);
  return f + ' ' + l;
}

// Body and ambition: set when a player is created.
function genBio(p) {
  const youth = p.age < 18 ? (18 - p.age) * 2.5 : 0;
  p.ht = Math.round(clamp((HT_BASE[p.pos] || 180) + gauss() * 5.5 - youth, 160, 204));
  const bmi = 22.6 + gauss() * 0.9 + (p.at[A.str] - 10) * 0.07 + (p.pos === 'GK' ? 0.5 : 0) - (p.age < 19 ? 0.8 : 0);
  p.wt = Math.round(clamp(bmi, 19.5, 27.5) * Math.pow(p.ht / 100, 2));
  const r = { Ambitious: [15, 20], Determined: [12, 18], Professional: [10, 17], 'Laid Back': [2, 8], Loyal: [5, 12] }[p.pers] || [6, 15];
  p.amb = ri(r[0], r[1]);
}

// Favourite person and manager: picked from the game world, so they are linked once the world exists.
function linkBio(p) {
  const all = Object.values(G.players).filter(x => x.id !== p.id && x.club !== 'FA');
  const idols = all.filter(x => x.nat === p.nat && x.age >= p.age + 3 && x.ca >= 76);
  const mates = all.filter(x => x.club === p.club && x.age >= p.age);
  const stars = all.filter(x => x.ca >= 84);
  const r = R();
  const fp = r < 0.45 && idols.length ? pick(idols) : r < 0.8 && mates.length ? pick(mates) : stars.length ? pick(stars) : pick(all);
  if (fp) { p.fp = fp.id; p.fpn = fullName(fp); } else { p.fp = 0; p.fpn = 'His family'; }
  const own = G.clubs[p.club];
  const pl = plClubs().map(id => G.clubs[id]).filter(c => c.mgr);
  const fm = R() < 0.3 && own && own.mgr ? own : pl.length ? wpick(pl, c => c.rep - 55) : null;
  p.fmn = fm ? fm.mgr : genManagerName();
}

// Makes sure every club has a manager and every player has personal details (new games and older saves).
function ensureWorld() {
  Object.values(G.clubs).forEach(c => { if (!c.fa && !c.mgr) c.mgr = genManagerName(); if (c.tac && !c.tac.style && !c.fa) c.tac = aiTactic(c.rep); });
  if (G.tactics) { G.tactics.lost ??= 1; G.tactics.won ??= 1; G.tactics.pi ??= {}; }
  if (G.club && G.clubs[G.club]) G.clubs[G.club].mgr = G.manager;
  if (G.scout && typeof ensureScouting === 'function') ensureScouting();
  if (typeof ensureAgents === 'function') ensureAgents();
  if (typeof ensureDeals === 'function') ensureDeals();
  Object.values(G.players).forEach(p => { migrateAttrs(p); if (p.ht == null) genBio(p); });
  Object.values(G.players).forEach(p => { if (p.fpn == null) linkBio(p); });
  // Older saves: add the inspirational figure to the first-team players who came from the real squads, by name.
  if (!G.flags.insp && typeof ROSTERS !== 'undefined') {
    const by = {};
    Object.values(ROSTERS).forEach(rows => rows.forEach(r => { if (r[8]) by[r[1]] = by[r[1]] === undefined ? r[8] : null; }));
    Object.values(G.players).forEach(p => { const n = p.fn ? p.fn + ' ' + p.ln : p.ln; if (!p.insp && by[n]) p.insp = by[n]; });
    G.flags.insp = 1;
  }
}

/* ---------- effects ---------- */
const bmiOf = p => (p.wt || 75) / Math.pow((p.ht || 180) / 100, 2);
// Heading ability in the air: the heading attribute plus a height bonus (up to about +4 / -3).
const aerial = p => p.at[A.hea] + clamp(((p.ht || 182) - 182) / 4, -3, 4);
// Taller keepers cover more of the goal: up to 4% fewer goals conceded per shot.
const gkReach = p => (p ? clamp(((p.ht || 188) - 188) / 250, -0.04, 0.04) : 0);
// Heavier players tire faster, lighter ones last longer.
const fatigueMul = p => clamp(1 + (bmiOf(p) - 23.3) * 0.035, 0.94, 1.12);
// Character changes how often a foul becomes a card.
const cardMul = p => (p.pers === 'Temperamental' ? 1.5 : p.pers === 'Professional' || p.pers === 'Model Citizen' ? 0.8 : 1);
const clubMgr = p => (G.clubs[p.club] && G.clubs[p.club].mgr) || '';
const favMgrHere = p => !!p.fmn && p.fmn === clubMgr(p);
const favPersonAt = (p, cid) => { const f = G.players[p.fp]; return !!f && f.club === cid; };
// Development speed from ambition and playing for his favourite manager.
const devMul = p => (0.9 + (p.amb ?? 10) * 0.01) * (favMgrHere(p) ? 1.08 : 1);
const outgrown = p => (p.amb ?? 10) >= 15 && G.clubs[p.club] && G.clubs[p.club].pl && G.clubs[p.club].rep < p.ca - 3;
const foreignAt = p => { const c = G.clubs[p.club]; return !!c && c.pl && natRegion(p.nat) !== 'Britain & Ireland'; };

// Weekly morale push from his situation. natCount: nationality counts in his squad.
function moraleDrift(p, natCount) {
  let d = 0;
  if (foreignAt(p)) d += (natCount[p.nat] || 1) > 1 ? 0.2 : -0.4;
  if (favPersonAt(p, p.club)) d += 0.5;
  if (favMgrHere(p)) d += 0.5;
  if (outgrown(p)) d -= 0.3 + ((p.amb - 15) / 5) * 0.3;
  return d;
}

// Wage demand and willingness to join your club.
function joinMul(p) {
  return (favPersonAt(p, G.club) ? 0.93 : 1) * (p.fmn === G.manager ? 0.9 : 1) * (0.94 + (p.amb ?? 10) * 0.006);
}
const joinPull = p => (favPersonAt(p, G.club) ? 3 : 0) + (p.fmn === G.manager ? 4 : 0) - ((p.amb ?? 10) - 10) * 0.4;

// When a player changes club, anyone who names him as favourite person reacts.
function favPersonMoved(p, fromId, toId) {
  Object.values(G.players).forEach(x => {
    if (x.fp !== p.id) return;
    if (x.club === fromId && fromId !== 'FA') x.mor = clamp(x.mor - 6, 0, 100);
    if (x.club === toId && toId !== 'FA') x.mor = clamp(x.mor + 6, 0, 100);
  });
}

// End of season: your players who enjoyed the season may name you their favourite manager.
function seasonFavourites() {
  const won = [];
  squadOf(G.club).forEach(p => {
    if (p.fmn === G.manager || p.st.a < 15 || p.mor < 70) return;
    if (R() < 0.1 + (p.mor - 70) / 150) { p.fmn = G.manager; won.push(pname(p)); }
  });
  if (won.length) addNews('club', `Players warm to ${G.manager}`, `${won.slice(0, 6).join(', ')}${won.length > 6 ? ` and ${won.length - 6} more` : ''} now call ${G.manager} their favourite manager. They are happier, develop faster and ask for less money.`);
}

// Plain-words list of how his personal details affect him. [text, 'good' | 'warn' | '']
function bioNotes(p) {
  const out = [], mine = p.club === G.club, c = G.clubs[p.club];
  if (p.pos === 'GK') {
    if (p.ht >= 193) out.push(['Tall keeper: covers more of the goal.', 'good']);
    if (p.ht <= 183) out.push(['Short for a keeper: a little easier to beat.', 'warn']);
  } else {
    if (p.ht >= 189) out.push(['Tall: stronger in the air at set pieces and in defence.', 'good']);
    if (p.ht <= 172) out.push(['Short: weaker in the air.', 'warn']);
  }
  const b = bmiOf(p);
  if (b >= 24.8) out.push(['Heavy build: tires faster in matches.', 'warn']);
  if (b <= 21.6) out.push(['Light build: lasts longer in matches.', 'good']);
  if (foreignAt(p)) {
    const n = squadOf(p.club).filter(x => x.nat === p.nat).length - 1;
    out.push(n > 0 ? [`Has ${n} team-mate${n > 1 ? 's' : ''} from ${natName(p.nat)}: settled.`, 'good'] : [`No team-mates from ${natName(p.nat)}: may struggle to settle (morale slowly drops).`, 'warn']);
  }
  if (favPersonAt(p, p.club)) out.push([`His favourite person, ${p.fpn}, plays here: happier every week.`, 'good']);
  else if (G.players[p.fp] && G.players[p.fp].club === G.club && !mine) out.push([`His favourite person, ${p.fpn}, plays for you: more willing to join and asks for less.`, 'good']);
  if (favMgrHere(p)) out.push([`Plays for his favourite manager: happier and develops faster.`, 'good']);
  else if (p.fmn === G.manager && !mine) out.push([`Calls you his favourite manager: more willing to join and asks for less.`, 'good']);
  else if (mine) out.push(['Win him over: a good season with regular games may make you his favourite manager.', '']);
  if (outgrown(p)) out.push([`Ambitious and thinks he is too good for the ${c.name}: morale slowly drops.`, 'warn']);
  else if (p.amb >= 15) out.push(['Very ambitious: develops faster, but asks for more money and expects a big club.', '']);
  if (p.amb <= 6) out.push(['Low ambition: develops slower, but asks for less money.', '']);
  return out;
}
