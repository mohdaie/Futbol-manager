'use strict';
/* ===== screens-social.js =====
   News has three views: News, Transfer centre (Press Officer statements, here-we-go, talks, rumours,
   done and collapsed deals) and Social (a Threads-style feed). */

const NEWS_VIEWS = [['news', 'News'], ['tc', 'Transfer centre'], ['social', 'Social']];
const ago = t => { const h = Math.max(0, Math.round((today().getTime() + 12 * 3600e3 - t) / 3600e3)); return h < 24 ? h + 'h' : Math.round(h / 24) + 'd'; };
const fmtK = n => (n >= 1e6 ? (n / 1e6).toFixed(1) + 'M' : n >= 1e3 ? (n / 1e3).toFixed(n >= 1e4 ? 0 : 1) + 'K' : String(n));
const ACC_COL = { journalist: '#2DE2EE', tabloid: '#F2C14E', rumour: '#B9A3FF', influencer: '#FF8AD8', fan: '#7DF59E', club: '#FFFFFF' };
function accAvatar(a) {
  const c = a.cid && G.clubs[a.cid];
  if (c && a.kind === 'club') return `<span class="sav">${badge(a.cid, 28)}</span>`;
  const ini = a.name.split(' ').map(w => w[0]).join('').slice(0, 2);
  return `<span class="sav" style="--sc:${c ? c.c1 : ACC_COL[a.kind] || '#999'}">${esc(ini)}</span>`;
}
function postHtml(p, full) {
  const a = mediaAcc(p.acc), tick = a.tier === 1 && a.kind !== 'fan' ? '<i class="tick" title="Verified">✓</i>' : '';
  const tag = p.kind === 'here' ? '<em class="tag good">Here we go</em>' : p.kind === 'rumour' ? '<em class="tag">Rumour</em>' : p.kind === 'off' ? '<em class="tag bad">Collapsed</em>' : '';
  return `<article class="spost ${full ? 'full' : ''}" ${full ? '' : `data-a="thread" data-id="${p.id}"`}>
    ${accAvatar(a)}<div class="sbody"><header><b>${esc(a.name)}</b>${tick}<span>@${esc(a.handle)} · ${ago(p.date)}</span></header>
    <p>${esc(p.txt)}</p>${tag ? `<div>${tag}</div>` : ''}
    <footer><span>💬 ${p.replies.length}</span><span>↻ ${fmtK(p.reposts)}</span><span>♥ ${fmtK(p.likes)}</span>${a.kind !== 'club' && a.kind !== 'fan' ? `<span class="rel" title="How often this account is right">${Math.round(a.rel * 100)}% reliable</span>` : ''}</footer></div></article>`;
}
function threadSheet(id) {
  const p = G.social.find(x => x.id === id);
  if (!p) return;
  sheet(`${postHtml(p, true)}<div class="sreplies">${p.replies.map(r => postHtml({ ...r, id: 0, date: p.date + 1800e3, replies: [], reposts: Math.round(r.likes / 9), kind: 'reply' }, true)).join('') || '<p class="muted">No replies yet.</p>'}</div>
    <div class="btns">${p.pid && G.players[p.pid] ? `<button class="btn" data-a="player" data-id="${p.pid}">Player profile</button>` : ''}${p.deal && G.deals.some(d => d.id === p.deal && d.dir !== 'ai') ? `<button class="btn" data-a="deal" data-id="${p.deal}">Open the deal</button>` : ''}</div>`,
  { key: 'thread:' + id, restore: () => threadSheet(id), valid: () => G?.social?.some(x => x.id === id) });
}
ACT.thread = ds => threadSheet(+ds.id);
ACT.newsView = ds => { UI.tab.nv = ds.v; render(); };

function pressCard() {
  const reqs = (G.media.req || []).filter(r => !r.done && G.players[r.pid]), po = staffOf('Press')[0];
  return `<div class="card"><h3>Press Officer <small>${po ? esc(po.name) + ' · rating ' + po.rating : 'Vacant'}</small></h3>
    ${reqs.length ? reqs.map(r => { const p = G.players[r.pid]; return `<div class="preq"><p><b>${esc(fullName(p))}</b>${r.acc ? ` · ${esc(mediaAcc(r.acc).name)}` : ''}</p>${r.txt ? `<p class="muted">"${esc(r.txt)}"</p>` : ''}
      <div class="btns col">${STATEMENTS[r.kind].map(([k, t, d]) => `<button class="btn wide ${k === r.advice ? 'pri' : ''}" data-a="press" data-id="${r.id}" data-k="${k}"><span>${esc(t)}${k === r.advice ? ' · advised' : ''}</span><small>${esc(d)}</small></button>`).join('')}</div></div>`; }).join('') : '<p class="muted">No statements needed. He answers the press when your players or targets are in the rumours, and keeps quiet talks quiet.</p>'}</div>`;
}
ACT.press = ds => { const msg = pressAnswer(+ds.id, ds.k); saveGame(); toast(msg); if (UI.popup) closeSheet(true); render(); };

function transferCentre() {
  const recent = t => today().getTime() - t < 864e5 * 21;
  const here = G.social.filter(p => (p.kind === 'here' || p.kind === 'agreed') && recent(p.date)).slice(0, 8);
  const talks = G.deals.filter(d => dealOpen(d) && d.dir === 'ai' && G.players[d.pid]).slice(0, 8);
  const rum = G.social.filter(p => p.kind === 'rumour').slice(0, 8);
  const done = G.tHist.slice(0, 12), off = G.deals.filter(d => d.closed && !d.closed.ok && d.dir !== 'in' && recent(d.closed.date) && G.players[d.pid] && d.stage !== 'talks').slice(0, 6);
  const win = windowState();
  return `<div class="banner ${win.open ? 'open' : ''} ${win.open && win.left <= 3 ? 'dl' : ''}"><b>${win.label}${win.open ? (win.left === 0 ? ` · DEADLINE DAY${G.dd && G.dd.h > 8 ? ' · ' + String(Math.min(23, G.dd.h)).padStart(2, '0') + ':00' : ''}` : ' · closes ' + win.closes + ' · ' + win.left + ' days left') : ' · opens ' + win.opens}</b><span>${G.deals.filter(dealOpen).length} deals in progress</span></div>
    ${pressCard()}
    <div class="sec-h"><h2>Here we go</h2></div><div class="feed-s">${here.map(p => postHtml(p)).join('') || empty('Nothing agreed lately', 'Fee agreements and done deals appear here.')}</div>
    <div class="sec-h"><h2>Talks in progress</h2><span class="muted">${talks.length}</span></div><div class="list">${talks.map(dealRow).join('') || empty('Quiet', 'Clubs talk mostly while a window is open.')}</div>
    <div class="sec-h"><h2>Rumour mill</h2></div><div class="feed-s">${rum.map(p => postHtml(p)).join('') || empty('No rumours', 'They will come.')}</div>
    <div class="sec-h"><h2>Done deals</h2></div><div class="list">${done.map(t => `<div class="row tx ${t.to === G.club || t.from === G.club ? 'me' : ''}"><span class="grow"><b>${playerLink(t.pid, t.name)}</b><small>${fmtDate(t.date, false)} · ${clubLink(t.from)} → ${clubLink(t.to)}</small></span><span class="stat"><b>${t.fee ? money(t.fee) : 'Free'}</b></span></div>`).join('') || empty('No transfers yet', '')}</div>
    ${off.length ? `<div class="sec-h"><h2>Collapsed</h2></div><div class="list">${off.map(dealRow).join('')}</div>` : ''}`;
}
const SOCIAL_F = [['all', 'For you'], ['journalist', 'Journalists'], ['rumour', 'Rumours'], ['fan', 'Fans'], ['mine', 'Your club']];
function socialFeed() {
  const f = UI.tab.sf2 || 'all';
  const list = G.social.filter(p => { const a = mediaAcc(p.acc); return f === 'all' || (f === 'mine' ? p.clubs.includes(G.club) : f === 'rumour' ? ['rumour', 'influencer', 'tabloid'].includes(a.kind) : f === 'fan' ? ['fan', 'club'].includes(a.kind) : a.kind === f); });
  return `<div class="chips">${SOCIAL_F.map(([k, n]) => `<button class="chip ${f === k ? 'on' : ''}" data-a="tab" data-key="sf2" data-v="${k}">${n}</button>`).join('')}</div>
    <div class="feed-s">${list.slice(0, 60).map(p => postHtml(p)).join('') || empty('Nothing yet', 'Posts appear as the transfer market moves.')}</div>`;
}
