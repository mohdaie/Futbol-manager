'use strict';
/* ===== mood.js =====
   How transfers and rumours change players. Everything works through morale, which the match engine already
   uses (a player's form in matches), so nothing here touches the engine itself.
   - Links to a bigger club unsettle ambitious or unhappy players (p.unset, levels 1-3); loyal and professional
     players shrug them off. Unsettled players lose morale each week and, if it goes on, hand in a transfer
     request. With no new links for four weeks the feeling fades.
   - Your statements matter: "not for sale" pleases a settled player and annoys one who wants to go; "we would
     listen" hurts a settled player and pleases one who wants out.
   - Signings: a big signing lifts the squad; players in the same position who start worry; compatriots are
     pleased; a new top earner on far more than the rest annoys senior players.
   - Sales: selling a key player or a leader lowers the squad's and the fans' mood. */

// How much a link gets to him: ambition, character, morale, role and the size of the club.
function buzzReach(p, to) {
  const from = G.clubs[p.club], gap = (to.rep || 0) - (from ? from.rep : 0);
  return ((p.amb ?? 10) - 10) / 10 + (p.pers === 'Ambitious' ? 0.5 : 0) + (p.pers === 'Loyal' ? -0.8 : 0) + (['Professional', 'Model Citizen'].includes(p.pers) ? -0.3 : 0)
    + (p.mor < 50 ? 0.3 : 0) + (['Rotation', 'Backup'].includes(p.status) ? 0.3 : 0) + gap / 20;
}
// A link with another club: a rumour (real or not) or a bid.
function transferBuzz(p, toId, strong) {
  const to = G.clubs[toId];
  if (!p || !to || to.id === p.club || !G.clubs[p.club] || G.clubs[p.club].fa) return;
  const s = buzzReach(p, to);
  if (s <= 0.3) return;
  const u = p.unset || { lvl: 0 };
  const lvl = Math.min(3, u.lvl + (strong ? 1 : 0.5));
  const drop = Math.round(2 + lvl * 2);
  p.unset = { to: to.id, lvl, since: dayAbs() };
  p.mor = clamp(p.mor - drop, 0, 100);
  if (p.club === G.club && Math.floor(lvl) > Math.floor(u.lvl)) addNews('club', `${pname(p)} distracted by ${to.name} interest`, `${fullName(p)} has been distracted by ${possessive(theClub(to))} interest. His morale has dropped. Talk to him, or make a statement through your Press Officer.`, { t: 'player', pid: p.id });
}
// Each week: unsettled players drift, may ask to leave, and calm down when the links stop.
function moodWeekly() {
  Object.values(G.players).forEach(p => {
    const u = p.unset;
    if (!u) return;
    if (dayAbs() - u.since > 28) { u.lvl -= 1; u.since = dayAbs() - 14; p.mor = clamp(p.mor + 2, 0, 100); if (u.lvl <= 0) delete p.unset; return; }
    p.mor = clamp(p.mor - Math.round(u.lvl), 0, 100);
    if (p.club === G.club && u.lvl >= 2 && !p.treq && p.mor < 55 && dayAbs() - u.since >= 7 && buzzReach(p, G.clubs[u.to] || {}) > 0.6) {
      p.treq = { date: today().getTime(), to: u.to };
      addNews('inbox', `${pname(p)} hands in a transfer request`, `${fullName(p)} wants to leave${G.clubs[u.to] ? ' and is thinking of the ' + G.clubs[u.to].name : ''}. Accept it and list him, or refuse and try to keep him happy.`, { t: 'treq', pid: p.id });
    }
  });
}
// The manager's answer to a transfer request.
function answerRequest(p, accept) {
  if (!p || !p.treq) return '';
  G.news.forEach(n => { if (n.action && n.action.t === 'treq' && n.action.pid === p.id) n.done = true; });
  if (accept) { p.listed = true; p.mor = clamp(p.mor + 8, 0, 100); p.treq = null; agentRelMove(p, 3, 'Accepted his client\'s transfer request'); return `${pname(p)} is transfer listed. He appreciates it.`; }
  const calm = ['Professional', 'Model Citizen', 'Determined'].includes(p.pers) || p.mor > 45;
  p.mor = clamp(p.mor - (calm ? 4 : 12), 0, 100); p.treq = null; agentRelMove(p, -4, 'Refused his client\'s transfer request');
  if (calm && p.unset) p.unset.lvl = Math.max(0, p.unset.lvl - 1);
  return calm ? `${pname(p)} accepts your decision for now.` : `${pname(p)} is angry that you refused.`;
}

// Statements through the Press Officer (social.js) change how the player feels.
function statementMood(p, choice) {
  const wants = !!(p.unset && p.unset.lvl >= 1.5) || p.mor < 40 || !!p.treq;
  let d = 0;
  if (choice === 'notforsale') d = wants ? -6 : 3;
  if (choice === 'listen') d = wants ? 5 : -7;
  if (choice === 'confirm') d = 2; // a target likes being wanted (shown in his keenness)
  if (choice === 'deny') d = -2;
  if (choice === 'notforsale' && !wants && p.unset) p.unset.lvl = Math.max(0, p.unset.lvl - 1);
  p.mor = clamp(p.mor + d, 0, 100);
  return d;
}

// Your new signing: the squad's reaction.
function signingMood(p, fee, wage) {
  const squad = seniorSquad(G.club).filter(x => x.id !== p.id), T = G.tactics, big = fee >= 20e6 || p.ca >= userClub().rep + 2;
  const out = [];
  if (big) { squad.forEach(x => { x.mor = clamp(x.mor + 2, 0, 100); }); G.board.fans = clamp(G.board.fans + 2, 0, 100); out.push('The squad and fans are excited by the signing.'); }
  const rivals = squad.filter(x => T.slots.includes(x.id) && (x.pos === p.pos || p.alt.includes(x.pos)) && ovrAt(x, x.pos) <= p.ca + 2);
  rivals.forEach(x => { const tough = ['Determined', 'Professional'].includes(x.pers); x.mor = clamp(x.mor - (tough ? 1 : 4), 0, 100); });
  if (rivals.length) out.push(`${rivals.map(pname).join(', ')} ${rivals.length > 1 ? 'are' : 'is'} worried about ${rivals.length > 1 ? 'their places' : 'his place'}.`);
  const mates = squad.filter(x => x.nat === p.nat);
  mates.forEach(x => { x.mor = clamp(x.mor + 3, 0, 100); });
  if (mates.length) out.push(`His compatriot${mates.length > 1 ? 's' : ''} ${mates.slice(0, 3).map(pname).join(', ')} ${mates.length > 1 ? 'are' : 'is'} pleased.`);
  const top = Math.max(0, ...squad.map(x => x.wage));
  if (wage > top * 1.25) {
    const senior = squad.filter(x => x.wage >= top * 0.7 && (x.pers === 'Ambitious' || x.ca >= p.ca - 2));
    senior.forEach(x => { x.mor = clamp(x.mor - 3, 0, 100); });
    if (senior.length) out.push(`${senior.slice(0, 3).map(pname).join(', ')} want${senior.length > 1 ? '' : 's'} to know why he earns so much more.`);
  }
  if (out.length) addNews('club', `Dressing room reacts to ${pname(p)}`, out.join(' '), { t: 'player', pid: p.id });
  return out;
}
// Selling: a key player or a leader leaving hits the squad and the fans.
function saleMood(p, toId) {
  const squad = seniorSquad(G.club), key = p.status === 'Key player' || p.at[A.ldr] >= 15;
  if (!key) return null;
  squad.forEach(x => { x.mor = clamp(x.mor - 3, 0, 100); });
  const rival = G.clubs[toId] && G.clubs[toId].pl;
  G.board.fans = clamp(G.board.fans - (rival ? 4 : 2), 0, 100);
  addNews('club', `Squad unsettled by ${pname(p)}'s exit`, `Losing ${fullName(p)}${rival ? ' to a league rival' : ''} has hit the dressing room${rival ? ' and angered the fans' : ''}.`);
  return true;
}
const unsetLabel = p => (p.treq ? 'Has asked to leave' : p.unset ? `${p.unset.lvl >= 2 ? 'Unsettled' : 'Distracted'} by ${clubName(p.unset.to)} interest` : '');
