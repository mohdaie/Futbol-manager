'use strict';
// Loan terms are agreed together: fixed term, fee, wage split, purchase clause and recall right.
ACT.loan = ds => loanSheet(+ds.id);
function loanSheet(pid) {
  const p = G.players[pid]; if (!p) return toast('That player is unavailable.');
  const outgoing = p.club === G.club, hostOptions = domesticClubs().filter(id => id !== (outgoing ? G.club : p.club));
  if (!outgoing && (p.club === 'FA' || !inWindow())) return toast(p.club === 'FA' ? 'Free agents cannot be loaned.' : 'Loan deals need an open transfer window.');
  if (activeLoan(p)) return toast('This player is already on loan.');
  const maxTerm = Math.min(38, (p.con - G.season) * 38 - (G.week || 0));
  if (maxTerm < 8) return toast('The parent-club contract does not cover a minimum loan term.');
  const direction = outgoing ? 'Loan out' : 'Loan in', host = outgoing ? (UI.loanForm?.pid === pid ? UI.loanForm.host : hostOptions[0]) : G.club;
  UI.loanForm = UI.loanForm?.pid === pid ? UI.loanForm : { pid, host, duration: Math.min(26,maxTerm), fee: Math.round(pValue(p) * .08), wageShare: 100, optionFee: 0, obligationApps: 0, recall: true };
  const F = UI.loanForm;
  F.duration = Math.min(F.duration,maxTerm);
  const terms = [[8,'8 weeks'],[16,'16 weeks'],[26,'Half season · 26 weeks'],[38,'Season long · 38 weeks']].filter(([weeks])=>weeks<=maxTerm);
  if (!terms.some(([weeks])=>weeks===maxTerm)) terms.push([maxTerm,`Contract limit · ${maxTerm} weeks`]);
  sheet(`<div class="eyebrow">${direction} · ${esc(fullName(p))}</div><h3 class="sh-t">Loan agreement</h3>
    <p class="muted">A temporary registration with a fixed return date. Agree the fee, wage contribution and any purchase or recall clauses.</p>
    ${outgoing ? `<div class="field"><label for="loanHost">Loan destination</label>${selectHtml('loanHost', hostOptions.map(id=>[id,clubName(id)]), F.host, 'loanField', 'data-k="host"')}</div>` : `<p>Parent club: <b>${esc(clubName(p.club))}</b></p>`}
    <div class="two"><div class="field"><label for="loanDuration">Duration</label>${selectHtml('loanDuration', terms, F.duration, 'loanField', 'data-k="duration"')}</div>
      <div class="field"><label for="loanWage">Loan club pays wages</label>${selectHtml('loanWage', [[100,'100%'],[75,'75%'],[50,'50%'],[25,'25%'],[0,'0%']], F.wageShare, 'loanField', 'data-k="wageShare"')}</div></div>
    <div class="field"><label for="loanFee">${outgoing ? 'Loan fee received' : 'Loan fee offered'} (£)</label><input id="loanFee" type="number" min="0" step="1000" value="${F.fee}"></div>
    <div class="field"><label for="loanOption">Purchase clause</label>${selectHtml('loanOption', [['none','No purchase clause'],['option','Option to buy'],['obligation','Obligation after appearances']], F.obligationApps ? 'obligation' : F.optionFee ? 'option' : 'none', 'loanField', 'data-k="clause"')}</div>
    <div class="field"><label for="loanOptionFee">Purchase price (£)</label><input id="loanOptionFee" type="number" min="0" step="1000" value="${F.optionFee}"></div>
    <div class="field"><label for="loanApps">Appearances to trigger obligation (0 = option only)</label><input id="loanApps" type="number" min="0" max="50" value="${F.obligationApps}"></div>
    <label class="check"><input id="loanRecall" type="checkbox" ${F.recall ? 'checked' : ''}> Parent club may recall during a transfer window</label>
    <p class="muted">Current wage ${wageFmt(p.wage)}/week · loan club share ${wageFmt(Math.round(p.wage * F.wageShare / 100))}/week. FIFA's standard framework uses a written agreement with duration and financial terms.</p>
    <div class="btns"><button class="btn pri wide" data-a="loanSubmit" data-id="${p.id}">Submit ${direction.toLowerCase()} proposal</button><button class="btn wide ghost" data-a="closeSheet">Cancel</button></div>`, { key: 'loan:' + pid, restore: () => loanSheet(pid), valid: () => !!G?.players[pid] });
}
CHG.loanField = (v, ds) => { const F=UI.loanForm;if(ds.k==='host')F.host=v;else if(ds.k==='clause'&&v==='none'){F.optionFee=0;F.obligationApps=0;}else if(ds.k==='clause'&&v==='option')F.obligationApps=0;else if(ds.k==='clause'&&v==='obligation'&&!F.obligationApps)F.obligationApps=15;else F[ds.k]=+v; };
ACT.loanSubmit = ds => {
  const p=G.players[+ds.id], F=UI.loanForm;if(!p||!F)return;
  const fee=+document.getElementById('loanFee')?.value||0, clause=document.getElementById('loanOption')?.value||'none';
  const optionFee=clause==='none'?0:+document.getElementById('loanOptionFee')?.value||0;
  const obligationApps=clause==='obligation'?(+document.getElementById('loanApps')?.value||15):0, recall=!!document.getElementById('loanRecall')?.checked;
  const host=p.club===G.club?F.host:G.club, result=loanOffer(p.id,host,{...F,fee,optionFee,obligationApps,recall});
  if(result.error)return toast(result.error);
  closeSheet(true);saveGame();toast(result.msg);render();
};
TR_TABS.loans = () => {
  const list=Object.values(G.players).filter(p=>activeLoan(p)&&(p.loan.parent===G.club||p.loan.host===G.club)).sort((a,b)=>a.loan.end-b.loan.end);
  return `<p class="muted">Temporary registrations carry their own expiry, loan fee, wage contribution, recall right and optional or appearance-triggered purchase clause.</p>
    <div class="list">${list.map(p=>{const l=p.loan, mineIn=l.host===G.club;return `<div class="row"><span class="grow"><b>${playerLink(p.id,fullName(p))}</b><small>${mineIn?'Loaned in from':'Loaned out to'} ${esc(clubName(mineIn?l.parent:l.host))} · ends ${fmtDate(l.end,false)} · fee ${money(l.fee)} · wages ${l.wageShare}%${l.optionFee?' · purchase '+money(l.optionFee):''}</small></span>${l.parent===G.club&&l.recall?`<button class="btn sm" data-a="loanRecall" data-id="${p.id}">Recall</button>`:''}${mineIn&&l.optionFee&&!l.obligationApps?`<button class="btn sm" data-a="loanBuy" data-id="${p.id}">Buy</button>`:''}</div>`}).join('')||'<p class="muted">No active loans.</p>'}</div>`;
};
ACT.loanRecall=ds=>{const r=recallLoan(+ds.id);if(r.error)return toast(r.error);saveGame();toast('Player recalled.');render();};
ACT.loanBuy=ds=>{const p=G.players[+ds.id];if(!inWindow())return toast('A purchase option can only be completed during a transfer window.');if(!p||!endLoan(p,'purchase option exercised',true))return toast('Your club cannot complete the purchase at the agreed price.');saveGame();toast(`${fullName(p)} joins permanently.`);render();};
