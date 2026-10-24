'use strict';
/* ===== world-notifications.js =====
   One-line, phone-style alerts for notable events outside the user's club.
   The News screen remains the full, persistent record; alerts are only a quick heads-up. */

const WORLD_ALERT_MS = 4600;
let WORLD_ALERT_TIMER = 0;
let WORLD_ALERT_EXIT_TIMER = 0;

function worldAlertShort(text) {
  const line = String(text || '').replace(/\s+/g, ' ').trim();
  return line.length > 150 ? line.slice(0, 147).trimEnd() + '...' : line;
}

function worldAlertQueue() {
  if (!G) return [];
  if (!Array.isArray(G.worldAlerts)) G.worldAlerts = [];
  return G.worldAlerts;
}

function worldAlertMarkup() {
  const item = worldAlertQueue()[0];
  if (!item) return '<button id="world-alert" class="world-alert" type="button" data-a="worldAlertDismiss" aria-label="Dismiss notification" hidden></button>';
  if (!WORLD_ALERT_TIMER && !WORLD_ALERT_EXIT_TIMER) WORLD_ALERT_TIMER = setTimeout(worldAlertAdvance, WORLD_ALERT_MS);
  const split = item.text.indexOf(' · ');
  const label = split < 0 ? 'WORLD' : item.text.slice(0, split);
  const detail = split < 0 ? item.text : item.text.slice(split + 3);
  return `<button id="world-alert" class="world-alert world-alert-in" type="button" data-a="worldAlertDismiss" aria-label="${esc(item.text)}"><b>${esc(label)}</b><span>${esc(detail)}</span><i aria-hidden="true">×</i></button>`;
}

function worldAlertSync() {
  const el = document.getElementById('world-alert');
  const item = worldAlertQueue()[0];
  if (!el) return;
  if (!item) { el.hidden = true; el.classList.remove('world-alert-in', 'world-alert-out'); return; }
  const split = item.text.indexOf(' · '), label = split < 0 ? 'WORLD' : item.text.slice(0, split);
  const detail = split < 0 ? item.text : item.text.slice(split + 3);
  el.innerHTML = `<b>${esc(label)}</b><span>${esc(detail)}</span><i aria-hidden="true">×</i>`;
  el.setAttribute('aria-label', item.text);
  el.hidden = false;
  el.classList.remove('world-alert-out');
  if (!el.classList.contains('world-alert-in')) {
    requestAnimationFrame(() => el.classList.add('world-alert-in'));
  }
  if (!WORLD_ALERT_TIMER) WORLD_ALERT_TIMER = setTimeout(worldAlertAdvance, WORLD_ALERT_MS);
}

function worldAlertAdvance() {
  WORLD_ALERT_TIMER = 0;
  const el = document.getElementById('world-alert');
  if (el && !el.hidden) {
    el.classList.remove('world-alert-in');
    el.classList.add('world-alert-out');
  }
  clearTimeout(WORLD_ALERT_EXIT_TIMER);
  WORLD_ALERT_EXIT_TIMER = setTimeout(() => {
    WORLD_ALERT_EXIT_TIMER = 0;
    worldAlertQueue().shift();
    worldAlertSync();
  }, 220);
}

function dismissWorldAlert() {
  if (WORLD_ALERT_EXIT_TIMER) return;
  clearTimeout(WORLD_ALERT_TIMER);
  WORLD_ALERT_TIMER = 0;
  worldAlertAdvance();
}
ACT.worldAlertDismiss = dismissWorldAlert;

function queueWorldAlert(text) {
  if (!G || !text) return;
  const line = worldAlertShort(text), queue = worldAlertQueue();
  if (queue.some(item => item.text === line)) return;
  queue.push({ text: line, date: today().getTime() });
  // A busy simulated day can create many events; retain a short, recent queue.
  if (queue.length > 6) queue.splice(0, queue.length - 6);
  worldAlertSync();
}

function worldAlertTransfer(tx) {
  if (!tx || tx.from === G.club || tx.to === G.club) return;
  const post = (G.social || []).find(p => p.pid === tx.pid && p.kind === 'done');
  if (post) {
    return queueWorldAlert(`SOCIAL · ${clubName(tx.to)}: “${tx.name} joins from ${clubName(tx.from)}${tx.fee ? ' for ' + money(tx.fee) : ''}.”`);
  }
  queueWorldAlert(`TRANSFER · ${tx.name} joins ${clubName(tx.to)} from ${clubName(tx.from)}${tx.fee ? ' for ' + money(tx.fee) : ' on a free'}.`);
}

function worldAlertForNews(news) {
  if (!G || !news || news.cat !== 'league' && news.cat !== 'transfer') return;
  if (news.cat === 'league' && /^Manager wanted: /.test(news.title)) {
    const name = news.title.slice('Manager wanted: '.length);
    const club = Object.values(G.clubs).find(c => c.name === name);
    if (!club || club.id === G.club) return;
    const reason = news.body.split('. ').slice(-1)[0].replace(/\.$/, '');
    return queueWorldAlert(`SACKED · ${club.name} dismiss ${club.mgr}; ${reason}.`);
  }
  if (news.cat === 'league' && / appoint a manager$/.test(news.title)) {
    const club = Object.values(G.clubs).find(c => news.title.startsWith(c.name + ' appoint a manager'));
    if (!club || club.id === G.club) return;
    return queueWorldAlert(`APPOINTED · ${club.name} name ${club.mgr} as manager.`);
  }
  if (news.cat !== 'transfer' || !/ joins | signs for | leaves for /.test(news.title)) return;
  const tx = (G.tHist || []).find(t => t.date === today().getTime() && news.title.includes(t.name));
  if (tx) {
    return worldAlertTransfer(tx);
  }
  const player = Object.values(G.players).find(p => news.title.includes(fullName(p)));
  if (!player || player.club === G.club) return;
  const host = clubName(player.club);
  if (/on loan/.test(news.title)) queueWorldAlert(`LOAN · ${fullName(player)} joins ${host} on loan.`);
}

function worldAlertFromPost(post) {
  if (!G || !post || !post.clubs?.length || post.clubs.includes(G.club)) return;
  const player = post.pid && G.players[post.pid];
  if (!player) return;
  const other = post.clubs.find(cid => cid !== player.club && G.clubs[cid]);
  if (!other) return;
  if (post.kind === 'rumour') {
    queueWorldAlert(`RUMOUR · ${clubName(other)} linked with ${fullName(player)}...`);
  } else if (post.kind === 'done') {
    const tx = (G.tHist || []).find(t => t.pid === player.id && t.date === today().getTime());
    if (tx) return worldAlertTransfer(tx);
    queueWorldAlert(`SOCIAL · ${clubName(other)}: “${fullName(player)} joins the club.”`);
  }
}

function worldAlertForResults(fixtures) {
  if (!G || !Array.isArray(fixtures)) return;
  const league = userClub()?.league;
  const candidates = fixtures.filter(f => played(f) && f.h !== G.club && f.a !== G.club &&
    G.clubs[f.h]?.league === league && G.clubs[f.a]?.league === league && leagueFixture(f));
  if (!candidates.length) return;
  // One result per simulated slate avoids flooding the bar while still naming a scorer.
  candidates.sort((a, b) => {
    const score = f => Math.abs(f.hg - f.ag) * 2 + f.hg + f.ag + (f.goals?.length ? 1 : 0);
    return score(b) - score(a) || String(a.id).localeCompare(String(b.id));
  });
  const fx = candidates[0], scorers = (fx.goals || []).map(g => ({ min: g[1], player: G.players[g[2]] })).filter(g => g.player);
  const scorer = scorers[scorers.length - 1];
  const line = `RESULT · ${clubName(fx.h)} ${fx.hg}–${fx.ag} ${clubName(fx.a)}` +
    (scorer ? ` — ${fullName(scorer.player)} scored ${scorer.min}'.` : '.');
  queueWorldAlert(line);
}
