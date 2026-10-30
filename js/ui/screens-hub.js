'use strict';
/* ===== screens-hub.js =====
   Home dashboard, news & inbox, the More menu, fixtures, league table,
   stats leaders, club overview and settings. */

// Morale face: green smile, amber flat, red frown.
function moodFace(m) {
  const cls = m > 62 ? 'good' : m > 42 ? 'warn' : 'bad', col = { good: '#2BD46A', warn: '#F5C518', bad: '#F43F5E' }[cls];
  const mouth = cls === 'good' ? 'M7.5 13.5q4.5 4 9 0' : cls === 'warn' ? 'M8 14.5h8' : 'M7.5 16q4.5-4 9 0';
  const label = m > 80 ? 'Great' : m > 62 ? 'Happy' : m > 42 ? 'Okay' : 'Low';
  return `<span class="mood ${cls}"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="11" fill="${col}"/><circle cx="8.5" cy="9.5" r="1.4" fill="#22082F"/><circle cx="15.5" cy="9.5" r="1.4" fill="#22082F"/><path d="${mouth}" stroke="#22082F" stroke-width="1.8" fill="none" stroke-linecap="round"/></svg>${label}</span>`;
}

function assistantBriefingReport(facts = clubBriefingFacts(), b = clubBriefingState(facts)) {
  const priority = briefingPriority(facts, b), attention = facts.departments.filter(d => d.status === 'attention');
  const healthy = facts.departments.filter(d => d.status === 'healthy'), watching = facts.departments.filter(d => d.status === 'monitor');
  const link = d => `<button class="chip" data-a="briefDept" data-id="${d.id}">${esc(d.name)}</button>`;
  const fallback = `${facts.result} ${priority ? priority.name + ' needs attention first.' : 'No urgent department issues are flagged.'}`;
  const source = [b.sources.jev ? 'Jev priorities' : '', b.sources.ds ? 'DeepSeek summary' : ''].filter(Boolean).join(' · ') || 'Club facts';
  return `<section id="briefingReport" class="assistant-report" aria-label="Full assistant briefing">
    <div class="dcard-h"><div><h2>Assistant briefing</h2><small>${esc(facts.assistant)} · ${esc(facts.date)}</small></div></div>
    <p class="brief-summary">${esc(b.text || fallback)}</p>
    ${priority ? `<button class="brief-priority" data-a="briefDept" data-id="${priority.id}"><small>First priority</small><b>${esc(priority.name)} →</b></button>` : ''}
    ${attention.length ? `<h3 class="lbl warnc">Needs attention · ${attention.length}</h3><div class="chips brief-attention">${attention.map(link).join('')}</div>` : ''}
    ${healthy.length ? `<h3 class="lbl good">Healthy · ${healthy.length}</h3><div class="chips brief-healthy">${healthy.map(link).join('')}</div>` : ''}
    <details class="brief-details"><summary>Full club report${watching.length ? ` · ${watching.length} to monitor` : ''}</summary>
      ${facts.events.length ? `<h3 class="lbl">Recent events</h3><div class="list">${facts.events.map(e => `<button class="row act" data-a="news" data-id="${e.id.slice(5)}"><span class="grow">${esc(e.title)}</span><span>›</span></button>`).join('')}</div>` : ''}
      ${facts.departments.map(d => `<div class="brief-department"><b>${esc(d.name)} <small class="${d.status === 'healthy' ? 'good' : d.status === 'attention' ? 'warnc' : ''}">${BRIEF_STATUS[d.status]}</small></b><p>${esc(d.evidence)}</p><button class="link" data-a="briefDept" data-id="${d.id}">${d.action} →</button></div>`).join('')}
    </details>
    <div class="brief-footer"><small role="status">${BRIEF_PENDING === b ? 'Updating assistant briefing…' : source}${!aiReady('jev', 'briefing') && !aiReady('ds', 'briefing') ? ' · AI is off or not configured' : ''}</small></div>
  </section>`;
}
function assistantBriefingCard(facts = clubBriefingFacts(), b = clubBriefingState(facts)) {
  const count = status => facts.departments.filter(d => d.status === status).length;
  const priority = briefingPriority(facts, b);
  const preview = b.text || (priority ? 'Priority: ' + priority.name : 'No urgent department issues flagged.');
  return `<section id="clubBriefing" class="dcard assistant-compact" aria-label="Assistant briefing">
    <div class="brief-top"><h2>Assistant briefing</h2><button class="btn sm" data-a="askBriefing" ${BRIEF_PENDING === b ? 'disabled' : ''}>${BRIEF_PENDING === b ? 'Asking…' : 'Ask assistant'}</button></div>
    <button class="brief-counts" data-a="briefReport" aria-label="View full club report"><span class="warnc">${count('attention')} attention</span> · <span class="good">${count('healthy')} healthy</span> · ${count('monitor')} monitor</button>
    <button class="brief-preview" data-a="briefReport" aria-label="Read assistant briefing">${esc(preview)}</button>
  </section>`;
}
function showClubBriefing() {
  sheet(assistantBriefingReport(), { key: 'clubBriefing', restore: showClubBriefing, valid: () => !!G });
}
function paintClubBriefing(facts, b) {
  const el = document.getElementById('clubBriefing');
  if (el) { el.outerHTML = assistantBriefingCard(facts, b); linkEntities(document.getElementById('clubBriefing')); }
  if (UI.popup?.key === 'clubBriefing') {
    const open = document.querySelector('#briefingReport details')?.open;
    showClubBriefing();
    if (open) document.querySelector('#briefingReport details').open = true;
  }
}
ACT.briefReport = showClubBriefing;
ACT.askBriefing = () => { showClubBriefing(); updateClubBriefing(true); };
ACT.briefDept = ds => {
  const d = clubBriefingFacts().departments.find(x => x.id === ds.id);
  if (!d) return;
  if (d.screen === 'transfers') UI.tab.tr = d.tab || 'deals';
  go(d.screen);
};

SCREENS.home = {
  render() {
    const c = userClub(), fx = nextUserFixture(), tbl = leagueTable();
    const pos = tbl.findIndex(r => r.id === G.club) + 1, row = tbl[pos - 1];
    const conf = G.board.conf;

    const clubCard = `<section class="clubcard">
      <div class="cc-top"><div class="cc-badge">${badge(c.id, 40)}</div>
        <div class="cc-name"><b>${esc(c.name)}</b><small><button class="link cc-league-link" data-a="dashboardCompetition" data-id="${leagueOf(c.id)}" aria-label="Open ${esc(leagueName())} competition">${esc(leagueName())}</button> · ${seasonLabel()}</small></div>
        <button class="cc-link" data-a="go" data-s="club">Club overview <span aria-hidden="true">→</span></button></div>
      <div class="cc-stats"><div><small>Position</small><b>${row.p ? ordinal(pos) : '-'}</b></div><div><small>Points</small><b>${row.pts}</b></div><div><small>Played</small><b>${row.p}</b></div></div>
      <div class="cc-form"><span>Recent form</span>${row.form.length ? formChips(row.form) : '<span>No matches yet</span>'}</div>
      <button class="cc-conf" data-a="go" data-s="board"><span>Board confidence</span>${bar(conf)}<b>${conf}%</b></button>
    </section>`;

    let next = '';
    if (fx) {
      const home = fx.h === G.club, opp = home ? fx.a : fx.h, orow = tbl.find(r => r.id === opp);
      const days = fxDayNo(fx) - todayNo(), rest = restDays(G.club, fx);
      next = `<section class="dcard">
        <div class="dcard-h"><h2>Next match</h2><span class="pill">${days <= 0 ? 'Today' : days === 1 ? 'Tomorrow' : 'In ' + days + ' days'}</span></div>
        <div class="nm"><div class="nm-team">${badge(fx.h, 32)}<span>${esc(clubName(fx.h))}</span></div>
          <div class="nm-mid"><b>vs</b>${fxWhen(fx)}<br>${home ? 'Home' : 'Away'} · ${fx.fr ? 'Friendly' : 'League'}${fx.tv ? ' · TV' : ''}</div>
          <div class="nm-team r">${badge(fx.a, 32)}<span>${esc(clubName(fx.a))}</span></div></div>
        <div class="nm-cond"><span>${wxLabel(fx.wx)}</span><span>${rest == null ? 'First match' : rest + " days' rest"}</span>${rest != null && rest <= 3 ? '<span class="warnc">Tight turnaround</span>' : ''}</div>
        <div class="nm-form"><span>Opponent form</span>${orow?.form.length ? formChips(orow.form) : '<span>No recorded league form</span>'}</div><div class="btns">${clubLink(opp, 'Opposition dashboard', 'btn sm')}<button class="btn sm" data-a="fixturePage" data-id="${fx.id}">Match preview</button>${fx.w === G.week ? '<button class="btn sm" data-a="continue">Continue to matchday</button>' : ''}</div>
      </section>`;
    } else next = `<section class="dcard"><div class="dcard-h"><h2>Next match</h2></div><p class="muted">No fixtures left this season.</p></section>`;

    const bill = clubWageBill(c), free = G.fin.wb - bill, h = G.balHist;
    const month = h.length >= 2 ? h[h.length - 1] - h[Math.max(0, h.length - 5)] : null;
    const health = c.bal < 0 ? ['In debt', 'bad'] : free < 0 ? ['Over wage budget', 'warn'] : ['Healthy', 'good'];
    const finance = `<section class="dcard" data-a="go" data-s="finance" role="button">
      <div class="dcard-h"><h2>Finance</h2><span class="pill ${health[1] === 'good' ? 'good' : ''}">${health[0]}</span></div>
      <div class="fin"><div><small>Transfer budget</small><b>${money(G.fin.tb)}</b></div><div><small>Wages / week</small><b>${money(bill)}</b></div>
        <div><small>Available wage budget</small><b class="${free < 0 ? 'bad' : ''}">${money(free)} / week</b></div><div><small>Club balance</small><b class="${c.bal < 0 ? 'bad' : ''}">${money(c.bal)}</b></div></div>
      ${month == null ? '<div class="profit"><span class="muted">Monthly profit shows after a few weeks.</span></div>' : `<div class="profit ${month < 0 ? 'neg' : ''}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="${month < 0 ? 'M3 7l7 7 4-4 7 7M21 11v6h-6' : 'M3 17l7-7 4 4 7-7M21 13V7h-6'}"/></svg>Monthly ${month < 0 ? 'loss' : 'profit'} ${month < 0 ? '' : '+'}${money(month)}</div>`}
    </section>`;

    return `<div class="dash-h"><h1 class="h1">Dashboard</h1></div>
      ${typeof careerBanner === 'function' ? careerBanner() : ''}${assistantBriefingCard()}${clubCard}${next}${finance}
      ${dashboardInbox()}
      <div class="sec-h"><h2>Latest news</h2><button class="link" data-a="newsOpen" data-v="news">All news</button></div>
      <div class="list">${G.news.filter(n => n.box === 'news').slice(0, 3).map(newsRow).join('') || empty('No news yet', 'Press Continue to move the week on.')}</div>`;
  },
};
ACT.dashboardCompetition = ds => {
  if (!G.leagues.includes(ds.id)) return;
  UI.tab.homeCompetition = ds.id;
  UI.tab.homeCompetitionView = 'table';
  go('competitions');
};
const NEWS_CATS = [['all', 'All'], ['inbox', 'Inbox'], ['match', 'Matches'], ['transfer', 'Transfers'], ['club', 'Club'], ['life', 'Off the pitch'], ['league', 'League']];
// Chips inside each view. News filters public stories by section; Inbox splits out what needs you and the club log.
const STORY_CHIPS = [['all', 'All'], ['match', 'Matches'], ['transfer', 'Transfers'], ['club', 'Your club'], ['life', 'Off the pitch'], ['league', 'League']];
const INBOX_CHIPS = [['all', 'All'], ['action', 'Needs action'], ['log', 'Club log']];
const needsYou = n => !!n.action && !n.done && n.action.t !== 'player';
// The section label on a row. Generic inbox items are named by what they are about.
const INBOX_LABELS = { press: 'Press', treq: 'Squad', renew: 'Contracts', life: 'Squad' };
const newsLabel = n => (n.cat === 'inbox' ? INBOX_LABELS[n.action?.t] || 'Club' : NEWS_CATS.find(c => c[0] === n.cat)[1]);
function newsList(view) {
  if (view === 'news') { const f = UI.f.news; return G.news.filter(n => n.box === 'news' && (f === 'all' || n.cat === f)); }
  const f = UI.f.inbox;
  return G.news.filter(n => f === 'log' ? n.box === 'log' : n.box === 'inbox' && (f !== 'action' || needsYou(n)));
}
// Dashboard: what needs you first, otherwise the latest private items.
function dashboardInbox() {
  const box = G.news.filter(n => n.box === 'inbox'), act = box.filter(needsYou), show = (act.length ? act : box).slice(0, 3);
  if (!show.length) return '';
  return `<div class="sec-h"><h2>Inbox${act.length ? ` <em class="tag warn">${act.length} need${act.length === 1 ? 's' : ''} you</em>` : ''}</h2><button class="link" data-a="newsOpen" data-v="inbox">Open inbox</button></div>
      <div class="list">${show.map(newsRow).join('')}</div>`;
}
ACT.newsOpen = ds => { UI.tab.nv = ds.v; go('news'); };
/* ---------- newspaper stories (newspaper.js) ---------- */
// The front-page lead: the heaviest story from the last three days of news in this list.
function leadStory(list) {
  const stories = list.filter(n => n.story);
  if (!stories.length) return null;
  const since = stories[0].date - 3 * 864e5;
  return stories.filter(n => n.date >= since).sort((a, b) => b.story.weight - a.story.weight || b.date - a.date)[0];
}
function scoreBar(s) {
  const side = id => { const c = G.clubs[id], col = c?.c1 || '#555'; return `<span style="background:${col};color:${isLight(col) ? '#141414' : '#fff'}">${esc(hClub(id))}</span>`; };
  return `<div class="pscore" data-no-links>${side(s.h)}<b>${s.hg}–${s.ag}</b>${side(s.a)}</div>`;
}
// The full newspaper header: masthead, section tag, photo, headline, standfirst and dateline.
function storyHeader(n, size = 'lead') {
  const s = n.story, o = OUTLETS[s.outlet] || OUTLETS.league, tint = G.clubs[s.tint]?.c1 || '#777';
  return `<article class="paper p-${s.outlet} ${size}" style="--tint:${tint}">
    <header class="mast" data-no-links><b>${esc(o.name)}</b><small>${esc(o.tag(userClub()))}</small></header>
    <span class="psec">${esc(SECTION_NAMES[s.outlet])}</span>
    ${s.img ? `<figure class="pimg"><img src="public/assets/news/${s.img}.webp" alt="" loading="lazy" decoding="async"></figure>` : ''}
    <h2 class="phead">${esc(s.headline)}</h2><p class="pstand">${esc(s.standfirst)}</p>
    ${s.score ? scoreBar(s.score) : ''}
    <footer class="pfoot">${fmtDate(n.date, false)} · ${esc(o.desk)}</footer></article>`;
}
function storyRow(n) {
  const s = n.story, o = OUTLETS[s.outlet] || OUTLETS.league;
  return `<button class="row act news story ${n.read ? '' : 'unread'}" data-a="news" data-id="${n.id}">
    <span class="grow"><small class="pmini p-${s.outlet}">${esc(o.name)}</small><b>${esc(s.headline)}</b><small>${esc(s.standfirst)}</small><small class="muted">${fmtDate(n.date, false)}</small></span><span class="chev">›</span></button>`;
}
function newsRow(n) {
  if (n.story) return storyRow(n);
  const needs = needsYou(n);
  return `<button class="row act news ${n.read ? '' : 'unread'}" data-a="news" data-id="${n.id}">
    <span class="ncat c-${n.cat}">${newsLabel(n)}</span>
    <span class="grow"><b>${esc(n.title)}</b><small>${fmtDate(n.date, false)}${needs ? ' · <em class="tag warn">Action</em>' : ''}</small></span><span class="chev">›</span></button>`;
}

SCREENS.news = {
  render() {
    const v = UI.tab.nv || 'news', unreadInbox = G.news.filter(n => n.box === 'inbox' && !n.read).length;
    const head = `<h1 class="h1">News</h1><div class="seg nviews">${NEWS_VIEWS.map(([k, n]) => `<button class="${v === k ? 'on' : ''}" data-a="newsView" data-v="${k}">${n}${k === 'inbox' && unreadInbox ? ` · ${unreadInbox}` : ''}</button>`).join('')}</div>`;
    if (v === 'tc') return head + transferCentre();
    if (v === 'social') return head + socialFeed();
    const inbox = v === 'inbox', chips = inbox ? INBOX_CHIPS : STORY_CHIPS, f = inbox ? UI.f.inbox : UI.f.news, list = newsList(v);
    const none = inbox ? (f === 'log' ? ['Nothing logged yet', 'Payments, bonuses and other club records appear here.'] : ['Inbox empty', 'Messages for you will appear here.']) : ['Nothing here', 'Stories in this section will appear as the season goes on.'];
    const lead = inbox ? null : leadStory(list), rest = lead ? list.filter(n => n !== lead) : list;
    return `${head}
      <div class="chips">${chips.map(([k, n]) => `<button class="chip ${f === k ? 'on' : ''}" data-a="newsF" data-v="${k}">${n}</button>`).join('')}</div>
      ${lead ? `<div class="lead-story" data-a="news" data-id="${lead.id}" role="button" tabindex="0">${storyHeader(lead)}</div>` : ''}
      <div class="sec-h"><span class="muted">${list.length} items</span><button class="link" data-a="readAll">Mark all read</button></div>
      <div class="list">${rest.map(newsRow).join('') || (lead ? '' : empty(...none))}</div>`;
  },
};
ACT.treq = ds => { toast(answerRequest(G.players[+ds.id], ds.v === '1')); saveGame(); if (UI.popup) closeSheet(true); render(); };
ACT.newsF = ds => { UI.f[UI.tab.nv === 'inbox' ? 'inbox' : 'news'] = ds.v; render(); };
ACT.readAll = () => { newsList(UI.tab.nv === 'inbox' ? 'inbox' : 'news').forEach(n => { n.read = true; }); render(); };
ACT.news = ds => {
  const n = G.news.find(x => x.id === +ds.id);
  if (!n) return;
  n.read = true;
  let actions = '';
  const a = n.action;
  if (a && !n.done && a.t === 'bid') actions = `<div class="btns"><button class="btn pri" data-a="bid" data-id="${n.id}" data-c2="accept">Accept ${money(a.fee)}</button><button class="btn" data-a="bid" data-id="${n.id}" data-c2="counter">Ask for ${money(roundMoney(a.fee * 1.2))}</button><button class="btn ghost" data-a="bid" data-id="${n.id}" data-c2="reject">Reject</button></div>`;
  if (a && a.t === 'treq' && G.players[a.pid] && G.players[a.pid].treq) actions = `<div class="btns"><button class="btn pri" data-a="treq" data-id="${a.pid}" data-v="1">Accept and list him</button><button class="btn" data-a="treq" data-id="${a.pid}" data-v="0">Refuse</button></div>`;
  if (a && a.t === 'press') { const r = (G.media.req || []).find(x => x.id === a.id); if (r && !r.done) actions = `<div class="btns col">${STATEMENTS[r.kind].map(([k, t]) => `<button class="btn wide ${k === r.advice ? 'pri' : ''}" data-a="press" data-id="${r.id}" data-k="${k}">${esc(t)}${k === r.advice ? ' (advised)' : ''}</button>`).join('')}</div>`; }
  if (a && a.t === 'life') { const ev = lifeEvent(a.id); if (ev && !ev.choice) actions = `<div class="btns col">${LIFE_CHOICES[ev.kind].map(([k, t, mor, fans, board, cost]) => `<button class="btn wide" data-a="lifeChoice" data-id="${ev.id}" data-k="${k}">${esc(t)}<small class="muted"> · ${lifeEffectText(mor, fans, board, cost)}</small></button>`).join('')}</div>`; }
  if (a && a.t === 'deal' && G.deals.some(d => d.id === a.id)) actions = `<div class="btns"><button class="btn pri" data-a="deal" data-id="${a.id}">Open the deal</button></div>`;
  if (a && a.t === 'scoutfile' && G.players[a.pid]) actions = `<div class="btns"><button class="btn pri" data-a="scoutFile" data-id="${a.pid}">Open scouting file</button></div>`;
  if (a && !n.done && a.t === 'renew' && G.players[a.pid]) actions = `<div class="btns"><button class="btn pri" data-a="contract" data-id="${a.pid}" data-mode="renew">Open contract talks</button></div>`;
  if (a && n.done) actions += '<p class="note">Nothing left to decide.</p>';
  const playerIds = n.action?.pid && G.players[n.action.pid] ? [+n.action.pid] : null;
  const title = playerIds ? `<h3 class="sh-t">${playerMentionsHtml(n.title, playerIds)}</h3>` : `<h3 class="sh-t">${esc(n.title)}</h3>`;
  const body = playerIds ? `<p class="body">${playerMentionsHtml(n.body, playerIds)}</p>` : `<p class="body">${esc(n.body)}</p>`;
  sheet(`${n.story ? storyHeader(n, 'in-sheet') : `<div class="eyebrow">${newsLabel(n)} · ${fmtDate(n.date)}</div>${title}`}${body}${actions}${newsLinks(n)}`, { key: 'news:' + n.id, restore: () => ACT.news({ id: n.id }), valid: () => !!G?.news.find(x => x.id === n.id), onClose: () => render() });
};
// Plain words for a choice's effects, shown under each button.
function lifeEffectText(mor, fans, board, cost) {
  const w = (v, s) => v ? (v > 0 ? `${s} up` : `${s} down`) : '';
  return [w(mor, 'his morale'), w(fans, 'fans'), w(board, 'board'), cost ? money(cost) : ''].filter(Boolean).join(', ') || 'no effect';
}
ACT.lifeChoice = ds => { const msg = lifeAnswer(+ds.id, ds.k); saveGame(); if (msg) toast(msg); if (UI.popup) closeSheet(true); render(); };
ACT.bid = ds => {
  const n = G.news.find(x => x.id === +ds.id);
  const msg = respondBid(n, ds.c2);
  closeSheet(true); toast(msg); saveGame(); render();
};

function hubMenu(title, items) {
  return `<h1 class="h1">${title}</h1><div class="grid2">${items.map(([s, n, d]) => `<button class="gcard" data-a="go" data-s="${s}"><b>${n}</b><small>${d}</small></button>`).join('')}</div>`;
}

SCREENS.team = {
  render() {
    return SCREENS.squad.render(); // legacy route; My Team now opens Squad
  },
};

SCREENS.facilities = {
  render() {
    const section = ['club', 'finance', 'board'].includes(UI.tab.facility) ? UI.tab.facility : 'club';
    return SCREENS[section].render();
  },
};
ACT.facilityTab = ds => { if (!['club', 'finance', 'board'].includes(ds.v)) return; UI.tab.facility = ds.v; render(); };

SCREENS.more = {
  render() {
    const items = [['settings', 'Settings', 'Save, speed and new game']];
    items.push(['gamestatus', 'Game status', 'Your career, playtime and one-more-match level']);
    return hubMenu('More', items);
  },
};

SCREENS.gamestatus = {
  render() {
    const c = userClub(), squad = c.squad.map(id => G.players[id]).filter(Boolean);
    const table = leagueTable(), pos = table.findIndex(r => r.id === G.club), row = table[pos];
    const kv = pairs => `<div class="kv">${pairs.map(([label, value]) => `<div><small>${esc(label)}</small><b>${esc(value)}</b></div>`).join('')}</div>`;
    const realDate = value => value ? new Date(value).toLocaleString() : 'Not recorded';
    const time = G.playtime;
    return `<h1 class="h1">Game status</h1>
      <div class="card"><h3>Your time on the touchline</h3>
        <div class="kv"><div><small>Active time played</small><b id="game-playtime">${playtimeLabel(time.ms)}</b></div><div><small>Play sessions</small><b>${time.sessions}</b></div></div>
        <p class="muted">Addiction level · just for fun</p><h3 id="game-addiction">${addictionLabel(time.ms)}</h3>
        <p class="muted">Counts while this game is visible, excluding the title screen. Tracking began ${esc(realDate(time.trackedFrom))}.${time.legacy ? ' Earlier playtime in this save is not included.' : ''}</p>
      </div>
      <div class="card"><h3>Current career</h3>${kv([
        ['Manager', G.manager], ['Club', c.name], ['Season', seasonLabel()], ['Game date', fmtDate(today())],
        ['Phase', phaseLabel()], ['Completed seasons', G.history.length], ['Trophies', G.trophies.length], ['Career started', realDate(G.createdAt)],
      ])}</div>
      <div class="card"><h3>This season</h3>${kv([
        ['League position', row.p ? ordinal(pos + 1) : 'Pre-season'], ['Points', row.pts], ['Played', row.p], ['Won / drawn / lost', `${row.w} / ${row.d} / ${row.l}`],
        ['Goals for / against', `${row.gf} / ${row.ga}`], ['Remaining club fixtures', G.fixtures.filter(f => (f.h === G.club || f.a === G.club) && !played(f)).length],
      ])}</div>
      <div class="card"><h3>Club snapshot</h3>${kv([
        [Object.values(clubLevels(c)).join(' / '), Object.keys(clubLevels(c)).map(l => squad.filter(p => lvlOf(p) === l).length).join(' / ')],
        ['Injured players', squad.filter(p => p.inj).length], ['Staff', G.staff.length], ['Club balance', money(c.bal)],
        ['Transfer budget', money(G.fin.tb)], ['Weekly wage budget', money(G.fin.wb)], ['Board confidence', Math.round(G.board.conf) + '%'], ['Fan confidence', Math.round(G.board.fans) + '%'],
        ['Training / youth facilities', `Level ${G.board.facTrain} / ${G.board.facYouth}`], ['Transfer history entries', G.tHist.length],
      ])}</div>
      <div class="card"><h3>Game & save</h3>${kv([
        ['Game version', versionLabel(GAME_VERSION)], ['Save format', G.v], ['Last saved', realDate(G.savedAt)],
        ['World clubs', Object.keys(G.clubs).length], ['World players', Object.keys(G.players).length], ['News / scout reports', `${G.news.length} / ${G.scout.reports.length}`],
        ['Match speed', G.settings.speed + 'x'], ['Career status', G.gameOver ? 'Ended' : 'In progress'],
      ])}<p class="muted">This career is stored in this browser. Export a backup from Settings.</p><button class="btn" data-a="go" data-s="settings">Save & backup settings</button></div>`;
  },
};

// The assistant coach's pre-season friendlies: analysis of the overseas clubs in the game, and one-tap arranging.
function friendlyCard() {
  if (!inPreseason()) return '';
  if (freePreseasonWeek() == null) return '<div class="card"><h3>Pre-season friendlies</h3><p class="muted">No pre-season dates remain available.</p></div>';
  const A = UI.friendly && UI.friendly.wk === G.week ? UI.friendly : null, head = '<h3>Assistant coach <small>pre-season friendlies</small></h3>';
  if (A && A.busy) return `<div class="card">${head}<p class="muted">${esc(A.step)}</p></div>`;
  if (!A || !A.rows) return `<div class="card">${head}<p class="muted">He looks at the overseas clubs already in the game, plays each one a few simulated games, and picks the friendlies that test the squad most.</p><button class="btn pri" data-a="friendlyAnalyse">Find friendlies</button></div>`;
  const rows = A.rows.map(r => {
    const done = G.fixtures.some(f => f.fr && (f.h === r.id || f.a === r.id));
    const rec = `${r.rec.w}-${r.rec.d}-${r.rec.l} (${r.rec.gf}-${r.rec.ga} in ${FRIENDLY_GAMES})`;
    return `<div class="row"><span class="grow"><b>${esc(r.name)}</b><small>${esc(natName(r.nat))} · rep ${r.rep} (${r.gap >= 0 ? '+' : ''}${r.gap} on us) · simulated ${rec}</small></span>${done ? '<span class="muted">Arranged</span>' : `<button class="btn sm" data-a="friendlyArrange" data-id="${r.id}">Arrange</button>`}</div>`;
  }).join('');
  return `<div class="card">${head}<p class="muted">Ranked by strength gap and by how close the simulated games were. These are estimates from the engine, not a forecast.</p><div class="list">${rows || empty('No clubs to test against', 'No overseas clubs are available.')}</div>
    <button class="btn sm" data-a="friendlyAnalyse">Run the analysis again</button></div>`;
}

SCREENS.fixtures = {
  render() {
    const t = UI.tab.fx || 'ours';
    let body = '';
    if (t === 'ours') {
      const list = G.fixtures.filter(f => f.h === G.club || f.a === G.club).sort(fxSort);
      body = `${friendlyCard()}<div class="list">${list.map(f => fixtureLinks(f, G.club)).join('')}</div>`;
    } else {
      const all = G.fixtures.filter(f => leagueFixture(f)), rounds = [...new Set(all.map(f => f.r))].sort((a, b) => a - b);
      const cur = all.filter(f => f.w >= G.week).sort(fxSort)[0], r = UI.tab.round ?? (cur ? cur.r : rounds[rounds.length - 1]);
      const list = all.filter(f => f.r === +r).sort(fxSort);
      body = `<div class="field"><label for="rsel">Round</label>${selectHtml('rsel', rounds.map(i => { const f = all.find(f => f.r === i); return [i, 'Matchweek ' + (i + 1) + ' · ' + fmtDate(fxDate(f), false)]; }), r, 'round')}</div>
        <div class="list">${list.map(f => `<div class="row fxr ${f.h === G.club || f.a === G.club ? 'me' : ''}"><span class="fxt">${fxWhen(f).replace(/ \d+ \w+ ·/, '')}${f.tv ? '<em>TV</em>' : ''}</span><span class="grow r">${esc(clubName(f.h))}</span>${badge(f.h, 18)}<button class="res" data-a="fixturePage" data-id="${f.id}" aria-label="${played(f) ? 'Match report' : 'Match preview'}">${played(f) ? f.hg + '-' + f.ag : 'v'}</button>${badge(f.a, 18)}<span class="grow">${esc(clubName(f.a))}</span></div>`).join('')}</div>`;
    }
    return `<h1 class="h1">Fixtures</h1>${tabs('fx', [['ours', 'Our fixtures'], ['all', 'All rounds']], t)}${body}`;
  },
};
CHG.round = v => { UI.tab.round = +v; render(); };

SCREENS.competitions = {
  render() {
    const esl = UI.tab.homeCompetition === 'ESL' && typeof eslScreenHtml === 'function';
    const cups = typeof cupsPlayed === 'function' ? cupsPlayed() : [], cup = cups.includes(UI.tab.homeCompetition) ? UI.tab.homeCompetition : null;
    const competition = G.leagues.includes(UI.tab.homeCompetition) ? UI.tab.homeCompetition : leagueOf(G.club);
    const seg = `<div class="seg comp-seg">${G.leagues.map(id => `<button class="${!esl && !cup && competition === id ? 'on' : ''}" data-a="homeCompetition" data-id="${id}">${leagueName(id)}</button>`).join('')}${typeof ESL_NAME === 'string' ? `<button class="${esl ? 'on' : ''}" data-a="homeCompetition" data-id="ESL">${ESL_NAME}</button>` : ''}${cups.map(id => `<button class="${cup === id ? 'on' : ''}" data-a="homeCompetition" data-id="${id}">${CUP_DEFS[id].name}</button>`).join('')}</div>`;
    if (esl) return `<h1 class="h1">Competitions</h1>${seg}${eslScreenHtml()}`;
    if (cup) return `<h1 class="h1">Competitions</h1>${seg}${cupScreenHtml(cup)}`;
    const view = UI.tab.homeCompetitionView || 'table', tbl = leagueTable(competition);
    let content = '';
    if (view === 'fixtures') {
      const all = G.fixtures.filter(f => leagueFixture(f, competition)), rounds = [...new Set(all.map(f => f.r))].sort((a, b) => a - b);
      const upcoming = all.filter(f => f.w >= G.week).sort(fxSort)[0];
      const round = rounds.includes(+UI.tab.homeCompetitionRound) ? +UI.tab.homeCompetitionRound : upcoming?.r ?? rounds[rounds.length - 1];
      const list = all.filter(f => f.r === round).sort(fxSort);
      content = `<div class="field"><label for="competitionRound">Matchweek</label>${selectHtml('competitionRound', rounds.map(i => { const f = all.find(f => f.r === i); return [i, 'Matchweek ' + (i + 1) + ' · ' + fmtDate(fxDate(f), false)]; }), round, 'competitionRound')}</div>
        <div class="list">${list.map(f => `<div class="row fxr ${f.h === G.club || f.a === G.club ? 'me' : ''}"><span class="fxt">${fxWhen(f).replace(/ \d+ \w+ ·/, '')}</span><span class="grow r">${esc(clubName(f.h))}</span>${badge(f.h, 18)}<button class="res" data-a="fixturePage" data-id="${f.id}" aria-label="${played(f) ? 'Match report' : 'Match preview'}">${played(f) ? f.hg + '–' + f.ag : 'v'}</button>${badge(f.a, 18)}<span class="grow">${esc(clubName(f.a))}</span></div>`).join('') || empty('No fixtures', 'There are no scheduled fixtures for this competition.')}</div>`;
    } else {
      content = `<div class="tablewrap"><table class="tbl"><thead><tr><th>#</th><th class="l">Club</th><th>P</th><th>W</th><th>D</th><th>L</th><th>GD</th><th>Pts</th></tr></thead><tbody>
        ${tbl.map((r, i) => `<tr class="${r.id === G.club ? 'me' : ''} ${tableZone(competition, i, tbl.length)}"><td>${i + 1}</td><td class="l"><span class="tc">${badge(r.id, 18)}${esc(G.clubs[r.id].name)}</span></td><td>${r.p}</td><td>${r.w}</td><td>${r.d}</td><td>${r.l}</td><td>${r.gf - r.ga}</td><td><b>${r.pts}</b></td></tr>`).join('')}
        </tbody></table></div>${leagueRulesHtml(competition)}`;
    }
    return `<h1 class="h1">Competitions</h1><p class="muted">${seasonLabel()} · ${esc(phaseLabel())}</p>
      ${seg}
      ${tabs('homeCompetitionView', [['table', 'League table'], ['fixtures', 'Fixtures']], view)}${content}`;
  },
};
ACT.homeCompetition = ds => { UI.tab.homeCompetition = ds.id; UI.tab.homeCompetitionRound = null; render(); };
CHG.competitionRound = v => { UI.tab.homeCompetitionRound = +v; render(); };

// Colour band of a league table row: second divisions mark promotion and playoff places, top flights the top four and a
// seventh place; the bottom three are always relegation places.
const tableZone = (competition, i, n) => (leagueTier(competition) === 2 ? (i < 2 ? 'z1' : i < 6 ? 'z2' : i >= n - 3 ? 'z4' : '') : (i < 4 ? 'z1' : i < 6 ? 'z2' : i === 6 ? 'z3' : i >= n - 3 ? 'z4' : ''));
SCREENS.table = {
  render() {
    const competition = LEAGUES[UI.tab.comp] && G.leagues.includes(UI.tab.comp) ? UI.tab.comp : leagueOf(G.club);
    const tbl = leagueTable(competition);
    return `<h1 class="h1">${leagueName(competition)}</h1><p class="muted">${seasonLabel()} · ${esc(phaseLabel())}</p>${G.leagues.length > 1 ? `<div class="seg">${G.leagues.map(id => `<button class="${competition === id ? 'on' : ''}" data-a="leagueView" data-id="${id}">${leagueName(id)}</button>`).join('')}</div>` : ''}<button class="btn sm" data-a="go" data-s="clubs">Browse all clubs</button>
      <div class="tablewrap"><table class="tbl"><thead><tr><th>#</th><th class="l">Club</th><th>P</th><th>W</th><th>D</th><th>L</th><th>GD</th><th>Pts</th><th class="hide-s">Form</th></tr></thead><tbody>
      ${tbl.map((r, i) => `<tr class="${r.id === G.club ? 'me' : ''} ${tableZone(competition, i, tbl.length)}"><td>${i + 1}</td><td class="l"><span class="tc">${badge(r.id, 18)}${esc(G.clubs[r.id].name)}</span></td><td>${r.p}</td><td>${r.w}</td><td>${r.d}</td><td>${r.l}</td><td>${r.gf - r.ga}</td><td><b>${r.pts}</b></td><td class="hide-s">${formChips(r.form)}</td></tr>`).join('')}
      </tbody></table>${leagueRulesHtml(competition)}</div>
      <div class="legend">${leagueTier(competition) === 2 ? '<span class="lz z1">Automatic promotion</span><span class="lz z2">Promotion playoffs</span>' : '<span class="lz z1">Top four</span>'}<span class="lz z4">Bottom three</span></div>`;
  },
};

ACT.leagueView = ds => { UI.tab.comp = ds.id; render(); };

SCREENS.stats = {
  render() {
    const t = UI.tab.stats || 'g';
    const pl = Object.values(G.players).filter(p => G.clubs[p.club]?.pl && leagueOf(p.club) === leagueOf(G.club) && p.st.a > 0);
    const per = (p, k) => (p.st[k] || 0);
    const cfg = { g: ['Goals', p => p.st.g, p => p.st.g], as: ['Assists', p => p.st.as, p => p.st.as], rt: ['Avg rating', p => (p.st.a >= 3 ? avgRating(p) : 0), p => avgRating(p).toFixed(2)], cs: ['Clean sheets', p => (p.pos === 'GK' ? p.st.cs : 0), p => p.st.cs],
      kp: ['Key passes', p => per(p, 'kp'), p => per(p, 'kp')], pc: ['Pass accuracy', p => (per(p, 'pa') >= 60 ? per(p, 'pc') / per(p, 'pa') : 0), p => Math.round(per(p, 'pc') / (per(p, 'pa') || 1) * 100) + '%'],
      dw: ['Dribbles won', p => per(p, 'dw'), p => per(p, 'dw')], tk: ['Tackles + interceptions', p => per(p, 'tk') + per(p, 'int'), p => per(p, 'tk') + per(p, 'int')],
      aer: ['Aerial duels won', p => per(p, 'aer'), p => per(p, 'aer')], sv: ['Saves', p => (p.pos === 'GK' ? per(p, 'sv') : 0), p => per(p, 'sv')] }[t];
    const list = pl.filter(p => cfg[1](p) > 0).sort((a, b) => cfg[1](b) - cfg[1](a)).slice(0, 25);
    return `<h1 class="h1">Stats leaders</h1><div class="chips">${[['g', 'Goals'], ['as', 'Assists'], ['rt', 'Rating'], ['kp', 'Key passes'], ['pc', 'Pass accuracy'], ['dw', 'Dribbles'], ['tk', 'Tackles + int'], ['aer', 'Aerials'], ['cs', 'Clean sheets'], ['sv', 'Saves']].map(([k, n]) => `<button class="chip ${t === k ? 'on' : ''}" data-a="tab" data-key="stats" data-v="${k}">${n}</button>`).join('')}</div>
      <div class="list">${list.map((p, i) => playerRow(p, `<span class="stat"><b>${cfg[2](p)}</b><small>${p.st.a} apps</small></span>`, { sub: (i + 1) + '. ' + clubName(p.club) })).join('') || empty('No matches played yet', 'Leaders appear after the opening round.')}</div>`;
  },
};

SCREENS.club = {
  render() {
    const c = userClub(), B = G.board;
    return `<section class="clubhead" style="--k1:${c.c1}">${badge(c.id, 50)}${avatarImg(G.avatar, 'av-sm')}<div><h1 class="h1">${esc(c.name)}</h1><p class="muted">${esc(c.city)} · Manager ${esc(G.manager)}</p></div></section>
      <div class="kv">
        <div><small>Stadium</small><b>${esc(c.ground)}</b></div><div><small>Capacity</small><b>${c.cap.toLocaleString('en-GB')}</b></div>
        <div><small>Reputation</small><b>${Math.round(c.rep)} / 100</b></div><div><small>Training facilities</small><b>Level ${B.facTrain}</b></div>
        <div><small>Youth facilities</small><b>Level ${B.facYouth}</b></div><div><small>Season objective</small><b>${esc(B.target.text)}</b></div>
      </div>
      <div class="sec-h"><h2>Trophy cabinet</h2></div>
      <div class="list">${G.trophies.map(t => `<div class="row"><span class="grow"><b>${esc(t.name)}</b><small>${t.season}</small></span></div>`).join('') || empty('Empty for now', 'Titles and awards you win appear here.')}</div>
      <div class="sec-h"><h2>Season history</h2></div>
      <div class="list">${G.history.map(h => `<div class="row"><span class="grow"><b>${h.season} · ${esc(clubName(h.club))} ${ordinal(h.pos)}</b><small>Champions: ${esc(clubName(h.champ))}${h.boot ? ' · Golden Boot: ' + esc(h.boot) : ''}</small></span><span class="stat"><b>${h.pts}</b><small>pts</small></span></div>`).join('') || empty('First season', 'Completed seasons are recorded here.')}</div>`;
  },
};

SCREENS.manager = {
  render(p = {}) {
    ensureManagerProfiles();
    const m = G.managerProfiles[p.id] || userManagerProfile(), user = m.id === G.managerProfileId;
    const c = m.currentClubId && G.clubs[m.currentClubId], age = m.age + Math.max(0, G.season - m.birthSeason);
    const jobs = (G.managerJobs || []).filter(j => j.status === 'open' && G.leagues.includes(j.league));
    const news = G.news.filter(n => n.cat === 'league' && /^Manager (wanted|appointed)|appoint a manager/i.test(n.title)).slice(0, 8);
    const totals = Object.entries(m.totals || {}).filter(([, amount]) => amount > 0).map(([kind, amount]) => `<div class="kvrow"><span>${esc(MANAGER_INCOME_NAMES[kind] || kind)}</span><b>${money(amount)}</b></div>`).join('');
    const tx = user ? m.transactions.slice(0, 30).map(t => `<div class="row"><span class="grow"><b>${esc(MANAGER_INCOME_NAMES[t.kind] || (typeof LIFESTYLE_NAMES === 'object' && LIFESTYLE_NAMES[t.kind]) || t.kind)}</b><small>${esc(t.detail)} · ${fmtDate(t.date)}</small></span><span class="stat"><b>${t.amount < 0 ? '−' + money(-t.amount) : '+' + money(t.amount)}</b></span></div>`).join('') : '';
    return `<h1 class="h1">${user ? 'Your manager profile' : esc(m.name)}</h1>
      <div class="card"><div class="kv"><div><small>Currently managing</small><b>${c ? esc(c.name) + ' · ' + esc(leagueName(c.league)) : 'Between clubs'}</b></div><div><small>Age · nationality</small><b>${age} · ${esc(NATIONS[m.nationality]?.n || m.nationality)}</b></div><div><small>Weekly salary</small><b>${money(m.weeklySalary)}/week</b></div><div><small>Contract</small><b>${m.contractYears} years</b></div><div><small>Reputation</small><b>${m.reputation} / 100</b></div><div><small>Management style</small><b>${esc(m.styleName)}</b></div><div><small>Inspirational figure</small><b>${esc(m.inspiration)}</b></div></div></div>
      ${user ? `<div class="tiles"><div class="tile"><small>Personal bank</small><b>${money(m.bank)}</b><span>Career earnings held personally</span></div><div class="tile"><small>Weekly salary</small><b>${money(m.weeklySalary)}</b><span>Paid into your personal bank</span></div></div><div class="card"><h3>Income breakdown</h3>${totals || '<p class="muted">Your earnings will appear after the next weekly advance.</p>'}</div><h2 class="h2">Recent income</h2><div class="list">${tx || '<p class="muted">No transactions recorded yet.</p>'}</div>` : ''}
      <h2 class="h2">Career history</h2><div class="list">${m.history.slice().reverse().map(h => `<div class="row"><span class="grow"><b>${esc(h.name)} · ${esc(h.league)}</b><small>${esc(h.joined)}${h.left ? ' – ' + esc(h.left) + ' · ' + esc(h.reason) : ' · Current appointment'} · ${money(h.salary)}/week${h.seasons?.length ? ' · ' + h.seasons.map(s => `${esc(s.season)}: ${ordinal(s.position)} (${s.points} pts)`).join('; ') : ''}</small></span></div>`).join('') || '<p class="muted">Career history starts with the first appointment.</p>'}</div>
      <h2 class="h2">Honours and milestones</h2><div class="list">${m.awards.map(a => `<div class="row"><span class="grow"><b>${esc(a.name)}</b><small>${esc(a.season || fmtDate(a.date))}</small></span></div>`).join('') || '<p class="muted">Your achievements will be recorded here.</p>'}</div>
      ${user && typeof careerProfileHtml === 'function' ? careerProfileHtml() : `<h2 class="h2">Manager jobs · playable leagues</h2><div class="list">${jobs.map(j => `<div class="row"><span class="grow"><b>${esc(clubName(j.cid))} · ${esc(leagueName(j.league))}</b><small>${esc(j.reason)} · closes ${fmtDate(j.opened + 35 * 86400000)}</small></span></div>`).join('') || '<p class="muted">No vacancies at the moment. Job news appears here when clubs are hiring.</p>'}</div>`}
      ${news.length ? `<h2 class="h2">Around the leagues</h2><div class="list">${news.map(n => `<div class="row"><span class="grow"><b>${esc(n.title)}</b><small>${esc(n.body)}</small></span></div>`).join('')}</div>` : ''}`;
  },
};
ACT.managerProfile = ds => go('manager', { id: ds.id });
ACT.applyManagerJob = ds => { if (takeJob(ds.id)) { toast(`You are now managing ${clubName(ds.id)}.`); go('manager'); } };

SCREENS.settings = {
  render() {
    const exp = UI.tab.export;
    return `<h1 class="h1">Settings</h1>
      ${G.flags.legacyLeagueSetup ? '<div class="card"><h3>2026/27 competitions available</h3><p class="muted">This career keeps its original clubs, calendar and progress. Start a new career for the updated Premier League and Championship. Export a backup first to keep this career.</p></div>' : ''}
      ${G.flags.legacyRosterProfiles ? '<div class="card"><h3>Updated player database</h3><p class="muted">New careers use the revised individual player profiles. This existing career keeps its trained attributes and development. Export your save before starting a new career if you want to keep it.</p></div>' : ''}
      <div class="card"><button class="btn pri wide" data-a="returnTitle">Save &amp; return to title</button></div>
      <div class="card"><h3>Manager portrait</h3>${avatarPicker(G.avatar || 1, 'setAvatar')}</div>
      <div class="card"><h3>Manager name</h3><div class="two"><div class="field"><label for="setMgr">Name</label><input id="setMgr" type="text" maxlength="40" value="${esc(G.manager)}" autocomplete="off"></div><div class="field"><label>&nbsp;</label><button class="btn" data-a="setMgrName">Save name</button></div></div></div>
      <div class="card"><h3>Match camera</h3><p class="muted">Follow keeps the ball in view with a mini-map. Full pitch shows everything at once.</p><div class="seg">${[['follow', 'Follow'], ['full', 'Full pitch']].map(([k, n]) => `<button class="${(G.settings.cam || 'follow') === k ? 'on' : ''}" data-a="setCam" data-v="${k}">${n}</button>`).join('')}</div></div>
      <div class="card"><h3>Match highlights</h3><p class="muted">How much of a match you watch: key chances only, extended build-up, or every move.</p><div class="seg">${[['key', 'Key'], ['ext', 'Extended'], ['full', 'Full']].map(([k, n]) => `<button class="${(G.settings.hl || 'ext') === k ? 'on' : ''}" data-a="setHl" data-v="${k}">${n}</button>`).join('')}</div></div>
      <div class="card"><h3>Default match speed</h3><div class="seg">${[1, 2, 4].map(s => `<button class="${G.settings.speed === s ? 'on' : ''}" data-a="speed" data-v="${s}">${s}x</button>`).join('')}</div></div>
      <div class="card"><h3>Anonymous play statistics</h3><p class="muted">Helps improve the game: how often it is played, minutes played, match results and the club you manage, with a random id for this browser. No names, saves or personal data.</p><div class="seg">${[[1, 'Share'], [0, 'Off']].map(([k, n]) => `<button class="${+statsOn() === k ? 'on' : ''}" data-a="setStats" data-v="${k}">${n}</button>`).join('')}</div></div>
      <div class="card"><h3>Save game</h3><p class="muted">Autosaves stay on this device. Clearing site data removes them. Keep a save file as a backup or import it on another device.</p>
        <p id="saveStatus" role="status" class="${SaveStorage.error ? 'bad' : 'muted'}">${SaveStorage.error ? 'Saving failed. Export a backup before leaving.' : 'Automatic saving on this device.'}</p>
        <div class="btns"><button class="btn" data-a="saveNow">Save now</button>${window.showSaveFilePicker ? `<button class="btn" data-a="savePhone">${SaveStorage.file ? 'Update phone file' : 'Save to phone'}</button>` : ''}<button class="btn" data-a="downloadSave">Download save file</button><button class="btn" data-a="exportSave">Export save code</button><button class="btn" data-a="importOpen">Import save</button></div>
        ${exp ? `<textarea id="saveBox" class="code" rows="5" readonly>${esc(exp)}</textarea><button class="btn" data-a="copySave">Copy to clipboard</button>` : ''}</div>
      <div class="card danger"><h3>New game</h3><p class="muted">Starts a new career and deletes the current save.</p><button class="btn ${UI.tab.confirmNew ? 'bad' : ''}" data-a="newGame">${UI.tab.confirmNew ? 'Tap again to delete and restart' : 'Start a new game'}</button></div>`;
  },
};
ACT.setAvatar = ds => { G.avatar = +ds.v; saveGame(); toast('Portrait changed to Manager ' + ds.v + '.'); render(); };
ACT.setStats = ds => { statsSetOn(ds.v === '1'); render(); };
ACT.speed = ds => { G.settings.speed = +ds.v; saveGame(); render(); };
ACT.setMgrName = () => { const v = document.getElementById('setMgr').value.trim().slice(0, 40); if (!v) return toast('Enter a name first.'); G.manager = v; saveGame(); toast('Manager name saved.'); render(); };
ACT.setCam = ds => { if (!['follow', 'full'].includes(ds.v)) return; G.settings.cam = ds.v; saveGame(); render(); };
ACT.setHl = ds => { if (!['key', 'ext', 'full'].includes(ds.v)) return; G.settings.hl = ds.v; saveGame(); render(); };
ACT.saveNow = async () => toast(await saveGameAsync() ? 'Game saved on this device.' : 'Saving failed. Export a backup before leaving.');
ACT.returnTitle = async () => {
  const game = G, screen = UI.s;
  DAYRUN.on = false; clearTimeout(DAYRUN.timer); DAYRUN.timer = 0;
  closeDayRun();
  stopLive();
  if (!await saveGameAsync()) return toast('Saving failed. Stay here and export your save before leaving.');
  if (G !== game || UI.s !== screen) return;
  try { sessionStorage.removeItem(LAST_VIEW_KEY); } catch (e) { /* storage blocked */ }
  UI.tab = {};
  go('title');
};
ACT.exportSave = async () => {
  try { syncPlaytime(); UI.tab.export = await SaveStorage.request('exportCode', SaveStorage.snapshot()); render(); }
  catch { toast('The backup could not be prepared. Please try again.'); }
};
ACT.savePhone = async () => {
  try {
    // The chooser must open directly in the user gesture, before export awaits.
    const handle = window.showSaveFilePicker ? SaveStorage.file || await showSaveFilePicker({ suggestedName: `futbol-manager-${G.season}.json`, types: [{ description: 'Futbol Manager save', accept: { 'application/json': ['.json'] } }] }) : null;
    syncPlaytime();
    const json = await SaveStorage.request('export', SaveStorage.snapshot());
    if (handle) {
      const writable = await handle.createWritable();
      try { await writable.write(json); await writable.close(); } catch (error) { await writable.abort().catch(() => {}); throw error; }
      SaveStorage.file = handle; toast('Save file updated.'); render();
    } else {
      const url = URL.createObjectURL(new Blob([json], { type: 'application/json' })), link = document.createElement('a');
      link.href = url; link.download = `futbol-manager-${G.season}.json`; link.click(); setTimeout(() => URL.revokeObjectURL(url), 60000); toast('Save file download started.');
    }
  } catch (error) { if (error.name !== 'AbortError') { SaveStorage.file = null; toast('The phone file could not be saved. Choose Download save file instead.'); } }
};
ACT.downloadSave = async () => {
  try {
    syncPlaytime(); const json = await SaveStorage.request('export', SaveStorage.snapshot());
    const url = URL.createObjectURL(new Blob([json], { type: 'application/json' })), link = document.createElement('a');
    link.href = url; link.download = `futbol-manager-${G.season}.json`; link.click(); setTimeout(() => URL.revokeObjectURL(url), 60000); toast('Save file download started.');
  } catch { toast('The backup could not be prepared. Please try again.'); }
};
ACT.copySave = () => {
  const box = document.getElementById('saveBox');
  navigator.clipboard.writeText(box.value).then(() => toast('Save copied.'), () => { box.select(); toast('Select the text and copy it manually.'); });
};
ACT.importOpen = () => sheet(`<h3 class="sh-t">Import save</h3><p class="muted">Choose a save file or paste an exported save code. Loading it replaces your current career. Export a backup first if you want to keep it.</p><input id="importFile" type="file" accept=".json,application/json" data-c="importFile"><textarea id="importBox" class="code" rows="6"></textarea><button class="btn pri wide" data-a="importDo">Load save code</button>`);
async function importCareer(text) {
  try {
    const data = await SaveStorage.request('import', text);
    DAYRUN.on = false; clearTimeout(DAYRUN.timer); stopLive();
    const previous = G;
    try { G = data; ensureWorld(); ensureUserLineup(); } finally { G = previous; }
    if (!await saveGameAsync()) return toast('Your current career could not be saved. Export it before replacing it.');
    // Commit the replacement before changing the running career.
    SaveStorage.replacing = true;
    await SaveStorage.request('save', data);
    LIVE = null; SaveStorage.file = null; SaveStorage.current = SaveStorage.cached = data; SaveStorage.written = SaveStorage.dirty;
    G = data; ensureWorld(); closeSheet(true); UI.tab = {}; go('home'); toast('Save loaded.');
  } catch (e) { toast('The save could not be loaded. Your current career has been kept.'); }
  finally { SaveStorage.replacing = false; }
}
ACT.importDo = () => importCareer(document.getElementById('importBox').value.trim());
CHG.importFile = (v, ds, el) => { const file = el.files[0]; if (file) return file.text().then(importCareer).catch(() => toast('The file could not be read.')); };
ACT.newGame = async () => {
  if (!UI.tab.confirmNew) { UI.tab.confirmNew = true; return render(); }
  try { await deleteSave(); G = null; LIVE = null; UI.tab = {}; go('start'); } catch { toast('The existing save could not be removed.'); }
};
