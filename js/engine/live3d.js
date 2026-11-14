'use strict';
/* ===== live3d.js =====
   The live match in 3D: the same minute the 2D view shows (frames every half second and a mark for every
   action), handed to the 3D viewer in match3d/viewer.js. Nothing here changes the match. The viewer, three.js
   and the player model (about 2.2 MB) are fetched the first time the 3D tab is opened; a device that cannot
   run it goes back to 2D with a note. The playback clock, highlights, speed and pausing are live.js's own. */
const LIVE3D = { mod: null };

// Names, height, build and shirt number by side and slot: the viewer redraws a player when his slot changes hands.
function live3dLineup(L) {
  const M = L.M;
  return { min: M.min, on: M.sides.map(S => S.on.map(id => (id && G.players[id] ? pname(G.players[id]) : null))),
    body: M.sides.map(S => S.on.map(id => { const p = id && G.players[id]; return p ? [p.ht || 180, +(typeof bmiOf === 'function' ? bmiOf(p) : 23).toFixed(1), (typeof shirtNumberOf === 'function' ? shirtNumberOf(p) : p.no) || 0] : null; })) };
}
function live3dMeta(L) {
  const M = L.M;
  return { teams: M.sides.map(S => ({ id: S.cid, name: clubName(S.cid) })), colors: [0, 1].map(s => L.colors[s === L.bottom ? 0 : 1]), lineups: [live3dLineup(L)] };
}
// Where the engine has everyone now, as one frame (for the moments before a minute has been played).
function live3dRow(M, t) {
  const sim = M.sim, B = sim.B, f = [t, B.x, B.y, B.z || 0, B.os, B.oi, sim.rs ? sim.rs.k : ''];
  for (let s = 0; s < 2; s++) for (let i = 0; i < 11; i++) { const p = sim.P[s][i]; f.push(p ? p.x : null, p ? p.y : null); }
  for (let s = 0; s < 2; s++) for (let i = 0; i < 11; i++) { const p = sim.P[s][i]; f.push(p ? p.fa ?? 0 : null); }
  return f;
}
// Hand the viewer what has been played: the minute on screen, or the standing positions before kick-off.
function live3dFeed(L) {
  const V = L.v3;
  if (!V || !V.api) return;
  const q = L.mq, M = L.M;
  let rows = q ? q.fr : (M.frames || []);
  if (!rows.length && !V.api.frames) { if (!M.sim && typeof simInit === 'function') simInit(M); const t = M.sim.t; rows = [live3dRow(M, t - 0.5), live3dRow(M, t)]; }
  V.api.push(rows, q ? q.marks : (M.marks || []), live3dLineup(L));
  if (rows.length) V.last = rows[rows.length - 1][0];
}
// Every screen frame while the 3D tab is showing.
function live3dFrame(L, dt) {
  const V = L.v3;
  if (!V || !V.api) return;
  const q = L.mq;
  V.api.frame(q ? q.t0 + q.p : (V.last ?? 0), dt / 1000);
  const o = document.getElementById('m3Over');
  if (o) { const txt = L.overlay ? L.overlay.big + (L.overlay.small ? ' · ' + L.overlay.small : '') : ''; if (o.textContent !== txt) { o.textContent = txt; o.hidden = !txt; } }
}
function live3dStatus(text) { const el = document.getElementById('m3Load'); if (el) { el.textContent = text; el.hidden = !text; } }
function live3dButtons(L) {
  const V = L.v3, cam = document.getElementById('m3Cam'), shade = document.getElementById('m3Shade');
  if (!V || !V.api) return;
  if (cam) cam.textContent = 'Camera: ' + V.api.cams[V.api.cam];
  if (shade) shade.textContent = V.api.shadows ? 'Shadows on' : 'Shadows off';
}
// The 3D tab was opened (or the match screen was drawn again with it open).
async function live3dOpen(L) {
  const panel = document.getElementById('matchPanel-3d');
  if (!panel || !L) return;
  const stage = panel.querySelector('.m3-stage');
  let V = L.v3;
  if (V && V.failed) return live3dFail(L);
  if (V && V.api) { if (V.host.parentElement !== stage) stage.appendChild(V.host); V.api.resize(); live3dStatus(''); live3dButtons(L); return; }
  if (V && V.loading) return;
  V = L.v3 = { loading: true };
  live3dStatus('Loading the 3D view…');
  try {
    const probe = document.createElement('canvas');
    if (!(probe.getContext('webgl2') || probe.getContext('webgl'))) throw new Error('no WebGL');
    const mod = LIVE3D.mod || (LIVE3D.mod = await import('../../match3d/viewer.js?v=' + GAME_VERSION));
    const host = document.createElement('div'), canvas = document.createElement('canvas'), who = document.createElement('div');
    host.className = 'm3-host'; canvas.setAttribute('aria-label', 'Live match in 3D'); who.className = 'm3-who'; who.dataset.m3 = 'who';
    host.append(canvas, who);
    (document.getElementById('matchPanel-3d')?.querySelector('.m3-stage') || stage).appendChild(host);
    const api = await mod.createLive({ canvas, host }, live3dMeta(L));
    if (LIVE !== L) { api.dispose(); return; }
    V.api = api; V.host = host; V.loading = false;
    live3dFeed(L); api.resize(); live3dStatus(''); live3dButtons(L);
    if (!host.isConnected) live3dOpen(L);
  } catch (error) {
    console.error(error);
    L.v3 = { failed: true };
    live3dFail(L);
  }
}
function live3dFail(L) {
  toast('The 3D view could not start on this device. Showing 2D.');
  if (L.matchView === '3d') ACT.matchView({ v: '2d' });
}
function live3dClose(L) { if (L && L.v3 && L.v3.api) { L.v3.api.dispose(); L.v3.host.remove(); } if (L) L.v3 = null; }
