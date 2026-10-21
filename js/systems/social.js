'use strict';
/* ===== social.js =====
   The transfer media: journalists, rumour accounts, influencers, fans and club accounts posting in a
   Threads-style feed (G.social), and the Press Officer who handles statements about your club (G.media).
   - Real deals produce posts as they move: talks, fee agreed, "here we go", done, collapsed. Reliable
     journalists post later and are right; rumour accounts and influencers post early and are often wrong.
   - False rumours (no deal behind them) appear every day, more in a window.
   - Rumours about your players or your targets ask the Press Officer for a statement. His rating sets how
     good his advice is and how well quiet talks stay quiet.
   All accounts are fictional; journalists have sound-alike names inspired by real reporters (docs/MEDIA.md). */

// [id, name, handle, kind, tier (1 best), reliability 0-1, followers]
const MEDIA_ACCOUNTS = [
  ['romani', 'Fabrizio Romani', 'FabrizioRomani', 'journalist', 1, 0.97, 22e6],
  ['ornstone', 'David Ornstone', 'David_Ornstone', 'journalist', 1, 0.96, 3.1e6],
  ['solhekal', 'Kaveh Solhekal', 'SkyKavehS', 'journalist', 1, 0.92, 1.2e6],
  ['dimarzo', 'Gianluca Di Marzo', 'DiMarzo', 'journalist', 1, 0.93, 2.4e6],
  ['plattenberg', 'Florian Plattenberg', 'Plattenberg', 'journalist', 2, 0.82, 1.4e6],
  ['morettoni', 'Matteo Morettoni', 'MatteMorettoni', 'journalist', 2, 0.84, 0.9e6],
  ['mcgrae', 'Mike McGrae', 'McGraeMike', 'journalist', 2, 0.8, 0.4e6],
  ['jacobson', 'Ben Jacobson', 'JacobsonBen', 'journalist', 2, 0.72, 0.8e6],
  ['scoop', 'The Daily Scoop', 'DailyScoopFC', 'tabloid', 3, 0.42, 2.2e6],
  ['whispers', 'Football Whispers 24', 'FWhispers24', 'rumour', 3, 0.33, 1.1e6],
  ['eurofoot', 'EuroFoot Rumours', 'EuroFootRum', 'rumour', 3, 0.3, 0.7e6],
  ['buzz', 'TransferBuzz HQ', 'TransferBuzzHQ', 'rumour', 4, 0.18, 1.6e6],
  ['itkkev', 'ITK Kev', 'ITK_Kev', 'rumour', 4, 0.12, 0.3e6],
  ['footlad', 'The Football Lad', 'TheFootballLad', 'influencer', 3, 0.28, 3.4e6],
  ['tifo', 'Tactics & Tifos', 'TacticsTifos', 'influencer', 3, 0.35, 1.9e6],
  ['kickoff', 'Kick-Off Kayla', 'KickOffKayla', 'influencer', 4, 0.22, 2.6e6],
];
const MEDIA = Object.fromEntries(MEDIA_ACCOUNTS.map(([id, name, handle, kind, tier, rel, fol]) => [id, { id, name, handle, kind, tier, rel, fol }]));
// Club accounts: the official account and a fan account for every club.
function mediaAcc(id) {
  if (MEDIA[id]) return MEDIA[id];
  const [k, cid] = id.split(':'), c = G.clubs[cid];
  if (!c) return { id, name: 'Account', handle: 'account', kind: 'fan', tier: 5, rel: 0.1, fol: 1e3 };
  return k === 'off'
    ? { id, name: c.name, handle: cid + '_Official', kind: 'club', tier: 1, rel: 1, fol: (c.rep * c.rep) * 900, cid }
    : { id, name: c.name + ' Faithful', handle: cid + 'Faithful', kind: 'fan', tier: 5, rel: 0.2, fol: c.rep * 1500, cid };
}
const pressR = () => staffAvg('Press', 8);
const bigClubs = () => Object.values(G.clubs).filter(c => !c.fa && c.rep >= 78);

function post(acc, txt, o = {}) {
  const a = mediaAcc(acc), reach = a.fol / 1e6;
  const likes = Math.round((reach * 900 + 20) * (0.5 + hash01(G.nextId + 'l')) * (o.hot || 1));
  const p = { id: G.nextId++, date: today().getTime() + Math.floor(hash01(G.nextId + 't') * 20) * 3600e3 / 2, acc, txt, pid: o.pid || null, clubs: o.clubs || [], kind: o.kind || 'post', likes, reposts: Math.round(likes * (0.08 + hash01(G.nextId + 'r') * 0.12)), replies: [], real: o.real !== false, deal: o.deal || null };
  G.social.unshift(p);
  if (G.social.length > 160) G.social.length = 160;
  if (o.react && p.clubs.length) fanReplies(p);
  return p;
}
// A few fan replies under a post.
const FAN_LINES = {
  in: ['What a signing. Get it done!', 'Love this. Exactly what we need.', 'Overpriced if you ask me.', 'Not convinced, but let us see.', 'Finally some ambition from the club!'],
  out: ['Gutted. One of our best.', 'Good money for him, to be fair.', 'Replace him before the window shuts!', 'Never wanted him to go.', 'Thanks for everything.'],
  rumour: ['Source?', 'Please be true.', 'Not this again.', 'Believe it when I see it.', 'Would take him in a heartbeat.'],
};
function fanReplies(p) {
  const n = 1 + Math.floor(hash01(p.id + 'n') * 3);
  for (let i = 0; i < n; i++) {
    const cid = p.clubs[i % p.clubs.length], lines = FAN_LINES[p.kind === 'rumour' ? 'rumour' : i % 2 ? 'out' : 'in'];
    p.replies.push({ acc: 'fan:' + cid, txt: lines[Math.floor(hash01(p.id + ':' + i) * lines.length)], likes: Math.round(hash01(p.id + 'f' + i) * 400) });
  }
}

/* ---------- posts from real deals ---------- */
const accsOf = (tiers, kinds) => Object.values(MEDIA).filter(a => tiers.includes(a.tier) && (!kinds || kinds.includes(a.kind)));
const pickAcc = (list, salt) => list[Math.floor(hash01(salt) * list.length)];
// Called by deals.js as a deal moves. Quiet talks only appear if they leak.
function dealMedia(d, ev) {
  if (!G.social) return;
  const p = G.players[d.pid]; if (!p) return;
  const to = clubName(d.to), from = clubName(d.from), n = fullName(p), big = (d.fee || 0) >= 15e6 || [d.to, d.from].includes(G.club) || (G.clubs[d.to] && G.clubs[d.to].pl);
  if (!big && hash01(d.id + ev) > 0.35) return;
  const clubs = [d.to, d.from].filter(c => G.clubs[c] && !G.clubs[c].fa), o = { pid: p.id, clubs, deal: d.id };
  const s = d.id + ':' + ev;
  if (ev === 'talks') post(pickAcc(accsOf([2, 3]), s).id, `${to} have opened talks to sign ${n} from ${from}. Early stages. 🔄`, { ...o, kind: 'talks' });
  if (ev === 'approach') post(pickAcc(accsOf([2, 3]), s).id, `${to} have made an approach for ${n}. ${from} aware of the interest.`, { ...o, kind: 'talks' });
  if (ev === 'leak') post(pickAcc(accsOf([3, 4]), s).id, `Hearing ${to} are working quietly on a deal for ${n} 👀`, { ...o, kind: 'rumour' });
  if (ev === 'agreed') post(pickAcc(accsOf([1, 2], ['journalist']), s).id, `${to} and ${from} have agreed a fee for ${n}${d.fee ? ': ' + money(d.fee) + (d.add ? ' plus add-ons' : '') : ''}. Personal terms next. 🔴`, { ...o, kind: 'agreed', hot: 1.5 });
  if (ev === 'here') post('romani', `${n} to ${to}, HERE WE GO! 🚨 Agreement in place${d.fee ? ' for ' + money(d.fee) : ''}, medical booked. Contract until ${G.season + (d.years || 4)}.`, { ...o, kind: 'here', hot: 3, react: true });
  if (ev === 'done') { post('off:' + d.to, `✍️ ${n} is a ${to} player! Welcome to the club.`, { ...o, kind: 'done', hot: 2, react: true }); }
  if (ev === 'off') post(pickAcc(accsOf([1, 2], ['journalist']), s).id, `Talks between ${to} and ${from} over ${n} have collapsed. ❌`, { ...o, kind: 'off' });
  if (ev === 'bid') post(pickAcc(accsOf([2, 3]), s).id, `${to} have made an offer for ${n}. ${from} considering it.`, { ...o, kind: 'talks' });
  if (['talks', 'approach', 'leak', 'agreed', 'bid'].includes(ev)) transferBuzz(p, d.dir === 'out' ? d.to : d.to, ev === 'agreed' || ev === 'bid');
  if (clubs.includes(G.club) && ['talks', 'approach', 'leak', 'bid'].includes(ev)) pressRequest(p, d.dir === 'in' ? 'target' : 'ours', G.social[0]);
}

/* ---------- false rumours and leaks, every day ---------- */
function socialDay() {
  if (!G.social) return;
  const n = inWindow() ? (hash01(dayAbs() + 'n') < 0.6 ? 2 : 1) : (hash01(dayAbs() + 'n') < 0.3 ? 1 : 0);
  for (let i = 0; i < n; i++) falseRumour(i);
  // Quiet talks can leak; a better Press Officer keeps them quiet.
  G.deals.filter(d => dealOpen(d) && d.dir === 'in' && d.approach === 'quiet' && !d.leaked && ['bid', 'agent', 'terms', 'player', 'medical'].includes(d.stage)).forEach(d => {
    if (hash01(d.id + ':' + dayAbs() + 'lk') < 0.02 * (22 - pressR()) / 12) { d.leaked = true; dealLog(d, 'The talks have leaked to the press.', 'club'); dealMedia(d, 'leak'); }
  });
  (G.media.req || []).forEach(r => { if (!r.done && dayAbs() - r.day > 5) { r.done = true; r.choice = 'none'; } });
}
// A rumour with no deal behind it: a player at a league club linked with a big club, or your player linked away.
function falseRumour(i) {
  const s = dayAbs() + ':' + i, pool = Object.values(G.players).filter(p => G.clubs[p.club] && G.clubs[p.club].pl && lvlOf(p) === 'A' && p.ca >= 70);
  if (!pool.length) return;
  const p = wpick(pool, x => Math.pow(1.07, x.ca - 70) * (x.club === G.club ? 2 : 1) * (1 + (x.st.a ? x.st.rt / x.st.a - 6.5 : 0)));
  const to = pickAcc(bigClubs().filter(c => c.id !== p.club), s + 'c');
  if (!to) return;
  const acc = pickAcc(accsOf([3, 4]), s + 'a'), n = fullName(p);
  const lines = [`${to.name} are monitoring ${n} ahead of a possible move 👀`, `EXCLUSIVE: ${n} is on ${to.name}'s shortlist. Scouts were at his last match.`, `${n} would be open to a move to ${to.name}, sources say 🗣️`, `${to.name} preparing an offer for ${n}?! 🤯`];
  const pt = post(acc.id, lines[Math.floor(hash01(s + 'x') * lines.length)], { pid: p.id, clubs: [to.id, p.club], kind: 'rumour', real: false, react: true });
  (G.rumours || (G.rumours = [])).unshift({ date: today().getTime(), pid: p.id, to: to.id, txt: pt.txt, acc: acc.id, real: false });
  G.rumours.length = Math.min(G.rumours.length, 60);
  transferBuzz(p, to.id, false);
  if (p.club === G.club) pressRequest(p, 'ours', pt);
}

/* ---------- the Press Officer ---------- */
const STATEMENTS = {
  ours: [['notforsale', 'He is not for sale', 'Fans like it. A player who wants to go will not.'], ['nocomment', 'No comment', 'Keeps your options open; the story runs on.'], ['listen', 'We would listen to offers', 'Invites bids. Unsettles the player.']],
  target: [['deny', 'Deny any interest', 'Keeps the price down; the player may feel unwanted.'], ['nocomment', 'No comment', 'Says nothing; the story runs on.'], ['confirm', 'Confirm our interest', 'Makes the player keener; his club may ask for more.']],
};
// One statement request per player per window (or per month outside one).
function pressRequest(p, kind, pt) {
  G.media.req = G.media.req || [];
  if (G.media.req.some(r => r.pid === p.id && dayAbs() - r.day < 30)) return;
  const advice = pressAdvice(p, kind);
  const r = { id: G.nextId++, pid: p.id, kind, day: dayAbs(), date: today().getTime(), txt: pt ? pt.txt : '', acc: pt ? pt.acc : null, advice, done: false };
  G.media.req.unshift(r);
  G.media.req.length = Math.min(G.media.req.length, 30);
  addNews('inbox', `Press Officer: statement on ${pname(p)}`, `${pt ? mediaAcc(pt.acc).name + ': "' + pt.txt + '" ' : ''}The press want a response. ${staffOf('Press')[0] ? staffOf('Press')[0].name : 'Your Press Officer'} suggests: "${STATEMENTS[kind].find(x => x[0] === advice)[1]}".`, { t: 'press', id: r.id, pid: p.id });
}
// The best response for the situation; a weaker Press Officer sometimes misreads it.
function pressAdvice(p, kind) {
  let best;
  if (kind === 'ours') best = p.mor < 45 || p.listed ? 'listen' : isKeyPlayer(p) ? 'notforsale' : 'nocomment';
  else { const d = activeDeal(p.id, 'in'); best = d && ['interest', 'bid'].includes(d.stage) ? 'deny' : d ? 'nocomment' : 'deny'; }
  if (hash01(p.id + ':' + dayAbs() + 'pa') * 20 > pressR() + 6) best = STATEMENTS[kind][Math.floor(hash01(p.id + 'pb') * 3)][0];
  return best;
}
// The statement goes out from the club account and has effects (players' reactions grow in phase 5).
function pressAnswer(id, choice) {
  const r = (G.media.req || []).find(x => x.id === id);
  if (!r || r.done) return '';
  const p = G.players[r.pid], st = STATEMENTS[r.kind].find(x => x[0] === choice);
  r.done = true; r.choice = choice;
  const B = G.board;
  if (choice === 'notforsale') { B.fans = clamp(B.fans + 1, 0, 100); p.media = { k: 'notforsale', day: dayAbs() }; }
  if (choice === 'listen') { p.listed = true; p.media = { k: 'listen', day: dayAbs() }; }
  if (choice === 'confirm') { const d = activeDeal(p.id, 'in'); if (d) { d.will = null; d.pub = true; d.ask = d.ask ? roundMoney(d.ask * 1.05) : d.ask; dealLog(d, 'You confirmed your interest in public.', 'you'); } p.media = { k: 'confirm', day: dayAbs() }; }
  if (choice === 'deny') { const d = activeDeal(p.id, 'in'); if (d) dealLog(d, 'You denied any interest in public.', 'you'); p.media = { k: 'deny', day: dayAbs() }; }
  statementMood(p, choice);
  post('off:' + G.club, `Club statement on ${fullName(p)}: "${st[1]}."`, { pid: p.id, clubs: [G.club], kind: 'statement', react: true });
  G.news.forEach(n => { if (n.action && n.action.t === 'press' && n.action.id === id) n.done = true; });
  return `Statement released: "${st[1]}."`;
}

function ensureSocial() {
  G.social = G.social || []; G.media = G.media || { req: [] };
  if (G.staff && !staffOf('Press').length && G.clubs[G.club]) G.staff.push(genStaffMember('Press', G.clubs[G.club].rep));
}
