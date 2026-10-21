'use strict';
// Rehearse the shared engine anchors without playing a fixture or editing a save.
const SHAPE_ROUTE = [
  [.5, .83, true, 'Build from the back'], [.15, .72, true, 'Find the full-back'],
  [.29, .53, true, 'Progress through the half-space'], [.85, .40, true, 'Switch to the right'],
  [.88, .24, true, 'Attack down the flank'], [.69, .10, true, 'Reach the cut-back zone'],
  [.50, .20, true, 'Find Zone 14'], [.75, .44, false, 'Lose the ball: recover the block'],
  [.12, .57, false, 'Slide left together'], [.88, .66, false, 'Switch: tuck the far side in'],
  [.50, .82, false, 'Protect the box'], [.50, .20, false, 'Opponent builds from the back'],
];
let SHAPE_DEMO = null;
function demoTactic(key = 'current') {
  const T = JSON.parse(JSON.stringify(G.tactics));
  if (key !== 'current') {
    if (key === 'low') { applyStyle(T, 'counter'); Object.assign(T, { ip: '5-4-1', oop: '5-4-1', roles: Array(11).fill(0), width: 0 }); }
    else applyStyle(T, key);
    T.slots = autoPick(G.club, T.ip).xi;
  }
  T.on = T.slots.slice(); T.map = shapeMap(T.ip, T.oop); T.fam = 100;
  return T;
}
const demoPlans = D => [teamPlan(D.T, D.has, D.bx, D.by), teamPlan(D.O, !D.has, 1 - D.bx, 1 - D.by)];
function demoScene(D, n) {
  D.step = (n + SHAPE_ROUTE.length) % SHAPE_ROUTE.length;
  [D.bx, D.by, D.has, D.caption] = SHAPE_ROUTE[D.step]; D.elapsed = 0;
}
SCREENS.shapedemo = {
  render() {
    if (!SHAPE_DEMO || SHAPE_DEMO.G !== G) {
      SHAPE_DEMO = { G, T: demoTactic(), O: demoTactic('bal'), key: 'current', playing: true, last: 0, elapsed: 0, step: 0, dots: [[], []], mirror: false };
      demoScene(SHAPE_DEMO, 0);
    }
    const D = SHAPE_DEMO;
    return `<h1 class="h1">Team shape demo</h1>
      <div class="shape-controls">${selectHtml('shapeStyle', [['current', 'My tactic'], ...(D.key === 'custom' ? [['custom', 'Custom rehearsal']] : []), ...Object.entries(STYLES).map(([k, v]) => [k, v.n]), ['low', 'Low block rehearsal']], D.key, 'shapeStyle')}
        <button class="btn" data-a="shapeMirror">${D.mirror ? 'View: away' : 'View: home'}</button></div>
      <div class="shape-stage"><canvas id="shapePitch" aria-label="Animated pitch with teams, ball and zones"></canvas><div class="shape-caption" id="shapeCaption"></div></div>
      <div class="shape-controls"><button class="btn" data-a="shapeStep" data-n="-1" aria-label="Previous ball position">←</button>
        <button class="btn pri" data-a="shapePlay" id="shapePlay">${D.playing ? 'Pause' : 'Play'}</button>
        <button class="btn" data-a="shapeStep" data-n="1" aria-label="Next ball position">→</button>
        <button class="btn" data-a="shapePoss">Change possession</button></div>
      <p class="muted shape-help">Red: your team · Blue: opponent · Gold rings: cover. Tap the pitch to move the ball. Faint circles show target positions.</p>
      <div class="card shape-readout" id="shapeReadout"></div>
      <details class="card"><summary>Change formation & roles</summary><p class="muted">Try inverted full-backs, inside forwards or a false nine. These changes only affect this rehearsal.</p>
        <div class="two">${fld('With the ball', selectHtml('shapeIp', Object.keys(FORMATIONS), D.T.ip, 'shapeFormation'))}${fld('Without the ball', selectHtml('shapeOop', Object.keys(FORMATIONS), D.T.oop, 'shapeFormation'))}</div>
        ${FORMATIONS[D.T.ip].map(([pos], i) => fld(`${i + 1} · ${pos}`, `<select id="shapeRole${i}" data-c="shapeRole" data-i="${i}">${ROLES[pos].map((r, k) => `<option value="${k}" ${k === (D.T.roles[i] || 0) ? 'selected' : ''}>${esc(r.n)}</option>`).join('')}</select>`)).join('')}
      </details><p class="muted">Layers 1–2: shape and position jobs. Pressing triggers, transitions and later rulebook layers are still to follow.</p>`;
  },
  after() { bindShapeDemo(); },
};
ACT.shapePlay = () => { const D = SHAPE_DEMO; D.playing = !D.playing; D.last = 0; document.getElementById('shapePlay').textContent = D.playing ? 'Pause' : 'Play'; };
ACT.shapeStep = ds => { demoScene(SHAPE_DEMO, SHAPE_DEMO.step + Number(ds.n)); SHAPE_DEMO.playing = false; render(); };
ACT.shapePoss = () => { const D = SHAPE_DEMO; D.has = !D.has; D.playing = false; D.caption = 'Possession changed'; render(); };
ACT.shapeMirror = () => { SHAPE_DEMO.mirror = !SHAPE_DEMO.mirror; render(); };
CHG.shapeStyle = () => { const D = SHAPE_DEMO; D.key = val('shapeStyle'); D.T = demoTactic(D.key); D.dots = [[], []]; render(); };
CHG.shapeFormation = () => {
  const D = SHAPE_DEMO, ip = val('shapeIp'), oop = val('shapeOop');
  if (ip !== D.T.ip) { D.T.ip = ip; D.T.roles = Array(11).fill(0); D.T.on = autoPick(G.club, ip).xi; }
  D.T.oop = oop; D.T.map = shapeMap(ip, oop); D.key = 'custom'; render();
};
CHG.shapeRole = (v, ds) => { const i = Number(ds.i); SHAPE_DEMO.T.roles[i] = Number(v); SHAPE_DEMO.key = 'custom'; render(); };
function bindShapeDemo() {
  const D = SHAPE_DEMO, cv = document.getElementById('shapePitch');
  if (!cv) return;
  if (D.raf) cancelAnimationFrame(D.raf);
  D.cv = cv; D.last = 0;
  cv.addEventListener('pointerdown', ev => {
    const r = cv.getBoundingClientRect(), k = Math.min((r.width - 20) / 68, (r.height - 20) / 105);
    let x = clamp((ev.clientX - r.left - r.width / 2) / k + 34, 0, 68) / 68;
    let y = clamp((ev.clientY - r.top - r.height / 2) / k + 52.5, 0, 105) / 105;
    if (D.mirror) { x = 1 - x; y = 1 - y; }
    D.bx = x; D.by = y; D.playing = false; D.caption = 'Your ball position'; document.getElementById('shapePlay').textContent = 'Play';
  });
  D.raf = requestAnimationFrame(shapeDemoFrame);
}
function shapeDemoFrame(now) {
  const D = SHAPE_DEMO;
  if (!D || UI.s !== 'shapedemo' || !D.cv?.isConnected || D.G !== G) return;
  const dt = D.last ? Math.min((now - D.last) / 1000, .05) : 0; D.last = now;
  if (!document.hidden && D.playing) { D.elapsed += dt; if (D.elapsed >= 6) demoScene(D, D.step + 1); }
  const plans = demoPlans(D);
  plans.forEach((p, s) => p.positions.forEach((q, i) => {
    if (!q) { D.dots[s][i] = null; return; }
    const target = s ? [1 - q[0], 1 - q[1]] : q;
    if (!D.dots[s][i]) D.dots[s][i] = target.slice();
    const dot = D.dots[s][i], dx = (target[0] - dot[0]) * 68, dy = (target[1] - dot[1]) * 105;
    const k = Math.min(1, dt * 6 / (Math.hypot(dx, dy) || 1));
    dot[0] += (target[0] - dot[0]) * k; dot[1] += (target[1] - dot[1]) * k;
  }));
  drawShapeDemo(D, plans);
  const a = shapeMetrics(plans[0], D.bx, D.by), b = shapeMetrics(plans[1], 1 - D.bx, 1 - D.by), z = pitchZone(D.bx, D.by);
  document.getElementById('shapeCaption').textContent = `${D.step + 1}/${SHAPE_ROUTE.length} · ${D.caption}`;
  const html = `<b>${esc(PHASE_NAMES[plans[0].phase])} · ${esc(LANE_NAMES[z.lane])}</b><p>${D.has ? `Cover target: ${a.back} + ${a.screen} · ${a.behind} behind the ball · Opponent block: ${b.depth.toFixed(1)} m` : `Your block target: ${a.depth.toFixed(1)} m deep · Defend the centre`}</p>
    <small>${z.zone14 ? 'Zone 14 · ' : z.cutback ? 'Cut-back zone · ' : z.box ? 'Penalty box · ' : ''}${D.has ? `Attacking lanes L → R: ${a.lanes.join(' / ')}${a.crowded.length ? ' · Crowded: ' + a.crowded.join(', ') : ''}${a.empty.length ? ' · Empty: ' + a.empty.join(', ') : ''}` : 'Watch the back line, midfield and forwards slide together.'}</small>
    ${D.has && plans[0].jobs ? `<details><summary>Player jobs</summary>${plans[0].jobs.map((job, i) => job ? `<div>${i + 1} · ${esc(roleName(D.T, i))}: ${esc(job)}</div>` : '').join('')}</details>` : ''}`;
  const el = document.getElementById('shapeReadout'); if (el.innerHTML !== html) el.innerHTML = html;
  D.raf = requestAnimationFrame(shapeDemoFrame);
}
function drawShapeDemo(D, plans) {
  const cv = D.cv, W = cv.clientWidth, H = cv.clientHeight, dpr = window.devicePixelRatio || 1;
  if (cv.width !== Math.round(W * dpr) || cv.height !== Math.round(H * dpr)) { cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); }
  const g = cv.getContext('2d'); g.setTransform(dpr, 0, 0, dpr, 0, 0);
  const k = Math.min((W - 20) / 68, (H - 20) / 105), X = x => W / 2 + (x - 34) * k, Y = y => H / 2 + (y - 52.5) * k;
  const point = q => [X((D.mirror ? 1 - q[0] : q[0]) * 68), Y((D.mirror ? 1 - q[1] : q[1]) * 105)];
  g.fillStyle = '#123d30'; g.fillRect(0, 0, W, H);
  for (let i = 0; i < 7; i++) { g.fillStyle = i % 2 ? '#195740' : '#1c6047'; g.fillRect(X(0), Y(i * 15), 68 * k, 15 * k); }
  g.fillStyle = '#d5b96433';
  const rect = (x, y, w, h) => { if (D.mirror) { x = 68 - x - w; y = 105 - y - h; } g.fillRect(X(x), Y(y), w * k, h * k); };
  rect(24.8, 17, 18.4, 13); rect(13.8, 6, 11, 12); rect(43.2, 6, 11, 12);
  g.strokeStyle = '#ffffff30'; g.setLineDash([3, 4]); g.lineWidth = 1;
  PITCH.lanes.slice(1, -1).forEach(x => { g.beginPath(); g.moveTo(X(x), Y(0)); g.lineTo(X(x), Y(105)); g.stroke(); });
  [35, 70].forEach(y => { g.beginPath(); g.moveTo(X(0), Y(y)); g.lineTo(X(68), Y(y)); g.stroke(); }); g.setLineDash([]);
  g.strokeStyle = '#ffffff99'; g.strokeRect(X(0), Y(0), 68 * k, 105 * k);
  g.beginPath(); g.moveTo(X(0), Y(52.5)); g.lineTo(X(68), Y(52.5)); g.stroke();
  g.beginPath(); g.arc(X(34), Y(52.5), 9.15 * k, 0, Math.PI * 2); g.stroke();
  [0, 1].forEach(e => { g.strokeRect(X(13.85), Y(e ? 88.5 : 0), 40.3 * k, 16.5 * k); g.strokeRect(X(24.85), Y(e ? 99.5 : 0), 18.3 * k, 5.5 * k); });
  plans.forEach((p, s) => {
    const reserves = [...p.rest.back, ...p.rest.screen];
    p.positions.forEach((q, i) => {
      if (!q || !D.dots[s][i]) return;
      const target = s ? [1 - q[0], 1 - q[1]] : q, [tx, ty] = point(target), [x, y] = point(D.dots[s][i]);
      g.strokeStyle = s ? '#7eb9ff66' : '#ff979766'; g.lineWidth = 1; g.beginPath(); g.arc(tx, ty, 7, 0, Math.PI * 2); g.stroke();
      g.fillStyle = i === 0 ? '#ecd16c' : s ? '#62a9ee' : '#f26771'; g.strokeStyle = reserves.includes(i) ? '#ffdc74' : '#102e2b'; g.lineWidth = reserves.includes(i) ? 2.5 : 1.5;
      g.beginPath(); g.arc(x, y, 7, 0, Math.PI * 2); g.fill(); g.stroke();
      g.fillStyle = '#10232d'; g.font = 'bold 8px system-ui'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(String(i + 1), x, y);
    });
  });
  const [x, y] = point([D.bx, D.by]); g.fillStyle = '#fff'; g.strokeStyle = '#0a1713'; g.lineWidth = 2;
  g.beginPath(); g.arc(x, y, 4.5, 0, Math.PI * 2); g.fill(); g.stroke();
  g.fillStyle = '#d8eadd'; g.font = '9px system-ui'; g.textAlign = 'center'; g.fillText(D.mirror ? 'YOUR TEAM ATTACKS ↓' : 'YOUR TEAM ATTACKS ↑', W / 2, 7);
}
