'use strict';
/* ===== dayrun.js =====
   Continue moves the calendar on day by day. A calendar card flips through the days while the other
   matches are played, transfer business, contracts and scouting happen on their days, and the squad recovers.
   It stops by itself on matchday, at the end of the season, or when important news comes in
   (transfers, bids, contracts, injuries, suspensions, the board: newsImportant() in state.js).
   Tap Stop to pause at any time; Continue picks up from the same day. Every day is saved as it passes. */

const DAY_MS = 520;   // time each day stays on screen
const DAYRUN_MAX = 35; // safety stop after five weeks without anything happening
const DAYRUN = { on: false, timer: 0, days: 0, feed: [], stop: null };

function reviewRequiredTransfer() {
  // On holiday the director answers bids by the manager's rule; anything else calls him back (career.js).
  if (typeof onHoliday === 'function' && onHoliday()) { const why = holidayDecisions(); if (why) holidayReport(endHoliday(`Called back early: ${why}.`)); }
  if (plRegistrationDue()) {
    DAYRUN.on=false;clearTimeout(DAYRUN.timer);DAYRUN.timer=0;closeDayRun();
    go('registration');
    toast('Confirm your Premier League registration list before the window closes.');
    return true;
  }
  const pending=pendingTransferDecisions();
  if(!pending.length)return false;
  DAYRUN.on=false;clearTimeout(DAYRUN.timer);DAYRUN.timer=0;closeDayRun();
  UI.tab.tr='deals';go('transfers');dealSheet(pending[0].id);
  toast('Respond to the transfer decision before continuing.');
  return true;
}

function startDayRun() {
  if (!G || DAYRUN.on) return;
  if (reviewRequiredTransfer()) return;
  const fx = userFixture();
  if (fx && !played(fx) && (fx.d ?? 5) <= G.day && !holidayNow()) return matchdayNow(fx);
  Object.assign(DAYRUN, { on: true, days: 0, feed: [], stop: null });
  drawDayRun(true);
  DAYRUN.timer = setTimeout(dayTick, DAY_MS * 0.6);
}

async function matchdayNow(fx) {
  const game = G;
  await simUpToAsync(fx, false); if (G !== game) return;
  G.day = fx.d ?? 5; await saveGameAsync(); if (G !== game) return;
  return go('prematch');
}

const HOUR_MS = 900; // each hour of deadline day
async function dayTick() {
  const game = G;
  DAYRUN.timer = 0;
  if (!DAYRUN.on || !G) return;
  if (reviewRequiredTransfer()) return;
  // Deadline day: the hours tick by before the day moves on.
  const fxNow = userFixture();
  if (deadlineToday() && !(G.dd && G.dd.key === G.season + ':' + windowState().label && G.dd.done) && !(fxNow && !played(fxNow) && (fxNow.d ?? 5) <= G.day)) {
    const first = G.nextId, nPosts = G.social ? G.social.length : 0, D = deadlineHour();
    saveGame();
    if (reviewRequiredTransfer()) return;
    const fresh = G.news.filter(n => n.id >= first), imp = fresh.filter(newsImportant);
    const posts = G.social ? G.social.slice(0, Math.max(0, G.social.length - nPosts)) : [];
    const deal = posts.find(p => p.kind === 'here' || p.kind === 'done') || posts.find(p => p.kind !== 'ticker') || null;
    DAYRUN.feed.unshift({ d: today(), lbl: String(D.h).padStart(2, '0') + ':00', t: deal ? deal.txt : 'Phones ringing, nothing signed yet.' });
    DAYRUN.feed.length = Math.min(DAYRUN.feed.length, 5);
    DAYRUN.hourly = true;
    if (imp.length) { DAYRUN.stop = { kind: 'news', items: imp.slice(0, 4), at: today() }; return pauseDayRun(); }
    drawDayRun();
    DAYRUN.timer = setTimeout(dayTick, HOUR_MS);
    return;
  }
  DAYRUN.hourly = false;
  const firstNews = G.nextId, playedBefore = G.fixtures.filter(played).length, wasDay = today();
  let r;
  try { r = await advanceDayAsync(); } catch { if (G !== game) return; DAYRUN.on = false; toast('Results could not be updated. Your completed matches have been kept; try Continue again.'); return drawDayRun(); }
  if (!DAYRUN.on || G !== game) return;
  DAYRUN.days++;
  if (r === 'ok') saveGame(); // every day is saved, so a refresh never loses days
  const games = G.fixtures.filter(played).length - playedBefore;
  const fresh = G.news.filter(n => n.id >= firstNews && n.box !== 'log');
  const line = [];
  if (games) line.push(`${games} match${games > 1 ? 'es' : ''} played`);
  fresh.filter(n => !newsImportant(n)).slice(0, 2).forEach(n => line.push(n.title));
  if (line.length) DAYRUN.feed.unshift({ d: wasDay, t: line.join(' · ') });
  DAYRUN.feed.length = Math.min(DAYRUN.feed.length, 4);
  const imp = fresh.filter(newsImportant);
  if (reviewRequiredTransfer()) return;
  if (r === 'match' && holidayNow()) { await holidayMatch(userFixture()); if (G !== game || !DAYRUN.on) return; if (holidayFinished()) return; DAYRUN.feed.unshift({ d: wasDay, t: 'Your assistant: ' + G.career.holiday.results.at(-1)?.txt }); drawDayRun(); DAYRUN.timer = setTimeout(dayTick, DAY_MS); return; }
  if (r === 'match') return finishDayRun(() => matchdayNow(userFixture()));
  if (r === 'season' && holidayNow()) { const rep = endHoliday('The season is over.'); return finishDayRun(() => { go('review'); holidayReport(rep); }); }
  if (r === 'season') return finishDayRun(() => go('review'));
  if (r === 'sacked') return finishDayRun(() => go('home'));
  if (holidayNow()) { G.career.holiday.news.push(...imp.map(n => n.title)); if (holidayFinished()) return; }
  else if (imp.length) { DAYRUN.stop = { kind: 'news', items: imp.slice(0, 4), at: wasDay }; return pauseDayRun(); }
  if (DAYRUN.days >= DAYRUN_MAX && !holidayNow()) { DAYRUN.stop = { kind: 'quiet' }; return pauseDayRun(); }
  drawDayRun();
  const sb = document.querySelector('.subbar > span:last-child'); // the date in the header follows the calendar
  if (sb) sb.innerHTML = ICON.cal + fmtDate(today());
  DAYRUN.timer = setTimeout(dayTick, DAY_MS);
}

// Holidays (career.js): matches by instant result, the day run never pausing for news, home when it is over.
const holidayNow = () => typeof onHoliday === 'function' && onHoliday();
async function holidayMatch(fx) {
  const game = G;
  if (!fx || played(fx)) return;
  if (G.press[fx.id]) Object.assign(G.press[fx.id], { done: true, said: 'Your assistant handled the media.' });
  await playUserInstantAsync(fx); if (G !== game) return;
  holidayRecordMatch(fx); saveGame();
}
function holidayFinished() {
  if (!holidayDue()) return false;
  const rep = endHoliday('Your holiday is over.');
  finishDayRun(() => { go('home'); holidayReport(rep); });
  return true;
}

// Stop and leave the card up, showing why (important news) or that the manager paused it.
function pauseDayRun() {
  DAYRUN.on = false; clearTimeout(DAYRUN.timer); DAYRUN.timer = 0;
  saveGame();
  if (UI.s === 'home') render();
  drawDayRun();
}
function finishDayRun(next) {
  DAYRUN.on = false; clearTimeout(DAYRUN.timer); DAYRUN.timer = 0;
  closeDayRun();
  saveGame();
  next();
}
function closeDayRun() {
  const el = document.getElementById('dayrun');
  if (el) el.remove();
  DAYRUN.stop = null;
}

function drawDayRun(first) {
  let el = document.getElementById('dayrun');
  if (!el) { el = document.createElement('div'); el.id = 'dayrun'; el.className = 'dayrun'; document.body.appendChild(el); }
  const S = DAYRUN.stop, d = (S && S.at) || today(), nf = nextUserFixture(); // news shows on the day it happened
  const toMatch = nf ? Math.max(0, fxDayNo(nf) - todayNo()) : null;
  const items = S && S.kind === 'news' ? S.items : [];
  const DD = G.dd && deadlineToday() && G.dd.key === G.season + ':' + windowState().label ? G.dd : null;
  el.innerHTML = `<div class="dr-card" role="dialog" aria-live="polite" aria-label="Calendar">
      ${DD ? `<div class="dr-cal dl"><span class="dr-mon">Deadline day · ${d.getDate()} ${MONTHS[d.getMonth()]}</span><b class="dr-day">${String(Math.min(23, DD.h)).padStart(2, '0')}:00</b><span class="dr-wd">${DD.done ? 'The window is shut' : DD.h < 9 ? 'Window shuts at 23:00' : (23 - DD.h) + ' hour' + (23 - DD.h === 1 ? '' : 's') + ' left'}</span></div>`
        : `<div class="dr-cal${first ? '' : ' flip'}"><span class="dr-mon">${MONTHS[d.getMonth()]} ${d.getFullYear()}</span><b class="dr-day">${d.getDate()}</b><span class="dr-wd">${WDAYS[d.getDay()]}</span></div>`}
      <p class="dr-phase">${esc(phaseLabel())}${nf ? ` · ${toMatch === 0 ? 'matchday' : toMatch === 1 ? 'next match tomorrow' : `next match in ${toMatch} days`}` : ''}</p>
      <p id="simulationProgress" class="muted" role="status"></p>
      ${items.length ? `<h3 class="dr-h">News just in</h3><div class="list">${items.map(n => `<button class="row act news unread" data-a="dayRunOpen" data-id="${n.id}"><span class="grow"><b>${esc(n.title)}</b><small>${esc(String(n.body).slice(0, 90))}${String(n.body).length > 90 ? '…' : ''}</small></span></button>`).join('')}</div>`
        : S && S.kind === 'quiet' ? '<p class="muted">Nothing has happened for a while. Continue when you are ready.</p>'
        : `<ul class="dr-feed">${DAYRUN.feed.map(f => `<li><b>${f.lbl || WDAYS[f.d.getDay()] + ' ' + f.d.getDate()}</b> ${esc(f.t)}</li>`).join('') || '<li class="muted">Moving through the week…</li>'}</ul>`}
      <div class="btns">${DAYRUN.on ? '<button class="btn wide" data-a="dayRunStop">Stop</button>'
        : `<button class="btn ghost" data-a="dayRunClose">Close</button><button class="btn pri" data-a="dayRunGo">Continue</button>`}</div>
    </div>`;
}

ACT.continue = () => startDayRun();
ACT.dayRunStop = () => { DAYRUN.stop = { kind: 'paused' }; pauseDayRun(); };
ACT.dayRunGo = () => { closeDayRun(); startDayRun(); };
ACT.dayRunClose = () => { closeDayRun(); render(); };
ACT.dayRunOpen = ds => { closeDayRun(); go('news'); ACT.news(ds); };
