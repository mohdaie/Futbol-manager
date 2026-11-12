/* 3D match viewer: replays one match recorded from the engine (scripts/record-match-3d.cjs).
   The engine gives the ball and 22 players every half second plus a mark for every action;
   this file turns those into positions, facings and the right animation clip for each player. */
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { clone as cloneSkinned } from 'three/addons/utils/SkeletonUtils.js';

const PW = 68, PL = 105, STRIDE = 72, NONE = -32768, BALL_R = 0.11;
// ground speed (m/s) each looping clip was animated for, so feet match the pitch
const LOCO = { Walk: 1.16, Jog: 2.57, Run: 4.7, Dribble: 2.45, Jockey: 0.95, WalkBack: 0.77, WalkDribble: 1.07, SideStep: 0.83 };
// seconds from the start of a clip to the moment of ball contact, and how fast to play it
const CONTACT = { Pass: 0.5, Shoot: 0.417, LongKick: 0.417, Header: 0.567, Tackle: 0.417, FirstTouch: 0.283, ThrowIn: 0.683, KeeperDive: 0.533, KeeperCatch: 0.517, Celebrate: 0, ReceiveInside: 0.34, ReceiveTurn: 0.36, ReceiveSole: 0.36, ReceiveRun: 0.2, Shoulder: 0.22, Stumble: 0, Fall: 0 };
const RATE = { Pass: 1.7, Shoot: 1.25, LongKick: 1.3, Header: 1.3, Tackle: 1.4, FirstTouch: 1.6, ThrowIn: 1.2, KeeperDive: 1.2, KeeperCatch: 1.2, Celebrate: 1, ReceiveInside: 1.25, ReceiveTurn: 1.25, ReceiveSole: 1.2, ReceiveRun: 1, Shoulder: 1, Stumble: 1, Fall: 1 };
// a player already on the move plays only the swing of a kick: seconds kept before and after ball contact
const SWING = { Pass: [0.2, 0.2], LongKick: [0.28, 0.3], Shoot: [0.3, 0.35] };
const SKIN = ['#F1C9A5', '#E0AC86', '#C68863', '#A56B46', '#7A4A2E', '#5A3520'];
const HAIR = ['#1B1410', '#2E2018', '#4A3020', '#7A5632', '#8C6A3A', '#101010'];

const $ = id => document.getElementById(id);
const fail = e => { $('load').textContent = 'Could not load the match: ' + (e && e.message || e); console.error(e); };

// Binary files can also be served as JSON ({"b64": "..."}) where a host only allows text types:
// set window.MATCH3D = { player, ball, frames } to those URLs before this script loads.
async function binary(url) {
  const r = await fetch(url);
  if (!r.ok) throw new Error(url + ' ' + r.status);
  if (!/\.json$/.test(url)) return r.arrayBuffer();
  const raw = atob((await r.json()).b64), out = new Uint8Array(raw.length);
  for (let n = 0; n < raw.length; n++) out[n] = raw.charCodeAt(n);
  return out.buffer;
}

async function boot() {
  const loader = new GLTFLoader(), src = { player: './assets/player.glb', ball: './assets/ball.glb', frames: './data/match.bin', ...(window.MATCH3D || {}) };
  const [meta, bin, playerGltf, ballGltf] = await Promise.all([
    fetch('./data/match.json').then(r => r.json()),
    binary(src.frames),
    binary(src.player).then(b => loader.parseAsync(b, '')),
    binary(src.ball).then(b => loader.parseAsync(b, '')),
  ]);
  start(meta, new Int16Array(bin), playerGltf, ballGltf);
}

function start(meta, F, playerGltf, ballGltf) {
  const times = meta.times, NF = times.length, T_END = times[NF - 1];
  const canvas = $('c');
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#9CC4E4');
  scene.fog = new THREE.Fog('#9CC4E4', 140, 320);
  scene.add(new THREE.HemisphereLight('#FFFFFF', '#3E6B3A', 0.95));
  const sun = new THREE.DirectionalLight('#FFF4DD', 1.15);
  sun.position.set(-40, 80, 30);
  scene.add(sun);
  const camera = new THREE.PerspectiveCamera(30, 1, 0.5, 600);

  buildPitch(scene);

  /* ---------- clips: keep each one in place, the engine owns where players are ---------- */
  const clips = playerGltf.animations.map(clip => {
    const c = clip.clone();
    for (const tr of c.tracks) {
      if (!/hips\.position$/.test(tr.name)) continue;
      const v = tr.values;
      for (let n = 0; n < v.length; n += 3) { if (c.name !== 'KeeperDive') v[n] = v[0]; v[n + 2] = v[2]; }
    }
    return c;
  });

  /* ---------- players ---------- */
  const mats = new Map();
  const mat = (key, color) => { if (!mats.has(key)) mats.set(key, new THREE.MeshLambertMaterial({ color })); return mats.get(key); };
  const hash = s => { let h = 2166136261; for (const ch of String(s)) h = Math.imul(h ^ ch.charCodeAt(0), 16777619) >>> 0; h ^= h >>> 15; h = Math.imul(h, 2246822519) >>> 0; return (h ^ (h >>> 13)) >>> 0; };
  const dark = c => new THREE.Color(c).getHSL({}).l < 0.5;
  function kit(side, i) {
    const t = meta.teams[side], col = meta.colors[side], keeper = i === 0;
    const shirt = keeper ? col.gk : col.f, shorts = keeper ? '#1E2A33' : (col.s && col.s !== col.f ? col.s : (dark(col.f) ? '#F1F1F1' : '#1E2A33'));
    const h = hash(t.id + ':' + i);
    return { shirt, shorts, socks: shirt, skin: SKIN[h % SKIN.length], hair: HAIR[(h >>> 8) % HAIR.length] };
  }
  const P = [[], []];
  for (let s = 0; s < 2; s++) for (let i = 0; i < 11; i++) {
    const k = kit(s, i), root = cloneSkinned(playerGltf.scene);
    root.traverse(o => {
      if (!o.isMesh) return;
      const n = o.material.name;
      const color = n === 'shirt' ? k.shirt : n === 'shorts' ? k.shorts : n === 'socks' ? k.socks
        : ['head', 'neck', 'arms', 'hands', 'legs'].includes(n) ? k.skin : ['hair', 'eyebrows'].includes(n) ? k.hair
        : n === 'boots' ? '#111316' : n === 'boot_soles' ? '#E6E6E6' : n === 'eyes' ? '#F1F1EC' : n === 'pupils' ? '#120C08' : '#8A4840';
      o.material = mat(color, color);
      o.frustumCulled = false;
    });
    const mixer = new THREE.AnimationMixer(root), actions = {};
    for (const c of clips) {
      const a = mixer.clipAction(c);
      if (c.name in LOCO || c.name === 'Idle') a.setLoop(THREE.LoopRepeat, Infinity);
      else { a.setLoop(THREE.LoopOnce, 1); a.clampWhenFinished = true; }
      actions[c.name] = a;
    }
    scene.add(root);
    P[s].push({ root, mixer, actions, cur: null, name: '', shot: null, swing: null, hold: 0, speed: 0, x: 0, z: 0 });
  }
  function play(p, name, fade, rate, sync, from) {
    const next = p.actions[name], prev = p.cur;
    if (prev === next && from == null) { next.setEffectiveTimeScale(rate); return; }
    next.enabled = true; next.reset(); next.setEffectiveTimeScale(rate); next.setEffectiveWeight(1);
    if (from != null) next.time = from;
    if (sync && prev) next.time = (prev.time / prev.getClip().duration) % 1 * next.getClip().duration;
    next.play();
    if (prev && prev !== next) prev.crossFadeTo(next, fade, false);
    p.cur = next; p.name = name;
  }

  /* ---------- ball and ground shadows ---------- */
  const ball = ballGltf.scene;
  ball.traverse(o => { if (o.isMesh) o.material = mat('ball:' + o.material.name, o.material.name === 'ball_hexagons' ? '#F4F4F4' : o.material.name === 'ball_pentagons' ? '#15171A' : '#3A3D42'); });
  scene.add(ball);
  const blobs = new THREE.InstancedMesh(new THREE.CircleGeometry(1, 20).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: '#000000', transparent: true, opacity: 0.28, depthWrite: false }), 23);
  blobs.frustumCulled = false; blobs.renderOrder = 1;
  scene.add(blobs);
  const M4 = new THREE.Matrix4();

  /* ---------- recorded frames ---------- */
  const px = (k, s, i) => F[k * STRIDE + 6 + (s * 11 + i) * 2];
  const py = (k, s, i) => F[k * STRIDE + 7 + (s * 11 + i) * 2];
  const fa = (k, s, i) => F[k * STRIDE + 50 + s * 11 + i] / 1000;
  // A body has weight: between two engine positions he follows a curve through the ones before and after
  // (Catmull-Rom), so he rounds his turns and eases in and out of speed instead of moving in straight pieces.
  const curve = (a, b, c, d, u) => 0.5 * (2 * b + (c - a) * u + (2 * a - 5 * b + 4 * c - d) * u * u + (3 * b - 3 * c + d - a) * u * u * u);
  const frameAt = t => { let lo = 0, hi = NF - 1; while (lo < hi) { const m = (lo + hi + 1) >> 1; if (times[m] <= t) lo = m; else hi = m - 1; } return lo; };

  /* ---------- action cues from the engine's marks ---------- */
  const cues = [];
  const cue = (t, s, i, clip, extra) => { if (i != null && i >= 0 && i < 11) cues.push({ t: t - CONTACT[clip] / RATE[clip], s, i, clip, ...extra }); };
  // Receiving: which first touch a player takes depends on how fast he is moving and whether he turns
  // with it: in stride at a run, on the half-turn, killed under the sole when standing, or the inside of
  // the boot and away. About one in three takes it with the left foot (the clip mirrored).
  const kicksBy = new Map(), touchesBy = new Map();
  for (const m of meta.marks) if (m.k === 'kick' || m.k === 'touch' || m.k === 'duel') {
    const map = m.k === 'kick' ? kicksBy : touchesBy, key = m.s + ':' + m.who;
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(m.t);
  }
  function receive(t, s, i) {
    if (i == null || i < 1 || i > 10) return;
    if ((kicksBy.get(s + ':' + i) || []).some(k => k >= t && k - t < 0.45)) return; // played first time: the kick is the touch
    const k = frameAt(t), k2 = Math.min(NF - 1, k + 1), k3 = Math.min(NF - 1, k + 3);
    if (px(k, s, i) === NONE || px(k2, s, i) === NONE) return;
    const v = Math.hypot(px(k2, s, i) - px(k, s, i), py(k2, s, i) - py(k, s, i)) / 100 / 0.5;
    const turn = Math.abs(Math.atan2(Math.sin(fa(k3, s, i) - fa(k, s, i)), Math.cos(fa(k3, s, i) - fa(k, s, i))));
    const h = hash(Math.round(t * 10) + ':' + s + ':' + i);
    const clip = v > 3.2 ? 'ReceiveRun' : turn > 1.2 ? 'ReceiveTurn' : v < 0.6 && h % 3 === 0 ? 'ReceiveSole' : 'ReceiveInside';
    cue(t, s, i, clip, { mirror: (h >>> 3) % 3 === 0 });
  }
  let lastScorer = null;
  for (const m of meta.marks) {
    if (m.k === 'kick') {
      const k = frameAt(m.t - 0.5), throwIn = F[k * STRIDE + 5] === 1 && m.kind !== 'shot';
      const clip = throwIn ? 'ThrowIn' : m.style === 'header' ? 'Header' : m.kind === 'shot' ? 'Shoot' : ['long', 'cross', 'clear'].includes(m.kind) ? 'LongKick' : 'Pass';
      cue(m.t, m.s, m.who, clip);
    } else if (m.k === 'touch') receive(m.t, m.s, m.who);
    else if (m.k === 'duel') { cue(m.t, m.s, m.who, 'Tackle'); cue(m.t + 0.15, m.os, m.oi, 'Stumble', { soft: true }); } // the man who lost it
    else if (m.k === 'contact') { cue(m.t, m.s, m.who, 'Shoulder', { other: [m.os, m.oi], soft: true }); cue(m.t, m.os, m.oi, 'Shoulder', { other: [m.s, m.who], soft: true }); }
    else if (m.k === 'foul') cue(m.t + 0.1, m.s, m.who, 'Fall');
    else if (m.k === 'sfx') {
      if (m.res === 'goal') lastScorer = { s: m.s, i: m.who };
      if (m.res === 'goal' || m.res === 'save') cue(m.t + (m.flight || 0.4), 1 - m.s, 0, 'KeeperDive', { tx: m.tx });
    } else if (m.k === 'goal') {
      const who = lastScorer && lastScorer.s === m.s ? lastScorer.i : 9;
      [who, 1 + (who + 2) % 10, 1 + (who + 5) % 10, 1 + (who + 7) % 10].forEach((i, n) => cue(m.t + 0.7 + n * 0.35, m.s, i, 'Celebrate', { hold: 5 }));
    }
  }
  for (let k = 1; k < NF; k++) { // a keeper taking a high ball; an outfield player collecting a loose or intercepted one
    const r = k * STRIDE, q = r - STRIDE;
    if (F[r + 4] > 0 && F[r + 3] >= 0 && !F[r + 5] && (F[q + 4] !== F[r + 4] || F[q + 3] !== F[r + 3])
      && !(touchesBy.get(F[r + 3] + ':' + F[r + 4]) || []).some(t => Math.abs(t - times[k]) < 0.8)) receive(times[k], F[r + 3], F[r + 4]);
    if (F[r + 4] === 0 && F[r + 3] >= 0 && (F[q + 4] !== 0 || F[q + 3] !== F[r + 3]) && F[q + 2] > 120) cue(times[k], F[r + 3], 0, 'KeeperCatch');
  }
  cues.sort((a, b) => a.t - b.t);
  const goals = meta.marks.filter(m => m.k === 'goal').sort((a, b) => a.t - b.t);
  const shots = meta.marks.filter(m => m.k === 'shot' || m.k === 'goal').map(m => m.t).sort((a, b) => a - b);

  /* ---------- playback state ---------- */
  let T = 0, speed = 1, playing = true, ci = 0, camMode = 0, noteUntil = 0, cut = true;
  const camPos = new THREE.Vector3(0, 30, 60), camAim = new THREE.Vector3();
  const ballPos = new THREE.Vector3(), prevBall = new THREE.Vector3(), spinAxis = new THREE.Vector3();
  const nameOf = (s, i) => { const min = T / 60; let on = meta.lineups[0].on; for (const l of meta.lineups) if (l.min <= min + 1) on = l.on; return on[s][i] || ''; };
  const note = (text, secs) => { $('note').textContent = text; noteUntil = performance.now() + secs * 1000; };

  function seek(t) {
    T = Math.max(0, Math.min(T_END, t));
    ci = cues.findIndex(c => c.t > T - 0.3); if (ci < 0) ci = cues.length;
    for (const side of P) for (const p of side) { p.shot = null; p.swing = null; p.hold = 0; p.root.scale.x = 1; }
    $('note').textContent = '';
    cut = true;
  }

  function update(dt) {
    if (playing) T = Math.min(T_END, T + dt * speed);
    const k = frameAt(T), k2 = Math.min(NF - 1, k + 1), span = times[k2] - times[k];
    const u = span > 0 && span <= 1 ? (T - times[k]) / span : 0, step = span > 0 && span <= 1 ? span : 0.5;
    const r = k * STRIDE, r2 = k2 * STRIDE;

    // action cues that have come due
    while (ci < cues.length && cues[ci].t <= T) {
      const c = cues[ci++], p = P[c.s][c.i];
      if (T - c.t > 0.4 || (c.soft && p.shot)) continue;
      const rate = RATE[c.clip];
      if (SWING[c.clip] && p.speed > 1) { // keep running: the swing alone, timed to the same contact
        const [pre, post] = SWING[c.clip];
        p.swing = { at: c.t + (CONTACT[c.clip] - pre) / rate, clip: c.clip, from: CONTACT[c.clip] - pre, len: (pre + post) / rate };
        continue;
      }
      if (c.clip === 'KeeperDive') { // the clip dives to the keeper's left; mirror it for the other side
        const a = fa(k, c.s, c.i), left = Math.sin(a) * (c.tx - px(k, c.s, c.i) / 100) > 0 ? 1 : -1;
        p.root.scale.x = left;
      }
      else if (c.other) { // lean into the man: the clip leans right, mirror it if he is on the left
        const a = fa(k, c.s, c.i), ox = px(k, c.other[0], c.other[1]), oy = py(k, c.other[0], c.other[1]);
        p.root.scale.x = Math.sin(a) * (ox - px(k, c.s, c.i)) - Math.cos(a) * (oy - py(k, c.s, c.i)) > 0 ? -1 : 1;
      } else p.root.scale.x = c.mirror ? -1 : 1;
      play(p, c.clip, c.clip.startsWith('Receive') ? 0.14 : 0.08, rate);
      p.shot = { end: T + (c.hold || p.actions[c.clip].getClip().duration / rate) };
      if (c.clip === 'Celebrate' && c.i === (lastScorerAt(T) ?? -1)) note('GOAL! ' + nameOf(c.s, c.i) + ' (' + meta.teams[c.s].name + ')', 6);
    }

    let n = 0;
    const os = F[r + 3], oi = F[r + 4];
    for (let s = 0; s < 2; s++) for (let i = 0; i < 11; i++) {
      const p = P[s][i], x0 = px(k, s, i), x1 = px(k2, s, i);
      if (x0 === NONE) { p.root.visible = false; continue; }
      p.root.visible = true;
      const y0 = py(k, s, i), y1 = py(k2, s, i), jump = x1 === NONE || span > 1;
      const ka = k > 0 && times[k] - times[k - 1] <= 1 && px(k - 1, s, i) !== NONE ? k - 1 : k;
      const kb = k2 < NF - 1 && times[k2 + 1] - times[k2] <= 1 && px(k2 + 1, s, i) !== NONE ? k2 + 1 : k2;
      const x = (jump ? x0 : curve(px(ka, s, i), x0, x1, px(kb, s, i), u)) / 100, y = (jump ? y0 : curve(py(ka, s, i), y0, y1, py(kb, s, i), u)) / 100;
      const vx = jump ? 0 : (x1 - x0) / 100 / step, vy = jump ? 0 : (y1 - y0) / 100 / step, v = Math.hypot(vx, vy);
      let a0 = fa(k, s, i), da = fa(k2, s, i) - a0; da = Math.atan2(Math.sin(da), Math.cos(da));
      const a = a0 + (jump ? 0 : da * u);
      p.x = x - PW / 2; p.z = y - PL / 2; p.speed = v;
      p.root.position.set(p.x, 0, p.z);
      p.root.rotation.y = Math.PI / 2 - a;
      if (p.swing && T >= p.swing.at) {
        const w = p.swing; p.swing = null;
        if (T - w.at < 0.3) { p.root.scale.x = 1; play(p, w.clip, 0.1, RATE[w.clip], false, w.from); p.shot = { end: T + w.len }; }
      }
      if (p.shot && T >= p.shot.end) { p.shot = null; p.root.scale.x = 1; }
      if (!p.shot) {
        // Which way he is going against where he faces: forwards, backwards or sideways. The crouched
        // jockey is only for the defender closing down the man on the ball; anyone else moving backwards
        // simply walks backwards, upright.
        const fwd = v > 0.35 ? (vx * Math.cos(a) + vy * Math.sin(a)) / v : 1, left = vx * Math.sin(a) - vy * Math.cos(a);
        const mine = os === s && oi === i, closing = os === 1 - s && Math.hypot(p.x - ballPos.x, p.z - ballPos.z) < 6;
        let name = v < 0.35 ? 'Idle' : v < 1.9 ? 'Walk' : v < 4.2 ? 'Jog' : 'Run';
        if (mine && v >= 0.35) name = v < 1.9 ? 'WalkDribble' : v < 5.5 ? 'Dribble' : 'Run';
        else if (v >= 0.35 && v < 3.2 && fwd < -0.5) name = closing ? 'Jockey' : 'WalkBack';
        else if (v >= 0.35 && v < 3.2 && fwd < 0.5) name = 'SideStep';
        if (p.name !== name && p.name !== '' && T < (p.hold || 0)) name = p.name in LOCO || p.name === 'Idle' ? p.name : name; // no flicker between clips
        else if (p.name !== name) p.hold = T + 0.35;
        const rate = name === 'Idle' ? 1 : Math.max(0.6, Math.min(2.4, v / LOCO[name]));
        p.root.scale.x = name === 'SideStep' && left < 0 ? -1 : 1; // the clip steps to his left
        play(p, name, p.name === 'Idle' || name === 'Idle' ? 0.25 : 0.18, rate, name !== 'Idle' && p.name in LOCO);
      }
      p.mixer.update(playing ? dt * Math.min(speed, 2) : 0);
      blobs.setMatrixAt(n++, M4.makeScale(0.38, 1, 0.38).setPosition(p.x, 0.02, p.z));
    }

    // ball
    const ka = k > 0 && times[k] - times[k - 1] <= 1 ? k - 1 : k, kb = k2 < NF - 1 && times[k2 + 1] - times[k2] <= 1 ? k2 + 1 : k2;
    const held = os >= 0 && [ka, k2, kb].every(n => F[n * STRIDE + 3] === os && F[n * STRIDE + 4] === oi);
    const lerp = (a, b, n) => (span > 1 ? a : held ? curve(F[ka * STRIDE + n], a, b, F[kb * STRIDE + n], u) : a + (b - a) * u) / 100;
    prevBall.copy(ballPos);
    ballPos.set(lerp(F[r], F[r2], 0) - PW / 2, Math.max(0, (span > 1 ? F[r + 2] : F[r + 2] + (F[r2 + 2] - F[r + 2]) * u) / 100) + BALL_R, lerp(F[r + 1], F[r2 + 1], 1) - PL / 2);
    ball.position.copy(ballPos);
    const dx = ballPos.x - prevBall.x, dz = ballPos.z - prevBall.z, moved = Math.hypot(dx, dz);
    if (moved > 1e-4 && moved < 5) ball.rotateOnWorldAxis(spinAxis.set(dz, 0, -dx).normalize(), moved / BALL_R);
    const bs = 0.16 * (1 + Math.min(1.5, ballPos.y * 0.15));
    blobs.setMatrixAt(n++, M4.makeScale(bs, 1, bs).setPosition(ballPos.x, 0.021, ballPos.z));
    blobs.count = n; blobs.instanceMatrix.needsUpdate = true;

    // camera
    const aspect = camera.aspect, wantPos = new THREE.Vector3(), wantAim = new THREE.Vector3();
    if (camMode === 0) { // behind: the pitch runs up the screen, home side attacks upward
      const d = aspect < 1 ? 27 : 24;
      wantPos.set(ballPos.x * 0.6, d * 0.72, ballPos.z + d); wantAim.set(ballPos.x * 0.85, 0, ballPos.z - 3);
    } else if (camMode === 1) { // television gantry on the touchline
      const d = aspect < 1 ? 64 : 50;
      wantPos.set(-PW / 2 - d * 0.55, d * 0.42, ballPos.z * 0.8); wantAim.set(ballPos.x * 0.5, 0, ballPos.z);
    } else if (camMode === 2) { // close to the ball
      wantPos.set(ballPos.x - 9, 5.5, ballPos.z + 13); wantAim.set(ballPos.x, 0.9, ballPos.z);
    } else { // whole pitch
      const d = aspect < 1 ? 150 : 95;
      wantPos.set(0, d, aspect < 1 ? 8 : d * 0.5); wantAim.set(0, 0, 0);
    }
    const ease = 1 - Math.exp(-dt * 7);
    camPos.lerp(wantPos, cut ? 1 : ease); camAim.lerp(wantAim, cut ? 1 : ease); cut = false;
    camera.position.copy(camPos); camera.lookAt(camAim);

    // HUD
    const g = [0, 0]; for (const m of goals) if (m.t <= T) g[m.s]++;
    $('score').textContent = g[0] + ' - ' + g[1];
    $('clock').textContent = Math.floor(T / 60) + ':' + String(Math.floor(T % 60)).padStart(2, '0');
    if (document.activeElement !== $('seek')) $('seek').value = T;
    if (noteUntil && performance.now() > noteUntil) { $('note').textContent = ''; noteUntil = 0; }
    if (T >= T_END && playing) { playing = false; $('play').textContent = 'Replay'; note('Full time', 60); }
  }
  function lastScorerAt(t) { let who = null; for (const m of meta.marks) { if (m.t > t + 1) break; if (m.k === 'sfx' && m.res === 'goal') who = m.who; } return who; }

  /* ---------- controls ---------- */
  meta.teams.forEach((t, s) => { $('n' + s).textContent = t.name; $('sw' + s).style.background = meta.colors[s].f; });
  $('seek').max = T_END;
  $('seek').addEventListener('input', e => seek(+e.target.value));
  $('play').onclick = () => { if (T >= T_END) { seek(0); playing = true; } else playing = !playing; $('play').textContent = playing ? 'Pause' : 'Play'; };
  $('speed').onclick = () => { speed = { 1: 2, 2: 4, 4: 8, 8: 1 }[speed]; $('speed').textContent = speed + 'x'; };
  const CAMS = ['Behind', 'TV', 'Close', 'Full pitch'];
  $('cam').onclick = () => { camMode = (camMode + 1) % CAMS.length; cut = true; note('Camera: ' + CAMS[camMode], 1.5); };
  $('next').onclick = () => { const t = shots.find(t => t > T + 7); if (t != null) { seek(t - 6); note('Skipped to ' + Math.floor(t / 60) + "'", 2); } else note('No more shots', 2); };

  function resize() {
    const w = window.innerWidth, h = window.innerHeight;
    renderer.setSize(w, h, false); camera.aspect = w / h; camera.fov = w < h ? 38 : 30; camera.updateProjectionMatrix();
  }
  window.addEventListener('resize', resize); resize();

  const q = new URLSearchParams(location.search);
  if (q.has('t')) seek(+q.get('t'));
  if (q.has('cam')) camMode = +q.get('cam') % CAMS.length;
  if (q.has('speed')) { speed = +q.get('speed') || 1; $('speed').textContent = speed + 'x'; }
  const manual = q.has('manual'); // tests drive the clock themselves
  let last = performance.now();
  function frame(now) {
    const dt = Math.min(0.25, (now - last) / 1000); last = now;
    if (!manual) { update(dt); renderer.render(scene, camera); }
    requestAnimationFrame(frame);
  }
  window.match3d = { cueMix: cues.reduce((o, c) => { o[c.clip] = (o[c.clip] || 0) + 1; return o; }, {}), seek, step(dt) { update(dt); renderer.render(scene, camera); }, get time() { return T; }, end: T_END, cues: cues.length, setCam(n) { camMode = n; cut = true; }, clips: clips.map(c => c.name) };
  update(0.3); renderer.render(scene, camera);
  $('load').remove();
  requestAnimationFrame(frame);
}

/* ---------- pitch, lines and goals ---------- */
function buildPitch(scene) {
  const S = 14, cv = document.createElement('canvas');
  cv.width = PW * S; cv.height = PL * S;
  const g = cv.getContext('2d');
  for (let n = 0; n < 15; n++) { g.fillStyle = n % 2 ? '#3F8F45' : '#479A4C'; g.fillRect(0, n * PL * S / 15, cv.width, PL * S / 15 + 1); }
  g.strokeStyle = '#F4F4F0'; g.fillStyle = '#F4F4F0'; g.lineWidth = 0.14 * S;
  const X = v => v * S, Y = v => v * S, mid = PW / 2;
  g.strokeRect(X(0) + 1, Y(0) + 1, X(PW) - 2, Y(PL) - 2);
  g.beginPath(); g.moveTo(X(0), Y(PL / 2)); g.lineTo(X(PW), Y(PL / 2)); g.stroke();
  g.beginPath(); g.arc(X(mid), Y(PL / 2), 9.15 * S, 0, Math.PI * 2); g.stroke();
  g.beginPath(); g.arc(X(mid), Y(PL / 2), 0.25 * S, 0, Math.PI * 2); g.fill();
  for (const end of [0, 1]) {
    const y = v => Y(end ? PL - v : v);
    g.strokeRect(X(mid - 20.16), Math.min(y(0), y(16.5)), X(40.32), Y(16.5));
    g.strokeRect(X(mid - 9.16), Math.min(y(0), y(5.5)), X(18.32), Y(5.5));
    g.beginPath(); g.arc(X(mid), y(11), 0.25 * S, 0, Math.PI * 2); g.fill();
    g.beginPath(); const a = Math.acos(5.5 / 9.15);
    if (end) g.arc(X(mid), y(11), 9.15 * S, -Math.PI / 2 - a, -Math.PI / 2 + a); else g.arc(X(mid), y(11), 9.15 * S, Math.PI / 2 - a, Math.PI / 2 + a);
    g.stroke();
  }
  const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8;
  const pitch = new THREE.Mesh(new THREE.PlaneGeometry(PW, PL).rotateX(-Math.PI / 2), new THREE.MeshLambertMaterial({ map: tex }));
  scene.add(pitch);
  const apron = new THREE.Mesh(new THREE.PlaneGeometry(PW + 60, PL + 60).rotateX(-Math.PI / 2), new THREE.MeshLambertMaterial({ color: '#2F7038' }));
  apron.position.y = -0.03; scene.add(apron);
  const far = new THREE.Mesh(new THREE.PlaneGeometry(900, 900).rotateX(-Math.PI / 2), new THREE.MeshLambertMaterial({ color: '#3A6B3C' }));
  far.position.y = -0.06; scene.add(far);
  // advertising boards give the eye a sense of speed and scale
  const board = new THREE.MeshLambertMaterial({ color: '#1E2A33' });
  for (const [w, d, x, z] of [[PW + 16, 0.3, 0, -PL / 2 - 6], [PW + 16, 0.3, 0, PL / 2 + 6], [0.3, PL + 12, -PW / 2 - 8, 0], [0.3, PL + 12, PW / 2 + 8, 0]]) {
    const b = new THREE.Mesh(new THREE.BoxGeometry(w, 0.9, d), board); b.position.set(x, 0.45, z); scene.add(b);
  }
  // goals: 7.32 m wide, 2.44 m high
  const post = new THREE.MeshLambertMaterial({ color: '#FFFFFF' }), net = new THREE.MeshBasicMaterial({ color: '#FFFFFF', transparent: true, opacity: 0.22, side: THREE.DoubleSide, depthWrite: false });
  for (const dir of [-1, 1]) {
    const z = dir * PL / 2, goal = new THREE.Group();
    for (const x of [-3.66, 3.66]) { const p = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 2.44, 10), post); p.position.set(x, 1.22, 0); goal.add(p); }
    const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 7.44, 10).rotateZ(Math.PI / 2), post); bar.position.set(0, 2.44, 0); goal.add(bar);
    const back = new THREE.Mesh(new THREE.PlaneGeometry(7.32, 2.44), net); back.position.set(0, 1.22, dir * 1.8); goal.add(back);
    const top = new THREE.Mesh(new THREE.PlaneGeometry(7.32, 1.8).rotateX(Math.PI / 2), net); top.position.set(0, 2.44, dir * 0.9); goal.add(top);
    for (const x of [-3.66, 3.66]) { const sd = new THREE.Mesh(new THREE.PlaneGeometry(1.8, 2.44).rotateY(Math.PI / 2), net); sd.position.set(x, 1.22, dir * 0.9); goal.add(sd); }
    goal.position.z = z; scene.add(goal);
  }
}

boot().catch(fail);
