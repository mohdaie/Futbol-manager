'use strict';
/* ===== calendar.js =====
   One turn = one week. Pre-season, 38 league rounds with four international breaks,
   then a short off-season before the season rolls over. */

const PRESEASON_WEEKS = 5;
const INTL_BREAKS = [3, 7, 11, 29]; // a break week follows these round indexes
const SEASON_WEEKS = PRESEASON_WEEKS + 38 + INTL_BREAKS.length + 2;

function seasonStart(season) {
  const d = new Date(season, 6, 6);
  while (d.getDay() !== 1) d.setDate(d.getDate() + 1);
  return d;
}
function weekDate(w, season) {
  const d = seasonStart(season ?? G.season);
  d.setDate(d.getDate() + 7 * w);
  return d;
}
function matchDate(w) { const d = weekDate(w); d.setDate(d.getDate() + 5); return d; }

function roundWeek(r) {
  let w = PRESEASON_WEEKS + r;
  for (const b of INTL_BREAKS) if (r > b) w++;
  return w;
}

function phaseLabel(w = G.week) {
  if (w < PRESEASON_WEEKS) return 'Pre-season';
  if (w > roundWeek(37)) return 'Off-season';
  if (!G.fixtures.some(f => f.w === w)) return 'International break';
  return 'Matchweek ' + (G.fixtures.find(f => f.w === w).r + 1);
}

function windowState(w = G.week) {
  if (w <= 8 || w >= SEASON_WEEKS - 2) return { open: true, label: 'Summer window', closes: '1 Sep' };
  const d = weekDate(w);
  if (d.getMonth() === 0 || (d.getMonth() === 1 && d.getDate() <= 2)) return { open: true, label: 'January window', closes: '2 Feb' };
  return { open: false, label: 'Window closed', closes: '' };
}
const inWindow = () => windowState().open;

// Double round robin by the circle method, second half mirrored.
function genFixtures(ids) {
  const n = ids.length, arr = shuffle(ids.slice()), rounds = [];
  for (let r = 0; r < n - 1; r++) {
    const m = [];
    for (let i = 0; i < n / 2; i++) {
      let h = arr[i], a = arr[n - 1 - i];
      if ((r + i) % 2 === 1) [h, a] = [a, h];
      m.push([h, a]);
    }
    rounds.push(m);
    arr.splice(1, 0, arr.pop());
  }
  const all = rounds.concat(rounds.map(m => m.map(([h, a]) => [a, h])));
  const out = [];
  all.forEach((m, r) => m.forEach(([h, a]) => out.push({ id: G.nextId++, r, w: roundWeek(r), h, a, hg: null, ag: null })));
  return out;
}

const userFixture = (w = G.week) => G.fixtures.find(f => f.w === w && (f.h === G.club || f.a === G.club));
const nextUserFixture = () => G.fixtures.filter(f => (f.h === G.club || f.a === G.club) && f.hg == null).sort((a, b) => a.w - b.w)[0];
const played = f => f.hg != null;

function leagueTable() {
  const T = {};
  plClubs().forEach(id => { T[id] = { id, p: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, pts: 0, form: [] }; });
  G.fixtures.filter(played).sort((a, b) => a.w - b.w).forEach(f => {
    const h = T[f.h], a = T[f.a];
    h.p++; a.p++; h.gf += f.hg; h.ga += f.ag; a.gf += f.ag; a.ga += f.hg;
    if (f.hg > f.ag) { h.w++; a.l++; h.pts += 3; h.form.push('W'); a.form.push('L'); }
    else if (f.hg < f.ag) { a.w++; h.l++; a.pts += 3; h.form.push('L'); a.form.push('W'); }
    else { h.d++; a.d++; h.pts++; a.pts++; h.form.push('D'); a.form.push('D'); }
  });
  return Object.values(T).sort((x, y) => y.pts - x.pts || (y.gf - y.ga) - (x.gf - x.ga) || y.gf - x.gf || G.clubs[y.id].rep - G.clubs[x.id].rep);
}
const tablePos = cid => leagueTable().findIndex(r => r.id === cid) + 1;
