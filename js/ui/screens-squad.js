'use strict';
/* ===== screens-squad.js =====
   Squad list, player profile sheet (talks, status, contract, listing),
   tactics with the in/out-of-possession visualiser, training, medical, youth academy. */

const SORTS = { pos: (a, b) => POSITIONS.indexOf(a.pos) - POSITIONS.indexOf(b.pos) || b.ca - a.ca, ovr: (a, b) => b.ca - a.ca, age: (a, b) => a.age - b.age, cond: (a, b) => a.cond - b.cond, mor: (a, b) => b.mor - a.mor, val: (a, b) => pValue(b) - pValue(a) };

SCREENS.squad = {
  render() {
    const f = UI.f.squad, s = UI.f.sort;
    const list = seniorSquad(G.club).filter(p => f === 'ALL' || POS_GROUP[p.pos] === f).sort(SORTS[s]);
    const xi = new Set(G.tactics.slots);
    return `<h1 class="h1">Squad <small>${seniorSquad(G.club).length} players</small></h1>
      <div class="chips">${[['ALL', 'All'], ['GK', 'Keepers'], ['DEF', 'Defence'], ['MID', 'Midfield'], ['ATT', 'Attack']].map(([k, n]) => `<button class="chip ${f === k ? 'on' : ''}" data-a="sqF" data-v="${k}">${n}</button>`).join('')}</div>
      <div class="sortbar"><span class="muted">Sort</span>${[['pos', 'Position'], ['ovr', 'Rating'], ['age', 'Age'], ['cond', 'Condition'], ['mor', 'Morale'], ['val', 'Value']].map(([k, n]) => `<button class="${s === k ? 'on' : ''}" data-a="sqS" data-v="${k}">${n}</button>`).join('')}</div>
      <div class="list">${list.map(p => playerRow(p, `${xi.has(p.id) ? '<span class="xitag">XI</span>' : ''}${condBar(p.cond)}`, { noBadge: true, sub: s === 'val' ? money(pValue(p)) : p.status + ' · ' + morLabel(p.mor) })).join('')}</div>`;
  },
};
ACT.sqF = ds => { UI.f.squad = ds.v; render(); };
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
    const best = POSITIONS.map(pos => [pos, ovrAt(p, pos)]).sort((a, b) => b[1] - a[1]).slice(0, 4);
    body = `<div class="attrs">${groups.map(g => `<div><h4 class="lbl">${ATTR_GROUPS[g]}</h4>${ATTRS.map((a, i) => (a[2] === g ? `<div class="at"><span>${a[1]}</span><b class="${attrClass(seenAttr(p, i).hi)}">${seenAttr(p, i).txt}</b></div>` : '')).join('')}</div>`).join('')}</div>
      ${mine || knowOf(p) >= 70 ? `<h4 class="lbl">Best positions</h4><div class="chips">${best.map(([pos, v]) => `<span class="chip static">${pos} ${v}</span>`).join('')}</div>` : `<p class="note">Scout knowledge ${knowOf(p)}%. Attribute ranges narrow as your scouts watch him.</p>`}`;
  } else if (t === 'stats') {
    const row = (lbl, s) => `<tr><td class="l">${lbl}</td><td>${s.a}</td><td>${s.g}</td><td>${s.as ?? '-'}</td><td>${s.a ? (s.rt / s.a).toFixed(2) : '-'}</td></tr>`;
    body = `<div class="tablewrap"><table class="tbl"><thead><tr><th class="l">Season</th><th>Apps</th><th>Gls</th><th>Ast</th><th>Avg</th></tr></thead><tbody>${row(seasonLabel(), p.st)}${p.prev ? row(p.prev.season, p.prev) : ''}<tr><td class="l">Career (in game)</td><td>${p.car.a}</td><td>${p.car.g}</td><td>-</td><td>-</td></tr></tbody></table></div>
      <div class="kv"><div><small>Player of the match</small><b>${p.st.mom}</b></div><div><small>Yellow / red</small><b>${p.st.yc} / ${p.st.rc}</b></div><div><small>Clean sheets</small><b>${p.st.cs}</b></div><div><small>Personality</small><b>${p.pers}</b></div></div>`;
  } else {
    const yl = p.con - G.season;
    body = `<div class="kv"><div><small>Value</small><b>${money(pValue(p))}</b></div><div><small>Wage</small><b>${p.club === 'FA' ? 'Unattached' : wageFmt(p.wage)}</b></div>
      <div><small>Contract ends</small><b>${p.club === 'FA' ? '-' : 'June ' + (p.con)}${p.club !== 'FA' && yl <= 1 ? ' <em class="tag warn">Expiring</em>' : ''}</b></div><div><small>${mine ? 'Squad status' : 'Asking price'}</small><b>${mine ? p.status : p.club === 'FA' ? 'Free' : knowOf(p) >= 50 ? '~' + money(askingPrice(p)) : 'Unknown'}</b></div></div>`;
  }
  let actions;
  if (mine) {
    actions = `<div class="btns">
      <button class="btn" data-a="talkOpen" data-id="${p.id}">Talk</button>
      <button class="btn" data-a="contract" data-id="${p.id}" data-mode="renew">New contract</button>
      <button class="btn" data-a="listToggle" data-id="${p.id}">${p.listed ? 'Remove from list' : 'Transfer list'}</button>
      ${p.youth ? `<button class="btn pri" data-a="promote" data-id="${p.id}">Promote to first team</button>` : ''}
      <button class="btn ghost ${UI.tab.rel === p.id ? 'bad' : ''}" data-a="release" data-id="${p.id}">${UI.tab.rel === p.id ? 'Confirm release' : 'Release'}</button></div>
      <div class="two"><div class="field"><label>Squad status</label>${selectHtml('st-' + p.id, ['Key player', 'First team', 'Rotation', 'Backup', 'Prospect'], p.status, 'pStatus', `data-id="${p.id}"`)}</div>
      <div class="field"><label>Individual training</label>${selectHtml('it-' + p.id, Object.entries(INDIV_FOCUS), G.training.indiv[p.id] || 'none', 'indiv', `data-id="${p.id}"`)}</div></div>`;
  } else {
    actions = `<div class="btns"><button class="btn pri" data-a="offer" data-id="${p.id}">${p.club === 'FA' ? 'Offer contract' : 'Make an offer'}</button>
      <button class="btn" data-a="shortlist" data-id="${p.id}">${G.shortlist.includes(p.id) ? 'Remove from shortlist' : 'Add to shortlist'}</button>
      ${knowOf(p) < 95 ? `<button class="btn ghost" data-a="scoutOne" data-id="${p.id}">Scout report (£10k)</button>` : ''}</div>`;
  }
  sheet(`<div class="phead">
      <div class="pnum" style="--k1:${G.clubs[p.club].c1}">${p.no || '-'}</div>
      <div class="grow"><h3 class="sh-t">${esc(fullName(p))}</h3><p class="muted">${POS_NAME[p.pos]}${p.alt.length ? ' / ' + p.alt.join(', ') : ''} · ${p.age} · ${NATIONS[p.nat].n} · ${p.foot} foot</p>
        <p class="pclub">${badge(p.club, 18)} ${esc(clubName(p.club))}${p.inj ? ` · <em class="tag bad">${esc(p.inj.n)}, ${p.inj.w} wk</em>` : ''}${p.ban ? ' · <em class="tag bad">Suspended</em>' : ''}</p></div>
      <div class="pov">${ovrPill(so.v, so.txt)}<small>Potential</small>${starHtml(pot)}</div></div>
    ${mine ? `<div class="meters"><div><small>Condition</small>${bar(p.cond, condClass(p.cond))}</div><div><small>Morale · ${morLabel(p.mor)}</small>${bar(p.mor, morClass(p.mor))}</div><div><small>Match sharpness</small>${bar(p.shp)}</div></div>` : ''}
    ${tabs('ps', [['attr', 'Attributes'], ['stats', 'Stats'], ['con', 'Contract']], t).replace(/data-a="tab"/g, `data-a="psTab" data-id="${p.id}"`)}
    ${body}${actions}`, { onClose: () => render() });
}
ACT.psTab = ds => { UI.tab.ps = ds.v; playerSheet(+ds.id); };
ACT.shortlist = ds => { const id = +ds.id; G.shortlist = G.shortlist.includes(id) ? G.shortlist.filter(x => x !== id) : [...G.shortlist, id]; playerSheet(id); };
ACT.scoutOne = ds => { const p = G.players[+ds.id]; if (scoutPlayer(p)) { toast('Report filed. Knowledge now ' + knowOf(p) + '%.'); } else toast('Not enough money for a scout report.'); playerSheet(p.id); };
ACT.listToggle = ds => { const p = G.players[+ds.id]; p.listed = !p.listed; if (p.listed) p.mor = clamp(p.mor - 6, 0, 100); toast(p.listed ? 'Transfer listed. Clubs will be told he is available.' : 'Removed from the transfer list.'); playerSheet(p.id); };
ACT.promote = ds => { const p = G.players[+ds.id]; p.youth = false; p.status = 'Prospect'; p.wage = Math.max(p.wage, 1500); addNews('club', `${fullName(p)} promoted`, `${fullName(p)} moves up from the academy to the first-team squad.`); toast('Promoted to the first team.'); closeSheet(true); render(); };
ACT.release = ds => {
  const p = G.players[+ds.id];
  if (UI.tab.rel !== p.id) { UI.tab.rel = p.id; return playerSheet(p.id); }
  UI.tab.rel = null;
  const comp = releasePlayer(p);
  closeSheet(true); toast(`${pname(p)} released. Paid ${money(comp)} in compensation.`); render();
};
CHG.pStatus = (v, ds) => { const p = G.players[+ds.id]; const old = p.status; p.status = v; const rank = s => ['Key player', 'First team', 'Rotation', 'Backup', 'Prospect'].indexOf(s); if (rank(v) > rank(old)) p.mor = clamp(p.mor - 8, 0, 100); toast(`${pname(p)} is now ${v.toLowerCase()}.`); };
CHG.indiv = (v, ds) => { G.training.indiv[+ds.id] = v; toast('Individual training updated.'); };

ACT.talkOpen = ds => {
  const p = G.players[+ds.id];
  if (p.talked === G.week) return toast(`You already spoke to ${pname(p)} this week.`);
  sheet(`<h3 class="sh-t">Talk to ${esc(pname(p))}</h3><p class="muted">Morale: ${morLabel(p.mor)}. Season average rating ${p.st.a ? avgRating(p).toFixed(2) : 'not set yet'}.</p>
    <div class="list">${[['praise', 'Praise his recent form'], ['crit', 'Criticise his recent form'], ['time', 'Promise more playing time'], ['future', 'Ask how he feels about his future']].map(([k, n]) => `<button class="row act" data-a="talk1" data-id="${p.id}" data-k="${k}"><span class="grow"><b>${n}</b></span><span class="chev">›</span></button>`).join('')}</div>`, { onClose: () => render() });
};
ACT.talk1 = ds => {
  const p = G.players[+ds.id], r = avgRating(p) || 6.7;
  p.talked = G.week;
  let d = 0, msg = '';
  if (ds.k === 'praise') { d = r >= 7 ? 6 : r >= 6.7 ? 2 : -3; msg = d > 0 ? 'He appreciates the recognition.' : 'He feels the praise is not deserved.'; }
  if (ds.k === 'crit') { const tough = ['Professional', 'Determined', 'Model Citizen'].includes(p.pers); d = r < 6.6 ? (tough ? 4 : -2) : -7; msg = d > 0 ? 'He accepts the criticism and promises to work harder.' : 'He reacts badly to the criticism.'; }
  if (ds.k === 'time') { d = 5; p.promise = G.week + 8; msg = 'He is pleased and will expect more minutes over the next two months.'; }
  if (ds.k === 'future') { d = 0; msg = p.mor > 65 ? 'He is happy here and wants to stay.' : p.mor > 40 ? 'He is unsure. Regular football would help.' : 'He is unhappy and would consider leaving.'; }
  p.mor = clamp(p.mor + d, 0, 100);
  closeSheet(true); toast(msg); playerSheet(p.id);
};

/* ---------- tactics ---------- */
SCREENS.tactics = {
  render() {
    const T = G.tactics, view = UI.tab.tview || 'ip';
    ensureUserLineup();
    const ip = FORMATIONS[T.ip], oop = FORMATIONS[T.oop], map = shapeMap(T.ip, T.oop);
    const toks = T.slots.map((id, i) => {
      const p = G.players[id], src = view === 'ip' ? ip[i] : oop[map[i]];
      const pos = ip[i][0], f = p ? fam(p, pos) : 0, r = p ? ovrAt(p, pos) : '-';
      const role = ROLES[pos][T.roles[i]] || ROLES[pos][0];
      return `<button class="tok ${f >= 0.97 ? '' : f >= 0.85 ? 'f2' : 'f3'}" style="left:${src[1] * 100}%;top:${src[2] * 100}%" data-a="slot" data-i="${i}">
        <span class="tk-c">${r}</span><span class="tk-n">${p ? esc(p.ln) : 'Empty'}</span><span class="tk-r">${view === 'ip' ? esc(role.n) : (oop[map[i]][0])}</span></button>`;
    }).join('');
    return `<h1 class="h1">Tactics</h1>
      <div class="two"><div class="field"><label for="tip">In possession</label>${selectHtml('tip', Object.keys(FORMATIONS), T.ip, 'shape', 'data-k="ip"')}</div>
      <div class="field"><label for="toop">Out of possession</label>${selectHtml('toop', Object.keys(FORMATIONS), T.oop, 'shape', 'data-k="oop"')}</div></div>
      <div class="seg wide">${[['ip', 'In possession'], ['oop', 'Out of possession']].map(([k, n]) => `<button class="${view === k ? 'on' : ''}" data-a="tview" data-v="${k}">${n}</button>`).join('')}</div>
      <div class="tpitch ${view}"><div class="tp-lines"></div>${toks}</div>
      <div class="famrow"><span>Tactical familiarity</span>${bar(G.training.fam, G.training.fam < 50 ? 'warn' : 'good')}<b>${G.training.fam}%</b></div>
      <div class="btns"><button class="btn pri" data-a="autoPick">Pick best XI</button><button class="btn" data-a="go" data-s="training">Training</button></div>
      <div class="sec-h"><h2>Substitutes</h2><span class="muted">${T.bench.length}/9</span></div>
      <div class="list">${T.bench.map((id, i) => { const p = G.players[id]; return `<button class="row act" data-a="benchSlot" data-i="${i}"><span class="pos">${p.pos}</span><span class="grow"><b>${esc(pname(p))}</b><small>${morLabel(p.mor)}</small></span>${condBar(p.cond)}${ovrPill(p.ca)}</button>`; }).join('')}
        ${T.bench.length < 9 ? '<button class="row act add" data-a="benchSlot" data-i="-1"><span class="grow"><b>Add a substitute</b></span><span class="chev">+</span></button>' : ''}</div>
      <div class="sec-h"><h2>Team instructions</h2></div>
      <div class="card">${INSTRUCTIONS.map(ins => `<div class="field"><label>${ins.n}</label><div class="seg">${ins.o.map((o, i) => `<button class="${T[ins.k] === i ? 'on' : ''}" data-a="ins" data-k="${ins.k}" data-v="${i}">${o}</button>`).join('')}</div></div>`).join('')}</div>
      <div class="sec-h"><h2>Set pieces & captain</h2></div>
      <div class="card two">${[['cap', 'Captain'], ['pk', 'Penalties'], ['fk', 'Free kicks'], ['ck', 'Corners']].map(([k, n]) => `<div class="field"><label>${n}</label>${selectHtml('sp-' + k, T.slots.filter(Boolean).map(id => [id, pname(G.players[id])]), T[k], 'setp', `data-k="${k}"`)}</div>`).join('')}</div>`;
  },
};
ACT.tview = ds => { UI.tab.tview = ds.v; render(); };
ACT.ins = ds => { G.tactics[ds.k] = +ds.v; render(); };
ACT.autoPick = () => { const T = G.tactics, pk = autoPick(G.club, T.ip); T.slots = pk.xi; T.bench = pk.bench; T.cap = T.pk = T.fk = T.ck = null; autoSetPieces(); toast('Best available XI selected.'); render(); };
CHG.shape = (v, ds) => {
  const T = G.tactics;
  if (T[ds.k] === v) return;
  T[ds.k] = v;
  if (ds.k === 'ip') T.roles = Array(11).fill(0);
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
  const where = p => (T.slots.includes(p.id) ? FORMATIONS[T.ip][T.slots.indexOf(p.id)][0] : T.bench.includes(p.id) ? 'SUB' : '');
  sheet(`<h3 class="sh-t">${POS_NAME[pos]}</h3>
    <h4 class="lbl">Role</h4><div class="chips">${ROLES[pos].map((r, k) => `<button class="chip ${T.roles[i] === k ? 'on' : ''}" data-a="role" data-i="${i}" data-k="${k}">${r.n}</button>`).join('')}</div>
    <h4 class="lbl">Player</h4><div class="list">${cands.map(p => `<button class="row act ${T.slots[i] === p.id ? 'sel' : ''}" data-a="pickSlot" data-i="${i}" data-id="${p.id}" ${available(p) ? '' : 'disabled'}><span class="pos">${p.pos}</span><span class="grow"><b>${esc(pname(p))}</b><small>${available(p) ? (where(p) ? 'Now: ' + where(p) : 'Not selected') : p.inj ? 'Injured' : 'Suspended'}</small></span>${condBar(p.cond)}${ovrPill(ovrAt(p, pos))}</button>`).join('')}</div>`, { onClose: () => render() });
};
ACT.role = ds => { G.tactics.roles[+ds.i] = +ds.k; ACT.slot(ds); };
ACT.pickSlot = ds => { assignSlot(+ds.i, +ds.id); closeSheet(true); render(); };
ACT.benchSlot = ds => {
  const T = G.tactics, i = +ds.i;
  const cands = seniorSquad(G.club).filter(p => available(p) && !T.slots.includes(p.id) && !T.bench.includes(p.id)).sort((a, b) => b.ca - a.ca);
  sheet(`<h3 class="sh-t">${i >= 0 ? 'Replace ' + esc(pname(G.players[T.bench[i]])) : 'Add a substitute'}</h3>
    ${i >= 0 ? `<button class="btn ghost wide" data-a="benchDrop" data-i="${i}">Remove from the bench</button>` : ''}
    <div class="list">${cands.map(p => `<button class="row act" data-a="benchPick" data-i="${i}" data-id="${p.id}"><span class="pos">${p.pos}</span><span class="grow"><b>${esc(pname(p))}</b><small>${p.status}</small></span>${condBar(p.cond)}${ovrPill(p.ca)}</button>`).join('') || empty('Nobody available', 'Every fit player is already in the matchday squad.')}</div>`, { onClose: () => render() });
};
ACT.benchPick = ds => { const T = G.tactics, i = +ds.i; if (i >= 0) T.bench[i] = +ds.id; else T.bench.push(+ds.id); closeSheet(true); render(); };
ACT.benchDrop = ds => { G.tactics.bench.splice(+ds.i, 1); closeSheet(true); render(); };

/* ---------- training ---------- */
SCREENS.training = {
  render() {
    const T = G.training, foc = TRAINING_FOCUS.find(f => f.k === T.focus);
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const short = { bal: 'Mixed', att: 'Attack', def: 'Defend', phy: 'Fitness', tac: 'Shape', set: 'Set piece', rec: 'Light' }[T.focus];
    const plan = ['Recover', short, short, 'Shape', 'Prep', 'Match', 'Rest'];
    const coach = staffAvg('Coach'), physio = staffAvg('Physio');
    const risk = Math.round(0.6 * (1 + T.intensity * 0.6) * (T.focus === 'phy' ? 1.4 : 1) * (1.3 - physio / 40) * 10) / 10;
    const mine = seniorSquad(G.club).concat(squadOf(G.club).filter(p => p.youth));
    const focused = mine.filter(p => T.indiv[p.id] && T.indiv[p.id] !== 'none');
    return `<h1 class="h1">Training</h1>
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
      <div class="kv"><div><small>Physio quality</small><b>${staffAvg('Physio').toFixed(1)} / 20</b></div><div><small>Training load</small><b>${INTENSITY[G.training.intensity]}</b></div></div>
      <div class="sec-h"><h2>Injured</h2><span class="muted">${inj.length}</span></div>
      <div class="list">${inj.map(p => playerRow(p, `<span class="stat"><b>${p.inj.w}</b><small>wks</small></span>`, { noBadge: true, sub: p.inj.n })).join('') || empty('No injuries', 'The whole squad is available.')}</div>
      <div class="sec-h"><h2>Low condition</h2><span class="muted">Rest them or switch to recovery training</span></div>
      <div class="list">${tired.map(p => playerRow(p, condBar(p.cond), { noBadge: true, sub: 'Condition ' + p.cond + '%' })).join('') || empty('Everyone is fresh', 'No player is below 80% condition.')}</div>`;
  },
};

SCREENS.youth = {
  render() {
    const y = squadOf(G.club).filter(p => p.youth).sort((a, b) => b.pa - a.pa);
    const d = new Date(G.season + 1, 2, 15);
    return `<h1 class="h1">Youth academy</h1>
      <div class="kv"><div><small>Youth facilities</small><b>Level ${G.board.facYouth}</b></div><div><small>Next intake</small><b>${G.flags.intake ? 'Next March' : fmtDate(d, false)}</b></div></div>
      <p class="muted">Academy players train every week and turn professional at 19. Promote the best ones early to give them first-team minutes.</p>
      <div class="list">${y.map(p => playerRow(p, `<span class="stat">${starHtml(stars(p.pa))}</span>`, { noBadge: true, sub: POS_NAME[p.pos] })).join('') || empty('No academy players', 'The youth intake arrives each March.')}</div>`;
  },
};
