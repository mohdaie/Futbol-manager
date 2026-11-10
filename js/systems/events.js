'use strict';
/* ===== events.js =====
   Dressing-room drama: situations in your squad that ask you to decide, and promises you have to keep.
   - Rolled weekly (eventsWeekly): at most two waiting at once, about one every three weeks. Each kind has a
     test for who it can happen to (morale, personality, place in the XI, contract) and a gap before it can
     repeat, so the same player is not pestered.
   - Every event is an Inbox item (action { t: 'evt', id }) and a card on the Dashboard with the choices as
     buttons. Leave it for a week and the "ignore" outcome happens.
   - Some choices are promises (a start for the next three weeks, a new deal within a month). The weekly check
     keeps score: keep it and he is pleased, break it and he is angrier than before, and his mates notice.
   Everything works through morale, board confidence and fan mood, so the match engine is untouched. */

const EVT_GAP = 28;          // days before the same kind can come back
const EVT_PLAYER_GAP = 60;   // days before the same player is in another event
const EVT_AUTO = 7;          // days before an unanswered event resolves as "ignored"
const PROMISE_DAYS = 21;

function eventState() { return G.events ||= { list: [], promises: [], last: {} }; }
const eventById = id => eventState().list.find(e => e.id === id);
const inXI = p => (G.tactics?.slots || []).includes(p.id);
const evtSquad = () => seniorSquad(G.club).filter(p => !activeLoan(p));
const evtFree = p => !p.inj && !(p.evtDay > dayAbs() - EVT_PLAYER_GAP);
const evtTough = p => ['Professional', 'Model Citizen', 'Determined', 'Loyal'].includes(p.pers);
const evtHot = p => ['Temperamental', 'Ambitious'].includes(p.pers);
const moodAll = (list, d) => list.forEach(x => { x.mor = clamp(x.mor + d, 0, 100); });

/* Each kind: who it can happen to (pick returns the player ids or null), the words, and the choices.
   Choice: [key, label, hint, apply(ev, players) -> sentence for the toast]. 'ignore' is the default. */
const EVT_KINDS = {
  benched: {
    w: 3, icon: '😤',
    pick() {
      const squad = evtSquad(), med = squad.map(p => p.ca).sort((a, b) => a - b)[Math.floor(squad.length / 2)] || 60;
      const c = squad.filter(p => evtFree(p) && !inXI(p) && p.ca >= med && ['Key player', 'First team'].includes(p.status) && p.mor < 62 && !promiseOf(p.id));
      return c.length ? [wpick(c, p => 1 + (62 - p.mor) / 10 + (evtHot(p) ? 1.5 : 0)).id] : null;
    },
    head: ([p]) => `${pname(p)} wants to know why he's not playing`,
    body: ([p]) => `${fullName(p)} has been left out of the XI and has asked for a word. He believes he's good enough to start.`,
    choices: [
      ['promise', 'Promise him a start', 'Start him in 2 of the next 3 weeks', (ev, [p]) => { makePromise(p, 'start', ev.id); p.mor = clamp(p.mor + 6, 0, 100); return `${pname(p)} is pleased. Now start him.`; }],
      ['earn', 'Tell him to earn it', 'He wants to prove himself, or sulks', (ev, [p]) => { const d = evtTough(p) ? 3 : -6; p.mor = clamp(p.mor + d, 0, 100); return d > 0 ? `${pname(p)} takes it on the chin.` : `${pname(p)} doesn't like it.`; }],
      ['fine', 'Fine him for the outburst', 'Squad sees you are strict', (ev, [p]) => { p.mor = clamp(p.mor - 10, 0, 100); moodAll(evtSquad().filter(x => x.id !== p.id && evtTough(x)), 1); return `${pname(p)} is furious but keeps quiet.`; }],
    ],
    ignore: (ev, [p]) => { p.mor = clamp(p.mor - 5, 0, 100); return ''; },
  },
  clash: {
    w: 2, icon: '🥊',
    pick() {
      const c = evtSquad().filter(p => evtFree(p) && lvlOf(p) === 'A');
      const hot = c.filter(p => p.pers === 'Temperamental' || p.mor < 45);
      if (!hot.length) return null;
      const a = wpick(hot, p => 1 + (50 - Math.min(50, p.mor)) / 10), others = c.filter(p => p.id !== a.id);
      const b = others.length && wpick(others, p => 1 + (p.pos === a.pos ? 3 : 0) + (p.pers === 'Temperamental' ? 2 : 0));
      return b ? [a.id, b.id] : null;
    },
    head: ([a, b]) => `${pname(a)} and ${pname(b)} clash in training`,
    body: ([a, b]) => `${fullName(a)} and ${fullName(b)} squared up during a session and the staff had to separate them. The squad is waiting to see what you do.`,
    choices: [
      ['mediate', 'Sit them down together', 'Works best on professionals', (ev, [a, b]) => { const ok = evtTough(a) || evtTough(b) || R() < 0.45; moodAll([a, b], ok ? 4 : -4); return ok ? 'They shake hands. Row over.' : 'They leave angrier than they came.'; }],
      ['backA', null, 'He is pleased, the other furious', (ev, [a, b]) => { moodAll([a], 5); moodAll([b], -8); return `${pname(b)} feels you took sides.`; }],
      ['backB', null, 'He is pleased, the other furious', (ev, [a, b]) => { moodAll([b], 5); moodAll([a], -8); return `${pname(a)} feels you took sides.`; }],
      ['fine', 'Fine both', 'Fair, but nobody is happy', (ev, [a, b]) => { moodAll([a, b], -5); moodAll(evtSquad().filter(x => x.id !== a.id && x.id !== b.id && evtTough(x)), 1); return 'Both fined. The dressing room respects the line you drew.'; }],
    ],
    label: { backA: ([a]) => `Back ${pname(a)}`, backB: ([, b]) => `Back ${pname(b)}` },
    ignore: (ev, [a, b]) => { moodAll([a, b], -4); moodAll(evtSquad().filter(x => x.id !== a.id && x.id !== b.id), -1); return ''; },
  },
  captain: {
    w: 2, icon: '🧤',
    pick() {
      const cap = G.players[G.tactics?.cap];
      if (!cap || cap.club !== G.club || !evtFree(cap) || cap.con - G.season > 1 || promiseOf(cap.id)) return null;
      return [cap.id];
    },
    head: ([p]) => `Captain ${pname(p)} wants a new deal`,
    body: ([p]) => `${fullName(p)} wears the armband and his contract is running down. He says he wants clarity on his future before the next big games.`,
    choices: [
      ['talks', 'Open contract talks', 'He is delighted', (ev, [p]) => { p.mor = clamp(p.mor + 7, 0, 100); addNews('inbox', `${pname(p)}'s contract is expiring`, `${fullName(p)} wants to talk about a new contract. Make him an offer.`, { t: 'renew', pid: p.id }); return `${pname(p)} is pleased. Contract talks are in your inbox.`; }],
      ['stall', 'Promise a deal within a month', 'Keep your word or he walks', (ev, [p]) => { makePromise(p, 'deal', ev.id); p.mor = clamp(p.mor + 2, 0, 100); return `${pname(p)} will wait.`; }],
      ['refuse', 'Tell him it can wait', 'Risky for a leader', (ev, [p]) => { p.mor = clamp(p.mor - 8, 0, 100); moodAll(evtSquad().filter(x => x.id !== p.id), -1); return `${pname(p)} is unhappy and the squad notices.`; }],
    ],
    ignore: (ev, [p]) => { p.mor = clamp(p.mor - 6, 0, 100); return ''; },
  },
  youngster: {
    w: 2, icon: '🌱',
    pick() {
      const c = evtSquad().filter(p => evtFree(p) && p.age <= 21 && !inXI(p) && p.ca >= 55 && p.pa >= 70 && p.mor < 70 && !promiseOf(p.id));
      return c.length ? [wpick(c, p => 1 + (p.pa - 65) / 10).id] : null;
    },
    head: ([p]) => `${pname(p)} wants more game time`,
    body: ([p]) => `${fullName(p)}, ${p.age}, is not getting the minutes he wants. His agent has been in touch with other clubs.`,
    choices: [
      ['promise', 'Promise him minutes', 'Start him in 2 of the next 3 weeks', (ev, [p]) => { makePromise(p, 'start', ev.id); p.mor = clamp(p.mor + 7, 0, 100); return `${pname(p)} is excited.`; }],
      ['wait', 'Tell him to be patient', 'Most youngsters accept it', (ev, [p]) => { const ok = evtTough(p) || R() < 0.5; p.mor = clamp(p.mor + (ok ? 1 : -6), 0, 100); return ok ? `${pname(p)} understands.` : `${pname(p)} is frustrated.`; }],
      ['list', 'Let him go out on loan', 'Lists him; he is happy', (ev, [p]) => { p.listed = true; p.mor = clamp(p.mor + 4, 0, 100); return `${pname(p)} is transfer listed.`; }],
    ],
    ignore: (ev, [p]) => { p.mor = clamp(p.mor - 5, 0, 100); return ''; },
  },
  unhappy: {
    w: 1.5, icon: '🌧️',
    pick() {
      const low = evtSquad().filter(p => p.mor < 50 && lvlOf(p) === 'A');
      return low.length >= 4 && !(eventState().last.unhappy > dayAbs() - 42) ? low.slice(0, 5).map(p => p.id) : null;
    },
    head: ps => `The dressing room is low (${ps.length} players)`,
    body: ps => `${ps.slice(0, 3).map(pname).join(', ')}${ps.length > 3 ? ' and others' : ''} are flat. The senior players have asked you to do something about the mood.`,
    choices: [
      ['meeting', 'Hold a team meeting', 'Lifts most, unless the mood is poisonous', (ev, ps) => { const ok = R() < 0.7; moodAll(ps, ok ? 6 : -2); return ok ? 'Plain speaking clears the air.' : 'The meeting turns awkward.'; }],
      ['dayoff', 'Give them a day off', 'Quick boost; the board frowns', (ev, ps) => { moodAll(ps, 4); G.board.conf = clamp(G.board.conf - 1, 0, 100); return 'A day off lifts spirits.'; }],
      ['results', 'Say results will fix it', 'Free, but only works if you win', (ev, ps) => { moodAll(ps, 0); return 'You back the team to turn it around.'; }],
    ],
    ignore: (ev, ps) => { moodAll(ps, -3); return ''; },
  },
  tempted: {
    w: 2, icon: '👀',
    pick() {
      const c = evtSquad().filter(p => evtFree(p) && p.unset && p.unset.lvl >= 1 && !p.treq);
      return c.length ? [wpick(c, p => 1 + p.unset.lvl).id] : null;
    },
    head: ([p]) => `${pname(p)} is tempted by ${clubName(p.unset?.to)}`,
    body: ([p]) => `${fullName(p)} has been linked with ${clubName(p.unset?.to)} and asks where he stands.`,
    choices: [
      ['reassure', 'Reassure him', 'Settles loyal and happy players', (ev, [p]) => { const ok = p.mor > 45 || evtTough(p); p.mor = clamp(p.mor + (ok ? 5 : 0), 0, 100); if (p.unset) p.unset.lvl = Math.max(0, p.unset.lvl - (ok ? 1.5 : 0.5)); return ok ? `${pname(p)} is reassured.` : `${pname(p)} isn't convinced.`; }],
      ['free', 'Tell him he can go for the right price', 'Lists him; he is happy', (ev, [p]) => { p.listed = true; p.mor = clamp(p.mor + 5, 0, 100); return `${pname(p)} is transfer listed.`; }],
      ['hold', 'Remind him he is under contract', 'Firm; risky if he is unhappy', (ev, [p]) => { const d = p.mor < 45 ? -7 : -1; p.mor = clamp(p.mor + d, 0, 100); return d < -2 ? `${pname(p)} resents it.` : `${pname(p)} accepts it.`; }],
    ],
    ignore: (ev, [p]) => { p.mor = clamp(p.mor - 4, 0, 100); return ''; },
  },
};

/* ---------- promises ---------- */
const promiseOf = pid => eventState().promises.find(x => x.pid === pid && !x.done);
function makePromise(p, kind, evId) {
  eventState().promises.push({ id: G.nextId++, pid: p.id, kind, ev: evId, from: dayAbs(), until: dayAbs() + (kind === 'deal' ? 30 : PROMISE_DAYS), con: p.con, checks: 0, kept: 0, done: false });
}
function promiseSettle(x, ok) {
  const p = G.players[x.pid];
  x.done = true; x.kept = ok;
  if (!p || p.club !== G.club) return;
  const what = x.kind === 'deal' ? 'a new contract' : 'game time';
  if (ok) {
    p.mor = clamp(p.mor + 5, 0, 100);
    addNews('club', `${pname(p)}: promise kept`, `You promised ${fullName(p)} ${what} and delivered. He's a happier player and trusts you.`, { t: 'player', pid: p.id });
  } else {
    p.mor = clamp(p.mor - 14, 0, 100);
    p.unset = { to: p.unset?.to || (nearestBigClub(p) || ''), lvl: Math.min(3, (p.unset?.lvl || 0) + 1), since: dayAbs() };
    moodAll(evtSquad().filter(x2 => x2.id !== p.id && evtTough(x2)), -1);
    addNews('inbox', `${pname(p)} says you broke your promise`, `You promised ${fullName(p)} ${what} and he didn't get it. His trust in you has taken a hit and the squad has noticed.`, { t: 'player', pid: p.id });
  }
}
const nearestBigClub = p => Object.values(G.clubs).filter(c => !c.fa && c.id !== p.club && c.rep > (G.clubs[p.club]?.rep || 0)).sort((a, b) => a.rep - b.rep)[0]?.id;
function promisesWeekly() {
  eventState().promises.filter(x => !x.done).forEach(x => {
    const p = G.players[x.pid];
    if (!p || p.club !== G.club) { x.done = true; return; }
    if (x.kind === 'deal') { if (p.con > x.con) promiseSettle(x, true); else if (dayAbs() >= x.until) promiseSettle(x, false); return; }
    if (!p.inj) { x.checks++; if (inXI(p)) x.kept++; }
    if (x.kept >= 2) promiseSettle(x, true);
    else if (dayAbs() >= x.until) promiseSettle(x, false);
  });
}

/* ---------- rolling and answering ---------- */
const evtPlayers = ev => ev.pids.map(id => G.players[id]).filter(Boolean);
const evtLabel = (K, c, ps) => (K.label && K.label[c[0]] ? K.label[c[0]](ps) : c[1]);
function eventsWeekly() {
  if (typeof jobless === 'function' && jobless()) return;
  const E = eventState();
  E.list.filter(e => !e.choice && dayAbs() - e.day > EVT_AUTO).forEach(e => eventAnswer(e.id, 'ignore'));
  E.list.length = Math.min(E.list.length, 60);
  promisesWeekly();
  const waiting = E.list.filter(e => !e.choice).length;
  if (waiting >= 2 || R() > 0.4 || G.week < 3) return;
  const opts = Object.entries(EVT_KINDS).filter(([k]) => !(E.last[k] > dayAbs() - EVT_GAP));
  const picks = opts.map(([k, K]) => [k, K, K.pick()]).filter(x => x[2]);
  if (!picks.length) return;
  const [kind, K, pids] = wpick(picks, x => x[1].w);
  eventHappen(kind, pids);
}
function eventHappen(kind, pids) {
  const E = eventState(), K = EVT_KINDS[kind], ps = pids.map(id => G.players[id]);
  const ev = { id: G.nextId++, day: dayAbs(), kind, pids, choice: null };
  E.list.unshift(ev); E.last[kind] = dayAbs();
  ps.forEach(p => { p.evtDay = dayAbs(); });
  addNews('inbox', K.head(ps), K.body(ps), { t: 'evt', id: ev.id, pid: pids[0] });
  return ev;
}
// Your answer. 'ignore' is what happens when you do not decide.
function eventAnswer(id, key) {
  const ev = eventById(id), K = ev && EVT_KINDS[ev.kind];
  if (!ev || ev.choice || !K) return '';
  const ps = evtPlayers(ev);
  if (!ps.length) { ev.choice = 'ignore'; G.news.forEach(n => { if (n.action?.t === 'evt' && n.action.id === id) n.done = true; }); return ''; }
  const choice = K.choices.find(c => c[0] === key);
  ev.choice = choice ? key : 'ignore';
  const msg = choice ? choice[3](ev, ps) : K.ignore(ev, ps);
  G.news.forEach(n => { if (n.action?.t === 'evt' && n.action.id === id) n.done = true; });
  return msg;
}
// The buttons for one event; used by the Dashboard card and the Inbox sheet.
function eventButtons(ev) {
  const K = EVT_KINDS[ev.kind], ps = evtPlayers(ev);
  return `<div class="btns col">${K.choices.map(c => `<button class="btn wide" data-a="evtChoice" data-id="${ev.id}" data-k="${c[0]}">${esc(evtLabel(K, c, ps))}<small class="muted"> · ${esc(c[2])}</small></button>`).join('')}</div>`;
}
// A card on the Dashboard for the oldest waiting event.
function eventCard() {
  const ev = eventState().list.filter(e => !e.choice).pop(), K = ev && EVT_KINDS[ev.kind], ps = ev ? evtPlayers(ev) : [];
  if (!ev || !ps.length) return '';
  return `<section class="evcard"><div class="evh"><span class="evi" aria-hidden="true">${K.icon}</span><div><small class="eyebrow">Dressing room</small><b>${esc(K.head(ps))}</b></div></div>
    <p>${esc(K.body(ps))}</p>${eventButtons(ev)}</section>`;
}
