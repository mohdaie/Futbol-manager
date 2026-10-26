'use strict';
/* ===== screens-squad.js =====
   Squad list, player profile sheet (talks, status, contract, listing),
   tactics with the in/out-of-possession visualiser, training, medical, youth academy. */

const SORTS = { pos: (a, b) => POSITIONS.indexOf(a.pos) - POSITIONS.indexOf(b.pos) || b.ca - a.ca, no: (a, b) => (a.no || 100) - (b.no || 100), ovr: (a, b) => b.ca - a.ca, age: (a, b) => a.age - b.age, cond: (a, b) => a.cond - b.cond, mor: (a, b) => b.mor - a.mor, val: (a, b) => pValue(b) - pValue(a) };
const pitchPosLabel = pos => ({ AMR: 'RW', AML: 'LW', MR: 'RM', ML: 'LM', MC: 'CM', AMC: 'AM', DC: 'CB', DL: 'LB', DR: 'RB' }[pos] || pos);
function squadMetric(p, sort) {
  if (sort === 'pos') {
    const alternatives = p.alt?.length ? p.alt : p.pos === 'GK' ? [] : POSITIONS.filter(pos => pos !== 'GK' && pos !== p.pos).sort((a, b) => ovrAt(p, b) - ovrAt(p, a)).slice(0, 1);
    return `<span class="squad-metric alt"><small>Best fit</small>${alternatives.length ? alternatives.map(pos => { const fit = ovrAt(p, pos); return `<b class="${fit >= 80 ? 'good' : 'warn'}" title="${pitchPosLabel(pos)} fit: ${fit}">${pitchPosLabel(pos)} ${fit}</b>`; }).join('') : '<b>—</b>'}</span>`;
  }
  if (sort === 'no') return `<span class="stat squad-metric"><b>${p.no ? '#' + p.no : '—'}</b><small>kit number</small></span>`;
  if (sort === 'ovr') return ovrPill(p.ca, p.ca);
  if (sort === 'age') return `<span class="stat squad-metric"><b>${p.age}</b><small>years</small></span>`;
  if (sort === 'cond') return `<span class="squad-metric condition"><b>${Math.round(p.cond)}%</b>${condBar(p.cond)}</span>`;
  if (sort === 'mor') return moodFace(p.mor);
  if (sort === 'val') return `<span class="stat squad-metric value"><b>${money(pValue(p))}</b><small>market value</small></span>`;
  return '';
}

SCREENS.squad = {
  render() {
    const f = UI.f.squad, s = UI.f.sort, levels = clubLevels(userClub()), l = Object.hasOwn(levels, UI.f.lvl) ? UI.f.lvl : 'A';
    const list = levelSquad(G.club, l).filter(p => f === 'ALL' || POS_GROUP[p.pos] === f).sort(SORTS[s]);
    const xi = new Set(G.tactics.slots);
    const note = { A: 'Picked for league matches. Reserves fill in only when fewer than 16 are fit.', R: userClub().league === 'ECH' ? 'Reserve squad within the combined 36-player limit. Move a player up when he is ready for minutes.' : 'Under-21 squad. Move a player up when he is ready for minutes.', Y: 'Academy players aged 15 to 18. At 19 they move up to the reserves.' }[l];
    return `<h1 class="h1">Squad <small>${squadOf(G.club).length}${Number.isFinite(clubSquadMax(userClub())) ? ' / ' + clubSquadMax(userClub()) : ''} players</small></h1>
      <div class="seg wide">${Object.entries(levels).map(([k, n]) => `<button class="${l === k ? 'on' : ''}" data-a="sqL" data-v="${k}">${n} <small>${levelSquad(G.club, k).length}</small></button>`).join('')}</div>
      ${userClub().league === 'EPL' ? `<div class="card"><div class="sec-h"><div><h3>Premier League registration</h3><span class="muted">${registeredPLIds(userClub()).size} / ${premierLeagueRegistrationLimit()} senior places used</span></div><button class="btn sm" data-a="go" data-s="registration">Manage</button></div><p class="muted">Choose your season list. Eligible Under-21 players do not use a place.</p></div>` : ''}
      <p class="muted">${note}</p>
      <div class="chips">${[['ALL', 'All'], ['GK', 'Keepers'], ['DEF', 'Defence'], ['MID', 'Midfield'], ['ATT', 'Attack']].map(([k, n]) => `<button class="chip ${f === k ? 'on' : ''}" data-a="sqF" data-v="${k}">${n}</button>`).join('')}</div>
      <div class="sortbar"><span class="muted">Sort</span>${[['pos', 'Position'], ['no', 'Kit number'], ['ovr', 'Rating'], ['age', 'Age'], ['cond', 'Condition'], ['mor', 'Morale'], ['val', 'Value']].map(([k, n]) => `<button class="${s === k ? 'on' : ''}" data-a="sqS" data-v="${k}">${n}</button>`).join('')}</div>
      <div class="list">${list.map(p => playerRow(p, squadMetric(p, s), { noBadge: true, hideAge: true, positionExtra: s === 'pos' ? `<span class="season-avg" title="Season average rating" aria-label="Season average rating ${p.st.a ? (p.st.rt / p.st.a).toFixed(1) : 'not rated'}">${p.st.a ? (p.st.rt / p.st.a).toFixed(1) : '—'}</span>` : '', sub: `${Math.round(p.cond)}% condition · ${morLabel(p.mor)}` })).join('') || empty('Nobody here', 'No players in this group for that position.')}</div>`;
  },
};
ACT.sqF = ds => { UI.f.squad = ds.v; render(); };
ACT.sqL = ds => { UI.f.lvl = ds.v; render(); };
ACT.sqS = ds => { UI.f.sort = ds.v; render(); };

/* ---------- player profile ---------- */
ACT.player = ds => playerSheet(+ds.id);
function playerSheet(pid) {
  const p = G.players[pid];
  if (!p) return toast('That player has retired.');
  const mine = p.club === G.club, t = UI.tab.ps || 'attr', so = mine ? { v: p.ca, txt: p.ca } : seenOvr(p);
  const pot = mine ? stars(p.pa) : seenPot(p);
  const groups = p.pos === 'GK' ? ['G', 'M', 'P'] : ['T', 'M', 'P'];
  let body = '';
  if (t === 'attr') {
    const best = p.pos === 'GK' ? [['GK', ovrAt(p, 'GK')]] : POSITIONS.filter(pos => pos !== 'GK').map(pos => [pos, ovrAt(p, pos)]).sort((a, b) => b[1] - a[1]).slice(0, 4);
    body = `${playerHex(p)}${mine ? `<p class="dev-note">Attribute change since ${seasonLabel()} began</p>` : ''}<div class="attrs">${groups.map(g => `<div><h4 class="lbl">${ATTR_GROUPS[g]}</h4>${ATTRS.map((a, i) => (a[2] === g ? `<div class="at"><span>${a[1]}</span><span class="at-value">${mine && trainingAttrDelta(p, i) ? `<small class="dev-delta ${trainingAttrDelta(p, i) < 0 ? 'down' : ''}">${trainingAttrDelta(p, i) > 0 ? '+' : ''}${trainingAttrDelta(p, i)}</small>` : ''}${attrCell(p, i)}</span></div>` : '')).join('')}</div>`).join('')}</div>
      ${mine || knowOf(p) >= 90 ? `<h4 class="lbl">Best positions</h4><div class="chips">${best.map(([pos, v]) => `<span class="chip static">${pos} ${v}</span>`).join('')}</div>` : `<p class="note">Scouting file ${knowOf(p)}% · ${knowStage(knowOf(p))[1]}. Exact values are confirmed; ranges are estimates; ? is not scouted yet.${nextStage(knowOf(p)) ? ` At ${nextStage(knowOf(p))[0]}%: ${STAGE_UNLOCK[nextStage(knowOf(p))[0]]}.` : ''}</p><button class="btn sm" data-a="scoutFile" data-id="${p.id}">Open scouting file</button>`}`;
  } else if (t === 'bio') {
    const known = mine || knowOf(p) >= 75, fp = G.players[p.fp], ftIn = Math.round(p.ht / 2.54);
    const fmClub = Object.values(G.clubs).find(c => c.mgr && c.mgr === p.fmn);
    body = `<div class="kv">
        <div><small>Height</small><b>${(p.ht / 100).toFixed(2)} m <i class="muted">${Math.floor(ftIn / 12)}'${ftIn % 12}"</i></b></div>
        <div><small>Weight</small><b>${p.wt} kg</b></div>
        <div><small>Nationality</small><b>${natName(p.nat)}</b></div>
        ${p.insp ? `<div><small>Inspirational figure</small><b>${esc(p.insp)}</b></div>` : ''}
        <div><small>Ambition</small><b>${known ? ambLabel(p.amb) : 'Unknown'}</b></div>
        <div><small>Favourite person</small><b>${fp ? `<button class="link" data-a="player" data-id="${fp.id}">${esc(p.fpn)}</button>` : esc(p.fpn) + (p.fp ? ' (retired)' : '')}</b>${fp ? `<span>${esc(clubName(fp.club))}</span>` : ''}</div>
        <div><small>Favourite manager</small><b>${p.fmn === G.manager ? 'You' : esc(p.fmn)}</b>${fmClub ? `<span>${esc(fmClub.name)}</span>` : ''}</div></div>
      <div class="card"><h4 class="lbl">Character · ${known ? p.pers : 'Unknown'}</h4><p class="muted">${known ? CHARACTER[p.pers] : 'Scout him to learn about his character and ambition.'}</p></div>
      <h4 class="lbl">How this affects him</h4>
      <ul class="notes">${(known ? bioNotes(p) : bioNotes(p).filter(n => !/ambitio/i.test(n[0]))).map(([txt, k]) => `<li class="${k}">${esc(txt)}</li>`).join('') || '<li>Nothing stands out.</li>'}</ul>`;
  } else if (t === 'stats') {
    const row = (lbl, s) => `<tr><td class="l">${lbl}</td><td>${s.a}</td><td>${s.g}</td><td>${s.as ?? '-'}</td><td>${s.a ? (s.rt / s.a).toFixed(2) : '-'}</td></tr>`;
    body = `<div class="tablewrap"><table class="tbl"><thead><tr><th class="l">Season</th><th>Apps</th><th>Gls</th><th>Ast</th><th>Avg</th></tr></thead><tbody>${row(seasonLabel(), p.st)}${p.prev ? row(p.prev.season, p.prev) : ''}<tr><td class="l">Career (in game)</td><td>${p.car.a}</td><td>${p.car.g}</td><td>-</td><td>-</td></tr></tbody></table></div>
      <div class="kv"><div><small>Player of the match</small><b>${p.st.mom}</b></div><div><small>Yellow / red</small><b>${p.st.yc} / ${p.st.rc}</b></div><div><small>Clean sheets</small><b>${p.st.cs}</b></div>
        <div><small>Passes</small><b>${p.st.pa ? Math.round((p.st.pc || 0) / p.st.pa * 100) + '% of ' + p.st.pa : '-'}</b></div><div><small>Key passes</small><b>${p.st.kp || 0}</b></div>
        <div><small>Dribbles won</small><b>${p.st.dw || 0}${p.st.da ? ' / ' + p.st.da : ''}</b></div><div><small>Tackles / interceptions</small><b>${p.st.tk || 0} / ${p.st.int || 0}</b></div>
        <div><small>Aerial duels won</small><b>${p.st.aer || 0}</b></div><div><small>Shots / on target</small><b>${p.st.sh || 0} / ${p.st.sot || 0}</b></div>
        ${p.pos === 'GK' ? `<div><small>Saves</small><b>${p.st.sv || 0}</b></div>` : `<div><small>Offsides / fouls</small><b>${p.st.off || 0} / ${p.st.fo || 0}</b></div>`}</div>`;
  } else {
    const yl = p.con - G.season;
    body = `<div class="kv"><div><small>Value</small><b>${money(pValue(p))}</b></div><div><small>Wage</small><b>${p.club === 'FA' ? 'Unattached' : mine || knowOf(p) >= 50 ? wageFmt(p.wage) : 'Unknown'}</b></div>
      <div><small>Contract ends</small><b>${p.club === 'FA' ? '-' : 'June ' + (p.con)}${p.club !== 'FA' && yl <= 1 ? ' <em class="tag warn">Expiring</em>' : ''}</b></div><div><small>${mine ? 'Squad status' : 'Asking price'}</small><b>${mine ? p.status : p.club === 'FA' ? 'Free' : knowOf(p) >= 50 ? '~' + money(askingPrice(p)) : 'Unknown'}</b></div>
      <div><small>Agent</small><b>${mine || knowOf(p) >= 75 ? agentLink(agentOf(p)) : 'Unknown'}</b></div>
      ${p.sellOn ? `<div><small>Next-sale share</small><b>${p.sellOn.pct}% to ${esc(clubName(p.sellOn.club))}</b></div>` : ''}${p.buyBack && p.buyBack.holder === p.club ? `<div><small>Buy-back right</small><b>${esc(clubName(p.buyBack.club))} · ${money(p.buyBack.price)}</b><span>Until ${fmtDate(p.buyBack.expires,false)} · player agreement required</span></div>` : ''}
      ${mine ? `<div><small>Squad</small><b>${LEVELS[lvlOf(p)]}</b></div><div><small>Training focus</small><b>${INDIV_FOCUS[G.training.indiv[p.id] || 'none']}</b></div>` : ''}</div>`;
  }
  const actions = `<div class="btns"><button class="btn pri wide" data-a="pActions" data-id="${p.id}">Actions</button></div>`;
  sheet(`<div class="phead">
      <div class="pnum" style="--k1:${G.clubs[p.club].c1}">${p.no || '-'}</div>
      <div class="grow"><h3 class="sh-t" data-no-links>${esc(fullName(p))}</h3><p class="muted">${POS_NAME[p.pos]}${p.alt.length ? ' / ' + p.alt.join(', ') : ''} · ${p.age} · ${natName(p.nat)} · ${p.foot} foot${mine ? ' · ' + LEVELS[lvlOf(p)] : ''}</p>
        <p class="pclub">${badge(p.club, 18)} ${esc(clubName(p.club))}${p.inj ? ` · <em class="tag bad">${esc(p.inj.n)}, ${p.inj.w} wk</em>` : ''}${p.ban ? ' · <em class="tag bad">Suspended</em>' : ''}${(mine || knowOf(p) >= 90) && unsetLabel(p) ? ` · <em class="tag warn">${esc(unsetLabel(p))}</em>` : ''}</p></div>
      <div class="pov"><small>Rating</small>${ovrPill(so.v, so.txt)}<em>${so.txt === '??' ? 'Unknown' : ratingRemark(so.v)}</em><small>Potential</small>${mine || potKnown(p) ? `${starHtml(pot)}<em>${potRemark(pot)}</em>` : '<b class="unk">?</b><em>Not scouted</em>'}</div></div>
    ${mine ? `<div class="meters"><div><small>Condition</small>${bar(p.cond, condClass(p.cond))}</div><div><small>Morale · ${morLabel(p.mor)}</small>${bar(p.mor, morClass(p.mor))}</div><div><small>Match sharpness</small>${bar(p.shp)}</div></div>` : ''}
    ${tabs('ps', [['attr', 'Attributes'], ['bio', 'Personal'], ['stats', 'Stats'], ['con', 'Contract']], t).replace(/data-a="tab"/g, `data-a="psTab" data-id="${p.id}"`)}
    ${p.loan ? `<div class="card"><b>On loan ${p.loan.host===p.club?'from':'to'} ${esc(clubName(p.loan.host===p.club?p.loan.parent:p.loan.host))}</b><p class="muted">Returns ${fmtDate(p.loan.end,false)} · fee ${money(p.loan.fee)} · host pays ${p.loan.wageShare}% of wages${p.loan.optionFee?` · ${p.loan.obligationApps?'Obligation':'Option'} to buy for ${money(p.loan.optionFee)}`:''}${p.loan.recall?' · recall clause':''}</p></div>` : ''}
    ${body}${actions}${activeBuyBack(p) ? `<button class="btn pri wide" data-a="buyBack" data-id="${p.id}">Activate buy-back · ${money(p.buyBack.price)}</button>` : ''}${activeLoan(p)&&p.loan.host===G.club&&p.loan.optionFee&&!p.loan.obligationApps?`<button class="btn pri wide" data-a="loanBuy" data-id="${p.id}">Exercise loan purchase option · ${money(p.loan.optionFee)}</button>`:''}<div class="btns">${clubLink(p.club, 'View ' + esc(clubName(p.club)), 'btn sm')}${mine ? `<button class="btn sm" data-a="go" data-s="${p.inj ? 'medical' : 'training'}">${p.inj ? 'Medical center' : 'Training'}</button>` : `<button class="btn sm" data-a="offer" data-id="${p.id}">${p.club === 'FA' ? 'Offer contract' : 'Make an offer'}</button>${p.club!=='FA'?`<button class="btn sm" data-a="loan" data-id="${p.id}">Loan offer</button>`:''}<button class="btn sm" data-a="trackPlayer" data-id="${p.id}">${G.shortlist.includes(p.id) ? 'Open shortlist' : 'Add to shortlist'}</button>`}</div>`, { key: 'player:' + pid, restore: () => playerSheet(pid), valid: () => !!G?.players[pid], onClose: () => render() });
}
ACT.psTab = ds => { UI.tab.ps = ds.v; playerSheet(+ds.id); };

/* ---------- player actions ----------
   Grouped by category. To add an action, add an item to a category's items(p):
   { n: label, d: short description, run: () => ..., off: reason it can't be used now, on: marks the current choice, confirm: true asks for a second tap }.
   Add a category with { k, n, d, mine: true for your players / false for others, items }. */
const TALKS = [['praise', 'Praise his recent form', 'Lifts morale if he has played well'], ['crit', 'Criticise his recent form', 'Tough players respond; others may sulk'], ['time', 'Promise more playing time', 'He will expect minutes over the next two months'], ['future', 'Ask about his future', 'Find out if he is happy to stay']];
const PLAYER_ACTIONS = [
  { k: 'motivate', n: 'Motivate', d: 'Talk to him about form, playing time and his future', mine: true,
    items: p => TALKS.map(([k, n, d]) => ({ n, d, off: p.talked === G.week ? 'You already spoke to him this week' : '', run: () => ACT.talk1({ id: p.id, k }) })) },
  { k: 'squad', n: 'Squad', d: 'Squad level and squad status', mine: true,
    items: p => [
      ...Object.keys(clubLevels(userClub())).filter(k => k !== lvlOf(p)).map(k => ({ n: k === 'A' ? 'Promote to first team' : 'Move to ' + (k === 'Y' ? 'U18s' : 'reserves'), d: k === 'Y' && p.age > 18 ? '' : k === 'A' ? 'He can be picked for league matches' : 'He will not be picked for league matches', off: k === 'Y' && p.age > 18 ? 'Only players aged 18 or under' : '', run: () => ACT.setLvl({ id: p.id, v: k }) })),
      ...SQUAD_STATUSES.map(s => ({ n: 'Status: ' + s, d: 'Sets how much playing time he expects', on: p.status === s, run: () => { CHG.pStatus(s, { id: p.id }); actionsSheet(p.id, 'squad'); } })),
    ] },
  { k: 'kit', n: 'Kit number', d: 'Change his squad number', mine: true,
    items: p => [{ n: `Change kit number (#${p.no || '—'})`, d: 'Unique number from 1 to 99; changes are allowed during transfer windows', off: !inWindow() ? 'The transfer window is closed' : '', run: () => kitNumberSheet(p.id) }] },
  { k: 'training', n: 'Training', d: 'Individual training focus', mine: true,
    items: p => Object.entries(INDIV_FOCUS).map(([k, n]) => ({ n, d: k === 'none' ? 'Follows the team plan only' : 'Extra work on ' + n.toLowerCase() + ' attributes', on: (G.training.indiv[p.id] || 'none') === k, run: () => { CHG.indiv(k, { id: p.id }); actionsSheet(p.id, 'training'); } })) },
  { k: 'contract', n: 'Contract', d: 'New deal, transfer list or release', mine: true,
    items: p => [
      { n: 'Offer a new contract', d: 'Contract ends June ' + p.con, run: () => ACT.contract({ id: p.id, mode: 'renew' }) },
      { n: 'Offer out on loan', d: 'Set a fee, wage share, duration and clauses', off: activeLoan(p) ? 'Already on loan' : !inWindow() ? 'Transfer window is closed' : '', run: () => ACT.loan({ id: p.id }) },
      { n: p.listed ? 'Remove from transfer list' : 'Add to transfer list', d: p.listed ? 'Clubs stop bidding' : 'Clubs are told he is available (lowers his morale)', run: () => ACT.listToggle({ id: p.id }) },
      { n: 'Release', d: 'Pays up his contract', confirm: true, run: () => { const comp = releasePlayer(p); closeSheet(true); toast(`${pname(p)} released. Paid ${money(comp)} in compensation.`); render(); } },
    ] },
  { k: 'transfer', n: 'Transfer', d: 'Make an offer or track him', mine: false,
    items: p => [
      { n: p.club === 'FA' ? 'Offer contract' : 'Make an offer', d: p.club === 'FA' ? 'He is a free agent' : 'Bid for him', run: () => ACT.offer({ id: p.id }) },
      ...(p.club !== 'FA' ? [{ n: 'Make a loan offer', d: 'Set fee, wage share and purchase clauses', off: activeLoan(p) ? 'Already on loan' : !inWindow() ? 'Transfer window is closed' : '', run: () => ACT.loan({ id: p.id }) }] : []),
      { n: G.shortlist.includes(p.id) ? 'Remove from shortlist' : 'Add to shortlist', d: 'Keep track of him in Transfers', run: () => ACT.shortlist({ id: p.id }) },
    ] },
  { k: 'scouting', n: 'Scouting', d: 'Learn more about him', mine: false,
    items: p => {
      const job = G.scout.jobs.find(j => j.pid === p.id), k = knowOf(p), days = scoutReportDays(SCOUT_DAYS), videoDays = scoutReportDays(VIDEO_DAYS), wk = money(Math.round(jobWeekly({ pid: p.id, mode: 'watch' }) * scoutRushMultiplier())), video = money(Math.round(3000 * scoutRushMultiplier()));
      return [
        { n: 'Scouting file', d: `${k}% · ${knowStage(k)[1]}`, run: () => ACT.scoutFile({ id: p.id }) },
        { n: `Send a scout (${days} days)`, d: `${wk} a week. Every match he watches adds to the file`, off: job ? 'A scout is already on him' : k >= 100 ? 'His file is complete' : '', run: () => ACT.scoutOne({ id: p.id }) },
        { n: `Video analysis (${video})`, d: `Ready in ${videoDays} day${videoDays === 1 ? '' : 's'}. Up to ${VIDEO_CAP}%: physical and technical detail`, off: job ? 'Already being scouted' : k >= VIDEO_CAP ? 'Send a scout for more' : '', run: () => ACT.scoutOne({ id: p.id, mode: 'video' }) },
      ];
    } },
];
const SQUAD_STATUSES = ['Key player', 'First team', 'Rotation', 'Backup', 'Prospect'];
const actionCats = p => PLAYER_ACTIONS.filter(c => c.mine === (p.club === G.club));

function actionsSheet(pid, cat) {
  const p = G.players[pid], cats = actionCats(p), c = cats.find(x => x.k === cat);
  const head = `<button class="link back" data-a="back" data-id="${p.id}">‹ ${c ? 'Actions' : esc(pname(p))}</button>
    <h3 class="sh-t">${c ? c.n : 'Actions'} <small>${esc(fullName(p))}</small></h3>`;
  const rows = c
    ? c.items(p).map((it, i) => {
      const ask = it.confirm && UI.tab.pconf === p.id + c.k + i;
      return `<button class="row act ${it.on ? 'sel' : ''}" data-a="pAct" data-id="${p.id}" data-k="${c.k}" data-i="${i}" ${it.off ? 'disabled' : ''}>
        <span class="grow"><b class="${ask ? 'bad' : ''}">${ask ? 'Tap again to confirm: ' + it.n : it.n}</b><small>${it.off || it.d || ''}</small></span>${it.on ? '<span class="xitag">Current</span>' : '<span class="chev">›</span>'}</button>`;
    }).join('')
    : cats.map(x => `<button class="row act" data-a="pActions" data-id="${p.id}" data-k="${x.k}"><span class="grow"><b>${x.n}</b><small>${x.d}</small></span><span class="chev">›</span></button>`).join('');
  sheet(`${head}<div class="list">${rows}</div>`, { key: 'actions:' + pid + ':' + (cat || ''), restore: () => actionsSheet(pid, cat), valid: () => !!G?.players[pid], onClose: () => render() });
}
function kitNumberSheet(pid) {
  const p = G.players[pid];
  if (!p || p.club !== G.club) return;
  const taken = squadOf(G.club).filter(q => q.id !== pid).map(q => q.no).filter(Boolean).sort((a, b) => a - b);
  sheet(`<button class="link back" data-a="back">‹ Player actions</button><h3 class="sh-t">Kit number <small>${esc(fullName(p))}</small></h3>
    <p class="muted">Select an unused number from 1 to 99. The league permits changes during transfer windows only.</p>
    <div class="field"><label for="kitNumberInput">Shirt number</label><input id="kitNumberInput" type="number" inputmode="numeric" min="1" max="99" step="1" value="${p.no || ''}"></div>
    <p class="note">Numbers in use: ${taken.join(', ') || 'none'}</p><button class="btn pri wide" data-a="saveKitNumber" data-id="${pid}">Save kit number</button>`, {
      key: 'kit-number:' + pid, restore: () => kitNumberSheet(pid), valid: () => !!G?.players[pid], onClose: () => render(),
    });
}
ACT.saveKitNumber = ds => {
  const p = G.players[+ds.id], input = document.getElementById('kitNumberInput');
  if (!p || !input) return;
  const result = changeClubKitNumber(G.club, p.id, input.value);
  if (!result.ok) return toast(result.reason);
  saveGame(); closeSheet(true); toast(`${pname(p)} is now number ${p.no}.`); render();
};
ACT.pActions = ds => { UI.tab.pconf = null; actionsSheet(+ds.id, ds.k); };
ACT.pAct = ds => {
  const p = G.players[+ds.id], c = actionCats(p).find(x => x.k === ds.k), it = c && c.items(p)[+ds.i];
  if (!it || it.off) return;
  const key = p.id + c.k + ds.i;
  if (it.confirm && UI.tab.pconf !== key) { UI.tab.pconf = key; return actionsSheet(p.id, c.k); }
  UI.tab.pconf = null;
  it.run();
};
ACT.shortlist = ds => { const id = +ds.id; G.shortlist = G.shortlist.includes(id) ? G.shortlist.filter(x => x !== id) : [...G.shortlist, id]; playerSheet(id); };
ACT.scoutOne = ds => { const p = G.players[+ds.id], r = scoutPlayer(p, ds.mode || 'watch'); toast(r.msg); if (UI.popup?.key?.startsWith('sfile')) scoutFileSheet(p.id); else playerSheet(p.id); };
ACT.listToggle = ds => { const p = G.players[+ds.id]; p.listed = !p.listed; if (p.listed) p.mor = clamp(p.mor - 6, 0, 100); toast(p.listed ? 'Transfer listed. Clubs will be told he is available.' : 'Removed from the transfer list.'); playerSheet(p.id); };
ACT.setLvl = ds => {
  const p = G.players[+ds.id], to = ds.v, from = lvlOf(p);
  if (!Object.hasOwn(clubLevels(userClub()), to)) return toast('This club has first team and reserves only.');
  if (to === 'A' && levelSquad(G.club, 'A').length >= 30) return toast('The first team already has 30 players. Move someone down first.');
  p.lvl = to; p.youth = false;
  if (to === 'A') { p.status = 'Prospect'; p.wage = Math.max(p.wage, 1500); addLog('club', `${fullName(p)} promoted`, `${fullName(p)} moves up from the ${LEVELS[from].toLowerCase()} to the first-team squad.`); }
  if (from === 'A') { G.tactics.slots = G.tactics.slots.map(id => (id === p.id ? null : id)); G.tactics.bench = (G.tactics.bench || []).filter(id => id !== p.id); p.mor = clamp(p.mor - 10, 0, 100); }
  toast(`${pname(p)} moved to the ${to === 'Y' ? 'U18s' : LEVELS[to].toLowerCase()}.`); closeSheet(true); render();
};
ACT.release = ds => {
  const p = G.players[+ds.id];
  if (UI.tab.rel !== p.id) { UI.tab.rel = p.id; return playerSheet(p.id); }
  UI.tab.rel = null;
  const comp = releasePlayer(p);
  closeSheet(true); toast(`${pname(p)} released. Paid ${money(comp)} in compensation.`); render();
};
CHG.pStatus = (v, ds) => { const p = G.players[+ds.id]; const old = p.status; p.status = v; const rank = s => ['Key player', 'First team', 'Rotation', 'Backup', 'Prospect'].indexOf(s); if (rank(v) > rank(old)) p.mor = clamp(p.mor - 8, 0, 100); toast(`${pname(p)} is now ${v.toLowerCase()}.`); };
CHG.indiv = (v, ds) => { G.training.indiv[+ds.id] = v; toast('Individual training updated.'); };

ACT.talk1 = ds => {
  const p = G.players[+ds.id], r = avgRating(p) || 6.7;
  p.talked = G.week;
  let d = 0, msg = '';
  if (ds.k === 'praise') { d = r >= 7 ? 6 : r >= 6.7 ? 2 : -3; msg = d > 0 ? 'He appreciates the recognition.' : 'He feels the praise is not deserved.'; }
  if (ds.k === 'crit') { const tough = ['Professional', 'Determined', 'Model Citizen'].includes(p.pers); d = r < 6.6 ? (tough ? 4 : -2) : -7; msg = d > 0 ? 'He accepts the criticism and promises to work harder.' : 'He reacts badly to the criticism.'; }
  if (ds.k === 'time') { d = 5; p.promise = G.week + 8; msg = 'He is pleased and will expect more minutes over the next two months.'; }
  if (ds.k === 'future' && (p.treq || p.unset)) { d = p.unset && p.unset.lvl < 2 ? 2 : 0; if (p.unset && p.unset.lvl < 2) p.unset.lvl = Math.max(0, p.unset.lvl - 0.5); msg = p.treq ? 'He wants to leave. He has asked for a transfer.' : p.unset.lvl >= 2 ? `He admits ${theClub(p.unset.to)} interest has turned his head.` : `He was flattered by ${theClub(p.unset.to)} talk, but your chat settles him.`; }
  else if (ds.k === 'future') { d = 0; msg = p.mor > 65 ? 'He is happy here and wants to stay.' : p.mor > 40 ? 'He is unsure. Regular football would help.' : 'He is unhappy and would consider leaving.'; }
  p.mor = clamp(p.mor + d, 0, 100);
  closeSheet(true); toast(msg); playerSheet(p.id);
};

/* ---------- tactics ---------- */
SCREENS.tactics = {
  render() {
    const T = G.tactics, view = UI.tab.tview || 'ip';
    ensureUserLineup();
    const ip = FORMATIONS[T.ip], oop = FORMATIONS[T.oop], map = shapeMap(T.ip, T.oop);
    const prev = positions({ ...T, map, on: T.slots.map(id => id || null), cond: {}, fam: G.training.fam }, view === 'ip', 0.5, view === 'ip' ? 0.45 : 0.55);
    const cur = styleOf(T);
    const toks = T.slots.map((id, i) => {
      const p = G.players[id], pp = prev[i] || (view === 'ip' ? ip[i].slice(1) : oop[map[i]].slice(1)), src = [0, pp[0], pp[1]];
      const pos = ip[i][0], f = p ? fam(p, pos) : 0;
      const role = ROLES[pos][T.roles[i]] || ROLES[pos][0];
      const label = pitchPosLabel(view === 'ip' ? pos : oop[map[i]][0]);
      return `<button class="tok ${f >= 0.97 ? '' : f >= 0.85 ? 'f2' : 'f3'} ${UI.swapMode && UI.swapFrom === i ? 'swap-picked' : ''}" style="left:${src[1] * 100}%;top:${src[2] * 100}%" data-a="${UI.swapMode ? 'swapSlot' : 'slot'}" data-i="${i}" aria-label="${label}: ${p ? esc(fullName(p)) : 'Empty'}. ${UI.swapMode ? 'Swap position' : 'Choose player'}" ${UI.swapMode ? `aria-pressed="${UI.swapFrom === i}"` : ''}>
        <span class="tk-c"><span class="tk-pos">${label}</span></span><span class="tk-n">${p ? esc(p.ln) : 'Empty'}</span><span class="tk-r">${view === 'ip' ? esc(role.n) : (oop[map[i]][0])}</span></button>`;
    }).join('');
    return `<h1 class="h1">Tactics</h1>
      <div class="two"><div class="field"><label for="tip">In possession</label>${selectHtml('tip', Object.keys(FORMATIONS), T.ip, 'shape', 'data-k="ip"')}</div>
      <div class="field"><label for="toop">Out of possession</label>${selectHtml('toop', Object.keys(FORMATIONS), T.oop, 'shape', 'data-k="oop"')}</div></div>
      <div class="seg wide">${[['ip', 'In possession'], ['oop', 'Out of possession']].map(([k, n]) => `<button class="${view === k ? 'on' : ''}" data-a="tview" data-v="${k}">${n}</button>`).join('')}</div>
      <div class="swap-toolbar"><button class="btn sm ${UI.swapMode ? 'pri' : ''}" data-a="swapMode" aria-pressed="${!!UI.swapMode}">${UI.swapMode ? 'Done swapping' : 'Swap positions'}</button><span role="status">${UI.swapMode ? UI.swapFrom != null ? `Now tap the position for ${esc(pname(G.players[T.slots[UI.swapFrom]]))}.` : 'Tap the first player, then the other position.' : 'Tap a player to select; use Swap positions to exchange two starters.'}</span></div>
      <div class="tpitch ${view}"><div class="tp-lines"></div>${toks}</div>
      <div class="famrow"><span>Tactical familiarity</span>${bar(G.training.fam, G.training.fam < 50 ? 'warn' : 'good')}<b>${G.training.fam}%</b></div>
      <div class="btns"><button class="btn pri" data-a="autoPick">Pick best XI</button><button class="btn" data-a="go" data-s="pinstr">Player instructions</button></div>
      ${(() => { const nf = nextUserFixture(); return nf ? assistCard(nf) : ''; })()}
      <div class="sec-h"><h2>Tactical style</h2><span class="muted">${cur ? STYLES[cur].n : 'Custom'}</span></div>
      <div class="grid2">${Object.entries(STYLES).map(([k, s]) => `<button class="gcard ${cur === k ? 'on' : ''}" data-a="style" data-v="${k}"><b>${s.n}</b><small>${s.d}</small></button>`).join('')}</div>
      <p class="muted">A style sets the team instructions, recommended shape and roles. Change anything afterwards to make it your own.</p>
      ${(() => { const r = tacticReport(T); return `<div class="card"><h3>Tactic fit <small>${r.overall == null ? 'No special demands' : r.overall + '% overall'}</small></h3>
        <p class="muted">Tactics only work when the players suit them. Good fit makes the instructions pay off; poor fit makes them backfire (lost balls, tired legs, space behind).</p>
        ${r.active.map(x => `<div class="fitrow"><span><b>${x.n}</b><small>Needs ${x.need}</small></span>${bar(x.pct, x.pct >= 60 ? 'good' : x.pct >= 45 ? 'warn' : 'bad')}<b class="${x.pct >= 60 ? 'good' : x.pct >= 45 ? 'warn' : 'bad'}">${x.pct}%</b></div>`).join('') || '<p class="muted">Balanced settings ask nothing special of the players.</p>'}
        ${r.active.filter(x => x.pct < 45).map(x => `<p class="note">${x.n}: your players are not suited to it. Expect it to cost you more than it gains.</p>`).join('')}</div>`; })()}
      <div class="sec-h"><h2>First XI</h2><span class="muted">${T.slots.filter(Boolean).length}/11</span></div>
      <div class="list tactics-first-xi">${T.slots.map((id,i)=>{const p=G.players[id],pos=ip[i][0];return `<div class="row"><button class="player-main" data-a="slot" data-i="${i}"><span class="pos">${pitchPosLabel(pos)}</span><span class="grow"><b>${p?esc(pname(p)):'Empty position'}</b><small>${p?`Natural: ${[p.pos,...p.alt].map(pitchPosLabel).join(' / ')} · ${morLabel(p.mor)} morale${p.inj?' · INJ':p.ban?' · SUS':''}`:'Choose a player'}</small>${p?`<small>${p.cond>=85?'Fresh':p.cond>=70?'Tiring':'Tired'} · Sharpness ${p.shp}%</small>`:''}</span>${p?condBar(p.cond):''}</button>${p?`<button class="btn sm ghost" data-a="player" data-id="${id}" aria-label="Open ${esc(fullName(p))} profile">Profile</button>`:''}</div>`;}).join('')}</div>
      <div class="sec-h"><h2>Substitutes</h2><span class="muted">${T.bench.length}/9</span></div>
      <div class="list">${T.bench.map((id, i) => { const p = G.players[id]; return `<button class="row act" data-a="benchSlot" data-i="${i}"><span class="pos">${p.pos}</span><span class="grow"><b>${esc(pname(p))}</b><small>${morLabel(p.mor)}</small></span>${condBar(p.cond)}</button>`; }).join('')}
        ${T.bench.length < 9 ? '<button class="row act add" data-a="benchSlot" data-i="-1"><span class="grow"><b>Add a substitute</b></span><span class="chev">+</span></button>' : ''}</div>
      <div class="sec-h"><h2>Team instructions</h2></div>
      <div class="card">${INSTRUCTIONS.map(ins => `<div class="field"><label>${ins.n}</label><div class="seg">${ins.o.map((o, i) => `<button class="${T[ins.k] === i ? 'on' : ''}" data-a="ins" data-k="${ins.k}" data-v="${i}">${o}</button>`).join('')}</div></div>`).join('')}</div>
      <div class="sec-h"><h2>Set pieces & captain</h2></div>
      <div class="card two">${[['cap', 'Captain'], ['pk', 'Penalties'], ['fk', 'Free kicks'], ['ck', 'Corners']].map(([k, n]) => `<div class="field"><label>${n}</label>${selectHtml('sp-' + k, T.slots.filter(Boolean).map(id => [id, pname(G.players[id])]), T[k], 'setp', `data-k="${k}"`)}</div>`).join('')}</div>`;
  },
};
ACT.tview = ds => { UI.tab.tview = ds.v; UI.swapFrom = null; render(); };
ACT.swapMode = () => { UI.swapMode = !UI.swapMode; UI.swapFrom = null; render(); };
ACT.swapSlot = ds => {
  const T = G.tactics, i = +ds.i;
  if (!UI.swapMode || !Number.isInteger(i) || i < 0 || i >= T.slots.length) return;
  const from = UI.swapFrom;
  if (from == null) { if (!T.slots[i]) return toast('Pick a player first.'); UI.swapFrom = i; return render(); }
  UI.swapFrom = null;
  if (from !== i) { assignSlot(i, T.slots[from]); saveGame(); toast('Starting positions swapped.'); }
  render();
};
ACT.style = ds => {
  UI.swapFrom = null;
  const T = G.tactics, shape = T.ip + '/' + T.oop;
  applyStyle(T, ds.v);
  if (shape !== T.ip + '/' + T.oop) { G.training.fam = Math.max(20, G.training.fam - 15); T.pi = {}; ensureUserLineup(); }
  toast(`${STYLES[ds.v].n}: ${T.ip} in possession, ${T.oop} without the ball.`);
  render();
};
ACT.ins = ds => { G.tactics[ds.k] = +ds.v; render(); };
ACT.autoPick = () => { UI.swapFrom = null; const T = G.tactics, pk = autoPick(G.club, T.ip); T.slots = pk.xi; T.bench = pk.bench; T.cap = T.pk = T.fk = T.ck = null; autoSetPieces(); toast('Best available XI selected.'); render(); };
CHG.shape = (v, ds) => {
  const T = G.tactics;
  if (T[ds.k] === v) return;
  UI.swapFrom = null;
  T[ds.k] = v;
  if (ds.k === 'ip') { T.roles = Array(11).fill(0); T.pi = {}; }
  G.training.fam = Math.max(20, G.training.fam - (ds.k === 'ip' ? 15 : 8));
  toast('Shape changed. Tactical familiarity drops while the players adjust.');
  render();
};
CHG.setp = (v, ds) => { G.tactics[ds.k] = +v; };

function assignSlot(i, pid) {
  const T = G.tactics, cur = T.slots[i], xi = T.slots.indexOf(pid), bi = T.bench.indexOf(pid);
  if (xi >= 0) T.slots[xi] = cur;
  else if (bi >= 0) { if (cur) T.bench[bi] = cur; else T.bench.splice(bi, 1); }
  T.slots[i] = pid;
}
ACT.slot = ds => {
  const T = G.tactics, i = +ds.i, pos = FORMATIONS[T.ip][i][0];
  const cands = seniorSquad(G.club).sort((a, b) => ovrAt(b, pos) - ovrAt(a, pos));
  const starter = p => T.slots.includes(p.id);
  const starters = T.slots.map(id => G.players[id]).filter(p => p && p.id !== T.slots[i]);
  const bench = cands.filter(p => !starter(p) && T.bench.includes(p.id)), others = cands.filter(p => !starter(p) && !T.bench.includes(p.id));
  const row = (p, swap) => {
    const current = starter(p) ? FORMATIONS[T.ip][T.slots.indexOf(p.id)][0] : p.pos;
    const selectable = availableForLeague(p, G.club);
    return `<button class="row act" data-a="pickSlot" data-i="${i}" data-id="${p.id}" ${selectable ? '' : 'disabled'}><span class="pos">${pitchPosLabel(current)}</span><span class="grow"><b>${esc(pname(p))}</b><small>${!selectable ? !available(p) ? p.inj ? 'Injured' : 'Suspended' : 'Not registered for the Premier League' : swap ? `Swap ${pitchPosLabel(current)} ↔ ${pitchPosLabel(pos)}` : 'Select at ' + pitchPosLabel(pos)}</small></span>${condBar(p.cond)}</button>`;
  };
  const group = (name, list, swap = false) => list.length ? `<h4 class="lbl">${name}</h4><div class="list">${list.map(p => row(p, swap)).join('')}</div>` : '';
  sheet(`<h3 class="sh-t">${POS_NAME[pos]}</h3>
    ${G.players[T.slots[i]] ? `<p>Currently ${playerLink(T.slots[i])} · ${pitchPosLabel(pos)}</p>` : ''}
    <p class="muted">Choose another starter to swap positions. Choose a substitute or squad player to replace this player.</p>
    <h4 class="lbl">Role</h4><div class="chips">${ROLES[pos].map((r, k) => `<button class="chip ${T.roles[i] === k ? 'on' : ''}" data-a="role" data-i="${i}" data-k="${k}">${r.n}</button>`).join('')}</div>
    ${group('Starting XI — swap positions', starters, true)}${group('Substitutes', bench)}${group('Other squad players', others)}`, { key: 'slot:' + i, restore: () => ACT.slot({ i }), onClose: () => render() });
};
ACT.role = ds => { G.tactics.roles[+ds.i] = +ds.k; ACT.slot(ds); };
ACT.pickSlot = ds => { const p = G.players[+ds.id]; if (!p || p.club !== G.club || !availableForLeague(p, G.club)) return; assignSlot(+ds.i, p.id); UI.swapFrom = null; saveGame(); closeSheet(true); render(); };
ACT.benchSlot = ds => {
  const T = G.tactics, i = +ds.i;
  const cands = seniorSquad(G.club).filter(p => availableForLeague(p, G.club) && !T.slots.includes(p.id) && !T.bench.includes(p.id)).sort((a, b) => b.ca - a.ca);
  sheet(`<h3 class="sh-t">${i >= 0 ? 'Replace ' + esc(pname(G.players[T.bench[i]])) : 'Add a substitute'}</h3>
    ${i >= 0 ? `<button class="btn ghost wide" data-a="benchDrop" data-i="${i}">Remove from the bench</button>` : ''}
    <div class="list">${cands.map(p => `<button class="row act" data-a="benchPick" data-i="${i}" data-id="${p.id}"><span class="pos">${p.pos}</span><span class="grow"><b>${esc(pname(p))}</b><small>${p.status}</small></span>${condBar(p.cond)}</button>`).join('') || empty('Nobody available', 'Every fit player is already in the matchday squad.')}</div>`, { key: 'bench:' + i, restore: () => ACT.benchSlot({ i }), onClose: () => render() });
};
ACT.benchPick = ds => { const T = G.tactics, i = +ds.i; if (i >= 0) T.bench[i] = +ds.id; else T.bench.push(+ds.id); closeSheet(true); render(); };
ACT.benchDrop = ds => { G.tactics.bench.splice(+ds.i, 1); closeSheet(true); render(); };

/* ---------- player instructions ---------- */
SCREENS.pinstr = {
  render() {
    const T = G.tactics, ip = FORMATIONS[T.ip];
    ensureUserLineup();
    const rep = tacticReport(T);
    return `<h1 class="h1">Player instructions</h1>
      <p class="muted">Instructions belong to a position, so they stay when you change the player. They add to the role and can differ from the team instructions. An instruction makes a player try something more often; whether it works depends on his attributes (a poor dribbler told to dribble more just loses the ball more).</p>
      ${rep.overall != null ? `<p class="muted">Fit shows how well each player suits what the team instructions ask of his position.</p>` : ''}
      <div class="list">${T.slots.map((id, i) => {
        const p = G.players[id], pos = ip[i][0], set = PLAYER_INS.filter(x => T.pi[i] && T.pi[i][x.k] != null && T.pi[i][x.k] !== 1), f = rep.perSlot(i);
        return `<button class="row act" data-a="piOpen" data-i="${i}"><span class="pos">${pos}</span><span class="grow"><b>${p ? esc(pname(p)) : 'Empty'}</b><small>${esc(roleName(T, i))}${set.length ? ' · ' + set.map(x => x.o[T.pi[i][x.k]]).join(', ') : ''}</small></span>${f == null ? '' : `<span class="stat"><b class="${f >= 60 ? 'good' : f >= 45 ? 'warn' : 'bad'}">${f}%</b><small>fit</small></span>`}<span class="chev">›</span></button>`;
      }).join('')}</div>
      <div class="btns"><button class="btn" data-a="piClear">Clear all</button><button class="btn" data-a="go" data-s="tactics">Back to tactics</button></div>`;
  },
};
ACT.piOpen = ds => {
  const T = G.tactics, i = +ds.i, pos = FORMATIONS[T.ip][i][0], p = G.players[T.slots[i]], cur = T.pi[i] || {};
  const list = pos === 'GK' ? PLAYER_INS.filter(x => GK_INS.includes(x.k)) : PLAYER_INS;
  sheet(`<h3 class="sh-t">${POS_NAME[pos]} <small>${p ? esc(pname(p)) : ''}</small></h3>
    <h4 class="lbl">Role</h4><div class="chips">${ROLES[pos].map((r, k) => `<button class="chip ${T.roles[i] === k ? 'on' : ''}" data-a="piRole" data-i="${i}" data-k="${k}">${r.n}</button>`).join('')}</div>
    ${list.map(x => `<div class="field"><label>${x.n}</label><div class="seg">${x.o.map((o, v) => `<button class="${(cur[x.k] ?? 1) === v ? 'on' : ''}" data-a="piSet" data-i="${i}" data-k="${x.k}" data-v="${v}">${o}</button>`).join('')}</div></div>`).join('')}`,
  { key: 'pi:' + i, restore: () => ACT.piOpen({ i }), onClose: () => render() });
};
ACT.piRole = ds => { G.tactics.roles[+ds.i] = +ds.k; ACT.piOpen(ds); };
ACT.piSet = ds => { const T = G.tactics, i = +ds.i, x = T.pi[i] || (T.pi[i] = {}); x[ds.k] = +ds.v; if (+ds.v === 1) delete x[ds.k]; ACT.piOpen(ds); };
ACT.piClear = () => { G.tactics.pi = {}; toast('Player instructions cleared.'); render(); };

/* ---------- training ---------- */
SCREENS.training = {
  render() {
    const T = G.training, foc = TRAINING_FOCUS.find(f => f.k === T.focus);
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const short = { bal: 'Mixed', att: 'Attack', def: 'Defend', phy: 'Fitness', tac: 'Shape', set: 'Set piece', rec: 'Light' }[T.focus];
    const plan = ['Recover', short, short, 'Shape', 'Prep', 'Match', 'Rest'];
    const coach = staffAvg('Coach'), physio = staffAvg('Physio');
    const risk = Math.round(0.6 * (1 + T.intensity * 0.6) * (T.focus === 'phy' ? 1.4 : 1) * (1.3 - physio / 40) * 10) / 10;
    const mine = squadOf(G.club);
    const focused = mine.filter(p => T.indiv[p.id] && T.indiv[p.id] !== 'none');
    const dev = ensureTrainingDev(), reports = (dev?.reports || []).slice().reverse();
    const deltaCA = p => p.ca - (dev?.base?.[p.id]?.ca ?? p.ca);
    const changed = mine.filter(p => deltaCA(p) !== 0);
    const attrNet = mine.reduce((sum, p) => sum + p.at.reduce((n, v, i) => n + v - (dev?.base?.[p.id]?.at?.[i] ?? v), 0), 0);
    const signed = n => `${n > 0 ? '+' : ''}${n}`;
    const trainingReport = r => {
      const when = fmtDate(weekDate(r.week), false);
      const rows = r.players.map(x => {
        const p = G.players[x.id];
        if (!p || p.club !== G.club) return '';
        const stats = x.changes.map(([i, d]) => `<span class="dev-change ${d < 0 ? 'down' : ''}">${esc(ATTRS[i][1])} ${signed(d)}</span>`).join('');
        return `<div class="dev-report-row">${playerLink(p.id, fullName(p))}<span class="dev-changes">${stats}</span><small class="dev-ca ${x.ca < 0 ? 'down' : ''}">CA ${signed(x.ca)}</small></div>`;
      }).join('');
      return `<details class="dev-week" ${reports[0] === r ? 'open' : ''}><summary><b>${when}</b><span>Week ${r.week + 1} · ${r.players.length} player${r.players.length === 1 ? '' : 's'} with changes</span><i>›</i></summary><div class="dev-week-body">${rows || '<p class="muted">No player attributes changed this week.</p>'}</div></details>`;
    };
    return `<h1 class="h1">Training</h1>
      ${coachCard()}
      <section class="card dev-dashboard"><div class="sec-h"><h2>Development dashboard</h2><span class="muted">${seasonLabel()}</span></div>
        <div class="kv"><div><small>Players with CA change</small><b>${changed.length} / ${mine.length}</b></div><div><small>Net attribute points</small><b class="${attrNet < 0 ? 'down' : 'up'}">${signed(attrNet)}</b></div><div><small>Weekly reports</small><b>${reports.length}</b></div></div>
        <p class="muted">Season totals include first team, reserves and academy. Player profiles show each attribute's change from the season start. Current ability updates automatically from attributes.</p>
        <h3 class="lbl">Weekly training report</h3>${reports.length ? reports.map(trainingReport).join('') : '<p class="muted">The first report will appear after the next week advances.</p>'}
      </section>
      <div class="week">${days.map((d, i) => `<div class="${plan[i] === 'Match' ? 'm' : plan[i] === 'Rest' ? 'r' : ''}"><small>${d}</small><b>${plan[i]}</b></div>`).join('')}</div>
      <div class="sec-h"><h2>Weekly focus</h2></div>
      <div class="grid2">${TRAINING_FOCUS.map(f => `<button class="gcard ${T.focus === f.k ? 'on' : ''}" data-a="tfocus" data-v="${f.k}"><b>${f.n}</b><small>${f.d}</small></button>`).join('')}</div>
      <div class="sec-h"><h2>Intensity</h2></div>
      <div class="seg wide">${INTENSITY.map((n, i) => `<button class="${T.intensity === i ? 'on' : ''}" data-a="tint" data-v="${i}">${n}</button>`).join('')}</div>
      <div class="kv"><div><small>Coaching quality</small><b>${coach.toFixed(1)} / 20</b></div><div><small>Facilities</small><b>Level ${G.board.facTrain}</b></div><div><small>Weekly injury risk</small><b class="${risk > 1.2 ? 'bad' : risk > 0.8 ? 'warn' : 'good'}">${risk}% per player</b></div><div><small>Tactical familiarity</small><b>${T.fam}%</b></div></div>
      <div class="sec-h"><h2>Individual focus</h2><span class="muted">${focused.length} players</span></div>
      <p class="muted">Set an individual focus from any player's profile.</p>
      <div class="list">${focused.map(p => playerRow(p, '', { noBadge: true, sub: INDIV_FOCUS[T.indiv[p.id]] })).join('')}</div>`;
  },
};
ACT.tfocus = ds => { G.training.focus = ds.v; render(); };
ACT.tint = ds => { G.training.intensity = +ds.v; render(); };

SCREENS.medical = {
  render() {
    const sq = seniorSquad(G.club), inj = sq.filter(p => p.inj).sort((a, b) => b.inj.w - a.inj.w), tired = sq.filter(p => !p.inj && p.cond < 80).sort((a, b) => a.cond - b.cond);
    return `<h1 class="h1">Medical centre</h1>
      ${physioCard()}
      <div class="kv"><div><small>Physio quality</small><b>${staffAvg('Physio').toFixed(1)} / 20</b></div><div><small>Training load</small><b>${INTENSITY[G.training.intensity]}</b></div></div>
      <div class="sec-h"><h2>Injured</h2><span class="muted">${inj.length}</span></div>
      <div class="list">${inj.map(p => playerRow(p, `<span class="stat"><b>${p.inj.w}</b><small>wks</small></span>`, { noBadge: true, sub: p.inj.n })).join('') || empty('No injuries', 'The whole squad is available.')}</div>
      <div class="sec-h"><h2>Low condition</h2><span class="muted">Rest them or switch to recovery training</span></div>
      <div class="list">${tired.map(p => playerRow(p, condBar(p.cond), { noBadge: true, sub: 'Condition ' + p.cond + '%' })).join('') || empty('Everyone is fresh', 'No player is below 80% condition.')}</div>`;
  },
};

SCREENS.youth = {
  render() {
    if (userClub().league === 'ECH') return `<h1 class="h1">Reserve development</h1><p class="muted">Championship clubs have first team and reserves only, with a combined maximum of 36 players. New prospects join the reserves when there is space.</p><div class="list">${levelSquad(G.club, 'R').map(p => playerRow(p)).join('')}</div>`;
    const y = levelSquad(G.club, 'Y').sort((a, b) => b.pa - a.pa);
    const d = new Date(G.season + 1, 2, 15);
    return `<h1 class="h1">Youth academy</h1>
      <div class="kv"><div><small>Youth facilities</small><b>Level ${G.board.facYouth}</b></div><div><small>Next intake</small><b>${G.flags.intake ? 'Next March' : fmtDate(d, false)}</b></div></div>
      <p class="muted">The U18s train every week. At 19 they move up to the reserves. Promote the best ones early from their profile to give them first-team minutes.</p>
      <div class="list">${y.map(p => playerRow(p, `<span class="stat">${starHtml(stars(p.pa))}</span>`, { noBadge: true, sub: POS_NAME[p.pos] })).join('') || empty('No academy players', 'The youth intake arrives each March.')}</div>`;
  },
};
