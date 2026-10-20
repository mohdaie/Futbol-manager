'use strict';
/* ===== screens-staff.js =====
   Staff room (all staff advice in one place) and the staff cards shown on Training, Medical, Transfers
   and the match report. Admin > AI Staff reviews and approves the staff learning tables. */

const staffHead = (role, title) => { const s = staffOf(role), r = staffR(role); return `<h3>${title} <small>${s.length ? esc(s.map(x => x.name).join(', ')) + ' · ' : ''}${Math.round(r)}/20</small></h3>`; };
const evidenceLine = key => { const e = typeof staffEvidence === 'function' ? staffEvidence(key) : null; return e ? `<p class="muted">From experience (${e.n} similar cases): ${e.mean >= 0 ? 'this has worked' : 'this has not worked well'} on average.</p>` : ''; };

function analystCard(full) {
  const f = teamAnalysis(), last = (G.analysis || [])[0];
  const pats = {};
  (G.analysis || []).slice(0, 8).forEach(a => a.tags.forEach(t => { pats[t] = (pats[t] || 0) + 1; }));
  const rec = Object.entries(pats).filter(([t, n]) => n >= 3 && PATTERN_TEXT[t]).sort((a, b) => b[1] - a[1]);
  return `<div class="card">${staffHead('Analyst', 'Analyst')}
    <ul class="notes">${f.map(x => `<li class="${x.kind === 'weak' ? 'warn' : x.kind === 'strong' ? 'good' : ''}">${esc(x.text)}${x.fix ? `<br><small>${esc(x.fix.text)}</small>` : ''}</li>`).join('')}</ul>
    ${rec.length && staffR('Analyst') >= 7 ? `<p class="note">Recurring: ${rec.map(([t, n]) => `${PATTERN_TEXT[t]} (${n} of the last ${Math.min(8, (G.analysis || []).length)})`).join('; ')}.</p>` : ''}
    ${full && last ? `<h4 class="lbl">Last match ${last.score.join('-')}</h4><ul class="notes">${last.lines.map(l => `<li>${esc(l)}</li>`).join('')}</ul>${last.suggest ? `<p class="muted">Suggestion: ${esc(last.suggest.text)}</p>${evidenceLine('analyst|' + last.suggest.tag)}` : ''}` : ''}
    <p class="muted">Better analysts look at more matches, spot late goals, set pieces and weak positions, and give exact numbers.</p></div>`;
}

function coachCard() {
  const k = 'w' + G.week + ':' + G.season;
  if (!UI.coachPlan || UI.coachPlan.k !== k) UI.coachPlan = { k, plan: coachPlan() };
  const P = UI.coachPlan.plan, T = G.training, same = T.focus === P.focus && T.intensity === P.intensity;
  const foc = TRAINING_FOCUS.find(f => f.k === P.focus);
  return `<div class="card">${staffHead('Coach', 'Coaches')}
    <p><b>${foc.n}</b>, ${INTENSITY[P.intensity].toLowerCase()} intensity.</p>
    <ul class="notes">${P.why.map(w => `<li>${esc(w)}</li>`).join('')}</ul>
    ${Object.keys(P.indiv).length ? `<h4 class="lbl">Individual plans</h4><ul class="notes">${Object.entries(P.indiv).map(([id, g]) => `<li>${esc(pname(G.players[id]))}: ${INDIV_FOCUS[g].toLowerCase()} work</li>`).join('')}</ul>` : ''}
    ${evidenceLine(`coach|${P.focus}|${P.intensity}`)}
    <button class="btn wide ${same ? '' : 'pri'}" data-a="coachApply">${same ? 'Plan in place' : 'Use this plan'}</button>
    <p class="muted">Judged after four weeks on attribute growth and injuries. Better coaches spot fixture congestion and pick the right area for each young player.</p></div>`;
}
ACT.coachApply = () => { if (!UI.coachPlan) return; applyCoachPlan(UI.coachPlan.plan); toast('Training plan applied.'); render(); };

function physioCard() {
  const k = 'w' + G.week + ':' + G.season + ':' + G.day;
  if (!UI.physio || UI.physio.k !== k) UI.physio = { k, adv: physioAdvice() };
  const P = UI.physio.adv, r = P.r;
  return `<div class="card">${staffHead('Physio', 'Physio')}
    ${P.list.length ? `<p>Rest before the next match${P.rest != null ? ` (${P.rest} days after the last one)` : ''}:</p>
      <div class="list">${P.list.map(x => { const p = G.players[x.id]; return `<button class="row act" data-a="player" data-id="${p.id}"><span class="pos">${p.pos}</span><span class="grow"><b>${esc(pname(p))}</b><small>${r >= 9 ? `About ${x.exp}% condition at kick-off` : 'Still tired'} · injury risk ${r >= 12 ? '×' + x.risk.toFixed(1) : x.risk > 2 ? 'high' : 'raised'}${x.starter ? ' · in the starting XI' : ''}</small></span></button>`; }).join('')}</div>
      <button class="btn wide pri" data-a="physioApply">Leave them out</button>` : '<p class="muted">Everyone in the matchday squad is fit enough to play.</p>'}
    ${evidenceLine('physio|rested')}
    <p class="muted">Better physios spot more tired players and judge the risk more precisely.</p></div>`;
}
ACT.physioApply = () => { if (!UI.physio) return; applyPhysio(UI.physio.adv); UI.physio = null; toast('Rested players left out. Check the line-up.'); render(); };

function scoutCard() {
  const A = UI.scoutAdv && UI.scoutAdv.k === G.week + ':' + G.season ? UI.scoutAdv.adv : (UI.scoutAdv = { k: G.week + ':' + G.season, adv: scoutAdvice() }).adv;
  logScoutRecs(A);
  const needTxt = n => `${POS_NAME[n.pos]}: ${n.type === 'weak' ? 'a weak spot in the XI' : n.type === 'age' ? 'the starter is ageing' : 'no cover behind the starter'}`;
  return `<div class="card">${staffHead('Scout', 'Scouts')}
    <h4 class="lbl">Where we need players</h4><ul class="notes">${A.needs.map(n => `<li>${esc(needTxt(n))}</li>`).join('') || '<li>No obvious gaps in the squad.</li>'}</ul>
    <h4 class="lbl">Recommended</h4>
    <div class="list">${A.recs.map(x => playerRow(x.p, `<span class="stat"><b>+${x.gain}</b><small>${x.nd.pos}</small></span>`, { sub: `${x.fee ? money(x.fee) : 'Free'} · ${wageFmt(x.wage)} · ${esc(clubName(x.p.club))}` })).join('') || '<p class="muted">Nobody our scouts have watched fits the budget and the need. Send scouts on assignments to widen the search.</p>'}</div>
    ${evidenceLine('scout|weak')}
    <p class="muted">Only players our scouts know at least ${A.minKnow}% are considered, within the transfer budget (${money(G.fin.tb)}) and wage room. Better scouts judge from less information and find more options. Judged at the end of the season on how each player did.</p></div>`;
}

SCREENS.staffroom = {
  render() {
    const nf = nextUserFixture();
    return `<h1 class="h1">Staff room</h1>
      <p class="muted">Advice from your staff, based only on what is happening in the game. How good it is depends on their ratings. Advice is recorded with what happened next: good advice helps staff improve at the end of the season.</p>
      ${nf ? assistCard(nf) : ''}${analystCard(true)}${coachCard()}${physioCard()}${scoutCard()}`;
  },
};

/* ---------- Admin: AI Staff ---------- */
ADMIN_TABS.staff = () => {
  const L = staffLearn(), V = staffActive(), rows = Object.entries(L.draft).sort((a, b) => b[1].n - a[1].n);
  const log = G.staffLog || [], byK = k => log.filter(e => e.k === k);
  return `<div class="card"><h3>How staff learn</h3><p class="muted">Every piece of staff advice is recorded with what happened next. Outcomes build the learning table below. Save it as a version and approve it: approved evidence is shown with advice and steers it (for example the assistant stops recommending switches that have not paid off). Data syncs to the private cloud with the AI Brain data.</p>
      <div class="kv"><div><small>Approved version</small><b>${V ? esc(V.name) : 'None'}</b></div><div><small>Table entries</small><b>${rows.length}</b></div>
      <div><small>Assistant advice</small><b>${byK('assist').length}</b></div><div><small>Coach plans</small><b>${byK('coach').length}</b></div><div><small>Physio advice</small><b>${byK('physio').length}</b></div><div><small>Scout recommendations</small><b>${byK('scout').length}</b></div></div></div>
    <div class="card"><h3>Learning table (draft)</h3>
      <div class="list">${rows.map(([k, x]) => `<div class="row sm"><span class="grow"><b>${esc(k)}</b><small>${x.n} outcomes</small></span><span class="stat"><b class="${x.sum / x.n > 0 ? 'good' : 'bad'}">${(x.sum / x.n).toFixed(2)}</b></span></div>`).join('') || '<p class="muted">No outcomes yet. Use staff advice and play matches.</p>'}</div>
      <div class="btns"><button class="btn pri" data-a="slSave" ${rows.length ? '' : 'disabled'}>Save as version</button><button class="btn ghost" data-a="slReset">Reset draft</button></div></div>
    <div class="card"><h3>Versions</h3><div class="list">${L.versions.map(v => `<div class="row sm"><span class="grow"><b>${esc(v.name)}${v.id === L.active ? ' <em class="tag good">Approved</em>' : ''}</b><small>${new Date(v.date).toLocaleDateString()} · ${Object.keys(v.table).length} entries</small></span><button class="btn sm" data-a="slApprove" data-id="${v.id}">${v.id === L.active ? 'Roll back' : 'Approve'}</button></div>`).join('') || '<p class="muted">No versions yet.</p>'}</div></div>`;
};
ACT.slSave = () => { const L = staffLearn(); L.versions.unshift({ id: Date.now(), name: 's' + (L.versions.length + 1), date: Date.now(), table: JSON.parse(JSON.stringify(L.draft)) }); staffLearnSave(); toast('Version saved. Approve it to use it.'); render(); };
ACT.slApprove = ds => { const L = staffLearn(), id = +ds.id; L.active = L.active === id ? null : id; staffLearnSave(); toast(L.active ? 'Approved. Staff advice now uses this evidence.' : 'Rolled back: no approved version.'); render(); };
ACT.slReset = () => { if (!confirm('Reset the draft learning table? Versions are kept.')) return; staffLearn().draft = {}; staffLearnSave(); render(); };
