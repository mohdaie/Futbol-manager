'use strict';
/* Temporary player registrations. The player record remains the source of truth so loans
   survive saves, job changes and season rollover without a separate ownership database. */
function activeLoan(p) { return p?.loan && G.clubs[p.loan.parent] && G.clubs[p.loan.host] ? p.loan : null; }
function loanWageForClub(c) {
  let total = 0;
  Object.values(G.players).forEach(p => {
    const l = activeLoan(p); if (!l) return;
    const share = clamp(+l.wageShare || 0, 0, 100) / 100;
    if (l.parent === c) total += Math.round(p.wage * (1 - share));
    if (l.host === c && p.club === c) total += Math.round(p.wage * share);
  });
  return total;
}
function loanOffer(pid, hostId, raw) {
  const existing = activeDeal(pid);
  if (existing && (existing.loanTerms || !['review', 'meeting'].includes(existing.stage))) return { error: 'There is already a deal in progress for this player. Open Transfers > Deals to review it.' };
  const checked = validateLoan(pid, hostId, raw);
  if (checked.error) return checked;
  if (existing) closeDeal(existing, false, 'Replaced by a loan approach.', false);
  const p = G.players[pid];
  const d = { id: G.nextId++, dir: p.club === G.club ? 'out' : 'in', pid, from: p.club, to: hostId, loanTerms: checked.terms, fee: checked.terms.fee, stage: 'interest', next: wait(1, 2), opened: true, log: [], created: today().getTime(), round: 0 };
  G.deals.unshift(d);
  dealLog(d, `Loan proposal submitted: ${loanDealSummary(d)}.`, 'you');
  dealNews(d, `Loan talks: ${pname(p)}`, 'The Director of Football will seek club and player agreement, then arrange a medical. You make the final decision.', false);
  return { ok: true, deal: d, msg: 'Loan proposal sent. Talks are now in progress.' };
}
function validateLoan(pid, hostId, raw) {
  const p = G.players[pid], parent = p && G.clubs[p.club], host = G.clubs[hostId];
  if (!p || !parent || !host || parent.id === host.id || parent.fa || parent.backgroundOnly || host.backgroundOnly) return { error: 'That player or club is unavailable for a loan.' };
  if (!inWindow()) return { error: 'Loan deals can only be completed in a transfer window.' };
  if (activeLoan(p)) return { error: 'This player is already out on loan.' };
  if (p.club === G.club && host.id === G.club || p.club !== G.club && host.id !== G.club) return { error: 'Choose the other club in the loan.' };
  if (!squadSpace(host, p)) return { error: squadLimitMessage(host) };
  const maxTerm = Math.min(38, (p.con - G.season) * 38 - (G.week || 0));
  if (maxTerm < 8) return { error: 'The player’s parent-club contract does not cover a minimum loan term.' };
  const duration = clamp(Math.round(+raw.duration || 26), 8, maxTerm), fee = Math.max(0, Math.round(+raw.fee || 0));
  const wageShare = clamp(Math.round(+(raw.wageShare ?? 100)), 0, 100);
  const optionFee = Math.max(0, Math.round(+raw.optionFee || 0));
  const obligationApps = clamp(Math.round(+raw.obligationApps || 0), 0, 50);
  const recall = !!raw.recall;
  if (!optionFee && obligationApps) return { error: 'An appearance obligation needs a purchase fee.' };
  if (host.id === G.club && fee > G.fin.tb) return { error: `The loan fee exceeds your transfer budget of ${money(G.fin.tb)}.` };
  if (host.id !== G.club && host.bal < fee) return { error: `${host.name} cannot cover the agreed loan fee.` };
  const wageCost = Math.round(p.wage * wageShare / 100), bill = clubWageBill(host) + wageCost;
  if (host.id === G.club && bill > G.fin.wb) return { error: `The loan wage share exceeds your wage budget of ${wageFmt(G.fin.wb)}.` };
  const existing = Object.values(G.players).filter(q => activeLoan(q) && q.loan.parent === parent.id && q.loan.host === host.id).length;
  if (existing >= 3) return { error: 'A club can loan at most three players to or from the same club at once.' };
  const outgoingOver21 = Object.values(G.players).filter(q => q.age > 21 && activeLoan(q) && q.loan.parent === parent.id).length;
  const incomingOver21 = Object.values(G.players).filter(q => q.age > 21 && activeLoan(q) && q.loan.host === host.id).length;
  if (p.age > 21 && (outgoingOver21 >= 6 || incomingOver21 >= 6)) return { error: 'A club in this agreement has reached the six-player loan limit for players over 21.' };
  return { terms: { duration, fee, wageShare, optionFee, obligationApps, recall } };
}
function loanDealSummary(d) {
  const t = d.loanTerms;
  return `${t.duration}-week loan · fee ${money(t.fee)} · ${clubName(d.to)} pay ${t.wageShare}% of wages${t.optionFee ? ` · ${t.obligationApps ? 'obligation' : 'option'} to buy for ${money(t.optionFee)}${t.obligationApps ? ` after ${t.obligationApps} appearances` : ''}` : ''}${t.recall ? ' · recall allowed' : ''}`;
}
function loanDealTick(d, p) {
  if (activeLoan(p)) return closeDeal(d, false, 'The player has already joined another club on loan.');
  const other = G.clubs[d.dir === 'in' ? d.from : d.to];
  if (d.stage === 'interest') {
    dealLog(d, `${TheClub(other)} are considering the loan proposal.`, 'club');
    d.stage = 'bid'; d.next = wait(1, 2); return;
  }
  if (d.stage === 'bid') {
    const t = d.loanTerms, feeScore = t.fee / Math.max(1, pValue(p) * .12);
    const score = .35 + Math.min(.3, feeScore * .08) + t.wageShare / 100 * .2 + (p.age <= 22 ? .12 : 0);
    if (!d.loanAgreed && hash01(d.id + ':loan') >= clamp(score, .2, .9)) {
      const fee = d.dir === 'in' ? Math.max(t.fee, Math.round(pValue(p) * .12)) : Math.round(t.fee * .75);
      const wageShare = d.dir === 'in' ? Math.min(100, t.wageShare + 25) : Math.max(0, t.wageShare - 25);
      return needDecision(d, 'loancounter', `Loan counteroffer: ${pname(p)}`, `${other.name} propose a ${money(fee)} loan fee and ${wageShare}% wage contribution from ${clubName(d.to)}.`, { terms: { ...t, fee, wageShare } });
    }
    dealLog(d, `The clubs agree: ${loanDealSummary(d)}.`, 'club');
    d.stage = 'player'; d.next = wait(1, 3); return;
  }
  if (d.stage === 'player') {
    const host = G.clubs[d.to], parent = G.clubs[d.from];
    const will = d.dir === 'in' ? willOf(p, d) : (host.rep >= parent.rep - 6 || p.listed ? 'open' : 'hesitant');
    if (will === 'refuses' || will === 'hesitant' && hash01(d.id + ':loanplayer') < .4) return closeDeal(d, false, `${fullName(p)} has turned down the loan move.`);
    dealLog(d, `${fullName(p)} agrees to the loan move.`, 'player');
    d.stage = 'medical'; d.next = wait(1, 2); return;
  }
  if (d.stage === 'medical') {
    if (p.inj && p.inj.w >= 6) return closeDeal(d, false, `${fullName(p)} failed his medical (${p.inj.n}).`);
    dealLog(d, 'Medical passed.', 'medical'); d.stage = 'final';
    needDecision(d, 'finalloan', `Ready to loan: ${pname(p)}`, `${loanDealSummary(d)}. Complete the loan or pull out.`);
  }
}
function completeLoan(d) {
  if (!d || d.closed || d.stage !== 'final' || d.need?.k !== 'finalloan') return { error: 'The loan is not ready to complete.' };
  const p = G.players[d.pid];
  if (!p || p.club !== d.from) return { error: 'The player is no longer at the parent club.' };
  const checked = validateLoan(p.id, d.to, d.loanTerms);
  if (checked.error) return checked;
  const parent = G.clubs[d.from], host = G.clubs[d.to];
  const { duration, fee, wageShare, optionFee, obligationApps, recall } = checked.terms;
  const start = today().getTime(), endDate = new Date(start); endDate.setDate(endDate.getDate() + duration * 7);
  const from = parent.id, wage = p.wage, con = p.con, level = p.lvl;
  if (fee) {
    parent.bal += fee;
    host.bal -= fee;
    if (from === G.club) { G.ledger.sales += fee; G.fin.tb += Math.round(fee * .5); }
    if (host.id === G.club) { G.ledger.buys += fee; G.fin.tb = Math.max(0, G.fin.tb - fee); }
  }
  p.loan = { parent: from, host: host.id, start, end: endDate.getTime(), duration, fee, wageShare, parentWage: wage, parentContract: con, parentLevel: level, recall, optionFee, obligationApps, appsAtStart: p.st?.a || 0, clauseDone: false };
  moveClub(p, host.id); p.loan.host = host.id; p.wage = wage; p.con = con;
  addNews('transfer', `${fullName(p)} joins ${host.name} on loan`, `${fullName(p)} joins on a ${duration}-week loan. ${fee ? `${money(fee)} loan fee; ` : ''}${host.name} cover ${wageShare}% of his wages.${optionFee ? ` ${obligationApps ? `Obligation to buy for ${money(optionFee)} after ${obligationApps} appearances.` : `Option to buy for ${money(optionFee)}.`}` : ''}${recall ? ' The parent club can recall him in a transfer window.' : ''}`);
  G.tHist.unshift({ date: start, pid: p.id, name: fullName(p), from, to: host.id, fee, loan: true, end: p.loan.end });
  if (G.tHist.length > 120) G.tHist.length = 120;
  closeDeal(d, true, `${fullName(p)} joins ${host.name} on loan: ${loanDealSummary(d)}.`, false);
  saveGame(); return { ok: true, msg: `${fullName(p)} joins ${host.name} on loan.` };
}
function endLoan(p, reason = 'loan expired', convert = false) {
  const l = activeLoan(p); if (!l) return false;
  const host = G.clubs[l.host], parent = G.clubs[l.parent];
  if (convert) {
    const fee = l.optionFee;
    if (!fee || !host || host.bal < fee && !l.obligationApps || host.id === G.club && G.fin.tb < fee && !l.obligationApps) return false;
    const permanentWage = Math.max(p.wage, wageFor(p, host.rep));
    if (host.id === G.club && clubWageBill(host) - Math.round(p.wage * l.wageShare / 100) + permanentWage > G.fin.wb && !l.obligationApps) return false;
    host.bal -= fee; parent.bal += fee;
    if (host.id === G.club) { G.fin.tb = Math.max(0, G.fin.tb - fee); G.ledger.buys += fee; }
    if (parent.id === G.club) { G.fin.tb += Math.round(fee * .5); G.ledger.sales += fee; }
    G.tHist.unshift({ date: today().getTime(), pid: p.id, name: fullName(p), from: parent.id, to: host.id, fee, loanPurchase: true });
    if (G.tHist.length > 120) G.tHist.length = 120;
    delete p.loan; moveClub(p, host.id); p.wage = permanentWage; p.con = G.season + 3;
    addNews('transfer', `${fullName(p)} signs permanently for ${host.name}`, `The loan purchase clause is completed for ${money(fee)}.`);
    return true;
  }
  if (!parent || !host) { delete p.loan; return false; }
  delete p.loan;
  if (squadSpace(parent, p)) moveClub(p, parent.id);
  else { // The parent must receive his player back even if it filled the temporary vacancy.
    removeFromClub(p); p.club = parent.id; p.lvl = l.parentLevel; parent.squad.push(p.id); assignNumber(parent, p); p.listed = false;
  }
  p.wage = l.parentWage; p.con = l.parentContract; p.lvl = l.parentLevel;
  addNews('transfer', `${fullName(p)} returns to ${parent.name}`, `${fullName(p)} returns from ${host.name}: ${reason}.`);
  return true;
}
function processLoans() {
  Object.values(G.players).forEach(p => {
    const l = activeLoan(p); if (!l) return;
    const apps = l.apps || 0;
    if (l.optionFee && l.obligationApps && apps >= l.obligationApps) l.clauseTriggered = true;
    if (l.clauseTriggered && !l.clauseDone && inWindow()) {
      l.clauseDone = true;
      if (!endLoan(p, 'appearance-triggered purchase obligation', true)) addLog('club', `Purchase obligation triggered for ${pname(p)}`, `${clubName(l.host)} must complete the ${money(l.optionFee)} purchase.`);
    } else if (l.end <= today().getTime() && !(l.clauseTriggered && !l.clauseDone)) endLoan(p);
  });
}
function recallLoan(pid) {
  const p = G.players[pid], l = activeLoan(p);
  if (!l || l.parent !== G.club || !l.recall) return { error: 'This loan has no recall clause for your club.' };
  if (!inWindow()) return { error: 'A player can only be recalled during a transfer window.' };
  endLoan(p, 'recalled by the parent club'); saveGame(); return { ok: true };
}
