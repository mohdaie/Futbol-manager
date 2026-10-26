'use strict';
/* ===== life.js =====
   Players' lives off the pitch: charity work, sponsorships, weddings and babies, and now and then a
   nightclub incident, a row with fans online, a minor car accident or homesickness. Rolled weekly
   for first-team players at clubs in the career's leagues, weighted by personality (p.pers), fame,
   age, morale and how settled a player abroad is.
   - Every event is a public story in Beyond the Touchline (newspaper.js).
   - A negative event at your club also asks you to decide in the Inbox (fine him, back him...).
   - Negative events never happen to a recognisable sound-alike of a real person: a player whose
     fictional name is at least half the same letters as his real-life inspiration (p.insp) only gets
     positive stories.
   - About two stories a week league-wide; a player has at most one event every six months. */

const LIFE_GAP_DAYS = 180;
const fameOf = p => clamp((p.ca - 60) / 20, 0.3, 2) * clamp((G.clubs[p.club]?.rep || 60) / 75, 0.6, 1.3);
const homesickRisk = p => foreignAt(p) && p.age <= 27 && squadOf(p.club).filter(x => x.nat === p.nat).length <= 1;
const persIs = (p, ...list) => list.includes(p.pers);
// Share of letters two names have in common (1 = identical), ignoring accents and case.
function nameLikeness(a, b) {
  const norm = s => String(s).normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z ]/g, '');
  a = norm(a); b = norm(b);
  let prev = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    const row = [i];
    for (let j = 1; j <= b.length; j++) row[j] = Math.min(prev[j] + 1, row[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    prev = row;
  }
  return 1 - prev[b.length] / Math.max(a.length, b.length, 1);
}
const LIKENESS = new Map();
const soundAlike = p => {
  if (!p.insp) return false;
  const key = p.id + ':' + fullName(p);
  if (!LIKENESS.has(key)) LIKENESS.set(key, nameLikeness(fullName(p), p.insp) >= 0.5);
  return LIKENESS.get(key);
};
const lifeAllowed = (p, e) => e.good || !soundAlike(p);

// w: how likely this player is to have the event (0 = never). good: no real-life restriction.
const LIFE_EVENTS = {
  ambassador: { good: true, w: p => (persIs(p, 'Model Citizen', 'Professional', 'Loyal') ? 3 : 1) * fameOf(p), mor: 5, fans: 1,
    title: p => `${pname(p)} named charity ambassador`, body: (p, c) => `${fullName(p)} has become an ambassador for a local children's charity in ${c.city || 'the area'}.` },
  hospital: { good: true, w: p => (persIs(p, 'Model Citizen', 'Professional') ? 2.5 : 0.8) * fameOf(p), mor: 3, fans: 1,
    title: p => `${pname(p)} visits children's hospital`, body: p => `${fullName(p)} spent an afternoon with young patients at the local children's hospital.` },
  community: { good: true, w: p => persIs(p, 'Loyal', 'Model Citizen', 'Determined') ? 2 : 1, mor: 3, fans: 1,
    title: p => `${pname(p)} joins community session`, body: p => `${fullName(p)} coached local schoolchildren at a community football session.` },
  sponsor: { good: true, w: p => (p.ca >= 75 ? (persIs(p, 'Ambitious') ? 3 : 1.5) : 0) * fameOf(p), mor: 4,
    title: p => `${pname(p)} signs boot deal`, body: p => `${fullName(p)} has signed a personal boot sponsorship.` },
  wedding: { good: true, w: p => (p.age >= 24 && p.age <= 34 ? 1.2 : 0), mor: 6,
    title: p => `${pname(p)} gets married`, body: p => `${fullName(p)} married his partner in a private ceremony.` },
  baby: { good: true, w: p => (p.age >= 23 && p.age <= 36 ? 1.2 : 0), mor: 6,
    title: p => `${pname(p)} becomes a father`, body: p => `${fullName(p)} and his partner have welcomed their first child.` },
  accident: { good: false, w: p => (p.inj ? 0 : 0.6), injury: [1, 3],
    title: p => `${pname(p)} hurt in car accident`, body: (p, c, ev) => `${fullName(p)} suffered minor injuries in a car accident and will miss about ${ev.weeks} week${ev.weeks > 1 ? 's' : ''}. Nobody else was seriously hurt.` },
  nightclub: { good: false, w: p => ({ Temperamental: 4, 'Laid Back': 3 }[p.pers] || 1) * (p.mor < 45 ? 2 : 1), decide: true, mor: -3,
    title: p => `${pname(p)} in nightclub incident`, body: p => `${fullName(p)} was photographed leaving a nightclub in the early hours, days before a match.` },
  social: { good: false, w: p => (persIs(p, 'Temperamental') ? 3.5 : 0.7) * (p.mor < 45 ? 2 : 1), decide: true, mor: -3,
    title: p => `${pname(p)} in online row with fans`, body: p => `${fullName(p)} replied angrily to supporters on social media before deleting the posts.` },
  homesick: { good: false, w: p => (homesickRisk(p) ? 4 : 0), decide: true, mor: -4,
    title: p => `${pname(p)} struggling to settle`, body: p => `${fullName(p)} is said to be homesick and finding life in England difficult, far from ${natName(p.nat)}.` },
};
// Your choices when a negative event involves your player: [label, morale, fans, board, cost].
const LIFE_CHOICES = {
  nightclub: [['fine', 'Fine him', -6, 0, 1], ['warn', 'Give him a private warning', -2, 0, 0], ['back', 'Back him in public', 3, -2, -2]],
  social: [['apologise', 'Ask for a public apology', -2, 2, 0], ['fine', 'Fine him', -5, 1, 1], ['back', 'Back him in public', 2, -3, -1]],
  homesick: [['family', 'Fly his family over', 8, 0, 0, 50000], ['talk', 'Have a quiet word', 3, 0, 0], ['ignore', 'Leave him to it', -5, 0, 0]],
};
// What happens if you do not decide within a week.
const LIFE_DEFAULT = { nightclub: ['none', -1, -1], social: ['none', -2, 0], homesick: ['none', -4, 0] };

function lifeState() { return G.life ||= { list: [] }; }
const lifeEvent = id => lifeState().list.find(e => e.id === id);

function lifeCandidates() {
  const ids = new Set((G.leagues || []).flatMap(l => leagueClubs(l)));
  return Object.values(G.players).filter(p => ids.has(p.club) && lvlOf(p) === 'A' && !(p.lifeDay > dayAbs() - LIFE_GAP_DAYS));
}
// One week of off-the-pitch life: one to three stories across the league.
function lifeWeekly() {
  const L = lifeState();
  L.list.filter(e => e.decide && !e.choice && dayAbs() - e.day > 7).forEach(e => lifeAnswer(e.id, 'none'));
  const n = 1 + (R() < 0.5 ? 1 : 0) + (R() < 0.15 ? 1 : 0), pool = lifeCandidates();
  for (let i = 0; i < n && pool.length; i++) {
    const p = wpick(pool, x => (x.club === G.club ? 4 : 1) * Object.values(LIFE_EVENTS).reduce((s, e) => s + (lifeAllowed(x, e) ? e.w(x) : 0), 0));
    pool.splice(pool.indexOf(p), 1);
    const kinds = Object.entries(LIFE_EVENTS).filter(([, e]) => lifeAllowed(p, e));
    const [kind] = wpick(kinds, ([, e]) => e.w(p));
    if (LIFE_EVENTS[kind].w(p) > 0) lifeHappen(p, kind);
  }
}
function lifeHappen(p, kind) {
  const E = LIFE_EVENTS[kind], c = G.clubs[p.club], mine = p.club === G.club, L = lifeState();
  const ev = { id: G.nextId++, day: dayAbs(), pid: p.id, club: p.club, kind, decide: !!E.decide && mine };
  p.lifeDay = dayAbs();
  if (E.mor) p.mor = clamp(p.mor + E.mor, 0, 100);
  if (mine && E.fans) G.board.fans = clamp(G.board.fans + E.fans, 0, 100);
  if (E.injury) { ev.weeks = ri(E.injury[0], E.injury[1]); p.inj = { n: 'Car accident injuries', w: ev.weeks }; }
  L.list.unshift(ev); L.list.length = Math.min(L.list.length, 80);
  addStory('life', E.title(p), E.body(p, c, ev), { t: 'player', pid: p.id });
  if (typeof makeStory === 'function') storySimple(G.news[0], 'life', 'life-' + kind, { player: fullName(p), club: hClub(p.club), clubAdj: hClub(p.club), pos: POS_NAME[p.pos].toLowerCase(), age: p.age, weeks: ev.weeks, country: natName(p.nat) }, [p.club]);
  if (ev.decide) addNews('inbox', `${pname(p)}: how do you respond?`, `${E.body(p, c, ev)} The press want to know how the club will deal with it.`, { t: 'life', id: ev.id, pid: p.id });
  return ev;
}
// Your decision on a negative event. 'none' is what happens when you leave it.
function lifeAnswer(id, choice) {
  const ev = lifeEvent(id), p = ev && G.players[ev.pid];
  if (!ev || ev.choice || !p) return '';
  const opt = choice === 'none' ? [null, null, ...LIFE_DEFAULT[ev.kind]] : (LIFE_CHOICES[ev.kind] || []).find(o => o[0] === choice);
  if (!opt) return '';
  const [, label, mor, fans, board, cost] = opt;
  ev.choice = choice;
  p.mor = clamp(p.mor + mor, 0, 100);
  G.board.fans = clamp(G.board.fans + fans, 0, 100);
  G.board.conf = clamp(G.board.conf + board, 0, 100);
  if (cost) userClub().bal -= cost;
  G.news.forEach(n => { if (n.action?.t === 'life' && n.action.id === id) n.done = true; });
  return choice === 'none' ? '' : `${label}: done.`;
}
