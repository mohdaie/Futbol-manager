'use strict';
/* ===== screens-deals.js =====
   Transfers > Deals and the deal sheet: stage progress, what the manager must decide, the agreed terms,
   the Director of Football's memo and the timeline of every step. */

const WHO_TXT = { dof: 'Director of Football', club: 'Club', agent: 'Agent', player: 'Player', medical: 'Medical', you: 'You', done: 'Done', fail: 'Off' };
function dealStages(d) {
  const st = d.loanTerms ? [['interest', 'Approach'], ['bid', 'Club agreement'], ['player', 'Player'], ['medical', 'Medical'], ['final', 'Sign']] : DEAL_STAGES[d.dir], i = st.findIndex(s => s[0] === d.stage);
  return `<ol class="dstages">${st.map((s, k) => `<li class="${d.closed ? (d.closed.ok || k < i ? 'ok' : k === i ? 'off' : '') : k < i ? 'ok' : k === i ? 'now' : ''}">${s[1]}</li>`).join('')}</ol>`;
}
function dealStatus(d) {
  const p = G.players[d.pid];
  if (d.closed) return d.closed.why;
  if (d.need) return { loancounter: 'Loan counteroffer: your decision', finalloan: 'Ready to complete loan: your decision', meeting: 'Meet the Director of Football', bidlimit: 'Their price is above your limit', notforsale: 'Not for sale', agentfee: 'The agent wants his fee', wagelimit: 'Wage demand above your limit', final: 'Ready to sign: your decision', offer: 'An offer: your decision', finalout: 'Sale ready: your decision' }[d.need.k] || 'Your decision';
  const days = d.next != null ? Math.max(0, d.next - dayAbs()) : 0;
  const what = { review: 'Director of Football reviewing the file', interest: 'Sounding out his club and agent', bid: d.bidOut ? 'Waiting for the club\'s answer' : 'Preparing an offer', agent: 'Talking to his agent', terms: 'Negotiating personal terms', player: `Waiting for ${p ? pname(p) : 'the player'} to decide`, medical: 'Medical', offer: 'Waiting for their answer', talks: 'In talks' }[d.stage] || '';
  return what + (days ? ` · ${days} day${days > 1 ? 's' : ''}` : '') + (!inWindow() && (d.loanTerms || WINDOW_STAGES.includes(d.stage)) ? ' · waits for the window' : '');
}
function dealRow(d) {
  const p = G.players[d.pid];
  if (!p) return '';
  const sub = `${d.loanTerms ? 'Loan · ' : ''}${d.dir === 'out' ? '→ ' + clubName(d.to) : d.dir === 'ai' ? clubName(d.from) + ' → ' + clubName(d.to) : clubName(d.from)} · ${dealStatus(d)}`;
  return `<button class="row act deal ${d.need ? 'need' : ''} ${d.closed ? (d.closed.ok ? 'won' : 'lost') : ''}" data-a="deal" data-id="${d.id}"><span class="grow"><b>${esc(fullName(p))}</b><small>${esc(sub)}</small></span>${d.need ? '<em class="tag warn">Decide</em>' : ''}<span class="chev">›</span></button>`;
}

TR_TABS.deals = () => {
  const open = G.deals.filter(dealOpen), need = open.filter(d => d.need), mine = open.filter(d => !d.need && d.dir === 'in'), sell = open.filter(d => !d.need && d.dir === 'out');
  const league = open.filter(d => d.dir === 'ai').slice(0, 8), closed = G.deals.filter(d => d.closed && d.dir !== 'ai').slice(0, 10);
  const sec = (t, list, e) => `<div class="sec-h"><h2>${t}</h2><span class="muted">${list.length}</span></div><div class="list">${list.map(dealRow).join('') || (e ? empty(e[0], e[1]) : '')}</div>`;
  return `<div class="card"><h3>Director of Football <small>${staffOf('Director')[0] ? esc(staffOf('Director')[0].name) + ' · rating ' + staffOf('Director')[0].rating : 'Vacant'}</small></h3>
      <p class="muted">Every player your scouts file at 90% or more comes to him. He reviews finance, tactics and harmony, meets you, then runs the deal within the limits you set. You make the final call.</p></div>
    ${sec('Needs your decision', need, ['Nothing to decide', 'Decisions on deals appear here.'])}
    ${sec('Signing', mine, ['No deals in progress', 'Scout a player fully, or open a player and choose Make an offer.'])}
    ${sell.length ? sec('Selling', sell) : ''}
    ${league.length ? sec('Around the league', league) : ''}
    ${closed.length ? sec('Recently closed', closed) : ''}`;
};

// These drafts stay separate from agreed terms until the manager submits them.
function dealTermsDraft(d) {
  if (UI.dealTerms?.id !== d.id) UI.dealTerms = { id: d.id, ...transferProposal(d) };
  return UI.dealTerms;
}
function readDealTerms(d) {
  const draft = dealTermsDraft(d);
  for (const k of Object.keys(TRANSFER_TERMS_DEFAULT)) {
    const field = document.getElementById('dt-' + k);if (field) draft[k] = +field.value;
  }
  const { id, ...terms } = draft;return terms;
}
function dealTermsHtml(d) {
  const p = G.players[d.pid];if (G.clubs[d.from].fa) return '<p class="muted">Free transfer: no club fee, instalments, exchange or former-club clauses. Agent fees and signing bonus are paid upfront.</p>';
  const f = dealTermsDraft(d), rule = instalmentPolicy(d.fee || d.memo?.max || 0, G.clubs[d.from]);
  const candidates = squadOf(d.to).filter(q => q.id !== p.id && !G.deals.some(x => x.id !== d.id && dealOpen(x) && (x.pid === q.id || x.proposal?.exchangePid === q.id)));
  const select = (key, options) => selectHtml('dt-' + key, options, f[key], 'dealTerms', `data-k="${key}"`);
  return `<section class="fsec transfer-package"><h4>Proposed transfer package</h4>
    <div class="two"><div class="field"><label for="dt-years">Deferred payments</label>${select('years', [[0,'Pay all upfront'],[1,'1 annual payment'],[2,'2 annual payments'],[3,'3 annual payments']])}</div>
    <div class="field"><label for="dt-upfrontPct">Cash paid upfront</label>${select('upfrontPct', [[25,'25%'],[40,'40%'],[50,'50%'],[75,'75%'],[100,'100%']])}</div></div>
    <p class="muted">Club policy for this fee: at least ${rule.upfrontPct}% upfront, up to ${rule.years} years. Subject to club and agent agreement. The full guaranteed cash fee uses transfer budget; instalments spread bank payments.</p>
    <div class="field"><label for="dt-exchangePid">Optional player exchange</label>${select('exchangePid', [[0,'No player exchange'],...candidates.map(q=>[q.id,fullName(q)+' · '+q.pos])])}</div>
    <div class="field"><label for="dt-exchangeValue">Agreed exchange value (£, additional to cash)</label><input id="dt-exchangeValue" type="number" min="0" max="10000000000" step="1000" value="${f.exchangeValue}" data-c="dealTerms" data-k="exchangeValue"></div>
    <div class="two"><div class="field"><label for="dt-sellOnPct">Former club’s next-sale share (%)</label><input id="dt-sellOnPct" type="number" min="0" max="50" value="${f.sellOnPct}" data-c="dealTerms" data-k="sellOnPct"></div>
    <div class="field"><label for="dt-buyBackPrice">Former club’s buy-back price (£, 0 = none)</label><input id="dt-buyBackPrice" type="number" min="0" max="10000000000" step="1000" value="${f.buyBackPrice}" data-c="dealTerms" data-k="buyBackPrice"></div></div>
    <div class="field"><label for="dt-buyBackYears">Buy-back right expires after</label>${select('buyBackYears', [[1,'1 year'],[2,'2 years'],[3,'3 years']])}</div>
    <p class="muted">Sell-on is a percentage of the next total sale package, including agreed exchange value. Buy-back is a fixed price and still needs player agreement. Exchange players and their agents can refuse; their wages and agent fees must be affordable.</p></section>`;
}
CHG.dealTerms = (value, ds) => {
  const d = G.deals.find(x => x.id === UI.dealTerms?.id);if (!d) return;
  readDealTerms(d);UI.dealTerms[ds.k] = +value;
  if (ds.k === 'exchangePid') { UI.dealTerms.exchangeValue = +value ? pValue(G.players[+value]) : 0;dealSheet(d.id); }
};
function dealSheet(id) {
  const d = G.deals.find(x => x.id === id);
  if (!d) return toast('That deal has been cleared.');
  const p = G.players[d.pid], M = d.memo, n = d.need;
  const memoHtml = M ? `<section class="fsec memo"><h4>Director of Football's memo <small>${fmtDate(M.date, false)} · file ${M.k}% · rating ${M.r}</small></h4>
      <div class="memo-v v-${M.verdict.toLowerCase()}"><b>${M.verdict}</b><span>${DOF_SAYS[M.verdict]}</span></div>
      ${(() => { const w = dofWords(d); return w ? `<blockquote class="aiq">${esc(w)}</blockquote>` : ''; })()}
      ${M.jev && !M.jev.pending ? `<p class="muted">AI second opinion: <b>${M.jev.choice}</b> (${Math.round(M.jev.conf * 100)}% sure)${M.rules ? `. He changed his verdict from ${M.rules}.` : ''}</p>` : ''}
      ${[['Finance', M.fin], ['Tactics', M.tac], ['Harmony', M.har]].map(([t, l]) => `<h5>${t}</h5><ul class="notes">${l.map(([k, txt]) => `<li class="${k}">${esc(txt)}</li>`).join('') || '<li>Nothing to note.</li>'}</ul>`).join('')}
      ${M.k < 90 ? `<p class="note">The file is only ${M.k}% complete, so this is a rougher judgement.</p>` : ''}</section>` : '';
  let act = '';
  if (n && n.k === 'meeting') {
    const F = UI.dealForm && UI.dealForm.id === d.id ? UI.dealForm : (UI.dealForm = { id: d.id, approach: 'quiet', fee: M.max || 0, wage: M.wmax });
    const fs = F.feeStep ??= F.fee >= 20e6 ? 1e6 : F.fee >= 2e6 ? 250e3 : 50e3;
    const ws = F.wageStep ??= F.wage >= 50000 ? 5000 : F.wage >= 10000 ? 1000 : 250;
    act = `<section class="fsec"><h4>Your decision</h4>
      <h5>Approach</h5><div class="seg">${[['quiet', 'Quiet talks'], ['open', 'Open approach'], ['leak', 'Leak to the press']].map(([k, t]) => `<button class="${F.approach === k ? 'on' : ''}" data-a="dealForm" data-k="approach" data-v="${k}">${t}</button>`).join('')}</div>
      <p class="muted">${{ open: 'An open approach to his club: quicker, but public. Rivals and the press will hear.', quiet: 'Quiet talks with his agent first: slower and private, unless it leaks. Your Press Officer keeps it quiet.', leak: 'Let the press know: he will be flattered and keener, but his club will ask for more.' }[F.approach]}</p>
      ${M.est ? `<h5>Most you will pay <small>(he estimates ${money(M.est)})</small></h5><div class="stepper"><button class="btn" aria-label="Lower fee by ${moneyExact(fs * 4)}" data-a="dealForm" data-k="fee" data-v="${-fs * 4}">−−</button><button class="btn" aria-label="Lower fee by ${moneyExact(fs)}" data-a="dealForm" data-k="fee" data-v="${-fs}">−</button><b aria-live="polite" aria-atomic="true">${moneyExact(F.fee)}</b><button class="btn" aria-label="Raise fee by ${moneyExact(fs)}" data-a="dealForm" data-k="fee" data-v="${fs}">+</button><button class="btn" aria-label="Raise fee by ${moneyExact(fs * 4)}" data-a="dealForm" data-k="fee" data-v="${fs * 4}">++</button></div>` : ''}
      <h5>Most wage a week <small>(he expects about ${wageFmt(M.wage)})</small></h5><div class="stepper"><button class="btn" aria-label="Lower weekly wage by ${moneyExact(ws * 5)}" data-a="dealForm" data-k="wage" data-v="${-ws * 5}">−−</button><button class="btn" aria-label="Lower weekly wage by ${moneyExact(ws)}" data-a="dealForm" data-k="wage" data-v="${-ws}">−</button><b aria-live="polite" aria-atomic="true">${moneyExact(F.wage)}/w</b><button class="btn" aria-label="Raise weekly wage by ${moneyExact(ws)}" data-a="dealForm" data-k="wage" data-v="${ws}">+</button><button class="btn" aria-label="Raise weekly wage by ${moneyExact(ws * 5)}" data-a="dealForm" data-k="wage" data-v="${ws * 5}">++</button></div>
      <p class="muted c">Budget ${money(G.fin.tb)} · wage room ${wageFmt(Math.max(0, G.fin.wb - clubWageBill(userClub())))}</p>
      ${dealTermsHtml(d)}
      <div class="btns col"><button class="btn pri wide" data-a="dealGo" data-id="${d.id}" data-k="proceed">Proceed</button><button class="btn wide" data-a="dealGo" data-id="${d.id}" data-k="monitor">Keep monitoring</button><button class="btn wide ghost" data-a="dealGo" data-id="${d.id}" data-k="drop">Drop him</button></div></section>`;
  } else if (n) {
    const btn = (k, t, cls = '') => `<button class="btn wide ${cls}" data-a="dealGo" data-id="${d.id}" data-k="${k}">${t}</button>`;
    const body = {
      loancounter: () => `<p>${esc(clubName(d.dir === 'in' ? d.from : d.to))} propose ${money(n.terms.fee)} and ${n.terms.wageShare}% of wages paid by ${esc(clubName(d.to))}.</p>` + btn('loanaccept', 'Accept revised loan terms', 'pri') + btn('walk', 'Walk away', 'ghost'),
      finalloan: () => btn('loancomplete', 'Complete the loan', 'pri') + btn('pull', 'Pull out', 'ghost'),
      bidlimit: () => btn('raise', 'Raise the limit to ' + money(n.fee), 'pri') + btn('walk', 'Walk away', 'ghost'),
      notforsale: () => btn('raise', 'Bid ' + money(n.fee) + ' anyway', 'pri') + btn('walk', 'Walk away', 'ghost'),
      agentfee: () => btn('raise', 'Pay ' + money(d.agentFee), 'pri') + btn('walk', 'Walk away', 'ghost'),
      wagelimit: () => btn('raise', 'Offer ' + wageFmt(n.wage) + ' a week', 'pri') + btn('walk', 'Walk away', 'ghost'),
      final: () => btn('complete', 'Complete the transfer', 'pri') + btn('pull', 'Pull out', 'ghost'),
      offer: () => btn('accept', 'Accept ' + money(d.fee), 'pri') + btn('counter', 'Ask for ' + money(roundMoney(d.fee * 1.2))) + btn('reject', 'Reject', 'ghost'),
      finalout: () => btn('sell', 'Sanction the sale', 'pri') + (d.buyBackTriggered ? '' : btn('block', 'Block the move', 'ghost')),
      package: () => btn('package', 'Submit revised package', 'pri') + btn('walk', 'Walk away', 'ghost'),
    }[n.k];
    act = body ? `<section class="fsec"><h4>Your decision</h4><p>${esc(n.reason || dealStatus(d))}.</p>${['offer', 'package'].includes(n.k) ? dealTermsHtml(d) : ''}<div class="btns col">${body()}</div></section>` : '';
  }
  const terms = dealSummary(d);
  sheet(`<article class="dealsheet">
    <div class="eyebrow">${d.dir === 'out' ? 'Selling' : d.dir === 'ai' ? 'Around the league' : 'Signing'} · ${esc(clubName(d.from))} → ${esc(clubName(d.to))}</div>
    <h3 class="sh-t" data-no-links>${esc(fullName(p))}</h3>
    <p class="muted">${POS_NAME[p.pos]} · ${p.age} · ${natName(p.nat)}${agentOf(p) && (d.dir !== 'in' || d.stage !== 'review') ? ' · agent ' + agentLink(agentOf(p)) : ''}</p>
    ${dealStages(d)}
    <p class="dstatus ${d.closed ? (d.closed.ok ? 'good' : 'bad') : d.need ? 'warn' : ''}">${esc(dealStatus(d))}</p>
    ${(() => { const w = agentWords(d), a = agentOf(p); return w && a ? `<section class="fsec"><h4>Message from ${esc(a.name)}</h4><blockquote class="aiq">${esc(w)}</blockquote></section>` : ''; })()}
    ${act}
    ${terms ? `<section class="fsec"><h4>Terms so far</h4><p>${esc(terms)}</p>${d.lim ? `<p class="muted">Your limits: ${money(d.lim.fee)} · ${wageFmt(d.lim.wage)} a week</p>` : ''}</section>` : ''}
    ${memoHtml}
    <section class="fsec"><h4>Timeline</h4><div class="list">${d.log.map(l => `<div class="row tl tl-${l.who}"><span class="grow"><b>${esc(l.txt)}</b><small>${fmtDate(l.date, false)} · ${WHO_TXT[l.who] || ''}</small></span></div>`).join('')}</div></section>
    <div class="btns"><button class="btn" data-a="player" data-id="${p.id}">Player profile</button>${d.dir !== 'ai' && G.scout.reports.some(r => r.pid === p.id) ? `<button class="btn" data-a="scoutFile" data-id="${p.id}">Scouting file</button>` : ''}</div>
  </article>`, { key: 'deal:' + id, restore: () => dealSheet(id), valid: () => G?.deals?.some(x => x.id === id) });
}
ACT.deal = ds => dealSheet(+ds.id);
ACT.dealForm = ds => {
  const F = UI.dealForm;
  if (ds.k === 'approach') F.approach = ds.v;
  if (ds.k === 'fee') F.fee = Math.max(0, F.fee + +ds.v);
  if (ds.k === 'wage') F.wage = Math.max(300, F.wage + +ds.v);
  dealSheet(F.id);
};
ACT.dealGo = ds => {
  const d = G.deals.find(x => x.id === +ds.id);
  if (!d || !d.need) return;
  let msg = '';
  const k = ds.k;
  if (k === 'loanaccept' && d.loanTerms && d.need.k === 'loancounter') {
    d.loanTerms = { ...d.need.terms }; d.fee = d.loanTerms.fee; d.loanAgreed = true; d.need = null; d.next = wait(1, 2);
    dealLog(d, `You accept the counteroffer: ${loanDealSummary(d)}.`, 'you'); msg = 'Revised loan terms accepted. Talks continue.';
  }
  if (k === 'loancomplete') { const result = completeLoan(d); if (result.error) return toast(result.error); msg = result.msg; }
  if (k === 'proceed') { const F = UI.dealForm; const error = dealProceed(d, F.approach, F.fee, F.wage, readDealTerms(d)); if (error) return toast(error);msg = 'The Director of Football is on it.'; }
  if (k === 'monitor') { dealMonitor(d); msg = 'Kept on file.'; }
  if (k === 'drop') { dealDrop(d); msg = 'Dropped.'; }
  if (k === 'raise') msg = dealRaise(d, d.need.k === 'wagelimit' ? d.need.wage : d.need.k === 'agentfee' ? d.agentFee : d.need.fee);
  if (k === 'walk' || k === 'pull') { dealWalk(d); msg = 'You walked away.'; }
  if (k === 'complete') { msg = completeIn(d); if (!d.closed) return toast(msg); }
  if (['accept', 'counter'].includes(k)) { const error = setTransferProposal(d, readDealTerms(d));if(error)return toast(error); }
  if (['accept', 'counter', 'reject'].includes(k)) msg = answerOffer(d, k);
  if (k === 'package') {
    const error = setTransferProposal(d, readDealTerms(d));if(error)return toast(error);
    d.need=null;d.stage=d.dir==='in'?'bid':'offer';d.bidOut=false;d.next=dayAbs()+1;msg='Revised terms sent for club and agent approval.';
  }
  if (k === 'sell') msg = completeOut(d);
  if (k === 'block') { blockOut(d); msg = 'Sale blocked.'; }
  G.news.forEach(x => { if (x.action && x.action.t === 'deal' && x.action.id === d.id) x.done = true; });
  saveGame(); toast(msg); dealSheet(d.id); render();
};
// Make an offer: the Director of Football takes it on (straight to the meeting, with a quick memo).
ACT.offer = ds => {
  const p = G.players[+ds.id];
  if (!p || p.club === G.club) return;
  const d = activeDeal(p.id, 'in');
  if (d) return dealSheet(d.id);
  const n = startDeal(p, 'review');
  DEAL_STEP.in.review(n, p);
  saveGame(); dealSheet(n.id);
};

/* ---------- agents ---------- */
const agentLink = (a, txt) => (a ? `<button class="link" data-a="agent" data-id="${a.id}">${esc(txt || a.name)}</button>` : 'None');
TR_TABS.agents = () => {
  const list = Object.values(G.agents).map(a => ({ a, n: agentClients(a.id).length, mine: agentClients(a.id).filter(p => p.club === G.club).length })).sort((x, y) => y.a.rep - x.a.rep);
  return `<p class="muted">Agents look after many players each. Their fee, their clients' wage demands and how keen a client is to join you depend on the agent and on how you have dealt with him.</p>
    <div class="list">${list.map(({ a, n, mine }) => `<button class="row act" data-a="agent" data-id="${a.id}"><span class="grow"><b>${esc(a.name)}</b><small>${esc(a.agency)} · ${n} clients${mine ? ' · ' + mine + ' at your club' : ''} · ${relLabel(agentRel(a))}</small></span><span class="rt">${a.rep}</span><span class="chev">›</span></button>`).join('')}</div>`;
};
function agentSheet(id) {
  const a = G.agents[id];
  if (!a) return;
  const cl = agentClients(id).sort((x, y) => y.ca - x.ca), mine = cl.filter(p => p.club === G.club), rel = agentRel(a);
  const moves = G.tHist.filter(t => G.players[t.pid] && G.players[t.pid].ag === id).slice(0, 8);
  const byClub = {};
  cl.forEach(p => { if (!G.clubs[p.club].fa) byClub[p.club] = (byClub[p.club] || 0) + 1; });
  const strong = Object.entries(byClub).filter(([, n]) => n >= 3).map(([c, n]) => `${clubName(c)} (${n})`);
  sheet(`<div class="eyebrow">Agent · ${esc(a.agency)}</div><h3 class="sh-t" data-no-links>${esc(a.name)}</h3>
    <p class="muted">${esc(AGENT_STYLE[a.style])}</p>
    <div class="kv"><div><small>Reputation</small><b>${a.rep}/100</b></div><div><small>Style</small><b>${a.style}</b></div><div><small>Usual fee</small><b>${agentFeePct(a)}% of a transfer</b></div><div><small>Markets</small><b>${esc(a.markets.filter(m => m !== '*').map(m => (NATIONS[m] ? NATIONS[m].n : m)).join(', '))}${a.markets.includes('*') ? ', worldwide stars' : ''}</b></div></div>
    <div class="card"><div class="kvrow"><span>Relationship with you</span><b>${relLabel(rel)}</b></div>${bar(50 + rel, rel <= -10 ? 'bad' : rel < 10 ? 'warn' : 'good')}${a.last ? `<p class="muted">Last: ${esc(a.last.txt)} (${a.last.d > 0 ? '+' : ''}${a.last.d}), ${fmtDate(a.last.date, false)}.</p>` : ''}
      <p class="muted">${rel >= 10 ? 'He will push his clients towards your club and pitch players to you.' : rel <= -25 ? 'He will not pitch players to you, and his clients are harder to sign.' : 'Completed deals improve it; pulling out late or blocking a client\'s move hurts it.'}</p></div>
    ${strong.length ? `<p class="note">Power at: ${esc(strong.join(', '))}. Several clients at one club give him leverage there.</p>` : ''}
    ${mine.length ? `<div class="sec-h"><h2>At your club</h2><span class="muted">${mine.length}</span></div><div class="list">${mine.map(p => playerRow(p, '', { noBadge: true })).join('')}</div>` : ''}
    <div class="sec-h"><h2>Clients</h2><span class="muted">${cl.length}</span></div><div class="list">${cl.filter(p => p.club !== G.club).slice(0, 25).map(p => playerRow(p, `<span class="stat"><b>${money(pValue(p))}</b><small>value</small></span>`)).join('')}</div>
    ${moves.length ? `<div class="sec-h"><h2>Recent moves</h2></div><div class="list">${moves.map(t => `<div class="row"><span class="grow"><b>${playerLink(t.pid, t.name)}</b><small>${fmtDate(t.date, false)} · ${clubLink(t.from)} → ${clubLink(t.to)}</small></span><span class="stat"><b>${t.fee ? money(t.fee) : 'Free'}</b></span></div>`).join('')}</div>` : ''}`,
  { key: 'agent:' + id, restore: () => agentSheet(id), valid: () => !!G?.agents?.[id] });
}
ACT.agent = ds => agentSheet(ds.id);

ACT.buyBack = ds => { const result=activateBuyBack(+ds.id);if(result.error)return toast(result.error);saveGame();dealSheet(result.deal.id); };
