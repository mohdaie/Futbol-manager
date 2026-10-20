'use strict';
/* ===== screens-hub.js =====
   Home dashboard, news & inbox, the More menu, fixtures, league table,
   stats leaders, club overview and settings. */

SCREENS.home = {
  render() {
    const c = userClub(), fx = nextUserFixture(), tbl = leagueTable();
    const pos = tbl.findIndex(r => r.id === G.club) + 1, row = tbl[pos - 1];
    const win = windowState(), sq = seniorSquad(G.club);
    let hero = '';
    if (fx) {
      const opp = fx.h === G.club ? fx.a : fx.h, home = fx.h === G.club, orow = tbl.find(r => r.id === opp);
      const oPos = tbl.indexOf(orow) + 1;
      hero = `<section class="hero" style="--k1:${G.clubs[fx.h].c1};--k2:${G.clubs[fx.a].c1}">
        <div class="eyebrow">${fx.w === G.week ? 'This week' : 'Next match'} · ${esc(phaseLabel(fx.w))}</div>
        <div class="vs">${badge(fx.h, 58)}<div class="vs-mid"><span class="ha">${home ? 'Home' : 'Away'}</span><b>v</b><small>${fmtDate(matchDate(fx.w))}</small></div>${badge(fx.a, 58)}</div>
        <div class="vs-names"><span>${esc(clubName(fx.h))}</span><span>${esc(clubName(fx.a))}</span></div>
        <div class="vs-meta"><span>Opponent ${orow.p ? ordinal(oPos) : 'unranked'}</span>${orow.form.length ? formChips(orow.form) : '<span class="muted">No form yet</span>'}</div>
        ${fx.w === G.week ? '<button class="btn pri wide" data-a="continue">Go to matchday</button>' : ''}
      </section>`;
    } else hero = `<section class="hero"><div class="eyebrow">Season complete</div><p>No fixtures left this season.</p></section>`;
    const injured = sq.filter(p => p.inj).length, mor = avg(sq, p => p.mor);
    const wageUse = Math.round(clubWageBill(c) / G.fin.wb * 100);
    const latest = G.news.slice(0, 4);
    return `${hero}
      <div class="tiles">
        <button class="tile" data-a="go" data-s="table"><small>League position</small><b>${row.p ? ordinal(pos) : '-'}</b><span>${row.pts} pts · GD ${row.gf - row.ga >= 0 ? '+' : ''}${row.gf - row.ga}</span></button>
        <button class="tile" data-a="go" data-s="board"><small>Board confidence</small><b>${G.board.conf}<i>%</i></b>${bar(G.board.conf, G.board.conf < 30 ? 'bad' : G.board.conf < 55 ? 'warn' : 'good')}</button>
        <button class="tile" data-a="go" data-s="finance"><small>Transfer budget</small><b>${money(G.fin.tb)}</b><span>Wages at ${wageUse}% of budget</span></button>
        <button class="tile" data-a="go" data-s="squad"><small>Squad morale</small><b class="${morClass(mor)}">${morLabel(mor)}</b><span>${injured} injured · ${sq.length} players</span></button>
        <button class="tile" data-a="go" data-s="training"><small>Training</small><b>${TRAINING_FOCUS.find(f => f.k === G.training.focus).n}</b><span>Tactical familiarity ${G.training.fam}%</span></button>
        <button class="tile ${win.open ? 'hot' : ''}" data-a="go" data-s="transfers"><small>${win.label}</small><b>${win.open ? 'Open' : 'Closed'}</b><span>${win.open ? 'Closes ' + win.closes : 'Free agents only'}</span></button>
      </div>
      <div class="sec-h"><h2>Latest news</h2><button class="link" data-a="go" data-s="news">All news</button></div>
      <div class="list">${latest.map(newsRow).join('') || empty('No news yet', 'Press Continue to move the week on.')}</div>`;
  },
};

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
  sheet(`<div class="eyebrow">${NEWS_CATS.find(c => c[0] === n.cat)[1]} · ${fmtDate(n.date)}</div><h3 class="sh-t">${esc(n.title)}</h3><p class="body">${esc(n.body)}</p>${actions}`, { onClose: () => render() });
};
ACT.bid = ds => {
  const n = G.news.find(x => x.id === +ds.id);
  const msg = respondBid(n, ds.c2);
  closeSheet(true); toast(msg); saveGame(); render();
};

SCREENS.more = {
  render() {
    const items = [['news', 'News & inbox', 'Results, transfers, board messages'], ['fixtures', 'Fixtures', 'Your schedule and every round'], ['table', 'League table', LEAGUE_NAME + ' standings'], ['stats', 'Stats leaders', 'Goals, assists, ratings'], ['training', 'Training', 'Weekly focus and intensity'], ['medical', 'Medical centre', 'Injuries and fatigue'], ['youth', 'Youth academy', 'Prospects and intake'], ['finance', 'Finances', 'Budgets, income and costs'], ['staff', 'Staff', 'Coaches, scouts, physios'], ['board', 'Board & fans', 'Confidence and requests'], ['club', 'Club', 'Stadium, history, trophies'], ['settings', 'Settings', 'Save, speed, new game']];
    if (adminAllowed()) items.push(['admin', 'Admin', 'Edit the game world and tune the engine']);
    return `<h1 class="h1">Club menu</h1><div class="grid2">${items.map(([s, n, d]) => `<button class="gcard" data-a="go" data-s="${s}"><b>${n}</b><small>${d}</small></button>`).join('')}</div>`;
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
        return `<button class="row act" ${played(f) ? `data-a="go" data-s="post" data-fid="${f.id}"` : 'disabled'}><span class="rd">${f.r + 1}</span>${badge(opp, 22)}<span class="grow"><b>${esc(clubName(opp))}</b><small>${home ? 'Home' : 'Away'} · ${fmtDate(matchDate(f.w), false)}</small></span>${res}</button>`;
      }).join('')}</div>`;
    } else {
      const cur = G.fixtures.filter(f => f.w >= G.week)[0], r = UI.tab.round ?? (cur ? cur.r : 37);
      const list = G.fixtures.filter(f => f.r === +r);
      body = `<div class="field"><label for="rsel">Round</label>${selectHtml('rsel', Array.from({ length: 38 }, (_, i) => [i, 'Matchweek ' + (i + 1) + ' · ' + fmtDate(matchDate(roundWeek(i)), false)]), r, 'round')}</div>
        <div class="list">${list.map(f => `<div class="row fxr ${f.h === G.club || f.a === G.club ? 'me' : ''}"><span class="grow r">${esc(clubName(f.h))}</span>${badge(f.h, 18)}<span class="res">${played(f) ? f.hg + '-' + f.ag : 'v'}</span>${badge(f.a, 18)}<span class="grow">${esc(clubName(f.a))}</span></div>`).join('')}</div>`;
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
    const cfg = { g: ['Goals', p => p.st.g, p => p.st.g], as: ['Assists', p => p.st.as, p => p.st.as], rt: ['Avg rating', p => (p.st.a >= 3 ? avgRating(p) : 0), p => avgRating(p).toFixed(2)], cs: ['Clean sheets', p => (p.pos === 'GK' ? p.st.cs : 0), p => p.st.cs] }[t];
    const list = pl.filter(p => cfg[1](p) > 0).sort((a, b) => cfg[1](b) - cfg[1](a)).slice(0, 25);
    return `<h1 class="h1">Stats leaders</h1>${tabs('stats', [['g', 'Goals'], ['as', 'Assists'], ['rt', 'Rating'], ['cs', 'Clean sheets']], t)}
      <div class="list">${list.map((p, i) => playerRow(p, `<span class="stat"><b>${cfg[2](p)}</b><small>${p.st.a} apps</small></span>`, { sub: (i + 1) + '. ' + clubName(p.club) })).join('') || empty('No matches played yet', 'Leaders appear after the opening round.')}</div>`;
  },
};

SCREENS.club = {
  render() {
    const c = userClub(), B = G.board;
    return `<section class="clubhead" style="--k1:${c.c1}">${badge(c.id, 64)}<div><h1 class="h1">${esc(c.name)}</h1><p class="muted">${esc(c.city)} · Manager ${esc(G.manager)}</p></div></section>
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
      <div class="card"><h3>Default match speed</h3><div class="seg">${[1, 2, 4].map(s => `<button class="${G.settings.speed === s ? 'on' : ''}" data-a="speed" data-v="${s}">${s}x</button>`).join('')}</div></div>
      <div class="card"><h3>Save game</h3><p class="muted">The game saves itself in this browser after every week and match. Clearing site data removes it, so export a copy to keep a backup.</p>
        <div class="btns"><button class="btn" data-a="saveNow">Save now</button><button class="btn" data-a="exportSave">Export save</button><button class="btn" data-a="importOpen">Import save</button></div>
        ${exp ? `<textarea id="saveBox" class="code" rows="5" readonly>${esc(exp)}</textarea><button class="btn" data-a="copySave">Copy to clipboard</button>` : ''}</div>
      <div class="card danger"><h3>New game</h3><p class="muted">Starts a new career and deletes the current save.</p><button class="btn ${UI.tab.confirmNew ? 'bad' : ''}" data-a="newGame">${UI.tab.confirmNew ? 'Tap again to delete and restart' : 'Start a new game'}</button></div>`;
  },
};
ACT.speed = ds => { G.settings.speed = +ds.v; saveGame(); render(); };
ACT.saveNow = () => toast(saveGame() ? 'Game saved.' : 'Saving failed. Browser storage is blocked here, so export your save instead.');
ACT.exportSave = () => { UI.tab.export = btoa(unescape(encodeURIComponent(JSON.stringify(G)))); render(); };
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
