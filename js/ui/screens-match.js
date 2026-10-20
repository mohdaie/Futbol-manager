'use strict';
/* ===== screens-match.js =====
   New-game screen, matchday (pre-match with press conference and opposition report),
   the live 2D match, match report, season review and the sacked screen. */

/* ---------- start ---------- */
const START = { club: 'GUN', name: '' };
function startBadge(c, size) {
  const txt = isLight(c.c1) ? '#141414' : '#FFFFFF';
  return `<svg class="crest" width="${size}" height="${Math.round(size * 1.15)}" viewBox="0 0 40 46" aria-hidden="true"><path d="M20 1.5 37.5 6v16c0 12-8 19-17.5 22.5C10.5 41 2.5 34 2.5 22V6z" fill="${c.c1}" stroke="${c.c2}" stroke-width="2.5"/><path d="M8 9h24" stroke="${c.c2}" stroke-width="2" opacity=".55"/><text x="20" y="28" text-anchor="middle" font-size="11.5" font-weight="800" fill="${txt}" font-family="Saira Condensed, sans-serif">${c.id}</text></svg>`;
}
SCREENS.start = {
  full: true,
  render() {
    const order = CLUBS.slice().sort((a, b) => b.rep - a.rep);
    const exp = i => (i < 2 ? 'Title favourites' : i < 5 ? 'Top four' : i < 8 ? 'Push for Europe' : i < 12 ? 'Top half' : i < 16 ? 'Mid-table' : 'Survival');
    const diff = i => (i < 5 ? 1 : i < 10 ? 2 : i < 15 ? 3 : 4);
    const sel = CLUBS.find(c => c.id === START.club);
    return `<div class="start">
      <header class="st-hero"><div class="eyebrow">${seasonLabelRaw(START_SEASON)} · ${LEAGUE_NAME}</div><h1 class="logo">Touchline<br>Gaffer</h1><p>Pick a club, build a squad, win the league.</p></header>
      ${hasSave() ? '<button class="btn pri wide" data-a="resume">Continue your career</button>' : ''}
      <div class="field"><label for="mgr">Manager name</label><input id="mgr" type="text" maxlength="28" placeholder="Your name" value="${esc(START.name)}" data-c="mgr"></div>
      <h2 class="lbl">Choose your club</h2>
      <div class="clubs">${order.map((c, i) => `<button class="club ${START.club === c.id ? 'on' : ''}" data-a="pickClub" data-id="${c.id}" style="--k1:${c.c1}">${startBadge(c, 34)}<span class="grow"><b>${c.name}</b><small>${c.city} · ${exp(i)}</small></span><span class="diff d${diff(i)}" title="Difficulty">${['', 'Easy', 'Normal', 'Hard', 'Very hard'][diff(i)]}</span></button>`).join('')}</div>
      <div class="st-go"><button class="btn pri wide big" data-a="startGame">Take charge of the ${sel.name}</button></div>
    </div>`;
  },
};
const seasonLabelRaw = s => s + '/' + String(s + 1).slice(2);
ACT.pickClub = ds => { START.club = ds.id; render(); };
CHG.mgr = v => { START.name = v.trim(); };
ACT.resume = () => { if (loadGame()) go('home'); };
ACT.startGame = () => {
  const n = document.getElementById('mgr');
  START.name = (n && n.value.trim()) || START.name;
  newGame(START.club, START.name || 'The Gaffer');
  go('home');
};

/* ---------- pre-match ---------- */
SCREENS.prematch = {
  render() {
    const fx = userFixture();
    if (!fx || played(fx)) return '<p class="muted">No match this week.</p>';
    const home = fx.h === G.club, opp = G.clubs[home ? fx.a : fx.h], T = G.tactics, tbl = leagueTable();
    ensureUserLineup();
    const orow = tbl.find(r => r.id === opp.id), analyst = staffAvg('Analyst', 6);
    const theirs = seniorSquad(opp.id).filter(available).sort((a, b) => b.ca - a.ca).slice(0, 3);
    const ip = FORMATIONS[T.ip];
    const warn = [];
    T.slots.forEach((id, i) => { const p = G.players[id]; if (!p) warn.push(`No player at ${ip[i][0]}.`); else if (fam(p, ip[i][0]) < 0.9) warn.push(`${pname(p)} is out of position at ${ip[i][0]}.`); else if (p.cond < 75) warn.push(`${pname(p)} is tired (${p.cond}%).`); });
    const pc = G.press[fx.id] || (G.press[fx.id] = { Q: pickPress(), done: false }), Q = pc.Q || PRESS[pc.q];
    return `<section class="hero" style="--k1:${G.clubs[fx.h].c1};--k2:${G.clubs[fx.a].c1}">
        <div class="eyebrow">${esc(phaseLabel())} · ${fmtDate(matchDate(fx.w))} · ${esc(G.clubs[fx.h].ground)}</div>
        <div class="vs">${badge(fx.h, 58)}<div class="vs-mid"><b>v</b></div>${badge(fx.a, 58)}</div>
        <div class="vs-names"><span>${esc(clubName(fx.h))}</span><span>${esc(clubName(fx.a))}</span></div></section>
      <div class="card"><h3>Opposition report <small>Analyst ${analyst.toFixed(0)}/20</small></h3>
        <div class="kv"><div><small>League position</small><b>${orow.p ? ordinal(tbl.indexOf(orow) + 1) : '-'}</b></div><div><small>Form</small><b>${orow.form.length ? formChips(orow.form) : '-'}</b></div>
        <div><small>Likely shape</small><b>${analyst >= 8 ? opp.tac.ip + ' / ' + opp.tac.oop : 'Unknown'}</b></div><div><small>Pressing</small><b>${analyst >= 11 ? INSTRUCTIONS[4].o[opp.tac.press] : 'Unknown'}</b></div></div>
        <h4 class="lbl">Players to watch</h4><div class="list">${theirs.map(p => playerRow(p, '', { sub: POS_NAME[p.pos] })).join('')}</div></div>
      <div class="card"><h3>Your line-up <small>${T.ip} · ${INSTRUCTIONS[0].o[T.ment]}</small></h3>
        <div class="xi">${T.slots.map((id, i) => { const p = G.players[id]; return `<span class="${p && fam(p, ip[i][0]) < 0.9 ? 'warn' : ''}"><em>${ip[i][0]}</em>${p ? esc(p.ln) : '-'}</span>`; }).join('')}</div>
        ${warn.length ? `<ul class="warns">${warn.slice(0, 4).map(w => `<li>${esc(w)}</li>`).join('')}</ul>` : '<p class="muted">No selection problems.</p>'}
        <button class="btn wide" data-a="go" data-s="tactics">Edit tactics</button></div>
      <div class="card press"><h3>Press conference</h3>${pc.done ? `<p class="muted">Done. ${esc(pc.said)}</p>` : `<p class="q">“${esc(Q.q)}”</p><div class="list">${Q.a.map((a, k) => `<button class="row act" data-a="pressA" data-k="${k}"><span class="grow">${esc(a[0])}</span><span class="chev">›</span></button>`).join('')}</div><button class="link" data-a="pressSkip">Send the assistant instead</button>`}</div>
      <div class="btns col"><button class="btn pri wide big" data-a="kickoff">Kick off</button><button class="btn wide ghost" data-a="instant">Instant result</button></div>`;
  },
};
ACT.pressA = ds => {
  const fx = userFixture(), pc = G.press[fx.id], a = (pc.Q || PRESS[pc.q]).a[+ds.k], e = a[1];
  if (e.mor) seniorSquad(G.club).forEach(p => { p.mor = clamp(p.mor + e.mor, 0, 100); });
  if (e.fan) G.board.fans = clamp(G.board.fans + e.fan, 0, 100);
  if (e.board) G.board.conf = clamp(G.board.conf + e.board, 0, 100);
  pc.done = true; pc.said = 'You said: “' + a[0] + '”';
  toast(e.mor > 0 ? 'The squad liked what they heard.' : e.mor < 0 ? 'Some players were unimpressed.' : 'The press move on.');
  render();
};
ACT.pressSkip = () => { const fx = userFixture(); G.press[fx.id].done = true; G.press[fx.id].said = 'Your assistant handled the media.'; render(); };
ACT.kickoff = () => { const fx = userFixture(); if (fx && !played(fx)) startLive(fx); };
ACT.instant = () => {
  const fx = userFixture();
  if (!fx || played(fx)) return;
  const M = createMatch(fx);
  while (!M.ended) stepMatch(M, true);
  finishMatch(M); finishRound();
  go('post', { fid: fx.id });
};

/* ---------- live match ---------- */
SCREENS.match = {
  full: true,
  render() {
    if (!LIVE) return '<div class="mscr"><p class="muted">No match in progress.</p><button class="btn" data-a="go" data-s="home">Home</button></div>';
    const [H, W] = LIVE.M.sides;
    return `<div class="mscr">
      <div class="sb">
        <div class="sb-t">${badge(H.cid, 26)}<b>${esc(clubName(H.cid))}</b></div>
        <div class="sb-m"><b id="sbScore">0 - 0</b><span id="sbClock">0'</span></div>
        <div class="sb-t r"><b>${esc(clubName(W.cid))}</b>${badge(W.cid, 26)}</div>
      </div>
      <div class="poss"><span class="pbar"><i id="sbPoss" style="width:50%"></i></span><small id="sbPossTxt"></small></div>
      <div class="pitchwrap"><canvas id="pitch" aria-label="Live match view"></canvas></div>
      <ol id="feed" class="feed" aria-live="polite"></ol>
      <div id="ftBar" class="ftbar" hidden><button class="btn pri wide" data-a="toPost">Match report</button></div>
      <div class="mctl">
        <button id="btnPause" data-a="pause">Pause</button>
        <button id="btnSpeed" data-a="speedCycle">2x</button>
        <button data-a="liveSheet" data-k="tactics">Tactics</button>
        <button data-a="liveSheet" data-k="subs">Subs</button>
        <button data-a="liveSheet" data-k="shouts">Shouts</button>
        <button data-a="liveSheet" data-k="stats">Stats</button>
        <button data-a="instant2">Skip</button>
      </div></div>`;
  },
  after() { if (LIVE) requestAnimationFrame(bindLive); },
};
window.addEventListener('resize', () => { if (UI.s === 'match' && LIVE) bindLive(); });

const liveSide = () => LIVE.M.sides[LIVE.bottom];
ACT.pause = () => { const L = LIVE; if (!L || L.done || (L.overlay && L.overlay.stay)) return; L.paused = !L.paused; updateBoard(L); };
ACT.speedCycle = () => { G.settings.speed = { 1: 2, 2: 4, 4: 1 }[G.settings.speed] || 2; updateBoard(LIVE); };
ACT.instant2 = () => { if (LIVE && !LIVE.done) liveInstant(); };
ACT.toPost = () => { const fid = LIVE.fid; go('post', { fid }); LIVE = null; };
ACT.talk = ds => applyTalk(ds.k);
ACT.shout = ds => applyShout(ds.k);
ACT.liveSheet = ds => {
  const L = LIVE;
  if (!L || L.done) return;
  if (ds.k === 'subs') {
    const wasPaused = L.paused;
    L.paused = true; updateBoard(L);
    openLiveSheet('subs');
    UI.sheetOpts = { onClose: () => { L.subSel = null; if (!wasPaused && !(L.overlay && L.overlay.stay)) L.paused = false; updateBoard(L); } };
  } else openLiveSheet(ds.k);
};
function reopenLive(kind) { const o = UI.sheetOpts; openLiveSheet(kind); UI.sheetOpts = o; }
ACT.subOut = ds => { LIVE.subSel = +ds.id; reopenLive('subs'); };
ACT.subIn = ds => {
  const L = LIVE, S = liveSide();
  const e = makeSub(L.M, S, L.subSel, +ds.id);
  if (e) pushFeed(L, 'info', commLine(L, e)); else toast('No substitutions left.');
  L.subSel = null;
  reopenLive('subs');
};
ACT.liveIns = ds => { const S = liveSide(); S[ds.k] = +ds.v; LIVE.M.dirty = true; reopenLive('tactics'); };
CHG.liveShape = (v, ds, el) => {
  const S = liveSide(), k = el.id === 'lt-ip' ? 'ip' : 'oop';
  S[k] = v;
  if (k === 'ip') S.roles = Array(11).fill(0);
  S.map = shapeMap(S.ip, S.oop);
  LIVE.M.dirty = true;
  pushFeed(LIVE, 'info', `${clubName(S.cid)} switch to ${S.ip} with the ball, ${S.oop} without it.`);
};

/* ---------- match report ---------- */
SCREENS.post = {
  render(p) {
    const fx = G.fixtures.find(f => f.id === +p.fid);
    if (!fx) return '<p class="muted">Match not found.</p>';
    const sc = si => fx.goals.filter(g => g[0] === si).map(g => `${esc(G.players[g[2]] ? pname(G.players[g[2]]) : 'Unknown')} ${g[1]}'${g[3] ? ' (p)' : ''}`).join('<br>');
    let stats = '', rats = '';
    if (fx.stats) {
      const [h, a] = fx.stats, tot = h.pos + a.pos || 1;
      const row = (l, x, y) => `<div class="cmp"><b>${x}</b><span>${l}</span><b>${y}</b></div>`;
      stats = `<div class="card">${row('Possession', Math.round(h.pos / tot * 100) + '%', Math.round(a.pos / tot * 100) + '%')}${row('Shots', h.sh, a.sh)}${row('On target', h.sot, a.sot)}${row('Expected goals', h.xg.toFixed(2), a.xg.toFixed(2))}${row('Corners', h.co, a.co)}${row('Fouls', h.fo, a.fo)}${row('Cards', h.yc + '/' + h.rc, a.yc + '/' + a.rc)}</div>`;
      const us = fx.h === G.club ? 0 : 1;
      rats = `<div class="sec-h"><h2>Player ratings</h2></div><div class="list">${fx.ratings[us].filter(([id]) => G.players[id]).sort((x, y) => y[1] - x[1]).map(([id, r]) => `<button class="row act" data-a="player" data-id="${id}"><span class="pos">${G.players[id].pos}</span><span class="grow"><b>${esc(pname(G.players[id]))}</b>${fx.motm === id ? ' <em class="tag good">Player of the match</em>' : ''}</span><span class="rt ${r >= 7.5 ? 'good' : r < 6 ? 'bad' : ''}">${r.toFixed(1)}</span></button>`).join('')}</div>`;
    }
    const others = G.fixtures.filter(f => f.w === fx.w && f.id !== fx.id);
    return `<section class="hero rep" style="--k1:${G.clubs[fx.h].c1};--k2:${G.clubs[fx.a].c1}">
        <div class="eyebrow">Full time · ${fmtDate(matchDate(fx.w))}${fx.att ? ' · Att ' + fx.att.toLocaleString('en-GB') : ''}</div>
        <div class="vs">${badge(fx.h, 52)}<div class="vs-mid score"><b>${fx.hg} - ${fx.ag}</b></div>${badge(fx.a, 52)}</div>
        <div class="vs-names"><span>${esc(clubName(fx.h))}</span><span>${esc(clubName(fx.a))}</span></div>
        <div class="scorers"><span>${sc(0)}</span><span>${sc(1)}</span></div></section>
      ${stats}${rats}
      <div class="sec-h"><h2>Around the league</h2></div>
      <div class="list">${others.map(f => `<div class="row fxr"><span class="grow r">${esc(clubName(f.h))}</span>${badge(f.h, 18)}<span class="res">${played(f) ? f.hg + '-' + f.ag : 'v'}</span>${badge(f.a, 18)}<span class="grow">${esc(clubName(f.a))}</span></div>`).join('')}</div>
      <button class="btn pri wide" data-a="go" data-s="home">Back to the office</button>`;
  },
};

/* ---------- season review ---------- */
SCREENS.review = {
  full: true,
  render() {
    const r = G.seasonReview;
    if (!r) return '<button class="btn" data-a="go" data-s="home">Continue</button>';
    const aw = (t, a, unit) => (a ? `<div class="row"><span class="grow"><b>${t}</b><small>${esc(a.name)} · ${esc(clubName(a.club))}</small></span><span class="stat"><b>${unit === 'g' ? a.v : a.r}</b><small>${unit === 'g' ? 'goals' : 'avg'}</small></span></div>` : '');
    return `<div class="start review">
      <header class="st-hero"><div class="eyebrow">Season review · ${r.season}</div><h1 class="logo">${ordinal(r.pos)}<br><small>${r.pts} points</small></h1><p>${esc(r.verdict)}</p></header>
      <div class="card"><div class="kvrow"><span>Champions</span><b>${esc(clubName(r.champ))}</b></div><div class="kvrow"><span>Objective</span><b>${esc(r.target)}</b></div><div class="kvrow"><span>Prize money</span><b>${money(r.ledger.prize)}</b></div></div>
      <div class="list">${aw('Golden Boot', r.boot, 'g')}${aw('Player of the Season', r.best, 'r')}${aw('Young Player of the Season', r.young, 'r')}</div>
      <p class="muted">Contracts that ran out have ended, older players may have retired, and every player is a year older.</p>
      <button class="btn pri wide big" data-a="endReview">Start the ${seasonLabel()} season</button></div>`;
  },
};
ACT.endReview = () => { G.seasonReview = null; saveGame(); go('home'); };

/* ---------- sacked ---------- */
SCREENS.sacked = {
  full: true,
  render() {
    const o = G.gameOver;
    return `<div class="start review">
      <header class="st-hero"><div class="eyebrow">Statement from the board</div><h1 class="logo">Sacked</h1><p>${esc(o.reason)}</p></header>
      <h2 class="lbl">Job offers</h2>
      <div class="clubs">${o.offers.map(id => `<button class="club" data-a="takeJob" data-id="${id}" style="--k1:${G.clubs[id].c1}">${badge(id, 34)}<span class="grow"><b>${esc(clubName(id))}</b><small>${esc(expectationFor(id).text)}</small></span><span class="chev">›</span></button>`).join('')}</div>
      <button class="btn wide ghost" data-a="newGame2">Start a new career</button></div>`;
  },
};
ACT.takeJob = ds => { takeJob(ds.id); UI.tab = {}; go('home'); };
ACT.newGame2 = () => { deleteSave(); G = null; go('start'); };
