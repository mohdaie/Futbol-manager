'use strict';
/* ===== ui.js =====
   Tiny UI framework: router, app shell, bottom sheets, toasts, click/change
   dispatch through data-a / data-c attributes, and shared components. */

const UI = { s: 'home', p: {}, tab: {}, f: { squad: 'ALL', sort: 'pos', news: 'all', lvl: 'A' }, search: { pos: 'Any', region: 'Everywhere', maxAge: 40, maxFee: 0, minOvr: 0, name: '' }, sheetOpts: null };
const SCREENS = {};  // name -> { render(p) -> html, after?(p), full?: bool, title?: string }
const ACT = {};      // click actions: ACT[name](dataset, el)
const CHG = {};      // change actions: CHG[name](value, dataset, el)

const NAV = [['home', 'Dashboard'], ['squad', 'Squad'], ['tactics', 'Tactics'], ['training', 'Training'], ['news', 'News'], ['transfers', 'Transfers'], ['finance', 'Finance'], ['more', 'More']];
const ICON = {
  ball: '<svg viewBox="0 0 40 40" aria-hidden="true"><circle cx="20" cy="20" r="18" fill="#fff"/><path d="M20 11.5l7 5-2.7 8.2h-8.6L13 16.5z" fill="#22082F"/><path d="M20 2.2v9.3M27 16.5l8.6-3M24.3 24.7l5.4 7.6M15.7 24.7l-5.4 7.6M13 16.5l-8.6-3" stroke="#22082F" stroke-width="2"/><path d="M11 3.6l2.2 4.8M29 3.6l-2.2 4.8M37.9 21l-4.7 2.6M2.1 21l4.7 2.6M17 37.8l3-4.3 3 4.3" stroke="#22082F" stroke-width="2" fill="none"/></svg>',
  bell: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15z"/><path d="M10 20.5a2 2 0 0 0 4 0"/></svg>',
  cal: '<svg class="cal" viewBox="0 0 24 24" aria-hidden="true"><rect x="3.5" y="5" width="17" height="15.5" rx="2.5"/><path d="M3.5 10h17M8 3v4M16 3v4"/></svg>',
  doc: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="3" width="16" height="18" rx="3"/><path d="M8 8h8M8 12h8M8 16h5"/></svg>',
  arrow: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
};

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
  const c = userClub(), unread = G.news.filter(n => !n.read).length, reports = G.scout.reports.length;
  const fx = userFixture(), matchNow = fx && !played(fx);
  const cur = NAV.some(n => n[0] === UI.s) ? UI.s : 'more';
  return `<div class="app">
    <header class="top">
      <div class="brand">${ICON.ball}<span>${GAME_NAME}</span></div>
      <div class="top-icons">
        <button class="iconbtn" data-a="go" data-s="news" aria-label="News, ${unread} unread">${ICON.bell}${unread ? '<i class="dot"></i>' : ''}</button>
        <button data-a="go" data-s="club" aria-label="Your club and manager">${avatarImg(G.avatar)}</button>
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
  return `<svg class="crest" width="${size}" height="${Math.round(size * 1.15)}" viewBox="0 0 40 46" aria-hidden="true"><path d="M20 1.5 37.5 6v16c0 12-8 19-17.5 22.5C10.5 41 2.5 34 2.5 22V6z" fill="${c.c1}" stroke="${c.c2}" stroke-width="2.5"/><path d="M8 9h24" stroke="${c.c2}" stroke-width="2" opacity=".55"/><text x="20" y="28" text-anchor="middle" font-size="${code.length > 2 ? 11.5 : 13}" font-weight="800" fill="${txt}" font-family="Plus Jakarta Sans, sans-serif">${code}</text></svg>`;
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
const HEX_OUT = [['Attacking', ['fin', 'cro', 'cmp']], ['Technical', ['pas', 'fir', 'dri']], ['Speed', ['pac', 'agi']], ['Physical', ['str', 'sta', 'hea']], ['Defending', ['tck', 'mar', 'pos']], ['Mental', ['vis', 'dec', 'wor', 'ldr']]];
const HEX_GK = [['Shot stopping', ['ref', 'agi']], ['Handling', ['han']], ['One on ones', ['one']], ['Distribution', ['kic']], ['Positioning', ['pos', 'cmp']], ['Mental', ['dec', 'ldr', 'wor']]];
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
  if (fx && !played(fx)) { simUpTo(fx, false); G.day = fx.d ?? 5; saveGame(); return go('prematch'); }
  const r = advanceWeek();
  if (r === 'sacked') return go('home');
  if (r === 'season') return go('review');
  const nx = userFixture();
  if (nx && !played(nx)) toast('Matchday: ' + clubName(nx.h) + ' v ' + clubName(nx.a));
  else toast(phaseLabel() + ' · ' + fmtDate(today(), false));
  go('home');
};

function boot() {
  loadGame();
  if (G) UI.s = 'home';
  render(true);
}
window.addEventListener('DOMContentLoaded', boot);
