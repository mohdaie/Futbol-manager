'use strict';
// Identity facts and game ability are separate. Reuse an original authored
// profile where available; otherwise build a stable, original football type.
function playerFromEnglandIdentity(row, cid) {
  const [name, pos, age, nat, foot, inspiration, dob, key, source, sourceId] = row;
  const candidate = key && ROSTER_PROFILES[key];
  const authored = candidate && candidate.insp === inspiration && candidate.pos === pos ? candidate : null;
  let seed = 2166136261;
  for (const c of sourceId) seed = Math.imul(seed ^ c.charCodeAt(0), 16777619) >>> 0;
  // The local seed leaves match/world randomness untouched and prevents a new
  // career rerolling a sourced player's starting skills.
  const p = matchRandom({ rng: seed }, () => {
    const top = 60 + (G.clubs[cid].rep - 50) * 0.6;
    const ca = clamp(top + gauss() * 3 - (age < 21 ? (21 - age) * 1.4 : 0), 43, 87);
    const pa = ca + (age <= 21 ? rf(6, 16) : age <= 24 ? rf(2, 8) : 0);
    return genPlayer({ pos, age, nat, club: cid, lvl: 'A', ca,
      pa: authored ? authored.pa : pa, profile: authored, profileKey: key });
  });
  const parts = name.split(' ');
  p.fn = parts.length > 1 ? parts.shift() : '';
  p.ln = parts.join(' ');
  p.foot = foot === 'L' ? 'Left' : foot === 'B' ? 'Either' : 'Right';
  p.insp = inspiration;
  p.identity = { source, id: sourceId, dob: dob || null,
    rosterDate: source === 'FPL2026' ? '2026-10-22' : source === 'TM2025' ? '2025-09-13' : null };
  p.con = START_SEASON + 2; // Game contract, not a claim about a real contract.
  if (!authored) p.originProfile = { kind: 'generated-identity', key: sourceId,
    at: p.at.slice(), ca: p.ca, pa: p.pa, ht: p.ht, wt: p.wt, alt: p.alt.slice() };
  return p;
}

function fillEnglandFirstTeam(c, target) {
  const rows = ENGLAND_ROSTERS_2026[c.id] || [];
  rows.slice(0, target).forEach(row => addToClub(playerFromEnglandIdentity(row, c.id), c));
  const missing = SQUAD_TEMPLATE.slice(0, target);
  seniorSquad(c.id).forEach(p => { const i = missing.indexOf(p.pos); if (i >= 0) missing.splice(i, 1); });
  while (seniorSquad(c.id).length < target && squadSpace(c)) {
    const pos = missing.shift() || 'MC', ca = 60 + (c.rep - 50) * 0.6 + gauss() * 3;
    addToClub(genPlayer({ pos, ca, pa: ca + 4, age: ri(20, 29), nat: 'ENG', club: c.id, lvl: 'A' }), c);
  }
}
