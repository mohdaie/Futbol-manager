'use strict';
/* ===== live.js =====
   The 2D match: canvas pitch, player dots, ball animation, commentary,
   team talks, touchline shouts, in-match tactics and substitutions.
   Key moments only (as in Football Manager): the engine's action chain for a minute
   (ev.seq from sim.js) is replayed step by step; quiet minutes pass quickly.
   Movement is visual only (the engine has already decided what happens): players run at their own pace
   with momentum, the defending back line holds a line, attackers stay onside until they make a run, and the
   ball goes to where a team-mate is or is running to.
   The match in progress is kept in the save (G.live) every minute, so leaving the screen, refreshing,
   or saving and loading resumes it at the same minute instead of restarting it. */

const SPEED_MS = { 1: 1000, 2: 520, 4: 260 };
// Duration of each action, relative to one speed unit.
const ACT_DUR = { pass: 0.75, thru: 0.95, long: 1.15, cross: 1.05, drib: 0.95, shot: 0.55, head: 0.5, clear: 0.8, tackle: 0.5, foul: 0.6, regain: 0.5 };
const ACT_ARC = { long: 0.05, cross: 0.045, clear: 0.04 };
let LIVE = null;

function newLive(M, fid) {
  const bottom = M.sides[0].user ? 0 : 1;
  M.live = true;
  M.onAsync = evs => evs.forEach(e => { if (LIVE && LIVE.M === M) pushFeed(LIVE, e.t === 'sub' ? 'info' : 'tac', commLine(LIVE, e), e.side); });
  LIVE = { M, G, fid, bottom, ball: { x: 0.5, y: 0.5 }, q: [], cur: null, poss: 0, t: 0, last: 0, paused: false, hold: 0, dots: [[], []], disp: [0, 0], feed: [], overlay: null, done: false, raf: 0, cv: null, ctx: null, W: 0, H: 0, placed: false, subSel: null, colors: null, pins: {}, due: {}, focus: null, kick: true, line: null, carrier: null };
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
  G.live = { fid: L.fid, M: L.M, poss: L.poss, feed: L.feed.slice(0, 8).map(f => ({ k: f.k, txt: f.txt, min: f.min, side: f.side, at: 0 })) };
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
  L.poss = K.poss || 0; L.feed = K.feed || []; L.kick = false; L.paused = !M.ended;
  pushFeed(L, 'info', `Match resumed at ${M.min}'. Press Play to carry on.`);
  return true;
}
window.addEventListener('pagehide', () => liveKeep());
document.addEventListener('visibilitychange', () => { if (document.hidden) liveKeep(); });

const tickMs = () => SPEED_MS[G.settings.speed] || 700;

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

function bindLive() {
  const L = LIVE;
  if (!L) return;
  const cv = document.getElementById('pitch');
  if (!cv || UI.s !== 'match') return;
  const wrap = cv.parentElement;
  const dpr = window.devicePixelRatio || 1;
  const w = wrap.clientWidth, h = wrap.clientHeight, ar = 0.68;
  let W = w, H = w / ar;
  if (H > h) { H = h; W = h * ar; }
  cv.style.width = W + 'px'; cv.style.height = H + 'px';
  cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
  cv.onclick = e => {
    const rc = cv.getBoundingClientRect(), mx = 8, px = (e.clientX - rc.left - mx) / (W - 2 * mx), py = (e.clientY - rc.top - mx) / (H - 2 * mx);
    let best = null, bd = 0.06;
    [0, 1].forEach(si => L.dots[si].forEach((d, i) => { if (d && L.M.sides[si].on[i]) { const dd = Math.hypot(d.x - px, (d.y - py) * 1.4); if (dd < bd) { bd = dd; best = [si, i]; } } }));
    if (best) { L.sel = best; L.selId = L.M.sides[best[0]].on[best[1]]; openLiveSheet('pl'); }
  };
  L.cv = cv; L.ctx = cv.getContext('2d'); L.ctx.setTransform(dpr, 0, 0, dpr, 0, 0); L.W = W; L.H = H;
  if (!L.placed) {
    const tg = liveTargets(L);
    [0, 1].forEach(si => { L.dots[si] = tg[si].map(t => (t ? { x: t[0], y: t[1], vx: 0, vy: 0 } : { x: 0.5, y: 0.5, vx: 0, vy: 0 })); });
    L.placed = true;
  }
  updateBoard(L);
  renderFeed(L);
  if (!L.raf) { L.last = 0; L.raf = requestAnimationFrame(liveFrame); }
}

function stopLive() { if (LIVE && LIVE.raf) cancelAnimationFrame(LIVE.raf); if (LIVE) { LIVE.raf = 0; liveKeep(LIVE); } }

function liveFrame(ts) {
  const L = LIVE;
  if (!L || !L.cv || !document.body.contains(L.cv)) { if (L) L.raf = 0; return; }
  const dt = Math.min(64, ts - (L.last || ts)); L.lastDt = dt;
  L.last = ts; L.t += dt;
  if (!L.paused) {
    if (L.hold > 0) L.hold -= dt;
    else if (L.cur || L.q.length) advanceBall(L, dt);
    else if (!L.M.ended) liveStep(L);
    else if (!L.done) onFullTime(L);
  }
  if (L.overlay) { L.overlay.t -= dt; if (L.overlay.t <= 0 && !L.overlay.stay) L.overlay = null; }
  moveDots(L, dt);
  draw(L);
  L.raf = requestAnimationFrame(liveFrame);
}

function liveStep(L) {
  liveKeep(L); // everything up to this minute has been shown
  const evs = stepMatch(L.M, false);
  scriptEvents(L, evs);
  updateBoard(L, true);
  if (UI.popup && UI.popup.key === 'live:pl') { const b = document.querySelector('#layer .sh-body'), h = plCardHtml(L); if (b && h) b.innerHTML = h; }
}

// Side si's point (x, y) in its own frame -> canvas (the user's side attacks upwards).
const toCanvas = (L, si, x, y) => (si === L.bottom ? [x, y] : [1 - x, 1 - y]);
function slotOf(L, pid) {
  for (const si of [0, 1]) { const i = L.M.sides[si].on.indexOf(pid); if (pid && i >= 0) return [si, i]; }
  return null;
}
/* ---------- movement ---------- */
const PITCH_M = [68, 105];
const timeK = () => 3 * 520 / tickMs(); // the replay runs about three times real time at 2x
// Top speed in metres per animation millisecond: pace and agility, slower when tired.
function topSpeed(L, S, id) {
  const p = G.players[id], a = p ? p.at : null, cond = S.cond[id] ?? 100;
  return (6.3 + (a ? a[A.pac] * 0.13 + a[A.agi] * 0.03 : 1.6)) * (0.8 + 0.2 * cond / 100) * timeK() / 1000;
}
// The offside line for attacking side a, in its own frame (attacking towards y = 0): the second-last
// defender as he actually stands, the ball if it is further forward, never inside a's own half.
function liveLine(L, a) {
  const d = 1 - a, O = L.M.sides[d];
  let deep = 0;
  O.on.forEach((id, i) => { const p = L.dots[d][i]; if (id && i > 0 && p) deep = Math.max(deep, toCanvas(L, d, p.x, p.y)[1]); });
  return Math.min(0.5, 1 - deep, toCanvas(L, a, L.ball.x, L.ball.y)[1]);
}
function pinPoint(L, pin) { return Array.isArray(pin) ? pin : [L.ball.x + (pin.ox || 0), L.ball.y + (pin.oy || 0)]; }
// Where each player wants to be (canvas frame). The shape follows where the ball is going (L.focus),
// not every frame of its flight, so players read the play instead of chasing the ball.
function liveTargets(L) {
  const f = L.focus || L.ball;
  const own = [0, 1].map(si => {
    const S = L.M.sides[si], att = L.poss === si, [bx, by] = toCanvas(L, si, f.x, f.y);
    const q = positions(S, att && !L.kick, bx, by);
    if (!att) { // the back line holds a line
      const back = q.map((p, i) => (p && i && LINE[FORMATIONS[S.ip][i][0]] === 1 ? i : -1)).filter(i => i > 0);
      const h = Math.min(avg(back, i => q[i][1]), Math.max(by + 0.1, 0.8)); // no deeper than needed
      back.forEach(i => { q[i][1] = h + (q[i][1] - h) * 0.2; });
    }
    // A compact team: nobody more than about 40 metres behind the ball (the back line steps up behind the play).
    q.forEach((p, i) => { if (p && i) p[1] = Math.min(p[1], Math.max(by, 0.2) + (att ? 0.4 : 0.36)); });
    if (L.kick) q.forEach((p, i) => { if (p && i) p[1] = Math.max(p[1], att ? 0.505 : 0.56); });
    return q;
  });
  const a = L.poss;
  if (!L.kick && (a === 0 || a === 1)) {
    // Stay onside until the run is on: behind the line as it stands and where it is heading.
    const d = 1 - a;
    let deep = 0;
    own[d].forEach((p, i) => { if (p && i) deep = Math.max(deep, p[1]); });
    const line = Math.max(liveLine(L, a), Math.min(0.5, 1 - deep, toCanvas(L, a, L.ball.x, L.ball.y)[1]));
    own[a].forEach((p, i) => { if (p && i && !L.pins[a + ':' + i]) p[1] = Math.max(p[1], line + 0.022); });
  }
  return own.map((q, si) => q.map((p, i) => {
    if (!p) return null;
    const pin = L.pins[si + ':' + i];
    if (pin) return pinPoint(L, pin);
    const t = L.t / 1000 + i * 1.7 + si * 3;
    return toCanvas(L, si, p[0] + Math.sin(t * 0.6) * 0.004, p[1] + Math.cos(t * 0.5) * 0.003);
  }));
}

// Players accelerate, run and slow down into position. A player on the ball stays with it; a receiver
// times his run to arrive with the pass (L.due).
function moveDots(L, dt) {
  const tg = liveTargets(L);
  [0, 1].forEach(si => {
    const S = L.M.sides[si];
    tg[si].forEach((t, i) => {
      if (!t) return;
      const d = L.dots[si][i] || (L.dots[si][i] = { x: t[0], y: t[1], vx: 0, vy: 0 }), key = si + ':' + i, pin = L.pins[key];
      if (pin && pin.hold) { const b = Math.min(1, dt / 40); d.x += (t[0] - d.x) * b; d.y += (t[1] - d.y) * b; d.vx = d.vy = 0; return; }
      const dx = (t[0] - d.x) * PITCH_M[0], dy = (t[1] - d.y) * PITCH_M[1], dist = Math.hypot(dx, dy);
      const top = topSpeed(L, S, S.on[i]);
      let want = Math.min(pin ? top : top * (dist > 10 ? 0.9 : 0.6), dist / 260);
      const due = L.due[key];
      if (pin && due > L.t) want = Math.max(want, Math.min(dist / (due - L.t), top * 1.6));
      const vx = dist > 0.05 ? dx / dist * want : 0, vy = dist > 0.05 ? dy / dist * want : 0, k = Math.min(1, dt / 140);
      d.vx = (d.vx || 0) + (vx - (d.vx || 0)) * k; d.vy = (d.vy || 0) + (vy - (d.vy || 0)) * k;
      d.x += d.vx * dt / PITCH_M[0]; d.y += d.vy * dt / PITCH_M[1];
    });
  });
  // Players don't stand on top of each other: ease apart anyone closer than about 3 metres.
  const all = [];
  [0, 1].forEach(si => L.dots[si].forEach((d, i) => { if (d && L.M.sides[si].on[i] && !L.pins[si + ':' + i]?.hold) all.push(d); }));
  for (let a = 0; a < all.length; a++) for (let b = a + 1; b < all.length; b++) {
    const p = all[a], q = all[b], dx = (q.x - p.x) * PITCH_M[0], dy = (q.y - p.y) * PITCH_M[1], m = Math.hypot(dx, dy);
    if (m >= 3.2 || m < 1e-6) continue;
    const push = Math.min(1, dt / 120) * (3.2 - m) / 2 / m;
    p.x -= dx * push / PITCH_M[0]; p.y -= dy * push / PITCH_M[1]; q.x += dx * push / PITCH_M[0]; q.y += dy * push / PITCH_M[1];
  }
}
// How long a player needs to reach a point at full speed (animation ms).
function reachMs(L, key, pt) {
  const [si, i] = key.split(':').map(Number), d = L.dots[si][i], S = L.M.sides[si];
  return d ? Math.hypot((pt[0] - d.x) * PITCH_M[0], (pt[1] - d.y) * PITCH_M[1]) / topSpeed(L, S, S.on[i]) : 0;
}
// A team-mate to pass to in a quiet spell: someone 10-30 metres away, mostly sideways or forwards.
function quietTarget(L, si) {
  const S = L.M.sides[si], from = L.ball, fwd = si === L.bottom ? -1 : 1, c = [];
  S.on.forEach((id, i) => {
    const d = L.dots[si][i]; if (!id || !i || !d) return;
    const m = Math.hypot((d.x - from.x) * PITCH_M[0], (d.y - from.y) * PITCH_M[1]);
    if (m > 6 && m < 32) c.push([i, (1 + Math.max(0, (d.y - from.y) * fwd) * 4) * (m > 10 ? 1 : 0.4)]);
  });
  if (!c.length) return null;
  let r = R() * c.reduce((t, x) => t + x[1], 0);
  return c.find(x => (r -= x[1]) <= 0)?.[0] ?? c[0][0];
}

// Short commentary for the steps of a key moment.
// Short commentary for the steps of a key moment: [text, side it is about].
function stepLine(L, st) {
  const n = id => (id && G.players[id] ? pname(G.players[id]) : ''), o = 1 - st.s;
  if (st.k === 'thru' && st.res === 'ok') return [`${n(st.pid)} slides a pass in behind for ${n(st.to)}.`, st.s];
  if (st.k === 'drib' && st.res === 'ok' && st.oid) return [`${n(st.pid)} skips past ${n(st.oid)}.`, st.s];
  if (st.k === 'drib' && st.res === 'lost' && st.oid) return [`${n(st.oid)} wins the ball off ${n(st.pid)}.`, o];
  if (st.k === 'cross' && st.res === 'claim') return [`${n(st.oid)} comes out and claims the cross.`, o];
  if (st.k === 'long' && st.res === 'ok') return [`Long ball forward, ${n(st.to)} wins the header.`, st.s];
  if (st.flick) return [`${n(st.pid)} flicks it on for ${n(st.to)}.`, st.s];
  if (st.k === 'regain') return [`The ${clubName(L.M.sides[st.s].cid)} win it straight back high up the pitch.`, st.s];
  if ((st.k === 'pass' || st.k === 'thru') && st.res === 'lost' && st.oid) return [`${n(st.oid)} intercepts.`, o];
  if (st.k === 'tackle') return [G.players[st.pid] && G.players[st.pid].pos === 'GK' ? `${n(st.pid)} rushes off his line to stop the run.` : `${n(st.pid)} gets back to stop the run.`, st.s];
  return ['', null];
}

function scriptEvents(L, evs) {
  const M = L.M, T = tickMs(), ev = evs[0];
  L.q.push({ fn: () => { L.poss = ev.side; L.pins = {}; L.due = {}; L.line = null; L.kick = false; } });
  const told = new Set();
  const foulLine = e => {
    told.add(e);
    if (e.t === 'yellow' || e.t === 'red') {
      L.q.push({ fn: () => { pushFeed(L, e.t, commLine(L, e), e.fside); L.overlay = { big: e.t === 'red' ? 'RED CARD' : 'YELLOW', small: pname(G.players[e.pid]), t: 1100, card: e.t }; } });
      L.q.push({ hold: 1000 });
    } else L.q.push({ fn: () => pushFeed(L, 'info', commLine(L, e), e.fside) });
  };
  if (ev.key && ev.seq && ev.seq.length) {
    if (ev.counter) L.q.push({ fn: () => pushFeed(L, 'info', `The ${clubName(M.sides[ev.side].cid)} break forward quickly.`, ev.side) });
    ev.seq.forEach((st, k) => {
      const from = toCanvas(L, st.s, st.x0, st.y0), actor = slotOf(L, st.pid), recv = slotOf(L, st.to), opp = slotOf(L, st.oid);
      const onBall = ['drib', 'shot', 'head', 'foul', 'regain'].includes(st.k), goalSide = s => (s === L.bottom ? 0.022 : -0.022);
      let to = toCanvas(L, st.s, st.x1, st.y1), rkey = null;
      if (k === 0 && actor && !onBall) {
        // The move starts with the ball being worked to the first player where he stands.
        L.q.push({ fn: () => { L.pins = { [actor.join(':')]: from }; L.carrier = actor; L.focus = { x: from[0], y: from[1] }; } });
        L.q.push({ x: from[0], y: from[1], d: T * 0.5, rk: actor.join(':') });
      }
      if (st.res === 'offside' && recv) {
        // Caught beyond the line as the pass is played.
        L.q.push({ fn: () => { L.pins = { [recv.join(':')]: toCanvas(L, st.s, st.x1, st.line - 0.025) }; if (actor) L.pins[actor.join(':')] = { ox: 0, oy: 0, hold: true }; } });
        L.q.push({ hold: T * 0.6 });
      }
      L.q.push({ fn: () => {
        const keep = {};
        // A normal pass goes to where the receiver can take it onside.
        if (st.k === 'pass' && recv) { const a = toCanvas(L, st.s, to[0], to[1]); to = toCanvas(L, st.s, a[0], Math.max(a[1], liveLine(L, st.s) + 0.012)); }
        if (actor) keep[actor.join(':')] = st.k === 'drib' ? { ox: 0, oy: 0, hold: true } : [L.ball.x, L.ball.y];
        if (recv) keep[recv.join(':')] = to;
        if (opp) keep[opp.join(':')] = st.k === 'drib' ? { ox: 0, oy: goalSide(opp[0]) } : [to[0] + (to[0] < 0.5 ? 0.025 : -0.025), to[1] + goalSide(opp[0])];
        rkey = recv && !onBall ? recv.join(':') : null;
        // Intercepted or claimed: the ball goes to the defender who gets to it.
        if (opp && st.k !== 'drib' && (st.res === 'lost' || st.res === 'claim')) { rkey = opp.join(':'); to = keep[rkey]; }
        if (st.k === 'cross') { // runners attack the near post, the penalty spot and the far post
          const near = st.x0 < 0.5 ? -1 : 1, spots = [[0.5 + near * 0.06, 0.065], [0.5, 0.11], [0.5 - near * 0.08, 0.075]];
          const S = L.M.sides[st.s], runners = S.on.map((id, i) => (id && i && id !== st.pid && id !== st.to && LINE[FORMATIONS[S.ip][i][0]] >= 3 ? i : -1)).filter(i => i > 0);
          runners.sort((a, b) => L.dots[st.s][a].y * (st.s === L.bottom ? 1 : -1) - L.dots[st.s][b].y * (st.s === L.bottom ? 1 : -1));
          runners.slice(0, 3).forEach((i, n) => { keep[st.s + ':' + i] = toCanvas(L, st.s, spots[n][0], spots[n][1]); });
        }
        L.pins = keep; L.carrier = actor; L.focus = { x: to[0], y: to[1] };
        if (st.k !== 'clear' && st.k !== 'tackle' && st.k !== 'foul') L.poss = st.s;
        if (st.res === 'offside') { L.line = toCanvas(L, st.s, 0, st.line)[1]; }
        const [txt, ts] = stepLine(L, st); if (txt) pushFeed(L, 'info', txt, ts);
      } });
      L.q.push({ to: () => to, d: T * (ACT_DUR[st.k] || 0.8), arc: ACT_ARC[st.k] || 0, rkf: () => rkey, carry: st.k === 'drib' && actor ? actor.join(':') : null });
      if (st.res === 'offside') {
        L.q.push({ fn: () => { pushFeed(L, 'info', commLine(L, ev), 1 - ev.side); L.overlay = { big: 'OFFSIDE', small: pname(G.players[ev.pid]), t: 1200, flag: true }; } });
        L.q.push({ hold: 1200 });
      }
      if (st.k === 'foul') { const e = evs.find(x => ['foul', 'yellow', 'red'].includes(x.t) && x.pid === st.pid && x !== ev && !told.has(x)); if (e) foulLine(e); }
      if (st.res === 'lost' && k === ev.seq.length - 1) L.q.push({ fn: () => { L.poss = 1 - st.s; } });
    });
    const shotEv = ['goal', 'save', 'miss'].includes(ev.t);
    if (ev.t === 'goal') {
      L.q.push({ fn: () => { L.disp[ev.side]++; updateBoard(L); pushFeed(L, 'goal', commLine(L, ev), ev.side); L.overlay = { big: 'GOAL', small: pname(G.players[ev.pid]) + ' ' + ev.min + "'", t: 1900, side: ev.side }; } });
      L.q.push({ hold: 1900 });
      L.q.push({ fn: () => { L.poss = 1 - ev.side; L.pins = {}; L.carrier = null; L.kick = true; L.focus = { x: 0.5, y: 0.5 }; } });
      L.q.push({ x: 0.5, y: 0.5, d: 350 });
      L.q.push({ hold: 900 }); // back to their own halves for the restart
    } else if (shotEv) {
      L.q.push({ fn: () => pushFeed(L, 'chance', commLine(L, ev), ev.side) });
      L.q.push({ hold: 350 });
    }
  } else {
    // A quiet minute: a couple of passes between team-mates.
    for (let n = 0; n < 2; n++) {
      let rk = null;
      L.q.push({ fn: () => {
        const i = quietTarget(L, ev.side); rk = i == null ? null : ev.side + ':' + i;
        L.pins = {}; L.carrier = rk ? [ev.side, i] : null;
        if (rk) { const d = L.dots[ev.side][i]; L.pins[rk] = [d.x, d.y]; L.focus = { x: d.x, y: d.y }; }
      } });
      L.q.push({ to: () => (rk ? L.pins[rk] : [L.ball.x, L.ball.y]), d: T * 0.4, rkf: () => rk });
    }
    if (R() < 0.08) L.q.push({ fn: () => pushFeed(L, 'info', fillerLine(L, ev), ev.side) });
  }
  evs.forEach(e => { if (!told.has(e) && (e.t === 'yellow' || e.t === 'red' || (e.t === 'foul' && e !== ev))) foulLine(e); });
  evs.slice(1).filter(e => !['yellow', 'red', 'foul'].includes(e.t)).forEach(e => L.q.push({ fn: () => {
    pushFeed(L, e.t === 'inj' ? 'inj' : e.t === 'tac' ? 'tac' : 'info', commLine(L, e), e.side);
    if (e.t === 'inj' && M.sides[e.side].user) { L.paused = true; updateBoard(L); toast(`${pname(G.players[e.pid])} is injured. Make a substitution.`); openLiveSheet('subs'); }
  } }));
  if (ev.ht) L.q.push({ fn: () => { L.kick = true; L.pins = {}; L.carrier = null; L.focus = { x: 0.5, y: 0.5 }; L.ball.x = 0.5; L.ball.y = 0.5; L.overlay = { big: 'HALF TIME', small: L.disp.join(' - '), t: 1, stay: true }; L.paused = true; updateBoard(L); openTeamTalk(L); } });
}

function advanceBall(L, dt) {
  if (!L.cur) {
    const c = L.q.shift();
    if (c.fn) { c.fn(); return; }
    if (c.hold) { L.hold = c.hold; return; }
    c.sx = L.ball.x; c.sy = L.ball.y; c.e = 0;
    if (c.to) [c.x, c.y] = c.to();
    if (c.rkf) c.rk = c.rkf();
    // The pass waits for the run: it arrives with the receiver, within reason.
    if (c.rk) {
      const lim = c.d * 2.4, need = reachMs(L, c.rk, [c.x, c.y]) * 1.05;
      if (need > lim) { // too far to get there: played to where he can reach
        const [si, i] = c.rk.split(':').map(Number), d = L.dots[si][i], f = lim / need;
        c.x = d.x + (c.x - d.x) * f; c.y = d.y + (c.y - d.y) * f;
        if (Array.isArray(L.pins[c.rk])) L.pins[c.rk] = [c.x, c.y];
        L.focus = { x: c.x, y: c.y };
      }
      c.d = clamp(need, c.d, lim); L.due[c.rk] = L.t + c.d;
    }
    if (c.carry) c.d = clamp(reachMs(L, c.carry, [c.x, c.y]) * 1.25, c.d, c.d * 2);
    L.cur = c;
  }
  const c = L.cur;
  c.e += dt;
  const k = Math.min(1, c.e / c.d), s = c.arc ? k : k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
  L.ball.x = c.sx + (c.x - c.sx) * s; L.ball.y = c.sy + (c.y - c.sy) * s;
  L.ball.h = c.arc ? Math.sin(Math.PI * k) * c.arc : 0;
  if (k >= 1) { L.cur = null; L.ball.h = 0; }
}

function draw(L) {
  const g = L.ctx, W = L.W, H = L.H, m = 8;
  const X = x => m + x * (W - 2 * m), Y = y => m + y * (H - 2 * m), pw = W - 2 * m, ph = H - 2 * m;
  for (let i = 0; i < 12; i++) { g.fillStyle = i % 2 ? '#24804F' : '#2A8A56'; g.fillRect(0, (H / 12) * i, W, H / 12 + 1); }
  g.strokeStyle = 'rgba(255,255,255,.62)'; g.lineWidth = 1.4;
  g.strokeRect(m, m, pw, ph);
  g.beginPath(); g.moveTo(m, Y(0.5)); g.lineTo(W - m, Y(0.5)); g.stroke();
  g.beginPath(); g.arc(X(0.5), Y(0.5), pw * 0.135, 0, Math.PI * 2); g.stroke();
  [0, 1].forEach(end => {
    const dir = end ? -1 : 1, y0 = end ? H - m : m;
    g.strokeRect(X(0.5 - 0.296), y0, pw * 0.593, dir * ph * 0.157);
    g.strokeRect(X(0.5 - 0.135), y0, pw * 0.269, dir * ph * 0.052);
    g.fillStyle = 'rgba(255,255,255,.7)'; g.beginPath(); g.arc(X(0.5), y0 + dir * ph * 0.105, 1.6, 0, Math.PI * 2); g.fill();
    g.fillStyle = 'rgba(255,255,255,.18)'; g.fillRect(X(0.5 - 0.054), end ? y0 : y0 - 6, pw * 0.108, 6);
    g.strokeRect(X(0.5 - 0.054), end ? y0 : y0 - 6, pw * 0.108, 6);
  });
  g.fillStyle = 'rgba(255,255,255,.7)'; g.beginPath(); g.arc(X(0.5), Y(0.5), 1.8, 0, Math.PI * 2); g.fill();

  const r = Math.max(7, W * 0.026);
  g.textAlign = 'center'; g.textBaseline = 'middle'; g.font = `700 ${Math.round(r * 1.05)}px "Plus Jakarta Sans", system-ui, sans-serif`;
  [1 - L.bottom, L.bottom].forEach(si => {
    const S = L.M.sides[si], col = L.colors[si === L.bottom ? 0 : 1];
    S.on.forEach((id, i) => {
      if (!id) return;
      const d = L.dots[si][i]; if (!d) return;
      const x = X(d.x), y = Y(d.y), gk = i === 0;
      g.fillStyle = 'rgba(0,0,0,.25)'; g.beginPath(); g.ellipse(x, y + r * 0.7, r * 0.9, r * 0.35, 0, 0, Math.PI * 2); g.fill();
      g.fillStyle = gk ? col.gk : col.f; g.strokeStyle = gk ? '#1B1B1B' : col.s; g.lineWidth = 2;
      g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill(); g.stroke();
      if (L.carrier && L.carrier[0] === si && L.carrier[1] === i) { g.strokeStyle = '#2DE2EE'; g.lineWidth = 1.5; g.beginPath(); g.arc(x, y, r + 3, 0, Math.PI * 2); g.stroke(); }
      g.fillStyle = isLight(gk ? col.gk : col.f) ? '#111' : '#FFF';
      g.fillText(String(G.players[id] ? G.players[id].no : ''), x, y + 0.5);
      // Live markers: condition bar and match rating under the player.
      const cond = S.cond[id] ?? 100, rt = S.rat[id] ?? 6.5, bw = r * 2, by = y + r + 3;
      g.fillStyle = 'rgba(0,0,0,.45)'; g.fillRect(x - bw / 2, by, bw, 3);
      g.fillStyle = cond >= 75 ? '#2BD46A' : cond >= 60 ? '#F5C518' : '#F43F5E'; g.fillRect(x - bw / 2, by, bw * cond / 100, 3);
      g.font = `700 ${Math.round(r * 0.78)}px "Plus Jakarta Sans", system-ui, sans-serif`;
      g.fillStyle = rt >= 7.5 ? '#7DF59E' : rt < 6 ? '#FF8A9B' : 'rgba(255,255,255,.9)';
      g.fillText(rt.toFixed(1), x, by + 3 + r * 0.6);
      g.font = `700 ${Math.round(r * 1.05)}px "Plus Jakarta Sans", system-ui, sans-serif`;
      if (L.sel && L.sel[0] === si && L.sel[1] === i) { g.strokeStyle = '#FFFFFF'; g.lineWidth = 2; g.beginPath(); g.arc(x, y, r + 5, 0, Math.PI * 2); g.stroke(); }
    });
  });
  if (L.line != null) { // offside: the line of the second-last defender at the moment of the pass
    g.save(); g.strokeStyle = '#F2C14E'; g.lineWidth = 2; g.setLineDash([6, 4]);
    g.beginPath(); g.moveTo(m, Y(L.line)); g.lineTo(W - m, Y(L.line)); g.stroke(); g.restore();
  }
  const bx = X(L.ball.x), byy = Y(L.ball.y), lift = (L.ball.h || 0) * H, br = 3.8 + (L.ball.h || 0) * 40;
  g.fillStyle = 'rgba(0,0,0,.35)'; g.beginPath(); g.arc(bx + 1.5, byy + 2, 3.6, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#FFFFFF'; g.strokeStyle = '#1B1B1B'; g.lineWidth = 1;
  g.beginPath(); g.arc(bx, byy - lift, br, 0, Math.PI * 2); g.fill(); g.stroke();

  if (L.overlay) {
    const o = L.overlay;
    g.fillStyle = 'rgba(34,8,47,.7)'; g.fillRect(0, H / 2 - 44, W, 88);
    g.fillStyle = o.card === 'red' ? '#F0605D' : o.card === 'yellow' || o.flag ? '#F2C14E' : '#2DE2EE';
    g.font = `800 ${Math.round(W * 0.12)}px "Plus Jakarta Sans", system-ui, sans-serif`;
    g.fillText(o.big, W / 2, H / 2 - 8);
    g.fillStyle = '#EAF2EE'; g.font = `600 ${Math.round(W * 0.045)}px "Plus Jakarta Sans", system-ui, sans-serif`;
    g.fillText(o.small || '', W / 2, H / 2 + 26);
  }
}

function updateBoard(L) {
  const el = id => document.getElementById(id);
  if (!el('sbScore')) return;
  const M = L.M, [H, W] = M.sides;
  el('sbScore').textContent = L.disp[0] + ' - ' + L.disp[1];
  const min = M.min > 90 ? '90+' + (M.min - 90) : String(M.min);
  el('sbClock').textContent = (L.done ? 'FT' : min + "'");
  const tot = H.st.pos + W.st.pos || 1;
  el('sbPoss').style.width = Math.round((H.st.pos / tot) * 100) + '%';
  el('sbPossTxt').textContent = Math.round((H.st.pos / tot) * 100) + '% possession ' + Math.round((W.st.pos / tot) * 100) + '%';
  const pb = el('btnPause');
  if (pb) pb.textContent = L.paused ? 'Play' : 'Pause';
  const sp = el('btnSpeed');
  if (sp) sp.textContent = G.settings.speed + 'x';
  const ft = el('ftBar');
  if (ft) ft.hidden = !L.done;
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
  L.q = []; L.cur = null; L.hold = 0; L.paused = false;
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
