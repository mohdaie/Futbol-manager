'use strict';
/* ===== deadline.js =====
   Deadline day, hour by hour from 09:00 to 23:00 (G.dd). Every hour deals move a step with some luck,
   computer clubs make late panic moves, bids for your players can land, and the feed gets busy.
   Anything not done when the window shuts at 23:00 collapses the next morning (dealsDay).
   The day-by-day calendar shows the hours one by one (dayrun.js); skipping the day plays them all at once. */

function ddState() {
  const s = windowState(), key = G.season + ':' + s.label;
  if (!G.dd || G.dd.key !== key) {
    G.dd = { key, h: 8, done: false, t0: G.tHist.length };
    addNews('transfer', `Deadline day: the ${s.label.toLowerCase()} shuts at 23:00`, `It's deadline day. Deals move by the hour now; anything not done by 23:00 collapses. Open deals involving your club: ${G.deals.filter(d => dealOpen(d) && d.dir !== 'ai').length}.`);
    if (typeof makeStory === 'function') storySimple(G.news[0], 'transfer', 'deadline', {});
  }
  return G.dd;
}
// One hour of deadline day. Returns the state (h = the hour just played).
function deadlineHour() {
  const D = ddState();
  if (D.done) return D;
  D.h++;
  G.deals.filter(d => dealOpen(d) && !d.need && (d.loanTerms || WINDOW_STAGES.includes(d.stage))).forEach(d => {
    if (hash01(d.id + ':h' + D.h + ':' + G.season) < (d.dir === 'ai' ? 0.45 : 0.6)) dealTick(d, true);
  });
  if (hash01('pan' + D.h + dayAbs()) < 0.55) aiMarket();       // late panic buys
  if (hash01('bid' + D.h + dayAbs()) < 0.35) aiBidsForUser();  // late bids for your players
  const left = 23 - D.h;
  if (G.social) {
    if (hash01('dr' + D.h + dayAbs()) < 0.7) falseRumour(D.h);
    if (D.h % 3 === 0 || left <= 2) post('scoop', left > 0 ? `⏰ DEADLINE DAY: ${left} hour${left > 1 ? 's' : ''} to go. ${G.tHist.length - D.t0} deals done so far today.` : `🔒 The window is SHUT. ${G.tHist.length - D.t0} deals done on deadline day.`, { kind: 'ticker' });
  }
  if (D.h >= 23) {
    D.done = true;
    const open = G.deals.filter(d => dealOpen(d) && d.dir !== 'ai' && (d.loanTerms || WINDOW_STAGES.includes(d.stage)));
    const names = list => list.map(d => pname(G.players[d.pid])).join(', ');
    const ours = open.filter(d => d.dir !== 'out'), theirs = open.filter(d => d.dir === 'out');
    addNews('transfer', 'The window has shut', `${G.tHist.length - D.t0} deals were done on deadline day.` +
      (ours.length ? ` Your move${ours.length > 1 ? 's' : ''} for ${names(ours)} ran out of time.` : '') +
      (theirs.length ? ` Bids for ${names(theirs)} lapsed; ${theirs.length > 1 ? 'they stay' : 'he stays'}.` : ''));
    if (typeof makeStory === 'function') storySimple(G.news[0], 'transfer', 'window-shut', { deals: G.tHist.length - D.t0 });
  }
  return D;
}
// Skipping the day (or playing it without the calendar card): all the hours at once.
function runDeadline() { let D = ddState(); while (!D.done) D = deadlineHour(); }
const ddHour = () => (G.dd && deadlineToday() ? G.dd.h : null);
