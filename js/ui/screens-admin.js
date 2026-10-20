'use strict';
/* ===== screens-admin.js =====
   Admin page: edit clubs and players, move time forward, tune the match engine,
   and run maintenance on the save. Open from More > Admin. */

// Access control hook. Everyone is allowed for now.
// To restrict later, return true only for you (for example after a login or PIN check).
function adminAllowed() { return true; }

const ADM = { club: null, q: '', qClub: 'ALL', test: null, confirm: '' };

SCREENS.admin = {
  render() {
    if (!adminAllowed()) return `<h1 class="h1">Admin</h1>${empty('No access', 'You do not have permission to open this page.')}`;
    const t = UI.tab.adm || 'over';
    return `<h1 class="h1">Admin</h1>
      <div class="banner open"><b>Live editing</b><span>Changes apply to this save at once. Export a backup in Settings first if you want to undo.</span></div>
      ${tabs('adm', [['over', 'Overview'], ['club', 'Clubs'], ['play', 'Players'], ['time', 'Time'], ['eng', 'Engine'], ['brain', 'AI Brain'], ['jev', 'Jev AI'], ['ds', 'DeepSeek'], ['data', 'Data']], t)}
      ${ADMIN_TABS[t]()}`;
  },
};

const num = (id, v, step = 1, attrs = '') => `<input id="${id}" type="number" inputmode="decimal" step="${step}" value="${v}" ${attrs}>`;
const fld = (label, html) => `<div class="field"><label>${label}</label>${html}</div>`;
const val = id => document.getElementById(id).value;
const nval = id => Number(document.getElementById(id).value);

const ADMIN_TABS = {
  over() {
    let size = 0;
    try { size = JSON.stringify(G).length; } catch (e) { /* ignore */ }
    const c = userClub(), all = Object.values(G.players);
    return `<div class="kv">
        <div><small>Season</small><b>${seasonLabel()}</b></div><div><small>Week</small><b>${G.week} of ${SEASON_WEEKS} · ${esc(phaseLabel())}</b></div>
        <div><small>Your club</small><b>${esc(c.name)}</b></div><div><small>Manager</small><b>${esc(G.manager)}</b></div>
        <div><small>Players in world</small><b>${all.length}</b></div><div><small>Free agents</small><b>${squadOf('FA').length}</b></div>
        <div><small>Fixtures played</small><b>${G.fixtures.filter(played).length} / ${G.fixtures.length}</b></div><div><small>Save size</small><b>${Math.round(size / 1024)} KB</b></div>
        <div><small>Engine tuning</small><b>${G.tune && Object.keys(G.tune).length ? Object.keys(G.tune).length + ' custom values' : 'Defaults'}</b></div><div><small>News items</small><b>${G.news.length}</b></div>
      </div>
      <div class="card"><h3>Manager name</h3><div class="two">${fld('Name', `<input id="adMgr" type="text" value="${esc(G.manager)}">`)}<div class="field"><label>&nbsp;</label><button class="btn" data-a="admMgr">Save name</button></div></div></div>`;
  },

  club() {
    const id = ADM.club || G.club, c = G.clubs[id], mine = id === G.club, B = G.board;
    return `${fld('Club', selectHtml('adClub', plClubs().map(x => [x, G.clubs[x].name + (x === G.club ? ' (you)' : '')]), id, 'admClub'))}
      <div class="card"><h3>Identity</h3><div class="two">
        ${fld('Nickname', `<input id="adName" type="text" value="${esc(c.name)}">`)}${fld('City', `<input id="adCity" type="text" value="${esc(c.city)}">`)}
        ${fld('Stadium', `<input id="adGround" type="text" value="${esc(c.ground)}">`)}${fld('Capacity', num('adCap', c.cap, 100))}
        ${fld('Main colour', `<input id="adC1" type="color" value="${c.c1}">`)}${fld('Second colour', `<input id="adC2" type="color" value="${c.c2}">`)}
      </div></div>
      <div class="card"><h3>Strength & money</h3><div class="two">
        ${fld('Reputation (1-100)', num('adRep', c.rep, 1, 'min="1" max="100"'))}${fld('Balance (£)', num('adBal', Math.round(c.bal), 100000))}
        ${mine ? fld('Transfer budget (£)', num('adTb', G.fin.tb, 100000)) + fld('Wage budget (£/week)', num('adWb', G.fin.wb, 1000)) + fld('Board confidence', num('adConf', B.conf, 1, 'min="0" max="100"')) + fld('Fan confidence', num('adFans', B.fans, 1, 'min="0" max="100"')) + fld('Training facilities', num('adFt', B.facTrain, 1, 'min="1" max="20"')) + fld('Youth facilities', num('adFy', B.facYouth, 1, 'min="1" max="20"')) : ''}
      </div></div>
      <div class="card"><h3>Computer tactic</h3><div class="two">${fld('In possession', selectHtml('adIp', Object.keys(FORMATIONS), c.tac.ip, ''))}${fld('Out of possession', selectHtml('adOop', Object.keys(FORMATIONS), c.tac.oop, ''))}</div><p class="muted">${mine ? 'Your own tactic is set on the Tactics screen.' : 'Used by this club in every match.'}</p></div>
      <div class="btns"><button class="btn pri" data-a="admClubSave" data-id="${id}">Save club</button>${mine ? '' : `<button class="btn ${ADM.confirm === 'switch' ? 'bad' : ''}" data-a="admSwitch" data-id="${id}">${ADM.confirm === 'switch' ? 'Tap again to take over' : 'Manage this club'}</button>`}</div>`;
  },

  play() {
    const q = ADM.q.toLowerCase();
    const res = Object.values(G.players).filter(p => (ADM.qClub === 'ALL' || p.club === ADM.qClub) && (!q || fullName(p).toLowerCase().includes(q))).sort((a, b) => b.ca - a.ca).slice(0, 50);
    return `<div class="two">${fld('Name', `<input id="adQ" type="search" value="${esc(ADM.q)}" placeholder="Search any player" data-c="admQ">`)}${fld('Club', selectHtml('adQc', [['ALL', 'All clubs'], ...Object.values(G.clubs).map(c => [c.id, c.name])], ADM.qClub, 'admQc'))}</div>
      <button class="btn wide" data-a="admNew">Create a player for your club</button>
      <p class="muted">Showing ${res.length} players by rating. Tap one to edit. Ratings here are exact.</p>
      <div class="list">${res.map(p => `<button class="row act" data-a="admPlayer" data-id="${p.id}"><span class="rb">${badge(p.club, 20)}</span><span class="pos">${p.pos}</span><span class="grow"><b>${esc(fullName(p))}</b><small>${p.age} yrs · ${esc(clubName(p.club))}${lvlOf(p) !== 'A' ? ' · ' + LEVELS[lvlOf(p)] : ''}</small></span><span class="stat"><b>${p.ca}</b><small>pot ${p.pa}</small></span></button>`).join('') || empty('No players found', 'Try another name or club.')}</div>`;
  },

  time() {
    const fx = userFixture();
    return `<div class="card"><h3>Move time forward</h3><p class="muted">Your own matches are played instantly. Stops at the season review or if you are sacked.</p>
        <div class="btns">${[1, 4, 10].map(n => `<button class="btn" data-a="admWeeks" data-n="${n}">+${n} week${n > 1 ? 's' : ''}</button>`).join('')}<button class="btn pri" data-a="admWeeks" data-n="99">To season end</button></div></div>
      <div class="card"><h3>This week</h3><p class="muted">${esc(phaseLabel())}${fx ? ` · ${esc(clubName(fx.h))} v ${esc(clubName(fx.a))} ${played(fx) ? '(played)' : '(not played)'}` : ' · no match for you'}</p>
        ${fx && !played(fx) ? '<button class="btn" data-a="admSimMine">Play my match instantly</button>' : ''}</div>`;
  },

  eng() {
    const T = ADM.test;
    return `<div class="card"><h3>Engine tuning</h3><p class="muted">Applies to every match from now on, including the live 2D view.</p>
        ${Object.entries(TUNE_DEFAULTS).map(([k, d]) => `<div class="field"><label for="tn-${k}">${d.n}: <b id="tv-${k}">${tune(k)}</b>${tune(k) !== d.v ? ` <small>(default ${d.v})</small>` : ''}</label><input id="tn-${k}" type="range" min="${d.min}" max="${d.max}" step="${d.step}" value="${tune(k)}" data-c="admTune" data-k="${k}"></div>`).join('')}
        <div class="btns"><button class="btn" data-a="admTuneReset">Reset to defaults</button></div></div>
      <div class="card"><h3>Test season</h3><p class="muted">Plays all 380 matches on a copy of the save with the current tuning. Your real save does not change. Real-world targets: about 2.7 goals, 45% home wins, 25% draws.</p>
        <button class="btn pri" data-a="admTest">Run test season</button>
        ${T ? `<div class="kv"><div><small>Goals per match</small><b>${T.gpg}</b></div><div><small>Home / draw / away</small><b>${T.h}% / ${T.d}% / ${T.a}%</b></div><div><small>Shots per team</small><b>${T.sh}</b></div><div><small>xG per team</small><b>${T.xg}</b></div><div><small>Cards per match</small><b>${T.cards}</b></div><div><small>Top scorer</small><b>${T.top}</b></div><div><small>Champions</small><b>${esc(T.champ)}</b></div><div><small>Points range</small><b>${T.range}</b></div></div>` : ''}</div>`;
  },

  data() {
    const c2 = k => (ADM.confirm === k ? 'bad' : '');
    return `<div class="card"><h3>Your squad</h3><div class="btns">
        <button class="btn" data-a="admBulk" data-k="heal">Heal all injuries</button><button class="btn" data-a="admBulk" data-k="unban">Clear suspensions</button>
        <button class="btn" data-a="admBulk" data-k="fresh">Full condition</button><button class="btn" data-a="admBulk" data-k="happy">Morale to 85</button>
        <button class="btn" data-a="admBulk" data-k="sharp">Full sharpness</button><button class="btn" data-a="admBulk" data-k="youth">Add 3 academy players</button></div></div>
      <div class="card"><h3>Money</h3><div class="btns">${[[10e6, '+£10m'], [50e6, '+£50m'], [-10e6, '−£10m']].map(([v, n]) => `<button class="btn" data-a="admMoney" data-v="${v}">${n} balance</button>`).join('')}<button class="btn" data-a="admMoney" data-v="tb">+£20m transfer budget</button></div></div>
      <div class="card"><h3>World</h3><div class="btns">
        <button class="btn" data-a="admBulk" data-k="reveal">Reveal every player (scouting 100%)</button><button class="btn" data-a="admBulk" data-k="fa">Add 10 free agents</button>
        <button class="btn" data-a="admBulk" data-k="healAll">Heal injuries in every club</button><button class="btn" data-a="admBulk" data-k="readNews">Mark all news read</button>
        <button class="btn ${c2('clearNews')}" data-a="admConfirm" data-k="clearNews">${ADM.confirm === 'clearNews' ? 'Tap again to clear' : 'Clear news feed'}</button></div></div>
      <div class="card danger"><h3>Save</h3><div class="btns"><button class="btn" data-a="go" data-s="settings">Export or import a save</button>
        <button class="btn ${c2('wipe')}" data-a="admConfirm" data-k="wipe">${ADM.confirm === 'wipe' ? 'Tap again to delete the save' : 'Delete save and restart'}</button></div></div>`;
  },
};

/* ---------- overview & clubs ---------- */
ACT.admMgr = () => { G.manager = val('adMgr').trim() || G.manager; saveGame(); toast('Manager name saved.'); render(); };
CHG.admClub = v => { ADM.club = v; ADM.confirm = ''; render(); };
ACT.admClubSave = ds => {
  const c = G.clubs[ds.id];
  c.name = val('adName').trim() || c.name; c.city = val('adCity').trim(); c.ground = val('adGround').trim();
  c.cap = Math.max(1000, nval('adCap')); c.c1 = val('adC1'); c.c2 = val('adC2');
  c.rep = clamp(nval('adRep'), 1, 100); c.bal = nval('adBal');
  c.tac.ip = val('adIp'); c.tac.oop = val('adOop');
  if (ds.id === G.club) {
    G.fin.tb = Math.max(0, nval('adTb')); G.fin.wb = Math.max(0, nval('adWb'));
    G.board.conf = clamp(nval('adConf'), 0, 100); G.board.fans = clamp(nval('adFans'), 0, 100);
    G.board.facTrain = clamp(nval('adFt'), 1, 20); G.board.facYouth = clamp(nval('adFy'), 1, 20);
  }
  saveGame(); toast(c.name + ' saved.'); render();
};
ACT.admSwitch = ds => {
  if (ADM.confirm !== 'switch') { ADM.confirm = 'switch'; return render(); }
  ADM.confirm = ''; ADM.club = null;
  takeJob(ds.id); toast('You now manage the ' + clubName(ds.id) + '.'); render();
};

/* ---------- players ---------- */
CHG.admQ = v => { ADM.q = v.trim(); render(); };
CHG.admQc = v => { ADM.qClub = v; render(); };
ACT.admPlayer = ds => admPlayerSheet(+ds.id);
function admPlayerSheet(pid) {
  const p = G.players[pid];
  if (!p) return;
  const clubs = Object.values(G.clubs).map(c => [c.id, c.name]);
  sheet(`<h3 class="sh-t">Edit ${esc(fullName(p))}</h3><p class="muted">Rating ${p.ca} as ${p.pos}. Rating is recalculated from the attributes when you save.</p>
    <div class="two">
      ${fld('First name', `<input id="apFn" type="text" value="${esc(p.fn)}">`)}${fld('Last name', `<input id="apLn" type="text" value="${esc(p.ln)}">`)}
      ${fld('Position', selectHtml('apPos', POSITIONS, p.pos, ''))}${fld('Nationality', selectHtml('apNat', Object.keys(COUNTRY).sort((a, b) => natName(a).localeCompare(natName(b))).map(k => [k, natName(k)]), p.nat, ''))}
      ${fld('Age', num('apAge', p.age, 1, 'min="15" max="45"'))}${fld('Potential (1-100)', num('apPa', p.pa, 1, 'min="1" max="100"'))}
      ${fld('Morale', num('apMor', p.mor, 1, 'min="0" max="100"'))}${fld('Condition', num('apCond', Math.round(p.cond), 1, 'min="0" max="100"'))}
      ${fld('Sharpness', num('apShp', p.shp, 1, 'min="0" max="100"'))}${fld('Wage (£/week)', num('apWage', p.wage, 100))}
      ${fld('Contract ends (June)', num('apCon', p.con, 1))}${fld('Personality', selectHtml('apPers', PERSONALITIES, p.pers, ''))}
      ${fld('Height (cm)', num('apHt', p.ht, 1, 'min="155" max="210"'))}${fld('Weight (kg)', num('apWt', p.wt, 1, 'min="45" max="120"'))}
      ${fld('Ambition (1-20)', num('apAmb', p.amb, 1, 'min="1" max="20"'))}
    </div>
    <h4 class="lbl">Attributes (1-20)</h4>
    <div class="adattrs">${ATTRS.map((a, i) => `<label><span>${a[1]}</span>${num('apAt' + i, p.at[i], 1, 'min="1" max="20"')}</label>`).join('')}</div>
    <div class="btns"><button class="btn sm" data-a="admAttrAll" data-v="1">All +1</button><button class="btn sm" data-a="admAttrAll" data-v="-1">All −1</button></div>
    ${fld('Move to club', selectHtml('apClub', clubs, p.club, ''))}
    <div class="btns"><button class="btn pri" data-a="admPSave" data-id="${p.id}">Save player</button><button class="btn" data-a="admPHeal" data-id="${p.id}">Heal and clear ban</button>
      <button class="btn ghost ${ADM.confirm === 'del' + p.id ? 'bad' : ''}" data-a="admPDel" data-id="${p.id}">${ADM.confirm === 'del' + p.id ? 'Tap again to delete' : 'Delete player'}</button></div>`, { onClose: () => render() });
}
ACT.admAttrAll = ds => ATTRS.forEach((a, i) => { const el = document.getElementById('apAt' + i); el.value = clamp(Number(el.value) + Number(ds.v), 1, 20); });
ACT.admPSave = ds => {
  const p = G.players[+ds.id];
  p.fn = val('apFn').trim() || p.fn; p.ln = val('apLn').trim() || p.ln;
  p.pos = val('apPos'); p.nat = val('apNat'); p.pers = val('apPers');
  p.alt = p.alt.filter(x => x !== p.pos);
  p.age = clamp(nval('apAge'), 15, 45);
  p.ht = clamp(nval('apHt'), 155, 210); p.wt = clamp(nval('apWt'), 45, 120); p.amb = clamp(nval('apAmb'), 1, 20);
  p.mor = clamp(nval('apMor'), 0, 100); p.cond = clamp(nval('apCond'), 0, 100); p.shp = clamp(nval('apShp'), 0, 100);
  p.wage = Math.max(0, nval('apWage')); p.con = nval('apCon');
  ATTRS.forEach((a, i) => { p.at[i] = clamp(Math.round(nval('apAt' + i)), 1, 20); });
  p.ca = ratingFor(p.at, p.pos);
  p.pa = clamp(Math.max(p.ca, nval('apPa')), 1, 100);
  const to = val('apClub');
  if (to !== p.club) { moveClub(p, to); if (to === G.club) G.know[p.id] = 100; if (to === 'FA') p.con = 0; }
  saveGame(); toast(`${fullName(p)} saved. Rating ${p.ca}.`); admPlayerSheet(p.id);
};
ACT.admPHeal = ds => { const p = G.players[+ds.id]; p.inj = null; p.ban = 0; p.cond = 100; saveGame(); toast('Healed and cleared.'); admPlayerSheet(p.id); };
ACT.admPDel = ds => {
  const k = 'del' + ds.id;
  if (ADM.confirm !== k) { ADM.confirm = k; return admPlayerSheet(+ds.id); }
  ADM.confirm = ''; retire(G.players[+ds.id]); saveGame(); closeSheet(true); toast('Player deleted.'); render();
};
ACT.admNew = () => sheet(`<h3 class="sh-t">Create a player</h3><p class="muted">Joins your first-team squad with generated attributes.</p>
  <div class="two">${fld('Position', selectHtml('anPos', POSITIONS, 'ST', ''))}${fld('Nationality', selectHtml('anNat', Object.keys(COUNTRY).sort((a, b) => natName(a).localeCompare(natName(b))).map(k => [k, natName(k)]), 'ENG', ''))}
  ${fld('Age', num('anAge', 21, 1, 'min="15" max="40"'))}${fld('Rating (30-94)', num('anCa', 75, 1, 'min="30" max="94"'))}${fld('Potential', num('anPa', 85, 1, 'min="30" max="97"'))}</div>
  <button class="btn pri wide" data-a="admCreate">Create player</button>`);
ACT.admCreate = () => {
  const p = genPlayer({ pos: val('anPos'), nat: val('anNat'), age: clamp(nval('anAge'), 15, 40), ca: clamp(nval('anCa'), 30, 94), pa: nval('anPa'), club: G.club });
  addToClub(p, userClub()); G.know[p.id] = 100; p.status = 'Rotation';
  saveGame(); closeSheet(true); toast(`${fullName(p)} created (rating ${p.ca}).`); render();
};

/* ---------- time ---------- */
ACT.admWeeks = ds => {
  let n = +ds.n, done = 0, r = 'ok';
  for (let guard = 0; guard < 200 && done < n; guard++) {
    r = advanceWeek();
    if (r === 'match') { playUserInstant(userFixture()); continue; }
    done++;
    if (r === 'season' || r === 'sacked') break;
  }
  saveGame();
  if (r === 'season' || r === 'sacked') return go('home');
  toast(`Moved ${done} week${done === 1 ? '' : 's'} on. ${phaseLabel()}.`); render();
};
ACT.admSimMine = () => { const fx = userFixture(); if (fx && !played(fx)) { playUserInstant(fx); toast(`${clubName(fx.h)} ${fx.hg}-${fx.ag} ${clubName(fx.a)}`); } render(); };

/* ---------- engine ---------- */
CHG.admTune = (v, ds) => {
  G.tune = G.tune || {};
  G.tune[ds.k] = Number(v);
  if (G.tune[ds.k] === TUNE_DEFAULTS[ds.k].v) delete G.tune[ds.k];
  saveGame(); render();
};
document.addEventListener('input', e => { const el = e.target; if (el.dataset && el.dataset.c === 'admTune') { const out = document.getElementById('tv-' + el.dataset.k); if (out) out.textContent = el.value; } });
ACT.admTuneReset = () => { G.tune = {}; saveGame(); toast('Engine back to defaults.'); render(); };
ACT.admTest = () => {
  const real = G;
  toast('Running test season…');
  setTimeout(() => {
    try {
      G = JSON.parse(JSON.stringify(real));
      G.fixtures.forEach(f => { f.hg = f.ag = null; });
      Object.values(G.players).forEach(p => { p.st = newStats(); });
      let goals = 0, h = 0, d = 0, sh = 0, xg = 0, cards = 0;
      G.fixtures.forEach(f => {
        Object.values(G.players).forEach(p => { p.cond = 100; p.inj = null; p.ban = 0; });
        const M = quickSim(f);
        goals += f.hg + f.ag; if (f.hg > f.ag) h++; else if (f.hg === f.ag) d++;
        M.sides.forEach(S => { sh += S.st.sh; xg += S.st.xg; cards += S.st.yc + S.st.rc; });
      });
      const n = G.fixtures.length, tbl = leagueTable();
      const top = Object.values(G.players).sort((a, b) => b.st.g - a.st.g)[0];
      ADM.test = { gpg: (goals / n).toFixed(2), h: Math.round(h / n * 100), d: Math.round(d / n * 100), a: Math.round((n - h - d) / n * 100), sh: (sh / n / 2).toFixed(1), xg: (xg / n / 2).toFixed(2), cards: (cards / n).toFixed(1), top: top.st.g + ' (' + top.ln + ')', champ: G.clubs[tbl[0].id].name, range: tbl[19].pts + '-' + tbl[0].pts + ' pts' };
    } finally { G = real; }
    render();
  }, 30);
};

/* ---------- data ---------- */
ACT.admBulk = ds => {
  const mine = squadOf(G.club), k = ds.k;
  const msg = {
    heal: () => { mine.forEach(p => { p.inj = null; }); return 'Squad injuries healed.'; },
    unban: () => { mine.forEach(p => { p.ban = 0; }); return 'Suspensions cleared.'; },
    fresh: () => { mine.forEach(p => { p.cond = 100; }); return 'Everyone at full condition.'; },
    happy: () => { mine.forEach(p => { p.mor = 85; }); return 'Squad morale set to 85.'; },
    sharp: () => { mine.forEach(p => { p.shp = 100; }); return 'Everyone fully sharp.'; },
    youth: () => { for (let i = 0; i < 3; i++) genYouth(userClub(), 60 + G.board.facYouth * 1.6); return '3 U18 players added.'; },
    reveal: () => { Object.keys(G.players).forEach(id => { G.know[id] = 100; }); return 'Every player fully scouted.'; },
    fa: () => { for (let i = 0; i < 10; i++) { const p = genFreeAgent(); G.know[p.id] = 20; } return '10 free agents added.'; },
    healAll: () => { Object.values(G.players).forEach(p => { p.inj = null; }); return 'All injuries healed.'; },
    readNews: () => { G.news.forEach(n => { n.read = true; }); return 'All news marked read.'; },
  }[k]();
  saveGame(); toast(msg); render();
};
ACT.admMoney = ds => {
  if (ds.v === 'tb') G.fin.tb += 20e6;
  else userClub().bal += Number(ds.v);
  saveGame(); toast('Done.'); render();
};
ACT.admConfirm = ds => {
  if (ADM.confirm !== ds.k) { ADM.confirm = ds.k; return render(); }
  ADM.confirm = '';
  if (ds.k === 'clearNews') { G.news = []; saveGame(); toast('News cleared.'); return render(); }
  if (ds.k === 'wipe') { deleteSave(); G = null; UI.tab = {}; go('start'); }
};

/* ---------- AI services (Jev, DeepSeek) ---------- */
const AI_INFO = {
  jev: { name: 'Jev (TypeSafe)', role: 'Makes fast decisions for the game: picks an option, scores something, or answers yes/no. It does not write text.', console: 'console.typesafe.ai/keys', docs: 'docs.typesafe.ai' },
  ds: { name: 'DeepSeek', role: 'Writes text for the game: press questions, player replies, match reports and news.', console: 'platform.deepseek.com/api_keys', docs: 'api-docs.deepseek.com' },
};
ADMIN_TABS.jev = () => aiTab('jev');
ADMIN_TABS.ds = () => aiTab('ds');

function aiTab(svc) {
  const c = aiCfg()[svc], I = AI_INFO[svc], u = aiUsage(svc), est = aiSeasonEstimate(), T = (ADM.aiTest || {})[svc];
  const masked = c.key ? '•••• ' + c.key.slice(-4) : 'none saved';
  const pricing = svc === 'jev'
    ? `<div class="kvrow"><span>Input</span><b>$0.042 per 1M tokens</b></div><div class="kvrow"><span>Output</span><b>Free</b></div><div class="kvrow"><span>Speed</span><b>about 70-500 ms</b></div><div class="kvrow tot"><span>Estimated full season</span><b>~$${est.jevCost.toFixed(2)} (${est.jevCalls} calls)</b></div>`
    : `<div class="kvrow"><span>deepseek-flash input</span><b>$0.15 off-peak / $0.30 peak per 1M</b></div><div class="kvrow"><span>deepseek-flash output</span><b>$0.60 off-peak / $1.20 peak per 1M</b></div><div class="kvrow"><span>Cached input</span><b>$0.003-0.006 per 1M</b></div><div class="kvrow"><span>Right now</span><b>${dsPeak() ? 'Peak hours' : 'Off-peak (half price)'}</b></div><div class="kvrow tot"><span>Estimated full season</span><b>~$${est.dsCostLow.toFixed(2)}-${est.dsCostHigh.toFixed(2)} (${est.dsCalls} calls)</b></div>`;
  const rec = svc === 'jev'
    ? '<b>Recommended: jev-latest.</b> Jev 1.13 and 1.14 cost the same, so the stable alias is the best choice. Pin a version once you have tuned the game around its answers.'
    : '<b>Recommended: deepseek-flash with thinking off.</b> It is the cheapest DeepSeek model and is good enough for short football text. Thinking mode makes replies slower and several times more expensive, and this game does not need it.';
  return `<div class="card"><h3>${I.name}</h3><p class="muted">${I.role}</p>
      ${svc === 'jev' ? '<p class="note">Checked Oct 2026: the TypeSafe server does not accept calls made directly from a web page on another site, so Direct mode will most likely fail with a connection error. Use “Through my server” with a small proxy. DeepSeek does accept direct browser calls.</p>' : ''}
      <label class="tgl"><input id="ai-on" type="checkbox" ${c.on ? 'checked' : ''}><span>Use ${svc === 'jev' ? 'Jev' : 'DeepSeek'} in the game</span></label>
      <div class="field"><label>Connection</label><div class="seg">${[['direct', 'Direct (key in this browser)'], ['proxy', 'Through my server']].map(([k, n]) => `<button class="${c.mode === k ? 'on' : ''}" data-a="aiMode" data-svc="${svc}" data-v="${k}">${n}</button>`).join('')}</div></div>
      ${c.mode === 'direct'
        ? fld(`API key <small>(saved: ${esc(masked)})</small>`, `<input id="ai-key" type="password" autocomplete="off" placeholder="Paste a new key to replace it">`) + `<p class="muted">Get a key at ${I.console}. Direct mode keeps the key in this browser only. Fine for testing as admin, but never ship a game to players this way: anyone could read the key.</p>`
        : fld('Proxy base URL', `<input id="ai-proxy" type="text" value="${esc(c.proxy)}" placeholder="https://your-project.supabase.co/functions/v1/ai">`) + `<p class="muted">Your server adds the API key and forwards the request to ${svc === 'jev' ? '/v1/systemone' : '/chat/completions'}. This is the safe setup for real players.</p>`}
      <div class="two">
        ${fld('Model', selectHtml('ai-model', svc === 'jev' ? JEV_MODELS : DS_MODELS, c.model, ''))}
        ${fld('Timeout (ms)', num('ai-timeout', c.timeout, 500, 'min="500"'))}
        ${svc === 'ds' && c.mode === 'direct' ? fld('Base URL', `<input id="ai-base" type="text" value="${esc(c.base)}">`) : ''}
        ${svc === 'ds' ? fld('Max reply length (tokens)', num('ai-max', c.maxTokens, 50, 'min="50" max="4000"')) + fld('Creativity (temperature 0-2)', num('ai-temp', c.temp, 0.1, 'min="0" max="2"')) : ''}
        ${fld('Monthly budget (US$)', num('ai-budget', c.budget, 0.5, 'min="0"'))}
      </div>
      ${svc === 'ds' ? `<label class="tgl"><input id="ai-think" type="checkbox" ${c.thinking ? 'checked' : ''}><span>Thinking mode (slower, costs more; not recommended)</span></label>` : ''}
      <h4 class="lbl">Use it for</h4>
      ${AI_FEATURES[svc].map(([k, n]) => `<label class="tgl"><input type="checkbox" class="ai-feat" data-k="${k}" ${c.feat[k] ? 'checked' : ''}><span>${n}</span></label>`).join('')}
      <p class="note">Connected now: ${svc === 'jev' ? 'computer managers' : 'second opinions and the press question library'} (see the AI Brain tab). The other ticks are saved for features still to come.</p>
      <div class="btns"><button class="btn pri" data-a="aiSave" data-svc="${svc}">Save settings</button><button class="btn" data-a="aiTest" data-svc="${svc}">Test connection</button>${c.key ? `<button class="btn ghost" data-a="aiClearKey" data-svc="${svc}">Remove key</button>` : ''}</div>
      ${T ? `<div class="aitest ${T.ok ? 'ok' : 'bad'}">${T.html}</div>` : ''}</div>
    <div class="card"><h3>This month</h3><div class="kv">
      <div><small>Calls</small><b>${u.calls}${u.fails ? ` <em class="tag bad">${u.fails} failed</em>` : ''}</b></div><div><small>Average speed</small><b>${u.calls ? Math.round(u.ms / u.calls) + ' ms' : '-'}</b></div>
      <div><small>Tokens in / out</small><b>${u.inTok.toLocaleString('en-GB')} / ${u.outTok.toLocaleString('en-GB')}</b></div><div><small>Cost</small><b>$${u.cost.toFixed(4)} of $${c.budget}</b></div></div>
      ${bar(c.budget ? u.cost / c.budget * 100 : 0, u.cost >= c.budget ? 'bad' : u.cost > c.budget * 0.8 ? 'warn' : 'good')}
      <div class="list">${aiCfg().log.filter(l => l.svc === svc).slice(0, 8).map(l => `<div class="row sm"><span class="grow"><b>${l.ok ? 'OK' : 'Failed'} · ${esc(l.note)}</b><small>${new Date(l.t).toLocaleString('en-GB')} · ${l.ms} ms · ${l.inTok}/${l.outTok} tok · $${l.cost.toFixed(5)}</small></span></div>`).join('') || '<p class="muted">No calls yet.</p>'}</div></div>
    <div class="card"><h3>Price and choice</h3><p class="muted">${rec}</p>${pricing}<p class="muted">Prices checked October 2026 at ${I.docs}. The estimate assumes AI decisions in every league match plus your own press, talks and reports.</p></div>`;
}

ACT.aiMode = ds => { aiCfg()[ds.svc].mode = ds.v; aiSave(); render(); };
ACT.aiSave = ds => {
  const c = aiCfg()[ds.svc], el = id => document.getElementById(id);
  c.on = el('ai-on').checked;
  if (el('ai-key') && el('ai-key').value.trim()) c.key = el('ai-key').value.trim();
  if (el('ai-proxy')) c.proxy = el('ai-proxy').value.trim();
  c.model = val('ai-model');
  c.timeout = Math.max(500, nval('ai-timeout'));
  c.budget = Math.max(0, nval('ai-budget'));
  if (ds.svc === 'ds') {
    if (el('ai-base')) c.base = el('ai-base').value.trim() || 'https://api.deepseek.com';
    c.maxTokens = clamp(nval('ai-max'), 50, 4000); c.temp = clamp(nval('ai-temp'), 0, 2); c.thinking = el('ai-think').checked;
  }
  document.querySelectorAll('.ai-feat').forEach(x => { c.feat[x.dataset.k] = x.checked; });
  toast(aiSave() ? 'AI settings saved.' : 'Could not save: browser storage is blocked here.'); render();
};
ACT.aiClearKey = ds => { aiCfg()[ds.svc].key = ''; aiSave(); toast('Key removed from this browser.'); render(); };

const AI_TEST_STATE = 'Premier Division match, 67th minute. Home: Gunners 2, Away: Black Cats 0. Away side has 31% possession, 3 shots, none on target. Away midfielders average 61% condition. Away manager mentality: Cautious, formation 5-4-1. Away fans have been booing.';
ACT.aiTest = async ds => {
  const svc = ds.svc;
  ADM.aiTest = ADM.aiTest || {};
  ADM.aiTest[svc] = { ok: true, html: 'Testing…' };
  render();
  try {
    if (svc === 'jev') {
      const r = await jevAsk(AI_TEST_STATE, {
        change: { type: 'choice', instructions: 'Best change for the away manager right now', criteria: { attack: 'Go more attacking and bring on a forward', hold: 'Keep the current approach', defend: 'Tighten up to limit the damage', press: 'Press higher to win the ball back' } },
        tired: { type: 'noul', instructions: 'The away midfield is exhausted' },
        fans: { type: 'score', instructions: 'How frustrated the away fans are', criteria: ['Calm', 'Uneasy', 'Angry'] },
      }, 'Admin test');
      const a = r.answers || {}, ch = a.change || {};
      ADM.aiTest[svc] = { ok: true, html: `<b>Connected · ${esc(r.model || '')} · ${r.ms} ms</b><br>Manager change: <b>${esc(ch.choice)}</b> (confidence ${ch.confidence != null ? Math.round(ch.confidence * 100) + '%' : '-'})<br>Midfield exhausted: ${a.tired ? Math.round(a.tired.noul * 100) + '%' : '-'} · Fan frustration: ${a.fans ? a.fans.score : '-'} of 2` };
    } else {
      const r = await dsChat([
        { role: 'system', content: 'You are a sharp football journalist in a football manager game. Reply with exactly one press-conference question for the away manager, under 30 words.' },
        { role: 'user', content: AI_TEST_STATE },
      ], 'Admin test', { maxTokens: 80 });
      ADM.aiTest[svc] = { ok: true, html: `<b>Connected · ${esc(r.model || aiCfg().ds.model)} · ${r.ms} ms · $${r.cost.toFixed(5)}</b><br>“${esc(r.text)}”` };
    }
  } catch (e) {
    ADM.aiTest[svc] = { ok: false, html: `<b>Test failed</b><br>${esc(e.message)}` };
  }
  if (UI.s === 'admin') render();
};

/* ---------- AI Brain: learning engine for computer managers ---------- */
const SRC_NAME = { jev: 'Jev', deepseek: 'DeepSeek', learned: 'Learned engine', rules: 'Built-in rules', explore: 'Exploring', pending: 'Waiting', late: 'Too late' };
ADMIN_TABS.brain = () => {
  const B = brain(), st = brainStats(), V = activeVersion(), job = ADM.job;
  const teacher = teacherReady(), second = aiReady('ds', 'second');
  const srcRows = Object.entries(st.bySrc).sort((a, b) => b[1].n - a[1].n).map(([k, s]) => `<div class="kvrow"><span>${SRC_NAME[k] || k} · ${s.n} decisions</span><b class="${s.sum / s.n > 0.05 ? 'good' : s.sum / s.n < -0.05 ? 'bad' : ''}">${(s.sum / s.n >= 0 ? '+' : '') + (s.sum / s.n).toFixed(2)}</b></div>`).join('');
  const buckets = Object.keys(B.draft).map(k => ({ k, s: bucketScores(B.draft, k) })).filter(x => x.s.n >= 3).sort((a, b) => b.s.n - a.s.n).slice(0, 12);
  return `<div class="card"><h3>How it works</h3><p class="muted">Computer managers make a decision at half-time and at 60, 70 and 80 minutes. Every decision and its result is recorded on this device. The engine learns which choice works best in each situation. New engine versions are only used after you approve them.</p>
      <div class="kv"><div><small>Teacher (Jev)</small><b class="${teacher ? 'good' : ''}">${teacher ? 'Ready' : 'Off'}</b></div><div><small>Second opinion (DeepSeek)</small><b class="${second ? 'good' : ''}">${second ? 'Ready' : 'Off'}</b></div>
      <div><small>Engine in use</small><b>${V ? esc(V.name) : 'Built-in rules'}</b></div><div><small>Teacher calls saved by hybrid</small><b>${B.saved.skipped}</b></div></div>
      ${!teacher ? '<p class="note">No teacher is connected, so the engine learns from outcomes only (the training camp tries options and keeps what works). Connect Jev in the Jev AI tab and tick “Computer managers” to add a teacher. Inside the Claude preview, AI calls are always blocked.</p>' : ''}</div>

    <div class="card"><h3>Mode for real matches</h3>
      <div class="list">${BRAIN_MODES.map(([k, n, d]) => `<button class="row act ${B.mode === k ? 'sel' : ''}" data-a="brMode" data-v="${k}" ${k !== 'rules' && !V ? 'disabled' : ''}><span class="grow"><b>${n}</b><small>${d}</small></span>${B.mode === k ? '<span class="tag good">On</span>' : ''}</button>`).join('')}</div>
      ${!V ? '<p class="muted">Approve an engine version below to unlock the other modes.</p>' : ''}
      <p class="muted">The AI is only asked during your live matches. Background results and instant results always use the approved engine or the rules.</p>
      <div class="two">${fld('Min. decisions before trusting a situation', num('brMinN', B.minN, 1, 'min="2" max="100"'))}${fld('Ask DeepSeek when Jev confidence is below', num('brConf', B.conf, 0.05, 'min="0" max="1"'))}${fld('Training camp exploring rate (0-1)', num('brExp', B.explore, 0.05, 'min="0" max="1"'))}</div>
      <button class="btn" data-a="brSaveSet">Save settings</button></div>

    <div class="card"><h3>Training camp</h3><p class="muted">Plays simulated matches between computer clubs. Nothing in your career changes; only the brain learns.${teacher ? ' With Jev connected, each match makes about 8 Jev calls (well under $0.001).' : ''}</p>
      <div class="btns">${[20, 100, 300].map(n => `<button class="btn" data-a="brCamp" data-n="${n}" ${job ? 'disabled' : ''}>${n} matches</button>`).join('')}${teacher ? `<label class="tgl"><input id="brUseT" type="checkbox" checked><span>Use the teacher</span></label>` : ''}</div>
      ${job ? `<p class="note">${esc(job.msg)}</p><button class="btn ghost" data-a="brStop">Stop</button>` : ''}</div>

    <div class="card"><h3>What it has learned</h3>
      <div class="kv"><div><small>Decisions judged</small><b>${st.total}</b></div><div><small>Situations seen</small><b>${st.buckets} of 360</b></div><div><small>Situations trusted</small><b>${st.confident}</b></div><div><small>Jev and DeepSeek disagreed</small><b>${st.disagree}</b></div></div>
      <h4 class="lbl">Average result after each kind of decision</h4><p class="muted">Goal difference gained afterwards, plus a bonus for points won. Higher is better.</p>
      ${srcRows || '<p class="muted">No judged decisions yet. Play some matches or run the training camp.</p>'}
      ${buckets.length ? `<h4 class="lbl">Most common situations</h4><div class="list">${buckets.map(({ k, s }) => { const best = Object.entries(s.scores).sort((a, b) => b[1] - a[1])[0]; return `<div class="row sm"><span class="grow"><b>${esc(sitLabel(k))}</b><small>${s.n} decisions · best so far: ${MGR_OPTIONS[best[0]]}</small></span><span class="stat"><b>${best[1] >= 0 ? '+' : ''}${best[1].toFixed(2)}</b></span></div>`; }).join('')}</div>` : ''}</div>

    <div class="card"><h3>Engine versions</h3>
      <p class="muted">The draft is what the brain has learned so far. Test it against the engine in use, then approve it to make it live. Each version also stores the Engine tab's tuning.</p>
      <div class="btns"><button class="btn" data-a="brTest" ${job || !st.total ? 'disabled' : ''}>Test draft vs ${V ? esc(V.name) : 'built-in rules'}</button><button class="btn pri" data-a="brApprove" ${!st.total ? 'disabled' : ''}>Approve draft as new version</button></div>
      ${ADM.ab ? `<div class="aitest ${ADM.ab.ppgA >= ADM.ab.ppgB ? 'ok' : 'bad'}"><b>${ADM.ab.games} matches: draft ${ADM.ab.ppgA} points per game, ${esc(ADM.ab.vs)} ${ADM.ab.ppgB}.</b><br>${ADM.ab.ppgA - ADM.ab.ppgB > 0.08 ? 'The draft is clearly better.' : ADM.ab.ppgA - ADM.ab.ppgB < -0.08 ? 'The draft is worse. Keep learning before approving.' : 'No clear difference yet. More data or more matches needed.'}</div>` : ''}
      <div class="list">${B.versions.map(v => `<div class="row"><span class="grow"><b>${esc(v.name)}${v.id === B.active ? ' <em class="tag good">In use</em>' : ''}</b><small>${new Date(v.date).toLocaleString('en-GB')} · ${v.decisions} decisions · ${v.buckets} situations${v.ab ? ` · tested ${v.ab.ppgA} vs ${v.ab.ppgB} ppg` : ''}</small></span>${v.id === B.active ? '' : `<button class="btn sm" data-a="brUse" data-id="${v.id}">Use</button>`}<button class="btn sm ghost ${ADM.confirm === 'v' + v.id ? 'bad' : ''}" data-a="brDelV" data-id="${v.id}">${ADM.confirm === 'v' + v.id ? 'Sure?' : 'Delete'}</button></div>`).join('') || '<p class="muted">No versions yet.</p>'}</div>
      ${V ? '<button class="btn ghost" data-a="brUse" data-id="">Roll back to built-in rules</button>' : ''}</div>

    <div class="card"><h3>Press question library (DeepSeek)</h3>
      <p class="muted">DeepSeek writes new press questions with answers and effects. Approved ones join the built-in questions and are used offline in every pre-match press conference.</p>
      <button class="btn" data-a="brPressGen" ${aiReady('ds', 'press') && !job ? '' : 'disabled'}>Generate 5 questions</button>${aiReady('ds', 'press') ? '' : '<p class="muted">Switch on DeepSeek and tick “Press conference questions” in the DeepSeek tab first.</p>'}
      <div class="list">${B.press.map(p => `<div class="row"><span class="grow"><b>${esc(p.q)}</b><small>${p.a.map(a => esc(a[0]) + ` (morale ${a[1].mor >= 0 ? '+' : ''}${a[1].mor}, fans ${a[1].fan >= 0 ? '+' : ''}${a[1].fan}, board ${a[1].board >= 0 ? '+' : ''}${a[1].board})`).join(' · ')}${p.ok ? ` · used ${p.used || 0}x` : ''}</small></span>${p.ok ? '<em class="tag good">Live</em>' : `<button class="btn sm" data-a="brPressOk" data-id="${p.id}">Approve</button>`}<button class="btn sm ghost" data-a="brPressDel" data-id="${p.id}">Remove</button></div>`).join('') || '<p class="muted">Library is empty. The 5 built-in questions are used.</p>'}</div></div>

    <div class="card"><h3>Recent decisions</h3><div class="list">${B.log.slice(-10).reverse().map(e => `<div class="row sm"><span class="grow"><b>${esc(sitLabel(e.key))} → ${e.opt}</b><small>${SRC_NAME[e.src] || e.src}${e.conf != null ? ' · confidence ' + Math.round(e.conf * 100) + '%' : ''}${e.second ? ' · DeepSeek said ' + e.second + (e.jev ? ', Jev said ' + e.jev : '') : ''} · result ${e.out >= 0 ? '+' : ''}${e.out}</small></span></div>`).join('') || '<p class="muted">Nothing yet.</p>'}</div>
      <button class="btn ghost ${ADM.confirm === 'brainReset' ? 'bad' : ''}" data-a="brReset">${ADM.confirm === 'brainReset' ? 'Tap again: forget everything learned' : 'Reset the brain'}</button></div>`;
};

ACT.brMode = ds => { brain().mode = ds.v; brainSave(); toast('Mode: ' + BRAIN_MODES.find(m => m[0] === ds.v)[1]); render(); };
ACT.brSaveSet = () => { const B = brain(); B.minN = clamp(Math.round(nval('brMinN')), 2, 100); B.conf = clamp(nval('brConf'), 0, 1); B.explore = clamp(nval('brExp'), 0, 1); brainSave(); toast('Brain settings saved.'); render(); };
ACT.brCamp = async ds => {
  const n = +ds.n, useT = teacherReady() && !!(document.getElementById('brUseT') || {}).checked;
  ADM.job = { msg: `Training camp: 0 of ${n} matches…`, stop: false };
  render();
  let calls = 0, done = 0;
  for (; done < n && !ADM.job.stop; done++) {
    const r = await campMatch(useT);
    calls += r.calls;
    if (done % 5 === 4) { ADM.job.msg = `Training camp: ${done + 1} of ${n} matches${useT ? `, ${calls} teacher calls` : ''}…`; brainSave(); if (UI.s === 'admin') render(); await new Promise(res => setTimeout(res, 0)); }
  }
  brainSave(); ADM.job = null;
  toast(`Training camp finished: ${done} matches${useT ? `, ${calls} teacher calls` : ''}.`);
  if (UI.s === 'admin') render();
};
ACT.brStop = () => { if (ADM.job) ADM.job.stop = true; };
ACT.brTest = () => {
  const V = activeVersion();
  ADM.job = { msg: 'Testing 200 head-to-head matches…' }; render();
  setTimeout(() => {
    const r = headToHead(brain().draft, V ? V.table : null, 100);
    ADM.ab = { ...r, vs: V ? V.name : 'built-in rules' };
    ADM.job = null; render();
  }, 30);
};
ACT.brApprove = () => {
  const v = saveVersion();
  if (ADM.ab) v.ab = { ppgA: ADM.ab.ppgA, ppgB: ADM.ab.ppgB };
  activateVersion(v.id);
  if (brain().mode === 'rules') brain().mode = 'learned';
  brainSave(); ADM.ab = null;
  toast(`${v.name} approved and now in use.`); render();
};
ACT.brUse = ds => { activateVersion(ds.id ? +ds.id : null); toast(ds.id ? 'Version switched.' : 'Back to built-in rules.'); render(); };
ACT.brDelV = ds => {
  const k = 'v' + ds.id;
  if (ADM.confirm !== k) { ADM.confirm = k; return render(); }
  ADM.confirm = ''; const B = brain();
  B.versions = B.versions.filter(v => v.id !== +ds.id);
  if (B.active === +ds.id) activateVersion(null);
  brainSave(); render();
};
ACT.brReset = () => {
  if (ADM.confirm !== 'brainReset') { ADM.confirm = 'brainReset'; return render(); }
  ADM.confirm = ''; const B = brain();
  B.log = []; B.draft = {}; B.saved = { calls: 0, skipped: 0 };
  brainSave(); toast('Learned data cleared. Versions and the press library were kept.'); render();
};
ACT.brPressGen = async () => {
  ADM.job = { msg: 'DeepSeek is writing questions…' }; render();
  try { const n = await generatePress(5); toast(n ? `${n} new questions to review.` : 'No usable questions came back. Try again.'); }
  catch (e) { toast(e.message); }
  ADM.job = null; if (UI.s === 'admin') render();
};
ACT.brPressOk = ds => { const p = brain().press.find(x => x.id === +ds.id); if (p) p.ok = true; brainSave(); render(); };
ACT.brPressDel = ds => { const B = brain(); B.press = B.press.filter(x => x.id !== +ds.id); brainSave(); render(); };
