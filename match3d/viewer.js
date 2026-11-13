/* 3D match viewer: replays one match recorded from the engine (scripts/record-match-3d.cjs).
   The engine gives the ball and 22 players every half second plus a mark for every action;
   this file turns those into a stadium scene: positions, facings, the right animation clip for
   each player, and the small things that make bodies read as alive (heads that follow the ball,
   a lean into acceleration and turns, a ball that is pushed ahead and caught up with).
   The reasoning behind each of these is in docs/realism/3D_MATCH_STUDY.md. */
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { clone as cloneSkinned } from 'three/addons/utils/SkeletonUtils.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

const PW = 68, PL = 105, STRIDE = 72, NONE = -32768, BALL_R = 0.11;
// ground speed (m/s) each looping clip was animated for, so feet match the pitch
const LOCO = { Walk: 1.16, Jog: 2.57, Run: 4.7, Dribble: 2.45, Jockey: 0.95, WalkBack: 0.77, WalkDribble: 1.07, SideStep: 0.83, KeeperShuffle: 1.0, KeeperHoldWalk: 1.16 };
const STILL = { Idle: 1, IdleShift: 1, IdleLook: 1, IdleBounce: 1, KeeperReady: 1, KeeperHold: 1 }; // looping clips that stand on the spot
// Forward gaits are blended by speed, not switched: between a walk and a jog he is part one, part the other.
const GAIT = [['Walk', 1.16], ['Jog', 2.57], ['Run', 4.7]], GAIT_BALL = [['WalkDribble', 1.07], ['Dribble', 2.45], ['Run', 5.6]];
const LOWER = /^(hips|thigh|shin|foot)/; // the legs' half of every clip; the rest is the upper body
// clips during which the standing foot stays where it was put, whatever the engine does with him meanwhile
const PLANT = { Pass: 1, Shoot: 1, LongKick: 1, FirstTouch: 1, ReceiveInside: 1, ReceiveTurn: 1, ReceiveSole: 1, ReceiveChest: 1, ReceiveThigh: 1, ReceiveHead: 1, ThrowIn: 1, Header: 1 };
const LOOPS = n => n in LOCO || n in STILL;
// Keeper clips that travel (dives, the smother): the clip's own movement is taken out and put back by the
// viewer, scaled so the hands arrive where the engine says the ball is. reach: metres from hip to hands at
// contact; side: metres the clip itself travels sideways by contact.
const ROOTED = { KeeperDive: { reach: 1.15, side: 1.35 }, KeeperDiveLow: { reach: 1.2, side: 1.2 }, KeeperDiveHigh: { reach: 1.1, side: 1.5 }, KeeperSmother: { reach: 0.6, side: 0.44 } };
// seconds from the start of a clip to the moment of ball contact, and how fast to play it
const CONTACT = { Pass: 0.5, Shoot: 0.417, LongKick: 0.417, Header: 0.567, Tackle: 0.417, FirstTouch: 0.283, ThrowIn: 0.683, KeeperDive: 0.533, KeeperCatch: 0.517, Celebrate: 0, ReceiveInside: 0.34, ReceiveTurn: 0.36, ReceiveSole: 0.36, ReceiveRun: 0.2, Shoulder: 0.22, Stumble: 0, Fall: 0 , KeeperDiveLow: 0.5, KeeperDiveHigh: 0.55, KeeperScoop: 0.283, KeeperGetUp: 0, KeeperSmother: 0.45, KeeperPunch: 0.517, KeeperThrow: 0.65, KeeperRoll: 0.667, KeeperPunt: 0.433 , Cut: 0.2, Turn: 0, ReceiveChest: 0.283, ReceiveThigh: 0.283, ReceiveHead: 0.283, Call: 0, Point: 0 };
const RATE = { Pass: 1.7, Shoot: 1.25, LongKick: 1.3, Header: 1.3, Tackle: 1.4, FirstTouch: 1.6, ThrowIn: 1.2, KeeperDive: 1.2, KeeperCatch: 1.2, Celebrate: 1, ReceiveInside: 1.25, ReceiveTurn: 1.25, ReceiveSole: 1.2, ReceiveRun: 1, Shoulder: 1, Stumble: 1, Fall: 1 , KeeperDiveLow: 1.2, KeeperDiveHigh: 1.15, KeeperScoop: 1.2, KeeperGetUp: 1.3, KeeperSmother: 1.2, KeeperPunch: 1.2, KeeperThrow: 1.1, KeeperRoll: 1.1, KeeperPunt: 1.2 , Cut: 1.1, Turn: 1.1, ReceiveChest: 1.2, ReceiveThigh: 1.2, ReceiveHead: 1.2, Call: 1, Point: 1 };
// a player already on the move plays only the swing of a kick: seconds kept before and after ball contact
const SWING = { Pass: [0.2, 0.2], LongKick: [0.28, 0.3], Shoot: [0.3, 0.35] };
const GROUNDED = /Fall|KeeperDive|KeeperSmother|KeeperGetUp|Celebrate/;
const SKIN = ['#F1C9A5', '#E0AC86', '#C68863', '#A56B46', '#7A4A2E', '#5A3520'];
const HAIR = ['#1B1410', '#2E2018', '#4A3020', '#7A5632', '#8C6A3A', '#101010'];

const $ = id => document.getElementById(id);
const fail = e => { $('load').textContent = 'Could not load the match: ' + (e && e.message || e); console.error(e); };
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const wrap = a => Math.atan2(Math.sin(a), Math.cos(a));

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

// embed: { canvas, host } when the viewer is part of another page (the live match screen). It then has no
// controls or clock of its own: the page pushes frames and marks as they are played and says what time to show.
function start(meta, F, playerGltf, ballGltf, embed) {
  const NOEL = document.createElement('div');
  const $ = embed ? id => embed.host.querySelector('[data-m3="' + id + '"]') || NOEL : id => document.getElementById(id) || NOEL;
  const times = meta.times;
  let NF = times.length, T_END = NF ? times[NF - 1] : 0;
  const canvas = embed ? embed.canvas : $('c');
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#8FB8DE');
  scene.fog = new THREE.Fog('#A9C9E4', 170, 420);
  scene.add(new THREE.HemisphereLight('#EAF3FF', '#4C7A45', 1.0));
  // Late-afternoon sun: low enough that every player throws a long shadow, which is what ties a body to the grass.
  const sun = new THREE.DirectionalLight('#FFF1D6', 1.35);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  Object.assign(sun.shadow.camera, { left: -26, right: 26, top: 26, bottom: -26, near: 1, far: 140 });
  sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.03;
  scene.add(sun, sun.target);
  const camera = new THREE.PerspectiveCamera(30, 1, 0.5, 700);

  buildStadium(scene, meta);

  /* ---------- clips: keep each one in place, the engine owns where players are ---------- */
  const rootPath = {}, DUR = {};
  const clips = playerGltf.animations.map(clip => {
    const c = clip.clone();
    DUR[c.name] = c.duration;
    for (const tr of c.tracks) {
      if (!/hips\.position$/.test(tr.name)) continue;
      const v = tr.values;
      if (c.name in ROOTED) rootPath[c.name] = { t: Array.from(tr.times), x: Array.from(tr.times, (_, n) => v[n * 3] - v[0]), z: Array.from(tr.times, (_, n) => v[n * 3 + 2] - v[2]) };
      for (let n = 0; n < v.length; n += 3) { v[n] = v[0]; v[n + 2] = v[2]; }
    }
    return c;
  });
  // Every clip in two halves, legs and upper body, so the arms can do one thing while the legs do another.
  const halves = {};
  for (const c of clips) halves[c.name] = { lo: new THREE.AnimationClip(c.name + ':lo', c.duration, c.tracks.filter(t => LOWER.test(t.name))), up: new THREE.AnimationClip(c.name + ':up', c.duration, c.tracks.filter(t => !LOWER.test(t.name))) };
  const rootAt = (name, t) => { // where a travelling clip has carried the body after t seconds: [left, forward]
    const r = rootPath[name]; if (!r) return [0, 0];
    let n = 0; while (n < r.t.length - 2 && r.t[n + 1] < t) n++;
    const u = clamp((t - r.t[n]) / Math.max(1e-4, r.t[n + 1] - r.t[n]), 0, 1);
    return [r.x[n] + (r.x[n + 1] - r.x[n]) * u, r.z[n] + (r.z[n + 1] - r.z[n]) * u];
  };

  /* ---------- one mesh per player: the 15 kit and body parts merged, coloured per vertex ---------- */
  const partMeshes = [];
  playerGltf.scene.traverse(o => { if (o.isSkinnedMesh) partMeshes.push(o); });
  const partNames = partMeshes.map(o => o.material.name);
  const body = mergeGeometries(partMeshes.map((o, n) => {
    const g = o.geometry.clone();
    for (const k of Object.keys(g.attributes)) if (!['position', 'normal', 'skinIndex', 'skinWeight'].includes(k)) g.deleteAttribute(k);
    g.setAttribute('part', new THREE.BufferAttribute(new Float32Array(g.attributes.position.count).fill(n), 1));
    return g;
  }), false);
  const bodyMat = new THREE.MeshLambertMaterial({ vertexColors: true });
  const hash = s => { let h = 2166136261; for (const ch of String(s)) h = Math.imul(h ^ ch.charCodeAt(0), 16777619) >>> 0; h ^= h >>> 15; h = Math.imul(h, 2246822519) >>> 0; return (h ^ (h >>> 13)) >>> 0; };
  const dark = c => new THREE.Color(c).getHSL({}).l < 0.5;
  function kit(side, i, name) {
    const t = meta.teams[side], col = meta.colors[side], keeper = i === 0;
    const shirt = keeper ? col.gk : col.f, shorts = keeper ? '#1E2A33' : (col.s && col.s !== col.f ? col.s : (dark(col.f) ? '#F1F1F1' : '#1E2A33'));
    const h = hash(t.id + ':' + (name || i)), skin = SKIN[h % SKIN.length], hair = HAIR[(h >>> 8) % HAIR.length];
    return { shirt, shorts, socks: shirt, head: skin, neck: skin, arms: skin, hands: skin, legs: skin, hair, eyebrows: hair, boots: ['#111316', '#F1F1F1', '#D93A2B', '#1F6FD0', '#E8D21F'][(h >>> 12) % 5], boot_soles: '#E6E6E6', eyes: '#F1F1EC', pupils: '#120C08', mouth: '#8A4840' };
  }
  const P = [[], []];
  for (let s = 0; s < 2; s++) for (let i = 0; i < 11; i++) {
    const who = meta.lineups[0].on[s][i] || '', k = kit(s, i, who), root = cloneSkinned(playerGltf.scene), old = [];
    root.traverse(o => { if (o.isSkinnedMesh) old.push(o); });
    const geo = body.clone(), part = geo.attributes.part.array, col = new Float32Array(part.length * 3), c = new THREE.Color();
    const cache = partNames.map(n => c.set(k[n] || '#888888').toArray());
    for (let v = 0; v < part.length; v++) col.set(cache[part[v]], v * 3);
    geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
    const mesh = new THREE.SkinnedMesh(geo, bodyMat);
    mesh.bind(old[0].skeleton, old[0].bindMatrix);
    mesh.frustumCulled = false; mesh.castShadow = true;
    old[0].parent.add(mesh);
    old.forEach(o => o.parent.remove(o));
    const mixer = new THREE.AnimationMixer(root), acts = {};
    for (const cl of clips) {
      acts[cl.name] = {};
      for (const ch of ['lo', 'up']) {
        const a = mixer.clipAction(halves[cl.name][ch]);
        if (LOOPS(cl.name)) a.setLoop(THREE.LoopRepeat, Infinity);
        else { a.setLoop(THREE.LoopOnce, 1); a.clampWhenFinished = true; }
        acts[cl.name][ch] = a;
      }
    }
    root.rotation.order = 'YXZ';
    scene.add(root);
    P[s].push({ root, mixer, acts, geo, who, w: { lo: {}, up: {} }, tg: { lo: {}, up: {} }, fd: { lo: 0.18, up: 0.18 }, phase: 0, freq: 1, upShot: null, plant: null, sel: null, gw: -1, chest: root.getObjectByName('chest'), thighR: root.getObjectByName('thighR'), neck: root.getObjectByName('neck'), head: root.getObjectByName('head'), handL: root.getObjectByName('handL'), handR: root.getObjectByName('handR'), footR: root.getObjectByName('footR'), travel: null, ox: 0, oz: 0, name: '', shot: null, swing: null, hold: 0,
      speed: 0, x: 0, z: 0, sx: 1, sy: 1, mirror: 1, look: 0, lean: 0, bank: 0, drib: 0, seed: (hash('p' + s + i) % 1000) / 1000 });
  }
  const setMirror = (p, m) => { p.mirror = m; p.root.scale.set(p.sx * m, p.sy, p.sx); };
  function paint(p, s, i, name) { // a substitute is a different man: his own skin, hair and boots
    const k = kit(s, i, name), part = p.geo.attributes.part.array, col = p.geo.attributes.color, c = new THREE.Color();
    const cache = partNames.map(n => c.set(k[n] || '#888888').toArray());
    for (let v = 0; v < part.length; v++) col.array.set(cache[part[v]], v * 3);
    col.needsUpdate = true; p.who = name;
  }
  // Nobody on a pitch is the same size: height and build come from the game's own player data.
  let lineupAt = -1;
  function applyLineup(min) {
    let n = 0; meta.lineups.forEach((l, k) => { if (l.min <= min + 1) n = k; });
    if (n === lineupAt) return; lineupAt = n;
    const bodyOf = meta.lineups[n].body;
    for (let s = 0; s < 2; s++) for (let i = 0; i < 11; i++) {
      const b = bodyOf && bodyOf[s][i], p = P[s][i];
      p.sy = b ? clamp(b[0] / 180, 0.9, 1.1) : 1; p.sx = b ? p.sy * clamp(Math.sqrt(b[1] / 23), 0.92, 1.1) : 1;
      setMirror(p, p.mirror);
      const name = meta.lineups[n].on[s][i];
      if (name && name !== p.who) paint(p, s, i, name);
    }
  }
  // Animation is mixed by hand, per half of the body: each half has target weights for the clips it should be
  // showing and eases towards them. One-off clips run on their own clock; gait clips share one stride phase
  // per player, so a walk and a jog being blended put the same foot down at the same moment.
  function begin(p, ch, name, rate, from) {
    const a = p.acts[name][ch];
    a.enabled = true; a.reset(); a.setEffectiveTimeScale(rate); a.time = from || 0; a.setEffectiveWeight(p.w[ch][name] || 0); a.play();
    if (!(name in p.w[ch])) p.w[ch][name] = 0;
  }
  function play(p, name, fade, rate, from) { // a one-off clip on the whole body
    for (const ch of ['lo', 'up']) { begin(p, ch, name, rate, from); p.tg[ch] = { [name]: 1 }; p.fd[ch] = fade; }
    p.upShot = null; p.name = name;
  }
  function playUpper(p, name, fade, rate) { // a one-off clip on the arms and trunk; the legs carry on
    begin(p, 'up', name, rate, 0); p.tg.up = { [name]: 1 }; p.fd.up = fade; p.upShot = { end: T + DUR[name] / rate };
  }
  function loop(p, ch, blend, fade) {
    for (const name in blend) if (!(name in p.w[ch])) begin(p, ch, name, name in STILL ? 1 : 0, name in STILL ? p.seed * DUR[name] : 0);
    p.tg[ch] = blend; p.fd[ch] = fade;
  }
  function mix(p, dt, snap) {
    p.phase = (p.phase + dt * p.freq) % 1;
    for (const ch of ['lo', 'up']) {
      const w = p.w[ch], tg = p.tg[ch], step = snap ? 9 : dt / Math.max(0.02, p.fd[ch]);
      let sum = 0;
      for (const name in w) {
        const t = tg[name] || 0;
        w[name] += clamp(t - w[name], -step, step);
        if (w[name] <= 0 && t === 0) { p.acts[name][ch].stop(); delete w[name]; } else sum += w[name];
      }
      for (const name in w) {
        const a = p.acts[name][ch];
        a.setEffectiveWeight(sum > 0 ? w[name] / sum : 0);
        if (name in LOCO) a.time = p.phase * DUR[name];
      }
    }
  }
  const gaitOf = (v, G) => { // the two neighbouring gaits for this speed, and how far one stride carries him
    let n = 0; while (n < G.length - 2 && v > G[n + 1][1]) n++;
    const [a, va] = G[n], [b, vb] = G[n + 1], u = clamp((v - va) / (vb - va), 0, 1);
    return { blend: u <= 0 ? { [a]: 1 } : u >= 1 ? { [b]: 1 } : { [a]: 1 - u, [b]: u }, stride: LOCO[a] * DUR[a] * (1 - u) + LOCO[b] * DUR[b] * u, name: u < 0.5 ? a : b };
  };

  /* ---------- ball, its shadow fallback, and the marker over the man on the ball ---------- */
  const mats = new Map();
  const mat = (key, color) => { if (!mats.has(key)) mats.set(key, new THREE.MeshLambertMaterial({ color })); return mats.get(key); };
  const ball = ballGltf.scene;
  ball.traverse(o => { if (o.isMesh) { o.castShadow = true; o.material = mat('ball:' + o.material.name, o.material.name === 'ball_hexagons' ? '#F4F4F4' : o.material.name === 'ball_pentagons' ? '#15171A' : '#3A3D42'); } });
  scene.add(ball);
  const blobs = new THREE.InstancedMesh(new THREE.CircleGeometry(1, 20).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: '#000000', transparent: true, opacity: 0.28, depthWrite: false }), 23);
  blobs.frustumCulled = false; blobs.renderOrder = 1; blobs.visible = false;
  scene.add(blobs);
  const M4 = new THREE.Matrix4();
  const marker = new THREE.Mesh(new THREE.ConeGeometry(0.11, 0.22, 4).rotateX(Math.PI), new THREE.MeshBasicMaterial({ color: '#FFFFFF' }));
  scene.add(marker);

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
  const kicksBy = new Map(), touchesBy = new Map(), controls = [];
  const indexMarks = marks => { for (const m of marks) if (m.k === 'kick' || m.k === 'touch' || m.k === 'duel') {
    const map = m.k === 'kick' ? kicksBy : touchesBy, key = m.s + ':' + m.who;
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(m.t);
  } };
  function receive(t, s, i) {
    if (i == null || i < 1 || i > 10) return;
    if ((kicksBy.get(s + ':' + i) || []).some(k => k >= t && k - t < 0.45)) return; // played first time: the kick is the touch
    const k = frameAt(t), k2 = Math.min(NF - 1, k + 1), k3 = Math.min(NF - 1, k + 3);
    if (px(k, s, i) === NONE || px(k2, s, i) === NONE) return;
    const v = Math.hypot(px(k2, s, i) - px(k, s, i), py(k2, s, i) - py(k, s, i)) / 100 / 0.5;
    const turn = Math.abs(Math.atan2(Math.sin(fa(k3, s, i) - fa(k, s, i)), Math.cos(fa(k3, s, i) - fa(k, s, i))));
    const h = hash(Math.round(t * 10) + ':' + s + ':' + i);
    // A ball still in the air when it reaches him is taken on the head, the chest or the thigh, by its height.
    const kq = frameAt(t - 0.05), z = F[kq * STRIDE + 3] < 0 ? F[kq * STRIDE + 2] / 100 : 0;
    const air = v < 4 && (z > 3 && h % 3 === 0 ? 'Head' : z > 1.6 ? (h % 5 < 3 ? 'Chest' : 'Thigh') : z > 0.9 ? (h % 5 < 2 ? 'Chest' : 'Thigh') : z > 0.42 ? 'Thigh' : ''); // z: its height up to half a second before
    const clip = air ? 'Receive' + air : v > 3.2 ? 'ReceiveRun' : turn > 1.2 ? 'ReceiveTurn' : v < 0.6 && h % 3 === 0 ? 'ReceiveSole' : 'ReceiveInside';
    if (air) controls.push({ s, i, t, part: air });
    cue(t, s, i, clip, { mirror: !air && (h >>> 3) % 3 === 0 });
  }
  let lastScorer = null, goals = [], kicks = [], shots = [];
  const holds = [], runUps = [], cutAt = Array.from({ length: 22 }, () => new Set());
  // Turns marks and frames into cues. Called once for a recording, and again for every minute of a live match
  // (k0: the first new frame; marks: the new marks only).
  function ingest(k0, marks) {
  indexMarks(marks);
  for (const m of marks) {
    if (m.k === 'kick') {
      if (m.who === 0) for (const h of holds) if (h.open && h.s === m.s && m.t > h.t0) { h.open = false; h.t1 = m.t; h.style = m.style; }
      const k = frameAt(m.t - 0.5), throwIn = F[k * STRIDE + 5] === 1 && m.kind !== 'shot';
      if (m.who === 0 && m.style === 'punch') continue; // the claim mark plays the punch
      const hand = m.who === 0 && { throw: 'KeeperThrow', roll: 'KeeperRoll', punt: 'KeeperPunt' }[m.style];
      const clip = hand || (throwIn ? 'ThrowIn' : m.style === 'header' ? 'Header' : m.kind === 'shot' ? 'Shoot' : ['long', 'cross', 'clear'].includes(m.kind) ? 'LongKick' : 'Pass');
      cue(m.t, m.s, m.who, clip, hand ? { to: [m.tx, m.ty] } : undefined);
      if (m.rs === 'gk' && m.who === 0) runUps.push({ s: m.s, t0: m.t - 3.4, t1: m.t - 0.8, tk: m.t - 0.1 }); // a goal kick: back off, run up
    } else if (m.k === 'touch') receive(m.t, m.s, m.who);
    else if (m.k === 'duel') { cue(m.t, m.s, m.who, 'Tackle'); cue(m.t + 0.15, m.os, m.oi, 'Stumble', { soft: true }); } // the man who lost it
    else if (m.k === 'contact') { cue(m.t, m.s, m.who, 'Shoulder', { other: [m.os, m.oi], soft: true }); cue(m.t, m.os, m.oi, 'Shoulder', { other: [m.s, m.who], soft: true }); }
    else if (m.k === 'foul') cue(m.t + 0.1, m.s, m.who, 'Fall');
    else if (m.k === 'sfx') {
      if (m.res === 'goal') lastScorer = { s: m.s, i: m.who };
      // The keeper's answer to a shot, by where the ball goes: straight at him he takes it standing (into the
      // chest, or above his head); to either side he dives low, at body height or up to the top corner.
      if (m.res === 'goal' || m.res === 'save') {
        const tc = Math.ceil((m.t + (m.flight || 0.4)) / 0.5 - 1e-6) * 0.5, h = m.az || 0, dive = m.dive !== false; // the engine tick on which the ball is there
        const clip = dive ? (h < 0.55 ? 'KeeperDiveLow' : h < 1.45 ? 'KeeperDive' : 'KeeperDiveHigh') : m.res === 'save' ? (h > 1.6 ? 'KeeperCatch' : 'KeeperScoop') : null;
        if (clip) cue(tc, 1 - m.s, 0, clip, { tx: m.tx, ty: m.ty, beaten: m.res === 'goal' });
        if (clip && dive) cue(tc + (DUR[clip] - CONTACT[clip]) / RATE[clip] - 0.05, 1 - m.s, 0, 'KeeperGetUp', { keep: true });
      }
    } else if (m.k === 'save' && m.how === 'smother') {
      cue(m.t, m.s, 0, 'KeeperSmother', { tx: m.x, ty: m.y });
      cue(m.t + (DUR.KeeperSmother - CONTACT.KeeperSmother) / RATE.KeeperSmother - 0.05, m.s, 0, 'KeeperGetUp', { keep: true });
    } else if (m.k === 'claim') { cue(m.t, m.s, 0, m.res === 'punch' ? 'KeeperPunch' : 'KeeperCatch');
    } else if (m.k === 'hands') { // ball in his hands until he releases it
      const out = marks.find(k => k.k === 'kick' && k.s === m.s && k.who === 0 && k.t > m.t);
      holds.push({ s: m.s, t0: m.t, t1: out ? out.t : m.t + 8, style: out ? out.style : '', pre: m.how === 'claim' ? 0.4 : 0.15, open: !out });
    } else if (m.k === 'goal') {
      const who = lastScorer && lastScorer.s === m.s ? lastScorer.i : 9;
      [who, 1 + (who + 2) % 10, 1 + (who + 5) % 10, 1 + (who + 7) % 10].forEach((i, n) => cue(m.t + 0.7 + n * 0.35, m.s, i, 'Celebrate', { hold: 5 }));
    }
  }
  for (let k = Math.max(1, k0); k < NF; k++) { // a keeper taking a high ball; an outfield player collecting a loose or intercepted one
    const r = k * STRIDE, q = r - STRIDE;
    if (F[r + 4] > 0 && F[r + 3] >= 0 && !F[r + 5] && (F[q + 4] !== F[r + 4] || F[q + 3] !== F[r + 3])
      && !(touchesBy.get(F[r + 3] + ':' + F[r + 4]) || []).some(t => Math.abs(t - times[k]) < 0.8)) receive(times[k], F[r + 3], F[r + 4]);
    if (!holds.length && F[r + 4] === 0 && F[r + 3] >= 0 && (F[q + 4] !== 0 || F[q + 3] !== F[r + 3]) && F[q + 2] > 120) cue(times[k], F[r + 3], 0, 'KeeperCatch'); // recordings made before the engine marked catches
  }
  // Sharp cuts (a change of direction at speed) and turns on the spot, read from the recorded path.
  for (let s = 0; s < 2; s++) for (let i = 1; i < 11; i++) for (let k = Math.max(1, k0 - 1); k < NF - 1; k++) {
    if (px(k - 1, s, i) === NONE || px(k, s, i) === NONE || px(k + 1, s, i) === NONE || times[k + 1] - times[k - 1] > 1.1) continue;
    const ax = (px(k, s, i) - px(k - 1, s, i)) / 50, ay = (py(k, s, i) - py(k - 1, s, i)) / 50, bx = (px(k + 1, s, i) - px(k, s, i)) / 50, by = (py(k + 1, s, i) - py(k, s, i)) / 50;
    const va = Math.hypot(ax, ay), vb = Math.hypot(bx, by), busy = [kicksBy, touchesBy].some(m => (m.get(s + ':' + i) || []).some(t => Math.abs(t - times[k]) < 0.7));
    if (busy) continue;
    if (va > 2.6 && vb > 2.6 && va < 9.5 && vb < 9.5 && !F[k * STRIDE + 5] && (ax * bx + ay * by) / (va * vb) < 0.7) { cutAt[s * 11 + i].add(k); cue(times[k], s, i, 'Cut', { soft: true, mirror: ax * by - ay * bx > 0 }); }
    else if (va < 0.8 && vb < 0.8 && Math.abs(wrap(fa(k + 1, s, i) - fa(k, s, i))) > 1.3) cue(times[k], s, i, 'Turn', { soft: true });
  }
  cues.sort((a, b) => a.t - b.t);
  goals = meta.marks.filter(m => m.k === 'goal').sort((a, b) => a.t - b.t);
  kicks = meta.marks.filter(m => m.k === 'kick').sort((a, b) => a.t - b.t);
  shots = meta.marks.filter(m => m.k === 'shot' || m.k === 'goal').map(m => m.t).sort((a, b) => a - b);
  }
  ingest(0, meta.marks);

  /* ---------- playback state ---------- */
  let T = 0, speed = 1, playing = true, ci = 0, ki = 0, ext = embed ? 0 : null, camMode = (embed ? embed.host.clientWidth < embed.host.clientHeight : window.innerWidth < window.innerHeight) ? 0 : 1, noteUntil = 0, cut = true, follow = null, shadows = true;
  const camPos = new THREE.Vector3(0, 30, 60), camAim = new THREE.Vector3();
  const ballPos = new THREE.Vector3(), prevBall = new THREE.Vector3(), spinAxis = new THREE.Vector3();
  const UP = new THREE.Vector3(0, 1, 0), HV = new THREE.Vector3(), HB = new THREE.Vector3(), qa = new THREE.Quaternion(), qb = new THREE.Quaternion();
  const nameOf = (s, i) => { const min = T / 60; let on = meta.lineups[0].on; for (const l of meta.lineups) if (l.min <= min + 1) on = l.on; return on[s][i] || ''; };
  const note = (text, secs) => { $('note').textContent = text; noteUntil = performance.now() + secs * 1000; };
  // Turn a bone about the world's up axis while keeping the pose the clip gave it.
  function turnBone(bone, yaw) {
    bone.parent.getWorldQuaternion(qa);
    qb.setFromAxisAngle(UP, yaw);
    bone.quaternion.premultiply(qa.clone().invert().multiply(qb).multiply(qa));
  }

  function seek(t) {
    T = Math.max(0, Math.min(T_END, t));
    for (const c of cues) c.done = c.t <= T - 0.3;
    ci = cues.findIndex(c => !c.done); if (ci < 0) ci = cues.length;
    ki = 0;
    for (const side of P) for (const p of side) { p.shot = null; p.swing = null; p.hold = 0; p.drib = 0; p.travel = null; p.plant = null; p.upShot = null; p.sel = null; p.ox = p.oz = 0; setMirror(p, 1); }
    $('note').textContent = '';
    cut = true;
  }

  function update(dt) {
    if (playing && ext == null) T = Math.min(T_END, T + dt * speed); // ext: the embedding page owns the clock
    const k = frameAt(T), k2 = Math.min(NF - 1, k + 1), span = times[k2] - times[k];
    const u = span > 0 && span <= 1 ? (T - times[k]) / span : 0, step = span > 0 && span <= 1 ? span : 0.5;
    const r = k * STRIDE, r2 = k2 * STRIDE, sdt = ext != null ? ext : playing ? dt * Math.min(speed, 2) : 0;
    applyLineup(T / 60);

    // action cues that have come due
    while (ci < cues.length && cues[ci].t <= T) {
      const c = cues[ci++], p = P[c.s][c.i];
      if (c.done) continue;
      c.done = true;
      if (T - c.t > 0.4 || (c.soft && p.shot)) continue;
      const rate = RATE[c.clip];
      if (SWING[c.clip] && p.speed > 1) { // keep running: the swing alone, timed to the same contact
        const [pre, post] = SWING[c.clip];
        p.swing = { at: c.t + (CONTACT[c.clip] - pre) / rate, clip: c.clip, from: CONTACT[c.clip] - pre, len: (pre + post) / rate };
        continue;
      }
      if (c.keep) { if (!p.travel) continue; p.travel.rest = true; } // getting up where the dive left him
      else if (c.clip in ROOTED) { // the clip goes to the keeper's left; mirror it for the other side
        const a = fa(k, c.s, c.i), ex = px(k2, c.s, c.i) / 100, ey = py(k2, c.s, c.i) / 100, R = ROOTED[c.clip];
        const left = Math.sin(a) * (c.tx - ex) - Math.cos(a) * (c.ty - ey);
        setMirror(p, left > 0 ? 1 : -1);
        // how far the clip must carry him for his hands to be where the ball is (short of it when he is beaten)
        const need = (Math.abs(left) - R.reach) / R.side;
        p.travel = { clip: c.clip, t0: c.t, rate, k: c.beaten ? clamp(need * 0.8, 0.3, 0.9) : clamp(need, 0.12, 1.2), a, rest: false };
      } else if (c.other) { // lean into the man: the clip leans right, mirror it if he is on the left
        const a = fa(k, c.s, c.i), ox = px(k, c.other[0], c.other[1]), oy = py(k, c.other[0], c.other[1]);
        setMirror(p, Math.sin(a) * (ox - px(k, c.s, c.i)) - Math.cos(a) * (oy - py(k, c.s, c.i)) > 0 ? -1 : 1);
      } else setMirror(p, c.mirror ? -1 : 1);
      play(p, c.clip, c.clip.startsWith('Receive') ? 0.14 : c.keep ? 0.2 : c.clip === 'Cut' || c.clip === 'Turn' ? 0.12 : 0.08, rate);
      p.shot = { end: T + (c.hold || DUR[c.clip] / rate) };
      if (PLANT[c.clip] && c.i > 0 && p.speed < 2.2) p.plant = { x: p.x, z: p.z, until: c.t + (CONTACT[c.clip] + 0.12) / rate };
      if (c.clip === 'Celebrate' && c.i === (lastScorerAt(T) ?? -1)) note('GOAL! ' + nameOf(c.s, c.i) + ' (' + meta.teams[c.s].name + ')', 6);
    }

    // ball as the engine has it
    const os = F[r + 3], oi = F[r + 4];
    const kA = k > 0 && times[k] - times[k - 1] <= 1 ? k - 1 : k, kB = k2 < NF - 1 && times[k2 + 1] - times[k2] <= 1 ? k2 + 1 : k2;
    const held = os >= 0 && [kA, k2, kB].every(n => F[n * STRIDE + 3] === os && F[n * STRIDE + 4] === oi);
    const lerp = (a, b, n) => (span > 1 ? a : held ? curve(F[kA * STRIDE + n], a, b, F[kB * STRIDE + n], u) : a + (b - a) * u) / 100;
    prevBall.copy(ballPos);
    ballPos.set(lerp(F[r], F[r2], 0) - PW / 2, Math.max(0, (span > 1 ? F[r + 2] : F[r + 2] + (F[r2 + 2] - F[r + 2]) * u) / 100) + BALL_R, lerp(F[r + 1], F[r2 + 1], 1) - PL / 2);

    let n = 0, carrier = null, lastSide = os;
    if (lastSide < 0) { // in flight: it belongs to whoever played it last
      while (ki < kicks.length && kicks[ki].t <= T) ki++;
      if (ki > 0 && T - kicks[ki - 1].t < 8) lastSide = kicks[ki - 1].s;
      for (let b = k; lastSide < 0 && b > k - 40 && b >= 0; b--) lastSide = F[b * STRIDE + 3];
    }
    for (let s = 0; s < 2; s++) for (let i = 0; i < 11; i++) {
      const p = P[s][i], x0 = px(k, s, i), x1 = px(k2, s, i);
      if (x0 === NONE) { p.root.visible = false; continue; }
      p.root.visible = true;
      const y0 = py(k, s, i), y1 = py(k2, s, i), jump = x1 === NONE || span > 1;
      const ka = kA !== k && px(kA, s, i) !== NONE ? kA : k, kb = kB !== k2 && px(kB, s, i) !== NONE ? kB : k2;
      const sharp = cutAt[s * 11 + i].has(k) || cutAt[s * 11 + i].has(k2); // a cut is a corner, not a curve
      const x = (jump ? x0 : sharp ? x0 + (x1 - x0) * u : curve(px(ka, s, i), x0, x1, px(kb, s, i), u)) / 100, y = (jump ? y0 : sharp ? y0 + (y1 - y0) * u : curve(py(ka, s, i), y0, y1, py(kb, s, i), u)) / 100;
      const vx0 = jump ? 0 : (x1 - x0) / 100 / step, vy0 = jump ? 0 : (y1 - y0) / 100 / step;
      const a0 = fa(k, s, i), da = jump ? 0 : wrap(fa(k2, s, i) - a0), a = a0 + da * u;
      let vx = vx0, vy = vy0, v = Math.hypot(vx0, vy0);
      { // He is not always exactly where the engine has him: a keeper's dive carries him and a goal kick has a
        // run-up; anyone striking or controlling the ball keeps his standing foot planted, then catches up.
        const ox0 = p.ox, oz0 = p.oz, tr = p.travel, ru = i === 0 && !tr ? runUps.find(q => q.s === s && T >= q.t0 && T < q.tk) : null;
        if (tr && (tr.rest || (p.shot && p.name === tr.clip))) {
          const [l, f] = rootAt(tr.clip, tr.rest ? 9 : (T - tr.t0) * tr.rate);
          if (!tr.rest) tr.mirror = p.mirror;
          const lm = l * tr.k * (tr.mirror ?? p.mirror);
          p.ox = lm * Math.sin(tr.a) + f * Math.cos(tr.a); p.oz = -lm * Math.cos(tr.a) + f * Math.sin(tr.a);
          if (tr.rest && !(p.shot && p.name === 'KeeperGetUp')) p.travel = null;
        } else if (ru) {
          const sm = q => q * q * (3 - 2 * q), back = T < ru.t1 ? sm(clamp((T - ru.t0) / 1.7, 0, 1)) : 1 - sm(clamp((T - ru.t1) / (ru.tk - ru.t1), 0, 1));
          p.ox = -Math.cos(a) * 2.6 * back; p.oz = -Math.sin(a) * 2.6 * back;
        } else if (p.plant && p.shot && T < p.plant.until && Math.hypot(p.plant.x - (x - PW / 2), p.plant.z - (y - PL / 2)) < 1.3) {
          p.ox = p.plant.x - (x - PW / 2); p.oz = p.plant.z - (y - PL / 2);
        } else {
          p.travel = null; p.plant = null;
          const d = Math.hypot(p.ox, p.oz), back = Math.min(d, (1.5 + 0.6 * v) * Math.max(sdt, 0));
          if (d > 1e-4) { p.ox -= p.ox / d * back; p.oz -= p.oz / d * back; }
        }
        if (sdt > 0 && !p.shot) { vx += (p.ox - ox0) / sdt; vy += (p.oz - oz0) / sdt; v = Math.hypot(vx, vy); }
      }
      p.x = x - PW / 2 + p.ox; p.z = y - PL / 2 + p.oz; p.speed = v;

      if (p.swing && T >= p.swing.at) {
        const w = p.swing; p.swing = null;
        if (T - w.at < 0.3) { setMirror(p, 1); play(p, w.clip, 0.1, RATE[w.clip], w.from); p.shot = { end: T + w.len }; }
      }
      if (p.shot && T >= p.shot.end) { p.shot = null; setMirror(p, 1); }
      const mine = os === s && oi === i;
      if (!p.shot) {
        // Which way he is going against where he faces: forwards, backwards or sideways. The crouched
        // jockey is only for the defender closing down the man on the ball; anyone else moving backwards
        // simply walks backwards, upright.
        const fwd = v > 0.35 ? (vx * Math.cos(a) + vy * Math.sin(a)) / v : 1, left = vx * Math.sin(a) - vy * Math.cos(a);
        const closing = os === 1 - s && Math.hypot(p.x - ballPos.x, p.z - ballPos.z) < 6;
        const far = Math.hypot(p.x - ballPos.x, p.z - ballPos.z);
        // what he is doing: standing, going forwards (a blend of gaits by his speed), backwards or sideways
        let cat = v < 0.35 ? 'still' : mine ? 'ball' : v < 3.2 && fwd < -0.5 ? (closing ? 'Jockey' : 'WalkBack') : v < 3.2 && fwd < 0.5 ? 'SideStep' : 'go', upper = null;
        if (i === 0) {
          // The keeper: the ball in his hands; or, when the other side has it within range of his goal, the set
          // position, and short quick side steps (never crossing his feet) to stay in line with it.
          const holding = mine && holds.some(h => h.s === s && T >= h.t0 && T < h.t1);
          const danger = !mine && lastSide !== s && !F[r + 5] && far < 36;
          if (holding) { upper = { KeeperHold: 1 }; cat = v < 0.35 ? 'KeeperHold' : 'go'; } // any gait, the ball held to his chest
          else if (danger) cat = v < 0.35 ? 'KeeperReady' : v < 3.4 && fwd > -0.75 && fwd < 0.75 ? 'KeeperShuffle' : cat;
        }
        if (p.sel && p.sel !== cat && T < p.hold && !(cat === 'still' && v < 0.15)) cat = p.sel; // no flicker between kinds of movement
        else if (p.sel !== cat) { p.sel = cat; p.hold = T + 0.35; }
        let blend, name, fade = 0.18;
        if (cat === 'still') {
          // Nobody stands the same way for a whole match: away from the play he shifts his weight, looks about
          // or keeps loose; near the ball he is simply ready.
          const h = far > 22 || F[r + 5] ? hash(s + ':' + i + ':' + Math.floor(T / 7 + p.seed * 5)) % 10 : 9;
          name = h < 3 ? 'IdleShift' : h < 5 ? 'IdleLook' : h < 6 ? 'IdleBounce' : 'Idle'; blend = { [name]: 1 }; fade = 0.4; p.freq = 0;
        } else if (cat === 'go' || cat === 'ball') {
          const g = gaitOf(v, cat === 'ball' ? GAIT_BALL : GAIT);
          blend = g.blend; name = g.name; p.freq = clamp(v / g.stride, 0.55, 3.4);
        } else if (cat in STILL) { name = cat; blend = { [cat]: 1 }; fade = 0.25; p.freq = 0; }
        else { name = cat; blend = { [cat]: 1 }; p.freq = clamp(v / LOCO[cat], 0.6, 2.4) / DUR[cat]; }
        if (p.name in STILL && !(name in STILL)) fade = 0.25;
        setMirror(p, (name === 'SideStep' || name === 'KeeperShuffle') && left < 0 ? -1 : 1); // the clip steps to his left
        loop(p, 'lo', blend, fade); p.name = name;
        // The arms: a gesture now and then (asking for the ball in space, pointing a team-mate to his man);
        // otherwise they go with the legs.
        if (p.upShot && T >= p.upShot.end) p.upShot = null;
        const win = Math.floor(T / 6 + p.seed * 6);
        if (!p.upShot && i > 0 && win !== p.gw && playing) {
          p.gw = win;
          const h = hash('g' + s + ':' + i + ':' + win) % 12;
          if (os === s && !mine && far > 10 && far < 34 && v < 4 && h < 2) playUpper(p, 'Call', 0.2, 1);
          else if (os === 1 - s && far > 12 && v < 2.5 && h === 5) playUpper(p, 'Point', 0.2, 1);
        }
        if (!p.upShot) loop(p, 'up', upper || blend, upper ? 0.2 : Math.max(fade, 0.2));
      }
      mix(p, sdt, cut);
      p.mixer.update(sdt);

      // A body has weight: he leans into his acceleration and banks into a turn.
      const v0 = ka !== k ? Math.hypot(x0 - px(ka, s, i), y0 - py(ka, s, i)) / 100 / step : v, v2 = kb !== k2 ? Math.hypot(px(kb, s, i) - x1, py(kb, s, i) - y1) / 100 / step : v;
      const acc = jump ? 0 : ((v - v0) * (1 - u) + (v2 - v) * u) / step, ease = 1 - Math.exp(-Math.max(dt, 0.001) * 6);
      p.lean += (clamp(acc * 0.035, -0.11, 0.16) - p.lean) * ease;
      p.bank += (clamp(da / step * v * 0.014, -0.17, 0.17) - p.bank) * ease;
      const still = p.shot && GROUNDED.test(p.name);
      p.root.position.set(p.x, 0, p.z);
      p.root.rotation.set(still ? 0 : p.lean, Math.PI / 2 - a, still ? 0 : p.bank * p.mirror);

      // Eyes on the ball: the neck and head turn towards it (never further than a neck can).
      const toBall = wrap(Math.atan2(ballPos.z - p.z, ballPos.x - p.x) - a), far = Math.hypot(ballPos.x - p.x, ballPos.z - p.z);
      const want = mine || far < 1.2 || Math.abs(toBall) > 2.3 || still ? 0 : clamp(-toBall, -1.15, 1.15);
      p.look += (want - p.look) * (1 - Math.exp(-Math.max(dt, 0.001) * 5));
      if (p.neck && p.head && Math.abs(p.look) > 0.02) { turnBone(p.neck, p.look * 0.4 * p.mirror); turnBone(p.head, p.look * 0.6 * p.mirror); }

      if (mine) carrier = { p, v, vx, vy, a, s, i };
      if (mine && (p.ox || p.oz)) { ballPos.x += p.ox; ballPos.z += p.oz; } // the ball is at his feet, wherever they are
      if (!shadows) blobs.setMatrixAt(n++, M4.makeScale(0.38, 1, 0.38).setPosition(p.x, 0.02, p.z));
    }

    // The ball is not glued to a boot. A man running with it knocks it ahead and catches it up: a short
    // touch every stride at a walk, a longer one every few strides at a sprint.
    if (carrier && held && carrier.i > 0 && carrier.v > 0.6 && !carrier.p.shot) {
      const { p, v, vx, vy } = carrier, period = clamp(0.42 + v * 0.07, 0.45, 0.95), reach = clamp(0.12 + v * 0.2, 0.15, 1.7);
      p.drib = (p.drib + sdt / period) % 1;
      const ahead = 0.42 + reach * (1 - Math.pow(1 - p.drib, 2.2)) * (1 - Math.pow(p.drib, 6));
      ballPos.set(p.x + vx / v * ahead, BALL_R, p.z + vy / v * ahead);
    } else if (carrier) carrier.p.drib = 0;
    // In the keeper's hands: between both hands while he holds it, in the throwing hand for a throw or a roll,
    // dropped from the hands onto the boot for a kick.
    const hold = holds.find(h => T >= h.t0 - h.pre && T < h.t1 + 0.02);
    if (hold && T < hold.t0) { // the last moment before he takes it: the ball goes to his hands, not to the grass at his feet
      const p = P[hold.s][0], w = clamp((T - (hold.t0 - hold.pre)) / hold.pre, 0, 1);
      p.root.updateMatrixWorld(true);
      HB.copy(p.handL.localToWorld(HV.set(-0.04, 0.1, 0))).add(p.handR.localToWorld(HV.set(0.04, 0.1, 0))).multiplyScalar(0.5);
      ballPos.lerp(HB, w * w);
    } else if (hold && !(os >= 0 && (os !== hold.s || oi !== 0))) {
      const p = P[hold.s][0];
      p.root.updateMatrixWorld(true);
      const one = p.shot && (p.name === 'KeeperThrow' || p.name === 'KeeperRoll');
      if (one) ballPos.copy(p.handR.localToWorld(HV.set(0.02 * p.mirror, 0.13, 0.03)));
      else { ballPos.copy(p.handL.localToWorld(HV.set(-0.04, 0.1, 0))).add(p.handR.localToWorld(HV.set(0.04, 0.1, 0))).multiplyScalar(0.5); }
      if (p.shot && p.name === 'KeeperPunt') { // let go of it: it drops to the boot
        const drop = clamp((T - (hold.t1 - 0.3)) / 0.3, 0, 1);
        if (drop > 0) ballPos.lerp(p.footR.localToWorld(HV.set(0, 0.16, 0)), drop * drop);
      }
      ballPos.y = Math.max(BALL_R, ballPos.y);
    }
    // A ball taken out of the air meets the chest, thigh or head, then drops to his feet.
    for (const c of controls) {
      if (T < c.t - 0.25 || T > c.t + 0.15) continue;
      const p = P[c.s][c.i], w = T < c.t ? Math.pow((T - (c.t - 0.25)) / 0.25, 2) : 1 - (T - c.t) / 0.15;
      p.root.updateMatrixWorld(true);
      const bone = c.part === 'Head' ? p.head : c.part === 'Chest' ? p.chest : p.thighR;
      HB.copy(bone.localToWorld(HV.set(0, c.part === 'Head' ? 0.2 : c.part === 'Chest' ? 0.12 : 0.22, 0)));
      HB.x += Math.cos(fa(k, c.s, c.i)) * 0.16; HB.z += Math.sin(fa(k, c.s, c.i)) * 0.16;
      ballPos.lerp(HB, clamp(w, 0, 1));
    }
    ball.position.copy(ballPos);
    const dx = ballPos.x - prevBall.x, dz = ballPos.z - prevBall.z, moved = Math.hypot(dx, dz);
    if (moved > 1e-4 && moved < 5) ball.rotateOnWorldAxis(spinAxis.set(dz, 0, -dx).normalize(), moved / BALL_R);
    if (!shadows) {
      const bs = 0.16 * (1 + Math.min(1.5, ballPos.y * 0.15));
      blobs.setMatrixAt(n++, M4.makeScale(bs, 1, bs).setPosition(ballPos.x, 0.021, ballPos.z));
      blobs.count = n; blobs.instanceMatrix.needsUpdate = true;
    }
    marker.visible = !!carrier;
    if (carrier) { marker.position.set(carrier.p.x, 2.0 * carrier.p.sy + 0.05 * Math.sin(T * 5), carrier.p.z); marker.material.color.set(meta.colors[carrier.s].f); }
    $('who').textContent = carrier ? nameOf(carrier.s, carrier.i) : '';
    sun.position.set(ballPos.x - 34, 46, ballPos.z + 26); sun.target.position.set(ballPos.x, 0, ballPos.z);

    // camera
    const aspect = camera.aspect, wantPos = new THREE.Vector3(), wantAim = new THREE.Vector3();
    if (follow && follow[2]) { // behind his goal, looking up the pitch over the keeper to the ball
      const f = P[follow[0]][follow[1]], end = Math.sign(f.z) || 1, gap = Math.abs(ballPos.z - f.z);
      wantPos.set(f.x * 0.4, 8 + gap * 0.1, end * (PL / 2 + 17 + gap * 0.08)); wantAim.set(f.x * 0.75 + ballPos.x * 0.25, 0.8, f.z + (ballPos.z - f.z) * 0.3);
    } else if (follow) { const f = P[follow[0]][follow[1]]; wantPos.set(f.x - 4.5, 2.2, f.z + (f.z > 38 ? -5.5 : 5.5)); wantAim.set(f.x, 1.0, f.z); } // never from behind a goal net
    else if (camMode === 0) { // behind: the pitch runs up the screen, home side attacks upward
      const d = aspect < 1 ? 25 : 22;
      wantPos.set(ballPos.x * 0.62, d * 0.62, ballPos.z + d); wantAim.set(ballPos.x * 0.86, 0.5, ballPos.z - 3);
    } else if (camMode === 1) { // television gantry on the halfway line, panning with the ball
      const d = aspect < 1 ? 60 : 46;
      wantPos.set(-PW / 2 - d * 0.62, d * 0.46, ballPos.z * 0.45); wantAim.set(ballPos.x * 0.6 - 1, 0.5, ballPos.z * 0.97);
    } else if (camMode === 2) { // close to the ball
      wantPos.set(ballPos.x - 8, 4.2, ballPos.z + 11); wantAim.set(ballPos.x, 0.9, ballPos.z);
    } else { // whole pitch
      const d = aspect < 1 ? 150 : 95;
      wantPos.set(0, d, aspect < 1 ? 8 : d * 0.5); wantAim.set(0, 0, 0);
    }
    const ease = 1 - Math.exp(-dt * 5);
    camPos.lerp(wantPos, cut ? 1 : ease); camAim.lerp(wantAim, cut ? 1 : ease); cut = false;
    camera.position.copy(camPos); camera.lookAt(camAim);

    // HUD
    const g = [0, 0]; for (const m of goals) if (m.t <= T) g[m.s]++;
    $('score').textContent = g[0] + ' - ' + g[1];
    $('clock').textContent = Math.floor(T / 60) + ':' + String(Math.floor(T % 60)).padStart(2, '0');
    if (document.activeElement !== $('seek')) $('seek').value = T;
    if (noteUntil && performance.now() > noteUntil) { $('note').textContent = ''; noteUntil = 0; }
    if (!embed && T >= T_END && playing) { playing = false; $('play').textContent = 'Replay'; note('Full time', 60); }
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
  function setShadows(on) { shadows = on; renderer.shadowMap.enabled = on; sun.castShadow = on; blobs.visible = !on; scene.traverse(o => { if (o.material) o.material.needsUpdate = true; }); $('shade').textContent = on ? 'Shadows on' : 'Shadows off'; }
  $('shade').onclick = () => { setShadows(!shadows); note(shadows ? 'Real shadows (heavier)' : 'Simple shadows (faster)', 2); };

  function resize() {
    const w = embed ? Math.max(1, embed.host.clientWidth) : window.innerWidth, h = embed ? Math.max(1, embed.host.clientHeight) : window.innerHeight;
    renderer.setSize(w, h, false); camera.aspect = w / h; camera.fov = w < h ? 36 : 26; camera.updateProjectionMatrix();
  }
  window.addEventListener('resize', resize); resize();

  let last = performance.now(), slow = 0;
  const autoShadows = dt => { // a phone that cannot hold the frame rate with real shadows drops to the simple ones by itself
    if (shadows && playing) { slow = dt > 0.05 ? slow + 1 : Math.max(0, slow - 1); if (slow > 90) { setShadows(false); note('Simple shadows for a smoother picture', 3); } }
  };
  if (embed) {
    const seen = new Set(), RS = { thr: 1, gk: 2, ck: 3, fk: 4, pen: 5, ko: 6 };
    return {
      canvas,
      // rows: the engine's frames ([t, ball x y z, owner side and slot, restart, 22 positions, 22 facings]);
      // marks: the engine's marks; lineup: { min, on: names by side and slot, body: [height, build, number] }
      push(rows, marks, lineup) {
        const k0 = NF;
        for (const f of rows) {
          if (NF && f[0] <= times[NF - 1]) continue;
          if ((NF + 1) * STRIDE > F.length) { const bigger = new Int16Array(Math.max(F.length * 2, STRIDE * 512)); bigger.set(F); F = bigger; }
          const o = NF * STRIDE;
          F[o] = Math.round(f[1] * 100); F[o + 1] = Math.round(f[2] * 100); F[o + 2] = Math.round(f[3] * 100); F[o + 3] = f[4]; F[o + 4] = f[5]; F[o + 5] = RS[f[6]] || 0;
          for (let n = 7; n < 51; n++) F[o + n - 1] = f[n] == null ? NONE : Math.round(f[n] * 100);
          for (let n = 51; n < 73; n++) F[o + n - 1] = f[n] == null ? 0 : Math.round(f[n] * 1000);
          times.push(f[0]); NF++;
        }
        if (NF) T_END = times[NF - 1];
        const fresh = (marks || []).filter(m => { const key = m.t + '|' + m.k + '|' + m.s + '|' + (m.who ?? '') + '|' + (m.kind ?? ''); if (seen.has(key)) return false; seen.add(key); return true; });
        meta.marks.push(...fresh);
        if (lineup && JSON.stringify(meta.lineups[meta.lineups.length - 1].on) !== JSON.stringify(lineup.on)) meta.lineups.push(lineup);
        ingest(k0, fresh);
        ci = cues.findIndex(c => !c.done && c.t > T - 0.4); if (ci < 0) ci = cues.length;
        ki = 0;
      },
      // Show second t of the match; real: seconds of real time since the last call.
      frame(t, real) {
        if (NF < 2) return;
        t = Math.max(times[0], Math.min(T_END, t));
        const d = t - T;
        if (d < -0.05 || d > 1.5) { seek(t); ext = 0; } else { T = t; ext = Math.max(0, Math.min(d, real * 2.5)); }
        update(Math.min(0.25, Math.max(real, 0.001))); renderer.render(scene, camera);
        autoShadows(real);
      },
      resize, cams: CAMS, get cam() { return camMode; }, setCam(n) { camMode = ((n % CAMS.length) + CAMS.length) % CAMS.length; follow = null; cut = true; }, follow(s, i, wide) { follow = s == null ? null : [s, i, !!wide]; cut = true; },
      get shadows() { return shadows; }, setShadows, get time() { return T; }, get frames() { return NF; }, cuesOf: name => cues.filter(c => c.clip === name).length,
      dispose() { window.removeEventListener('resize', resize); renderer.dispose(); if (renderer.forceContextLoss) renderer.forceContextLoss(); },
    };
  }
  const q = new URLSearchParams(location.search);
  if (q.has('t')) seek(+q.get('t'));
  if (q.has('cam')) camMode = +q.get('cam') % CAMS.length;
  if (q.has('speed')) { speed = +q.get('speed') || 1; $('speed').textContent = speed + 'x'; }
  const manual = q.has('manual'); // tests drive the clock themselves
  function frame(now) {
    const dt = Math.min(0.25, (now - last) / 1000); last = now;
    if (!manual) { update(dt); renderer.render(scene, camera); autoShadows(dt); }
    requestAnimationFrame(frame);
  }
  window.match3d = { cuesOf: name => cues.filter(c => c.clip === name).map(c => [Math.round(c.t * 10) / 10, c.s, c.i]), cueMix: cues.reduce((o, c) => { o[c.clip] = (o[c.clip] || 0) + 1; return o; }, {}), seek, step(dt) { update(dt); renderer.render(scene, camera); }, get time() { return T; }, end: T_END, cues: cues.length, setCam(n) { camMode = n; follow = null; cut = true; }, follow(s, i, wide) { follow = s == null ? null : [s, i, !!wide]; cut = true; }, caption(text) { $('note').textContent = text || ''; noteUntil = 0; }, carrierAt() { const k = frameAt(T); return [F[k * STRIDE + 3], F[k * STRIDE + 4]]; }, clips: clips.map(c => c.name), drawCalls: () => renderer.info.render.calls };
  update(0.3); renderer.render(scene, camera);
  $('load').remove();
  requestAnimationFrame(frame);
}

/* ---------- stadium: grass, lines, goals, boards, stands and crowd ---------- */
function buildStadium(scene, meta) {
  const rnd = (() => { let a = 20261112; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; })();
  // grass: mown in bands across the pitch, with the uneven colour real turf has
  const S = 16, cv = document.createElement('canvas');
  cv.width = PW * S; cv.height = PL * S;
  const g = cv.getContext('2d');
  for (let n = 0; n < 18; n++) { g.fillStyle = n % 2 ? '#3C8A41' : '#47994B'; g.fillRect(0, n * PL * S / 18, cv.width, PL * S / 18 + 1); }
  for (let n = 0; n < 26000; n++) { g.fillStyle = rnd() < 0.5 ? 'rgba(255,255,220,0.035)' : 'rgba(0,40,0,0.05)'; g.fillRect(rnd() * cv.width, rnd() * cv.height, 2 + rnd() * 5, 1 + rnd() * 3); }
  for (const [x, y, r] of [[PW / 2, 5, 9], [PW / 2, PL - 5, 9], [PW / 2, PL / 2, 7]]) { const w = g.createRadialGradient(x * S, y * S, 0, x * S, y * S, r * S); w.addColorStop(0, 'rgba(120,105,60,0.16)'); w.addColorStop(1, 'rgba(120,105,60,0)'); g.fillStyle = w; g.fillRect(0, 0, cv.width, cv.height); } // worn goal mouths and centre
  g.strokeStyle = '#F4F4F0'; g.fillStyle = '#F4F4F0'; g.lineWidth = 0.12 * S;
  const X = v => v * S, Y = v => v * S, mid = PW / 2;
  g.strokeRect(X(0) + 1, Y(0) + 1, X(PW) - 2, Y(PL) - 2);
  g.beginPath(); g.moveTo(X(0), Y(PL / 2)); g.lineTo(X(PW), Y(PL / 2)); g.stroke();
  g.beginPath(); g.arc(X(mid), Y(PL / 2), 9.15 * S, 0, Math.PI * 2); g.stroke();
  g.beginPath(); g.arc(X(mid), Y(PL / 2), 0.2 * S, 0, Math.PI * 2); g.fill();
  for (const end of [0, 1]) {
    const y = v => Y(end ? PL - v : v);
    g.strokeRect(X(mid - 20.16), Math.min(y(0), y(16.5)), X(40.32), Y(16.5));
    g.strokeRect(X(mid - 9.16), Math.min(y(0), y(5.5)), X(18.32), Y(5.5));
    g.beginPath(); g.arc(X(mid), y(11), 0.2 * S, 0, Math.PI * 2); g.fill();
    g.beginPath(); const a = Math.acos(5.5 / 9.15);
    if (end) g.arc(X(mid), y(11), 9.15 * S, -Math.PI / 2 - a, -Math.PI / 2 + a); else g.arc(X(mid), y(11), 9.15 * S, Math.PI / 2 - a, Math.PI / 2 + a);
    g.stroke();
    for (const cx of [0, PW]) { g.beginPath(); g.arc(X(cx), y(0), 1 * S, 0, Math.PI * 2); g.stroke(); } // corner arcs
  }
  const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8;
  const pitch = new THREE.Mesh(new THREE.PlaneGeometry(PW, PL).rotateX(-Math.PI / 2), new THREE.MeshLambertMaterial({ map: tex }));
  pitch.receiveShadow = true; scene.add(pitch);
  const apron = new THREE.Mesh(new THREE.PlaneGeometry(PW + 22, PL + 22).rotateX(-Math.PI / 2), new THREE.MeshLambertMaterial({ color: '#35793B' }));
  apron.position.y = -0.03; apron.receiveShadow = true; scene.add(apron);
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(900, 900).rotateX(-Math.PI / 2), new THREE.MeshLambertMaterial({ color: '#5B6168' }));
  ground.position.y = -0.06; scene.add(ground);

  // advertising boards in the two clubs' colours
  const strip = document.createElement('canvas'); strip.width = 1024; strip.height = 32;
  const sg = strip.getContext('2d'), cols = [meta.colors[0].f, '#F4F4F0', meta.colors[1].f, '#1E2A33', '#F2C14E', '#F4F4F0'];
  for (let n = 0; n < 16; n++) { sg.fillStyle = cols[n % cols.length]; sg.fillRect(n * 64, 0, 64, 32); sg.fillStyle = 'rgba(0,0,0,0.25)'; sg.fillRect(n * 64 + 10, 12, 44, 8); }
  const stripTex = new THREE.CanvasTexture(strip); stripTex.colorSpace = THREE.SRGBColorSpace; stripTex.wrapS = THREE.RepeatWrapping;
  for (const [w, d, x, z, rep] of [[PW + 18, 0.3, 0, -PL / 2 - 6.5, 3], [PW + 18, 0.3, 0, PL / 2 + 6.5, 3], [0.3, PL + 13, -PW / 2 - 9, 0, 4], [0.3, PL + 13, PW / 2 + 9, 0, 4]]) {
    const t = stripTex.clone(); t.repeat.set(rep, 1); t.needsUpdate = true;
    const b = new THREE.Mesh(new THREE.BoxGeometry(w, 0.95, d), new THREE.MeshLambertMaterial({ map: t })); b.position.set(x, 0.47, z); scene.add(b);
  }

  // stands: a raked bank of seats on each side, full of people
  const crowd = document.createElement('canvas'); crowd.width = 512; crowd.height = 256;
  const cg = crowd.getContext('2d'); cg.fillStyle = '#2A2F36'; cg.fillRect(0, 0, 512, 256);
  const shirts = [meta.colors[0].f, meta.colors[0].f, meta.colors[1].f, '#E8E4DA', '#30343B', '#C9B79A', '#5E6B7A', '#8A4840'];
  for (let row = 0; row < 32; row++) for (let seat = 0; seat < 100; seat++) {
    if (rnd() < 0.08) continue;
    const x = seat * 5.12 + (row % 2) * 2.5, y = row * 8 + 1;
    cg.fillStyle = shirts[Math.floor(rnd() * shirts.length)]; cg.fillRect(x, y + 3, 4, 5);
    cg.fillStyle = SKIN[Math.floor(rnd() * SKIN.length)]; cg.fillRect(x + 1, y, 2.4, 3);
  }
  const crowdTex = new THREE.CanvasTexture(crowd); crowdTex.colorSpace = THREE.SRGBColorSpace; crowdTex.wrapS = THREE.RepeatWrapping;
  const roof = new THREE.MeshLambertMaterial({ color: '#2B3138' }), wall = new THREE.MeshLambertMaterial({ color: '#3A4048' });
  const stand = (len, x, z, turn) => {
    const grp = new THREE.Group(), t = crowdTex.clone(); t.repeat.set(len / 26, 1); t.needsUpdate = true;
    const bank = new THREE.Mesh(new THREE.PlaneGeometry(len, 30), new THREE.MeshLambertMaterial({ map: t }));
    bank.rotation.x = -Math.PI / 2 + 0.62; bank.position.set(0, 9.5, -12); grp.add(bank);
    const back = new THREE.Mesh(new THREE.BoxGeometry(len, 24, 1), wall); back.position.set(0, 12, -25); grp.add(back);
    const top = new THREE.Mesh(new THREE.BoxGeometry(len, 0.6, 22), roof); top.position.set(0, 24, -15); grp.add(top);
    const front = new THREE.Mesh(new THREE.BoxGeometry(len, 1.8, 0.5), wall); front.position.set(0, 0.9, 0.2); grp.add(front);
    grp.position.set(x, 0, z); grp.rotation.y = turn; scene.add(grp);
  };
  stand(PL + 40, -PW / 2 - 12, 0, Math.PI / 2);
  stand(PL + 40, PW / 2 + 12, 0, -Math.PI / 2);
  stand(PW + 24, 0, -PL / 2 - 10, 0);
  stand(PW + 24, 0, PL / 2 + 10, Math.PI);

  // goals: 7.32 m wide, 2.44 m high, with a net you can see through
  const netCv = document.createElement('canvas'); netCv.width = netCv.height = 64;
  const ng = netCv.getContext('2d'); ng.strokeStyle = 'rgba(255,255,255,0.9)'; ng.lineWidth = 2;
  for (let n = 0; n <= 64; n += 16) { ng.beginPath(); ng.moveTo(n, 0); ng.lineTo(n, 64); ng.moveTo(0, n); ng.lineTo(64, n); ng.stroke(); }
  const netTex = new THREE.CanvasTexture(netCv); netTex.wrapS = netTex.wrapT = THREE.RepeatWrapping;
  const net = (w, h) => { const t = netTex.clone(); t.repeat.set(w * 2.2, h * 2.2); t.needsUpdate = true; return new THREE.MeshBasicMaterial({ map: t, transparent: true, opacity: 0.55, side: THREE.DoubleSide, depthWrite: false }); };
  const post = new THREE.MeshLambertMaterial({ color: '#FFFFFF' });
  for (const dir of [-1, 1]) {
    const z = dir * PL / 2, goal = new THREE.Group();
    for (const x of [-3.66, 3.66]) { const p = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 2.44, 10), post); p.position.set(x, 1.22, 0); p.castShadow = true; goal.add(p); }
    const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 7.44, 10).rotateZ(Math.PI / 2), post); bar.position.set(0, 2.44, 0); bar.castShadow = true; goal.add(bar);
    const back = new THREE.Mesh(new THREE.PlaneGeometry(7.32, 2.44), net(7.32, 2.44)); back.position.set(0, 1.22, dir * 1.8); goal.add(back);
    const top = new THREE.Mesh(new THREE.PlaneGeometry(7.32, 1.8).rotateX(Math.PI / 2), net(7.32, 1.8)); top.position.set(0, 2.44, dir * 0.9); goal.add(top);
    for (const x of [-3.66, 3.66]) { const sd = new THREE.Mesh(new THREE.PlaneGeometry(1.8, 2.44).rotateY(Math.PI / 2), net(1.8, 2.44)); sd.position.set(x, 1.22, dir * 0.9); goal.add(sd); }
    goal.position.z = z; scene.add(goal);
  }
  // corner flags
  for (const [x, z] of [[-PW / 2, -PL / 2], [PW / 2, -PL / 2], [-PW / 2, PL / 2], [PW / 2, PL / 2]]) {
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 1.5, 6), post); pole.position.set(x, 0.75, z); pole.castShadow = true; scene.add(pole);
    const flag = new THREE.Mesh(new THREE.PlaneGeometry(0.4, 0.28), new THREE.MeshBasicMaterial({ color: '#F2C14E', side: THREE.DoubleSide })); flag.position.set(x + 0.2, 1.36, z); scene.add(flag);
  }
}

export function bootReplay() { return boot().catch(fail); }
// The live match: an empty viewer for these two teams, to be fed with push() and driven with frame().
// meta: { teams: [{ id, name }, ...], colors: [{ f, s, gk }, ...], lineups: [{ min, on, body }] }
export async function createLive(embed, meta) {
  const loader = new GLTFLoader(), at = name => new URL('./assets/' + name, import.meta.url).href;
  const [playerGltf, ballGltf] = await Promise.all([binary(at('player.glb')).then(b => loader.parseAsync(b, '')), binary(at('ball.glb')).then(b => loader.parseAsync(b, ''))]);
  return start({ pitch: [PW, PL], ...meta, times: [], marks: [] }, new Int16Array(STRIDE * 512), playerGltf, ballGltf, embed);
}
