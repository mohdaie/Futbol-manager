'use strict';
/* ===== training.js =====
   Weekly training: condition recovery, injury risk, sharpness, tactical familiarity,
   and attribute growth or decline for every player in the world. */

function bumpAttr(p, dir, focusKeys) {
  const w = WEIGHTS[p.pos];
  let key;
  if (dir < 0) key = R() < 0.6 ? pick(['pac', 'sta', 'agi', 'str']) : pick(Object.keys(w));
  else if (focusKeys && focusKeys.length && R() < 0.4) key = pick(focusKeys);
  else if (R() < 0.7) key = wpick(Object.keys(w), k => w[k]);
  else key = pick(ATTRS.filter(a => (p.pos === 'GK') === (a[2] === 'G') || a[2] === 'M')).at(0);
  const i = A[key];
  p.at[i] = clamp(p.at[i] + dir, 1, 20);
  p.ca = ratingFor(p.at, p.pos);
  if (p.ca > p.pa && dir > 0) { p.at[i] -= 1; p.ca = ratingFor(p.at, p.pos); }
}

function develop(p, q, focusKeys, im) {
  const a = p.age, gap = p.pa - p.ca;
  const ageF = a <= 18 ? 1.7 : a <= 20 ? 1.45 : a <= 22 ? 1.15 : a <= 24 ? 0.85 : a <= 27 ? 0.45 : a <= 29 ? 0.15 : 0;
  const persF = ['Professional', 'Determined', 'Ambitious', 'Model Citizen'].includes(p.pers) ? 1.15 : p.pers === 'Laid Back' ? 0.85 : 1;
  const playF = 0.7 + (p.shp / 100) * 0.5;
  if (gap > 0) {
    const pUp = clamp((gap / 120) * ageF * (0.7 + q / 30) * im * playF * persF, 0, 0.85);
    if (R() < pUp) bumpAttr(p, 1, focusKeys);
  }
  if (a >= 30) {
    const pDown = (a - 29) * 0.035 * (1.2 - q / 40);
    if (R() < pDown) bumpAttr(p, -1);
  }
}

function weeklyTraining(playedThisWeek) {
  const T = G.training, foc = TRAINING_FOCUS.find(f => f.k === T.focus) || TRAINING_FOCUS[0];
  const coach = staffAvg('Coach'), physio = staffAvg('Physio');
  const facility = G.board.facTrain;
  const q = coach * 0.7 + facility * 0.3;
  const im = [0.8, 1, 1.2][T.intensity] * (T.focus === 'rec' ? 0.4 : 1);
  const userSet = new Set(userClub().squad);

  Object.values(G.players).forEach(p => {
    const mine = userSet.has(p.id);
    const c = G.clubs[p.club];
    // condition, sharpness
    const rec = mine ? [28, 22, 15][T.intensity] + (T.focus === 'rec' ? 12 : 0) + physio * 0.3 : 24;
    if (!p.inj) p.cond = Math.min(100, Math.round(p.cond + rec));
    if (!playedThisWeek.has(p.id)) p.shp = Math.max(30, p.shp - (mine && T.intensity === 2 ? 2 : 4));
    // injuries from training (user only; AI squads get match injuries)
    if (mine && !p.inj) {
      const risk = 0.006 * (1 + T.intensity * 0.6) * (T.focus === 'phy' ? 1.4 : 1) * (1.3 - physio / 40) * (p.cond < 70 ? 1.6 : 1);
      if (R() < risk) {
        const inj = pick(INJURIES.slice(0, 4));
        p.inj = { n: inj[0], w: ri(1, 3) };
        addNews('club', pname(p) + ' hurt in training', `${fullName(p)} picked up a ${inj[0].toLowerCase()} in training and will miss ${p.inj.w} week${p.inj.w > 1 ? 's' : ''}.`);
      }
    }
    // development
    const indiv = mine ? T.indiv[p.id] : null;
    const keys = indiv && indiv !== 'none' ? ATTRS.filter(x => x[2] === indiv).map(x => x[0]) : foc.attrs;
    const quality = mine ? q : c && c.rep ? 6 + (c.rep - 60) / 4 : 8;
    develop(p, quality, keys, mine ? im : 1);
    // morale drifts back toward neutral
    p.mor = Math.round(p.mor + (62 - p.mor) * 0.06);
  });
  T.fam = clamp(T.fam + (T.focus === 'tac' ? 5 : 2), 0, 100);
}

function weeklyMedical() {
  Object.values(G.players).forEach(p => {
    if (!p.inj) return;
    p.inj.w -= 1;
    if (p.inj.w <= 0) {
      if (p.club === G.club) addNews('club', pname(p) + ' back in training', `${fullName(p)} has recovered from a ${p.inj.n.toLowerCase()}.`);
      p.inj = null;
      p.cond = 75; p.shp = Math.min(p.shp, 50);
    }
  });
}
