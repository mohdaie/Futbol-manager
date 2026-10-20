'use strict';
/* ===== live.js =====
   The 2D match: canvas pitch, player dots, ball animation, commentary,
   team talks, touchline shouts, in-match tactics and substitutions.
   Key moments only (as in Football Manager): the engine's action chain for a minute
   (ev.seq from sim.js) is replayed step by step; quiet minutes pass quickly.
   Players stand where positions() puts them, and the players in each action move to it. */

const SPEED_MS = { 1: 1000, 2: 520, 4: 260 };
// Duration of each action, relative to one speed unit.
const ACT_DUR = { pass: 0.75, thru: 0.95, long: 1.15, cross: 1.05, drib: 0.95, shot: 0.55, head: 0.5, clear: 0.8, tackle: 0.5, foul: 0.6, regain: 0.5 };
const ACT_ARC = { long: 0.05, cross: 0.045, clear: 0.04 };
let LIVE = null;

function startLive(fx) {
  if (LIVE && !LIVE.done && LIVE.fid === fx.id) return go('match');
  const M = createMatch(fx);
  const bottom = M.sides[0].user ? 0 : 1;
  M.live = true;
  M.onAsync = evs => evs.forEach(e => { if (LIVE && LIVE.M === M) pushFeed(LIVE, e.t === 'sub' ? 'info' : 'tac', commLine(LIVE, e)); });
  LIVE = { M, fid: fx.id, bottom, ball: { x: 0.5, y: 0.5 }, q: [], cur: null, poss: 0, t: 0, last: 0, paused: false, hold: 0, dots: [[], []], disp: [0, 0], feed: [], overlay: null, done: false, raf: 0, cv: null, ctx: null, W: 0, H: 0, placed: false, subSel: null, colors: null, pins: {}, line: null, carrier: null };
  LIVE.colors = kitColors(M.sides[bottom].cid, M.sides[1 - bottom].cid);
  pushFeed(LIVE, 'info', `Kick-off at ${G.clubs[fx.h].ground}. ${clubName(fx.h)} v ${clubName(fx.a)}.`);
  go('match');
}

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
  L.cv = cv; L.ctx = cv.getContext('2d'); L.ctx.setTransform(dpr, 0, 0, dpr, 0, 0); L.W = W; L.H = H;
  if (!L.placed) {
    [0, 1].forEach(si => { L.dots[si] = teamTargets(L, si).map(t => (t ? { x: t[0], y: t[1] } : { x: 0.5, y: 0.5 })); });
    L.placed = true;
  }
  updateBoard(L);
  renderFeed(L);
  if (!L.raf) { L.last = 0; L.raf = requestAnimationFrame(liveFrame); }
}

function stopLive() { if (LIVE && LIVE.raf) cancelAnimationFrame(LIVE.raf); if (LIVE) LIVE.raf = 0; }

function liveFrame(ts) {
  const L = LIVE;
  if (!L || !L.cv || !document.body.contains(L.cv)) { if (L) L.raf = 0; return; }
  const dt = Math.min(64, ts - (L.last || ts));
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
  const evs = stepMatch(L.M, false);
  scriptEvents(L, evs);
  updateBoard(L, true);
}

// Side si's point (x, y) in its own frame -> canvas (the user's side attacks upwards).
const toCanvas = (L, si, x, y) => (si === L.bottom ? [x, y] : [1 - x, 1 - y]);
function slotOf(L, pid) {
  for (const si of [0, 1]) { const i = L.M.sides[si].on.indexOf(pid); if (pid && i >= 0) return [si, i]; }
  return null;
}
// Where each player wants to be: the engine's positions() for the current ball and possession,
// unless he is one of the players in the action being shown (L.pins).
function teamTargets(L, si) {
  const S = L.M.sides[si], hasBall = L.poss === si;
  const [bx, by] = si === L.bottom ? [L.ball.x, L.ball.y] : [1 - L.ball.x, 1 - L.ball.y];
  const pos = positions(S, hasBall, bx, by);
  return pos.map((q, i) => {
    if (!q) return null;
    const pin = L.pins[si + ':' + i];
    if (pin) return pin === 'ball' ? [L.ball.x, L.ball.y] : pin;
    const t = L.t / 1000 + i * 1.7 + si * 3;
    const [x, y] = toCanvas(L, si, q[0] + Math.sin(t * 0.9) * 0.006, q[1] + Math.cos(t * 0.7) * 0.006);
    return [x, y];
  });
}

function moveDots(L, dt) {
  // Faster players get to their spot quicker.
  [0, 1].forEach(si => {
    const S = L.M.sides[si], tg = teamTargets(L, si);
    tg.forEach((t, i) => {
      if (!t) return;
      const p = G.players[S.on[i]], sp = 200 + (20 - (p ? p.at[A.pac] : 10)) * 9;
      const k = 1 - Math.exp(-dt / (L.pins[si + ':' + i] ? sp * 0.6 : sp));
      const d = L.dots[si][i] || (L.dots[si][i] = { x: t[0], y: t[1] });
      d.x += (t[0] - d.x) * k; d.y += (t[1] - d.y) * k;
    });
  });
}

// Short commentary for the steps of a key moment.
function stepLine(L, st) {
  const n = id => (id && G.players[id] ? pname(G.players[id]) : '');
  if (st.k === 'thru' && st.res === 'ok') return `${n(st.pid)} slides a pass in behind for ${n(st.to)}.`;
  if (st.k === 'drib' && st.res === 'ok' && st.oid) return `${n(st.pid)} skips past ${n(st.oid)}.`;
  if (st.k === 'drib' && st.res === 'lost' && st.oid) return `${n(st.oid)} wins the ball off ${n(st.pid)}.`;
  if (st.k === 'cross' && st.res === 'claim') return `${n(st.oid)} comes out and claims the cross.`;
  if (st.k === 'long' && st.res === 'ok') return `Long ball forward, ${n(st.to)} wins the header.`;
  if (st.flick) return `${n(st.pid)} flicks it on for ${n(st.to)}.`;
  if (st.k === 'regain') return `The ${clubName(L.M.sides[st.s].cid)} win it straight back high up the pitch.`;
  if ((st.k === 'pass' || st.k === 'thru') && st.res === 'lost' && st.oid) return `${n(st.oid)} intercepts.`;
  if (st.k === 'tackle') return `${n(st.pid)} gets back to stop the run.`;
  return '';
}

function scriptEvents(L, evs) {
  const M = L.M, T = tickMs(), ev = evs[0];
  L.q.push({ fn: () => { L.poss = ev.side; L.pins = {}; L.line = null; } });
  if (ev.key && ev.seq && ev.seq.length) {
    if (ev.counter) L.q.push({ fn: () => pushFeed(L, 'info', `The ${clubName(M.sides[ev.side].cid)} break forward quickly.`) });
    ev.seq.forEach((st, k) => {
      const from = toCanvas(L, st.s, st.x0, st.y0), to = toCanvas(L, st.s, st.x1, st.y1);
      const actor = slotOf(L, st.pid), recv = slotOf(L, st.to), opp = slotOf(L, st.oid);
      L.q.push({ fn: () => {
        const keep = {};
        if (actor) keep[actor.join(':')] = st.k === 'drib' || st.k === 'shot' || st.k === 'head' ? 'ball' : from;
        if (recv) keep[recv.join(':')] = to;
        if (opp) keep[opp.join(':')] = st.k === 'drib' ? 'ball' : [to[0] + (to[0] < 0.5 ? 0.03 : -0.03), to[1] + (opp[0] === L.bottom ? 0.03 : -0.03)];
        L.pins = keep; L.carrier = actor;
        if (st.k !== 'clear' && st.k !== 'tackle' && st.k !== 'foul') L.poss = st.s;
        if (st.res === 'offside') { L.line = toCanvas(L, st.s, 0, st.line)[1]; }
        const txt = stepLine(L, st); if (txt) pushFeed(L, 'info', txt);
      } });
      L.q.push({ x: to[0], y: to[1], sx0: from[0], sy0: from[1], d: T * (ACT_DUR[st.k] || 0.8), arc: ACT_ARC[st.k] || 0 });
      if (st.res === 'offside') {
        L.q.push({ fn: () => { pushFeed(L, 'info', commLine(L, ev)); L.overlay = { big: 'OFFSIDE', small: pname(G.players[ev.pid]), t: 1200, flag: true }; } });
        L.q.push({ hold: 1200 });
      }
      if (st.res === 'lost' && k === ev.seq.length - 1) L.q.push({ fn: () => { L.poss = 1 - st.s; } });
    });
    const shotEv = ['goal', 'save', 'miss'].includes(ev.t);
    if (ev.t === 'goal') {
      L.q.push({ fn: () => { L.disp[ev.side]++; updateBoard(L); pushFeed(L, 'goal', commLine(L, ev)); L.overlay = { big: 'GOAL', small: pname(G.players[ev.pid]) + ' ' + ev.min + "'", t: 1900, side: ev.side }; } });
      L.q.push({ hold: 1900 });
      L.q.push({ fn: () => { L.poss = 1 - ev.side; L.pins = {}; } });
      L.q.push({ x: 0.5, y: 0.5, d: 350 });
    } else if (shotEv) {
      L.q.push({ fn: () => pushFeed(L, 'chance', commLine(L, ev)) });
      L.q.push({ hold: 350 });
    }
  } else {
    // A quiet minute: the ball moves around the middle of the pitch quickly.
    const [cx, cy] = toCanvas(L, ev.side, rf(0.25, 0.75), rf(0.45, 0.75));
    L.q.push({ x: cx, y: cy, d: T * 0.45 });
    if (R() < 0.08) L.q.push({ fn: () => pushFeed(L, 'info', fillerLine(L, ev)) });
  }
  evs.forEach(e => {
    if (e.t === 'yellow' || e.t === 'red') {
      L.q.push({ fn: () => { pushFeed(L, e.t, commLine(L, e)); L.overlay = { big: e.t === 'red' ? 'RED CARD' : 'YELLOW', small: pname(G.players[e.pid]), t: 1100, card: e.t }; } });
      L.q.push({ hold: 1000 });
    } else if (e.t === 'foul' && e !== ev) {
      L.q.push({ fn: () => pushFeed(L, 'info', commLine(L, e)) });
    }
  });
  evs.slice(1).filter(e => !['yellow', 'red', 'foul'].includes(e.t)).forEach(e => L.q.push({ fn: () => {
    pushFeed(L, e.t === 'inj' ? 'inj' : e.t === 'tac' ? 'tac' : 'info', commLine(L, e));
    if (e.t === 'inj' && M.sides[e.side].user) { L.paused = true; updateBoard(L); toast(`${pname(G.players[e.pid])} is injured. Make a substitution.`); openLiveSheet('subs'); }
  } }));
  if (ev.ht) L.q.push({ fn: () => { L.overlay = { big: 'HALF TIME', small: L.disp.join(' - '), t: 1, stay: true }; L.paused = true; updateBoard(L); openTeamTalk(L); } });
}

function advanceBall(L, dt) {
  if (!L.cur) {
    const c = L.q.shift();
    if (c.fn) { c.fn(); return; }
    if (c.hold) { L.hold = c.hold; return; }
    c.sx = c.sx0 ?? L.ball.x; c.sy = c.sy0 ?? L.ball.y; c.e = 0;
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

function pushFeed(L, k, txt) {
  if (!txt) return;
  const M = L.M;
  L.feed.unshift({ k, txt, min: M.min });
  if (L.feed.length > 40) L.feed.length = 40;
  renderFeed(L);
}
function renderFeed(L) {
  const el = document.getElementById('feed');
  if (!el) return;
  el.innerHTML = L.feed.slice(0, 5).map(f => `<li class="fd-${f.k}"><b>${f.min ? f.min + "'" : ''}</b><span>${esc(f.txt)}</span></li>`).join('');
}

function commLine(L, ev) {
  const M = L.M, S = M.sides[ev.side], O = M.sides[1 - ev.side], n = id => pname(G.players[id]);
  const tn = 'the ' + clubName(S.cid);
  const fk = ev.fk ? 'Free kick. ' : ev.ck ? 'Corner. ' : '';
  switch (ev.t) {
    case 'goal': return ev.pen ? `Penalty to ${tn}. ${n(ev.pid)} sends the keeper the wrong way. ${L.disp.join('-')}.` : `${fk}${n(ev.pid)} scores for ${tn}${ev.aid ? ', set up by ' + n(ev.aid) : ''}. ${L.disp.join('-')}.`;
    case 'save': return `${fk}${n(ev.pid)} forces a save from ${O.on[0] ? n(O.on[0]) : 'the keeper'}.${ev.corner ? ' Corner.' : ''}`;
    case 'miss': return ev.sp ? `${fk}${n(ev.pid)} heads over.` : `${fk}${n(ev.pid)} ${pick(['drags a shot wide', 'fires over the bar', 'shoots straight into a defender', 'curls it just past the post'])}.${ev.corner ? ' Corner.' : ''}`;
    case 'yellow': return `Yellow card for ${n(ev.pid)} (${clubName(M.sides[ev.fside].cid)}).`;
    case 'red': return ev.second ? `Second yellow for ${n(ev.pid)}. Off he goes.` : `Straight red card for ${n(ev.pid)}.`;
    case 'foul': return `Foul by ${n(ev.pid)}. Free kick to ${tn}.`;
    case 'offside': return `Flag up. ${n(ev.pid)} is offside, timing his run too early.`;
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
  pushFeed(L, 'info', eff > 2 ? 'The players respond well to the team talk.' : eff < 0 ? 'The team talk does not go down well.' : 'The players take the message on board.');
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
  pushFeed(L, 'info', `${G.manager} on the touchline: ${SHOUTS.find(s => s.k === k).n}.`);
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
  finishMatch(L.M);
  finishRound();
  L.overlay = { big: 'FULL TIME', small: clubName(L.M.sides[0].cid) + ' ' + L.disp.join(' - ') + ' ' + clubName(L.M.sides[1].cid), t: 1, stay: true };
  pushFeed(L, 'info', 'The referee blows for full time.');
  updateBoard(L);
}

function openLiveSheet(kind) {
  const L = LIVE, M = L.M, S = M.sides[L.bottom], O = M.sides[1 - L.bottom];
  const opts = { key: 'live:' + kind, restore: () => openLiveSheet(kind), valid: () => LIVE === L && !L.done };
  if (kind === 'stats') {
    const [H, W] = M.sides, tot = H.st.pos + W.st.pos || 1;
    const row = (lbl, a, b) => `<div class="cmp"><b>${a}</b><span>${lbl}</span><b>${b}</b></div>`;
    const rat = X => X.played.map(id => [G.players[id], X.rat[id]]).sort((a, b) => b[1] - a[1]).map(([p, r]) => `<div class="row sm"><span class="no">${p.no}</span><span class="grow">${esc(pname(p))}${X.off.includes(p.id) ? ' <small>off</small>' : ''}</span><span class="rt ${r >= 7.5 ? 'good' : r < 6 ? 'bad' : ''}">${r.toFixed(1)}</span></div>`).join('');
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
      <p class="muted">Changes apply to this match only. Your saved tactic stays as it is.</p>`, opts);
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
