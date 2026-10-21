'use strict';
/* View history only. Never replay actions or restore the game state. Browser
   entries contain small IDs; popup renderers and drafts stay on this device. */
const VIEW_HISTORY = { ready: false, restoring: false, depth: 0, index: 0, views: new Map(), session: '', world: null, season: null, club: null, pending: false };
const viewCopy = v => JSON.parse(JSON.stringify(v));
const viewKey = (state, popup, admin) => JSON.stringify([state.s, state.p, state.tab, state.f, state.search, popup && popup.key, admin]);

function viewSnapshot() {
  const state = {};
  Object.keys(UI).filter(k => k !== 'sheetOpts' && k !== 'popup').forEach(k => { if (UI[k] !== undefined) state[k] = viewCopy(UI[k]); });
  const layer = document.getElementById('layer');
  const popup = layer && !layer.hidden ? UI.popup : null;
  const admin = { club: ADM.club, q: ADM.q, qClub: ADM.qClub };
  const key = viewKey(UI, popup, admin);
  const fields = [...document.querySelectorAll('#app input, #app select, #app textarea, #layer input, #layer select, #layer textarea')]
    .filter(el => el.id && el.type !== 'password' && !/key|token|secret/i.test(el.id))
    .map(el => ({ id: el.id, value: el.value, checked: el.checked }));
  return { key, state, popup, opts: UI.sheetOpts, admin, fields,
    mainScroll: document.querySelector('.main')?.scrollTop || 0,
    sheetScroll: layer?.querySelector('.sheet')?.scrollTop || 0,
    bodyScroll: window.scrollY, liveFid: UI.s === 'match' && LIVE ? LIVE.fid : null };
}

function viewEntry(index) { return { futbolView: VIEW_HISTORY.session, index }; }

function initViewHistory() {
  const H = VIEW_HISTORY;
  H.session = Date.now().toString(36) + Math.random().toString(36).slice(2);
  H.world = G; H.season = G?.season; H.club = G?.club;
  const current = viewSnapshot();
  const title = { ...current, state: { ...current.state, s: 'title', p: {} }, popup: null, opts: null, fields: [], mainScroll: 0, sheetScroll: 0, bodyScroll: 0, liveFid: null };
  title.key = viewKey(title.state, null, title.admin);
  H.index = UI.s === 'title' ? 0 : 1; H.views.clear(); H.views.set(0, title);
  if (H.index) H.views.set(1, current);
  // One same-document guard below the first view keeps ordinary Back in-game.
  history.replaceState(viewEntry(-1), '');
  history.pushState(viewEntry(0), '');
  if (H.index) history.pushState(viewEntry(1), '');
  H.ready = true; H.pending = false;
}

function rememberView() {
  const H = VIEW_HISTORY;
  if (!H.ready || H.restoring) return;
  const now = viewSnapshot(), old = H.views.get(H.index);
  if (old && old.key === now.key) H.views.set(H.index, now);
}

function syncViewHistory() {
  const H = VIEW_HISTORY;
  if (!H.ready || H.restoring || H.depth) return;
  // Careers, seasons and job changes must not expose obsolete popups.
  if (H.world !== G || H.season !== G?.season || H.club !== G?.club) return initViewHistory();
  const now = viewSnapshot(), old = H.views.get(H.index);
  if (old && old.key === now.key) { H.views.set(H.index, now); return; }
  for (const i of H.views.keys()) if (i > H.index) H.views.delete(i);
  H.index++;
  H.views.set(H.index, now);
  history.pushState(viewEntry(H.index), '');
}

function viewAction(run) {
  const H = VIEW_HISTORY;
  if (!H.ready || H.restoring) return run();
  if (!H.depth) rememberView();
  H.depth++;
  try { return run(); } finally { H.depth--; syncViewHistory(); }
}

function backView() {
  const H = VIEW_HISTORY;
  if (!H.ready || H.pending) return;
  rememberView();
  if (H.index === 0) return; // Already at the first game view.
  H.pending = true;
  history.back();
}

// X dismisses the entire popup chain; Back still visits one view at a time.
function dismissPopup() {
  const H = VIEW_HISTORY;
  if (document.getElementById('layer').hidden || H.pending) return;
  rememberView();
  let target = H.index;
  while (target > 0 && H.views.get(target)?.popup) target--;
  if (H.ready && target < H.index) {
    H.pending = true;
    history.go(target - H.index);
    return;
  }
  viewAction(() => { const opts = UI.sheetOpts; hideSheet(); if (opts?.onClose) opts.onClose(); });
}

function restoreView(view) {
  const H = VIEW_HISTORY;
  H.restoring = true;
  try {
    const opts = UI.sheetOpts, oldPopup = UI.popup;
    hideSheet();
    if (oldPopup && oldPopup.key !== view.popup?.key && opts?.onClose) opts.onClose();
    if (UI.s === 'match' && view.state.s !== 'match') stopLive();
    const negotiation = UI.con;
    Object.keys(UI).filter(k => k !== 'sheetOpts' && k !== 'popup').forEach(k => { delete UI[k]; });
    Object.assign(UI, viewCopy(view.state));
    if (negotiation && UI.con && negotiation.pid === UI.con.pid && negotiation.mode === UI.con.mode) UI.con.tries = Math.max(UI.con.tries, negotiation.tries);
    Object.assign(ADM, view.admin);
    // A finished match can be revisited as a report, never kicked off again.
    if (UI.s === 'match' && (!LIVE || LIVE.fid !== view.liveFid || LIVE.G !== G)) {
      const fx = G?.fixtures.find(f => f.id === view.liveFid);
      if (!liveFromSave(fx)) { UI.s = fx && played(fx) ? 'post' : 'prematch'; UI.p = fx ? { fid: fx.id } : {}; }
    }
    render(true);
    if (view.popup && (!view.popup.valid || view.popup.valid())) {
      view.popup.restore();
      // Some live sheets set their close callback after rendering.
      UI.sheetOpts = view.opts;
      if (UI.s === 'match' && UI.popup?.key === 'live:subs' && LIVE) { LIVE.paused = true; updateBoard(LIVE); }
    }
    view.fields.forEach(f => {
      const el = document.getElementById(f.id);
      if (el && !el.readOnly) { el.value = f.value; if (el.type === 'checkbox' || el.type === 'radio') el.checked = f.checked; }
    });
    const main = document.querySelector('.main'), popup = document.querySelector('#layer .sheet');
    if (main) main.scrollTop = view.mainScroll;
    if (popup) popup.scrollTop = view.sheetScroll;
    window.scrollTo(0, view.bodyScroll);
  } finally { H.restoring = false; }
}

window.addEventListener('popstate', e => {
  const H = VIEW_HISTORY;
  if (!H.ready) return;
  H.pending = false;
  const target = e.state;
  if (target?.futbolView !== H.session || target.index < 0 || !H.views.has(target.index)) {
    // The root guard was reached (also after reloading or changing careers).
    history.pushState(viewEntry(H.index), '');
    return;
  }
  rememberView();
  H.index = target.index;
  restoreView(H.views.get(H.index));
});

// Scroll and unsubmitted form text must be remembered before native Back fires.
document.addEventListener('scroll', rememberView, true);
document.addEventListener('input', rememberView);
