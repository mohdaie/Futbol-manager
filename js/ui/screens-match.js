'use strict';
/* ===== screens-match.js =====
   New-game screen, matchday (pre-match with press conference and opposition report),
   the live 2D match, match report, season review and the sacked screen. */

/* ---------- title ---------- */
function titleSpeed() {
  if (G?.settings?.speed) return G.settings.speed;
  try { const n = +localStorage.getItem('futbol-manager:speed'); return [1, 2, 4].includes(n) ? n : 2; } catch { return 2; }
}
SCREENS.title = {
  full: true,
  render() {
    return `<section class="title-screen" aria-label="Futbol Manager main menu">
      <img class="title-photo" src="public/assets/title/stadium-celebration.webp" alt="A manager celebrating with his team in a packed stadium" fetchpriority="high">
      <div class="title-shade"></div>
      <h1 class="title-wordmark"><span>Futbol</span><small>Manager</small></h1>
      <div class="title-menu">
        ${G ? `<button class="title-play" data-a="titleContinue">Continue game ${ICON.arrow}</button>` : ''}
        <button class="${G ? 'title-options' : 'title-play'}" data-a="titleNew">New game${G ? '' : ' ' + ICON.arrow}</button>
        <button class="title-options" data-a="titleOptions">Options</button>
        <button class="title-options" data-a="titleUpdate">Check for updates</button>
        <p class="title-save" id="title-update" role="status">${esc(updateText())}</p>
      </div>
    </section>`;
  },
};
ACT.titleContinue = () => go('home');
ACT.titleStart = () => go(G ? 'home' : 'start'); // older links and tests
ACT.titleNew = () => G ? sheet(`<h3 class="sh-t">New game</h3>
  <p class="muted">Starting a new career replaces ${esc(G.manager)}'s current save once you take charge of a club.</p>
  <button class="btn pri wide" data-a="titleNewGo">Choose a club</button>
  <button class="btn wide" data-a="closeSheet">Cancel</button>`, { key: 'title-new' }) : go('start');
ACT.titleNewGo = () => go('start');

/* ---------- updates ----------
   The live game is served by GitHub Pages. The title screen reads GAME_VERSION from the published
   data.js; when it is newer, every script and stylesheet is fetched again past the browser cache and
   the page reloads, so players always enter the latest version. A version tried once this tab
   (sessionStorage) is not reloaded again while Pages is still rolling it out. */
const UPDATE = { state: 'idle', v: '', checked: false };
const UPDATE_KEY = 'futbol-manager:update';
function versionNewer(a, b) {
  const x = String(a).split('.').map(Number), y = String(b).split('.').map(Number);
  for (let i = 0; i < Math.max(x.length, y.length); i++) if ((x[i] || 0) !== (y[i] || 0)) return (x[i] || 0) > (y[i] || 0);
  return false;
}
function updateText() {
  return ({
    checking: 'Checking for updates…',
    latest: `Up to date · version ${GAME_VERSION}`,
    found: `Updating to version ${UPDATE.v}…`,
    pending: `Version ${UPDATE.v} is still being published. Try again in a minute.`,
    error: `Could not check for updates · version ${GAME_VERSION}`,
  })[UPDATE.state] || `Version ${GAME_VERSION}`;
}
function updateShow() { const el = document.getElementById('title-update'); if (el) el.textContent = updateText(); }
async function checkForUpdate() {
  if (UPDATE.state === 'checking' || UPDATE.state === 'found') return;
  UPDATE.state = 'checking'; UPDATE.checked = true; updateShow();
  let v = '';
  try {
    const r = await fetch('js/core/data.js?check=' + Date.now(), { cache: 'no-store' });
    v = ((await r.text()).match(/GAME_VERSION\s*=\s*'([^']+)'/) || [])[1] || '';
  } catch { /* offline: the game still runs */ }
  if (!v) { UPDATE.state = 'error'; updateShow(); return; }
  UPDATE.v = v;
  let tried = '';
  try { tried = sessionStorage.getItem(UPDATE_KEY) || ''; } catch { /* private mode */ }
  if (!versionNewer(v, GAME_VERSION)) { UPDATE.state = 'latest'; updateShow(); return; }
  if (tried === v) { UPDATE.state = 'pending'; updateShow(); return; }
  if (UI.s !== 'title') { UPDATE.state = 'idle'; return; } // never reload under a player who has already gone in
  if (G && !await saveGameAsync()) { UPDATE.state = 'error'; updateShow(); toast('Export a backup before updating; this device could not save your career.'); return; }
  UPDATE.state = 'found'; updateShow();
  try { sessionStorage.setItem(UPDATE_KEY, v); sessionStorage.removeItem(LAST_VIEW_KEY); } catch { /* reload anyway */ } // reopen on the title
  const own = u => u && new URL(u, location.href).origin === location.origin;
  const urls = [location.href, ...[...document.scripts].map(s => s.src), ...[...document.querySelectorAll('link[rel="stylesheet"]')].map(l => l.href)].filter(own);
  await Promise.all(urls.map(u => fetch(u, { cache: 'reload' }).catch(() => null)));
  location.reload();
}
ACT.titleUpdate = () => checkForUpdate();
ACT.titleOptions = () => sheet(`<h3 class="sh-t">Options</h3>
  <h4 class="lbl">Match speed</h4><div class="seg">${[1, 2, 4].map(n => `<button class="${titleSpeed() === n ? 'on' : ''}" data-a="titleSpeed" data-v="${n}">${n}x</button>`).join('')}</div>
  ${G ? '<button class="btn wide" data-a="go" data-s="settings">Game settings</button>' : ''}
  <button class="btn pri wide" data-a="closeSheet">Done</button>`, { key: 'title-options', restore: () => ACT.titleOptions() });
ACT.titleSpeed = ds => {
  const speed = +ds.v;
  if (![1, 2, 4].includes(speed)) return;
  try { localStorage.setItem('futbol-manager:speed', speed); } catch { /* The selection still works for this career. */ }
  if (G) { G.settings.speed = speed; saveGame(); }
  ACT.titleOptions();
};

/* ---------- start ---------- */
const START = { club: 'GUN', league: 'EPL', name: '', avatar: 1 };
function startBadge(c, size) {
  return clubBadge(c, size);
}
SCREENS.start = {
  full: true,
  render() {
    const catalog = START.league === 'ECH' ? CHAMPIONSHIP_CLUBS : CLUBS;
    const order = catalog.slice().sort((a, b) => b.rep - a.rep);
    const exp = i => (i < 2 ? 'Title favourites' : i < 5 ? 'Top four' : i < 8 ? 'Push for Europe' : i < 12 ? 'Top half' : i < 16 ? 'Mid-table' : 'Survival');
    const diff = i => (i < 5 ? 1 : i < 10 ? 2 : i < 15 ? 3 : 4);
    const sel = catalog.find(c => c.id === START.club) || order[0];
    return `<div class="start">
      <button class="link back" data-a="back">‹ Back</button>
      <header class="st-hero"><div class="eyebrow">${seasonLabelRaw(START_SEASON)} · ${leagueName(START.league)}</div><h1 class="logo">Futbol<br>Manager</h1><p>Pick a club, build a squad, win the league.</p></header>
      ${hasSave() ? '<button class="btn pri wide" data-a="resume">Continue your career</button>' : ''}
      <div class="field"><label for="mgr">Manager name</label><input id="mgr" type="text" maxlength="28" placeholder="Your name" value="${esc(START.name)}" data-c="mgr"></div>
      <h2 class="lbl">Choose your manager</h2>
      ${avatarPicker(START.avatar, 'pickAvatar')}
      <h2 class="lbl">Choose your league</h2><div class="seg">${Object.values(LEAGUES).map(r => `<button class="${START.league === r.id ? 'on' : ''}" data-a="pickLeague" data-id="${r.id}">${r.name}</button>`).join('')}</div><p class="muted">${START.league === 'ECH' ? '24 clubs · 46 league games · First team and reserves · 36 players maximum' : '20 clubs · 38 league games · First team, reserves and U18s'}</p>
      <p class="muted">Background club setup: Spain (${WORLD_LEAGUES.ES1.teams}), Italy (${WORLD_LEAGUES.IT1.teams}), Germany (${WORLD_LEAGUES.DE1.teams}) and France (${WORLD_LEAGUES.FR1.teams}). These leagues are not playable yet.</p>
      <h2 class="lbl">Choose your club</h2>
      <div class="clubs">${order.map((c, i) => `<button class="club ${START.club === c.id ? 'on' : ''}" data-a="pickClub" data-id="${c.id}" style="--k1:${c.c1}">${startBadge(c, 28)}<span class="grow"><b>${c.name}</b><small>${esc(c.realName || c.city)} · ${START.league === 'ECH' ? (i < 4 ? 'Promotion contenders' : i < 10 ? 'Playoff contenders' : i < 18 ? 'Mid-table' : 'Survival') : exp(i)}</small></span><span class="diff d${diff(i)}" title="Difficulty">${['', 'Easy', 'Normal', 'Hard', 'Very hard'][diff(i)]}</span></button>`).join('')}</div>
      <div class="st-go"><p class="muted">${START.league === 'EPL' ? 'First-team identities: October 2026 roster snapshot.' : ['CLA','HAM','OLD'].includes(sel.id) ? 'Existing real-player-inspired first team.' : 'First-team identities: September 2025 roster fallback; missing players generated.'} Fictional names; original game ratings. Reserve prospects are generated.</p><button class="btn pri wide big" data-a="startGame">Take charge of the ${sel.name}</button></div>
    </div>`;
  },
};
const seasonLabelRaw = s => s + '/' + String(s + 1).slice(2);
ACT.pickLeague = ds => { if (!LEAGUES[ds.id]) return; START.league = ds.id; START.club = (ds.id === 'ECH' ? CHAMPIONSHIP_CLUBS : CLUBS)[0].id; render(); };
ACT.pickClub = ds => { START.club = ds.id; render(); };
ACT.pickAvatar = ds => { START.avatar = +ds.v; render(); };
CHG.mgr = v => { START.name = v.trim(); };
ACT.resume = () => { if (loadGame()) go('home'); };
ACT.startGame = async () => {
  const n = document.getElementById('mgr');
  START.name = (n && n.value.trim()) || START.name;
  const speed = titleSpeed();
  newGame(START.club, START.name || 'The Boss', START.avatar);
  G.settings.speed = speed;
  go('home');
  const saved = await saveGameAsync();
  if (!saved) toast('This career could not be saved. Export a backup before leaving.');
};

/* ---------- pre-match ---------- */
function conditionsCard(fx) {
  const us = restDays(G.club, fx), oppId = fx.h === G.club ? fx.a : fx.h, them = restDays(oppId, fx), W = WEATHER[(fx.wx || {}).k] || WEATHER.clear;
  const tired = seniorSquad(G.club).filter(p => !p.inj && G.tactics.slots.includes(p.id) && p.cond < 75);
  const restTxt = d => (d == null ? 'first match' : d + ' days');
  const notes = [W.d];
  if ((fx.t || '15:00') < '13:00') notes.push(KICKOFF_NOTES.early);
  if ((fx.t || '15:00') >= '19:00') notes.push(KICKOFF_NOTES.evening);
  if (fx.tv && !fx.fr) notes.push('Televised: both clubs earn ' + money((fx.comp || leagueOf(fx.h)) === 'ECH' ? 50000 : TV_FEE) + ' extra.');
  return `<div class="card"><h3>Conditions</h3>
    <div class="kv"><div><small>Kick-off</small><b>${fxWhen(fx)}</b></div><div><small>Weather</small><b>${wxLabel(fx.wx)}</b></div>
      <div><small>Your rest</small><b class="${us != null && us <= 3 ? 'warn' : ''}">${restTxt(us)}</b></div><div><small>Their rest</small><b class="${them != null && them <= 3 ? 'warn' : ''}">${restTxt(them)}</b></div></div>
    <ul class="notes">${notes.map(n => `<li>${esc(n)}</li>`).join('')}${tired.length ? `<li class="warn">${tired.length} starter${tired.length > 1 ? 's are' : ' is'} below 75% condition: ${esc(tired.map(pname).join(', '))}. Consider rotating.</li>` : ''}</ul></div>`;
}
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
        <div class="eyebrow">${esc(phaseLabel())} · ${fxWhen(fx)} · ${esc(G.clubs[fx.h].ground)}</div>
        <div class="vs">${badge(fx.h, 46)}<div class="vs-mid"><b>v</b></div>${badge(fx.a, 46)}</div>
        <div class="vs-names"><span>${esc(clubName(fx.h))}</span><span>${esc(clubName(fx.a))}</span></div></section>
      ${conditionsCard(fx)}
      <div class="card"><h3>Opposition report <small>Analyst ${analyst.toFixed(0)}/20</small></h3>
        <div class="kv"><div><small>League position</small><b>${orow ? orow.p ? ordinal(tbl.indexOf(orow) + 1) : '-' : 'Not in this league'}</b></div><div><small>Form</small><b>${orow?.form.length ? formChips(orow.form) : '-'}</b></div>
        <div><small>Likely shape</small><b>${analyst >= 8 ? opp.tac.ip + ' / ' + opp.tac.oop : 'Unknown'}</b></div><div><small>Pressing</small><b>${analyst >= 11 ? INSTRUCTIONS[4].o[opp.tac.press] : 'Unknown'}</b></div></div>
        ${(() => { const l = oppReport(opp.id); return l.length ? `<ul class="notes">${l.map(x => `<li>${esc(x)}</li>`).join('')}</ul>` : ''; })()}
        <h4 class="lbl">Players to watch</h4><div class="list">${theirs.map(p => playerRow(p, '', { sub: POS_NAME[p.pos] })).join('')}</div></div>
      ${assistCard(fx)}
      <div class="card"><h3>Your line-up <small>${T.ip} · ${INSTRUCTIONS[0].o[T.ment]}</small></h3>
        <div class="xi">${T.slots.map((id, i) => { const p = G.players[id]; return `<span class="${p && fam(p, ip[i][0]) < 0.9 ? 'warn' : ''}"><em>${ip[i][0]}</em>${p ? playerLink(p.id, p.ln) : '-'}</span>`; }).join('')}</div>
        ${warn.length ? `<ul class="warns">${warn.slice(0, 4).map(w => `<li>${esc(w)}</li>`).join('')}</ul>` : '<p class="muted">No selection problems.</p>'}
        <button class="btn wide" data-a="go" data-s="tactics">Edit tactics</button></div>
      <div class="card press"><h3>Press conference</h3>${pc.done ? `<p class="muted">Done. ${esc(pc.said)}</p>` : `<p class="q">“${esc(Q.q)}”</p><div class="list">${Q.a.map((a, k) => `<button class="row act" data-a="pressA" data-k="${k}"><span class="grow">${esc(a[0])}</span><span class="chev">›</span></button>`).join('')}</div><button class="link" data-a="pressSkip">Send the assistant instead</button>`}</div>
      <div class="btns col"><button class="btn pri wide big" data-a="kickoff">${liveOn(fx) || (G.live && G.live.fid === fx.id) ? 'Resume match' : 'Kick off'}</button><button class="btn wide ghost" data-a="instant">Instant result</button></div>`;
  },
};
/* ---------- assistant manager ---------- */
function assistCard(fx) {
  const r = assistantRating(), A = UI.assist && UI.assist.fid === fx.id ? UI.assist : null, a = A && A.adv, rec = assistantRecord();
  const who = staffOf('Assistant')[0];
  const head = `<h3>Assistant manager <small>${who ? esc(who.name) + ' · ' : ''}${Math.round(r)}/20</small></h3>`;
  if (!a) return `<div class="card">${head}<p class="muted">${A && A.busy ? esc(A.step || 'Working…') : 'He can play this match through many times with your squad and theirs, then advise on tactics. Better assistants try more options and read the numbers more accurately.'}</p>
    ${A && A.busy ? '' : `<button class="btn wide" data-a="assistAsk">Ask for advice</button>`}${rec ? `<p class="muted">Record: called ${rec.accuracy}% of ${rec.n} results right.${rec.nf ? ` When you followed his tactic advice: ${rec.followed} points a game` : ''}${rec.ni ? `; when you didn't: ${rec.ignored}` : ''}.</p>` : ''}</div>`;
  const bar = (v, c) => `<i style="width:${v}%;background:${c}"></i>`;
  return `<div class="card">${head}
    <div class="predbar">${bar(a.pred.w, 'var(--good)')}${bar(a.pred.d, 'var(--draw)')}${bar(a.pred.l, 'var(--bad)')}</div>
    <div class="predlbl"><span class="good">Win ${a.pred.w}%</span><span>Draw ${a.pred.d}%</span><span class="bad">Loss ${a.pred.l}%</span></div>
    <p>${esc(a.text)}${a.src === 'ai' ? ' <em class="tag">AI</em>' : ''}</p>
    <ul class="notes">${a.facts.map(f => `<li>${esc(f)}</li>`).join('')}</ul>
    <p class="muted">${a.n * 2 + (a.tried.length - 1) * a.n} run-throughs; tactics tried: ${a.tried.map(styleName).join(', ')}.</p>
    ${a.rec !== a.cur ? `<div class="btns"><button class="btn pri" data-a="assistApply">Switch to ${esc(styleName(a.rec))}</button><button class="btn" data-a="assistAsk">Ask again</button></div>` : `<button class="btn wide" data-a="assistAsk">Ask again</button>`}</div>`;
}
ACT.assistAsk = async () => {
  const uf = userFixture(), fx = uf && !played(uf) ? uf : nextUserFixture();
  if (!fx || (UI.assist && UI.assist.busy)) return;
  UI.assist = { fid: fx.id, busy: true, step: 'Studying the opposition…' };
  render();
  try {
    const adv = await assistantAdvice(fx, s => { UI.assist.step = s; if (['prematch', 'tactics'].includes(UI.s)) render(); });
    UI.assist = { fid: fx.id, busy: false, adv };
    logAdvice(adv);
    if (['prematch', 'tactics'].includes(UI.s)) render();
    await assistantAiWords(adv);
    saveGame();
  } catch (e) { UI.assist = null; toast('The assistant could not finish: ' + (e.message || e)); }
  if (['prematch', 'tactics'].includes(UI.s)) render();
};
ACT.assistApply = () => {
  const a = UI.assist && UI.assist.adv, T = G.tactics;
  if (!a || !STYLES[a.rec]) return;
  const shape = T.ip + '/' + T.oop;
  applyStyle(T, a.rec);
  if (shape !== T.ip + '/' + T.oop) { G.training.fam = Math.max(20, G.training.fam - 15); const pk = autoPick(G.club, T.ip); T.slots = pk.xi; T.bench = pk.bench; T.cap = T.pk = T.fk = T.ck = null; T.pi = {}; }
  ensureUserLineup(); autoSetPieces();
  a.cur = a.rec;
  toast(`Switched to ${styleName(a.rec)}. Check the line-up before kick-off.`);
  render();
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
ACT.instant = async () => {
  const game = G;
  const fx = userFixture();
  if (!fx || played(fx)) return;
  if (liveOn(fx) || liveFromSave(fx)) { go('match'); return liveInstant(); }
  await playUserInstantAsync(fx);
  if (G !== game) return;
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
        <div class="sb-t"><button class="iconbtn" data-a="back" aria-label="Back">${ICON.back}</button>${badge(H.cid, 22)}<b>${esc(clubName(H.cid))}</b></div>
        <div class="sb-m"><b id="sbScore">0 - 0</b><span id="sbClock">0'</span></div>
        <div class="sb-t r"><b>${esc(clubName(W.cid))}</b>${badge(W.cid, 22)}</div>
      </div>
      <div class="poss"><span class="pbar"><i id="sbPoss" style="width:50%"></i></span><small id="sbPossTxt"></small></div>
      ${(() => { const f = G.fixtures.find(x => x.id === LIVE.fid); return f && f.wx ? `<div class="mcond">${fxWhen(f)} · ${wxLabel(f.wx)}${f.tv ? ' · TV' : ''}</div>` : ''; })()}
      <div class="pitchwrap"><canvas id="pitch" aria-label="Live match view"></canvas></div>
      <section class="live-watch" aria-label="Your players' condition and fatigue"><div class="live-watch-heading"><b>On pitch</b><span>Condition · fatigue <em class="bad">INJ = injured</em></span></div><div id="liveWatchPlayers" class="live-watch-players"></div></section>
      <ol id="feed" class="feed" aria-live="polite"></ol>
      <div id="ftBar" class="ftbar" hidden><button class="btn pri wide" data-a="toPost">Match report</button></div>
      <div class="mctl">
        <button id="btnPause" data-a="pause">Pause</button>
        <button id="btnSpeed" data-a="speedCycle">2x</button>
        <button id="btnHl" data-a="hlCycle">Extended</button>
        <button id="btnCam" data-a="camCycle">Follow</button>
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
ACT.hlCycle = () => { G.settings.hl = { key: 'ext', ext: 'full', full: 'key' }[G.settings.hl || 'ext']; if (LIVE && LIVE.mq) LIVE.mq.segs = segments(LIVE.M.marks || [], LIVE.mq.t0, Math.min(0, LIVE.mq.p), LIVE.M); updateBoard(LIVE); toast('Highlights: ' + HL[G.settings.hl]); };
ACT.camCycle = () => { G.settings.cam = (G.settings.cam || 'follow') === 'follow' ? 'full' : 'follow'; updateBoard(LIVE); };
ACT.speedCycle = () => { G.settings.speed = { 1: 2, 2: 4, 4: 1 }[G.settings.speed] || 2; updateBoard(LIVE); };
ACT.instant2 = () => { if (LIVE && !LIVE.done) return liveInstant(); };
ACT.toPost = () => { if (LIVE.finishing) return; const fid = LIVE.fid; go('post', { fid }); LIVE = null; };
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
function reopenLive(kind) { const o = UI.sheetOpts; updateLiveFitness(LIVE); openLiveSheet(kind); UI.sheetOpts = o; }
ACT.subOut = ds => { LIVE.subSel = +ds.id; reopenLive('subs'); };
ACT.subIn = ds => {
  const L = LIVE, S = liveSide();
  const e = makeSub(L.M, S, L.subSel, +ds.id);
  if (e) pushFeed(L, 'info', commLine(L, e), L.bottom); else toast('No substitutions left.');
  L.subSel = null;
  updateBoard(L);
  reopenLive('subs');
};
// The tactics page: swap two players on the pitch, or set a player's role.
ACT.liveTacticsView = ds => { if (!['xi', 'pitch'].includes(ds.v)) return; LIVE.tacticsView = ds.v; reopenLive('tactics'); };
ACT.liveSwapMode = () => { const L = LIVE; L.swapMode = !L.swapMode; L.swapFrom = null; L.roleSlot = null; reopenLive('tactics'); };
ACT.liveTok = ds => {
  const L = LIVE, S = liveSide(), i = +ds.i;
  if (!Number.isInteger(i) || i < 0 || i >= S.on.length) return;
  if (!S.on[i] && !L.swapMode) return ACT.liveGap({ i });
  if (!L.swapMode) { L.roleSlot = L.roleSlot === i ? null : i; return reopenLive('tactics'); }
  if (L.swapFrom == null) L.swapFrom = i;
  else {
    const from = L.swapFrom;
    if (!S.on[from] || !S.on[i]) {
      const gap = S.on[from] ? i : from, id = S.on[from] || S.on[i];
      if (id && moveIntoGap(L.M, S, id, gap)) pushFeed(L, 'tac', `${pname(G.players[id])} moves into the gap at ${FORMATIONS[S.ip][gap][0]}.`, L.bottom);
      else toast('Choose a player and an empty position.');
    }
    else if (swapInMatch(L.M, S, from, i)) pushFeed(L, 'tac', `${pname(G.players[S.on[from]])} and ${pname(G.players[S.on[i]])} change places.`, L.bottom);
    else toast('Keepers swap only with keepers.');
    L.swapFrom = null;
  }
  reopenLive('tactics');
};
// A role change takes effect at once: the shape and behaviour caches are cleared, so the new role drives the next moves.
ACT.liveRole = ds => {
  const L = LIVE, S = liveSide(), i = +ds.i, k = +ds.k, pl = FORMATIONS[S.ip][i][0];
  if (S.roles[i] === k) return;
  S.roles[i] = k; S._shape = null; S._bh = null; S._attC = null; L.M.dirty = true;
  pushFeed(L, 'tac', `${pname(G.players[S.on[i]])} takes a new role: ${ROLES[pl][k].n}.`, L.bottom);
  reopenLive('tactics');
};
// A man down: one of the side moves into the gap; the spot he leaves is the new gap, so the sheet stays open.
ACT.liveGap = ds => {
  const L = LIVE, S = liveSide(), i = ds.i == null ? S.on.indexOf(null) : +ds.i;
  if (!Number.isInteger(i) || i < 0 || i >= S.on.length || S.on[i]) return toast('Choose an empty position.');
  L.gapSlot = i; L.swapFrom = null; L.roleSlot = null;
  reopenLive('gap');
};
ACT.gapMove = ds => {
  const L = LIVE, S = liveSide(), gap = ds.i == null ? (L.gapSlot ?? S.on.indexOf(null)) : +ds.i;
  if (gap < 0 || !moveIntoGap(L.M, S, +ds.id, gap)) { toast('Choose a player to move into the gap.'); return; }
  pushFeed(L, 'tac', `${pname(G.players[+ds.id])} moves into the gap at ${FORMATIONS[S.ip][gap][0]}.`, L.bottom);
  L.gapSlot = S.on.indexOf(null); reopenLive('gap');
};
ACT.liveStyle = ds => { const S = liveSide(); Object.assign(S, STYLES[ds.v].ins); LIVE.M.dirty = true; pushFeed(LIVE, 'tac', `${G.manager} switches to ${STYLES[ds.v].n.toLowerCase()}.`, LIVE.bottom); reopenLive('tactics'); };
ACT.liveSubFor = ds => { const L = LIVE; L.subSel = +ds.id; const wasPaused = L.paused; L.paused = true; updateBoard(L); openLiveSheet('subs'); UI.sheetOpts = { onClose: () => { L.subSel = null; if (!wasPaused && !(L.overlay && L.overlay.stay)) L.paused = false; updateBoard(L); } }; };
ACT.livePl = ds => { LIVE.selId = +ds.id; const si = LIVE.M.sides.findIndex(X => X.on.includes(+ds.id)); LIVE.sel = si >= 0 ? [si, LIVE.M.sides[si].on.indexOf(+ds.id)] : null; reopenLive('pl'); };
ACT.livePi = ds => { LIVE.piSlot = +ds.i; reopenLive('pi'); };
ACT.livePiSet = ds => {
  const S = liveSide(), i = LIVE.piSlot, x = S.pi[i] || (S.pi[i] = {});
  x[ds.k] = +ds.v; if (+ds.v === 1) delete x[ds.k];
  LIVE.M.dirty = true;
  const ins = PLAYER_INS.find(q => q.k === ds.k);
  pushFeed(LIVE, 'tac', `${G.manager} tells ${pname(G.players[S.on[i]])}: ${ins.o[+ds.v].toLowerCase()}.`, LIVE.bottom);
  reopenLive('pi');
};
ACT.liveIns = ds => { const S = liveSide(); S[ds.k] = +ds.v; LIVE.M.dirty = true; reopenLive('tactics'); };
// Set pieces and captain for this match: the taker is chosen by player id; '' means the automatic choice.
CHG.liveSp = (v, ds) => { const S = liveSide(); S[ds.k] = v === '' ? null : +v; LIVE.M.dirty = true; };
CHG.liveShape = (v, ds, el) => {
  const S = liveSide(), k = el.id === 'lt-ip' ? 'ip' : 'oop';
  S[k] = v;
  if (k === 'ip') S.roles = Array(11).fill(0);
  S.map = shapeMap(S.ip, S.oop);
  LIVE.M.dirty = true;
  pushFeed(LIVE, 'info', `${clubName(S.cid)} switch to ${S.ip} with the ball, ${S.oop} without it.`, LIVE.bottom);
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
      stats = `<div class="card">${row('Possession', Math.round(h.pos / tot * 100) + '%', Math.round(a.pos / tot * 100) + '%')}${row('Shots', h.sh, a.sh)}${row('On target', h.sot, a.sot)}${row('Expected goals', h.xg.toFixed(2), a.xg.toFixed(2))}${row('Pass accuracy', h.pa ? Math.round(h.pc / h.pa * 100) + '%' : '-', a.pa ? Math.round(a.pc / a.pa * 100) + '%' : '-')}${row('Corners', h.co, a.co)}${row('Offsides', h.off || 0, a.off || 0)}${row('Fouls', h.fo, a.fo)}${row('Cards', h.yc + '/' + h.rc, a.yc + '/' + a.rc)}</div>`;
      const us = p.side != null ? +p.side : fx.h === G.club ? 0 : 1;
      const PS = fx.pstats ? new Map(fx.pstats[us].map(r => [r[0], r])) : null;
      const pst = id => { const r = PS && PS.get(id); return r ? `<small>${r[2] ? Math.round(r[1] / r[2] * 100) + '% of ' + r[2] + ' passes' : 'no passes'}${r[3] ? ' · ' + r[3] + ' key' : ''}${r[4] ? ' · ' + r[4] + ' dribbles' : ''}${r[5] + r[6] ? ' · ' + (r[5] + r[6]) + ' tackles/int' : ''}${r[7] ? ' · ' + r[7] + ' aerials' : ''}${r[8] ? ' · ' + r[9] + '/' + r[8] + ' shots on target' : ''}</small>` : ''; };
      rats = `<div class="sec-h"><h2>Player ratings</h2></div><div class="seg">${[fx.h, fx.a].map((cid, i) => `<button class="${us === i ? 'on' : ''}" data-a="reportSide" data-fid="${fx.id}" data-side="${i}">${esc(clubName(cid))}</button>`).join('')}</div><div class="list">${fx.ratings[us].filter(([id]) => G.players[id]).sort((x, y) => y[1] - x[1]).map(([id, r]) => `<button class="row act" data-a="player" data-id="${id}"><span class="pos">${G.players[id].pos}</span><span class="grow"><b>${esc(pname(G.players[id]))}${fx.motm === id ? ' <em class="tag good">Player of the match</em>' : ''}</b>${pst(id)}</span><span class="rt ${r >= 7.5 ? 'good' : r < 6 ? 'bad' : ''}">${r.toFixed(1)}</span></button>`).join('')}</div>`;
    }
    const others = G.fixtures.filter(f => f.r === fx.r && f.id !== fx.id && leagueFixture(f, fx.comp || leagueOf(fx.h))).sort(fxSort);
    return `<section class="hero rep" style="--k1:${G.clubs[fx.h].c1};--k2:${G.clubs[fx.a].c1}">
        <div class="eyebrow">Full time · ${fxWhen(fx)}${fx.wx ? ' · ' + wxLabel(fx.wx) : ''}${fx.att ? ' · Att ' + fx.att.toLocaleString('en-GB') : ''}</div>
        <div class="vs">${badge(fx.h, 42)}<div class="vs-mid score"><b>${fx.hg} - ${fx.ag}</b>${fx.penalties ? `<small>${fx.penalties[0]}–${fx.penalties[1]} on penalties</small>` : fx.extra ? '<small>After extra time</small>' : ''}</div>${badge(fx.a, 42)}</div>
        <div class="vs-names"><span>${esc(clubName(fx.h))}</span><span>${esc(clubName(fx.a))}</span></div>
        <div class="scorers"><span>${sc(0)}</span><span>${sc(1)}</span></div></section>
      ${stats}${(() => { const a = (G.analysis || []).find(x => x.fid === fx.id); return a ? `<div class="card"><h3>Analyst's view <small>${a.r}/20</small></h3><ul class="notes">${a.lines.map(l => `<li>${esc(l)}</li>`).join('')}</ul>${a.patterns.length ? `<p class="note">Keeps happening: ${a.patterns.map(x => { const [t, n] = x.split(':'); return `${PATTERN_TEXT[t] || t} (${n} recent matches)`; }).join('; ')}.</p>` : ''}${a.suggest ? `<p class="muted">Suggestion: ${esc(a.suggest.text)}</p>` : ''}</div>` : ''; })()}${rats}
      <div class="sec-h"><h2>Around the league</h2></div>
      <div class="list">${others.map(f => `<div class="row fxr"><span class="grow r">${esc(clubName(f.h))}</span>${badge(f.h, 18)}<button class="res" data-a="fixturePage" data-id="${f.id}" aria-label="${played(f) ? 'Match report' : 'Match preview'}">${played(f) ? f.hg + '-' + f.ag : 'v'}</button>${badge(f.a, 18)}<span class="grow">${esc(clubName(f.a))}</span></div>`).join('')}</div>
      <button class="btn pri wide" data-a="go" data-s="home">Back to the office</button>`;
  },
};

ACT.reportSide = ds => go('post', { fid: +ds.fid, side: +ds.side });

/* ---------- season review ---------- */
SCREENS.review = {
  full: true,
  render() {
    const r = G.seasonReview;
    if (!r) return '<button class="btn" data-a="go" data-s="home">Continue</button>';
    const aw = (t, a, unit) => (a ? `<div class="row"><span class="grow"><b>${t}</b><small>${esc(a.name)} · ${esc(clubName(a.club))}</small></span><span class="stat"><b>${unit === 'g' ? a.v : a.r}</b><small>${unit === 'g' ? 'goals' : 'avg'}</small></span></div>` : '');
    return `<div class="start review">
      <header class="st-hero">${avatarImg(G.avatar, 'av-hero')}<div class="eyebrow">Season review · ${r.season}</div><h1 class="logo">${ordinal(r.pos)}<br><small>${r.pts} points</small></h1><p>${esc(r.verdict)}</p>${r.divisionChanges ? `<p>${r.divisionChanges.promoted.includes(G.club) ? 'Promoted to the Premier League.' : r.divisionChanges.relegated.includes(G.club) ? 'Relegated to the Championship: first team and reserves are limited to 36 players.' : ''}</p>${r.divisionChanges.released.length ? `<p>Released to meet the 36-player limit: ${esc(r.divisionChanges.released.join(', '))}.</p>` : ''}` : ''}</header>
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
      <header class="st-hero">${avatarImg(G.avatar, 'av-hero sad')}<div class="eyebrow">Statement from the board</div><h1 class="logo">Sacked</h1><p>${esc(o.reason)}</p></header>
      <h2 class="lbl">Job offers</h2>
      <div class="clubs">${o.offers.map(id => `<button class="club" data-a="takeJob" data-id="${id}" style="--k1:${G.clubs[id].c1}">${badge(id, 28)}<span class="grow"><b>${esc(clubName(id))}</b><small>${esc(expectationFor(id).text)}</small></span><span class="chev">›</span></button>`).join('')}</div>
      <button class="btn wide ghost" data-a="newGame2">Start a new career</button></div>`;
  },
};
ACT.takeJob = ds => { takeJob(ds.id); UI.tab = {}; go('home'); };
ACT.newGame2 = async () => { await deleteSave(); G = null; LIVE = null; go('start'); };
