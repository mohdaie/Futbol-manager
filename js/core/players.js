'use strict';
/* ===== players.js =====
   Player generation, ratings, positional familiarity, value and wages. */

// Rating (about 5-100) for a set of attributes played in a position.
// Older saves have 22 attributes. The four added later (Anticipation, Off the Ball, Flair, Teamwork)
// are derived from related attributes, then nudged so the player's rating stays the same.
const DERIVE = { ant: ['pos', 'dec'], otb: ['dec', 'pac', 'fin'], fla: ['dri', 'vis'], tea: ['wor', 'dec'] };
function migrateAttrs(p) {
  if (p.at.length >= ATTRS.length) return;
  const old = p.ca;
  ATTRS.forEach(([k], i) => {
    if (i < p.at.length) return;
    const src = DERIVE[k] || ['dec'];
    p.at[i] = clamp(Math.round(src.reduce((t, s) => t + p.at[A[s]], 0) / src.length + gauss() * 1.5), 1, 20);
  });
  const fresh = ATTRS.slice(22).map(a => a[0]).filter(k => WEIGHTS[p.pos][k]);
  for (let n = 0; n < 40 && fresh.length; n++) {
    const r = playerRating(p);
    if (Math.abs(r - old) <= 0) break;
    const i = A[pick(fresh)];
    p.at[i] = clamp(p.at[i] + (r < old ? 1 : -1), 1, 20);
  }
  p.ca = playerRating(p);
  p.pa = Math.max(p.pa, p.ca);
}

function ratingFor(at, pos, calibrationVersion = 0) {
  if (calibrationVersion === 1) return calibratedAbility(at, pos).ca;
  const w = WEIGHTS[pos];
  let s = 0, t = 0;
  for (const k in w) { s += at[A[k]] * w[k]; t += w[k]; }
  return Math.round((s / t) * 5);
}

// Keep a player's rating method through training, edits and positional changes.
const playerRating = (p, pos = p.pos) => ratingFor(p.at, pos, p.originProfile?.calibrationVersion || 0);

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

const ovrAt = (p, pos) => (pos === p.pos ? p.ca : Math.round(playerRating(p, pos) * fam(p, pos)));
const pname = p => (!p ? 'Unknown' : p.fn ? p.fn[0] + '. ' + p.ln : p.ln);
const fullName = p => (!p ? 'Unknown' : p.fn ? p.fn + ' ' + p.ln : p.ln);
// Squad level: A first team, R reserves, Y U18s (older saves used a youth flag).
const lvlOf = p => p.lvl || (p.youth ? 'Y' : 'A');
const newStats = () => ({ a: 0, g: 0, as: 0, rt: 0, mom: 0, yc: 0, rc: 0, cs: 0 });
// Per-match action stats kept for each player (season totals live in p.st alongside the above).
const PSTAT_KEYS = ['pa', 'pc', 'kp', 'da', 'dw', 'tk', 'int', 'aer', 'blk', 'sh', 'sot', 'cr', 'off', 'fo', 'sv'];
const avgRating = p => (p.st.a ? p.st.rt / p.st.a : 0);

function genName(nat) {
  const N = NATIONS[nat] || NATIONS.ENG;
  return [pick(N.f), pick(N.l)];
}
const pickNat = table => wpick(Object.keys(table), k => table[k]);

// 11a: fictional prospects also have a football type, rather than being good at every
// attribute that happens to contribute to their primary position's overall.
const GENERATOR_TYPES = {
  GK: ['gk', 'sk'], DC: ['stopper', 'bpd', 'cover'], DL: ['fb', 'wb', 'inverted'], DR: ['fb', 'wb', 'inverted'],
  DM: ['anchor', 'destroyer', 'regista'], MC: ['box', 'creator', 'regista', 'runner'],
  ML: ['wing', 'runner', 'creator'], MR: ['wing', 'runner', 'creator'],
  AML: ['wing', 'dribbler', 'inside'], AMR: ['wing', 'dribbler', 'inside'],
  AMC: ['ten', 'ss', 'runner'], ST: ['poacher', 'target', 'press', 'link', 'complete'],
};
function generatedAttrs(pos, ca) {
  const type = pick(GENERATOR_TYPES[pos]), ref = PLAYER_ARCHETYPES[type], w = WEIGHTS[pos];
  const total = Object.values(w).reduce((s,v)=>s+v,0);
  const mean = Object.entries(w).reduce((s,[k,v])=>s+ref[k]*v,0)/total;
  const shift = ca/5-mean;
  return ATTRS.map(([k,,group]) => clamp(Math.round(ref[k] + (pos === 'GK' ? (group === 'G' || w[k] ? shift : 0) : group === 'G' ? 0 : shift) + gauss()*1.1),1,20));
}

function genPlayer(o) {
  const pos = o.pos, nat = o.nat || 'ENG';
  const calibrated = o.profile?.calibrationVersion === 1;
  const ca = clamp(Math.round(o.ca), 25, calibrated ? 100 : 94);
  const at = o.profile ? o.profile.at.slice() : generatedAttrs(pos, ca);
  if (!o.profile) at[A.ldr] = clamp(Math.round(rf(4, 15) + (o.age - 24) * 0.3), 1, 20);
  const [fn, ln] = genName(nat);
  const left = ['DL', 'ML', 'AMR'].includes(pos) ? 0.6 : 0.22;
  const p = {
    id: G.nextId++, fn, ln, nat, age: o.age, pos,
    alt: o.profile ? o.profile.alt.slice() : pos !== 'GK' && R() < 0.45 ? [pick(ALT_POS[pos])] : [],
    at, ca: ratingFor(at, pos, calibrated ? 1 : 0), pa: 0, club: o.club || 'FA', no: 0, wage: 0, con: 0,
    mor: ri(55, 80), cond: 100, shp: ri(55, 75), inj: null, ban: 0,
    foot: R() < left ? 'Left' : 'Right', pers: pick(PERSONALITIES),
    st: newStats(), car: { a: 0, g: 0 }, status: (o.lvl || (o.youth ? 'Y' : 'A')) === 'A' ? '' : 'Prospect', listed: false, lvl: o.lvl || (o.youth ? 'Y' : 'A'), prev: null,
  };
  if (o.profile) {
    const profile = o.profile;
    p.originProfile = { version: ROSTER_PROFILE_VERSION, calibrationVersion: profile.calibrationVersion || null,
      key: o.profileKey, at: at.slice(), ca: p.ca,
      pa: Math.max(p.ca, profile.pa), ht: profile.ht, wt: profile.wt, alt: profile.alt.slice() };
    p.ht = profile.ht; p.wt = profile.wt;
  }
  p.pa = clamp(Math.round(o.pa ?? p.ca), p.ca, calibrated ? 100 : 97);
  genBio(p);
  return p;
}

// Starting rating and potential from a real market value (EUR millions) and age.
// Used only for unprofiled reserves/youth. Named first teams use authored profiles (11a).
// Price is a weak fallback signal, not an age-based boost to every skill.
function ratingFromValue(v, age, lvl) {
  if (v > 0) {
    const base = 63 + 4.2 * Math.log2(v);
    const ca = clamp(base - (age <= 23 ? (24 - age) * 1.8 : 0) + gauss() * 1.2, 38, lvl === 'Y' ? 60 : lvl === 'R' ? 70 : 86);
    const pa = age <= 23 ? Math.max(ca + 2, base + (24 - age) * 0.8 + rf(0, 4)) : ca + (age <= 26 ? rf(0, 3) : 0);
    return [ca, clamp(pa, ca, 96)];
  }
  if (lvl === 'Y') { const ca = clamp(36 + (age - 15) * 3.5 + gauss() * 3, 28, 58); return [ca, clamp(56 + gauss() * 9, ca + 5, 92)]; }
  if (lvl === 'R') { const ca = clamp(46 + (age - 17) * 2.5 + gauss() * 3, 38, 66); return [ca, clamp(ca + rf(5, 20), ca, 90)]; }
  const ca = clamp(68 + gauss() * 2, 62, 74); // unknown senior value is missing data, not low ability
  return [ca, ca + (age <= 23 ? rf(3, 10) : 0)];
}

// A player from a ROSTERS row: [level, name, position, age, nation, foot, contract, value]
function playerFromRoster(row, club) {
  const [lvl, name, pos, age, nat, foot, con, val] = row;
  const candidate = typeof ROSTER_PROFILES !== 'undefined' ? ROSTER_PROFILES[name] : null;
  const profile = candidate && candidate.insp === row[8] && candidate.pos === pos && candidate.age === age ? candidate : null;
  if (lvl === 'A' && row[8] && !profile) throw new Error('Missing first-team profile: ' + name);
  const [ca, pa] = profile ? [ratingFor(profile.at, pos), profile.pa] : ratingFromValue(val, age, lvl);
  const p = genPlayer({ pos, ca, pa, age, nat, club, lvl, profile, profileKey: name });
  const parts = name.split(' ');
  p.fn = parts.length > 1 ? parts[0] : '';
  p.ln = parts.length > 1 ? parts.slice(1).join(' ') : name;
  p.foot = foot === 'L' ? 'Left' : foot === 'B' ? 'Either' : 'Right';
  p.con = con >= START_SEASON + 1 ? con : START_SEASON + (lvl === 'A' ? ri(1, 3) : ri(1, 2));
  if (row[8]) p.insp = row[8]; // inspirational figure: the real player he is based on (a name only)
  return p;
}

// 11a: only untouched starting careers can safely replace legacy generated attributes.
// Old training increments have no baseline in the save; never guess them or erase them.
function migrateRosterProfiles() {
  if (typeof ROSTER_PROFILES === 'undefined') return;
  G.flags ||= {};
  if (G.flags.rosterProfileVersion === ROSTER_PROFILE_VERSION) return;
  const all = Object.values(G.players);
  const untouched = G.season === START_SEASON && G.week === 0 && (G.day || 0) === 0 &&
    !all.some(p => p.st?.a > 0) && !(G.tHist || []).length;
  let retained = 0;
  all.forEach(p => {
    const key = fullName(p), profile = ROSTER_PROFILES[key];
    if (p.originProfile?.calibrationVersion) return;
    // Also require position, inspiration, and original age. A renamed/generated player is not a roster match.
    if (!profile || p.insp !== profile.insp || p.pos !== profile.pos || p.originProfile) return;
    if (!untouched || p.age !== profile.age) { retained++; return; }
    p.at = profile.at.slice(); p.ca = ratingFor(p.at,p.pos); p.pa = Math.max(p.ca,profile.pa);
    p.alt = profile.alt.slice(); p.ht = profile.ht; p.wt = profile.wt;
    p.originProfile = { version: ROSTER_PROFILE_VERSION, key, at: p.at.slice(), ca: p.ca, pa: p.pa,
      ht: p.ht, wt: p.wt, alt: p.alt.slice() };
  });
  G.flags.rosterProfileVersion = ROSTER_PROFILE_VERSION;
  G.flags.legacyRosterProfiles = retained;
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
