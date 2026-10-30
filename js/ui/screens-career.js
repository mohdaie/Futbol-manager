'use strict';
/* ===== screens-career.js =====
   Career screens and sheets (career.js): between clubs, retirement, applying for a job, offers, resigning,
   retiring and holidays, plus the career section of the manager profile and the home banner. */

const HOLIDAY_PICK = { len: 'w1', bids: 'reject' };
// Screens that still make sense without a club; anything else shows the between-clubs screen.
const JOBLESS_SCREENS = new Set(['unemployed', 'news', 'manager', 'competitions', 'table', 'fixtures', 'stats', 'clubs', 'clubview', 'settings', 'more', 'gamestatus']);

function offersHtml(C) {
  return C.offers.length ? `<h2 class="h2">Job offers</h2><div class="list">${C.offers.map(o => `<div class="row"><span class="grow"><b>${esc(clubName(o.cid))} · ${esc(leagueName(G.clubs[o.cid].league))}</b><small>${money(o.salary)}/week · ${o.years} years · ${esc(expectationFor(o.cid).text)} · until ${fmtDate(dayDate(o.expires), false)}</small></span><span class="btns"><button class="btn sm ghost" data-a="careerDecline" data-id="${o.id}">Decline</button><button class="btn sm pri" data-a="careerAccept" data-id="${o.id}">Accept</button></span></div>`).join('')}</div>` : '';
}
function applicationsHtml(C) {
  const apps = C.apps.slice(0, 8);
  const label = { pending: 'Waiting for an answer', offered: 'Offer made', rejected: 'Turned down', withdrawn: 'Withdrawn' };
  return apps.length ? `<h2 class="h2">Your applications</h2><div class="list">${apps.map(a => `<div class="row"><span class="grow"><b>${esc(clubName(a.cid))}</b><small>${label[a.status]}${a.why ? ' · ' + esc(a.why) : ''} · pitch: ${esc(CAREER_PITCHES[a.pitch].n)}</small></span></div>`).join('')}</div>` : '';
}
function vacanciesHtml(C) {
  const jobs = openJobs(), applied = new Set(C.apps.filter(a => a.status === 'pending').map(a => a.jobId));
  return `<h2 class="h2">Manager jobs</h2><div class="list">${jobs.map(j => `<div class="row"><span class="grow"><b>${esc(clubName(j.cid))} · ${esc(leagueName(j.league))}</b><small>${esc(j.reason)} · board priority: ${esc(CAREER_PITCHES[boardPriority(j.cid)].n.toLowerCase())} · chance ${oddsLabel(jobOdds(j.cid, boardPriority(j.cid)))} · closes ${fmtDate(j.opened + 35 * 864e5, false)}</small></span>${applied.has(j.id) ? '<span class="tag">Applied</span>' : `<button class="btn sm" data-a="careerApply" data-id="${j.id}">Apply</button>`}</div>`).join('') || '<p class="muted">No vacancies right now. Clubs sack managers during the season and at the end of it; keep checking.</p>'}</div>`;
}
const dayDate = n => { const d = today(); d.setDate(d.getDate() + n - todayNo()); return d; };

SCREENS.unemployed = {
  render() {
    const C = careerState(), p = userManagerProfile(), weeks = Math.floor(Math.max(0, todayNo() - C.since) / 7);
    return `<h1 class="h1">Between clubs</h1>
      <div class="card"><div class="kv"><div><small>Last club</small><b>${esc(clubName(C.from))}</b></div><div><small>Out of work</small><b>${weeks ? weeks + ' week' + (weeks === 1 ? '' : 's') : 'Since this week'}</b></div><div><small>Reputation</small><b>${Math.round(p.reputation)}</b></div><div><small>Personal bank</small><b>${money(p.bank)}</b></div></div>
        <p class="muted">${esc(C.reason || '')} The leagues carry on without you. Apply for vacancies, wait for an approach, or retire. Your reputation starts to fade after eight weeks out.</p>
        <div class="btns"><button class="btn pri" data-a="continue">Continue</button><button class="btn ghost" data-a="careerRetireAsk">Retire</button></div></div>
      ${offersHtml(C)}${applicationsHtml(C)}${vacanciesHtml(C)}`;
  },
};
SCREENS.retired = {
  full: true,
  render() {
    const C = careerState(), s = C.summary || {}, p = userManagerProfile();
    return `<div class="start review"><header class="st-hero">${avatarImg(G.avatar, 'av-hero')}<div class="eyebrow">${esc(s.season || seasonLabel())}</div><h1 class="logo">Retired</h1><p>${esc(G.manager)} has stepped away from management.</p></header>
      <div class="card"><div class="kv"><div><small>Career score</small><b>${s.score ?? 0}</b></div><div><small>Seasons</small><b>${s.seasons ?? 0}</b></div><div><small>Clubs</small><b>${s.clubs ?? 0}</b></div><div><small>Trophies</small><b>${(s.trophies || []).length}</b></div><div><small>Honours</small><b>${s.awards ?? 0}</b></div><div><small>Career earnings</small><b>${money(s.earned || 0)}</b></div></div></div>
      ${(s.trophies || []).length ? `<h2 class="lbl">Trophies</h2><div class="list">${s.trophies.map(t => `<div class="row"><span class="grow"><b>${esc(t.name)}</b><small>${esc(t.season)}</small></span></div>`).join('')}</div>` : ''}
      <h2 class="lbl">Career</h2><div class="list">${p.history.slice().reverse().map(h => `<div class="row"><span class="grow"><b>${esc(h.name)}</b><small>${esc(h.joined)}${h.left ? ' – ' + esc(h.left) + ' · ' + esc(h.reason) : ''}</small></span></div>`).join('')}</div>
      <button class="btn wide" data-a="newGame2">Start a new career</button></div>`;
  },
};

// The career section of your manager profile: offers, applications, vacancies and what you can do now.
function careerProfileHtml() {
  const C = careerState();
  if (C.status !== 'employed') return offersHtml(C) + applicationsHtml(C) + vacanciesHtml(C);
  return `<div class="card career-actions"><h3>Your future</h3><p class="muted">Take a break and let your assistant run things, step down, or end your career.</p>
      <div class="btns"><button class="btn sm" data-a="careerHolidayAsk">Go on holiday</button><button class="btn sm ghost" data-a="careerResignAsk">Resign</button><button class="btn sm ghost" data-a="careerRetireAsk">Retire</button></div></div>
    ${offersHtml(C)}${applicationsHtml(C)}${vacanciesHtml(C)}`;
}
// Home: on holiday, and offers waiting.
function careerBanner() {
  const C = careerState(), h = C.holiday;
  const hol = h ? `<section class="card career-banner"><h3>On holiday</h3><p class="muted">${esc(HOLIDAY_LENGTHS[h.len])}. Your assistant is in charge: ${h.matches} match${h.matches === 1 ? '' : 'es'} played so far. Press Continue to let the days pass.</p><div class="btns"><button class="btn sm" data-a="careerHolidayEnd">Come back now</button></div></section>` : '';
  const off = C.offers.length ? `<section class="card career-banner"><h3>Job offer${C.offers.length > 1 ? 's' : ''}</h3><p class="muted">${C.offers.map(o => esc(clubName(o.cid))).join(', ')} ${C.offers.length > 1 ? 'want' : 'wants'} you as manager.</p><div class="btns"><button class="btn sm" data-a="go" data-s="manager">View</button></div></section>` : '';
  return hol + off;
}
function holidayReport(r) {
  if (!r) return;
  sheet(`<h3 class="sh-t">Welcome back</h3><p class="muted">${esc(r.why)} ${r.days} day${r.days === 1 ? '' : 's'} away.</p>
    <div class="kvrow"><span>League position</span><b>${ordinal(r.pos[0])} → ${ordinal(r.pos[1])}</b></div><div class="kvrow"><span>Board confidence</span><b>${Math.round(r.conf[0])}% → ${Math.round(r.conf[1])}%</b></div>
    ${r.results.length ? `<h4 class="lbl">Results</h4><div class="list">${r.results.map(x => `<div class="row"><span class="grow"><b>${esc(x.txt)}</b></span></div>`).join('')}</div>` : '<p class="muted">No matches while you were away.</p>'}
    ${r.handled.length ? `<h4 class="lbl">Your director</h4><div class="list">${r.handled.map(x => `<div class="row"><span class="grow">${esc(x)}</span></div>`).join('')}</div>` : ''}
    ${r.news.length ? `<h4 class="lbl">While you were away</h4><div class="list">${r.news.map(x => `<div class="row"><span class="grow">${esc(x)}</span></div>`).join('')}</div>` : ''}
    <button class="btn wide pri" data-a="closeSheet">Back to work</button>`, { key: 'career:holiday' });
}

ACT.careerApply = ds => {
  const job = G.managerJobs.find(j => j.id === +ds.id); if (!job) return;
  sheet(`<h3 class="sh-t">Apply: ${esc(clubName(job.cid))}</h3><p class="muted">${esc(job.reason)} In the interview, what do you promise? The board's priority is <b>${esc(CAREER_PITCHES[boardPriority(job.cid)].n.toLowerCase())}</b>.</p>
    <div class="list">${Object.entries(CAREER_PITCHES).map(([k, x]) => `<button class="row act" data-a="careerApplyGo" data-id="${job.id}" data-k="${k}"><span class="grow"><b>${esc(x.n)}</b><small>${esc(x.d)} · chance ${oddsLabel(jobOdds(job.cid, k))}</small></span><span class="chev">›</span></button>`).join('')}</div>
    ${careerState().status === 'employed' ? '<p class="note">Your board may find out you applied, and trust you a little less.</p>' : ''}`, { key: 'career:apply' });
};
ACT.careerApplyGo = ds => { const r = applyForJob(+ds.id, ds.k); toast(r.msg); saveGame(); closeSheet(true); render(); };
ACT.careerAccept = ds => { const o = careerState().offers.find(x => x.id === +ds.id); if (o && acceptOffer(o.id)) { toast(`You are the new manager of ${clubName(o.cid)}.`); UI.tab = {}; saveGame(); go('home'); } };
ACT.careerDecline = ds => { declineOffer(+ds.id); saveGame(); render(); };
ACT.careerResignAsk = () => sheet(`<h3 class="sh-t">Resign?</h3><p class="muted">You leave ${esc(clubName(G.club))} at once and go out of work. The board appoints an interim manager, your open transfer talks end, and your reputation drops a little. You can apply for other jobs straight away.</p>
  <div class="btns"><button class="btn ghost" data-a="closeSheet">Stay</button><button class="btn pri" data-a="careerResign">Resign</button></div>`, { key: 'career:resign' });
ACT.careerResign = () => { closeSheet(true); resignJob(); go('unemployed'); };
ACT.careerRetireAsk = () => sheet(`<h3 class="sh-t">Retire?</h3><p class="muted">This ends your career for good. You will see your career summary; the save is kept, but you cannot manage again in it.</p>
  <div class="btns"><button class="btn ghost" data-a="closeSheet">Not yet</button><button class="btn pri" data-a="careerRetire">Retire</button></div>`, { key: 'career:retire' });
ACT.careerRetire = () => { closeSheet(true); retireCareer(); render(); };
ACT.careerHolidayAsk = () => (Object.assign(HOLIDAY_PICK, { len: 'w1', bids: 'reject' }), sheet(`<h3 class="sh-t">Go on holiday</h3><p class="muted">Your assistant picks the team and plays your matches (instant results). You will be called back early if a transfer needs you.</p>
  <div class="field"><label>How long</label><div class="chips">${Object.entries(HOLIDAY_LENGTHS).map(([k, n], i) => `<button class="chip ${i === 1 ? 'on' : ''}" data-a="careerHolidayLen" data-v="${k}">${n}</button>`).join('')}</div></div>
  <div class="field"><label>Bids for your players</label><div class="seg"><button class="on" data-a="careerHolidayBids" data-v="reject">Reject all</button><button data-a="careerHolidayBids" data-v="value">Accept at market value</button></div></div>
  <button class="btn wide pri" data-a="careerHolidayGo">Start holiday</button>`, { key: 'career:holiday-start' }));
ACT.careerHolidayLen = ds => { HOLIDAY_PICK.len = ds.v; document.querySelectorAll('[data-a=careerHolidayLen]').forEach(b => b.classList.toggle('on', b.dataset.v === ds.v)); };
ACT.careerHolidayBids = ds => { HOLIDAY_PICK.bids = ds.v; document.querySelectorAll('[data-a=careerHolidayBids]').forEach(b => b.classList.toggle('on', b.dataset.v === ds.v)); };
ACT.careerHolidayGo = () => { const r = startHoliday(HOLIDAY_PICK.len, HOLIDAY_PICK.bids); toast(r.msg); if (!r.ok) return; closeSheet(true); saveGame(); go('home'); startDayRun(); };
ACT.careerHolidayEnd = () => { holidayReport(endHoliday('You came back early.')); saveGame(); render(); };
