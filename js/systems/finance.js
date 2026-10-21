'use strict';
/* ===== finance.js =====
   Weekly income and costs. Match-day money (TV, gate) is booked in finishMatch. */

const sponsorWeekly = rep => Math.round(60000 * Math.pow(1.08, rep - 50));
const staffWageBill = () => sum(G.staff, s => s.wage);
const opsWeekly = rep => Math.round(60000 + rep * 5000);

function weeklyFinance() {
  const c = userClub(), L = G.ledger;
  const spon = Math.round(sponsorWeekly(c.rep) * (0.9 + G.board.fans / 500));
  const merch = Math.round(spon * 0.2);
  const wages = clubWageBill(c), staff = staffWageBill(), ops = opsWeekly(c.rep), sc = scoutCost();
  c.bal += spon + merch - wages - staff - ops - sc;
  L.spon += spon; L.merch += merch; L.wages += wages; L.staff += staff; L.ops += ops; L.scout += sc;
  G.balHist.push(Math.round(c.bal));
  if (G.balHist.length > 120) G.balHist.shift();
  if (c.bal < 0) { G.board.conf = Math.max(0, G.board.conf - 1); if (G.week % 4 === 0) addNews('club', 'Board concerned by finances', 'The club is operating with a negative balance. The board expects you to reduce the wage bill or raise funds through sales.'); }

  // computer clubs: commercial income minus wages
  Object.values(G.clubs).forEach(o => {
    if (o.id === G.club || o.fa) return;
    o.bal += sponsorWeekly(o.rep) * 1.2 - clubWageBill(o) - opsWeekly(o.rep) * 0.6;
  });
}

// Move money between the transfer and wage budgets: £1k a week of wages = £100k of transfer budget.
function adjustBudgets(wageDelta) {
  const cost = wageDelta * 100;
  if (cost > 0 && G.fin.tb < cost) return false;
  if (G.fin.wb + wageDelta < 0) return false;
  G.fin.wb = roundWage(G.fin.wb + wageDelta);
  G.fin.tb = roundMoney(Math.max(0, G.fin.tb - cost));
  return true;
}
