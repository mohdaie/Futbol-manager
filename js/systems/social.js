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
    : { id, ...fanAccountName(c), kind: 'fan', tier: 5, rel: 0.2, fol: c.rep * 1500, cid };
}
// Each club's fan account gets one of a few name styles, fixed by the club id.
const FAN_NAMES = [n => n + ' Faithful', n => n + ' Talk', n => 'Come On You ' + n, n => n + ' Fan TV', n => n + ' Daily'];
function fanAccountName(c) {
  const name = FAN_NAMES[Math.floor(hash01(c.id + 'fan') * FAN_NAMES.length)](c.name);
  return { name, handle: name.replace(/[^A-Za-z0-9]/g, '') };
}
const pressR = () => staffAvg('Press', 8);
const bigClubs = () => Object.values(G.clubs).filter(c => !c.fa && !c.backgroundOnly && c.rep >= 78);

function post(acc, txt, o = {}) {
  const a = mediaAcc(acc), reach = a.fol / 1e6;
  const likes = Math.round((reach * 900 + 20) * (0.5 + hash01(G.nextId + 'l')) * (o.hot || 1));
  const p = { id: G.nextId++, date: today().getTime() + Math.floor(hash01(G.nextId + 't') * 20) * 3600e3 / 2, acc, txt, pid: o.pid || null, clubs: o.clubs || [], kind: o.kind || 'post', likes, reposts: Math.round(likes * (0.08 + hash01(G.nextId + 'r') * 0.12)), replies: [], real: o.real !== false, deal: o.deal || null };
  G.social.unshift(p);
  if (G.social.length > 160) G.social.length = 160;
  if (p.kind === 'rumour') {
    (G.rumours ||= []).unshift(p);
    G.rumours.length = Math.min(G.rumours.length, 120);
  }
  if (typeof worldAlertFromPost === 'function') worldAlertFromPost(p);
  if (o.react && p.clubs.length) fanReplies(p);
  if (typeof postWords === 'function' && ['rumour', 'here', 'agreed', 'talks', 'off'].includes(p.kind)) postWords(p);
  return p;
}
// A few fan replies under a post. post.clubs is [buying club, selling club], so the first
// replies come from the side signing him and the next from the side losing him. {s}: his surname.
const FAN_LINES = {
  in: ['What a signing. Get it done!', 'Love this. Exactly what we need.', 'Overpriced if you ask me.', "Not convinced, but let's see.", 'Finally some ambition from the club!', "{s}! Didn't see that coming.", 'Medical, photo, announce. Go.', "Decent. Still need a centre-back though.", 'That fee for {s}? Wow.', "He'll do a job.", 'Shirt ordered.', "Hope he's better than the last one we bought.", '{s} in our colours. Love it.', 'Proper signing, that.', 'Fair play to the board.'],
  out: ['Gutted. One of our best.', 'Good money for him, to be fair.', 'Replace him before the window shuts!', 'Never wanted him to go.', 'Thanks for everything, {s}.', "Selling {s} now? Who's replacing him?", 'Should have got more for him.', "He'd stopped trying anyway.", 'Raging. Absolutely raging.', 'Best of luck, {s}. Not against us though.', "Board's got no ambition.", "Fine. We'll move on.", "Can't blame him really.", 'Worst bit of business all summer.', "We'll regret this."],
  rumourIn: ['Source?', 'Please be true.', 'Believe it when I see it.', "I'd take {s} in a heartbeat.", "{s}? Yes please.", 'Not sure he fits how we play.', "We'll never pay that.", "Board won't back it. Never do.", 'Get him in.', "{s}'s exactly what we're missing.", 'This lot are never right.', "Wake me up when it's done."],
  rumourOut: ['Not this again.', "{s} isn't going anywhere.", "Hands off.", "If he wants to go, let him.", 'Total rubbish.', 'Name your price. Double it.', "Clickbait. Ignore.", "He's going, isn't he.", "We'll sell him and buy no one, watch.", "Keep him. Build the team around {s}."],
  statement: ['Right call.', 'Fair enough.', "Believe it when the window shuts.", 'Strong from the club.', "We've heard that before.", 'Good. End of story.'],
};
function fanReplies(p) {
  const n = 1 + Math.floor(hash01(p.id + 'n') * 3), pl = p.pid && G.players[p.pid], s = pl ? pl.ln : 'him', used = new Set();
  for (let i = 0; i < n; i++) {
    const side = i % p.clubs.length, cid = p.clubs[side];
    const key = p.kind === 'statement' ? 'statement' : p.kind === 'rumour' ? (side ? 'rumourOut' : 'rumourIn') : side ? 'out' : 'in';
    const lines = FAN_LINES[key];
    let k = Math.floor(hash01(p.id + ':' + i) * lines.length);
    while (used.has(key + k)) k = (k + 1) % lines.length; // no fan says the same thing twice under one post
    used.add(key + k);
    p.replies.push({ acc: 'fan:' + cid, txt: lines[k].replace(/\{s\}/g, s), likes: Math.round(hash01(p.id + 'f' + i) * 400) });
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
  const s = d.id + ':' + ev, fee = d.fee ? money(d.fee) : '', V = { n, s: p.ln, to, from, fee, toP: possessive(to) };
  const say = (acc, kind, extra = {}) => post(acc.id, dealLine(ev, acc.kind, V, s), { ...o, kind, ...extra });
  if (ev === 'talks' || ev === 'approach' || ev === 'bid') say(pickAcc(accsOf([2, 3]), s), 'talks');
  if (ev === 'leak') say(pickAcc(accsOf([3, 4]), s), 'rumour');
  if (ev === 'agreed') post(pickAcc(accsOf([1, 2], ['journalist']), s).id, dealLine('agreed', 'journalist', { ...V, fee: fee ? fee + (d.add ? ' plus add-ons' : '') : '' }, s), { ...o, kind: 'agreed', hot: 1.5 });
  if (ev === 'here') post('romani', `${n} to ${to}, HERE WE GO! 🚨 Agreement in place${d.fee ? ' for ' + money(d.fee) : ''}, medical booked.${d.years ? ` Contract until ${G.season + d.years}.` : ''}`, { ...o, kind: 'here', hot: 3, react: true });
  if (ev === 'done') post('off:' + d.to, dealLine('done', 'club', V, s), { ...o, kind: 'done', hot: 2, react: true });
  if (ev === 'off') post(pickAcc(accsOf([1, 2], ['journalist']), s).id, dealLine('off', 'journalist', V, s), { ...o, kind: 'off' });
  if (['talks', 'approach', 'leak', 'agreed', 'bid'].includes(ev)) transferBuzz(p, d.dir === 'out' ? d.to : d.to, ev === 'agreed' || ev === 'bid');
  if (clubs.includes(G.club) && ['talks', 'approach', 'leak', 'bid'].includes(ev)) pressRequest(p, d.dir === 'in' ? 'target' : 'ours', G.social[0]);
}

// Wording for a deal moving, by event and by the kind of account posting it. A line is
// [text] or [text, condition]; conditions skip lines whose facts are missing (no fee yet).
const DEAL_LINES = {
  talks: {
    journalist: [['{to} have opened talks with {from} over {n}. Early stages.'], ['{to} have made a first approach for {n}. {from} aware.'], ['Understand {to} have asked {from} about {n}. No bid yet.']],
    tabloid: [['{to} in talks to land {n}'], ['{to} make their move for {from} star {n}'], ['{to} open talks over {n} as {from} brace for bid']],
    rumour: [['🚨 {to} have opened talks for {n}.'], ['Talks have started between {to} and {from} over {n}. More soon.'], ['{to} → {n}. Contact made.']],
    influencer: [['{to} actually going for {n}. Talks are on 👀'], ['{n} to {to} is happening? Talks started apparently.'], ['Big if true: {to} talking to {from} about {n}.']],
  },
  approach: 'talks',
  bid: {
    journalist: [['{to} have submitted an offer for {n}. {from} considering it.'], ['Bid in from {to} for {n}: {fee}. {from} yet to respond.', 'fee'], ['{from} have received a proposal from {to} for {n}.']],
    tabloid: [['{to} slap in {fee} bid for {n}', 'fee'], ['{to} test {from} with bid for {n}'], ['{from} braced as {to} bid for {n}']],
    rumour: [['🚨 Bid. {to} have offered {fee} for {n}.', 'fee'], ['{to} have made an offer for {n}. Waiting on {from}.'], ['Offer on the table from {to} for {n} 📝']],
    influencer: [['{fee} for {n}? {to} are serious.', 'fee'], ['{to} have bid for {n}. Would you sell at that price?'], ['{to} bidding for {n}. Interesting one.']],
  },
  leak: {
    tabloid: [['{to} in secret talks for {n}'], ['{to} working behind the scenes on {n} deal']],
    rumour: [['Hearing {to} are working quietly on a deal for {n} 👀'], ['{to} and {n}: something is going on. Keep an eye on this.'], ['Quiet talks between {to} and {from} over {n}, we are told.']],
    influencer: [["{to} keeping {n} very quiet, but it's happening 🤫"], ['Word is {to} are close to something with {n}.']],
  },
  agreed: { journalist: [['{to} and {from} have agreed a fee for {n}: {fee}. Personal terms next.', 'fee'], ['{to} and {from} have agreed a fee for {n}. Personal terms next.'], ['Fee agreed. {n} to {to}, {fee} package. Player side next.', 'fee'], ['{from} accept {toP} proposal for {n}. Only terms to finalise.']] },
  off: { journalist: [['Talks between {to} and {from} over {n} have collapsed.'], ['{n} will not be joining {to}. Deal off.'], ['{to} have walked away from the {n} deal.']] },
  done: { club: [['✍️ {n} is a {to} player! Welcome to the club.'], ['Signed. Welcome, {s}.'], ['{n} joins {to}. 🤝'], ['Delighted to announce the signing of {n}.']] },
};
function dealLine(ev, kind, V, salt) {
  let set = DEAL_LINES[ev]; if (typeof set === 'string') set = DEAL_LINES[set];
  const lines = (set[kind] || set.journalist || Object.values(set)[0]).filter(([, need]) => !need || V[need]);
  return lines[Math.floor(hash01(salt + 'w') * lines.length)][0].replace(/\{(\w+)\}/g, (_, k) => V[k] ?? '');
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
  const acc = pickAcc(accsOf([3, 4]), s + 'a');
  const pt = post(acc.id, rumourLine(p, to, acc.kind, s), { pid: p.id, clubs: [to.id, p.club], kind: 'rumour', real: false, react: true });
  transferBuzz(p, to.id, false);
  // One tier-4 whisper is not worth a statement; a tabloid story or a player linked twice in two weeks is.
  const links = (G.rumours || []).filter(r => r.pid === p.id && today().getTime() - r.date < 14 * 864e5).length;
  if (p.club === G.club && (acc.kind === 'tabloid' || links >= 2)) pressRequest(p, 'ours', pt);
}
// A rumour in the voice of the account posting it, using what is true about the player when it can.
function rumourLine(p, to, kind, salt) {
  const n = fullName(p), s = p.ln, from = clubName(p.club), g = p.st.g || 0, played = p.st.a > 0;
  const until = p.con <= G.season + 1 ? p.con : 0, value = money(roundMoney(pValue(p)));
  const L = {
    tabloid: [`${to.name} plot shock swoop for ${n}`, `${to.name} ready to test ${possessive(from)} resolve with a bid for ${n}`, `${n} wanted by ${to.name}, and he fancies the move`, `${to.name} lining up ${value} move for ${n}`, `${n} tells pals he wants ${to.name} switch`, played && `${to.name} send spies to watch ${s}`, `${from} fear ${to.name} raid for ${n}`],
    rumour: [`🚨 ${to.name} are monitoring ${n}. More to follow.`, `Told ${to.name} have asked about ${possessive(n)} availability.`, `${n} → ${to.name}? Contacts made, per our sources.`, `${to.name} keeping tabs on ${n} ahead of the next window 👀`, `Hearing ${possessive(n)} camp have been sounded out by ${to.name}.`, `${n} is on ${possessive(to.name)} list. Nothing advanced yet.`, played && `${to.name} scouts were at ${possessive(from)} last game to watch ${s}.`, until && `${possessive(n)} contract is up in ${until}. ${to.name} know it.`],
    influencer: [g >= 3 && `${n} at ${to.name} would be unreal. ${g} goals already this season 🔥`, `Everyone's talking ${n} to ${to.name}. Makes sense to me tbh.`, `${to.name} going for ${n}? He'd walk into that side.`, `Not sure ${n} to ${to.name} works. Different level.`, `If ${to.name} get ${s} for under ${value} that's a steal.`, `${s} to ${to.name} rumours are back again 😅`],
  }[kind] || [`${to.name} are monitoring ${n} ahead of a possible move.`];
  const lines = L.filter(Boolean);
  return lines[Math.floor(hash01(salt + 'x') * lines.length)];
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
  addNews('inbox', `Press Officer: statement on ${pname(p)}`, `${pt ? mediaAcc(pt.acc).name + ': "' + pt.txt + '" ' : ''}${['The press want a response.', 'Reporters are asking for a comment.', 'The story is spreading and journalists want a line from the club.'][Math.floor(hash01(r.id + 'pr') * 3)]} ${staffOf('Press')[0] ? staffOf('Press')[0].name : 'Your Press Officer'} suggests: "${STATEMENTS[kind].find(x => x[0] === advice)[1]}".`, { t: 'press', id: r.id, pid: p.id });
}
// The best response for the situation; a weaker Press Officer sometimes misreads it.
function pressAdvice(p, kind) {
  let best;
  if (kind === 'ours') best = p.mor < 45 || p.listed ? 'listen' : isKeyPlayer(p) ? 'notforsale' : 'nocomment';
  else { const d = activeDeal(p.id, 'in'); best = d && ['interest', 'bid'].includes(d.stage) ? 'deny' : d ? 'nocomment' : 'deny'; }
  if (typeof learnedStatement === 'function') best = learnedStatement(kind, best);
  if (hash01(p.id + ':' + dayAbs() + 'pa') * 20 > pressR() + 6) best = STATEMENTS[kind][Math.floor(hash01(p.id + 'pb') * 3)][0];
  return best;
}
// The statement goes out from the club account and has effects (players' reactions grow in phase 5).
function pressAnswer(id, choice) {
  const r = (G.media.req || []).find(x => x.id === id);
  if (!r || r.done) return '';
  const p = G.players[r.pid], st = STATEMENTS[r.kind].find(x => x[0] === choice);
  r.done = true; r.choice = choice;
  if (typeof logStatement === 'function') logStatement(r, p);
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
  // Keep the same source posts after the general social feed rolls over. Recover older rumour records too.
  const archive = (G.rumours || []).map(r => {
    const source = G.social.find(p => p.kind === 'rumour' && p.pid === r.pid && p.txt === r.txt && Math.abs(p.date-r.date) < 864e5);
    const p = source || r;
    return { ...p, id: p.id ?? G.nextId++, kind: 'rumour', clubs: p.clubs || [p.to].filter(Boolean), replies: p.replies || [], likes: p.likes || 0, reposts: p.reposts || 0 };
  });
  const seen = new Set();
  G.rumours = [...G.social.filter(p => p.kind === 'rumour'), ...archive].sort((a,b) => b.date-a.date)
    .filter(p => { if(seen.has(p.id))return false;seen.add(p.id);return true; }).slice(0,120);
  if (G.staff && !staffOf('Press').length && G.clubs[G.club]) G.staff.push(genStaffMember('Press', G.clubs[G.club].rep));
}
