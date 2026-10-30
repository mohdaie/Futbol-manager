'use strict';
/* ===== career.js =====
   The manager's career: applying for jobs, offers (applications, approaches and the ones after a sacking),
   resigning, time between clubs, retirement and holidays.
   - G.career = { status: 'employed' | 'unemployed' | 'retired', apps, offers, holiday, ... }.
   - Between clubs, G.club still names the last club (the game's helpers need a club), but nothing treats it as
     yours: jobless() turns off user fixtures (calendar.js), the user side in matches (match.js) and the manager
     attachment (managers.js). The world carries on week by week; the old club is managed by the computer.
   - Holidays reuse the day run (dayrun.js): the assistant plays your matches by instant result and the
     director answers bids by your rule; anything else that needs you calls you back early. */

const CAREER_PITCHES = {
  results: { n: 'Win now', d: 'A top finish and silverware this season.' },
  youth: { n: 'Build for the future', d: 'The academy, young signings and a long-term plan.' },
  style: { n: 'Attractive football', d: 'A recognisable, attacking way of playing.' },
};
const OFFER_DAYS = 10, APP_DAYS = [4, 10];

function careerState() {
  G.career ||= { status: 'employed', apps: [], offers: [], holiday: null };
  G.career.apps ||= []; G.career.offers ||= [];
  // Older saves: a sacking left the career frozen on the job-offer screen; it is now time between clubs.
  if (G.gameOver && G.career.status === 'employed') becomeUnemployed('Sacked', G.gameOver.reason, G.gameOver.offers || []);
  return G.career;
}
const onHoliday = () => !!(G && G.career && G.career.holiday && G.career.status === 'employed');
const careerRetired = () => !!(G && G.career && G.career.status === 'retired');

// What a club's board wants to hear: a big club wants results, a small or second-tier one a plan, the rest football.
function boardPriority(cid) {
  const c = G.clubs[cid];
  return c.rep >= 80 || expectationFor(cid).pos <= 6 ? 'results' : c.rep < 68 || leagueTier(c.league) === 2 ? 'youth' : 'style';
}
// The manager's standing: his reputation, honours, how his current board rates him and how long he has been out.
function managerStanding() {
  const p = userManagerProfile(), C = careerState();
  const out = C.status === 'unemployed' ? Math.max(0, todayNo() - C.since) / 182 : 0;
  return { rep: p.reputation || 55, honours: Math.min(0.15, p.awards.length * 0.03), conf: C.status === 'employed' ? (G.board.conf - 50) / 100 : 0, out };
}
// Chance the board offers him the job. Reaching up to a club about four reputation points above his own is a
// coin flip; the right pitch, honours and a happy current board help; a long spell out of work hurts.
function jobOdds(cid, pitch) {
  const c = G.clubs[cid], s = managerStanding(), fit = s.rep - c.rep;
  const pitchFit = pitch ? (pitch === boardPriority(cid) ? 0.12 : -0.05) : 0;
  return clamp(1 / (1 + Math.exp(-(fit + 4) / 3)) + pitchFit + s.honours + s.conf * 0.4 - s.out * 0.1, 0.02, 0.92);
}
const oddsLabel = o => (o >= 0.6 ? 'likely' : o >= 0.3 ? 'possible' : 'unlikely');
function openJobs() {
  const C = careerState();
  return (G.managerJobs || []).filter(j => j.status === 'open' && G.leagues.includes(j.league) && G.clubs[j.cid]
    && !(C.status === 'employed' && j.cid === G.club) && !(C.from === j.cid && C.status === 'unemployed'));
}
function applyForJob(jobId, pitch) {
  const C = careerState(), job = (G.managerJobs || []).find(j => j.id === jobId);
  if (!job || job.status !== 'open' || C.status === 'retired') return { ok: false, msg: 'That job is no longer open.' };
  if (C.apps.some(a => a.jobId === jobId && a.status === 'pending')) return { ok: false, msg: 'You have already applied.' };
  if (!CAREER_PITCHES[pitch]) pitch = 'results';
  const app = { id: G.nextId++, jobId, cid: job.cid, pitch, day: todayNo(), decide: todayNo() + ri(APP_DAYS[0], APP_DAYS[1]), status: 'pending', odds: jobOdds(job.cid, pitch) };
  C.apps.unshift(app); C.apps = C.apps.slice(0, 30);
  // Word gets out: a board that hears its manager applied elsewhere trusts him a little less.
  if (C.status === 'employed' && R() < 0.35) {
    G.board.conf = Math.max(0, G.board.conf - 8);
    addNews('club', 'Board hears of your application', `The board has learned you applied for the ${clubName(job.cid)} job and is unhappy about it. Board confidence falls.`);
  }
  return { ok: true, msg: `Application sent to ${clubName(job.cid)}. Expect an answer within ${app.decide - app.day} days.` };
}
function makeOffer(cid, source, note) {
  const C = careerState(), c = G.clubs[cid];
  if (!c || C.offers.some(o => o.cid === cid)) return null;
  const years = 2 + Math.floor(R() * 3), salary = roundWage(managerSalaryFor(c) * (source === 'approach' ? 1.1 : 1));
  const offer = { id: G.nextId++, cid, source, salary, years, expires: todayNo() + OFFER_DAYS, note };
  C.offers.unshift(offer);
  addNews('club', `Job offer: ${c.name}`, `${note} ${c.name} offer ${money(salary)} a week on a ${years}-year contract. The offer stands for ${OFFER_DAYS} days.`, null, 'inbox');
  return offer;
}
function acceptOffer(id) {
  const C = careerState(), o = C.offers.find(x => x.id === id);
  if (!o || !G.clubs[o.cid]) return false;
  const p = userManagerProfile();
  if (takeJob(o.cid) === false || G.club !== o.cid) return false; // takeJob() returns nothing on success
  p.weeklySalary = o.salary; p.contractYears = o.years;
  const h = p.history.find(x => !x.left && x.club === o.cid); if (h) h.salary = o.salary;
  C.offers = []; C.apps.forEach(a => { if (a.status === 'pending') a.status = 'withdrawn'; });
  return true;
}
function declineOffer(id) { const C = careerState(); C.offers = C.offers.filter(o => o.id !== id); }

// Leaving a job (sacked or resigned): the club appoints an interim manager and advertises; your negotiations end.
function becomeUnemployed(kind, reason, offers = []) {
  const C = G.career ||= { status: 'employed', apps: [], offers: [], holiday: null };
  C.apps ||= []; C.offers ||= [];
  const old = G.club, c = G.clubs[old], p = G.managerProfileId && G.managerProfiles?.[G.managerProfileId];
  if (typeof lifestyle === 'function') sellSharesOnLeaving(null);
  if (p) { managerCloseEmployment(p.id, kind); p.currentClubId = null; }
  if (c) { c.managerId = null; c.mgr = null; }
  postManagerJob(old, reason);
  (G.deals || []).forEach(d => { if (dealOpen(d) && d.dir !== 'ai') d.closed = { ok: false, msg: 'The manager left the club.' }; });
  G.pitches = [];
  Object.assign(C, { status: 'unemployed', since: todayNo(), reason, kind, from: old, holiday: null });
  G.gameOver = null;
  if (typeof ensureManagerProfiles === 'function') ensureManagerProfiles(); // the interim appointment
  offers.filter(cid => G.clubs[cid] && cid !== old).forEach(cid => makeOffer(cid, 'rescue', `${G.clubs[cid].name} want you after your exit.`));
  return C;
}
function resignJob() {
  const C = careerState();
  if (C.status !== 'employed') return false;
  const c = userClub(), p = userManagerProfile();
  p.reputation = Math.max(45, (p.reputation || 55) - 1);
  addStory('club', `${G.manager} resigns`, `${G.manager} has resigned as manager of ${theClub(c)}. The club has appointed an interim manager and will look for a permanent replacement.`);
  becomeUnemployed('Resigned', `${G.manager} has resigned.`);
  saveGame();
  return true;
}
function retireCareer() {
  const C = careerState(), p = userManagerProfile();
  if (C.status === 'employed') { managerCloseEmployment(p.id, 'Retired'); const c = userClub(); if (c) { c.managerId = null; c.mgr = null; } postManagerJob(G.club, `${G.manager} has retired.`); }
  const seasons = p.history.reduce((n, h) => n + (h.seasons?.length || 0), 0);
  const earned = Object.values(p.totals || {}).reduce((a, b) => a + b, 0);
  if (typeof lifestyle === 'function') sellSharesOnLeaving(null);
  C.summary = { netWorth: typeof lifestyle === 'function' ? netWorth() : null, day: todayNo(), date: today().getTime(), season: seasonLabel(), seasons, clubs: p.history.length, trophies: (G.trophies || []).slice(), awards: p.awards.length, earned, bank: p.bank, rep: p.reputation,
    score: Math.round(seasons * 10 + (G.trophies || []).length * 120 + p.awards.length * 25 + (p.reputation || 55) * 2) };
  Object.assign(C, { status: 'retired', holiday: null, offers: [], apps: [] });
  G.gameOver = null;
  addStory('club', `${G.manager} retires`, `${G.manager} has retired from management after ${seasons} season${seasons === 1 ? '' : 's'}.`);
  saveGame();
  return C.summary;
}

// Every week: answers to applications, offers running out, approaches, vacancies from mid-season sackings and,
// out of work, a reputation that slowly fades.
function careerWeek() {
  const C = careerState(), now = todayNo();
  if (C.status === 'retired') return;
  if (typeof lifestyle === 'function') lifestyleWeek();
  C.apps.filter(a => a.status === 'pending' && now >= a.decide).forEach(a => {
    const job = G.managerJobs.find(j => j.id === a.jobId), c = G.clubs[a.cid];
    if (!job || job.status !== 'open') { a.status = 'rejected'; a.why = 'The club appointed someone else.'; return; }
    if (R() < a.odds) { a.status = 'offered'; makeOffer(a.cid, 'application', `${c.name} were impressed by your interview (${CAREER_PITCHES[a.pitch].n.toLowerCase()}).`); }
    else { a.status = 'rejected'; a.why = a.pitch !== boardPriority(a.cid) ? `They wanted someone focused on ${CAREER_PITCHES[boardPriority(a.cid)].n.toLowerCase()}.` : 'They chose a candidate with a stronger record.'; addNews('club', `${c.name} turn you down`, a.why); }
  });
  C.offers = C.offers.filter(o => now < o.expires && (o.source === 'rescue' || G.managerJobs.some(j => j.cid === o.cid && j.status === 'open')));
  careerSackings();
  // Approaches: a club with a vacancy calls a manager who fits it. Employed: only a step up, and only if his board rates him.
  const s = managerStanding(), mine = C.status === 'employed' ? userClub().rep : 0;
  if (!C.offers.length) {
    const fits = openJobs().filter(j => { const r = G.clubs[j.cid].rep; return r <= s.rep + 2 && (C.status === 'unemployed' || (r >= mine + 2 && G.board.conf >= 55)); });
    if (fits.length && R() < (C.status === 'unemployed' ? 0.15 : 0.06)) { const j = pick(fits); makeOffer(j.cid, 'approach', `${G.clubs[j.cid].name} have approached you directly.`); }
  }
  if (C.status === 'unemployed' && now - C.since > 56) { const p = userManagerProfile(); p.reputation = Math.max(45, (p.reputation || 55) - 0.05); }
}
// Mid-season sackings at computer clubs far below their target keep the job market moving.
function careerSackings() {
  if (G.week < 8 || G.week > SEASON_WEEKS - 6) return;
  for (const league of G.leagues) {
    if ((G.managerJobs || []).some(j => j.status === 'open' && j.league === league)) continue;
    const table = leagueTable(league), worst = table.map((r, i) => ({ id: r.id, pos: i + 1 }))
      .filter(x => (x.id !== G.club || jobless()) && x.pos >= expectationFor(x.id).pos + 5).sort((a, b) => b.pos - a.pos)[0];
    if (!worst || R() > 0.03) continue;
    const c = G.clubs[worst.id];
    if (c.managerId) managerCloseEmployment(c.managerId, 'Dismissed');
    c.managerId = null; c.mgr = null; ensureManagerProfiles();
    postManagerJob(worst.id, `${c.name} have sacked their manager after a poor run, ${ordinal(worst.pos)} in the table.`);
  }
}

/* ---------- holidays ---------- */
const HOLIDAY_LENGTHS = { match: 'Until after the next match', w1: '1 week', w2: '2 weeks', w4: '4 weeks', season: 'Until the end of the season' };
function startHoliday(len, bids, trip = 'none') {
  const C = careerState();
  if (C.status !== 'employed') return { ok: false, msg: 'You need a club to go on holiday from.' };
  const T = typeof TRIPS === 'object' && TRIPS[trip] || null, p = userManagerProfile();
  if (T && T.price > p.bank) return { ok: false, msg: `The ${T.n.toLowerCase()} costs ${money(T.price)}; you have ${money(p.bank)}.` };
  if (!HOLIDAY_LENGTHS[len]) len = 'w1';
  const tbl = leagueTable();
  C.holiday = { len, bids: bids === 'value' ? 'value' : 'reject', from: todayNo(), until: len[0] === 'w' ? todayNo() + 7 * +len.slice(1) : null,
    season: G.season, matches: 0, results: [], news: [], handled: [], conf0: G.board.conf, pos0: tbl.findIndex(r => r.id === G.club) + 1, trip: T ? trip : 'none', fresh0: p.fresh ?? null };
  // Bids already waiting go to the director on your rule; any other open decision has to be yours first.
  const open = holidayDecisions();
  if (open) { C.holiday = null; return { ok: false, msg: `${open} before you go.` }; }
  if (T && T.price) managerSpend(p, 'trip', T.price, `${T.n}.`);
  return { ok: true, msg: `Enjoy the break. Your assistant takes charge: ${HOLIDAY_LENGTHS[len].toLowerCase()}.` };
}
function holidayDue() {
  const h = G.career?.holiday;
  if (!h) return false;
  return h.len === 'match' ? h.matches >= 1 : h.len === 'season' ? G.season !== h.season : todayNo() >= h.until;
}
// The director answers bids by the manager's rule; anything else needs him, and cuts the holiday short.
function holidayDecisions() {
  const h = G.career.holiday;
  for (const d of pendingTransferDecisions()) {
    const p = G.players[d.pid];
    if (d.need.k === 'offer' && d.dir === 'out' && p) {
      const fee = d.fee || 0, take = h.bids === 'value' && fee >= pValue(p);
      answerOffer(d, take ? 'accept' : 'reject');
      h.handled.push(`${take ? 'Accepted' : 'Rejected'} a ${money(fee)} bid for ${fullName(p)}.`);
      continue;
    }
    // A sale the director already accepted on your rule goes through.
    if (d.need.k === 'finalout' && h.bids === 'value' && p) { completeOut(d); h.handled.push(`Sold ${fullName(p)} for ${money(d.fee || 0)}.`); continue; }
    return `${p ? fullName(p) : 'A transfer'} needs your decision`;
  }
  return null;
}
function endHoliday(why) {
  const C = careerState(), h = C.holiday;
  if (!h) return null;
  C.holiday = null;
  const tbl = leagueTable(), pos = tbl.findIndex(r => r.id === G.club) + 1;
  const report = { why: why || 'Holiday over.', days: todayNo() - h.from, results: h.results, news: h.news.slice(0, 8), handled: h.handled, conf: [h.conf0, G.board.conf], pos: [h.pos0, pos] };
  // Back rested: a week away is worth 15 freshness (lifestyleWeek), the trip adds its own on top.
  if (typeof lifestyle === 'function') { const p = lifestyle(); p.fresh = clamp(p.fresh + (TRIPS[h.trip]?.fresh || 0), 0, 100); report.trip = TRIPS[h.trip]?.n; report.fresh = [h.fresh0 ?? p.fresh, p.fresh]; }
  C.lastHoliday = report;
  const res = report.results.map(r => r.txt).join('; ');
  addNews('club', 'Back from holiday', `${report.why} ${report.days} days away. ${res ? 'Results: ' + res + '. ' : ''}League position ${ordinal(h.pos0)} → ${ordinal(pos)}; board confidence ${Math.round(h.conf0)}% → ${Math.round(G.board.conf)}%.${h.handled.length ? ' ' + h.handled.join(' ') : ''}`);
  return report;
}
function holidayRecordMatch(fx) {
  const h = G.career?.holiday; if (!h || !played(fx)) return;
  const home = fx.h === G.club, us = home ? fx.hg : fx.ag, them = home ? fx.ag : fx.hg;
  h.matches++; h.results.push({ fid: fx.id, txt: `${us > them ? 'W' : us < them ? 'L' : 'D'} ${us}-${them} v ${clubName(home ? fx.a : fx.h)}` });
}
