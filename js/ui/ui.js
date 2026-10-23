'use strict';
let ACTION_BUSY = false; // in-flight work is runtime state, never view-history state
const CAREER_ACTIONS = new Set(['instant', 'instant2', 'admWeeks', 'admSimMine', 'newGame', 'newGame2', 'returnTitle', 'importDo', 'startGame', 'continue', 'dayRunGo', 'kickoff']);
/* ===== ui.js =====
   Tiny UI framework: router, app shell, bottom sheets, toasts, click/change
   dispatch through data-a / data-c attributes, and shared components. */

const UI = { s: 'home', p: {}, tab: {}, f: { squad: 'ALL', sort: 'pos', news: 'all', lvl: 'A' }, search: { pos: 'Any', region: 'Everywhere', maxAge: 40, maxFee: 0, minOvr: 0, name: '' }, sheetOpts: null };
const SCREENS = {};  // name -> { render(p) -> html, after?(p), full?: bool, title?: string }
const ACT = {};      // click actions: ACT[name](dataset, el)
const CHG = {};      // change actions: CHG[name](value, dataset, el)

const NAV = [['home', 'Dashboard'], ['news', 'News'], ['team', 'My Team'], ['transfers', 'Transfers'], ['facilities', 'Facilities'], ['more', 'More']];
const NAV_GROUPS = {
  home: ['competitions'],
  team: ['squad', 'tactics', 'pinstr', 'staffroom', 'fixtures', 'training', 'staff', 'medical', 'youth', 'stats', 'table', 'clubs', 'clubview', 'manager', 'prematch', 'match', 'post'],
  facilities: ['finance', 'board', 'club'],
};
const DASHBOARD_SECTIONS = [['home', 'Overview'], ['competitions', 'Competitions']];
const TEAM_SECTIONS = [['squad', 'Squad'], ['tactics', 'Tactics'], ['fixtures', 'Fixtures'], ['training', 'Training'], ['staffroom', 'Staff room'], ['staff', 'Staff'], ['medical', 'Medical center'], ['youth', 'Youth academy'], ['stats', 'Stats'], ['table', 'League table'], ['clubs', 'Club directory'], ['manager', 'Manager profile']];
function dashboardSections() {
  return `<nav class="tabs dashboard-sections" aria-label="Dashboard sections">${DASHBOARD_SECTIONS.map(([s, n]) => `<button class="${UI.s === s ? 'on' : ''}" ${UI.s === s ? 'aria-current="page"' : ''} data-a="go" data-s="${s}">${n}</button>`).join('')}</nav>`;
}
const FACILITY_SECTIONS = [['club', 'Club'], ['finance', 'Finance'], ['board', 'Board & Fans']];
function facilitySections() {
  const current = FACILITY_SECTIONS.some(([s]) => s === UI.tab.facility) ? UI.tab.facility : 'club';
  return `<nav class="tabs facility-sections" aria-label="Facilities sections">${FACILITY_SECTIONS.map(([s, n]) => `<button class="${current === s ? 'on' : ''}" ${current === s ? 'aria-current="page"' : ''} data-a="facilityTab" data-v="${s}">${n}</button>`).join('')}</nav>`;
}
function teamSections() {
  const current = UI.s === 'pinstr' ? 'tactics' : UI.s;
  return `<nav class="tabs team-sections" aria-label="My Team sections">${TEAM_SECTIONS.map(([s, n]) => `<button class="${current === s ? 'on' : ''}" ${current === s ? 'aria-current="page"' : ''} data-a="go" data-s="${s}">${n}</button>`).join('')}</nav>`;
}
const ICON = {
  back: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg>',
  ball: '<svg viewBox="0 0 40 40" aria-hidden="true"><circle cx="20" cy="20" r="18" fill="#fff"/><path d="M20 11.5l7 5-2.7 8.2h-8.6L13 16.5z" fill="#22082F"/><path d="M20 2.2v9.3M27 16.5l8.6-3M24.3 24.7l5.4 7.6M15.7 24.7l-5.4 7.6M13 16.5l-8.6-3" stroke="#22082F" stroke-width="2"/><path d="M11 3.6l2.2 4.8M29 3.6l-2.2 4.8M37.9 21l-4.7 2.6M2.1 21l4.7 2.6M17 37.8l3-4.3 3 4.3" stroke="#22082F" stroke-width="2" fill="none"/></svg>',
  bell: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15z"/><path d="M10 20.5a2 2 0 0 0 4 0"/></svg>',
  cal: '<svg class="cal" viewBox="0 0 24 24" aria-hidden="true"><rect x="3.5" y="5" width="17" height="15.5" rx="2.5"/><path d="M3.5 10h17M8 3v4M16 3v4"/></svg>',
  doc: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="3" width="16" height="18" rx="3"/><path d="M8 8h8M8 12h8M8 16h5"/></svg>',
  arrow: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
};

function go(s, p = {}) {
  return viewAction(() => {
    if (s === 'team') s = 'squad';
    if (UI.s === 'tactics' && s !== 'tactics') { UI.swapMode = false; UI.swapFrom = null; }
    if (UI.s === 'match' && s !== 'match') stopLive();
    hideSheet();
    UI.s = s; UI.p = p;
    render(true);
  });
}

function render(reset) {
  syncPlaytime();
  if (UI.s === 'team') UI.s = 'squad'; // old bookmarks and saved views
  ENTITY_INDEX = null;
  const root = document.getElementById('app');
  const main = root.querySelector('.main');
  const sameScreen = root.dataset.screen === UI.s;
  const rails = !reset && sameScreen ? [...root.querySelectorAll('.tabs,.chips,.sortbar,.seg')].map(el => el.scrollLeft) : null;
  const focused = !reset && sameScreen && root.contains(document.activeElement) ? document.activeElement : null;
  const focus = focused ? { tag:focused.tagName, id:focused.id, data:{...focused.dataset}, value:focused.value, start:focused.selectionStart, end:focused.selectionEnd } : null;
  const keep = !reset && main ? main.scrollTop : 0;
  let scr;
  if (UI.s === 'title') scr = SCREENS.title;
  else if (!G) scr = SCREENS.start;
  else if (G.gameOver) scr = SCREENS.sacked;
  else if (G.seasonReview && UI.s !== 'review') { UI.s = 'review'; scr = SCREENS.review; }
  else scr = SCREENS[UI.s] || SCREENS.home;
  const subnav = TEAM_SECTIONS.some(([s]) => s === UI.s) || UI.s === 'pinstr' ? teamSections() : ['home', 'competitions'].includes(UI.s) ? dashboardSections() : UI.s === 'facilities' ? facilitySections() : '';
  const body = (!scr.full ? subnav : '') + scr.render(UI.p);
  root.innerHTML = scr.full ? `<div class="app full">${body}</div>` : shell(body);
  linkEntities(root);
  const m2 = root.querySelector('.main');
  if (m2) m2.scrollTop = keep;
  const rail = root.querySelector('.team-sections'), active = rail?.querySelector('.on');
  if (active && !rails) rail.scrollLeft = Math.max(0, active.offsetLeft - (rail.clientWidth - active.offsetWidth) / 2);
  if (scr.after) scr.after(UI.p);
  if (rails) root.querySelectorAll('.tabs,.chips,.sortbar,.seg').forEach((el,i) => { el.scrollLeft=rails[i] || 0; });
  if (focus && (focus.id || Object.keys(focus.data).length)) {
    const next=[...root.querySelectorAll(focus.tag)].find(el => focus.id ? el.id===focus.id : Object.entries(focus.data).every(([k,v]) => el.dataset[k]===v));
    if (next && !next.disabled) {
      if (['TEXTAREA'].includes(focus.tag) || focus.tag==='INPUT' && ['text','search'].includes(next.type)) next.value=focus.value;
      next.focus({preventScroll:true});
      if (focus.start!=null && next.setSelectionRange) next.setSelectionRange(focus.start,focus.end);
    }
  }
  if (m2) m2.scrollTop=keep;
  if (root.dataset.screen && !sameScreen && UI.s!=='match') (m2 || root.firstElementChild)?.classList.add('ui-enter');
  root.dataset.screen=UI.s;
  rememberScreen();
  syncViewHistory();
}

// A refresh returns to the screen you were on (this browser tab only); opening the game afresh shows the title.
const LAST_VIEW_KEY = 'futbol-manager:view';
function rememberScreen() {
  if (!G || ['title', 'start'].includes(UI.s)) return;
  try { sessionStorage.setItem(LAST_VIEW_KEY, JSON.stringify({ s: UI.s, p: UI.p || {}, tab: UI.tab || {} })); } catch (e) { /* storage blocked */ }
}
function restoreScreen() {
  try {
    const v = JSON.parse(sessionStorage.getItem(LAST_VIEW_KEY) || 'null');
    if (!v || !SCREENS[v.s]) return false;
    // A live match carries on from the save at the minute it reached (paused).
    UI.s = v.s === 'match' && !liveFromSave(userFixture()) ? 'prematch' : v.s; UI.p = v.p || {}; UI.tab = { ...UI.tab, ...(v.tab || {}) };
    return true;
  } catch (e) { return false; }
}

function shell(body) {
  const c = userClub(), unread = G.news.filter(n => !n.read).length, reports = G.scout.reports.length;
  const fx = userFixture(), matchNow = fx && !played(fx) && (fx.d ?? 5) <= G.day;
  const cur = NAV.some(n => n[0] === UI.s) ? UI.s : Object.keys(NAV_GROUPS).find(k => NAV_GROUPS[k].includes(UI.s)) || 'more';
  return `<div class="app">
    <header class="top">
      <button class="iconbtn" data-a="back" aria-label="Back">${ICON.back}</button>
      <div class="brand">${ICON.ball}<span>${GAME_NAME}</span></div>
      <div class="top-icons">
        <button class="iconbtn" data-a="go" data-s="news" aria-label="News, ${unread} unread">${ICON.bell}${unread ? '<i class="dot"></i>' : ''}</button>
      <button data-a="go" data-s="manager" aria-label="Your manager profile">${avatarImg(G.avatar)}</button>
      </div>
    </header>
    <nav class="tabs2">${NAV.map(([k, n]) => `<button class="${cur === k ? 'on' : ''}" data-a="go" data-s="${k}">${n}</button>`).join('')}</nav>
    <div class="subbar"><button data-a="go" data-s="club">${badge(c.id, 20)}<b>${esc(c.name)}</b><span>· ${esc(phaseLabel())}</span></button><span>${ICON.cal}${fmtDate(today())}</span></div>
    <main class="main">${body}<div class="spacer"></div></main>
    ${UI.s === 'admin' ? '' : `<div class="bottombar">
      <button class="bb-sum" data-a="go" data-s="news">${ICON.doc}<span>${unread} news · ${reports} report${reports === 1 ? '' : 's'}</span></button>
      <button class="cta ${matchNow ? 'match' : ''}" data-a="continue">${matchNow ? 'Matchday' : 'Continue'}${ICON.arrow}</button>
    </div>`}
  </div>`;
}

/* ---------- sheets & toasts ---------- */
function sheet(html, opts = {}) {
  return viewAction(() => {
    clearSheetExit();
    const layer = document.getElementById('layer');
    const panel = !layer.hidden && opts.key && UI.popup?.key === opts.key ? layer.querySelector('.sheet') : null;
    const body = panel?.querySelector('.sh-body'), focused = body?.contains(document.activeElement) ? document.activeElement : null;
    const scroll = panel?.scrollTop || 0;
    const rails = body ? [...body.querySelectorAll('.tabs,.chips,.dstages')].map(el => el.scrollLeft) : [];
    const focus = focused ? { tag: focused.tagName, id: focused.id, data: { ...focused.dataset }, value: focused.value, start: focused.selectionStart, end: focused.selectionEnd } : null;
    UI.sheetOpts = opts;
    UI.popup = { key: opts.key || html, restore: opts.restore || (() => sheet(html, opts)), valid: opts.valid };
    // Updating an open sheet must not replay its entrance, jump to the top,
    // or throw keyboard focus away (fee buttons and late AI replies do this often).
    if (body) body.innerHTML = html;
    else layer.innerHTML = `<div class="scrim" data-a="closeSheet"></div><section class="sheet" role="dialog" aria-modal="true"><div class="grab"></div><button class="sh-x" data-a="dismissSheet" aria-label="Close">×</button><div class="sh-body">${html}</div></section>`;
    linkEntities(layer);
    layer.hidden = false;
    if (body) {
      if (focus && (focus.id || Object.keys(focus.data).length)) {
        const next = [...body.querySelectorAll(focus.tag)].find(el => focus.id ? el.id === focus.id : Object.entries(focus.data).every(([k, v]) => el.dataset[k] === v));
        if (next && !next.disabled) {
          if (['INPUT', 'TEXTAREA'].includes(focus.tag) && !['checkbox', 'radio'].includes(next.type)) next.value = focus.value;
          next.focus({ preventScroll: true });
          if (focus.start != null && next.setSelectionRange) next.setSelectionRange(focus.start, focus.end);
        }
      }
      body.querySelectorAll('.tabs,.chips,.dstages').forEach((el, i) => { el.scrollLeft = rails[i] || 0; });
      panel.scrollTop = scroll;
    }
  });
}
function clearSheetExit() {
  document.querySelectorAll('.sheet-exit').forEach(el => el.remove());
}
function hideSheet() {
  const layer = document.getElementById('layer');
  clearSheetExit();
  if (layer && !layer.hidden && layer.querySelector('.sheet')?.animate && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    // Dismiss the real dialog synchronously for history/focus. Only an inert,
    // aria-hidden visual copy finishes the exit; a new dialog cancels it.
    const ghost=layer.cloneNode(true); ghost.removeAttribute('id'); ghost.className='sheet-exit';
    ghost.inert=true; ghost.setAttribute('aria-hidden','true');
    ghost.querySelectorAll('[id]').forEach(el => el.removeAttribute('id'));
    document.body.appendChild(ghost);
    ghost.querySelector('.scrim').animate([{opacity:1},{opacity:0}],{duration:120,fill:'forwards'});
    const exit=ghost.querySelector('.sheet').animate([{transform:'translate(-50%,0)',opacity:1},{transform:'translate(-50%,12px)',opacity:0}],{duration:120,easing:'ease-in',fill:'forwards'});
    exit.finished.then(()=>ghost.remove(),()=>ghost.remove());
  }
  if (layer) { layer.hidden = true; layer.innerHTML = ''; }
  UI.sheetOpts = null; UI.popup = null;
}
function closeSheet(silent) {
  const layer = document.getElementById('layer');
  if (!layer || layer.hidden) return;
  if (!silent) return backView();
  return viewAction(hideSheet);
}
let toastT = 0, toastHideT = 0;
function toast(msg) {
  const t = document.getElementById('toast');
  clearTimeout(toastT); clearTimeout(toastHideT);
  t.textContent = msg;
  if (t.hidden) { t.hidden=false; t.classList.remove('show'); void t.offsetWidth; }
  t.classList.add('show');
  toastT = setTimeout(() => { t.classList.remove('show'); toastHideT=setTimeout(() => { t.hidden=true; }, 160); },2600);
}

/* ---------- components ---------- */
function badge(cid, size = 28) {
  return clubBadge(G?.clubs[cid], size);
}
const avatarImg = (n, cls = '') => `<img class="av ${cls}" src="${avatarSrc(n)}" alt="Manager ${AVATARS.includes(+n) ? +n : 1}" width="320" height="320" loading="lazy" decoding="async">`;
function avatarPicker(cur, act) {
  return `<div class="avpick" role="radiogroup" aria-label="Manager portrait">${AVATARS.map(n => `<button class="avopt ${+cur === n ? 'on' : ''}" role="radio" aria-checked="${+cur === n}" data-a="${act}" data-v="${n}">${avatarImg(n)}<span>Manager ${n}</span></button>`).join('')}</div>`;
}
const condBar = c => `<span class="mbar ${condClass(c)}" title="Condition ${Math.round(c)}%"><i style="width:${clamp(Math.round(c), 0, 100)}%"></i></span>`;
const bar = (v, cls = '') => `<span class="bar ${cls}"><i style="width:${clamp(Math.round(v), 0, 100)}%"></i></span>`;
const ovrPill = (v, txt) => `<span class="ovr ${v >= 82 ? 'o4' : v >= 74 ? 'o3' : v >= 65 ? 'o2' : 'o1'}">${txt ?? v}</span>`;
const ratingRemark = v => (v >= 88 ? 'World class' : v >= 82 ? 'Elite' : v >= 76 ? 'Excellent' : v >= 70 ? 'Very good' : v >= 64 ? 'Good' : v >= 57 ? 'Decent' : v >= 50 ? 'Average' : v >= 42 ? 'Developing' : 'Raw');
const potRemark = s => (s >= 4.5 ? 'Superstar' : s >= 3.5 ? 'Top player' : s >= 2.5 ? 'Solid pro' : s >= 1.5 ? 'Squad player' : 'Limited');

// Six-sided attribute shape. Keepers and outfielders use different sides.
const HEX_OUT = [['Attacking', ['fin', 'cro', 'cmp', 'otb']], ['Technical', ['pas', 'fir', 'dri', 'fla']], ['Speed', ['pac', 'agi']], ['Physical', ['str', 'sta', 'hea']], ['Defending', ['tck', 'mar', 'pos', 'ant']], ['Mental', ['vis', 'dec', 'wor', 'ldr', 'tea']]];
const HEX_GK = [['Shot stopping', ['ref', 'agi']], ['Handling', ['han']], ['One on ones', ['one']], ['Distribution', ['kic']], ['Positioning', ['pos', 'cmp']], ['Mental', ['dec', 'ldr', 'wor', 'ant']]];
function playerHex(p) {
  const axes = p.pos === 'GK' ? HEX_GK : HEX_OUT, mine = p.club === G.club;
  const val = k => { if (mine) return p.at[A[k]]; const s = seenAttr(p, A[k]); return (s.lo + s.hi) / 2; };
  const vals = axes.map(([, ks]) => ks.reduce((t, k) => t + val(k), 0) / ks.length / 20);
  const cx = 170, cy = 96, R = 64, pt = (i, r) => { const a = -Math.PI / 2 + i * Math.PI / 3; return [cx + Math.cos(a) * r, cy + Math.sin(a) * r]; };
  const poly = r => axes.map((_, i) => pt(i, typeof r === 'function' ? r(i) : r).map(n => n.toFixed(1)).join(',')).join(' ');
  const rings = [0.25, 0.5, 0.75, 1].map(f => `<polygon points="${poly(R * f)}" class="hx-ring"/>`).join('');
  const spokes = axes.map((_, i) => { const [x, y] = pt(i, R); return `<line x1="${cx}" y1="${cy}" x2="${x.toFixed(1)}" y2="${y.toFixed(1)}" class="hx-ring"/>`; }).join('');
  const labels = axes.map(([n], i) => { const [x, y] = pt(i, R + 15); const anchor = Math.abs(x - cx) < 5 ? 'middle' : x > cx ? 'start' : 'end'; return `<text x="${x.toFixed(1)}" y="${(y + 4).toFixed(1)}" text-anchor="${anchor}">${n} <tspan>${Math.round(vals[i] * 20)}</tspan></text>`; }).join('');
  return `<svg class="hex" viewBox="0 0 340 192" role="img" aria-label="${axes.map(([n], i) => n + ' ' + Math.round(vals[i] * 20)).join(', ')}">${rings}${spokes}
    <polygon points="${poly(i => R * clamp(vals[i], 0.06, 1))}" class="hx-shape ${mine || knowOf(p) >= 95 ? '' : 'est'}"/>${labels}</svg>`;
}
const formChips = arr => `<span class="form">${arr.slice(-5).map(r => `<i class="f${r}">${r}</i>`).join('')}</span>`;
const empty = (t, d) => `<div class="empty"><b>${t}</b><p>${d}</p></div>`;
const tabs = (key, items, cur) => `<div class="tabs" role="tablist">${items.map(([k, n]) => `<button role="tab" class="${cur === k ? 'on' : ''}" data-a="tab" data-key="${key}" data-v="${k}">${n}</button>`).join('')}</div>`;
function selectHtml(id, opts, cur, chg, ds = '') {
  return `<select id="${id}" data-c="${chg}" ${ds}>${opts.map(o => { const [v, l] = Array.isArray(o) ? o : [o, o]; return `<option value="${esc(v)}" ${String(v) === String(cur) ? 'selected' : ''}>${esc(l)}</option>`; }).join('')}</select>`;
}
function playerRow(p, extra = '', opts = {}) {
  const mine = p.club === G.club;
  const tags = [p.inj ? '<em class="tag bad">INJ</em>' : '', p.ban > 0 ? '<em class="tag bad">SUS</em>' : '', p.listed ? '<em class="tag warn">LIST</em>' : '', G.shortlist.includes(p.id) && !mine ? '<em class="tag">★</em>' : ''].join('');
  const detail = opts.hideAge ? opts.sub : `${p.age} yrs · ${opts.sub ?? (mine ? morLabel(p.mor) : esc(clubName(p.club)))}`;
  return `<div class="row act prow linked-prow">
    ${opts.noBadge ? '' : clubLink(p.club, badge(p.club, 20), 'rb')}
    <button class="player-main" data-a="player" data-id="${p.id}">
    ${opts.noBadge ? `<span class="no">${p.no || ''}</span>` : ''}
    <span class="pos">${p.pos}</span>
    <span class="grow"><b>${esc(pname(p))}</b> ${tags}<small>${esc(detail ?? '')}</small></span>
    ${extra}</button></div>`;
}

/* ---------- dispatch ---------- */
document.addEventListener('click', e => {
  const el = e.target.closest('[data-a]');
  if (!el || el.disabled) return;
  // A pending save/result must never swallow navigation, backups or sheet controls.
  if (ACTION_BUSY && CAREER_ACTIONS.has(el.dataset.a)) return toast('Finishing the previous operation. You can still browse or export a backup.');
  const f = ACT[el.dataset.a];
  if (f) {
    e.preventDefault();
    const result = viewAction(() => f(el.dataset, el));
    if (result && typeof result.catch === 'function') {
      const exclusive = ['instant', 'instant2', 'admWeeks', 'admSimMine', 'newGame', 'newGame2', 'returnTitle', 'importDo'].includes(el.dataset.a);
      if (exclusive) ACTION_BUSY = true;
      el.disabled = true;
      result.catch(() => toast('The operation could not finish. Your existing progress has been kept.')).finally(() => { if (exclusive) ACTION_BUSY = false; if (el.isConnected) el.disabled = false; syncViewHistory(); });
    }
  }
});
document.addEventListener('change', e => {
  const el = e.target.closest('[data-c]');
  if (!el) return;
  const f = CHG[el.dataset.c];
  // deferred so a re-render never happens while the field is still blurring
  if (f) { const v = el.type === 'checkbox' ? el.checked : el.value, ds = { ...el.dataset }; setTimeout(() => {
    if (!el.isConnected) return;
    if (ACTION_BUSY && el.dataset.c === 'importFile') return toast('Finish the current operation before importing a career.');
    const result = viewAction(() => f(v, ds, el));
    if (result && typeof result.catch === 'function') { ACTION_BUSY = true; result.catch(() => toast('The change could not finish.')).finally(() => { ACTION_BUSY = false; syncViewHistory(); }); }
  }, 0); }
});
document.addEventListener('keydown', e => { if (e.key === 'Escape') { e.preventDefault(); backView(); } });

ACT.go = ds => go(ds.s, { ...ds });
ACT.back = () => backView();
ACT.closeSheet = () => closeSheet();
ACT.dismissSheet = () => dismissPopup();
ACT.tab = ds => { UI.tab[ds.key] = ds.v; render(); };
// Continue: the calendar moves day by day (dayrun.js).

async function boot() {
  if (typeof SaveStorage !== 'undefined') await SaveStorage.ready;
  loadGame();
  UI.s = 'title';
  if (G) restoreScreen();
  try { render(true); } catch (e) { UI.s = G ? 'home' : 'title'; UI.p = {}; render(true); } // a screen that no longer fits the save
  initViewHistory();
  if (UI.s === 'title') checkForUpdate();
  if (typeof SaveStorage !== 'undefined' && SaveStorage.error) toast('Save storage could not be opened. Your existing backup has been kept; export your career before leaving.');
}
window.addEventListener('DOMContentLoaded', boot);
