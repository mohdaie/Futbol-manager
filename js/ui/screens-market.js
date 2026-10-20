'use strict';
/* ===== screens-market.js =====
   Transfers hub (player search, shortlist, scouting, agent pitches, bids, history),
   offer and contract negotiation sheets, finances, staff and the board. */

SCREENS.transfers = {
  render() {
    const t = UI.tab.tr || 'search', win = windowState();
    const head = `<h1 class="h1">Transfers</h1>
      <div class="banner ${win.open ? 'open' : ''}"><b>${win.label}${win.open ? ' · closes ' + win.closes : ''}</b><span>Budget ${money(G.fin.tb)} · Wages ${wageFmt(clubWageBill(userClub()))} of ${wageFmt(G.fin.wb)}</span></div>
      ${tabs('tr', [['search', 'Search'], ['short', 'Shortlist'], ['scout', 'Scouting'], ['pitch', 'Pitches'], ['bids', 'Bids'], ['hist', 'History']], t)}`;
    return head + TR_TABS[t]();
  },
};

const TR_TABS = {
  search() {
    const S = UI.search;
    const res = Object.values(G.players).filter(p => {
      if (p.club === G.club || p.youth) return false;
      if (S.pos !== 'Any' && p.pos !== S.pos && !p.alt.includes(S.pos)) return false;
      if (S.region !== 'Everywhere' && regionOf(p) !== S.region) return false;
      if (p.age > S.maxAge) return false;
      if (S.maxFee && pValue(p) > S.maxFee) return false;
      if (S.minOvr && seenOvr(p).v < S.minOvr) return false;
      if (S.name && !fullName(p).toLowerCase().includes(S.name.toLowerCase())) return false;
      return true;
    }).sort((a, b) => seenOvr(b).v - seenOvr(a).v);
    return `<div class="card filters">
        <div class="field"><label for="sPos">Position</label>${selectHtml('sPos', ['Any', ...POSITIONS], S.pos, 'sf', 'data-k="pos"')}</div>
        <div class="field"><label for="sReg">Region</label>${selectHtml('sReg', REGIONS, S.region, 'sf', 'data-k="region"')}</div>
        <div class="field"><label for="sAge">Max age</label>${selectHtml('sAge', [18, 21, 23, 25, 28, 30, 33, 40], S.maxAge, 'sf', 'data-k="maxAge" data-n="1"')}</div>
        <div class="field"><label for="sFee">Max value</label>${selectHtml('sFee', [[0, 'Any'], [1e6, '£1m'], [5e6, '£5m'], [10e6, '£10m'], [20e6, '£20m'], [40e6, '£40m'], [70e6, '£70m'], [100e6, '£100m']], S.maxFee, 'sf', 'data-k="maxFee" data-n="1"')}</div>
        <div class="field"><label for="sOvr">Min rating</label>${selectHtml('sOvr', [[0, 'Any'], 60, 65, 70, 75, 80, 85], S.minOvr, 'sf', 'data-k="minOvr" data-n="1"')}</div>
        <div class="field"><label for="sName">Name</label><input id="sName" type="search" value="${esc(S.name)}" placeholder="Surname" data-c="sf" data-k="name"></div>
      </div>
      <p class="muted">${res.length} players match. Ratings shown as ranges are scouting estimates.</p>
      <div class="list">${res.slice(0, 60).map(p => playerRow(p, `<span class="stat"><b>${money(pValue(p))}</b><small>value</small></span>`)).join('') || empty('No players found', 'Loosen the filters to see more.')}</div>`;
  },
  short() {
    const list = G.shortlist.map(id => G.players[id]).filter(p => p && p.club !== G.club);
    return `<div class="list">${list.map(p => playerRow(p, `<span class="stat"><b>${money(pValue(p))}</b><small>value</small></span>`)).join('') || empty('Shortlist is empty', 'Add players from their profile to track them here.')}</div>`;
  },
  scout() {
    const scouts = staffOf('Scout'), A1 = G.scout.assign, free = scouts.length - A1.length;
    const f = UI.tab.newAssign || { region: 'Everywhere', pos: 'Any', maxAge: 30, weeks: 4 };
    UI.tab.newAssign = f;
    return `<div class="card"><h3>Assignments <small>${A1.length}/${scouts.length} scouts busy</small></h3>
        <div class="list">${A1.map(a => `<div class="row"><span class="grow"><b>${esc(a.region)} · ${a.pos === 'Any' ? 'Any position' : POS_NAME[a.pos]}</b><small>Age ${a.maxAge} or under · ${a.left} week${a.left > 1 ? 's' : ''} left</small></span><button class="btn sm ghost" data-a="cancelAssign" data-id="${a.id}">Stop</button></div>`).join('') || '<p class="muted">No active assignments.</p>'}</div>
        ${free > 0 ? `<div class="two">
          <div class="field"><label for="aReg">Region</label>${selectHtml('aReg', REGIONS, f.region, 'af', 'data-k="region"')}</div>
          <div class="field"><label for="aPos">Position</label>${selectHtml('aPos', ['Any', ...POSITIONS], f.pos, 'af', 'data-k="pos"')}</div>
          <div class="field"><label for="aAge">Max age</label>${selectHtml('aAge', [19, 21, 23, 25, 28, 30, 35], f.maxAge, 'af', 'data-k="maxAge" data-n="1"')}</div>
          <div class="field"><label for="aWk">Duration</label>${selectHtml('aWk', [[2, '2 weeks'], [4, '4 weeks'], [8, '8 weeks']], f.weeks, 'af', 'data-k="weeks" data-n="1"')}</div></div>
          <button class="btn pri wide" data-a="addAssign">Send a scout (£15k a week)</button>` : '<p class="note">Every scout is busy. Hire more scouts in Staff.</p>'}
      </div>
      <div class="sec-h"><h2>Reports</h2><span class="muted">${G.scout.reports.length}</span></div>
      <div class="list">${G.scout.reports.map(r => { const p = G.players[r.pid]; return p ? playerRow(p, `<span class="grade g${r.grade}">${r.grade}</span>`, { sub: GRADE_NOTE[r.grade] }) : ''; }).join('') || empty('No reports yet', 'Scouts file reports each week while on assignment.')}</div>`;
  },
  pitch() {
    const list = G.pitches.filter(x => G.players[x.pid] && G.players[x.pid].club !== G.club);
    return `<p class="muted">Agents offer players who fit your weakest position. Bid the asking price and the selling club accepts.</p>
      <div class="list">${list.map(x => playerRow(G.players[x.pid], `<span class="stat"><b>${x.ask ? money(x.ask) : 'Free'}</b><small>asking</small></span>`)).join('') || empty('No pitches right now', 'Agents get in touch while a transfer window is open.')}</div>`;
  },
  bids() {
    const open = G.news.filter(n => n.action && n.action.t === 'bid');
    const listed = seniorSquad(G.club).filter(p => p.listed);
    return `<div class="sec-h"><h2>Offers for your players</h2></div>
      <div class="list">${open.map(newsRow).join('') || empty('No offers', 'Transfer-listed players attract more bids.')}</div>
      <div class="sec-h"><h2>Transfer listed</h2></div>
      <div class="list">${listed.map(p => playerRow(p, `<span class="stat"><b>${money(pValue(p))}</b><small>value</small></span>`, { noBadge: true })).join('') || empty('Nobody listed', 'List players from their profile to invite bids.')}</div>`;
  },
  hist() {
    return `<div class="list">${G.tHist.slice(0, 60).map(t => `<div class="row tx ${t.to === G.club || t.from === G.club ? 'me' : ''}"><span class="grow"><b>${esc(t.name)}</b><small>${fmtDate(t.date, false)} · ${esc(clubName(t.from))} → ${esc(clubName(t.to))}</small></span><span class="stat"><b>${t.fee ? money(t.fee) : 'Free'}</b></span></div>`).join('') || empty('No transfers yet', 'Completed deals across the league appear here.')}</div>`;
  },
};
CHG.sf = (v, ds) => { UI.search[ds.k] = ds.n ? +v : v; render(); };
CHG.af = (v, ds) => { UI.tab.newAssign[ds.k] = ds.n ? +v : v; };
ACT.addAssign = () => { const f = UI.tab.newAssign; if (addAssignment(f.region, f.pos, f.maxAge, f.weeks)) toast('Scout dispatched.'); else toast('No scout is free.'); render(); };
ACT.cancelAssign = ds => { G.scout.assign = G.scout.assign.filter(a => a.id !== +ds.id); render(); };

/* ---------- offer & contract negotiation ---------- */
ACT.offer = ds => {
  const p = G.players[+ds.id];
  if (G.clubs[p.club].fa) return contractSheet(p.id, 0, 'buy');
  if (!UI.neg || UI.neg.pid !== p.id) UI.neg = { pid: p.id, fee: roundMoney(pValue(p)) };
  offerSheet();
};
function offerSheet(msg) {
  const N = UI.neg, p = G.players[N.pid], est = knowOf(p) >= 50 ? askingPrice(p) : null;
  const step = N.fee >= 20e6 ? 1e6 : N.fee >= 2e6 ? 250e3 : 50e3;
  sheet(`<h3 class="sh-t">Offer for ${esc(fullName(p))}</h3><p class="muted">${esc(clubName(p.club))} · value ${money(pValue(p))}${est ? ' · scout thinks they want about ' + money(est) : ''}</p>
    <div class="stepper"><button class="btn" data-a="feeStep" data-v="${-step * 4}">−−</button><button class="btn" data-a="feeStep" data-v="${-step}">−</button><b>${money(N.fee)}</b><button class="btn" data-a="feeStep" data-v="${step}">+</button><button class="btn" data-a="feeStep" data-v="${step * 4}">++</button></div>
    <p class="muted c">Transfer budget ${money(G.fin.tb)}</p>
    ${msg ? `<p class="note">${esc(msg.text)}</p>${msg.counter ? `<button class="btn wide" data-a="feeSet" data-v="${msg.counter}">Match their price: ${money(msg.counter)}</button>` : ''}` : ''}
    <button class="btn pri wide" data-a="sendBid">Submit offer</button>`, { onClose: () => render() });
}
ACT.feeStep = ds => { UI.neg.fee = Math.max(0, roundMoney(UI.neg.fee + +ds.v)); offerSheet(); };
ACT.feeSet = ds => { UI.neg.fee = +ds.v; ACT.sendBid(); };
ACT.sendBid = () => {
  const N = UI.neg, res = makeBid(N.pid, N.fee);
  if (res.r === 'accept') { toast(res.msg); return contractSheet(N.pid, res.fee, 'buy'); }
  offerSheet({ text: res.msg, counter: res.r === 'counter' ? res.fee : null });
};

ACT.contract = ds => contractSheet(+ds.id, 0, ds.mode || 'renew');
function contractSheet(pid, fee, mode, msg) {
  const p = G.players[pid];
  if (!UI.con || UI.con.pid !== pid || UI.con.mode !== mode) {
    const d = wageDemand(p, mode === 'renew');
    UI.con = { pid, fee, mode, wage: d, years: p.age >= 31 ? 1 : 3, status: mode === 'renew' ? p.status : (p.ca >= userBestAt(p.pos) ? 'First team' : 'Rotation'), tries: 0 };
  }
  const C = UI.con, step = C.wage >= 50000 ? 5000 : C.wage >= 10000 ? 1000 : 250;
  sheet(`<h3 class="sh-t">${mode === 'renew' ? 'New contract' : 'Personal terms'}: ${esc(pname(p))}</h3>
    <p class="muted">${mode === 'renew' ? 'Current wage ' + wageFmt(p.wage) + ' · ends June ' + p.con : (fee ? 'Fee agreed: ' + money(fee) : 'Free transfer')}. Agent's opening demand: ${wageFmt(wageDemand(p, mode === 'renew'))}.</p>
    <h4 class="lbl">Weekly wage</h4>
    <div class="stepper"><button class="btn" data-a="wStep" data-v="${-step * 5}">−−</button><button class="btn" data-a="wStep" data-v="${-step}">−</button><b>${wageFmt(C.wage)}</b><button class="btn" data-a="wStep" data-v="${step}">+</button><button class="btn" data-a="wStep" data-v="${step * 5}">++</button></div>
    <h4 class="lbl">Length</h4><div class="seg">${[1, 2, 3, 4, 5].map(y => `<button class="${C.years === y ? 'on' : ''}" data-a="cYears" data-v="${y}">${y} yr</button>`).join('')}</div>
    <h4 class="lbl">Squad status promise</h4><div class="chips">${['Key player', 'First team', 'Rotation', 'Backup', 'Prospect'].map(s => `<button class="chip ${C.status === s ? 'on' : ''}" data-a="cStatus" data-v="${s}">${s}</button>`).join('')}</div>
    <p class="muted">Wage budget: ${wageFmt(clubWageBill(userClub()))} used of ${wageFmt(G.fin.wb)}. Promising a bigger role lowers the wage demand.</p>
    ${msg ? `<p class="note">${esc(msg)}</p>` : ''}
    <button class="btn pri wide" data-a="sendContract">Offer contract</button>`, { onClose: () => render() });
}
ACT.wStep = ds => { UI.con.wage = Math.max(300, roundWage(UI.con.wage + +ds.v)); contractSheet(UI.con.pid, UI.con.fee, UI.con.mode); };
ACT.cYears = ds => { UI.con.years = +ds.v; contractSheet(UI.con.pid, UI.con.fee, UI.con.mode); };
ACT.cStatus = ds => { UI.con.status = ds.v; contractSheet(UI.con.pid, UI.con.fee, UI.con.mode); };
ACT.sendContract = () => {
  const C = UI.con, res = offerContract(C.pid, C.wage, C.years, C.status, C.fee, C.mode);
  if (res.ok) {
    G.news.forEach(n => { if (n.action && n.action.t === 'renew' && n.action.pid === C.pid) n.done = true; });
    UI.con = null; UI.neg = null; closeSheet(true); toast(res.msg); saveGame(); render(); return;
  }
  C.tries++;
  if (C.tries >= 4 && !res.msg.startsWith('The board')) { UI.con = null; closeSheet(true); toast('Talks have broken down. The player has walked away for now.'); render(); return; }
  contractSheet(C.pid, C.fee, C.mode, res.msg + (C.tries >= 2 ? ` Patience is running out (${4 - C.tries} tries left).` : ''));
};

/* ---------- finance ---------- */
SCREENS.finance = {
  render() {
    const c = userClub(), L = G.ledger, bill = clubWageBill(c);
    const inc = [['TV money', L.tv], ['Gate receipts', L.gate], ['Sponsorship', L.spon], ['Merchandise', L.merch], ['Player sales', L.sales], ['Prize money', L.prize]];
    const exp = [['Player wages', L.wages], ['Staff wages', L.staff], ['Transfer fees', L.buys], ['Running costs', L.ops], ['Scouting', L.scout]];
    const ti = sum(inc, x => x[1]), te = sum(exp, x => x[1]);
    const h = G.balHist, mn = Math.min(...h, 0), mx = Math.max(...h, 1), W = 320, H = 90;
    const pts = h.map((v, i) => `${(i / Math.max(1, h.length - 1)) * W},${H - ((v - mn) / (mx - mn || 1)) * (H - 10) - 5}`).join(' ');
    const top = seniorSquad(G.club).sort((a, b) => b.wage - a.wage).slice(0, 8);
    return `<h1 class="h1">Finances</h1>
      <div class="tiles">
        <div class="tile"><small>Balance</small><b class="${c.bal < 0 ? 'bad' : ''}">${money(c.bal)}</b><span>${c.bal < 0 ? 'In the red' : 'Healthy'}</span></div>
        <div class="tile"><small>Transfer budget</small><b>${money(G.fin.tb)}</b><span>50% of sale fees added</span></div>
        <div class="tile"><small>Wage bill</small><b>${wageFmt(bill)}</b>${bar(bill / G.fin.wb * 100, bill > G.fin.wb ? 'bad' : bill > G.fin.wb * 0.95 ? 'warn' : 'good')}</div>
        <div class="tile"><small>Wage budget</small><b>${wageFmt(G.fin.wb)}</b><span>${wageFmt(Math.max(0, G.fin.wb - bill))} free</span></div>
      </div>
      <div class="card"><h3>Balance trend</h3>${h.length < 3 ? '<p class="muted">The trend fills in as the weeks pass.</p>' : `<svg class="spark" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" role="img" aria-label="Club balance over recent weeks"><polyline points="0,${H} ${pts} ${W},${H}" class="area"/><polyline points="${pts}" class="line"/></svg><div class="spark-l"><span>${money(mn)}</span><span>${money(mx)}</span></div>`}</div>
      <div class="card"><h3>Adjust budgets</h3><p class="muted">Every £1k a week of wage budget is worth £100k of transfer budget.</p>
        <div class="btns">${[[-10000, '−£10k/w wages'], [-1000, '−£1k/w'], [1000, '+£1k/w'], [10000, '+£10k/w wages']].map(([v, n]) => `<button class="btn sm" data-a="budget" data-v="${v}">${n}</button>`).join('')}</div></div>
      <div class="two">
        <div class="card"><h3>Income <small>${seasonLabel()}</small></h3>${inc.map(([n, v]) => `<div class="kvrow"><span>${n}</span><b>${money(v)}</b></div>`).join('')}<div class="kvrow tot"><span>Total</span><b>${money(ti)}</b></div></div>
        <div class="card"><h3>Expenditure</h3>${exp.map(([n, v]) => `<div class="kvrow"><span>${n}</span><b>${money(v)}</b></div>`).join('')}<div class="kvrow tot"><span>Total</span><b>${money(te)}</b></div></div>
      </div>
      <div class="sec-h"><h2>Highest earners</h2></div>
      <div class="list">${top.map(p => playerRow(p, `<span class="stat"><b>${wageFmt(p.wage)}</b><small>to ${p.con}</small></span>`, { noBadge: true })).join('')}</div>`;
  },
};
ACT.budget = ds => { if (!adjustBudgets(+ds.v)) toast('Not enough budget to move.'); render(); };

/* ---------- staff ---------- */
SCREENS.staff = {
  render() {
    const row = (s, hire) => `<div class="row"><span class="grow"><b>${esc(s.name)}</b><small>${s.role} · age ${s.age} · ${wageFmt(s.wage)}</small></span><span class="rt ${s.rating >= 15 ? 'good' : s.rating < 8 ? 'bad' : ''}">${s.rating}</span>${hire ? `<button class="btn sm" data-a="hire" data-id="${s.id}">Hire</button>` : `<button class="btn sm ghost" data-a="fire" data-id="${s.id}">Release</button>`}</div>`;
    return `<h1 class="h1">Staff</h1>
      ${Object.keys(STAFF_ROLES).map(role => `<div class="sec-h"><h2>${role}s</h2><span class="muted">${staffOf(role).length}/${STAFF_ROLES[role]} · ${STAFF_DESC[role]}</span></div><div class="list">${staffOf(role).map(s => row(s)).join('') || '<p class="muted">Vacant</p>'}</div>`).join('')}
      <div class="sec-h"><h2>Available to hire</h2><span class="muted">Refreshes every six weeks</span></div>
      <div class="list">${G.staffPool.map(s => row(s, true)).join('')}</div>`;
  },
};
ACT.hire = ds => {
  const s = G.staffPool.find(x => x.id === +ds.id);
  if (staffOf(s.role).length >= STAFF_ROLES[s.role]) return toast(`You already have the maximum number of ${s.role.toLowerCase()}s. Release one first.`);
  G.staff.push(s); G.staffPool = G.staffPool.filter(x => x !== s);
  toast(`${s.name} joins as ${s.role.toLowerCase()}.`); render();
};
ACT.fire = ds => {
  const s = G.staff.find(x => x.id === +ds.id);
  const comp = s.wage * 4;
  userClub().bal -= comp; G.ledger.staff += comp;
  G.staff = G.staff.filter(x => x !== s);
  if (s.role === 'Scout' && G.scout.assign.length > staffOf('Scout').length) G.scout.assign.pop();
  toast(`${s.name} released. Paid ${money(comp)}.`); render();
};

/* ---------- board ---------- */
SCREENS.board = {
  render() {
    const B = G.board, pos = tablePos(G.club), started = leagueTable().find(r => r.id === G.club).p > 0;
    const moodB = B.conf >= 75 ? 'Delighted' : B.conf >= 55 ? 'Pleased' : B.conf >= 35 ? 'Concerned' : B.conf >= 15 ? 'Unhappy' : 'Furious';
    const moodF = B.fans >= 75 ? 'Adoring' : B.fans >= 55 ? 'Supportive' : B.fans >= 35 ? 'Restless' : 'Hostile';
    return `<h1 class="h1">Board & fans</h1>
      <div class="card"><div class="kvrow"><span>Board confidence</span><b>${moodB}</b></div>${bar(B.conf, B.conf < 30 ? 'bad' : B.conf < 55 ? 'warn' : 'good')}
        <div class="kvrow"><span>Supporter confidence</span><b>${moodF}</b></div>${bar(B.fans, B.fans < 35 ? 'bad' : B.fans < 55 ? 'warn' : 'good')}</div>
      <div class="card"><h3>Season objective</h3><p><b>${esc(B.target.text)}</b></p><p class="muted">${started ? `Currently ${ordinal(pos)}. Target: ${ordinal(B.target.pos)} or better.` : 'The season has not started yet.'} Falling far short with low confidence ends in the sack.</p></div>
      <div class="sec-h"><h2>Requests</h2></div>
      <div class="list">
        <button class="row act" data-a="req" data-k="funds"><span class="grow"><b>Ask for more transfer funds</b><small>Once per window. Needs confidence and a healthy balance.</small></span><span class="chev">›</span></button>
        <button class="row act" data-a="req" data-k="train"><span class="grow"><b>Upgrade training facilities</b><small>Level ${B.facTrain}. Faster player development.</small></span><span class="chev">›</span></button>
        <button class="row act" data-a="req" data-k="youth"><span class="grow"><b>Upgrade youth facilities</b><small>Level ${B.facYouth}. Better youth intakes.</small></span><span class="chev">›</span></button>
      </div>`;
  },
};
ACT.req = ds => { toast(boardRequest(ds.k)); render(); };
