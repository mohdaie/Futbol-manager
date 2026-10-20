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

SCREENS.home = {
  render() {
    const c = userClub(), fx = nextUserFixture(), tbl = leagueTable();
    const pos = tbl.findIndex(r => r.id === G.club) + 1, row = tbl[pos - 1];
    const conf = G.board.conf;

    const clubCard = `<section class="clubcard">
      <div class="cc-top"><div class="cc-badge">${badge(c.id, 40)}</div>
        <div class="cc-name"><b>${esc(c.name)}</b><small>${LEAGUE_NAME} · ${seasonLabel()}</small></div>
        <button class="cc-link" data-a="go" data-s="club">Club overview <span aria-hidden="true">→</span></button></div>
      <div class="cc-stats"><div><small>Position</small><b>${row.p ? ordinal(pos) : '-'}</b></div><div><small>Points</small><b>${row.pts}</b></div><div><small>Played</small><b>${row.p}</b></div></div>
      <div class="cc-form"><span>Recent form</span>${row.form.length ? formChips(row.form) : '<span>No matches yet</span>'}</div>
      <button class="cc-conf" data-a="go" data-s="board"><span>Board confidence</span>${bar(conf)}<b>${conf}%</b></button>
    </section>`;

    let next = '';
    if (fx) {
      const home = fx.h === G.club, opp = home ? fx.a : fx.h, orow = tbl.find(r => r.id === opp);
      const days = fxDayNo(fx) - todayNo(), rest = restDays(G.club, fx);
      next = `<section class="dcard" ${fx.w === G.week ? 'data-a="continue" role="button"' : ''}>
        <div class="dcard-h"><h2>Next match</h2><span class="pill">${days <= 0 ? 'Today' : days === 1 ? 'Tomorrow' : 'In ' + days + ' days'}</span></div>
        <div class="nm"><div class="nm-team">${badge(fx.h, 32)}<span>${esc(clubName(fx.h))}</span></div>
          <div class="nm-mid"><b>vs</b>${fxWhen(fx)}<br>${home ? 'Home' : 'Away'} · League${fx.tv ? ' · TV' : ''}</div>
          <div class="nm-team r">${badge(fx.a, 32)}<span>${esc(clubName(fx.a))}</span></div></div>
        <div class="nm-cond"><span>${wxLabel(fx.wx)}</span><span>${rest == null ? 'First match' : rest + " days' rest"}</span>${rest != null && rest <= 3 ? '<span class="warnc">Tight turnaround</span>' : ''}</div>
        <div class="nm-form"><span>Opponent form</span>${orow.form.length ? formChips(orow.form) : '<span>No matches yet</span>'}</div>
      </section>`;
    } else next = `<section class="dcard"><div class="dcard-h"><h2>Next match</h2></div><p class="muted">No fixtures left this season.</p></section>`;

    const sort = UI.f.dash || 'xi', xi = G.tactics.slots.map(id => G.players[id]).filter(Boolean);
    const rows = sort === 'cond' ? xi.slice().sort((a, b) => a.cond - b.cond) : sort === 'mor' ? xi.slice().sort((a, b) => a.mor - b.mor) : xi;
    const ip = FORMATIONS[G.tactics.ip];
    const players = `<section class="dcard">
      <div class="dcard-h"><div><h2>Player stats</h2><small>First team · ${seniorSquad(G.club).length} players</small></div>
        ${selectHtml('dashSort', [['xi', 'Line-up'], ['cond', 'Lowest health'], ['mor', 'Lowest morale']], sort, 'dashSort')}</div>
      <table class="ptable"><thead><tr><th>Player</th><th>Pos</th><th>Health</th><th>Morale</th></tr></thead><tbody>
      ${rows.map(p => { const slot = G.tactics.slots.indexOf(p.id); const hc = p.inj ? 'bad' : p.cond >= 85 ? 'good' : p.cond >= 65 ? 'warn' : 'bad'; return `<tr data-a="player" data-id="${p.id}"><td>${esc(pname(p))}</td><td class="ppos">${slot >= 0 ? ip[slot][0] : p.pos}</td><td><span class="hb">${bar(p.inj ? 0 : p.cond, hc)}<b>${p.inj ? 'INJ' : Math.round(p.cond) + '%'}</b></span></td><td>${moodFace(p.mor)}</td></tr>`; }).join('')}
      </tbody></table>
      <button class="dlink" data-a="go" data-s="squad">View full squad <span class="chev">›</span></button>
    </section>`;

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
      ${clubCard}${next}${players}${finance}
      <div class="sec-h"><h2>Latest news</h2><button class="link" data-a="go" data-s="news">All news</button></div>
      <div class="list">${G.news.slice(0, 3).map(newsRow).join('') || empty('No news yet', 'Press Continue to move the week on.')}</div>`;
  },
};
CHG.dashSort = v => { UI.f.dash = v; render(); };

const NEWS_CATS = [['all', 'All'], ['inbox', 'Inbox'], ['match', 'Matches'], ['transfer', 'Transfers'], ['club', 'Club'], ['league', 'League']];
function newsRow(n) {
  const needs = n.action && !n.done && n.action.t !== 'player';
  return `<button class="row act news ${n.read ? '' : 'unread'}" data-a="news" data-id="${n.id}">
    <span class="ncat c-${n.cat}">${NEWS_CATS.find(c => c[0] === n.cat)[1]}</span>
    <span class="grow"><b>${esc(n.title)}</b><small>${fmtDate(n.date, false)}${needs ? ' · <em class="tag warn">Action</em>' : ''}</small></span><span class="chev">›</span></button>`;
}

SCREENS.news = {
  render() {
    const f = UI.f.news, list = G.news.filter(n => f === 'all' || n.cat === f);
    return `<h1 class="h1">News</h1>
      <div class="chips">${NEWS_CATS.map(([k, n]) => `<button class="chip ${f === k ? 'on' : ''}" data-a="newsF" data-v="${k}">${n}</button>`).join('')}</div>
      <div class="sec-h"><span class="muted">${list.length} items</span><button class="link" data-a="readAll">Mark all read</button></div>
      <div class="list">${list.map(newsRow).join('') || empty('Nothing here', 'News in this category will appear as the season goes on.')}</div>`;
  },
};
ACT.newsF = ds => { UI.f.news = ds.v; render(); };
ACT.readAll = () => { G.news.forEach(n => { n.read = true; }); render(); };
ACT.news = ds => {
  const n = G.news.find(x => x.id === +ds.id);
  if (!n) return;
  n.read = true;
  let actions = '';
  const a = n.action;
  if (a && !n.done && a.t === 'bid') actions = `<div class="btns"><button class="btn pri" data-a="bid" data-id="${n.id}" data-c2="accept">Accept ${money(a.fee)}</button><button class="btn" data-a="bid" data-id="${n.id}" data-c2="counter">Ask for ${money(roundMoney(a.fee * 1.2))}</button><button class="btn ghost" data-a="bid" data-id="${n.id}" data-c2="reject">Reject</button></div>`;
  if (a && !n.done && a.t === 'renew' && G.players[a.pid]) actions = `<div class="btns"><button class="btn pri" data-a="contract" data-id="${a.pid}" data-mode="renew">Open contract talks</button></div>`;
  if (a && a.pid && G.players[a.pid] && a.t !== 'renew') actions += `<div class="btns"><button class="btn" data-a="player" data-id="${a.pid}">View ${esc(pname(G.players[a.pid]))}</button></div>`;
  if (a && n.done) actions += '<p class="note">Dealt with.</p>';
  sheet(`<div class="eyebrow">${NEWS_CATS.find(c => c[0] === n.cat)[1]} · ${fmtDate(n.date)}</div><h3 class="sh-t">${esc(n.title)}</h3><p class="body">${esc(n.body)}</p>${actions}`, { key: 'news:' + n.id, restore: () => ACT.news({ id: n.id }), valid: () => !!G?.news.find(x => x.id === n.id), onClose: () => render() });
};
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
    return hubMenu('My Team', [
      ['squad', 'Squad', 'First team, reserves and under-18s'],
      ['tactics', 'Tactics', 'Line-up, shape and instructions'],
      ['fixtures', 'Fixtures', 'Your schedule and every round'],
      ['training', 'Training', 'Team focus and individual development'],
      ['staff', 'Staff', 'Coaches, scouts and physios'],
      ['medical', 'Medical center', 'Injuries and fatigue'],
      ['youth', 'Youth academy', 'Prospects and intake'],
      ['stats', 'Stats', 'Goals, assists and ratings'],
      ['table', 'League table', LEAGUE_NAME + ' standings'],
    ]);
  },
};

SCREENS.facilities = {
  render() {
    return hubMenu('Facilities', [
      ['finance', 'Finance', 'Budgets, income and spending'],
      ['board', 'Board & fans', 'Confidence, requests and upgrades'],
      ['club', 'Club', 'Stadium, facilities, history and trophies'],
    ]);
  },
};

SCREENS.more = {
  render() {
    const items = [['settings', 'Settings', 'Save, speed and new game']];
    if (adminAllowed()) items.push(['admin', 'Admin', 'Edit the game world and tune the engine']);
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
        ['First team / reserves / U18s', ['A', 'R', 'Y'].map(l => squad.filter(p => lvlOf(p) === l).length).join(' / ')],
        ['Injured players', squad.filter(p => p.inj).length], ['Staff', G.staff.length], ['Club balance', money(c.bal)],
        ['Transfer budget', money(G.fin.tb)], ['Weekly wage budget', money(G.fin.wb)], ['Board confidence', Math.round(G.board.conf) + '%'], ['Fan confidence', Math.round(G.board.fans) + '%'],
        ['Training / youth facilities', `Level ${G.board.facTrain} / ${G.board.facYouth}`], ['Transfer history entries', G.tHist.length],
      ])}</div>
      <div class="card"><h3>Game & save</h3>${kv([
        ['Game version', GAME_VERSION], ['Save format', G.v], ['Last saved', realDate(G.savedAt)],
        ['World clubs', Object.keys(G.clubs).length], ['World players', Object.keys(G.players).length], ['News / scout reports', `${G.news.length} / ${G.scout.reports.length}`],
        ['Match speed', G.settings.speed + 'x'], ['Career status', G.gameOver ? 'Ended' : 'In progress'],
      ])}<p class="muted">This career is stored in this browser. Export a backup from Settings.</p><button class="btn" data-a="go" data-s="settings">Save & backup settings</button></div>`;
  },
};

SCREENS.fixtures = {
  render() {
    const t = UI.tab.fx || 'ours';
    let body = '';
    if (t === 'ours') {
      const list = G.fixtures.filter(f => f.h === G.club || f.a === G.club).sort((a, b) => a.w - b.w);
      body = `<div class="list">${list.map(f => {
        const home = f.h === G.club, opp = home ? f.a : f.h;
        let res = '<span class="res">-</span>';
        if (played(f)) { const us = home ? f.hg : f.ag, them = home ? f.ag : f.hg; res = `<span class="res r${us > them ? 'W' : us < them ? 'L' : 'D'}">${f.hg}-${f.ag}</span>`; }
        return `<button class="row act" ${played(f) ? `data-a="go" data-s="post" data-fid="${f.id}"` : 'disabled'}><span class="rd">${f.r + 1}</span>${badge(opp, 22)}<span class="grow"><b>${esc(clubName(opp))}</b><small>${home ? 'Home' : 'Away'} · ${fxWhen(f)}${f.tv ? ' · TV' : ''}</small></span>${res}</button>`;
      }).join('')}</div>`;
    } else {
      const cur = G.fixtures.filter(f => f.w >= G.week)[0], r = UI.tab.round ?? (cur ? cur.r : 37);
      const list = G.fixtures.filter(f => f.r === +r).sort(fxSort);
      body = `<div class="field"><label for="rsel">Round</label>${selectHtml('rsel', Array.from({ length: 38 }, (_, i) => [i, 'Matchweek ' + (i + 1) + (SCHEDULE[i].mid ? ' (midweek)' : '') + ' · ' + fmtDate(weekDate(roundWeek(i)), false)]), r, 'round')}</div>
        <div class="list">${list.map(f => `<div class="row fxr ${f.h === G.club || f.a === G.club ? 'me' : ''}"><span class="fxt">${fxWhen(f).replace(/ \d+ \w+ ·/, '')}${f.tv ? '<em>TV</em>' : ''}</span><span class="grow r">${esc(clubName(f.h))}</span>${badge(f.h, 18)}<span class="res">${played(f) ? f.hg + '-' + f.ag : 'v'}</span>${badge(f.a, 18)}<span class="grow">${esc(clubName(f.a))}</span></div>`).join('')}</div>`;
    }
    return `<h1 class="h1">Fixtures</h1>${tabs('fx', [['ours', 'Our fixtures'], ['all', 'All rounds']], t)}${body}`;
  },
};
CHG.round = v => { UI.tab.round = +v; render(); };

SCREENS.table = {
  render() {
    const tbl = leagueTable();
    return `<h1 class="h1">${LEAGUE_NAME}</h1><p class="muted">${seasonLabel()} · ${esc(phaseLabel())}</p>
      <div class="tablewrap"><table class="tbl"><thead><tr><th>#</th><th class="l">Club</th><th>P</th><th>W</th><th>D</th><th>L</th><th>GD</th><th>Pts</th><th class="hide-s">Form</th></tr></thead><tbody>
      ${tbl.map((r, i) => `<tr class="${r.id === G.club ? 'me' : ''} ${i < 4 ? 'z1' : i < 6 ? 'z2' : i === 6 ? 'z3' : i >= 17 ? 'z4' : ''}"><td>${i + 1}</td><td class="l"><span class="tc">${badge(r.id, 18)}${esc(G.clubs[r.id].name)}</span></td><td>${r.p}</td><td>${r.w}</td><td>${r.d}</td><td>${r.l}</td><td>${r.gf - r.ga}</td><td><b>${r.pts}</b></td><td class="hide-s">${formChips(r.form)}</td></tr>`).join('')}
      </tbody></table></div>
      <div class="legend"><span class="lz z1">Champions Cup</span><span class="lz z2">Europa Trophy</span><span class="lz z3">Conference Shield</span><span class="lz z4">Bottom three</span></div>`;
  },
};

SCREENS.stats = {
  render() {
    const t = UI.tab.stats || 'g';
    const pl = Object.values(G.players).filter(p => G.clubs[p.club] && G.clubs[p.club].pl && p.st.a > 0);
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

SCREENS.settings = {
  render() {
    const exp = UI.tab.export;
    return `<h1 class="h1">Settings</h1>
      <div class="card"><h3>Manager portrait</h3>${avatarPicker(G.avatar || 1, 'setAvatar')}</div>
      <div class="card"><h3>Default match speed</h3><div class="seg">${[1, 2, 4].map(s => `<button class="${G.settings.speed === s ? 'on' : ''}" data-a="speed" data-v="${s}">${s}x</button>`).join('')}</div></div>
      <div class="card"><h3>Save game</h3><p class="muted">The game saves itself in this browser after every week and match. Clearing site data removes it, so export a copy to keep a backup.</p>
        <div class="btns"><button class="btn" data-a="saveNow">Save now</button><button class="btn" data-a="exportSave">Export save</button><button class="btn" data-a="importOpen">Import save</button></div>
        ${exp ? `<textarea id="saveBox" class="code" rows="5" readonly>${esc(exp)}</textarea><button class="btn" data-a="copySave">Copy to clipboard</button>` : ''}</div>
      <div class="card danger"><h3>New game</h3><p class="muted">Starts a new career and deletes the current save.</p><button class="btn ${UI.tab.confirmNew ? 'bad' : ''}" data-a="newGame">${UI.tab.confirmNew ? 'Tap again to delete and restart' : 'Start a new game'}</button></div>`;
  },
};
ACT.setAvatar = ds => { G.avatar = +ds.v; saveGame(); toast('Portrait changed to Manager ' + ds.v + '.'); render(); };
ACT.speed = ds => { G.settings.speed = +ds.v; saveGame(); render(); };
ACT.saveNow = () => toast(saveGame() ? 'Game saved.' : 'Saving failed. Browser storage is blocked here, so export your save instead.');
ACT.exportSave = () => { syncPlaytime(); UI.tab.export = btoa(unescape(encodeURIComponent(JSON.stringify(G)))); render(); };
ACT.copySave = () => {
  const box = document.getElementById('saveBox');
  navigator.clipboard.writeText(box.value).then(() => toast('Save copied.'), () => { box.select(); toast('Select the text and copy it manually.'); });
};
ACT.importOpen = () => sheet(`<h3 class="sh-t">Import save</h3><p class="muted">Paste an exported save code. It replaces your current game.</p><textarea id="importBox" class="code" rows="6"></textarea><button class="btn pri wide" data-a="importDo">Load save</button>`);
ACT.importDo = () => {
  try {
    const data = JSON.parse(decodeURIComponent(escape(atob(document.getElementById('importBox').value.trim()))));
    if (!data.players || !data.clubs) throw new Error('bad');
    G = data; saveGame(); closeSheet(true); UI.tab = {}; go('home'); toast('Save loaded.');
  } catch (e) { toast('That save code could not be read. Check it was copied in full.'); }
};
ACT.newGame = () => {
  if (!UI.tab.confirmNew) { UI.tab.confirmNew = true; return render(); }
  deleteSave(); G = null; UI.tab = {}; go('start');
};
