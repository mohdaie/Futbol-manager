'use strict';
/* Shared entity links. Only rendered text is enhanced; save data, form values,
   existing controls and HTML attributes are never rewritten. */
let ENTITY_INDEX = null;
function entityIndex() {
  if (ENTITY_INDEX?.world === G) return ENTITY_INDEX;
  const names = new Map();
  const add = (name, kind, id) => {
    if (!name || name.length < 3) return;
    const refs = names.get(name) || [];
    if (!refs.some(r => r.kind === kind && r.id === id)) refs.push({ kind, id });
    names.set(name, refs);
  };
  Object.values(G.clubs).forEach(c => { add(c.name, 'club', c.id); if (!c.fa) add(c.mgr, 'club', c.id); });
  Object.values(G.players).forEach(p => { add(fullName(p), 'player', p.id); add(pname(p), 'player', p.id); });
  const escaped = [...names.keys()].sort((a, b) => b.length - a.length).map(n => n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  return ENTITY_INDEX = { world: G, names, re: new RegExp('(?<![\\p{L}\\p{N}_])(?:' + escaped.join('|') + ')(?![\\p{L}\\p{N}_])', 'gu') };
}
function entityMentions(text) {
  const idx = entityIndex();
  return [...String(text).matchAll(idx.re)].map(m => ({ name: m[0], at: m.index, refs: idx.names.get(m[0]) }));
}
function clubLink(cid, label, cls = '') {
  const c = G.clubs[cid];
  return c ? `<button class="entity-link ${cls}" data-a="clubPage" data-id="${esc(cid)}" aria-label="View ${esc(c.name)} club">${label ?? esc(c.name)}</button>` : esc(label || 'Former club');
}
function playerLink(pid, label) {
  const p = G.players[pid];
  return p ? `<button class="entity-link" data-a="player" data-id="${p.id}" aria-label="View ${esc(fullName(p))}">${esc(label || pname(p))}</button>` : esc(label || 'Retired player');
}
function playerMentionsHtml(text, ids) {
  const aliases = new Map();
  [...new Set(ids || [])].forEach(id => {
    const p = G.players[id]; if (!p) return;
    [pname(p), fullName(p)].forEach(name => { const set = aliases.get(name) || new Set(); set.add(p.id); aliases.set(name, set); });
  });
  const names = [...aliases.keys()].sort((a, b) => b.length - a.length);
  if (!names.length) return esc(text);
  const re = new RegExp('(?<![\\p{L}\\p{N}_])(?:' + names.map(n => n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|') + ')(?![\\p{L}\\p{N}_])', 'gu');
  let html = '', at = 0;
  for (const m of String(text).matchAll(re)) {
    html += esc(String(text).slice(at, m.index));
    const matches = aliases.get(m[0]);
    html += matches.size === 1 ? playerLink([...matches][0], m[0]) : `<span data-no-links>${esc(m[0])}</span>`;
    at = m.index + m[0].length;
  }
  return html + esc(String(text).slice(at));
}
function linkEntities(root) {
  if (!G || !root) return;
  const skip = 'button,a,input,textarea,select,option,svg,canvas,script,style,code,pre,[data-a],[data-no-links]';
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT), nodes = [];
  while (walker.nextNode()) {
    const n = walker.currentNode;
    if (n.textContent.trim().length >= 3 && !n.parentElement.closest(skip)) nodes.push(n);
  }
  nodes.forEach(n => {
    const found = entityMentions(n.textContent);
    if (!found.length) return;
    const frag = document.createDocumentFragment(); let at = 0;
    found.forEach(m => {
      frag.append(document.createTextNode(n.textContent.slice(at, m.at)));
      if (m.refs.length > 1 && m.refs.some(r => r.kind === 'player')) { frag.append(document.createTextNode(m.name)); at = m.at + m.name.length; return; }
      const b = document.createElement('button'), ref = m.refs[0];
      b.className = 'entity-link'; b.textContent = m.name;
      if (m.refs.length === 1) { b.dataset.a = ref.kind === 'player' ? 'player' : 'clubPage'; b.dataset.id = ref.id; }
      else { b.dataset.a = 'entityChoose'; b.dataset.name = m.name; }
      b.setAttribute('aria-label', `View ${m.name}${m.refs.length > 1 ? ' options' : ref.kind === 'club' ? ' club' : ' player'}`);
      frag.append(b); at = m.at + m.name.length;
    });
    frag.append(document.createTextNode(n.textContent.slice(at))); n.replaceWith(frag);
  });
  // A decorative crest beside a name also opens its club, unless already in a control.
  root.querySelectorAll('img[data-crest-club]').forEach(img => {
    if (img.closest(skip)) return;
    const c = G.clubs[img.dataset.crestClub]; if (!c) return;
    const b = document.createElement('button'); b.className = 'crest-link'; b.dataset.a = 'clubPage'; b.dataset.id = c.id;
    b.setAttribute('aria-label', 'View ' + c.name + ' club'); img.replaceWith(b); b.append(img);
  });
  // Selection controls retain their job, with a separate, safe profile option.
  root.querySelectorAll('button.row[data-id]').forEach(button => {
    if (!['pickSlot', 'benchPick', 'subOut', 'subIn'].includes(button.dataset.a) || button.parentElement.classList.contains('choice-row')) return;
    const p = G.players[+button.dataset.id]; if (!p) return;
    const wrap = document.createElement('div'), profile = document.createElement('button');
    wrap.className = 'choice-row'; button.replaceWith(wrap); wrap.append(button);
    profile.className = 'btn sm'; profile.dataset.a = 'player'; profile.dataset.id = p.id; profile.textContent = 'Profile';
    profile.setAttribute('aria-label', 'View ' + fullName(p)); wrap.append(profile);
  });
}
ACT.entityChoose = ds => {
  const refs = entityIndex().names.get(ds.name) || [];
  sheet(`<h3 class="sh-t">${esc(ds.name)}</h3><p class="muted">Choose who you mean.</p><div class="list">${refs.map(r => r.kind === 'player' ? playerRow(G.players[r.id]) : `<div class="row">${clubLink(r.id, badge(r.id, 24) + esc(clubName(r.id)))}</div>`).join('')}</div>`, { key: 'entity:' + ds.name, restore: () => ACT.entityChoose(ds) });
};
ACT.clubPage = ds => {
  if (!G.clubs[ds.id]) return toast('That club is no longer available.');
  go('clubview', { cid: ds.id, section: ds.section || 'overview' });
};
ACT.relatedPage = ds => { if (ds.tab) UI.tab[ds.key] = ds.tab; go(ds.s); };
ACT.trackPlayer = ds => {
  const p = G.players[+ds.id]; if (!p || p.club === G.club) return;
  if (!G.shortlist.includes(p.id)) G.shortlist.push(p.id);
  saveGame(); UI.tab.tr = 'short'; go('transfers'); toast(pname(p) + ' is on your shortlist.');
};

function newsLinks(n) {
  const text = n.title + '\n' + n.body, refs = new Map();
  const a = n.action;
  const target = a?.pid && G.players[a.pid];
  entityMentions(text).forEach(m => {
    const exactTargetMention = target && [pname(target), fullName(target)].includes(m.name);
    // A short name such as "R. Ward" can belong to several players. Keep it
    // out of Related unless this news carries the exact player id; a unique
    // full name elsewhere in the story will still resolve normally.
    const resolved = exactTargetMention ? [{ kind: 'player', id: target.id }] :
      m.refs.length > 1 && m.refs.some(r => r.kind === 'player') ? m.refs.filter(r => r.kind !== 'player') : m.refs;
    resolved.forEach(r => refs.set(r.kind + ':' + r.id, r));
  });
  if (a?.pid && G.players[a.pid]) refs.set('player:' + a.pid, { kind: 'player', id: a.pid });
  if (a?.from && G.clubs[a.from]) refs.set('club:' + a.from, { kind: 'club', id: a.from });
  const transfer = n.cat === 'transfer' || a?.t === 'bid';
  let out = [...refs.values()].map(r => {
    if (r.kind === 'club') return clubLink(r.id, 'View ' + esc(clubName(r.id)), 'btn sm');
    const p = G.players[r.id];
    return `<button class="btn sm" data-a="player" data-id="${p.id}">View ${esc(pname(p))}</button>${transfer && p.club !== G.club ? `<button class="btn sm" data-a="trackPlayer" data-id="${p.id}">${G.shortlist.includes(p.id) ? 'Open shortlist' : 'Shortlist ' + esc(pname(p))}</button>` : ''}`;
  }).join('');
  const dest = (s, label, key = '', tab = '') => `<button class="btn sm" data-a="relatedPage" data-s="${s}" data-key="${key}" data-tab="${tab}">${label}</button>`;
  if (transfer) out += dest('transfers', 'Transfers', 'tr', 'search') + dest('transfers', 'Shortlist', 'tr', 'short');
  if (/injur|recover|suspend|fitness/i.test(text)) out += dest('medical', 'Medical center');
  if (/scout/i.test(text)) out += dest('transfers', 'Scouting', 'tr', 'scout');
  if (/train|develop/i.test(text)) out += dest('training', 'Training');
  if (/tactic|line-up|formation/i.test(text)) out += dest('tactics', 'Tactics');
  if (/squad/i.test(text)) out += dest('squad', 'Squad');
  if (/youth|academy|intake/i.test(text)) out += dest('youth', 'Youth academy');
  if (/board|confidence|objective/i.test(text)) out += dest('board', 'Board & fans');
  if (/budget|financ|profit|loss|prize money/i.test(text)) out += dest('finance', 'Finances');
  if (n.cat === 'match') {
    const clubs = [...refs.values()].filter(r => r.kind === 'club').map(r => r.id);
    const f = G.fixtures.find(f => played(f) && clubs.includes(f.h) && clubs.includes(f.a) && new Date(n.date).toDateString() === fxDate(f).toDateString());
    if (f) out += `<button class="btn sm" data-a="go" data-s="post" data-fid="${f.id}">Match report</button>`;
    out += dest('fixtures', 'Fixtures');
  }
  if (n.cat === 'league') out += dest('table', 'League table') + dest('stats', 'Player stats');
  return out ? `<h4 class="lbl">Related</h4><div class="btns related-actions">${out}</div>` : '';
}

function clubFixtures(cid) {
  const list = G.fixtures.filter(f => f.h === cid || f.a === cid).sort(fxSort);
  return list.length ? `<div class="list">${list.map(f => fixtureLinks(f, cid)).join('')}</div>` : empty('No scheduled fixtures', 'Overseas leagues are not simulated in this career.');
}
function fixtureLinks(f, cid) {
  const home = f.h === cid, opp = home ? f.a : f.h;
  const us = home ? f.hg : f.ag, them = home ? f.ag : f.hg, result = played(f) ? 'r' + (f.winner ? f.winner === cid ? 'W' : 'L' : us > them ? 'W' : us < them ? 'L' : 'D') : '';
  return `<div class="row"><span class="rd">${f.playoff ? 'PO' : f.fr ? 'FR' : f.r + 1}</span><span class="grow"><b>${clubLink(opp, badge(opp, 20) + ' ' + esc(clubName(opp)))}</b><small>${f.neutral ? 'Neutral' : home ? 'Home' : 'Away'} · ${fxWhen(f)}${f.tv ? ' · TV' : ''}${f.penalties ? ' · Pens ' + f.penalties.join('–') : ''}</small></span><button class="res ${result}" data-a="fixturePage" data-id="${f.id}" aria-label="${played(f) ? 'Match report' : 'Match preview'}">${played(f) ? f.hg + '–' + f.ag : 'Preview'}</button></div>`;
}
ACT.fixturePage = ds => {
  const f = G.fixtures.find(f => f.id === +ds.id); if (!f) return toast('Fixture unavailable.');
  if (played(f)) return go('post', { fid: f.id });
  sheet(`<h3 class="sh-t">Match preview</h3><div class="vs-names">${clubLink(f.h)}<span>v</span>${clubLink(f.a)}</div><p class="muted">${fxWhen(f)}${G.clubs[f.h].ground ? ' · ' + esc(G.clubs[f.h].ground) : ''}</p><div class="btns">${clubLink(f.h, 'View ' + esc(clubName(f.h)), 'btn')}${clubLink(f.a, 'View ' + esc(clubName(f.a)), 'btn')}${f.w === G.week && (f.h === G.club || f.a === G.club) ? '<button class="btn" data-a="go" data-s="prematch">Match preparation</button>' : ''}</div>`, { key: 'fixture:' + f.id, restore: () => ACT.fixturePage(ds), valid: () => !!G?.fixtures.find(x => x.id === f.id) });
};

// Standings of a simulation-only league (world-sim.js), and its past champions.
function worldTableCard(id) {
  const lg = G.worldLeagues?.[id], rows = lg?.table ? worldTable(id) : [];
  if (!rows.length || !rows[0].p) return lg?.history?.length ? `<p class="muted">Last champions: ${lg.history.slice(0, 3).map(h => esc(clubName(h.champion)) + ' (' + esc(h.season) + ')').join(', ')}</p>` : '';
  return `<div class="card"><h3>${esc(WORLD_LEAGUES[id].name)} table</h3><div class="list">${rows.map((r, i) => `<button class="row act" data-a="clubPage" data-id="${r.id}"><span class="rd">${i + 1}</span><span class="grow"><b>${esc(clubName(r.id))}</b><small>${r.p} played · ${r.w}-${r.d}-${r.l} · GD ${r.gf - r.ga >= 0 ? '+' : ''}${r.gf - r.ga}</small></span><b>${r.pts}</b></button>`).join('')}</div>${lg.history?.length ? `<p class="muted">Last champions: ${lg.history.slice(0, 3).map(h => esc(clubName(h.champion)) + ' (' + esc(h.season) + ')').join(', ')}</p>` : ''}</div>`;
}
SCREENS.clubs = {
  render() {
    const selected = UI.tab.clubLeague || 'all';
    const groups = [['all', 'All clubs'], ...G.leagues.map(id => [id, leagueName(id)]), ...Object.values(WORLD_LEAGUES).map(l => [l.id, `${l.country} · ${l.name}`])];
    const clubs = Object.values(G.clubs).filter(c => selected === 'all' || c.worldLeague === selected || !c.worldLeague && c.league === selected);
    const definition = WORLD_LEAGUES[selected];
    return `<h1 class="h1">Club directory</h1><div class="chips wrap">${groups.map(([id, label]) => `<button class="chip ${selected === id ? 'on' : ''}" data-a="clubLeague" data-id="${id}">${esc(label)}</button>`).join('')}</div>
      <p class="muted">${definition ? `${definition.country} · ${definition.name} · ${clubs.length} clubs · ${clubs.filter(c => c.foreignSquad).length} open to friendlies and transfers. ${G.worldLeagues[selected]?.active === false ? 'Results are simulated in the background.' : ''}` : 'Browse league clubs, overseas teams and free agents.'}</p>
      ${worldTableCard(selected)}
      <div class="list">${clubs.map(c => `<button class="row act" data-a="clubPage" data-id="${c.id}">${badge(c.id, 28)}<span class="grow"><b>${esc(c.name)}</b><small>${c.fa ? 'Unattached players' : esc(clubCompetitionLabel(c))} · ${(c.backgroundOnly ? dummySquadSlots(c).length : c.squad.length) + ' players'}</small></span><span class="chev">›</span></button>`).join('')}</div>`;
  },
};
ACT.worldLeaguePage = ds => { UI.tab.clubLeague = WORLD_LEAGUES[ds.id] ? ds.id : 'all'; go('clubs'); };
ACT.clubLeague = ds => { UI.tab.clubLeague = ds.id === 'all' || LEAGUES[ds.id] || WORLD_LEAGUES[ds.id] ? ds.id : 'all'; render(); };
SCREENS.clubview = {
  render(p) {
    const c = G.clubs[p.cid];
    if (!c) return empty('Club unavailable', 'Browse clubs from the directory.');
    const section = p.section || 'overview', level = p.level || 'A';
    const tab = (s, label) => `<button class="chip ${section === s ? 'on' : ''}" data-a="clubPage" data-id="${c.id}" data-section="${s}">${label}</button>`;
    const heading = `<section class="clubhead" style="--k1:${c.c1}">${badge(c.id, 50)}<div><h1 class="h1" data-no-links>${esc(c.name)}</h1><p class="muted">${c.fa ? 'Unattached players' : esc(c.city || natName(c.nat)) + (c.worldLeague ? ' · ' + esc(clubCompetitionLabel(c)) : '') + (!c.backgroundOnly && c.mgr ? ' · Manager ' + esc(c.mgr) : '')}</p></div></section><div class="chips">${tab('overview', 'Dashboard')}${tab('squad', 'Squad')}${tab('fixtures', 'Fixtures')}${!c.backgroundOnly ? tab('transfers', 'Transfers') : ''}</div>`;
    if (c.backgroundOnly) {
      const slots = dummySquadSlots(c);
      if (section === 'squad') return heading + `<h2 class="h2">First team · ${slots.length} players</h2><div class="list">${slots.map(p => `<div class="row"><span class="pos">${p.pos}</span><span class="grow" data-no-links><b>${esc(p.name)}</b><small>${esc(p.nationality)}</small></span></div>`).join('')}</div>`;
      if (section === 'fixtures') return heading + empty('No fixtures', 'This league is not simulated.');
      if (section === 'transfers') return heading + empty('No transfers', 'This club is not in the transfer market.');
      return heading + `<div class="card"><h3>Club details</h3><div class="kv"><div><small>Country</small><b>${esc(WORLD_LEAGUES[c.worldLeague].country)}</b></div><div><small>League</small><b>${esc(clubCompetitionLabel(c))}</b></div><div><small>City</small><b>${esc(c.city)}</b></div><div><small>First team</small><b>${slots.length} players</b></div></div></div><button class="btn wide" data-a="clubPage" data-id="${c.id}" data-section="squad">View squad</button>`;
    }
    if (section === 'squad') {
      const levels = c.fa || c.foreign && !c.foreignSquad ? '' : `<div class="seg">${Object.entries(clubLevels(c)).filter(([l]) => l === 'A' || levelSquad(c.id, l).length).map(([l, n]) => `<button class="${level === l ? 'on' : ''}" data-a="clubLevel" data-id="${c.id}" data-level="${l}">${n}</button>`).join('')}</div>`;
      const players = squadOf(c.id).filter(x => c.fa || c.foreign && !c.foreignSquad || lvlOf(x) === level).sort(SORTS.pos);
      return heading + levels + `<p class="muted">${players.length} players · tap a player to view his profile</p><div class="list">${players.map(x => playerRow(x)).join('') || empty('No players', 'There are no players in this squad.')}</div>`;
    }
    if (section === 'fixtures') return heading + clubFixtures(c.id);
    if (section === 'transfers') {
      const deals = G.tHist.filter(t => t.to === c.id || t.from === c.id);
      return heading + `<h2 class="h2">Transfer activity</h2><div class="list">${deals.map(t => `<div class="row"><span class="grow"><b>${playerLink(t.pid, t.name)}</b><small>${fmtDate(t.date, false)} · ${clubLink(t.from)} → ${clubLink(t.to)}</small></span><b>${t.fee ? money(t.fee) : 'Free'}</b></div>`).join('') || empty('No transfers yet', 'Completed deals involving this club appear here.')}</div>`;
    }
    const tbl = leagueTable(leagueOf(c.id)), row = tbl.find(r => r.id === c.id), T = c.id === G.club ? G.tactics : c.tac;
    const recent = G.fixtures.filter(f => (f.h === c.id || f.a === c.id) && played(f)).sort(fxSort).slice(-5).reverse();
    const upcoming = G.fixtures.filter(f => (f.h === c.id || f.a === c.id) && !played(f)).sort(fxSort).slice(0, 3);
    const leaders = seniorSquad(c.id).filter(x => x.st.a).sort((a, b) => b.st.g - a.st.g || avgRating(b) - avgRating(a)).slice(0, 3);
    const simRows = isSimClub(c) ? worldTable(c.worldLeague) : [], simRow = simRows.find(r => r.id === c.id);
    const simTiles = simRow && !row ? `<div class="tiles"><button class="tile" data-a="worldLeaguePage" data-id="${c.worldLeague}"><small>League position</small><b>${simRow.p ? ordinal(simRows.indexOf(simRow) + 1) : 'Pre-season'}</b><span>${simRow.pts} points · ${simRow.p} played</span></button><div class="tile"><small>W / D / L</small><b>${simRow.w} / ${simRow.d} / ${simRow.l}</b><span>${simRow.gf} scored · ${simRow.ga} conceded</span></div></div>` : '';
    return heading + `${simTiles}${row ? `<div class="tiles"><button class="tile" data-a="go" data-s="table"><small>League position</small><b>${row.p ? ordinal(tbl.indexOf(row) + 1) : 'Pre-season'}</b><span>${row.pts} points · ${row.p} played</span></button><div class="tile"><small>W / D / L</small><b>${row.w} / ${row.d} / ${row.l}</b><span>${row.gf} scored · ${row.ga} conceded</span></div></div><div class="card"><h3>Recent form</h3>${row.form.length ? formChips(row.form) : '<p class="muted">No matches yet.</p>'}</div>` : `<p class="note">${c.fa ? 'Free agents have no club or league fixtures.' : simTiles ? 'Results are simulated in the background. Available for friendlies and transfers.' : c.foreignSquad ? 'League not simulated. Available for friendlies and transfers.' : 'League not simulated. Browse the squad and transfer activity.'}</p>`}
      ${!c.fa ? `<div class="card"><h3>Club details</h3><div class="kv">${c.ground ? `<div><small>Stadium</small><b>${esc(c.ground)}</b></div>` : ''}${c.cap ? `<div><small>Capacity</small><b>${c.cap.toLocaleString('en-GB')}</b></div>` : ''}<div><small>Reputation</small><b>${Math.round(c.rep)} / 100</b></div><div><small>Squad size</small><b>${c.squad.length}</b></div></div></div>${T ? `<div class="card"><h3>Current approach</h3><div class="kv"><div><small>With / without the ball</small><b>${esc(T.ip)} / ${esc(T.oop)}</b></div><div><small>Style</small><b>${styleOf(T) ? esc(styleName(styleOf(T))) : 'Custom'}</b></div></div></div>` : ''}` : ''}
      ${c.academy ? `<div class="card"><h3>Academy development</h3><p><b>${c.academy.strength} / 20</b></p><p class="muted">${esc(WORLD_SQUAD_DATA[c.foreignSquad?.catalogId]?.basis || c.academy.basis)} Reserves and U18s develop through training, and new academy players arrive every summer.</p></div>` : ''}
      ${leaders.length ? `<h2 class="h2">Season performers</h2><div class="list">${leaders.map(x => playerRow(x, `<span class="stat"><b>${x.st.g}</b><small>goals · ${x.st.a} apps</small></span>`)).join('')}</div>` : ''}
      ${c.pl || c.foreignSquad && (recent.length || upcoming.length) ? `<h2 class="h2">Recent results</h2>${recent.length ? `<div class="list">${recent.map(f => fixtureLinks(f, c.id)).join('')}</div>` : '<p class="muted">No matches played yet.</p>'}<h2 class="h2">Upcoming fixtures</h2>${upcoming.length ? `<div class="list">${upcoming.map(f => fixtureLinks(f, c.id)).join('')}</div>` : '<p class="muted">No fixtures remaining.</p>'}` : ''}
      <div class="btns">${c.managerId ? `<button class="btn" data-a="managerProfile" data-id="${c.managerId}">View manager profile</button>` : ''}${c.foreignSquad && inPreseason() && !G.fixtures.some(f => f.fr && (f.h === c.id || f.a === c.id)) ? `<button class="btn" data-a="friendlyArrange" data-id="${c.id}">Arrange friendly</button>` : ''}<button class="btn" data-a="clubPage" data-id="${c.id}" data-section="squad">View squad</button><button class="btn" data-a="go" data-s="clubs">All clubs</button>${c.id === G.club ? '<button class="btn" data-a="go" data-s="club">Your club facilities & history</button>' : ''}</div>`;
  },
};
ACT.clubLevel = ds => go('clubview', { cid: ds.id, section: 'squad', level: ds.level });
