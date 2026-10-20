'use strict';
/* ===== ui.js =====
   Tiny UI framework: router, app shell, bottom sheets, toasts, click/change
   dispatch through data-a / data-c attributes, and shared components. */

const UI = { s: 'home', p: {}, tab: {}, f: { squad: 'ALL', sort: 'pos', news: 'all' }, search: { pos: 'Any', region: 'Everywhere', maxAge: 40, maxFee: 0, minOvr: 0, name: '' }, sheetOpts: null };
const SCREENS = {};  // name -> { render(p) -> html, after?(p), full?: bool, title?: string }
const ACT = {};      // click actions: ACT[name](dataset, el)
const CHG = {};      // change actions: CHG[name](value, dataset, el)

const NAV = [['home', 'Home', 'M3 11 12 4l9 7v9h-6v-6H9v6H3z'], ['squad', 'Squad', 'M16 11a4 4 0 1 0-4-4 4 4 0 0 0 4 4zM8 12a3 3 0 1 0-3-3 3 3 0 0 0 3 3zm8 2c-3 0-7 1.5-7 4v2h14v-2c0-2.5-4-4-7-4zM8 14c-.4 0-.9 0-1.4.1A4.6 4.6 0 0 1 8 18v2H1v-2c0-2 4-4 7-4z'], ['tactics', 'Tactics', 'M4 3h16v18H4zM4 12h16M12 3v3M12 18v3M9 12a3 3 0 0 0 6 0'], ['transfers', 'Transfers', 'M4 8h13l-3-3M20 16H7l3 3'], ['more', 'More', 'M4 6h16M4 12h16M4 18h16']];

function go(s, p = {}) {
  if (UI.s === 'match' && s !== 'match') stopLive();
  closeSheet(true);
  UI.s = s; UI.p = p;
  render(true);
}

function render(reset) {
  const root = document.getElementById('app');
  const main = root.querySelector('.main');
  const keep = !reset && main ? main.scrollTop : 0;
  let scr;
  if (!G) scr = SCREENS.start;
  else if (G.gameOver) scr = SCREENS.sacked;
  else if (G.seasonReview && UI.s !== 'review') { UI.s = 'review'; scr = SCREENS.review; }
  else scr = SCREENS[UI.s] || SCREENS.home;
  const body = scr.render(UI.p);
  root.innerHTML = scr.full ? `<div class="app full">${body}</div>` : shell(body);
  const m2 = root.querySelector('.main');
  if (m2) m2.scrollTop = keep;
  if (scr.after) scr.after(UI.p);
}

function shell(body) {
  const c = userClub(), unread = G.news.filter(n => !n.read).length;
  const fx = userFixture(), matchNow = fx && !played(fx);
  const cur = ['news', 'fixtures', 'table', 'stats', 'finance', 'training', 'medical', 'youth', 'staff', 'board', 'club', 'settings', 'history', 'admin'].includes(UI.s) ? 'more' : UI.s;
  return `<div class="app">
    <header class="top">
      <button class="top-club" data-a="go" data-s="club" aria-label="Club overview">${badge(c.id, 30)}<span><b>${esc(c.name)}</b><small>${esc(phaseLabel())} · ${fmtDate(weekDate(G.week), false)}</small></span></button>
      <button class="top-money" data-a="go" data-s="finance"><small>Balance</small><b class="${c.bal < 0 ? 'bad' : ''}">${money(c.bal)}</b></button>
    </header>
    <main class="main">${body}<div class="spacer"></div></main>
    ${UI.s === 'admin' ? '' : `<button class="fab ${matchNow ? 'match' : ''}" data-a="continue">${matchNow ? 'Matchday' : 'Continue'}<span aria-hidden="true">›</span></button>`}
    <nav class="nav">${NAV.map(([k, n, d]) => `<button class="${cur === k ? 'on' : ''}" data-a="go" data-s="${k}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="${d}"/></svg><span>${n}</span>${k === 'home' && unread ? `<i class="dot">${unread > 9 ? '9+' : unread}</i>` : ''}</button>`).join('')}</nav>
  </div>`;
}

/* ---------- sheets & toasts ---------- */
function sheet(html, opts = {}) {
  const layer = document.getElementById('layer');
  UI.sheetOpts = opts;
  layer.innerHTML = `<div class="scrim" data-a="closeSheet"></div><section class="sheet" role="dialog" aria-modal="true"><div class="grab"></div><button class="sh-x" data-a="closeSheet" aria-label="Close">×</button><div class="sh-body">${html}</div></section>`;
  layer.hidden = false;
}
function closeSheet(silent) {
  const layer = document.getElementById('layer');
  if (!layer || layer.hidden) return;
  layer.hidden = true; layer.innerHTML = '';
  const o = UI.sheetOpts; UI.sheetOpts = null;
  if (!silent && o && o.onClose) o.onClose();
}
let toastT = 0;
function toast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg; t.hidden = false; t.classList.add('show');
  clearTimeout(toastT);
  toastT = setTimeout(() => { t.classList.remove('show'); setTimeout(() => { t.hidden = true; }, 250); }, 2600);
}

/* ---------- components ---------- */
function badge(cid, size = 28) {
  const c = G.clubs[cid];
  if (!c) return '';
  const code = c.code || c.id, txt = isLight(c.c1) ? '#141414' : '#FFFFFF';
  return `<svg class="crest" width="${size}" height="${Math.round(size * 1.15)}" viewBox="0 0 40 46" aria-hidden="true"><path d="M20 1.5 37.5 6v16c0 12-8 19-17.5 22.5C10.5 41 2.5 34 2.5 22V6z" fill="${c.c1}" stroke="${c.c2}" stroke-width="2.5"/><path d="M8 9h24" stroke="${c.c2}" stroke-width="2" opacity=".55"/><text x="20" y="28" text-anchor="middle" font-size="${code.length > 2 ? 11.5 : 13}" font-weight="800" fill="${txt}" font-family="Saira Condensed, sans-serif">${code}</text></svg>`;
}
const avatarImg = (n, cls = '') => `<img class="av ${cls}" src="${avatarSrc(n)}" alt="Manager ${AVATARS.includes(+n) ? +n : 1}" width="320" height="320" loading="lazy" decoding="async">`;
function avatarPicker(cur, act) {
  return `<div class="avpick" role="radiogroup" aria-label="Manager portrait">${AVATARS.map(n => `<button class="avopt ${+cur === n ? 'on' : ''}" role="radio" aria-checked="${+cur === n}" data-a="${act}" data-v="${n}">${avatarImg(n)}<span>Manager ${n}</span></button>`).join('')}</div>`;
}
const condBar = c => `<span class="mbar ${condClass(c)}" title="Condition ${Math.round(c)}%"><i style="width:${clamp(Math.round(c), 0, 100)}%"></i></span>`;
const bar = (v, cls = '') => `<span class="bar ${cls}"><i style="width:${clamp(Math.round(v), 0, 100)}%"></i></span>`;
const ovrPill = (v, txt) => `<span class="ovr ${v >= 82 ? 'o4' : v >= 74 ? 'o3' : v >= 65 ? 'o2' : 'o1'}">${txt ?? v}</span>`;
const formChips = arr => `<span class="form">${arr.slice(-5).map(r => `<i class="f${r}">${r}</i>`).join('')}</span>`;
const empty = (t, d) => `<div class="empty"><b>${t}</b><p>${d}</p></div>`;
const tabs = (key, items, cur) => `<div class="tabs" role="tablist">${items.map(([k, n]) => `<button role="tab" class="${cur === k ? 'on' : ''}" data-a="tab" data-key="${key}" data-v="${k}">${n}</button>`).join('')}</div>`;
function selectHtml(id, opts, cur, chg, ds = '') {
  return `<select id="${id}" data-c="${chg}" ${ds}>${opts.map(o => { const [v, l] = Array.isArray(o) ? o : [o, o]; return `<option value="${esc(v)}" ${String(v) === String(cur) ? 'selected' : ''}>${esc(l)}</option>`; }).join('')}</select>`;
}
function playerRow(p, extra = '', opts = {}) {
  const mine = p.club === G.club, so = mine ? { v: p.ca, txt: p.ca } : seenOvr(p);
  const tags = [p.inj ? '<em class="tag bad">INJ</em>' : '', p.ban > 0 ? '<em class="tag bad">SUS</em>' : '', p.listed ? '<em class="tag warn">LIST</em>' : '', G.shortlist.includes(p.id) && !mine ? '<em class="tag">★</em>' : ''].join('');
  return `<button class="row act prow" data-a="player" data-id="${p.id}">
    ${opts.noBadge ? `<span class="no">${p.no || ''}</span>` : `<span class="rb">${badge(p.club, 20)}</span>`}
    <span class="pos">${p.pos}</span>
    <span class="grow"><b>${esc(pname(p))}</b> ${tags}<small>${p.age} yrs · ${opts.sub ?? (mine ? morLabel(p.mor) : esc(clubName(p.club)))}</small></span>
    ${extra}${ovrPill(so.v, so.txt)}</button>`;
}

/* ---------- dispatch ---------- */
document.addEventListener('click', e => {
  const el = e.target.closest('[data-a]');
  if (!el || el.disabled) return;
  const f = ACT[el.dataset.a];
  if (f) { e.preventDefault(); f(el.dataset, el); }
});
document.addEventListener('change', e => {
  const el = e.target.closest('[data-c]');
  if (!el) return;
  const f = CHG[el.dataset.c];
  // deferred so a re-render never happens while the field is still blurring
  if (f) { const v = el.type === 'checkbox' ? el.checked : el.value, ds = { ...el.dataset }; setTimeout(() => f(v, ds, el), 0); }
});
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeSheet(); });

ACT.go = ds => go(ds.s, { ...ds });
ACT.closeSheet = () => closeSheet();
ACT.tab = ds => { UI.tab[ds.key] = ds.v; render(); };
ACT.continue = () => {
  if (!G) return;
  const fx = userFixture();
  if (fx && !played(fx)) return go('prematch');
  const r = advanceWeek();
  if (r === 'sacked') return go('home');
  if (r === 'season') return go('review');
  const nx = userFixture();
  if (nx && !played(nx)) toast('Matchday: ' + clubName(nx.h) + ' v ' + clubName(nx.a));
  else toast(phaseLabel() + ' · ' + fmtDate(weekDate(G.week), false));
  go('home');
};

function boot() {
  loadGame();
  if (G) UI.s = 'home';
  render(true);
}
window.addEventListener('DOMContentLoaded', boot);
