'use strict';
/* ===== season.js =====
   The weekly turn, monthly awards, youth intake, board requests,
   end-of-season review, rollover and the sack. */

// Returns 'match' when the user must play first, 'season' at season end, otherwise 'ok'.
function advanceWeek() {
  const fx = userFixture();
  if (fx && !played(fx)) return 'match';
  const playedOutside = G.fixtures.filter(f => f.w === G.week && !played(f));
  playedOutside.forEach(f => quickSim(f));
  if (typeof worldAlertForResults === 'function') worldAlertForResults(playedOutside);
  const pw = new Set(G.flags.pw || []);
  G.flags.pw = [];
  weeklyTraining(pw);
  weeklyMedical();
  weeklyFinance();
  managerJobWeek();
  staffWeekly();
  moodWeekly();
  transferLearnWeekly();
  // Day jobs not reached day by day this week (Admin time skips) still happen once.
  DAY_JOBS.forEach(([, k, fn]) => dayJob(k, fn));
  monthly();
  youthIntake();
  if (G.week % 6 === 5) G.staffPool = genStaffPool(userClub().rep);
  if (G.board.conf < 10 && G.week > 12) { sack('The board has lost confidence after a run of poor results.'); return 'sacked'; }
  updateCompetitionSeason();
  G.week++;
  G.day = 0;
  if (G.week >= SEASON_WEEKS) { seasonEnd(); return G.gameOver ? 'sacked' : 'season'; }
  const nx = userFixture();
  if (nx && !G.press[nx.id]) G.press[nx.id] = { Q: pickPress(nx), done: false };
  saveGame();
  return 'ok';
}

/* ---------- day by day ---------- */
// Jobs on a set day of the week (Monday = 0): transfer business midweek, contracts and scouting reports later.
// Each runs once a week, whether the week is played day by day or skipped in one go.
const DAY_JOBS = [[2, 'transfers', () => weeklyTransfers()], [3, 'contracts', () => weeklyContracts()], [4, 'scouting', () => weeklyScouting()]];
function dayJob(key, fn) {
  const d = G.flags.dj || (G.flags.dj = {}), stamp = G.season + ':' + G.week;
  if (d[key] === stamp) return;
  d[key] = stamp; fn();
}
// One calendar day: the other matches kicking off today, today's jobs, and the squad's recovery.
// Returns 'match' (the user's match is today), 'season', 'sacked' or 'ok'. Sunday rolls into the next week.
function advanceDay() {
  const fx = userFixtures().find(f => !played(f));
  if (fx && (fx.d ?? 5) <= G.day) return 'match';
  if (deadlineToday() && !ddState().done) runDeadline(); // deadline day plays out hour by hour first
  const playedOutside = G.fixtures.filter(f => f.w === G.week && (f.d ?? 5) === G.day && !played(f) && !isUserFx(f)).sort(fxSort);
  playedOutside.forEach(f => quickSim(f));
  if (typeof worldAlertForResults === 'function') worldAlertForResults(playedOutside);
  DAY_JOBS.forEach(([d, k, fn]) => { if (d === G.day) dayJob(k, fn); });
  scoutDay();
  dealsDay();
  if (typeof processLoans === 'function') processLoans();
  socialDay();
  if (G.day >= 6) return advanceWeek();
  G.day++;
  squadOf(G.club).forEach(p => recoverTo(p, todayNo()));
  return 'ok';
}

// After the user's match: play the rest of the round so the table is current.
// After the user's match: play the other games up to the same kick-off so the table is current.
function finishRound() {
  const fx = G.fixtures.find(f => f.id === G.lastMatch);
  if (fx) simUpTo(fx, true);
  saveGame();
}

// The user's match as an instant result, keeping the order of kick-offs.
function playUserInstant(fx) {
  simUpTo(fx, false);
  G.day = fx.d ?? 5;
  quickSim(fx);
  finishRound();
}

function monthly() {
  const d0 = weekDate(G.week), d1 = weekDate(G.week + 1);
  if (d0.getMonth() === d1.getMonth()) return;
  const snap = G.flags.snap || {};
  const pl = Object.values(G.players).filter(p => G.clubs[p.club] && G.clubs[p.club].pl && leagueOf(p.club) === leagueOf(G.club));
  if (G.week > PRESEASON_WEEKS + 2 && G.week < SEASON_WEEKS - 2) {
    let best = null, bv = 0;
    pl.forEach(p => {
      const s = snap[p.id] || [0, 0, 0];
      const a = p.st.a - s[0];
      if (a < 2) return;
      const v = (p.st.rt - s[1]) / a + (p.st.g - s[2]) * 0.15;
      if (v > bv) { bv = v; best = p; }
    });
    if (best) {
      addNews('league', `${MONTH_NAMES[d0.getMonth()]} Player of the Month`, `${fullName(best)} of ${theClub(best.club)} wins the award.`);
      if (best.club === G.club) best.mor = clamp(best.mor + 10, 0, 100);
    }
    const t0 = d0.getTime() - 35 * 864e5;
    const pts = {};
    G.fixtures.filter(f => played(f) && leagueFixture(f) && weekDate(f.w).getTime() > t0 && f.w <= G.week).forEach(f => {
      pts[f.h] = (pts[f.h] || 0) + (f.hg > f.ag ? 3 : f.hg === f.ag ? 1 : 0);
      pts[f.a] = (pts[f.a] || 0) + (f.ag > f.hg ? 3 : f.hg === f.ag ? 1 : 0);
    });
    const top = Object.entries(pts).sort((a, b) => b[1] - a[1])[0];
    if (top) {
      const mine = top[0] === G.club;
      addNews('league', `${MONTH_NAMES[d0.getMonth()]} Manager of the Month`, mine ? `${G.manager} wins the award after ${top[1]} points from the month.` : `${TheClub(top[0])} manager collects the award after ${top[1]} points.`);
      if (mine) { G.board.conf = clamp(G.board.conf + 3, 0, 100); G.trophies.push({ season: seasonLabel(), name: MONTH_NAMES[d0.getMonth()] + ' Manager of the Month' }); }
    }
  }
  G.flags.snap = {};
  pl.forEach(p => { G.flags.snap[p.id] = [p.st.a, p.st.rt, p.st.g]; });
}

function youthIntake() {
  const d = weekDate(G.week);
  if (G.flags.intake || d.getMonth() !== 2 || d.getDate() < 15) return;
  G.flags.intake = true;
  const c = userClub(), n = ri(4, 7), q = 52 + G.board.facYouth * 1.7 + (c.rep - 70) / 4;
  const names = [];
  for (let i = 0; i < n && squadSpace(c); i++) names.push(genYouth(c, q));
  if (!names.length) return;
  const star = names.slice().sort((a, b) => b.pa - a.pa)[0];
  addStory('club', 'Youth intake arrives', `${names.length} new players join the ${c.league === 'ECH' ? 'reserves' : 'academy'}. Head of youth development highlights ${fullName(star)} (${star.pos}) as the pick of the group.`);
}

function boardRequest(kind) {
  const c = userClub(), B = G.board, key = kind + ':' + G.season + ':' + windowState().label;
  if (G.flags['req_' + key]) return 'You have already asked the board about this recently.';
  G.flags['req_' + key] = true;
  if (kind === 'funds') {
    if (!inWindow()) return 'The board only reviews budgets while a transfer window is open.';
    if (B.conf >= 55 && c.bal > G.fin.tb * 1.5 && R() < 0.65) { const add = roundMoney(c.bal * 0.08); G.fin.tb += add; return `The board approves an extra ${money(add)} for transfers.`; }
    B.conf = Math.max(0, B.conf - 2);
    return 'The board declines. They want to see better results first.';
  }
  const lvl = kind === 'train' ? B.facTrain : B.facYouth;
  if (lvl >= 20) return 'Facilities are already at the highest level.';
  const cost = roundMoney(3e6 + lvl * 0.8e6);
  if (B.conf < 50 || c.bal < cost * 2) { B.conf = Math.max(0, B.conf - 1); return `The board declines. An upgrade costs ${money(cost)} and they want more confidence and cash first.`; }
  c.bal -= cost; G.ledger.ops += cost;
  if (kind === 'train') B.facTrain++; else B.facYouth++;
  return `Approved. ${money(cost)} invested; ${kind === 'train' ? 'training' : 'youth'} facilities rise to level ${lvl + 1}.`;
}

function seasonEnd() {
  const table = leagueTable(), c = userClub();
  const managerChampions = managerSeasonRecords();
  const pos = table.findIndex(r => r.id === G.club) + 1, me = table[pos - 1];
  for (const id of G.leagues) leagueTable(id).forEach((r, i, rows) => { const prize = (rows.length - i) * (id === 'ECH' ? .15e6 : 1.5e6); G.clubs[r.id].bal += prize; if (r.id === G.club) G.ledger.prize += prize; });
  const pl = Object.values(G.players).filter(p => G.clubs[p.club] && G.clubs[p.club].pl && leagueOf(p.club) === leagueOf(G.club));
  const top = (arr, f) => arr.slice().sort((a, b) => f(b) - f(a))[0];
  const boot = top(pl, p => p.st.g + p.st.as * 0.01);
  const best = top(pl.filter(p => p.st.a >= 15), avgRating);
  const young = top(pl.filter(p => p.st.a >= 10 && p.age <= 21), avgRating);
  const aw = p => (p ? { name: fullName(p), club: p.club, v: p.st.g, r: avgRating(p).toFixed(2) } : null);
  const target = G.board.target.pos;
  G.board.conf = clamp(G.board.conf + (target - pos) * 4, 0, 100);
  const verdict = pos <= target - 3 ? 'The board is delighted. You beat expectations by a distance.' : pos <= target ? 'The board is pleased. You met your objective.' : pos <= target + 3 ? 'The board is disappointed to miss the objective but will keep faith.' : 'The board is unhappy with the season.';
  const review = { season: seasonLabel(), pos, pts: me.pts, champ: table[0].id, boot: aw(boot), best: aw(best), young: aw(young), verdict, target: G.board.target.text, ledger: { ...G.ledger }, league: leagueOf(G.club), relegated: table.slice(-3).map(r => r.id), promoted: G.playoffs ? G.playoffs.automatic.concat(G.playoffs.winner).filter(Boolean) : [] };
  G.history.unshift({ season: seasonLabel(), champ: table[0].id, pos, pts: me.pts, club: G.club, boot: review.boot && review.boot.name + ' (' + review.boot.v + ')' });
  if (table[0].id === G.club) G.trophies.push({ season: seasonLabel(), name: leagueName() + ' champions' });
  if (managerChampions[leagueOf(G.club)] === G.club) managerAddAward(`${leagueName()} champions · ${seasonLabel()}`, 250000);
  else if (pos <= G.board.target.pos) managerOwnerBonus('owner', Math.round((G.clubs[G.club].league === 'ECH' ? 18000 : 90000) * (1 + (G.board.target.pos - pos) * 0.12)), 'The owner rewarded you for meeting the season objective.');
  // Reputation follows this division's results before promotion/relegation.
  const repOrder = leagueClubs().slice().sort((a, b) => G.clubs[b].rep - G.clubs[a].rep);
  table.forEach((r, i) => { const cl = G.clubs[r.id]; cl.rep = clamp(Math.round((cl.rep + (repOrder.indexOf(r.id) - i) * 0.4) * 10) / 10, 55, 95); });
  G.seasonReview = review;
  if ((pos > target + 5 && G.board.conf < 35) || G.board.conf < 10) { sack(`A ${ordinal(pos)}-place finish against a target of ${lcFirst(G.board.target.text)} has cost you your job.`); }
  review.divisionChanges = applyDivisionChanges();
  rollover();
}

function retire(p) {
  removeFromClub(p);
  delete G.players[p.id]; delete G.know[p.id];
  G.shortlist = G.shortlist.filter(id => id !== p.id);
  G.pitches = G.pitches.filter(x => x.pid !== p.id);
  G.scout.reports = G.scout.reports.filter(r => r.pid !== p.id);
}

function rollover() {
  if (typeof payInstalments === 'function') payInstalments(true);
  seasonFavourites();
  staffSeasonEnd();
  const S = G.season, c = userClub(), left = [];
  Object.values(G.players).forEach(p => {
    const cl = G.clubs[p.club];
    p.prev = { ...p.st, season: seasonLabel() };
    p.st = newStats(); p.ban = Math.max(0, p.ban || 0); p.age++; p.rd = null; p.cond = 100;
    if (!cl || cl.fa) return;
    if (p.con <= S + 1) {
      if (p.club === G.club) {
        if (lvlOf(p) !== 'A') p.con = S + 3;
        else { moveClub(p, 'FA'); p.con = 0; left.push(fullName(p)); }
      } else if (R() < 0.7) p.con = S + 1 + ri(1, 3);
      else { moveClub(p, 'FA'); p.con = 0; }
    }
  });
  const retired = [];
  Object.values(G.players).forEach(p => {
    if (p.age >= 38 || (p.age >= 35 && R() < 0.6) || (p.age >= 33 && p.ca < 62 && R() < 0.4)) {
      if (p.ca >= 76 || p.club === G.club) retired.push(fullName(p));
      retire(p);
    }
  });
  // Academy graduation: U18s who turn 19 move up to the reserves at every club.
  Object.values(G.players).forEach(p => { if (lvlOf(p) === 'Y' && p.age >= 19) { p.lvl = 'R'; p.youth = false; p.wage = Math.max(p.wage, 1500); } });
  // Computer clubs: reserves at 23 either step up or are released; then refill both youth levels.
  domesticClubs().forEach(id => {
    const cl = G.clubs[id];
    if (id !== G.club) levelSquad(id, 'R').filter(p => p.age >= 23).forEach(p => {
      const worst = Math.min(...seniorSquad(id).map(x => x.ca));
      if (p.ca >= worst) { p.lvl = 'A'; p.wage = wageFor(p, cl.rep); } else { moveClub(p, 'FA'); p.lvl = 'A'; p.con = 0; }
    });
    if (cl.league === 'ECH') fillLevel(cl, 'R', Math.min(12, Math.max(0, 36 - seniorSquad(id).length)));
    else { fillLevel(cl, 'R', 18); fillLevel(cl, 'Y', 20); }
  });
  Object.values(G.clubs).filter(x => x.foreign && !x.fa && !x.backgroundOnly && !x.foreignSquad).forEach(x => {
    while (x.squad.length < 16) { const p = genPlayer({ pos: pick(SQUAD_TEMPLATE), ca: 60 + (x.rep - 50) * 0.6 - rf(0, 8), pa: 0, age: ri(17, 24), nat: R() < 0.75 ? x.nat : pickNat(PL_NATS), club: x.id }); p.pa = clamp(p.ca + ri(3, 18), p.ca, 95); addToClub(p, x); G.know[p.id] = 10; }
  });
  G.season++; G.week = 0; G.day = 0;
  ensurePremierLeagueRegistrations();
  if (typeof resetTrainingDev === 'function') resetTrainingDev();
  G.playoffs = null;
  G.fixtures = G.leagues.flatMap(id => genFixtures(leagueClubs(id), id));
  G.press = {};
  G.flags = {};
  weeklyTransfers();
  if (!G.gameOver) {
    G.board.target = expectationFor(G.club);
    G.fin.tb = roundMoney(Math.max(0, Math.max(5e6, c.bal * 0.3) - (typeof transferCommitments === 'function' ? transferCommitments(c.id).nextYear : 0)));
    G.fin.wb = roundWage(Math.max(clubWageBill(c) * 1.1, G.fin.wb));
  }
  G.ledgerPrev = G.ledger; G.ledger = emptyLedger();
  G.pitches = [];
  addNews('club', `${seasonLabel()} season begins`, `Board objective: ${lcFirst(G.board.target.text)}. Transfer budget: ${money(G.fin.tb)}.` + (left.length ? ` Out of contract and gone: ${left.join(', ')}.` : ''));
  if (retired.length) addNews('league', 'Retirements', retired.join(', ') + ' have hung up their boots.');
  saveGame();
}

function sack(reason) {
  const me = userClub().rep;
  const offers = domesticClubs().filter(id => id !== G.club && G.clubs[id].rep < me).sort(() => R() - 0.5).slice(0, 3);
  if (!offers.length) offers.push(domesticClubs().filter(id => id !== G.club).sort((a, b) => G.clubs[a].rep - G.clubs[b].rep)[0]);
  G.gameOver = { reason, offers, club: G.club };
  managerCloseEmployment(G.managerProfileId, 'Dismissed');
  postManagerJob(G.club, reason);
  saveGame();
}

function takeJob(cid) {
  if (!G.clubs[cid] || G.clubs[cid].backgroundOnly || G.clubs[cid].foreignSquad) return false;
  const old = G.club;
  managerCloseEmployment(G.managerProfileId, 'Left for another club');
  G.club = cid;
  G.gameOver = null;
  managerReplaceAt(old, 'Replaced after departure');
  managerHireUser(cid);
  const vacancy = G.managerJobs?.find(j => j.cid === cid && j.status === 'open');
  if (vacancy) { vacancy.status = 'filled'; vacancy.filled = today().getTime(); }
  setupUserClub();
  G.board.conf = 60;
  addStory('club', `${G.manager} takes over at ${theClub(cid)}`, `After leaving ${theClub(old)}, ${G.manager} gets a fresh start. Objective: ${lcFirst(G.board.target.text)}.`);
  saveGame();
}
