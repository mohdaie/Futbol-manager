'use strict';
/* Premier League season-list selection. */
SCREENS.registration = {
  render() {
    const c = userClub();
    if (c.league !== 'EPL') return `<h1 class="h1">Premier League registration</h1><div class="card">Registration lists are only used while your club is in the Premier League.</div><button class="btn" data-a="go" data-s="squad">Back to Squad</button>`;
    ensurePLRegistration(c.id);
    const ids = registeredPLIds(c), limit = premierLeagueRegistrationLimit(), waiting = plRegistrationPending(c.id);
    const roster = squadOf(c.id).filter(p => lvlOf(p) !== 'Y').sort((a, b) => (lvlOf(a) === 'A' ? 0 : 1) - (lvlOf(b) === 'A' ? 0 : 1) || POSITIONS.indexOf(a.pos) - POSITIONS.indexOf(b.pos) || b.ca - a.ca);
    const exempt = p => under21Exempt(p);
    return `<div class="sec-h"><div><h1 class="h1">Premier League registration</h1><p class="muted">${seasonLabel()} · up to ${limit} senior players</p></div><button class="btn sm" data-a="go" data-s="squad">Back</button></div>
      ${waiting.length ? `<div class="card"><h3>Decision needed</h3><p class="muted">${waiting.map(p => esc(pname(p))).join(', ')} arrived while your list was full. Unregister someone to make room, or confirm to leave them out. You must answer before the window closes (${windowState().closes || 'now'}).</p><button class="btn" data-a="plRegConfirm">Confirm list</button></div>` : ''}
      <div class="card"><h3>${ids.size} / ${limit} registered</h3><p class="muted">Register up to ${limit} players aged 21 or older for Premier League matches. Under-21 players are eligible without registration and do not use a place. Your list renews each season.</p></div>
      <div class="list">${roster.map(p => {
        const u21 = exempt(p), selected = ids.has(p.id), blocked = u21 || (!selected && ids.size >= limit);
        const status = u21 ? 'Under-21 exemption · no place used' : selected ? 'Registered for league matches' : waiting.includes(p) ? 'Awaiting your decision · unavailable in league matches' : 'Not registered · unavailable in league matches';
        return `<button class="row act" data-a="plRegToggle" data-id="${p.id}" ${blocked ? 'disabled' : ''}>
          <span class="pos">${selected ? '✓' : u21 ? 'U21' : '—'}</span><span class="grow"><b>${esc(pname(p))}</b><small>${p.pos} · ${p.age} yrs · ${LEVELS[lvlOf(p)]} · ${status}</small></span><span class="stat"><b>${p.ca}</b><small>ability</small></span>
        </button>`;
      }).join('') || empty('No eligible squad players', 'Your first-team and reserve players will appear here.')}</div>`;
  },
};

ACT.plRegToggle = ds => {
  const c = userClub(), id = +ds.id, p = G.players[id];
  if (!p || p.club !== c.id || lvlOf(p) === 'Y' || under21Exempt(p)) return;
  const ids = registeredPLIds(c);
  if (ids.has(id)) ids.delete(id); else ids.add(id);
  const result = setPremierLeagueRegistration(c.id, [...ids]);
  if (!result.ok) { toast(result.reason); return; }
  ensureUserLineup();
  saveGame();
  render();
};

ACT.plRegConfirm = () => {
  confirmPLRegistration();
  ensureUserLineup();
  saveGame();
  toast('Premier League list confirmed.');
  render();
};
