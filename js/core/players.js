'use strict';
/* ===== players.js =====
   Player generation, ratings, positional familiarity, value and wages. */

// Rating (about 5-100) for a set of attributes played in a position.
function ratingFor(at, pos) {
  const w = WEIGHTS[pos];
  let s = 0, t = 0;
  for (const k in w) { s += at[A[k]] * w[k]; t += w[k]; }
  return Math.round((s / t) * 5);
}

// 1 = natural position. Lower means playing out of position.
function fam(p, pos) {
  if (pos === p.pos) return 1;
  if (p.alt && p.alt.includes(pos)) return 0.97;
  if (pos === 'GK' || p.pos === 'GK') return 0.3;
  const dl = Math.abs(LINE[pos] - LINE[p.pos]);
  let f = dl === 0 ? 0.9 : dl === 1 ? 0.82 : dl === 2 ? 0.7 : 0.6;
  if (SIDE[pos] !== SIDE[p.pos]) f -= 0.04;
  return f;
}

const ovrAt = (p, pos) => (pos === p.pos ? p.ca : Math.round(ratingFor(p.at, pos) * fam(p, pos)));
const pname = p => (p ? p.fn[0] + '. ' + p.ln : 'Unknown');
const fullName = p => (p ? p.fn + ' ' + p.ln : 'Unknown');
const newStats = () => ({ a: 0, g: 0, as: 0, rt: 0, mom: 0, yc: 0, rc: 0, cs: 0 });
const avgRating = p => (p.st.a ? p.st.rt / p.st.a : 0);

function genName(nat) {
  const N = NATIONS[nat] || NATIONS.ENG;
  return [pick(N.f), pick(N.l)];
}
const pickNat = table => wpick(Object.keys(table), k => table[k]);

function genPlayer(o) {
  const pos = o.pos, nat = o.nat || 'ENG';
  const ca = clamp(Math.round(o.ca), 25, 94);
  const at = ATTRS.map(([k, , g]) => {
    const w = WEIGHTS[pos][k] || 0;
    let base;
    if (g === 'G') base = pos === 'GK' ? ca / 5 : rf(1, 4);
    else if (pos === 'GK') base = w ? ca / 5 : (ca / 5) * 0.55;
    else base = w ? (ca / 5) * (1 + 0.025 * w) : (ca / 5) * 0.72;
    return clamp(Math.round(base + gauss() * 1.7), 1, 20);
  });
  // Nudge key attributes until the positional rating hits the target.
  const keys = Object.keys(WEIGHTS[pos]);
  for (let k = 0; k < 80; k++) {
    const r = ratingFor(at, pos);
    if (Math.abs(r - ca) <= 1) break;
    const i = A[pick(keys)];
    at[i] = clamp(at[i] + (r < ca ? 1 : -1), 1, 20);
  }
  at[A.ldr] = clamp(Math.round(rf(4, 15) + (o.age - 24) * 0.3), 1, 20);
  const [fn, ln] = genName(nat);
  const left = ['DL', 'ML', 'AMR'].includes(pos) ? 0.6 : 0.22;
  const p = {
    id: G.nextId++, fn, ln, nat, age: o.age, pos,
    alt: pos !== 'GK' && R() < 0.45 ? [pick(ALT_POS[pos])] : [],
    at, ca: ratingFor(at, pos), pa: 0, club: o.club || 'FA', no: 0, wage: 0, con: 0,
    mor: ri(55, 80), cond: 100, shp: ri(55, 75), inj: null, ban: 0,
    foot: R() < left ? 'Left' : 'Right', pers: pick(PERSONALITIES),
    st: newStats(), car: { a: 0, g: 0 }, status: '', listed: false, youth: !!o.youth, prev: null,
  };
  p.pa = clamp(Math.round(o.pa ?? p.ca), p.ca, 97);
  return p;
}

// Transfer value. Peaks for young players with room to grow; drops near contract expiry.
function pValue(p) {
  let v = 1e6 * Math.pow(1.15, p.ca - 60);
  const a = p.age;
  v *= a <= 20 ? 1.6 : a <= 23 ? 1.4 : a <= 27 ? 1.2 : a <= 29 ? 1 : a <= 31 ? 0.7 : a <= 33 ? 0.4 : 0.2;
  if (a <= 24 && p.pa > p.ca) v *= 1 + (p.pa - p.ca) / 30;
  if (p.club !== 'FA') {
    const yl = p.con - G.season;
    v *= yl <= 1 ? 0.55 : yl === 2 ? 0.85 : 1;
  }
  return Math.max(25e3, roundMoney(v));
}

function wageFor(p, rep = 75) {
  let w = 3600 * Math.pow(1.135, p.ca - 55) * (0.75 + rep / 200);
  if (p.age <= 19) w *= 0.5;
  return roundWage(Math.max(800, w));
}

const stars = v => clamp(Math.round(((v - 40) / 12) * 2) / 2, 0.5, 5);
function starHtml(n) {
  let s = '';
  for (let i = 1; i <= 5; i++) s += n >= i ? '<i class="st on"></i>' : n >= i - 0.5 ? '<i class="st half"></i>' : '<i class="st"></i>';
  return '<span class="stars" aria-label="' + n + ' of 5 stars">' + s + '</span>';
}
function morLabel(m) { return m > 85 ? 'Superb' : m > 70 ? 'Very good' : m > 55 ? 'Good' : m > 40 ? 'Okay' : m > 25 ? 'Poor' : 'Very poor'; }
const morClass = m => (m > 70 ? 'good' : m > 40 ? 'warn' : 'bad');
const condClass = c => (c >= 85 ? 'good' : c >= 70 ? 'warn' : 'bad');
const attrClass = v => (v >= 16 ? 'a4' : v >= 11 ? 'a3' : v >= 6 ? 'a2' : 'a1');
