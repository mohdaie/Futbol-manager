'use strict';
/* ===== lifestyle.js =====
   Spending the manager's own money (his personal bank, managers.js): a car, a home, holiday trips and shares
   in his own club. Nothing here buys results; the effects are deliberately small.
   - Prestige (car tier + 1.5 × home tier) adds up to about a quarter to personal sponsorship income.
   - Cars lose about 15% a year; homes drift with the market (about +3% a year on average).
   - Freshness (0-100) falls with every match he takes charge of and recovers in quiet weeks, between clubs and on
     holiday (more with a better trip). A tired manager's team talks and press answers move morale less.
   - Shares: his own club only, up to 25%, priced from the club's valuation. Dividends are a quarter of the club's
     season profit, pro rata; 10% earns a board seat (the board listens more readily). Leaving the club sells them. */

const CARS = [
  { k: 'hatch', n: 'City hatchback', price: 25e3, tier: 1 }, { k: 'saloon', n: 'Executive saloon', price: 70e3, tier: 2 },
  { k: 'sports', n: 'Sports car', price: 180e3, tier: 3 }, { k: 'super', n: 'Supercar', price: 450e3, tier: 4 },
];
const HOMES = [
  { k: 'flat', n: 'City flat', price: 450e3, tier: 1 }, { k: 'house', n: 'Family house', price: 1.2e6, tier: 2 }, { k: 'estate', n: 'Country estate', price: 4.5e6, tier: 3 },
];
const TRIPS = {
  none: { n: 'Stay at home', price: 0, fresh: 0 }, city: { n: 'City break', price: 8e3, fresh: 15 },
  beach: { n: 'Beach resort', price: 40e3, fresh: 30 }, safari: { n: 'Luxury safari', price: 150e3, fresh: 50 },
};
const SHARE_MAX = 25, BOARD_SEAT = 10;
const LIFESTYLE_NAMES = { car: 'Car', home: 'Home', trip: 'Holiday trip', shares: 'Club shares', sale: 'Sale of an asset', dividend: 'Dividend' };

function lifestyle() {
  const p = userManagerProfile();
  p.assets ||= []; if (p.shares === undefined) p.shares = null; p.fresh ??= 80;
  return p;
}
function managerSpend(p, kind, amount, detail) {
  amount = Math.round(amount); p.bank = Math.round(p.bank - amount);
  p.transactions.unshift({ date: today().getTime(), kind, amount: -amount, detail, club: G.club });
  p.transactions = p.transactions.slice(0, 250);
}
const assetOf = (p, kind) => (p.assets || []).find(a => a.kind === kind) || null; // older profiles have no assets yet
const prestige = (p = lifestyle()) => (assetOf(p, 'car')?.tier || 0) + (assetOf(p, 'home')?.tier || 0) * 1.5;
const freshFactor = () => (G?.managerProfileId ? 0.6 + 0.4 * (lifestyle().fresh / 100) : 1);

// A car or a home: the one you have goes in part-exchange at its current value.
function buyAsset(kind, k) {
  const p = lifestyle(), item = (kind === 'car' ? CARS : HOMES).find(x => x.k === k);
  if (!item) return { ok: false, msg: 'Unknown item.' };
  const old = assetOf(p, kind), credit = old ? Math.round(old.value) : 0;
  if (p.bank + credit < item.price) return { ok: false, msg: `You need ${money(item.price - credit - p.bank)} more in your personal bank.` };
  if (old) { p.assets = p.assets.filter(a => a !== old); managerRecordIncome(p, 'sale', credit, `${old.n} sold in part-exchange.`); }
  managerSpend(p, kind, item.price, `${item.n} bought.`);
  const a = { kind, k, n: item.n, tier: item.tier, paid: item.price, value: item.price, bought: todayNo(), club: kind === 'home' ? G.club : null };
  p.assets.push(a);
  // A home near the club shows commitment: the board notices (once per club).
  if (kind === 'home' && !jobless() && !(G.board.homeAt === G.club)) { G.board.homeAt = G.club; G.board.conf = clamp(G.board.conf + 3, 0, 100); }
  return { ok: true, msg: `${item.n} bought for ${money(item.price)}${credit ? `, with ${money(credit)} for your old one` : ''}.` };
}
function sellAsset(kind) {
  const p = lifestyle(), a = assetOf(p, kind);
  if (!a) return { ok: false, msg: 'Nothing to sell.' };
  p.assets = p.assets.filter(x => x !== a);
  managerRecordIncome(p, 'sale', Math.round(a.value), `${a.n} sold.`);
  return { ok: true, msg: `${a.n} sold for ${money(a.value)}.` };
}

// The club's value: reputation (a big club is worth a great deal more) plus half its cash.
function clubValuation(cid = G.club) {
  const c = G.clubs[cid];
  return Math.max(20e6, Math.pow(Math.max(0, c.rep - 50), 2) * 1.5e6 + Math.max(0, c.bal) * 0.5);
}
const sharePrice = (cid = G.club) => Math.round(clubValuation(cid) / 100); // for 1%
function buyShares(pct) {
  const p = lifestyle();
  if (jobless()) return { ok: false, msg: 'You can only buy shares in the club you manage.' };
  pct = Math.max(1, Math.round(pct));
  const have = p.shares?.club === G.club ? p.shares.pct : 0, cost = sharePrice() * pct;
  if (have + pct > SHARE_MAX) return { ok: false, msg: `The board will not let a manager own more than ${SHARE_MAX}%.` };
  if (p.bank < cost) return { ok: false, msg: `${pct}% costs ${money(cost)}. You have ${money(p.bank)}.` };
  managerSpend(p, 'shares', cost, `${pct}% of ${clubName(G.club)}.`);
  p.shares = { club: G.club, pct: have + pct, paid: (p.shares?.paid || 0) + cost };
  if (have < BOARD_SEAT && p.shares.pct >= BOARD_SEAT) {
    G.board.conf = clamp(G.board.conf + 3, 0, 100);
    addNews('club', 'A seat on the board', `With ${p.shares.pct}% of the club, ${G.manager} joins the board. The directors listen to him more readily.`);
  }
  return { ok: true, msg: `You now own ${p.shares.pct}% of ${clubName(G.club)}.` };
}
function sellShares(pct, why) {
  const p = lifestyle(), s = p.shares;
  if (!s) return { ok: false, msg: 'You own no shares.' };
  pct = Math.min(s.pct, Math.max(1, Math.round(pct)));
  const value = sharePrice(s.club) * pct;
  managerRecordIncome(p, 'sale', value, `${pct}% of ${clubName(s.club)} sold${why ? ' ' + why : ''}.`);
  s.paid = Math.round(s.paid * (1 - pct / s.pct)); s.pct -= pct;
  if (!s.pct) p.shares = null;
  return { ok: true, msg: `Sold ${pct}% for ${money(value)}.` };
}
// Leaving the club (another job, out of work, retirement): the shares go back to the club at their value.
function sellSharesOnLeaving(nextClub) {
  const p = G.managerProfileId && G.managerProfiles?.[G.managerProfileId];
  if (!p?.shares || p.shares.club === nextClub) return;
  sellShares(p.shares.pct, 'on leaving the club');
}
const boardSeat = () => { const s = G?.managerProfileId && lifestyle().shares; return !!(s && s.club === G.club && s.pct >= BOARD_SEAT && !jobless()); };
const netWorth = (p = lifestyle()) => p.bank + p.assets.reduce((t, a) => t + a.value, 0) + (p.shares ? sharePrice(p.shares.club) * p.shares.pct : 0);

// Every week: values move and freshness follows the workload.
function lifestyleWeek() {
  if (!G.managerProfileId || careerRetired()) return;
  const p = lifestyle();
  p.assets.forEach(a => { a.value = Math.round(a.kind === 'car' ? a.value * (1 - 0.15 / 52) : a.value * (1 + 0.03 / 52 + gauss() * 0.004)); });
  const games = jobless() ? 0 : G.fixtures.filter(f => f.w === G.week && isUserFx(f) && played(f)).length;
  const before = p.fresh;
  // About 2 a match and 3 back in a quiet week: from 80 a season with no break ends near 40.
  p.fresh = clamp(p.fresh + (onHoliday() ? 15 : jobless() ? 5 : games ? -2 * games : 3), 0, 100);
  if (before >= 30 && p.fresh < 30) addNews('club', 'You look tired', 'A long run of matches is taking its toll. Your team talks and press conferences carry less weight until you rest: a holiday would help.');
}
// Season end: a quarter of the club's profit is shared out, his part paid to him.
function lifestyleDividend() {
  const p = G.managerProfileId && lifestyle(), s = p?.shares, L = G.ledger;
  if (!s || s.club !== G.club || jobless() || !L) return;
  const profit = (L.tv + L.gate + L.spon + L.merch + L.sales + L.prize) - (L.wages + L.staff + (L.manager || 0) + L.buys + L.ops + L.scout);
  const div = Math.round(Math.max(0, profit) * 0.25 * s.pct / 100);
  if (div > 0) managerRecordIncome(p, 'dividend', div, `${s.pct}% of ${clubName(s.club)}: a share of ${money(profit)} profit.`);
}
