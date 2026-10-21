'use strict';
/* ===== live.js =====
   The 2D match: the engine's own positions (M.frames, recorded every half second by sim.js) drawn on a
   pitch with a camera that follows the ball, highlight levels (key, extended, full), commentary, team talks,
   touchline shouts, in-match tactics and substitutions.
   The match in progress is kept in the save (G.live) every minute, so leaving the screen, refreshing,
   or saving and loading resumes it at the same minute instead of restarting it. */

// Playback speed: seconds of football per real second at 1x, 2x and 4x.
const SPEED_RATE = { 1: 2, 2: 4, 4: 8 };
// Highlight levels: what is shown of each minute (the rest is skipped, the clock runs on).
const HL = { key: 'Key', ext: 'Extended', full: 'Full' };
const HL_MARKS = {
  key: { goal: [12, 4], shot: [10, 3], pen: [6, 14], card: [6, 4], offside: [6, 3] },
  ext: { goal: [14, 4], shot: [12, 3], pen: [6, 14], card: [6, 4], offside: [6, 3], corner: [2, 12], fk: [2, 10], attack: [5, 9], chance: [7, 4] },
};
let LIVE = null;

function newLive(M, fid) {
  const bottom = M.sides[0].user ? 0 : 1;
  M.live = true;
  M.onAsync = evs => evs.forEach(e => { if (LIVE && LIVE.M === M) pushFeed(LIVE, e.t === 'sub' ? 'info' : 'tac', commLine(LIVE, e), e.side); });
  LIVE = { M, G, fid, bottom, mq: null, t: 0, last: 0, paused: false, hold: 0, dots: [[], []], ball: { x: PW / 2, y: PL / 2, z: 0 }, own: [-1, -1], disp: [M.sides[0].st.g, M.sides[1].st.g], feed: [], overlay: null, done: false, raf: 0, cv: null, ctx: null, W: 0, H: 0, subSel: null, colors: null, line: null, cam: { x: PW / 2, y: PL / 2, s: 0 } };
  LIVE.colors = kitColors(M.sides[bottom].cid, M.sides[1 - bottom].cid);
  return LIVE;
}
// The live match for this fixture is still on screen (and belongs to the loaded save).
const liveOn = fx => !!(fx && LIVE && !LIVE.done && LIVE.fid === fx.id && LIVE.G === G);
function startLive(fx) {
  if (liveOn(fx) || liveFromSave(fx)) return go('match');
  newLive(createMatch(fx), fx.id);
  pushFeed(LIVE, 'info', `Kick-off at ${G.clubs[fx.h].ground}. ${clubName(fx.h)} v ${clubName(fx.a)}.`);
  go('match');
}
// Keep the match in the save. Called between minutes, when the screen is left and when the page is hidden.
function liveKeep(L = LIVE) {
  if (!L || L.done || L.G !== G || !G) return;
  const fr = L.M.frames; L.M.frames = null; // frames of the minute on screen are not needed to resume
  G.live = { fid: L.fid, M: L.M, feed: L.feed.slice(0, 8).map(f => ({ k: f.k, txt: f.txt, min: f.min, side: f.side, at: 0 })) };
  saveGame();
  L.M.frames = fr;
}
// Pick the match up from the save at the minute it reached. It waits paused until Play.
function liveFromSave(fx) {
  const K = G && G.live;
  if (!K || !fx || K.fid !== fx.id || !K.M) return false;
  if (played(fx)) { G.live = null; return false; }
  if (liveOn(fx)) return true;
  const L = newLive(K.M, fx.id), M = L.M;
  L.disp = [M.sides[0].st.g, M.sides[1].st.g];
  L.feed = K.feed || []; L.paused = !M.ended;
  pushFeed(L, 'info', `Match resumed at ${M.min}'. Press Play to carry on.`);
  return true;
}
window.addEventListener('pagehide', () => liveKeep());
document.addEventListener('visibilitychange', () => { if (document.hidden) liveKeep(); });

function hexRgb(h) { const n = parseInt(h.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; }
const colDist = (a, b) => { const x = hexRgb(a), y = hexRgb(b); return Math.hypot(x[0] - y[0], x[1] - y[1], x[2] - y[2]); };
const isLight = h => { const [r, g, b] = hexRgb(h); return r * 0.299 + g * 0.587 + b * 0.114 > 150; };

// Bottom = user. Avoid kits that look alike.
function kitColors(uid, oid) {
  const u = G.clubs[uid], o = G.clubs[oid];
  let of = o.c1, os = o.c2;
  if (colDist(u.c1, of) < 120) { of = o.c2; os = o.c1; }
  if (colDist(u.c1, of) < 120) { of = isLight(u.c1) ? '#1E2A33' : '#F1F1F1'; os = isLight(of) ? '#1E2A33' : '#F1F1F1'; }
  return [{ f: u.c1, s: u.c2, gk: '#F4D35E' }, { f: of, s: os, gk: '#9AD1D4' }];
}

/* ---------- screen and camera ----------
   Your side always attacks upwards. The camera follows the ball (G.settings.cam 'follow', about 60 m of the
   pitch in view, with a mini-map) or shows the whole pitch ('full'). */
const view = (L, X, Y) => (L.bottom === 0 ? [X, Y] : [PW - X, PL - Y]);
function camScale(L) { return (G.settings.cam || 'follow') === 'full' ? Math.min((L.W - 16) / PW, (L.H - 16) / PL) : L.H / 60; }
const sx = (L, vx) => L.W / 2 + (vx - L.cam.x) * L.cam.s;
const sy = (L, vy) => L.H / 2 + (vy - L.cam.y) * L.cam.s;
function moveCam(L, dt, snap) {
  const s = camScale(L), full = (G.settings.cam || 'follow') === 'full';
  const [bx, by] = view(L, L.ball.x, L.ball.y), hw = L.W / 2 / s, hh = L.H / 2 / s;
  let tx = full ? PW / 2 : clamp(bx, Math.min(PW / 2, hw - 3), Math.max(PW / 2, PW + 3 - hw)), ty = full ? PL / 2 : clamp(by, Math.min(PL / 2, hh - 4), Math.max(PL / 2, PL + 4 - hh));
  const k = snap ? 1 : Math.min(1, dt / 320);
  L.cam.x += (tx - L.cam.x) * k; L.cam.y += (ty - L.cam.y) * k; L.cam.s += (s - L.cam.s) * (snap || !L.cam.s ? 1 : Math.min(1, dt / 200));
  if (!full) { const mx = hw * 0.8, my = hh * 0.8; L.cam.x = clamp(L.cam.x, bx - mx, bx + mx); L.cam.y = clamp(L.cam.y, by - my, by + my); } // fast balls never leave the screen
}

function bindLive() {
  const L = LIVE;
  if (!L) return;
  const cv = document.getElementById('pitch');
  if (!cv || UI.s !== 'match') return;
  const wrap = cv.parentElement, dpr = window.devicePixelRatio || 1;
  const W = wrap.clientWidth, H = Math.max(200, wrap.clientHeight);
  cv.style.width = W + 'px'; cv.style.height = H + 'px';
  cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
  cv.onclick = e => {
    const rc = cv.getBoundingClientRect(), px = e.clientX - rc.left, py = e.clientY - rc.top;
    let best = null, bd = Math.max(16, L.cam.s * 2.5);
    [0, 1].forEach(si => L.dots[si].forEach((d, i) => { if (!d || !L.M.sides[si].on[i]) return; const [vx, vy] = view(L, d.x, d.y), dd = Math.hypot(sx(L, vx) - px, sy(L, vy) - py); if (dd < bd) { bd = dd; best = [si, i]; } }));
    if (best) { L.sel = best; L.selId = L.M.sides[best[0]].on[best[1]]; openLiveSheet('pl'); }
  };
  L.cv = cv; L.ctx = cv.getContext('2d'); L.ctx.setTransform(dpr, 0, 0, dpr, 0, 0); L.W = W; L.H = H;
  if (!L.dots[0].length) placeFromSim(L);
  moveCam(L, 0, true);
  updateBoard(L);
  renderFeed(L);
  if (!L.raf) { L.last = 0; L.raf = requestAnimationFrame(liveFrame); }
}
// Before the first minute (or after resuming): where the engine has everyone now.
function placeFromSim(L) {
  const sim = L.M.sim;
  if (!sim) { if (typeof simInit === 'function') simInit(L.M); }
  const P = L.M.sim.P;
  L.dots = [0, 1].map(s => P[s].map(p => (p ? { x: p.x, y: p.y } : null)));
  Object.assign(L.ball, { x: L.M.sim.B.x, y: L.M.sim.B.y, z: 0 });
}

function stopLive() { if (LIVE && LIVE.raf) cancelAnimationFrame(LIVE.raf); if (LIVE) { LIVE.raf = 0; liveKeep(LIVE); } }

function liveFrame(ts) {
  const L = LIVE;
  if (!L || !L.cv || !document.body.contains(L.cv)) { if (L) L.raf = 0; return; }
  const dt = Math.min(64, ts - (L.last || ts));
  L.last = ts; L.t += dt;
  if (!L.paused) {
    if (L.hold > 0) L.hold -= dt;
    else if (L.mq) playMinuteView(L, dt);
    else if (!L.M.ended) liveStep(L);
    else if (!L.done) onFullTime(L);
  }
  if (L.overlay) { L.overlay.t -= dt; if (L.overlay.t <= 0 && !L.overlay.stay) L.overlay = null; }
  moveCam(L, dt);
  draw(L);
  L.raf = requestAnimationFrame(liveFrame);
}

// The next minute: the engine plays it, then the screen shows it (or the highlights of it).
function liveStep(L) {
  liveKeep(L); // everything up to this minute has been shown
  const evs = stepMatch(L.M, false), M = L.M, fr = M.frames || [];
  const t0 = fr.length ? fr[0][0] - TICK : 0;
  const timed = evs.filter(e => e.tt != null).sort((a, b) => a.tt - b.tt), now = evs.filter(e => e.tt == null && e.t !== 'poss');
  L.mq = { min: M.min, fr, t0, p: 0, ev: timed, ei: 0, segs: segments(M.marks || [], t0), skip: 0, main: evs[0], marks: (M.marks || []).slice(), mi: 0 };
  now.forEach(e => pushFeed(L, e.t === 'inj' ? 'inj' : e.t === 'sub' ? 'info' : 'tac', commLine(L, e), e.side));
  updateBoard(L);
  if (UI.popup && UI.popup.key === 'live:pl') { const b = document.querySelector('#layer .sh-body'), h = plCardHtml(L); if (b && h) b.innerHTML = h; }
}
// Parts of the minute to show, by highlight level: [from, to] in seconds of the minute.
function segments(marks, t0) {
  const hl = G.settings.hl || 'ext';
  if (hl === 'full') return [[0, 60]];
  const W = HL_MARKS[hl], out = [];
  marks.forEach(m => { const w = W[m.k]; if (w && !(m.k === 'shot' && hl === 'key' && (m.xg || 0) < 0.05)) out.push([Math.max(0, m.t - t0 - w[0]), Math.min(60, m.t - t0 + w[1])]); });
  out.sort((a, b) => a[0] - b[0]);
  const merged = [];
  out.forEach(s => { const l = merged[merged.length - 1]; if (l && s[0] <= l[1] + 1) l[1] = Math.max(l[1], s[1]); else merged.push(s.slice()); });
  return merged;
}
// Play the minute: inside a highlight the frames run at the chosen speed; between highlights the clock jumps on.
function playMinuteView(L, dt) {
  const q = L.mq, inSeg = q.segs.find(s => q.p >= s[0] && q.p < s[1]);
  if (inSeg) q.p = Math.min(inSeg[1], q.p + dt / 1000 * (SPEED_RATE[G.settings.speed] || 4));
  else {
    q.skip += dt;
    if (q.skip < 90) return;
    q.skip = 0;
    const nx = q.segs.find(s => s[0] > q.p);
    q.p = nx ? nx[0] : 60;
    if (nx) { setFrame(L, q.p, true); } // cut to the start of the next highlight
  }
  setFrame(L, q.p);
  // Commentary and big moments as their time comes.
  while (q.ei < q.ev.length && q.ev[q.ei].tt <= q.p) liveEvent(L, q.ev[q.ei++]);
  while (q.mi < q.marks.length && q.marks[q.mi].t - q.t0 <= q.p) liveMark(L, q.marks[q.mi++]);
  if (q.p >= 60) endMinute(L);
}
// Positions at second p of the minute, between the two nearest frames.
function setFrame(L, p, snap) {
  const q = L.mq, fr = q.fr;
  if (!fr.length) return;
  const t = q.t0 + p;
  let k = Math.min(fr.length - 1, Math.max(0, Math.floor((t - fr[0][0]) / TICK)));
  while (k > 0 && fr[k][0] > t) k--;
  const a = fr[k], b = fr[Math.min(fr.length - 1, k + 1)], u = b[0] > a[0] ? clamp((t - a[0]) / (b[0] - a[0]), 0, 1) : 0;
  const lerp = (i) => (a[i] == null ? null : b[i] == null ? a[i] : a[i] + (b[i] - a[i]) * u);
  L.ball.x = lerp(1); L.ball.y = lerp(2); L.ball.z = lerp(3); L.own = [a[4], a[5]]; L.rs = a[6];
  for (let s = 0; s < 2; s++) for (let i = 0; i < 11; i++) {
    const x = lerp(7 + (s * 11 + i) * 2), y = lerp(8 + (s * 11 + i) * 2);
    L.dots[s][i] = x == null ? null : { x, y };
  }
  if (snap) moveCam(L, 0, true);
}
function liveEvent(L, e) {
  const M = L.M;
  if (e.t === 'goal') {
    L.disp[e.side]++; updateBoard(L);
    pushFeed(L, 'goal', commLine(L, e), e.side);
    L.overlay = { big: e.pen ? 'PENALTY GOAL' : 'GOAL', small: pname(G.players[e.pid]) + ' ' + e.min + "'", t: 2200, side: e.side };
    L.hold = 1600;
    return;
  }
  if (e.t === 'yellow' || e.t === 'red') {
    pushFeed(L, e.t, commLine(L, e), e.fside);
    L.overlay = { big: e.t === 'red' ? 'RED CARD' : 'YELLOW', small: pname(G.players[e.pid]), t: 1200, card: e.t };
    L.hold = 600; return;
  }
  if (e.t === 'offside') {
    pushFeed(L, 'info', commLine(L, e), 1 - e.side);
    L.overlay = { big: 'OFFSIDE', small: pname(G.players[e.pid]), t: 1200, flag: true };
    L.line = e.line != null ? { y: e.line, until: L.t + 1600 } : null;
    L.hold = 500; return;
  }
  if (e.t === 'save' || e.t === 'miss' || e.t === 'shot') { const txt = commLine(L, e); if (txt) pushFeed(L, 'chance', txt, e.side); return; }
  if (e.t === 'foul') { if (e.pen) { pushFeed(L, 'info', `Penalty! ${pname(G.players[e.pid])} brings his man down.`, e.side); L.overlay = { big: 'PENALTY', small: clubName(M.sides[e.side].cid), t: 1400 }; } else if (R() < 0.35) pushFeed(L, 'info', commLine(L, e), e.fside); return; }
  if (e.t === 'inj') { pushFeed(L, 'inj', commLine(L, e), e.side); return; }
  const txt = commLine(L, e); if (txt) pushFeed(L, 'info', txt, e.side);
}
function liveMark(L, m) {
  const tn = 'The ' + clubName(L.M.sides[m.s].cid);
  if (m.k === 'corner') pushFeed(L, 'info', `Corner to ${tn.toLowerCase().replace('the ', 'the ')}.`, m.s);
  if (m.k === 'chance' && R() < 0.5) pushFeed(L, 'info', `${tn} are through on goal!`, m.s);
}
// The minute is over: half time, an injury to one of yours, or full time.
function endMinute(L) {
  const q = L.mq, M = L.M, main = q.main;
  L.mq = null;
  if (q.ev.length === 0 && R() < 0.05) pushFeed(L, 'info', fillerLine(L, { side: M.sim ? M.sim.poss : 0 }));
  const inj = q.ev.concat(main ? [main] : []).find(e => e.t === 'inj' && M.sides[e.side].user);
  if (inj) { L.paused = true; updateBoard(L); toast(`${pname(G.players[inj.pid])} is injured. Make a substitution.`); openLiveSheet('subs'); }
  if (main && main.ht) { L.overlay = { big: 'HALF TIME', small: L.disp.join(' - '), t: 1, stay: true }; L.paused = true; updateBoard(L); openTeamTalk(L); }
}
// Injury events from the engine have no time in the minute: shown at once.

/* ---------- drawing ---------- */
function draw(L) {
  const g = L.ctx, W = L.W, H = L.H, s = L.cam.s, X = vx => sx(L, vx), Y = vy => sy(L, vy);
  g.fillStyle = '#1E6F43'; g.fillRect(0, 0, W, H);
  for (let i = 0; i < 14; i++) { g.fillStyle = i % 2 ? '#24804F' : '#2A8A56'; const y0 = Y(i * PL / 14), y1 = Y((i + 1) * PL / 14); g.fillRect(X(-3), y0, (PW + 6) * s, y1 - y0 + 1); }
  g.strokeStyle = 'rgba(255,255,255,.7)'; g.lineWidth = Math.max(1, s * 0.12);
  g.strokeRect(X(0), Y(0), PW * s, PL * s);
  g.beginPath(); g.moveTo(X(0), Y(PL / 2)); g.lineTo(X(PW), Y(PL / 2)); g.stroke();
  g.beginPath(); g.arc(X(PW / 2), Y(PL / 2), 9.15 * s, 0, Math.PI * 2); g.stroke();
  [0, 1].forEach(end => {
    const y0 = end ? PL : 0, d = end ? -1 : 1;
    g.strokeRect(X(PW / 2 - 20.16), Y(y0), 40.32 * s, d * 16.5 * s);
    g.strokeRect(X(PW / 2 - 9.16), Y(y0), 18.32 * s, d * 5.5 * s);
    g.fillStyle = 'rgba(255,255,255,.8)'; g.beginPath(); g.arc(X(PW / 2), Y(y0 + d * 11), Math.max(1.2, s * 0.2), 0, Math.PI * 2); g.fill();
    g.beginPath(); g.arc(X(PW / 2), Y(y0 + d * 11), 9.15 * s, end ? Math.PI * 1.2 : Math.PI * 0.2, end ? Math.PI * 1.8 : Math.PI * 0.8); g.stroke();
    g.fillStyle = 'rgba(255,255,255,.25)'; g.fillRect(X(PW / 2 - 3.66), Y(y0), 7.32 * s, -d * 2 * s);
    g.strokeRect(X(PW / 2 - 3.66), Y(y0), 7.32 * s, -d * 2 * s);
  });
  if (L.line && L.t < L.line.until) { // offside line
    const [, vy] = view(L, 0, L.line.y);
    g.save(); g.strokeStyle = '#F2C14E'; g.lineWidth = 2; g.setLineDash([6, 4]); g.beginPath(); g.moveTo(X(0), Y(vy)); g.lineTo(X(PW), Y(vy)); g.stroke(); g.restore();
  }
  const r = Math.max(6, s * 1.05);
  g.textAlign = 'center'; g.textBaseline = 'middle';
  [1 - L.bottom, L.bottom].forEach(si => {
    const S = L.M.sides[si], col = L.colors[si === L.bottom ? 0 : 1];
    S.on.forEach((id, i) => {
      const d = L.dots[si][i]; if (!id || !d) return;
      const [vx, vy] = view(L, d.x, d.y), x = X(vx), y = Y(vy), gk = i === 0;
      if (x < -20 || x > W + 20 || y < -20 || y > H + 20) return;
      g.fillStyle = 'rgba(0,0,0,.25)'; g.beginPath(); g.ellipse(x, y + r * 0.7, r * 0.9, r * 0.35, 0, 0, Math.PI * 2); g.fill();
      g.fillStyle = gk ? col.gk : col.f; g.strokeStyle = gk ? '#1B1B1B' : col.s; g.lineWidth = 2;
      g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill(); g.stroke();
      if (L.own[0] === si && L.own[1] === i) { g.strokeStyle = '#2DE2EE'; g.lineWidth = 1.5; g.beginPath(); g.arc(x, y, r + 3, 0, Math.PI * 2); g.stroke(); }
      if (L.sel && L.sel[0] === si && L.sel[1] === i) { g.strokeStyle = '#FFFFFF'; g.lineWidth = 2; g.beginPath(); g.arc(x, y, r + 5, 0, Math.PI * 2); g.stroke(); }
      g.fillStyle = isLight(gk ? col.gk : col.f) ? '#111' : '#FFF';
      g.font = `700 ${Math.round(r * 1.05)}px "Plus Jakarta Sans", system-ui, sans-serif`;
      g.fillText(String(G.players[id] ? G.players[id].no : ''), x, y + 0.5);
      if (s > 7) { // names when zoomed in
        g.font = `600 ${Math.round(r * 0.72)}px "Plus Jakarta Sans", system-ui, sans-serif`; g.fillStyle = 'rgba(255,255,255,.88)';
        g.fillText(G.players[id] ? G.players[id].ln : '', x, y + r + r * 0.75);
      }
    });
  });
  // The ball, lifted by its height, with its shadow on the grass.
  const [bvx, bvy] = view(L, L.ball.x, L.ball.y), bx = X(bvx), by = Y(bvy), z = L.ball.z || 0, br = Math.max(3, s * 0.32) * (1 + z * 0.06);
  g.fillStyle = 'rgba(0,0,0,.35)'; g.beginPath(); g.ellipse(bx + 1.5, by + 1.5, br, br * 0.6, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#FFFFFF'; g.strokeStyle = '#1B1B1B'; g.lineWidth = 1;
  g.beginPath(); g.arc(bx, by - z * s * 0.55, br, 0, Math.PI * 2); g.fill(); g.stroke();
  if ((G.settings.cam || 'follow') === 'follow') miniMap(L);
  if (L.overlay) {
    const o = L.overlay;
    g.fillStyle = 'rgba(34,8,47,.7)'; g.fillRect(0, H / 2 - 44, W, 88);
    g.fillStyle = o.card === 'red' ? '#F0605D' : o.card === 'yellow' || o.flag ? '#F2C14E' : '#2DE2EE';
    g.font = `800 ${Math.round(W * 0.11)}px "Plus Jakarta Sans", system-ui, sans-serif`;
    g.fillText(o.big, W / 2, H / 2 - 8);
    g.fillStyle = '#EAF2EE'; g.font = `600 ${Math.round(W * 0.045)}px "Plus Jakarta Sans", system-ui, sans-serif`;
    g.fillText(o.small || '', W / 2, H / 2 + 26);
  }
}
// The whole pitch in a corner, with the area the camera shows.
function miniMap(L) {
  const g = L.ctx, w = Math.round(L.W * 0.2), h = Math.round(w * PL / PW), x0 = L.W - w - 8, y0 = 8, k = w / PW;
  g.fillStyle = 'rgba(10,30,18,.72)'; g.fillRect(x0, y0, w, h);
  g.strokeStyle = 'rgba(255,255,255,.5)'; g.lineWidth = 1; g.strokeRect(x0, y0, w, h);
  g.beginPath(); g.moveTo(x0, y0 + h / 2); g.lineTo(x0 + w, y0 + h / 2); g.stroke();
  [L.bottom, 1 - L.bottom].forEach(si => {
    g.fillStyle = L.colors[si === L.bottom ? 0 : 1].f;
    L.dots[si].forEach(d => { if (!d) return; const [vx, vy] = view(L, d.x, d.y); g.fillRect(x0 + vx * k - 1.5, y0 + vy * k - 1.5, 3, 3); });
  });
  const [bvx, bvy] = view(L, L.ball.x, L.ball.y);
  g.fillStyle = '#FFF'; g.beginPath(); g.arc(x0 + bvx * k, y0 + bvy * k, 2, 0, Math.PI * 2); g.fill();
  const s = L.cam.s, hw = L.W / 2 / s, hh = L.H / 2 / s;
  g.strokeStyle = 'rgba(45,226,238,.8)'; g.strokeRect(x0 + (L.cam.x - hw) * k, y0 + (L.cam.y - hh) * k, hw * 2 * k, hh * 2 * k);
}

function updateBoard(L) {
  const el = id => document.getElementById(id);
  if (!el('sbScore')) return;
  const M = L.M, [H, W] = M.sides;
  el('sbScore').textContent = L.disp[0] + ' - ' + L.disp[1];
  const mn = L.mq ? L.mq.min : M.min;
  el('sbClock').textContent = L.done ? 'FT' : (mn > 90 ? '90+' + (mn - 90) : String(mn)) + "'";
  const tot = H.st.pos + W.st.pos || 1;
  el('sbPoss').style.width = Math.round((H.st.pos / tot) * 100) + '%';
  el('sbPossTxt').textContent = Math.round((H.st.pos / tot) * 100) + '% possession ' + Math.round((W.st.pos / tot) * 100) + '%';
  const pb = el('btnPause'); if (pb) pb.textContent = L.paused ? 'Play' : 'Pause';
  const sp = el('btnSpeed'); if (sp) sp.textContent = G.settings.speed + 'x';
  const hl = el('btnHl'); if (hl) hl.textContent = HL[G.settings.hl || 'ext'];
  const cm = el('btnCam'); if (cm) cm.textContent = (G.settings.cam || 'follow') === 'full' ? 'Full pitch' : 'Follow';
  const ft = el('ftBar'); if (ft) ft.hidden = !L.done;
}

// Commentary: the newest line is a full-width bar in the colour of the team it is about; a goal flashes.
function pushFeed(L, k, txt, side) {
  if (!txt) return;
  const M = L.M;
  L.feed.unshift({ k, txt, min: M.min, side: side == null ? null : side, at: performance.now() });
  if (L.feed.length > 40) L.feed.length = 40;
  renderFeed(L);
}
function feedColor(L, side) {
  if (side == null || !L.colors) return null;
  const c = L.colors[side === L.bottom ? 0 : 1].f;
  return { bg: c, fg: isLight(c) ? '#10061A' : '#FFFFFF' };
}
function renderFeed(L) {
  const el = document.getElementById('feed');
  if (!el) return;
  el.innerHTML = L.feed.slice(0, 4).map((f, i) => {
    const c = feedColor(L, f.side);
    const style = c ? (i === 0 ? `style="--tc:${c.bg};--tf:${c.fg}"` : `style="--tc:${c.bg}"`) : '';
    const blink = i === 0 && f.k === 'goal' && performance.now() - f.at < 4000 ? ' blink' : '';
    return `<li class="fd-${f.k}${i === 0 ? ' fd-main' : ''}${c ? ' tc' : ''}${blink}" ${style}><b>${f.min ? f.min + "'" : ''}</b><span>${esc(f.txt)}</span></li>`;
  }).join('');
  linkEntities(el);
}
function commLine(L, ev) {
  const M = L.M, S = M.sides[ev.side], O = M.sides[1 - ev.side], n = id => pname(G.players[id]);
  const tn = 'the ' + clubName(S.cid);
  const fk = ev.fk ? 'Free kick. ' : ev.ck ? 'Corner. ' : '';
  switch (ev.t) {
    case 'goal': return ev.pen ? `Penalty to ${tn}. ${n(ev.pid)} sends the keeper the wrong way. ${L.disp.join('-')}.` : `${fk}${n(ev.pid)} scores for ${tn}${ev.aid ? ', set up by ' + n(ev.aid) : ''}. ${L.disp.join('-')}.`;
    case 'shot': return `${n(ev.pid)} ${ev.sp ? 'rises to head it' : 'lets fly'}...`;
    case 'save': return `${fk}${n(ev.pid)} forces a save from ${O.on[0] ? n(O.on[0]) : 'the keeper'}.${ev.corner ? ' Corner.' : ''}`;
    case 'miss':
      if (ev.block) return `${fk}${n(ev.pid)} ${pick(['has a shot blocked', 'sees his shot charged down', 'shoots straight into a defender'])}.${ev.corner ? ' Corner.' : ''}`;
      if (ev.corner) return `${fk}${n(ev.pid)}${ev.sp ? "'s header" : "'s shot"} ${pick(['takes a deflection and goes behind', 'is turned behind by a defender'])}. Corner.`;
      return ev.sp ? `${fk}${n(ev.pid)} ${pick(['heads over', 'heads wide', 'cannot keep his header down'])}.` : `${fk}${n(ev.pid)} ${pick(['drags a shot wide', 'fires over the bar', 'curls it just past the post', 'blazes over'])}.`;
    case 'yellow': return `Yellow card for ${n(ev.pid)} (${clubName(M.sides[ev.fside].cid)}).`;
    case 'red': return ev.second ? `Second yellow for ${n(ev.pid)}. Off he goes.` : `Straight red card for ${n(ev.pid)}.`;
    case 'foul': return `Foul by ${n(ev.pid)}. Free kick to ${tn}.`;
    case 'offside': return `Flag up. ${n(ev.pid)} ${pick(['is offside, timing his run too early', 'is caught offside', 'strays beyond the last defender', 'has gone too soon. Offside'])}.`;
    case 'inj': return `${n(ev.pid)} is down with a suspected ${ev.inj.toLowerCase()}.`;
    case 'tac': return `The ${clubName(S.cid)} ${MGR_SAY[ev.opt] || 'change their approach'}.`;
    case 'sub': return `Substitution, ${clubName(S.cid)}: ${n(ev.pid)} on, ${n(ev.out)} off.`;
    default: return '';
  }
}

function fillerLine(L, ev) {
  const t = 'The ' + clubName(L.M.sides[ev.side].cid);
  return pick([`${t} keep the ball in midfield.`, `${t} build patiently from the back.`, `${t} work it out to the flank.`, `Neat passing from ${t.toLowerCase()}.`, `${t} probe for an opening.`]);
}

function talkEffect(k, diff) {
  switch (k) {
    case 'praise': return diff > 0 ? 6 : diff === 0 ? 1 : -4;
    case 'enc': return 3;
    case 'demand': return diff < 0 ? 4 : diff === 0 ? 2 : -1;
    case 'calm': return diff > 1 ? 4 : diff > 0 ? 2 : 0;
    case 'hair': return diff < 0 ? (R() < 0.55 ? 8 : -6) : -5;
    default: return 0;
  }
}

function openTeamTalk(L) {
  const S = L.M.sides[L.bottom], O = L.M.sides[1 - L.bottom], diff = S.st.g - O.st.g;
  const acc = staffAvg('Assistant', 8);
  const scored = TEAM_TALKS.map(t => [t.k, talkEffect(t.k === 'hair' ? 'enc' : t.k, diff) + (R() * 20 > acc ? ri(-3, 3) : 0)]);
  const tip = scored.sort((a, b) => b[1] - a[1])[0][0];
  sheet(`<h3 class="sh-t">Half-time team talk</h3>
    <p class="muted">${clubName(S.cid)} ${S.st.g} - ${O.st.g} ${clubName(O.cid)}. Assistant suggests: <b>${TEAM_TALKS.find(t => t.k === tip).n}</b>.</p>
    <div class="list">${TEAM_TALKS.map(t => `<button class="row act" data-a="talk" data-k="${t.k}"><span class="grow"><b>${t.n}</b><small>${t.d}</small></span><span class="chev">›</span></button>`).join('')}</div>`, { key: 'live:halftime', restore: () => openTeamTalk(L), valid: () => LIVE === L && !L.done && L.M.min === 45 && !!L.overlay?.stay, onClose: () => { if (LIVE && LIVE.overlay && LIVE.overlay.stay) { LIVE.overlay = null; LIVE.paused = false; updateBoard(LIVE); } } });
}

function applyTalk(k) {
  const L = LIVE, S = L.M.sides[L.bottom], O = L.M.sides[1 - L.bottom];
  const eff = talkEffect(k, S.st.g - O.st.g);
  S.played.forEach(id => { const p = G.players[id]; p.mor = clamp(p.mor + eff + ri(-2, 2), 0, 100); });
  L.M.dirty = true;
  pushFeed(L, 'info', eff > 2 ? 'The players respond well to the team talk.' : eff < 0 ? 'The team talk does not go down well.' : 'The players take the message on board.', L.bottom);
  closeSheet();
  L.overlay = null; L.paused = false; updateBoard(L);
}

function applyShout(k) {
  const L = LIVE, M = L.M, S = M.sides[L.bottom], O = M.sides[1 - L.bottom];
  if (M.shout) return toast(`Wait until the ${M.shout.until}th minute for the next shout.`);
  const diff = S.st.g - O.st.g;
  const all = d => S.on.forEach(id => { if (id) G.players[id].mor = clamp(G.players[id].mor + d, 0, 100); });
  if (k === 'enc') all(2);
  if (k === 'demand') all(diff < 0 ? 4 : -2);
  if (k === 'fire') S.boost = 0.06;
  if (k === 'focus') S.guard = 0.06;
  if (k === 'calm') S.calm = 0.4;
  M.shout = { side: L.bottom, until: M.min + 10, k };
  M.dirty = true;
  pushFeed(L, 'info', `${G.manager} on the touchline: ${SHOUTS.find(s => s.k === k).n}.`, L.bottom);
  closeSheet();
}

function liveInstant() {
  const L = LIVE, M = L.M;
  while (!M.ended) stepMatch(M, true);
  L.mq = null; L.hold = 0; L.paused = false;
  L.disp = [M.sides[0].st.g, M.sides[1].st.g];
  closeSheet();
  onFullTime(L);
}

function onFullTime(L) {
  L.done = true;
  if (G.live && G.live.fid === L.fid) G.live = null;
  finishMatch(L.M);
  finishRound();
  L.overlay = { big: 'FULL TIME', small: clubName(L.M.sides[0].cid) + ' ' + L.disp.join(' - ') + ' ' + clubName(L.M.sides[1].cid), t: 1, stay: true };
  pushFeed(L, 'info', 'The referee blows for full time.');
  updateBoard(L);
}

// The live player card (tap a player on the pitch). Refreshed every minute while open.
function plCardHtml(L) {
  const id = L.selId, si = L.M.sides.findIndex(X => X.on.includes(id) || X.off.includes(id) || X.reds.includes(id));
  const X = L.M.sides[si], p = G.players[id];
  if (!p || !X) return '';
  const i = X.on.indexOf(id), pos = i >= 0 ? FORMATIONS[X.ip][i][0] : p.pos, s = X.ps[id] || {}, rt = X.rat[id] ?? 6.5, cond = Math.round(X.cond[id] ?? p.cond);
  const mor = Math.round(liveMor(X, p)), sw = Math.round((X.mo && X.mo[id]) || 0), mine = X.user;
  const row = (l, v) => `<div class="kvrow"><span>${l}</span><b>${v}</b></div>`;
  return `<div class="phead"><div class="pnum" style="--k1:${(L.colors[si === L.bottom ? 0 : 1] || {}).f}">${p.no || '-'}</div>
      <div class="grow"><h3 class="sh-t">${esc(fullName(p))}</h3><p class="muted">${POS_NAME[pos]}${i >= 0 ? ' · ' + esc(roleName(X, i)) : X.off.includes(id) ? ' · substituted' : ' · sent off'} · ${esc(clubName(X.cid))}</p></div>
      <div class="pov"><small>Match rating</small><span class="ovr ${rt >= 7.5 ? 'o4' : rt >= 6.8 ? 'o3' : rt >= 6 ? 'o2' : 'o1'}">${rt.toFixed(1)}</span></div></div>
    <div class="meters"><div><small>Condition ${cond}%</small>${bar(cond, condClass(cond))}</div><div><small>Morale · ${morLabel(mor)} ${sw > 1 ? '↑' : sw < -1 ? '↓' : ''}</small>${bar(mor, morClass(mor))}</div><div><small>Sharpness</small>${bar(p.shp)}</div></div>
    <div class="card">${row('Passes', s.pa ? `${s.pc || 0}/${s.pa} (${Math.round((s.pc || 0) / s.pa * 100)}%)` : '0')}${row('Key passes', s.kp || 0)}${row('Dribbles', `${s.dw || 0}/${s.da || 0}`)}${row('Crosses', s.cr || 0)}
      ${row('Tackles / interceptions', `${s.tk || 0} / ${s.int || 0}`)}${row('Aerial duels won', s.aer || 0)}${row('Blocks', s.blk || 0)}
      ${row('Shots / on target', `${s.sh || 0} / ${s.sot || 0}`)}${pos === 'GK' ? row('Saves', s.sv || 0) : row('Offsides / fouls', `${s.off || 0} / ${s.fo || 0}`)}</div>
    ${sw <= -6 ? `<p class="note">His head has gone down after what has happened in the match. A shout or a substitution may help.</p>` : sw >= 6 ? `<p class="muted">Full of confidence after how the match is going.</p>` : ''}
    ${mine && i >= 0 ? `<div class="btns"><button class="btn" data-a="livePi" data-i="${i}">Player instructions</button><button class="btn" data-a="liveSubFor" data-id="${id}">Substitute</button></div>` : ''}`;
}

function openLiveSheet(kind) {
  const L = LIVE, M = L.M, S = M.sides[L.bottom], O = M.sides[1 - L.bottom];
  const opts = { key: 'live:' + kind, restore: () => openLiveSheet(kind), valid: () => LIVE === L && !L.done };
  if (kind === 'stats') {
    const [H, W] = M.sides, tot = H.st.pos + W.st.pos || 1;
    const row = (lbl, a, b) => `<div class="cmp"><b>${a}</b><span>${lbl}</span><b>${b}</b></div>`;
    const rat = X => X.played.map(id => [G.players[id], X.rat[id]]).sort((a, b) => b[1] - a[1]).map(([p, r]) => `<button class="row sm act" data-a="livePl" data-id="${p.id}"><span class="no">${p.no}</span><span class="grow">${esc(pname(p))}${X.off.includes(p.id) ? ' <small>off</small>' : ''}</span><span class="rt ${r >= 7.5 ? 'good' : r < 6 ? 'bad' : ''}">${r.toFixed(1)}</span></button>`).join('');
    sheet(`<h3 class="sh-t">Match stats</h3>
      <div class="cmp head"><b>${esc(clubName(H.cid))}</b><span></span><b>${esc(clubName(W.cid))}</b></div>
      ${row('Possession', Math.round(H.st.pos / tot * 100) + '%', Math.round(W.st.pos / tot * 100) + '%')}${row('Shots', H.st.sh, W.st.sh)}${row('On target', H.st.sot, W.st.sot)}${row('Expected goals', H.st.xg.toFixed(2), W.st.xg.toFixed(2))}${row('Passes', H.st.pc + '/' + H.st.pa, W.st.pc + '/' + W.st.pa)}${row('Pass accuracy', Math.round(H.st.pc / (H.st.pa || 1) * 100) + '%', Math.round(W.st.pc / (W.st.pa || 1) * 100) + '%')}${row('Corners', H.st.co, W.st.co)}${row('Offsides', H.st.off || 0, W.st.off || 0)}${row('Fouls', H.st.fo, W.st.fo)}${row('Yellow cards', H.st.yc, W.st.yc)}${row('Red cards', H.st.rc, W.st.rc)}
      <div class="two"><div><h4 class="lbl">${esc(clubName(H.cid))}</h4>${rat(H)}</div><div><h4 class="lbl">${esc(clubName(W.cid))}</h4>${rat(W)}</div></div>`, opts);
    return;
  }
  if (kind === 'shouts') {
    const active = M.shout ? `<p class="note">Active: ${SHOUTS.find(s => s.k === M.shout.k).n} until ${M.shout.until}'</p>` : '';
    sheet(`<h3 class="sh-t">Touchline shouts</h3>${active}<div class="list">${SHOUTS.map(s => `<button class="row act" data-a="shout" data-k="${s.k}" ${M.shout ? 'disabled' : ''}><span class="grow"><b>${s.n}</b><small>${s.d}</small></span><span class="chev">›</span></button>`).join('')}</div>`, opts);
    return;
  }
  if (kind === 'tactics') {
    sheet(`<h3 class="sh-t">In-match tactics</h3>
      <div class="field"><label>In possession</label>${selectHtml('lt-ip', Object.keys(FORMATIONS), S.ip, 'liveShape')}</div>
      <div class="field"><label>Out of possession</label>${selectHtml('lt-oop', Object.keys(FORMATIONS), S.oop, 'liveShape')}</div>
      <div class="field"><label>Tactical style</label><div class="chips">${Object.entries(STYLES).map(([k, s]) => `<button class="chip ${styleOf(S) === k ? 'on' : ''}" data-a="liveStyle" data-v="${k}">${s.n}</button>`).join('')}</div></div>
      ${INSTRUCTIONS.map(ins => `<div class="field"><label>${ins.n}</label><div class="seg">${ins.o.map((o, i) => `<button class="${S[ins.k] === i ? 'on' : ''}" data-a="liveIns" data-k="${ins.k}" data-v="${i}">${o}</button>`).join('')}</div></div>`).join('')}
      <h4 class="lbl">Player instructions</h4>
      <div class="list">${S.on.map((id, i) => { if (!id) return ''; const pos = FORMATIONS[S.ip][i][0], set = PLAYER_INS.filter(x => S.pi[i] && S.pi[i][x.k] != null && S.pi[i][x.k] !== 1); return `<button class="row act" data-a="livePi" data-i="${i}"><span class="pos">${pos}</span><span class="grow"><b>${esc(pname(G.players[id]))}</b><small>${esc(roleName(S, i))}${set.length ? ' · ' + set.map(x => x.o[S.pi[i][x.k]]).join(', ') : ''}</small></span><span class="chev">›</span></button>`; }).join('')}</div>
      <p class="muted">Changes apply to this match only. Your saved tactic stays as it is.</p>`, opts);
    return;
  }
  if (kind === 'pl') {
    const html = plCardHtml(L);
    if (html) sheet(html, { ...opts, onClose: () => { L.sel = null; } });
    return;
  }
  if (kind === 'pi') {
    const i = L.piSlot, id = S.on[i];
    if (!id) return openLiveSheet('tactics');
    const pos = FORMATIONS[S.ip][i][0], cur = S.pi[i] || {}, list = pos === 'GK' ? PLAYER_INS.filter(x => GK_INS.includes(x.k)) : PLAYER_INS;
    sheet(`<button class="link back" data-a="liveSheet" data-k="tactics">‹ In-match tactics</button>
      <h3 class="sh-t">${POS_NAME[pos]} <small>${esc(pname(G.players[id]))} · ${esc(roleName(S, i))}</small></h3>
      ${list.map(x => `<div class="field"><label>${x.n}</label><div class="seg">${x.o.map((o, v) => `<button class="${(cur[x.k] ?? 1) === v ? 'on' : ''}" data-a="livePiSet" data-k="${x.k}" data-v="${v}">${o}</button>`).join('')}</div></div>`).join('')}
      <p class="muted">Takes effect straight away, for this match only.</p>`, opts);
    return;
  }
  if (kind === 'subs') {
    const ip = FORMATIONS[S.ip];
    const on = S.on.map((id, i) => (id ? `<button class="row act ${L.subSel === id ? 'sel' : ''}" data-a="subOut" data-id="${id}"><span class="pos">${ip[i][0]}</span><span class="grow">${esc(pname(G.players[id]))}${S.injuries.some(x => x[0] === id) ? ' <em class="tag bad">INJ</em>' : ''}<small>Rating ${S.rat[id].toFixed(1)}</small></span>${condBar(S.cond[id])}</button>` : '')).join('');
    const bench = S.bench.map(id => { const p = G.players[id]; return `<button class="row act" data-a="subIn" data-id="${id}" ${L.subSel && canSub(M, S) ? '' : 'disabled'}><span class="pos">${p.pos}</span><span class="grow">${esc(pname(p))}<small>OVR ${p.ca}</small></span>${condBar(S.cond[id] ?? p.cond)}</button>`; }).join('');
    sheet(`<h3 class="sh-t">Substitutions <small>${5 - S.subs} left · ${Math.max(0, 3 - S.wins)} windows</small></h3>
      <p class="muted">${L.subSel ? 'Now pick a replacement from the bench.' : 'Pick a player to take off.'}</p>
      <h4 class="lbl">On the pitch</h4><div class="list">${on}</div>
      <h4 class="lbl">Bench</h4><div class="list">${bench || '<p class="muted">No substitutes left.</p>'}</div>`, opts);
  }
}
