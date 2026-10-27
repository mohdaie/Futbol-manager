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
  // Freeze this checkpoint before the next worker minute changes the live match.
  G.live = { fid: L.fid, matchView:L.matchView||'2d', formationPhase:L.formationPhase||'ip', M: structuredClone(cleanMatch(L.M)), feed: L.feed.slice(0, 8).map(f => ({ k: f.k, txt: f.txt, min: f.min, side: f.side, players: f.players || [], at: 0 })) };
  saveGame();
}
// Pick the match up from the save at the minute it reached. It waits paused until Play.
function liveFromSave(fx) {
  const K = G && G.live;
  if (!K || !fx || K.fid !== fx.id || !K.M) return false;
  if (played(fx)) { G.live = null; return false; }
  if (liveOn(fx)) return true;
  const L = newLive(K.M, fx.id), M = L.M;
  L.disp = [M.sides[0].st.g, M.sides[1].st.g];
  L.matchView=MATCH_VIEWS.some(([key])=>key===K.matchView)?K.matchView:'2d';L.formationPhase=K.formationPhase==='oop'?'oop':'ip';
  L.feed = K.feed || []; L.paused = !M.ended;
  pushFeed(L, 'info', `Match resumed at ${M.min}'. Press Play to carry on.`);
  return true;
}
window.addEventListener('pagehide', () => liveKeep());
document.addEventListener('visibilitychange', () => { if (document.hidden) liveKeep(); });

function hexRgb(h) { const n = parseInt(h.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; }
const colDist = (a, b) => { const x = hexRgb(a), y = hexRgb(b); return Math.hypot(x[0] - y[0], x[1] - y[1], x[2] - y[2]); };
const isLight = h => { const [r, g, b] = hexRgb(h); return r * 0.299 + g * 0.587 + b * 0.114 > 150; };

// Bottom = user. A kit must stand out from both colours of the other team's and from the grass: otherwise the
// second colour, otherwise the clearest alternative kit (red-and-white against red-and-white was unreadable).
const GRASS = '#2A8A56', KIT_ALT = ['#1E3A8A', '#F2C14E', '#111827', '#38BDF8', '#7C3AED', '#F97316', '#F1F1F1'];
const kitGap = (c, avoid) => Math.min(...avoid.map(a => colDist(c, a)));
function kitColors(uid, oid) {
  const u = G.clubs[uid], o = G.clubs[oid];
  let uf = u.c1, us = u.c2;
  if (colDist(uf, GRASS) < 110) { uf = u.c2; us = u.c1; }
  const avoid = [uf, us, GRASS];
  let of = o.c1, os = o.c2;
  if (kitGap(of, avoid) < 140) {
    if (kitGap(o.c2, avoid) >= 140) { of = o.c2; os = o.c1; }
    else { of = KIT_ALT.reduce((b, c) => (kitGap(c, avoid) > kitGap(b, avoid) ? c : b)); os = isLight(of) ? '#1E2A33' : '#F1F1F1'; }
  }
  return [{ f: uf, s: us, gk: '#F4D35E' }, { f: of, s: os, gk: '#9AD1D4' }];
}

/* ---------- screen and camera ----------
   The camera keeps one stadium orientation; teams change ends between halves. The camera follows the ball (G.settings.cam 'follow', about 60 m of the
   pitch in view, with a mini-map) or shows the whole pitch ('full'). */
const view = (L, X, Y) => (liveViewFlipped(L) ? [PW - X, PL - Y] : [X, Y]);
function camScale(L) { return (G.settings.cam || 'follow') === 'full' ? Math.min((L.W - 16) / PW, (L.H - 16) / PL) : L.H / 60; }
const sx = (L, vx) => L.W / 2 + (vx - L.cam.x) * L.cam.s;
const sy = (L, vy) => L.H / 2 + (vy - L.cam.y) * L.cam.s;
function moveCam(L, dt, snap) {
  const s = camScale(L), full = (G.settings.cam || 'follow') === 'full';
  const [bx, by] = view(L, L.ball.x, L.ball.y), hw = L.W / 2 / s, hh = L.H / 2 / s;
  let tx = full ? PW / 2 : clamp(bx, Math.min(PW / 2, hw - 3), Math.max(PW / 2, PW + 3 - hw)), ty = full ? PL / 2 : clamp(by, Math.min(PL / 2, hh - 4), Math.max(PL / 2, PL + 4 - hh));
  // Exponential damping gives the same camera response at 30, 60 and 120 Hz.
  const k = snap ? 1 : -Math.expm1(-dt / 320);
  L.cam.x += (tx - L.cam.x) * k; L.cam.y += (ty - L.cam.y) * k; L.cam.s += (s - L.cam.s) * (snap || !L.cam.s ? 1 : -Math.expm1(-dt / 200));
  if (!full) { const mx = hw * 0.8, my = hh * 0.8; L.cam.x = clamp(L.cam.x, bx - mx, bx + mx); L.cam.y = clamp(L.cam.y, by - my, by + my); } // fast balls never leave the screen
}

function bindLive() {
  const L = LIVE;
  if (!L) return;
  const cv = document.getElementById('pitch');
  if (!cv || UI.s !== 'match') return;
  updateBoard(L); // populate clock, possession and fitness before measuring pitch space
  const wrap = cv.parentElement, dpr = window.devicePixelRatio || 1;
  const viewport=cv.closest('.match-viewport');
  const W = wrap.clientWidth || viewport?.clientWidth || L.W, H = Math.max(1, wrap.clientHeight || viewport?.clientHeight || L.H);
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
  renderFeed(L);
  if (!L.raf) { L.last = 0; L.raf = requestAnimationFrame(liveFrame); }
}
// Before the first minute (or after resuming): where the engine has everyone now.
function placeFromSim(L) {
  const sim = L.M.sim;
  if (!sim) { if (typeof simInit === 'function') simInit(L.M); }
  const P = L.M.sim.P;
  L.dots = [0, 1].map(s => P[s].map(p => (p ? { x: p.x, y: p.y, fa: p.fa, vx: p.vx || 0, vy: p.vy || 0, v: Math.hypot(p.vx || 0, p.vy || 0), stride: 0 } : null)));
  Object.assign(L.ball, { x: L.M.sim.B.x, y: L.M.sim.B.y, z: 0 });
}

function stopLive() { if (LIVE && LIVE.raf) cancelAnimationFrame(LIVE.raf); if (LIVE) { LIVE.generation = (LIVE.generation || 0) + 1; LIVE.raf = 0; liveKeep(LIVE); } }

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
  if (L.fade > 0) L.fade = Math.max(0, L.fade - dt / 260);
  moveCam(L, dt);
  if(!L.matchView||L.matchView==='2d')draw(L);
  L.raf = requestAnimationFrame(liveFrame);
}

// The next minute: the engine plays it, then the screen shows it (or the highlights of it).
async function liveStep(L) {
  if (L.simBusy) return;
  L.simBusy = true;
  const generation = L.generation || 0, match = L.M;
  try {
  liveKeep(L); // everything up to this minute has been shown
  const signature = JSON.stringify(cleanMatch(match));
  let evs;
  if (Simulation.worker) {
    let result;
    try { result = await Simulation.request('minute', Simulation.input(match)); }
    catch { await new Promise(resolve => setTimeout(resolve, 0)); }
    if (LIVE !== L || L.G !== G || generation !== (L.generation || 0) || UI.s !== 'match' || signature !== JSON.stringify(cleanMatch(match))) return;
    if (result) {
      const callback = match.onAsync;
      Object.assign(match, result.match); match.onAsync = callback;
      evs = result.events;
      matchRandom(match, () => match.sides.forEach(S => { if (!S.user) evs.push(...aiManage(match, S)); }));
    }
  }
  if (!evs) evs = stepMatch(match, false);
  const prev = L.previousMinute, M = L.M, cur = M.frames || [];
  const t0 = cur.length ? cur[0][0] : 0;
  // A highlight early in the minute keeps its build-up from the end of the last minute (if that wasn't shown).
  const lo = prev && prev.fr.length && !prev.segs.some(s => s[1] >= 59.5) ? -25 : 0;
  // Two preceding samples keep velocity continuous across a minute boundary.
  const fr = prev ? prev.fr.filter(f => f[0] >= t0 + (lo || -TICK * 2) && f[0] < t0).concat(cur) : cur;
  L.previousMinute = null;
  const timed = evs.filter(e => e.tt != null).sort((a, b) => a.tt - b.tt), now = evs.filter(e => e.tt == null && e.t !== 'poss');
  const segs = segments(M.marks || [], t0, lo, M, fr);
  L.mq = { min: M.min, fr, t0, p: Math.min(0, segs.length ? segs[0][0] : 0), ev: timed, ei: 0, segs, skip: 0, main: evs[0], marks: (M.marks || []).slice(), mi: 0 };
  now.forEach(e => pushFeed(L, e.t === 'inj' ? 'inj' : e.t === 'sub' ? 'info' : 'tac', commLine(L, e), e.side));
  updateBoard(L);
  if (UI.popup && UI.popup.key === 'live:pl') { const b = document.querySelector('#layer .sh-body'), h = plCardHtml(L); if (b && h) b.innerHTML = h; }
  } catch (error) { L.paused = true; updateBoard(L); toast('The match could not advance. Your checkpoint has been kept; press Play to retry.'); }
  finally { L.simBusy = false; }
}
// Parts of the minute to show, by highlight level: [from, to] in seconds of the minute (from lo: the build-up can
// start in the last minute). A highlight is a story: from the moment the team won the ball (or the set piece it came
// from, at most 25 s before) to the finish - a goal, a shot, a penalty, a red card. Passing with no end is not a
// highlight. Dynamic, as FM26: a close game and the last 15 minutes show more, a one-sided one shows less.
const HL_END = { goal: 4, shot: 2.5, pen: 2, red: 2.5, card: 1.5, offside: 1.5, chance: 3 };
function storyStart(fr, t0, lo, tm, side) {
  const floor = Math.max(lo, tm - 25);
  for (let k = fr.length - 1; k >= 0; k--) {
    const f = fr[k], p = f[0] - t0;
    if (p > tm) continue;
    if (p < floor) return floor;
    if (f[6]) return Math.max(floor, Math.min(tm - 4, p - 1)); // a set piece: from just before it is taken
    if (f[4] === 1 - side) return Math.max(floor, Math.min(tm - 4, p - 1.5)); // where they won it: the tackle or interception
  }
  return floor;
}
function segments(marks, t0, lo = 0, M = null, fr = []) {
  const hl = G.settings.hl || 'ext';
  if (hl === 'full') return [[0, 60]];
  const gd = M ? Math.abs(M.sides[0].st.g - M.sides[1].st.g) : 0, late = M && M.min >= 75;
  const drama = (gd <= 1 ? 1 : gd >= 3 ? -1 : 0) + (late ? 1 : 0); // -1 dull ... 2 tense
  const out = [];
  marks.forEach(m => {
    let k = m.k === 'card' ? (m.red ? 'red' : 'card') : m.k;
    const keyLevel = k === 'goal' || k === 'pen' || k === 'red' || (k === 'shot' && (m.xg || 0) >= (drama < 0 ? 0.15 : 0.05)) || (k === 'chance' && drama >= 2);
    const extLevel = keyLevel || k === 'shot' || (drama >= 0 && (k === 'card' || k === 'offside' || k === 'chance'));
    if (!(hl === 'key' ? keyLevel : extLevel)) return;
    const tm = m.t - t0, side = k === 'card' || k === 'red' ? 1 - m.s : m.s;
    const from = k === 'card' || k === 'offside' ? Math.max(lo, tm - 6) : storyStart(fr, t0, lo, tm, side);
    out.push([Math.max(lo, from), Math.min(60, tm + HL_END[k])]);
  });
  out.sort((a, b) => a[0] - b[0]);
  const merged = [];
  out.forEach(s => { const l = merged[merged.length - 1]; if (l && s[0] <= l[1] + 1) l[1] = Math.max(l[1], s[1]); else merged.push(s.slice()); });
  return merged;
}
function playMinuteView(L, dt) {
  const q = L.mq, inSeg = q.segs.find(s => q.p >= s[0] && q.p < s[1]);
  // Dead time at a restart (the ball is out, players walk into position) runs six times faster, as TV cuts it.
  const ff = L.rs && L.rs !== 'pen' ? 6 : 1;
  if (inSeg) q.p = Math.min(inSeg[1], q.p + dt / 1000 * (SPEED_RATE[G.settings.speed] || 4) * ff);
  else {
    q.skip += dt;
    if (q.skip < 90) return;
    q.skip = 0;
    const nx = q.segs.find(s => s[0] > q.p);
    q.p = nx ? nx[0] : 60;
    if (nx) { setFrame(L, q.p, true); L.fade = 1; L.trail = []; } // cut to the start of the next highlight (a quick fade)
  }
  setFrame(L, q.p);
  // Commentary and big moments as their time comes.
  while (q.ei < q.ev.length && q.ev[q.ei].tt <= q.p) liveEvent(L, q.ev[q.ei++]);
  while (q.mi < q.marks.length && q.marks[q.mi].t - q.t0 <= q.p) liveMark(L, q.marks[q.mi++]);
  if (q.p >= 60) endMinute(L);
}
// A shape-preserving cubic: shared tangents make velocity continuous, but never
// overshoot a stop or reverse a stationary player (ordinary Catmull-Rom can).
function liveCurve(p0, p1, p2, p3, u, derivative = false) {
  const d = p2 - p1, before = p1 - p0, after = p3 - p2;
  const m1 = before * d > 0 ? 2 * before * d / (before + d) : 0;
  const m2 = d * after > 0 ? 2 * d * after / (d + after) : 0;
  const a = m1 + m2 - 2 * d, b = 3 * d - 2 * m1 - m2;
  return derivative ? (3 * a * u + 2 * b) * u + m1 : ((a * u + b) * u + m1) * u + p1;
}

// Positions at second p of the minute, between the two nearest frames.
function setFrame(L, p, snap) {
  const q = L.mq, fr = q.fr;
  if (!fr.length) return;
  const t = q.t0 + p;
  let k = Math.min(fr.length - 1, Math.max(0, Math.floor((t - fr[0][0]) / TICK)));
  while (k > 0 && fr[k][0] > t) k--;
  const a = fr[k], b = fr[Math.min(fr.length - 1, k + 1)], u = b[0] > a[0] ? clamp((t - a[0]) / (b[0] - a[0]), 0, 1) : 0;
  const z = fr[Math.max(0, k - 1)], c = fr[Math.min(fr.length - 1, k + 2)];
  const lerp = (i) => (a[i] == null ? null : b[i] == null ? a[i] : a[i] + (b[i] - a[i]) * u);
  // Do not curve through a restart, missing player or implausible jump.
  const smooth = (i, derivative = false) => {
    const p0 = z[i], p1 = a[i], p2 = b[i], p3 = c[i];
    if (p1 != null && p2 != null && Math.abs(p2 - p1) > 6) return derivative ? 0 : p1;
    if (p1 == null || p2 == null || p0 == null || p3 == null || a[6] !== b[6] || Math.abs(p2 - p1) > 6 || Math.abs(p1 - p0) > 6 || Math.abs(p3 - p2) > 6) return derivative ? (p1 == null || p2 == null ? 0 : p2 - p1) : lerp(i);
    return liveCurve(p0, p1, p2, p3, u, derivative);
  };
  const carried = a[4] >= 0 && b[4] === a[4] && b[5] === a[5];
  L.ball.x = carried ? smooth(1) : lerp(1); L.ball.y = carried ? smooth(2) : lerp(2); L.ball.z = lerp(3); L.rs = a[6]; L.gt = t;
  const cut = a[6] !== b[6] && hyp(b[1] - a[1], b[2] - a[2]) > 6;
  if (cut) { L.ball.x = a[1]; L.ball.y = a[2]; L.ball.z = a[3]; }
  L.sceneFade = cut ? Math.sin(Math.PI * u) * 0.8 : 0;
  // Possession changing hands in open play: a ring where it was won.
  if (a[4] >= 0 && L.own[0] >= 0 && a[4] !== L.own[0] && !a[6] && !snap) (L.fx || (L.fx = [])).push({ k: 'won', x: L.ball.x, y: L.ball.y, side: a[4], t0: t });
  L.own = [a[4], a[5]];
  for (let s = 0; s < 2; s++) for (let i = 0; i < 11; i++) {
    const x = smooth(7 + (s * 11 + i) * 2), y = smooth(8 + (s * 11 + i) * 2), fi = 51 + s * 11 + i;
    // Where he faces (rulebook 1c), turned the short way round between the two frames.
    const fa = a[fi] == null ? null : b[fi] == null ? a[fi] : a[fi] + Math.atan2(Math.sin(b[fi] - a[fi]), Math.cos(b[fi] - a[fi])) * u;
    // Derive speed from the displayed curve, rather than changing it every tick.
    const seconds = b[0] - a[0] || TICK, vx = smooth(7 + (s * 11 + i) * 2, true) / seconds, vy = smooth(8 + (s * 11 + i) * 2, true) / seconds;
    const v = Math.hypot(vx, vy);
    const old = L.dots[s][i], distance = old && x != null ? Math.hypot(x - old.x, y - old.y) : 0;
    // Footfalls follow distance travelled, so pausing and changing playback speed
    // cannot make stationary players jog or restart everybody's stride together.
    const stride = (old && !snap ? old.stride || 0 : (s * 11 + i) * 2.4) + (distance < 6 && !snap ? distance * Math.PI / 1.5 : 0);
    L.dots[s][i] = x == null ? null : { x, y, fa, v, vx, vy, stride };
  }
  // Interpolate player motion and facing first, then attach a possessed ball to
  // that displayed pose. Independent ball and player curves otherwise separate
  // during a turn between the engine's half-second samples.
  const [os, oi] = L.own, carrier = os >= 0 && oi >= 0 ? L.dots[os]?.[oi] : null;
  if (carried && carrier) {
    const fa = carrier.fa ?? fwdA(os), d = touchDistance(carrier, t);
    L.ball.x = clamp(carrier.x + Math.cos(fa) * d, 0.05, PW - 0.05);
    L.ball.y = clamp(carrier.y + Math.sin(fa) * d, 0.05, PL - 0.05);
    L.ball.z = 0;
  }
  const shot = (q.marks || []).filter(m => m.k === 'sfx' && t >= m.t && t <= m.t + m.flight).pop();
  if (shot) {
    const point = flightPoint({ ...shot, k: 'shot', t0: shot.t, arr: shot.t + shot.flight }, t);
    [L.ball.x, L.ball.y, L.ball.z] = point;
    const keeper = shot.keeper, g = L.dots[1 - shot.s]?.[0];
    if (keeper && g) { const u = clamp((t - keeper.start) / Math.max(0.05, keeper.end - keeper.start), 0, 1); g.x = keeper.x0 + (keeper.tx - keeper.x0) * u; g.y = keeper.y0 + (keeper.ty - keeper.y0) * u; }
  }
  if (snap) moveCam(L, 0, true);
}
function liveEvent(L, e) {
  const M = L.M, players = ['pid', 'aid', 'out'].map(k => +e[k]).filter(id => G.players[id]);
  if (e.t === 'goal') {
    L.shotT = L.gt;
    L.disp[e.side]++; updateBoard(L);
    pushFeed(L, 'goal', commLine(L, e), e.side, players);
    L.overlay = { big: e.pen ? 'PENALTY GOAL' : 'GOAL', small: pname(G.players[e.pid]) + ' ' + e.min + "'", t: 2200, side: e.side };
    L.hold = 1600;
    return;
  }
  if (e.t === 'yellow' || e.t === 'red') {
    pushFeed(L, e.t, commLine(L, e), e.fside, players);
    L.overlay = { big: e.t === 'red' ? 'RED CARD' : 'YELLOW', small: pname(G.players[e.pid]), t: 1200, card: e.t };
    L.hold = 600; return;
  }
  if (e.t === 'offside') {
    pushFeed(L, 'info', commLine(L, e), 1 - e.side, players);
    L.overlay = { big: 'OFFSIDE', small: pname(G.players[e.pid]), t: 1200, flag: true };
    L.line = e.line != null ? { y: e.line, until: L.t + 1600 } : null;
    L.hold = 500; return;
  }
  if (e.t === 'save' || e.t === 'miss' || e.t === 'shot') {
    L.shotT = L.gt; // the ball's trail turns gold
    if (e.t === 'save') { const g = L.dots[1 - e.side] && L.dots[1 - e.side][0]; if (g) (L.fx || (L.fx = [])).push({ k: 'save', x: g.x, y: g.y, side: 1 - e.side, t0: L.gt }); }
    const txt = commLine(L, e); if (txt) pushFeed(L, 'chance', txt, e.side, players); return;
  }
  if (e.t === 'foul') { if (e.pen) { pushFeed(L, 'info', `Penalty! ${pname(G.players[e.pid])} brings his man down.`, e.side, players); L.overlay = { big: 'PENALTY', small: clubName(M.sides[e.side].cid), t: 1400 }; } else if (R() < 0.35) pushFeed(L, 'info', commLine(L, e), e.fside, players); return; }
  if (e.t === 'inj') { pushFeed(L, 'inj', commLine(L, e), e.side, players); return; }
  const txt = commLine(L, e); if (txt) pushFeed(L, 'info', txt, e.side, players);
}
function liveMark(L, m) {
  const tn = TheClub(L.M.sides[m.s].cid);
  if (m.k === 'corner') pushFeed(L, 'info', `Corner to ${tn.toLowerCase().replace('the ', 'the ')}.`, m.s);
  if (m.k === 'chance' && R() < 0.5) pushFeed(L, 'info', `${tn} are through on goal!`, m.s);
}
// The minute is over: half time, an injury to one of yours, or full time.
function endMinute(L) {
  const q = L.mq, M = L.M, main = q.main;
  L.previousMinute = q;
  L.mq = null;
  if (q.ev.length === 0 && R() < 0.05) pushFeed(L, 'info', fillerLine(L, { side: M.sim ? M.sim.poss : 0 }));
  const inj = q.ev.concat(main ? [main] : []).find(e => e.t === 'inj' && M.sides[e.side].user);
  if (inj) { L.paused = true; updateBoard(L); toast(`${pname(G.players[inj.pid])} is injured. Make a substitution.`); openLiveSheet('subs'); }
  const red = q.ev.concat(main ? [main] : []).find(e => e.t === 'red' && M.sides[e.off].user);
  if (red && !inj) { L.paused = true; L.gapSlot = red.slot; updateBoard(L); toast(`${pname(G.players[red.pid])} is sent off. Move a player into the gap.`); openLiveSheet('gap'); }
  if (main && (main.ht || main.etBreak)) { L.previousMinute=null; L.overlay = { big: main.etBreak ? 'EXTRA TIME' : 'HALF TIME', small: L.disp.join(' - '), t: 1, stay: true }; L.paused = true; updateBoard(L); openTeamTalk(L); }
}
// Injury events from the engine have no time in the minute: shown at once.

/* ---------- drawing ---------- */
// Where a shot is along its real flight (a straight line at the engine's shot speed). The frames are 0.5 s apart and a
// shot lasts about 0.4 s, so the ball is drawn along this path rather than interpolated between frames. Null outside the flight.
function shotPathPoint(L, m) {
  if (!m || m.tx == null || m.x0 == null) return null;
  const fl = Math.max(0.05, m.flight || 0.4);
  if (L.gt < m.t || L.gt > m.t + fl + 1e-6) return null;
  return flightPoint({ ...m, k: 'shot', t0: m.t, arr: m.t + fl }, L.gt).slice(0, 2);
}
function liveAction(L, side, who) {
  const marks = (L.previousMinute?.marks || []).concat(L.mq?.marks || []);
  for (let n = marks.length - 1; n >= 0; n--) {
    const m = marks[n], before = m.k === 'kick' ? 0.18 : 0;
    if (m.s === side && m.who === who && ['kick', 'touch', 'duel'].includes(m.k) && L.gt >= m.t - before && L.gt <= m.t + (m.duration || 0.45)) return m;
  }
  return null;
}
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
    g.save(); g.strokeStyle = 'rgba(255,255,255,.35)'; g.lineWidth = 1; // the net
    for (let k = 1; k < 8; k++) { g.beginPath(); g.moveTo(X(PW / 2 - 3.66 + k * 0.915), Y(y0)); g.lineTo(X(PW / 2 - 3.66 + k * 0.915), Y(y0 - d * 2)); g.stroke(); }
    g.beginPath(); g.moveTo(X(PW / 2 - 3.66), Y(y0 - d)); g.lineTo(X(PW / 2 + 3.66), Y(y0 - d)); g.stroke(); g.restore();
  });
  if (L.line && L.t < L.line.until) { // offside line
    const [, vy] = view(L, 0, L.line.y);
    g.save(); g.strokeStyle = '#F2C14E'; g.lineWidth = 2; g.setLineDash([6, 4]); g.beginPath(); g.moveTo(X(0), Y(vy)); g.lineTo(X(PW), Y(vy)); g.stroke(); g.restore();
  }
  // Effects under the players: rings where the ball was won and at the keeper on a save (1.2 s of play).
  L.fx = (L.fx || []).filter(f => L.gt - f.t0 < 1.2 && L.gt >= f.t0);
  L.fx.forEach(f => {
    const [vx, vy] = view(L, f.x, f.y), k = (L.gt - f.t0) / 1.2, col = f.k === 'save' ? '#9AD1D4' : L.colors[f.side === L.bottom ? 0 : 1].f;
    g.save(); g.globalAlpha = 1 - k; g.strokeStyle = col; g.lineWidth = 3;
    g.beginPath(); g.arc(X(vx), Y(vy), (f.k === 'save' ? 1.5 : 1) * s * (0.8 + k * 2.2), 0, Math.PI * 2); g.stroke(); g.restore();
  });
  // The ball's trail while it travels (the last 0.6 s of play); gold for a shot.
  if (L.own[0] < 0 && L.gt != null) {
    const tr = L.trail || (L.trail = []), last = tr[tr.length - 1];
    if (!last || last.t !== L.gt) tr.push({ x: L.ball.x, y: L.ball.y, z: L.ball.z || 0, t: L.gt });
    while (tr.length && (L.gt - tr[0].t > 0.6 || tr[0].t > L.gt)) tr.shift();
    const shot = L.shotT != null && L.gt - L.shotT < 1.6 && L.gt >= L.shotT;
    for (let n = 1; n < tr.length; n++) {
      const [ax, ay] = view(L, tr[n - 1].x, tr[n - 1].y), [bx2, by2] = view(L, tr[n].x, tr[n].y);
      g.strokeStyle = shot ? `rgba(242,193,78,${(n / tr.length) * 0.9})` : `rgba(255,255,255,${(n / tr.length) * 0.55})`;
      g.lineWidth = Math.max(2, s * 0.3) * (shot ? 1.4 : 1); g.lineCap = 'round';
      g.beginPath(); g.moveTo(X(ax), Y(ay) - tr[n - 1].z * s * 0.55); g.lineTo(X(bx2), Y(by2) - tr[n].z * s * 0.55); g.stroke();
    }
  } else L.trail = [];
  const r = Math.max(7, s * 1.3);
  // A penalty: the taker runs in from six metres behind the spot to strike (the shot itself is drawn below).
  const penRun = L.mq && L.gt != null ? L.mq.marks.filter(m => m.k === 'sfx' && m.kind === 'penalty' && L.gt >= m.t - 1.6 && L.gt < m.t).pop() : null;
  const penAt = m => { const k = clamp((L.gt - (m.t - 1.6)) / 1.4, 0, 1), e = k * k * (3 - 2 * k), bx = m.x0, by = m.y0 - fwdY(m.s) * 6; return [bx + (m.x0 - bx) * e, by + (m.y0 - by) * e]; };
  g.textAlign = 'center'; g.textBaseline = 'middle';
  [1 - L.bottom, L.bottom].forEach(si => {
    const S = L.M.sides[si], col = L.colors[si === L.bottom ? 0 : 1];
    S.on.forEach((id, i) => {
      const d = L.dots[si][i]; if (!id || !d) return;
      const pr = penRun && penRun.s === si && penRun.who === i ? penAt(penRun) : [d.x, d.y];
      const action = liveAction(L, si, i);
      const jump = action?.style === 'header' ? Math.sin(Math.PI * clamp((L.gt - action.t + 0.18) / 0.5, 0, 1)) * s * 0.35 : 0;
      const [vx, vy] = view(L, pr[0], pr[1]), x = X(vx), groundY = Y(vy), y = groundY - jump, gk = i === 0;
      // Keep players legible on a phone while retaining their pitch-scale size when zoomed in.
      const br = Math.max(5, bodyRadius(S, i) * s);
      if (x < -20 || x > W + 20 || y < -20 || y > H + 20) return;
      g.fillStyle = 'rgba(0,0,0,.25)'; g.beginPath(); g.ellipse(x, groundY + br * 0.7, br * 0.9, br * 0.35, 0, 0, Math.PI * 2); g.fill();
      // Small alternating boots give runners weight without moving the body away
      // from its real pitch position. Their shadows stay planted on the grass.
      if (d.v > 0.15 && d.fa != null && !action) {
        const fa = d.fa + (liveViewFlipped(L) ? Math.PI : 0), cx = Math.cos(fa), cy = Math.sin(fa);
        const step = Math.sin(d.stride || 0) * Math.min(1, d.v / 4) * br * 1.25;
        g.strokeStyle = '#16251E'; g.lineWidth = Math.max(1.2, br * 0.4); g.lineCap = 'round';
        for (const side of [-1, 1]) {
          const fx = x - cy * br * 0.65 * side, fy = y + cx * br * 0.65 * side;
          g.beginPath(); g.moveTo(fx, fy); g.lineTo(fx + cx * step * side, fy + cy * step * side); g.stroke();
        }
      }
      if (action && action.style !== 'header') {
        const tx = action.tx ?? action.x, ty = action.ty ?? action.y;
        const angle = Math.atan2(ty - d.y, tx - d.x) + (liveViewFlipped(L) ? Math.PI : 0);
        const phase = clamp((L.gt - action.t + 0.18) / ((action.duration || 0.45) + 0.18), 0, 1);
        const swing = Math.sin(phase * Math.PI), reach = action.k === 'duel' ? 1.7 : action.k === 'touch' ? 0.8 : 1.5;
        g.strokeStyle = action.k === 'duel' ? '#F2C14E' : '#16251E'; g.lineWidth = Math.max(1.8, br * 0.45); g.lineCap = 'round';
        g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(angle) * br * (0.5 + reach * swing), y + Math.sin(angle) * br * (0.5 + reach * swing)); g.stroke();
        if (action.k === 'touch') { g.strokeStyle = 'rgba(45,226,238,.7)'; g.lineWidth = 1; g.beginPath(); g.arc(x, y, br + 3 * (1 - phase), 0, Math.PI * 2); g.stroke(); }
      }
      g.fillStyle = gk ? col.gk : col.f; g.strokeStyle = gk ? '#1B1B1B' : col.s; g.lineWidth = Math.max(1, br * 0.3);
      g.beginPath(); g.arc(x, y, br, 0, Math.PI * 2); g.fill(); g.stroke();
      if (d.fa != null) { // where he faces: a small pointer on the edge of the circle
        const fa = liveViewFlipped(L) ? d.fa + Math.PI : d.fa, cx = Math.cos(fa), cy = Math.sin(fa);
        g.fillStyle = gk ? '#1B1B1B' : col.s; g.beginPath();
        g.moveTo(x + cx * (br + 3), y + cy * (br + 3)); g.lineTo(x + cx * br * 0.7 - cy * br * 0.55, y + cy * br * 0.7 + cx * br * 0.55); g.lineTo(x + cx * br * 0.7 + cy * br * 0.55, y + cy * br * 0.7 - cx * br * 0.55); g.closePath(); g.fill();
      }
      if (L.own[0] === si && L.own[1] === i) { g.strokeStyle = '#2DE2EE'; g.lineWidth = 2; g.beginPath(); g.arc(x, y, br + 3, 0, Math.PI * 2); g.stroke(); }
      if (L.sel && L.sel[0] === si && L.sel[1] === i) { g.strokeStyle = '#FFFFFF'; g.lineWidth = 2; g.beginPath(); g.arc(x, y, br + 5, 0, Math.PI * 2); g.stroke(); }
      g.fillStyle = isLight(gk ? col.gk : col.f) ? '#111' : '#FFF';
      g.font = `700 ${Math.max(6, Math.round(br * 1.6))}px "Plus Jakarta Sans", system-ui, sans-serif`;
      g.fillText(String(G.players[id] ? G.players[id].no : ''), x, y + 0.5);
      if (s > 7) { // names when zoomed in
        g.font = `600 ${Math.round(r * 0.72)}px "Plus Jakarta Sans", system-ui, sans-serif`; g.fillStyle = 'rgba(255,255,255,.88)';
        g.fillText(G.players[id] ? G.players[id].ln : '', x, y + r + r * 0.75);
      }
    });
  });
  // 7.6: a shot in flight - the ball rises to where it is aimed (a chip arcs over), the keeper dives, the net flashes.
  const sf = L.mq && L.gt != null ? L.mq.marks.filter(m => m.k === 'sfx' && L.gt >= m.t && L.gt <= m.t + (m.flight || 0.8) + 1.6).pop() : null;
  let zOver = null;
  if (sf) {
    const fl = Math.max(0.05, sf.flight || 0.8), u = clamp((L.gt - sf.t) / fl, 0, 1);
    if (L.gt <= sf.t + fl) zOver = flightPoint({ ...sf, k: 'shot', t0: sf.t, arr: sf.t + fl }, L.gt)[2];
    const dside = 1 - sf.s, gk = L.dots[dside] && L.dots[dside][0];
    if (gk && (sf.res === 'save' || sf.res === 'goal') && L.gt >= sf.t + fl * 0.25 && L.gt <= sf.t + fl + 0.9) {
      const [kvx, kvy] = view(L, gk.x, gk.y), [tvx, tvy] = view(L, sf.tx, gk.y), dir = Math.sign(tvx - kvx) || 1, k = clamp((L.gt - sf.t - fl * 0.25) / (fl * 0.75), 0, 1);
      const col = L.colors[dside === L.bottom ? 0 : 1].gk, len = s * (0.5 + 0.8 * k);
      g.save(); g.fillStyle = col; g.globalAlpha = 0.85; g.beginPath(); g.ellipse(X(kvx) + dir * len * 0.5, Y(kvy), len * 0.75, r * 0.55, 0, 0, Math.PI * 2); g.fill();
      g.globalAlpha = 1; g.fillStyle = '#FFFFFF'; g.beginPath(); g.arc(X(kvx) + dir * len * 1.15, Y(kvy) - r * 0.2, r * 0.38, 0, Math.PI * 2); g.fill(); g.restore();
    }
    if (sf.res === 'goal' && L.gt >= sf.t + fl && L.gt <= sf.t + fl + 1.2) { // the net bulges
      const [nvx, nvy] = view(L, PW / 2, goalY(sf.s)), [, nby] = view(L, PW / 2, goalY(sf.s) - fwdY(sf.s) * -2), a = 1 - (L.gt - sf.t - fl) / 1.2;
      g.save(); g.fillStyle = `rgba(255,255,255,${0.55 * a})`; g.fillRect(X(PW / 2 - 3.66), Math.min(Y(nvy), Y(nby)), 7.32 * s, Math.abs(Y(nby) - Y(nvy))); g.restore();
    }
    // What kind of shot, then what happened.
    const after = L.gt > sf.t + fl, outcome = { save: 'Saved!', miss: sf.az > 2.44 ? 'Over the bar' : 'Wide', block: 'Blocked' }[sf.res];
    const txt = after && outcome ? outcome : (SHOT_NAME[sf.kind] || 'Shot') + (sf.aim && sf.aim !== 'central' && !['chip', 'power', 'open goal', 'penalty'].includes(sf.kind) ? ' \u00B7 ' + sf.aim : '');
    if (!(after && sf.res === 'goal') && !L.overlay) {
      g.font = '700 13px "Plus Jakarta Sans", system-ui, sans-serif'; g.textAlign = 'center';
      const w = g.measureText(txt).width + 20; g.fillStyle = after ? 'rgba(242,193,78,.92)' : 'rgba(34,8,47,.78)';
      g.beginPath(); g.roundRect ? g.roundRect(W / 2 - w / 2, H - 38, w, 24, 12) : g.rect(W / 2 - w / 2, H - 38, w, 24); g.fill();
      g.fillStyle = after ? '#1B1B1B' : '#EAF2EE'; g.fillText(txt, W / 2, H - 25.5);
    }
  }
  // The ball, lifted by its height, with its shadow on the grass.
  // The engine already puts a dribble ahead of the runner's feet. Draw that same path throughout a touch, pass and
  // reception. A shot in flight is drawn along its real path (the frames are too far apart for a 0.4 s shot).
  const shotP = sf ? shotPathPoint(L, sf) : null;
  const [ballX, ballY] = shotP ? view(L, shotP[0], shotP[1]) : view(L, L.ball.x, L.ball.y), bx = X(ballX), by = Y(ballY);
  const z = zOver != null ? zOver : L.ball.z || 0, br = Math.max(3, s * 0.32) * (1 + z * 0.06);
  g.fillStyle = `rgba(0,0,0,${0.35 / (1 + z * 0.25)})`; g.beginPath(); g.ellipse(bx + 1.5, by + 1.5, br * (1 + z * 0.08), br * 0.6, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#FFFFFF'; g.strokeStyle = '#1B1B1B'; g.lineWidth = 1;
  g.beginPath(); g.arc(bx, by - z * s * 0.55, br, 0, Math.PI * 2); g.fill(); g.stroke();
  // Rolling seams make controlled dribble touches visible while keeping the ball at the feet.
  if (L.own[0] >= 0) { const a = (L.gt || 0) * 10, yy = by - z * s * 0.55; g.beginPath(); g.moveTo(bx - Math.cos(a) * br * 0.7, yy - Math.sin(a) * br * 0.7); g.lineTo(bx + Math.cos(a) * br * 0.7, yy + Math.sin(a) * br * 0.7); g.stroke(); }
  if ((G.settings.cam || 'follow') === 'follow') miniMap(L);
  // A restart running fast-forward: what it is.
  const RS_NAME = { thr: 'Throw-in', gk: 'Goal kick', ck: 'Corner', fk: 'Free kick', ko: 'Kick-off' };
  if (L.rs && RS_NAME[L.rs] && !L.overlay) {
    g.font = '700 12px "Plus Jakarta Sans", system-ui, sans-serif'; g.textAlign = 'left';
    const txt = RS_NAME[L.rs] + '  \u25B8\u25B8', w = g.measureText(txt).width + 16;
    g.fillStyle = 'rgba(34,8,47,.72)'; g.beginPath(); g.roundRect ? g.roundRect(8, 8, w, 22, 11) : g.rect(8, 8, w, 22); g.fill();
    g.fillStyle = '#EAF2EE'; g.fillText(txt, 16, 19.5); g.textAlign = 'center';
  }
  if (L.fade > 0 || L.sceneFade > 0) { g.fillStyle = `rgba(10,4,18,${Math.max((L.fade || 0) * 0.65, L.sceneFade || 0)})`; g.fillRect(0, 0, W, H); }
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
  el('sbClock').textContent = L.done ? 'FT' : (L.M.extra && mn > 90 ? String(mn) + ' ET' : mn > 90 ? '90+' + (mn - 90) : String(mn)) + "'";
  const tot = H.st.pos + W.st.pos || 1;
  el('sbPoss').style.width = Math.round((H.st.pos / tot) * 100) + '%';
  el('sbPossTxt').textContent = Math.round((H.st.pos / tot) * 100) + '% possession ' + Math.round((W.st.pos / tot) * 100) + '%';
  const pb = el('btnPause'); if (pb) pb.textContent = L.paused ? 'Play' : 'Pause';
  const sp = el('btnSpeed'); if (sp) sp.textContent = G.settings.speed + 'x';
  const hl = el('btnHl'); if (hl) hl.textContent = HL[G.settings.hl || 'ext'];
  const cm = el('btnCam'); if (cm) cm.textContent = (G.settings.cam || 'follow') === 'full' ? 'Full pitch' : 'Follow';
  const ft = el('ftBar'); if (ft) ft.hidden = !L.done;
  const report = ft && ft.querySelector('button'); if (report) { report.disabled = !!L.finishing; report.textContent = L.finishing ? 'Updating results…' : 'Match report'; }
  updateLiveFitness(L);
}

// Match condition is the source of truth for fatigue; injury is a separate
// health flag. Never read the career condition in place of a live match value.
function liveFitness(S, id) {
  const p = G.players[id], condition = clamp(Math.round(S.cond[id] ?? p.cond), 0, 100);
  const fatigue = condition >= 85 ? 'Fresh' : condition >= 70 ? 'Tiring' : 'Tired';
  const injured = !!p.inj || S.injuries.some(x => x[0] === id);
  return { condition, fatigue, injured, color: condClass(condition) };
}
const liveMoraleEmoji = value => value > 85 ? '😄' : value > 70 ? '🙂' : value > 55 ? '😊' : value > 40 ? '😐' : value > 25 ? '🙁' : '😞';
function liveMoraleHtml(S, id, showLabel = false) {
  const value=liveMor(S,G.players[id]),label=morLabel(value);
  return `<span class="live-morale" data-live-morale="${id}" data-morale-side="${S.idx}" data-morale-label="${showLabel}" role="img" aria-label="Morale: ${label}" title="Morale: ${label}">${liveMoraleEmoji(value)}${showLabel?' '+label:''}</span>`;
}
function liveSubPlayerInfo(S, id) {
  const p=G.players[id],on=S.on.includes(id),rating=Number.isFinite(S.rat[id])?S.rat[id].toFixed(1):'—';
  return `<span class="grow live-sub-info"><b>${esc(pname(p))}</b><small>${on?'Rating '+rating:'Sharpness '+Math.round(p.shp)+'%'} · ${liveMoraleHtml(S,id,true)}</small></span>`;
}
function liveFitnessHtml(S, id) {
  const f = liveFitness(S, id);
  return `<span class="live-health ${f.color}" data-health-id="${id}" data-health-side="${S.idx}" aria-label="${f.injured ? 'Injured' : 'Fit'} · Condition ${f.condition}% · ${f.fatigue}"><b>${f.condition}%</b><span class="live-fatigue">${f.injured ? '<strong class="bad">INJ</strong> · ' : ''}${f.fatigue}</span><span class="live-condition-bar" aria-hidden="true"><i style="width:${f.condition}%"></i></span></span>`;
}
function updateLiveFitness(L) {
  updateMatchPanels(L); // Render the active pane only; controls survive ordinary condition updates.
  document.querySelectorAll('.match-view-panel:not([hidden]) [data-live-morale], #layer:not([hidden]) [data-live-morale]').forEach(el => {
    const S=L.M.sides[+el.dataset.moraleSide],p=G.players[+el.dataset.liveMorale];if(!S||!p)return;
    const value=liveMor(S,p),label=morLabel(value);
    el.textContent=liveMoraleEmoji(value)+(el.dataset.moraleLabel==='true'?' '+label:'');
    el.setAttribute('aria-label','Morale: '+label);el.title='Morale: '+label;
  });
  document.querySelectorAll('.match-view-panel:not([hidden]) [data-health-id], #layer:not([hidden]) [data-health-id]').forEach(el => {
    const id = +el.dataset.healthId;
    const S=L.M.sides[+el.dataset.healthSide]||L.M.sides[L.bottom];
    if (!G.players[id]) return;
    const f = liveFitness(S, id), label = `${f.injured ? 'Injured' : 'Fit'} · Condition ${f.condition}% · ${f.fatigue}`;
    if (el.getAttribute('aria-label') === label) return;
    el.className = 'live-health ' + f.color; el.setAttribute('aria-label', label);
    const button = el.closest('.live-watch-player');
    if (button) { const slot=S.on.indexOf(id),pos=slot>=0?FORMATIONS[S.ip][slot][0]:G.players[id].pos;button.setAttribute('aria-label', `${fullName(G.players[id])} · ${pos} · ${label}`); }
    el.querySelector('b').textContent = f.condition + '%';
    el.querySelector('.live-fatigue').innerHTML = (f.injured ? '<strong class="bad">INJ</strong> · ' : '') + f.fatigue;
    el.querySelector('i').style.width = f.condition + '%';
  });
}

// Commentary: the newest line is a full-width bar in the colour of the team it is about; a goal flashes.
function pushFeed(L, k, txt, side, players = []) {
  if (!txt) return;
  const M = L.M;
  L.feed.unshift({ k, txt, min: M.min, side: side == null ? null : side, players, at: performance.now() });
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
    const text = f.players?.length ? `<span data-no-links>${playerMentionsHtml(f.txt, f.players)}</span>` : esc(f.txt);
    return `<li class="fd-${f.k}${i === 0 ? ' fd-main' : ''}${c ? ' tc' : ''}${blink}" ${style}><b>${f.min ? f.min + "'" : ''}</b><span>${text}</span></li>`;
  }).join('');
  linkEntities(el);
}
const SHOT_WITH = { placed: 'with a placed finish', driven: 'with a low drive', power: 'with a powerful strike', long: 'from distance', curler: 'with a curler from distance', chip: 'with a chip over the keeper', volley: 'with a volley', header: 'with a header', 'free kick': 'with a direct free kick', 'open goal': 'into an empty net' };
const SHOT_NOUN = { placed: 'placed shot', driven: 'low drive', power: 'powerful strike', long: 'shot from distance', curler: 'curler', chip: 'chip', volley: 'volley', 'free kick': 'free kick' };
const SHOT_NAME = { placed: 'Placed shot', driven: 'Low drive', power: 'Power shot', long: 'Long shot', curler: 'Curler', chip: 'Chip', volley: 'Volley', header: 'Header', 'free kick': 'Free kick', penalty: 'Penalty', 'open goal': 'Open goal' };
function commLine(L, ev) {
  const M = L.M, S = M.sides[ev.side], O = M.sides[1 - ev.side], n = id => pname(G.players[id]);
  const tn = theClub(S.cid);
  const fk = ev.fk ? 'Free kick. ' : ev.ck ? 'Corner. ' : '';
  switch (ev.t) {
    case 'goal': return ev.pen ? `Penalty to ${tn}. ${n(ev.pid)} sends the keeper the wrong way. ${L.disp.join('-')}.` : `${fk}${n(ev.pid)} scores for ${tn}${SHOT_WITH[ev.kind] ? ' ' + SHOT_WITH[ev.kind] + (ev.aim && ev.aim !== 'central' && !['chip', 'power', 'open goal'].includes(ev.kind) ? ' into the ' + ev.aim : '') : ''}${ev.aid ? ', set up by ' + n(ev.aid) : ''}. ${L.disp.join('-')}.`;
    case 'shot': return `${n(ev.pid)} ${ev.sp ? 'rises to head it' : ev.volley ? 'meets it with a volley' : 'lets fly'}...`;
    case 'save': return `${fk}${n(ev.pid)}${SHOT_NOUN[ev.kind] ? "'s " + SHOT_NOUN[ev.kind] : ''} ${SHOT_NOUN[ev.kind] ? 'is saved by' : 'forces a save from'} ${O.on[0] ? n(O.on[0]) : 'the keeper'}${ev.aim && ev.aim !== 'central' ? ' at the ' + ev.aim : ''}.${ev.corner ? ' Corner.' : ''}`;
    case 'miss':
      if (ev.block) return `${fk}${n(ev.pid)} ${pick(['has a shot blocked', 'sees his shot charged down', 'shoots straight into a defender'])}.${ev.corner ? ' Corner.' : ''}`;
      if (ev.corner) return `${fk}${n(ev.pid)}${ev.sp ? "'s header" : "'s shot"} ${pick(['takes a deflection and goes behind', 'is turned behind by a defender'])}. Corner.`;
      return ev.sp ? `${fk}${n(ev.pid)} ${ev.over ? 'heads over' : 'heads wide'}.` : `${fk}${n(ev.pid)}${SHOT_NOUN[ev.kind] ? "'s " + SHOT_NOUN[ev.kind] : ''} ${ev.over ? pick(['goes over the bar', 'flies over']) : pick(['goes just wide', 'drifts past the post', 'is wide'])}.`;
    case 'yellow': return `Yellow card for ${n(ev.pid)} (${clubName(M.sides[ev.fside].cid)}).`;
    case 'red': return ev.second ? `Second yellow for ${n(ev.pid)}. Off he goes.` : `Straight red card for ${n(ev.pid)}.`;
    case 'foul': return `Foul by ${n(ev.pid)}. Free kick to ${tn}.`;
    case 'offside': return `Flag up. ${n(ev.pid)} ${pick(['is offside, timing his run too early', 'is caught offside', 'strays beyond the last defender', 'has gone too soon. Offside'])}.`;
    case 'inj': return `${n(ev.pid)} is down with a suspected ${ev.inj.toLowerCase()}.`;
    case 'tac': return `${TheClub(S.cid)} ${MGR_SAY[ev.opt] || 'change their approach'}.`;
    case 'sub': return `Substitution, ${clubName(S.cid)}: ${n(ev.pid)} on, ${n(ev.out)} off.`;
    default: return '';
  }
}

function fillerLine(L, ev) {
  const t = TheClub(L.M.sides[ev.side].cid);
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
  sheet(`<h3 class="sh-t">${L.M.extra ? 'Extra-time interval' : 'Half-time team talk'}</h3>
    <p class="muted">${clubName(S.cid)} ${S.st.g} - ${O.st.g} ${clubName(O.cid)}. Assistant suggests: <b>${TEAM_TALKS.find(t => t.k === tip).n}</b>.</p>
    <div class="list">${TEAM_TALKS.map(t => `<button class="row act" data-a="talk" data-k="${t.k}"><span class="grow"><b>${t.n}</b><small>${t.d}</small></span><span class="chev">›</span></button>`).join('')}</div>`, { key: 'live:halftime', restore: () => openTeamTalk(L), valid: () => LIVE === L && !L.done && subInterval(L.M) && !!L.overlay?.stay, onClose: () => { if (LIVE && LIVE.overlay && LIVE.overlay.stay) { LIVE.overlay = null; LIVE.paused = false; updateBoard(LIVE); } } });
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

async function liveInstant() {
  const L = LIVE, M = L.M;
  L.generation = (L.generation || 0) + 1; L.paused = true;
  if (Simulation.worker) {
    const result = await Simulation.request('full', Simulation.input(M));
    if (LIVE !== L || L.G !== G) return;
    Object.assign(M, result.match);
  } else while (!M.ended) { if (LIVE !== L || L.G !== G) return; stepMatch(M, true); await new Promise(resolve => setTimeout(resolve, 0)); }
  L.mq = null; L.hold = 0; L.paused = false;
  L.disp = [M.sides[0].st.g, M.sides[1].st.g];
  closeSheet();
  await onFullTime(L);
}

async function onFullTime(L) {
  if (L.done) return;
  L.done = true;
  L.finishing = true;
  if (G.live && G.live.fid === L.fid) G.live = null;
  finishMatch(L.M);
  L.overlay = { big: 'FULL TIME', small: clubName(L.M.sides[0].cid) + ' ' + L.disp.join(' - ') + ' ' + clubName(L.M.sides[1].cid), t: 1, stay: true };
  pushFeed(L, 'info', 'The referee blows for full time.');
  updateBoard(L);
  try { await finishRoundAsync(); }
  catch { if (L.G === G) toast('Other results could not be updated. Continue from the dashboard to retry.'); }
  finally { L.finishing = false; if (LIVE === L && L.G === G) updateBoard(L); }
}

// The live player card (tap a player on the pitch). Refreshed every minute while open.
function plCardHtml(L) {
  const id = L.selId, si = L.M.sides.findIndex(X => X.on.includes(id) || X.off.includes(id) || X.reds.includes(id) || X.bench.includes(id));
  const X = L.M.sides[si], p = G.players[id];
  if (!p || !X) return '';
  const i = X.on.indexOf(id), pos = i >= 0 ? FORMATIONS[X.ip][i][0] : p.pos, s = X.ps[id] || {}, rt = X.rat[id] ?? 6.5, cond = Math.round(X.cond[id] ?? p.cond);
  const mor = Math.round(liveMor(X, p)), sw = Math.round((X.mo && X.mo[id]) || 0), mine = X.user;
  const row = (l, v) => `<div class="kvrow"><span>${l}</span><b>${v}</b></div>`;
  return `<div class="phead"><div class="pnum" style="--k1:${(L.colors[si === L.bottom ? 0 : 1] || {}).f}">${p.no || '-'}</div>
      <div class="grow"><h3 class="sh-t">${esc(fullName(p))}</h3><p class="muted">${POS_NAME[pos]}${i >= 0 ? ' · ' + esc(roleName(X, i)) : X.off.includes(id) ? ' · substituted' : X.reds.includes(id) ? ' · sent off' : ' · available substitute'} · ${esc(clubName(X.cid))}</p></div>
      <div class="pov"><small>Match rating</small><span class="ovr ${rt >= 7.5 ? 'o4' : rt >= 6.8 ? 'o3' : rt >= 6 ? 'o2' : 'o1'}">${rt.toFixed(1)}</span></div></div>
    <div class="meters"><div><small>Condition ${cond}%</small>${bar(cond, condClass(cond))}</div><div><small>Morale · ${morLabel(mor)} ${sw > 1 ? '↑' : sw < -1 ? '↓' : ''}</small>${bar(mor, morClass(mor))}</div><div><small>Sharpness</small>${bar(p.shp)}</div></div>
    <div class="card">${row('Passes', s.pa ? `${s.pc || 0}/${s.pa} (${Math.round((s.pc || 0) / s.pa * 100)}%)` : '0')}${row('Key passes', s.kp || 0)}${row('Dribbles', `${s.dw || 0}/${s.da || 0}`)}${row('Crosses', s.cr || 0)}
      ${row('Tackles / interceptions', `${s.tk || 0} / ${s.int || 0}`)}${row('Aerial duels won', s.aer || 0)}${row('Blocks', s.blk || 0)}
      ${row('Shots / on target', `${s.sh || 0} / ${s.sot || 0}`)}${pos === 'GK' ? row('Saves', s.sv || 0) : row('Offsides / fouls', `${s.off || 0} / ${s.fo || 0}`)}</div>
    ${sw <= -6 ? `<p class="note">His head has gone down after what has happened in the match. A shout or a substitution may help.</p>` : sw >= 6 ? `<p class="muted">Full of confidence after how the match is going.</p>` : ''}
    ${mine && i >= 0 ? `<div class="btns"><button class="btn" data-a="livePi" data-i="${i}">Player instructions</button><button class="btn" data-a="liveSubFor" data-id="${id}">Substitute</button></div>` : ''}`;
}

// The tactics page during a match: the pitch with every player (the same tokens as the tactics page), swaps and roles.
function livePitch(L, S) {
  const pos = positions({ ...S, fam: 100 }, true, 0.5, 0.45);
  const toks = S.on.map((id, i) => {
    const slot = FORMATIONS[S.ip][i], q = pos[i] || [slot[1], slot[2]], pl = slot[0];
    if (!id) return `<button class="tok live-gap-token ${L.swapFrom === i ? 'swap-picked' : ''}" style="left:${q[0] * 100}%;top:${q[1] * 100}%" data-a="liveTok" data-i="${i}" aria-label="${pl} empty position: move a player here"><span class="tk-pos">${pitchPosLabel(pl)}</span><span class="tk-n">Empty</span><span class="tk-r">Move player here</span></button>`;
    const p = G.players[id], role = ROLES[pl][S.roles[i]] || ROLES[pl][0];
    return `<button class="tok ${L.swapFrom === i ? 'swap-picked' : ''} ${L.roleSlot === i ? 'sel' : ''}" style="left:${q[0] * 100}%;top:${q[1] * 100}%" data-a="liveTok" data-i="${i}"><span class="tk-pos">${pitchPosLabel(pl)}</span><span class="tk-n">${esc(p.ln)}</span><span class="tk-r">${esc(role.n)}</span></button>`;
  }).join('');
  return `<div class="tpitch ip"><div class="tp-lines"></div>${toks}</div>`;
}
function liveRoleChoices(L, S) {
  return L.roleSlot != null && S.on[L.roleSlot] ? (() => {
    const i = L.roleSlot, pl = FORMATIONS[S.ip][i][0];
    return `<h4 class="lbl">Role for ${POS_NAME[pl]}</h4><div class="chips">${ROLES[pl].map((r, k) => `<button class="chip ${S.roles[i] === k ? 'on' : ''}" data-a="liveRole" data-i="${i}" data-k="${k}">${r.n}</button>`).join('')}</div>`;
  })() : '';
}
function liveXiHtml(L, S) {
  return S.on.map((id, i) => {
    const pos = FORMATIONS[S.ip][i][0], p = G.players[id];
    if (!id || !p) return `<button class="row act live-xi-gap ${L.swapFrom === i ? 'swap-picked' : ''}" data-a="liveTok" data-i="${i}" aria-label="${pos} empty position: move a player here"><span class="pos">${pos}</span><span class="grow"><b>Empty position</b><small>Move an on-pitch player here</small></span><span class="chev">›</span></button>`;
    return `<button class="row act live-xi-player ${L.swapFrom === i ? 'swap-picked' : ''} ${L.roleSlot === i ? 'sel' : ''}" data-a="liveTok" data-i="${i}" data-player-id="${id}"><span class="pos">${pos}</span><span class="grow"><b>${esc(pname(p))}</b><small>${esc(roleName(S, i))}${S.cap === id ? ' · Captain' : ''}</small></span>${liveFitnessHtml(S, id)}</button>`;
  }).join('');
}

function liveGapAccess(S) {
  return S.on.some(id => !id) ? `<div class="card"><p class="muted">${S.on.filter(Boolean).length} players on pitch. Move a team-mate into an empty position; his old position becomes empty.</p><button class="btn wide" data-a="liveGap">Reorganize positions</button></div>` : '';
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
    const xi = L.tacticsView !== 'pitch', label = L.swapMode ? (L.swapFrom != null ? 'Now choose the player to swap with' : 'Choose a player to swap') : 'Swap positions';
    updateLiveFitness(L);
    sheet(`<h3 class="sh-t">In-match tactics</h3>
      ${liveGapAccess(S)}
      <div class="seg" role="tablist" aria-label="Line-up view"><button id="liveXiTab" role="tab" class="${xi ? 'on' : ''}" aria-selected="${xi}" aria-controls="liveXiPanel" data-a="liveTacticsView" data-v="xi">First XI</button><button id="livePitchTab" role="tab" class="${xi ? '' : 'on'}" aria-selected="${!xi}" aria-controls="livePitchPanel" data-a="liveTacticsView" data-v="pitch">Formation</button></div>
      <div class="btns"><button class="btn sm ${L.swapMode ? 'pri' : ''}" data-a="liveSwapMode">${label}</button></div>
      <section id="liveXiPanel" role="tabpanel" aria-labelledby="liveXiTab" ${xi ? '' : 'hidden'}><h4 class="lbl">First XI <small>· ${S.on.filter(Boolean).length} on pitch · Condition & fatigue</small></h4><div class="list live-xi">${liveXiHtml(L, S)}</div></section>
      <section id="livePitchPanel" role="tabpanel" aria-labelledby="livePitchTab" ${xi ? 'hidden' : ''}>${livePitch(L, S)}</section>
      <p class="muted">${L.swapMode ? 'Choose two players to swap places, or a player and an empty position to move him. Keepers swap only with keepers.' : 'Choose a player to change his role, or an empty position to move a team-mate there.'}</p>${liveRoleChoices(L, S)}
      <div class="field"><label>In possession</label>${selectHtml('lt-ip', Object.keys(FORMATIONS), S.ip, 'liveShape')}</div>
      <div class="field"><label>Out of possession</label>${selectHtml('lt-oop', Object.keys(FORMATIONS), S.oop, 'liveShape')}</div>
      <div class="field"><label>Tactical style</label><div class="chips">${Object.entries(STYLES).map(([k, s]) => `<button class="chip ${styleOf(S) === k ? 'on' : ''}" data-a="liveStyle" data-v="${k}">${s.n}</button>`).join('')}</div></div>
      ${INSTRUCTIONS.map(ins => `<div class="field"><label>${ins.n}</label><div class="seg">${ins.o.map((o, i) => `<button class="${S[ins.k] === i ? 'on' : ''}" data-a="liveIns" data-k="${ins.k}" data-v="${i}">${o}</button>`).join('')}</div></div>`).join('')}
      <h4 class="lbl">Set pieces & captain</h4>
      <div class="card two">${[['cap', 'Captain'], ['pk', 'Penalties'], ['fk', 'Free kicks'], ['ck', 'Corners']].map(([k, n]) => `<div class="field"><label>${n}</label>${selectHtml('lsp-' + k, [['', 'Automatic']].concat(S.on.filter(Boolean).map(id => [id, pname(G.players[id])])), S[k] ?? '', 'liveSp', `data-k="${k}"`)}</div>`).join('')}</div>
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
  if (kind === 'gap') { // a man down: move one of the side into the gap, or keep it
    const gaps = S.on.map((id, i) => id ? -1 : i).filter(i => i >= 0), ip = FORMATIONS[S.ip];
    const gap = gaps.includes(L.gapSlot) ? L.gapSlot : gaps[0]; L.gapSlot = gap;
    const list = gap != null ? S.on.map((id, i) => (id ? `<button class="row act" data-a="gapMove" data-id="${id}" data-i="${gap}"><span class="pos">${ip[i][0]}</span><span class="grow">${esc(pname(G.players[id]))}<small>${esc(roleName(S, i))}</small></span></button>` : '')).join('') : '';
    sheet(`<h3 class="sh-t">A man down</h3>
      <p class="muted">${gap != null ? `The gap is at ${ip[gap][0]}. Move an on-pitch player into it: the spot he leaves becomes the new gap. This uses no substitution.` : 'There are no empty positions.'}</p>
      ${gaps.length > 1 ? `<div class="chips" aria-label="Empty positions">${gaps.map(i => `<button class="chip ${gap === i ? 'on' : ''}" data-a="liveGap" data-i="${i}">${ip[i][0]} · position ${i + 1}</button>`).join('')}</div>` : ''}
      <div class="list">${list}</div>
      <button class="btn wide" data-a="liveSheet" data-k="tactics">In-match tactics</button>
      <button class="row act" data-a="closeSheet"><span class="grow">Keep the gap</span></button>`, opts);
  }
  if (kind === 'subs') {
    const ip = FORMATIONS[S.ip];
    const on = S.on.map((id, i) => (id ? `<button class="row act live-sub-player ${L.subSel === id ? 'sel' : ''}" data-a="subOut" data-id="${id}"><span class="pos">${pitchPosLabel(ip[i][0])}</span>${liveSubPlayerInfo(S,id)}${liveFitnessHtml(S,id)}</button>` : '')).join('');
    const bench = S.bench.map(id => { const p = G.players[id]; return `<button class="row act live-sub-player" data-a="subIn" data-id="${id}" ${L.subSel && canSub(M, S) ? '' : 'disabled'}><span class="pos">${pitchPosLabel(p.pos)}</span>${liveSubPlayerInfo(S,id)}${liveFitnessHtml(S,id)}</button>`; }).join('');
    sheet(`<h3 class="sh-t">Substitutions <small>${(M.extra ? 6 : 5) - S.subs} left · ${Math.max(0, (M.extra ? 4 : 3) - S.wins)} windows</small></h3>
      ${liveGapAccess(S)}
      <p class="muted">${L.subSel ? 'Now pick a replacement from the bench.' : 'Pick a player to take off.'}</p>
      <h4 class="lbl">On the pitch</h4><div class="list">${on}</div>
      <h4 class="lbl">Bench</h4><div class="list">${bench || '<p class="muted">No substitutes left.</p>'}</div>`, opts);
  }
}
