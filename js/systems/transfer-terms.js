'use strict';
// Negotiated transfer packages. Cash schedules are separate from non-cash exchange valuations.
const TRANSFER_TERMS_DEFAULT = { years: 0, upfrontPct: 100, exchangePid: 0, exchangeValue: 0, sellOnPct: 0, buyBackPrice: 0, buyBackYears: 2 };
function transferProposal(d) {
  return { ...TRANSFER_TERMS_DEFAULT, ...(d.proposal || (d.inst ? { years: d.inst, upfrontPct: 100 / (d.inst + 1) } : {})) };
}
function transferPackageKey(d) { return JSON.stringify([d.fee || 0, transferProposal(d)]); }
function transferParties(d) { return { buyer: G.clubs[d.to], seller: G.clubs[d.from], player: G.players[d.pid] }; }
function transferExchange(d) { return G.players[transferProposal(d).exchangePid] || null; }
function transferCapacity(c, incoming, outgoing) {
  return !!c && !c.backgroundOnly && (squadSpace(c, incoming) || outgoing?.club === c.id && c.squad.includes(outgoing.id));
}
function transferTermsError(d) {
  const t = transferProposal(d), { buyer, seller, player } = transferParties(d);
  if (!buyer || !seller || buyer.fa || buyer.backgroundOnly || seller.backgroundOnly || !player || player.club !== seller.id) return 'The clubs or player are no longer available for this transfer.';
  for (const k of ['years', 'upfrontPct', 'exchangePid', 'exchangeValue', 'sellOnPct', 'buyBackPrice', 'buyBackYears']) if (!Number.isFinite(t[k])) return 'Enter valid numbers for the transfer terms.';
  if (!Number.isFinite(d.fee || 0) || d.fee < 0 || d.fee > 1e10 || !Number.isInteger(t.exchangePid) || !Number.isInteger(t.exchangeValue) || !Number.isInteger(t.buyBackPrice) || !Number.isInteger(d.fee || 0) || !Number.isInteger(t.years) || t.years < 0 || t.years > 3 || t.upfrontPct < 25 || t.upfrontPct > 100 || t.sellOnPct < 0 || t.sellOnPct > 50 || t.buyBackPrice < 0 || t.buyBackPrice > 1e10 || ![1, 2, 3].includes(t.buyBackYears) || t.exchangeValue < 0 || t.exchangeValue > 1e10) return 'Check the transfer terms: 0–3 years, at least 25% upfront, sell-on up to 50%, and a buy-back term of 1–3 years.';
  if (seller.fa && (d.fee || t.years || t.exchangePid || t.sellOnPct || t.buyBackPrice)) return 'Free agents have no selling club: instalments, exchanges and former-club clauses do not apply.';
  if (t.years && !(d.fee > 0)) return 'Instalments need a cash fee.';
  if (t.exchangePid) {
    const q = transferExchange(d);
    if (!q || q.id === player.id || q.club !== buyer.id || !buyer.squad.includes(q.id)) return 'The exchange player is no longer at the buying club.';
    if (!(t.exchangeValue > 0)) return 'Give the exchange player an agreed value.';
    if (G.deals.some(x => x.id !== d.id && dealOpen(x) && (x.pid === q.id || x.proposal?.exchangePid === q.id))) return 'The exchange player is already involved in another open deal.';
  } else if (t.exchangeValue) return 'Choose the player included in the exchange.';
  const q = transferExchange(d);
  if (!transferCapacity(buyer, player, q) || q && !transferCapacity(seller, q, player)) return 'One of the clubs has no space for this transfer.';
  return '';
}
function instalmentPolicy(fee, seller) {
  const rule = fee < 1e6 ? { years: 1, upfrontPct: 75 } : fee < 5e6 ? { years: 2, upfrontPct: 50 } : fee < 20e6 ? { years: 2, upfrontPct: 40 } : { years: 3, upfrontPct: 25 };
  if (seller.bal < 0) { rule.years = 1; rule.upfrontPct = Math.max(75, rule.upfrontPct); }
  return rule;
}
function exchangeAgentReview(p, destination) {
  const from = G.clubs[p.club], ag = agentOf(p);
  if (p.inj?.w >= 6) return `${pname(p)} cannot pass the exchange medical (${p.inj.n}).`;
  if (p.pers === 'Loyal' && !p.listed && destination.rep < from.rep - 4) return `${pname(p)} and his agent refuse a move away to a smaller club.`;
  if (destination.rep + 12 < p.ca && !p.listed || ag && ag.style === 'Ruthless' && destination.rep + 8 < p.ca) return `${pname(p)}'s agent rejects the exchange destination.`;
  return '';
}
function reviewTransferPackage(d) {
  const error = transferTermsError(d); if (error) return { ok: false, who: 'club', reason: error };
  const t = transferProposal(d), { buyer, seller, player: p } = transferParties(d), q = transferExchange(d);
  if (t.years) {
    const rule = instalmentPolicy(d.fee, seller);
    if (t.years > rule.years || t.upfrontPct < rule.upfrontPct) return { ok: false, who: 'club', reason: `${TheClub(seller)} require at least ${rule.upfrontPct}% upfront and no more than ${rule.years} year${rule.years === 1 ? '' : 's'} for this cash fee${seller.bal < 0 ? ' because they need cash now' : ''}.` };
    const upfront = Math.round(d.fee * t.upfrontPct / 100);
    const commitments = transferCommitments(buyer.id).owed;
    if (buyer.bal - upfront < -Math.max(5e6, d.fee * .5) || commitments + d.fee - upfront > Math.max(20e6, Math.max(0, buyer.bal) * 1.5)) return { ok: false, who: 'agent', reason: 'The agent will not approve the payment risk: the buyer needs more cash or fewer outstanding commitments.' };
  }
  if (q) {
    const fair = pValue(q);
    if (t.exchangeValue > fair * 1.2 || t.exchangeValue < fair * .6) return { ok: false, who: 'club', reason: `The clubs do not agree with the exchange valuation of ${money(t.exchangeValue)} for ${pname(q)} (market estimate ${money(fair)}).` };
    const needed = !seniorSquad(seller.id).some(x => x.id !== p.id && x.pos === q.pos && x.ca >= q.ca);
    if (q.ca < seller.rep - (needed ? 24 : 17)) return { ok: false, who: 'club', reason: `${TheClub(seller)} do not consider ${pname(q)} suitable for their squad.` };
    const refusal = exchangeAgentReview(q, seller); if (refusal) return { ok: false, who: 'agent', reason: refusal };
    if (Math.max(q.wage, wageFor(q, seller.rep)) > Math.max(15000, clubWageBill(seller) * .3)) return { ok: false, who: 'club', reason: `${TheClub(seller)} cannot support the exchange player's wage.` };
  }
  if (d.dir === 'out' && (d.fee || 0) + t.exchangeValue > Math.max(pValue(p) * 1.45, d.initialFee || d.fee || 0)) return { ok: false, who: 'club', reason: 'The buyer rejects the combined cash and exchange value as too high for this player.' };
  if (t.buyBackPrice && t.buyBackPrice < Math.max(pValue(p) * 1.25, ((d.fee || 0) + t.exchangeValue) * 1.1)) return { ok: false, who: 'agent', reason: 'The buyer and the player’s agent require a buy-back price of at least 125% of market value and 110% of this transfer package.' };
  if (d.dir === 'out' && (t.sellOnPct > 20 || t.buyBackPrice && t.buyBackPrice < pValue(p) * 1.5)) return { ok: false, who: 'club', reason: 'The buyer rejects these former-club rights. Reduce the sell-on to 20% or less, or raise the buy-back price to at least 150% of market value.' };
  return { ok: true };
}
function transferOfferValue(d) {
  const t = transferProposal(d);
  return (d.fee || 0) * (1 - t.years * .02 * (1 - t.upfrontPct / 100)) + t.exchangeValue + (d.add || 0) * .5 + (d.fee || 0) * t.sellOnPct / 100 * .15;
}
function setTransferProposal(d, raw) {
  const previous = d.proposal;
  d.proposal = { ...TRANSFER_TERMS_DEFAULT, ...raw };
  for (const k of Object.keys(TRANSFER_TERMS_DEFAULT)) d.proposal[k] = +d.proposal[k];
  if (d.proposal.upfrontPct === 100) d.proposal.years = 0;
  if (!d.proposal.years) d.proposal.upfrontPct = 100;
  if (!d.proposal.exchangePid) d.proposal.exchangeValue = 0;
  const error = transferTermsError(d);
  if (error) { d.proposal = previous; return error; }
  delete d.packageApproval;
  return '';
}
function approveTransferPackage(d) { d.packageApproval = transferPackageKey(d); }
function packageCompletionError(d) {
  if (!d || d.closed || d.stage !== 'final' || !d.need || !['final', 'finalout'].includes(d.need.k)) return 'The deal is not ready to complete.';
  const error = transferTermsError(d); if (error) return error;
  if (d.proposal && d.packageApproval !== transferPackageKey(d)) return 'The transfer package changed. Both clubs and agents must agree the terms again.';
  if (!d.proposal) return '';
  const review = reviewTransferPackage(d); return review.ok ? '' : review.reason;
}
function transferPackageSummary(d) {
  const t = transferProposal(d), text = [], fee = d.fee || 0;
  if (fee) text.push(`${money(fee)} cash${t.years ? `: ${money(Math.round(fee * t.upfrontPct / 100))} upfront (${t.upfrontPct}%), remainder in ${t.years} annual payment${t.years === 1 ? '' : 's'}` : ' upfront'}`);
  const q = transferExchange(d);
  if (q) text.push(`${fullName(q)} exchanged at ${money(t.exchangeValue)} · package ${money(fee + t.exchangeValue)}`);
  if (t.sellOnPct) text.push(`${t.sellOnPct}% of the next total sale fee to ${clubName(d.from)}`);
  if (t.buyBackPrice) text.push(`${clubName(d.from)} buy-back: ${money(t.buyBackPrice)} within ${t.buyBackYears} years, subject to player agreement`);
  return text.join('; ');
}
function ensureTransferFinance() {
  G.payments ||= [];
  // Persist the debtor before a manager changes clubs. Legacy season-end dates are retained.
  for (const row of G.payments) if (!row.from) { row.from = G.club; row.reserved = true; }
}
function transferCommitments(cid = G.club) {
  ensureTransferFinance(); const now = today().getTime(), year = 366 * 864e5;
  const rows = G.payments.filter(x => x.from === cid || x.to === cid);
  return { rows, owed: sum(rows.filter(x => x.from === cid), x => x.amount), due: sum(rows.filter(x => x.to === cid), x => x.amount), nextYear: sum(rows.filter(x => x.from === cid && (x.due ? x.due <= now + year : x.season <= G.season + 1)), x => x.amount) };
}
function transferCash(from, to, amount, reserveBudget = false) {
  if (!(amount > 0)) return;
  G.clubs[from].bal -= amount; if (!G.clubs[to].fa) G.clubs[to].bal += amount;
  if (from === G.club) { G.ledger.buys += amount; if (reserveBudget) G.fin.tb = Math.max(0, G.fin.tb - amount); }
  if (to === G.club) { G.ledger.sales += amount; G.fin.tb += Math.round(amount * .5); }
}
function settleTransferFee(p, toId, fee, terms = TRANSFER_TERMS_DEFAULT, exchangeValue = 0) {
  ensureTransferFinance(); const from = G.clubs[p.club], buyer = G.clubs[toId], date = today().getTime();
  const upfront = terms.years ? Math.round(fee * terms.upfrontPct / 100) : fee;
  if (buyer.id === G.club) G.fin.tb = Math.max(0, G.fin.tb - fee); // Reserve the entire guaranteed cash commitment once.
  if (!from.fa) transferCash(buyer.id, from.id, upfront);
  let remaining = fee - upfront;
  for (let y = 1; y <= terms.years; y++) {
    const amount = y === terms.years ? remaining : Math.floor((fee - upfront) / terms.years), due = new Date(date);due.setFullYear(due.getFullYear() + y);
    if (amount) G.payments.push({ id: G.nextId++, from: buyer.id, to: from.id, pid: p.id, name: fullName(p), amount, due: due.getTime(), reserved: true });
    remaining -= amount;
  }
  const old = p.sellOn;
  if (old && old.club !== from.id && G.clubs[old.club] && !G.clubs[old.club].fa) {
    const cut = Math.round((fee + exchangeValue) * clamp(old.pct, 0, 50) / 100);
    if (cut > 0) {
      from.bal -= cut; G.clubs[old.club].bal += cut;
      if (from.id === G.club) { G.ledger.sales -= cut; G.fin.tb = Math.max(0, G.fin.tb - Math.round(cut * .5)); }
      if (old.club === G.club) { G.ledger.sales += cut; G.fin.tb += Math.round(cut * .5); }
      addLog('transfer', `Sell-on paid for ${pname(p)}`, `${clubName(from.id)} paid ${money(cut)} to ${clubName(old.club)} (${old.pct}% of the next sale package).`);
    }
  }
  delete p.sellOn; delete p.buyBack;
  if (!from.fa && terms.sellOnPct) p.sellOn = { club: from.id, pct: terms.sellOnPct };
  if (!from.fa && terms.buyBackPrice) { const expiry = new Date(date);expiry.setFullYear(expiry.getFullYear() + terms.buyBackYears);p.buyBack = { club: from.id, holder: buyer.id, price: terms.buyBackPrice, expires: expiry.getTime() }; }
  return { upfront, deferred: fee - upfront, packageValue: fee + exchangeValue };
}
function payTransferInstalments(seasonEnd = false) {
  ensureTransferFinance();const now = today().getTime(), keep = [];
  for (const row of G.payments) {
    const due = row.due ? row.due <= now : seasonEnd && row.season <= G.season;
    if (!due || !G.clubs[row.from] || !G.clubs[row.to]) { keep.push(row);continue; }
    transferCash(row.from, row.to, row.amount);
    if (row.from === G.club || row.to === G.club) addLog('club', row.from === G.club ? 'Transfer instalment paid' : 'Transfer instalment received', `${money(row.amount)}: ${clubName(row.from)} → ${clubName(row.to)}${row.name ? ' for ' + row.name : ''}.`);
  }
  G.payments = keep;
}
function activeBuyBack(p, cid = G.club) { const b = p?.buyBack;return !!b && b.club === cid && b.holder === p.club && b.expires >= today().getTime() && p.club !== cid; }
function activateBuyBack(pid) {
  const p = G.players[pid];if (!activeBuyBack(p)) return { error: 'There is no active buy-back right for your club.' };
  const existing = activeDeal(pid, 'in');if (existing) return { error: 'Finish or withdraw your existing offer before activating the buy-back.' };
  const d = startDeal(p, 'review', { buyBackTriggered: { ...p.buyBack } });
  DEAL_STEP.in.review(d, p); d.memo.est = d.memo.max = p.buyBack.price;d.memo.open = p.buyBack.price;
  dealLog(d, `Buy-back right activated at ${money(p.buyBack.price)}. The player still has to agree personal terms.`, 'you');
  return { deal: d };
}
