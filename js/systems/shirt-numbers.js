'use strict';
// Club shirt numbers follow the game rule: one unique squad number from 1–99.
// Manual changes are only available while a domestic transfer window is open.
function changeClubKitNumber(cid, pid, number) {
  const c = G.clubs[cid], p = G.players[pid], n = Number(number);
  if (!c || !p || p.club !== cid) return { ok: false, reason: 'That player is not at this club.' };
  if (!inWindow()) return { ok: false, reason: 'Kit numbers can only be changed during a transfer window.' };
  if (!Number.isInteger(n) || n < 1 || n > 99) return { ok: false, reason: 'Choose a whole number from 1 to 99.' };
  if (squadOf(cid).some(other => other.id !== p.id && other.no === n)) return { ok: false, reason: `Number ${n} is already assigned at ${c.name}.` };
  p.no = n;
  return { ok: true };
}
