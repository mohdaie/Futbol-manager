'use strict';
/* ===== transfers.js =====
   Bids, contracts, sales, releases, AI-to-AI transfers, incoming bids for your players
   and agent pitches (a lightweight take on FM26's TransferRoom-style recruitment). */

function isKeyPlayer(p) {
  const c = G.clubs[p.club];
  if (!c || c.fa) return false;
  const ranked = c.squad.map(id => G.players[id]).filter(x => x && lvlOf(x) === 'A').sort((a, b) => b.ca - a.ca);
  return ranked.indexOf(p) < 11;
}

function askingPrice(p) {
  const c = G.clubs[p.club];
  if (!c || c.fa) return 0;
  const pitch = G.pitches.find(x => x.pid === p.id);
  if (pitch) return pitch.ask;
  let ask = pValue(p) * (isKeyPlayer(p) ? 1.45 : 1.15) * (p.listed ? 0.85 : 1);
  if (p.con - G.season <= 1) ask *= 0.8;
  if (c.foreign && c.rep < userClub().rep) ask *= 0.95;
  return roundMoney(ask);
}

// Would the player consider joining your club?
function interest(p) {
  const me = userClub(), from = G.clubs[p.club];
  if (p.ca > me.rep + 6 + joinPull(p) && R() < 0.85 && !(from && from.rep < me.rep)) return { ok: false, msg: `${fullName(p)} does not see ${theClub(me)} as a step up.` };
  if (from && !from.fa && from.rep > me.rep + 10 && isKeyPlayer(p)) return { ok: false, msg: `${fullName(p)} is settled at a bigger club and will not talk to you.` };
  return { ok: true };
}

function wageDemand(p, renew) {
  const me = userClub();
  let w = wageFor(p, me.rep) * (renew ? 1.05 : 1.12) * joinMul(p);
  if (p.pers === 'Ambitious') w *= 1.1;
  if (p.pers === 'Loyal' && renew) w *= 0.9;
  if (renew && p.status === 'Key player') w *= 1.08;
  return roundWage(Math.max(w, renew ? p.wage * 1.03 : 0));
}

function makeBid(pid, fee) {
  if (!squadSpace(userClub())) return { r: 'reject', msg: squadLimitMessage(userClub()) };
  const p = G.players[pid];
  if (p?.loan) return { r: 'reject', msg: 'A player cannot be transferred while a temporary loan registration is active.' };
  if (!p || G.clubs[p.club]?.backgroundOnly) return { r: 'reject', msg: 'This player is unavailable for transfer.' };
  const c = G.clubs[p.club];
  if (!c.fa && !inWindow()) return { r: 'reject', msg: 'The transfer window is closed. You can still sign free agents.' };
  if (fee > G.fin.tb) return { r: 'reject', msg: `That is more than your transfer budget of ${money(G.fin.tb)}.` };
  const it = interest(p);
  if (!it.ok) return { r: 'reject', msg: it.msg };
  if (c.fa) return { r: 'accept', fee: 0, msg: `${fullName(p)} is a free agent. Agree personal terms to sign.` };
  const ask = askingPrice(p);
  if (fee >= ask) return { r: 'accept', fee, msg: `${TheClub(c)} accept your offer of ${money(fee)}.` };
  if (fee >= ask * 0.75) return { r: 'counter', fee: ask, msg: `${TheClub(c)} reject ${money(fee)} but would accept ${money(ask)}.` };
  return { r: 'reject', msg: `${TheClub(c)} reject your offer out of hand. It is well short of their valuation.` };
}

// Personal terms. Returns {ok, msg}. mode: 'buy' | 'renew'
function offerContract(pid, wage, years, status, fee, mode) {
  if (mode !== 'renew' && !squadSpace(userClub())) return { ok: false, msg: squadLimitMessage(userClub()) };
  const p = G.players[pid];
  if (!p || G.clubs[p.club]?.backgroundOnly) return { ok: false, msg: 'This player is unavailable for transfer.' };
  const demand = wageDemand(p, mode === 'renew');
  const bill = clubWageBill(userClub()) - (mode === 'renew' ? p.wage : 0) + wage;
  if (bill > G.fin.wb) return { ok: false, msg: `The board will not exceed the wage budget of ${wageFmt(G.fin.wb)}. Raise it in Finance or offer less.` };
  const statusBonus = { 'Key player': 0.9, 'First team': 0.96, Rotation: 1.04, Backup: 1.12, Prospect: 1.0 }[status] || 1;
  const yearsF = years >= 4 && p.age <= 28 ? 0.97 : years <= 1 && p.age >= 30 ? 1.05 : 1;
  const need = demand * statusBonus * yearsF;
  if (wage < need * 0.95) {
    return { ok: false, msg: `${fullName(p)}'s agent wants at least ${wageFmt(roundWage(need))}.` };
  }
  const off = G.week >= SEASON_WEEKS - 2 ? 1 : 0; // off-season deals start next season
  if (mode === 'renew') {
    p.wage = wage; p.con = G.season + years + off; p.status = status;
    p.mor = clamp(p.mor + 8, 0, 100);
    addStory('club', `${pname(p)} signs a new contract`, `${fullName(p)} has agreed a new ${years}-year deal worth ${wageFmt(wage)}.`);
    if (typeof makeStory === 'function') storySimple(G.news[0], 'club', 'new-contract', { player: fullName(p), pos: POS_NAME[p.pos].toLowerCase(), years }, [G.club]);
    return { ok: true, msg: `${fullName(p)} signs a new ${years}-year contract.` };
  }
  completeSigning(p, fee, wage, years + off, status);
  return { ok: true, msg: `${fullName(p)} joins ${theClub(userClub())}${fee ? ' for ' + money(fee) : ' on a free transfer'}.` };
}

// Signed players join the first team unless they are still U18 age.
function moveClub(p, toId) {
  if (!p || G.players[p.id] !== p || G.clubs[p.club]?.backgroundOnly) throw new Error('This player is unavailable for transfer.');
  const destination = G.clubs[toId];
  if (!squadSpace(destination, p)) throw new Error(squadLimitMessage(destination));
  const from = p.club;
  if (p.buyBack && p.buyBack.holder !== toId) delete p.buyBack;
  if (destination.fa) delete p.sellOn;
  delete p.unset; p.treq = null; p.listed = false;
  removeFromClub(p);
  // Simulated clubs skip weekly training, so a player leaving one for a club that trains starts fresh.
  if (typeof isSimClub === 'function' && isSimClub(G.clubs[from]) && !isSimClub(destination)) { p.cond = 100; p.shp = Math.max(p.shp, 60); p.rd = null; }
  favPersonMoved(p, from, toId);
  p.lvl = p.age <= 17 ? (destination.league === 'ECH' ? 'R' : 'Y') : 'A';
  addToClub(p, G.clubs[toId]);
}

function completeSigning(p, fee, wage, years, status, terms) {
  if (!p || G.players[p.id] !== p || G.clubs[p.club]?.backgroundOnly) throw new Error('This player is unavailable for transfer.');
  if (!squadSpace(userClub(), p)) throw new Error(squadLimitMessage(userClub()));
  const me = userClub(), from = G.clubs[p.club];
  const fromName = from.fa ? 'free agency' : theClub(from);
  const settlement = settleTransferFee(p, G.club, fee, terms, terms?.exchangeValue || 0);
  moveClub(p, G.club);
  p.wage = wage; p.con = G.season + years; p.status = status; p.mor = clamp(p.mor + 10, 0, 100);
  G.know[p.id] = 100;
  G.shortlist = G.shortlist.filter(id => id !== p.id);
  G.pitches = G.pitches.filter(x => x.pid !== p.id);
  G.tHist.unshift({ date: weekDate(G.week).getTime(), pid: p.id, name: fullName(p), from: from.id, to: G.club, fee, upfront: settlement.upfront, deferred: settlement.deferred, exchangeValue: terms?.exchangeValue || 0 });
  addNews('transfer', `${fullName(p)} signs for ${theClub(me)}`, `${fullName(p)} (${p.age}, ${p.pos}) arrives from ${fromName}${fee ? ' for ' + money(fee) : ''} on a ${years}-year deal worth ${wageFmt(wage)}.`);
  if (typeof makeStory === 'function') storyTransfer(G.news[0], 'your-signing', p, from.id, G.club, fee, { years });
}

function sellPlayer(p, toId, fee, terms) {
  if (!squadSpace(G.clubs[toId], p)) return false;
  const me = userClub(), to = G.clubs[toId];
  const settlement = settleTransferFee(p, toId, fee, terms, terms?.exchangeValue || 0);
  moveClub(p, toId);
  p.wage = wageFor(p, to.rep); p.con = G.season + ri(2, 5);
  G.tHist.unshift({ date: weekDate(G.week).getTime(), pid: p.id, name: fullName(p), from: G.club, to: toId, fee, upfront: settlement.upfront, deferred: settlement.deferred, exchangeValue: terms?.exchangeValue || 0 });
  addNews('transfer', `${fullName(p)} leaves for ${theClub(to)}`, `${fullName(p)} has been sold for ${money(fee)}. Half of cash received is added to your transfer budget; future instalments are credited when paid.`);
  if (typeof makeStory === 'function') storyTransfer(G.news[0], 'sale', p, G.club, toId, fee);
}

function releasePlayer(p) {
  const yrs = Math.max(0, p.con - G.season);
  const comp = Math.round(p.wage * 52 * yrs * 0.5);
  userClub().bal -= comp; G.ledger.wages += comp;
  moveClub(p, 'FA');
  p.con = 0;
  addStory('club', `${fullName(p)} released`, `${fullName(p)} has left the club by mutual consent. Compensation paid: ${money(comp)}.`);
  if (typeof makeStory === 'function') storySimple(G.news[0], 'club', 'released', { player: fullName(p), pos: POS_NAME[p.pos].toLowerCase() }, [G.club]);
  return comp;
}

function respondBid(n, choice) {
  const a = n.action, p = G.players[a.pid];
  n.done = true;
  if (!p || p.club !== G.club) return 'The player is no longer at the club.';
  if (choice !== 'reject' && !squadSpace(G.clubs[a.from])) return squadLimitMessage(G.clubs[a.from]);
  if (choice === 'accept') { sellPlayer(p, a.from, a.fee); return `${fullName(p)} sold for ${money(a.fee)}.`; }
  if (choice === 'counter') {
    const want = roundMoney(a.fee * 1.2);
    if (want <= pValue(p) * 1.45 && R() < 0.6) { sellPlayer(p, a.from, want); return `${TheClub(a.from)} agree to ${money(want)}. ${fullName(p)} has been sold.`; }
    return `${TheClub(a.from)} walk away from the deal.`;
  }
  p.mor = clamp(p.mor - (p.listed ? 0 : 3), 0, 100);
  return 'Bid rejected.';
}

function weeklyTransfers() {
  maintainForeignSquads();
  if (inWindow()) {
    if (typeof simTransferWeek === 'function') simTransferWeek();
    aiMarket();
    aiBidsForUser();
    agentPitch();
  }
  // keep computer squads at a playable size
  academyClubs().forEach(id => {
    if (id === G.club) return;
    const c = G.clubs[id];
    while (seniorSquad(id).length < 22) {
      const res = levelSquad(id, 'R').sort((a, b) => b.ca - a.ca)[0];
      if (res && res.ca >= 58) { res.lvl = 'A'; res.wage = Math.max(res.wage, wageFor(res, c.rep) * 0.7); continue; }
      const fa = squadOf('FA').filter(p => p.ca >= 55).sort((a, b) => b.ca - a.ca)[0];
      if (!squadSpace(c)) break;
      if (fa) { moveClub(fa, id); fa.wage = wageFor(fa, c.rep); fa.con = G.season + ri(1, 3); }
      else { const p = genPlayer({ pos: pick(SQUAD_TEMPLATE), ca: 60 + (c.rep - 50) * 0.6 - 6, age: ri(20, 29), nat: c.worldLeague ? youthNat(c) : pickNat(PL_NATS), club: id }); addToClub(p, c); G.know[p.id] = c.worldLeague ? 10 : 40; }
    }
  });
  while (squadOf('FA').length < 40) { const p = genFreeAgent(); G.know[p.id] = 20; }
}

function aiMarket() {
  const buyers = domesticClubs().filter(id => id !== G.club && squadSpace(G.clubs[id]));
  const n = ri(0, 2);
  for (let k = 0; k < n; k++) {
    const c = G.clubs[pick(buyers)];
    const pk = autoPick(c.id, c.tac.ip);
    let worst = -1, wv = 999;
    pk.xi.forEach((id, i) => { const pos = FORMATIONS[c.tac.ip][i][0]; const v = id ? ovrAt(G.players[id], pos) : 0; if (v < wv && pos !== 'GK') { wv = v; worst = i; } });
    if (worst < 0) continue;
    const pos = FORMATIONS[c.tac.ip][worst][0];
    const pool = Object.values(G.players).filter(p => {
      const sc = G.clubs[p.club];
      return p.pos === pos && !p.loan && lvlOf(p) !== 'Y' && p.club !== G.club && p.club !== c.id && p.ca > wv + 2 && p.age <= 30 && sc && sc.rep <= c.rep + 4 && (sc.fa || askingPrice(p) <= c.bal * 0.4) && !activeDeal(p.id, 'ai');
    });
    if (!pool.length) continue;
    const p = wpick(pool, x => Math.pow(1.1, x.ca - 60));
    const from = G.clubs[p.club];
    aiDeal(c, p, from.fa ? 0 : activeBuyBack(p, c.id) ? p.buyBack.price : roundMoney(askingPrice(p) * rf(0.95, 1.1)));
  }
  if (G.tHist.length > 120) G.tHist.length = 120;
}

function aiBidsForUser() {
  seniorSquad(G.club).forEach(p => {
    const chance = p.listed ? 0.3 : p.ca > 72 ? 0.025 : 0.01;
    if (R() > chance) return;
    if (activeDeal(p.id, 'out')) return;
    const val = pValue(p);
    const buyers = Object.values(G.clubs).filter(c => c.id !== G.club && !c.fa && squadSpace(c) && c.rep >= p.ca - 12 && c.bal > val * 0.8);
    if (!buyers.length) return;
    const b = pick(buyers);
    const fee = activeBuyBack(p, b.id) ? p.buyBack.price : roundMoney(val * (p.listed ? rf(0.7, 1.05) : rf(0.95, 1.3)));
    bidForUser(b, p, fee);
  });
}

function agentPitch() {
  if (R() > 0.45) return;
  const T = G.tactics, slots = FORMATIONS[T.ip];
  let worst = 1, wv = 999;
  T.slots.forEach((id, i) => { const pos = slots[i][0]; const v = id ? ovrAt(G.players[id], pos) : 0; if (v < wv) { wv = v; worst = i; } });
  const pos = slots[worst][0], me = userClub();
  const pool = Object.values(G.players).filter(p => {
    const c = G.clubs[p.club];
    return lvlOf(p) !== 'Y' && p.club !== G.club && (p.pos === pos || p.alt.includes(pos)) && p.ca >= wv - 2 && p.ca <= wv + 10 && c.rep <= me.rep + 6 && (c.fa || askingPrice(p) <= G.fin.tb * 1.3) && !G.pitches.some(x => x.pid === p.id);
  });
  if (!pool.length) return;
  const pool2 = pool.filter(x => agentRel(agentOf(x)) > -25); // a hostile agent does not call you
  if (!pool2.length) return;
  const p = wpick(pool2, x => Math.pow(1.1, x.ca - 60) * (1 + Math.max(0, agentRel(agentOf(x))) / 20));
  const ask = G.clubs[p.club].fa ? 0 : roundMoney(pValue(p) * rf(0.9, 1.15));
  G.pitches.unshift({ pid: p.id, ask, date: weekDate(G.week).getTime() });
  G.pitches = G.pitches.slice(0, 8);
  G.know[p.id] = Math.max(knowOf(p), 30); scoutFile(p);
  addNews('transfer', `Agent pitch: ${fullName(p)}`, `${agentOf(p) ? agentOf(p).name + ' (' + agentOf(p).agency + ')' : 'An agent'} says ${fullName(p)} (${p.age}, ${POS_NAME[p.pos]}, ${clubName(p.club)}) is available${ask ? ' for ' + money(ask) : ' on a free'}. Your ${POS_NAME[pos].toLowerCase()} spot is the weakest in your XI.`, { t: 'player', pid: p.id });
}

function weeklyContracts() {
  if (G.week !== 18 && G.week !== 32) return;
  seniorSquad(G.club).filter(p => p.con - G.season <= 1).forEach(p => {
    addNews('inbox', `${pname(p)}'s contract is expiring`, `${fullName(p)}'s deal ends in June. Offer a new contract or the player leaves on a free.`, { t: 'renew', pid: p.id });
  });
}
