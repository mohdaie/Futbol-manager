'use strict';
/* ===== scouting.js =====
   Knowledge (0-100) is how much of a player's file your scouts have confirmed.
   - Stages: Heard of (0), Watched (25: physical), Scouted (50: technical, contract, asking price),
     Detailed (75: mental, personality, potential), Full file (90: everything exact).
     Within a stage each attribute is confirmed in turn, so at 90% about 90% of the file is exact.
     An attribute not confirmed yet is a range that always contains the true value; one not reached is "?".
   - Scouting takes time. A scout follows a player for up to three weeks and every match he watches adds
     knowledge (his rating, his home region, whether the player played). Video analysis is quick and cheap
     but stops at the Scouted stage. Assignments search a region and file first reports.
   - Every player watched has a file (G.scout.reports) with a grade, a recommendation, the matches watched,
     notes and a history, kept in folders. */

const knowOf = p => (p.club === G.club ? 100 : G.know[p.id] ?? 10);
const regionOf = p => { const c = G.clubs[p.club]; if (!c) return 'Free agents'; if (c.pl) return 'Premier Division'; if (c.fa) return 'Free agents'; return NATIONS[c.nat].r; };
const KNOW_STAGES = [[0, 'Heard of'], [25, 'Watched'], [50, 'Scouted'], [75, 'Detailed'], [90, 'Full file']];
const knowStage = k => KNOW_STAGES.filter(s => k >= s[0]).pop();
const nextStage = k => KNOW_STAGES.find(s => s[0] > k);
const STAGE_UNLOCK = { 25: 'physical attributes', 50: 'technical attributes, contract and asking price', 75: 'mental attributes, personality, potential and agent', 90: 'the full file: every value exact' };
const SCOUT_DAYS = 21, VIDEO_DAYS = 2, VIDEO_CAP = 74, SCOUT_LOAD = 3;
const dayAbs = () => G.season * 400 + todayNo();

// The stage at which an attribute is confirmed: physical first, then technical (and goalkeeping), then mental.
const ATTR_STAGE = { P: 25, T: 50, G: 50, M: 75 };
const STAGE_END = { 25: 50, 50: 75, 75: 90 };
// Knowledge at which attribute i is confirmed for this player (a fixed order per player).
function attrConfirmAt(p, i) {
  const g = ATTRS[i][2], start = ATTR_STAGE[g], end = STAGE_END[start];
  const grp = ATTRS.map((a, j) => j).filter(j => ATTR_STAGE[ATTRS[j][2]] === start).sort((a, b) => hash01(p.id + ':o' + a) - hash01(p.id + ':o' + b));
  return start + (grp.indexOf(i) + 1) / grp.length * (end - start);
}

// Attribute as the user sees it: exact once confirmed, a range while his stage is being scouted, "?" before.
function seenAttr(p, i) {
  const k = knowOf(p), v = p.at[i];
  if (k >= 90 || k >= attrConfirmAt(p, i)) return { lo: v, hi: v, txt: String(v), ok: true };
  if (k < ATTR_STAGE[ATTRS[i][2]]) return { lo: 1, hi: 20, txt: '?', unk: true };
  const w = 2;
  const lo = clamp(v - Math.floor(hash01(p.id + ':' + i) * (w + 1)), 1, 20), hi = clamp(lo + w, 1, 20);
  return { lo: Math.min(lo, v), hi: Math.max(hi, v), txt: Math.min(lo, v) + '-' + Math.max(hi, v) };
}
// One attribute value for display: confirmed, estimate (range) or not scouted.
function attrCell(p, i) {
  const s = seenAttr(p, i);
  return s.unk ? '<b class="unk" title="Not scouted yet">?</b>' : `<b class="${attrClass(s.hi)}${s.ok ? '' : ' est'}"${s.ok ? '' : ' title="Estimate"'}>${s.txt}</b>`;
}
function seenOvr(p) {
  const k = knowOf(p);
  if (k >= 90) return { v: p.ca, txt: String(p.ca) };
  if (k < 25) return { v: p.ca + Math.round((hash01(p.id + 'o') - 0.5) * 20), txt: '??' };
  const w = k < 50 ? 12 : k < 75 ? 6 : 2;
  const lo = p.ca - Math.floor(hash01(p.id + 'r') * (w + 1));
  return { v: lo + w / 2, txt: lo + '-' + (lo + w) };
}
const potKnown = p => p.club === G.club || knowOf(p) >= 75;
function seenPot(p) {
  const k = knowOf(p);
  const err = (hash01(p.id + 'p') - 0.5) * (100 - k) * 0.35;
  return stars(p.pa + err);
}

function userBestAt(pos) {
  return Math.max(0, ...seniorSquad(G.club).map(p => ovrAt(p, pos)));
}
// Graded from what the scouts have seen, not from hidden numbers.
function scoutGrade(p) {
  if (knowOf(p) < 25) return '?';
  const so = seenOvr(p).v, pot = potKnown(p) ? p.pa + (hash01(p.id + 'p') - 0.5) * (100 - knowOf(p)) * 0.35 : so + (p.age <= 22 ? 4 : 0);
  const score = so * 0.6 + pot * 0.4 - userBestAt(p.pos);
  return score > 5 ? 'A' : score > 0 ? 'B' : score > -6 ? 'C' : 'D';
}
const GRADE_NOTE = { A: 'Would walk into your first team.', B: 'Would compete for a starting place.', C: 'Squad depth or one for the future.', D: 'Not good enough for your squad.', '?': 'Not watched yet.' };
function scoutRec(p, grade) {
  const k = knowOf(p);
  if (grade === 'A' || grade === 'B') return k >= 50 ? 'Sign' : 'Watch more';
  return grade === 'C' ? 'Monitor' : grade === 'D' ? 'Avoid' : 'Watch more';
}
const FOLDERS = [['new', 'New'], ['dof', 'With the Director'], ['rec', 'Recommended'], ['mon', 'Monitor'], ['rej', 'Rejected']];

/* ---------- scouts ---------- */
const SCOUT_REGIONS = REGIONS.filter(r => r !== 'Everywhere' && r !== 'Free agents');
const scoutRegion = s => s.reg || (s.reg = SCOUT_REGIONS[Math.floor(hash01('reg' + s.id) * SCOUT_REGIONS.length)]);
const scoutLoad = s => (G.scout.assign.some(a => a.sid === s.id) ? SCOUT_LOAD : 0) + G.scout.jobs.filter(j => j.sid === s.id).length;
// The best free scout for a player: rating, plus a bonus for knowing the region.
function pickScout(p) {
  const free = staffOf('Scout').filter(s => scoutLoad(s) < SCOUT_LOAD);
  return free.sort((a, b) => (b.rating + (scoutRegion(b) === regionOf(p) ? 4 : 0)) - (a.rating + (scoutRegion(a) === regionOf(p) ? 4 : 0)))[0] || null;
}
const scoutById = id => G.staff.find(s => s.id === id) || null;
const jobWeekly = j => (j.mode === 'video' ? 0 : regionOf(G.players[j.pid] || {}) === 'Premier Division' ? 6000 : 12000);
const scoutCost = () => G.scout.assign.length * 15000 + G.scout.jobs.reduce((t, j) => t + jobWeekly(j), 0);

/* ---------- files ---------- */
function scoutFile(p) {
  let r = G.scout.reports.find(x => x.pid === p.id);
  if (!r) { r = { pid: p.id, grade: '?', date: today().getTime(), folder: 'new', k: knowOf(p), hist: [], seen: [] }; G.scout.reports.unshift(r); }
  r.hist = r.hist || []; r.seen = r.seen || []; r.folder = r.folder || 'new';
  return r;
}
// Raise knowledge and refresh the file: grade, recommendation and a history entry when the stage changes.
function addKnowledge(p, gain, by, cap = 100) {
  const before = knowOf(p), k = Math.min(cap, 100, Math.round(before + gain));
  if (k > before) G.know[p.id] = k;
  if (before < 90 && k >= 90 && typeof dofQueue === 'function') dofQueue(p);
  const r = scoutFile(p), grade = scoutGrade(p);
  if (knowStage(k)[0] !== knowStage(before)[0] || !r.hist.length || grade !== r.grade) r.hist.unshift({ date: today().getTime(), k, grade });
  r.hist = r.hist.slice(0, 10);
  Object.assign(r, { k, grade, rec: scoutRec(p, grade), date: today().getTime(), by: by || r.by });
  G.scout.reports = [r, ...G.scout.reports.filter(x => x !== r)];
  trimReports();
  return k - before;
}
function trimReports() {
  if (G.scout.reports.length <= 120) return;
  const drop = G.scout.reports.filter(r => r.folder === 'new' || r.folder === 'rej').slice(-(G.scout.reports.length - 120));
  G.scout.reports = G.scout.reports.filter(r => !drop.includes(r));
}
// Knowledge from one match watched: the scout's rating, his region, and whether the player played.
function watchGain(s, p, played) {
  const reg = scoutRegion(s) === regionOf(p) ? 1.25 : regionOf(p) === 'Premier Division' || regionOf(p) === 'Free agents' ? 1 : 0.85;
  return (12 + (s ? s.rating : 8) * 0.9) * reg * (played ? 1 : 0.35);
}
function logWatch(j, p, entry) {
  const s = scoutById(j.sid), r = scoutFile(p);
  const got = addKnowledge(p, watchGain(s, p, entry.rt != null), s ? s.name : '');
  r.seen.unshift({ ...entry, date: today().getTime(), by: s ? s.name : '', gain: got });
  r.seen = r.seen.slice(0, 12);
  j.n = (j.n || 0) + 1;
}

/* ---------- following a player ---------- */
// mode 'watch': a scout follows him for three weeks; 'video': a quick look at match footage.
function scoutPlayer(p, mode = 'watch') {
  if (!p || p.club === G.club) return { ok: false, msg: 'He is already your player.' };
  if (G.scout.jobs.some(j => j.pid === p.id)) return { ok: false, msg: 'A scout is already on him.' };
  if (knowOf(p) >= 100) return { ok: false, msg: 'His file is complete.' };
  if (mode === 'video') {
    if (knowOf(p) >= VIDEO_CAP) return { ok: false, msg: 'Video has told you all it can. Send a scout to watch him.' };
    if (userClub().bal < 3000) return { ok: false, msg: 'Not enough money for video analysis.' };
    userClub().bal -= 3000; G.ledger.scout += 3000;
    G.scout.jobs.push({ id: G.nextId++, pid: p.id, sid: 0, mode, start: dayAbs(), end: dayAbs() + VIDEO_DAYS, n: 0 });
    scoutFile(p);
    return { ok: true, msg: `The analysts will study ${pname(p)}'s footage. File in ${VIDEO_DAYS} days.` };
  }
  const s = pickScout(p);
  if (!s) return { ok: false, msg: 'Every scout is busy. Each follows up to three players, or runs one assignment.' };
  G.scout.jobs.push({ id: G.nextId++, pid: p.id, sid: s.id, mode, start: dayAbs(), end: dayAbs() + SCOUT_DAYS, n: 0 });
  scoutFile(p);
  return { ok: true, msg: `${s.name} will watch ${pname(p)} for the next three weeks. The file updates after every match.` };
}
function stopScouting(id) { G.scout.jobs = G.scout.jobs.filter(j => j.id !== id); }

// After every simulated match: scouts at the game watch the players they follow.
function scoutWatchMatch(M) {
  if (!G.scout || !G.scout.jobs.length || !(M.fid > 0)) return;
  const fx = G.fixtures.find(f => f.id === M.fid);
  G.scout.jobs.filter(j => j.mode === 'watch').forEach(j => {
    const p = G.players[j.pid];
    M.sides.forEach((S, si) => {
      if (!p || p.club !== S.cid) return;
      const opp = M.sides[1 - si].cid, played = S.played.includes(p.id);
      logWatch(j, p, { opp: clubName(opp), score: fx ? `${M.sides[si].st.g}-${M.sides[1 - si].st.g}` : '', rt: played ? S.rat[p.id] : null, note: played ? '' : 'Did not play' });
    });
  });
}
// Each day: scouts abroad watch on Saturdays (those leagues are not simulated), free agents train midweek,
// video analysis is filed, and finished jobs report.
function scoutDay() {
  if (!G.scout) return;
  G.scout.jobs.forEach(j => {
    const p = G.players[j.pid];
    if (!p || p.club === G.club) { j.end = -1; return; }
    const c = G.clubs[p.club];
    // League clubs in a week without a league match play a friendly.
    const noLeague = c && c.pl && !G.fixtures.some(f => f.w === G.week && (f.h === c.id || f.a === c.id));
    if (j.mode === 'watch' && (!c || !c.pl || noLeague)) {
      if (c && c.fa ? G.day === 2 : G.day === 5) {
        const rt = clamp(Math.round((6.5 + (p.ca - 70) / 14 + gauss() * 0.5) * 10) / 10, 5, 9.6);
        logWatch(j, p, c && c.fa ? { opp: 'Training with other free agents', rt, note: '' } : noLeague ? { opp: 'Friendly', rt, note: '' } : { opp: c ? natName(c.nat) + ' league match' : 'Match', rt, note: '' });
      }
    }
    if (j.mode === 'video' && dayAbs() >= j.end) {
      const r = scoutFile(p), got = addKnowledge(p, 18 + staffAvg('Scout', 6) * 0.5, 'Video analysis', VIDEO_CAP);
      r.seen.unshift({ date: today().getTime(), by: 'Video analysis', opp: 'Recent match footage', rt: null, note: 'Video', gain: got });
      r.seen = r.seen.slice(0, 12);
    }
  });
  const done = G.scout.jobs.filter(j => j.end >= 0 && (dayAbs() >= j.end || knowOf(G.players[j.pid]) >= 100));
  done.forEach(j => {
    const p = G.players[j.pid], s = scoutById(j.sid);
    addNews('club', `Scouting file: ${pname(p)}`, `${j.mode === 'video' ? 'Video analysis' : (s ? s.name : 'Your scout')} has finished on ${fullName(p)} (${clubName(p.club)}). The file is now ${knowOf(p)}% complete: ${knowStage(knowOf(p))[1]}. Grade ${scoutFile(p).grade}, recommendation: ${scoutFile(p).rec || 'Watch more'}.`, { t: 'scoutfile', pid: p.id });
  });
  G.scout.jobs = G.scout.jobs.filter(j => j.end >= 0 && !done.includes(j));
}

/* ---------- assignments ---------- */
function matchesAssignment(p, a) {
  if (p.club === G.club) return false;
  if (a.region !== 'Everywhere' && regionOf(p) !== a.region) return false;
  if (a.pos !== 'Any' && p.pos !== a.pos) return false;
  if (p.age > a.maxAge) return false;
  return true;
}
// An assignment finds two players a week and files first reports (the Watched stage).
function weeklyScouting() {
  G.scout.assign.forEach(a => {
    const s = scoutById(a.sid), judge = s ? s.rating : staffAvg('Scout', 6);
    const pool = Object.values(G.players).filter(p => matchesAssignment(p, a) && knowOf(p) < 60);
    for (let k = 0; k < 2 && pool.length; k++) {
      const p = wpick(pool, x => Math.pow(1.08, x.ca - 50) * (1 + (x.pa - x.ca) / 20));
      pool.splice(pool.indexOf(p), 1);
      const target = 26 + judge * 1.1 + rf(0, 6);
      addKnowledge(p, Math.max(0, target - knowOf(p)), s ? s.name : 'Assignment');
      scoutFile(p).seen.unshift({ date: today().getTime(), by: s ? s.name : '', opp: 'Assignment: ' + a.region, rt: null, note: 'First look', gain: 0 });
    }
    a.left--;
  });
  const done = G.scout.assign.filter(a => a.left <= 0);
  if (done.length) addNews('club', 'Scouting assignment complete', done.map(a => `${a.region} · ${a.pos === 'Any' ? 'any position' : POS_NAME[a.pos]}`).join('; ') + '. Check the files in Transfers > Scouting.');
  G.scout.assign = G.scout.assign.filter(a => a.left > 0);
}

function addAssignment(region, pos, maxAge, weeks) {
  const s = staffOf('Scout').filter(x => scoutLoad(x) === 0).sort((a, b) => (b.rating + (scoutRegion(b) === region ? 4 : 0)) - (a.rating + (scoutRegion(a) === region ? 4 : 0)))[0];
  if (!s) return false;
  G.scout.assign.push({ id: G.nextId++, sid: s.id, region, pos, maxAge, left: weeks });
  return true;
}

// Older saves: jobs list, folders and history on old reports, scouts on old assignments.
function ensureScouting() {
  G.scout.jobs = G.scout.jobs || [];
  G.scout.reports.forEach(r => { r.folder = r.folder || 'new'; r.hist = r.hist || []; r.seen = r.seen || []; if (r.k == null && G.players[r.pid]) r.k = knowOf(G.players[r.pid]); });
  G.scout.assign.forEach(a => { if (!a.sid) { const s = staffOf('Scout').find(x => !G.scout.assign.some(b => b.sid === x.id)); if (s) a.sid = s.id; } });
}

/* ---------- what the file says ---------- */
// Strengths and weaknesses from the attributes his position needs, as the scouts see them.
function scoutNotes(p) {
  const keys = Object.keys(WEIGHTS[p.pos]).filter(k => !seenAttr(p, A[k]).unk);
  if (!keys.length) return ['Too early to say. Send a scout to watch him.'];
  const val = k => { const s = seenAttr(p, A[k]); return (s.lo + s.hi) / 2; };
  const lbl = k => ATTRS[A[k]][1] + ' ' + seenAttr(p, A[k]).txt;
  const top = keys.slice().sort((a, b) => val(b) - val(a)), notes = [];
  const good = top.filter(k => val(k) >= 13).slice(0, 3), poor = top.filter(k => val(k) <= 10).slice(-2);
  notes.push(good.length ? 'Strengths: ' + good.map(lbl).join(', ') + '.' : 'No standout strengths for his position yet.');
  if (poor.length) notes.push('Weaknesses: ' + poor.map(lbl).join(', ') + '.');
  const r = scoutFile(p), played = r.seen.filter(x => x.rt != null);
  if (played.length >= 2) { const avgRt = played.reduce((t, x) => t + x.rt, 0) / played.length; notes.push(`Averaged ${avgRt.toFixed(1)} in ${played.length} matches watched${avgRt >= 7.2 ? ': in good form' : avgRt < 6.4 ? ': struggling for form' : ''}.`); }
  return notes;
}
// Best slot for him in your formation, with your current player there.
function fileFit(p) {
  const T = G.tactics, slots = FORMATIONS[T.ip], so = seenOvr(p);
  const opts = slots.map(([pos], i) => ({ pos, i, est: Math.round(so.v + (ovrAt(p, pos) - p.ca)) })).filter(o => o.pos !== 'GK' || p.pos === 'GK');
  const best = opts.sort((a, b) => b.est - a.est)[0];
  if (!best) return null;
  const cur = G.players[T.slots[best.i]];
  return { pos: best.pos, est: best.est, cur, curV: cur ? ovrAt(cur, best.pos) : 0 };
}
