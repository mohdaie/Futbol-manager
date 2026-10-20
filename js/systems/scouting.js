'use strict';
/* ===== scouting.js =====
   Knowledge (0-100) controls how precisely you see another club's players.
   Scouts work assignments (region, position, age) and file graded reports. */

const knowOf = p => (p.club === G.club ? 100 : G.know[p.id] ?? 10);
const regionOf = p => { const c = G.clubs[p.club]; if (!c) return 'Free agents'; if (c.pl) return 'Premier Division'; if (c.fa) return 'Free agents'; return NATIONS[c.nat].r; };

// Attribute as the user sees it: exact when fully known, otherwise a stable range.
function seenAttr(p, i) {
  const k = knowOf(p), v = p.at[i];
  if (k >= 95) return { lo: v, hi: v, txt: String(v) };
  const w = Math.ceil((100 - k) / 14);
  const lo = clamp(v - Math.floor(hash01(p.id + ':' + i) * (w + 1)), 1, 20), hi = clamp(lo + w, 1, 20);
  return { lo, hi, txt: lo + '-' + hi };
}
function seenOvr(p) {
  const k = knowOf(p);
  if (k >= 95) return { v: p.ca, txt: String(p.ca) };
  if (k < 25) return { v: p.ca + Math.round((hash01(p.id + 'o') - 0.5) * 20), txt: '??' };
  const w = Math.round((100 - k) / 9);
  const lo = p.ca - Math.floor(hash01(p.id + 'r') * (w + 1));
  return { v: lo + w / 2, txt: lo + '-' + (lo + w) };
}
function seenPot(p) {
  const k = knowOf(p);
  const err = (hash01(p.id + 'p') - 0.5) * (100 - k) * 0.35;
  return stars(p.pa + err);
}

function userBestAt(pos) {
  return Math.max(0, ...seniorSquad(G.club).map(p => ovrAt(p, pos)));
}

function scoutGrade(p) {
  const score = p.ca * 0.6 + p.pa * 0.4 - userBestAt(p.pos);
  return score > 5 ? 'A' : score > 0 ? 'B' : score > -6 ? 'C' : 'D';
}
const GRADE_NOTE = { A: 'Would walk into your first team.', B: 'Would compete for a starting place.', C: 'Squad depth or one for the future.', D: 'Not good enough for your squad.' };

function matchesAssignment(p, a) {
  if (p.club === G.club) return false;
  if (a.region !== 'Everywhere' && regionOf(p) !== a.region) return false;
  if (a.pos !== 'Any' && p.pos !== a.pos) return false;
  if (p.age > a.maxAge) return false;
  return true;
}

function weeklyScouting() {
  const judge = staffAvg('Scout', 6);
  G.scout.assign.forEach(a => {
    const pool = Object.values(G.players).filter(p => matchesAssignment(p, a));
    for (let k = 0; k < 2 && pool.length; k++) {
      const p = wpick(pool, x => Math.pow(1.08, x.ca - 50) * (1 + (x.pa - x.ca) / 20));
      pool.splice(pool.indexOf(p), 1);
      G.know[p.id] = Math.min(100, knowOf(p) + 25 + judge * 2);
      const grade = scoutGrade(p);
      G.scout.reports = G.scout.reports.filter(r => r.pid !== p.id);
      G.scout.reports.unshift({ pid: p.id, grade, date: weekDate(G.week).getTime(), by: a.id });
    }
    a.left--;
  });
  const done = G.scout.assign.filter(a => a.left <= 0);
  if (done.length) addNews('club', 'Scouting assignment complete', done.map(a => `${a.region} · ${a.pos === 'Any' ? 'any position' : POS_NAME[a.pos]}`).join('; ') + '. Check the reports in Transfers.');
  G.scout.assign = G.scout.assign.filter(a => a.left > 0);
  G.scout.reports = G.scout.reports.slice(0, 40);
}

function addAssignment(region, pos, maxAge, weeks) {
  if (G.scout.assign.length >= staffOf('Scout').length) return false;
  G.scout.assign.push({ id: G.nextId++, region, pos, maxAge, left: weeks });
  return true;
}

// A quick one-off report on a single player.
function scoutPlayer(p) {
  const cost = 10000;
  if (userClub().bal < cost) return false;
  userClub().bal -= cost; G.ledger.scout += cost;
  G.know[p.id] = Math.min(100, knowOf(p) + 35 + staffAvg('Scout', 6));
  return true;
}
