'use strict';
// Landing-page trends resolve IDs from bounded news feeds. They never enumerate
// the full player database or use player ratings as a popularity signal.
const TRANSFER_SEARCH_PAGE = 20;
const TRANSFER_SEARCH_DEFAULTS = { pos: 'Any', region: 'Everywhere', maxAge: 40, maxFee: 0, minOvr: 0, maxOvr: 100, name: '' };
const transferSearchText = s => String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase().trim();
function hasTransferSearch(criteria) {
  const s = { ...TRANSFER_SEARCH_DEFAULTS, ...criteria };
  return !!transferSearchText(s.name) || s.pos !== 'Any' || s.region !== 'Everywhere' || +s.maxAge < 40 || +s.maxFee > 0 || +s.minOvr > 0 || +s.maxOvr < 100;
}
function trendingTransferPlayers() {
  const end = today().getTime() + 864e5, start = end - 14 * 864e5;
  const candidates = new Map(), seen = new Set();
  const add = (pid, date, label, text, weight = 1) => {
    const p = G.players[pid], timestamp = +new Date(date);
    if (!p || G.clubs[p.club]?.backgroundOnly || !Number.isFinite(timestamp) || timestamp < start || timestamp >= end) return;
    const key = [p.id, Math.floor(timestamp / 864e5), transferSearchText(text)].join(':');
    if (seen.has(key)) return;
    seen.add(key);
    let entry = candidates.get(p.id);
    if (!entry) { entry = { p, score: 0, latest: timestamp, label }; candidates.set(p.id, entry); }
    entry.score += weight * (1 - (end - timestamp) / (15 * 864e5));
    if (timestamp >= entry.latest) { entry.latest = timestamp; entry.label = label; }
  };
  const kinds = { rumour: 'Transfer rumour', talks: 'Transfer talks', agreed: 'Fee agreed', here: 'Move agreed', done: 'Transfer completed', off: 'Talks ended' };
  for (const story of G.social || []) if (kinds[story.kind]) add(story.pid, story.date, story.real === false ? 'Transfer rumour' : kinds[story.kind], story.txt, story.kind === 'done' ? 2 : 1);
  for (const story of G.rumours || []) add(story.pid, story.date, 'Transfer rumour', story.txt);
  for (const story of G.news || []) {
    if (story.cat !== 'transfer' && story.action?.t !== 'press') continue;
    const pid = story.action?.pid || (story.action?.t === 'deal' ? G.deals?.find(d => d.id === story.action.id)?.pid : null);
    add(pid, story.date, story.action?.t === 'press' ? 'Transfer rumour' : 'Transfer news', story.title, 1.5);
  }
  for (const move of G.tHist || []) add(move.pid, move.date, 'Transfer completed', 'Completed:' + move.from + ':' + move.to, 2);
  return [...candidates.values()].sort((a, b) => b.score - a.score || b.latest - a.latest || a.p.id - b.p.id).slice(0, TRANSFER_SEARCH_PAGE);
}

// Called only for submitted criteria. Names are ordered alphabetically, without
// repeatedly calculating scouting ratings inside a comparison function.
function searchTransferPlayers(criteria, order = {}) {
  if (!hasTransferSearch(criteria)) return [];
  const s = { ...TRANSFER_SEARCH_DEFAULTS, ...criteria }, name = transferSearchText(s.name), matches = [];
  for (const p of Object.values(G.players)) {
    if (p.club === G.club || !G.clubs[p.club] || G.clubs[p.club].backgroundOnly) continue;
    if (s.pos !== 'Any' && p.pos !== s.pos && !(p.alt || []).includes(s.pos)) continue;
    if (s.region !== 'Everywhere' && regionOf(p) !== s.region) continue;
    const ca = seenOvr(p).v;
    if (p.age > +s.maxAge || +s.maxFee && pValue(p) > +s.maxFee || ca < +s.minOvr || ca > +s.maxOvr) continue;
    if (name && !transferSearchText(fullName(p)).includes(name) && !transferSearchText(p.insp).includes(name)) continue;
    matches.push({ p, key: transferSearchText(p.ln) + ' ' + transferSearchText(p.fn) });
  }
  const dir = order.direction === 'asc' ? 1 : -1;
  const value = p => order.by === 'age' ? p.age : order.by === 'ca' ? seenOvr(p).v : order.by === 'pa' ? seenPot(p) : pValue(p);
  return matches.sort((a, b) => dir * (value(a.p) - value(b.p)) || a.key.localeCompare(b.key) || a.p.id - b.p.id).map(row => row.p);
}
