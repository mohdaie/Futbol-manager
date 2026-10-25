'use strict';
// Identity facts and game ability are separate. Reuse an original authored
// profile where available; otherwise build a stable, original football type.
const englandIdentityKey = s => String(s || '').normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]/g, '');
function playerFromEnglandIdentity(row, cid, { level = 'A', academy = 0 } = {}) {
  const [sourceName, sourcePos, sourceAge, nat, foot, inspiration, dob, key, source, sourceId] = row;
  const calibrated = typeof ENGLAND_CALIBRATED_PROFILES_BY_ID !== 'undefined' && ENGLAND_CALIBRATED_PROFILES_BY_ID[sourceId];
  const candidate = key && (ROSTER_PROFILES[key] || (typeof ENGLAND_EXPANSION_PROFILES !== 'undefined' && ENGLAND_EXPANSION_PROFILES[key]));
  const legacy = candidate && candidate.insp === inspiration ? candidate : null;
  const pos = calibrated?.pos || sourcePos, age = calibrated?.age || sourceAge;
  const authored = calibrated && englandIdentityKey(calibrated.insp) === englandIdentityKey(inspiration)
    ? { ...calibrated, ht: legacy?.ht ?? null, wt: legacy?.wt ?? null,
      alt: [...new Set([...(legacy?.alt || []).filter(p => p !== pos), ...(sourcePos !== pos ? [sourcePos] : [])])] }
    : legacy && legacy.pos === sourcePos ? legacy : null;
  let seed = 2166136261;
  for (const c of sourceId) seed = Math.imul(seed ^ c.charCodeAt(0), 16777619) >>> 0;
  // The local seed leaves match/world randomness untouched and prevents a new
  // career rerolling a sourced player's starting skills.
  const p = matchRandom({ rng: seed }, () => {
    const top = 60 + (G.clubs[cid].rep - 50) * 0.6;
    const ca = level === 'R' ? clamp(top - 18 + (age - 18) * 1.2 + gauss() * 3, 40, 70) : clamp(top + gauss() * 3 - (age < 21 ? (21 - age) * 1.4 : 0), 43, 87);
    const pa = level === 'R' ? clamp(ca + rf(7, 14) + academy * 0.45, ca, 94) : ca + (age <= 21 ? rf(6, 16) : age <= 24 ? rf(2, 8) : 0);
    return genPlayer({ pos, age, nat, club: cid, lvl: level, ca: authored?.ca ?? ca,
      pa: authored ? authored.pa : pa, profile: authored, profileKey: calibrated ? sourceId : key });
  });
  const displayName = calibrated?.name || ENGLAND_PLAYER_NAMES_BY_ID[sourceId] || sourceName;
  const parts = displayName.split(' ');
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

function applyEnglandPlayerNameOverrides() {
  if (!G?.players || typeof ENGLAND_PLAYER_NAMES_BY_INSPIRATION === 'undefined') return;
  Object.values(G.players).forEach(p => {
    const calibrated = p.identity?.id && typeof ENGLAND_CALIBRATED_PROFILES_BY_ID !== 'undefined' && ENGLAND_CALIBRATED_PROFILES_BY_ID[p.identity.id];
    const byId = calibrated?.name || (p.identity?.id && ENGLAND_PLAYER_NAMES_BY_ID[p.identity.id]);
    const byInspiration = G.clubs[p.club]?.pl && p.insp ? ENGLAND_PLAYER_NAMES_BY_INSPIRATION[englandIdentityKey(p.insp)] : null;
    const name = byId || byInspiration;
    if (!name) return;
    const parts = name.split(' ');
    p.fn = parts.length > 1 ? parts.shift() : '';
    p.ln = parts.join(' ');
  });
}

function migrateEnglandCalibratedProfiles() {
  if (typeof ENGLAND_CALIBRATED_PROFILES_BY_ID === 'undefined' || !G?.players) return;
  G.flags ||= {};
  if (G.flags.eplCalibratedProfileVersion === 1) return;
  const untouched = G.season === START_SEASON && G.week === 0 && (G.day || 0) === 0 &&
    !Object.values(G.players).some(p => p.st?.a > 0) && !(G.tHist || []).length;
  if (untouched) Object.values(G.players).forEach(p => {
    const profile = ENGLAND_CALIBRATED_PROFILES_BY_ID[p.identity?.id];
    if (!profile || englandIdentityKey(p.insp) !== englandIdentityKey(profile.insp)) return;
    const oldPos = p.pos;
    p.at = profile.at.slice(); p.pos = profile.pos; p.age = profile.age;
    p.ca = profile.ca; p.pa = profile.pa;
    p.alt = [...new Set([...(p.alt || []).filter(pos => pos !== profile.pos), ...(oldPos !== profile.pos ? [oldPos] : [])])];
    p.originProfile = { ...(p.originProfile || {}), version: ROSTER_PROFILE_VERSION,
      calibrationVersion: 1, key: p.identity.id, at:p.at.slice(), ca:p.ca, pa:p.pa,
      ht:p.ht, wt:p.wt, alt:p.alt.slice() };
  });
  G.flags.eplCalibratedProfileVersion = 1;
}

function fillEnglandFirstTeam(c, target) {
  const rows = ENGLAND_ROSTERS_2026[c.id] || [];
  rows.slice(0, target).forEach(row => addToClub(playerFromEnglandIdentity(row, c.id), c));
  if (c.league === 'EPL') (ENGLAND_EXPANSION_ROSTERS[c.id] || []).forEach(row => addToClub(playerFromEnglandIdentity(row, c.id), c));
  const missing = SQUAD_TEMPLATE.slice(0, target);
  seniorSquad(c.id).forEach(p => { const i = missing.indexOf(p.pos); if (i >= 0) missing.splice(i, 1); });
  while (seniorSquad(c.id).length < target && squadSpace(c)) {
    const pos = missing.shift() || 'MC', ca = 60 + (c.rep - 50) * 0.6 + gauss() * 3;
    addToClub(genPlayer({ pos, ca, pa: ca + 4, age: ri(20, 29), nat: 'ENG', club: c.id, lvl: 'A' }), c);
  }
}

// Add the supplemental 2026/27 identities to careers created before the data shipped.
// The stable source ID prevents duplicates and avoids resurrecting a player who has moved.
function addEnglandExpansionPlayers() {
  if (typeof ENGLAND_EXPANSION_ROSTERS === 'undefined') return;
  const owned = new Set(Object.values(G.players).map(p => p.identity?.id).filter(Boolean));
  const people = new Set(Object.values(G.players).filter(p => p.insp).map(p => englandIdentityKey(p.insp)));
  for (const [cid, rows] of Object.entries(ENGLAND_EXPANSION_ROSTERS)) {
    const c = G.clubs[cid];
    if (!c?.pl || c.league !== 'EPL') continue;
    for (const row of rows) {
      if (owned.has(row[9]) || people.has(englandIdentityKey(row[5]))) continue;
      const p = playerFromEnglandIdentity(row, cid);
      p.age += Math.max(0, G.season - START_SEASON);
      p.con = G.season + 2;
      addToClub(p, c);
      G.know[p.id] = cid === G.club ? 100 : 45;
      owned.add(row[9]);
      people.add(englandIdentityKey(row[5]));
    }
  }
}
