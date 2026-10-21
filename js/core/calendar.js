'use strict';
/* ===== calendar.js =====
   One turn is one week, but every fixture has a real day and kick-off time.
   The season has weekend rounds, midweek rounds (congestion), international breaks
   and cup weekends with no league games. Days between matches decide how much
   players recover, and each fixture has weather based on the month. */

const PRESEASON_WEEKS = 5;
// Week numbers count from the first Monday of July (week 5 = mid-August).
const INTL_WEEKS = [9, 14, 19, 37];          // September, October, November, March breaks
const CUP_WEEKS = [26, 29, 33, 36, 40];      // cup weekends: no league football
const MIDWEEK_WEEKS = [12, 21, 25, 28, 32, 41]; // Tuesday/Wednesday round plus a weekend round

// Fixture slots: [day offset from Monday, kick-off, televised]
const WEEKEND_SLOTS = [[4, '20:00', 1], [5, '12:30', 1], [5, '15:00', 0], [5, '15:00', 0], [5, '15:00', 0], [5, '15:00', 0], [5, '17:30', 1], [6, '14:00', 1], [6, '14:00', 1], [6, '16:30', 1]];
const MIDWEEK_SLOTS = [[1, '19:30', 0], [1, '19:45', 0], [1, '19:45', 0], [1, '19:45', 0], [1, '20:00', 1], [2, '19:30', 0], [2, '19:45', 0], [2, '19:45', 0], [2, '20:00', 1], [2, '20:00', 1]];

// The 38 rounds mapped onto weeks: [{ w, mid }]
const SCHEDULE = (() => {
  const out = [];
  for (let w = PRESEASON_WEEKS; out.length < 38; w++) {
    if (INTL_WEEKS.includes(w) || CUP_WEEKS.includes(w)) continue;
    if (MIDWEEK_WEEKS.includes(w)) out.push({ w, mid: true });
    if (out.length < 38) out.push({ w, mid: false });
  }
  return out;
})();
const SEASON_WEEKS = SCHEDULE[37].w + 3;
const roundWeek = r => SCHEDULE[r].w;

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
const fxDayNo = f => f.w * 7 + (f.d ?? 5);
const fxSort = (a, b) => fxDayNo(a) - fxDayNo(b) || (a.t || '15:00').localeCompare(b.t || '15:00');
function fxDate(f) { const d = weekDate(f.w); d.setDate(d.getDate() + (f.d ?? 5)); return d; }
const todayNo = () => G.week * 7 + (G.day || 0);
function today() { const d = weekDate(G.week); d.setDate(d.getDate() + (G.day || 0)); return d; }
const fxWhen = f => { const d = fxDate(f); return `${WDAYS[d.getDay()]} ${d.getDate()} ${MONTHS[d.getMonth()]} · ${f.t || '15:00'}`; };
// Kept for older callers: the date of a week's main (weekend) round.
function matchDate(w) { const d = weekDate(w); d.setDate(d.getDate() + 5); return d; }

function phaseLabel(w = G.week) {
  if (w < PRESEASON_WEEKS) return 'Pre-season';
  if (w > SCHEDULE[37].w) return 'Off-season';
  const fx = G.fixtures.filter(f => f.w === w).sort(fxSort);
  if (!fx.length) return CUP_WEEKS.includes(w) ? 'Cup weekend' : 'International break';
  const next = fx.find(f => !played(f)) || fx[fx.length - 1];
  return 'Matchweek ' + (next.r + 1);
}

// Transfer windows by date. Summer: eight weeks from the start of the season (early July) to deadline day,
// 1 September. January: 1 January to deadline day, 2 February. Each shuts at 23:00 on deadline day.
const dayKey = d => d.getFullYear() * 400 + d.getMonth() * 32 + d.getDate();
function windowState(w = G.week) {
  const d = w === G.week ? today() : weekDate(w), k = dayKey(d);
  const sumOpen = seasonStart(G.season), sumShut = new Date(G.season, 8, 1), janOpen = new Date(G.season + 1, 0, 1), janShut = new Date(G.season + 1, 1, 2);
  const left = shut => Math.round((shut - new Date(d.getFullYear(), d.getMonth(), d.getDate())) / 864e5);
  if (k >= dayKey(sumOpen) && k <= dayKey(sumShut)) return { open: true, label: 'Summer window', closes: '1 Sep', deadline: sumShut, left: left(sumShut) };
  if (k >= dayKey(janOpen) && k <= dayKey(janShut)) return { open: true, label: 'January window', closes: '2 Feb', deadline: janShut, left: left(janShut) };
  return { open: false, label: 'Window closed', closes: '', opens: k < dayKey(janOpen) && k > dayKey(sumShut) ? '1 Jan' : 'July' };
}
const deadlineToday = () => { const s = windowState(); return s.open && s.left === 0; };
const inWindow = () => windowState().open;

/* ---------- weather ---------- */
// Per month: [weights for clear, rain, wind, cold, hot, snow], [min, max] temperature in °C.
const CLIMATE = {
  7: [[55, 20, 0, 0, 25, 0], [17, 28]], 8: [[55, 35, 10, 0, 0, 0], [12, 21]], 9: [[35, 45, 20, 0, 0, 0], [8, 15]],
  10: [[30, 45, 25, 0, 0, 0], [4, 11]], 11: [[10, 35, 15, 35, 0, 5], [0, 7]], 0: [[8, 30, 15, 40, 0, 7], [-1, 6]],
  1: [[7, 35, 25, 30, 0, 3], [1, 8]], 2: [[35, 40, 25, 0, 0, 0], [4, 12]], 3: [[45, 40, 15, 0, 0, 0], [7, 15]],
  4: [[65, 25, 0, 0, 10, 0], [11, 22]], 5: [[70, 20, 0, 0, 10, 0], [14, 25]], 6: [[60, 20, 0, 0, 20, 0], [16, 27]],
};
const WX_KEYS = ['clear', 'rain', 'wind', 'cold', 'hot', 'snow'];
function genWeather(date, time) {
  const [w, [lo, hi]] = CLIMATE[date.getMonth()];
  const k = wpick(WX_KEYS, x => w[WX_KEYS.indexOf(x)]);
  let temp = Math.round(rf(lo, hi) - (time >= '19:00' ? 3 : 0));
  if (k === 'cold') temp = Math.min(temp, 3);
  if (k === 'snow') temp = Math.min(temp, 0);
  if (k === 'hot') temp = Math.max(temp, 26);
  return { k, temp };
}
const wxLabel = wx => (wx ? `${WEATHER[wx.k].n} · ${wx.temp}°C` : 'Unknown');

// Double round robin by the circle method, second half mirrored.
// Each round gets real slots: the biggest games take the televised kick-offs.
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
  all.forEach((m, r) => {
    const sch = SCHEDULE[r];
    let slots = (sch.mid ? MIDWEEK_SLOTS : WEEKEND_SLOTS).map(s => s.slice());
    // no Friday night straight after a midweek round
    if (!sch.mid && MIDWEEK_WEEKS.includes(sch.w)) slots = slots.map(s => (s[0] === 4 ? [5, '15:00', 0] : s));
    const tvSlots = shuffle(slots.filter(s => s[2])), otherSlots = shuffle(slots.filter(s => !s[2]));
    const byPull = m.slice().sort((x, y) => (G.clubs[y[0]].rep + G.clubs[y[1]].rep + rf(0, 12)) - (G.clubs[x[0]].rep + G.clubs[x[1]].rep + rf(0, 12)));
    byPull.forEach(([h, a], i) => {
      const [d, t, tv] = i < tvSlots.length ? tvSlots[i] : otherSlots[i - tvSlots.length];
      const f = { id: G.nextId++, r, w: sch.w, d, t, tv: !!tv, h, a, hg: null, ag: null };
      f.wx = genWeather(fxDate(f), t);
      out.push(f);
    });
  });
  return out;
}

const played = f => f.hg != null;
const isUserFx = f => f.h === G.club || f.a === G.club;
const userFixtures = (w = G.week) => G.fixtures.filter(f => f.w === w && isUserFx(f)).sort(fxSort);
// The user's next unplayed fixture this week, or the last one if all are played.
const userFixture = (w = G.week) => { const l = userFixtures(w); return l.find(f => !played(f)) || l[l.length - 1]; };
const nextUserFixture = () => G.fixtures.filter(f => isUserFx(f) && !played(f)).sort(fxSort)[0];

// Days since this club's previous league match (null if none this season).
function restDays(cid, f) {
  const prev = G.fixtures.filter(x => (x.h === cid || x.a === cid) && fxDayNo(x) < fxDayNo(f)).sort(fxSort).pop();
  return prev ? fxDayNo(f) - fxDayNo(prev) : null;
}

// Play every other fixture this week that kicks off before (or, with inclusive, at the same time as) fx.
function simUpTo(fx, inclusive) {
  const key = fxDayNo(fx) * 10000 + +(fx.t || '15:00').replace(':', '');
  G.fixtures.filter(f => f.w === fx.w && f.id !== fx.id && !played(f) && !isUserFx(f)).sort(fxSort).forEach(f => {
    const k = fxDayNo(f) * 10000 + +(f.t || '15:00').replace(':', '');
    if (k < key || (inclusive && k === key)) quickSim(f);
  });
}

function leagueTable() {
  const T = {};
  plClubs().forEach(id => { T[id] = { id, p: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, pts: 0, form: [] }; });
  G.fixtures.filter(played).sort(fxSort).forEach(f => {
    const h = T[f.h], a = T[f.a];
    h.p++; a.p++; h.gf += f.hg; h.ga += f.ag; a.gf += f.ag; a.ga += f.hg;
    if (f.hg > f.ag) { h.w++; a.l++; h.pts += 3; h.form.push('W'); a.form.push('L'); }
    else if (f.hg < f.ag) { a.w++; h.l++; a.pts += 3; h.form.push('L'); a.form.push('W'); }
    else { h.d++; a.d++; h.pts++; a.pts++; h.form.push('D'); a.form.push('D'); }
  });
  return Object.values(T).sort((x, y) => y.pts - x.pts || (y.gf - y.ga) - (x.gf - x.ga) || y.gf - x.gf || G.clubs[y.id].rep - G.clubs[x.id].rep);
}
const tablePos = cid => leagueTable().findIndex(r => r.id === cid) + 1;
