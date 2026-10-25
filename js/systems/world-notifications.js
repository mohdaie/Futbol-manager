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

function worldAlertContent(item) {
  const split=item.text.indexOf(' · '),label=split<0?'WORLD':item.text.slice(0,split),detail=split<0?item.text:item.text.slice(split+3);
  return `<button class="world-alert-story" type="button" data-a="worldAlertOpen" aria-label="${esc(item.text+' Open related source.')}"><b>${esc(label)}</b><span>${esc(detail)}</span></button><button class="world-alert-close" type="button" data-a="worldAlertDismiss" aria-label="Dismiss notification">×</button>`;
}
function worldAlertMarkup() {
  const item=worldAlertQueue()[0];
  if(!item)return '<div id="world-alert" class="world-alert" hidden></div>';
  if(!WORLD_ALERT_TIMER&&!WORLD_ALERT_EXIT_TIMER)WORLD_ALERT_TIMER=setTimeout(worldAlertAdvance,WORLD_ALERT_MS);
  return `<div id="world-alert" class="world-alert world-alert-in">${worldAlertContent(item)}</div>`;
}

function worldAlertSync() {
  const el = document.getElementById('world-alert');
  const item = worldAlertQueue()[0];
  if (!el) return;
  if (!item) { el.hidden = true; el.classList.remove('world-alert-in', 'world-alert-out'); return; }
  el.innerHTML = worldAlertContent(item);
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
// IDs keep the notification tied to the event even after the player moves or the feed rolls over.
// Recover destinations for notifications already queued by older releases.
function worldAlertSource(item) {
  if(item.postId || item.newsId || item.fixtureId || item.playerId || item.clubId || item.dealId)return item;
  const text=item.text||'',kind=text.split(' · ')[0];
  if(kind==='RESULT') {
    const fx=G.fixtures.find(f=>played(f)&&text.includes(`${clubName(f.h)} ${f.hg}–${f.ag} ${clubName(f.a)}`));
    if(fx)return {...item,fixtureId:fx.id,clubId:fx.h};
  }
  if(kind==='SACKED'||kind==='APPOINTED') {
    const club=Object.values(G.clubs).find(c=>text.startsWith(kind+' · '+c.name+' '));
    if(club){const news=G.news.find(n=>n.date===item.date&&n.title===(kind==='SACKED'?'Manager wanted: '+club.name:club.name+' appoint a manager'));return {...item,newsId:news?.id,clubId:club.id};}
  }
  const tx=(G.tHist||[]).find(t=>t.date===item.date&&text.includes(t.name)&&text.includes(clubName(t.to)));
  if(tx)return {...item,playerId:tx.pid,clubId:tx.to};
  const post=[...(G.social||[]),...(G.rumours||[])].find(p=>p.pid&&G.players[p.pid]&&text.includes(fullName(G.players[p.pid]))&&p.clubs?.some(id=>text.includes(clubName(id))));
  if(post)return {...item,postId:post.id,playerId:post.pid,clubId:post.clubs?.[0]};
  const player=Object.values(G.players).find(p=>text.includes(fullName(p)));
  return player?{...item,playerId:player.id,clubId:player.club}:item;
}
ACT.worldAlertOpen = () => {
  const head=worldAlertQueue()[0];if(!head)return;
  const item=worldAlertSource(head);
  if(typeof DAYRUN!=='undefined'){DAYRUN.on=false;clearTimeout(DAYRUN.timer);DAYRUN.timer=0;closeDayRun();}
  clearTimeout(WORLD_ALERT_TIMER);clearTimeout(WORLD_ALERT_EXIT_TIMER);WORLD_ALERT_TIMER=WORLD_ALERT_EXIT_TIMER=0;
  worldAlertQueue().shift();worldAlertSync();
  if(item.fixtureId&&G.fixtures.some(f=>f.id===item.fixtureId))return ACT.fixturePage({id:String(item.fixtureId)});
  if(item.newsId&&G.news.some(n=>n.id===item.newsId)){UI.tab.nv='news';UI.f.news='all';go('news');return ACT.news({id:String(item.newsId)});}
  const post=(G.social||[]).find(p=>p.id===item.postId)||(G.rumours||[]).find(p=>p.id===item.postId);
  if(post){if(post.kind==='rumour'){UI.tab.tr='rumours';go('transfers');}else{UI.tab.nv='social';UI.tab.sf2='all';go('news');}return threadSheet(post.id);}
  if(item.dealId&&G.deals.some(d=>d.id===item.dealId)){UI.tab.tr='deals';go('transfers');return dealSheet(item.dealId);}
  if(item.playerId&&G.players[item.playerId])return ACT.player({id:String(item.playerId)});
  if(item.clubId&&G.clubs[item.clubId])return ACT.clubPage({id:item.clubId});
  toast('The original source is no longer available.');
};

function queueWorldAlert(text, source = {}) {
  if (!G || !text) return;
  const line = worldAlertShort(text), queue = worldAlertQueue();
  const existing=queue.find(item=>item.text===line);
  if(existing){Object.assign(existing,source);return;}
  queue.push({ text: line, date: today().getTime(), ...source });
  // A busy simulated day can create many events; retain a short, recent queue.
  if (queue.length > 6) queue.splice(0, queue.length - 6);
  worldAlertSync();
}

function worldAlertTransfer(tx, source = {}) {
  if (!tx || tx.from === G.club || tx.to === G.club) return;
  const post = (G.social || []).find(p => p.pid === tx.pid && p.kind === 'done' && Math.abs(p.date-tx.date)<864e5);
  const target={postId:post?.id,playerId:tx.pid,clubId:tx.to,...source};
  if (post) {
    return queueWorldAlert(`SOCIAL · ${clubName(tx.to)}: “${tx.name} joins from ${clubName(tx.from)}${tx.fee ? ' for ' + money(tx.fee) : ''}.”`,target);
  }
  queueWorldAlert(`TRANSFER · ${tx.name} joins ${clubName(tx.to)} from ${clubName(tx.from)}${tx.fee ? ' for ' + money(tx.fee) : ' on a free'}.`,target);
}

function worldAlertForNews(news) {
  if (!G || !news || news.cat !== 'league' && news.cat !== 'transfer') return;
  if (news.cat === 'league' && /^Manager wanted: /.test(news.title)) {
    const name = news.title.slice('Manager wanted: '.length);
    const club = Object.values(G.clubs).find(c => c.name === name);
    if (!club || club.id === G.club) return;
    const reason = news.body.split('. ').slice(-1)[0].replace(/\.$/, '');
    return queueWorldAlert(`SACKED · ${club.name} dismiss ${club.mgr}; ${reason}.`,{newsId:news.id,clubId:club.id});
  }
  if (news.cat === 'league' && / appoint a manager$/.test(news.title)) {
    const club = Object.values(G.clubs).find(c => news.title.startsWith(c.name + ' appoint a manager'));
    if (!club || club.id === G.club) return;
    return queueWorldAlert(`APPOINTED · ${club.name} name ${club.mgr} as manager.`,{newsId:news.id,clubId:club.id});
  }
  if (news.cat !== 'transfer' || !/ joins | signs for | leaves for /.test(news.title)) return;
  const tx = (G.tHist || []).find(t => t.date === today().getTime() && news.title.includes(t.name));
  if (tx) {
    return worldAlertTransfer(tx,{newsId:news.id});
  }
  const player = Object.values(G.players).find(p => news.title.includes(fullName(p)));
  if (!player || player.club === G.club) return;
  const host = clubName(player.club);
  if (/on loan/.test(news.title)) queueWorldAlert(`LOAN · ${fullName(player)} joins ${host} on loan.`,{newsId:news.id,playerId:player.id,clubId:player.club});
}

function worldAlertFromPost(post) {
  if (!G || !post || !post.clubs?.length || post.clubs.includes(G.club)) return;
  const player = post.pid && G.players[post.pid];
  if (!player) return;
  const other = post.kind==='done' ? post.clubs[0] : post.clubs.find(cid => cid !== player.club && G.clubs[cid]);
  if (!other) return;
  if (post.kind === 'rumour') {
    queueWorldAlert(`RUMOUR · ${clubName(other)} linked with ${fullName(player)}...`, { postId: post.id, playerId:player.id, clubId:other });
  } else if (post.kind === 'done') {
    const tx = (G.tHist || []).find(t => t.pid === player.id && t.date === today().getTime());
    if (tx) return worldAlertTransfer(tx,{postId:post.id});
    queueWorldAlert(`SOCIAL · ${clubName(other)}: “${fullName(player)} joins the club.”`,{postId:post.id,playerId:player.id,clubId:other});
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
  queueWorldAlert(line,{fixtureId:fx.id,clubId:fx.h});
}
