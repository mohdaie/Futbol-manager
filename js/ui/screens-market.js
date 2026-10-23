'use strict';
/* ===== screens-market.js =====
   Transfers hub (player search, shortlist, scouting, agent pitches, bids, history),
   offer and contract negotiation sheets, finances, staff and the board. */

SCREENS.transfers = {
  render() {
    const t = UI.tab.tr || 'deals', win = windowState();
    const head = `<h1 class="h1">Transfers</h1>
      <div class="banner ${win.open ? 'open' : ''} ${win.open && win.left <= 3 ? 'dl' : ''}"><b>${win.label}${win.open ? (win.left === 0 ? ' · DEADLINE DAY, shuts 23:00' : ' · closes ' + win.closes + ' · ' + win.left + ' days left') : ' · opens ' + win.opens}</b><span>Budget ${money(G.fin.tb)} · Wages ${wageFmt(clubWageBill(userClub()))} of ${wageFmt(G.fin.wb)}</span></div>
      ${tabs('tr', [['deals', 'Deals'], ['advice', 'Scout advice'], ['search', 'Search'], ['short', 'Shortlist'], ['scout', 'Scouting'], ['pitch', 'Pitches'], ['bids', 'Selling'], ['agents', 'Agents'], ['hist', 'History']], t)}`;
    return head + TR_TABS[t]();
  },
};

const TR_TABS = {
  advice() { return scoutCard(); },
  search() {
    const S = UI.search, submitted = UI.tab.transferQuery, searching = hasTransferSearch(submitted);
    const trends = searching ? [] : trendingTransferPlayers(), res = searching ? searchTransferPlayers(submitted) : trends.map(row => row.p);
    const pages = Math.max(1, Math.ceil(res.length / TRANSFER_SEARCH_PAGE));
    const page = clamp(Math.floor(+UI.tab.transferPage || 0), 0, pages - 1), first = page * TRANSFER_SEARCH_PAGE;
    const list = res.slice(first, first + TRANSFER_SEARCH_PAGE);
    const status = searching ? `<h2 class="h2">Search results</h2><p class="muted">${res.length} players match${res.length ? ` · ${first + 1}–${first + list.length}` : ''}. Ratings are scouting estimates.</p>` : '<h2 class="h2">Trending players</h2><p class="muted">Up to 20 players in transfer news and rumours from the last 14 days. Search by name or choose filters to find other players.</p>';
    return `<form id="transferSearchForm" class="card filters">
        <div class="field"><label for="sPos">Position</label>${selectHtml('sPos', ['Any', ...POSITIONS], S.pos, 'sf', 'data-k="pos"')}</div>
        <div class="field"><label for="sReg">Region</label>${selectHtml('sReg', REGIONS, S.region, 'sf', 'data-k="region"')}</div>
        <div class="field"><label for="sAge">Max age</label>${selectHtml('sAge', [18, 21, 23, 25, 28, 30, 33, 40], S.maxAge, 'sf', 'data-k="maxAge" data-n="1"')}</div>
        <div class="field"><label for="sFee">Max value</label>${selectHtml('sFee', [[0, 'Any'], [1e6, '£1m'], [5e6, '£5m'], [10e6, '£10m'], [20e6, '£20m'], [40e6, '£40m'], [70e6, '£70m'], [100e6, '£100m']], S.maxFee, 'sf', 'data-k="maxFee" data-n="1"')}</div>
        <div class="field"><label for="sOvr">Min rating</label>${selectHtml('sOvr', [[0, 'Any'], 60, 65, 70, 75, 80, 85], S.minOvr, 'sf', 'data-k="minOvr" data-n="1"')}</div>
        <div class="field"><label for="sName">Name or inspirational figure</label><input id="sName" type="search" value="${esc(S.name)}" placeholder="Player name" data-c="sf" data-k="name"></div>
        <div class="btns"><button type="submit" class="btn pri" data-a="transferSearch">Search players</button><button type="button" class="btn" data-a="transferTrending">Trending</button></div>
      </form>${status}
      <div id="transferSearchResults" class="list">${list.map(p => playerRow(p, `<span class="stat"><b>${money(pValue(p))}</b><small>value</small></span>`, searching ? {} : { sub: clubName(p.club) + ' · ' + trends.find(row => row.p.id === p.id).label })).join('') || (searching ? empty('No players found', 'Try another name or adjust the filters.') : empty('No transfer stories yet', 'Trending players will appear here as transfer news and rumours develop.'))}</div>
      ${searching && pages > 1 ? `<div class="btns"><button class="btn" data-a="transferPage" data-page="${page - 1}" ${page === 0 ? 'disabled' : ''}>Previous</button><span class="muted">Page ${page + 1} of ${pages}</span><button class="btn" data-a="transferPage" data-page="${page + 1}" ${page + 1 === pages ? 'disabled' : ''}>Next</button></div>` : ''}`;
  },
  short() {
    const list = G.shortlist.map(id => G.players[id]).filter(p => p && p.club !== G.club);
    return `<div class="list">${list.map(p => playerRow(p, `<span class="stat"><b>${money(pValue(p))}</b><small>value</small></span>`)).join('') || empty('Shortlist is empty', 'Add players from their profile to track them here.')}</div>`;
  },
  scout() {
    const scouts = staffOf('Scout'), A1 = G.scout.assign, jobs = G.scout.jobs, free = scouts.filter(s => scoutLoad(s) === 0).length;
    const f = UI.tab.newAssign || { region: 'Everywhere', pos: 'Any', maxAge: 30, weeks: 4 };
    UI.tab.newAssign = f;
    const fd = UI.tab.sfold || 'new', files = G.scout.reports.filter(r => (r.folder || 'new') === fd && G.players[r.pid]);
    const scoutRow = s => `<div class="row"><span class="grow"><b>${esc(s.name)}</b><small>Rating ${s.rating} · knows ${esc(scoutRegion(s))} · ${scoutLoad(s) >= SCOUT_LOAD ? 'fully booked' : (SCOUT_LOAD - scoutLoad(s)) + ' of 3 places free'}</small></span></div>`;
    return `<div class="card"><h3>Scouts <small>${scouts.length}</small></h3><p class="muted">Each scout follows up to three players, or runs one assignment. A scout who knows a region learns faster there.</p>
        <div class="list">${scouts.map(scoutRow).join('') || '<p class="muted">No scouts. Hire one in Staff.</p>'}</div></div>
      <div class="card"><h3>Following <small>${jobs.length}</small></h3>
        <div class="list">${jobs.map(j => { const p = G.players[j.pid], s = scoutById(j.sid); return p ? `<div class="row"><span class="grow"><b>${playerLink(p.id, fullName(p))}</b><small>${j.mode === 'video' ? 'Video analysis' : esc(s ? s.name : 'Scout')} · ${knowOf(p)}% · ${j.n || 0} watched · ${Math.max(0, j.end - dayAbs())} days left</small></span><button class="btn sm" data-a="scoutFile" data-id="${p.id}">File</button><button class="btn sm ghost" data-a="stopScout" data-id="${j.id}">Stop</button></div>` : ''; }).join('') || '<p class="muted">Nobody yet. Open a player and choose Scouting > Send a scout.</p>'}</div></div>
      <div class="card"><h3>Assignments <small>${A1.length}</small></h3><p class="muted">A scout searches a region and files first reports on two players a week.</p>
        <div class="list">${A1.map(a => `<div class="row"><span class="grow"><b>${esc(a.region)} · ${a.pos === 'Any' ? 'Any position' : POS_NAME[a.pos]}</b><small>${esc((scoutById(a.sid) || {}).name || 'Scout')} · age ${a.maxAge} or under · ${a.left} week${a.left > 1 ? 's' : ''} left</small></span><button class="btn sm ghost" data-a="cancelAssign" data-id="${a.id}">Cancel</button></div>`).join('')}</div>
        ${free > 0 ? `<div class="two">
          <div class="field"><label for="aReg">Region</label>${selectHtml('aReg', REGIONS, f.region, 'af', 'data-k="region"')}</div>
          <div class="field"><label for="aPos">Position</label>${selectHtml('aPos', ['Any', ...POSITIONS], f.pos, 'af', 'data-k="pos"')}</div>
          <div class="field"><label for="aAge">Max age</label>${selectHtml('aAge', [19, 21, 23, 25, 28, 30, 35], f.maxAge, 'af', 'data-k="maxAge" data-n="1"')}</div>
          <div class="field"><label for="aWk">Duration</label>${selectHtml('aWk', [[2, '2 weeks'], [4, '4 weeks'], [8, '8 weeks']], f.weeks, 'af', 'data-k="weeks" data-n="1"')}</div></div>
          <button class="btn pri wide" data-a="addAssign">Start assignment (£15k a week)</button>` : '<p class="note">No scout is completely free for an assignment.</p>'}
      </div>
      <div class="sec-h"><h2>Scouting files</h2><span class="muted">${G.scout.reports.length}</span></div>
      <div class="seg wrap">${FOLDERS.map(([k, n]) => `<button class="${fd === k ? 'on' : ''}" data-a="scoutFolder" data-v="${k}">${n} ${G.scout.reports.filter(r => (r.folder || 'new') === k).length}</button>`).join('')}</div>
      <div class="list">${files.map(r => { const p = G.players[r.pid]; return playerRow(p, `<span class="grade g${r.grade}">${r.grade}</span>`, { sub: `${knowOf(p)}% · ${knowStage(knowOf(p))[1]} · ${r.rec || 'Watch more'}` }); }).join('') || empty('No files here', 'Send scouts to watch players, or move files into this folder.')}</div>`;
  },
  pitch() {
    const list = G.pitches.filter(x => G.players[x.pid] && G.players[x.pid].club !== G.club);
    return `<p class="muted">Agents offer players who fit your weakest position. Make an offer and the Director of Football takes it from there.</p>
      <div class="list">${list.map(x => playerRow(G.players[x.pid], `<span class="stat"><b>${x.ask ? money(x.ask) : 'Free'}</b><small>asking</small></span>`)).join('') || empty('No pitches right now', 'Agents get in touch while a transfer window is open.')}</div>`;
  },
  bids() {
    const open = G.deals.filter(d => d.dir === 'out' && (dealOpen(d) || d.closed.date > today().getTime() - 864e5 * 14));
    const listed = seniorSquad(G.club).filter(p => p.listed);
    return `<div class="sec-h"><h2>Offers for your players</h2></div>
      <div class="list">${open.map(dealRow).join('') || empty('No offers', 'Transfer-listed players attract more bids.')}</div>
      <div class="sec-h"><h2>Transfer listed</h2></div>
      <div class="list">${listed.map(p => playerRow(p, `<span class="stat"><b>${money(pValue(p))}</b><small>value</small></span>`, { noBadge: true })).join('') || empty('Nobody listed', 'List players from their profile to invite bids.')}</div>`;
  },
  hist() {
    return `<div class="list">${G.tHist.slice(0, 60).map(t => `<div class="row tx ${t.to === G.club || t.from === G.club ? 'me' : ''}"><span class="grow"><b>${playerLink(t.pid, t.name)}</b><small>${fmtDate(t.date, false)} · ${clubLink(t.from)} → ${clubLink(t.to)}</small></span><span class="stat"><b>${t.fee ? money(t.fee) : 'Free'}</b></span></div>`).join('') || empty('No transfers yet', 'Completed deals across the league appear here.')}</div>`;
  },
};
CHG.sf = (v, ds) => { UI.search[ds.k] = ds.n ? +v : v; };
ACT.transferSearch = () => {
  for (const [key, id] of Object.entries({ pos: 'sPos', region: 'sReg', maxAge: 'sAge', maxFee: 'sFee', minOvr: 'sOvr', name: 'sName' })) {
    const field = document.getElementById(id); if (field) UI.search[key] = ['maxAge', 'maxFee', 'minOvr'].includes(key) ? +field.value : field.value;
  }
  UI.tab.transferQuery = { ...UI.search, name: UI.search.name.trim() }; UI.tab.transferPage = 0; render();
};
ACT.transferTrending = () => { UI.search = { ...TRANSFER_SEARCH_DEFAULTS }; UI.tab.transferQuery = null; UI.tab.transferPage = 0; render(); };
ACT.transferPage = ds => { UI.tab.transferPage = Math.max(0, Math.floor(+ds.page || 0)); render(); };
document.addEventListener('submit', e => { if (e.target.id === 'transferSearchForm') { e.preventDefault(); viewAction(() => ACT.transferSearch()); } });
CHG.af = (v, ds) => { UI.tab.newAssign[ds.k] = ds.n ? +v : v; };
ACT.addAssign = () => { const f = UI.tab.newAssign; if (addAssignment(f.region, f.pos, f.maxAge, f.weeks)) toast('Scout dispatched.'); else toast('No scout is free.'); render(); };
ACT.scoutFolder = ds => { UI.tab.sfold = ds.v; render(); };
ACT.stopScout = ds => { stopScouting(+ds.id); render(); };
ACT.cancelAssign = ds => { G.scout.assign = G.scout.assign.filter(a => a.id !== +ds.id); render(); };

/* ---------- scouting file ----------
   A dossier: cover, verdict, attributes (confirmed, estimate or not scouted), sections that open stage by stage,
   notes, matches watched and the history of the report. */
function scoutFileSheet(pid) {
  const p = G.players[pid];
  if (!p) return toast('That player has retired.');
  const k = knowOf(p), r = scoutFile(p), st = knowStage(k), nx = nextStage(k), so = seenOvr(p), fit = k >= 25 ? fileFit(p) : null;
  const job = G.scout.jobs.find(j => j.pid === p.id), lock = (need, what) => `<p class="lock">Opens at ${need}%: ${what}.</p>`;
  const groups = p.pos === 'GK' ? ['P', 'G', 'T', 'M'] : ['P', 'T', 'M'];
  const attrs = groups.map(g => `<div><h4 class="lbl">${ATTR_GROUPS[g]} <small>${ATTR_STAGE[g]}%</small></h4>${ATTRS.map((a, i) => (a[2] === g ? `<div class="at"><span>${a[1]}</span>${attrCell(p, i)}</div>` : '')).join('')}</div>`).join('');
  const sec = (title, need, html, what) => `<section class="fsec"><h4>${title}</h4>${k >= need ? html : lock(need, what)}</section>`;
  const yl = p.con - G.season;
  sheet(`<article class="sfile">
    <div class="sf-tab">Scouting department · File ${String(p.id).padStart(5, '0')}</div>
    <header class="sf-cover"><span class="sf-stamp">Confidential</span>
      <h3 class="sh-t" data-no-links>${esc(fullName(p))}</h3>
      <p>${POS_NAME[p.pos]}${p.alt.length ? ' / ' + p.alt.join(', ') : ''} · ${p.age} · ${natName(p.nat)} · ${p.foot} foot</p>
      <p>${badge(p.club, 16)} ${esc(clubName(p.club))}</p>
      <dl><div><dt>Scout</dt><dd>${esc(r.by || '-')}</dd></div><div><dt>Updated</dt><dd>${fmtDate(r.date, false)}</dd></div><div><dt>Matches watched</dt><dd>${r.seen.filter(x => x.rt != null || x.note === 'Did not play').length}</dd></div></dl>
    </header>
    <div class="sf-know"><div class="kvrow"><span>File complete</span><b>${k}% · ${st[1]}</b></div>${bar(k, k >= 90 ? 'good' : k >= 50 ? '' : 'warn')}
      <small class="muted">${nx ? `Next at ${nx[0]}%: ${STAGE_UNLOCK[nx[0]]}.` : 'Every value in this file is confirmed.'}${job ? ` Being scouted now (${job.mode === 'video' ? 'video' : esc((scoutById(job.sid) || {}).name || 'scout')}, ${Math.max(0, job.end - dayAbs())} days left).` : ''}</small></div>
    <section class="fsec verdict"><h4>Verdict</h4><div class="sf-verdict"><span class="grade g${r.grade}">${r.grade}</span><div><b>${esc(r.rec || 'Watch more')}</b><small>${GRADE_NOTE[r.grade]}</small></div><div class="r"><small>Ability</small>${ovrPill(so.v, so.txt)}</div></div>
      ${fit ? `<p>Best role for you: <b>${POS_NAME[fit.pos]}</b>, about ${fit.est}${fit.cur ? ` against ${playerLink(fit.cur.id, pname(fit.cur))} (${fit.curV})` : ''}.</p>` : ''}</section>
    <section class="fsec"><h4>Attributes</h4><p class="muted">Exact = confirmed · range = estimate · ? = not scouted yet</p><div class="attrs">${attrs}</div></section>
    ${sec('Contract and money', 50, `<div class="kv"><div><small>Contract ends</small><b>${p.club === 'FA' ? 'Free agent' : 'June ' + p.con + (yl <= 1 ? ' (expiring)' : '')}</b></div><div><small>Wage</small><b>${p.club === 'FA' ? 'Unattached' : wageFmt(p.wage)}</b></div><div><small>Value</small><b>${money(pValue(p))}</b></div><div><small>Asking price</small><b>${p.club === 'FA' ? 'Free' : '~' + money(askingPrice(p))}</b></div><div><small>Fitness</small><b>${p.inj ? esc(p.inj.n) + ', ' + p.inj.w + ' wk' : 'Fit'}</b></div></div>`, 'contract, wage, value and asking price')}
    ${sec('Personality and potential', 75, `<div class="kv"><div><small>Character</small><b>${p.pers}</b></div><div><small>Ambition</small><b>${ambLabel(p.amb)}</b></div><div><small>Potential</small><b>${starHtml(seenPot(p))}</b></div><div><small>Agent</small><b>${agentLink(agentOf(p))}</b></div></div><p class="muted">${CHARACTER[p.pers]}</p>`, 'personality, ambition, potential and agent')}
    ${sec('Full file', 90, `<div class="kv"><div><small>Happy at his club</small><b>${p.mor >= 70 ? 'Yes' : p.mor >= 45 ? 'Settled enough' : 'Unsettled'}</b></div><div><small>Role at his club</small><b>${p.club === 'FA' ? 'Without a club' : isKeyPlayer(p) ? 'Key player' : 'Squad player'}</b></div><div><small>Would join you</small><b>${p.ca > userClub().rep + 6 + joinPull(p) ? 'Unlikely' : 'Would listen'}</b></div><div><small>Likely wage demand</small><b>${wageFmt(wageDemand(p, false))}</b></div></div>`, 'happiness, role, interest in joining you and wage demand')}
    <section class="fsec"><h4>Scout's notes</h4>${(() => { const w = scoutWords(p); return w ? `<blockquote class="aiq">${esc(w)}</blockquote>` : ''; })()}<ul class="notes">${scoutNotes(p).map(n => `<li>${esc(n)}</li>`).join('')}</ul></section>
    <section class="fsec"><h4>Matches watched</h4>${r.seen.length ? `<div class="list">${r.seen.map(x => `<div class="row"><span class="grow"><b>${esc(x.opp || '')}${x.score ? ' ' + esc(x.score) : ''}</b><small>${fmtDate(x.date, false)} · ${esc(x.by || '')}${x.note ? ' · ' + esc(x.note) : ''}${x.gain ? ' · +' + x.gain + '%' : ''}</small></span>${x.rt != null ? `<span class="rt">${x.rt.toFixed(1)}</span>` : ''}</div>`).join('')}</div>` : '<p class="muted">Nobody has watched him yet.</p>'}</section>
    ${r.hist.length > 1 ? `<section class="fsec"><h4>Report history</h4><div class="list">${r.hist.map(h => `<div class="row"><span class="grow"><b>${h.k}% · ${knowStage(h.k)[1]}</b><small>${fmtDate(h.date, false)}</small></span><span class="grade g${h.grade}">${h.grade}</span></div>`).join('')}</div></section>` : ''}
    <section class="fsec"><h4>Folder</h4><div class="seg wrap">${FOLDERS.map(([f, n]) => `<button class="${r.folder === f ? 'on' : ''}" data-a="fileFolder" data-id="${p.id}" data-v="${f}">${n}</button>`).join('')}</div></section>
    <div class="btns">${job ? '' : `<button class="btn pri" data-a="scoutOne" data-id="${p.id}" ${k >= 100 ? 'disabled' : ''}>Send a scout</button><button class="btn" data-a="scoutOne" data-id="${p.id}" data-mode="video" ${k >= VIDEO_CAP ? 'disabled' : ''}>Video analysis £3k</button>`}<button class="btn" data-a="offer" data-id="${p.id}">${activeDeal(p.id, 'in') ? 'Open the deal' : 'Talk to the Director'}</button><button class="btn" data-a="player" data-id="${p.id}">Player profile</button></div>
  </article>`, { key: 'sfile:' + pid, restore: () => scoutFileSheet(pid), valid: () => !!G?.players[pid] });
}
ACT.scoutFile = ds => scoutFileSheet(+ds.id);
ACT.fileFolder = ds => { const p = G.players[+ds.id]; scoutFile(p).folder = ds.v; saveGame(); scoutFileSheet(p.id); };

/* ---------- offer & contract negotiation ---------- */
// Offers for players go through the Director of Football (screens-deals.js).
ACT.contract = ds => contractSheet(+ds.id, 0, ds.mode || 'renew');
function contractSheet(pid, fee, mode, msg) {
  const p = G.players[pid];
  if (!UI.con || UI.con.pid !== pid || UI.con.mode !== mode) {
    const d = wageDemand(p, mode === 'renew');
    UI.con = { pid, fee, mode, wage: d, years: p.age >= 31 ? 1 : 3, status: mode === 'renew' ? p.status : (p.ca >= userBestAt(p.pos) ? 'First team' : 'Rotation'), tries: 0 };
  }
  const C = UI.con, step = C.wageStep ??= C.wage >= 50000 ? 5000 : C.wage >= 10000 ? 1000 : 250;
  sheet(`<h3 class="sh-t">${mode === 'renew' ? 'New contract' : 'Personal terms'}: ${esc(pname(p))}</h3>
    <p class="muted">${mode === 'renew' ? 'Current wage ' + wageFmt(p.wage) + ' · ends June ' + p.con : (fee ? 'Fee agreed: ' + money(fee) : 'Free transfer')}. Agent's opening demand: ${wageFmt(wageDemand(p, mode === 'renew'))}.</p>
    <h4 class="lbl">Weekly wage</h4>
    <div class="stepper"><button class="btn" aria-label="Lower weekly wage by ${moneyExact(step * 5)}" data-a="wStep" data-v="${-step * 5}">−−</button><button class="btn" aria-label="Lower weekly wage by ${moneyExact(step)}" data-a="wStep" data-v="${-step}">−</button><b aria-live="polite" aria-atomic="true">${moneyExact(C.wage)}/w</b><button class="btn" aria-label="Raise weekly wage by ${moneyExact(step)}" data-a="wStep" data-v="${step}">+</button><button class="btn" aria-label="Raise weekly wage by ${moneyExact(step * 5)}" data-a="wStep" data-v="${step * 5}">++</button></div>
    <h4 class="lbl">Length</h4><div class="seg">${[1, 2, 3, 4, 5].map(y => `<button class="${C.years === y ? 'on' : ''}" data-a="cYears" data-v="${y}">${y} yr</button>`).join('')}</div>
    <h4 class="lbl">Squad status promise</h4><div class="chips">${['Key player', 'First team', 'Rotation', 'Backup', 'Prospect'].map(s => `<button class="chip ${C.status === s ? 'on' : ''}" data-a="cStatus" data-v="${s}">${s}</button>`).join('')}</div>
    <p class="muted">Wage budget: ${wageFmt(clubWageBill(userClub()))} used of ${wageFmt(G.fin.wb)}. Promising a bigger role lowers the wage demand.</p>
    ${msg ? `<p class="note">${esc(msg)}</p>` : ''}
    <button class="btn pri wide" data-a="sendContract">Offer contract</button>`, { key: 'contract:' + pid + ':' + mode, restore: () => contractSheet(pid, fee, mode, msg), valid: () => !C.closed && C.tries < 4 && !!G?.players[pid] && (mode === 'renew' || G.players[pid].club !== G.club), onClose: () => render() });
}
ACT.wStep = ds => { UI.con.wage = Math.max(300, UI.con.wage + +ds.v); contractSheet(UI.con.pid, UI.con.fee, UI.con.mode); };
ACT.cYears = ds => { UI.con.years = +ds.v; contractSheet(UI.con.pid, UI.con.fee, UI.con.mode); };
ACT.cStatus = ds => { UI.con.status = ds.v; contractSheet(UI.con.pid, UI.con.fee, UI.con.mode); };
ACT.sendContract = () => {
  const C = UI.con, res = offerContract(C.pid, C.wage, C.years, C.status, C.fee, C.mode);
  if (res.ok) {
    G.news.forEach(n => { if (n.action && n.action.t === 'renew' && n.action.pid === C.pid) n.done = true; });
    C.closed = true; UI.con = null; UI.neg = null; closeSheet(true); toast(res.msg); saveGame(); render(); return;
  }
  C.tries++;
  if (C.tries >= 4 && !res.msg.startsWith('The board')) { C.closed = true; UI.con = null; closeSheet(true); toast('Talks have broken down. The player has walked away for now.'); render(); return; }
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
    const row = (s, hire) => `<div class="row"><span class="grow"><b>${esc(s.name)}</b><small>${STAFF_TITLE[s.role] || s.role} · age ${s.age} · ${wageFmt(s.wage)}</small></span><span class="rt ${s.rating >= 15 ? 'good' : s.rating < 8 ? 'bad' : ''}">${s.rating}</span>${hire ? `<button class="btn sm" data-a="hire" data-id="${s.id}">Hire</button>` : `<button class="btn sm ghost" data-a="fire" data-id="${s.id}">Release</button>`}</div>`;
    const rec = typeof assistantRecord === 'function' ? assistantRecord() : null;
    return `<h1 class="h1">Staff</h1>
      <div class="card"><h3>AI-assisted staff</h3><p class="muted">Your assistant manager advises before each match: he plays it through with the game's own engine and recommends a tactic. The better his rating, the more options he tries and the more accurate he is. Advice and results are recorded.</p>
        ${rec ? `<div class="kv"><div><small>Results called right</small><b>${rec.accuracy}% of ${rec.n}</b></div><div><small>Tactic advice followed</small><b>${rec.nf ? rec.followed + ' pts/game' : '-'}</b></div><div><small>Advice not followed</small><b>${rec.ni ? rec.ignored + ' pts/game' : '-'}</b></div></div>` : '<p class="muted">No advice recorded yet. Ask him on the pre-match screen.</p>'}</div>
      ${Object.keys(STAFF_ROLES).map(role => `<div class="sec-h"><h2>${STAFF_TITLE[role] || role + 's'}</h2><span class="muted">${staffOf(role).length}/${STAFF_ROLES[role]} · ${STAFF_DESC[role]}</span></div><div class="list">${staffOf(role).map(s => row(s)).join('') || '<p class="muted">Vacant</p>'}</div>`).join('')}
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
