'use strict';
/* ===== newspaper.js =====
   Public news items (box 'news') get a newspaper story on top of their factual title and body:
   n.story = { outlet, occasion, headline, standfirst, img, weight }. The title and body stay as
   they were, because alerts, the managers page and the day feed read them; only the News screen
   shows the story. Each section has its own paper, and each occasion has a set of templates that
   are filled from the facts of the event. A template never adds a fact it was not given. */

const OUTLETS = {
  club: { name: 'The Local End', desk: 'Club report', motto: 'Our town. Our club. Always.', tag: c => `${c.city || 'Local'}'s football newspaper` },
  match: { name: 'The Final Whistle', desk: 'Match report', motto: 'More than a game', tag: () => 'Matches · analysis · reaction' },
  transfer: { name: 'The Transfer Record', desk: 'Transfer desk', motto: 'People move football forward', tag: () => 'Transfers · contracts · insight' },
  life: { name: 'Beyond the Touchline', desk: 'People & community', motto: 'People · community · opportunity', tag: () => 'Stories from off the pitch' },
  league: { name: 'The League Gazette', desk: 'League report', motto: 'Same rivalries. New stories.', tag: () => 'Fixtures · tables · opinion' },
};
const SECTION_NAMES = { club: 'Your club', match: 'Matches', transfer: 'Transfers', life: 'Off the pitch', league: 'League' };

// Photos in public/assets/news, by occasion. Several per occasion where they fit; the last one used is skipped.
const NEWS_IMAGES = {
  'win': ['match-header-goal', 'match-late-winner'], 'win-late': ['match-late-winner'], 'win-brace': ['match-header-goal', 'match-late-winner'],
  'win-big': ['match-late-winner', 'club-matchday-gates'], 'derby-win': ['match-derby'], 'derby-draw': ['match-derby'], 'derby-loss': ['match-derby'],
  'draw': ['match-header-goal'], 'draw-late': ['match-late-winner'], 'draw-goalless': ['club-matchday-gates', 'match-derby'],
  'loss': ['match-heavy-defeat'], 'loss-late': ['match-heavy-defeat'], 'loss-heavy': ['match-heavy-defeat'], 'friendly': ['club-training'],
  'signing': ['transfer-shirt', 'transfer-medical'], 'signing-big': ['transfer-shirt', 'transfer-medical'], 'signing-record': ['transfer-shirt'],
  'signing-free': ['transfer-shirt', 'transfer-airport'], 'signing-abroad': ['transfer-airport', 'transfer-medical'], 'your-signing': ['transfer-shirt', 'transfer-medical'],
  'sale': ['transfer-airport'], 'loan': ['transfer-airport'], 'loan-return': ['transfer-airport'], 'loan-permanent': ['transfer-shirt'],
  'deadline': ['transfer-deadline'], 'window-shut': ['transfer-deadline'],
  'potm': ['league-trophy'], 'manager-month': ['league-trophy'], 'sacked': ['league-sacked'], 'appointed': ['club-new-manager'],
  'season-start': ['league-season-start'], 'playoffs': ['league-trophy'], 'retirements': [],
  'youth-intake': ['club-training'], 'new-contract': ['club-matchday-gates'], 'released': ['club-training'], 'takes-over': ['club-new-manager'],
};

/* Templates: [headline, standfirst]. {x} is a fact from the event; a template whose facts are
   missing is skipped. Headlines drop "the" before nicknames, as papers do: "Gunners edge Villans". */
const STORY_TEMPLATES = {
  'win': [['{us} see off {opp}', 'A {score} win, with {scorers} on the scoresheet.'], ['{us} get the job done', '{score} against {opp}. {motm} was the pick of the players.'], ['Three points for {us}', '{opp} beaten {score} on a solid afternoon\'s work.'], ['{us} too good for {opp}', 'A {score} win that rarely looked in doubt.'], ['{scorer} the difference for {us}', 'The {score} win over {opp} keeps the momentum going.', 'scorer']],
  'win-late': [['{scorer} leaves it late', 'A {min}th-minute winner settles it {score} against {opp}.'], ['Late, late show from {us}', '{scorer} strikes in the {min}th minute to beat {opp} {score}.'], ['{us} snatch it at the death', '{scorer} wins it {score} with almost the last kick.']],
  'win-brace': [['{brace} at the double', 'Two goals from {brace} as {us} beat {opp} {score}.'], ['Double delight for {brace}', '{us} ride a two-goal afternoon to a {score} win over {opp}.'], ['{brace} sinks {opp}', 'Two goals, three points: {us} win {score}.']],
  'win-hattrick': [['Hat-trick hero {brace}', 'Three goals from {brace} as {us} beat {opp} {score}.'], ['{brace} takes the match ball', '{us} hit {opp} for {gf} with a hat-trick from {brace}.']],
  'win-big': [['{us} run riot', '{opp} are swept aside {score}.'], ['Statement win for {us}', 'A {score} thrashing of {opp}, with {scorers} on target.'], ['{opp} put to the sword', '{us} win {score} and it could have been more.']],
  'derby-win': [['Derby day belongs to {us}', '{scorers} the heroes as {opp} are beaten {score}.'], ['Bragging rights to {us}', 'A {score} derby win over {opp} that the fans will not forget.']],
  'derby-draw': [['Honours even in the derby', '{us} and {opp} share the points at {score}.'], ['No winner in a fierce derby', '{score} between {us} and {opp}, and nobody backed down.']],
  'derby-loss': [['Derby despair for {us}', '{opp} take the bragging rights with a {score} win.'], ['{opp} win the derby', 'A {score} defeat leaves {us} with plenty to think about.']],
  'draw': [['{us} held by {opp}', 'A {score} draw, and points shared.'], ['Stalemate with {opp}', '{us} come away with a {score} draw.'], ['A point apiece', '{us} and {opp} cannot be separated at {score}.']],
  'draw-late': [['{scorer} rescues a point', 'A {min}th-minute equaliser earns {us} a {score} draw with {opp}.'], ['Late leveller for {us}', '{scorer} strikes in the {min}th minute: {score} with {opp}.']],
  'draw-goalless': [['Goalless against {opp}', 'Few chances and no goals for {us}.'], ['Nothing to separate them', '{us} and {opp} play out a 0-0.']],
  'loss': [['{us} beaten by {opp}', 'A {score} defeat and questions to answer.'], ['Frustration for {us}', '{opp} win {score}.'], ['{opp} too strong for {us}', 'A {score} loss on a tough day.']],
  'loss-late': [['Heartbreak for {us}', '{opp} win it {score} with a {min}th-minute goal.'], ['Stung late on', 'A {min}th-minute goal gives {opp} a {score} win over {us}.']],
  'loss-heavy': [['{us} hammered by {opp}', 'A {score} defeat that will hurt.'], ['Nightmare for {us}', '{opp} run away with it, {score}.'], ['{us} humbled', 'A {score} beating by {opp} leaves plenty to fix.']],
  'friendly': [['{us} warm up against {opp}', 'A {score} result in a friendly, with minutes for the squad.'], ['Friendly outing for {us}', '{score} against {opp} as the build-up goes on.']],

  'signing': [['{to} sign {player}', 'The {age}-year-old {pos} joins from {from} for {fee}.'], ['{player} completes {to} move', '{to} pay {from} {fee} for the {pos}.'], ['{to} land {player}', 'A {fee} deal brings the {age}-year-old from {from}.']],
  'signing-big': [['{to} land their man', '{player} joins from {from} in a {fee} deal.'], ['Big money move for {player}', '{to} pay {fee} to sign the {pos} from {from}.'], ['{fee} for {player}', '{to} complete one of the deals of the window.']],
  'signing-record': [['{to} break the bank for {player}', 'A {fee} deal with {from}, one of the biggest the league has seen.'], ['Blockbuster: {player} joins {to}', 'The {pos} costs {fee}.']],
  'signing-free': [['{to} sign {player} on a free', 'The {age}-year-old {pos} arrives without a fee.'], ['Free transfer coup for {to}', '{player} joins at no cost.']],
  'signing-abroad': [['{to} bring {player} to England', 'The {pos} arrives from {from} for {fee}.'], ['From {from} to {to}', '{player} makes the move for {fee}.']],
  'your-signing': [['{player} signs for {to}', 'The {age}-year-old {pos} joins from {from} on a {years}-year deal.'], ['Welcome, {player}', '{to} complete the signing from {from}.'], ['{to} complete {player} deal', 'The {pos} arrives from {from} on a {years}-year contract.']],
  'sale': [['{player} heads for {to}', '{from} accept {fee} for the {pos}.'], ['{from} cash in on {player}', 'A {fee} sale to {to}.'], ['End of an era for {player}', 'The {pos} leaves for {to} in a {fee} deal.']],
  'loan': [['{player} joins {to} on loan', 'The {pos} moves from {from} for {weeks} weeks.'], ['Loan move for {player}', 'A spell at {to} for the {age}-year-old.']],
  'loan-return': [['{player} heads back to {to}', 'The loan spell is over.'], ['Loan over for {player}', 'Back to {to} for the {pos}.']],
  'loan-permanent': [['{to} make {player} move permanent', 'The loan becomes a {fee} transfer.'], ['{player} stays at {to} for good', 'The purchase clause is completed for {fee}.']],
  'deadline': [['Deadline day: the clock is ticking', 'The window shuts at 23:00 and the phones are ringing.'], ['It\'s deadline day', 'Clubs have until 23:00 to get their business done.']],
  'window-shut': [['The window has slammed shut', '{deals} deals were done on deadline day.'], ['Done and dusted', 'The window closes with {deals} deals on the final day.']],

  'potm': [['{player} is Player of the Month', 'The {month} award goes to the star of {club}.'], ['{month} belongs to {player}', 'Named the league\'s best after a month to remember with {club}.']],
  'manager-month': [['{club} boss wins Manager of the Month', '{pts} points in {month} earn the award.'], ['Manager of the Month for {club}', 'A {pts}-point {month} is rewarded.']],
  'sacked': [['{club} part company with their manager', 'The search for a successor begins.'], ['Axe falls at {club}', 'The club are looking for a new manager.'], ['{club} make a change', 'A new manager is wanted.']],
  'appointed': [['{club} name {mgr} as manager', 'The new man takes charge in the {league}.'], ['New era at {club}', '{mgr} is appointed.']],
  'season-start': [['The race starts here', '{teams} clubs. One title. A new {league} season is on its way.'], ['Here we go again', 'The {league} gets ready for {season}.'], ['A clean slate', 'Every {league} club starts {season} level.']],
  'playoffs': [['Playoff time', '{clubs} chase the final promotion place.'], ['One last shot at promotion', '{clubs} go into the playoffs.']],
  'retirements': [['Time to say goodbye', '{names} have hung up their boots.'], ['End of the road', 'Retirements across the league: {names}.']],

  'youth-intake': [['A new crop arrives', '{count} youngsters join, with {star} the pick of them.'], ['The next generation', '{star} heads a group of {count} new arrivals.']],
  'new-contract': [['{player} commits his future', 'A new {years}-year deal for the {pos}.'], ['{player} signs on', 'The {pos} agrees a {years}-year contract.']],
  'released': [['{player} leaves the club', 'His contract has been ended by mutual consent.'], ['Parting of the ways with {player}', 'The {pos} is released.']],
  'takes-over': [['A new chapter at {club}', '{mgr} takes charge in the dugout.'], ['{mgr} is the new boss', 'Supporters welcome a fresh face in the dugout.']],
};

// How prominent a story is on the front page. Your club's news always counts for more.
const STORY_WEIGHT = { 'signing-record': 70, 'sacked': 60, 'derby-win': 60, 'derby-loss': 55, 'win-hattrick': 55, 'window-shut': 50, 'deadline': 45, 'season-start': 45, 'playoffs': 45,
  'win-late': 50, 'win-big': 50, 'loss-heavy': 50, 'your-signing': 50, 'signing-big': 45, 'sale': 45, 'appointed': 40, 'takes-over': 55, 'potm': 35, 'manager-month': 35,
  'win-brace': 45, 'loss-late': 45, 'draw-late': 45, 'derby-draw': 45, 'win': 40, 'draw': 30, 'loss': 35, 'draw-goalless': 25, 'friendly': 10,
  'signing': 30, 'signing-abroad': 32, 'signing-free': 22, 'loan': 18, 'loan-return': 12, 'loan-permanent': 25, 'retirements': 20, 'youth-intake': 30, 'new-contract': 25, 'released': 20 };

const fillStory = (t, V) => t.replace(/\{(\w+)\}/g, (_, k) => V[k] ?? '');
function storyTemplate(occasion, V, salt) {
  const set = (STORY_TEMPLATES[occasion] || []).filter(([h, s, need]) => (!need || V[need] != null && V[need] !== '') && [h, s].every(t => [...t.matchAll(/\{(\w+)\}/g)].every(m => V[m[1]] != null && V[m[1]] !== '')));
  if (!set.length) return null;
  G.storyRecent ||= [];
  const fresh = set.filter(t => !G.storyRecent.includes(occasion + ':' + t[0]));
  const pool = fresh.length ? fresh : set, t = pool[Math.floor(hash01(salt + 'st') * pool.length)];
  G.storyRecent.unshift(occasion + ':' + t[0]); G.storyRecent.length = Math.min(G.storyRecent.length, 40);
  return t;
}
function storyImage(occasion, salt) {
  const list = NEWS_IMAGES[occasion] || [];
  if (!list.length) return null;
  const options = list.length > 1 ? list.filter(x => x !== G.storyLastImg) : list;
  return G.storyLastImg = options[Math.floor(hash01(salt + 'im') * options.length)];
}
// Attach a story to the news item just added. section: club|match|transfer|life|league.
function makeStory(n, section, occasion, V, opts = {}) {
  if (!n || n.box !== 'news') return;
  const t = storyTemplate(occasion, V, n.id);
  if (!t) return;
  const mine = (opts.clubs || []).includes(G.club), stand = fillStory(t[1], { ...V, ...(opts.prose || {}) });
  n.story = {
    // Headlines drop "the" before nicknames; the standfirst is a sentence, so it keeps it ("from the Seagulls").
    outlet: section, occasion, headline: fillStory(t[0], V), standfirst: stand[0].toUpperCase() + stand.slice(1), img: storyImage(occasion, n.id),
    weight: (STORY_WEIGHT[occasion] || 20) + (mine ? 25 : 0) + Math.min(20, (opts.fee || 0) / 4e6), clubs: opts.clubs || [], tint: opts.tint || (opts.clubs || [])[0] || null,
    ...(opts.score ? { score: opts.score } : {}),
  };
}
// Headline-style club name: no "the". Surnames for players.
const hClub = id => G.clubs[id]?.name || 'Free agents';
const surname = p => p?.ln || '';

/* ---------- occasions from events ---------- */
function storyMatch(n, fx, S, O, motm) {
  const us = G.club, opp = O.cid, gf = S.st.g, ga = O.st.g, me = G.clubs[us], them = G.clubs[opp];
  const derby = !fx.fr && !!me.city && me.city === them?.city;
  const tally = {}; S.goals.forEach(g => { tally[g.pid] = (tally[g.pid] || 0) + 1; });
  const top = Object.entries(tally).sort((a, b) => b[1] - a[1])[0];
  const lastOurs = S.goals[S.goals.length - 1], lastTheirs = O.goals[O.goals.length - 1];
  const scorers = [...new Set(S.goals.map(g => surname(G.players[g.pid])))];
  const V = { us: hClub(us), opp: hClub(opp), score: `${Math.max(gf, ga)}-${Math.min(gf, ga)}`, gf, motm: motm ? fullName(G.players[motm]) : null,
    scorers: scorers.length ? scorers.slice(0, -1).join(', ') + (scorers.length > 1 ? ' and ' : '') + scorers[scorers.length - 1] : null };
  let occ;
  if (fx.fr) occ = 'friendly';
  else if (gf > ga) {
    if (derby) occ = 'derby-win';
    else if (top && top[1] >= 3) { occ = 'win-hattrick'; V.brace = surname(G.players[top[0]]); }
    else if (gf - ga === 1 && lastOurs?.min >= 85) { occ = 'win-late'; V.scorer = surname(G.players[lastOurs.pid]); V.min = lastOurs.min; }
    else if (gf - ga >= 3) occ = 'win-big';
    else if (top && top[1] === 2) { occ = 'win-brace'; V.brace = surname(G.players[top[0]]); }
    else { occ = 'win'; if (scorers.length === 1) V.scorer = surname(G.players[S.goals[0].pid]); }
  } else if (gf === ga) {
    if (derby) occ = 'derby-draw';
    else if (!gf) occ = 'draw-goalless';
    else if (lastOurs && lastOurs.min >= 85 && (!lastTheirs || lastTheirs.min < lastOurs.min)) { occ = 'draw-late'; V.scorer = surname(G.players[lastOurs.pid]); V.min = lastOurs.min; }
    else occ = 'draw';
  } else if (derby) occ = 'derby-loss';
  else if (ga - gf >= 3) occ = 'loss-heavy';
  else if (ga - gf === 1 && lastTheirs?.min >= 85) { occ = 'loss-late'; V.min = lastTheirs.min; }
  else occ = 'loss';
  const home = fx.h === us;
  makeStory(n, 'match', occ, V, { clubs: [us, opp], tint: us, prose: { us: theClub(us), opp: theClub(opp) }, score: { h: home ? us : opp, a: home ? opp : us, hg: home ? gf : ga, ag: home ? ga : gf } });
}
function storyTransfer(n, kind, p, fromId, toId, fee, extra = {}) {
  const from = G.clubs[fromId], V = { player: fullName(p), to: hClub(toId), from: from?.fa ? 'free agency' : hClub(fromId), fee: fee ? money(fee) : null,
    age: p.age, pos: (POS_NAME[p.pos] || p.pos).toLowerCase(), ...extra };
  let occ = kind;
  if (kind === 'signing') occ = !fee ? 'signing-free' : fee >= 60e6 ? 'signing-record' : fee >= 25e6 ? 'signing-big' : from?.foreign ? 'signing-abroad' : 'signing';
  makeStory(n, 'transfer', occ, V, { clubs: [toId, fromId], tint: toId, fee, prose: { to: theClub(toId), from: from?.fa ? 'free agency' : theClub(fromId) } });
}
// Simple stories whose facts are passed straight in.
function storySimple(n, section, occasion, V, clubs = []) { makeStory(n, section, occasion, V, { clubs, tint: clubs[0], prose: clubs[0] && V.club ? { club: theClub(clubs[0]) } : {} }); }
