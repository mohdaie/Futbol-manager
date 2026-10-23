'use strict';
/* ===== deals.js =====
   Transfers as deals that take time, run by the Director of Football (DoF) with the manager.
   Signing (dir 'in'): review (DoF memo on a fully scouted player) -> meeting (manager: proceed, monitor or drop,
   with an approach and limits) -> interest (the selling club and the agent are sounded out) -> bid (rounds of
   offers; the DoF negotiates up to the fee limit) -> agent (agent's fee) -> terms (wage, years, role, release
   clause, signing bonus) -> player (does he want the move?) -> medical -> final (the manager completes or pulls out).
   Selling (dir 'out'): offer (manager accepts, counters or rejects) -> terms -> player -> medical -> final.
   Computer clubs (dir 'ai') take days too and can collapse, and can hijack your targets.
   Each step waits a few days (d.next, absolute day). Decisions the manager must make are d.need, with a news item.
   Bids and later stages need an open window; if it shuts mid-deal, the deal collapses. */

const DEAL_STAGES = {
  in: [['review', 'Review'], ['meeting', 'Meeting'], ['interest', 'Interest'], ['bid', 'Bid'], ['agent', 'Agent'], ['terms', 'Terms'], ['player', 'Player'], ['medical', 'Medical'], ['final', 'Sign']],
  out: [['offer', 'Offer'], ['terms', 'Terms'], ['player', 'Player'], ['medical', 'Medical'], ['final', 'Sale']],
  ai: [['talks', 'Talks'], ['terms', 'Terms'], ['done', 'Done']],
};
const WINDOW_STAGES = ['bid', 'agent', 'terms', 'player', 'medical', 'final', 'offer', 'talks'];
const dofR = () => staffAvg('Director', 8);
const dealOpen = d => !d.closed;
const activeDeal = (pid, dir) => G.deals.find(d => dealOpen(d) && d.pid === pid && (!dir || d.dir === dir));
const wait = (a, b) => {
  const days = ri(a, b), pressure = typeof windowClosingPressure === 'function' ? windowClosingPressure() : 0;
  const rush = pressure ? 1 - pressure * 0.8 : 1;
  return dayAbs() + Math.ceil(days * rush);
};

function dealLog(d, txt, who = 'dof') {
  d.log.unshift({ date: today().getTime(), txt, who });
  d.log = d.log.slice(0, 40);
}
// A news item for the deal. Decisions and big moments stop the day-by-day calendar; progress does not.
function dealNews(d, title, body, loud) {
  addNews('transfer', title, body, { t: 'deal', id: d.id, pid: d.pid });
  if (!loud) G.news[0].q = 1;
}
function needDecision(d, k, title, body, extra = {}) {
  d.need = { k, ...extra }; d.next = null;
  dealNews(d, title, body, true);
}
function closeDeal(d, ok, why, loud = true) {
  if (!ok && (d.dir !== 'in' || d.pub || d.leaked || d.approach === 'open') && !['review', 'meeting'].includes(d.stage) && typeof dealMedia === 'function') dealMedia(d, 'off');
  d.closed = { ok, why, date: today().getTime() }; d.need = null; d.next = null;
  dealLog(d, why, ok ? 'done' : 'fail');
  if (d.dir !== 'ai') dealNews(d, (ok ? 'Done deal: ' : 'Deal off: ') + pname(G.players[d.pid]), why, loud);
}

/* ---------- the Director of Football's review ---------- */
// Finance, tactics and harmony from what the scouts know. A better DoF sees more and judges the fee closer.
function dofMemo(p) {
  const r = dofR(), me = userClub(), room = Math.max(0, G.fin.wb - clubWageBill(me)), k = knowOf(p);
  const err = 1 + (hash01(p.id + ':dof') - 0.5) * (20 - r) * 0.025;
  const est = p.club === 'FA' || G.clubs[p.club].fa ? 0 : roundMoney(askingPrice(p) * err), wage = roundWage(wageDemand(p, false) * (1 + (hash01(p.id + ':dw') - 0.5) * (20 - r) * 0.015));
  const years = p.age <= 27 ? 4 : p.age <= 30 ? 3 : 2, total = est + wage * 52 * years;
  const fin = [], tac = [], har = [];
  let fs = 0, ts = 0, hs = 0;
  if (!est) { fin.push(['good', 'No transfer fee: he is a free agent.']); fs += 1; }
  else if (est <= G.fin.tb) { fin.push(['good', `Fee about ${money(est)}, within your ${money(G.fin.tb)} budget.`]); fs += 1; }
  else { fin.push(['bad', `Fee about ${money(est)}: ${money(est - G.fin.tb)} over your budget.`]); fs -= 2; }
  if (wage <= room) { fin.push(['good', `Wants about ${wageFmt(wage)}; you have ${wageFmt(room)} of wage room.`]); fs += 1; }
  else { fin.push(['bad', `Wants about ${wageFmt(wage)}, more than the ${wageFmt(room)} wage room left.`]); fs -= 1; }
  fin.push(['', `Total cost over ${years} years: about ${money(total)}.`]);
  const potUp = potKnown(p) && seenPot(p) > stars(p.ca) + 0.4;
  if (p.age <= 24 && potUp) { fin.push(['good', 'Good resale value: young, with room to improve.']); fs += 1; }
  else if (p.age >= 30) { fin.push(['warn', 'Little resale value at his age.']); fs -= est > 10e6 ? 1 : 0; }
  const fit = fileFit(p), gain = fit ? fit.est - fit.curV : 0;
  if (fit) {
    if (gain >= 3) { tac.push(['good', `Would start as ${POS_NAME[fit.pos].toLowerCase()} ahead of ${fit.cur ? pname(fit.cur) : 'nobody'} (about ${fit.est} against ${fit.curV}).`]); ts += 2; }
    else if (gain >= -2) { tac.push(['', `Level with ${fit.cur ? pname(fit.cur) : 'your current option'} as ${POS_NAME[fit.pos].toLowerCase()} (about ${fit.est} against ${fit.curV}): competition and depth.`]); ts += 1; }
    else { tac.push(['bad', `Would not start: ${fit.cur ? pname(fit.cur) : 'your current player'} is better (about ${fit.curV} against ${fit.est}).`]); ts -= 2; }
  }
  const needs = typeof teamNeeds === 'function' ? teamNeeds() : [];
  if (needs.some(n => n.pos === p.pos || p.alt.includes(n.pos))) { tac.push(['good', `Fills a need the staff have flagged at ${p.pos}.`]); ts += 1; }
  if (r >= 9) { const style = styleOf(G.tactics); if (style) tac.push(['', `Judged for your ${STYLES[style].n.toLowerCase()} set-up.`]); }
  const squad = seniorSquad(G.club), topWage = Math.max(0, ...squad.map(x => x.wage)), top = squad.find(x => x.wage === topWage);
  if (['Professional', 'Determined', 'Model Citizen'].includes(p.pers)) { har.push(['good', `${p.pers} character: sets a good example.`]); hs += 1; }
  else if (p.pers === 'Temperamental') { har.push(['bad', 'Temperamental: can unsettle the dressing room.']); hs -= 1; }
  else if (p.pers === 'Laid Back') har.push(['warn', 'Laid back: may need pushing in training.']);
  if (r >= 7 && top && wage > topWage * 1.25) { har.push(['bad', `Would earn far more than your top earner ${pname(top)} (${wageFmt(topWage)}): others may want more.`]); hs -= 1; }
  const mates = squad.filter(x => x.nat === p.nat).length;
  if (r >= 6 && mates) { har.push(['good', `${mates} ${natName(p.nat)} team-mate${mates > 1 ? 's' : ''} to help him settle.`]); hs += 0.5; }
  if (fit && fit.cur && gain >= 3 && fit.cur.status === 'Key player') har.push(['warn', `${pname(fit.cur)} is a key player and would lose his place: handle it carefully.`]);
  if (p.at[A.ldr] >= 15 && k >= 75) { har.push(['good', 'A leader in the dressing room.']); hs += 0.5; }
  if (!har.length) har.push(['', 'No specific dressing-room benefit or concern identified.']);
  const n = 2 + Math.floor(r / 5), score = fs + ts + hs, grade = scoutGrade(p);
  const verdict = grade === 'D' || score <= 0 || ts < 0 ? 'Drop' : score >= (typeof dofBar === 'function' ? dofBar() : 3) && fs >= 0 ? 'Proceed' : 'Monitor';
  const open = est ? roundMoney(est * (0.82 + r * 0.004)) : 0, max = est ? roundMoney(Math.min(Math.max(G.fin.tb, est), est * 1.12)) : 0;
  return { date: today().getTime(), r: Math.round(r), k, est, wage, years, fin: fin.slice(0, n + 1), tac: tac.slice(0, n), har: har.slice(0, n), score: r1(score), verdict, open, max, wmax: roundWage(Math.max(wage * 1.12, Math.min(room, wage * 1.2))) };
}
const DOF_SAYS = { Proceed: 'I recommend we move for him.', Monitor: 'Worth keeping an eye on, but not now.', Drop: 'I would not pursue him.' };

// A file reaching 90% goes to the DoF. Called from addKnowledge (scouting.js).
function dofQueue(p) {
  if (!G.deals || p.club === G.club || activeDeal(p.id, 'in')) return;
  if ((G.dofSeen || (G.dofSeen = {}))[p.id] === G.season) return;
  G.dofSeen[p.id] = G.season;
  startDeal(p, 'review');
}
function startDeal(p, stage = 'review', extra = {}) {
  if (!p || G.players[p.id] !== p || G.clubs[p.club]?.backgroundOnly) return null;
  const d = { id: G.nextId++, dir: 'in', pid: p.id, from: p.club, to: G.club, stage, next: wait(1, 2), log: [], created: today().getTime(), round: 0, ...extra };
  G.deals.unshift(d);
  scoutFile(p).folder = 'dof';
  dealLog(d, stage === 'review' ? `The file on ${fullName(p)} is ${knowOf(p)}% complete. The Director of Football is reviewing it.` : `You asked the Director of Football to go for ${fullName(p)}.`, 'you');
  return d;
}

/* ---------- each day ---------- */
function dealsDay() {
  if (!G.deals) return;
  G.deals.filter(dealOpen).forEach(d => dealTick(d));
  payAddOns();
  payTransferInstalments();
  G.deals = G.deals.filter(d => dealOpen(d) || today().getTime() - d.closed.date < 1000 * 3600 * 24 * 60).slice(0, 80);
}
// One deal: checks first (the player moved, the window shut), then its next step when it is due.
// force: deadline day, when deals move by the hour instead of waiting days.
function dealTick(d, force) {
  {
    const p = G.players[d.pid];
    if (!p) return closeDeal(d, false, 'The player has retired.', false);
    if (d.dir === 'in' && p.club === G.club) return closeDeal(d, true, `${fullName(p)} is already your player.`, false);
    if (d.dir !== 'out' && d.from !== p.club) return closeDeal(d, false, `${fullName(p)} has joined the ${clubName(p.club)} instead.`, d.dir === 'in');
    if (d.dir === 'out' && p.club !== G.club) return closeDeal(d, false, `${fullName(p)} is no longer at the club.`, false);
    const fa = G.clubs[d.from] && G.clubs[d.from].fa;
    if (!fa && d.opened && !inWindow() && WINDOW_STAGES.includes(d.stage)) return closeDeal(d, false, `The window shut before the deal for ${fullName(p)} was done.`, d.dir !== 'ai');
    if (d.need || d.next == null || (!force && dayAbs() < d.next)) return;
    if (!fa && WINDOW_STAGES.includes(d.stage) && !inWindow()) { d.next = dayAbs() + 1; return; } // talks resume when the window opens
    if (WINDOW_STAGES.includes(d.stage)) d.opened = true;
    (DEAL_STEP[d.dir][d.stage] || (() => {}))(d, p);
    if (force && dealOpen(d) && d.next != null) d.next = dayAbs(); // still moving by the hour
  }
}

// The player's attitude to joining you: keen, open, hesitant or refuses (worked out once per deal).
function willOf(p, d) {
  if (d.will) return d.will;
  const me = userClub(), from = G.clubs[p.club];
  let s = me.rep - p.ca + joinPull(p) + (from && !from.fa ? (me.rep - from.rep) * 0.4 : 4) + (p.mor < 45 ? 4 : 0) + (p.pers === 'Loyal' ? -3 : 0) + (p.pers === 'Ambitious' ? (me.rep >= (from ? from.rep : 0) ? 2 : -3) : 0);
  if (d.status === 'Key player') s += 3;
  s += agentRel(agentOf(p)) / 6; // an agent who likes your club talks his client into it
  if (d.pub) s += 2; // public interest flatters him
  return (d.will = s > 6 ? 'keen' : s > -2 ? 'open' : s > -9 ? 'hesitant' : 'refuses');
}
const WILL_TXT = { keen: 'is keen on the move', open: 'is open to the move', hesitant: 'is hesitant', refuses: 'does not want to join' };

const DEAL_STEP = {
  in: {
    review(d, p) {
      d.memo = dofMemo(p);
      d.stage = 'meeting';
      dealLog(d, `Memo: ${d.memo.verdict}. ${DOF_SAYS[d.memo.verdict]}`);
      if (typeof dofSecondOpinion === 'function') dofSecondOpinion(d);
      needDecision(d, 'meeting', `Director of Football: ${fullName(p)}`, `${DOF_SAYS[d.memo.verdict]} His memo covers finance, tactics and harmony. Meet him to decide: proceed, monitor or drop.`);
    },
    interest(d, p) {
      const c = G.clubs[p.club], fa = c.fa, will = willOf(p, d);
      if (will === 'refuses') return closeDeal(d, false, `${agentOf(p) ? agentOf(p).name : 'His agent'} says ${fullName(p)} does not want to join the ${userClub().name}.`);
      dealLog(d, `${agentOf(p) ? agentOf(p).name + ', his agent' : 'His agent'}: ${fullName(p)} ${WILL_TXT[will]}.`, 'agent');
      if (fa) { d.stage = 'agent'; d.next = wait(1, 2); return; }
      const buyBack = d.buyBackTriggered && activeBuyBack(p) && p.buyBack.price === d.buyBackTriggered.price;
      if (d.buyBackTriggered && !buyBack) return closeDeal(d, false, 'The buy-back right has expired or no longer applies.');
      const ask = buyBack ? p.buyBack.price : roundMoney(askingPrice(p) * (d.pub ? 1.05 : 1)), key = isKeyPlayer(p), long = p.con - G.season >= 3; // public interest raises the price
      d.ask = ask;
      if (!buyBack && key && long && c.rep >= userClub().rep && !p.listed) {
        dealLog(d, `The ${c.name}: he is not for sale.`, 'club');
        return needDecision(d, 'notforsale', `${pname(p)} not for sale`, `The ${c.name} say ${fullName(p)} is not for sale. Only a huge offer, about ${money(roundMoney(ask * 1.4))}, might change their mind.`, { fee: roundMoney(ask * 1.4) });
      }
      dealLog(d, `The ${c.name} would listen to offers around ${money(roundMoney(ask * (1 + (hash01(p.id + 'ask') - 0.5) * (20 - dofR()) * 0.02)))}.`, 'club');
      d.stage = 'bid';
      if (ask > (d.lim.fee + transferProposal(d).exchangeValue) * 1.15) return needDecision(d, 'bidlimit', `${pname(p)}: price above your limit`, `The ${c.name} value ${fullName(p)} at about ${money(ask)}. Your limit is ${money(d.lim.fee)}. Raise it, or walk away.`, { fee: ask });
      d.fee = buyBack ? ask : Math.min(d.lim.fee, Math.max(0, (d.memo && d.memo.open ? d.memo.open : roundMoney(ask * 0.85)) - transferProposal(d).exchangeValue));
      d.next = wait(0, 1);
    },
    bid(d, p) {
      const c = G.clubs[p.club], ask = d.ask || askingPrice(p);
      if (d.bidOut) { // the selling club answers
        d.bidOut = false; d.round++;
        const review = reviewTransferPackage(d);
        if (!review.ok) return needDecision(d, 'package', 'Transfer package rejected', review.reason, {reason:review.reason});
        const value = transferOfferValue(d), need = ask * (c.bal < 0 ? 0.9 : 1);
        // A borderline offer: the AI's answer for the selling club, if it is back in time.
        const ai = d.ai && d.ai.club && d.ai.club.fee === d.fee && value >= need * 0.88 && value < need * 1.05 ? aiAnswer(d, 'club') : null;
        if (!d.buyBackTriggered && ai === 'Reject') return closeDeal(d, false, `The ${c.name} reject the offer and end talks over ${fullName(p)}.`);
        if (d.buyBackTriggered && activeBuyBack(p) && d.fee >= ask || ai === 'Accept' || (value >= need && ai !== 'Counter')) {
          approveTransferPackage(d);
          dealLog(d, `The ${c.name} accept ${money(d.fee)}${d.add ? ' plus ' + money(d.add) + ' in add-ons' : ''}${transferProposal(d).years ? ', with agreed instalments' : ''}.`, 'club');
          dealNews(d, `Fee agreed for ${pname(p)}`, `The ${c.name} accept ${money(d.fee)} for ${fullName(p)}. Next: talks with his agent.`);
          if (d.pub || d.leaked) dealMedia(d, 'agreed');
          d.stage = 'agent'; d.next = wait(1, 3); return;
        }
        if (d.round >= 4 || value < ask * 0.6) return closeDeal(d, false, `The ${c.name} end talks over ${fullName(p)}.`);
        const cashAsk = Math.max(0, ask - transferProposal(d).exchangeValue);
        const counter = roundMoney(d.round === 1 ? cashAsk * 1.05 : Math.max(cashAsk, (d.counter || cashAsk) * 0.97));
        d.counter = counter;
        dealLog(d, `The ${c.name} reject ${money(d.fee)} and want ${money(counter)}.`, 'club');
        if (counter > d.lim.fee) return needDecision(d, 'bidlimit', `${pname(p)}: they want ${money(counter)}`, `The ${c.name} want ${money(counter)} for ${fullName(p)}, above your limit of ${money(d.lim.fee)}.`, { fee: counter });
        d.fee = roundMoney(Math.min(d.lim.fee, d.fee + (counter - d.fee) * (0.55 + dofR() * 0.01)));
        d.next = wait(1, 2); return;
      }
      // The DoF shapes the offer: add-ons for a player with room to grow, instalments for a big fee.
      if (d.add == null) d.add = potKnown(p) && p.age <= 24 && seenPot(p) > stars(p.ca) + 0.4 ? roundMoney(d.fee * 0.12) : 0;
      // Payment terms are chosen by the manager, never silently added by the DoF.
      { const v = transferOfferValue(d); if (typeof askClubAnswer === 'function' && v >= ask * 0.88 && v < ask * 1.05) askClubAnswer(d, ask); }
      dealLog(d, `Offer sent: ${transferPackageSummary(d)}${d.add ? ' + ' + money(d.add) + ' add-ons' : ''}.`);
      d.bidOut = true; d.next = wait(1, 3);
    },
    agent(d, p) {
      const packageReview = reviewTransferPackage(d);
      if (!packageReview.ok) return needDecision(d, 'package', 'Agent queries the transfer package', packageReview.reason, {reason:packageReview.reason});
      approveTransferPackage(d);
      dealLog(d, 'The clubs and affected agents approve the payment schedule, exchange and former-club rights.', 'agent');
      const fa = G.clubs[p.club].fa, ag = agentOf(p), pct = agentFeePct(ag);
      d.agentFee = fa ? roundMoney(wageDemand(p, false) * 12) : roundMoney(d.fee * pct / 100);
      d.bonus = roundMoney(wageDemand(p, false) * (fa ? 20 : 8));
      const who = ag ? ag.name : `${pname(p)}'s agent`;
      if (!fa && pct > 8) return needDecision(d, 'agentfee', `${who} wants ${money(d.agentFee)}`, `${who}${ag ? ' (' + ag.agency + ')' : ''} asks for ${pct}% of the fee (${money(d.agentFee)}) to complete the deal. Pay it, or walk away.`);
      dealLog(d, `${who}'s fee agreed: ${money(d.agentFee)} (${fa ? 'free transfer' : pct + '%'}).`, 'agent');
      d.stage = 'terms'; d.next = wait(1, 3);
    },
    terms(d, p) {
      const will = willOf(p, d), fit = fileFit(p);
      const demand = roundWage(wageDemand(p, false) * { keen: 0.95, open: 1, hesitant: 1.12 }[will] * agentWageMul(agentOf(p)));
      d.years = d.years || (p.age <= 27 ? (p.age <= 23 ? 5 : 4) : p.age <= 30 ? 3 : 2);
      d.status = d.status || (fit && fit.est >= fit.curV + 2 ? 'Key player' : fit && fit.est >= fit.curV - 2 ? 'First team' : 'Rotation');
      if (p.pers === 'Ambitious' || will === 'hesitant') d.clause = d.clause || roundMoney(Math.max(pValue(p) * 2, (d.fee || 0) * 1.8));
      const room = G.fin.wb - clubWageBill(userClub()) + (transferExchange(d)?.wage || 0);
      if (demand > d.lim.wage || demand > room) return needDecision(d, 'wagelimit', `${pname(p)} wants ${wageFmt(demand)}`, `${fullName(p)} asks for ${wageFmt(demand)} a week${demand > room ? `, more than the ${wageFmt(Math.max(0, room))} left in your wage budget` : `, above your limit of ${wageFmt(d.lim.wage)}`}.`, { wage: demand });
      d.wage = demand;
      dealLog(d, `Personal terms agreed: ${wageFmt(d.wage)} a week for ${d.years} years, ${d.status.toLowerCase()}${d.clause ? ', release clause ' + money(d.clause) : ''}, signing bonus ${money(d.bonus)}.`, 'agent');
      d.stage = 'player'; d.next = wait(will === 'keen' ? 0 : 1, will === 'hesitant' ? 4 : 2);
      if (will !== 'keen' && typeof askPlayerDecision === 'function') askPlayerDecision(d);
    },
    player(d, p) {
      const will = willOf(p, d), ai = typeof aiAnswer === 'function' ? aiAnswer(d, 'player') : null;
      if (ai === 'Stay') return closeDeal(d, false, `${fullName(p)} has decided to stay where he is.`);
      if (ai !== 'Join' && will === 'hesitant' && hash01(d.id + 'yes') < 0.4) return closeDeal(d, false, `${fullName(p)} has decided to stay where he is.`);
      dealLog(d, `${fullName(p)} says yes to the move.`, 'player');
      d.stage = 'medical'; d.next = wait(1, 2);
    },
    medical(d, p) {
      if (p.inj && p.inj.w >= 6) return closeDeal(d, false, `${fullName(p)} failed his medical (${p.inj.n}).`);
      dealLog(d, p.inj ? `Medical passed with a note: ${p.inj.n}.` : 'Medical passed.', 'medical');
      d.stage = 'final';
      if (d.pub || d.leaked) dealMedia(d, 'here');
      needDecision(d, 'final', `Ready to sign ${pname(p)}`, `Everything is agreed for ${fullName(p)}: ${dealSummary(d)}. Complete the transfer or pull out.`);
    },
  },
  out: {
    terms(d, p) {
      const review = reviewTransferPackage(d);
      if (!review.ok) return needDecision(d, 'package', 'Transfer package rejected', review.reason, {reason:review.reason});
      approveTransferPackage(d);
      const buyer = G.clubs[d.to];
      d.will = buyer.rep >= userClub().rep + 3 || p.listed || p.mor < 40 ? 'keen' : buyer.rep >= userClub().rep - 6 ? 'open' : p.pers === 'Loyal' ? 'refuses' : 'hesitant';
      dealLog(d, `${fullName(p)} is talking to the ${buyer.name}: he ${WILL_TXT[d.will]}.`, 'player');
      d.stage = 'player'; d.next = wait(1, 3);
    },
    player(d, p) {
      if (d.will === 'refuses' || (d.will === 'hesitant' && hash01(d.id + 'stay') < 0.5)) { p.mor = clamp(p.mor + 4, 0, 100); return closeDeal(d, false, `${fullName(p)} has turned down the ${clubName(d.to)} and wants to stay.`); }
      dealLog(d, `${fullName(p)} has agreed terms with the ${clubName(d.to)}.`, 'player');
      d.stage = 'medical'; d.next = wait(1, 2);
    },
    medical(d, p) {
      if (p.inj && p.inj.w >= 6) return closeDeal(d, false, `${fullName(p)} failed his medical at the ${clubName(d.to)}.`);
      dealLog(d, 'Medical passed.', 'medical');
      d.stage = 'final';
      needDecision(d, 'finalout', `Sale of ${pname(p)} ready`, `The ${clubName(d.to)} are ready to sign ${fullName(p)} for ${money(d.fee)}. Sanction the sale or block it.`);
    },
    offer(d, p) { // the buyer answers your counter
      const review = reviewTransferPackage(d);
      if (!review.ok) return needDecision(d, 'package', 'Transfer package rejected', review.reason, {reason:review.reason});
      const val = pValue(p);
      if (d.fee + transferProposal(d).exchangeValue <= val * 1.45 && hash01(d.id + 'c' + d.round) < 0.65) { dealLog(d, `The ${clubName(d.to)} agree to ${money(d.fee)}.`, 'club'); d.stage = 'terms'; d.next = wait(1, 2); dealNews(d, `${clubName(d.to)} meet your price`, `The ${clubName(d.to)} agree to pay ${money(d.fee)} for ${fullName(p)}. He will now talk to them.`); return; }
      closeDeal(d, false, `The ${clubName(d.to)} walk away from the deal for ${fullName(p)}.`);
    },
  },
  ai: {
    talks(d, p) {
      if (hash01(d.id + 'a') < 0.14) return closeDeal(d, false, 'Talks broke down.', false);
      d.stage = 'terms'; d.next = wait(1, 4);
      dealMedia(d, 'agreed');
      const hit = activeDeal(p.id, 'in');
      if (hit && hit.stage !== 'review' && hit.stage !== 'meeting') dealLog(hit, `The ${clubName(d.to)} have agreed a fee too. Move fast.`, 'club');
    },
    terms(d, p) {
      if (hash01(d.id + 'b') < 0.1) return closeDeal(d, false, 'The player turned the move down.', false);
      const c = G.clubs[d.to], from = G.clubs[p.club], fee = from.fa ? 0 : d.fee;
      if (!squadSpace(c, p)) return closeDeal(d, false, squadLimitMessage(c), false);
      settleTransferFee(p, c.id, fee);
      moveClub(p, c.id);
      p.wage = wageFor(p, c.rep); p.con = G.season + ri(2, 5);
      G.tHist.unshift({ date: today().getTime(), pid: p.id, name: fullName(p), from: from.id, to: c.id, fee });
      if (G.tHist.length > 120) G.tHist.length = 120;
      closeDeal(d, true, 'Done.', false);
      dealMedia(d, 'here'); dealMedia(d, 'done');
      if (fee >= 15e6 || from.pl) { addNews('transfer', `${fullName(p)} joins the ${c.name}`, `The ${c.name} sign ${fullName(p)} (${p.age}, ${p.pos}) from ${from.fa ? 'free agency' : 'the ' + from.name}${fee ? ' for ' + money(fee) : ''}.`); G.news[0].q = 1; }
    },
  },
};
DEAL_STEP.in.meeting = () => {};
DEAL_STEP.in.final = () => {};
DEAL_STEP.out.final = () => {};

function dealSummary(d) {
  const t = [];
  if (d.fee || d.proposal) t.push(transferPackageSummary(d) + (d.add ? ` + ${money(d.add)} add-ons` : ''));
  if (d.agentFee) t.push(`agent ${money(d.agentFee)}`);
  if (d.wage) t.push(`${wageFmt(d.wage)} for ${d.years} years`);
  if (d.bonus) t.push(`signing bonus ${money(d.bonus)}`);
  if (d.clause) t.push(`release clause ${money(d.clause)}`);
  return t.join(', ');
}

/* ---------- the manager's decisions ---------- */
// Meeting: proceed (approach 'open' or 'quiet', with fee and wage limits), monitor or drop.
function dealProceed(d, approach, feeLim, wageLim, proposal) {
  const p = G.players[d.pid];
  d.fee = feeLim;
  const proposalError = setTransferProposal(d, proposal || TRANSFER_TERMS_DEFAULT);
  if (proposalError) return proposalError;
  d.lim = { fee: feeLim, wage: wageLim }; d.approach = approach; d.need = null;
  if (typeof logDof === 'function') logDof(d, 'proceed');
  d.stage = 'interest'; d.next = approach === 'open' ? wait(1, 2) : wait(2, 4);
  dealLog(d, `You and the Director of Football agree to go for ${fullName(p)}: ${{ open: 'an open approach to his club', quiet: 'quiet talks with his agent first', leak: 'interest leaked to the press first' }[approach]}. Limits: ${money(feeLim)}, ${wageFmt(wageLim)} a week.`, 'you');
  if (approach !== 'quiet') d.pub = true;
  if (typeof dealMedia === 'function') { if (approach === 'open') dealMedia(d, 'approach'); if (approach === 'leak') dealMedia(d, 'leak'); }
}
function dealMonitor(d) { if (typeof logDof === 'function') logDof(d, 'monitor'); closeDeal(d, false, 'Kept on file to monitor. The Director of Football will review him again if you ask.', false); const r = scoutFile(G.players[d.pid]); r.folder = 'mon'; }
function dealDrop(d) { if (typeof logDof === 'function') logDof(d, 'drop'); closeDeal(d, false, 'Dropped after the meeting.', false); const r = scoutFile(G.players[d.pid]); r.folder = 'rej'; }
function dealRaise(d, amount) {
  const p = G.players[d.pid];
  if (d.need.k === 'bidlimit' || d.need.k === 'notforsale') { d.lim.fee = Math.max(d.lim.fee, amount); d.fee = amount; d.stage = 'bid'; d.bidOut = false; if (d.need.k === 'notforsale') d.ask = amount; }
  if (d.need.k === 'wagelimit') { d.lim.wage = Math.max(d.lim.wage, amount); d.stage = 'terms'; }
  if (d.need.k === 'agentfee') { dealLog(d, `Agent's fee agreed: ${money(d.agentFee)}.`, 'you'); d.stage = 'terms'; agentRelMove(p, 3, 'Paid his fee in full'); }
  dealLog(d, d.need.k === 'agentfee' ? 'You agree to the agent\'s fee.' : `You raise the limit to ${d.need.k === 'wagelimit' ? wageFmt(amount) : money(amount)}.`, 'you');
  d.need = null; d.next = wait(0, 1);
  return `${pname(p)}: talks continue.`;
}
function dealWalk(d) {
  const late = ['agent', 'terms', 'player', 'medical', 'final'].includes(d.stage);
  if (late) agentRelMove(G.players[d.pid], d.stage === 'final' ? -10 : -5, d.stage === 'final' ? 'You pulled out at the last moment' : 'You walked away during talks');
  closeDeal(d, false, d.stage === 'final' ? 'You pulled out.' : 'You walked away from the deal.', false);
}

function completeIn(d) {
  const error = packageCompletionError(d); if (error) return error;
  const p = G.players[d.pid], me = userClub(), q = transferExchange(d), terms = transferProposal(d), from = G.clubs[p.club];
  const exchangeSellOn = q?.sellOn && q.sellOn.club !== q.club && G.clubs[q.sellOn.club] ? Math.round(terms.exchangeValue * q.sellOn.pct / 100) : 0;
  const cost = (d.fee || 0) + (d.agentFee || 0) + (d.bonus || 0) + Math.round(exchangeSellOn * .5);
  if (d.buyBackTriggered && (!activeBuyBack(p) || d.fee !== p.buyBack.price)) return 'The buy-back right is no longer valid at this price.';
  if (cost > G.fin.tb + 1) return 'Your transfer budget no longer covers the guaranteed cash fee and fees. Free funds in Finance or pull out.';
  if (clubWageBill(me) - (q?.wage || 0) + d.wage > G.fin.wb) return 'The wage budget no longer covers his wage. Raise it in Finance or pull out.';
  const exchangeFee = q ? Math.round(terms.exchangeValue * agentFeePct(agentOf(q)) / 100) : 0;
  if (q && from.bal + Math.round((d.fee || 0) * terms.upfrontPct / 100) < exchangeFee) return 'The selling club cannot fund the exchange agent fee.';
  // All checks precede either move. Free a swap slot first so two full Championship squads can exchange players.
  if (q) removeFromClub(q);
  completeSigning(p, d.fee || 0, d.wage, d.years + (G.week >= SEASON_WEEKS - 2 ? 1 : 0), d.status, terms);
  if (q) completeExchangePlayer(q, from, terms.exchangeValue, exchangeFee);
  const extra = (d.agentFee || 0) + (d.bonus || 0);
  me.bal -= extra; G.fin.tb = Math.max(0, G.fin.tb - extra); G.ledger.buys += extra;
  if (d.clause) p.rc = d.clause;
  if (d.add) G.addOns.push({ pid: p.id, to: from.id, amount: d.add, apps: 25 });
  agentRelMove(p, 8, `Completed ${fullName(p)}'s move`);
  signingMood(p, d.fee || 0, d.wage);dealMedia(d, 'done');
  closeDeal(d, true, `${fullName(p)} has signed: ${dealSummary(d)}.`, false);
  return `${fullName(p)} signs for the ${me.name}.`;
}
function completeExchangePlayer(q, to, value, agentFee) {
  const from = q.club, wage = Math.max(q.wage, wageFor(q, to.rep));
  // Zero cash consideration on this leg; its agreed non-cash value still counts for an existing sell-on.
  settleTransferFee(q, to.id, 0, TRANSFER_TERMS_DEFAULT, value);
  moveClub(q, to.id);q.wage = wage;q.con = G.season + 3;q.status = 'First team';
  to.bal -= agentFee;if(to.id === G.club){G.fin.tb = Math.max(0, G.fin.tb - agentFee);G.ledger.buys += agentFee;G.know[q.id]=100;}
  G.tHist.unshift({date:today().getTime(),pid:q.id,name:fullName(q),from,to:to.id,fee:0,exchangeValue:value});
  agentRelMove(q, 4, 'Agreed player exchange');
}
function completeOut(d) {
  const error = packageCompletionError(d); if (error) return error;
  const p = G.players[d.pid], buyer = G.clubs[d.to], q = transferExchange(d), terms = transferProposal(d);
  if(d.buyBackTriggered && (!activeBuyBack(p,buyer.id) || d.fee!==p.buyBack.price))return 'The buyer’s buy-back right is no longer valid.';
  const exchangeFee = q ? Math.round(terms.exchangeValue * agentFeePct(agentOf(q)) / 100) : 0;
  if (q && (clubWageBill(userClub()) - p.wage + Math.max(q.wage,wageFor(q,userClub().rep)) > G.fin.wb || exchangeFee > G.fin.tb)) return 'Your budgets cannot support the exchange player wage and agent fee.';
  if (buyer.bal < Math.round(d.fee * terms.upfrontPct / 100)) return 'The buyer no longer has the cash needed upfront.';
  saleMood(p, d.to);if(q)removeFromClub(q);
  sellPlayer(p, d.to, d.fee, terms);if(q)completeExchangePlayer(q, userClub(), terms.exchangeValue, exchangeFee);
  agentRelMove(p, 4, `Sanctioned ${fullName(p)}'s move`);dealMedia(d, 'here');dealMedia(d, 'done');
  closeDeal(d, true, `${fullName(p)} has joined the ${clubName(d.to)}: ${dealSummary(d)}.`, false);
  return `${fullName(p)} sold for ${money(d.fee)}.`;
}
function blockOut(d) { const p = G.players[d.pid];if(d.buyBackTriggered && activeBuyBack(p,d.to))return 'The agreed buy-back right cannot be blocked by the selling club.'; agentRelMove(p, d.will === 'keen' ? -8 : -3, `Blocked ${fullName(p)}'s move`); p.mor = clamp(p.mor - (d.will === 'keen' ? 14 : 4), 0, 100); closeDeal(d, false, `You blocked the sale of ${fullName(p)}${d.will === 'keen' ? '. He is unhappy' : ''}.`, false); }

// Outgoing offer answers.
function answerOffer(d, choice) {
  const p = G.players[d.pid];
  d.need = null;
  if (choice === 'accept') {
    const review = reviewTransferPackage(d);
    if (!review.ok) { needDecision(d, 'package', 'Transfer package rejected', review.reason, {reason:review.reason}); return review.reason; }
    approveTransferPackage(d);
    dealMedia(d, 'agreed'); dealLog(d, `You accept ${money(d.fee)}.`, 'you'); d.stage = 'terms'; d.next = wait(1, 2); return `Offer accepted. ${pname(p)} will talk to the ${clubName(d.to)}.`; }
  if (choice === 'counter') { d.round++; d.fee = roundMoney(d.fee * 1.2); dealLog(d, `You ask for ${money(d.fee)}.`, 'you'); d.next = wait(1, 2); return `You asked for ${money(d.fee)}. Waiting for the ${clubName(d.to)}.`; }
  p.mor = clamp(p.mor - (p.listed ? 0 : 3), 0, 100);
  closeDeal(d, false, `You rejected the offer from the ${clubName(d.to)}.`, false);
  return 'Offer rejected.';
}

/* ---------- add-ons, instalments, rumours ---------- */
function payAddOns() {
  if (!G.addOns || !G.addOns.length) return;
  G.addOns = G.addOns.filter(a => {
    const p = G.players[a.pid];
    if (!p || p.club !== G.club) return false;
    if (p.st.a < a.apps) return true;
    userClub().bal -= a.amount; G.ledger.buys += a.amount; if (G.clubs[a.to]) G.clubs[a.to].bal += a.amount;
    addNews('club', `Add-on paid for ${pname(p)}`, `${fullName(p)} has reached ${a.apps} appearances: ${money(a.amount)} paid to the ${clubName(a.to)}.`);
    return false;
  });
}
function payInstalments(seasonEnd = false) { payTransferInstalments(seasonEnd); }

/* ---------- computer clubs and bids for your players ---------- */
// A computer club starts a deal instead of signing at once.
function aiDeal(c, p, fee) {
  if (!squadSpace(c, p) || activeDeal(p.id, 'ai')) return;
  const d = { id: G.nextId++, dir: 'ai', pid: p.id, from: p.club, to: c.id, stage: 'talks', next: wait(2, 6), fee, log: [], created: today().getTime(), round: 0, opened: true };
  G.deals.unshift(d);
  dealLog(d, `The ${c.name} open talks for ${fullName(p)}.`, 'club');
  dealMedia(d, 'talks');
}
// A bid for one of your players starts a deal; a bid that meets his release clause cannot be refused.
function bidForUser(b, p, fee) {
  if (activeDeal(p.id, 'out')) return;
  const d = { id: G.nextId++, dir: 'out', pid: p.id, from: G.club, to: b.id, stage: 'offer', next: null, fee, initialFee: fee, log: [], created: today().getTime(), round: 0, opened: true };
  G.deals.unshift(d);
  if (activeBuyBack(p, b.id) && fee >= p.buyBack.price) {
    d.fee=p.buyBack.price;d.buyBackTriggered={...p.buyBack};dealLog(d, `The ${b.name} activate their agreed buy-back price of ${money(d.fee)}. The player must still agree.`, 'club');
    d.stage='terms';d.next=wait(1,2);return dealNews(d, `Buy-back activated: ${pname(p)}`, `${b.name} exercise their fixed-price right. Personal terms and medical still apply.`, true);
  }
  if (p.rc && fee >= p.rc) {
    dealLog(d, `The ${b.name} have met ${fullName(p)}'s release clause (${money(p.rc)}).`, 'club');
    d.stage = 'terms'; d.next = wait(1, 2);
    return dealNews(d, `Release clause met: ${pname(p)}`, `The ${b.name} have triggered ${fullName(p)}'s ${money(p.rc)} release clause. You cannot refuse; he is talking to them.`, true);
  }
  transferBuzz(p, b.id, true);
  const val = pValue(p), key = isKeyPlayer(p);
  const advice = fee >= val * 1.25 ? 'A strong offer. I would accept.' : key ? 'He is a key player. I would reject or ask for more.' : fee >= val * 0.95 ? 'A fair offer.' : 'Below his value. Ask for more.';
  dealLog(d, `The ${b.name} offer ${money(fee)} for ${fullName(p)} (valued at ${money(val)}). Director of Football: ${advice}`, 'club');
  if (hash01(d.id + 'pub') < 0.5) dealMedia(d, 'bid');
  needDecision(d, 'offer', `Bid for ${pname(p)}`, `The ${b.name} have offered ${money(fee)} for ${fullName(p)} (valued at ${money(val)}). Director of Football: ${advice}`);
}

// Older saves and new careers: the deal lists and a Director of Football.
function ensureDeals() {
  G.deals = G.deals || []; G.payments = G.payments || []; G.addOns = G.addOns || []; G.rumours = G.rumours || []; G.dofSeen = G.dofSeen || {};
  if (typeof ensureTransferFinance === 'function') ensureTransferFinance();
  if (G.staff && !staffOf('Director').length && G.clubs[G.club]) G.staff.push(genStaffMember('Director', G.clubs[G.club].rep));
}
